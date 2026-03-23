import { MODEL_STATUS, QUESTION_COUNTS, STORAGE_KEYS, SUBJECTS } from '../constants/exam';
import { getStorage, setStorage } from '../utils/storage';

const publicBasicsTemplates = [
  {
    stem: '下列关于行政许可的说法，正确的是？',
    options: ['行政许可可以口头随意撤销', '行政许可设定必须有法律依据', '行政许可一律由国务院作出', '行政许可不得附带条件'],
    answer: 1,
    explanation: '行政许可属于法定行政行为，设定和实施都需要符合法律法规依据。'
  },
  {
    stem: '我国宪法规定，中华人民共和国的一切权力属于谁？',
    options: ['公民', '人民', '国家机关', '全国人大'],
    answer: 1,
    explanation: '宪法明确规定国家的一切权力属于人民，这是人民主权原则的直接体现。'
  },
  {
    stem: '事业单位工作人员受到处分后，申诉期限一般为多久？',
    options: ['15 日', '30 日', '60 日', '90 日'],
    answer: 1,
    explanation: '常见事业单位人事争议与处分申诉规则中，30 日是高频考点。'
  }
];

const abilityTemplates = [
  {
    stem: '某单位要在 5 天内完成 150 份材料整理，平均每天需完成多少份？',
    options: ['20', '25', '30', '35'],
    answer: 2,
    explanation: '150 ÷ 5 = 30。'
  },
  {
    stem: '如果“所有报名者都提交了照片”，且“小王是报名者”，可以推出什么？',
    options: ['小王一定提交了照片', '小王可能没提交照片', '无法判断', '小王不是报名者'],
    answer: 0,
    explanation: '这是典型充分条件推理，属于直接推出。'
  },
  {
    stem: '将“统筹推进教育、科技、人才一体发展”重新排序，最合适的逻辑关系是？',
    options: ['先科技后教育再人才', '三者协同推进、相互支撑', '三者彼此独立', '只需抓住人才即可'],
    answer: 1,
    explanation: '综合能力题常考政策理解，核心是协同推进和相互支撑。'
  }
];

let modelState = {
  status: getStorage(STORAGE_KEYS.MODEL_STATUS, MODEL_STATUS.IDLE),
  reason: '尚未触发本地模型加载。'
};

export function getModelState() {
  return modelState;
}

export async function ensureModelReady() {
  // 微信小程序接入 Transformers.js 时，可在此加载本地模型文件。
  if (modelState.status === MODEL_STATUS.READY || modelState.status === MODEL_STATUS.FALLBACK) {
    return modelState;
  }

  modelState = {
    status: MODEL_STATUS.LOADING,
    reason: '正在准备本地题目生成能力。'
  };
  setStorage(STORAGE_KEYS.MODEL_STATUS, modelState.status);

  try {
    // 这里预留真正的本地模型推理逻辑；当前示例先启用离线模板兜底。
    modelState = {
      status: MODEL_STATUS.FALLBACK,
      reason: '当前示例使用离线模板模拟本地 AI 生成，可替换为 Transformers.js 真机推理。'
    };
    setStorage(STORAGE_KEYS.MODEL_STATUS, modelState.status);
    return modelState;
  } catch (error) {
    modelState = {
      status: MODEL_STATUS.ERROR,
      reason: error.message || '模型加载失败'
    };
    setStorage(STORAGE_KEYS.MODEL_STATUS, modelState.status);
    return modelState;
  }
}

function createQuestion(subject, indexSeed) {
  const templatePool = subject === SUBJECTS.PUBLIC_BASICS ? publicBasicsTemplates : abilityTemplates;
  const template = templatePool[indexSeed % templatePool.length];
  return {
    id: `${subject}-${Date.now()}-${indexSeed}-${Math.random().toString(16).slice(2, 8)}`,
    subject,
    type: 'single',
    stem: template.stem,
    options: template.options,
    answer: template.answer,
    explanation: template.explanation,
    createdAt: Date.now(),
    favorite: false
  };
}

export async function generateQuestionBatch(total = QUESTION_COUNTS.EXTRA_BATCH_SIZE) {
  await ensureModelReady();

  const half = Math.floor(total / 2);
  const publicBasicsCount = half;
  const abilityCount = total - half;
  const questions = [];

  for (let index = 0; index < publicBasicsCount; index += 1) {
    questions.push(createQuestion(SUBJECTS.PUBLIC_BASICS, index));
  }

  for (let index = 0; index < abilityCount; index += 1) {
    questions.push(createQuestion(SUBJECTS.ABILITY, index + publicBasicsCount));
  }

  return questions;
}
