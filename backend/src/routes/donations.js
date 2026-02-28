const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

// GET /api/donations?event_id=xxx — รายการบริจาคทั้งหมด (filter by event)
router.get("/", async (req, res) => {
  let query = supabase
    .from("donations")
    .select("*")
    .order("created_at", { ascending: false });

  if (req.query.event_id) {
    query = query.eq("event_id", req.query.event_id);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/donations/recent?event_id=xxx&limit=10 — บริจาคล่าสุด
router.get("/recent", async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  let query = supabase
    .from("donations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (req.query.event_id) {
    query = query.eq("event_id", req.query.event_id);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/donations — เพิ่มรายการบริจาค
router.post("/", async (req, res) => {
  const { event_id, donor_name, donor_phone, amount, note, donation_type, is_anonymous } =
    req.body;

  if (!event_id || !donor_name || !amount) {
    return res.status(400).json({ error: "event_id, donor_name, amount are required" });
  }

  const { data, error } = await supabase
    .from("donations")
    .insert([
      {
        event_id,
        donor_name,
        donor_phone,
        amount,
        note,
        donation_type: donation_type || "cash",
        is_anonymous: is_anonymous || false,
      },
    ])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// DELETE /api/donations/:id — ลบรายการบริจาค
router.delete("/:id", async (req, res) => {
  const { error } = await supabase
    .from("donations")
    .delete()
    .eq("id", req.params.id);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Deleted successfully" });
});

module.exports = router;
