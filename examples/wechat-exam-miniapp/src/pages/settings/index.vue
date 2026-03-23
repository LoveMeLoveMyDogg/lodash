<template>
  <view class="page">
    <view class="panel">
      <view class="row">
        <text>每日推送提醒</text>
        <switch :checked="settings.notificationEnabled" @change="handleToggle" />
      </view>
      <view class="row column">
        <text>AI 模型状态</text>
        <text class="status">{{ modelStatus }}</text>
      </view>
      <button class="danger-button" @click="handleClear">清空缓存</button>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { examState, clearAllCache, initializeExamApp, updateNotificationEnabled } from '../../store/exam';

const settings = computed(() => examState.settings);
const modelStatus = computed(() => examState.modelStatus);

onShow(async () => {
  await initializeExamApp();
});

async function handleToggle(event) {
  const enabled = Boolean(event.detail.value);
  const finalValue = await updateNotificationEnabled(enabled);
  if (!finalValue && enabled) {
    uni.showToast({
      title: '订阅消息授权失败',
      icon: 'none'
    });
  }
}

async function handleClear() {
  clearAllCache();
  await initializeExamApp();
  uni.showToast({
    title: '缓存已重置',
    icon: 'success'
  });
}
</script>

<style scoped>
.page {
  padding: 24rpx;
}

.panel {
  padding: 24rpx;
  border-radius: 24rpx;
  background: #ffffff;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 2rpx solid #eef2f7;
}

.column {
  align-items: flex-start;
  flex-direction: column;
  gap: 12rpx;
}

.status {
  color: #2563eb;
}

.danger-button {
  margin-top: 24rpx;
  color: #ffffff;
  background: #dc2626;
}
</style>
