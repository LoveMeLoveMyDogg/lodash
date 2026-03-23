import { reactive } from 'vue';
import {
  DEFAULT_SETTINGS,
  MODEL_STATUS,
  QUESTION_COUNTS,
  STORAGE_KEYS
} from '../constants/exam';
import { ensureModelReady, generateQuestionBatch, getModelState } from '../services/aiGenerator';
import { getSettings, requestDailyNotification, saveSettings } from '../services/notification';
import { addDays, formatDateKey } from '../utils/date';
import { getStorage, removeStorage, setStorage } from '../utils/storage';

export const examState = reactive({
  todayKey: formatDateKey(),
  bank: [],
  dailyRecords: {},
  wrongBook: [],
  favorites: [],
  settings: getSettings(),
  modelStatus: getStorage(STORAGE_KEYS.MODEL_STATUS, MODEL_STATUS.IDLE),
  extraQuestions: []
});

function persistCoreState() {
  setStorage(STORAGE_KEYS.EXAM_BANK, examState.bank);
  setStorage(STORAGE_KEYS.DAILY_RECORDS, examState.dailyRecords);
  setStorage(STORAGE_KEYS.WRONG_BOOK, examState.wrongBook);
  setStorage(STORAGE_KEYS.FAVORITES, examState.favorites);
}

function assignDayQuestions(dateKey, questionIds) {
  examState.dailyRecords[dateKey] = questionIds;
}

function getQuestionById(questionId) {
  return examState.bank.find((item) => item.id === questionId)
    || examState.extraQuestions.find((item) => item.id === questionId)
    || examState.wrongBook.find((item) => item.id === questionId);
}

function markFavoritesOnQuestions(questions) {
  return questions.map((question) => ({
    ...question,
    favorite: examState.favorites.includes(question.id)
  }));
}

async function preloadBankIfNeeded() {
  examState.bank = getStorage(STORAGE_KEYS.EXAM_BANK, []);
  examState.dailyRecords = getStorage(STORAGE_KEYS.DAILY_RECORDS, {});
  examState.wrongBook = getStorage(STORAGE_KEYS.WRONG_BOOK, []);
  examState.favorites = getStorage(STORAGE_KEYS.FAVORITES, []);

  if (examState.bank.length >= QUESTION_COUNTS.DAILY_TOTAL * QUESTION_COUNTS.PRELOAD_DAYS) {
    return;
  }

  const preloadTotal = QUESTION_COUNTS.DAILY_TOTAL * QUESTION_COUNTS.PRELOAD_DAYS;
  const questions = await generateQuestionBatch(preloadTotal);
  examState.bank = questions.slice(0, QUESTION_COUNTS.BANK_LIMIT);

  for (let dayOffset = 0; dayOffset < QUESTION_COUNTS.PRELOAD_DAYS; dayOffset += 1) {
    const dateKey = formatDateKey(addDays(new Date(), dayOffset));
    const start = dayOffset * QUESTION_COUNTS.DAILY_TOTAL;
    const end = start + QUESTION_COUNTS.DAILY_TOTAL;
    assignDayQuestions(dateKey, examState.bank.slice(start, end).map((item) => item.id));
  }

  persistCoreState();
}

async function ensureTodayQuestions() {
  examState.todayKey = formatDateKey();
  const todayRecord = examState.dailyRecords[examState.todayKey];
  if (todayRecord?.length === QUESTION_COUNTS.DAILY_TOTAL) {
    return;
  }

  // 如果当天题目尚未分配，则补一批新题并按滚动策略替换最旧题。
  const freshQuestions = await generateQuestionBatch(QUESTION_COUNTS.DAILY_TOTAL);
  examState.bank = [...examState.bank.slice(QUESTION_COUNTS.DAILY_TOTAL), ...freshQuestions]
    .slice(-QUESTION_COUNTS.BANK_LIMIT);

  assignDayQuestions(examState.todayKey, freshQuestions.map((item) => item.id));
  persistCoreState();
}

export async function initializeExamApp() {
  await ensureModelReady();
  await preloadBankIfNeeded();
  await ensureTodayQuestions();
  examState.modelStatus = getModelState().status;
}

export async function syncNotificationPreference() {
  examState.settings = getSettings();
}

export function getTodayQuestions() {
  const ids = examState.dailyRecords[examState.todayKey] || [];
  const questions = ids.map((id) => getQuestionById(id)).filter(Boolean);
  return markFavoritesOnQuestions(questions);
}

export function getExtraQuestions() {
  return markFavoritesOnQuestions(examState.extraQuestions);
}

export function getWrongQuestions() {
  return markFavoritesOnQuestions(examState.wrongBook);
}

export async function generateExtraQuestions() {
  const freshQuestions = await generateQuestionBatch(QUESTION_COUNTS.EXTRA_BATCH_SIZE);

  // 按需求将新题覆盖最旧题，保持题库总体积稳定。
  examState.bank = [...examState.bank.slice(QUESTION_COUNTS.EXTRA_BATCH_SIZE), ...freshQuestions]
    .slice(-QUESTION_COUNTS.BANK_LIMIT);
  examState.extraQuestions = freshQuestions;
  persistCoreState();
  return freshQuestions;
}

export function submitAnswer(question, selectedIndex) {
  const isCorrect = question.answer === selectedIndex;

  if (!isCorrect) {
    // 错题本按先进先出滚动替换，最多保留 200 题。
    const nextWrongBook = [...examState.wrongBook.filter((item) => item.id !== question.id), question];
    examState.wrongBook = nextWrongBook.slice(-QUESTION_COUNTS.WRONG_BOOK_LIMIT);
    setStorage(STORAGE_KEYS.WRONG_BOOK, examState.wrongBook);
  }

  return {
    isCorrect,
    correctAnswer: question.answer,
    explanation: question.explanation
  };
}

export function toggleFavorite(questionId) {
  const favoriteSet = new Set(examState.favorites);
  if (favoriteSet.has(questionId)) {
    favoriteSet.delete(questionId);
  } else {
    favoriteSet.add(questionId);
  }
  examState.favorites = [...favoriteSet];
  setStorage(STORAGE_KEYS.FAVORITES, examState.favorites);
}

export function removeWrongQuestion(questionId) {
  examState.wrongBook = examState.wrongBook.filter((item) => item.id !== questionId);
  setStorage(STORAGE_KEYS.WRONG_BOOK, examState.wrongBook);
}

export async function updateNotificationEnabled(enabled) {
  let finalValue = enabled;

  if (enabled) {
    finalValue = await requestDailyNotification();
  }

  examState.settings = {
    ...DEFAULT_SETTINGS,
    ...examState.settings,
    notificationEnabled: finalValue
  };
  saveSettings(examState.settings);
  return finalValue;
}

export function clearAllCache() {
  removeStorage(STORAGE_KEYS.EXAM_BANK);
  removeStorage(STORAGE_KEYS.DAILY_RECORDS);
  removeStorage(STORAGE_KEYS.WRONG_BOOK);
  removeStorage(STORAGE_KEYS.FAVORITES);
  removeStorage(STORAGE_KEYS.SETTINGS);
  removeStorage(STORAGE_KEYS.MODEL_STATUS);

  examState.bank = [];
  examState.dailyRecords = {};
  examState.wrongBook = [];
  examState.favorites = [];
  examState.extraQuestions = [];
  examState.settings = { ...DEFAULT_SETTINGS };
  examState.modelStatus = MODEL_STATUS.IDLE;
}
