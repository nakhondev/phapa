export interface Event {
  id: string;
  name: string;
  description: string | null;
  target_amount: number;
  event_date: string | null;
  location: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Operator {
  id: string;
  event_id: string;
  name: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface Donation {
  id: string;
  event_id: string;
  donor_name: string;
  donor_phone: string | null;
  amount: number;
  note: string | null;
  donation_type: "cash" | "transfer" | "other";
  is_anonymous: boolean;
  processed_by: string | null;
  created_at: string;
}

export interface Envelope {
  id: string;
  event_id: string;
  route_name: string;
  envelope_no: string;
  donor_name: string | null;
  donor_phone: string | null;
  amount: number;
  payment_type: "cash" | "transfer" | null;
  status: "pending" | "received" | "returned";
  note: string | null;
  processed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Income {
  id: string;
  event_id: string;
  category: string;
  description: string | null;
  amount: number;
  received_date: string;
  receipt_no: string | null;
  processed_by: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  event_id: string;
  category: string;
  description: string | null;
  amount: number;
  expense_date: string;
  receipt_no: string | null;
  processed_by: string | null;
  created_at: string;
}

/** Unified activity item for the public ticker */
export interface ActivityItem {
  id: string;
  type: "donation" | "envelope" | "income" | "expense";
  name: string;
  amount: number;
  detail: string;
  timestamp: string;
}

export interface EventSummary {
  event_id: string;
  event_name: string;
  target_amount: number;
  is_active: boolean;
  total_donated: number;
  total_donors: number;
  total_income: number;
  total_expenses: number;
  total_envelopes: number;
  envelopes_received: number;
  total_envelope_amount: number;
  percent_reached: number;
}
