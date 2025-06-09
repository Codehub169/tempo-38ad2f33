import { openDb } from "../db/setup.js";

// Create a new order
export const createOrder = async (req, res) => {
  const db = await openDb();
  try {
    const {
      customer_name,
      email,
      shipping_address,
      items, // Expecting an array of { product_id, quantity, price_at_purchase }
      total_amount,
    } = req.body;

    // Basic validation
    if (!customer_name || !email || !shipping_address || !items || items.length === 0 || total_amount === undefined) {
      return res.status(400).json({ message: "Missing required order information." });
    }
    if (typeof shipping_address !== 'object') {
        return res.status(400).json({ message: "Shipping address must be an object." });
    }

    await db.run('BEGIN TRANSACTION;');

    // 1. Create the order
    const orderResult = await db.run(
      `INSERT INTO orders (customer_name, email, shipping_address, total_amount, status, order_date) 
       VALUES (?, ?, ?, ?, 'Pending', datetime('now'))`,
      customer_name,
      email,
      JSON.stringify(shipping_address), // Store as JSON string
      total_amount
    );
    const orderId = orderResult.lastID;

    // 2. Add order items and update product stock
    for (const item of items) {
      if (!item.product_id || !item.quantity || !item.price_at_purchase) {
        await db.run('ROLLBACK;');
        return res.status(400).json({ message: `Invalid item data for product ID ${item.product_id}` });
      }
      // Check stock
      const product = await db.get("SELECT stock_quantity FROM products WHERE id = ?", item.product_id);
      if (!product) {
        await db.run('ROLLBACK;');
        return res.status(404).json({ message: `Product with ID ${item.product_id} not found.` });
      }
      if (product.stock_quantity < item.quantity) {
        await db.run('ROLLBACK;');
        return res.status(400).json({ message: `Not enough stock for product ID ${item.product_id}. Available: ${product.stock_quantity}, Requested: ${item.quantity}` });
      }

      await db.run(
        "INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)",
        orderId,
        item.product_id,
        item.quantity,
        item.price_at_purchase
      );

      // Update product stock
      await db.run(
        "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?",
        item.quantity,
        item.product_id
      );
    }

    await db.run('COMMIT;');

    // Fetch the complete order to return
    const createdOrder = await getOrderDetails(db, orderId);

    res.status(201).json(createdOrder);
  } catch (error) {
    await db.run('ROLLBACK;').catch(rbError => console.error('Rollback error:', rbError));
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Error creating order", error: error.message });
  } finally {
    await db.close();
  }
};

// Get a single order by ID
export const getOrderById = async (req, res) => {
  const db = await openDb();
  try {
    const { id } = req.params;
    const order = await getOrderDetails(db, id);

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error(`Error fetching order with id ${req.params.id}:`, error);
    res.status(500).json({ message: "Error fetching order", error: error.message });
  } finally {
    await db.close();
  }
};

// Helper function to get full order details
async function getOrderDetails(db, orderId) {
  const order = await db.get("SELECT * FROM orders WHERE id = ?", orderId);
  if (order) {
    order.shipping_address = JSON.parse(order.shipping_address || '{}');
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

// Potential future functions for admin panel or extended user features:
/*
export const getAllOrders = async (req, res) => {
    // TODO: Implement for admin - requires authentication and authorization
    // Consider pagination, filtering by status, user, date range
    res.status(501).json({ message: "Not implemented" });
};

export const updateOrderStatus = async (req, res) => {
    // TODO: Implement for admin - requires authentication and authorization
    // Validate status changes (e.g., Pending -> Shipped -> Delivered)
    const db = await openDb();
    try {
        const { id } = req.params;
        const { status } = req.body;
        // Add validation for allowed status values
        if (!status) {
            return res.status(400).json({ message: "Status is required." });
        }
        const result = await db.run("UPDATE orders SET status = ? WHERE id = ?", status, id);
        if (result.changes === 0) {
            return res.status(404).json({ message: "Order not found or status unchanged." });
        }
        res.json({ message: "Order status updated successfully." });
    } catch (error) {
        console.error(`Error updating order status for id ${req.params.id}:`, error);
        res.status(500).json({ message: "Error updating order status", error: error.message });
    } finally {
        await db.close();
    }
};
*/
