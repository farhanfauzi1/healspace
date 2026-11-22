import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, API_URL } from "./config.js";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
export const $ = (s, parent = document) => parent.querySelector(s);
export const $$ = (s, parent = document) =>
  Array.from(parent.querySelectorAll(s));
export const escapeHTML = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export const fmtDate = (d) =>
  d
    ? new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(d))
    : "-";
export const setStatus = (el, msg, type = "info") => {
  if (!el) return;
  el.textContent = msg;
  el.className = "status " + type;
  el.hidden = false;
};
export const hideStatus = (el) => {
  if (el) {
    el.hidden = true;
    el.textContent = "";
  }
};
export const statusLabel = (s) =>
  ({ baru: "Baru", diproses: "Diproses", selesai: "Selesai" })[s] || s || "-";
export async function api(action, payload = {}, token = null) {
  const headers = {
    "Content-Type": "application/json",
    apikey: SUPABASE_PUBLISHABLE_KEY,
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  let res;
  try {
    res = await fetch(API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ action, ...payload }),
    });
  } catch {
    throw new Error(
      "Tidak dapat terhubung ke server. Periksa koneksi internet.",
    );
  }
  let data = {};
  try {
    data = await res.json();
  } catch {}
  if (!res.ok) {
    const msg =
      res.status === 429
        ? "Terlalu banyak percobaan. Tunggu beberapa saat lalu coba kembali."
        : res.status === 500
          ? "Server sedang mengalami kendala. Coba kembali, dan jika berulang hubungi pengelola."
          : data.error || `Permintaan gagal (${res.status})`;
    throw new Error(msg);
  }
  return data;
}
export async function categories() {
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,description")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return data || [];
}
export function initNav() {
  const toggle = $("#nav-toggle"),
    links = $("#navlinks");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      links.classList.toggle("open");
      toggle.setAttribute(
        "aria-expanded",
        String(links.classList.contains("open")),
      );
    });
  }
}
export function renderBubble(m) {
  const isAdmin = m.sender_type === "admin";
  return `<div class="bubble ${isAdmin ? "admin" : ""}"><span class="bubble-label">${isAdmin ? "Admin HEAL SPACE" : "Kamu"}</span>${escapeHTML(m.message)}<span class="bubble-date">${fmtDate(m.created_at)}</span></div>`;
}
