// 안전한 별명 만들기
// 학생이 직접 타이핑하지 않고 "성격 + 모습 + 동물" 세 낱말을 조합한 별명 중에서 고르게 합니다.
// → 부적절한 말이 올라올 가능성이 원천적으로 없습니다.
// (금지어 필터 방식은 띄어쓰기·자음 변형으로 우회할 수 있어 초등 대상에는 권장하지 않습니다.)
//
// 낱말을 추가·수정한 뒤에는 반드시 아래를 실행해 서버 규칙도 함께 갱신하세요.
//   cd planet-merge-game && npm run rules
//   firebase deploy --only firestore:rules

// 1) 성격·기분
export const ADJECTIVES = [
  '용감한', '씩씩한', '심약한', '수줍은', '다정한', '엉뚱한',
  '느긋한', '부지런한', '명랑한', '진지한', '상냥한', '똑똑한',
  '재빠른', '든든한', '장난스런', '우아한', '침착한', '유쾌한',
  '소심한', '대범한', '신중한', '활발한', '정직한', '슬기로운',
  '까칠한', '무뚝뚝한', '느릿한', '엉성한', '깜찍한', '늠름한',
]

// 2) 모습·상태
export const TRAITS = [
  '안경쓴', '콧물나는', '춤추는', '노래하는', '잠자는', '하품하는',
  '모자쓴', '목도리한', '우주복입은', '우산쓴', '장화신은', '별을든',
  '책읽는', '웃고있는', '달리는', '구르는', '헤엄치는', '점프하는',
  '낮잠자는', '간식먹는', '사진찍는', '손흔드는', '훌쩍이는', '재채기하는',
  '딸꾹질하는', '기지개켜는', '휘파람부는', '망원경든', '풍선든', '케이크든',
]

// 3) 동물
export const ANIMALS = [
  '코끼리', '호랑이', '사자', '토끼', '다람쥐', '고양이',
  '강아지', '판다', '펭귄', '여우', '곰', '늑대',
  '사슴', '기린', '하마', '고래', '돌고래', '거북이',
  '문어', '오리', '부엉이', '독수리', '참새', '개구리',
  '두더지', '햄스터', '고슴도치', '너구리', '수달', '알파카',
  '카피바라', '나무늘보',
]

function pick(list) {
  return list[Math.floor(Math.random() * list.length)]
}

// 별명 1개 만들기 (예: "용감한 안경쓴 코끼리")
export function generateNickname() {
  return `${pick(ADJECTIVES)} ${pick(TRAITS)} ${pick(ANIMALS)}`
}

// 서로 겹치지 않는 별명 여러 개 만들기 (고르기 화면용)
export function generateChoices(count = 4) {
  const set = new Set()
  let guard = 0
  while (set.size < count && guard < 200) {
    set.add(generateNickname())
    guard++
  }
  return [...set]
}

// 만들어진 별명이 맞는지 확인 (조작된 값이 올라오는 것을 막기 위한 검사)
export function isGeneratedNickname(nickname) {
  const parts = String(nickname ?? '').split(' ')
  return (
    parts.length === 3 &&
    ADJECTIVES.includes(parts[0]) &&
    TRAITS.includes(parts[1]) &&
    ANIMALS.includes(parts[2])
  )
}

// 만들 수 있는 별명 가짓수
export const COMBINATION_COUNT =
  ADJECTIVES.length * TRAITS.length * ANIMALS.length
