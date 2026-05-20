import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type UserRole = "buyer" | "vendor" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  vendorName?: string;
  createdAt: string;
};

type StoredAccount = AuthUser & { password: string };

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
  register: (data: RegisterData) => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
};

const LS_ACCOUNTS = "formahaus_accounts";
const LS_CURRENT_USER = "formahaus_current_user";
const AuthContext = createContext<AuthContextValue | null>(null);

function getAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(LS_ACCOUNTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(LS_ACCOUNTS, JSON.stringify(accounts));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem(LS_CURRENT_USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem(LS_CURRENT_USER, JSON.stringify(user));
    else localStorage.removeItem(LS_CURRENT_USER);
  }, [user]);

  function register(data: RegisterData) {
    const accounts = getAccounts();
    const exists = accounts.some(a => a.email.toLowerCase() === data.email.toLowerCase());
    if (exists) throw new Error("Користувач з таким email вже існує");

    const account: StoredAccount = {
      id: `user_${Date.now()}`,
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone,
      role: data.role,
      vendorName: data.role === "vendor" ? data.vendorName || data.name : undefined,
      password: data.password,
      createdAt: new Date().toISOString(),
    };

    saveAccounts([account, ...accounts]);
    const { password, ...publicUser } = account;
    setUser(publicUser);
  }

  function login(email: string, password: string) {
    const account = getAccounts().find(a =>
      a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );
    if (!account) return false;
    const { password: _, ...publicUser } = account;
    setUser(publicUser);
    return true;
  }

  function logout() {
    setUser(null);
  }

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoggedIn: Boolean(user),
    isVendor: user?.role === "vendor" || user?.role === "admin",
    register,
    login,
    logout,
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
