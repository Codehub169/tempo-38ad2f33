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
        p.specifications, c.name as category_name 
      FROM products p
      JOIN categories c ON p.category_id = c.id
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

    const countQuery = `SELECT COUNT(p.id) as total FROM products p JOIN categories c ON p.category_id = c.id` + whereString;

    const validSortByFields = ["price", "name", "condition", "stock_quantity"];
    let orderByClause = " ORDER BY p.name ASC"; // Default sort
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
      `SELECT p.*, c.name as category_name 
       FROM products p 
       JOIN categories c ON p.category_id = c.id 
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
      SELECT p.*, c.name as category_name 
      FROM products p 
      JOIN categories c ON p.category_id = c.id 
      WHERE c.name = :categoryName
    `;
    const params = { ':categoryName': String(categoryName) };

    const validSortByFields = ["price", "name", "condition", "stock_quantity"];
    let orderByClause = " ORDER BY p.name ASC"; // Default sort
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
      "SELECT COUNT(p.id) as total FROM products p JOIN categories c ON p.category_id = c.id WHERE c.name = :categoryName",
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