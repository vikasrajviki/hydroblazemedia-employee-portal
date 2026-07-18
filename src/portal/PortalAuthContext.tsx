import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

type Role = "admin" | "manager" | "employee" | null;

export interface PortalProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  job_title: string | null;
  department: string | null;
  phone: string | null;
  last_active_at: string | null;
}

interface Ctx {
  session: Session | null;
  user: User | null;
  role: Role;
  profile: PortalProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isManager: boolean;
  canManage: boolean;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const PortalAuthContext = createContext<Ctx | undefined>(undefined);

export const PortalAuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [profile, setProfile] = useState<PortalProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRole = async (userId: string | undefined) => {
    if (!userId) return setRole(null);
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (data && data.length > 0) {
      const roles = data.map((r) => r.role as string);
      if (roles.includes("admin")) setRole("admin");
      else if (roles.includes("manager")) setRole("manager");
      else setRole("employee");
    } else {
      setRole(null);
    }
  };

  const loadProfile = async (userId: string | undefined) => {
    if (!userId) return setProfile(null);
    const { data } = await supabase
      .from("profiles")
      .select("id,email,full_name,avatar_url,job_title,department,phone,last_active_at")
      .eq("id", userId)
      .maybeSingle();
    setProfile((data as PortalProfile | null) ?? null);
    // Touch last_active_at (best-effort, don't block).
    supabase.from("profiles").update({ last_active_at: new Date().toISOString() }).eq("id", userId).then();
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setTimeout(() => {
        loadRole(s?.user?.id);
        loadProfile(s?.user?.id);
      }, 0);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      Promise.all([
        loadRole(data.session?.user?.id),
        loadProfile(data.session?.user?.id),
      ]).finally(() => setLoading(false));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value: Ctx = {
    session,
    user: session?.user ?? null,
    role,
    profile,
    loading,
    isAdmin: role === "admin",
    isManager: role === "manager",
    canManage: role === "admin" || role === "manager",
    signOut: async () => {
      await supabase.auth.signOut();
    },
    refreshRole: async () => loadRole(session?.user?.id),
    refreshProfile: async () => loadProfile(session?.user?.id),
  };

  return <PortalAuthContext.Provider value={value}>{children}</PortalAuthContext.Provider>;
};

export const usePortalAuth = () => {
  const ctx = useContext(PortalAuthContext);
  if (!ctx) throw new Error("usePortalAuth outside provider");
  return ctx;
};