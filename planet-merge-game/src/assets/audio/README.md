# 오디오 애셋 폴더

현재는 모든 소리를 코드(Web Audio API)로 합성하므로 이 폴더는 비어 있습니다.

무료 음원 파일로 교체하려면:

1. CC0 등 저작권이 확인된 mp3 / ogg / wav 파일을 이 폴더에 넣습니다.
2. `src/game/soundAssets.js` 를 열어 안내에 따라 import 하고 해당 항목(`drop`, `land`, `merge`, `gameover`, `bgm`)에 연결합니다.
3. 다시 `npm run dev` 로 실행하면 그 소리만 파일로 재생됩니다. (나머지는 계속 합성음 사용)

추천 무료 음원 사이트: https://pixabay.com/sound-effects/ , https://freesound.org/ (라이선스 CC0 필터)
