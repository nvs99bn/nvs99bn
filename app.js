'use strict';
const $ = id => document.getElementById(id);
const storage = {
  read(key, fallback) { try { return localStorage.getItem('sunny.' + key) ?? fallback; } catch { return fallback; } },
  write(key, value) { try { localStorage.setItem('sunny.' + key, value); return true; } catch { return false; } }
};
const zone = $('timezone');
const savedZone = storage.read('zone', 'local');
if ([...zone.options].some(o => o.value === savedZone)) zone.value = savedZone;
function updateClock() {
  const timeZone = zone.value === 'local' ? undefined : zone.value;
  const now = new Date();
  $('clock').textContent = new Intl.DateTimeFormat('en-GB', {hour:'2-digit', minute:'2-digit', second:'2-digit', timeZone}).format(now);
  $('clock').dateTime = now.toISOString();
  $('date').textContent = new Intl.DateTimeFormat('en-GB', {weekday:'long', day:'numeric', month:'long', timeZone}).format(now);
}
zone.addEventListener('change', () => { storage.write('zone', zone.value); updateClock(); });
updateClock(); setInterval(updateClock, 1000);

let duration = 25 * 60, remaining = duration, deadline = null;
function renderTimer() {
  if (deadline !== null) {
    remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    if (remaining === 0) { deadline = null; $('toggle').textContent = 'Start again'; $('timer-status').textContent = 'You’ve reached shore. Take a breath.'; }
  }
  const formatted = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
  $('timer').textContent = formatted;
  document.title = deadline === null ? 'The Sunny — Your quiet corner of the Grand Line' : `${formatted} · Focus aboard the Sunny`;
}
$('toggle').addEventListener('click', () => {
  renderTimer();
  if (deadline !== null) { deadline = null; $('toggle').textContent = 'Resume voyage'; $('timer-status').textContent = 'Anchored for a moment.'; }
  else { if (!remaining) remaining = duration; deadline = Date.now() + remaining * 1000; $('toggle').textContent = 'Pause'; $('timer-status').textContent = 'Steady course. One thing at a time.'; }
  renderTimer();
});
function resetTimer() { deadline = null; remaining = duration; $('toggle').textContent = 'Start voyage'; $('timer-status').textContent = 'One thing at a time. You’ve got this.'; renderTimer(); }
$('reset').addEventListener('click', resetTimer);
document.querySelectorAll('[data-minutes]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-minutes]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  duration = Number(button.dataset.minutes) * 60; resetTimer();
}));
setInterval(renderTimer, 250);
document.addEventListener('visibilitychange', renderTimer);

$('notepad').value = storage.read('notes', '');
$('notepad').addEventListener('input', () => { $('save-status').textContent = storage.write('notes', $('notepad').value) ? 'Saved only in this browser.' : 'Storage unavailable. Export to keep your notes.'; });
$('export').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([$('notepad').value], {type:'text/plain;charset=utf-8'}));
  const a = document.createElement('a'); a.href = url; a.download = 'captains-notes.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
});
const defaults = [
  {name:'GitHub', url:'https://github.com/', detail:'Your development harbor'},
  {name:'GitHub Docs', url:'https://docs.github.com/', detail:'Charts for your next voyage'},
  {name:'MDN Web Docs', url:'https://developer.mozilla.org/', detail:'Explore the web platform'},
  {name:'DevDocs', url:'https://devdocs.io/', detail:'Documentation in one place'}
];
function validURL(value) { try { const u = new URL(value); return ['https:', 'http:'].includes(u.protocol) ? u.href : null; } catch { return null; } }
let custom = [];
try { const parsed = JSON.parse(storage.read('links', '[]')); if (Array.isArray(parsed)) custom = parsed.filter(x => x && typeof x.name === 'string' && typeof x.url === 'string' && validURL(x.url)).slice(0, 100); } catch { /* Ignore invalid stored data. */ }
function renderLinks() {
  $('links').replaceChildren();
  const query = $('search').value.trim().toLowerCase();
  const entries = [...defaults, ...custom.map((x, index) => ({...x, customIndex:index}))];
  entries.filter(x => `${x.name} ${x.url} ${x.detail || ''}`.toLowerCase().includes(query)).forEach(item => {
    const card = document.createElement('div'); card.className = 'link-card';
    const link = document.createElement('a'); link.href = item.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
    const name = document.createElement('strong'); name.textContent = item.name;
    const detail = document.createElement('small'); detail.textContent = item.detail || new URL(item.url).hostname;
    const arrow = document.createElement('span'); arrow.className = 'arrow'; arrow.textContent = '↗'; arrow.setAttribute('aria-hidden','true');
    link.append(name, detail, arrow); card.append(link);
    if (item.customIndex !== undefined) {
      const remove = document.createElement('button'); remove.className = 'remove-link'; remove.textContent = '×'; remove.setAttribute('aria-label', `Remove ${item.name}`);
      remove.addEventListener('click', () => { custom.splice(item.customIndex, 1); storage.write('links', JSON.stringify(custom)); renderLinks(); }); card.append(remove);
    }
    $('links').append(card);
  });
  $('empty').hidden = $('links').childElementCount > 0;
}
$('search').addEventListener('input', renderLinks);
document.addEventListener('keydown', e => { if (e.key === '/' && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName) && !$('link-dialog').open && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); $('search').focus(); } });
$('add-link').addEventListener('click', () => { $('link-error').textContent = ''; $('link-dialog').showModal(); $('link-name').focus(); });
$('cancel-link').addEventListener('click', () => $('link-dialog').close());
$('link-form').addEventListener('submit', e => {
  e.preventDefault(); const name = $('link-name').value.trim(); const url = validURL($('link-url').value.trim());
  if (!name || !url) { $('link-error').textContent = 'Enter a name and an http:// or https:// address.'; return; }
  if (custom.length >= 100) { $('link-error').textContent = 'Your compass is full. Remove a destination first.'; return; }
  const next = [...custom, {name, url}];
  if (!storage.write('links', JSON.stringify(next))) { $('link-error').textContent = 'Browser storage is unavailable. This destination could not be saved.'; return; }
  custom = next; renderLinks(); $('link-form').reset(); $('link-dialog').close();
});
renderLinks();
