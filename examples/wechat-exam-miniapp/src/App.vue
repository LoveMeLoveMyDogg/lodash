<script setup>
import { onLaunch, onShow } from '@dcloudio/uni-app';
import { initializeExamApp, syncNotificationPreference } from './store/exam';

// 小程序启动时初始化 3 天题库与本地缓存。
onLaunch(async () => {
  await initializeExamApp();
});

// 每次回到前台时同步提醒设置，保证开关状态一致。
onShow(async () => {
  await syncNotificationPreference();
});
</script>

<style>
page {
  min-height: 100%;
  background: #f5f7fb;
  color: #1f2937;
  font-size: 28rpx;
}

view,
text,
button {
  box-sizing: border-box;
}
</style>
