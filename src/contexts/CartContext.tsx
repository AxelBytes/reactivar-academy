import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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

export interface CartSaas {
  id: number;
  name: string;
  price: number;
  image: string;
  type: "saas";
  quantity: 1;
  subscriptionMonths: number;
}

export type CartItem = CartProduct | CartCourse | CartSaas;
export type CartItemType = "product" | "course" | "saas";

interface CartContextType {
  items: CartItem[];
  addProduct: (product: Omit<CartProduct, "quantity" | "type">) => void;
  addCourse:  (course:  Omit<CartCourse,  "quantity" | "type">) => void;
  addSaas:    (plan:    Omit<CartSaas,    "quantity" | "type">) => void;
  removeItem:     (id: number, type: CartItemType) => void;
  updateQuantity: (id: number, type: CartItemType, quantity: number) => void;
  clearCart:  () => void;
  getTotal:   () => number;
  getItemCount: () => number;
  isInCart:   (id: number, type: CartItemType) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe ser usado dentro de un CartProvider");
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addProduct = (product: Omit<CartProduct, "quantity" | "type">) => {
    setItems(cur => {
      const existing = cur.find(i => i.id === product.id && i.type === "product");
      if (existing) return cur.map(i => i.id === product.id && i.type === "product" ? { ...i, quantity: i.quantity + 1 } : i);
      return [...cur, { ...product, type: "product" as const, quantity: 1 }];
    });
  };

  const addCourse = (course: Omit<CartCourse, "quantity" | "type">) => {
    setItems(cur => {
      if (cur.find(i => i.id === course.id && i.type === "course")) return cur;
      return [...cur, { ...course, type: "course" as const, quantity: 1 }];
    });
  };

  const addSaas = (plan: Omit<CartSaas, "quantity" | "type">) => {
    setItems(cur => {
      // Reemplazar cualquier plan SaaS anterior (solo 1 plan a la vez)
      const withoutSaas = cur.filter(i => i.type !== "saas");
      return [...withoutSaas, { ...plan, type: "saas" as const, quantity: 1 }];
    });
  };

  const removeItem = (id: number, type: CartItemType) => {
    setItems(cur => cur.filter(i => !(i.id === id && i.type === type)));
  };

  const updateQuantity = (id: number, type: CartItemType, quantity: number) => {
    if (quantity <= 0) { removeItem(id, type); return; }
    setItems(cur => cur.map(i => i.id === id && i.type === type ? { ...i, quantity } : i));
  };

  const clearCart = () => setItems([]);

  const getTotal = () => items.reduce((t, i) => t + i.price * i.quantity, 0);

  const getItemCount = () => items.reduce((c, i) => c + i.quantity, 0);

  const isInCart = (id: number, type: CartItemType) => items.some(i => i.id === id && i.type === type);

  return (
    <CartContext.Provider value={{ items, addProduct, addCourse, addSaas, removeItem, updateQuantity, clearCart, getTotal, getItemCount, isInCart }}>
      {children}
    </CartContext.Provider>
  );
};
