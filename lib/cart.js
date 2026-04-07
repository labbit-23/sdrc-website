"use client";

export const CART_STORAGE_KEY = "sdrc_tests_cart_v1";
export const CART_UPDATED_EVENT = "sdrc-cart-updated";

export function readCartItems() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((row) => row && row.id && row.name);
  } catch {
    return [];
  }
}

export function saveCartItems(items) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(Array.isArray(items) ? items : []));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function getCartCount() {
  return readCartItems().length;
}
