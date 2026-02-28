const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

// GET /api/income?event_id=xxx
router.get("/", async (req, res) => {
  let query = supabase
    .from("income")
    .select("*")
    .order("received_date", { ascending: false });

  if (req.query.event_id) {
    query = query.eq("event_id", req.query.event_id);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/income
router.post("/", async (req, res) => {
  const { event_id, category, description, amount, received_date, receipt_no } = req.body;

  if (!event_id || !category || !amount) {
    return res.status(400).json({ error: "event_id, category, amount are required" });
  }

  const { data, error } = await supabase
    .from("income")
    .insert([{ event_id, category, description, amount, received_date, receipt_no }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// DELETE /api/income/:id
router.delete("/:id", async (req, res) => {
  const { error } = await supabase.from("income").delete().eq("id", req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Deleted" });
});

module.exports = router;
