// src/api/customer.js
//
// Backend'de adresler ve favoriler /customers/me/... altında DEĞİL,
// doğrudan /api/addresses ve /api/favorites altında (kullanıcı JWT'den
// çözülüyor, ayrıca "me" segmentine gerek yok).
//
// ÖNEMLİ EKSİK: Profil güncelleme (isim/email/telefon) ve şifre değiştirme
// için backend'de HİÇ uç nokta yok (app/routers/ içinde böyle bir router
// bulunmuyor). ProfilePage şu an bu fonksiyonları çağırıyor ama backend
// hazır olana kadar bunlar 404 dönecek — backend ekibiyle konuşulmalı.

import { api } from "./client";

export function updateProfile() {
  return Promise.reject(new Error("Backend'de profil güncelleme uç noktası henüz yok."));
}

export function changePassword() {
  return Promise.reject(new Error("Backend'de şifre değiştirme uç noktası henüz yok."));
}

export function getAddresses() {
  return api.get("/addresses");
}

// Backend alan adları: title, recipient_name, phone, city, district,
// full_address, postal_code, is_default
export function createAddress(address) {
  return api.post("/addresses", address);
}

export function updateAddress(id, address) {
  return api.put(`/addresses/${id}`, address);
}

export function deleteAddress(id) {
  return api.delete(`/addresses/${id}`);
}

export function getFavorites() {
  return api.get("/favorites");
}

export function addFavorite(productId) {
  return api.post("/favorites", { product_id: productId });
}

export function removeFavorite(productId) {
  return api.delete(`/favorites/${productId}`);
}
