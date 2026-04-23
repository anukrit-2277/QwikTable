import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(request) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '28.6139');
  const lng = parseFloat(searchParams.get('lng') || '77.2090');

  const restaurants = db.prepare(
    `SELECT r.*, 
      (SELECT COUNT(*) FROM queue_entries WHERE restaurant_id = r.id AND status = 'waiting') as queue_count
     FROM restaurants r`
  ).all();

  const result = restaurants.map(r => {
    const turnsPerHour = 60 / r.avg_serve_time;
    const tablesFreedPerMin = (r.total_tables * turnsPerHour) / 60;
    const wait = r.queue_count > 0 
      ? Math.ceil(r.queue_count / Math.max(tablesFreedPerMin, 0.1)) 
      : 0;
    
    // Calculate distance (rough Haversine)
    const dLat = (r.latitude - lat) * Math.PI / 180;
    const dLng = (r.longitude - lng) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat*Math.PI/180) * Math.cos(r.latitude*Math.PI/180) * Math.sin(dLng/2)**2;
    const distance = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return {
      ...r,
      estimated_wait: Math.max(0, Math.min(wait, 120)),
      distance: Math.round(distance * 10) / 10,
    };
  }).sort((a, b) => a.distance - b.distance);

  return NextResponse.json(result);
}
