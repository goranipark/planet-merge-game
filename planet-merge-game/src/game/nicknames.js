// 안전한 별명 만들기
// 학생이 직접 타이핑하지 않고 "꾸밈말 + 우주 낱말"을 조합한 별명 중에서 고르게 합니다.
// → 부적절한 말이 올라올 가능성이 원천적으로 없습니다.
// (금지어 필터 방식은 띄어쓰기·자음 변형으로 우회할 수 있어 초등 대상에는 권장하지 않습니다.)

// 꾸밈말 (4글자 이하)
export const ADJECTIVES = [
  '반짝이는', '빛나는', '씩씩한', '용감한', '슬기로운', '재빠른',
  '다정한', '든든한', '신나는', '멋진', '귀여운', '부지런한',
  '상냥한', '똑똑한', '자유로운', '따뜻한', '명랑한', '힘찬',
  '푸른', '붉은', '은빛', '금빛', '날쌘', '착한',
  '높이나는', '꿈꾸는', '노래하는', '춤추는', '웃는', '달리는',
]

// 우주 낱말 (4글자 이하)
export const NOUNS = [
  '소행성', '달빛', '수성', '화성', '금성', '지구',
  '해왕성', '천왕성', '토성', '목성', '태양', '별똥별',
  '은하수', '우주선', '탐험가', '망원경', '오로라', '혜성',
  '성운', '북극성', '우주인', '나침반', '보름달', '초승달',
  '유성우', '천문대', '로켓', '위성', '별자리', '우주복',
]

function pick(list) {
  return list[Math.floor(Math.random() * list.length)]
}

// 별명 1개 만들기 (최대 8글자)
export function generateNickname() {
  return `${pick(ADJECTIVES)}${pick(NOUNS)}`
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
  return ADJECTIVES.some(
    (adj) =>
      nickname.startsWith(adj) && NOUNS.includes(nickname.slice(adj.length))
  )
}
