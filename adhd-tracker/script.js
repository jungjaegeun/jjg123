/* ADHD 케어 트래커 — 로컬 프로토타입
 * 데이터는 모두 브라우저 localStorage에 저장됩니다 (실제 배포 시 서버/DB 및 인증으로 교체 필요).
 */

const STORAGE_KEYS = {
  checkins: 'adhd_checkins',
  meds: 'adhd_meds',
  medLogs: 'adhd_medLogs',
  posts: 'adhd_posts',
  nickname: 'adhd_nickname',
  activeTab: 'adhd_active_tab',
};

const CATEGORIES = [
  { id: 'all', label: '전체' },
  { id: 'med', label: '복약 경험' },
  { id: 'work', label: '학업/직장' },
  { id: 'parent', label: '육아' },
  { id: 'free', label: '자유' },
];

// ---------- storage helpers ----------
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ---------- date helpers ----------
function todayStr() {
  return formatDate(new Date());
}
function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function daysAgoStr(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return formatDate(d);
}
function prettyDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${Number(m)}/${Number(d)}`;
}
function timeAgo(ts) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  return `${Math.floor(hr / 24)}일 전`;
}

// ---------- nickname ----------
const ADJ = ['고요한', '조용한', '느긋한', '반짝이는', '씩씩한', '용감한', '차분한', '따뜻한', '든든한', '엉뚱한'];
const ANIMAL = ['다람쥐', '고양이', '수달', '여우', '토끼', '고래', '펭귄', '너구리', '올빼미', '판다'];
function ensureNickname() {
  let nick = load(STORAGE_KEYS.nickname, null);
  if (!nick) {
    nick = ADJ[Math.floor(Math.random() * ADJ.length)] + ANIMAL[Math.floor(Math.random() * ANIMAL.length)] + Math.floor(Math.random() * 900 + 100);
    save(STORAGE_KEYS.nickname, nick);
  }
  return nick;
}

// ---------- toast ----------
let toastTimer = null;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 1800);
}

// ---------- app state ----------
let state = {
  tab: load(STORAGE_KEYS.activeTab, 'checkin'),
  reportRange: 7,
  communityCategory: 'all',
};

function switchTab(tab) {
  state.tab = tab;
  save(STORAGE_KEYS.activeTab, tab);
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  render();
}

function render() {
  const content = document.getElementById('content');
  if (state.tab === 'checkin') content.innerHTML = renderCheckin();
  else if (state.tab === 'meds') content.innerHTML = renderMeds();
  else if (state.tab === 'report') content.innerHTML = renderReport();
  else if (state.tab === 'community') content.innerHTML = renderCommunity();
  updateStreakBadge();
  attachHandlers();
  if (state.tab === 'report') drawChart();
}

// ================= CHECK-IN =================
function getCheckins() {
  return load(STORAGE_KEYS.checkins, []);
}
function getTodayCheckin() {
  return getCheckins().find(c => c.date === todayStr());
}
function computeStreak() {
  const checkins = getCheckins();
  const dates = new Set(checkins.map(c => c.date));
  let streak = 0;
  let cursor = new Date();
  // if today not done yet, streak still counts from yesterday backward
  if (!dates.has(todayStr())) cursor.setDate(cursor.getDate() - 1);
  while (dates.has(formatDate(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
function updateStreakBadge() {
  document.getElementById('streak-badge').textContent = `🔥 ${computeStreak()}일 연속 기록`;
}

function renderCheckin() {
  const existing = getTodayCheckin();
  const v = existing || { focus: 3, impulsivity: 3, mood: 3, sleep: 7, memo: '' };
  const doneBanner = existing ? `<div class="checkin-done">✅ 오늘 체크인을 완료했어요. 필요하면 아래에서 수정할 수 있어요.</div>` : '';

  return `
    <div class="section-title">오늘의 체크인</div>
    ${doneBanner}
    <div class="card">
      <div class="field">
        <label>집중력 <span class="value" id="val-focus">${v.focus}</span></label>
        <input type="range" min="1" max="5" step="1" id="in-focus" value="${v.focus}">
      </div>
      <div class="field">
        <label>충동성 <span class="value" id="val-impulsivity">${v.impulsivity}</span></label>
        <input type="range" min="1" max="5" step="1" id="in-impulsivity" value="${v.impulsivity}">
      </div>
      <div class="field">
        <label>기분 <span class="value" id="val-mood">${v.mood}</span></label>
        <input type="range" min="1" max="5" step="1" id="in-mood" value="${v.mood}">
      </div>
      <div class="field">
        <label>수면 시간 (시간)</label>
        <input type="number" id="in-sleep" min="0" max="14" step="0.5" value="${v.sleep}">
      </div>
      <div class="field" style="margin-bottom:8px;">
        <label>메모 (선택)</label>
        <textarea id="in-memo" placeholder="오늘 특이사항, 있었던 일 등">${v.memo || ''}</textarea>
      </div>
      <button class="btn btn-primary" id="btn-save-checkin">${existing ? '체크인 수정하기' : '체크인 저장하기'}</button>
    </div>
    <div class="subtle">매일 짧게 기록하면 진료 전 리포트에서 패턴을 한눈에 볼 수 있어요.</div>
  `;
}

function saveCheckin() {
  const entry = {
    date: todayStr(),
    focus: Number(document.getElementById('in-focus').value),
    impulsivity: Number(document.getElementById('in-impulsivity').value),
    mood: Number(document.getElementById('in-mood').value),
    sleep: Number(document.getElementById('in-sleep').value),
    memo: document.getElementById('in-memo').value.trim(),
    ts: Date.now(),
  };
  const checkins = getCheckins();
  const idx = checkins.findIndex(c => c.date === entry.date);
  if (idx >= 0) checkins[idx] = entry; else checkins.push(entry);
  save(STORAGE_KEYS.checkins, checkins);
  toast('체크인이 저장되었어요');
  render();
}

// ================= MEDICATIONS =================
function getMeds() {
  return load(STORAGE_KEYS.meds, []);
}
function getMedLogs() {
  return load(STORAGE_KEYS.medLogs, []);
}
function isTaken(medId, date, time) {
  return getMedLogs().some(l => l.medId === medId && l.date === date && l.time === time);
}
function toggleMedTaken(medId, time) {
  const logs = getMedLogs();
  const date = todayStr();
  const idx = logs.findIndex(l => l.medId === medId && l.date === date && l.time === time);
  if (idx >= 0) logs.splice(idx, 1);
  else logs.push({ medId, date, time, ts: Date.now() });
  save(STORAGE_KEYS.medLogs, logs);
  render();
}

function renderMeds() {
  const meds = getMeds();
  const today = todayStr();
  let totalSlots = 0, takenSlots = 0;
  meds.forEach(m => m.times.forEach(t => { totalSlots++; if (isTaken(m.id, today, t)) takenSlots++; }));

  const list = meds.length === 0
    ? `<div class="empty-state">아직 등록된 약이 없어요.<br>아래 버튼으로 복약 정보를 추가해보세요.</div>`
    : meds.map(m => `
        <div>
          <div class="med-info" style="margin-bottom:6px;"><span class="name">${escapeHtml(m.name)}</span>${m.dose ? ` <span class="meta">· ${escapeHtml(m.dose)}</span>` : ''}</div>
          ${m.times.map(t => `
            <div class="med-item">
              <div class="med-info">
                <div class="meta">${t} 복용</div>
              </div>
              <button class="check-circle ${isTaken(m.id, today, t) ? 'taken' : ''}" data-med="${m.id}" data-time="${t}">✓</button>
            </div>
          `).join('')}
          <button class="btn btn-ghost" style="margin:8px 0 14px;" data-remove-med="${m.id}">이 약 삭제</button>
        </div>
      `).join('<div style="height:4px"></div>');

  return `
    <div class="section-title">오늘의 복약</div>
    ${meds.length ? `<div class="stat-grid" style="grid-template-columns:1fr;"><div class="stat-box"><div class="num">${takenSlots}/${totalSlots}</div><div class="lbl">오늘 복용 완료</div></div></div>` : ''}
    <div class="card">
      ${list}
      <button class="btn btn-secondary" id="btn-add-med">+ 복약 추가</button>
    </div>
    <div class="subtle">복약 기록은 진료 시 순응도를 파악하는 데 도움이 됩니다.</div>
  `;
}

function openAddMedModal() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-sheet">
      <div class="modal-title">복약 추가</div>
      <div class="field">
        <label>약 이름</label>
        <input type="text" id="med-name" placeholder="예: 콘서타">
      </div>
      <div class="field">
        <label>용량 (선택)</label>
        <input type="text" id="med-dose" placeholder="예: 18mg">
      </div>
      <div class="field">
        <label>복용 시간</label>
        <div id="med-times">
          <div class="row" style="margin-bottom:8px;">
            <input type="time" class="med-time-input" value="08:00">
          </div>
        </div>
        <button class="btn btn-ghost" id="btn-add-time">+ 시간 추가</button>
      </div>
      <div class="row">
        <button class="btn btn-ghost" id="btn-cancel-med">취소</button>
        <button class="btn btn-primary" id="btn-save-med">저장</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('#btn-add-time').addEventListener('click', () => {
    const row = document.createElement('div');
    row.className = 'row';
    row.style.marginBottom = '8px';
    row.innerHTML = `<input type="time" class="med-time-input" value="08:00">`;
    overlay.querySelector('#med-times').appendChild(row);
  });
  overlay.querySelector('#btn-cancel-med').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  overlay.querySelector('#btn-save-med').addEventListener('click', () => {
    const name = overlay.querySelector('#med-name').value.trim();
    if (!name) { toast('약 이름을 입력해주세요'); return; }
    const dose = overlay.querySelector('#med-dose').value.trim();
    const times = Array.from(overlay.querySelectorAll('.med-time-input')).map(i => i.value).filter(Boolean);
    const meds = getMeds();
    meds.push({ id: uid(), name, dose, times: times.length ? times : ['08:00'] });
    save(STORAGE_KEYS.meds, meds);
    overlay.remove();
    toast('복약 정보가 저장되었어요');
    render();
  });
}

function removeMed(medId) {
  const meds = getMeds().filter(m => m.id !== medId);
  save(STORAGE_KEYS.meds, meds);
  const logs = getMedLogs().filter(l => l.medId !== medId);
  save(STORAGE_KEYS.medLogs, logs);
  render();
}

// ================= REPORT =================
let chartInstance = null;

function renderReport() {
  const range = state.reportRange;
  const checkins = getCheckins()
    .filter(c => c.date >= daysAgoStr(range - 1))
    .sort((a, b) => a.date.localeCompare(b.date));

  const avg = (arr, key) => arr.length ? (arr.reduce((s, c) => s + c[key], 0) / arr.length).toFixed(1) : '-';

  const meds = getMeds();
  const logs = getMedLogs();
  let slotCount = 0, takenCount = 0;
  for (let i = 0; i < range; i++) {
    const d = daysAgoStr(i);
    meds.forEach(m => m.times.forEach(t => {
      slotCount++;
      if (logs.some(l => l.medId === m.id && l.date === d && l.time === t)) takenCount++;
    }));
  }
  const adherence = slotCount ? Math.round((takenCount / slotCount) * 100) : null;

  const memos = checkins.filter(c => c.memo).slice().reverse();

  return `
    <div class="section-title">리포트</div>
    <div class="range-toggle">
      <button data-range="7" class="${range === 7 ? 'active' : ''}">최근 7일</button>
      <button data-range="30" class="${range === 30 ? 'active' : ''}">최근 30일</button>
    </div>

    <div class="stat-grid">
      <div class="stat-box"><div class="num">${avg(checkins, 'focus')}</div><div class="lbl">평균 집중력</div></div>
      <div class="stat-box"><div class="num">${avg(checkins, 'mood')}</div><div class="lbl">평균 기분</div></div>
      <div class="stat-box"><div class="num">${adherence === null ? '-' : adherence + '%'}</div><div class="lbl">복약 준수율</div></div>
    </div>

    <div class="card">
      ${checkins.length ? '<div class="chart-wrap"><canvas id="report-chart"></canvas></div>' : `<div class="empty-state">이 기간에 기록된 체크인이 없어요.<br>체크인 탭에서 오늘 기록을 남겨보세요.</div>`}
    </div>

    ${memos.length ? `
    <div class="card">
      <div style="font-weight:700; margin-bottom:6px;">메모 기록</div>
      <div class="memo-log">
        ${memos.map(m => `<div class="memo-entry"><span class="date">${prettyDate(m.date)}</span>${escapeHtml(m.memo)}</div>`).join('')}
      </div>
    </div>` : ''}

    <button class="btn btn-secondary" id="btn-print" style="margin-bottom:10px;">🖨️ 진료용 리포트 인쇄/저장</button>
    <div class="disclaimer">이 리포트는 자가 기록을 정리한 참고 자료이며 진단 도구가 아닙니다. 실제 진료 및 치료 결정은 반드시 의료진과 상의하세요.</div>
  `;
}

function drawChart() {
  const canvas = document.getElementById('report-chart');
  if (!canvas || typeof Chart === 'undefined') return;
  const range = state.reportRange;
  const checkins = getCheckins()
    .filter(c => c.date >= daysAgoStr(range - 1))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
  chartInstance = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: checkins.map(c => prettyDate(c.date)),
      datasets: [
        { label: '집중력', data: checkins.map(c => c.focus), borderColor: '#5B6EF5', backgroundColor: '#5B6EF5', tension: 0.3 },
        { label: '충동성', data: checkins.map(c => c.impulsivity), borderColor: '#E0554A', backgroundColor: '#E0554A', tension: 0.3 },
        { label: '기분', data: checkins.map(c => c.mood), borderColor: '#33A369', backgroundColor: '#33A369', tension: 0.3 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { min: 1, max: 5, ticks: { stepSize: 1 } } },
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } },
    },
  });
}

// ================= COMMUNITY =================
function seedPostsIfEmpty() {
  const posts = load(STORAGE_KEYS.posts, null);
  if (posts) return;
  const now = Date.now();
  save(STORAGE_KEYS.posts, [
    {
      id: uid(), nickname: '차분한올빼미482', category: 'med', expert: true,
      title: '약 복용 초기에 입맛이 없어요 — 흔한 현상인가요?',
      body: '자극제 계열 약물 복용 초기에는 식욕 저하가 흔히 나타날 수 있어요. 보통 몇 주 내로 완화되는 경우가 많지만, 2주 이상 지속되거나 체중 변화가 크다면 주치의와 용량/시간 조정을 상의해보시길 권해요.',
      createdAt: now - 1000 * 60 * 60 * 5, replies: [],
    },
    {
      id: uid(), nickname: '엉뚱한너구리117', category: 'work', expert: false,
      title: '업무 중 자꾸 딴생각이 들 때 다들 어떻게 하시나요',
      body: '타이머 25분 돌리고 알림 오면 강제로 리셋하는 방법 쓰고 있는데 다른 분들 팁도 궁금해요.',
      createdAt: now - 1000 * 60 * 60 * 20, replies: [
        { nickname: '든든한고래203', body: '할 일을 진짜 작게 쪼개는 게 저는 제일 효과 있었어요.', createdAt: now - 1000 * 60 * 60 * 10 },
      ],
    },
    {
      id: uid(), nickname: '따뜻한여우356', category: 'parent', expert: false,
      title: '아이 숙제 루틴 잡기 너무 힘드네요',
      body: '매번 실랑이하다 지치는데, 비슷한 경험 있으신 분들 어떻게 루틴 만드셨는지 나눠주시면 감사하겠습니다.',
      createdAt: now - 1000 * 60 * 60 * 30, replies: [],
    },
  ]);
}

function getPosts() {
  seedPostsIfEmpty();
  return load(STORAGE_KEYS.posts, []);
}

function renderCommunity() {
  const cat = state.communityCategory;
  const posts = getPosts()
    .filter(p => cat === 'all' || p.category === cat)
    .sort((a, b) => b.createdAt - a.createdAt);

  const catLabel = id => CATEGORIES.find(c => c.id === id)?.label || id;

  return `
    <div class="section-title">커뮤니티</div>
    <div class="disclaimer">이 공간은 비슷한 경험을 나누는 익명 커뮤니티이며, 전문가 모니터링 하에 운영됩니다. 게시글은 의학적 조언을 대체하지 않으며, 위급한 상황에는 반드시 의료진 또는 응급 서비스에 연락하세요.</div>

    <div class="cat-tabs">
      ${CATEGORIES.map(c => `<button data-cat="${c.id}" class="${cat === c.id ? 'active' : ''}">${c.label}</button>`).join('')}
    </div>

    <button class="btn btn-primary" id="btn-new-post" style="margin-bottom:14px;">✏️ 글쓰기 (${ensureNickname()})</button>

    <div class="card">
      ${posts.length === 0 ? `<div class="empty-state">이 카테고리에 아직 글이 없어요.<br>첫 글을 남겨보세요.</div>` :
        posts.map(p => `
          <div class="post" data-open-post="${p.id}">
            <div class="post-head">
              <span>${escapeHtml(p.nickname)}</span>
              <span>·</span>
              <span>${timeAgo(p.createdAt)}</span>
              <span class="badge badge-cat">${catLabel(p.category)}</span>
              ${p.expert ? '<span class="badge badge-expert">전문가 확인</span>' : ''}
            </div>
            <div class="post-title">${escapeHtml(p.title)}</div>
            <div class="post-body">${escapeHtml(p.body).slice(0, 80)}${p.body.length > 80 ? '…' : ''}</div>
            <div class="post-foot">💬 ${p.replies.length}개의 댓글</div>
          </div>
        `).join('')
      }
    </div>
  `;
}

function openNewPostModal() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-sheet">
      <div class="modal-title">글쓰기 · ${ensureNickname()}</div>
      <div class="field">
        <label>카테고리</label>
        <select id="post-cat">
          ${CATEGORIES.filter(c => c.id !== 'all').map(c => `<option value="${c.id}">${c.label}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label>제목</label>
        <input type="text" id="post-title" placeholder="제목을 입력하세요">
      </div>
      <div class="field">
        <label>내용</label>
        <textarea id="post-body" placeholder="경험이나 궁금한 점을 나눠보세요"></textarea>
      </div>
      <div class="row">
        <button class="btn btn-ghost" id="btn-cancel-post">취소</button>
        <button class="btn btn-primary" id="btn-submit-post">등록</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector('#btn-cancel-post').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  overlay.querySelector('#btn-submit-post').addEventListener('click', () => {
    const title = overlay.querySelector('#post-title').value.trim();
    const body = overlay.querySelector('#post-body').value.trim();
    if (!title || !body) { toast('제목과 내용을 입력해주세요'); return; }
    const posts = getPosts();
    posts.push({
      id: uid(), nickname: ensureNickname(), category: overlay.querySelector('#post-cat').value,
      expert: false, title, body, createdAt: Date.now(), replies: [],
    });
    save(STORAGE_KEYS.posts, posts);
    overlay.remove();
    toast('글이 등록되었어요');
    render();
  });
}

function openPostDetail(postId) {
  const posts = getPosts();
  const post = posts.find(p => p.id === postId);
  if (!post) return;
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-sheet">
      <div class="post-head" style="margin-bottom:10px;">
        <span>${escapeHtml(post.nickname)}</span><span>·</span><span>${timeAgo(post.createdAt)}</span>
        ${post.expert ? '<span class="badge badge-expert">전문가 확인</span>' : ''}
      </div>
      <div class="modal-title">${escapeHtml(post.title)}</div>
      <div class="post-body" style="margin-bottom:16px; white-space:pre-wrap;">${escapeHtml(post.body)}</div>
      <div style="font-weight:700; font-size:13px; margin-bottom:8px;">댓글 ${post.replies.length}개</div>
      <div style="margin-bottom:14px;">
        ${post.replies.length === 0 ? '<div class="subtle">아직 댓글이 없어요.</div>' :
          post.replies.map(r => `
            <div class="memo-entry"><span class="date">${escapeHtml(r.nickname)}</span>${escapeHtml(r.body)}</div>
          `).join('')
        }
      </div>
      <div class="field">
        <textarea id="reply-body" placeholder="댓글을 남겨보세요"></textarea>
      </div>
      <div class="row">
        <button class="btn btn-ghost" id="btn-close-post">닫기</button>
        <button class="btn btn-primary" id="btn-submit-reply">댓글 등록</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector('#btn-close-post').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  overlay.querySelector('#btn-submit-reply').addEventListener('click', () => {
    const body = overlay.querySelector('#reply-body').value.trim();
    if (!body) return;
    post.replies.push({ nickname: ensureNickname(), body, createdAt: Date.now() });
    save(STORAGE_KEYS.posts, posts);
    overlay.remove();
    toast('댓글이 등록되었어요');
    render();
  });
}

// ---------- misc ----------
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------- event wiring ----------
function attachHandlers() {
  const content = document.getElementById('content');

  // checkin
  ['focus', 'impulsivity', 'mood'].forEach(key => {
    const input = document.getElementById(`in-${key}`);
    if (input) input.addEventListener('input', () => {
      document.getElementById(`val-${key}`).textContent = input.value;
    });
  });
  const saveBtn = document.getElementById('btn-save-checkin');
  if (saveBtn) saveBtn.addEventListener('click', saveCheckin);

  // meds
  const addMedBtn = document.getElementById('btn-add-med');
  if (addMedBtn) addMedBtn.addEventListener('click', openAddMedModal);
  content.querySelectorAll('[data-med]').forEach(btn => {
    btn.addEventListener('click', () => toggleMedTaken(btn.dataset.med, btn.dataset.time));
  });
  content.querySelectorAll('[data-remove-med]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('이 약 정보를 삭제할까요?')) removeMed(btn.dataset.removeMed);
    });
  });

  // report
  content.querySelectorAll('[data-range]').forEach(btn => {
    btn.addEventListener('click', () => { state.reportRange = Number(btn.dataset.range); render(); });
  });
  const printBtn = document.getElementById('btn-print');
  if (printBtn) printBtn.addEventListener('click', () => window.print());

  // community
  content.querySelectorAll('[data-cat]').forEach(btn => {
    btn.addEventListener('click', () => { state.communityCategory = btn.dataset.cat; render(); });
  });
  const newPostBtn = document.getElementById('btn-new-post');
  if (newPostBtn) newPostBtn.addEventListener('click', openNewPostModal);
  content.querySelectorAll('[data-open-post]').forEach(el => {
    el.addEventListener('click', () => openPostDetail(el.dataset.openPost));
  });
}

// ---------- init ----------
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    if (btn.dataset.tab === state.tab) btn.classList.add('active');
  });
  ensureNickname();
  render();
});
