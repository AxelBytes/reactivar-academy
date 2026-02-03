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

// Usuario admin hardcodeado para acceso siempre disponible
const ADMIN_USER = {
  email: "admin@reactivar.com",
  password: "admin123",
  name: "Administrador",
  role: "admin" as const,
};

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
    try {
      // Verificar si es el usuario admin hardcodeado
      if (email === ADMIN_USER.email && password === ADMIN_USER.password) {
        const adminUser: User = {
          id: "admin",
          email: ADMIN_USER.email,
          name: ADMIN_USER.name,
          role: "admin",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
        };
        setUser(adminUser);
        return { success: true };
      }

      // Buscar usuario en Supabase
      const { data: users, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (error || !users) {
        return { success: false, error: "Credenciales incorrectas" };
      }

      // Verificar contraseña
      const passwordMatch = await bcrypt.compare(password, users.password_hash);
      
      if (!passwordMatch) {
        return { success: false, error: "Credenciales incorrectas" };
      }

      // Login exitoso
      const loggedUser: User = {
        id: users.id,
        email: users.email,
        name: users.name || "Usuario",
        dni: users.dni || undefined,
        provincia: users.provincia || undefined,
        localidad: users.localidad || undefined,
        pais: users.pais || undefined,
        role: users.role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${users.name}`,
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
