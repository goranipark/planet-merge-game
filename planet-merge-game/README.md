# 행성 합치기 게임 (Planet Merge Game)

초등학교 5~6학년 과학 "태양계와 별" 단원 수업용으로 만든 웹 게임입니다.
같은 천체 두 개를 부딪히면 더 큰 천체로 합쳐지며, 소행성에서 시작해 태양까지 키우는 것이 목표입니다.

**바로 하기**: https://goranipark.github.io/planet-merge-game/

## 학습 요소

- 태양계 천체를 **실제 지름이 작은 것부터 큰 순서**로 체험 (태양계 배열 순서가 아님을 화면에 명시)
- 새로운 천체를 처음 만들면 정보 카드가 뜨며 실제 지름, 지구와의 크기 비교, 특징을 안내
- 설치 없이 링크만으로 크롬북·아이패드·윈도우에서 모두 실행

## 저작권 및 라이선스

Copyright (c) 2026 Gorani_Park — [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.ko)

출처를 밝히면 다른 선생님도 자유롭게 사용하고 수정할 수 있습니다(비영리에 한함).
자세한 내용은 저장소 최상위의 [LICENSE](../LICENSE) 파일을 참고하세요.

**직접 제작한 것**: 천체 일러스트는 모두 코드로 그린 SVG이고, 배경음악과 효과음은
Web Audio API로 실시간 합성합니다. 외부에서 가져온 이미지·음원 파일이 없습니다.

**참고**: 낙하 합치기 방식의 퍼즐 게임 장르를 참고했으며, 특정 게임과 제휴하거나 관련이 없습니다.

**사용한 오픈소스**: Matter.js, React, Vite (모두 MIT) / 글꼴 Jua, Noto Sans KR (SIL OFL)

## 개발자용 안내

```bash
npm install     # 최초 1회
npm run dev     # 개발 서버 실행 (http://localhost:5173)
npm run build   # 배포용 빌드
```

게임 난이도와 조작감은 [`src/game/config.js`](src/game/config.js) 한 파일에서 조정합니다
(병 크기, 천체 크기 배율, 게임오버 판정, 낙하 쿨다운, 중력·마찰, 점수표).

효과음을 음원 파일로 교체하려면 [`src/game/soundAssets.js`](src/game/soundAssets.js)의 안내를 따르세요.

`main` 브랜치에 push하면 GitHub Actions가 자동으로 GitHub Pages에 배포합니다.
