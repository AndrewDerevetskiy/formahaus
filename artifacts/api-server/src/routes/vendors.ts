import { Router } from "express";
import bcrypt from "bcryptjs";
import pool from "../lib/db";

const router = Router();

router.post("/vendor/register", async (req, res) => {
  try {
    const { shop_name, email, password } = req.body;
    if (!shop_name || !email || !password) {
      return res.status(400).json({ error: "Усі поля обов'язкові" });
    }
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO vendors (shop_name, email, password_hash)
       VALUES ($1, $2, $3) RETURNING id, shop_name, email`,
      [shop_name, email, hash]
    );
    res.json({ success: true, vendor: rows[0] });
  } catch (err: any) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Цей email вже зареєстровано" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/vendor/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query("SELECT * FROM vendors WHERE email = $1", [email]);
    if (!rows[0]) return res.status(401).json({ error: "Невірний email або пароль" });
    const ok = await bcrypt.compare(password, rows[0]["password_hash"]);
    if (!ok) return res.status(401).json({ error: "Невірний email або пароль" });
    const { password_hash: _ph, ...vendor } = rows[0];
    res.json({ success: true, vendor });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/vendor/:id/products", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM products WHERE vendor_id = $1 ORDER BY created_at DESC",
      [req.params["id"]]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
