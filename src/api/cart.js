// src/api/cart.js
//
// ÖNEMLİ FARK: Misafir sepeti localStorage'da DEĞİL, backend'de tutuluyor.
// Backend her kullanıcıyı (giriş yapmış olsun olmasın) bir "session token"
// ile tanıyor — bu token `X-Session-Token` header'ında gönderiliyor.
// Giriş yapmış kullanıcıda Authorization header'ı zaten devrede olduğu için
// backend session_token'ı görmezden gelip kullanıcının kendi sepetini
// kullanıyor (bkz. app/services/cart_service.py mantığı).
//
// Token'ı burada üretip saklıyoruz (client.js:getOrCreateSessionToken).

import { api, getOrCreateSessionToken } from "./client";

function sessionHeaders() {
  return { extraHeaders: { "X-Session-Token": getOrCreateSessionToken() } };
}

export function getCart() {
  return api.get("/cart", sessionHeaders());
}

export function addToCart({ productId, variantId, quantity = 1 }) {
  return api.post(
    "/cart/items",
    { product_id: productId, variant_id: variantId ?? null, quantity },
    sessionHeaders()
  );
}

export function updateCartItem(itemId, quantity) {
  return api.put(`/cart/items/${itemId}`, { quantity }, sessionHeaders());
}

export function removeCartItem(itemId) {
  return api.delete(`/cart/items/${itemId}`, sessionHeaders());
}

export function clearCart() {
  return api.delete("/cart/items", sessionHeaders());
}
