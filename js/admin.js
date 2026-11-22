import {
  supabase,
  api,
  $,
  $$,
  escapeHTML,
  fmtDate,
  renderBubble,
  statusLabel,
  setStatus,
  hideStatus,
} from "./api.js";
const authStatus = $("#admin-status"),
  detail = $("#admin-detail");
let storyId = null,
  allCategories = [],
  allStories = [],
  currentView = "dashboard";
const views = [
  "dashboard",
  "stories",
  "history",
  "categories",
  "reports",
  "accounts",
  "detail",
];
const pageText = {
  dashboard: ["Dashboard Admin", "Ringkasan aktivitas cerita di HEAL SPACE"],
  stories: ["Cerita Masuk", "Kelola cerita dan tanggapi pengguna"],
  history: ["Riwayat Cerita", "Lihat cerita yang sudah ditangani"],
  categories: ["Kategori", "Kelola kategori untuk pengguna"],
  reports: ["Laporan", "Statistik dan ringkasan cerita"],
  accounts: ["Manajemen Akun", "Kelola akun administrator HEAL SPACE"],
  detail: ["Detail Cerita", "Percakapan pribadi dengan pengguna"],
};

async function requireAdmin() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    location.replace("/admin");
    return false;
  }
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || user?.app_metadata?.role !== "admin") {
    await supabase.auth.signOut();
    location.replace("/admin");
    return false;
  }
  $("#admin-identity").textContent = user.email || "Administrator";
  return true;
}
async function request(action, payload = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    location.replace("/admin");
    throw Error("Sesi telah berakhir. Silakan login kembali.");
  }
  return api(action, payload, session.access_token);
}
function badge(status) {
  return `<span class="badge ${escapeHTML(status)}">${escapeHTML(statusLabel(status))}</span>`;
}
function categoryName(id) {
  return allCategories.find((c) => c.id === id)?.name || "-";
}
function showView(view) {
  currentView = views.includes(view) ? view : "dashboard";
  for (const v of views) {
    const el = $("#" + (v === "detail" ? "admin-detail" : v + "-view"));
    if (el) el.classList.toggle("hidden", v !== currentView);
  }
  $$(".sidebar-links [data-view]").forEach((a) => {
    const active =
      a.dataset.view === (currentView === "detail" ? "stories" : currentView);
    a.classList.toggle("active", active);
    if (active) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  const [heading, subtitle] = pageText[currentView];
  $(".admin-top h1").textContent = heading;
  $(".admin-top p").textContent = subtitle;
  window.scrollTo({ top: 0, behavior: "instant" });
}
function route() {
  const hash = decodeURIComponent(location.hash.slice(1));
  if (hash.startsWith("detail-")) {
    const id = hash.slice(7);
    if (!/^[a-f0-9-]{36}$/i.test(id)) {
      location.hash = "#stories";
      return;
    }
    showView("detail");
    openStory(id).catch((e) => {
      setStatus(authStatus, e.message, "error");
      location.hash = "#stories";
    });
    return;
  }
  showView(views.includes(hash) ? hash : "dashboard");
  if (hash === "stories" || hash === "history")
    refreshStories().catch((err) =>
      setStatus(authStatus, err.message, "error"),
    );
  if (hash === "categories")
    loadCategories().catch((err) =>
      setStatus($("#category-message"), err.message, "error"),
    );
  if (hash === "reports") renderReports();
  if (hash === "accounts")
    loadAccounts().catch((err) =>
      setStatus($("#account-status"), err.message, "error"),
    );
}
function storyRows(items) {
  if (!items.length)
    return '<tr><td colspan="6" class="muted">Belum ada cerita pada bagian ini.</td></tr>';
  return items
    .map(
      (s) =>
        `<tr><td><strong>CRT-${escapeHTML(s.reference_no)}</strong></td><td>${escapeHTML(s.title || "Cerita anonim")}</td><td>${escapeHTML(categoryName(s.category_id))}</td><td>${badge(s.status)}</td><td>${fmtDate(s.created_at)}</td><td><a class="table-link" href="#detail-${escapeHTML(s.id)}" aria-label="Buka cerita CRT-${escapeHTML(s.reference_no)}">Buka →</a></td></tr>`,
    )
    .join("");
}
function filterStories() {
  const filter = $("#inbox-filter").value;
  const q = $("#admin-search").value.trim().toLowerCase();
  const matches = (s) =>
    !q ||
    [
      `CRT-${s.reference_no}`,
      s.title || "",
      categoryName(s.category_id),
      statusLabel(s.status),
    ].some((v) => v.toLowerCase().includes(q));
  const inbox = allStories.filter(
    (s) => (!filter || s.status === filter) && matches(s),
  );
  $("#inbox-table").innerHTML = storyRows(inbox);
  $("#inbox-count").textContent = `${inbox.length} cerita ditampilkan`;
  $("#history-table").innerHTML = storyRows(
    allStories.filter((s) => s.status !== "baru" && matches(s)),
  );
  $$("#story-table tr").forEach(
    (row) => (row.hidden = !!q && !row.textContent.toLowerCase().includes(q)),
  );
}
async function refreshStories() {
  const d = await request("admin_list");
  allStories = d.stories || [];
  $("#story-table").innerHTML = allStories.length
    ? allStories
        .slice(0, 5)
        .map(
          (s) =>
            `<tr><td><a class="table-link" href="#detail-${escapeHTML(s.id)}">CRT-${escapeHTML(s.reference_no)}</a><div class="mini">${escapeHTML(s.title || "Cerita anonim")}</div></td><td>${escapeHTML(categoryName(s.category_id))}</td><td>${badge(s.status)}</td><td>${fmtDate(s.created_at)}</td></tr>`,
        )
        .join("")
    : '<tr><td colspan="4" class="muted">Belum ada cerita masuk.</td></tr>';
  $("#story-count").textContent = `${d.count || 0} cerita`;
  $("#recent-activity").innerHTML =
    allStories
      .slice(0, 4)
      .map(
        (s) =>
          `<div class="activity-row"><span class="activity-icon">●</span><span><strong>CRT-${escapeHTML(s.reference_no)}</strong> · ${escapeHTML(statusLabel(s.status))}<small>${fmtDate(s.created_at)}</small></span></div>`,
      )
      .join("") || '<p class="mini">Belum ada aktivitas cerita.</p>';
  filterStories();
  renderTrend();
}
async function loadStats() {
  const d = await request("admin_stats");
  for (const id of ["total", "baru", "diproses", "selesai"])
    $("#" + id).textContent = id === "total" ? d.total : d.status[id];
  const palette = ["#3883dd", "#32b1bb", "#ffca62", "#fb8b76", "#a86be2"];
  const total = d.total || 0;
  let angle = 0;
  const portions = allCategories.map((c, i) => {
    const n = d.categories[c.id] || 0;
    const deg = total ? (360 * n) / total : 0;
    const part = `${palette[i % palette.length]} ${angle}deg ${angle + deg}deg`;
    angle += deg;
    return part;
  });
  $("#donut-chart").style.background = total
    ? `conic-gradient(${portions.join(",")})`
    : "#e7eff9";
  $("#donut-total").textContent = total;
  $("#category-chart").innerHTML = allCategories
    .map((c, i) => {
      const n = d.categories[c.id] || 0;
      return `<div class="legend-row"><i style="background:${palette[i % palette.length]}"></i><span>${escapeHTML(c.name)}</span><b>${total ? Math.round((n * 100) / total) : 0}%</b><strong>${n}</strong></div>`;
    })
    .join("");
}
function renderTrend() {
  const days = Array.from({ length: 7 }, (_, i) => {
    const dt = new Date();
    dt.setHours(0, 0, 0, 0);
    dt.setDate(dt.getDate() - (6 - i));
    return dt;
  });
  const vals = days.map(
    (day) =>
      allStories.filter(
        (s) => new Date(s.created_at).toDateString() === day.toDateString(),
      ).length,
  );
  const max = Math.max(1, ...vals);
  const names = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  $("#weekly-chart").innerHTML = days
    .map(
      (day, i) =>
        `<div class="weekly-col"><span class="weekly-value">${vals[i]}</span><div class="weekly-bar" style="height:${Math.max(6, (vals[i] / max) * 145)}px"></div><span class="weekly-name">${names[day.getDay()]}</span></div>`,
    )
    .join("");
}
async function openStory(id) {
  const d = await request("admin_read", { story_id: id });
  storyId = id;
  $("#admin-detail-title").textContent = d.story.title || "Cerita anonim";
  $("#admin-detail-id").textContent = `CRT-${d.story.reference_no}`;
  $("#admin-original").textContent = d.story.content;
  $("#admin-detail-category").textContent = categoryName(d.story.category_id);
  $("#admin-detail-status").value = d.story.status;
  $("#admin-detail-age").textContent =
    d.story.storyteller_age == null
      ? "Tidak diisi"
      : `${d.story.storyteller_age} tahun`;
  $("#admin-detail-gender").textContent =
    { "laki-laki": "Laki-laki", perempuan: "Perempuan", lainnya: "Lainnya" }[
      d.story.storyteller_gender
    ] || "Tidak diisi";
  $("#admin-messages").innerHTML = d.messages?.length
    ? d.messages.map(renderBubble).join("")
    : '<p class="mini">Belum ada pesan balasan.</p>';
  $("#admin-reply-form").classList.toggle(
    "hidden",
    d.story.status === "selesai",
  );
  hideStatus($("#admin-reply-status"));
}
async function loadCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,description,is_active,sort_order")
    .order("sort_order");
  if (error) throw error;
  allCategories = data || [];
  $("#category-list").innerHTML =
    allCategories
      .map(
        (c) =>
          `<div class="category-admin-row"><div><strong>${escapeHTML(c.name)}</strong><p class="mini">${escapeHTML(c.description || "Tanpa deskripsi")} · ${c.is_active ? "Aktif" : "Nonaktif"}</p></div><div class="split"><button type="button" data-category-edit="${c.id}" class="btn btn-outline">Edit</button><button type="button" data-category-toggle="${c.id}" class="btn btn-light">${c.is_active ? "Nonaktifkan" : "Aktifkan"}</button></div></div>`,
      )
      .join("") || '<p class="mini">Belum ada kategori.</p>';
}
function resetCategoryForm() {
  $("#category-form").reset();
  $("#category-edit-id").value = "";
  $("#category-order").value = "10";
  $("#category-form-title").textContent = "Tambah Kategori";
}
$("#category-list").addEventListener("click", async (e) => {
  const edit = e.target.closest("[data-category-edit]");
  const toggle = e.target.closest("[data-category-toggle]");
  if (edit) {
    const c = allCategories.find(
      (x) => x.id === Number(edit.dataset.categoryEdit),
    );
    if (!c) return;
    $("#category-edit-id").value = c.id;
    $("#category-name").value = c.name;
    $("#category-description").value = c.description || "";
    $("#category-order").value = c.sort_order;
    $("#category-active").checked = c.is_active;
    $("#category-form-title").textContent = "Edit Kategori";
    $("#category-name").focus();
  }
  if (toggle) {
    const c = allCategories.find(
      (x) => x.id === Number(toggle.dataset.categoryToggle),
    );
    if (!c) return;
    const { error } = await supabase
      .from("categories")
      .update({ is_active: !c.is_active })
      .eq("id", c.id);
    if (error) setStatus($("#category-message"), error.message, "error");
    else {
      await loadCategories();
      setStatus(
        $("#category-message"),
        "Status kategori diperbarui.",
        "success",
      );
    }
  }
});
$("#category-cancel").addEventListener("click", resetCategoryForm);
$("#category-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = Number($("#category-edit-id").value);
  const payload = {
    name: $("#category-name").value.trim(),
    description: $("#category-description").value.trim() || null,
    sort_order: Number($("#category-order").value) || 0,
    is_active: $("#category-active").checked,
  };
  const q = id
    ? supabase.from("categories").update(payload).eq("id", id)
    : supabase.from("categories").insert(payload);
  const { error } = await q;
  if (error) {
    setStatus($("#category-message"), error.message, "error");
    return;
  }
  resetCategoryForm();
  await loadCategories();
  setStatus($("#category-message"), "Kategori berhasil disimpan.", "success");
});
function renderReports() {
  const count = (s) => allStories.filter((x) => x.status === s).length;
  $("#report-summary").innerHTML = [
    ["Total Cerita", allStories.length],
    ["Baru", count("baru")],
    ["Diproses", count("diproses")],
    ["Selesai", count("selesai")],
  ]
    .map(
      ([label, n]) =>
        `<div class="report-stat"><small>${label}</small><strong>${n}</strong></div>`,
    )
    .join("");
  const max = Math.max(
    1,
    ...allCategories.map(
      (c) => allStories.filter((s) => s.category_id === c.id).length,
    ),
  );
  $("#report-categories").innerHTML = allCategories
    .map((c) => {
      const n = allStories.filter((s) => s.category_id === c.id).length;
      return `<div class="report-line"><span>${escapeHTML(c.name)}</span><div class="report-track"><div style="width:${Math.round((n / max) * 100)}%"></div></div><strong>${n}</strong></div>`;
    })
    .join("");
}
async function loadAccounts() {
  const { accounts = [] } = await request("admin_list_accounts");
  $("#account-list").innerHTML = accounts.length
    ? accounts
        .map(
          (a) =>
            `<div class="account-row"><div class="account-avatar">${escapeHTML((a.full_name || a.email || "A").slice(0, 1).toUpperCase())}</div><div class="account-description"><strong>${escapeHTML(a.full_name)}</strong><div class="mini">${escapeHTML(a.email)}</div><div class="mini">Dibuat: ${fmtDate(a.created_at)}</div></div><span class="badge">Admin</span></div>`,
        )
        .join("")
    : '<p class="mini">Belum ada admin.</p>';
}
$("#accounts-refresh").addEventListener("click", () =>
  loadAccounts().catch((err) =>
    setStatus($("#account-status"), err.message, "error"),
  ),
);
$("#admin-toggle-password").addEventListener("click", () => {
  const field = $("#new-admin-password");
  field.type = field.type === "password" ? "text" : "password";
  $("#admin-toggle-password").textContent =
    field.type === "password" ? "Lihat" : "Sembunyikan";
});
$("#admin-account-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const status = $("#account-status"),
    button = $("#admin-account-submit");
  hideStatus(status);
  const password = $("#new-admin-password").value;
  if (
    password.length < 12 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    setStatus(
      status,
      "Password harus minimal 12 karakter dengan huruf besar, huruf kecil, dan angka.",
      "error",
    );
    return;
  }
  button.disabled = true;
  button.textContent = "Membuat akun...";
  try {
    await request("admin_create_account", {
      full_name: $("#new-admin-name").value.trim(),
      email: $("#new-admin-email").value.trim(),
      password,
    });
    $("#admin-account-form").reset();
    $("#new-admin-password").type = "password";
    $("#admin-toggle-password").textContent = "Lihat";
    setStatus(status, "Akun admin baru berhasil dibuat.", "success");
    await loadAccounts();
  } catch (err) {
    setStatus(status, err.message, "error");
  } finally {
    button.disabled = false;
    button.textContent = "+ Tambah Akun Admin";
  }
});
$("#report-export").addEventListener("click", () => {
  const fields = ["ID", "Kategori", "Status", "Waktu"];
  const rows = allStories.map((s) => [
    `CRT-${s.reference_no}`,
    categoryName(s.category_id),
    statusLabel(s.status),
    s.created_at,
  ]);
  const csv =
    "\uFEFF" +
    [fields, ...rows]
      .map((cols) =>
        cols
          .map((v) => '"' + String(v ?? "").replace(/"/g, '""') + '"')
          .join(","),
      )
      .join("\r\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "laporan-heal-space.csv";
  a.click();
  URL.revokeObjectURL(url);
});
$("#inbox-filter").addEventListener("change", filterStories);
$("#inbox-refresh").addEventListener("click", () =>
  refreshStories().catch((e) => setStatus(authStatus, e.message, "error")),
);
$("#admin-search").addEventListener("input", () => {
  if (currentView !== "stories" && currentView !== "history")
    location.hash = "#stories";
  filterStories();
});
$("#notif-button").addEventListener("click", () => {
  $("#inbox-filter").value = "baru";
  location.hash = "#stories";
  filterStories();
});
$("#filter-status").addEventListener("change", () => {
  $("#inbox-filter").value = $("#filter-status").value;
  location.hash = "#stories";
  filterStories();
});
$("#refresh-admin").addEventListener("click", async () => {
  try {
    await Promise.all([refreshStories(), loadStats()]);
  } catch (err) {
    setStatus(authStatus, err.message, "error");
  }
});
$("#admin-reply-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!storyId) return;
  const button = $("#admin-reply-submit");
  button.disabled = true;
  try {
    await request("admin_reply", {
      story_id: storyId,
      message: $("#admin-reply-text").value.trim(),
    });
    $("#admin-reply-text").value = "";
    await Promise.all([openStory(storyId), refreshStories(), loadStats()]);
    setStatus($("#admin-reply-status"), "Balasan terkirim.", "success");
  } catch (err) {
    setStatus($("#admin-reply-status"), err.message, "error");
  } finally {
    button.disabled = false;
  }
});
$("#status-save").addEventListener("click", async () => {
  if (!storyId) return;
  try {
    await request("admin_status", {
      story_id: storyId,
      status: $("#admin-detail-status").value,
    });
    await Promise.all([openStory(storyId), refreshStories(), loadStats()]);
    setStatus($("#admin-reply-status"), "Status berhasil diubah.", "success");
  } catch (err) {
    setStatus($("#admin-reply-status"), err.message, "error");
  }
});
$("#close-detail").addEventListener(
  "click",
  () => (location.hash = "#stories"),
);
$("#logout").addEventListener("click", async () => {
  await supabase.auth.signOut();
  location.replace("/admin");
});
window.addEventListener("hashchange", route);
(async () => {
  if (!(await requireAdmin())) return;
  try {
    await loadCategories();
    await Promise.all([loadStats(), refreshStories()]);
    route();
  } catch (err) {
    setStatus(
      authStatus,
      "Tidak bisa memuat dashboard: " + err.message,
      "error",
    );
    route();
  }
})();
