import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

let db;

function getDb() {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'qwiktable.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeDb();
  }
  return db;
}

function initializeDb() {
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
    seedData();
  }
}

function seedData() {
  const hash = bcrypt.hashSync('admin123', 10);

  const insertRestaurant = db.prepare(`
    INSERT INTO restaurants (name, slug, cuisine, address, latitude, longitude, avg_serve_time, total_tables, occupied_tables, image_url, rating, password_hash)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const restaurants = [
    {
      name: 'Aromas Kitchen',
      slug: 'aromas-kitchen',
      cuisine: 'Indian',
      address: '23 Connaught Place, New Delhi',
      lat: 28.6315,
      lng: 77.2167,
      avgTime: 22,
      tables: 25,
      occupied: 20,
      image: '🍛',
      rating: 4.6,
    },
    {
      name: 'The Blue Bistro',
      slug: 'the-blue-bistro',
      cuisine: 'Continental',
      address: '45 Hauz Khas Village, New Delhi',
      lat: 28.5494,
      lng: 77.2001,
      avgTime: 30,
      tables: 15,
      occupied: 14,
      image: '🥘',
      rating: 4.3,
    },
    {
      name: 'Sakura Sushi',
      slug: 'sakura-sushi',
      cuisine: 'Japanese',
      address: '12 Khan Market, New Delhi',
      lat: 28.6005,
      lng: 77.2270,
      avgTime: 18,
      tables: 12,
      occupied: 6,
      image: '🍣',
      rating: 4.8,
    },
    {
      name: 'Trattoria Milano',
      slug: 'trattoria-milano',
      cuisine: 'Italian',
      address: '8 Janpath Road, New Delhi',
      lat: 28.6200,
      lng: 77.2195,
      avgTime: 25,
      tables: 18,
      occupied: 16,
      image: '🍝',
      rating: 4.5,
    },
    {
      name: 'Smoky Grill House',
      slug: 'smoky-grill-house',
      cuisine: 'BBQ & Grill',
      address: '67 Lodhi Colony, New Delhi',
      lat: 28.5900,
      lng: 77.2270,
      avgTime: 35,
      tables: 20,
      occupied: 19,
      image: '🥩',
      rating: 4.4,
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
    1: [ // Aromas Kitchen
      { name: 'Butter Chicken', desc: 'Creamy tomato-based curry with tender chicken', price: 380, cat: 'Mains', emoji: '🍗' },
      { name: 'Paneer Tikka', desc: 'Smoky grilled cottage cheese with spices', price: 280, cat: 'Starters', emoji: '🧀' },
      { name: 'Dal Makhani', desc: 'Slow-cooked black lentils in butter gravy', price: 250, cat: 'Mains', emoji: '🥘' },
      { name: 'Garlic Naan', desc: 'Freshly baked bread with garlic butter', price: 60, cat: 'Breads', emoji: '🫓' },
      { name: 'Biryani', desc: 'Fragrant basmati rice with aromatic spices', price: 350, cat: 'Mains', emoji: '🍚' },
      { name: 'Samosa', desc: 'Crispy pastry filled with spiced potatoes', price: 80, cat: 'Starters', emoji: '🥟' },
      { name: 'Mango Lassi', desc: 'Creamy yogurt drink with fresh mango', price: 120, cat: 'Drinks', emoji: '🥭' },
      { name: 'Gulab Jamun', desc: 'Soft milk dumplings in rose-scented syrup', price: 150, cat: 'Desserts', emoji: '🍯' },
      { name: 'Tandoori Chicken', desc: 'Clay-oven roasted chicken marinated in yogurt', price: 320, cat: 'Starters', emoji: '🍖' },
      { name: 'Raita', desc: 'Cooling yogurt with cucumber and mint', price: 70, cat: 'Sides', emoji: '🥒' },
      { name: 'Masala Chai', desc: 'Spiced Indian tea with milk', price: 50, cat: 'Drinks', emoji: '☕' },
      { name: 'Kulfi', desc: 'Traditional Indian ice cream with pistachios', price: 130, cat: 'Desserts', emoji: '🍨' },
    ],
    2: [ // Blue Bistro
      { name: 'Grilled Salmon', desc: 'Atlantic salmon with herb butter sauce', price: 650, cat: 'Mains', emoji: '🐟' },
      { name: 'Caesar Salad', desc: 'Romaine lettuce with parmesan and croutons', price: 280, cat: 'Starters', emoji: '🥗' },
      { name: 'Mushroom Risotto', desc: 'Creamy arborio rice with wild mushrooms', price: 420, cat: 'Mains', emoji: '🍄' },
      { name: 'Bruschetta', desc: 'Toasted bread with tomato-basil topping', price: 220, cat: 'Starters', emoji: '🍞' },
      { name: 'Lamb Chops', desc: 'Herb-crusted lamb with rosemary jus', price: 720, cat: 'Mains', emoji: '🥩' },
      { name: 'French Onion Soup', desc: 'Classic soup with gruyère cheese croutons', price: 250, cat: 'Starters', emoji: '🧅' },
      { name: 'Tiramisu', desc: 'Coffee-soaked layers with mascarpone cream', price: 300, cat: 'Desserts', emoji: '🍰' },
      { name: 'Red Wine', desc: 'House selection Cabernet Sauvignon', price: 450, cat: 'Drinks', emoji: '🍷' },
      { name: 'Grilled Chicken', desc: 'Free-range chicken with roasted vegetables', price: 480, cat: 'Mains', emoji: '🍗' },
      { name: 'Crème Brûlée', desc: 'Classic vanilla custard with caramelized sugar', price: 280, cat: 'Desserts', emoji: '🍮' },
    ],
    3: [ // Sakura Sushi
      { name: 'Salmon Nigiri', desc: 'Fresh salmon over pressed vinegared rice', price: 320, cat: 'Sushi', emoji: '🍣' },
      { name: 'Dragon Roll', desc: 'Eel and cucumber topped with avocado', price: 450, cat: 'Sushi', emoji: '🐉' },
      { name: 'Miso Soup', desc: 'Traditional soybean soup with tofu and seaweed', price: 150, cat: 'Starters', emoji: '🥣' },
      { name: 'Edamame', desc: 'Steamed soybeans with sea salt', price: 120, cat: 'Starters', emoji: '🫛' },
      { name: 'Tempura Platter', desc: 'Light and crispy battered shrimp and vegetables', price: 380, cat: 'Mains', emoji: '🍤' },
      { name: 'Ramen', desc: 'Rich pork broth with noodles and soft egg', price: 350, cat: 'Mains', emoji: '🍜' },
      { name: 'Gyoza', desc: 'Pan-fried dumplings with dipping sauce', price: 200, cat: 'Starters', emoji: '🥟' },
      { name: 'Matcha Ice Cream', desc: 'Green tea flavored creamy ice cream', price: 180, cat: 'Desserts', emoji: '🍵' },
      { name: 'Sake', desc: 'Premium Japanese rice wine', price: 400, cat: 'Drinks', emoji: '🍶' },
      { name: 'California Roll', desc: 'Crab, avocado, and cucumber maki', price: 280, cat: 'Sushi', emoji: '🍱' },
    ],
    4: [ // Trattoria Milano
      { name: 'Margherita Pizza', desc: 'Wood-fired with San Marzano tomatoes and mozzarella', price: 380, cat: 'Mains', emoji: '🍕' },
      { name: 'Spaghetti Carbonara', desc: 'Classic Roman pasta with guanciale and pecorino', price: 350, cat: 'Mains', emoji: '🍝' },
      { name: 'Caprese Salad', desc: 'Fresh mozzarella with tomatoes and basil', price: 250, cat: 'Starters', emoji: '🍅' },
      { name: 'Penne Arrabbiata', desc: 'Spicy tomato sauce with garlic and chili', price: 300, cat: 'Mains', emoji: '🌶️' },
      { name: 'Minestrone', desc: 'Hearty Italian vegetable soup', price: 200, cat: 'Starters', emoji: '🥕' },
      { name: 'Panna Cotta', desc: 'Vanilla cream dessert with berry coulis', price: 250, cat: 'Desserts', emoji: '🍮' },
      { name: 'Espresso', desc: 'Double-shot Italian espresso', price: 100, cat: 'Drinks', emoji: '☕' },
      { name: 'Limoncello', desc: 'Traditional Italian lemon liqueur', price: 200, cat: 'Drinks', emoji: '🍋' },
      { name: 'Focaccia', desc: 'Herb-infused olive oil flatbread', price: 150, cat: 'Starters', emoji: '🫓' },
      { name: 'Gelato', desc: 'Authentic Italian ice cream trio', price: 220, cat: 'Desserts', emoji: '🍦' },
    ],
    5: [ // Smoky Grill House
      { name: 'BBQ Ribs', desc: 'Slow-smoked pork ribs with house BBQ sauce', price: 580, cat: 'Mains', emoji: '🍖' },
      { name: 'Smoked Brisket', desc: '12-hour smoked beef brisket', price: 620, cat: 'Mains', emoji: '🥩' },
      { name: 'Buffalo Wings', desc: 'Crispy wings with hot sauce and blue cheese', price: 280, cat: 'Starters', emoji: '🍗' },
      { name: 'Loaded Nachos', desc: 'Tortilla chips with cheese, jalapeños, and sour cream', price: 250, cat: 'Starters', emoji: '🫔' },
      { name: 'Grilled Corn', desc: 'Charred corn with chili-lime butter', price: 120, cat: 'Sides', emoji: '🌽' },
      { name: 'Coleslaw', desc: 'Creamy cabbage slaw with apple cider dressing', price: 100, cat: 'Sides', emoji: '🥬' },
      { name: 'Craft Beer', desc: 'Local IPA on draft', price: 300, cat: 'Drinks', emoji: '🍺' },
      { name: 'Smoky Burger', desc: 'Double patty with bacon and smoked gouda', price: 420, cat: 'Mains', emoji: '🍔' },
      { name: 'Brownie Sundae', desc: 'Warm chocolate brownie with vanilla ice cream', price: 250, cat: 'Desserts', emoji: '🍫' },
      { name: 'Lemonade', desc: 'Fresh-squeezed lemonade with mint', price: 120, cat: 'Drinks', emoji: '🍋' },
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
    // Aromas Kitchen - busy
    insertQueue.run(1, 'Rahul Sharma', '9876543210', 4, 'waiting', 'remote', 18, 1);
    insertQueue.run(1, 'Priya Patel', '9876543211', 2, 'waiting', 'walkin', 26, 2);
    insertQueue.run(1, 'Amit Kumar', '9876543212', 3, 'waiting', 'remote', 34, 3);
    insertQueue.run(1, 'Sneha Gupta', '9876543213', 2, 'waiting', 'remote', 42, 4);
    insertQueue.run(1, 'Vikram Singh', '9876543214', 6, 'waiting', 'walkin', 50, 5);
    insertQueue.run(1, 'Neha Reddy', '9876543215', 2, 'waiting', 'remote', 58, 6);

    // Blue Bistro - very busy
    insertQueue.run(2, 'John Miller', '9876543220', 2, 'waiting', 'remote', 32, 1);
    insertQueue.run(2, 'Sarah Wilson', '9876543221', 4, 'waiting', 'walkin', 45, 2);
    insertQueue.run(2, 'David Chen', '9876543222', 2, 'waiting', 'remote', 55, 3);
    insertQueue.run(2, 'Emily Brown', '9876543223', 3, 'waiting', 'remote', 65, 4);
    insertQueue.run(2, 'Michael Davis', '9876543224', 2, 'waiting', 'walkin', 75, 5);
    insertQueue.run(2, 'Lisa Anderson', '9876543225', 5, 'waiting', 'remote', 85, 6);
    insertQueue.run(2, 'Robert Taylor', '9876543226', 2, 'waiting', 'remote', 95, 7);
    insertQueue.run(2, 'Emma Martinez', '9876543227', 4, 'waiting', 'walkin', 105, 8);

    // Sakura Sushi - light
    insertQueue.run(3, 'Yuki Tanaka', '9876543230', 2, 'waiting', 'remote', 8, 1);
    insertQueue.run(3, 'Ken Watanabe', '9876543231', 3, 'waiting', 'walkin', 14, 2);
  });
  queueTransaction();
}

export default getDb;
