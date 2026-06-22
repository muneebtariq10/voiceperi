import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";

type User = {
  id: string;
  email: string;
  role: string;
  deactivateTime: string | null;
  [key: string]: any; // still allows extra fields
};

interface DecodedToken {
  sub?: string;
  [key: string]: any;
}

type UserContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_BASE_URL;

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token =
        sessionStorage.getItem("authToken") ||
        localStorage.getItem("authToken");
      if (!token) return;

      try {
        const decoded: DecodedToken = jwtDecode(token);
        if (!decoded.sub) {
          throw new Error("Invalid token structure");
        }

        const response = await fetch(`${API_URL}api/users/${decoded.sub}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("User fetch failed");
        }

        const userData: User = await response.json();
        setUser(userData);
      } catch (err) {
        console.error("UserContext fetch error:", err);
        localStorage.removeItem("authToken");
        sessionStorage.removeItem("authToken");
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const AppUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
