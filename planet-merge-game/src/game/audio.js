// 오디오 매니저 — Web Audio API 기반
// - 기본: 모든 소리를 코드로 합성 (음원 파일 불필요)
// - soundAssets.js 에 파일이 지정된 소리는 파일을 로드해서 대신 재생
// - 브라우저 정책상 소리는 사용자가 한 번 클릭한 뒤부터 나므로 unlock() 을 첫 클릭 때 호출
import { SOUND_ASSETS, SOUND_VOLUMES } from './soundAssets'

export function createAudioManager() {
  let ctx = null
  let master = null
  let muted = false
  let bgmHandle = null // { stop() }
  const buffers = {} // 파일 애셋 디코딩 결과 캐시
  const loading = {}

  // ---------- 초기화 ----------
  function ensureContext() {
    if (ctx) return ctx
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = muted ? 0 : 1
    master.connect(ctx.destination)
    // 지정된 파일 애셋 미리 로드
    for (const name of Object.keys(SOUND_ASSETS)) {
      if (SOUND_ASSETS[name]) loadAsset(name)
    }
    return ctx
  }

  function unlock() {
    const c = ensureContext()
    if (c && c.state === 'suspended') c.resume()
  }

  async function loadAsset(name) {
    if (buffers[name] || loading[name]) return loading[name]
    loading[name] = fetch(SOUND_ASSETS[name])
      .then((r) => r.arrayBuffer())
      .then((data) => ctx.decodeAudioData(data))
      .then((buf) => {
        buffers[name] = buf
        return buf
      })
      .catch((err) => {
        console.warn(`[audio] "${name}" 파일을 불러오지 못해 합성음으로 대체합니다.`, err)
        return null
      })
    return loading[name]
  }

  // ---------- 공통 유틸 ----------
  function gainNode(volume, when = 0) {
    const g = ctx.createGain()
    g.gain.setValueAtTime(volume, ctx.currentTime + when)
    g.connect(master)
    return g
  }

  function envelope(g, start, attack, hold, release, peak) {
    const t = ctx.currentTime + start
    g.gain.cancelScheduledValues(t)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(peak, t + attack)
    g.gain.setValueAtTime(peak, t + attack + hold)
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + hold + release)
  }

  function noiseBuffer(seconds) {
    const len = Math.floor(ctx.sampleRate * seconds)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
    return buf
  }

  // 파일 애셋 재생 (있을 때만 true 반환)
  function playBuffer(name, { rate = 1, volume = 1 } = {}) {
    const buf = buffers[name]
    if (!buf) return false
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.playbackRate.value = rate
    src.connect(gainNode(volume))
    src.start()
    return true
  }

  // ---------- 합성 효과음 ----------
  function synthDrop() {
    // 짧은 swoosh: 밴드패스 노이즈가 내려가는 소리
    const v = SOUND_VOLUMES.drop
    const src = ctx.createBufferSource()
    src.buffer = noiseBuffer(0.25)
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.Q.value = 1.2
    const t = ctx.currentTime
    filter.frequency.setValueAtTime(2200, t)
    filter.frequency.exponentialRampToValueAtTime(500, t + 0.2)
    const g = ctx.createGain()
    envelope(g, 0, 0.01, 0.05, 0.16, v)
    src.connect(filter).connect(g).connect(master)
    src.start(t)
    src.stop(t + 0.3)
  }

  function synthLand() {
    // 툭: 낮은 사인파가 빠르게 내려감 + 아주 짧은 노이즈
    const v = SOUND_VOLUMES.land
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(150, t)
    osc.frequency.exponentialRampToValueAtTime(55, t + 0.12)
    const g = ctx.createGain()
    envelope(g, 0, 0.005, 0.02, 0.12, v)
    osc.connect(g).connect(master)
    osc.start(t)
    osc.stop(t + 0.2)

    const n = ctx.createBufferSource()
    n.buffer = noiseBuffer(0.05)
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 900
    const ng = ctx.createGain()
    envelope(ng, 0, 0.003, 0.01, 0.04, v * 0.5)
    n.connect(lp).connect(ng).connect(master)
    n.start(t)
    n.stop(t + 0.06)
  }

  function synthMerge(stage) {
    // 밝은 chime: 단계가 높을수록 음이 올라감. 기본음 + 완전5도 + 옥타브를 살짝 시차 두고 재생
    const v = SOUND_VOLUMES.merge
    const base = 392 * Math.pow(1.09, stage) // G4 부터 단계별 상승
    const notes = [1, 1.5, 2].map((ratio, i) => ({ f: base * ratio, delay: i * 0.06 }))
    const t = ctx.currentTime
    for (const { f, delay } of notes) {
      const osc = ctx.createOscillator()
      osc.type = 'triangle'
      osc.frequency.value = f
      const g = ctx.createGain()
      envelope(g, delay, 0.008, 0.06, 0.45, v * 0.6)
      osc.connect(g).connect(master)
      osc.start(t + delay)
      osc.stop(t + delay + 0.6)

      // 반짝이는 배음
      const shimmer = ctx.createOscillator()
      shimmer.type = 'sine'
      shimmer.frequency.value = f * 2
      const sg = ctx.createGain()
      envelope(sg, delay, 0.005, 0.02, 0.25, v * 0.15)
      shimmer.connect(sg).connect(master)
      shimmer.start(t + delay)
      shimmer.stop(t + delay + 0.35)
    }
  }

  function synthGameOver() {
    // 낮은 경고음: 톱니파가 천천히 내려가며 어두워짐
    const v = SOUND_VOLUMES.gameover
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(220, t)
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.9)
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.setValueAtTime(1200, t)
    lp.frequency.exponentialRampToValueAtTime(200, t + 0.9)
    const g = ctx.createGain()
    envelope(g, 0, 0.02, 0.5, 0.5, v)
    osc.connect(lp).connect(g).connect(master)
    osc.start(t)
    osc.stop(t + 1.1)

    const sub = ctx.createOscillator()
    sub.type = 'sine'
    sub.frequency.setValueAtTime(110, t)
    sub.frequency.exponentialRampToValueAtTime(40, t + 0.9)
    const sg = ctx.createGain()
    envelope(sg, 0, 0.02, 0.5, 0.5, v * 0.6)
    sub.connect(sg).connect(master)
    sub.start(t)
    sub.stop(t + 1.1)
  }

  // ---------- 합성 BGM (우주 앰비언트) ----------
  function synthBgm() {
    const v = SOUND_VOLUMES.bgm
    const out = ctx.createGain()
    out.gain.setValueAtTime(0.0001, ctx.currentTime)
    out.gain.exponentialRampToValueAtTime(v, ctx.currentTime + 3) // 천천히 페이드 인
    out.connect(master)

    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 900
    lp.connect(out)

    // 1) 드론: 살짝 어긋난 사인파 코드 (A2 - E3 - A3 - C#4) 가 천천히 흔들림
    const droneFreqs = [110, 164.81, 220, 277.18]
    const nodes = []
    for (const f of droneFreqs) {
      for (const detune of [-4, 4]) {
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = f
        osc.detune.value = detune
        const g = ctx.createGain()
        g.gain.value = 0.12
        osc.connect(g).connect(lp)
        osc.start()
        nodes.push(osc)
      }
    }

    // 필터를 아주 느리게 여닫아서 숨 쉬는 느낌
    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 0.05
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 400
    lfo.connect(lfoGain).connect(lp.frequency)
    lfo.start()
    nodes.push(lfo)

    // 2) 가끔 울리는 별빛 종소리 (펜타토닉)
    const scale = [440, 493.88, 554.37, 659.25, 739.99, 880, 987.77, 1108.73]
    let bellTimer = null
    let stopped = false
    function scheduleBell() {
      if (stopped) return
      const wait = 1800 + Math.random() * 3200
      bellTimer = setTimeout(() => {
        if (stopped) return
        const f = scale[Math.floor(Math.random() * scale.length)]
        const t = ctx.currentTime
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = f
        const g = ctx.createGain()
        envelope(g, 0, 0.02, 0.1, 2.2, 0.22)
        osc.connect(g).connect(out)
        osc.start(t)
        osc.stop(t + 2.5)
        scheduleBell()
      }, wait)
    }
    scheduleBell()

    return {
      stop() {
        stopped = true
        clearTimeout(bellTimer)
        const t = ctx.currentTime
        out.gain.cancelScheduledValues(t)
        out.gain.setValueAtTime(out.gain.value, t)
        out.gain.exponentialRampToValueAtTime(0.0001, t + 1)
        setTimeout(() => nodes.forEach((n) => n.stop()), 1100)
      },
    }
  }

  function fileBgm() {
    const src = ctx.createBufferSource()
    src.buffer = buffers.bgm
    src.loop = true
    const g = gainNode(0.0001)
    g.gain.exponentialRampToValueAtTime(SOUND_VOLUMES.bgm, ctx.currentTime + 2)
    src.connect(g)
    src.start()
    return {
      stop() {
        const t = ctx.currentTime
        g.gain.cancelScheduledValues(t)
        g.gain.setValueAtTime(g.gain.value, t)
        g.gain.exponentialRampToValueAtTime(0.0001, t + 1)
        setTimeout(() => src.stop(), 1100)
      },
    }
  }

  // ---------- 공개 API ----------
  function play(name, detail = {}) {
    if (!ensureContext()) return
    if (ctx.state === 'suspended') ctx.resume()

    switch (name) {
      case 'drop':
        if (!playBuffer('drop', { volume: SOUND_VOLUMES.drop })) synthDrop()
        break
      case 'land':
        if (!playBuffer('land', { volume: SOUND_VOLUMES.land })) synthLand()
        break
      case 'merge': {
        const stage = detail.stage ?? 0
        const rate = 1 + stage * 0.05 // 파일 애셋일 때 단계별로 살짝 높아짐
        if (!playBuffer('merge', { rate, volume: SOUND_VOLUMES.merge })) synthMerge(stage)
        break
      }
      case 'gameover':
        if (!playBuffer('gameover', { volume: SOUND_VOLUMES.gameover })) synthGameOver()
        break
      default:
        break
    }
  }

  async function startBgm() {
    if (!ensureContext() || bgmHandle) return
    if (ctx.state === 'suspended') await ctx.resume()
    if (SOUND_ASSETS.bgm) await loadAsset('bgm')
    if (bgmHandle) return
    bgmHandle = buffers.bgm ? fileBgm() : synthBgm()
  }

  function stopBgm() {
    if (!bgmHandle) return
    bgmHandle.stop()
    bgmHandle = null
  }

  function setMuted(value) {
    muted = value
    if (master) {
      const t = ctx.currentTime
      master.gain.cancelScheduledValues(t)
      master.gain.setValueAtTime(master.gain.value, t)
      master.gain.linearRampToValueAtTime(muted ? 0 : 1, t + 0.08)
    }
  }

  function isMuted() {
    return muted
  }

  function dispose() {
    stopBgm()
    if (ctx) ctx.close()
    ctx = null
    master = null
  }

  return { unlock, play, startBgm, stopBgm, setMuted, isMuted, dispose }
}
