// ---------------------------------------------------------------
// 사운드 애셋 교체 설정
// ---------------------------------------------------------------
// 값이 null 이면 audio.js 가 코드로 합성한 소리를 사용합니다.
// 나중에 무료 음원(CC0 등) 파일로 바꾸고 싶으면,
//   1) 파일을 src/assets/audio/ 폴더에 넣고
//   2) 아래처럼 import 한 뒤 해당 항목에 넣어주면 됩니다.
//
//   import mergeSfx from '../assets/audio/merge.mp3'
//   import bgmLoop from '../assets/audio/space-ambient.ogg'
//   export const SOUND_ASSETS = { ..., merge: mergeSfx, bgm: bgmLoop }
//
// 지원 형식: 브라우저가 재생할 수 있는 mp3 / ogg / wav
// merge 는 단계가 높을수록 재생 속도(음높이)가 살짝 올라가도록 처리됩니다.
// ---------------------------------------------------------------

export const SOUND_ASSETS = {
  drop: null, // 천체를 떨어뜨릴 때 (짧은 swoosh)
  land: null, // 바닥/다른 천체에 부딪힐 때 (툭)
  merge: null, // 병합 성공 (밝은 chime)
  gameover: null, // 게임오버 (낮은 경고음)
  bgm: null, // 배경음악 (루프 재생)
}

// 소리별 기본 음량 (0~1). 파일로 교체했을 때 너무 크거나 작으면 여기서 조절
export const SOUND_VOLUMES = {
  drop: 0.35,
  land: 0.3,
  merge: 0.5,
  gameover: 0.6,
  bgm: 0.18,
}
