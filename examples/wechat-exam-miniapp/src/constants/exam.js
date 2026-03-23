// 统一维护题库、错题本与收藏的缓存上限，便于后续扩展。
export const STORAGE_KEYS = {
  EXAM_BANK: 'exam_bank',
  DAILY_RECORDS: 'daily_exam_records',
  WRONG_BOOK: 'wrong_book',
  FAVORITES: 'favorite_questions',
  SETTINGS: 'exam_settings',
  MODEL_STATUS: 'ai_model_status'
};

export const QUESTION_COUNTS = {
  DAILY_TOTAL: 10,
  DAILY_PUBLIC_BASICS: 5,
  DAILY_ABILITY: 5,
  PRELOAD_DAYS: 3,
  BANK_LIMIT: 50,
  WRONG_BOOK_LIMIT: 200,
  EXTRA_BATCH_SIZE: 10
};

export const SUBJECTS = {
  PUBLIC_BASICS: '公基',
  ABILITY: '综合能力'
};

export const DEFAULT_SETTINGS = {
  notificationEnabled: false
};

export const MODEL_STATUS = {
  IDLE: '未加载',
  LOADING: '加载中',
  READY: '已就绪',
  FALLBACK: '模板兜底',
  ERROR: '加载失败'
};
