import { Router } from "express";
import pool from "../lib/db";

const router = Router();

router.get("/categories", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM categories ORDER BY id");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
