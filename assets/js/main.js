/* =========================================================================
 * 수원숲정신건강의학과 — 인터랙션
 * ========================================================================= */
(function () {
  'use strict';

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* ---------------------------------------------------------------- 테마 */
  const THEME_KEY = 'suwonsup.theme';
  const root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    const btn = $('#themeToggle');
    if (btn) btn.setAttribute('aria-label', theme === 'dark' ? '라이트 모드 전환' : '다크 모드 전환');
  }

  const savedTheme = localStorage.getItem(THEME_KEY);
  applyTheme(savedTheme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

  $('#themeToggle').addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });

  /* ------------------------------------------------------------ 헤더/네비 */
  const header = $('#siteHeader');
  const nav = $('#siteNav');
  const menuBtn = $('#menuToggle');

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  });

  $$('#siteNav a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }));

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* 스크롤 진입 애니메이션 */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
  $$('.section, .cta-band').forEach(el => { el.classList.add('reveal'); io.observe(el); });

  /* ------------------------------------------------------ 자가진단 저장소 */
  const STORE_KEY = 'suwonsup.screening.v1';

  function loadResults() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch (_) { return {}; }
  }

  function saveResult(id, data) {
    const all = loadResults();
    all[id] = data;
    try { localStorage.setItem(STORE_KEY, JSON.stringify(all)); } catch (_) {}
  }

  function clearResults() {
    try { localStorage.removeItem(STORE_KEY); } catch (_) {}
    renderTestGrid();
  }

  function formatDate(iso) {
    const d = new Date(iso);
    return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
  }

  /* --------------------------------------------------------- 카드 그리드 */
  const grid = $('#testGrid');
  const filterBar = $('#testFilter');
  let activeCat = 'all';

  function renderFilter() {
    filterBar.innerHTML = CATEGORIES.map(c => {
      const n = c.id === 'all'
        ? SCREENINGS.length
        : SCREENINGS.filter(t => t.category === c.id).length;
      return `<button type="button" class="filter-chip${c.id === activeCat ? ' is-on' : ''}"
                      data-cat="${c.id}" aria-pressed="${c.id === activeCat}">
                ${c.label} <span>${n}</span>
              </button>`;
    }).join('');
  }

  filterBar.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cat]');
    if (!btn) return;
    activeCat = btn.dataset.cat;
    renderFilter();
    renderTestGrid();
  });

  function renderTestGrid() {
    const saved = loadResults();
    const list = activeCat === 'all'
      ? SCREENINGS
      : SCREENINGS.filter(t => t.category === activeCat);

    grid.innerHTML = list.map(t => {
      const prev = saved[t.id];
      const badge = prev
        ? `<p class="test-prev tone-${prev.tone}">지난 결과 · ${prev.level} <span>(${formatDate(prev.date)})</span></p>`
        : '';
      return `
        <article class="test-card">
          <div class="test-top">
            <span class="test-ico" aria-hidden="true">${t.emoji}</span>
            <span class="test-scale">${t.label}</span>
          </div>
          <h3>${t.title}</h3>
          <p class="test-tag">${t.tagline}</p>
          <p class="test-blurb">${t.blurb}</p>
          ${badge}
          <div class="test-foot">
            <span class="test-meta">${t.questions.length}문항 · 약 ${t.minutes}분</span>
            <button class="btn btn-soft btn-sm" type="button" data-test="${t.id}">
              ${prev ? '다시 검사하기' : '무료로 검사 시작'}
            </button>
          </div>
        </article>`;
    }).join('');
  }

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-test]');
    if (btn) startTest(btn.dataset.test);
  });

  renderFilter();
  renderTestGrid();

  /* ------------------------------------------------------------ 검사 진행 */
  const overlay = $('#quizOverlay');
  const panel = $('.quiz-panel', overlay);
  const bodyEl = $('#quizBody');
  const barEl = $('#quizBar');
  const titleEl = $('#quizTitle');
  const kickerEl = $('#quizKicker');

  let current = null;   // 진행 중인 검사
  let answers = [];     // 응답 배열
  let step = 0;         // 0..n-1 문항, n = 결과
  let lastFocused = null;

  function openOverlay() {
    lastFocused = document.activeElement;
    overlay.hidden = false;
    document.body.classList.add('no-scroll');
    requestAnimationFrame(() => overlay.classList.add('is-open'));
  }

  function closeOverlay() {
    overlay.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    setTimeout(() => { overlay.hidden = true; bodyEl.innerHTML = ''; }, 200);
    current = null;
    if (lastFocused) lastFocused.focus();
  }

  $('#quizClose').addEventListener('click', closeOverlay);
  overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) closeOverlay(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.hidden) closeOverlay();
  });

  function startTest(id) {
    current = SCREENINGS.find(t => t.id === id);
    if (!current) return;
    answers = new Array(current.questions.length).fill(null);
    step = 0;
    titleEl.textContent = current.title;
    kickerEl.textContent = `${current.label} · ${current.questions.length}문항`;
    openOverlay();
    renderStep();
  }

  function setProgress(ratio) {
    barEl.style.width = `${Math.round(ratio * 100)}%`;
  }

  function renderStep() {
    if (step >= current.questions.length) return renderResult();

    const q = questionOf(current, step);
    const total = current.questions.length;
    setProgress(step / total);

    bodyEl.innerHTML = `
      <div class="quiz-step">
        <p class="quiz-prompt">${current.prompt}</p>
        <p class="quiz-count">${step + 1} <span>/ ${total}</span></p>
        <h3 class="quiz-q">${q.text}</h3>
        <div class="quiz-options" role="radiogroup" aria-label="응답 선택">
          ${q.options.map((o, i) => `
            <button type="button" class="quiz-opt${answers[step] === o.value ? ' is-picked' : ''}"
                    data-value="${o.value}" role="radio"
                    aria-checked="${answers[step] === o.value}">
              <span class="opt-key">${i + 1}</span>
              <span class="opt-label">${o.label}${o.desc ? `<em>${o.desc}</em>` : ''}</span>
            </button>`).join('')}
        </div>
        <div class="quiz-nav">
          ${step > 0 ? '<button type="button" class="btn btn-ghost btn-sm" data-back>← 이전 문항</button>' : ''}
        </div>
      </div>`;

    $$('.quiz-opt', bodyEl).forEach(btn => {
      btn.addEventListener('click', () => {
        answers[step] = Number(btn.dataset.value);
        btn.classList.add('is-picked');
        setTimeout(() => { step += 1; renderStep(); }, 180);
      });
    });

    const back = $('[data-back]', bodyEl);
    if (back) back.addEventListener('click', () => { step -= 1; renderStep(); });

    panel.scrollTop = 0;
    const first = $('.quiz-opt', bodyEl);
    if (first) first.focus({ preventScroll: true });
  }

  /* 숫자 키로 응답 선택 */
  document.addEventListener('keydown', (e) => {
    if (overlay.hidden || !current || step >= current.questions.length) return;
    const n = Number(e.key);
    if (!n) return;
    const opts = $$('.quiz-opt', bodyEl);
    if (n >= 1 && n <= opts.length) opts[n - 1].click();
  });

  /* 검사 유형별 점수 표시 영역 */
  function renderScoreBlock(test, result, band) {
    const unit = test.resultUnit || '점';
    const label = test.resultLabel || '총점';

    if (test.scoring.type === 'subscales') {
      return `
        <p class="result-level">${band.level}</p>
        <p class="result-label">가장 높게 나온 영역: ${result.worst.label}</p>
        <div class="subscales">
          ${result.groups.map(g => `
            <div class="sub-row tone-${g.band.tone}">
              <span class="sub-name">${g.label}</span>
              <span class="sub-meter"><span style="width:${Math.round((g.score / g.max) * 100)}%"></span></span>
              <span class="sub-score">${g.score}<small>/${g.max}</small></span>
              <span class="sub-level">${g.band.level}</span>
            </div>`).join('')}
        </div>`;
    }

    if (test.scoring.type === 'mdq') {
      return `
        <p class="mdq-verdict">${result.positive ? '선별 기준 충족' : '선별 기준 미충족'}</p>
        <p class="result-label">해당 증상 ${result.score} / ${result.max}개
          · 같은 시기 발생 ${answers[test.scoring.clusterIndex] === 1 ? '예' : '아니오'}
          · 기능 손상 ${['없음', '경미', '중간', '심각'][answers[test.scoring.impairIndex]]}</p>
        <p class="result-level">${band.level}</p>`;
    }

    const pct = Math.round((result.score / result.max) * 100);
    return `
      <div class="result-score">
        <span class="score-num">${result.score}</span>
        <span class="score-max">/ ${result.max}${unit}</span>
      </div>
      <p class="result-label">${label}</p>
      <p class="result-level">${band.level}</p>
      <div class="result-meter" aria-hidden="true"><span style="width:${pct}%"></span></div>
      <div class="result-bands">
        ${test.bands.map(b => `<span class="rb tone-${b.tone}${b === band ? ' is-here' : ''}">${b.level}</span>`).join('')}
      </div>`;
  }

  function renderResult() {
    setProgress(1);
    const result = scoreScreening(current, answers);
    const band = bandFor(current, result);

    saveResult(current.id, {
      score: result.score, max: result.max,
      level: band.level, tone: band.tone, date: new Date().toISOString()
    });

    const alertItem = current.alertItem;
    const showAlert = alertItem && answers[alertItem.index] > 0;

    /* 하위 척도형은 밴드에 등급만 있으므로 해설을 tone 별 문구에서 가져옵니다 */
    const text = band.summary ? band : (current.toneText || {})[band.tone] || { summary: '', advice: '' };

    bodyEl.innerHTML = `
      <div class="quiz-result tone-${band.tone}">
        <p class="result-kicker">${current.label} 결과</p>
        ${renderScoreBlock(current, result, band)}
        <p class="result-summary">${text.summary}</p>
        <p class="result-advice">${text.advice}</p>
        ${current.footnote ? `<p class="result-footnote">${current.footnote}</p>` : ''}

        ${showAlert ? `
          <div class="result-alert">
            <strong>⚠️ 꼭 확인해 주세요</strong>
            <p>${alertItem.message}</p>
            <p class="alert-lines">자살예방 상담전화 <a href="tel:109">109</a> · 정신건강 위기상담 <a href="tel:1577-0199">1577-0199</a> · 응급 <a href="tel:119">119</a></p>
          </div>` : ''}

        <div class="result-note">
          이 결과는 선별용 참고 자료이며 의학적 진단이 아닙니다. 결과와 관계없이 일상이 힘드시다면 진료를 받아보세요.
          응답은 이 브라우저에만 저장되었습니다.
        </div>

        <div class="result-actions">
          <a class="btn btn-primary" href="tel:031-548-1903">전화로 진료 예약</a>
          <button class="btn btn-soft" type="button" data-retry>다시 검사하기</button>
          <button class="btn btn-ghost" type="button" data-close>닫기</button>
        </div>

        <div class="result-more">
          <p>다른 검사도 해보시겠어요?</p>
          <div class="more-chips">
            ${SCREENINGS
              .filter(t => t.id !== current.id)
              .sort((a, b) => (a.category === current.category ? -1 : 0) - (b.category === current.category ? -1 : 0))
              .slice(0, 5)
              .map(t => `<button type="button" class="chip" data-next="${t.id}">${t.emoji} ${t.title}</button>`)
              .join('')}
          </div>
        </div>

        <button class="result-clear" type="button" data-clear>이 브라우저에 저장된 검사 기록 모두 삭제</button>
      </div>`;

    $('[data-retry]', bodyEl).addEventListener('click', () => startTest(current.id));
    $('[data-close]', bodyEl).addEventListener('click', closeOverlay);
    $$('[data-next]', bodyEl).forEach(b => b.addEventListener('click', () => startTest(b.dataset.next)));
    $('[data-clear]', bodyEl).addEventListener('click', (e) => {
      clearResults();
      e.target.textContent = '검사 기록이 삭제되었습니다';
      e.target.disabled = true;
    });

    renderTestGrid();
    panel.scrollTop = 0;
  }
})();
