/**
 * Para birimi formatlama (₺ veya $)
 * @param {number} amount
 * @param {string} currency
 * @returns {string}
 */
export const formatCurrency = (amount, currency = 'TRY') =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount)

/**
 * Tarih formatlama
 * @param {string|Date} date
 * @param {object} options
 * @returns {string}
 */
export const formatDate = (date, options = {}) => {
  const defaults = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Intl.DateTimeFormat('tr-TR', { ...defaults, ...options }).format(new Date(date))
}

/**
 * Sayı formatlama
 * @param {number} num
 * @returns {string}
 */
export const formatNumber = (num) =>
  new Intl.NumberFormat('tr-TR').format(num)

/**
 * Metin kısaltma
 * @param {string} str
 * @param {number} max
 * @returns {string}
 */
export const truncate = (str, max = 40) =>
  str && str.length > max ? `${str.slice(0, max)}...` : str

/**
 * İsimden baş harfleri alma
 * @param {string} name
 * @returns {string}
 */
export const getInitials = (name = '') =>
  name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

/**
 * Slug dönüştürücü
 * @param {string} str
 * @returns {string}
 */
export const slugify = (str) =>
  str
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

/**
 * Benzersiz ID üretici
 * @returns {string}
 */
export const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substr(2)

/**
 * Yüzde değişim hesaplama
 * @param {number} current
 * @param {number} previous
 * @returns {number}
 */
export const calcChange = (current, previous) => {
  if (previous === 0) return 100
  return parseFloat(((current - previous) / previous * 100).toFixed(1))
}
