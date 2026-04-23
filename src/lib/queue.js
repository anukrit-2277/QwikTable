import getDb from './db';

export function calculateWaitTime(restaurantId) {
  const db = getDb();
  const restaurant = db.prepare('SELECT * FROM restaurants WHERE id = ?').get(restaurantId);
  if (!restaurant) return 0;

  const waitingCount = db.prepare(
    'SELECT COUNT(*) as c FROM queue_entries WHERE restaurant_id = ? AND status = ?'
  ).get(restaurantId, 'waiting').c;

  // Estimate: each table turn takes avg_serve_time minutes
  // Available tables = total - occupied
  const availableTables = Math.max(0, restaurant.total_tables - restaurant.occupied_tables);
  
  if (availableTables > 0 && waitingCount === 0) return 0;
  
  // How many groups can be seated in parallel? Based on available turnover rate
  const turnsPerHour = 60 / restaurant.avg_serve_time;
  const tablesFreedPerMin = (restaurant.total_tables * turnsPerHour) / 60;
  
  const estimatedWait = Math.ceil((waitingCount + 1) / Math.max(tablesFreedPerMin, 0.1));
  return Math.max(5, Math.min(estimatedWait, 120)); // Clamp between 5–120 min
}

export function getNextPosition(restaurantId) {
  const db = getDb();
  const result = db.prepare(
    'SELECT MAX(position) as maxPos FROM queue_entries WHERE restaurant_id = ? AND status = ?'
  ).get(restaurantId, 'waiting');
  return (result.maxPos || 0) + 1;
}

export function getQueueStats(restaurantId) {
  const db = getDb();
  const waitingCount = db.prepare(
    'SELECT COUNT(*) as c FROM queue_entries WHERE restaurant_id = ? AND status = ?'
  ).get(restaurantId, 'waiting').c;

  const restaurant = db.prepare('SELECT * FROM restaurants WHERE id = ?').get(restaurantId);
  const estimatedWait = calculateWaitTime(restaurantId);

  return {
    waitingCount,
    estimatedWait,
    totalTables: restaurant?.total_tables || 0,
    occupiedTables: restaurant?.occupied_tables || 0,
  };
}
