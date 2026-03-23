<template>
  <view class="page">
    <view class="hero">
      <text class="title">今日 10 题</text>
      <text class="subtitle">{{ displayDate }}</text>
      <text class="meta">公基 5 题 + 综合能力 5 题，题目来自本地缓存题库</text>
    </view>

    <view class="actions">
      <button type="primary" @click="goPractice">再来 10 道</button>
      <button @click="goWrongBook">错题本</button>
      <button @click="goSettings">设置</button>
    </view>

    <QuestionCard
      v-for="(question, index) in todayQuestions"
      :key="question.id"
      :question="question"
      :index="index"
      :answer-state="answerState"
      @answer="handleAnswer"
      @favorite="handleFavorite"
    />
  </view>
</template>

<script setup>
import { computed, reactive } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import QuestionCard from '../../components/QuestionCard.vue';
import { formatDisplayDate } from '../../utils/date';
import {
  examState,
  getTodayQuestions,
  initializeExamApp,
  submitAnswer,
  toggleFavorite
} from '../../store/exam';

const answerState = reactive({});
const todayQuestions = computed(() => getTodayQuestions());
const displayDate = computed(() => formatDisplayDate(examState.todayKey));

onShow(async () => {
  await initializeExamApp();
});

function handleAnswer(question, selectedIndex) {
  const result = submitAnswer(question, selectedIndex);
  answerState[question.id] = {
    ...result,
    selectedIndex
  };
}

function handleFavorite(questionId) {
  toggleFavorite(questionId);
}

function goPractice() {
  uni.navigateTo({
    url: '/pages/practice/index'
  });
}

function goWrongBook() {
  uni.navigateTo({
    url: '/pages/wrong-book/index'
  });
}

function goSettings() {
  uni.navigateTo({
    url: '/pages/settings/index'
  });
}
</script>

<style scoped>
.page {
  padding: 24rpx;
}

.hero {
  padding: 32rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: #ffffff;
  margin-bottom: 24rpx;
}

.title {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
}

.subtitle,
.meta {
  display: block;
  margin-top: 12rpx;
  opacity: 0.92;
}

.actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  margin-bottom: 24rpx;
}
</style>
