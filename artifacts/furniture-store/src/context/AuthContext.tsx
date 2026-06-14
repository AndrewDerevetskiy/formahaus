import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { supabase } from "../lib/supabase";

export type UserRole = "buyer" | "vendor" | "admin";

export type AuthUser = {
  id: string; // Для продавця це UUID з public.vendors.id
  profileId?: string; // UUID з auth.users / public.profiles.id
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  vendorName?: string;
  createdAt: string;
};

type RegisterData = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
  vendorName?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isVendor: boolean;
  loading: boolean;
  setCurrentUser: (user: AuthUser | null) => void;
  register: (data: RegisterData) => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const LS_CURRENT_USER = "formahaus_current_user";
const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(LS_CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveStoredUser(user: AuthUser | null) {
  if (user) localStorage.setItem(LS_CURRENT_USER, JSON.stringify(user));
  else localStorage.removeItem(LS_CURRENT_USER);
}

async function loadUserFromSupabaseSession(): Promise<AuthUser | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  const authUser = sessionData.session?.user;
  if (!authUser?.id || !authUser.email) return readStoredUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,email,full_name,role")
    .eq("id", authUser.id)
    .maybeSingle();

  const role = (profile?.role as UserRole) || "buyer";

  if (role === "vendor") {
    const { data: vendor } = await supabase
      .from("vendors")
      .select("id,profile_id,company_name")
      .eq("profile_id", authUser.id)
      .maybeSingle();

    if (vendor?.id) {
      return {
        id: String(vendor.id),
        profileId: authUser.id,
        name: String(profile?.full_name || vendor.company_name || authUser.email),
        email: authUser.email,
        role: "vendor",
        vendorName: String(vendor.company_name || profile?.full_name || "Мій магазин"),
        createdAt: authUser.created_at || new Date().toISOString(),
      };
    }
  }

  return {
    id: authUser.id,
    profileId: authUser.id,
    name: String(profile?.full_name || authUser.email),
    email: authUser.email,
    role,
    vendorName: undefined,
    createdAt: authUser.created_at || new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    loadUserFromSupabaseSession()
      .then((loadedUser) => {
        if (!alive) return;
        setUser(loadedUser);
        saveStoredUser(loadedUser);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange(async () => {
      const loadedUser = await loadUserFromSupabaseSession();
      setUser(loadedUser);
      saveStoredUser(loadedUser);
    });

    return () => {
      alive = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  function setCurrentUser(nextUser: AuthUser | null) {
    setUser(nextUser);
    saveStoredUser(nextUser);
  }

  async function register(data: RegisterData) {
    const email = data.email.trim().toLowerCase();
    const name = data.name.trim();
    const role = data.role;
    const vendorName = data.vendorName?.trim() || name;

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password: data.password,
      options: {
        data: {
          full_name: name,
          role,
          vendor_name: role === "vendor" ? vendorName : null,
        },
      },
    });

    if (signUpError) throw signUpError;
    const profileId = authData.user?.id;
    if (!profileId) throw new Error("Supabase не повернув ID користувача");

    await supabase.from("profiles").upsert({
      id: profileId,
      email,
      full_name: name,
      role,
    });

    if (role === "vendor") {
      const { data: vendor, error: vendorError } = await supabase
        .from("vendors")
        .upsert({ profile_id: profileId, company_name: vendorName }, { onConflict: "profile_id" })
        .select("id,profile_id,company_name")
        .single();

      if (vendorError) throw vendorError;

      setCurrentUser({
        id: String(vendor.id),
        profileId,
        name,
        email,
        role: "vendor",
        vendorName: String(vendor.company_name || vendorName),
        createdAt: new Date().toISOString(),
      });
      return;
    }

    setCurrentUser({
      id: profileId,
      profileId,
      name,
      email,
      role,
      createdAt: new Date().toISOString(),
    });
  }

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) return false;

    const loadedUser = await loadUserFromSupabaseSession();
    setCurrentUser(loadedUser);
    return Boolean(loadedUser);
  }

  async function logout() {
    await supabase.auth.signOut();
    setCurrentUser(null);
  }

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoggedIn: Boolean(user),
    isVendor: user?.role === "vendor" || user?.role === "admin",
    loading,
    setCurrentUser,
    register,
    login,
    logout,
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
