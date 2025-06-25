<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    title="保存二维码"
    width="560px"
    custom-class="rule_setting_dialog"
    :before-close="handleClose"
  >
    <template #title>
      <div class="title_box">
        <div>保存二维码</div>
        <div class="title_tip" v-if="props.origin && props.origin === 'finishProduct'">
          （二维码发布记录及数据请前往【内容分发】-【二维码发布记录】查看）
        </div>
      </div>
    </template>
    <div class="dialog_content" v-loading="loading">
      <div class="content_code">
        <img v-if="form.url" :src="form.url" alt="" />
      </div>
      <div class="content_name">
        <div>名称：</div>
        <!-- 输入框 -->
        <div class="name_input" v-if="isEdit">
          <el-input
            ref="nameRef"
            style="width: 80%; min-width: 230px"
            maxlength="20"
            v-model.trim="editInput"
            placeholder="请输入名称"
            @blur="retEmit($event)"
            @keyup.enter="inputEnterFun"
          ></el-input>
        </div>
        <div class="name_over" v-else>
          <div class="name_name line-hidden1">
            {{ form.name || '--' }}
          </div>
          <i class="icon iconfont icon-edit" @click="editFun"></i>
        </div>
      </div>
      <div class="content_time">
        <div>有效期：</div>
        <div class="time_radio">
          <el-radio-group
            v-model="form.timeType"
            @change="timeTypeChange"
            style="margin-bottom: 11px"
          >
            <el-radio :label="1">长期有效</el-radio>
            <el-radio :label="2">固定时间</el-radio>
          </el-radio-group>
          <el-date-picker
            style="margin-bottom: 20px"
            v-if="form.timeType == 2"
            v-model="form.time"
            type="datetimerange"
            range-separator="至"
            unlink-panels
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            :editable="false"
            :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59)]"
            :disabled-date="time => time.getTime() < Date.now() - 24 * 60 * 60 * 1000"
            @change="onChangeDate"
          ></el-date-picker>
        </div>
      </div>
      <div class="content_tip">注：二维码到期后扫码会显示该二维码已到期，内容无法查看</div>
      <div class="content_btn">
        <el-button type="primary" @click="downLoadImg">下载</el-button>
      </div>
    </div>
  </el-dialog>
</template>
<script setup>
import { downLoadFile } from '@/utils/exportFile.js'
import { throttle, isNotEmpty, dateFormat } from '@/utils/tools'
import { createOrUpdateQrCode } from '@/api/content_center/content_repository'
const props = defineProps({
  origin: String, // finishProduct 代表是素材库过来的
  generateDialog: {
    type: Object,
    default: () => {
      return {
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})

const { show } = toRefs(props.generateDialog)

const emits = defineEmits(['close'])
const loading = ref(true)
const form = ref({
  name: '',
  timeType: 1,
  time: undefined,
  startTime: null,
  endTime: null,
  url: ''
})
const isEdit = ref(false) // 是否编辑名称
const editInput = ref() // 编辑的输入框内容
const nameRef = ref()
const editFun = throttle(() => {
  editInput.value = form.value.name
  isEdit.value = true
  nextTick(() => {
    nameRef.value?.focus()
  })
})
function inputEnterFun() {
  console.log('回车')
  nameRef.value?.blur()
}
function retEmit(e) {
  editInput.value = e.target.value.replace(
    // eslint-disable-next-line no-misleading-character-class
    /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi,
    ''
  )
  /* eslint-disable */
  const regex = /[\/\\:*?"<>|.]/g
  // const reg = /[^\u4e00-\u9fa5a-zA-Z0-9]/g
  editInput.value = editInput.value.replace(regex, '')
  if (isNotEmpty(editInput.value.trim())) {
    saveFun('name').then(() => {
      isEdit.value = false
      form.value.name = editInput.value.trim()
    })
  } else {
    isEdit.value = false
  }
}
// 有效期单选项修改
function timeTypeChange(e) {
  if (e === 1) {
    saveFun('time1')
  }
  console.log('e', e)
}
// 固定日期修改
function onChangeDate(e) {
  console.log('日期修改')
  if (e) {
    form.value.startTime = dateFormat(e[0], 'YYYY-MM-DD hh:mm:ss')
    form.value.endTime = dateFormat(e[1], 'YYYY-MM-DD hh:mm:ss')
  } else {
    form.value.startTime = null
    form.value.endTime = null
  }
  saveFun('time2')
}
function saveFun(type) {
  return new Promise((resolve, reject) => {
    const params = {
      qrId: form.value.qrId,
      name: form.value.name,
      startTime: form.value.startTime,
      endTime: form.value.endTime
    }
    if (type === 'name') {
      params.name = editInput.value.trim()
    } else if (type === 'time1') {
      params.startTime = null
      params.endTime = null
    } else if (type === 'time2') {
      params.startTime = form.value.startTime || null
      params.endTime = form.value.endTime || null
    }
    createOrUpdateQrCode(params)
      .then(res => {
        if (res.code === 0) {
          console.log('修改成')

          resolve()
        } else {
          reject(res)
        }
      })
      .catch(err => {
        reject(err)
      })
  })
}
// 下载二维码
const downLoadImg = throttle(() => {
  downLoadFile(form.value.url, `${form.value.name || '二维码'}.jpg`)
}, 700)

function handleClose(done) {
  emits('close')
  done()
}

onMounted(() => {
  loading.value = true
  console.log('onmounted')
  if (isNotEmpty(props.generateDialog.info)) {
    const info = JSON.parse(JSON.stringify(props.generateDialog.info))
    form.value = {
      qrId: info.qrId,
      name: info.name,
      timeType: info.startTime || info.endTime ? 2 : 1,
      time: info.startTime || info.endTime ? [info.startTime, info.endTime] : undefined,
      startTime: info.startTime || null,
      endTime: info.endTime || null,
      url: info.url || ''
    }
  }
  nextTick(() => {
    loading.value = false
  })
})
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.dialog_content {
  padding: 16px;
  .content_code {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 180px;
    margin-bottom: 12px;
    img {
      width: 180px;
      height: 180px;
      object-fit: contain;
      display: flex;
    }
  }
  .content_name {
    margin-bottom: 2px;
    font-weight: 400;
    font-size: 14px;
    color: #303133;
    line-height: 32px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .name_input {
      margin-left: 8px;
    }
    .name_over {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      .name_name {
        max-width: 320px;
      }
      .icon {
        cursor: pointer;
        color: rgba(48, 49, 51, 1);
        font-size: 14px;
        margin-left: 8px;
      }
    }
  }
  .content_time {
    font-weight: 400;
    font-size: 14px;
    color: #303133;
    line-height: 32px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    .time_radio {
      margin-left: 8px;
      max-width: calc(100% - 64px);
    }
  }
  .content_tip {
    font-weight: 400;
    font-size: 12px;
    color: #909399;
    line-height: 17px;
  }
  .content_btn {
    margin-top: 20px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
  }
}
.title_box {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  .title_tip {
    font-size: 12px;
    color: #909399;
    font-weight: 400;
    margin-left: 4px;
    line-height: 1;
  }
}
</style>
