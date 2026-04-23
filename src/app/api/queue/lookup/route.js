import { NextResponse } from 'next/server';
import getDb, { ensureDb } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone');

  if (!phone) {
    return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
  }

  await ensureDb();
  const db = getDb();

  const entries = db.prepare(
    `SELECT qe.*, r.name as restaurant_name, r.slug as restaurant_slug, r.cuisine
     FROM queue_entries qe
     JOIN restaurants r ON qe.restaurant_id = r.id
     WHERE qe.customer_phone = ? AND qe.status IN ('waiting', 'notified')
     ORDER BY qe.joined_at DESC`
  ).all(phone);

  // Calculate current wait and groups ahead for each entry
  const result = entries.map(entry => {
    const ahead = db.prepare(
      `SELECT COUNT(*) as c FROM queue_entries 
       WHERE restaurant_id = ? AND status = 'waiting' AND position < ?`
    ).get(entry.restaurant_id, entry.position).c;

    const restaurant = db.prepare('SELECT * FROM restaurants WHERE id = ?').get(entry.restaurant_id);
    const turnsPerHour = 60 / restaurant.avg_serve_time;
    const tablesFreedPerMin = (restaurant.total_tables * turnsPerHour) / 60;
    const currentWait = ahead > 0
      ? Math.max(5, Math.ceil(ahead / Math.max(tablesFreedPerMin, 0.1)))
      : 0;

    return {
      ...entry,
      groups_ahead: ahead,
      current_wait: entry.status === 'waiting' ? currentWait : 0,
    };
  });

  return NextResponse.json(result);
}
