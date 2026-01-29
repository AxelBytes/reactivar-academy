import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Tipos para productos y cursos
export interface CartProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  type: "product";
  quantity: number;
}

export interface CartCourse {
  id: number;
  title: string;
  price: number;
  image: string;
  instructor: string;
  type: "course";
  quantity: number;
}

export type CartItem = CartProduct | CartCourse;

interface CartContextType {
  items: CartItem[];
  addProduct: (product: Omit<CartProduct, "quantity" | "type">) => void;
  addCourse: (course: Omit<CartCourse, "quantity" | "type">) => void;
  removeItem: (id: number, type: "product" | "course") => void;
  updateQuantity: (id: number, type: "product" | "course", quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  isInCart: (id: number, type: "product" | "course") => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe ser usado dentro de un CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    // Cargar carrito desde localStorage al iniciar
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addProduct = (product: Omit<CartProduct, "quantity" | "type">) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.id === product.id && item.type === "product"
      );

      if (existingItem) {
        // Si ya existe, incrementar cantidad
        return currentItems.map((item) =>
          item.id === product.id && item.type === "product"
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      // Si no existe, agregar nuevo producto
      return [...currentItems, { ...product, type: "product" as const, quantity: 1 }];
    });
  };

  const addCourse = (course: Omit<CartCourse, "quantity" | "type">) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.id === course.id && item.type === "course"
      );

      if (existingItem) {
        // Los cursos no se duplican, solo se mantiene uno
        return currentItems;
      }

      // Agregar curso (cantidad siempre es 1 para cursos)
      return [...currentItems, { ...course, type: "course" as const, quantity: 1 }];
    });
  };

  const removeItem = (id: number, type: "product" | "course") => {
    setItems((currentItems) =>
      currentItems.filter((item) => !(item.id === id && item.type === type))
    );
  };

  const updateQuantity = (id: number, type: "product" | "course", quantity: number) => {
    if (quantity <= 0) {
      removeItem(id, type);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id && item.type === type
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotal = () => {
    return items.reduce((total, item) => {
      const price = item.type === "product" ? item.price : item.price;
      return total + price * item.quantity;
    }, 0);
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const isInCart = (id: number, type: "product" | "course") => {
    return items.some((item) => item.id === id && item.type === type);
  };

  const value: CartContextType = {
    items,
    addProduct,
    addCourse,
    removeItem,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
    isInCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
