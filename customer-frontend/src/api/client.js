// src/api/client.js
//
// Tüm API çağrıları buradan geçer. Backend hazır olmadığında
// VITE_USE_MOCK=true ile mock data'ya (src/data/mock.js) düşer,
// backend API'ye bağlanırken tek satır .env değişikliği yeterli olur.
//
// SÖZLEŞME NOTU: Backend'in gerçek kodu (feature/backend-api branch)
// okunarak doğrulandı: her response ApiResponse[T] zarfında dönüyor:
//   { success: bool, data: T | null, message: str | null, errors: ErrorDetail[] }
// Bu katman zarfı burada açar (unwrap), geri kalan kod sadece `data`yı görür.

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

function getToken() {
  return localStorage.getItem("access_token");
}

// Misafir sepeti backend'de tutulduğu için (bkz. cart.js) her kullanıcıya
// (giriş yapmamış olsa bile) sabit bir session token üretip saklıyoruz.
export function getOrCreateSessionToken() {
  let token = localStorage.getItem("guest_session_token");
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem("guest_session_token", token);
  }
  return token;
}

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors; // ErrorDetail[]: [{ field, message }]
  }
}

async function request(path, { method = "GET", body, auth = true, extraHeaders = {} } = {}) {
  const headers = { "Content-Type": "application/json", ...extraHeaders };
  const token = getToken();
  if (auth && token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    // boş/parse edilemeyen gövde
  }

  if (!res.ok || payload?.success === false) {
    throw new ApiError(
      payload?.message || `İstek başarısız oldu (${res.status})`,
      res.status,
      payload?.errors || []
    );
  }

  // ApiResponse zarfını aç — component'ler sadece `data`yı görür.
  return payload?.data ?? null;
}

export const api = {
  get: (path, opts = {}) => request(path, { method: "GET", ...opts }),
  post: (path, body, opts = {}) => request(path, { method: "POST", body, ...opts }),
  put: (path, body, opts = {}) => request(path, { method: "PUT", body, ...opts }),
  delete: (path, opts = {}) => request(path, { method: "DELETE", ...opts }),
};

