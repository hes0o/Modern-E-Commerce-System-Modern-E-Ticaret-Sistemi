import { mockProducts } from './products'

export const mockStock = mockProducts.map(p => ({
  id: p.id,
  productId: p.id,
  productName: p.name,
  sku: p.sku,
  category: p.category,
  currentStock: p.stock,
  minStock: 10,
  maxStock: 200,
  lastRestocked: '2026-07-28',
  supplier: `Supplier ${p.id}`,
  variants: p.variants.map(v => ({
    sku: v.sku,
    color: v.color,
    size: v.size,
    stock: v.stock,
  })),
}))

export const getLowStockItems = () => mockStock.filter(s => s.currentStock <= s.minStock && s.currentStock > 0)
export const getOutOfStockItems = () => mockStock.filter(s => s.currentStock === 0)
