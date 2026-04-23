import initSqlJs from 'sql.js/dist/sql-asm.js';
import bcrypt from 'bcryptjs';

// Use globalThis to persist DB across hot reloads and serverless invocations
let dbReady = null;

function getDbSync() {
  if (globalThis.__qwiktableDb) {
    return globalThis.__qwiktableDb;
  }
  throw new Error('Database not initialized. Call await ensureDb() first.');
}

async function ensureDb() {
  if (globalThis.__qwiktableDb) return globalThis.__qwiktableDb;
  if (dbReady) return dbReady;

  dbReady = (async () => {
    const SQL = await initSqlJs();
    const sqlDb = new SQL.Database();

    // Create a better-sqlite3 compatible wrapper
    const db = createWrapper(sqlDb);
    globalThis.__qwiktableDb = db;
    initializeDb(db);
    return db;
  })();

  return dbReady;
}

// Wrapper to mimic better-sqlite3 API using sql.js
function createWrapper(sqlDb) {
  return {
    _sqlDb: sqlDb,

    exec(sql) {
      sqlDb.run(sql);
    },

    prepare(sql) {
      return {
        _sql: sql,
        _db: sqlDb,

        run(...params) {
          sqlDb.run(sql, params);
          return { changes: sqlDb.getRowsModified() };
        },

        get(...params) {
          const stmt = sqlDb.prepare(sql);
          stmt.bind(params);
          if (stmt.step()) {
            const cols = stmt.getColumnNames();
            const vals = stmt.get();
            const row = {};
            cols.forEach((col, i) => { row[col] = vals[i]; });
            stmt.free();
            return row;
          }
          stmt.free();
          return undefined;
        },

        all(...params) {
          const results = [];
          const stmt = sqlDb.prepare(sql);
          stmt.bind(params);
          while (stmt.step()) {
            const cols = stmt.getColumnNames();
            const vals = stmt.get();
            const row = {};
            cols.forEach((col, i) => { row[col] = vals[i]; });
            results.push(row);
          }
          stmt.free();
          return results;
        },
      };
    },

    transaction(fn) {
      return (...args) => {
        sqlDb.run('BEGIN TRANSACTION');
        try {
          fn(...args);
          sqlDb.run('COMMIT');
        } catch (e) {
          sqlDb.run('ROLLBACK');
          throw e;
        }
      };
    },

    pragma() {
      // no-op for sql.js
    },
  };
}

function initializeDb(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS restaurants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      cuisine TEXT,
      address TEXT,
      latitude REAL,
      longitude REAL,
      avg_serve_time INTEGER DEFAULT 25,
      total_tables INTEGER DEFAULT 20,
      occupied_tables INTEGER DEFAULT 0,
      image_url TEXT,
      rating REAL DEFAULT 4.5,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS queue_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      restaurant_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT,
      party_size INTEGER DEFAULT 2,
      status TEXT DEFAULT 'waiting',
      join_type TEXT DEFAULT 'remote',
      estimated_wait INTEGER,
      position INTEGER,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      notified_at DATETIME,
      seated_at DATETIME,
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
    );

    CREATE TABLE IF NOT EXISTS pre_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      queue_entry_id INTEGER NOT NULL,
      items TEXT NOT NULL,
      total_amount REAL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (queue_entry_id) REFERENCES queue_entries(id)
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      restaurant_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category TEXT,
      image_emoji TEXT,
      is_available INTEGER DEFAULT 1,
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
    );
  `);

  // Seed data if restaurants table is empty
  const count = db.prepare('SELECT COUNT(*) as c FROM restaurants').get();
  if (count.c === 0) {
    seedData(db);
  }
}

function seedData(db) {
  const hash = bcrypt.hashSync('admin123', 10);

  const insertRestaurant = db.prepare(`
    INSERT INTO restaurants (name, slug, cuisine, address, latitude, longitude, avg_serve_time, total_tables, occupied_tables, image_url, rating, password_hash)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const restaurants = [
    {
      name: 'Tapri Central',
      slug: 'tapri-central',
      cuisine: 'Cafe & Chai',
      address: 'C-11, Prithviraj Road, C Scheme, Jaipur',
      lat: 26.9110,
      lng: 75.7870,
      avgTime: 15,
      tables: 20,
      occupied: 14,
      image: '☕',
      rating: 4.5,
    },
    {
      name: 'Bar Palladio',
      slug: 'bar-palladio',
      cuisine: 'Italian & Bar',
      address: 'Narain Niwas Palace Hotel, Kanota Bagh, Jaipur',
      lat: 26.8986,
      lng: 75.8110,
      avgTime: 35,
      tables: 18,
      occupied: 17,
      image: '🍷',
      rating: 4.7,
    },
    {
      name: 'Rawat Mishthan Bhandar',
      slug: 'rawat-mishthan-bhandar',
      cuisine: 'Indian Sweets & Snacks',
      address: 'Station Road, Sindhi Camp, Jaipur',
      lat: 26.9196,
      lng: 75.7880,
      avgTime: 12,
      tables: 30,
      occupied: 10,
      image: '🍛',
      rating: 4.3,
    },
    {
      name: 'Suvarna Mahal',
      slug: 'suvarna-mahal',
      cuisine: 'Royal Indian Fine Dining',
      address: 'Rambagh Palace, Bhawani Singh Road, Jaipur',
      lat: 26.8950,
      lng: 75.8050,
      avgTime: 40,
      tables: 15,
      occupied: 14,
      image: '👑',
      rating: 4.8,
    },
    {
      name: 'Laxmi Mishthan Bhandar (LMB)',
      slug: 'lmb-jaipur',
      cuisine: 'Rajasthani & North Indian',
      address: 'Johari Bazaar, Jaipur',
      lat: 26.9214,
      lng: 75.8227,
      avgTime: 20,
      tables: 40,
      occupied: 32,
      image: '🍽️',
      rating: 4.4,
    },
    {
      name: 'Handi Restaurant',
      slug: 'handi-restaurant',
      cuisine: 'Mughlai & North Indian',
      address: 'MI Road, Jaipur',
      lat: 26.9124,
      lng: 75.7862,
      avgTime: 25,
      tables: 22,
      occupied: 18,
      image: '🥘',
      rating: 4.2,
    },
    {
      name: 'Curious Life Coffee Roasters',
      slug: 'curious-life-coffee',
      cuisine: 'Cafe & Continental',
      address: 'C-14, Ashok Marg, C Scheme, Jaipur',
      lat: 26.9062,
      lng: 75.7920,
      avgTime: 10,
      tables: 12,
      occupied: 5,
      image: '☕',
      rating: 4.6,
    },
    {
      name: 'Niros',
      slug: 'niros',
      cuisine: 'Multi-Cuisine',
      address: 'MI Road, Jaipur',
      lat: 26.9130,
      lng: 75.7900,
      avgTime: 28,
      tables: 25,
      occupied: 22,
      image: '🍝',
      rating: 4.3,
    },
  ];

  const insertTransaction = db.transaction(() => {
    for (const r of restaurants) {
      insertRestaurant.run(
        r.name, r.slug, r.cuisine, r.address,
        r.lat, r.lng, r.avgTime, r.tables, r.occupied,
        r.image, r.rating, hash
      );
    }
  });
  insertTransaction();

  // Seed menu items
  const insertMenuItem = db.prepare(`
    INSERT INTO menu_items (restaurant_id, name, description, price, category, image_emoji)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const menuData = {
    1: [ // Tapri Central
      { name: 'Masala Chai', desc: 'Signature spiced tea with aromatic spices', price: 60, cat: 'Drinks', emoji: '☕' },
      { name: 'Bun Maska', desc: 'Toasted bun with fresh butter', price: 50, cat: 'Snacks', emoji: '🍞' },
      { name: 'Maggi', desc: 'Classic 2-minute noodles with veggies', price: 80, cat: 'Snacks', emoji: '🍜' },
      { name: 'Tapri Special Sandwich', desc: 'Grilled sandwich with cheese and chutney', price: 120, cat: 'Snacks', emoji: '🥪' },
      { name: 'Cold Coffee', desc: 'Chilled blended coffee with ice cream', price: 140, cat: 'Drinks', emoji: '🧊' },
      { name: 'Samosa', desc: 'Crispy pastry filled with spiced potatoes', price: 40, cat: 'Snacks', emoji: '🥟' },
      { name: 'Poha', desc: 'Flattened rice with peanuts and lemon', price: 70, cat: 'Snacks', emoji: '🍚' },
      { name: 'Kulhad Chai', desc: 'Traditional clay-pot tea', price: 40, cat: 'Drinks', emoji: '🫖' },
      { name: 'Veg Puff', desc: 'Flaky pastry with spiced vegetable filling', price: 35, cat: 'Snacks', emoji: '🥐' },
      { name: 'Lemon Iced Tea', desc: 'Refreshing iced tea with lemon', price: 100, cat: 'Drinks', emoji: '🍋' },
    ],
    2: [ // Bar Palladio
      { name: 'Margherita Pizza', desc: 'Wood-fired with San Marzano tomatoes and mozzarella', price: 580, cat: 'Mains', emoji: '🍕' },
      { name: 'Truffle Pasta', desc: 'Fresh pasta with truffle oil and parmesan', price: 650, cat: 'Mains', emoji: '🍝' },
      { name: 'Bruschetta', desc: 'Toasted bread with tomato-basil topping', price: 420, cat: 'Starters', emoji: '🍞' },
      { name: 'Lamb Chops', desc: 'Herb-crusted lamb with rosemary jus', price: 920, cat: 'Mains', emoji: '🥩' },
      { name: 'Tiramisu', desc: 'Coffee-soaked layers with mascarpone cream', price: 450, cat: 'Desserts', emoji: '🍰' },
      { name: 'Aperol Spritz', desc: 'Classic Italian cocktail', price: 550, cat: 'Drinks', emoji: '🍹' },
      { name: 'Caesar Salad', desc: 'Romaine lettuce with parmesan and croutons', price: 380, cat: 'Starters', emoji: '🥗' },
      { name: 'Risotto', desc: 'Creamy arborio rice with wild mushrooms', price: 620, cat: 'Mains', emoji: '🍄' },
      { name: 'Red Wine', desc: 'House selection Cabernet Sauvignon', price: 750, cat: 'Drinks', emoji: '🍷' },
      { name: 'Panna Cotta', desc: 'Vanilla cream dessert with berry coulis', price: 380, cat: 'Desserts', emoji: '🍮' },
    ],
    3: [ // Rawat Mishthan Bhandar
      { name: 'Pyaaz Kachori', desc: 'Famous Jaipur onion-stuffed crispy kachori', price: 40, cat: 'Snacks', emoji: '🥟' },
      { name: 'Mirchi Vada', desc: 'Stuffed green chili fritter, Jaipur style', price: 30, cat: 'Snacks', emoji: '🌶️' },
      { name: 'Ghewar', desc: 'Traditional Rajasthani honey-soaked dessert', price: 120, cat: 'Desserts', emoji: '🍯' },
      { name: 'Rabri', desc: 'Rich condensed milk dessert with saffron', price: 80, cat: 'Desserts', emoji: '🍨' },
      { name: 'Dal Baati Churma', desc: 'Classic Rajasthani baked wheat balls', price: 180, cat: 'Mains', emoji: '🥘' },
      { name: 'Mawa Kachori', desc: 'Sweet kachori filled with khoya', price: 60, cat: 'Desserts', emoji: '🥮' },
      { name: 'Lassi', desc: 'Thick sweet yogurt drink', price: 50, cat: 'Drinks', emoji: '🥛' },
      { name: 'Samosa', desc: 'Crispy triangle with spiced potato filling', price: 25, cat: 'Snacks', emoji: '🥟' },
      { name: 'Jalebi', desc: 'Crispy saffron-soaked sweet spirals', price: 60, cat: 'Desserts', emoji: '🍩' },
      { name: 'Masala Chai', desc: 'Spiced Indian tea with milk', price: 30, cat: 'Drinks', emoji: '☕' },
    ],
    4: [ // Suvarna Mahal
      { name: 'Laal Maas', desc: 'Fiery Rajasthani red meat curry', price: 850, cat: 'Mains', emoji: '🥩' },
      { name: 'Paneer Lababdar', desc: 'Cottage cheese in rich tomato-cashew gravy', price: 650, cat: 'Mains', emoji: '🧀' },
      { name: 'Gatte ki Sabzi', desc: 'Gram flour dumplings in spiced yogurt gravy', price: 550, cat: 'Mains', emoji: '🥘' },
      { name: 'Tandoori Jhinga', desc: 'Clay-oven roasted jumbo prawns', price: 1200, cat: 'Starters', emoji: '🦐' },
      { name: 'Ker Sangri', desc: 'Rajasthani desert beans and berries', price: 480, cat: 'Mains', emoji: '🫘' },
      { name: 'Shahi Tukda', desc: 'Royal bread pudding with saffron cream', price: 450, cat: 'Desserts', emoji: '🍮' },
      { name: 'Garlic Naan', desc: 'Tandoor-baked bread with garlic butter', price: 120, cat: 'Breads', emoji: '🫓' },
      { name: 'Biryani', desc: 'Fragrant basmati rice with aromatic spices', price: 750, cat: 'Mains', emoji: '🍚' },
      { name: 'Gulab Jamun', desc: 'Soft milk dumplings in rose-scented syrup', price: 350, cat: 'Desserts', emoji: '🍯' },
      { name: 'Mango Lassi', desc: 'Creamy yogurt drink with fresh mango', price: 250, cat: 'Drinks', emoji: '🥭' },
    ],
    5: [ // LMB
      { name: 'Rajasthani Thali', desc: 'Complete platter with dal, sabzi, roti, rice', price: 450, cat: 'Mains', emoji: '🍽️' },
      { name: 'Paneer Tikka', desc: 'Smoky grilled cottage cheese with spices', price: 280, cat: 'Starters', emoji: '🧀' },
      { name: 'Dal Makhani', desc: 'Slow-cooked black lentils in butter gravy', price: 250, cat: 'Mains', emoji: '🥘' },
      { name: 'Butter Naan', desc: 'Freshly baked bread with butter', price: 60, cat: 'Breads', emoji: '🫓' },
      { name: 'Malai Kofta', desc: 'Paneer and potato balls in creamy gravy', price: 320, cat: 'Mains', emoji: '🍲' },
      { name: 'Kulfi Falooda', desc: 'Traditional ice cream with vermicelli', price: 180, cat: 'Desserts', emoji: '🍨' },
      { name: 'Pav Bhaji', desc: 'Mashed vegetables with buttered bread rolls', price: 200, cat: 'Snacks', emoji: '🍞' },
      { name: 'Lassi', desc: 'Thick sweet yogurt drink', price: 80, cat: 'Drinks', emoji: '🥛' },
      { name: 'Rasgulla', desc: 'Soft spongy cheese balls in sugar syrup', price: 120, cat: 'Desserts', emoji: '⚪' },
      { name: 'Masala Dosa', desc: 'Crispy crepe with spiced potato filling', price: 180, cat: 'Snacks', emoji: '🥞' },
    ],
    6: [ // Handi Restaurant
      { name: 'Handi Chicken', desc: 'Signature slow-cooked chicken in clay pot', price: 380, cat: 'Mains', emoji: '🍗' },
      { name: 'Mutton Rogan Josh', desc: 'Kashmiri-style lamb in aromatic gravy', price: 450, cat: 'Mains', emoji: '🥩' },
      { name: 'Butter Chicken', desc: 'Creamy tomato-based curry with tender chicken', price: 350, cat: 'Mains', emoji: '🍗' },
      { name: 'Seekh Kebab', desc: 'Minced meat kebabs from the tandoor', price: 280, cat: 'Starters', emoji: '🍖' },
      { name: 'Biryani', desc: 'Fragrant basmati rice with spiced meat', price: 320, cat: 'Mains', emoji: '🍚' },
      { name: 'Rumali Roti', desc: 'Thin handkerchief bread', price: 40, cat: 'Breads', emoji: '🫓' },
      { name: 'Raita', desc: 'Cooling yogurt with cucumber and mint', price: 70, cat: 'Sides', emoji: '🥒' },
      { name: 'Phirni', desc: 'Ground rice pudding with cardamom', price: 120, cat: 'Desserts', emoji: '🍮' },
      { name: 'Tandoori Chicken', desc: 'Clay-oven roasted whole chicken', price: 420, cat: 'Starters', emoji: '🍖' },
      { name: 'Masala Chaas', desc: 'Spiced buttermilk', price: 50, cat: 'Drinks', emoji: '🥛' },
    ],
    7: [ // Curious Life Coffee Roasters
      { name: 'Pour Over Coffee', desc: 'Single-origin hand-brewed pour over', price: 250, cat: 'Coffee', emoji: '☕' },
      { name: 'Flat White', desc: 'Velvety espresso with steamed milk', price: 220, cat: 'Coffee', emoji: '☕' },
      { name: 'Avocado Toast', desc: 'Sourdough with smashed avocado and eggs', price: 320, cat: 'Brunch', emoji: '🥑' },
      { name: 'Acai Bowl', desc: 'Blended acai with granola and fresh fruit', price: 350, cat: 'Brunch', emoji: '🫐' },
      { name: 'Banana Pancakes', desc: 'Fluffy pancakes with maple syrup', price: 280, cat: 'Brunch', emoji: '🥞' },
      { name: 'Iced Latte', desc: 'Chilled espresso with cold milk', price: 200, cat: 'Coffee', emoji: '🧊' },
      { name: 'Croissant', desc: 'Freshly baked butter croissant', price: 150, cat: 'Bakery', emoji: '🥐' },
      { name: 'Matcha Latte', desc: 'Japanese green tea with frothed milk', price: 280, cat: 'Coffee', emoji: '🍵' },
      { name: 'Cheese Sandwich', desc: 'Grilled cheese with herbs on sourdough', price: 240, cat: 'Brunch', emoji: '🧀' },
      { name: 'Fresh Juice', desc: 'Cold-pressed seasonal fruit juice', price: 180, cat: 'Drinks', emoji: '🧃' },
    ],
    8: [ // Niros
      { name: 'Chicken Stroganoff', desc: 'Creamy chicken in mushroom sauce', price: 420, cat: 'Mains', emoji: '🍗' },
      { name: 'Paneer Butter Masala', desc: 'Cottage cheese in rich butter gravy', price: 350, cat: 'Mains', emoji: '🧀' },
      { name: 'Fish & Chips', desc: 'Battered fish with crispy fries', price: 450, cat: 'Mains', emoji: '🐟' },
      { name: 'Mushroom Soup', desc: 'Creamy wild mushroom soup', price: 180, cat: 'Starters', emoji: '🍄' },
      { name: 'Chicken Tikka', desc: 'Charcoal-grilled marinated chicken', price: 320, cat: 'Starters', emoji: '🍖' },
      { name: 'Brownie with Ice Cream', desc: 'Warm chocolate brownie sundae', price: 250, cat: 'Desserts', emoji: '🍫' },
      { name: 'Masala Dosa', desc: 'South Indian crepe with potato filling', price: 200, cat: 'Snacks', emoji: '🥞' },
      { name: 'Cold Coffee', desc: 'Chilled blended coffee shake', price: 160, cat: 'Drinks', emoji: '🧊' },
      { name: 'Veg Biryani', desc: 'Fragrant rice with mixed vegetables', price: 280, cat: 'Mains', emoji: '🍚' },
      { name: 'Caramel Custard', desc: 'Classic baked custard with caramel', price: 150, cat: 'Desserts', emoji: '🍮' },
    ],
  };

  const menuTransaction = db.transaction(() => {
    for (const [restaurantId, items] of Object.entries(menuData)) {
      for (const item of items) {
        insertMenuItem.run(
          parseInt(restaurantId), item.name, item.desc,
          item.price, item.cat, item.emoji
        );
      }
    }
  });
  menuTransaction();

  // Seed some queue entries for demo
  const insertQueue = db.prepare(`
    INSERT INTO queue_entries (restaurant_id, customer_name, customer_phone, party_size, status, join_type, estimated_wait, position)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const queueTransaction = db.transaction(() => {
    // Tapri Central - moderate
    insertQueue.run(1, 'Rahul Sharma', '9876543210', 3, 'waiting', 'remote', 15, 1);
    insertQueue.run(1, 'Priya Meena', '9876543211', 2, 'waiting', 'walkin', 22, 2);
    insertQueue.run(1, 'Arjun Joshi', '9876543212', 4, 'waiting', 'remote', 30, 3);

    // Bar Palladio - very busy
    insertQueue.run(2, 'Sneha Gupta', '9876543213', 2, 'waiting', 'remote', 35, 1);
    insertQueue.run(2, 'Vikram Singh', '9876543214', 4, 'waiting', 'walkin', 50, 2);
    insertQueue.run(2, 'Neha Rathore', '9876543215', 2, 'waiting', 'remote', 60, 3);
    insertQueue.run(2, 'Aditya Verma', '9876543216', 6, 'waiting', 'remote', 70, 4);
    insertQueue.run(2, 'Kavita Shekhawat', '9876543217', 2, 'waiting', 'walkin', 80, 5);

    // Rawat - light
    insertQueue.run(3, 'Deepak Kumawat', '9876543230', 2, 'waiting', 'walkin', 8, 1);
    insertQueue.run(3, 'Sunita Yadav', '9876543231', 3, 'waiting', 'remote', 14, 2);

    // Suvarna Mahal - very busy
    insertQueue.run(4, 'Rajesh Kothari', '9876543240', 2, 'waiting', 'remote', 40, 1);
    insertQueue.run(4, 'Meera Agarwal', '9876543241', 4, 'waiting', 'walkin', 55, 2);
    insertQueue.run(4, 'Sanjay Mathur', '9876543242', 2, 'waiting', 'remote', 65, 3);

    // LMB - busy
    insertQueue.run(5, 'Pooja Sharma', '9876543250', 4, 'waiting', 'walkin', 20, 1);
    insertQueue.run(5, 'Rohit Khandelwal', '9876543251', 2, 'waiting', 'remote', 30, 2);
    insertQueue.run(5, 'Anita Jain', '9876543252', 3, 'waiting', 'remote', 38, 3);
    insertQueue.run(5, 'Manish Saini', '9876543253', 2, 'waiting', 'walkin', 45, 4);

    // Handi - moderate
    insertQueue.run(6, 'Lakshmi Devi', '9876543260', 3, 'waiting', 'remote', 25, 1);
    insertQueue.run(6, 'Hemant Pareek', '9876543261', 2, 'waiting', 'walkin', 35, 2);

    // Curious Life - light
    insertQueue.run(7, 'Tanvi Soni', '9876543270', 2, 'waiting', 'remote', 8, 1);

    // Niros - busy
    insertQueue.run(8, 'Suresh Choudhary', '9876543280', 4, 'waiting', 'walkin', 28, 1);
    insertQueue.run(8, 'Divya Bhatt', '9876543281', 2, 'waiting', 'remote', 38, 2);
    insertQueue.run(8, 'Neeraj Goyal', '9876543282', 3, 'waiting', 'remote', 46, 3);
  });
  queueTransaction();
}

export { ensureDb };
export default getDbSync;
