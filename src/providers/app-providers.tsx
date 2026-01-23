// src/providers/app-providers.tsx
"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Session = {
  email: string | null;
  displayName: string | null;
};

type AppContextType = {
  session: Session;
  setSession: (s: Session) => void;
  country: string;
  setCountry: (c: string) => void;
};

const AppContext = createContext<AppContextType | null>(null);

const LS_EMAIL = "sd_email";
const LS_NAME = "sd_name";
const LS_COUNTRY = "sd_country";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<Session>({ email: null, displayName: null });
  const [country, setCountryState] = useState("US");

  useEffect(() => {
    const email = localStorage.getItem(LS_EMAIL);
    const displayName = localStorage.getItem(LS_NAME);
    const savedCountry = localStorage.getItem(LS_COUNTRY);

    setSessionState({ email, displayName });
    if (savedCountry) setCountryState(savedCountry);
  }, []);

  const setSession = (s: Session) => {
    setSessionState(s);
    if (s.email) localStorage.setItem(LS_EMAIL, s.email);
    else localStorage.removeItem(LS_EMAIL);

    if (s.displayName) localStorage.setItem(LS_NAME, s.displayName);
    else localStorage.removeItem(LS_NAME);
  };

  const setCountry = (c: string) => {
    setCountryState(c);
    localStorage.setItem(LS_COUNTRY, c);
  };

  const value = useMemo(() => ({ session, setSession, country, setCountry }), [session, country]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProviders");
  return ctx;
}
