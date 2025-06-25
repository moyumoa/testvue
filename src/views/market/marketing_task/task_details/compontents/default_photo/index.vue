<template>
  <div class="default_photo">
    <span v-if="props.name.length <= 2">
      {{ props.name.slice(0, 2) }}
    </span>
    <span v-else>{{ props.name.slice(props.name.length - 2) }}</span>
  </div>
</template>

<script setup>
const props = defineProps({
  name: { type: String, required: true }
})
</script>

<style lang="scss" scoped>
.default_photo {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #eff3fd;
  border: 1px solid #a9b0d1;
  color: #5d658e;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
