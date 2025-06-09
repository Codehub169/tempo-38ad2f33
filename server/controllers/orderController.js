import { getAppDb } from "../db/setup.js";

// Helper function to get full order details (uses the shared app DB connection)
async function getOrderDetails(db, orderId) { // db is passed in, expected to be the appDb
  const order = await db.get("SELECT * FROM orders WHERE id = ?", orderId);
  if (order) {
    try {
      order.shipping_address = JSON.parse(order.shipping_address || '{}');
    } catch (e) {
      console.error(`Failed to parse shipping_address for order ${orderId}:`, e);
      order.shipping_address = {}; // Default to empty object on parse error
    }
    order.items = await db.all(
      `SELECT oi.*, p.name as product_name, p.image_url as product_image_url 
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`,
      orderId
    );
  }
  return order;
}

// Create a new order
export const createOrder = async (req, res) => {
  let db;
  let transactionStarted = false;
  try {
    db = await getAppDb(); // Use the shared DB connection
    const {
      customer_name,
      email,
      shipping_address,
      items, 
      total_amount,
    } = req.body;

    // Validate required fields
    if (!customer_name || typeof customer_name !== 'string' || customer_name.trim() === '') {
      return res.status(400).json({ message: "Customer name is required and must be a non-empty string." });
    }
    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) { // Basic email validation
      return res.status(400).json({ message: "A valid customer email is required." });
    }
    if (!shipping_address || typeof shipping_address !== 'object' || Object.keys(shipping_address).length === 0) {
      return res.status(400).json({ message: "Shipping address object with details is required." });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order must contain at least one item." });
    }
    if (total_amount === undefined || typeof total_amount !== 'number' || total_amount < 0) {
      return res.status(400).json({ message: "Total amount is required and must be a non-negative number." });
    }

    await db.run('BEGIN TRANSACTION;');
    transactionStarted = true;

    const orderResult = await db.run(
      `INSERT INTO orders (customer_name, email, shipping_address, total_amount, status, order_date) 
       VALUES (?, ?, ?, ?, 'Pending', datetime('now'))`,
      customer_name.trim(),
      email.trim(),
      JSON.stringify(shipping_address),
      total_amount
    );
    const orderId = orderResult.lastID;

    for (const item of items) {
      if (!item.product_id || typeof item.product_id !== 'number' || item.product_id <=0 ||
          !item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0 || 
          item.price_at_purchase === undefined || typeof item.price_at_purchase !== 'number' || item.price_at_purchase < 0) {
        throw new Error(`Invalid item data: product_id ${item.product_id}, quantity ${item.quantity}, price ${item.price_at_purchase}. All fields must be valid positive numbers.`);
      }
      const product = await db.get("SELECT stock_quantity FROM products WHERE id = ?", item.product_id);
      if (!product) {
        throw new Error(`Product with ID ${item.product_id} not found.`);
      }
      if (product.stock_quantity < item.quantity) {
        throw new Error(`Not enough stock for product ID ${item.product_id}. Available: ${product.stock_quantity}, Requested: ${item.quantity}`);
      }

      await db.run(
        "INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)",
        orderId,
        item.product_id,
        item.quantity,
        item.price_at_purchase
      );

      await db.run(
        "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?",
        item.quantity,
        item.product_id
      );
    }

    await db.run('COMMIT;');
    transactionStarted = false;
    
    const createdOrder = await getOrderDetails(db, orderId);
    res.status(201).json(createdOrder);

  } catch (error) {
    if (db && transactionStarted) { 
      try {
        await db.run('ROLLBACK;');
      } catch (rollbackError) {
        console.error("Error during ROLLBACK attempt in createOrder:", rollbackError);
      }
    }
    console.error("Error in createOrder:", error);
    if (!res.headersSent) {
      if (error.message.includes("required") || error.message.includes("Invalid item data") || error.message.includes("must be a valid object")) {
        res.status(400).json({ message: error.message });
      } else if (error.message.includes("not found")) {
        res.status(404).json({ message: error.message });
      } else if (error.message.includes("Not enough stock")) {
        res.status(409).json({ message: error.message }); // 409 Conflict for stock issues
      } else {
        res.status(500).json({ message: "Error creating order", error: error.message });
      }
    }
  }
  // No db.close() in finally block, as it's a shared connection managed by server.js
};

// Get a single order by ID
export const getOrderById = async (req, res) => {
  try {
    const db = await getAppDb(); // Use the shared DB connection
    const { id } = req.params;
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order ID format." });
    }

    const order = await getOrderDetails(db, orderId); 

    if (order) {
      res.json(order);
    } else {
      if (!res.headersSent) {
        res.status(404).json({ message: "Order not found" });
      }
    }
  } catch (error) {
    console.error(`Error in getOrderById for ID ${req.params.id}:`, error);
    if (!res.headersSent) {
        res.status(500).json({ message: "Error fetching order", error: error.message });
    }
  }
  // No db.close() in finally block
};