import { getAppDb } from "../db/setup.js";

// Get all products with filtering, sorting, and pagination
export const getAllProducts = async (req, res) => {
  try {
    const db = await getAppDb();
    const { category, condition, minPrice, maxPrice, search, sortBy, sortOrder = "ASC", page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.max(1, parseInt(String(limit), 10) || 10);
    const sortOrderNormalized = sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC";

    let query = `
      SELECT 
        p.id, p.name, p.description, p.price, p.condition, p.stock_quantity, 
        p.image_url, p.images, p.warranty_info, p.key_features, p.brand, p.model, 
        p.specifications, c.name as category_name, u.name as seller_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.user_id = u.id
    `;
    const whereClauses = [];
    const filterParams = {};

    if (category) {
      const categoryNames = String(category).split(',').map(c => c.trim()).filter(c => c.length > 0);
      if (categoryNames.length > 0) {
        whereClauses.push(`c.name IN (${categoryNames.map((_, i) => `:category_name_${i}`).join(', ')})`);
        categoryNames.forEach((catName, i) => {
          filterParams[`:category_name_${i}`] = catName;
        });
      }
    }
    if (condition) {
      const conditions = String(condition).split(',').map(c => c.trim()).filter(c => c.length > 0);
      if (conditions.length > 0) {
        whereClauses.push(`p.condition IN (${conditions.map((_, i) => `:condition_${i}`).join(', ')})`);
        conditions.forEach((cond, i) => {
          filterParams[`:condition_${i}`] = cond;
        });
      }
    }
    if (minPrice) {
      const priceVal = parseFloat(String(minPrice));
      if (!isNaN(priceVal)) {
        whereClauses.push("p.price >= :minPrice");
        filterParams[":minPrice"] = priceVal;
      }
    }
    if (maxPrice) {
      const priceVal = parseFloat(String(maxPrice));
      if (!isNaN(priceVal)){
        whereClauses.push("p.price <= :maxPrice");
        filterParams[":maxPrice"] = priceVal;
      }
    }
    if (search) {
      whereClauses.push("(p.name LIKE :search OR p.description LIKE :search OR p.brand LIKE :search OR p.model LIKE :search)");
      filterParams[":search"] = `%${String(search)}%`;
    }

    let whereString = "";
    if (whereClauses.length > 0) {
      whereString = " WHERE " + whereClauses.join(" AND ");
      query += whereString;
    }

    const countQuery = `SELECT COUNT(p.id) as total FROM products p JOIN categories c ON p.category_id = c.id LEFT JOIN users u ON p.user_id = u.id` + whereString;

    const validSortByFields = ["price", "name", "condition", "stock_quantity", "created_at"];
    let orderByClause = " ORDER BY p.created_at DESC, p.name ASC"; // Default sort, newest first
    if (sortBy && validSortByFields.includes(String(sortBy))) {
      orderByClause = ` ORDER BY p.${String(sortBy)} ${sortOrderNormalized}`;
    }
    query += orderByClause;

    const offset = (pageNum - 1) * limitNum;
    query += " LIMIT :limit OFFSET :offset";
    
    const mainQueryParams = { ...filterParams };
    mainQueryParams[":limit"] = limitNum;
    mainQueryParams[":offset"] = offset;

    const products = await db.all(query, mainQueryParams);
    const totalResult = await db.get(countQuery, filterParams);
    const total = totalResult ? totalResult.total : 0;
    
    res.json({
      data: products.map(p => ({
        ...p,
        images: JSON.parse(p.images || '[]'),
        key_features: JSON.parse(p.key_features || '[]'),
        specifications: JSON.parse(p.specifications || '{}')
      })),
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        pageSize: limitNum
      }
    });

  } catch (error) {
    console.error("Error in getAllProducts:", error);
    if (!res.headersSent) {
        res.status(500).json({ message: "Error fetching products", error: error.message });
    }
  }
};

// Get a single product by ID
export const getProductById = async (req, res) => {
  try {
    const db = await getAppDb();
    const { id } = req.params;
    const product = await db.get(
      `SELECT p.*, c.name as category_name, u.name as seller_name 
       FROM products p 
       JOIN categories c ON p.category_id = c.id 
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.id = :id`,
      { ':id': id }
    );
    if (product) {
      res.json({...product, images: JSON.parse(product.images || '[]'), key_features: JSON.parse(product.key_features || '[]'), specifications: JSON.parse(product.specifications || '{}')});
    } else {
      if (!res.headersSent) {
        res.status(404).json({ message: "Product not found" });
      }
    }
  } catch (error) {
    console.error(`Error in getProductById for ID ${req.params.id}:`, error);
    if (!res.headersSent) {
        res.status(500).json({ message: "Error fetching product", error: error.message });
    }
  }
};

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const db = await getAppDb();
    const categories = await db.all("SELECT * FROM categories ORDER BY name ASC");
    res.json(categories);
  } catch (error) {
    console.error("Error in getCategories:", error);
    if (!res.headersSent) {
        res.status(500).json({ message: "Error fetching categories", error: error.message });
    }
  }
};

// Get products by category name
export const getProductsByCategory = async (req, res) => {
  try {
    const db = await getAppDb();
    const { categoryName } = req.params;
    const { page = 1, limit = 10, sortBy, sortOrder = "ASC" } = req.query;

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.max(1, parseInt(String(limit), 10) || 10);
    const sortOrderNormalized = sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC";

    let query = `
      SELECT p.*, c.name as category_name, u.name as seller_name 
      FROM products p 
      JOIN categories c ON p.category_id = c.id 
      LEFT JOIN users u ON p.user_id = u.id
      WHERE c.name = :categoryName
    `;
    const params = { ':categoryName': String(categoryName) };

    const validSortByFields = ["price", "name", "condition", "stock_quantity", "created_at"];
    let orderByClause = " ORDER BY p.created_at DESC, p.name ASC"; // Default sort
    if (sortBy && validSortByFields.includes(String(sortBy))) {
      orderByClause = ` ORDER BY p.${String(sortBy)} ${sortOrderNormalized}`;
    }
    query += orderByClause;

    const offset = (pageNum - 1) * limitNum;
    query += " LIMIT :limit OFFSET :offset";
    params[':limit'] = limitNum;
    params[':offset'] = offset;

    const products = await db.all(query, params);

    const countResult = await db.get(
      "SELECT COUNT(p.id) as total FROM products p JOIN categories c ON p.category_id = c.id LEFT JOIN users u ON p.user_id = u.id WHERE c.name = :categoryName",
      { ':categoryName': String(categoryName) }
    );
    const total = countResult ? countResult.total : 0;

    res.json({
      data: products.map(p => ({...p, images: JSON.parse(p.images || '[]'), key_features: JSON.parse(p.key_features || '[]'), specifications: JSON.parse(p.specifications || '{}')})),
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        pageSize: limitNum
      }
    });
  } catch (error) {
    console.error(`Error in getProductsByCategory for category ${req.params.categoryName}:`, error);
    if (!res.headersSent) {
        res.status(500).json({ message: "Error fetching products by category", error: error.message });
    }
  }
};

// Create a new product
export const createProduct = async (req, res) => {
  try {
    const db = await getAppDb();
    const {
      name,
      description,
      price,
      condition,
      stock_quantity,
      category_id, // Expecting category_id directly from frontend
      image_url,
      images, // Expecting a JSON string or an array of URLs
      warranty_info,
      key_features, // Expecting a JSON string or an array of strings
      brand,
      model,
      specifications // Expecting a JSON string or an object
    } = req.body;

    const user_id = req.user.id; // From 'protect' middleware

    // Basic Validations
    if (!name || typeof price === 'undefined' || !condition || typeof stock_quantity === 'undefined' || !category_id) {
      return res.status(400).json({ message: 'Missing required fields: name, price, condition, stock_quantity, category_id are mandatory.' });
    }
    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ message: 'Price must be a positive number.' });
    }
    if (typeof stock_quantity !== 'number' || stock_quantity < 0) {
      return res.status(400).json({ message: 'Stock quantity must be a non-negative number.' });
    }
    if (!['Excellent', 'Good', 'Fair'].includes(condition)) {
      return res.status(400).json({ message: 'Condition must be one of: Excellent, Good, Fair.' });
    }
    if (typeof category_id !== 'number' || category_id <= 0) {
      return res.status(400).json({ message: 'Category ID must be a positive number.' });
    }

    // Validate category_id exists
    const categoryExists = await db.get('SELECT id FROM categories WHERE id = ?', category_id);
    if (!categoryExists) {
        return res.status(400).json({ message: `Invalid category_id: ${category_id}. Category does not exist.` });
    }

    // Prepare data for insertion (handle JSON fields)
    const imagesString = Array.isArray(images) ? JSON.stringify(images.filter(img => typeof img === 'string' && img.trim() !== '')) : (typeof images === 'string' && images.trim() !== '' ? images : '[]');
    const keyFeaturesString = Array.isArray(key_features) ? JSON.stringify(key_features.filter(kf => typeof kf === 'string' && kf.trim() !== '')) : (typeof key_features === 'string' && key_features.trim() !== '' ? key_features : '[]');
    const specificationsString = typeof specifications === 'object' && specifications !== null ? JSON.stringify(specifications) : (typeof specifications === 'string' && specifications.trim() !== '' ? specifications : '{}');

    const result = await db.run(
      `INSERT INTO products (
        name, description, price, condition, stock_quantity, category_id, user_id, 
        image_url, images, warranty_info, key_features, brand, model, specifications, 
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      name,
      description || null,
      price,
      condition,
      stock_quantity,
      category_id,
      user_id,
      image_url || null,
      imagesString,
      warranty_info || null,
      keyFeaturesString,
      brand || null,
      model || null,
      specificationsString
    );

    const newProductId = result.lastID;
    const newProduct = await db.get(
        `SELECT p.*, c.name as category_name, u.name as seller_name 
         FROM products p 
         JOIN categories c ON p.category_id = c.id 
         LEFT JOIN users u ON p.user_id = u.id
         WHERE p.id = ?`,
        newProductId
      );

    res.status(201).json({
        ...newProduct,
        images: JSON.parse(newProduct.images || '[]'),
        key_features: JSON.parse(newProduct.key_features || '[]'),
        specifications: JSON.parse(newProduct.specifications || '{}')
    });

  } catch (error) {
    console.error("Error in createProduct:", error);
    if (!res.headersSent) {
      if (error.message.includes('FOREIGN KEY constraint failed')) {
         if (error.message.includes('category_id')) {
            return res.status(400).json({ message: 'Invalid category ID provided.' });
         } else if (error.message.includes('user_id')) {
            return res.status(400).json({ message: 'Invalid user ID associated with product.'}); // Should not happen if req.user is valid
         }
      }
      res.status(500).json({ message: "Error creating product", error: error.message });
    }
  }
};