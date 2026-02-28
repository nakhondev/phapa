const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

// GET /api/envelopes?event_id=xxx
router.get("/", async (req, res) => {
  let query = supabase
    .from("envelopes")
    .select("*")
    .order("route_name", { ascending: true })
    .order("envelope_no", { ascending: true });

  if (req.query.event_id) {
    query = query.eq("event_id", req.query.event_id);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/envelopes
router.post("/", async (req, res) => {
  const { event_id, route_name, envelope_no, donor_name, donor_phone, amount, status, note } = req.body;

  if (!event_id || !envelope_no) {
    return res.status(400).json({ error: "event_id and envelope_no are required" });
  }

  const { data, error } = await supabase
    .from("envelopes")
    .insert([{ event_id, route_name: route_name || 'ทั่วไป', envelope_no, donor_name, donor_phone, amount, status, note }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// POST /api/envelopes/bulk — create multiple envelopes at once
router.post("/bulk", async (req, res) => {
  const { event_id, route_name, quantity, start_no, prefix } = req.body;

  if (!event_id || !quantity || quantity < 1) {
    return res.status(400).json({ error: "event_id and quantity are required" });
  }

  const startNum = parseInt(start_no) || 1;
  const pfx = prefix || "";
  const rows = [];

  for (let i = 0; i < quantity; i++) {
    const num = startNum + i;
    const envelope_no = pfx + String(num).padStart(3, "0");
    rows.push({
      event_id,
      route_name: route_name || "ทั่วไป",
      envelope_no,
      amount: 0,
      status: "pending",
    });
  }

  const { data, error } = await supabase
    .from("envelopes")
    .insert(rows)
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ created: data.length, envelopes: data });
});

// PUT /api/envelopes/:id
router.put("/:id", async (req, res) => {
  const { route_name, envelope_no, donor_name, donor_phone, amount, payment_type, status, note, processed_by } = req.body;

  const updateData = { updated_at: new Date().toISOString() };
  if (route_name !== undefined) updateData.route_name = route_name;
  if (envelope_no !== undefined) updateData.envelope_no = envelope_no;
  if (donor_name !== undefined) updateData.donor_name = donor_name;
  if (donor_phone !== undefined) updateData.donor_phone = donor_phone;
  if (amount !== undefined) updateData.amount = amount;
  if (payment_type !== undefined) updateData.payment_type = payment_type;
  if (status !== undefined) updateData.status = status;
  if (note !== undefined) updateData.note = note;
  if (processed_by !== undefined) updateData.processed_by = processed_by;

  const { data, error } = await supabase
    .from("envelopes")
    .update(updateData)
    .eq("id", req.params.id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// DELETE /api/envelopes/:id
router.delete("/:id", async (req, res) => {
  const { error } = await supabase.from("envelopes").delete().eq("id", req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Deleted" });
});

module.exports = router;
