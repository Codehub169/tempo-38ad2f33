import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFilePath = path.join(__dirname, 'database.sqlite');

// For shared application database connection
let appDbPromise = null;

const getAppDb = () => {
  if (!appDbPromise) {
    appDbPromise = open({
      filename: dbFilePath,
      driver: sqlite3.Database
    }).then(async db => {
      console.log('Application database connection established.');
      await db.exec('PRAGMA foreign_keys = ON;');
      return db;
    }).catch(err => {
      console.error('FATAL: Failed to open application database connection:', err);
      appDbPromise = null; // Reset for potential retry, though app might fail to start
      throw err; // Critical error, should prevent app startup or be handled
    });
  }
  return appDbPromise;
};

const closeAppDb = async () => {
  if (appDbPromise) {
    try {
      const db = await appDbPromise; // Ensure promise is resolved
      await db.close();
      console.log('Application database connection closed.');
    } catch (err) {
      console.error('Error closing application database connection:', err);
    } finally {
      appDbPromise = null; // Reset the promise
    }
  }
};

// Function to initialize the database schema (for db:init script)
async function initializeDatabaseSchema() {
  // This function uses its own local connection, not the shared appDbPromise
  let db;
  try {
    db = await open({
      filename: dbFilePath,
      driver: sqlite3.Database
    });
    console.log('Starting database schema initialization (for db:init)...');

    await db.exec('PRAGMA foreign_keys = ON;');

    await db.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      );
    `);
    console.log('Categories table created or already exists (db:init).');

    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          name TEXT,
          role TEXT NOT NULL DEFAULT 'buyer' CHECK(role IN ('buyer', 'seller')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Users table created or already exists (db:init).');

    await db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        condition TEXT CHECK(condition IN ('Excellent', 'Good', 'Fair')) NOT NULL,
        stock_quantity INTEGER NOT NULL DEFAULT 0,
        category_id INTEGER,
        user_id INTEGER, -- Added for seller association
        image_url TEXT,
        images TEXT, -- JSON array of image URLs for gallery
        warranty_info TEXT,
        key_features TEXT, -- JSON array of key features
        brand TEXT,
        model TEXT,
        specifications TEXT, -- JSON object for detailed specs
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL -- Added FK
      );
    `);
    console.log('Products table created or already exists (db:init).');

    await db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        shipping_address TEXT NOT NULL, -- JSON object for address
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
        order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER, -- Optional: Link orders to registered users
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);
    console.log('Orders table created or already exists (db:init).');

    await db.exec(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price_at_purchase REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT 
      );
    `);
    console.log('Order_items table created or already exists (db:init).');
    
    const categoriesData = [
      { name: 'Mobiles' }, { name: 'TVs' }, { name: 'Laptops' }, 
      { name: 'Fridges' }, { name: 'ACs' }, { name: 'Appliances' }
    ];
    const insertCategory = await db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
    for (const category of categoriesData) {
      await insertCategory.run(category.name);
    }
    await insertCategory.finalize();
    console.log('Categories seeded (db:init).');

    // Note: productsData user_id will be NULL as no default seller is created/assigned here.
    // Paths for images are relative; ensure your static file serving setup matches.
    const productsData = [
    {
      name: 'Refurbished iPhone 13 Pro',
      description: 'Experience the power of Pro. A15 Bionic chip, Pro camera system, and Super Retina XDR display with ProMotion.',
      price: 63999,
      condition: 'Excellent',
      stock_quantity: 15,
      category_name: 'Mobiles',
      image_url: '/images/products/mobiles/iphone_13_pro_main.jpg', // Example of more specific path
      images: JSON.stringify(['/images/products/mobiles/iphone_13_pro_1.jpg', '/images/products/mobiles/iphone_13_pro_2.jpg', '/images/products/mobiles/iphone_13_pro_3.jpg']),
      warranty_info: '1-Year Seller Warranty',
      key_features: JSON.stringify(['A15 Bionic Chip', 'Pro Camera System', '120Hz ProMotion Display', 'Surgical-grade stainless steel']),
      brand: 'Apple',
      model: 'iPhone 13 Pro',
      specifications: JSON.stringify({ storage: '128GB', color: 'Graphite', screen_size: '6.1 inches' }),
    },
    {
      name: 'Refurbished Samsung Galaxy S22 Ultra',
      description: 'The epic standard for smartphones with a built-in S Pen, Nightography camera, and a battery that goes for days.',
      price: 59900,
      condition: 'Excellent',
      stock_quantity: 10,
      category_name: 'Mobiles',
      image_url: '/images/products/mobiles/samsung_s22_ultra_main.jpg',
      images: JSON.stringify(['/images/products/mobiles/samsung_s22_ultra_1.jpg', '/images/products/mobiles/samsung_s22_ultra_2.jpg']),
      warranty_info: '1-Year Seller Warranty',
      key_features: JSON.stringify(['Built-in S Pen', '108MP Camera', 'Dynamic AMOLED 2X Display', 'Snapdragon 8 Gen 1']),
      brand: 'Samsung',
      model: 'Galaxy S22 Ultra',
      specifications: JSON.stringify({ storage: '256GB', color: 'Burgundy', screen_size: '6.8 inches' }),
    },
    {
      name: 'Refurbished Dell XPS 15 Laptop',
      description: 'Stunning 15.6-inch display, powerful Intel Core i7 processor, and sleek design for ultimate productivity and creativity.',
      price: 95900,
      condition: 'Good',
      stock_quantity: 8,
      category_name: 'Laptops',
      image_url: '/images/products/laptops/dell_xps_15_main.jpg',
      images: JSON.stringify(['/images/products/laptops/dell_xps_15_1.jpg', '/images/products/laptops/dell_xps_15_2.jpg']),
      warranty_info: '6-Month Seller Warranty',
      key_features: JSON.stringify(['Intel Core i7', 'NVIDIA GeForce RTX Graphics', 'InfinityEdge Display', 'Premium build quality']),
      brand: 'Dell',
      model: 'XPS 15 9510',
      specifications: JSON.stringify({ processor: 'Intel Core i7-11800H', ram: '16GB DDR4', storage: '512GB SSD', display: '15.6" FHD+' }),
    },
    {
      name: 'Refurbished LG OLED C1 55" TV',
      description: 'Experience perfect black and infinite contrast with LG OLED technology. Smart TV capabilities with webOS.',
      price: 76000,
      condition: 'Excellent',
      stock_quantity: 5,
      category_name: 'TVs',
      image_url: '/images/products/tvs/lg_oled_c1_main.jpg',
      images: JSON.stringify(['/images/products/tvs/lg_oled_c1_1.jpg', '/images/products/tvs/lg_oled_c1_2.jpg']),
      warranty_info: '1-Year Seller Warranty',
      key_features: JSON.stringify(['Self-lit OLED Pixels', 'a9 Gen4 AI Processor 4K', 'Dolby Vision IQ & Atmos', 'Gaming: G-SYNC, FreeSync']),
      brand: 'LG',
      model: 'OLED55C1PUB',
      specifications: JSON.stringify({ resolution: '4K UHD', refresh_rate: '120Hz', smart_platform: 'webOS' }),
    },
     {
      name: 'Refurbished Whirlpool Double Door Fridge',
      description: 'Spacious and energy-efficient double door refrigerator, perfect for families. Features adaptive defrost and multiple cooling zones.',
      price: 44000,
      condition: 'Good',
      stock_quantity: 12,
      category_name: 'Fridges',
      image_url: '/images/products/fridges/whirlpool_fridge_main.jpg',
      images: JSON.stringify(['/images/products/fridges/whirlpool_fridge_1.jpg', '/images/products/fridges/whirlpool_fridge_2.jpg']),
      warranty_info: '6-Month Seller Warranty',
      key_features: JSON.stringify(['250 Litre Capacity', 'Frost-Free Operation', 'Toughened Glass Shelves', 'Energy Efficient']),
      brand: 'Whirlpool',
      model: 'INTELLIFRESH PRO 278L',
      specifications: JSON.stringify({ type: 'Double Door', capacity: '278 Litres', color: 'Steel Grey' }),
    },
    {
      name: 'Refurbished Blue Star 1.5 Ton AC',
      description: 'High-performance split AC with inverter technology for energy savings. Cools efficiently even in extreme temperatures.',
      price: 25600,
      condition: 'Excellent',
      stock_quantity: 7,
      category_name: 'ACs',
      image_url: '/images/products/acs/bluestar_ac_main.jpg',
      images: JSON.stringify(['/images/products/acs/bluestar_ac_1.jpg', '/images/products/acs/bluestar_ac_2.jpg']),
      warranty_info: '1-Year Compressor Warranty, 3-Month Seller Warranty on unit',
      key_features: JSON.stringify(['Inverter Technology', '1.5 Ton Capacity', 'Dust Filter', 'Quiet Operation']),
      brand: 'Blue Star',
      model: 'IC318EBTU',
      specifications: JSON.stringify({ type: 'Split AC', tonnage: '1.5 Ton', energy_rating: '3 Star' }),
    }
  ];

    const insertProduct = await db.prepare(`
      INSERT OR IGNORE INTO products (name, description, price, condition, stock_quantity, category_id, image_url, images, warranty_info, key_features, brand, model, specifications, user_id) 
      VALUES (?, ?, ?, ?, ?, (SELECT id FROM categories WHERE name = ?), ?, ?, ?, ?, ?, ?, ?, NULL) -- user_id set to NULL for seeded products
    `);
    for (const product of productsData) {
      await insertProduct.run(
        product.name, product.description, product.price, product.condition, product.stock_quantity,
        product.category_name, product.image_url, product.images, product.warranty_info,
        product.key_features, product.brand, product.model, product.specifications
      );
    }
    await insertProduct.finalize();
    console.log('Products seeded (db:init).');

  } catch (error) {
    console.error('Error during database schema initialization (db:init):', error);
    throw error; // Re-throw to be caught by the calling script
  } finally {
    if (db) {
      await db.close();
      console.log('Database schema initialization connection closed (db:init).');
    }
  }
}

export { getAppDb, closeAppDb }; // For server.js and controllers

// Run initialization only if this script is executed directly
const mainScriptPath = process.argv[1];
const currentModulePath = fileURLToPath(import.meta.url);

if (mainScriptPath === currentModulePath) {
  console.log('INFO: db/setup.js is being run directly. Initializing database schema...');
  initializeDatabaseSchema().catch(err => {
    console.error('FATAL: Database schema initialization failed during direct execution.', err);
    process.exit(1);
  });
}