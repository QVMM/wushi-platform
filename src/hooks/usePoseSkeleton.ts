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
  type Landmark,
  type PoseMode,
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
}

export interface UsePoseSkeletonResult {
  landmarks: Landmark[]
  mode: PoseMode
  landmarkerReady: boolean
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

export function usePoseSkeleton({
  videoRef,
  enabled,
  currentTime,
  keyframeTimes,
  hasVideo,
}: UsePoseSkeletonOptions): UsePoseSkeletonResult {
  const [landmarks, setLandmarks] = useState<Landmark[]>(() => getIdlePose())
  const [mode, setMode] = useState<PoseMode>('idle')
  const [landmarkerReady, setLandmarkerReady] = useState(false)

  const liveFailedRef = useRef(false)
  const lastTsRef = useRef(-1)
  const emaRef = useRef(createEmaFilter(0.38))
  const landmarkerRef = useRef<PoseLandmarker | null>(null)
  const keyframeTimesRef = useRef(keyframeTimes)
  const currentTimeRef = useRef(currentTime)
  const enabledRef = useRef(enabled)
  const hasVideoRef = useRef(hasVideo)
  const modeRef = useRef<PoseMode>('idle')

  keyframeTimesRef.current = keyframeTimes
  currentTimeRef.current = currentTime
  enabledRef.current = enabled
  hasVideoRef.current = hasVideo

  useEffect(() => {
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
  }, [])

  useEffect(() => {
    // Reset per-video CORS/runtime failures; keep init failure if landmarker never loaded
    if (landmarkerRef.current) liveFailedRef.current = false
    emaRef.current.reset()
    lastTsRef.current = -1
  }, [hasVideo])

  useEffect(() => {
    let raf = 0
    let cancelled = false

    const publish = (pose: Landmark[], nextMode: PoseMode) => {
      modeRef.current = nextMode
      setLandmarks(pose)
      setMode(nextMode)
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

      const video = videoRef.current
      const landmarker = landmarkerRef.current
      const canTryLive =
        hasVideoRef.current &&
        !liveFailedRef.current &&
        !!landmarker &&
        !!video &&
        video.readyState >= 2 &&
        video.videoWidth > 0

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
            applyKeyframe(video!.currentTime || currentTimeRef.current)
          }
        } catch {
          liveFailedRef.current = true
          emaRef.current.reset()
          applyKeyframe(currentTimeRef.current)
        }
      } else {
        applyKeyframe(currentTimeRef.current)
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }
  }, [videoRef])

  useEffect(() => {
    if (!enabled) {
      setLandmarks(getIdlePose())
      setMode('idle')
      modeRef.current = 'idle'
      return
    }
    if (modeRef.current === 'live' && !liveFailedRef.current) return
    const pose = interpolateAuthoredPose(keyframeTimes, currentTime)
    const filtered = emaRef.current.filter(pose)
    setLandmarks([...filtered])
    setMode('keyframe')
    modeRef.current = 'keyframe'
  }, [currentTime, keyframeTimes, enabled])

  const exposedMode: PoseMode = enabled ? (mode === 'idle' ? 'keyframe' : mode) : 'idle'
  return { landmarks, mode: exposedMode, landmarkerReady }
}
