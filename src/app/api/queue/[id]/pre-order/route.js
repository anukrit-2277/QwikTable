import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function POST(request, { params }) {
  const { id } = await params;
  const db = getDb();
  const body = await request.json();

  const entry = db.prepare('SELECT * FROM queue_entries WHERE id = ?').get(id);
  if (!entry) {
    return NextResponse.json({ error: 'Queue entry not found' }, { status: 404 });
  }

  const { items, totalAmount } = body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'No items provided' }, { status: 400 });
  }

  // Check if pre-order already exists
  const existing = db.prepare('SELECT * FROM pre_orders WHERE queue_entry_id = ?').get(id);
  if (existing) {
    db.prepare('UPDATE pre_orders SET items = ?, total_amount = ? WHERE queue_entry_id = ?')
      .run(JSON.stringify(items), totalAmount || 0, id);
  } else {
    db.prepare('INSERT INTO pre_orders (queue_entry_id, items, total_amount) VALUES (?, ?, ?)')
      .run(id, JSON.stringify(items), totalAmount || 0);
  }

  return NextResponse.json({ success: true });
}

export async function GET(request, { params }) {
  const { id } = await params;
  const db = getDb();

  const preOrder = db.prepare('SELECT * FROM pre_orders WHERE queue_entry_id = ?').get(id);
  if (!preOrder) {
    return NextResponse.json({ items: [], total_amount: 0 });
  }

  return NextResponse.json({
    ...preOrder,
    items: JSON.parse(preOrder.items),
  });
}
