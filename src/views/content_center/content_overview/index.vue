<template>
  <!--  首页内容概览-->
  <!-- <CompatibleMode v-if="brandViewMode === 1"></CompatibleMode> -->
  <ClueMode></ClueMode>
</template>

<script setup>
import ClueMode from '@/views/content_center/content_overview/clue_mode.vue'
// import CompatibleMode from '@/views/content_center/content_overview/compatible_mode.vue'
// import { useStore } from 'vuex'
// const store = useStore()

// const brandViewMode = computed(() => store.state.user.brandViewMode)
// const brandViewMode = 2
</script>

<style lang="scss" scoped></style>
