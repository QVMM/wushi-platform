/** CDN media URLs for lesson images and stage videos */

const CDN = 'https://1823568330.cdn.123clouddisk.com/1823568330'

// —— Videos ——
export const VIDEO_BEGINNER = `${CDN}/76661224`
export const VIDEO_INTERMEDIATE = `${CDN}/76661226`
export const VIDEO_ADVANCED = `${CDN}/76573950`
export const VIDEO_CLASSROOM = `${CDN}/76573947`
export const VIDEO_CLUB = `${CDN}/76661225`

// —— Images ——
export const IMG_DSC00056 = `${CDN}/76490086`
export const IMG_INTERMEDIATE_STILL002 = `${CDN}/76518466`
export const IMG_BEGINNER_STILL001 = `${CDN}/76573936`
export const IMG_INTERMEDIATE_STILL003 = `${CDN}/76573937`
export const IMG_BEGINNER_STILL002 = `${CDN}/76573938`
export const IMG_BEGINNER_STILL003 = `${CDN}/76573939`
export const IMG_BEGINNER_STILL004 = `${CDN}/76573941`
export const IMG_ADVANCED_STILL002 = `${CDN}/76573942`
export const IMG_INTERMEDIATE_STILL004 = `${CDN}/76573943`
export const IMG_INTERMEDIATE_STILL005 = `${CDN}/76573944`
export const IMG_INTERMEDIATE_STILL001 = `${CDN}/76573945`
export const IMG_INTERMEDIATE_STILL006 = `${CDN}/76573946`
export const IMG_DSC00065 = `${CDN}/76573948`
export const IMG_DSC00067 = `${CDN}/76573949`
export const IMG_ADVANCED_STILL004 = `${CDN}/76661218`
export const IMG_DSC00068 = `${CDN}/76661219`
export const IMG_ADVANCED_STILL001 = `${CDN}/76661220`
export const IMG_CLASSROOM_STILL001 = `${CDN}/76661221`
export const IMG_INTERMEDIATE_STILL007 = `${CDN}/76661222`
export const IMG_ADVANCED_STILL003 = `${CDN}/76661223`

/** Map from legacy `/lessons/...` public paths → CDN URLs */
export const LESSON_PATH_TO_CDN: Record<string, string> = {
  '/lessons/dsc56.jpg': IMG_DSC00056,
  '/lessons/intermediate_00_00_07_00.Still002.jpg': IMG_INTERMEDIATE_STILL002,
  '/lessons/beginner_00_00_09_16.Still001.jpg': IMG_BEGINNER_STILL001,
  '/lessons/intermediate_00_00_37_05.Still003.jpg': IMG_INTERMEDIATE_STILL003,
  '/lessons/beginner_00_00_28_03.Still002.jpg': IMG_BEGINNER_STILL002,
  '/lessons/beginner_00_01_30_10.Still003.jpg': IMG_BEGINNER_STILL003,
  '/lessons/beginner_00_01_57_13.Still004.jpg': IMG_BEGINNER_STILL004,
  '/lessons/advanced_00_01_47_18.Still002.jpg': IMG_ADVANCED_STILL002,
  '/lessons/intermediate_00_01_06_11.Still004.jpg': IMG_INTERMEDIATE_STILL004,
  '/lessons/intermediate_00_01_10_23.Still005.jpg': IMG_INTERMEDIATE_STILL005,
  '/lessons/intermediate_00_00_02_24.Still001.jpg': IMG_INTERMEDIATE_STILL001,
  '/lessons/intermediate_00_01_37_21.Still006.jpg': IMG_INTERMEDIATE_STILL006,
  '/lessons/dsc65.jpg': IMG_DSC00065,
  '/lessons/dsc67.jpg': IMG_DSC00067,
  '/lessons/advanced_00_00_54_20.Still004.jpg': IMG_ADVANCED_STILL004,
  '/lessons/dsc68.jpg': IMG_DSC00068,
  '/lessons/advanced_00_01_40_12.Still001.jpg': IMG_ADVANCED_STILL001,
  '/lessons/classroom_00_00_36_17.Still001.jpg': IMG_CLASSROOM_STILL001,
  '/lessons/intermediate_00_01_41_11.Still007.jpg': IMG_INTERMEDIATE_STILL007,
  '/lessons/advanced_00_00_09_22.Still003.jpg': IMG_ADVANCED_STILL003,
}

export function resolveLessonMedia(path: string): string {
  return LESSON_PATH_TO_CDN[path] ?? path
}

export function videoUrlForStage(
  stageId: 'beginner' | 'intermediate' | 'advanced' | 'concept',
  lessonId?: string,
): string {
  switch (stageId) {
    case 'beginner':
      return VIDEO_BEGINNER
    case 'intermediate':
      return VIDEO_INTERMEDIATE
    case 'advanced':
      return VIDEO_ADVANCED
    case 'concept':
      return lessonId === 'con-02' ? VIDEO_CLUB : VIDEO_CLASSROOM
    default:
      return VIDEO_BEGINNER
  }
}
