// src/api/orders.js — SRS §18.7 Sipariş Uçları + §18.12 örnek istek/yanıt

// src/api/orders.js
//
// TODO(backend): app/routers/ içinde HENÜZ bir "orders" router'ı yok —
// order_service.py ve order_state_machine.py servis katmanında hazır ama
// dışarıya HTTP uç noktası olarak açılmamış. Bu yüzden createOrder,
// getMyOrders, getOrderById şu an sadece VITE_USE_MOCK=true modunda
// çalışıyor; backend endpoint'leri eklenene kadar gerçek modda 404 alırsın.

import { api } from "./client";

/**
 * Sipariş oluşturma sözleşmesi (§18.12):
 * request:  { address_id | guest_address, payment_method, customer_note, contract_accepted }
 * response: { order_number, status, grand_total, items }
 *
 * 409 Conflict: stok yetersizse backend errors alanında ürün/varyant id + mevcut
 * stok bilgisini döner — çağıran taraf bunu kullanıcıya göstermekle yükümlü.
 */
export async function createOrder({
  addressId,
  guestAddress,
  paymentMethod,
  customerNote,
  contractAccepted,
}) {
  const payload = {
    address_id: addressId ?? null,
    guest_address: guestAddress ?? null,
    payment_method: paymentMethod, // "cod" | "bank_transfer"
    customer_note: customerNote ?? null,
    contract_accepted: contractAccepted,
  };

  if (import.meta.env.VITE_USE_MOCK === "true") {
    // Backend §7.2'deki sipariş numarası formatını (SP-YYYYMMDD-XXXXX)
    // taklit ederek checkout akışını backend olmadan uçtan uca test
    // edebilmek için. Gerçek backend bağlanınca VITE_USE_MOCK kaldırılır.
    await new Promise((r) => setTimeout(r, 600));
    const rand = Math.floor(10000 + Math.random() * 89999);
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return { order_number: `SP-${datePart}-${rand}`, status: "pending", ...payload };
  }

  return api.post("/orders", payload);
}

export function getMyOrders() {
  return api.get("/orders/me");
}

export function getOrderById(id) {
  return api.get(`/orders/${id}`);
}
