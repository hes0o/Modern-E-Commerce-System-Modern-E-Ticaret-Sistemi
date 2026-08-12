// src/api/products.js
//
// Backend gerçek uç noktaları (app/routers/products.py):
//   GET /api/products?page=&page_size=&search=&category_id=
//   GET /api/products/{id}
// ÖNEMLİ: Backend'de SLUG İLE ARAMA YOK, sadece sayısal id ile. Fiyat aralığı,
// marka, renk/beden gibi filtre parametreleri de backend'de henüz
// desteklenmiyor (query'de kabul edilmiyor) — bu filtreler şu an sadece
// frontend'de mock veri üzerinde simüle ediliyor, backend'e eklenmesi
// gerekiyor (bkz. hooks/useProductQuery.js).

import { api } from "./client";

export function getProducts({ page = 1, pageSize = 20, search, categoryId } = {}) {
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("page_size", pageSize);
  if (search) params.set("search", search);
  if (categoryId) params.set("category_id", categoryId);
  return api.get(`/products?${params.toString()}`);
}

export function getProductById(id) {
  return api.get(`/products/${id}`);
}
