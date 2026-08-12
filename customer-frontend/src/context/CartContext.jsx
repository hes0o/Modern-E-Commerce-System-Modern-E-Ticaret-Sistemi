import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import * as cartApi from "../api/cart";
import { mockProducts } from "../data/mock";

const CartContext = createContext(null);
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// ÖNEMLİ: Gerçek backend'de sepet backend'de tutuluyor (misafir dahil,
// X-Session-Token ile — bkz. api/cart.js), pure localStorage DEĞİL.
// Bu yüzden context iki moda göre çalışıyor:
//   - VITE_USE_MOCK=true  -> local state + mockProducts (backend'siz test)
//   - VITE_USE_MOCK=false -> her mutasyonda gerçek /api/cart çağrısı
//
// Her iki modda da dışarıya AYNI şekli veriyoruz: { lines, itemCount,
// subtotal, addItem, updateQuantity, removeItem, clear, loading }
// böylece CartPage/CheckoutPage/ProductCard hangi modda olduğunu bilmek
// zorunda kalmıyor.

function normalizeMockLines(items) {
  return items
    .map((item) => {
      const product = mockProducts.find((p) => p.id === item.productId);
      if (!product) return null;
      const variant = product.variants.find((v) => v.id === item.variantId);
      const unitPrice = product.discounted_price ?? product.price;
      return {
        itemId: `${item.productId}-${item.variantId}`,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        name: product.name,
        image: product.cover_image,
        variantLabel: variant ? `${variant.color} / ${variant.size}` : "",
        stock: variant?.stock ?? product.stock_total,
        unitPrice,
        lineTotal: unitPrice * item.quantity,
      };
    })
    .filter(Boolean);
}

// Backend CartItemResponse -> normalize edilmiş satır. NOT: backend response'u
// ürün görseli döndürmüyor (CartItemResponse şemasında image alanı yok) —
// bu bir backend eksikliği, placeholder ile gösteriliyor.
function normalizeApiLines(items) {
  return items.map((item) => ({
    itemId: item.id,
    productId: item.product_id,
    variantId: item.variant_id,
    quantity: item.quantity,
    name: item.product_name,
    image: null, // TODO(backend): CartItemResponse'a ürün görseli eklenmeli
    variantLabel: "",
    stock: item.stock,
    unitPrice: item.unit_price,
    lineTotal: item.line_total,
  }));
}

export function CartProvider({ children }) {
  const [mockItems, setMockItems] = useState(() => {
    try {
      const raw = localStorage.getItem("mock_cart");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [apiCart, setApiCart] = useState(null);
  const [loading, setLoading] = useState(!USE_MOCK);

  useEffect(() => {
    if (USE_MOCK) {
      localStorage.setItem("mock_cart", JSON.stringify(mockItems));
    }
  }, [mockItems]);

  const refreshCart = useCallback(async () => {
    if (USE_MOCK) return;
    setLoading(true);
    try {
      const cart = await cartApi.getCart();
      setApiCart(cart);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  async function addItem(productId, variantId, quantity = 1) {
    if (USE_MOCK) {
      setMockItems((prev) => {
        const existing = prev.find((i) => i.productId === productId && i.variantId === variantId);
        if (existing) {
          return prev.map((i) => (i === existing ? { ...i, quantity: i.quantity + quantity } : i));
        }
        return [...prev, { productId, variantId, quantity }];
      });
      return;
    }
    const cart = await cartApi.addToCart({ productId, variantId, quantity });
    setApiCart(cart);
  }

  async function updateQuantity(itemId, quantity) {
    if (USE_MOCK) {
      // mock modda itemId `${productId}-${variantId}` formatında
      const [productId, variantId] = String(itemId).split("-").map(Number);
      setMockItems((prev) =>
        quantity <= 0
          ? prev.filter((i) => !(i.productId === productId && i.variantId === variantId))
          : prev.map((i) =>
              i.productId === productId && i.variantId === variantId ? { ...i, quantity } : i
            )
      );
      return;
    }
    if (quantity <= 0) return removeItem(itemId);
    const cart = await cartApi.updateCartItem(itemId, quantity);
    setApiCart(cart);
  }

  async function removeItem(itemId) {
    if (USE_MOCK) {
      const [productId, variantId] = String(itemId).split("-").map(Number);
      setMockItems((prev) => prev.filter((i) => !(i.productId === productId && i.variantId === variantId)));
      return;
    }
    const cart = await cartApi.removeCartItem(itemId);
    setApiCart(cart);
  }

  async function clear() {
    if (USE_MOCK) {
      setMockItems([]);
      return;
    }
    const cart = await cartApi.clearCart();
    setApiCart(cart);
  }

  const lines = useMemo(
    () => (USE_MOCK ? normalizeMockLines(mockItems) : normalizeApiLines(apiCart?.items || [])),
    [mockItems, apiCart]
  );

  const itemCount = USE_MOCK
    ? lines.reduce((sum, l) => sum + l.quantity, 0)
    : apiCart?.total_quantity ?? 0;
  const subtotal = USE_MOCK
    ? lines.reduce((sum, l) => sum + l.lineTotal, 0)
    : apiCart?.subtotal ?? 0;
  const grandTotal = USE_MOCK ? subtotal : apiCart?.grand_total ?? 0;

  return (
    <CartContext.Provider
      value={{ lines, itemCount, subtotal, grandTotal, loading, addItem, updateQuantity, removeItem, clear, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart, CartProvider içinde kullanılmalı");
  return ctx;
}
