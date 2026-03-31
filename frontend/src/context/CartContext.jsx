import React, { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    // Load cart from localStorage on first render
    try {
      const saved = localStorage.getItem('rkl_cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Persist cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('rkl_cart', JSON.stringify(items))
  }, [items])

  const addItem = (product) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeItem = (productId) => {
    setItems(prev => prev.filter(i => i.id !== productId))
  }

  const updateQty = (productId, qty) => {
    if (qty < 1) return removeItem(productId)
    setItems(prev => prev.map(i => i.id === productId ? { ...i, quantity: qty } : i))
  }

  const clearCart = () => setItems([])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + (parseFloat(i.price) * i.quantity), 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
