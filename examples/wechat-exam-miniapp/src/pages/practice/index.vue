<template>
  <view class="page">
    <view class="header-card">
      <text class="title">加练模式</text>
      <text class="desc">点击按钮立即本地生成 10 道新题，并替换缓存中最旧的 10 道题。</text>
      <button type="primary" @click="loadExtraQuestions">再来 10 道</button>
    </view>

    <QuestionCard
      v-for="(question, index) in questions"
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
import { reactive, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import QuestionCard from '../../components/QuestionCard.vue';
import {
  generateExtraQuestions,
  getExtraQuestions,
  submitAnswer,
  toggleFavorite
} from '../../store/exam';

const answerState = reactive({});
const questions = ref([]);

onShow(() => {
  questions.value = getExtraQuestions();
});

async function loadExtraQuestions() {
  await generateExtraQuestions();
  questions.value = getExtraQuestions();
}

function handleAnswer(question, selectedIndex) {
  const result = submitAnswer(question, selectedIndex);
  answerState[question.id] = {
    ...result,
    selectedIndex
  };
}

function handleFavorite(questionId) {
  toggleFavorite(questionId);
  questions.value = getExtraQuestions();
}
</script>

<style scoped>
.page {
  padding: 24rpx;
}

.header-card {
  margin-bottom: 24rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: #ffffff;
}

.title {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  margin-bottom: 12rpx;
}

.desc {
  display: block;
  margin-bottom: 20rpx;
  color: #475569;
  line-height: 1.6;
}
</style>
