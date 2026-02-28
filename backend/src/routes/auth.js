const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const { createClient } = require("@supabase/supabase-js");

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const anonClient = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  const { data, error } = await anonClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return res.status(401).json({ error: error.message });
  res.json({
    user: data.user,
    session: data.session,
  });
});

// POST /api/auth/logout
router.post("/logout", async (req, res) => {
  res.json({ message: "Logged out" });
});

// GET /api/auth/me — verify token + return profile
router.get("/me", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No token" });

  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError) return res.status(401).json({ error: authError.message });

  // Fetch profile
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", authData.user.id)
    .single();

  res.json({
    id: authData.user.id,
    email: authData.user.email,
    display_name: profile?.display_name || authData.user.email?.split("@")[0] || "Admin",
    phone: profile?.phone || null,
    role: profile?.role || "เจ้าหน้าที่",
    event_id: profile?.event_id || null,
    is_active: profile?.is_active ?? true,
    has_profile: !!profile,
  });
});

// POST /api/auth/register — admin creates a new team member account
router.post("/register", async (req, res) => {
  const { email, password, display_name, phone, role, event_id } = req.body;

  if (!email || !password || !display_name) {
    return res.status(400).json({ error: "email, password, and display_name are required" });
  }

  // Create auth user using admin API
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) return res.status(400).json({ error: authError.message });

  // Create profile
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .insert([{
      id: authData.user.id,
      event_id: event_id || null,
      display_name,
      phone: phone || null,
      role: role || "เจ้าหน้าที่",
    }])
    .select()
    .single();

  if (profileError) return res.status(400).json({ error: profileError.message });

  res.status(201).json({
    id: authData.user.id,
    email: authData.user.email,
    display_name: profile.display_name,
    phone: profile.phone,
    role: profile.role,
    event_id: profile.event_id,
    is_active: profile.is_active,
  });
});

// PUT /api/auth/profile — update own profile
router.put("/profile", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No token" });

  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError) return res.status(401).json({ error: authError.message });

  const { display_name, phone, role, event_id } = req.body;
  const updateData = {};
  if (display_name !== undefined) updateData.display_name = display_name;
  if (phone !== undefined) updateData.phone = phone;
  if (role !== undefined) updateData.role = role;
  if (event_id !== undefined) updateData.event_id = event_id;

  // Upsert profile
  const { data: profile, error } = await supabase
    .from("user_profiles")
    .upsert({ id: authData.user.id, ...updateData })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(profile);
});

// GET /api/auth/users?event_id=xxx — list all team members
router.get("/users", async (req, res) => {
  let query = supabase
    .from("user_profiles")
    .select("*")
    .order("display_name", { ascending: true });

  if (req.query.event_id) {
    query = query.eq("event_id", req.query.event_id);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  // Get emails from auth
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const emailMap = new Map();
  if (authUsers?.users) {
    for (const u of authUsers.users) {
      emailMap.set(u.id, u.email);
    }
  }

  const enriched = data.map((p) => ({
    ...p,
    email: emailMap.get(p.id) || null,
  }));

  res.json(enriched);
});

// DELETE /api/auth/users/:id — delete a team member
router.delete("/users/:id", async (req, res) => {
  const userId = req.params.id;

  // Delete profile
  await supabase.from("user_profiles").delete().eq("id", userId);

  // Delete auth user
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: "Deleted" });
});

module.exports = router;
