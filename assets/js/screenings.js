/* =========================================================================
 * 수원숲 정신건강의학과 — 자가진단 척도 데이터
 *
 * 임상·연구에서 널리 쓰이는 공개 선별 도구를 한국어 문항으로 담았습니다.
 * 모두 진단 도구가 아닌 선별(screening) 참고용입니다.
 * 화면에는 원 척도명을 노출하지 않습니다. 어떤 검사가 어떤 척도에 해당하는지는
 * 저장소의 README.md 표를 참고하세요.
 *
 * 채점 방식은 scoring.type 으로 구분합니다.
 *   sum        총점 합산 (reverse 로 역채점 문항 지정)
 *   threshold  문항별 기준값을 넘은 개수
 *   subscales  하위 척도별 점수 (영역별로 따로 채점)
 *   mdq        기분 변동 선별 전용 (증상 수 + 동시성 + 기능 손상)
 * ========================================================================= */

/* 자주 쓰이는 응답 보기 ---------------------------------------------------- */
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

const DAYS_4 = [
  { label: '극히 드물다', desc: '1일 미만', value: 0 },
  { label: '가끔 있었다', desc: '1–2일', value: 1 },
  { label: '종종 있었다', desc: '3–4일', value: 2 },
  { label: '대부분 그랬다', desc: '5–7일', value: 3 }
];

const INTENSITY_5 = [
  { label: '전혀 아니다', value: 0 },
  { label: '조금', value: 1 },
  { label: '중간 정도', value: 2 },
  { label: '상당히', value: 3 },
  { label: '극심하게', value: 4 }
];

const APPLY_4 = [
  { label: '전혀 해당되지 않음', value: 0 },
  { label: '어느 정도 해당됨', value: 1 },
  { label: '상당히 해당됨', value: 2 },
  { label: '매우 많이 해당됨', value: 3 }
];

const DISTRESS_5 = [
  { label: '전혀 아니다', value: 0 },
  { label: '약간 그렇다', value: 1 },
  { label: '보통이다', value: 2 },
  { label: '많이 그렇다', value: 3 },
  { label: '매우 많이 그렇다', value: 4 }
];

/* 음주 선별 4–8번 공통 보기 */
const DRINK_FREQ = [
  { label: '전혀 없음', value: 0 },
  { label: '월 1회 미만', value: 1 },
  { label: '월 1회 정도', value: 2 },
  { label: '주 1회 정도', value: 3 },
  { label: '거의 매일', value: 4 }
];

const PAST_YEAR_3 = [
  { label: '없다', value: 0 },
  { label: '있지만 지난 1년간은 없다', value: 2 },
  { label: '지난 1년간 있었다', value: 4 }
];

const YES_NO = [
  { label: '예', value: 1 },
  { label: '아니오', value: 0 }
];

/* 검사 분류 --------------------------------------------------------------- */
const CATEGORIES = [
  { id: 'all',   label: '전체' },
  { id: 'mood',  label: '우울 · 기분' },
  { id: 'anx',   label: '불안 · 스트레스' },
  { id: 'sleep', label: '수면 · 주의력' },
  { id: 'life',  label: '웰빙 · 생활' },
  { id: 'trait', label: '성격 · 성향' },
  { id: 'focus', label: '집중력 과제' }
];

const SCREENINGS = [
  /* ══════════════════════════════════════════════════ 우울 · 기분 ══════ */
  {
    id: 'phq9',
    category: 'mood',
    emoji: '🌧️',
    title: '우울 자가진단',
    label: '우울 선별',
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

  {
    id: 'cesd',
    category: 'mood',
    emoji: '🌫️',
    title: '일상 우울감 검사',
    label: '우울감 척도',
    tagline: '지난 일주일간의 기분',
    blurb: '지역사회 연구에서 널리 쓰이는 우울 척도입니다. 병원 진단보다 “요즘 내 기분이 어떤지”를 폭넓게 살펴봅니다.',
    minutes: 4,
    prompt: '지난 <strong>일주일 동안</strong> 다음과 같이 느끼거나 행동한 날이 며칠이나 되었나요?',
    options: DAYS_4,
    scoring: { type: 'sum', max: 60, reverse: [3, 7, 11, 15], reverseMax: 3 },
    questions: [
      '평소에는 아무렇지도 않던 일들이 귀찮게 느껴졌다',
      '먹고 싶지 않았고 식욕이 없었다',
      '가족이나 친구가 도와주더라도 울적한 기분을 떨쳐버릴 수 없었다',
      '다른 사람들만큼 능력이 있다고 느꼈다',
      '무슨 일을 하든 정신을 집중하기 어려웠다',
      '우울했다',
      '하는 일마다 힘들게 느껴졌다',
      '미래에 대해 희망적으로 느꼈다',
      '내 인생은 실패작이라는 생각이 들었다',
      '두려움을 느꼈다',
      '잠을 설쳤다 (잠을 잘 이루지 못했다)',
      '행복했다',
      '평소보다 말수가 적었다',
      '세상에 홀로 있는 듯한 외로움을 느꼈다',
      '사람들이 나에게 차갑게 대하는 것 같았다',
      '생활이 즐거웠다',
      '갑자기 울음이 나왔다',
      '슬픔을 느꼈다',
      '사람들이 나를 싫어하는 것 같았다',
      '도무지 뭘 해 나갈 엄두가 나지 않았다'
    ],
    bands: [
      { max: 15, level: '정상 범위', tone: 'good',
        summary: '일상적인 우울감 수준입니다.',
        advice: '누구나 기분의 오르내림은 있습니다. 지금의 생활 리듬을 유지해 보세요.' },
      { max: 20, level: '가벼운 우울감', tone: 'mild',
        summary: '가벼운 우울감이 이어지고 있습니다.',
        advice: '수면과 활동량부터 챙겨보세요. 2주 이상 계속되면 상담을 고려해 보시길 권합니다.' },
      { max: 24, level: '중등도 우울감', tone: 'moderate',
        summary: '주의가 필요한 수준의 우울감입니다.',
        advice: '우울 자가진단도 함께 해보시고, 결과가 비슷하다면 전문의 상담을 받아보세요.' },
      { max: 60, level: '심한 우울감', tone: 'severe',
        summary: '우울감이 상당히 높은 상태입니다.',
        advice: '전문의 진료를 권해드립니다. 혼자 판단하지 마시고 한 번 이야기 나눠보세요.' }
    ]
  },

  {
    id: 'mdq',
    category: 'mood',
    emoji: '🌊',
    title: '조울(양극성) 자가진단',
    label: '기분 변동 선별',
    tagline: '지금까지 살아오면서',
    blurb: '기분이 지나치게 들뜨거나 과하게 활동적이었던 시기가 있었는지 확인합니다. 우울 치료가 잘 듣지 않을 때 특히 중요합니다.',
    minutes: 3,
    prompt: '지금까지 살아오는 동안, <strong>평소의 나와 달랐던 시기</strong>가 있었고 그때 다음과 같았나요?',
    options: YES_NO,
    scoring: { type: 'mdq', symptomCount: 13, clusterIndex: 13, impairIndex: 14 },
    questions: [
      '너무 기분이 좋거나 들떠서, 다른 사람들이 평소의 내 모습이 아니라고 하거나 그 때문에 문제가 생긴 적이 있다',
      '지나치게 신경이 예민해져서 사람들에게 소리를 지르거나 싸우거나 말다툼을 한 적이 있다',
      '평소보다 훨씬 자신감이 넘쳤다',
      '평소보다 잠을 훨씬 덜 잤는데도 그다지 피곤하지 않았다',
      '평소보다 말이 많아지고 말이 매우 빨라졌다',
      '생각이 머릿속에서 빠르게 스쳐 지나가 멈출 수 없었다',
      '주변 일에 쉽게 방해받아 집중하기 어렵거나 하던 일을 계속하기 어려웠다',
      '평소보다 에너지가 훨씬 넘쳤다',
      '평소보다 훨씬 더 활동적이었고 더 많은 일을 했다',
      '평소보다 더 사교적이었다 (예: 한밤중에 친구에게 전화를 걸었다)',
      '평소보다 성적인 관심이 훨씬 커졌다',
      '평소의 나 같지 않은 행동을 하거나, 다른 사람들이 지나치다고 여길 만한 행동을 했다',
      '돈을 흥청망청 써서 나 자신이나 가족에게 문제가 생긴 적이 있다',
      { text: '위 항목 중 여러 개에 “예”라고 답하셨다면, 그런 일들이 <strong>같은 시기에 함께</strong> 나타났나요?', options: YES_NO },
      { text: '그로 인해 일이나 학업, 대인관계, 금전 문제 등이 어느 정도 있었나요?', options: [
        { label: '문제 없었다', value: 0 },
        { label: '경미한 문제', value: 1 },
        { label: '중간 정도의 문제', value: 2 },
        { label: '심각한 문제', value: 3 }
      ] }
    ],
    resultUnit: '개 항목',
    resultLabel: '해당하는 증상 수',
    bands: [
      { max: 0, level: '선별 기준 미충족', tone: 'good',
        summary: '양극성 스펙트럼을 시사하는 기준에는 해당하지 않습니다.',
        advice: '다만 이 검사는 과거의 기억에 의존합니다. 기분의 큰 기복이 반복된다고 느끼신다면 가족의 관찰을 함께 참고해 보세요.' },
      { max: 1, level: '추가 평가 권장', tone: 'moderate',
        summary: '증상 7개 이상 + 같은 시기 발생 + 중간 이상의 문제, 세 조건을 모두 충족했습니다.',
        advice: '양극성 장애는 우울증과 치료 방향이 다릅니다. 항우울제만 쓰면 오히려 기분이 불안정해질 수 있으니 꼭 전문의 평가를 받아보세요.' }
    ]
  },

  {
    id: 'epds',
    category: 'mood',
    emoji: '🍼',
    title: '산후 우울 자가진단',
    label: '산후 우울 선별',
    tagline: '출산 전후 지난 7일간',
    blurb: '임신 중이거나 출산한 지 얼마 되지 않은 분을 위한 척도입니다. 산후 우울은 흔하고 치료가 잘 됩니다.',
    minutes: 3,
    prompt: '지난 <strong>7일 동안</strong>의 느낌에 가장 가까운 것을 골라주세요.',
    options: null,
    scoring: { type: 'sum', max: 30 },
    alertItem: { index: 9, message: '자신을 해치는 생각을 표시하셨습니다. 산후 우울에서 드물지 않은 증상이며 치료로 좋아집니다. 혼자 견디지 마시고 지금 도움을 요청해 주세요.' },
    questions: [
      { text: '나는 웃을 수 있었고, 사물의 재미있는 면을 볼 수 있었다', options: [
        { label: '예전과 똑같았다', value: 0 }, { label: '예전보다 조금 덜했다', value: 1 },
        { label: '확실히 예전보다 덜했다', value: 2 }, { label: '전혀 그렇지 않았다', value: 3 } ] },
      { text: '나는 어떤 일들을 기대감을 가지고 즐겁게 기다렸다', options: [
        { label: '예전과 똑같았다', value: 0 }, { label: '예전보다 조금 덜했다', value: 1 },
        { label: '확실히 예전보다 덜했다', value: 2 }, { label: '거의 그렇지 않았다', value: 3 } ] },
      { text: '일이 잘못될 때면 필요 이상으로 나 자신을 탓했다', options: [
        { label: '전혀 그렇지 않았다', value: 0 }, { label: '자주 그렇지는 않았다', value: 1 },
        { label: '가끔 그랬다', value: 2 }, { label: '대부분 그랬다', value: 3 } ] },
      { text: '특별한 이유 없이 불안하거나 걱정스러웠다', options: [
        { label: '전혀 그렇지 않았다', value: 0 }, { label: '거의 그렇지 않았다', value: 1 },
        { label: '가끔 그랬다', value: 2 }, { label: '자주 그랬다', value: 3 } ] },
      { text: '특별한 이유 없이 무섭거나 안절부절못했다', options: [
        { label: '전혀 그렇지 않았다', value: 0 }, { label: '거의 그렇지 않았다', value: 1 },
        { label: '가끔 그랬다', value: 2 }, { label: '꽤 자주 그랬다', value: 3 } ] },
      { text: '요즘 들어 많은 일들이 힘겹게 느껴졌다', options: [
        { label: '평소처럼 잘 감당했다', value: 0 }, { label: '대부분 잘 감당했다', value: 1 },
        { label: '가끔 평소처럼 감당하지 못했다', value: 2 }, { label: '대부분 감당할 수 없었다', value: 3 } ] },
      { text: '너무 불행하다고 느껴서 잠을 잘 자지 못했다', options: [
        { label: '전혀 그렇지 않았다', value: 0 }, { label: '자주 그렇지는 않았다', value: 1 },
        { label: '가끔 그랬다', value: 2 }, { label: '대부분 그랬다', value: 3 } ] },
      { text: '슬프거나 비참하다고 느꼈다', options: [
        { label: '전혀 그렇지 않았다', value: 0 }, { label: '가끔 그랬다', value: 1 },
        { label: '자주 그랬다', value: 2 }, { label: '대부분 그랬다', value: 3 } ] },
      { text: '너무 불행해서 울었다', options: [
        { label: '전혀 그렇지 않았다', value: 0 }, { label: '가끔 그랬다', value: 1 },
        { label: '자주 그랬다', value: 2 }, { label: '대부분 그랬다', value: 3 } ] },
      { text: '나 자신을 해치는 생각이 들었다', options: [
        { label: '전혀 그렇지 않았다', value: 0 }, { label: '거의 그렇지 않았다', value: 1 },
        { label: '가끔 그랬다', value: 2 }, { label: '자주 그랬다', value: 3 } ] }
    ],
    bands: [
      { max: 8, level: '정상 범위', tone: 'good',
        summary: '산후 우울을 시사하는 소견은 뚜렷하지 않습니다.',
        advice: '충분한 휴식과 주변의 도움이 가장 좋은 예방입니다. 기분은 주마다 달라질 수 있으니 힘들어지면 다시 확인해 보세요.' },
      { max: 12, level: '주의가 필요함', tone: 'moderate',
        summary: '산후 우울 가능성이 있는 범위입니다.',
        advice: '수면 부족과 호르몬 변화만으로 설명되지 않을 수 있습니다. 배우자·가족에게 상태를 알리고 상담을 받아보세요.' },
      { max: 30, level: '산후 우울 의심', tone: 'severe',
        summary: '전문적인 도움이 필요한 수준입니다.',
        advice: '산후 우울은 흔하고 치료가 잘 되는 상태입니다. 수유 중에도 안전하게 쓸 수 있는 치료 방법이 있으니 꼭 상담받아 보세요.' }
    ]
  },

  /* ═══════════════════════════════════════════ 불안 · 스트레스 ════════ */
  {
    id: 'gad7',
    category: 'anx',
    emoji: '💓',
    title: '불안 자가진단',
    label: '불안 선별',
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

  {
    id: 'pss10',
    category: 'anx',
    emoji: '🔥',
    title: '스트레스 자가진단',
    label: '스트레스 척도',
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
  },

  {
    id: 'dass21',
    category: 'anx',
    emoji: '🧭',
    title: '우울 · 불안 · 스트레스 통합검사',
    label: '통합 척도',
    tagline: '세 가지를 한 번에',
    blurb: '우울·불안·스트레스를 각각 따로 점수로 보여줍니다. 어느 쪽이 더 힘든 상태인지 구분할 때 유용합니다.',
    minutes: 4,
    prompt: '지난 <strong>일주일 동안</strong> 다음 내용이 자신에게 얼마나 해당되었나요?',
    options: APPLY_4,
    scoring: {
      type: 'subscales', multiplier: 2,
      groups: [
        { key: 'd', label: '우울', items: [2, 4, 9, 12, 15, 16, 20], max: 42,
          bands: [
            { max: 9,  level: '정상',      tone: 'good' },
            { max: 13, level: '경도',      tone: 'mild' },
            { max: 20, level: '중등도',    tone: 'moderate' },
            { max: 27, level: '심함',      tone: 'high' },
            { max: 42, level: '매우 심함', tone: 'severe' }
          ] },
        { key: 'a', label: '불안', items: [1, 3, 6, 8, 14, 18, 19], max: 42,
          bands: [
            { max: 7,  level: '정상',      tone: 'good' },
            { max: 9,  level: '경도',      tone: 'mild' },
            { max: 14, level: '중등도',    tone: 'moderate' },
            { max: 19, level: '심함',      tone: 'high' },
            { max: 42, level: '매우 심함', tone: 'severe' }
          ] },
        { key: 's', label: '스트레스', items: [0, 5, 7, 10, 11, 13, 17], max: 42,
          bands: [
            { max: 14, level: '정상',      tone: 'good' },
            { max: 18, level: '경도',      tone: 'mild' },
            { max: 25, level: '중등도',    tone: 'moderate' },
            { max: 33, level: '심함',      tone: 'high' },
            { max: 42, level: '매우 심함', tone: 'severe' }
          ] }
      ]
    },
    questions: [
      '사소한 일에도 예민하게 반응했다',
      '입이 말랐다',
      '긍정적인 감정을 전혀 느낄 수 없었다',
      '호흡이 힘들었다 (숨이 가쁘거나 숨이 막히는 느낌)',
      '무슨 일을 시작하기가 어려웠다',
      '상황에 과민하게 반응했다',
      '손이 떨렸다',
      '신경이 예민해져 에너지를 많이 소모했다',
      '당황해서 바보처럼 보일까 봐 걱정되는 상황이 두려웠다',
      '기대할 것이 아무것도 없다고 느꼈다',
      '초조하고 안절부절못했다',
      '긴장을 풀기 어려웠다',
      '우울하고 침울했다',
      '하던 일이 방해받으면 참기 어려웠다',
      '공황 상태에 빠질 것 같았다',
      '어떤 일에도 열정을 느낄 수 없었다',
      '나는 사람으로서 가치가 없다고 느꼈다',
      '다소 예민해져 있다고 느꼈다',
      '신체 활동이 없는데도 심장 박동이 느껴졌다',
      '뚜렷한 이유 없이 겁이 났다',
      '인생이 무의미하다고 느꼈다'
    ],
    /* 하위 척도 밴드에는 등급만 있으므로, 해설은 등급(tone)별로 여기서 가져옵니다 */
    toneText: {
      good: {
        summary: '세 영역 모두 정상 범위입니다.',
        advice: '지금의 생활 리듬을 유지해 보세요. 그럼에도 힘든 부분이 있다면 점수와 무관하게 편하게 상담받으셔도 됩니다.' },
      mild: {
        summary: '가장 높은 영역이 경도 수준입니다.',
        advice: '아직 일상에 큰 지장을 줄 정도는 아닙니다. 수면·활동량을 먼저 챙기시고, 2주 뒤 다시 확인해 보세요.' },
      moderate: {
        summary: '가장 높은 영역이 중등도 수준입니다.',
        advice: '가장 높게 나온 영역에 맞춰 개별 검사(우울·불안·스트레스)를 함께 해보시고, 결과가 비슷하다면 상담을 권합니다.' },
      high: {
        summary: '가장 높은 영역이 심한 수준입니다.',
        advice: '전문의 상담을 권해드립니다. 우울·불안·스트레스는 서로 영향을 주기 때문에 함께 다루는 것이 효과적입니다.' },
      severe: {
        summary: '가장 높은 영역이 매우 심한 수준입니다.',
        advice: '가능한 한 빠른 시일 내에 진료를 받아보세요. 세 영역이 함께 높다면 혼자 조절하기는 어려운 상태입니다.' }
    }
  },

  {
    id: 'pcl5',
    category: 'anx',
    emoji: '🫧',
    title: '외상후 스트레스 자가진단',
    label: '외상 반응 선별',
    tagline: '지난 한 달간의 반응',
    blurb: '사고·재난·폭력·상실 등 충격적인 경험 이후 나타나는 반응을 확인합니다. 겪은 일이 있으신 분만 이용하세요.',
    minutes: 4,
    prompt: '살면서 겪은 <strong>가장 충격적이었던 일</strong>을 떠올리며, 지난 <strong>한 달 동안</strong> 다음 문제로 얼마나 괴로웠는지 답해 주세요.',
    options: INTENSITY_5,
    scoring: { type: 'sum', max: 80 },
    questions: [
      '그 사건에 대한 반복적이고 힘든 기억이 떠오름',
      '그 사건에 대한 반복적이고 힘든 꿈을 꿈',
      '그 사건이 마치 다시 일어나고 있는 것처럼 갑자기 느끼거나 행동함',
      '그 사건이 떠오르면 매우 속상해짐',
      '그 사건이 떠오르면 심장이 뛰거나 숨이 가빠지는 등 몸이 강하게 반응함',
      '그 사건과 관련된 기억·생각·감정을 피하려 함',
      '그 사건을 떠올리게 하는 사람·장소·대화·활동·물건·상황을 피함',
      '그 사건의 중요한 부분을 기억하지 못함',
      '자신이나 타인, 세상에 대해 강한 부정적 믿음을 가짐',
      '그 사건이나 그 이후 벌어진 일에 대해 자신이나 남을 탓함',
      '두려움·공포·분노·죄책감·수치심 같은 강한 부정적 감정을 느낌',
      '이전에 즐기던 활동에 대한 흥미를 잃음',
      '다른 사람과 거리감이나 단절감을 느낌',
      '긍정적인 감정을 느끼기 어려움',
      '짜증나는 행동을 하거나 화를 터뜨리거나 공격적으로 행동함',
      '위험을 무릅쓰거나 자신을 해칠 수 있는 행동을 함',
      '지나치게 주변을 경계함',
      '깜짝깜짝 잘 놀람',
      '집중하기 어려움',
      '잠들거나 잠을 유지하기 어려움'
    ],
    bands: [
      { max: 30, level: '기준 미만', tone: 'good',
        summary: 'PTSD 선별 기준(31점)에는 못 미치는 수준입니다.',
        advice: '충격적인 일 이후의 반응은 시간이 지나며 자연히 줄어들기도 합니다. 다만 힘들다면 점수와 무관하게 상담을 받아보셔도 좋습니다.' },
      { max: 49, level: 'PTSD 시사', tone: 'moderate',
        summary: '외상후 스트레스 장애가 의심되는 범위입니다.',
        advice: '전문의 평가를 권합니다. PTSD는 시간이 지난다고 저절로 좋아지지 않는 경우가 많고, 치료 반응은 좋은 편입니다.' },
      { max: 80, level: '증상 심함', tone: 'severe',
        summary: '외상 관련 증상이 매우 두드러진 상태입니다.',
        advice: '가능한 한 빨리 진료를 받아보세요. 혼자 기억을 되짚기보다 안전한 환경에서 전문가와 함께 다루는 것이 중요합니다.' }
    ]
  },

  {
    id: 'ocir',
    category: 'anx',
    emoji: '🔁',
    title: '강박 증상 자가진단',
    label: '강박 선별',
    tagline: '지난 한 달간의 불편감',
    blurb: '확인, 정리, 오염, 반복되는 생각 등 강박 관련 증상 여섯 영역을 살펴봅니다.',
    minutes: 4,
    prompt: '지난 <strong>한 달 동안</strong> 다음 경험 때문에 얼마나 괴롭거나 불편했나요?',
    options: DISTRESS_5,
    scoring: { type: 'sum', max: 72 },
    questions: [
      '물건을 모아두어서 주변이 어지럽다',
      '물건이 제대로 정리되어 있는지 반복해서 확인한다',
      '마음속에 떠오르는 생각을 통제하기 어렵고 그 때문에 괴롭다',
      '별로 필요 없는 물건도 버리지 못하고 모아둔다',
      '물건이 특정한 순서로 놓여 있지 않으면 불편하다',
      '수도꼭지·가스·문을 잠갔는지 반복해서 확인한다',
      '불쾌한 생각이 떠올라 없애기가 어렵다',
      '무언가를 반복해서 세는 일이 잦다',
      '물건이 정확한 자리에 있지 않으면 화가 난다',
      '지저분해 보이는 물건을 만지면 오염되었다고 느낀다',
      '이미 한 일을 반복해서 다시 확인해야 한다',
      '마음속에 원치 않는 생각이 떠올라 괴롭다',
      '필요 없는 물건도 버리지 못하고 보관한다',
      '물건들이 정돈되어 있지 않으면 안절부절못한다',
      '어떤 일들을 반복해서 해야 할 것 같은 느낌이 든다',
      '원치 않는 생각을 없애려고 특정 숫자를 세거나 말을 되뇐다',
      '오염되었다는 생각 때문에 자주 손이나 몸을 씻는다',
      '나쁜 일이 일어나는 것을 막으려고 특정 행동을 반복한다'
    ],
    bands: [
      { max: 20, level: '정상 범위', tone: 'good',
        summary: '강박 증상 선별 기준(21점) 미만입니다.',
        advice: '누구나 확인하는 습관은 있습니다. 일상에 지장이 없다면 걱정하지 않으셔도 됩니다.' },
      { max: 40, level: '강박 증상 시사', tone: 'moderate',
        summary: '강박 관련 증상이 의미 있는 수준으로 보입니다.',
        advice: '강박은 의지로 참는다고 줄어들지 않습니다. 인지행동치료와 약물치료 반응이 좋은 편이니 상담을 권합니다.' },
      { max: 72, level: '증상 심함', tone: 'severe',
        summary: '강박 증상이 일상에 큰 부담을 주고 있는 것으로 보입니다.',
        advice: '가능한 한 빨리 전문의 진료를 받아보세요. 치료 시작이 이를수록 회복이 수월합니다.' }
    ]
  },

  /* ═══════════════════════════════════════════════ 수면 · 집중 ════════ */
  {
    id: 'isi',
    category: 'sleep',
    emoji: '🌙',
    title: '불면증 자가진단',
    label: '수면 척도',
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

  {
    id: 'asrs',
    category: 'sleep',
    emoji: '🧩',
    title: '성인 ADHD 자가진단',
    label: '주의력 선별',
    tagline: '지난 6개월간의 주의력·충동성',
    blurb: '성인 주의력 문제를 가려내는 선별 6문항입니다. 총점이 아니라 문항별 기준을 넘은 개수로 판단합니다.',
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

  /* ═══════════════════════════════════════════════ 웰빙 · 생활 ════════ */
  {
    id: 'who5',
    category: 'life',
    emoji: '☀️',
    title: '마음 웰빙 지수',
    label: '웰빙 지수',
    tagline: '지난 2주간의 삶의 활력',
    blurb: '증상을 묻는 대신 “요즘 얼마나 잘 지내고 있는지”를 봅니다. 5문항으로 1분이면 끝납니다.',
    minutes: 1,
    prompt: '지난 <strong>2주 동안</strong> 다음과 같이 느낀 시간이 얼마나 되었나요?',
    options: [
      { label: '전혀 없었다', value: 0 },
      { label: '가끔', value: 1 },
      { label: '절반 이하', value: 2 },
      { label: '절반 이상', value: 3 },
      { label: '대부분의 시간', value: 4 },
      { label: '항상', value: 5 }
    ],
    scoring: { type: 'sum', max: 25, multiplier: 4, displayMax: 100 },
    higherIsBetter: true,
    questions: [
      '나는 밝고 기분이 좋았다',
      '나는 차분하고 편안했다',
      '나는 활기차고 활동적이었다',
      '나는 상쾌한 기분으로 잠에서 깼다',
      '나의 일상은 흥미로운 일들로 가득했다'
    ],
    resultLabel: '웰빙 지수',
    resultUnit: '점',
    bands: [
      { max: 28, level: '웰빙 매우 저하', tone: 'severe',
        summary: '삶의 활력이 크게 떨어져 있습니다. 우울 상태가 동반되었을 가능성이 높습니다.',
        advice: '우울 자가진단을 함께 해보시고, 전문의 상담을 받아보시길 권합니다.' },
      { max: 50, level: '웰빙 저하', tone: 'moderate',
        summary: '평균보다 낮은 웰빙 수준입니다.',
        advice: '수면·햇빛·가벼운 운동·사람과의 만남 중 지금 가장 부족한 하나부터 채워보세요.' },
      { max: 75, level: '보통', tone: 'mild',
        summary: '무난한 수준의 웰빙입니다.',
        advice: '기분이 좋아지는 일을 일주일에 하나씩 일정에 넣어보세요.' },
      { max: 100, level: '양호', tone: 'good',
        summary: '활력 있게 잘 지내고 계십니다.',
        advice: '지금의 생활 방식을 기억해 두세요. 힘든 시기가 왔을 때 돌아갈 기준점이 됩니다.' }
    ]
  },

  {
    id: 'audit',
    category: 'life',
    emoji: '🍺',
    title: '음주 습관 자가진단',
    label: '음주 선별',
    tagline: '지난 1년간의 음주',
    blurb: '음주 습관이 건강과 일상에 부담을 주고 있는지 확인합니다. 술이 스트레스 대처 수단이 되고 있는지 살펴보세요.',
    minutes: 3,
    prompt: '평소 음주 습관과 <strong>지난 1년간</strong>의 경험을 기준으로 답해 주세요.',
    options: null,
    scoring: { type: 'sum', max: 40 },
    questions: [
      { text: '술을 얼마나 자주 마십니까?', options: [
        { label: '전혀 마시지 않는다', value: 0 }, { label: '월 1회 이하', value: 1 },
        { label: '월 2~4회', value: 2 }, { label: '주 2~3회', value: 3 }, { label: '주 4회 이상', value: 4 } ] },
      { text: '술을 마시는 날에는 보통 몇 잔을 마십니까? <small>(소주·맥주 등 한 잔 기준)</small>', options: [
        { label: '1~2잔', value: 0 }, { label: '3~4잔', value: 1 },
        { label: '5~6잔', value: 2 }, { label: '7~9잔', value: 3 }, { label: '10잔 이상', value: 4 } ] },
      { text: '한 번에 소주 1병(또는 맥주 4캔) 이상 마시는 경우가 얼마나 자주 있습니까?', options: DRINK_FREQ },
      { text: '지난 1년간, 술을 한번 마시기 시작하면 멈출 수 없었던 적이 얼마나 자주 있었습니까?', options: DRINK_FREQ },
      { text: '지난 1년간, 술 때문에 일상적으로 해야 할 일을 하지 못한 적이 얼마나 있었습니까?', options: DRINK_FREQ },
      { text: '지난 1년간, 과음한 다음 날 해장술을 마신 적이 얼마나 있었습니까?', options: DRINK_FREQ },
      { text: '지난 1년간, 음주 후 죄책감이나 후회를 느낀 적이 얼마나 있었습니까?', options: DRINK_FREQ },
      { text: '지난 1년간, 음주 때문에 전날 밤 일이 기억나지 않은 적이 얼마나 있었습니까?', options: DRINK_FREQ },
      { text: '음주 때문에 자신이나 다른 사람이 다친 적이 있습니까?', options: PAST_YEAR_3 },
      { text: '가족·친구·의사가 당신의 음주를 걱정하거나 술을 줄이라고 권한 적이 있습니까?', options: PAST_YEAR_3 }
    ],
    bands: [
      { max: 7, level: '정상 음주', tone: 'good',
        summary: '문제 음주를 시사하는 소견은 없습니다.',
        advice: '지금의 음주 습관을 유지하시면 됩니다. 잠들기 위해 술을 마시는 습관만은 피해주세요.' },
      { max: 15, level: '위험 음주', tone: 'moderate',
        summary: '지금은 문제가 없더라도 앞으로 위험해질 수 있는 수준입니다.',
        advice: '주 2회 이하, 한 번에 소주 반 병 이하를 목표로 줄여보세요. 우울·불안이 함께 있다면 술은 증상을 악화시킵니다.' },
      { max: 19, level: '유해 음주', tone: 'high',
        summary: '이미 건강이나 일상에 해를 주고 있을 가능성이 높습니다.',
        advice: '전문의 상담을 권합니다. 혼자 줄이기 어렵다면 도움을 받는 것이 훨씬 효과적입니다.' },
      { max: 40, level: '알코올 사용장애 의심', tone: 'severe',
        summary: '알코올 사용장애가 의심되는 수준입니다.',
        advice: '반드시 전문의 평가를 받아보세요. 갑작스러운 단주는 금단 증상으로 위험할 수 있어 의학적 관리가 필요합니다.' }
    ],
    footnote: '※ 여성과 65세 이상은 더 낮은 점수에서도 문제 음주로 볼 수 있어, 결과를 조금 더 엄격하게 해석하시길 권합니다.'
  }
];

/* ══════════════════════════════════════════════════════════ 채점 ════════ */
function sumItems(answers, items, reverse, revMax) {
  return items.reduce((acc, i) =>
    acc + ((reverse || []).includes(i) ? revMax - answers[i] : answers[i]), 0);
}

function scoreScreening(test, answers) {
  const s = test.scoring;

  /* 성향 프로파일: 차원별 점수와 높음/보통/낮음 (성격·투자 성향) */
  if (s.type === 'profile') {
    const groups = s.groups.map(g => {
      const raw = sumItems(answers, g.items, g.reverse, s.reverseMax);
      return { ...g, score: raw, level: g.levels.find(l => raw <= l.max) || g.levels[g.levels.length - 1] };
    });
    const top = groups.reduce((a, g) => (g.score / g.max > a.score / a.max ? g : a), groups[0]);
    return { groups, top, score: top.score, max: top.max };
  }

  /* 유형 선택: 점수가 가장 높은 유형 (에니어그램·직업흥미) */
  if (s.type === 'types') {
    const ranked = s.types
      .map(t => ({ ...t, score: sumItems(answers, t.items, t.reverse, s.reverseMax), max: t.items.length * s.itemMax }))
      .sort((a, b) => b.score - a.score);
    return { ranked, top: ranked[0], score: ranked[0].score, max: ranked[0].max };
  }

  /* 두 축의 조합으로 유형 결정 (애착 유형) */
  if (s.type === 'axes') {
    const axes = s.axes.map(a => {
      const raw = sumItems(answers, a.items, a.reverse, s.reverseMax);
      return { ...a, score: raw, high: raw >= a.threshold };
    });
    const key = axes.map(a => (a.high ? '1' : '0')).join('');
    return { axes, type: s.matrix[key], score: axes[0].score, max: axes[0].max };
  }

  if (s.type === 'threshold') {
    const count = answers.reduce((acc, v, i) => acc + (v >= s.thresholds[i] ? 1 : 0), 0);
    return { score: count, max: s.max };
  }

  if (s.type === 'mdq') {
    const symptoms = answers.slice(0, s.symptomCount).reduce((a, v) => a + v, 0);
    const positive = symptoms >= 7 && answers[s.clusterIndex] === 1 && answers[s.impairIndex] >= 2;
    return { score: symptoms, max: s.symptomCount, positive, flag: positive ? 1 : 0 };
  }

  if (s.type === 'subscales') {
    const groups = s.groups.map(g => {
      const raw = g.items.reduce((a, i) => a + answers[i], 0) * (s.multiplier || 1);
      return { ...g, score: raw, band: g.bands.find(b => raw <= b.max) || g.bands[g.bands.length - 1] };
    });
    /* 대표 점수는 가장 심한 하위 척도를 기준으로 삼습니다 */
    const order = ['good', 'mild', 'moderate', 'high', 'severe'];
    const worst = groups.reduce((w, g) =>
      order.indexOf(g.band.tone) > order.indexOf(w.band.tone) ? g : w, groups[0]);
    return { groups, worst, score: worst.score, max: worst.max };
  }

  const reverse = s.reverse || [];
  const total = answers.reduce((acc, v, i) => acc + (reverse.includes(i) ? s.reverseMax - v : v), 0);
  const score = total * (s.multiplier || 1);
  return { score, max: s.displayMax || s.max };
}

function bandFor(test, score) {
  /* 성향·유형 검사는 심각도 등급이 없으므로 중립 밴드를 씁니다 */
  const t = test.scoring.type;
  if (t === 'profile') return { level: score.top.label + ' 우세', tone: 'neutral' };
  if (t === 'types')   return { level: score.top.label, tone: 'neutral' };
  if (t === 'axes')    return { level: score.type.label, tone: 'neutral' };

  /* 하위 척도형은 상위 bands 가 없고, 가장 심한 하위 척도의 밴드를 대표로 씁니다 */
  if (t === 'subscales') return score.worst.band;

  if (test.scoring.type === 'mdq') return test.bands[score.flag ? 1 : 0];

  const n = typeof score === 'object' ? score.score : score;
  return test.bands.find(b => n <= b.max) || test.bands[test.bands.length - 1];
}

function questionOf(test, index) {
  const q = test.questions[index];
  return typeof q === 'string' ? { text: q, options: test.options } : q;
}
