import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getNextPosition, calculateWaitTime } from '@/lib/queue';

export async function POST(request) {
  const db = getDb();
  const body = await request.json();
  const { restaurantId, customerName, customerPhone, partySize } = body;

  if (!restaurantId || !customerName || !customerPhone) {
    return NextResponse.json({ error: 'Name and phone number are required' }, { status: 400 });
  }

  const restaurant = db.prepare('SELECT * FROM restaurants WHERE id = ?').get(restaurantId);
  if (!restaurant) {
    return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
  }

  const position = getNextPosition(restaurantId);
  const estimatedWait = calculateWaitTime(restaurantId);

  const result = db.prepare(
    `INSERT INTO queue_entries (restaurant_id, customer_name, customer_phone, party_size, status, join_type, estimated_wait, position)
     VALUES (?, ?, ?, ?, 'waiting', 'remote', ?, ?)`
  ).run(restaurantId, customerName, customerPhone || '', partySize || 2, estimatedWait, position);

  const entry = db.prepare('SELECT * FROM queue_entries WHERE id = ?').get(result.lastInsertRowid);

  return NextResponse.json({
    ...entry,
    restaurant_name: restaurant.name,
    restaurant_slug: restaurant.slug,
  }, { status: 201 });
}
