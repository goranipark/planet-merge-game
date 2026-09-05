import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages 배포 시 주소가 https://<사용자>.github.io/<저장소이름>/ 형태가 되므로
// 저장소 이름을 base 경로로 넣어야 합니다. GitHub Actions 가 GITHUB_REPOSITORY("사용자/저장소") 를
// 자동으로 넘겨주므로 여기서 읽어 씁니다. 로컬 개발(npm run dev)에서는 그냥 '/' 입니다.
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
const base = repo ? `/${repo}/` : '/'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base,
})
