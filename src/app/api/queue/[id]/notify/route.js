import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function POST(request, { params }) {
  const { id } = await params;
  const db = getDb();

  const entry = db.prepare('SELECT * FROM queue_entries WHERE id = ?').get(id);
  if (!entry) {
    return NextResponse.json({ error: 'Queue entry not found' }, { status: 404 });
  }

  db.prepare("UPDATE queue_entries SET status = 'notified', notified_at = datetime('now') WHERE id = ?").run(id);

  return NextResponse.json({ success: true, message: 'Diner notified' });
}
