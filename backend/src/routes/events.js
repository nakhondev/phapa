const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

// GET /api/events — รายการงานผ้าป่าทั้งหมด
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/events/:id — ดึงงานผ้าป่าตาม ID
router.get("/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
});

// GET /api/events/:id/summary — สรุปยอดบริจาค
router.get("/:id/summary", async (req, res) => {
  const { data, error } = await supabase
    .from("event_summary")
    .select("*")
    .eq("event_id", req.params.id)
    .single();

  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
});

// POST /api/events — สร้างงานผ้าป่าใหม่
router.post("/", async (req, res) => {
  const { name, description, target_amount, event_date, location } = req.body;

  const { data, error } = await supabase
    .from("events")
    .insert([{ name, description, target_amount, event_date, location }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// PUT /api/events/:id — อัพเดทงานผ้าป่า
router.put("/:id", async (req, res) => {
  const { name, description, target_amount, event_date, location, is_active } =
    req.body;

  const { data, error } = await supabase
    .from("events")
    .update({
      name,
      description,
      target_amount,
      event_date,
      location,
      is_active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", req.params.id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

module.exports = router;
