const customerData = [
  { name: 'Carol White', email: 'carol@example.com', phone: '+90 532 111 22 33' },
  { name: 'Eve Davis', email: 'eve@example.com', phone: '+90 541 222 33 44' },
  { name: 'Grace Lee', email: 'grace@example.com', phone: '+90 505 333 44 55' },
  { name: 'Dan Brown', email: 'dan@example.com', phone: '+90 551 444 55 66' },
  { name: 'Henry Wilson', email: 'henry@example.com', phone: '+90 542 555 66 77' },
]

const products = [
  'Wireless Pro Headphones', 'Classic Cotton T-Shirt', 'Smart 4K TV 55"',
  'Running Sneakers Ultra', 'Garden Planter Set', 'Face Serum Glow',
  'Mechanical Keyboard RGB', 'JavaScript Deep Dive', 'Yoga Mat Premium', 'Smart Watch Series X',
]

const shippingCompanies = ['Yurtiçi Kargo', 'Aras Kargo', 'MNG Kargo', 'PTT Kargo', 'Sürat Kargo']

function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function randomPrice() { return parseFloat((Math.random() * 500 + 20).toFixed(2)) }
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
    .toISOString().split('T')[0]
}
function generateTrackingNo() {
  return `TRK${Math.floor(Math.random() * 900000000 + 100000000)}`
}

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

function buildTimeline(status, orderedAt) {
  const allSteps = ['pending', 'processing', 'shipped', 'delivered']
  const cancelledStep = { status: 'cancelled', label: 'İptal Edildi', date: orderedAt }

  if (status === 'cancelled') {
    return [
      { status: 'pending', label: 'Sipariş Alındı', date: orderedAt },
      cancelledStep,
    ]
  }

  const currentIdx = allSteps.indexOf(status)
  const labels = {
    pending: 'Sipariş Alındı',
    processing: 'Hazırlanıyor',
    shipped: 'Kargoya Verildi',
    delivered: 'Teslim Edildi',
  }

  const baseDate = new Date(orderedAt)
  return allSteps.slice(0, currentIdx + 1).map((s, i) => {
    const d = new Date(baseDate)
    d.setDate(d.getDate() + i)
    return { status: s, label: labels[s], date: d.toISOString().split('T')[0] }
  })
}

export const mockOrders = Array.from({ length: 52 }, (_, i) => {
  const customer = randomFrom(customerData)
  const itemCount = Math.floor(Math.random() * 4) + 1
  const items = Array.from({ length: itemCount }, () => ({
    product: randomFrom(products),
    quantity: Math.floor(Math.random() * 3) + 1,
    unitPrice: randomPrice(),
  }))
  const subtotal = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0)
  const tax = parseFloat((subtotal * 0.18).toFixed(2))
  const shipping = subtotal > 500 ? 0 : 39.99
  const total = parseFloat((subtotal + tax + shipping).toFixed(2))
  const status = statuses[Math.floor(Math.random() * statuses.length)]
  const orderedAt = randomDate(new Date('2026-01-01'), new Date('2026-08-05'))
  const shippingCompany = randomFrom(shippingCompanies)
  const trackingNo = generateTrackingNo()

  return {
    id: `ORD-${String(1000 + i + 1).padStart(5, '0')}`,
    customer: customer.name,
    email: customer.email,
    phone: customer.phone,
    status,
    items: items.map(it => ({ ...it, total: parseFloat((it.unitPrice * it.quantity).toFixed(2)) })),
    subtotal: parseFloat(subtotal.toFixed(2)),
    tax,
    shipping,
    total,
    address: `${Math.floor(Math.random() * 9999) + 1} Atatürk Cad., Kadıköy, İstanbul 34710`,
    shippingCompany,
    trackingNo: ['shipped', 'delivered'].includes(status) ? trackingNo : null,
    paymentMethod: Math.random() > 0.5 ? 'Credit Card' : 'PayPal',
    orderedAt,
    updatedAt: orderedAt,
    notes: i % 7 === 0 ? 'Kapıda bırakabilirsiniz.' : '',
    timeline: buildTimeline(status, orderedAt),
  }
}).sort((a, b) => new Date(b.orderedAt) - new Date(a.orderedAt))

// Override first few for predictable demo data
mockOrders[0].status = 'pending'
mockOrders[0].customer = 'Eve Davis'
mockOrders[0].email = 'eve@example.com'
mockOrders[0].phone = '+90 541 222 33 44'
mockOrders[0].orderedAt = '2026-08-05'
mockOrders[0].trackingNo = null
mockOrders[0].timeline = buildTimeline('pending', '2026-08-05')

mockOrders[1].status = 'processing'
mockOrders[1].customer = 'Carol White'
mockOrders[1].email = 'carol@example.com'
mockOrders[1].phone = '+90 532 111 22 33'
mockOrders[1].trackingNo = null
mockOrders[1].timeline = buildTimeline('processing', mockOrders[1].orderedAt)

mockOrders[2].status = 'shipped'
mockOrders[2].shippingCompany = 'Yurtiçi Kargo'
mockOrders[2].trackingNo = 'TRK123456789'
mockOrders[2].timeline = buildTimeline('shipped', mockOrders[2].orderedAt)

mockOrders[3].status = 'delivered'
mockOrders[3].trackingNo = 'TRK987654321'
mockOrders[3].timeline = buildTimeline('delivered', mockOrders[3].orderedAt)

mockOrders[4].status = 'cancelled'
mockOrders[4].trackingNo = null
mockOrders[4].timeline = buildTimeline('cancelled', mockOrders[4].orderedAt)
