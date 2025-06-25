<template>
  <div class="business_entity">
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      title="标记业务主体"
      width="560px"
    >
      <div class="dialog_container">
        <div
          :class="{
            dialog_container_item: true,
            dialog_container_active: selfType === item.principalType
          }"
          v-for="item in list"
          :key="item"
          @click="selfType = item.principalType"
        >
          <img
            v-if="item.principalType === 2"
            src="https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/729f02a0cb1e42828b7f07620de3c8e3_1685520521221.png"
            alt="blue"
            class="img_icon"
          />
          <img
            v-if="item.principalType === 3"
            src="https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/a3eff811b4a84c03b872828ab9bf2c1f_1685522819049.png"
            alt="orange"
            class="img_icon"
          />
          <img
            v-if="item.principalType === 4"
            src="https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/fffe6152f72843dea8085f29574a3204_1685522835218.png"
            alt="green"
            class="img_icon"
          />
          <img
            v-if="item.principalType === 1"
            src="https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/718695414d324092890156204bd8f977_1685522849733.png"
            alt="none"
            class="img_icon"
          />
          <div class="text">{{ item.principalName }}</div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button :disabled="loading" @click="show = false">取消</el-button>
          <el-button type="primary" :disabled="loading" :loading="loading" @click="handleConfirm">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { getBusinessEntity } from '@/api/system_setting/business_entity.js'

const props = defineProps({
  modelValue: Boolean,
  // 当前选中的类型;
  currentType: {
    type: Number,
    default: 1
  }
})

const emits = defineEmits(['update:modelValue', 'confirm'])
const show = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emits('update:modelValue', value)
  }
})

const loading = ref(false)
const selfType = ref(1)
onMounted(() => {
  selfType.value = props.currentType
  getBusinessEntity({}).then(res => {
    if (res.code === 0) {
      list.value = res.data || []
      list.value = list.value.filter(item => item.isOpen === 1)
      // 添加取消节点
      list.value.push({
        id: 3,
        principalType: 1,
        principalName: '不标记',
        checked: true
      })
    }
  })
})
const list = ref([])

const handleConfirm = () => {
  show.value = false
  // 如果有修改 保存信息
  if (selfType.value !== props.currentType) {
    const info = list.value.filter(x => x.principalType === selfType.value)
    emits('confirm', selfType.value, info && info.length > 0 ? info[0].principalName : '')
  }
}
</script>

<style lang="scss" scoped>
.business_entity {
  .dialog_container {
    display: flex;
    align-items: center;
    justify-content: space-evenly;

    .dialog_container_item {
      width: 118px;
      height: 140px;
      border-radius: 2px;
      //background-color: #fff;
      //background-color: #f7f8fa;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;

      .img_icon {
        width: 48px;
        height: 48px;
      }

      .text {
        margin-top: 8px;
        width: 70px;
        height: 24px;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #323233;
        line-height: 24px;
      }
    }

    .dialog_container_active {
      background-color: #f7f8fa;
    }
  }
}
</style>
