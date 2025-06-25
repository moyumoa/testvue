<template>
  <div class="retention_modal">
    <el-dialog ref="dialog" destroy-on-close v-model="show" width="802px">
      <template #title>
        <div class="head_box">
          <div class="head1">留资信息全局设置</div>
          <div class="head2">更改此处设置会影响线上全部商品设置</div>
        </div>
      </template>
      <!-- 内容 -->
      <div class="content" v-loading="initLoading">
        <el-button type="primary" :disabled="list.length > 4" @click="addText">添加文本</el-button>

        <div class="table_box">
          <div class="table_th">
            <div class="th1">排序</div>
            <div class="th2">类型</div>
            <div class="th3">标题</div>
            <div class="th4"></div>
          </div>
          <template v-if="list.length > 0">
            <draggable v-model="list" group="retention_good" item-key="id" animation="300">
              <template #item="{ element, index }">
                <div class="table_content">
                  <div class="th1 move_text">移动</div>
                  <div class="th2">
                    <el-checkbox
                      v-model="element.configShowConfig"
                      :label="element.configType"
                    ></el-checkbox>
                  </div>
                  <div class="th3">
                    <div v-if="!element.isEdit" class="text_edit">
                      {{ element.configTitle || '--' }}

                      <img
                        v-if="element.configType == '文本'"
                        @click="element.isEdit = true"
                        src="@/assets/images/content_center/edit.png"
                        alt=""
                      />
                    </div>
                    <div v-else>
                      <el-input
                        :maxlength="6"
                        v-model.trim="element.configTitle"
                        type="text"
                      ></el-input>
                    </div>
                  </div>
                  <div class="th4">
                    <div style="color: #364fcd">是否必填</div>
                    <el-switch style="margin: 0 28px 0 16px" v-model="element.configMustConfig" />
                    <el-link
                      type="danger"
                      @click="delItem(index)"
                      v-if="element.configType == '文本'"
                    >
                      删除
                    </el-link>
                  </div>
                </div>
              </template>
            </draggable>
          </template>
          <div v-else class="none_table">暂无数据</div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" :loading="loading" @click="handleConfirm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { getConfig, saveOrUpdateConfig } from '@/api/content_center/good_retention.js'
import draggable from 'vuedraggable'
defineComponent(draggable)
const props = defineProps({
  modal: {
    type: Object,
    default: () => {
      return {
        show: true
      }
    },
    required: true
  }
})
const dialog = ref(null) // ==$refs.dialog
const loading = ref(false) // 弹窗的Loading
const show = toRef(props.modal, 'show')
const message = inject('$message')
const list = ref([
  {
    configType: '地理位置',
    configTitle: '位置',
    configIsMust: 0,
    configIsShow: 0,
    configSort: 0,
    isEdit: false
  },
  {
    configType: '手机号',
    configTitle: '手机',
    configIsMust: 0,
    configIsShow: 0,
    configSort: 1,
    isEdit: false
  },
  {
    configType: '文本',
    configTitle: '标题',
    configIsMust: 0,
    configIsShow: 0,
    configSort: 2,
    isEdit: false
  }
])
list.value.forEach(x => {
  x.configShowConfig = x.configIsShow === 1
  x.configMustConfig = x.configIsMust === 1
})

const initLoading = ref(false)
init()
function init() {
  initLoading.value = true
  getConfig()
    .then(res => {
      if (res.code === 0 && res.data && res.data.length > 0) {
        const list1 = res.data || []
        list1.forEach(x => {
          x.isEdit = false
          x.configShowConfig = x.configIsShow === 1
          x.configMustConfig = x.configIsMust === 1
        })
        list.value = list1
      }

      initLoading.value = false
    })
    .catch(() => {
      initLoading.value = false
    })
}
// 删除
function delItem(index) {
  list.value.splice(index, 1)
}
// 添加文本
function addText() {
  list.value.push({
    configType: '文本',
    configTitle: '标题',
    configIsMust: 0,
    configIsShow: 0,
    configShowConfig: false,
    configMustConfig: false,
    configSort: list.value.length,
    isEdit: false
  })
}
// 关闭整个弹窗
function closeDialog() {
  dialog.value.handleClose()
}

const emits = defineEmits(['updateConfig'])
// 确定--弹窗
function handleConfirm() {
  loading.value = true
  let haveMust = false
  let haveChoose = false
  const textLen = []
  list.value.forEach(x => {
    if (x.configShowConfig) {
      haveChoose = true
    }
    if (x.configShowConfig && x.configMustConfig) {
      haveMust = true
    }
    if (x.configType === '文本' && x.configShowConfig) {
      textLen.push(x.configTitle)
    }
  })
  if (!haveChoose) {
    message({
      type: 'warning',
      message: '请设置留资信息'
    })
    loading.value = false
    return
  }
  if (!haveMust) {
    message({
      type: 'warning',
      message: '最少要有一个必填项'
    })
    loading.value = false
    return
  }
  const listSet = new Set(textLen)
  const newList = [...listSet]
  if (newList.length !== textLen.length) {
    message({
      type: 'warning',
      message: '标题不能重复哦'
    })
    loading.value = false
    return
  }

  console.log(newList)
  let brandInfo = localStorage.getItem('brandInfo')
  brandInfo = brandInfo ? JSON.parse(brandInfo) : {}
  const data = list.value.map((x, i) => {
    return {
      brandId: brandInfo.brandId || null,
      configIsMust: x.configMustConfig ? 1 : 0,
      configIsShow: x.configShowConfig ? 1 : 0,
      configSort: i,
      configTitle: x.configTitle,
      configType: x.configType,
      id: x.id || null
    }
  })
  console.log(data)
  saveOrUpdateConfig(data)
    .then(res => {
      if (res.code === 0) {
        message({
          type: 'success',
          message: '设置成功'
        })

        emits('updateConfig')
        dialog.value.handleClose()
      }
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
:deep(.el-dialog__header) {
  padding: 18px 24px 10px 24px;
}
:deep(.el-dialog__body) {
  padding: 20px 24px;
}
.head_box {
  width: 100%;
  .head1 {
    font-size: 18px;
    font-weight: 400;
    color: #303133;
    line-height: 25px;
    letter-spacing: 1px;
  }
  .head2 {
    margin-top: 8px;
    font-size: 14px;
    font-weight: 400;
    color: #909399;
    line-height: 20px;
  }
}
.content {
  .table_box {
    margin-top: 20px;
    .th1 {
      width: 100px;
      padding-left: 20px;
    }
    .th2,
    .th3 {
      padding-left: 20px;
      width: 180px;
    }
    .th4 {
      padding-left: 20px;
    }
    .table_th {
      width: 100%;
      height: 58px;
      background: #f6f7f8;
      font-size: 14px;
      font-weight: 600;
      color: #333333;
      line-height: 20px;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
    }
    .table_content {
      width: 100%;
      height: 58px;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      .move_text {
        font-size: 14px;
        font-weight: 400;
        color: #364fcd;
        line-height: 20px;
        cursor: pointer;
      }
      .th4 {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
      }
      .text_edit {
        img {
          width: 16px;
          height: 16px;
          cursor: pointer;
        }
      }
    }
  }
}
.none_table {
  color: #909399;
  width: 100%;
  height: 174px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
</style>
