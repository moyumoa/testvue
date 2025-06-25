<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    title="选择商品"
    width="560px"
    custom-class="rule_setting_dialog hide_footer_line show_header_line"
  >
    <div class="dialog_content" v-loading="loading">
      <div class="one_goodGroup" v-for="(item, index) in list" :key="index">
        <div class="one_goodGroup_label">{{ index }}</div>
        <div class="one_goodGroup_content">
          <div
            :class="{
              one_good: true,
              one_good_choose: chooseInfo.productName === x.productName,
              dis_good: btnLoading
            }"
            v-for="(x, y) in item"
            :key="y"
            @click.stop="chooseGoodFun(x)"
          >
            {{ x.productName }}
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button :disabled="btnLoading" @click="closeDialog">取消</el-button>
        <el-button type="primary" :loading="btnLoading" @click="handleConfirm">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { throttle, isEmpty } from '@/utils/tools.js'
import { listRecommendProduct, getRecommendProductFeat } from '@/api/sumvideo/script_creative.js'
const props = defineProps({
  chooseDialog: {
    type: Object,
    default: () => {
      return {
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const dialog = ref()
const show = toRef(props.chooseDialog, 'show')
const loading = ref(true)
const btnLoading = ref(false)
const list = ref([]) // 商品列表
const chooseInfo = ref({}) // 选中的商品信息
const emits = defineEmits(['updateGood'])
const message = inject('$message')
// 获取商品列表
function getList() {
  loading.value = true
  // const goodPromise = new Promise(resolve => {
  //   resolve({
  //     success: true,
  //     code: 0,
  //     msg: '成功',
  //     data: {
  //       "A":[
  //         {
  //           pinyin: 'A',
  //           productName: 'Ahhhh'
  //         }
  //       ],
  //       "B":[
  //         {
  //           pinyin: 'B',
  //           productName: 'B111'
  //         }
  //       ]
  //     },
  //     requestID: '0115111321028'
  //   })
  // })
  const goodPromise = listRecommendProduct({})
  goodPromise
    .then(res => {
      if (res.code === 0) {
        list.value = res.data || []
      }
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}
getList()

// 选择商品
const chooseGoodFun = throttle(item => {
  if (btnLoading.value) return
  chooseInfo.value = chooseInfo.value.productName === item.productName ? {} : item
}, 0)

// 弹窗的确定事件
const handleConfirm = throttle(() => {
  if (isEmpty(chooseInfo.value)) {
    message.warning('请选择商品')
    return
  }
  btnLoading.value = true

  // 获取商品特点
  // const goodsDesc = new Promise(resolve => {
  //   setTimeout(() => {
  //     resolve({
  //       code: 0
  //     })
  //   }, 2000)
  // })
  const goodsDesc = getRecommendProductFeat({
    productName: chooseInfo.value.productName
  })
  goodsDesc
    .then(res => {
      if (res.code === 0) {
        // message.success('新建成功')

        emits('updateGood', {
          productName: res.data.productName || chooseInfo.value.productName,
          productFeat: res.data.productFeat
        })
        dialog.value.handleClose()
        btnLoading.value = false
      } else {
        btnLoading.value = false
      }
    })
    .catch(() => {
      btnLoading.value = false
    })
}, 700)
function closeDialog() {
  dialog.value.handleClose()
}
</script>
<style lang="scss" scoped>
.dialog_content {
  min-height: 100px;
  width: 100%;
  padding: 0px 4px 10px 16px;
  max-height: 332px;
  overflow-y: auto;
  .one_goodGroup {
    margin-top: 16px;
    width: 100%;
    .one_goodGroup_label {
      font-weight: 400;
      font-size: 12px;
      color: #909399;
      line-height: 18px;
    }
    .one_goodGroup_content {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
      flex-wrap: wrap;
      .one_good {
        background: #f7f8fa;
        border-radius: 4px;
        cursor: pointer;
        padding: 2px 6px;
        margin-right: 10px;
        margin-top: 12px;
        min-height: 24px;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        font-weight: 400;
        font-size: 14px;
        color: #606266;
        line-height: 20px;
        &:hover {
          background: rgba(54, 79, 205, 0.1);
        }
      }
      .dis_good {
        cursor: not-allowed;
        &:hover {
          background: #f7f8fa;
        }
      }
      .one_good_choose {
        background: #364fcd !important;
        color: #fff !important;
      }
    }
  }
}
</style>
