// firestore.rules 의 별명 검사 정규식을 nicknames.js 목록에서 자동 생성합니다.
// 별명 낱말을 추가·수정한 뒤에는 아래 명령을 실행하고 규칙을 다시 배포하세요.
//
//   cd planet-merge-game && npm run rules
//   firebase deploy --only firestore:rules
//
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '..')
const rulesPath = resolve(repoRoot, 'firestore.rules')
const nicknamesPath = resolve(repoRoot, 'planet-merge-game/src/game/nicknames.js')

const { ADJECTIVES, NOUNS } = await import(`file://${nicknamesPath}`)

// 정규식 특수문자가 섞여 들어가지 않도록 한글/영숫자만 허용
const safe = (word) => {
  if (!/^[가-힣A-Za-z0-9]+$/.test(word)) {
    throw new Error(`별명 낱말에 사용할 수 없는 문자가 있습니다: "${word}"`)
  }
  return word
}

const pattern = `^(${ADJECTIVES.map(safe).join('|')})(${NOUNS.map(safe).join('|')})$`
const line = `        && data.nickname.matches('${pattern}') // NICKNAME_PATTERN (자동 생성: npm run rules)`

const rules = await readFile(rulesPath, 'utf8')
if (!rules.includes('// NICKNAME_PATTERN')) {
  throw new Error('firestore.rules 에 // NICKNAME_PATTERN 표시가 있는 줄을 찾지 못했습니다.')
}

const updated = rules
  .split('\n')
  .map((row) => (row.includes('// NICKNAME_PATTERN') ? line : row))
  .join('\n')

await writeFile(rulesPath, updated, 'utf8')
console.log(
  `firestore.rules 갱신 완료 — 허용 별명 ${ADJECTIVES.length} x ${NOUNS.length} = ${ADJECTIVES.length * NOUNS.length}가지`
)
