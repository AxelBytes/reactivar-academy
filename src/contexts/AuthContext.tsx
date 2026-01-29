import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
  id: number;
  email: string;
  name: string;
  role: "admin" | "user";
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Usuarios simulados para testing
const MOCK_USERS = [
  {
    id: 1,
    email: "admin@reactivar.com",
    password: "admin123",
    name: "Administrador",
    role: "admin" as const,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
  },
  {
    id: 2,
    email: "usuario@test.com",
    password: "user123",
    name: "Usuario Demo",
    role: "user" as const,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=User",
  },
];

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(() => {
    // Recuperar sesión guardada al iniciar
    const savedUser = localStorage.getItem("auth_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Guardar usuario en localStorage cuando cambie
  useEffect(() => {
    if (user) {
      localStorage.setItem("auth_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("auth_user");
    }
  }, [user]);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 800));

    const foundUser = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      return { success: true };
    }

    return { success: false, error: "Credenciales incorrectas" };
  };

  const logout = () => {
    setUser(null);
  };

  const register = async (
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; error?: string }> => {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Verificar si el email ya existe
    const existingUser = MOCK_USERS.find((u) => u.email === email);
    if (existingUser) {
      return { success: false, error: "Este email ya está registrado" };
    }

    // En un sistema real, aquí se crearía el usuario en el backend
    // Por ahora, solo simulamos el registro y hacemos login automático
    const newUser: User = {
      id: MOCK_USERS.length + 1,
      email,
      name,
      role: "user",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    };

    setUser(newUser);
    return { success: true };
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
