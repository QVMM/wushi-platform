import { useEffect, useRef, useState, type RefObject } from 'react'
import {
  PoseLandmarker,
  FilesetResolver,
  type NormalizedLandmark,
} from '@mediapipe/tasks-vision'
import {
  createEmaFilter,
  getIdlePose,
  interpolateAuthoredPose,
  interpolatePoseTrack,
  type Landmark,
  type PoseMode,
  type PoseTrack,
} from '../lib/pose'

const WASM_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm'
const MODEL_CDN =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task'

export interface UsePoseSkeletonOptions {
  videoRef: RefObject<HTMLVideoElement | null>
  enabled: boolean
  currentTime: number
  keyframeTimes: number[]
  hasVideo: boolean
  /** Offline pose track JSON URL (e.g. /poses/beginner.json). Primary mature path. */
  poseTrackUrl?: string | null
}

export interface UsePoseSkeletonResult {
  landmarks: Landmark[]
  mode: PoseMode
  landmarkerReady: boolean
  trackReady: boolean
}

function toLandmarks(raw: NormalizedLandmark[]): Landmark[] {
  return raw.map((p) => ({
    x: p.x,
    y: p.y,
    z: p.z,
    visibility: p.visibility,
  }))
}

let landmarkerPromise: Promise<PoseLandmarker | null> | null = null

function getLandmarker(): Promise<PoseLandmarker | null> {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(WASM_CDN)
        return await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_CDN,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
        })
      } catch {
        try {
          const vision = await FilesetResolver.forVisionTasks(WASM_CDN)
          return await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: MODEL_CDN,
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numPoses: 1,
          })
        } catch {
          return null
        }
      }
    })()
  }
  return landmarkerPromise
}

const trackCache = new Map<string, Promise<PoseTrack | null>>()

function loadPoseTrack(url: string): Promise<PoseTrack | null> {
  let p = trackCache.get(url)
  if (!p) {
    p = fetch(url)
      .then(async (res) => {
        if (!res.ok) return null
        const data = (await res.json()) as PoseTrack
        if (!data?.frames?.length) return null
        return data
      })
      .catch(() => null)
    trackCache.set(url, p)
  }
  return p
}

export function usePoseSkeleton({
  videoRef,
  enabled,
  currentTime,
  keyframeTimes,
  hasVideo,
  poseTrackUrl = null,
}: UsePoseSkeletonOptions): UsePoseSkeletonResult {
  const [landmarks, setLandmarks] = useState<Landmark[]>(() => getIdlePose())
  const [mode, setMode] = useState<PoseMode>('idle')
  const [landmarkerReady, setLandmarkerReady] = useState(false)
  const [track, setTrack] = useState<PoseTrack | null>(null)
  const [trackReady, setTrackReady] = useState(false)

  const liveFailedRef = useRef(false)
  const lastTsRef = useRef(-1)
  // Slight lag smoothing for track / live
  const emaRef = useRef(createEmaFilter(0.42))
  const landmarkerRef = useRef<PoseLandmarker | null>(null)
  const keyframeTimesRef = useRef(keyframeTimes)
  const currentTimeRef = useRef(currentTime)
  const enabledRef = useRef(enabled)
  const hasVideoRef = useRef(hasVideo)
  const trackRef = useRef<PoseTrack | null>(null)
  const modeRef = useRef<PoseMode>('idle')
  const seekSnapRef = useRef(false)
  const lastSeekTimeRef = useRef(currentTime)

  keyframeTimesRef.current = keyframeTimes
  currentTimeRef.current = currentTime
  enabledRef.current = enabled
  hasVideoRef.current = hasVideo
  trackRef.current = track

  // Detect seeks → snap EMA so pose updates instantly
  useEffect(() => {
    if (Math.abs(currentTime - lastSeekTimeRef.current) > 0.45) {
      seekSnapRef.current = true
      emaRef.current.reset()
    }
    lastSeekTimeRef.current = currentTime
  }, [currentTime])

  // Load offline pose track (primary)
  useEffect(() => {
    let cancelled = false
    setTrack(null)
    setTrackReady(false)
    trackRef.current = null
    emaRef.current.reset()

    if (!poseTrackUrl) {
      setTrackReady(true) // nothing to load
      return
    }

    loadPoseTrack(poseTrackUrl).then((t) => {
      if (cancelled) return
      setTrack(t)
      trackRef.current = t
      setTrackReady(true)
      emaRef.current.reset()
    })

    return () => {
      cancelled = true
    }
  }, [poseTrackUrl])

  // Lazy-init live landmarker only when no track
  useEffect(() => {
    if (track || poseTrackUrl) return
    let cancelled = false
    getLandmarker().then((lm) => {
      if (cancelled) return
      landmarkerRef.current = lm
      setLandmarkerReady(Boolean(lm))
      if (!lm) liveFailedRef.current = true
    })
    return () => {
      cancelled = true
    }
  }, [track, poseTrackUrl])

  useEffect(() => {
    if (landmarkerRef.current) liveFailedRef.current = false
    emaRef.current.reset()
    lastTsRef.current = -1
  }, [hasVideo, poseTrackUrl])

  useEffect(() => {
    let raf = 0
    let cancelled = false

    const publish = (pose: Landmark[], nextMode: PoseMode) => {
      modeRef.current = nextMode
      setLandmarks(pose)
      setMode(nextMode)
    }

    const applyTrack = (t: number, snap = false) => {
      const tr = trackRef.current
      if (!tr) return false
      const pose = interpolatePoseTrack(tr, t)
      if (snap || seekSnapRef.current) {
        emaRef.current.reset()
        seekSnapRef.current = false
        publish([...pose], 'track')
        return true
      }
      const filtered = emaRef.current.filter(pose)
      publish([...filtered], 'track')
      return true
    }

    const applyKeyframe = (t: number) => {
      const pose = interpolateAuthoredPose(keyframeTimesRef.current, t)
      const filtered = emaRef.current.filter(pose)
      publish([...filtered], 'keyframe')
    }

    const tick = () => {
      if (cancelled) return

      if (!enabledRef.current) {
        if (modeRef.current !== 'idle') {
          publish(getIdlePose(), 'idle')
        }
        raf = requestAnimationFrame(tick)
        return
      }

      const t = currentTimeRef.current

      // 1) Offline track — mature stable path
      if (trackRef.current) {
        applyTrack(t)
        raf = requestAnimationFrame(tick)
        return
      }

      const video = videoRef.current
      const landmarker = landmarkerRef.current
      const canTryLive =
        hasVideoRef.current &&
        !liveFailedRef.current &&
        !!landmarker &&
        !!video &&
        video.readyState >= 2 &&
        video.videoWidth > 0

      // 2) Live MediaPipe VIDEO
      if (canTryLive) {
        try {
          let ts = performance.now()
          if (ts <= lastTsRef.current) ts = lastTsRef.current + 1
          lastTsRef.current = ts

          const result = landmarker!.detectForVideo(video!, ts)
          const pose0 = result?.landmarks?.[0]
          if (pose0 && pose0.length) {
            const filtered = emaRef.current.filter(toLandmarks(pose0))
            publish([...filtered], 'live')
          } else {
            applyKeyframe(video!.currentTime || t)
          }
        } catch {
          liveFailedRef.current = true
          emaRef.current.reset()
          applyKeyframe(t)
        }
      } else {
        // 3) Authored keyframes
        applyKeyframe(t)
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }
  }, [videoRef, track])

  // Seeking / time updates — especially important for track mode when paused
  useEffect(() => {
    if (!enabled) {
      setLandmarks(getIdlePose())
      setMode('idle')
      modeRef.current = 'idle'
      return
    }

    if (track) {
      const pose = interpolatePoseTrack(track, currentTime)
      if (seekSnapRef.current) {
        emaRef.current.reset()
        seekSnapRef.current = false
        setLandmarks([...pose])
      } else {
        const filtered = emaRef.current.filter(pose)
        setLandmarks([...filtered])
      }
      setMode('track')
      modeRef.current = 'track'
      return
    }

    if (modeRef.current === 'live' && !liveFailedRef.current) return
    const pose = interpolateAuthoredPose(keyframeTimes, currentTime)
    const filtered = emaRef.current.filter(pose)
    setLandmarks([...filtered])
    setMode('keyframe')
    modeRef.current = 'keyframe'
  }, [currentTime, keyframeTimes, enabled, track])

  const exposedMode: PoseMode = enabled
    ? mode === 'idle'
      ? track
        ? 'track'
        : 'keyframe'
      : mode
    : 'idle'

  return { landmarks, mode: exposedMode, landmarkerReady, trackReady }
}
