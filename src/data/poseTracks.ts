/** Offline pose-track JSON paths keyed by stage / CDN video URL */

import {
  VIDEO_ADVANCED,
  VIDEO_BEGINNER,
  VIDEO_CLASSROOM,
  VIDEO_CLUB,
  VIDEO_INTERMEDIATE,
} from './media'

export type PoseTrackId =
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'classroom'
  | 'club'

export const POSE_TRACK_FILES: Record<PoseTrackId, string> = {
  beginner: '/poses/beginner.json',
  intermediate: '/poses/intermediate.json',
  advanced: '/poses/advanced.json',
  classroom: '/poses/classroom.json',
  club: '/poses/club.json',
}

/** Map CDN video URL → offline pose track path */
export const VIDEO_URL_TO_POSE_TRACK: Record<string, string> = {
  [VIDEO_BEGINNER]: POSE_TRACK_FILES.beginner,
  [VIDEO_INTERMEDIATE]: POSE_TRACK_FILES.intermediate,
  [VIDEO_ADVANCED]: POSE_TRACK_FILES.advanced,
  [VIDEO_CLASSROOM]: POSE_TRACK_FILES.classroom,
  [VIDEO_CLUB]: POSE_TRACK_FILES.club,
}

export function poseTrackUrlForVideo(videoUrl: string | undefined | null): string | null {
  if (!videoUrl) return null
  return VIDEO_URL_TO_POSE_TRACK[videoUrl] ?? null
}

export function poseTrackUrlForStage(
  stageId: 'beginner' | 'intermediate' | 'advanced' | 'concept',
  lessonId?: string,
): string | null {
  switch (stageId) {
    case 'beginner':
      return POSE_TRACK_FILES.beginner
    case 'intermediate':
      return POSE_TRACK_FILES.intermediate
    case 'advanced':
      return POSE_TRACK_FILES.advanced
    case 'concept':
      return lessonId === 'con-02' ? POSE_TRACK_FILES.club : POSE_TRACK_FILES.classroom
    default:
      return null
  }
}
