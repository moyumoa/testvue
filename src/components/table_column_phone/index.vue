<template>
  <span :class="['phone', `${size}_phone`, `${color}_phone`]">
    <span>{{ phoneStr }}</span>
    <img
      v-if="isPlaintext && phone && phone != '--'"
      :src="isShowPhone ? showIcon : hideIcon"
      @click="isShowPhone = !isShowPhone"
    />
  </span>
</template>

<script setup>
import showIcon from '@/assets/images/content_center/yanjing_xianshi.png'
import hideIcon from '@/assets/images/content_center/yanjing_yincang.png'

const props = defineProps({
  phone: String,
  size: {
    type: String,
    default: 'normal'
  },
  color: {
    type: String,
    default: ''
  }
})
const { phone } = toRefs(props)
// 明文显示
const isShowPhone = ref(false)

// 是否有明文权限
const isPlaintext = computed(() => {
  const systemModule = sessionStorage.getItem('systemModule')
  return systemModule.includes('phone_plaintext')
})

const phoneStr = computed(() => {
  if (!phone.value) return '--'
  if (phone.value === '--') return '--'
  // 密文
  const encryptPhone = `${phone.value.substring(0, 3)}****${phone.value.substring(7)}`
  // 有明文权限，但隐藏明文
  if (isPlaintext.value && !isShowPhone.value) {
    return encryptPhone
  }
  // 无明文权限，但后端返回明文
  if (!isPlaintext.value && phone.value.length === 11 && !phone.value.includes('*')) {
    return encryptPhone
  }
  return phone.value
})
</script>

<style lang="scss" scoped>
.phone {
  // display: flex;
  // align-items: center;
  display: inline-block;
  height: 20px;
  span {
    vertical-align: middle;
    color: #303133;
  }
  img {
    vertical-align: middle;
    width: 16px;
    height: 16px;
    margin-left: 6px;
    cursor: pointer;
  }
}

.small_phone {
  span {
    color: #909399;
    font-size: 12px;
  }
  img {
    width: 14px;
    height: 14px;
  }
}
.fff_phone {
  span {
    color: #fff !important;
  }
}
</style>
