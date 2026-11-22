// Consistent hand-authored SVG outline icon set. No emoji and no icon font.
const strokes = {
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21.3l8.8-8.9a5.5 5.5 0 0 0 0-7.8Z"/>',
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  star: '<path d="m12 2 3.1 6.3 7 1-5 4.9 1.2 6.9L12 17.8 5.7 21l1.2-6.8-5-4.9 7-1Z"/>',
  message: '<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5a9 9 0 0 1-.9-4A8.5 8.5 0 0 1 12.5 3 8.5 8.5 0 0 1 21 11.5Z"/><path d="M8 11.5h.01M12.5 11.5h.01M17 11.5h.01"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  inbox: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 14h5l2 3h4l2-3h5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  chart: '<path d="M4 20V10m5 10V4m5 16v-7m5 7V8"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.3 15a1.8 1.8 0 0 0 .4 2l-1.7 1.7a1.8 1.8 0 0 0-2-.4 1.8 1.8 0 0 0-1 1.6H9a1.8 1.8 0 0 0-1-1.6 1.8 1.8 0 0 0-2 .4L4.3 17a1.8 1.8 0 0 0 .4-2 1.8 1.8 0 0 0-1.6-1V10a1.8 1.8 0 0 0 1.6-1 1.8 1.8 0 0 0-.4-2L6 5.3a1.8 1.8 0 0 0 2 .4A1.8 1.8 0 0 0 9 4h6a1.8 1.8 0 0 0 1 1.7 1.8 1.8 0 0 0 2-.4L19.7 7a1.8 1.8 0 0 0-.4 2 1.8 1.8 0 0 0 1.6 1v4a1.8 1.8 0 0 0-1.6 1Z"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 11v6m0-10v.01"/>',
  pencil: '<path d="m15 5 4 4M4 20l4.5-1 11-11a2.8 2.8 0 0 0-4-4l-11 11L4 20Z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  arrow: '<path d="M5 12h14m-7-7 7 7-7 7"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  external: '<path d="M14 4h6v6M10 14 20 4"/><path d="M20 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 7 9-7"/>',
  log: '<path d="M10 4H4v16h6M14 8l4 4-4 4m-8-4h12"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
};
export function icon(name, size=24) {
  return `<svg class="ui-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${strokes[name] || strokes.message}</svg>`;
}
for (const el of document.querySelectorAll('[data-ui-icon]')) {
  const name = el.dataset.uiIcon;
  el.innerHTML = icon(name);
}
