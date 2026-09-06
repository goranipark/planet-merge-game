// 화면 하단 저작권 / 출처 표기
// 표기 이름이나 라이선스를 바꾸려면 아래 상수만 수정하면 됩니다.
const HOLDER = 'Gorani_Park'
const YEAR = 2026
const LICENSE_NAME = 'CC BY-NC 4.0'
const LICENSE_URL = 'https://creativecommons.org/licenses/by-nc/4.0/deed.ko'

function SiteFooter() {
  return (
    <footer className="site-footer">
      <p className="footer-copyright">
        © {YEAR} {HOLDER}. 초등 과학 &lsquo;태양계와 별&rsquo; 단원 수업용으로 만든
        교육 자료입니다.
      </p>
      <p>
        출처를 밝히면 자유롭게 사용·수정할 수 있습니다 (비영리){' '}
        <a href={LICENSE_URL} target="_blank" rel="noopener noreferrer">
          {LICENSE_NAME}
        </a>
      </p>
      <p className="footer-credits">
        천체 그림과 효과음은 모두 직접 제작했습니다. 물리 엔진{' '}
        <a
          href="https://brm.io/matter-js/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Matter.js
        </a>
        , 화면 구성{' '}
        <a href="https://react.dev/" target="_blank" rel="noopener noreferrer">
          React
        </a>{' '}
        (MIT) · 글꼴 Jua, Noto Sans KR (SIL OFL)
      </p>
      <p className="footer-credits">
        낙하 합치기 방식의 퍼즐 게임 장르를 참고했으며, 특정 게임과 제휴하거나
        관련이 없습니다.
      </p>
    </footer>
  )
}

export default SiteFooter
