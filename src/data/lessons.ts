/** 狮舞阶段式标准化教学平台 — 课时与阶段 mock 数据 */

import {
  VIDEO_BEGINNER,
  VIDEO_INTERMEDIATE,
  VIDEO_ADVANCED,
  VIDEO_CLASSROOM,
  VIDEO_CLUB,
} from './media'

export type StageId = 'beginner' | 'intermediate' | 'advanced' | 'concept'

export interface Keyframe {
  id: string
  time: number // seconds
  label: string
  tip: string
  image: string
}

export interface ChecklistItem {
  id: string
  text: string
  weight: number
}

export interface Lesson {
  id: string
  stageId: StageId
  title: string
  subtitle: string
  duration: string
  durationSec: number
  cover: string
  poster: string
  videoUrl: string
  order: number
  locked?: boolean
  completed?: boolean
  progress?: number
  summary: string
  keyframes: Keyframe[]
  essentials: string[]
  mistakes: string[]
  mnemonic: string
  safety: string[]
  checklist: ChecklistItem[]
  tags: string[]
}

export interface Stage {
  id: StageId
  name: string
  nameEn: string
  seal: string
  description: string
  color: string
  unlocked: boolean
  requirement?: string
  cover: string
  focus: string[]
}

export const stages: Stage[] = [
  {
    id: 'beginner',
    name: '初级',
    nameEn: 'Beginner',
    seal: '初',
    description: '线框狮头入门，建立步法、重心与头部控制的基础动作标准。',
    color: '#C6A15B',
    unlocked: true,
    cover: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573936',
    focus: ['基本步法', '狮头线框', '重心转移', '节奏感'],
  },
  {
    id: 'intermediate',
    name: '中级',
    nameEn: 'Intermediate',
    seal: '中',
    description: '双人配合与架体托举，强化协同、时机与力学传导。',
    color: '#C23A2B',
    unlocked: true,
    cover: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573937',
    focus: ['双人配合', '架体托举', '时机同步', '力学传导'],
  },
  {
    id: 'advanced',
    name: '高级',
    nameEn: 'Advanced',
    seal: '高',
    description: '高桩长凳与完整绿狮头，完成舞台化展演动作与安全落地。',
    color: '#E8D5A3',
    unlocked: true,
    requirement: '完成中级考核 ≥ 80 分解锁',
    cover: 'https://1823568330.cdn.123clouddisk.com/1823568330/76661220',
    focus: ['高桩技艺', '完整狮头', '展演节奏', '安全落地'],
  },
  {
    id: 'concept',
    name: '场景教学',
    nameEn: 'Concept',
    seal: '景',
    description: '课堂示范与社团氛围实录，理解教学组织与团队文化。',
    color: '#9BA3B5',
    unlocked: true,
    cover: 'https://1823568330.cdn.123clouddisk.com/1823568330/76661221',
    focus: ['教学示范', '社团协作', '课堂组织'],
  },
]

export const lessons: Lesson[] = [
  // —— 初级 ——
  {
    id: 'beg-01',
    stageId: 'beginner',
    title: '线框狮头握持与重心',
    subtitle: '建立头部控制的第一课',
    duration: '02:10',
    durationSec: 130,
    cover: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573936',
    poster: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573936',
    videoUrl: VIDEO_BEGINNER,
    order: 1,
    completed: true,
    progress: 100,
    summary: '通过线框狮头熟悉握持点、肩肘联动与静态重心，为后续步法打下基础。',
    tags: ['握持', '重心', '线框'],
    keyframes: [
      { id: 'b1-k1', time: 9, label: '握持定位', tip: '双手对称握框，肘微屈，肩放松下沉。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573936' },
      { id: 'b1-k2', time: 28, label: '重心下沉', tip: '膝微屈，重心落于足心，上身保持竖直。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573938' },
      { id: 'b1-k3', time: 90, label: '头部微转', tip: '以腰带动肩，头部缓慢左右扫视，幅度可控。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573939' },
      { id: 'b1-k4', time: 117, label: '复位收势', tip: '回中立位，检查对称与呼吸节奏。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573941' },
    ],
    essentials: [
      '握点对称，避免单侧用力',
      '肘关节保持弹性缓冲',
      '视线随狮头方向自然跟随',
      '呼吸与动作节奏同频',
    ],
    mistakes: [
      '耸肩导致上肢僵硬',
      '握框过紧引发前臂疲劳',
      '重心偏前易失衡',
      '头部转动时腰部未参与',
    ],
    mnemonic: '肩沉肘活框对称，膝屈足心稳如山。',
    safety: [
      '练习前热身腕肩关节',
      '线框边缘加护垫防刮擦',
      '场地保持干燥无障碍物',
    ],
    checklist: [
      { id: 'c1', text: '握持对称稳定 ≥ 30 秒', weight: 25 },
      { id: 'c2', text: '重心下沉膝角约 120°', weight: 25 },
      { id: 'c3', text: '头部左右扫视幅度一致', weight: 25 },
      { id: 'c4', text: '收势回中立无明显晃动', weight: 25 },
    ],
  },
  {
    id: 'beg-02',
    stageId: 'beginner',
    title: '基本步法：四点步与移重心',
    subtitle: '狮身脚下的根基',
    duration: '02:05',
    durationSec: 125,
    cover: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573938',
    poster: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573938',
    videoUrl: VIDEO_BEGINNER,
    order: 2,
    completed: true,
    progress: 100,
    summary: '掌握四点步落位、移重心与狮头上下起伏的配合，形成稳定的行进节奏。',
    tags: ['步法', '四点步', '节奏'],
    keyframes: [
      { id: 'b2-k1', time: 9, label: '四点落位', tip: '前后脚开立约肩宽，脚尖略外展。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573936' },
      { id: 'b2-k2', time: 28, label: '移重心', tip: '重心平滑前移，后脚跟轻提。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573938' },
      { id: 'b2-k3', time: 90, label: '起伏配合', tip: '狮头随步幅轻微起伏，避免上下脱节。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573939' },
      { id: 'b2-k4', time: 117, label: '换步回转', tip: '换步时保持上身稳定，脚掌滚动落地。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573941' },
    ],
    essentials: [
      '步幅均匀，脚掌滚动落地',
      '移重心过程连贯无停顿',
      '狮头起伏与步频同步',
      '换步时保持上身稳定',
    ],
    mistakes: [
      '步幅忽大忽小',
      '踮脚或全脚硬踏',
      '狮头上下与脚步脱节',
      '转弯时重心外甩',
    ],
    mnemonic: '四点开立肩同宽，重心平滑脚掌滚。',
    safety: [
      '穿防滑训练鞋',
      '地面无积水、无杂物',
      '初练时放慢节奏',
    ],
    checklist: [
      { id: 'c1', text: '连续 8 步步幅误差 ≤ 10%', weight: 30 },
      { id: 'c2', text: '移重心无明显顿挫', weight: 25 },
      { id: 'c3', text: '狮头起伏与步频同步', weight: 25 },
      { id: 'c4', text: '回转时上身不晃', weight: 20 },
    ],
  },
  {
    id: 'beg-03',
    stageId: 'beginner',
    title: '狮头机械：开合与点头',
    subtitle: '赋予狮头生命感',
    duration: '02:00',
    durationSec: 120,
    cover: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573939',
    poster: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573939',
    videoUrl: VIDEO_BEGINNER,
    order: 3,
    progress: 45,
    summary: '练习狮嘴开合、点头与眨眼的机械联动，让静态握持转化为表情语言。',
    tags: ['机械', '开合', '表情'],
    keyframes: [
      { id: 'b3-k1', time: 9, label: '准备位', tip: '狮嘴微闭，头部居中。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573936' },
      { id: 'b3-k2', time: 28, label: '开合节奏', tip: '拇指推杆控制开合，节奏清晰。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573938' },
      { id: 'b3-k3', time: 90, label: '点头示意', tip: '点头幅度小而有力，配合开合。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573939' },
      { id: 'b3-k4', time: 117, label: '眨眼收束', tip: '眨眼与点头交替，避免机械重复。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573941' },
    ],
    essentials: [
      '开合节奏清晰可辨',
      '点头幅度小而有力',
      '眨眼与点头交替使用',
      '避免机械重复动作',
    ],
    mistakes: [
      '开合过猛导致晃头',
      '点头幅度过大失真',
      '手指僵硬推杆不畅',
      '表情与步伐不同步',
    ],
    mnemonic: '开合有节点头稳，眨眼点睛见精神。',
    safety: [
      '检查机械连杆是否松动',
      '推杆行程勿超极限',
      '休息时放下狮头',
    ],
    checklist: [
      { id: 'c1', text: '开合节奏稳定 16 拍', weight: 30 },
      { id: 'c2', text: '点头幅度适中有力', weight: 25 },
      { id: 'c3', text: '眨眼与点头可交替', weight: 25 },
      { id: 'c4', text: '与步法配合无明显错位', weight: 20 },
    ],
  },
  {
    id: 'beg-04',
    stageId: 'beginner',
    title: '综合：行进与表情联动',
    subtitle: '初级结业综合练',
    duration: '02:15',
    durationSec: 135,
    cover: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573941',
    poster: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573941',
    videoUrl: VIDEO_BEGINNER,
    order: 4,
    progress: 0,
    summary: '将步法、重心与狮头表情串联为短套路，达到初级考核标准。',
    tags: ['综合', '考核', '套路'],
    keyframes: [
      { id: 'b4-k1', time: 9, label: '起势', tip: '静立起势，目光向前。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573936' },
      { id: 'b4-k2', time: 28, label: '行进段', tip: '四点步行进，狮头轻起伏。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573938' },
      { id: 'b4-k3', time: 90, label: '表情段', tip: '定点开合点头，展现精神。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573939' },
      { id: 'b4-k4', time: 117, label: '收势', tip: '回中收势，气息下沉。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573941' },
    ],
    essentials: [
      '套路段落衔接自然',
      '表情与行进层次分明',
      '全程保持呼吸节奏',
      '收势干净利落',
    ],
    mistakes: [
      '段落之间停顿过长',
      '顾步不顾头或反之',
      '考核紧张导致耸肩',
      '收势匆忙未定型',
    ],
    mnemonic: '行进表情层次清，收势定型见功夫。',
    safety: [
      '考核前充分热身',
      '确认场地边界',
      '同伴在侧保护',
    ],
    checklist: [
      { id: 'c1', text: '完成完整短套路无中断', weight: 30 },
      { id: 'c2', text: '步法与表情联动评分 ≥ 8', weight: 30 },
      { id: 'c3', text: '收势定型稳定 3 秒', weight: 20 },
      { id: 'c4', text: '安全规范全程遵守', weight: 20 },
    ],
  },

  // —— 中级 ——
  {
    id: 'int-01',
    stageId: 'intermediate',
    title: '双人站位与架体准备',
    subtitle: '狮尾与狮头的默契起点',
    duration: '01:50',
    durationSec: 110,
    cover: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573945',
    poster: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573945',
    videoUrl: VIDEO_INTERMEDIATE,
    order: 1,
    completed: true,
    progress: 100,
    summary: '建立双人站位、架体高度与沟通口令，为托举配合做准备。',
    tags: ['双人', '站位', '架体'],
    keyframes: [
      { id: 'i1-k1', time: 2, label: '站位确认', tip: '狮头在前，狮尾双手扶腰侧。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573945' },
      { id: 'i1-k2', time: 7, label: '架体成型', tip: '架体高度与肩同齐，双手握稳。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76518466' },
      { id: 'i1-k3', time: 37, label: '口令同步', tip: '以短促口令确认准备就绪。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573937' },
      { id: 'i1-k4', time: 66, label: '试抬轻离', tip: '轻抬离地试感，检查平衡。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573943' },
      { id: 'i1-k5', time: 70, label: '回落缓冲', tip: '膝屈缓冲落地，双人同步。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573944' },
      { id: 'i1-k6', time: 97, label: '调整间距', tip: '根据身高微调前后间距。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573946' },
      { id: 'i1-k7', time: 101, label: '定型确认', tip: '定型后双方口头确认。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76661222' },
    ],
    essentials: [
      '站位前后间距适中',
      '架体高度与肩齐平',
      '口令简洁统一',
      '试抬时双方同步发力',
    ],
    mistakes: [
      '间距过近导致碰撞',
      '架体歪斜单侧承重',
      '无口令突然起抬',
      '落地未屈膝缓冲',
    ],
    mnemonic: '站位架体口令齐，试抬轻离再落地。',
    safety: [
      '必须有教练在场',
      '垫子铺设于落地区',
      '禁止突然松手',
    ],
    checklist: [
      { id: 'c1', text: '站位与架体标准定型', weight: 25 },
      { id: 'c2', text: '口令同步无误', weight: 25 },
      { id: 'c3', text: '试抬离地平稳', weight: 25 },
      { id: 'c4', text: '落地缓冲规范', weight: 25 },
    ],
  },
  {
    id: 'int-02',
    stageId: 'intermediate',
    title: '架体托举：上升与稳定',
    subtitle: '核心托举力学',
    duration: '01:55',
    durationSec: 115,
    cover: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573937',
    poster: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573937',
    videoUrl: VIDEO_INTERMEDIATE,
    order: 2,
    progress: 60,
    summary: '完成从下蹲蓄力到托举到位的完整发力链，并在顶点保持稳定。',
    tags: ['托举', '力学', '稳定'],
    keyframes: [
      { id: 'i2-k1', time: 2, label: '蓄力下蹲', tip: '双人同步下蹲蓄力。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573945' },
      { id: 'i2-k2', time: 7, label: '启动上升', tip: '腿部发力主导，手臂辅助。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76518466' },
      { id: 'i2-k3', time: 37, label: '过腰到位', tip: '架体过腰后减速控制。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573937' },
      { id: 'i2-k4', time: 66, label: '顶点锁定', tip: '肘锁死，核心收紧稳定。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573943' },
      { id: 'i2-k5', time: 70, label: '微幅调整', tip: '微调重心，狮头保持水平。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573944' },
      { id: 'i2-k6', time: 97, label: '稳持计时', tip: '稳持 3–5 秒，呼吸均匀。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573946' },
      { id: 'i2-k7', time: 101, label: '预备下落', tip: '口令预备，准备同步下落。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76661222' },
    ],
    essentials: [
      '腿部发力为主、手臂为辅',
      '上升过程连贯加速再减速',
      '顶点肘关节锁定',
      '稳持时核心持续收紧',
    ],
    mistakes: [
      '纯靠手臂硬拉',
      '上升中途停顿失稳',
      '顶点塌肘',
      '狮头倾斜未及时纠正',
    ],
    mnemonic: '腿发臂助过腰稳，顶点锁肘核心紧。',
    safety: [
      '体重差过大需教练评估',
      '顶点不稳立即喊停下落',
      '护具齐全（腰带/护腕）',
    ],
    checklist: [
      { id: 'c1', text: '上升过程流畅无停顿', weight: 30 },
      { id: 'c2', text: '顶点稳持 ≥ 3 秒', weight: 30 },
      { id: 'c3', text: '狮头保持水平', weight: 20 },
      { id: 'c4', text: '发力以腿为主', weight: 20 },
    ],
  },
  {
    id: 'int-03',
    stageId: 'intermediate',
    title: '托举下落与协同换位',
    subtitle: '安全落地与流动配合',
    duration: '02:00',
    durationSec: 120,
    cover: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573946',
    poster: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573946',
    videoUrl: VIDEO_INTERMEDIATE,
    order: 3,
    progress: 0,
    locked: false,
    summary: '掌握可控下落、缓冲落地与双人换位，形成可重复的配合节奏。',
    tags: ['下落', '换位', '协同'],
    keyframes: [
      { id: 'i3-k1', time: 2, label: '预备口令', tip: '口令「落」前双方对视确认。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573945' },
      { id: 'i3-k2', time: 7, label: '同步下落', tip: '膝屈引导，速度可控。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76518466' },
      { id: 'i3-k3', time: 37, label: '缓冲触地', tip: '脚掌先触地，屈膝吸震。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573937' },
      { id: 'i3-k4', time: 66, label: '架体回收', tip: '架体平稳回收至腰侧。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573943' },
      { id: 'i3-k5', time: 70, label: '换位启动', tip: '侧步换位，保持接触点。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573944' },
      { id: 'i3-k6', time: 97, label: '新站位定型', tip: '换位后重新定型确认。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573946' },
      { id: 'i3-k7', time: 101, label: '连贯复练', tip: '连续三次下落换位。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76661222' },
    ],
    essentials: [
      '下落前必须口令确认',
      '屈膝缓冲，避免直腿落地',
      '换位保持身体接触点',
      '落地后立即重新定型',
    ],
    mistakes: [
      '无口令突然下落',
      '直腿硬砸地面',
      '换位时松手失联',
      '落地后站位混乱',
    ],
    mnemonic: '口令先落膝缓冲，换位接触不松手。',
    safety: [
      '落地区必须有垫',
      '疲劳时停止练习',
      '换位区域无旁人穿行',
    ],
    checklist: [
      { id: 'c1', text: '下落全程可控', weight: 30 },
      { id: 'c2', text: '缓冲落地规范', weight: 25 },
      { id: 'c3', text: '换位流畅无失联', weight: 25 },
      { id: 'c4', text: '连续三次成功率 100%', weight: 20 },
    ],
  },

  // —— 高级 ——
  {
    id: 'adv-01',
    stageId: 'advanced',
    title: '高桩入门：长凳平衡',
    subtitle: '离地展演的第一步',
    duration: '02:00',
    durationSec: 120,
    cover: 'https://1823568330.cdn.123clouddisk.com/1823568330/76661223',
    poster: 'https://1823568330.cdn.123clouddisk.com/1823568330/76661223',
    videoUrl: VIDEO_ADVANCED,
    order: 1,
    locked: false,
    progress: 0,
    summary: '在教练保护下完成长凳上站立与缓慢移步，建立高桩平衡感。',
    tags: ['高桩', '长凳', '平衡'],
    keyframes: [
      { id: 'a1-k1', time: 9, label: '上凳', tip: '侧身上凳，双手扶持稳固。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76661223' },
      { id: 'a1-k2', time: 54, label: '站稳', tip: '双脚平行，目视前方定点。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76661218' },
      { id: 'a1-k3', time: 100, label: '缓移', tip: '小步慢移，重心始终在凳面内。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76661220' },
      { id: 'a1-k4', time: 107, label: '下凳', tip: '面向下凳，屈膝落地。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573942' },
    ],
    essentials: [
      '上凳侧身、下凳面向',
      '目视前方定点减少晃动',
      '移步幅度小于半脚掌',
      '教练全程保护位待命',
    ],
    mistakes: [
      '上凳时重心外倾',
      '低头看脚失平衡',
      '步幅过大越界',
      '无保护自行上凳',
    ],
    mnemonic: '侧上正下定点视，小步慢移不越界。',
    safety: [
      '必须双人保护',
      '凳面防滑处理',
      '高度不超过初级训练标准',
    ],
    checklist: [
      { id: 'c1', text: '独立上凳站稳 ≥ 10 秒', weight: 30 },
      { id: 'c2', text: '缓移 3 步无晃倒', weight: 30 },
      { id: 'c3', text: '规范下凳', weight: 20 },
      { id: 'c4', text: '安全流程完整执行', weight: 20 },
    ],
  },
  {
    id: 'adv-02',
    stageId: 'advanced',
    title: '完整绿狮头：展演节奏',
    subtitle: '舞台化完整呈现',
    duration: '02:10',
    durationSec: 130,
    cover: 'https://1823568330.cdn.123clouddisk.com/1823568330/76661220',
    poster: 'https://1823568330.cdn.123clouddisk.com/1823568330/76661220',
    videoUrl: VIDEO_ADVANCED,
    order: 2,
    locked: false,
    progress: 0,
    summary: '佩戴完整绿狮头，在高桩与地面间完成展演段落，注重节奏与观赏性。',
    tags: ['绿狮', '展演', '节奏'],
    keyframes: [
      { id: 'a2-k1', time: 9, label: '登场', tip: '完整狮头登场，气势开场。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76661223' },
      { id: 'a2-k2', time: 54, label: '高桩亮相', tip: '高桩定点亮相 2 拍。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76661218' },
      { id: 'a2-k3', time: 100, label: '流转', tip: '桩间流转，狮头表情丰富。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76661220' },
      { id: 'a2-k4', time: 107, label: '收场', tip: '下桩收场，定型谢幕。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573942' },
    ],
    essentials: [
      '登场气势饱满',
      '亮相定型清晰可辨',
      '流转节奏与鼓点契合',
      '收场谢幕完整',
    ],
    mistakes: [
      '狮头遮挡导致视线盲区未预判',
      '亮相时间过短',
      '流转赶节奏失稳',
      '谢幕匆忙',
    ],
    mnemonic: '登场亮相节奏准，流转收场见功底。',
    safety: [
      '完整狮头重量需预先适应',
      '高桩区域双重保护',
      '鼓点指挥与动作员沟通畅通',
    ],
    checklist: [
      { id: 'c1', text: '完整段落无中断', weight: 30 },
      { id: 'c2', text: '亮相定型评分 ≥ 8', weight: 25 },
      { id: 'c3', text: '与鼓点契合度良好', weight: 25 },
      { id: 'c4', text: '安全落地无险情', weight: 20 },
    ],
  },

  // —— 场景教学 ——
  {
    id: 'con-01',
    stageId: 'concept',
    title: '第一组·老师教学生',
    subtitle: '课堂示范与纠错现场',
    duration: '01:40',
    durationSec: 100,
    cover: 'https://1823568330.cdn.123clouddisk.com/1823568330/76661221',
    poster: 'https://1823568330.cdn.123clouddisk.com/1823568330/76661221',
    videoUrl: VIDEO_CLASSROOM,
    order: 1,
    progress: 20,
    summary: '观察老师如何示范、拆解与纠正学生动作，学习教学组织方法。',
    tags: ['教学', '示范', '纠错'],
    keyframes: [
      { id: 'c1-k1', time: 10, label: '集合讲解', tip: '集合后先讲要点再示范。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76661221' },
      { id: 'c1-k2', time: 36, label: '慢速示范', tip: '慢速拆解关键环节。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76490086' },
      { id: 'c1-k3', time: 55, label: '学生跟练', tip: '分组跟练，老师巡视。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573948' },
      { id: 'c1-k4', time: 80, label: '即时纠错', tip: '点名纠正并复现正确动作。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573949' },
    ],
    essentials: [
      '先讲后练，节奏清晰',
      '示范分正常速与慢速',
      '纠错具体到关节与时机',
      '正向反馈与纠正并重',
    ],
    mistakes: [
      '讲解过长学生注意力散',
      '只说不示范',
      '纠错含糊（「再练练」）',
      '忽视安全提醒',
    ],
    mnemonic: '先讲后练慢示范，纠错具体有反馈。',
    safety: [
      '课堂人数与场地匹配',
      '器材检查列入开课流程',
      '急救联系方式张贴可见',
    ],
    checklist: [
      { id: 'c1', text: '能复述本节教学流程', weight: 30 },
      { id: 'c2', text: '指出至少 2 处示范要点', weight: 30 },
      { id: 'c3', text: '写出一条有效纠错话术', weight: 20 },
      { id: 'c4', text: '列出开课安全检查项', weight: 20 },
    ],
  },
  {
    id: 'con-02',
    stageId: 'concept',
    title: '第二组·社团',
    subtitle: '社团训练氛围与协作',
    duration: '01:30',
    durationSec: 90,
    cover: 'https://1823568330.cdn.123clouddisk.com/1823568330/76661219',
    poster: 'https://1823568330.cdn.123clouddisk.com/1823568330/76661219',
    videoUrl: VIDEO_CLUB,
    order: 2,
    progress: 0,
    summary: '走进社团日常训练，感受团队协作、轮换角色与互助氛围。',
    tags: ['社团', '协作', '氛围'],
    keyframes: [
      { id: 'c2-k1', time: 8, label: '热身集合', tip: '社团热身，气氛活跃。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76490086' },
      { id: 'c2-k2', time: 25, label: '分组轮换', tip: '狮头狮尾角色轮换练习。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573948' },
      { id: 'c2-k3', time: 50, label: '互助纠姿', tip: '同伴互看互纠。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76573949' },
      { id: 'c2-k4', time: 75, label: '合练收工', tip: '合练短套路后放松。', image: 'https://1823568330.cdn.123clouddisk.com/1823568330/76661219' },
    ],
    essentials: [
      '角色轮换保证全面发展',
      '同伴互助提高效率',
      '热身与放松不可省略',
      '社团文化尊重传承',
    ],
    mistakes: [
      '固定角色不愿轮换',
      '互助时语气不当',
      '跳过热身直接高强度',
      '忽视新人融入',
    ],
    mnemonic: '轮换互助热身全，社团传承靠大家。',
    safety: [
      '新人须有老社员陪练',
      '高强度项目分级参与',
      '训练日志记录伤病',
    ],
    checklist: [
      { id: 'c1', text: '理解角色轮换意义', weight: 25 },
      { id: 'c2', text: '描述一次有效互助场景', weight: 25 },
      { id: 'c3', text: '列出热身三要素', weight: 25 },
      { id: 'c4', text: '提出一条新人融入建议', weight: 25 },
    ],
  },
]

export const standardsTerms = [
  { term: '四点步', def: '前后开立、脚掌滚动落地的基础步法，是狮身移动的根基。' },
  { term: '架体', def: '狮尾双手构成的托举支撑结构，高度通常与肩齐。' },
  { term: '顶点锁定', def: '托举至最高点时肘关节伸直锁定、核心收紧的稳定状态。' },
  { term: '口令同步', def: '双人配合中用短促统一口令确认起抬、下落等关键节点。' },
  { term: '线框狮头', def: '初级训练用金属/木质框架狮头，减轻负重便于学习机械。' },
  { term: '完整狮头', def: '带彩扎、眼嘴机械的演出用狮头，重量与视野限制显著增加。' },
  { term: '高桩', def: '离地展演器械（长凳、桩阵等），要求更高的平衡与保护规范。' },
  { term: '收势定型', def: '套路结束时静止造型并保持数秒，体现控制力与完成度。' },
]

export const scoringDimensions = [
  { name: '动作规格', weight: 30, desc: '关节角度、步幅、握持与架体是否符合标准。' },
  { name: '节奏配合', weight: 20, desc: '与鼓点/口令/双人时机的契合程度。' },
  { name: '稳定控制', weight: 25, desc: '重心、顶点稳持、落地缓冲的质量控制。' },
  { name: '精神气势', weight: 15, desc: '狮头表情、展演张力与舞台完成度。' },
  { name: '安全规范', weight: 10, desc: '保护流程、护具、场地与口令执行情况。' },
]

export function getStage(id: StageId) {
  return stages.find((s) => s.id === id)!
}

export function getLessonsByStage(stageId: StageId) {
  return lessons.filter((l) => l.stageId === stageId).sort((a, b) => a.order - b.order)
}

export function getLesson(id: string) {
  return lessons.find((l) => l.id === id)
}

export function getContinueLesson() {
  const inProgress = lessons.find((l) => !l.locked && (l.progress ?? 0) > 0 && (l.progress ?? 0) < 100)
  if (inProgress) return inProgress
  return lessons.find((l) => !l.locked && !l.completed && (l.progress ?? 0) === 0) ?? lessons[0]
}

export function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function overallProgress() {
  const unlocked = lessons.filter((l) => !l.locked)
  if (!unlocked.length) return 0
  const sum = unlocked.reduce((acc, l) => acc + (l.progress ?? 0), 0)
  return Math.round(sum / unlocked.length)
}
