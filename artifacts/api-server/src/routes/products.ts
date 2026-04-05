import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import pool from "../lib/db";

const router = Router();

const uploadsDir = path.join(process.cwd(), "public", "uploads");
fs.mkdirSync(path.join(uploadsDir, "images"), { recursive: true });
fs.mkdirSync(path.join(uploadsDir, "models"), { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = file.fieldname === "model" ? path.join(uploadsDir, "models") : path.join(uploadsDir, "images");
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

router.get("/products", async (req, res) => {
  try {
    const { category } = req.query;
    let query = `
      SELECT p.*, c.name_uk as category_name, v.shop_name as vendor_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN vendors v ON p.vendor_id = v.id
    `;
    const params: string[] = [];
    if (category) {
      query += " WHERE p.category_id = $1";
      params.push(category as string);
    }
    query += " ORDER BY p.created_at DESC";
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, c.name_uk as category_name, v.shop_name as vendor_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN vendors v ON p.vendor_id = v.id
       WHERE p.id = $1`,
      [req.params["id"]]
    );
    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

router.post(
  "/products",
  upload.fields([{ name: "image", maxCount: 1 }, { name: "model", maxCount: 1 }]),
  async (req, res) => {
    try {
      const { name, description, category_id, price, designer_type, vendor_id, image_url } = req.body;
      const files = req.files as Record<string, Express.Multer.File[]>;

      const imageFile = files?.["image"]?.[0];
      const modelFile = files?.["model"]?.[0];

      const finalImageUrl = imageFile
        ? `/uploads/images/${imageFile.filename}`
        : (image_url || null);

      const modelPath = modelFile ? `/uploads/models/${modelFile.filename}` : null;

      const { rows } = await pool.query(
        `INSERT INTO products (vendor_id, category_id, name, description, price, image_url, model_path, designer_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [vendor_id || null, category_id, name, description, price, finalImageUrl, modelPath, designer_type || null]
      );
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  }
);

export default router;
