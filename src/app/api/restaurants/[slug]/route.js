import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(request, { params }) {
  const { slug } = await params;
  const db = getDb();

  const restaurant = db.prepare('SELECT * FROM restaurants WHERE slug = ?').get(slug);
  if (!restaurant) {
    return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
  }

  const queueCount = db.prepare(
    'SELECT COUNT(*) as c FROM queue_entries WHERE restaurant_id = ? AND status = ?'
  ).get(restaurant.id, 'waiting').c;

  const menuItems = db.prepare('SELECT * FROM menu_items WHERE restaurant_id = ?').all(restaurant.id);

  const turnsPerHour = 60 / restaurant.avg_serve_time;
  const tablesFreedPerMin = (restaurant.total_tables * turnsPerHour) / 60;
  const estimatedWait = queueCount > 0 
    ? Math.max(5, Math.ceil(queueCount / Math.max(tablesFreedPerMin, 0.1)))
    : 0;

  return NextResponse.json({
    ...restaurant,
    queue_count: queueCount,
    estimated_wait: estimatedWait,
    menu: menuItems,
  });
}
