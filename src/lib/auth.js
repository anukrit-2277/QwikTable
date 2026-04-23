import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'qwiktable-secret-key-2024';

export function createToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request) {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/qwiktable_token=([^;]+)/);
  return match ? match[1] : null;
}
