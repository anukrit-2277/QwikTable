import getDb, { ensureDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const { slug } = await params;
  await ensureDb();
  const db = getDb();
  const restaurant = db.prepare('SELECT * FROM restaurants WHERE slug = ?').get(slug);

  if (!restaurant) {
    return new Response('Restaurant not found', { status: 404 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const send = () => {
        try {
          const queueCount = db.prepare(
            'SELECT COUNT(*) as c FROM queue_entries WHERE restaurant_id = ? AND status = ?'
          ).get(restaurant.id, 'waiting').c;

          const turnsPerHour = 60 / restaurant.avg_serve_time;
          const tablesFreedPerMin = (restaurant.total_tables * turnsPerHour) / 60;
          const estimatedWait = queueCount > 0
            ? Math.max(5, Math.ceil(queueCount / Math.max(tablesFreedPerMin, 0.1)))
            : 0;

          const data = JSON.stringify({
            queue_count: queueCount,
            estimated_wait: estimatedWait,
            total_tables: restaurant.total_tables,
            occupied_tables: restaurant.occupied_tables,
          });

          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch {
          controller.close();
        }
      };

      send();
      const interval = setInterval(send, 5000);

      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
