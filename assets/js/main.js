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
  /* 설문형(임상 척도 + 성향)과 과제형(집중력)을 한 목록으로 합쳐 보여줍니다 */
  const ALL_TESTS = [...SCREENINGS, ...PROFILES, ...TASKS];
  const isTask = t => t.category === 'focus';

  const grid = $('#testGrid');
  const filterBar = $('#testFilter');
  let activeCat = 'all';

  function renderFilter() {
    filterBar.innerHTML = CATEGORIES.map(c => {
      const n = c.id === 'all'
        ? ALL_TESTS.length
        : ALL_TESTS.filter(t => t.category === c.id).length;
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
      ? ALL_TESTS
      : ALL_TESTS.filter(t => t.category === activeCat);

    grid.innerHTML = list.map(t => {
      const prev = saved[t.id];
      const badge = prev
        ? `<p class="test-prev tone-${prev.tone}">지난 결과 · ${prev.level} <span>(${formatDate(prev.date)})</span></p>`
        : '';
      const meta = isTask(t)
        ? `과제형 · 약 ${t.minutes}분`
        : `${t.questions.length}문항 · 약 ${t.minutes}분`;
      return `
        <article class="test-card${isTask(t) ? ' is-task' : ''}">
          <div class="test-top">
            <span class="test-ico" aria-hidden="true">${t.emoji}</span>
            <span class="test-scale">${t.label}</span>
          </div>
          <h3>${t.title}</h3>
          <p class="test-tag">${t.tagline}</p>
          <p class="test-blurb">${t.blurb}</p>
          ${badge}
          <div class="test-foot">
            <span class="test-meta">${meta}</span>
            <button class="btn btn-soft btn-sm" type="button" data-test="${t.id}">
              ${prev ? '다시 하기' : isTask(t) ? '시작하기' : '무료로 검사 시작'}
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
    if (stopTask) { stopTask(); stopTask = null; }   // 과제형 타이머·이벤트 정리
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

  let stopTask = null;   // 과제형 실행 중 정리 함수

  function startTest(id) {
    current = ALL_TESTS.find(t => t.id === id);
    if (!current) return;
    titleEl.textContent = current.title;
    openOverlay();

    if (isTask(current)) {
      kickerEl.textContent = `${current.label} · 과제형`;
      setProgress(0);
      startTask();
      return;
    }

    answers = new Array(current.questions.length).fill(null);
    step = 0;
    kickerEl.textContent = `${current.label} · ${current.questions.length}문항`;
    renderStep();
  }

  /* 집중력 과제: 안내 → 실행 → 결과 */
  function startTask() {
    const t = current;
    bodyEl.innerHTML = `
      <div class="task-intro">
        <span class="task-ico" aria-hidden="true">${t.emoji}</span>
        <h3>${t.title}</h3>
        <p>${t.blurb}</p>
        <ul class="task-tips">
          <li>조용한 곳에서, 방해받지 않는 상태로 해주세요.</li>
          <li>휴대폰보다 <strong>PC나 태블릿</strong>에서 더 정확합니다.</li>
          <li>결과는 규준에 근거한 평가가 아니라 <strong>이 순간의 기록</strong>입니다.</li>
        </ul>
        <button class="btn btn-primary btn-lg" type="button" data-go>시작하기</button>
      </div>`;
    $('[data-go]', bodyEl).addEventListener('click', () => {
      setProgress(0.05);
      stopTask = TASK_RUNNERS[t.id](bodyEl, renderTaskResult);
    });
  }

  function renderTaskResult(r) {
    setProgress(1);
    stopTask = null;
    saveResult(current.id, {
      score: r.headline, max: null, level: r.level, tone: r.tone, date: new Date().toISOString()
    });

    bodyEl.innerHTML = `
      <div class="quiz-result tone-${r.tone}">
        ${quokkaFor(r.tone)}
        <p class="result-kicker">${current.label} 결과</p>
        <div class="result-score"><span class="score-num">${r.headline}</span></div>
        <p class="result-label">${r.sub}</p>
        <p class="result-level">${r.level}</p>
        <div class="task-rows">
          ${r.rows.map(x => `<div class="task-row"><span>${x.label}</span><b>${x.value}</b></div>`).join('')}
        </div>
        <p class="result-advice">${r.note}</p>
        <div class="result-note">
          이 과제는 의학적 검사가 아닙니다. 기기 성능·화면 반응 속도·주변 소음에 따라 결과가 크게 달라집니다.
          실제 인지 기능 평가가 필요하다면 병원에서 시행하는 정식 검사를 받아보세요.
        </div>
        <div class="result-actions">
          <button class="btn btn-primary" type="button" data-retry>다시 하기</button>
          <button class="btn btn-ghost" type="button" data-close>닫기</button>
        </div>
      </div>`;

    $('[data-retry]', bodyEl).addEventListener('click', () => startTest(current.id));
    $('[data-close]', bodyEl).addEventListener('click', closeOverlay);
    renderTestGrid();
    panel.scrollTop = 0;
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
        <div class="quiz-count-row">
          <p class="quiz-count">${step + 1} <span>/ ${total}</span></p>
          ${quokkaTag(step / total > .6 ? 'smile' : 'happy', 'quokka-step')}
        </div>
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
    /* 과제형에는 문항이 없으므로 숫자키 선택을 적용하지 않습니다 */
    if (overlay.hidden || !current || !current.questions || step >= current.questions.length) return;
    const n = Number(e.key);
    if (!n) return;
    const opts = $$('.quiz-opt', bodyEl);
    if (n >= 1 && n <= opts.length) opts[n - 1].click();
  });

  /* 결과 등급에 맞는 숲이 표정 */
  const QUOKKA_FACE = {
    good: 'smile', mild: 'happy', moderate: 'happy',
    high: 'worry', severe: 'worry', neutral: 'wink'
  };

  /* 캐릭터 자리.
     assets/img/quokka-{표정}.png 이 있으면 그 이미지를 쓰고,
     없으면 onerror 가 <img> 를 지워 내장 SVG 그림이 드러납니다.

     단일 파일(dist)로 빌드하면 이미지가 data URI 로 바뀌어
     window.QUOKKA_SRC 에 담겨 오므로, 있으면 그쪽을 먼저 씁니다. */
  const QUOKKA_SRC = window.QUOKKA_SRC || {};
  const quokkaSrc = face => QUOKKA_SRC[face] || `assets/img/quokka-${face}.png`;

  const quokkaTag = (face, cls) => `
    <span class="q-slot ${cls}">
      <img src="${quokkaSrc(face)}" alt="" onerror="this.remove()">
      <svg viewBox="0 0 200 200" aria-hidden="true"><use href="#quokka-${face}"/></svg>
    </span>`;

  const quokkaFor = tone => quokkaTag(QUOKKA_FACE[tone] || 'happy', 'quokka-result');

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

    /* 성격·투자 성향: 차원별 막대 */
    if (test.scoring.type === 'profile') {
      return `
        <p class="result-level">${band.level}</p>
        <div class="subscales is-profile">
          ${result.groups.map(g => `
            <div class="sub-row">
              <span class="sub-name">${g.label}</span>
              <span class="sub-meter"><span style="width:${Math.round((g.score / g.max) * 100)}%"></span></span>
              <span class="sub-score">${g.score}<small>/${g.max}</small></span>
              <span class="sub-level">${g.level.level}</span>
            </div>
            <p class="sub-desc">${g.desc}</p>`).join('')}
        </div>`;
    }

    /* 유형 선택: 상위 유형 카드 + 순위 */
    if (test.scoring.type === 'types') {
      const topN = test.scoring.topN || 1;
      const top = result.ranked.slice(0, topN);
      const code = top.map(t => t.key).join('');
      return `
        <div class="type-card">
          <span class="type-emoji" aria-hidden="true">${result.top.emoji}</span>
          <p class="type-name">${result.top.label}</p>
          ${topN > 1 ? `<p class="type-code">상위 유형 코드 · <b>${code}</b></p>` : ''}
          <p class="type-summary">${result.top.summary}</p>
          <p class="type-advice">${result.top.advice}</p>
        </div>
        <div class="type-rank">
          ${result.ranked.map((t, i) => `
            <div class="rank-row${i < topN ? ' is-top' : ''}">
              <span class="rank-name">${t.emoji} ${t.label}</span>
              <span class="sub-meter"><span style="width:${Math.round((t.score / t.max) * 100)}%"></span></span>
              <span class="sub-score">${t.score}<small>/${t.max}</small></span>
            </div>`).join('')}
        </div>`;
    }

    /* 두 축 조합: 유형 + 축별 막대 */
    if (test.scoring.type === 'axes') {
      return `
        <div class="type-card">
          <p class="type-name">${result.type.label}</p>
          <p class="type-summary">${result.type.summary}</p>
          <p class="type-advice">${result.type.advice}</p>
        </div>
        <div class="subscales is-profile">
          ${result.axes.map(a => `
            <div class="sub-row">
              <span class="sub-name">${a.label}</span>
              <span class="sub-meter"><span style="width:${Math.round((a.score / a.max) * 100)}%"></span></span>
              <span class="sub-score">${a.score}<small>/${a.max}</small></span>
              <span class="sub-level">${a.high ? '높음' : '낮음'}</span>
            </div>
            <p class="sub-desc">${a.desc}</p>`).join('')}
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
        ${quokkaFor(band.tone)}
        <p class="result-kicker">${current.label} 결과</p>
        ${renderScoreBlock(current, result, band)}
        ${text.summary ? `<p class="result-summary">${text.summary}</p>` : ''}
        ${text.advice ? `<p class="result-advice">${text.advice}</p>` : ''}
        ${current.outro ? `<p class="result-outro">${current.outro}</p>` : ''}
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
            ${ALL_TESTS
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
