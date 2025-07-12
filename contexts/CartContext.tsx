import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  id: string;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string | number;
  category: string;
  brand: string;
  ingredients?: string[];
  image_url?: string;
  skin_types?: string[];
  concerns?: string[];
  is_active: boolean;
  stock_quantity: number;
  rating: string | number;
  review_count: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (productId: string, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, newQuantity: number) => void;
  getProductQuantityInCart: (productId: string) => number;
  clearCart: () => void;
  getTotalCartItems: () => number;
  getTotalCartValue: (products: Product[]) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (productId: string, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === productId);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { id: productId, quantity }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === productId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        return prevCart.filter((item) => item.id !== productId);
      }
    });
  };

  const updateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const getProductQuantityInCart = (productId: string): number => {
    const item = cart.find((item) => item.id === productId);
    return item ? item.quantity : 0;
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalCartItems = (): number => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalCartValue = (products: Product[]): string => {
    const total = cart.reduce((sum, cartItem) => {
      const product = products.find((p) => p.id === cartItem.id);
      if (product) {
        const price =
          typeof product.price === 'string'
            ? parseFloat(product.price)
            : product.price;
        return sum + price * cartItem.quantity;
      }
      return sum;
    }, 0);
    return total.toFixed(2);
  };

  const contextValue: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    getProductQuantityInCart,
    clearCart,
    getTotalCartItems,
    getTotalCartValue,
  };

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};
