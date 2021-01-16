import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsStoraged = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (productsStoraged) {
        setProducts(JSON.parse(productsStoraged));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const productAlreadyInCart = products.findIndex(
        productInCart => product.id === productInCart.id,
      );

      if (productAlreadyInCart < 0) {
        const productWithQuantity = {
          ...product,
          quantity: 1,
        };

        const newProducts = [...products, productWithQuantity];

        setProducts(newProducts);
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(newProducts),
        );
      } else {
        const newProducts = products.map(productInCart => {
          if (productInCart.id === product.id) {
            return { ...productInCart, quantity: productInCart.quantity + 1 };
          }

          return productInCart;
        });

        setProducts(newProducts);
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(newProducts),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newProducts = products.map(product => {
        if (product.id === id) {
          return { ...product, quantity: product.quantity + 1 };
        }

        return product;
      });

      setProducts(newProducts);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newProducts = products.map(product => {
        if (product.id === id) {
          return { ...product, quantity: product.quantity - 1 };
        }

        return product;
      });

      const filteredProducts = newProducts.filter(
        product => product.quantity !== 0,
      );

      setProducts(filteredProducts);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(filteredProducts),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
