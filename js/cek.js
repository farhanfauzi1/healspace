import {
  api,
  initNav,
  setStatus,
  hideStatus,
  $,
  escapeHTML,
  fmtDate,
  renderBubble,
  statusLabel,
} from "./api.js";
initNav();
const form = $("#check-form"),
  status = $("#check-status"),
  detail = $("#story-detail"),
  messages = $("#messages"),
  replyForm = $("#reply-form"),
  replyStatus = $("#reply-status");
let credentials = null;
async function load() {
  const result = await api("read_story", credentials);
  $("#detail-title").textContent = result.story.title || "Ceritamu";
  $("#detail-category").textContent =
    "Dibuat " + fmtDate(result.story.created_at);
  $("#detail-content").textContent = result.story.content;
  $("#detail-status").textContent = statusLabel(result.story.status);
  $("#detail-status").className = "badge " + result.story.status;
  messages.innerHTML = result.messages.length
    ? result.messages.map(renderBubble).join("")
    : '<p class="mini">Belum ada balasan. Silakan cek lagi nanti.</p>';
  messages.scrollTop = messages.scrollHeight;
  replyForm.classList.toggle("hidden", result.story.status === "selesai");
  $("#closed-note").classList.toggle(
    "hidden",
    result.story.status !== "selesai",
  );
  detail.classList.remove("hidden");
}
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideStatus(status);
  credentials = {
    story_id: $("#story-id-input").value.trim(),
    access_code: $("#code-input").value.trim(),
  };
  $("#check-submit").disabled = true;
  try {
    await load();
    detail.scrollIntoView({ behavior: "smooth" });
  } catch (err) {
    credentials = null;
    detail.classList.add("hidden");
    setStatus(status, err.message, "error");
  } finally {
    $("#check-submit").disabled = false;
  }
});
replyForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideStatus(replyStatus);
  if (!credentials) return;
  $("#reply-submit").disabled = true;
  try {
    await api("user_reply", {
      ...credentials,
      message: $("#reply-text").value.trim(),
    });
    $("#reply-text").value = "";
    await load();
    setStatus(replyStatus, "Balasan berhasil dikirim.", "success");
  } catch (err) {
    setStatus(replyStatus, err.message, "error");
  } finally {
    $("#reply-submit").disabled = false;
  }
});
$("#refresh").addEventListener("click", async () => {
  if (credentials)
    try {
      await load();
    } catch (err) {
      setStatus(replyStatus, err.message, "error");
    }
});
