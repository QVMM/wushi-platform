import type { Keyframe, KeyframeNode, Lesson } from './lessons'

/** Upper-limb focus: grip / open-close / head control */
const NODES_UPPER: KeyframeNode[] = [
  { id: 'ls', label: '肩', x: 0.38, y: 0.30, note: '沉肩放松' },
  { id: 'le', label: '肘', x: 0.30, y: 0.40, note: '肘微屈弹性' },
  { id: 'lw', label: '腕', x: 0.24, y: 0.48, note: '握点对称' },
  { id: 'rs', label: '肩', x: 0.62, y: 0.30, note: '沉肩放松' },
  { id: 're', label: '肘', x: 0.70, y: 0.40, note: '肘微屈弹性' },
  { id: 'rw', label: '腕', x: 0.76, y: 0.48, note: '握点对称' },
]

/** Mouth / mechanical open-close */
const NODES_OPEN: KeyframeNode[] = [
  { id: 'hd', label: '头', x: 0.50, y: 0.18, note: '头部居中' },
  { id: 'lw', label: '腕', x: 0.32, y: 0.40, note: '推杆控制开合' },
  { id: 'le', label: '肘', x: 0.36, y: 0.34, note: '肘活不僵' },
  { id: 'rw', label: '腕', x: 0.68, y: 0.40, note: '节奏清晰' },
  { id: 're', label: '肘', x: 0.64, y: 0.34, note: '避免连带晃头' },
]

/** Footwork / weight shift */
const NODES_FOOT: KeyframeNode[] = [
  { id: 'lh', label: '髋', x: 0.42, y: 0.54, note: '髋平稳下沉' },
  { id: 'lk', label: '膝', x: 0.40, y: 0.72, note: '膝微屈约 120°' },
  { id: 'la', label: '踝', x: 0.38, y: 0.90, note: '足心承重' },
  { id: 'rh', label: '髋', x: 0.58, y: 0.54, note: '左右对称' },
  { id: 'rk', label: '膝', x: 0.60, y: 0.72, note: '膝微屈' },
  { id: 'ra', label: '踝', x: 0.62, y: 0.90, note: '脚掌滚动' },
]

/** Lift / frame support */
const NODES_LIFT: KeyframeNode[] = [
  { id: 'ls', label: '肩', x: 0.40, y: 0.28, note: '肩带稳定' },
  { id: 'le', label: '肘', x: 0.36, y: 0.38, note: '顶点可锁定' },
  { id: 'lh', label: '髋', x: 0.44, y: 0.54, note: '髋驱动发力' },
  { id: 'lk', label: '膝', x: 0.42, y: 0.70, note: '腿部主导' },
  { id: 'rs', label: '肩', x: 0.60, y: 0.28 },
  { id: 're', label: '肘', x: 0.64, y: 0.38, note: '避免塌肘' },
]

/** Balance / high stake */
const NODES_BALANCE: KeyframeNode[] = [
  { id: 'hd', label: '头', x: 0.50, y: 0.16, note: '目视定点' },
  { id: 'lh', label: '髋', x: 0.44, y: 0.52, note: '重心在支撑面内' },
  { id: 'lk', label: '膝', x: 0.44, y: 0.70, note: '微屈吸震' },
  { id: 'la', label: '踝', x: 0.44, y: 0.90, note: '足底感知' },
  { id: 'rh', label: '髋', x: 0.56, y: 0.52 },
  { id: 'rk', label: '膝', x: 0.56, y: 0.70 },
]

/** Generic full-body teaching nodes */
const NODES_GENERIC: KeyframeNode[] = [
  { id: 'ls', label: '肩', x: 0.40, y: 0.30, note: '肩线水平' },
  { id: 'le', label: '肘', x: 0.32, y: 0.42 },
  { id: 'lw', label: '腕', x: 0.28, y: 0.52 },
  { id: 'lh', label: '髋', x: 0.44, y: 0.55, note: '核心收紧' },
  { id: 'lk', label: '膝', x: 0.43, y: 0.72 },
  { id: 'la', label: '踝', x: 0.42, y: 0.90 },
]

function pickTemplate(label: string, tip: string, tags: string[]): KeyframeNode[] {
  const text = `${label} ${tip} ${tags.join(' ')}`
  if (/开合|点头|眨眼|机械|表情|推杆/.test(text)) return NODES_OPEN
  if (/握持|握框|肩肘|头部微转|复位|收势|起势/.test(text) && !/步|膝|重心下沉|四点/.test(text)) {
    return NODES_UPPER
  }
  if (/托举|架体|上升|顶点|蓄力|下落|试抬/.test(text)) return NODES_LIFT
  if (/高桩|长凳|站稳|上凳|下凳|缓移|平衡/.test(text)) return NODES_BALANCE
  if (/步|重心|四点|移重心|换步|起伏|行进|落位|踝|膝/.test(text)) return NODES_FOOT
  if (/站位|口令|间距|定型|换位/.test(text)) return NODES_LIFT
  if (/教学|示范|纠错|集合|社团|热身|轮换/.test(text)) return NODES_GENERIC
  return NODES_GENERIC
}

/** Resolve authored nodes or infer from keyframe label/tip/tags. */
export function resolveKeyframeNodes(kf: Keyframe, tags: string[] = []): KeyframeNode[] {
  if (kf.nodes && kf.nodes.length) return kf.nodes
  return pickTemplate(kf.label, kf.tip, tags).map((n, i) => ({
    ...n,
    id: `${kf.id}-${n.id}-${i}`,
  }))
}

/** Attach inferred nodes onto every keyframe that lacks authored ones. */
export function enrichLessonKeyframes(lessons: Lesson[]): Lesson[] {
  return lessons.map((lesson) => ({
    ...lesson,
    keyframes: lesson.keyframes.map((kf) => ({
      ...kf,
      nodes: resolveKeyframeNodes(kf, lesson.tags),
    })),
  }))
}
