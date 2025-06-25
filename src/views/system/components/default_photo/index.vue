<template>
  <div :class="{ default_photo: true, small_photo: props.type === 'selfBuilt' }">
    <template v-if="props.name">
      <span v-if="props.name.length <= 2">
        {{ props.name.slice(0, 2) }}
      </span>
      <span v-else>{{ props.name.slice(props.name.length - 2) }}</span>
    </template>
    <img
      v-else
      class="photo_icon"
      src="https://tagvv-1256030678.file.myqcloud.com/20230118sziw2.png"
      alt=""
    />
  </div>
</template>

<script setup>
const props = defineProps({
  name: { type: String, required: true },
  type: { type: String }
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
.small_photo {
  width: 40px;
  height: 40px;
  font-size: 12px;
  margin-right: 12px;
}
.photo_icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #eff3fd;
}
</style>
