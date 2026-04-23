import { NextResponse } from 'next/server';
import getDb, { ensureDb } from '@/lib/db';

export async function GET(request) {
  await ensureDb();
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  let restaurants;
  if (q) {
    restaurants = db.prepare(
      `SELECT r.*, 
        (SELECT COUNT(*) FROM queue_entries WHERE restaurant_id = r.id AND status = 'waiting') as queue_count
       FROM restaurants r 
       WHERE r.name LIKE ? OR r.cuisine LIKE ? OR r.address LIKE ?`
    ).all(`%${q}%`, `%${q}%`, `%${q}%`);
  } else {
    restaurants = db.prepare(
      `SELECT r.*, 
        (SELECT COUNT(*) FROM queue_entries WHERE restaurant_id = r.id AND status = 'waiting') as queue_count
       FROM restaurants r`
    ).all();
  }

  // Calculate estimated wait for each
  const result = restaurants.map(r => {
    const turnsPerHour = 60 / r.avg_serve_time;
    const tablesFreedPerMin = (r.total_tables * turnsPerHour) / 60;
    const wait = r.queue_count > 0 
      ? Math.ceil(r.queue_count / Math.max(tablesFreedPerMin, 0.1)) 
      : 0;
    return {
      ...r,
      estimated_wait: Math.max(0, Math.min(wait, 120)),
    };
  });

  return NextResponse.json(result);
}
