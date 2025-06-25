<template>
  <div>
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      title="新建剧本"
      width="560px"
      custom-class="rule_setting_dialog hide_footer_line show_header_line"
    >
      <div
        class="dialog_container"
        v-loading="type === 1 ? btnLoading : false"
        :element-loading-text="type === 1 ? '链接读取中' : ''"
      >
        <!-- 类型 -->
        <el-radio-group v-model="type">
          <el-radio :disabled="btnLoading" :label="1">爆款拆解</el-radio>
          <el-radio :disabled="btnLoading" :label="2">根据产品创建</el-radio>
          <el-radio :disabled="btnLoading" :label="3">自由创建</el-radio>
        </el-radio-group>
        <!-- 爆款拆解 -->
        <div class="type_box" v-if="type == 1">
          <el-input
            :disabled="btnLoading"
            class="type1_input"
            :row="2"
            type="textarea"
            v-model.trim="hotInputValue"
            resize="none"
            placeholder="请输入视频链接地址🔗"
            @blur="inputBlurFun($event, 'hotInputValue')"
          ></el-input>
          <div class="type_err" v-if="showHotErr">链接内容获取失败，换一个试试吧</div>
        </div>
        <!-- 根据产品创建 -->
        <div class="type_box direct_box" v-if="type == 2">
          <div class="direct_top">
            <span>输入商品信息</span>
            <span v-if="hasGoods">或</span>
            <el-button
              :disabled="btnLoading"
              v-if="hasGoods"
              type="primary"
              @click.stop="chooseFun"
            >
              选择商品
            </el-button>
          </div>
          <div class="direct_form">
            <div class="one_form_line">
              <div class="form_label">商品名称：</div>
              <div class="form_content">
                <!-- 如果是选择商品，就用选择的样式 -->
                <div class="choose_good" v-if="form.isGood">
                  <div class="good_name">
                    <div class="name_name">
                      {{ form.name || '' }}
                    </div>
                    <el-icon class="name_del" @click.stop="delGoodFun">
                      <i-close />
                    </el-icon>
                  </div>
                </div>
                <!-- 反之用输入框 -->
                <el-input
                  v-else
                  :disabled="btnLoading"
                  maxlength="20"
                  show-word-limit
                  v-model="form.name"
                  placeholder="请输入商品名称"
                  @blur="inputBlurFun($event, 'name')"
                ></el-input>
              </div>
            </div>
            <div class="one_form_line">
              <div class="form_label">商品特点：</div>
              <div class="form_content">
                <el-input
                  :disabled="btnLoading"
                  maxlength="200"
                  :rows="4"
                  type="textarea"
                  v-model="form.point"
                  show-word-limit
                  resize="none"
                  placeholder="请输入商品特点"
                  @blur="inputBlurFun($event, 'point')"
                ></el-input>
              </div>
            </div>
            <div class="one_form_line">
              <div class="form_label">分镜数量：</div>
              <div class="form_content">
                <el-input-number
                  :disabled="btnLoading"
                  style="width: 100px"
                  class="good_num"
                  v-model="form.num"
                  :min="1"
                  :max="20"
                  :step="1"
                  :precision="0"
                  controls-position="right"
                ></el-input-number>
              </div>
            </div>
          </div>
        </div>
        <!-- 自由创建 -->
        <div class="type_box" v-if="type == 3">
          <el-input
            maxlength="20"
            :disabled="btnLoading"
            v-model="freeInputValue"
            show-word-limit
            placeholder="请输入剧本名称"
            @blur="inputBlurFun($event, 'freeInputValue')"
          ></el-input>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button :disabled="btnLoading" @click="closeDialog">取消</el-button>
          <el-button type="primary" :loading="btnLoading" @click="handleConfirm">确认</el-button>
        </span>
      </template>
    </el-dialog>
    <chooseGoodDOM v-if="chooseDialog.show" :chooseDialog="chooseDialog" @updateGood="updateGood" />
  </div>
</template>
<script setup>
import chooseGoodDOM from './choose_good_dialog.vue'
import { listIntelligent } from '@/api/sumvideo/intelligent_agent.js'
import {
  resolveHotVideoScript,
  resolveProductInfoScript,
  createCreativeScript
} from '@/api/sumvideo/script_creative.js'
import { throttle, isEmpty, isNotEmpty } from '@/utils/tools.js'

import { useRouter } from 'vue-router'
const router = useRouter()
const props = defineProps({
  createDialog: {
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
const show = toRef(props.createDialog, 'show')
const btnLoading = ref(false)
const hasGoods = ref(false)
const emits = defineEmits(['updateList'])
const message = inject('$message')

const type = ref(1) // 新建类型

const hotInputValue = ref('') // 爆款拆解的input值
const showHotErr = ref(false) // 是否显示爆款拆解失败的提示

onMounted(() => {
  /**
   * 设置商品是否可选
   */
  listIntelligent({}).then(res => {
    if (res.code === 0) {
      if (res.data['1'][0].workflowAbilities[1].documents['3'] !== undefined) {
        hasGoods.value = true
      }
    }
  })
})
// 根据产品创建 begin--
const form = ref({
  isGood: false, // 是否选取的商品
  name: '',
  point: '',
  num: 1
})
// 删除商品
const delGoodFun = throttle(() => {
  if (btnLoading.value) return
  form.value.isGood = false
  form.value.name = ''
}, 500)
// 添加商品
const chooseDialog = ref({
  show: false
})
const chooseFun = throttle(() => {
  chooseDialog.value = {
    show: true
  }
}, 500)
// 获取选中的商品信息
function updateGood(e) {
  if (isNotEmpty(e)) {
    form.value.isGood = true
    form.value.name = e.productName
    form.value.point = e.productFeat.slice(0, 200)
  }
}
// 根据产品创建 end--

const freeInputValue = ref('') // 自由创建的input值

function inputBlurFun(e, name) {
  const reg =
    // eslint-disable-next-line no-misleading-character-class
    /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi
  switch (name) {
    case 'freeInputValue':
      freeInputValue.value = e.target.value.replace(reg, '')
      break
    case 'name':
      form.value.name = e.target.value.replace(reg, '')
      break
    case 'point':
      form.value.point = e.target.value.replace(reg, '')
      break
    case 'hotInputValue':
      hotInputValue.value = e.target.value.replace(reg, '')
      break
  }
}
// 弹窗的确定事件
const handleConfirm = throttle(() => {
  showHotErr.value = false
  btnLoading.value = true
  // 爆款拆解 视频链接为空 提示先输入
  if (type.value === 1 && isEmpty(hotInputValue.value)) {
    message.warning('请输入视频链接地址')
    btnLoading.value = false
    return
  }

  // 根据产品创建
  if (type.value === 2) {
    if (isEmpty(form.value.name)) {
      message.warning('请输入商品名称')
      btnLoading.value = false
      return
    }
    // if (form.value.name && form.value.name.length > 20) {
    //   message.warning('商品名称不能超过20字')
    //   btnLoading.value = false
    //   return
    // }
    if (form.value.point && form.value.name.length > 200) {
      message.warning('商品特点不能超过200字')
      btnLoading.value = false
      return
    }
    if (isEmpty(form.value.num)) {
      message.warning('请输入分镜数量')
      btnLoading.value = false
      return
    }
  }

  // 自由创建 剧本名称为空 提示先输入
  if (type.value === 3 && isEmpty(freeInputValue.value)) {
    message.warning('请输入剧本名称')
    btnLoading.value = false
    return
  }
  if (type.value === 1) {
    resolveHotVideoScript({
      link: hotInputValue.value,
      isAsync: true
    })
      .then(res => {
        if (res.code === 0) {
          message.success('新建成功')

          btnLoading.value = false
          showHotErr.value = false
          emits('updateList')
          dialog.value.handleClose()
        } else {
          showHotErr.value = true
          btnLoading.value = false
        }
      })
      .catch(err => {
        console.error('resolveHotVideoScript', err)
        showHotErr.value = true
        btnLoading.value = false
      })
  } else if (type.value === 2) {
    resolveProductInfoScript({
      productName: form.value.name,
      productFeat: form.value.point,
      clipNum: form.value.num,
      type: !form.value.isGood ? 2 : 1,
      isAsync: true
    })
      .then(res => {
        if (res.code === 0) {
          message.success('新建成功')
          showHotErr.value = false
          btnLoading.value = false
          emits('updateList')
          dialog.value.handleClose()
        } else {
          btnLoading.value = false
        }
      })
      .catch(err => {
        console.error('resolveProductInfoScript', err)
        btnLoading.value = false
      })
  } else if (type.value === 3) {
    createCreativeScript({
      creativeName: freeInputValue.value
    })
      .then(res => {
        if (res.code === 0) {
          message.success('新建成功')

          showHotErr.value = false
          btnLoading.value = false
          emits('updateList')
          dialog.value.handleClose()
          if (type.value === 3) {
            router.push({
              path: '/sumwhy_video/creative_script/detail',
              query: {
                id: res.data
              }
            })
          }
        } else {
          btnLoading.value = false
        }
      })
      .catch(err => {
        console.error('createCreativeScript', err)
        btnLoading.value = false
      })
  }

  // 新建模板
  // const addEditingProject = new Promise(resolve => {
  //   setTimeout(() => {
  //     resolve({
  //       code: 0
  //     })
  //   }, 500)
  // })
  //
  // addEditingProject
  //   .then(res => {
  //     if (res.code === 0) {
  //       message.success('新建成功')
  //
  //       showHotErr.value = false
  //       emits('updateList')
  //       dialog.value.handleClose()
  //       btnLoading.value = false
  //       if (type.value === 3) {
  //         router.push({
  //           path: '/sumwhy_video/creative_script/detail',
  //           query: {
  //             id: 111
  //           }
  //         })
  //       }
  //     } else {
  //       if (type.value === 1) {
  //         showHotErr.value = true
  //       }
  //       btnLoading.value = false
  //     }
  //   })
  //   .catch(() => {
  //     showHotErr.value = true
  //     btnLoading.value = false
  //   })
  // router.push({
  //   path: '/sumwhy_video/creative_script/detail',
  //   query: {
  //     id: 111
  //   }
  // })
}, 700)
function closeDialog() {
  console.log(dialog.value)
  dialog.value.handleClose()
}
</script>
<style lang="scss" scoped>
.dialog_container {
  padding: 8px 16px;
}
.type_box {
  margin-top: 10px;
}
.type_err {
  margin-top: 8px;
  font-size: 12px;
  color: red;
}

.direct_box {
  .direct_top {
    margin-bottom: 16px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .el-button {
      margin-left: 12px;
    }
  }
  .direct_form {
    width: 100%;
    min-height: 200px;
    background: #f7f8fa;
    border-radius: 2px;
    padding: 16px 16px 16px 0;
    .one_form_line {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
      .form_label {
        text-align: right;
        width: 86px;
        font-size: 14px;
        color: #303133;
        line-height: 32px;
      }
      .form_content {
        width: calc(100% - 86px);
        .choose_good {
          width: 100%;
          padding-left: 4px;
          height: 32px;
          background: #ffffff;
          border-radius: 4px;
          border: 1px solid #dcdee0;
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          .good_name {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
            background: #f6f8fa;
            border-radius: 2px;
            padding: 2px 8px;
            .name_name {
              font-size: 12px;
              color: #606266;
              line-height: 20px;
              max-width: 220px;
              @include mult_line(1);
              margin-right: 4px;
            }
            .name_del {
              cursor: pointer;
            }
          }
        }
        .choose_good:hover {
          border-color: #c0c4cc;
        }
      }
    }
    .one_form_line + .one_form_line {
      margin-top: 16px;
    }
  }
}
:deep(.el-textarea__inner) {
  padding: 6px 12px;
}
:deep(.el-input__inner) {
  padding: 0 12px;
}
:deep(.el-input-number.is-controls-right .el-input__inner) {
  padding-left: 12px;
  padding-right: 38px;
}
</style>
