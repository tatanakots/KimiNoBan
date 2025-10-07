<script setup lang="ts">
</script>

<template>
  <!-- 使用 flex 和 justify-center + items-center 居中 -->
  <div class="flex justify-center items-center min-h-screen bg-base-200 ml-20">
    <div class="card bg-base-100 w-3/4 shadow-sm mt-10 mb-10">
      <div class="card-body">
        <h2 class="card-title">关于软件</h2>
        <p>随机点名应用程序，做来玩玩的而已。</p>
        <div class="mockup-window border border-base-300 m-10">
          <div class="grid place-content-center border-t border-base-300 h-50">
            <h1 class="text-2xl">今は、君の番だ。</h1>
          </div>
        </div>
        <p class="text-center">&copy; 2025 Tatanakots.</p>
        <p class="text-center"><a class="link link-hover" href="mailto:t@mtf.im">t@mtf.im</a></p>
        <!-- <p class="text-center"><a class="link link-hover" href="https://t.mtf.im/">https://t.mtf.im</a></p> -->
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 可选：添加背景颜色或者其他样式 */
</style>
