import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import axiosInstance, { setAuthToken } from "@/shared/utils/axios-instance";
import type { AxiosError } from "axios";

type AuthUser = {
  name: string;
  email?: string;
  role: "Guest" | "Researcher";
};

type LoginPayload = {
  identifier: string;
  password: string;
};

type RegisterPayload = {
  username: string;
  email: string;
  password: string;
};

type LoginResponse = {
  token: string;
};

type ProfileResponse = {
  full_name?: string;
  name?: string;
  username?: string;
  email?: string;
};

type AuthContextValue = {
  user: AuthUser;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
};

const GUEST_USER: AuthUser = {
  name: "Guest",
  role: "Guest",
};

const AuthContext = createContext<AuthContextValue | null>(null);

const getDisplayName = (profile: ProfileResponse) => {
  return (
    profile.full_name?.trim() ||
    profile.name?.trim() ||
    profile.username?.trim() ||
    profile.email?.trim() ||
    "Researcher"
  );
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const clearAuthState = () => {
    localStorage.removeItem("token");
    setAuthToken(null);
    setToken(null);
    setUser(GUEST_USER);
  };

  const [user, setUser] = useState<AuthUser>(GUEST_USER);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      setAuthToken(null);
      setIsLoading(false);
      return;
    }

    setToken(storedToken);
    setAuthToken(storedToken);

    axiosInstance
      .get<ProfileResponse>("/auth/profile/")
      .then(({ data }) => {
        setUser({
          name: getDisplayName(data),
          email: data.email,
          role: "Researcher",
        });
      })
      .catch(() => {
        clearAuthState();
      })
      .finally(() => setIsLoading(false));
  }, []);

  const applyAuthWithToken = async (tokenValue: string, fallbackName: string) => {
    localStorage.setItem("token", tokenValue);
    setAuthToken(tokenValue);
    setToken(tokenValue);

    try {
      const profile = await axiosInstance.get<ProfileResponse>("/auth/profile/");
      setUser({
        name: getDisplayName(profile.data),
        email: profile.data.email,
        role: "Researcher",
      });
    } catch {
      setUser({
        name: fallbackName,
        email: fallbackName,
        role: "Researcher",
      });
    }
  };

  const login = async ({ identifier, password }: LoginPayload) => {
    const normalizedIdentifier = identifier.trim();
    let tokenData: LoginResponse | null = null;

    try {
      const emailAttempt = await axiosInstance.post<LoginResponse>("/auth/login/", {
        email: normalizedIdentifier,
        password,
      });
      tokenData = emailAttempt.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status !== 400) {
        throw error;
      }

      const usernameAttempt = await axiosInstance.post<LoginResponse>("/auth/login/", {
        username: normalizedIdentifier,
        password,
      });
      tokenData = usernameAttempt.data;
    }

    await applyAuthWithToken(tokenData.token, normalizedIdentifier);
  };

  const register = async ({ username, email, password }: RegisterPayload) => {
    const { data } = await axiosInstance.post<Partial<LoginResponse>>("/auth/register/", {
      username: username.trim(),
      email: email.trim(),
      password,
    });

    if (data.token) {
      await applyAuthWithToken(data.token, username.trim());
      return;
    }

    await login({ identifier: username.trim(), password });
  };

  const logout = async () => {
    try {
      if (token) {
        await axiosInstance.post("/auth/logout/");
      }
    } finally {
      clearAuthState();
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isLoading,
      login,
      register,
      logout,
    }),
    [isLoading, token, user, register],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
