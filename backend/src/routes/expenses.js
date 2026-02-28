const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

// GET /api/expenses?event_id=xxx
router.get("/", async (req, res) => {
  let query = supabase
    .from("expenses")
    .select("*")
    .order("expense_date", { ascending: false });

  if (req.query.event_id) {
    query = query.eq("event_id", req.query.event_id);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/expenses
router.post("/", async (req, res) => {
  const { event_id, category, description, amount, expense_date, receipt_no } = req.body;

  if (!event_id || !category || !amount) {
    return res.status(400).json({ error: "event_id, category, amount are required" });
  }

  const { data, error } = await supabase
    .from("expenses")
    .insert([{ event_id, category, description, amount, expense_date, receipt_no }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// DELETE /api/expenses/:id
router.delete("/:id", async (req, res) => {
  const { error } = await supabase.from("expenses").delete().eq("id", req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Deleted" });
});

module.exports = router;
