import {
  initNav,
  categories,
  api,
  setStatus,
  hideStatus,
  $,
  escapeHTML,
} from "./api.js";
initNav();
const form = $("#story-form"),
  category = $("#category"),
  status = $("#story-status"),
  submit = $("#story-submit"),
  success = $("#story-success");
const params = new URLSearchParams(location.search);
const selected = params.get("topic");
categories()
  .then((rows) => {
    category.innerHTML =
      '<option value="">Pilih kategori cerita</option>' +
      rows
        .map((x) => `<option value="${x.id}">${escapeHTML(x.name)}</option>`)
        .join("");
    if (rows.some((x) => String(x.id) === selected)) category.value = selected;
  })
  .catch(() =>
    setStatus(status, "Kategori gagal dimuat. Coba muat ulang.", "error"),
  );
$("#content").addEventListener("input", () => {
  $("#counter").textContent =
    String($("#content").value.length) + " / 3000 karakter";
});
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideStatus(status);
  if (!$("#privacy").checked) {
    setStatus(
      status,
      "Silakan setujui penjelasan privasi terlebih dahulu.",
      "error",
    );
    return;
  }
  submit.disabled = true;
  submit.textContent = "Mengirim cerita...";
  try {
    const data = await api("create_story", {
      category_id: Number(category.value),
      title: $("#title").value.trim() || null,
      content: $("#content").value.trim(),
      age: $("#story-age").value || null,
      gender: $("#story-gender").value || null,
    });
    $("#story-id").textContent = data.story_id;
    $("#story-code").textContent = data.access_code;
    success.classList.remove("hidden");
    form.classList.add("hidden");
    success.scrollIntoView({ behavior: "smooth", block: "center" });
    $("#copy-access").onclick = async () => {
      const text = `ID Cerita: ${data.story_id}\nKode Akses: ${data.access_code}`;
      try {
        await navigator.clipboard.writeText(text);
        $("#copy-access").textContent = "Berhasil disalin";
      } catch {
        $("#copy-access").textContent = "Salin manual dari kotak di atas";
      }
    };
  } catch (err) {
    setStatus(status, err.message, "error");
  } finally {
    submit.disabled = false;
    submit.textContent = "Kirim Ceritaku";
  }
});
