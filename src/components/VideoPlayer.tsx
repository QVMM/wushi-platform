import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { formatTime, type Keyframe } from '../data/lessons'
import { poseTrackUrlForVideo } from '../data/poseTracks'
import { usePoseTrack } from '../hooks/usePoseTrack'
import { drawPoseCanvas } from '../lib/pose'

interface Props {
  poster: string
  videoUrl: string
  durationSec: number
  keyframes: Keyframe[]
  currentTime: number
  onTimeChange: (t: number) => void
  /** Video overlay: offline pose-track 跟拍骨架 */
  trackOn: boolean
  onTrackToggle: () => void
  /** Right-panel teaching analysis 节点分析 */
  analysisOn: boolean
  onAnalysisToggle: () => void
  selectedKeyframeId: string | null
  onSelectKeyframe: (id: string) => void
}

export function VideoPlayer({
  poster,
  videoUrl,
  durationSec,
  keyframes,
  currentTime,
  onTimeChange,
  trackOn,
  onTrackToggle,
  analysisOn,
  onAnalysisToggle,
  selectedKeyframeId,
  onSelectKeyframe,
}: Props) {
  const [playing, setPlaying] = useState(false)
  const [rate, setRate] = useState(1)
  const [displayPoster, setDisplayPoster] = useState(poster)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const timeRef = useRef(currentTime)
  const rateRef = useRef(rate)
  const durationRef = useRef(durationSec)
  const onTimeChangeRef = useRef(onTimeChange)
  const raf = useRef<number | null>(null)
  const last = useRef<number>(0)
  const hasVideo = Boolean(videoUrl)

  const poseTrackUrl = useMemo(() => poseTrackUrlForVideo(videoUrl), [videoUrl])
  const { landmarks, hasTrack } = usePoseTrack({
    enabled: trackOn,
    currentTime,
    poseTrackUrl,
  })

  timeRef.current = currentTime
  rateRef.current = rate
  durationRef.current = durationSec
  onTimeChangeRef.current = onTimeChange

  // Draw thin gold/vermillion track overlay on video
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (!trackOn || !hasTrack) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      return
    }

    const parent = canvas.parentElement
    const w = parent?.clientWidth || 800
    const h = parent?.clientHeight || 450
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }
    drawPoseCanvas(ctx, landmarks, canvas.width, canvas.height, { thin: true })
  }, [landmarks, trackOn, hasTrack])

  // Keyframe stills as fallback poster when no HTML5 video
  useEffect(() => {
    if (hasVideo) {
      setDisplayPoster(poster)
      return
    }
    if (!keyframes.length) {
      setDisplayPoster(poster)
      return
    }
    let best = keyframes[0]
    for (const kf of keyframes) {
      if (kf.time <= currentTime + 0.5) best = kf
    }
    setDisplayPoster(best.image)
  }, [currentTime, keyframes, poster, hasVideo])

  // Fake rAF timer only when no videoUrl
  useEffect(() => {
    if (hasVideo) {
      if (raf.current) cancelAnimationFrame(raf.current)
      raf.current = null
      return
    }
    if (!playing) {
      if (raf.current) cancelAnimationFrame(raf.current)
      raf.current = null
      return
    }
    last.current = performance.now()
    const tick = (now: number) => {
      const dt = ((now - last.current) / 1000) * rateRef.current
      last.current = now
      const next = Math.min(durationRef.current, timeRef.current + dt)
      onTimeChangeRef.current(next)
      if (next >= durationRef.current) {
        setPlaying(false)
        return
      }
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [playing, hasVideo])

  useEffect(() => {
    const v = videoRef.current
    if (!v || !hasVideo) return
    v.playbackRate = rate
  }, [rate, hasVideo])

  useEffect(() => {
    const v = videoRef.current
    if (!v || !hasVideo) return
    if (Math.abs(v.currentTime - currentTime) > 0.35) {
      try {
        v.currentTime = currentTime
      } catch {
        /* ignore seek before metadata */
      }
    }
  }, [currentTime, hasVideo])

  useEffect(() => {
    const v = videoRef.current
    if (!v || !hasVideo) return
    if (playing) {
      const p = v.play()
      if (p && typeof p.catch === 'function') p.catch(() => setPlaying(false))
    } else {
      v.pause()
    }
  }, [playing, hasVideo])

  // If CDN blocks anonymous CORS, retry without so playback still works
  useEffect(() => {
    const v = videoRef.current
    if (!v || !hasVideo) return
    const isRemote = /^https?:\/\//i.test(videoUrl)
    if (!isRemote) return

    const onError = () => {
      if (v.crossOrigin) {
        v.crossOrigin = null
        const src = v.src
        v.removeAttribute('src')
        v.load()
        v.src = src
        v.load()
      }
    }
    v.addEventListener('error', onError)
    return () => v.removeEventListener('error', onError)
  }, [videoUrl, hasVideo])

  const onTimeUpdate = useCallback(() => {
    const v = videoRef.current
    if (!v || !playing) return
    onTimeChange(v.currentTime)
  }, [onTimeChange, playing])

  const onEnded = useCallback(() => {
    setPlaying(false)
    const v = videoRef.current
    if (v) onTimeChange(v.duration || durationSec)
  }, [onTimeChange, durationSec])

  const togglePlay = useCallback(() => {
    if (hasVideo) {
      const v = videoRef.current
      if (v && (v.ended || timeRef.current >= durationRef.current - 0.05)) {
        v.currentTime = 0
        onTimeChange(0)
      }
      setPlaying((p) => !p)
      return
    }
    if (timeRef.current >= durationRef.current) onTimeChange(0)
    setPlaying((p) => !p)
  }, [onTimeChange, hasVideo])

  const scrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value)
    setPlaying(false)
    onTimeChange(t)
    const v = videoRef.current
    if (v && hasVideo) {
      try {
        v.currentTime = t
      } catch {
        /* ignore */
      }
    }
  }

  const jumpKf = (kf: Keyframe) => {
    setPlaying(false)
    onTimeChange(kf.time)
    onSelectKeyframe(kf.id)
    const v = videoRef.current
    if (v && hasVideo) {
      try {
        v.currentTime = kf.time
      } catch {
        /* ignore */
      }
    }
  }

  return (
    <div className="rounded-xl overflow-hidden border border-ink-border bg-ink-elevated shadow-2xl shadow-black/40">
      <div className="relative aspect-video bg-black group">
        {hasVideo ? (
          <video
            ref={videoRef}
            src={videoUrl}
            poster={poster}
            crossOrigin="anonymous"
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            preload="auto"
            onTimeUpdate={onTimeUpdate}
            onEnded={onEnded}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />
        ) : (
          <img
            src={displayPoster}
            alt="课时画面"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300 ${
            trackOn && hasTrack ? 'opacity-95' : 'opacity-0'
          }`}
          aria-hidden
        />

        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
          aria-label={playing ? '暂停' : '播放'}
        >
          <span className="w-16 h-16 rounded-full bg-vermillion/90 text-white flex items-center justify-center shadow-lg shadow-vermillion/30 backdrop-blur-sm hover:scale-105 transition-transform">
            {playing ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><path d="M8 5v14l11-7z"/></svg>
            )}
          </span>
        </button>

        <div className="absolute top-3 right-3 px-2.5 py-1 rounded bg-black/60 text-xs tabular-nums text-paper-dim border border-white/10">
          {formatTime(currentTime)} / {formatTime(durationSec)}
        </div>

        {trackOn && hasTrack && (
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <div className="px-2.5 py-1 rounded text-[11px] bg-black/50 border border-gold/30 text-gold-soft backdrop-blur-sm">
              跟拍骨架
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.75)]" />
          </div>
        )}
      </div>

      <div className="px-4 py-3 space-y-3 border-t border-ink-border bg-ink-soft/80">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={togglePlay}
            className="w-9 h-9 rounded-md bg-vermillion hover:bg-vermillion-soft text-white flex items-center justify-center transition-colors shrink-0"
            aria-label={playing ? '暂停' : '播放'}
          >
            {playing ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>

          <input
            type="range"
            min={0}
            max={durationSec}
            step={0.1}
            value={Math.min(currentTime, durationSec)}
            onChange={scrub}
            className="flex-1 min-w-[8rem] accent-gold h-1.5 cursor-pointer"
            aria-label="进度"
          />

          <div className="flex items-center gap-1 shrink-0">
            {[0.5, 1].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRate(r)}
                className={`px-2 py-1 rounded text-xs tabular-nums transition-colors ${
                  rate === r ? 'bg-gold/20 text-gold-soft border border-gold/40' : 'text-mist hover:text-paper border border-transparent'
                }`}
              >
                {r}x
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onTrackToggle}
            className={`px-2.5 py-1.5 rounded-md text-xs border transition-colors ${
              trackOn
                ? 'border-sky-400/50 bg-sky-400/15 text-sky-200'
                : 'border-ink-border text-mist hover:text-paper hover:border-mist/40'
            }`}
            title="在视频上叠加离线跟拍骨架"
          >
            跟拍骨架
          </button>

          <button
            type="button"
            onClick={onAnalysisToggle}
            className={`px-2.5 py-1.5 rounded-md text-xs border transition-colors ${
              analysisOn
                ? 'border-gold/50 bg-gold/15 text-gold-soft'
                : 'border-ink-border text-mist hover:text-paper hover:border-mist/40'
            }`}
            title="右侧示意分析 / 动作解析"
          >
            节点分析
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {keyframes.map((kf) => {
            const active = selectedKeyframeId === kf.id || Math.abs(currentTime - kf.time) < 1.2
            return (
              <button
                key={kf.id}
                type="button"
                onClick={() => jumpKf(kf)}
                className={`flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border text-xs transition-all ${
                  active
                    ? 'border-vermillion/60 bg-vermillion/15 text-paper ring-1 ring-vermillion/30'
                    : 'border-ink-border bg-ink text-mist hover:border-gold/40 hover:text-paper'
                }`}
              >
                <img src={kf.image} alt="" className="w-7 h-7 rounded-full object-cover" />
                <span className="tabular-nums text-gold-dim">{formatTime(kf.time)}</span>
                <span>{kf.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
