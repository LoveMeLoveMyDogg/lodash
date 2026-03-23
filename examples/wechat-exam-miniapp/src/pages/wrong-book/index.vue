<template>
  <view class="page">
    <view v-if="!questions.length" class="empty-card">
      <text>暂时还没有错题，继续加油。</text>
    </view>

    <view v-for="(question, index) in questions" :key="question.id" class="wrong-item">
      <QuestionCard
        :question="question"
        :index="index"
        :answer-state="answerState"
        @answer="handleAnswer"
        @favorite="handleFavorite"
      />
      <button class="delete-button" @click="handleDelete(question.id)">删除该错题</button>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import QuestionCard from '../../components/QuestionCard.vue';
import {
  getWrongQuestions,
  removeWrongQuestion,
  submitAnswer,
  toggleFavorite
} from '../../store/exam';

const answerState = reactive({});
const questions = ref([]);

onShow(() => {
  questions.value = getWrongQuestions();
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
  questions.value = getWrongQuestions();
}

function handleDelete(questionId) {
  removeWrongQuestion(questionId);
  questions.value = getWrongQuestions();
}
</script>

<style scoped>
.page {
  padding: 24rpx;
}

.empty-card {
  padding: 32rpx;
  border-radius: 24rpx;
  background: #ffffff;
  text-align: center;
  color: #64748b;
}

.wrong-item {
  margin-bottom: 16rpx;
}

.delete-button {
  color: #b91c1c;
  background: #fee2e2;
}
</style>
