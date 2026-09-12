/** Stage video still catalogs — timestamps parsed from CDN filenames (e.g. 00_00_37 → 37s) */

import {
  IMG_ADVANCED_STILL001,
  IMG_ADVANCED_STILL002,
  IMG_ADVANCED_STILL003,
  IMG_ADVANCED_STILL004,
  IMG_BEGINNER_STILL001,
  IMG_BEGINNER_STILL002,
  IMG_BEGINNER_STILL003,
  IMG_BEGINNER_STILL004,
  IMG_CLASSROOM_STILL001,
  IMG_DSC00056,
  IMG_DSC00065,
  IMG_DSC00067,
  IMG_DSC00068,
  IMG_INTERMEDIATE_STILL001,
  IMG_INTERMEDIATE_STILL002,
  IMG_INTERMEDIATE_STILL003,
  IMG_INTERMEDIATE_STILL004,
  IMG_INTERMEDIATE_STILL005,
  IMG_INTERMEDIATE_STILL006,
  IMG_INTERMEDIATE_STILL007,
} from './media'
import type { Keyframe } from './lessons'

export interface StageStill {
  time: number
  image: string
  /** Default teaching label when lesson does not override */
  label: string
  tip: string
}

/** beginner_00_00_09_16 / 28 / 01_30 / 01_57 → 4 stills */
export const BEGINNER_STILLS: StageStill[] = [
  {
    time: 9,
    image: IMG_BEGINNER_STILL001,
    label: '握持定位',
    tip: '双手对称握框，肘微屈，肩放松下沉。',
  },
  {
    time: 28,
    image: IMG_BEGINNER_STILL002,
    label: '重心下沉',
    tip: '膝微屈，重心落于足心，上身保持竖直。',
  },
  {
    time: 90,
    image: IMG_BEGINNER_STILL003,
    label: '头部微转',
    tip: '以腰带动肩，头部缓慢左右扫视，幅度可控。',
  },
  {
    time: 117,
    image: IMG_BEGINNER_STILL004,
    label: '复位收势',
    tip: '回中立位，检查对称与呼吸节奏。',
  },
]

/** intermediate_00_00_02 … 00_01_41 → 7 stills */
export const INTERMEDIATE_STILLS: StageStill[] = [
  {
    time: 2,
    image: IMG_INTERMEDIATE_STILL001,
    label: '站位确认',
    tip: '狮头在前，狮尾双手扶腰侧。',
  },
  {
    time: 7,
    image: IMG_INTERMEDIATE_STILL002,
    label: '架体成型',
    tip: '架体高度与肩同齐，双手握稳。',
  },
  {
    time: 37,
    image: IMG_INTERMEDIATE_STILL003,
    label: '口令同步',
    tip: '以短促口令确认准备就绪。',
  },
  {
    time: 66,
    image: IMG_INTERMEDIATE_STILL004,
    label: '试抬轻离',
    tip: '轻抬离地试感，检查平衡。',
  },
  {
    time: 70,
    image: IMG_INTERMEDIATE_STILL005,
    label: '回落缓冲',
    tip: '膝屈缓冲落地，双人同步。',
  },
  {
    time: 97,
    image: IMG_INTERMEDIATE_STILL006,
    label: '调整间距',
    tip: '根据身高微调前后间距。',
  },
  {
    time: 101,
    image: IMG_INTERMEDIATE_STILL007,
    label: '定型确认',
    tip: '定型后双方口头确认。',
  },
]

/** advanced_00_00_09 / 54 / 01_40 / 01_47 → 4 stills */
export const ADVANCED_STILLS: StageStill[] = [
  {
    time: 9,
    image: IMG_ADVANCED_STILL003,
    label: '上凳',
    tip: '侧身上凳，双手扶持稳固。',
  },
  {
    time: 54,
    image: IMG_ADVANCED_STILL004,
    label: '站稳',
    tip: '双脚平行，目视前方定点。',
  },
  {
    time: 100,
    image: IMG_ADVANCED_STILL001,
    label: '缓移',
    tip: '小步慢移，重心始终在凳面内。',
  },
  {
    time: 107,
    image: IMG_ADVANCED_STILL002,
    label: '下凳',
    tip: '面向下凳，屈膝落地。',
  },
]

/** classroom_00_00_36_17 + related classroom/club stills */
export const CLASSROOM_STILLS: StageStill[] = [
  {
    time: 10,
    image: IMG_CLASSROOM_STILL001,
    label: '集合讲解',
    tip: '集合后先讲要点再示范。',
  },
  {
    time: 36,
    image: IMG_CLASSROOM_STILL001,
    label: '慢速示范',
    tip: '慢速拆解关键环节。',
  },
  {
    time: 55,
    image: IMG_DSC00065,
    label: '学生跟练',
    tip: '分组跟练，老师巡视。',
  },
  {
    time: 80,
    image: IMG_DSC00067,
    label: '即时纠错',
    tip: '点名纠正并复现正确动作。',
  },
]

export const CLUB_STILLS: StageStill[] = [
  {
    time: 8,
    image: IMG_DSC00056,
    label: '热身集合',
    tip: '社团热身，气氛活跃。',
  },
  {
    time: 25,
    image: IMG_DSC00065,
    label: '分组轮换',
    tip: '狮头狮尾角色轮换练习。',
  },
  {
    time: 50,
    image: IMG_DSC00067,
    label: '互助纠姿',
    tip: '同伴互看互纠。',
  },
  {
    time: 75,
    image: IMG_DSC00068,
    label: '合练收工',
    tip: '合练短套路后放松。',
  },
]

export type StillOverrides = Record<
  number,
  Partial<Pick<StageStill, 'label' | 'tip'>>
>

/** Build lesson keyframes from a stage still catalog (+ optional per-time overrides). */
export function keyframesFromStills(
  lessonPrefix: string,
  stills: StageStill[],
  overrides?: StillOverrides,
): Keyframe[] {
  return stills.map((s, i) => {
    const o = overrides?.[s.time]
    return {
      id: `${lessonPrefix}-k${i + 1}`,
      time: s.time,
      label: o?.label ?? s.label,
      tip: o?.tip ?? s.tip,
      image: s.image,
    }
  })
}
