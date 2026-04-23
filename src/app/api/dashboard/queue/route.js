import { NextResponse } from 'next/server';
import getDb, { ensureDb } from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function GET(request) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  await ensureDb();
  const db = getDb();
  const entries = db.prepare(
    `SELECT qe.*, 
      (SELECT COUNT(*) FROM pre_orders WHERE queue_entry_id = qe.id) as has_preorder
     FROM queue_entries qe 
     WHERE qe.restaurant_id = ? AND qe.status IN ('waiting', 'notified')
     ORDER BY qe.position ASC`
  ).all(payload.restaurantId);

  const restaurant = db.prepare('SELECT name, slug, total_tables, occupied_tables FROM restaurants WHERE id = ?')
    .get(payload.restaurantId);

  return NextResponse.json({ entries, restaurant });
}

export async function PATCH(request) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  await ensureDb();
  const db = getDb();
  const { entryId, action } = await request.json();

  const entry = db.prepare('SELECT * FROM queue_entries WHERE id = ? AND restaurant_id = ?')
    .get(entryId, payload.restaurantId);

  if (!entry) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
  }

  if (action === 'notify') {
    db.prepare("UPDATE queue_entries SET status = 'notified', notified_at = datetime('now') WHERE id = ?").run(entryId);
  } else if (action === 'seat') {
    db.prepare("UPDATE queue_entries SET status = 'seated', seated_at = datetime('now') WHERE id = ?").run(entryId);
  } else if (action === 'cancel') {
    db.prepare("UPDATE queue_entries SET status = 'cancelled' WHERE id = ?").run(entryId);
  }

  return NextResponse.json({ success: true });
}
