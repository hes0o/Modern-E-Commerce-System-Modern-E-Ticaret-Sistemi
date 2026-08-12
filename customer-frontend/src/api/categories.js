// src/api/categories.js — GET /api/categories, GET /api/categories/{id}
// (Backend'de slug ile arama yok, sadece id.)

import { api } from "./client";

export function getCategories() {
  return api.get("/categories");
}

export function getCategoryById(id) {
  return api.get(`/categories/${id}`);
}
