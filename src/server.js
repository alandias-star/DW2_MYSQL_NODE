import express from "express";
import { pool } from "./db.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

// GET /produtos
app.get("/produtos", async (req, res, next) => {
  try {
    const { busca } = req.query;

    if (busca) {
      const [rows] = await pool.execute(
        "SELECT id, nome, preco, estoque FROM produto WHERE nome LIKE ? ORDER BY id",
        [`%${busca}%`],
      );
      return res.json(rows);
    }

    const [rows] = await pool.execute(
      "SELECT id, nome, preco, estoque FROM produto ORDER BY id",
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /produtos/:id
app.get("/produtos/:id", async (req, res, next) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM produto WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ erro: "Não encontrado" });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /produtos
app.post("/produtos", async (req, res) => {
  try {
    const { nome, preco, estoque } = req.body;
    const [result] = await pool.execute(
      "INSERT INTO produto (nome, preco, estoque) VALUES (?, ?, ?)",
      [nome, preco, estoque ?? 0],
    );
    res
      .status(201)
      .json({ id: result.insertId, nome, preco, estoque: estoque ?? 0 });
  } catch (err) {
    console.error(err);
    res.status(400).json({ erro: "Dados inválidos" });
  }
});

// PUT /produtos/:id
app.put("/produtos/:id", async (req, res, next) => {
  try {
    const { nome, preco, estoque } = req.body;
    const [result] = await pool.execute(
      "UPDATE produto SET nome = ?, preco = ?, estoque = ? WHERE id = ?",
      [nome, preco, estoque, req.params.id],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: "Não encontrado" });
    }
    res.json({ mensagem: "Atualizado" });
  } catch (err) {
    next(err);
  }
});

// DELETE /produtos/:id
app.delete("/produtos/:id", async (req, res, next) => {
  try {
    const [result] = await pool.execute("DELETE FROM produto WHERE id = ?", [
      req.params.id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: "Não encontrado" });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// GET /categorias
app.get("/categorias", async (req, res, next) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM categoria ORDER BY id");
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /categorias
app.post("/categorias", async (req, res) => {
  try {
    const { nome } = req.body;
    const [result] = await pool.execute(
      "INSERT INTO categoria (nome) VALUES (?)",
      [nome],
    );
    res.status(201).json({ id: result.insertId, nome });
  } catch (err) {
    console.error(err);
    res.status(400).json({ erro: "Dados inválidos" });
  }
});
