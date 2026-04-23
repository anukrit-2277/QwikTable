import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(request, { params }) {
  const { id } = await params;
  const db = getDb();

  const entry = db.prepare(
    `SELECT qe.*, r.name as restaurant_name, r.slug as restaurant_slug, r.cuisine, r.address
     FROM queue_entries qe 
     JOIN restaurants r ON qe.restaurant_id = r.id 
     WHERE qe.id = ?`
  ).get(id);

  if (!entry) {
    return NextResponse.json({ error: 'Queue entry not found' }, { status: 404 });
  }

  // Get current position (count of waiting entries before this one)
  const ahead = db.prepare(
    `SELECT COUNT(*) as c FROM queue_entries 
     WHERE restaurant_id = ? AND status = 'waiting' AND position < ?`
  ).get(entry.restaurant_id, entry.position).c;

  // Recalculate wait
  const restaurant = db.prepare('SELECT * FROM restaurants WHERE id = ?').get(entry.restaurant_id);
  const turnsPerHour = 60 / restaurant.avg_serve_time;
  const tablesFreedPerMin = (restaurant.total_tables * turnsPerHour) / 60;
  const currentWait = ahead > 0
    ? Math.max(5, Math.ceil(ahead / Math.max(tablesFreedPerMin, 0.1)))
    : 0;

  // Get pre-order if exists
  const preOrder = db.prepare('SELECT * FROM pre_orders WHERE queue_entry_id = ?').get(id);

  return NextResponse.json({
    ...entry,
    groups_ahead: ahead,
    current_wait: entry.status === 'waiting' ? currentWait : 0,
    pre_order: preOrder ? { ...preOrder, items: JSON.parse(preOrder.items) } : null,
  });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const db = getDb();

  const entry = db.prepare('SELECT * FROM queue_entries WHERE id = ?').get(id);
  if (!entry) {
    return NextResponse.json({ error: 'Queue entry not found' }, { status: 404 });
  }

  db.prepare("UPDATE queue_entries SET status = 'cancelled' WHERE id = ?").run(id);
  return NextResponse.json({ success: true });
}
