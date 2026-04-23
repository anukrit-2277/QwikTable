import { NextResponse } from 'next/server';
import getDb, { ensureDb } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createToken } from '@/lib/auth';

export async function POST(request) {
  await ensureDb();
  const db = getDb();
  const { slug, password } = await request.json();

  if (!slug || !password) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
  }

  const restaurant = db.prepare('SELECT * FROM restaurants WHERE slug = ?').get(slug);
  if (!restaurant) {
    return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
  }

  const valid = bcrypt.compareSync(password, restaurant.password_hash);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const token = createToken({ restaurantId: restaurant.id, slug: restaurant.slug });

  const response = NextResponse.json({
    success: true,
    restaurant: { id: restaurant.id, name: restaurant.name, slug: restaurant.slug },
  });

  response.cookies.set('qwiktable_token', token, {
    httpOnly: true,
    maxAge: 86400,
    path: '/',
    sameSite: 'lax',
  });

  return response;
}
