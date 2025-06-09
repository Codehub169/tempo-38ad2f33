import { openDb } from "../db/setup.js";

// Get all products with filtering, sorting, and pagination
export const getAllProducts = async (req, res) => {
  const db = await openDb();
  try {
    const { category, condition, minPrice, maxPrice, search, sortBy, sortOrder = "ASC", page = 1, limit = 10 } = req.query;

    let query = `
      SELECT 
        p.id, p.name, p.description, p.price, p.condition, p.stock_quantity, 
        p.image_url, p.images, p.warranty_info, p.key_features, p.brand, p.model, 
        p.specifications, c.name as category_name 
      FROM products p
      JOIN categories c ON p.category_id = c.id
    `;
    const whereClauses = [];
    const params = {};

    if (category) {
      // Allow multiple categories, comma-separated
      const categoryNames = category.split(',').map(c => c.trim());
      if (categoryNames.length > 0) {
        whereClauses.push(`c.name IN (${categoryNames.map((_, i) => `:category_name_${i}`).join(', ')})`);
        categoryNames.forEach((catName, i) => {
          params[`:category_name_${i}`] = catName;
        });
      }
    }
    if (condition) {
      // Allow multiple conditions, comma-separated
      const conditions = condition.split(',').map(c => c.trim());
      if (conditions.length > 0) {
        whereClauses.push(`p.condition IN (${conditions.map((_, i) => `:condition_${i}`).join(', ')})`);
        conditions.forEach((cond, i) => {
          params[`:condition_${i}`] = cond;
        });
      }
    }
    if (minPrice) {
      whereClauses.push("p.price >= :minPrice");
      params[":minPrice"] = parseFloat(minPrice);
    }
    if (maxPrice) {
      whereClauses.push("p.price <= :maxPrice");
      params[":maxPrice"] = parseFloat(maxPrice);
    }
    if (search) {
      whereClauses.push("(p.name LIKE :search OR p.description LIKE :search OR p.brand LIKE :search OR p.model LIKE :search)");
      params[":search"] = `%${search}%`;
    }

    if (whereClauses.length > 0) {
      query += " WHERE " + whereClauses.join(" AND ");
    }

    // Sorting
    const validSortBy = ["price", "name", "condition", "stock_quantity"]; // Add more as needed
    if (sortBy && validSortBy.includes(sortBy)) {
      const order = sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC";
      query += ` ORDER BY p.${sortBy} ${order}`;
    } else {
      query += " ORDER BY p.name ASC"; // Default sort
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += " LIMIT :limit OFFSET :offset";
    params[":limit"] = parseInt(limit);
    params[":offset"] = offset;

    const products = await db.all(query, params);

    // Get total count for pagination metadata
    let countQuery = `SELECT COUNT(p.id) as total FROM products p JOIN categories c ON p.category_id = c.id`;
    if (whereClauses.length > 0) {
      // Rebuild where clauses for count, excluding category name mapping for simplicity here if not searching by category name directly
      // This might need adjustment if category name search is complex
      let countWhereClauses = [];
      const countParams = {};
      if (category) {
        const categoryNames = category.split(',').map(c => c.trim());
        if (categoryNames.length > 0) {
          countWhereClauses.push(`c.name IN (${categoryNames.map((_, i) => `:category_name_${i}`).join(', ')})`);
          categoryNames.forEach((catName, i) => {
            countParams[`:category_name_${i}`] = catName;
          });
        }
      }
      if (condition) {
        const conditions = condition.split(',').map(c => c.trim());
        if (conditions.length > 0) {
         countWhereClauses.push(`p.condition IN (${conditions.map((_, i) => `:condition_${i}`).join(', ')})`);
          conditions.forEach((cond, i) => {
            countParams[`:condition_${i}`] = cond;
          });
        }
      }
      if (minPrice) { countWhereClauses.push("p.price >= :minPrice"); countParams[":minPrice"] = parseFloat(minPrice); }
      if (maxPrice) { countWhereClauses.push("p.price <= :maxPrice"); countParams[":maxPrice"] = parseFloat(maxPrice); }
      if (search) { countWhereClauses.push("(p.name LIKE :search OR p.description LIKE :search OR p.brand LIKE :search OR p.model LIKE :search)"); countParams[":search"] = `%${search}%`; }
      
      if (countWhereClauses.length > 0) {
        countQuery += " WHERE " + countWhereClauses.join(" AND ");
      }
      const { total } = await db.get(countQuery, countParams);
      res.json({
        data: products.map(p => ({...p, images: JSON.parse(p.images || '[]'), key_features: JSON.parse(p.key_features || '[]'), specifications: JSON.parse(p.specifications || '{}')})),
        pagination: {
          totalItems: total,
          totalPages: Math.ceil(total / parseInt(limit)),
          currentPage: parseInt(page),
          pageSize: parseInt(limit)
        }
      });
    } else {
      const { total } = await db.get(countQuery);
      res.json({
        data: products.map(p => ({...p, images: JSON.parse(p.images || '[]'), key_features: JSON.parse(p.key_features || '[]'), specifications: JSON.parse(p.specifications || '{}')})),
        pagination: {
          totalItems: total,
          totalPages: Math.ceil(total / parseInt(limit)),
          currentPage: parseInt(page),
          pageSize: parseInt(limit)
        }
      });
    }

  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products", error: error.message });
  } finally {
    await db.close();
  }
};

// Get a single product by ID
export const getProductById = async (req, res) => {
  const db = await openDb();
  try {
    const { id } = req.params;
    const product = await db.get(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       JOIN categories c ON p.category_id = c.id 
       WHERE p.id = ?`,
      id
    );
    if (product) {
      res.json({...product, images: JSON.parse(product.images || '[]'), key_features: JSON.parse(product.key_features || '[]'), specifications: JSON.parse(product.specifications || '{}')});
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error(`Error fetching product with id ${req.params.id}:`, error);
    res.status(500).json({ message: "Error fetching product", error: error.message });
  } finally {
    await db.close();
  }
};

// Get all categories
export const getCategories = async (req, res) => {
  const db = await openDb();
  try {
    const categories = await db.all("SELECT * FROM categories ORDER BY name ASC");
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Error fetching categories", error: error.message });
  } finally {
    await db.close();
  }
};

// Get products by category name
export const getProductsByCategory = async (req, res) => {
  const db = await openDb();
  try {
    const { categoryName } = req.params;
    const { page = 1, limit = 10, sortBy, sortOrder = "ASC" } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      JOIN categories c ON p.category_id = c.id 
      WHERE c.name = :categoryName
    `;
    const params = { ':categoryName': categoryName };

    const validSortBy = ["price", "name", "condition"];
    if (sortBy && validSortBy.includes(sortBy)) {
      const order = sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC";
      query += ` ORDER BY p.${sortBy} ${order}`;
    } else {
      query += " ORDER BY p.name ASC";
    }

    query += " LIMIT :limit OFFSET :offset";
    params[':limit'] = parseInt(limit);
    params[':offset'] = offset;

    const products = await db.all(query, params);

    const countResult = await db.get(
      "SELECT COUNT(p.id) as total FROM products p JOIN categories c ON p.category_id = c.id WHERE c.name = ?",
      categoryName
    );
    const total = countResult.total;

    res.json({
      data: products.map(p => ({...p, images: JSON.parse(p.images || '[]'), key_features: JSON.parse(p.key_features || '[]'), specifications: JSON.parse(p.specifications || '{}')})),
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        pageSize: parseInt(limit)
      }
    });
  } catch (error) {
    console.error(`Error fetching products for category ${req.params.categoryName}:`, error);
    res.status(500).json({ message: "Error fetching products by category", error: error.message });
  } finally {
    await db.close();
  }
};
