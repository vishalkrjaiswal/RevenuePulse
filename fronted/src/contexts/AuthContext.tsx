// frontend/src/contexts/authContext.tsx
import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";
import api, { setAuthToken } from "../api/apiClient";
import LoadingSpinner from "../components/LoadingSpinner";

/* ---------- TYPES ---------- */
interface User {
  // define your user shape here
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

interface AuthContextValue {
  user: User | null;
  auth: AuthState;
  setAuth: Dispatch<SetStateAction<AuthState>>;
  login: (data: { token: string; user: User }) => void; // single object
  logout: () => Promise<void>;
  loading: boolean;
}

/* ---------- CONTEXT ---------- */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/* ---------- PROVIDER ---------- */
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    token: null,
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Restore token from localStorage on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuthToken(token);
      fetchCurrentUser(token);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch user profile with token
  const fetchCurrentUser = async (token: string) => {
    try {
      const { data } = await api.get("/api/auth/profile");
      if (data?.success) {
        setAuth({
          user: data.user,
          isAuthenticated: true,
          token: token,
        });
      } else {
        clearAuth();
      }
    } catch (err) {
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  // Login (called after successful backend login)
  const login = ({ token, user }: { token: string; user: User }) => {
    setAuth({
      user,
      isAuthenticated: true,
      token,
    });
    localStorage.setItem("token", token);
    setAuthToken(token);
  };

  // Clear auth state
  const clearAuth = () => {
    setAuth({ user: null, isAuthenticated: false, token: null });
    localStorage.removeItem("token");
    setAuthToken(undefined);
  };

  // Logout clears cookie + state
  const logout = async () => {
    try {
      await api.post("/api/auth/logout"); // adjust endpoint if needed
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuth();
    }
  };

  if (loading) {
    // Show spinner while checking auth
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-white">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
     <AuthContext.Provider
      value={{
        user: auth.user, // ✅ expose user directly
        auth,
        setAuth,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* ---------- HOOK ---------- */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
