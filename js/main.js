import {initNav,categories,escapeHTML} from './api.js';
import {icon} from './icons.js';
initNav();
const topicList=document.getElementById('topics');
if(topicList){
  const icons=['home','users','star','heart','message'];
  categories().then(rows=>{topicList.innerHTML=rows.map((c,i)=>`<a class="topic-card" href="cerita.html?topic=${c.id}"><span class="iconbox" aria-hidden="true">${icon(icons[i%icons.length],32)}</span><strong>${escapeHTML(c.name)}</strong><small>${escapeHTML(c.description||'Mulai ceritamu di sini')}</small></a>`).join('');}).catch(()=>{topicList.innerHTML='<p class="muted">Kategori belum dapat dimuat. Coba muat ulang halaman.</p>';});
}
