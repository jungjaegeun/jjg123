/* =========================================================================
 * 수원숲 정신건강의학과 — 집중력 과제
 *
 * 설문이 아니라 반응 시간과 정확도를 직접 재는 과제입니다.
 * 실행부는 main.js 가 아니라 이 파일이 담당합니다 (runTask).
 *
 * 결과는 참고용 기록일 뿐 규준(norm)에 근거한 평가가 아닙니다.
 * 화면·기기·인터넷 환경에 따라 수십 ms 차이는 쉽게 생깁니다.
 * ========================================================================= */

const TASKS = [
  {
    id: 'reaction',
    category: 'focus',
    emoji: '⚡',
    title: '반응 속도 테스트',
    label: '반응 시간',
    tagline: '화면이 바뀌면 바로 누르기',
    blurb: '초록색으로 바뀌는 순간 최대한 빨리 누릅니다. 5회 평균으로 단순 반응 속도를 잽니다.',
    minutes: 1,
    trials: 5
  },
  {
    id: 'stroop',
    category: 'focus',
    emoji: '🎨',
    title: '스트룹 검사',
    label: '간섭 억제',
    tagline: '글자 말고 글자 색을 고르기',
    blurb: '“파랑”이라고 쓰인 빨간 글자처럼, 읽으려는 습관을 참고 색을 골라야 합니다. 주의 조절 능력을 봅니다.',
    minutes: 2,
    trials: 20
  },
  {
    id: 'digitspan',
    category: 'focus',
    emoji: '🔢',
    title: '숫자 폭 검사',
    label: '단기 기억',
    tagline: '숫자를 기억해 그대로 입력',
    blurb: '숫자가 하나씩 늘어납니다. 어디까지 정확히 기억하는지로 단기 기억 용량을 봅니다.',
    minutes: 2
  }
];

/* ────────────────────────────────────────────────────────── 공통 도구 ── */
const shuffle = arr => arr.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(v => v[1]);
const mean = a => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

function taskShell(inner) {
  return `<div class="task">${inner}</div>`;
}

/* ══════════════════════════════════════════════════════ 반응 속도 ════ */
function runReaction(host, done) {
  const times = [];
  let state = 'wait', t0 = 0, timer = null;

  const paint = () => {
    if (state === 'ready') {
      host.innerHTML = taskShell(`
        <div class="task-pad is-wait"><p>초록색으로 바뀌면<br><strong>바로 누르세요</strong></p></div>
        <p class="task-hint">${times.length} / 5 회 완료 · 아무 곳이나 누르면 시작합니다</p>`);
    } else if (state === 'wait') {
      host.innerHTML = taskShell(`
        <div class="task-pad is-hold"><p>준비…</p></div>
        <p class="task-hint">아직 누르지 마세요</p>`);
    } else if (state === 'go') {
      host.innerHTML = taskShell(`
        <div class="task-pad is-go"><p>지금!</p></div>
        <p class="task-hint">${times.length} / 5 회 완료</p>`);
    } else if (state === 'early') {
      host.innerHTML = taskShell(`
        <div class="task-pad is-early"><p>너무 빨라요<br><strong>다시 시도</strong></p></div>
        <p class="task-hint">아무 곳이나 눌러 다시 시작하세요</p>`);
    }
  };

  const startTrial = () => {
    state = 'wait';
    paint();
    timer = setTimeout(() => { state = 'go'; t0 = performance.now(); paint(); },
      1200 + Math.random() * 2600);
  };

  const hit = () => {
    if (state === 'ready' || state === 'early') { startTrial(); return; }
    if (state === 'wait') { clearTimeout(timer); state = 'early'; paint(); return; }
    if (state === 'go') {
      times.push(Math.round(performance.now() - t0));
      if (times.length >= 5) { cleanup(); done(summary()); return; }
      state = 'ready'; paint();
    }
  };

  const summary = () => {
    const avg = Math.round(mean(times));
    const best = Math.min(...times);
    let level, tone;
    if (avg < 260) { level = '매우 빠름'; tone = 'good'; }
    else if (avg < 330) { level = '빠른 편'; tone = 'good'; }
    else if (avg < 420) { level = '보통'; tone = 'mild'; }
    else { level = '느린 편'; tone = 'moderate'; }
    return {
      headline: `${avg} ms`, sub: '5회 평균 반응 시간', level, tone,
      rows: [
        { label: '평균', value: `${avg} ms` },
        { label: '가장 빠른 시도', value: `${best} ms` },
        { label: '각 시도', value: times.map(t => `${t}`).join(' · ') + ' ms' }
      ],
      note: avg >= 420
        ? '피로·졸음·카페인·화면 환경에 따라 쉽게 느려집니다. 잠이 부족한 날이었다면 다른 날 다시 해보세요.'
        : '반응 속도는 컨디션에 따라 하루 안에도 크게 달라집니다.'
    };
  };

  const onKey = e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); hit(); } };
  const cleanup = () => {
    clearTimeout(timer);
    host.removeEventListener('pointerdown', hit);
    document.removeEventListener('keydown', onKey);
  };

  host.addEventListener('pointerdown', hit);
  document.addEventListener('keydown', onKey);
  state = 'ready';
  paint();
  return cleanup;
}

/* ══════════════════════════════════════════════════════════ 스트룹 ════ */
const STROOP_COLORS = [
  { name: '빨강', hex: '#D64545' },
  { name: '파랑', hex: '#3B7DD8' },
  { name: '초록', hex: '#2F9E5F' },
  { name: '노랑', hex: '#D9A21B' }
];

function runStroop(host, done) {
  const TOTAL = 20;
  let i = 0, t0 = 0, correct = 0;
  const rts = [], congRt = [], incongRt = [];
  let cur = null;

  /* 절반은 글자와 색이 같고(일치), 절반은 다릅니다(불일치) */
  const plan = shuffle([...Array(TOTAL)].map((_, n) => n < TOTAL / 2));

  const next = () => {
    if (i >= TOTAL) { done(summary()); return; }
    const congruent = plan[i];
    const word = STROOP_COLORS[Math.floor(Math.random() * 4)];
    let ink = word;
    if (!congruent) {
      const others = STROOP_COLORS.filter(c => c.name !== word.name);
      ink = others[Math.floor(Math.random() * others.length)];
    }
    cur = { word, ink, congruent };

    host.innerHTML = taskShell(`
      <p class="task-hint">글자의 <strong>뜻</strong>이 아니라 <strong>색깔</strong>을 고르세요</p>
      <div class="stroop-word" style="color:${ink.hex}">${word.name}</div>
      <div class="stroop-keys">
        ${shuffle(STROOP_COLORS).map(c =>
          `<button type="button" class="stroop-key" data-name="${c.name}">${c.name}</button>`).join('')}
      </div>
      <div class="task-progress"><span style="width:${(i / TOTAL) * 100}%"></span></div>
      <p class="task-hint">${i + 1} / ${TOTAL}</p>`);

    host.querySelectorAll('.stroop-key').forEach(b =>
      b.addEventListener('click', () => answer(b.dataset.name)));
    t0 = performance.now();
  };

  const answer = (picked) => {
    const rt = Math.round(performance.now() - t0);
    const ok = picked === cur.ink.name;
    if (ok) {
      correct++;
      rts.push(rt);
      (cur.congruent ? congRt : incongRt).push(rt);
    }
    i++;
    next();
  };

  const summary = () => {
    const acc = Math.round((correct / TOTAL) * 100);
    const avg = Math.round(mean(rts));
    const cost = Math.round(mean(incongRt) - mean(congRt));
    let level, tone;
    if (acc >= 90 && cost <= 120) { level = '주의 조절 양호'; tone = 'good'; }
    else if (acc >= 75) { level = '보통'; tone = 'mild'; }
    else { level = '간섭에 취약'; tone = 'moderate'; }
    return {
      headline: `${acc}%`, sub: `정확도 · 평균 ${avg} ms`, level, tone,
      rows: [
        { label: '정확도', value: `${correct} / ${TOTAL} (${acc}%)` },
        { label: '평균 반응 시간', value: `${avg} ms` },
        { label: '일치 조건', value: congRt.length ? `${Math.round(mean(congRt))} ms` : '—' },
        { label: '불일치 조건', value: incongRt.length ? `${Math.round(mean(incongRt))} ms` : '—' },
        { label: '간섭 비용', value: `${cost >= 0 ? '+' : ''}${cost} ms` }
      ],
      note: '글자와 색이 다를 때 느려지는 정도(간섭 비용)는 누구에게나 나타납니다. ' +
            '보통 50~150 ms 사이이며, 이 값 하나로 집중력을 판단할 수는 없습니다.'
    };
  };

  next();
  return () => {};
}

/* ══════════════════════════════════════════════════════ 숫자 폭 ══════ */
function runDigitSpan(host, done) {
  let len = 3, fails = 0, best = 0;
  const history = [];

  const show = async () => {
    const seq = [...Array(len)].map(() => Math.floor(Math.random() * 10));
    host.innerHTML = taskShell(`
      <p class="task-hint">숫자를 순서대로 기억하세요 (${len}자리)</p>
      <div class="digit-stage" id="digitStage">준비</div>`);
    const stage = host.querySelector('#digitStage');

    await sleep(700);
    for (const d of seq) {
      stage.textContent = String(d);
      stage.classList.add('is-on');
      await sleep(700);
      stage.classList.remove('is-on');
      stage.textContent = '';
      await sleep(250);
    }
    ask(seq);
  };

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const ask = (seq) => {
    host.innerHTML = taskShell(`
      <p class="task-hint">기억한 순서대로 입력하세요</p>
      <div class="digit-input" id="digitInput"></div>
      <div class="digit-pad">
        ${[1,2,3,4,5,6,7,8,9,0].map(n => `<button type="button" class="digit-key" data-n="${n}">${n}</button>`).join('')}
        <button type="button" class="digit-key is-wide" data-act="del">지우기</button>
        <button type="button" class="digit-key is-wide is-go" data-act="ok">확인</button>
      </div>
      <p class="task-hint">현재 ${len}자리 · 최고 기록 ${best}자리</p>`);

    let typed = '';
    let submitted = false;   // 자동 제출과 '확인' 버튼이 겹쳐 두 번 처리되는 것을 막습니다
    const box = host.querySelector('#digitInput');
    const paint = () => {
      box.innerHTML = [...Array(seq.length)].map((_, k) =>
        `<span class="${k < typed.length ? 'is-filled' : ''}">${typed[k] || ''}</span>`).join('');
    };
    paint();

    host.querySelectorAll('.digit-key').forEach(b => b.addEventListener('click', () => {
      if (submitted) return;
      const act = b.dataset.act;
      if (act === 'del') { typed = typed.slice(0, -1); paint(); return; }
      if (act === 'ok') { submit(); return; }
      if (typed.length >= seq.length) return;
      typed += b.dataset.n;
      paint();
      if (typed.length === seq.length) setTimeout(submit, 260);
    }));

    const submit = () => {
      if (submitted) return;
      submitted = true;
      const ok = typed === seq.join('');
      history.push({ len, ok, seq: seq.join(''), typed: typed || '(미입력)' });
      if (ok) {
        best = Math.max(best, len);
        len++; fails = 0;
      } else {
        fails++;
      }
      if (fails >= 2 || len > 12) { done(summary()); return; }
      show();
    };
  };

  const summary = () => {
    let level, tone;
    if (best >= 8) { level = '매우 우수'; tone = 'good'; }
    else if (best >= 6) { level = '평균 이상'; tone = 'good'; }
    else if (best >= 5) { level = '평균 범위'; tone = 'mild'; }
    else { level = '평균 이하'; tone = 'moderate'; }
    return {
      headline: `${best}자리`, sub: '정확히 기억한 최대 길이', level, tone,
      rows: [
        { label: '최고 기록', value: `${best}자리` },
        { label: '시도 횟수', value: `${history.length}회` },
        { label: '기록', value: history.map(h => `${h.len}${h.ok ? '○' : '✕'}`).join(' ') }
      ],
      note: '성인 평균은 대체로 6~7자리입니다. 긴장하거나 주변이 시끄러우면 쉽게 낮아지므로, ' +
            '조용한 곳에서 한 번 더 해보시는 것을 권합니다.'
    };
  };

  show();
  return () => {};
}

const TASK_RUNNERS = { reaction: runReaction, stroop: runStroop, digitspan: runDigitSpan };
