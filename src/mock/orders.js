const customers = ['Carol White', 'Eve Davis', 'Grace Lee', 'Dan Brown', 'Henry Wilson']
const products = [
  'Wireless Pro Headphones', 'Classic Cotton T-Shirt', 'Smart 4K TV 55"',
  'Running Sneakers Ultra', 'Garden Planter Set', 'Face Serum Glow',
  'Mechanical Keyboard RGB', 'JavaScript Deep Dive', 'Yoga Mat Premium', 'Smart Watch Series X',
]

function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function randomPrice() { return parseFloat((Math.random() * 500 + 20).toFixed(2)) }
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
    .toISOString().split('T')[0]
}

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export const mockOrders = Array.from({ length: 52 }, (_, i) => {
  const itemCount = Math.floor(Math.random() * 4) + 1
  const items = Array.from({ length: itemCount }, () => ({
    product: randomFrom(products),
    quantity: Math.floor(Math.random() * 3) + 1,
    unitPrice: randomPrice(),
  }))
  const subtotal = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0)
  const tax = parseFloat((subtotal * 0.08).toFixed(2))
  const shipping = subtotal > 100 ? 0 : 9.99
  const total = parseFloat((subtotal + tax + shipping).toFixed(2))
  const status = statuses[Math.floor(Math.random() * statuses.length)]
  const orderedAt = randomDate(new Date('2026-01-01'), new Date('2026-08-05'))

  return {
    id: `ORD-${String(1000 + i + 1).padStart(5, '0')}`,
    customer: randomFrom(customers),
    email: `${randomFrom(customers).toLowerCase().replace(' ', '.')}@example.com`,
    status,
    items: items.map(it => ({ ...it, total: parseFloat((it.unitPrice * it.quantity).toFixed(2)) })),
    subtotal: parseFloat(subtotal.toFixed(2)),
    tax,
    shipping,
    total,
    address: `${Math.floor(Math.random() * 9999) + 1} Main St, Springfield, IL 62701`,
    paymentMethod: Math.random() > 0.5 ? 'Credit Card' : 'PayPal',
    orderedAt,
    updatedAt: orderedAt,
    notes: i % 7 === 0 ? 'Please leave at door.' : '',
  }
}).sort((a, b) => new Date(b.orderedAt) - new Date(a.orderedAt))

// Override first few for predictable demo data
mockOrders[0].status = 'pending'
mockOrders[0].customer = 'Eve Davis'
mockOrders[0].orderedAt = '2026-08-05'
mockOrders[1].status = 'processing'
mockOrders[1].customer = 'Carol White'
mockOrders[2].status = 'shipped'
mockOrders[3].status = 'delivered'
mockOrders[4].status = 'cancelled'
