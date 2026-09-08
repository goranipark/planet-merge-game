// ver1 — 크기 순서 모드
// 소행성부터 태양까지, 천체의 "실제 지름"이 작은 것부터 큰 순서로 합쳐 갑니다.
//
// 한 모드에 필요한 것(천체 목록·점수·그림·안내 문구)을 한 덩어리로 묶어 둡니다.
// 엔진과 화면은 "지금 어떤 모드인지"만 알면 되므로, 새 모드를 추가하기 쉬워집니다.
// 안내 문구에 굵은 글씨가 들어가서 파일 확장자가 .jsx 입니다.
import { STAGES } from '../objects'
import { getSprite, SPRITE_DISC_DIAMETER } from '../sprites'
import { MODE_TUNING } from '../config'

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
