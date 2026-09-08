// ver1 — 크기 순서 모드
// 소행성부터 태양까지, 천체의 "실제 지름"이 작은 것부터 큰 순서로 합쳐 갑니다.
//
// 한 모드에 필요한 것(천체 목록·점수·그림·안내 문구)을 한 덩어리로 묶어 둡니다.
// 엔진과 화면은 "지금 어떤 모드인지"만 알면 되므로, 새 모드를 추가하기 쉬워집니다.
// 안내 문구에 굵은 글씨가 들어가서 파일 확장자가 .jsx 입니다.
import { STAGES } from '../objects'
import { getSprite, SPRITE_DISC_DIAMETER } from '../sprites'
import { MODE_TUNING } from '../config'

// 지구 지름(km) — "지구의 몇 배"를 계산하는 기준값
const EARTH_KM = 12742

// 지구와 크기 비교 문구
function compareToEarth(diameterKm) {
  const ratio = diameterKm / EARTH_KM
  if (Math.abs(ratio - 1) < 0.01) return '우리가 사는 지구예요'
  if (ratio > 1) {
    const n = ratio >= 10 ? Math.round(ratio) : Math.round(ratio * 10) / 10
    return `지구보다 약 ${n}배 커요`
  }
  if (ratio >= 0.1) return `지구의 약 ${Math.round(ratio * 10) / 10}배 크기예요`
  return `지구의 약 ${Math.round(1 / ratio)}분의 1 크기예요`
}

export const sizeMode = {
  id: 'size',
  name: '크기 순서 게임',
  // 이 모드에 등장하는 천체 목록 (0단계부터 차례로 합쳐짐)
  stages: STAGES,
  // 처음 몇 단계까지만 랜덤으로 떨어질지
  spawnPoolSize: MODE_TUNING.size.spawnPoolSize,
  // 병합 결과 단계별 점수
  mergeScores: MODE_TUNING.size.mergeScores,
  // 그림 생성기 (단계 번호 + 표정 → 이미지)
  getSprite,
  // 스프라이트 원본 크기 — 물리 반지름에 맞춰 축소·확대할 때 기준이 됩니다
  spriteDiscDiameter: SPRITE_DISC_DIAMETER,
  // 모드 선택 화면에 보여줄 소개
  select: {
    emoji: '🪐',
    tagline: '작은 것부터 큰 순서로',
    lines: ['소행성 → 달 → 수성 → 화성 → 금성 →', '지구 → 해왕성 → … → 목성 → 태양'],
    footnote: '11단계 · 실제 지름이 작은 것부터',
  },
  // 정보 카드에 무엇을 보여줄지
  card: {
    badge: '✨ 새로운 천체 발견!',
    stats: (def) => [
      { label: '실제 지름', value: `약 ${def.diameterKm.toLocaleString('ko-KR')} km` },
      { label: '크기 비교', value: compareToEarth(def.diameterKm) },
    ],
  },
  // 화면 왼쪽 순서표 패널 문구
  guide: {
    title: '크기 순서표',
    hint: '같은 천체 2개 → 다음 천체',
    note: (
      <>
        실제 <strong>지름이 작은 것부터 큰 순서</strong>예요. 태양에서 가까운
        순서(태양계 배열)가 아니에요!
      </>
    ),
  },
}
