const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

// GET /api/operators?event_id=xxx
router.get("/", async (req, res) => {
  let query = supabase
    .from("operators")
    .select("*")
    .order("name", { ascending: true });

  if (req.query.event_id) {
    query = query.eq("event_id", req.query.event_id);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/operators
router.post("/", async (req, res) => {
  const { event_id, name, phone, role } = req.body;

  if (!event_id || !name) {
    return res.status(400).json({ error: "event_id and name are required" });
  }

  const { data, error } = await supabase
    .from("operators")
    .insert([{ event_id, name, phone, role: role || "เจ้าหน้าที่" }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// PUT /api/operators/:id
router.put("/:id", async (req, res) => {
  const { name, phone, role, is_active } = req.body;

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone;
  if (role !== undefined) updateData.role = role;
  if (is_active !== undefined) updateData.is_active = is_active;

  const { data, error } = await supabase
    .from("operators")
    .update(updateData)
    .eq("id", req.params.id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// DELETE /api/operators/:id
router.delete("/:id", async (req, res) => {
  const { error } = await supabase.from("operators").delete().eq("id", req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Deleted" });
});

module.exports = router;
