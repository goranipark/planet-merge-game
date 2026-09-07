# 행성 합치기 게임 (Planet Merge Game)

초등학교 4학년 2학기 과학 태양계 수업용으로 만든 웹 게임입니다.
같은 천체 두 개를 부딪히면 더 큰 천체로 합쳐지며, 소행성에서 시작해 태양까지 키우는 것이 목표입니다.

**바로 하기**: https://goranipark.github.io/planet-merge-game/

## 학습 요소

- 태양계 천체를 **실제 지름이 작은 것부터 큰 순서**로 체험 (태양계 배열 순서가 아님을 화면에 명시)
- 새로운 천체를 처음 만들면 정보 카드가 뜨며 실제 지름, 지구와의 크기 비교, 특징을 안내
- 설치 없이 링크만으로 크롬북·아이패드·윈도우에서 모두 실행
- **학급 코드**: `?room=코드` 링크로 접속하면 그 반 학생들끼리만 순위를 겨룸 (개인정보는 여전히 수집하지 않음)
- **공용 기기 배려**: 최고 점수·별명·본 정보 카드는 탭을 닫으면 초기화 (`config.js`의 `RESET_ON_TAB_CLOSE`)

## 저작권 및 라이선스

Copyright (c) 2026 Gorani_Park — [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.ko)

출처를 밝히면 다른 선생님도 자유롭게 사용하고 수정할 수 있습니다(비영리에 한함).
자세한 내용은 저장소 최상위의 [LICENSE](../LICENSE) 파일을 참고하세요.

**직접 제작한 것**: 천체 일러스트는 모두 코드로 그린 SVG이고, 배경음악과 효과음은
Web Audio API로 실시간 합성합니다. 외부에서 가져온 이미지·음원 파일이 없습니다.

**참고**: 낙하 합치기 방식의 퍼즐 게임 장르를 참고했으며, 특정 게임과 제휴하거나 관련이 없습니다.

**사용한 오픈소스**: Matter.js, React, Vite (모두 MIT) / 글꼴 Jua, Noto Sans KR (SIL OFL)

## 이 저장소를 복사해서 쓰시는 분께 ⚠️

이 저장소를 그대로 복사(fork)해 배포하면 **원본과 같은 순위표를 함께 쓰게 됩니다.**
학교별로 따로 운영하시려면 둘 중 하나를 선택하세요.

1. **순위표를 끄기** — `src/game/leaderboardConfig.js`의 `FIREBASE_CONFIG` 값을 모두 빈 문자열(`''`)로
   두면 "이 기기에만 저장되는 연습용" 순위표로 동작합니다.
2. **내 순위표 만들기** — [FIREBASE-설정안내.md](../FIREBASE-설정안내.md)를 따라 본인 Firebase 프로젝트를
   만들고 그 설정값으로 교체하세요.

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
