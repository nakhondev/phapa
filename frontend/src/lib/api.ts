import { BACKEND_URL } from "./supabase";
import type { Event, Donation, Envelope, Income, Expense, EventSummary } from "./types";
import type { AuthUser } from "./auth";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BACKEND_URL}${url}`, { headers, ...options });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    fetchJSON<{ user: unknown; session: { access_token: string } }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => fetchJSON<AuthUser>("/api/auth/me"),
  register: (data: {
    email: string;
    password: string;
    display_name: string;
    phone?: string;
    role?: string;
    event_id?: string;
  }) =>
    fetchJSON<AuthUser>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateProfile: (data: Partial<{ display_name: string; phone: string; role: string; event_id: string }>) =>
    fetchJSON<unknown>("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  getTeamMembers: (eventId: string) =>
    fetchJSON<(AuthUser & { email: string })[]>(`/api/auth/users?event_id=${eventId}`),
  deleteTeamMember: (id: string) =>
    fetchJSON<{ message: string }>(`/api/auth/users/${id}`, { method: "DELETE" }),

  // Events
  getEvents: () => fetchJSON<Event[]>("/api/events"),
  getEvent: (id: string) => fetchJSON<Event>(`/api/events/${id}`),
  getEventSummary: (id: string) =>
    fetchJSON<EventSummary>(`/api/events/${id}/summary`),
  createEvent: (data: Partial<Event>) =>
    fetchJSON<Event>("/api/events", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateEvent: (id: string, data: Partial<Event>) =>
    fetchJSON<Event>(`/api/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Donations
  getDonations: (eventId?: string) =>
    fetchJSON<Donation[]>(`/api/donations${eventId ? `?event_id=${eventId}` : ""}`),
  getRecentDonations: (eventId?: string, limit = 10) =>
    fetchJSON<Donation[]>(
      `/api/donations/recent?limit=${limit}${eventId ? `&event_id=${eventId}` : ""}`
    ),
  createDonation: (data: Partial<Donation>) =>
    fetchJSON<Donation>("/api/donations", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteDonation: (id: string) =>
    fetchJSON<{ message: string }>(`/api/donations/${id}`, { method: "DELETE" }),

  // Envelopes
  getEnvelopes: (eventId: string) =>
    fetchJSON<Envelope[]>(`/api/envelopes?event_id=${eventId}`),
  createEnvelope: (data: Partial<Envelope>) =>
    fetchJSON<Envelope>("/api/envelopes", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  createEnvelopesBulk: (data: {
    event_id: string;
    route_name: string;
    quantity: number;
    start_no?: number;
    prefix?: string;
  }) =>
    fetchJSON<{ created: number; envelopes: Envelope[] }>("/api/envelopes/bulk", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateEnvelope: (id: string, data: Partial<Envelope>) =>
    fetchJSON<Envelope>(`/api/envelopes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteEnvelope: (id: string) =>
    fetchJSON<{ message: string }>(`/api/envelopes/${id}`, { method: "DELETE" }),

  // Income
  getIncome: (eventId: string) =>
    fetchJSON<Income[]>(`/api/income?event_id=${eventId}`),
  createIncome: (data: Partial<Income>) =>
    fetchJSON<Income>("/api/income", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteIncome: (id: string) =>
    fetchJSON<{ message: string }>(`/api/income/${id}`, { method: "DELETE" }),

  // Expenses
  getExpenses: (eventId: string) =>
    fetchJSON<Expense[]>(`/api/expenses?event_id=${eventId}`),
  createExpense: (data: Partial<Expense>) =>
    fetchJSON<Expense>("/api/expenses", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteExpense: (id: string) =>
    fetchJSON<{ message: string }>(`/api/expenses/${id}`, { method: "DELETE" }),

};
