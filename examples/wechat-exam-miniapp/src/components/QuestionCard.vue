<template>
  <view class="card">
    <view class="card-header">
      <text class="subject">{{ question.subject }}</text>
      <button class="favorite-button" size="mini" @click="$emit('favorite', question.id)">
        {{ question.favorite ? '已收藏' : '收藏' }}
      </button>
    </view>

    <text class="stem">{{ index + 1 }}. {{ question.stem }}</text>

    <view class="options">
      <button
        v-for="(option, optionIndex) in question.options"
        :key="`${question.id}-${optionIndex}`"
        class="option"
        :class="optionClass(optionIndex)"
        @click="$emit('answer', question, optionIndex)"
      >
        {{ optionLabel(optionIndex) }}. {{ option }}
      </button>
    </view>

    <view v-if="feedback" class="feedback" :class="feedback.isCorrect ? 'feedback-success' : 'feedback-error'">
      <text>{{ feedback.isCorrect ? '回答正确' : '回答错误' }}</text>
      <text>正确答案：{{ optionLabel(feedback.correctAnswer) }}</text>
      <text>解析：{{ feedback.explanation }}</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  question: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    default: 0
  },
  answerState: {
    type: Object,
    default: () => ({})
  }
});

const feedback = computed(() => props.answerState[props.question.id]);

function optionLabel(index) {
  return ['A', 'B', 'C', 'D'][index] || '';
}

function optionClass(optionIndex) {
  if (!feedback.value) {
    return '';
  }

  if (optionIndex === feedback.value.correctAnswer) {
    return 'option-correct';
  }

  if (!feedback.value.isCorrect && optionIndex === feedback.value.selectedIndex) {
    return 'option-error';
  }

  return '';
}
</script>

<style scoped>
.card {
  margin-bottom: 24rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 20rpx rgba(15, 23, 42, 0.06);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.subject {
  color: #2563eb;
  font-weight: 600;
}

.favorite-button {
  margin: 0;
  color: #2563eb;
  background: #eff6ff;
}

.stem {
  display: block;
  line-height: 1.7;
  margin-bottom: 20rpx;
}

.option {
  margin-bottom: 16rpx;
  border: 2rpx solid #dbe3f0;
  border-radius: 16rpx;
  background: #f8fafc;
  color: #334155;
  text-align: left;
}

.option-correct {
  border-color: #16a34a;
  background: #dcfce7;
}

.option-error {
  border-color: #dc2626;
  background: #fee2e2;
}

.feedback {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-top: 12rpx;
  padding: 16rpx;
  border-radius: 16rpx;
}

.feedback-success {
  background: #ecfdf5;
  color: #166534;
}

.feedback-error {
  background: #fff1f2;
  color: #9f1239;
}
</style>
