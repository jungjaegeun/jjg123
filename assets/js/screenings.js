/* =========================================================================
 * 수원숲정신건강의학과 — 자가진단 척도 데이터
 * 임상에서 널리 쓰이는 공개 선별 척도(PHQ-9, GAD-7, ISI, ASRS-v1.1, PSS-10)를
 * 한국어 문항으로 담았습니다. 진단 도구가 아닌 선별(screening) 참고용입니다.
 * ========================================================================= */

/* 자주 쓰이는 응답 보기 */
const FREQ_4 = [
  { label: '전혀 없음', desc: '0일', value: 0 },
  { label: '며칠 동안', desc: '1–6일', value: 1 },
  { label: '일주일 이상', desc: '7–11일', value: 2 },
  { label: '거의 매일', desc: '12–14일', value: 3 }
];

const FREQ_5 = [
  { label: '전혀 없었다', value: 0 },
  { label: '드물게', value: 1 },
  { label: '가끔', value: 2 },
  { label: '자주', value: 3 },
  { label: '매우 자주', value: 4 }
];

const STRESS_5 = [
  { label: '전혀 없었다', value: 0 },
  { label: '거의 없었다', value: 1 },
  { label: '때때로 있었다', value: 2 },
  { label: '자주 있었다', value: 3 },
  { label: '매우 자주 있었다', value: 4 }
];

const SEVERITY_5 = [
  { label: '전혀 없음', value: 0 },
  { label: '약간', value: 1 },
  { label: '중간 정도', value: 2 },
  { label: '심함', value: 3 },
  { label: '매우 심함', value: 4 }
];

const SCREENINGS = [
  /* ------------------------------------------------------------------ */
  {
    id: 'phq9',
    emoji: '🌧️',
    title: '우울 자가진단',
    scale: 'PHQ-9',
    tagline: '지난 2주간의 우울 증상',
    blurb: '가장 널리 쓰이는 우울 선별 척도입니다. 기분, 수면, 식욕, 집중력 등 9가지 영역을 확인합니다.',
    minutes: 2,
    prompt: '지난 <strong>2주 동안</strong>, 다음 문제들로 얼마나 자주 방해를 받으셨나요?',
    options: FREQ_4,
    scoring: { type: 'sum', max: 27 },
    alertItem: { index: 8, message: '자해나 죽음에 대한 생각을 표시하셨습니다. 지금 힘드시다면 혼자 견디지 마시고 아래 상담 번호나 병원으로 꼭 연락해 주세요.' },
    questions: [
      '일 또는 여가 활동을 하는 데 흥미나 즐거움을 느끼지 못함',
      '기분이 가라앉거나, 우울하거나, 희망이 없다고 느낌',
      '잠이 들거나 계속 잠을 자는 것이 어려움, 또는 잠을 너무 많이 잠',
      '피곤하다고 느끼거나 기운이 거의 없음',
      '입맛이 없거나 과식을 함',
      '자신을 부정적으로 봄 — 자신이 실패자라고 느끼거나 자신 또는 가족을 실망시켰다고 느낌',
      '신문을 읽거나 텔레비전을 보는 것과 같은 일에 집중하기 어려움',
      '다른 사람이 알아챌 정도로 말이나 행동이 느려짐, 또는 반대로 안절부절못해 평소보다 많이 서성거림',
      '자신이 죽는 것이 더 낫다고 생각하거나, 어떤 식으로든 자신을 해칠 것이라고 생각함'
    ],
    bands: [
      { max: 4, level: '정상 범위', tone: 'good',
        summary: '우울 증상이 거의 관찰되지 않습니다.',
        advice: '지금의 수면·활동 리듬을 유지해 보세요. 그럼에도 일상이 힘들게 느껴진다면 점수와 무관하게 상담을 권합니다.' },
      { max: 9, level: '가벼운 우울', tone: 'mild',
        summary: '가벼운 수준의 우울 증상이 있습니다.',
        advice: '규칙적인 수면, 햇빛 아래 걷기, 믿을 만한 사람과의 대화가 도움이 됩니다. 2주 뒤 다시 점검해 보시고, 나아지지 않으면 진료를 고려해 보세요.' },
      { max: 14, level: '중간 정도의 우울', tone: 'moderate',
        summary: '일상 기능에 영향을 줄 수 있는 수준입니다.',
        advice: '전문의 상담을 권해드립니다. 상담만으로 시작할 수도 있고, 필요 시 약물치료를 함께 논의합니다.' },
      { max: 19, level: '중간–심한 우울', tone: 'high',
        summary: '치료적 개입이 필요한 수준의 증상입니다.',
        advice: '가능한 한 빠른 시일 내에 정신건강의학과 진료를 받아보시길 권합니다.' },
      { max: 27, level: '심한 우울', tone: 'severe',
        summary: '증상이 상당히 심한 상태로 보입니다.',
        advice: '지체하지 마시고 진료를 받아보세요. 혼자 있기 어렵다면 가까운 사람에게 지금 상태를 알려주세요.' }
    ]
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'gad7',
    emoji: '💓',
    title: '불안 자가진단',
    scale: 'GAD-7',
    tagline: '지난 2주간의 불안 증상',
    blurb: '걱정, 초조, 긴장 등 범불안 증상을 7문항으로 선별합니다. 공황·사회불안의 실마리도 확인할 수 있습니다.',
    minutes: 2,
    prompt: '지난 <strong>2주 동안</strong>, 다음 문제들로 얼마나 자주 방해를 받으셨나요?',
    options: FREQ_4,
    scoring: { type: 'sum', max: 21 },
    questions: [
      '초조하거나 불안하거나 조마조마하게 느낀다',
      '걱정하는 것을 멈추거나 조절할 수가 없다',
      '여러 가지 것들에 대해 지나치게 걱정한다',
      '편하게 있기가 어렵다',
      '너무 안절부절못해서 가만히 있기가 힘들다',
      '쉽게 짜증이 나거나 쉽게 성을 내게 된다',
      '마치 끔찍한 일이 일어날 것처럼 두렵게 느껴진다'
    ],
    bands: [
      { max: 4, level: '정상 범위', tone: 'good',
        summary: '뚜렷한 불안 증상은 관찰되지 않습니다.',
        advice: '카페인과 수면 부족은 불안을 키웁니다. 지금의 리듬을 유지해 보세요.' },
      { max: 9, level: '가벼운 불안', tone: 'mild',
        summary: '가벼운 수준의 불안이 있습니다.',
        advice: '복식호흡, 걷기 등 몸을 안정시키는 습관이 도움이 됩니다. 증상이 2주 이상 이어지면 상담을 고려해 보세요.' },
      { max: 14, level: '중간 정도의 불안', tone: 'moderate',
        summary: '일상에 지장을 줄 수 있는 수준의 불안입니다.',
        advice: '전문의 상담을 권합니다. 가슴 두근거림·호흡곤란 같은 신체 증상이 동반된다면 더욱 그렇습니다.' },
      { max: 21, level: '심한 불안', tone: 'severe',
        summary: '불안이 상당히 높은 상태입니다.',
        advice: '가능한 한 빨리 진료를 받아보세요. 공황발작이 반복된다면 조기 치료 시 경과가 좋습니다.' }
    ]
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'isi',
    emoji: '🌙',
    title: '불면증 자가진단',
    scale: 'ISI',
    tagline: '최근 2주간의 수면',
    blurb: '잠드는 데 걸리는 시간, 유지, 새벽 각성과 낮 동안의 영향까지 7문항으로 평가합니다.',
    minutes: 2,
    prompt: '<strong>최근 2주간</strong>의 수면 상태를 기준으로 답해 주세요.',
    options: SEVERITY_5,
    scoring: { type: 'sum', max: 28 },
    questions: [
      { text: '잠들기 어렵다', options: SEVERITY_5 },
      { text: '자다가 자주 깨어 잠을 유지하기 어렵다', options: SEVERITY_5 },
      { text: '너무 이른 새벽에 깨어 다시 잠들지 못한다', options: SEVERITY_5 },
      { text: '현재의 수면 양상에 얼마나 만족하시나요?', options: [
        { label: '매우 만족', value: 0 }, { label: '만족', value: 1 },
        { label: '보통', value: 2 }, { label: '불만족', value: 3 }, { label: '매우 불만족', value: 4 }
      ] },
      { text: '수면 문제가 낮 동안의 활동(피로, 집중력, 기분 등)을 얼마나 방해하나요?', options: [
        { label: '전혀 방해하지 않음', value: 0 }, { label: '약간', value: 1 },
        { label: '다소', value: 2 }, { label: '많이', value: 3 }, { label: '매우 많이', value: 4 }
      ] },
      { text: '수면 문제로 인한 삶의 질 저하가 다른 사람들에게 얼마나 뚜렷해 보인다고 생각하나요?', options: [
        { label: '전혀 그렇지 않음', value: 0 }, { label: '조금', value: 1 },
        { label: '다소', value: 2 }, { label: '많이', value: 3 }, { label: '매우 많이', value: 4 }
      ] },
      { text: '현재의 수면 문제에 대해 얼마나 걱정하고 있나요?', options: [
        { label: '전혀 걱정 안 함', value: 0 }, { label: '조금', value: 1 },
        { label: '다소', value: 2 }, { label: '많이', value: 3 }, { label: '매우 많이', value: 4 }
      ] }
    ],
    bands: [
      { max: 7, level: '유의한 불면 없음', tone: 'good',
        summary: '임상적으로 의미 있는 불면은 보이지 않습니다.',
        advice: '취침·기상 시간을 일정하게 유지하는 것이 가장 좋은 예방법입니다.' },
      { max: 14, level: '경계 수준의 불면', tone: 'mild',
        summary: '약간의 불면 증상이 있습니다.',
        advice: '잠들기 1시간 전 스마트폰 사용과 늦은 카페인·음주를 줄여보세요. 4주 이상 지속되면 진료를 권합니다.' },
      { max: 21, level: '중등도 불면증', tone: 'moderate',
        summary: '치료가 필요한 수준의 불면증이 의심됩니다.',
        advice: '불면증은 우울·불안과 함께 오는 경우가 많습니다. 수면제부터 찾기보다 원인 평가를 먼저 받아보세요.' },
      { max: 28, level: '심한 불면증', tone: 'severe',
        summary: '불면이 일상에 큰 영향을 주고 있습니다.',
        advice: '전문의 진료를 권합니다. 수면 습관 교정(CBT-I)과 필요 시 단기 약물치료를 함께 계획합니다.' }
    ]
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'asrs',
    emoji: '🧩',
    title: '성인 ADHD 자가진단',
    scale: 'ASRS-v1.1 (Part A)',
    tagline: '지난 6개월간의 주의력·충동성',
    blurb: 'WHO 성인 ADHD 자기보고 척도의 선별 6문항입니다. 총점이 아니라 문항별 기준 초과 개수로 판단합니다.',
    minutes: 2,
    prompt: '지난 <strong>6개월 동안</strong> 다음과 같은 일이 얼마나 자주 있었나요?',
    options: FREQ_5,
    /* Part A는 문항마다 기준값이 다릅니다(1–3번: 가끔 이상, 4–6번: 자주 이상) */
    scoring: { type: 'threshold', thresholds: [2, 2, 2, 3, 3, 3], max: 6 },
    questions: [
      '어떤 일의 어려운 부분은 끝내 놓고도 마무리를 짓지 못해 곤란을 겪은 적이 있습니까?',
      '체계가 필요한 일을 해야 할 때 순서대로 진행하기 어려운 경우가 있습니까?',
      '약속이나 해야 할 일을 잊어버려 곤란을 겪은 적이 있습니까?',
      '골치 아프고 생각을 많이 해야 하는 일을 피하거나 미루는 경우가 있습니까?',
      '오래 앉아 있어야 할 때 손발을 꼼지락거리거나 몸을 움직이는 경우가 있습니까?',
      '마치 모터가 달린 것처럼 과도하게, 또는 멈출 수 없이 활동하는 경우가 있습니까?'
    ],
    bands: [
      { max: 3, level: 'ADHD 가능성 낮음', tone: 'good',
        summary: '선별 기준을 넘는 문항이 4개 미만입니다.',
        advice: '집중력 저하는 우울·불안·수면 부족으로도 나타납니다. 어려움이 계속된다면 다른 척도도 확인해 보세요.' },
      { max: 6, level: 'ADHD 증상 시사', tone: 'moderate',
        summary: '선별 기준을 넘는 문항이 4개 이상으로, 추가 평가가 권장됩니다.',
        advice: '성인 ADHD는 정확한 진단을 위해 어린 시절 이력과 다른 원인 감별이 필요합니다. 진료 시 학창 시절 생활기록부나 부모님의 기억이 도움이 됩니다.' }
    ],
    resultUnit: '개 문항',
    resultLabel: '기준 초과 문항'
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'pss10',
    emoji: '🔥',
    title: '스트레스 자가진단',
    scale: 'PSS-10',
    tagline: '지난 한 달간 느낀 스트레스',
    blurb: '상황 자체가 아니라 “내가 얼마나 감당하기 어렵게 느꼈는지”를 측정하는 지각된 스트레스 척도입니다.',
    minutes: 3,
    prompt: '지난 <strong>한 달 동안</strong> 다음과 같이 느끼거나 생각한 적이 얼마나 있었나요?',
    options: STRESS_5,
    scoring: { type: 'sum', max: 40, reverse: [3, 4, 6, 7], reverseMax: 4 },
    questions: [
      '예상치 못했던 일 때문에 당황했던 적이 얼마나 있었나요?',
      '인생에서 중요한 일들을 조절할 수 없다는 느낌을 얼마나 경험했나요?',
      '신경이 예민해지고 스트레스를 받고 있다고 얼마나 느꼈나요?',
      '당신의 개인적인 문제들을 다루는 데 얼마나 자신감을 느꼈나요?',
      '일상의 일들이 당신 생각대로 진행되고 있다고 얼마나 느꼈나요?',
      '당신이 해야 할 모든 일에 잘 대처할 수 없다고 얼마나 느꼈나요?',
      '일상에서 짜증나는 일들을 얼마나 잘 조절할 수 있었나요?',
      '최상의 컨디션이라고 얼마나 느꼈나요?',
      '당신이 통제할 수 없는 일 때문에 화가 난 경험이 얼마나 있었나요?',
      '어려운 일들이 너무 많이 쌓여서 극복하지 못할 것 같다고 얼마나 느꼈나요?'
    ],
    bands: [
      { max: 13, level: '낮은 스트레스', tone: 'good',
        summary: '스트레스를 비교적 잘 조절하고 계십니다.',
        advice: '지금의 회복 방식(휴식·운동·관계)을 기록해 두면 힘든 시기에 큰 자원이 됩니다.' },
      { max: 19, level: '보통 수준', tone: 'mild',
        summary: '일반적인 범위의 스트레스입니다.',
        advice: '하루 10분이라도 온전히 쉬는 시간을 확보해 보세요.' },
      { max: 26, level: '다소 높은 스트레스', tone: 'moderate',
        summary: '감당하기 버겁다고 느끼는 순간이 잦은 상태입니다.',
        advice: '수면과 식사가 먼저 무너지지 않도록 지켜주세요. 우울·불안 척도도 함께 확인해 보시길 권합니다.' },
      { max: 40, level: '높은 스트레스', tone: 'severe',
        summary: '소진(번아웃)으로 이어질 수 있는 수준입니다.',
        advice: '혼자 버티기보다 전문가와 상황을 정리해 보는 것이 도움이 됩니다. 필요 시 진단서·소견서 상담도 가능합니다.' }
    ]
  }
];

/* 점수 계산 --------------------------------------------------------------- */
function scoreScreening(test, answers) {
  const s = test.scoring;

  if (s.type === 'threshold') {
    const count = answers.reduce(
      (acc, v, i) => acc + (v >= s.thresholds[i] ? 1 : 0), 0
    );
    return { score: count, max: s.max };
  }

  const reverse = s.reverse || [];
  const total = answers.reduce((acc, v, i) => {
    return acc + (reverse.includes(i) ? s.reverseMax - v : v);
  }, 0);
  return { score: total, max: s.max };
}

function bandFor(test, score) {
  return test.bands.find(b => score <= b.max) || test.bands[test.bands.length - 1];
}

function questionOf(test, index) {
  const q = test.questions[index];
  return typeof q === 'string' ? { text: q, options: test.options } : q;
}
