import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export interface User {
  id: string;
  email: string;
  name: string;
  dni?: string;
  provincia?: string;
  localidad?: string;
  pais?: string;
  role: "admin" | "user";
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (email: string, password: string, name: string, dni: string, provincia: string, localidad: string, pais: string) => Promise<{ success: boolean; error?: string }>;
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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("auth_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

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
    try {
      const baseUrl = import.meta.env.DEV ? 'http://localhost:8080' : window.location.origin;

      const response = await fetch(`${baseUrl}/api/auth-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        return { success: false, error: data.error || "Credenciales incorrectas" };
      }

      const loggedUser: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name || "Usuario",
        dni: data.user.dni || undefined,
        provincia: data.user.provincia || undefined,
        localidad: data.user.localidad || undefined,
        pais: data.user.pais || undefined,
        role: data.user.role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.name}`,
      };

      setUser(loggedUser);
      return { success: true };
    } catch (error) {
      console.error("Error en login:", error);
      return { success: false, error: "Error al iniciar sesión. Intentá de nuevo." };
    }
  };

  const logout = () => {
    setUser(null);
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    dni: string,
    provincia: string,
    localidad: string,
    pais: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Verificar si el email ya existe
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      if (existingUser) {
        return { success: false, error: "Este email ya está registrado" };
      }

      // Hashear la contraseña
      const passwordHash = await bcrypt.hash(password, 10);

      // Crear el usuario en Supabase
      const { data: newUserData, error } = await supabase
        .from("users")
        .insert({
          email,
          password_hash: passwordHash,
          name,
          dni,
          provincia,
          localidad,
          pais,
          role: "user",
        })
        .select()
        .single();

      if (error) {
        console.error("Error al registrar usuario:", error);
        return { success: false, error: "Error al crear la cuenta. Intentá de nuevo." };
      }

      // Login automático después del registro
      const newUser: User = {
        id: newUserData.id,
        email: newUserData.email,
        name: newUserData.name || "Usuario",
        dni: newUserData.dni || undefined,
        provincia: newUserData.provincia || undefined,
        localidad: newUserData.localidad || undefined,
        pais: newUserData.pais || undefined,
        role: newUserData.role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUserData.name}`,
      };

      setUser(newUser);
      console.log("Usuario registrado exitosamente:", email);

      return { success: true };
    } catch (error) {
      console.error("Error en registro:", error);
      return { success: false, error: "Error al registrar usuario. Intentá de nuevo." };
    }
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
