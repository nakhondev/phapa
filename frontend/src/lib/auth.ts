"use client";

import { createContext, useContext } from "react";

export interface AuthUser {
  id: string;
  email: string;
  display_name: string;
  phone: string | null;
  role: string;
  event_id: string | null;
  is_active: boolean;
  has_profile: boolean;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}
