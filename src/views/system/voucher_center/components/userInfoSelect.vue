<template>
  <div class="useInfoSelect">
    <el-select
      v-model="userId"
      style="width: 220px"
      placeholder="请输入成员姓名、手机号"
      filterable
      remote
      reserve-keyword
      :remote-method="getUserInfo"
      :loading="userLoading"
      @change="onChange"
      :disabled="disabled"
    >
      <el-option
        v-for="option in userInfoList"
        :value="option.userId"
        :key="option.userId"
        :disabled="option.disabled"
        :label="option.userBrandName"
      ></el-option>
    </el-select>
  </div>
</template>

<script setup>
import { debounce } from '@/utils/tools'
import { getListUserInfo } from '@/api/market/operation.js'
const userId = ref('')
const userInfoList = ref([])
const userLoading = ref(false)
const props = defineProps({
  brandId: {
    type: [Number, String],
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  info: {
    type: Object,
    default: () => {
      return {
        userId: '',
        userBrandName: [],
        userInfoList: []
      }
    }
  },
  list: {
    type: Array,
    default: () => {
      return []
    }
  }
})
const emit = defineEmits(['updateInfo'])
onMounted(() => {
  if (props.info.userId) {
    userId.value = props.info.userId
  }
  if (props.info.userInfoList) {
    userInfoList.value = props.info.userInfoList
  }
})
const getUserInfo = debounce(function (query) {
  const name = query.trim()
  if (!name) {
    return
  }

  userLoading.value = true
  getListUserInfo({
    // brandId: props.brandId,
    name: name,
    isValid: 1
  }).then(res => {
    if (res.code === 0 || res.code === 200) {
      userInfoList.value = res.data || []
      userInfoList.value.forEach(item => {
        item.userId += ''
        const temp = props.list.find(i => i.userId === item.userId)
        if (temp) {
          item.disabled = temp?.userId !== userId.value
        } else {
          item.disabled = false
        }
      })
    }
    userLoading.value = false
  })
}, 1000)
const onChange = value => {
  const temp = userInfoList.value.find(item => item.userId === value)
  emit('updateInfo', {
    ...temp,
    userInfoList: userInfoList.value
  })
}
</script>

<style lang="scss" scoped></style>
