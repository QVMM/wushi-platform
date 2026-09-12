/** Offline pose-track loader: sync /poses/*.json landmarks to currentTime */

import { useEffect, useRef, useState } from 'react'
import {
  createEmaFilter,
  getIdlePose,
  interpolatePoseTrack,
  type Landmark,
  type PoseTrack,
} from '../lib/pose'

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

export interface UsePoseTrackOptions {
  enabled: boolean
  currentTime: number
  poseTrackUrl?: string | null
}

export interface UsePoseTrackResult {
  landmarks: Landmark[]
  trackReady: boolean
  hasTrack: boolean
}

export function usePoseTrack({
  enabled,
  currentTime,
  poseTrackUrl = null,
}: UsePoseTrackOptions): UsePoseTrackResult {
  const [landmarks, setLandmarks] = useState<Landmark[]>(() => getIdlePose())
  const [track, setTrack] = useState<PoseTrack | null>(null)
  const [trackReady, setTrackReady] = useState(false)

  const emaRef = useRef(createEmaFilter(0.42))
  const lastSeekTimeRef = useRef(currentTime)
  const seekSnapRef = useRef(false)

  // Detect seeks → snap EMA so pose updates instantly
  useEffect(() => {
    if (Math.abs(currentTime - lastSeekTimeRef.current) > 0.45) {
      seekSnapRef.current = true
      emaRef.current.reset()
    }
    lastSeekTimeRef.current = currentTime
  }, [currentTime])

  // Load offline pose track
  useEffect(() => {
    let cancelled = false
    setTrack(null)
    setTrackReady(false)
    emaRef.current.reset()

    if (!poseTrackUrl) {
      setTrackReady(true)
      return
    }

    loadPoseTrack(poseTrackUrl).then((t) => {
      if (cancelled) return
      setTrack(t)
      setTrackReady(true)
      emaRef.current.reset()
    })

    return () => {
      cancelled = true
    }
  }, [poseTrackUrl])

  // Sync landmarks to currentTime
  useEffect(() => {
    if (!enabled) {
      setLandmarks(getIdlePose())
      return
    }
    if (!track) {
      setLandmarks(getIdlePose())
      return
    }

    const pose = interpolatePoseTrack(track, currentTime)
    if (seekSnapRef.current) {
      emaRef.current.reset()
      seekSnapRef.current = false
      setLandmarks([...pose])
    } else {
      setLandmarks([...emaRef.current.filter(pose)])
    }
  }, [currentTime, enabled, track])

  return {
    landmarks,
    trackReady,
    hasTrack: Boolean(track),
  }
}
