import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { cartService } from '@/services/cartService'
import { useAuth } from '@/hooks/useAuth'

export const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true)
      const data = await cartService.getCart()
      setCart(data)
    } catch {
      setCart(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCart()
  }, [fetchCart, user])

  const addItem = useCallback(async (productId, variantId, quantity = 1) => {
    const data = await cartService.addItem(productId, variantId, quantity)
    await fetchCart()
    return data
  }, [fetchCart])

  const updateItem = useCallback(async (itemId, quantity) => {
    await cartService.updateItem(itemId, quantity)
    await fetchCart()
  }, [fetchCart])

  const removeItem = useCallback(async (itemId) => {
    await cartService.removeItem(itemId)
    await fetchCart()
  }, [fetchCart])

  const clearCart = useCallback(async () => {
    await cartService.clearCart()
    await fetchCart()
  }, [fetchCart])

  const itemCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0
  const total = cart?.items?.reduce((sum, i) => sum + (i.unit_price * i.quantity), 0) || 0

  return (
    <CartContext.Provider value={{ cart, loading, itemCount, total, addItem, updateItem, removeItem, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
