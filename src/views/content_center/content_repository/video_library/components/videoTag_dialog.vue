<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    title="设置标签"
    width="467px"
    custom-class="rule_setting_dialog rule_setting_form_dialog hide_footer_line hide_header_line"
  >
    <div class="content_box">
      <div class="content_top">
        <div class="title">新建标签</div>
        <div class="top_box">
          <el-input
            maxlength="4"
            v-model.trim="addTagText"
            placeholder="请输入新建标签名称"
            clearable
            class="top_input"
          ></el-input>
          <el-button :loading="addTagLoading" type="primary" @click="addTagFun">添加</el-button>
        </div>
      </div>
      <div class="content_bottom" v-loading="loading">
        <div class="has_box" v-if="tagList && tagList.length > 0">
          <el-checkbox-group @change="tagChange" v-model="chooseTag" class="group_box">
            <div class="one_tag" v-for="(item, index) in tagList" :key="index">
              <el-checkbox :label="item.id">
                {{ item.name }}
              </el-checkbox>
            </div>
          </el-checkbox-group>
        </div>
        <div class="none_box" v-else>暂无标签，请先添加</div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="saveDialog">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { findChildrenByKey, saveDict } from '@/api/content_center/video_library.js'
import { throttle } from '@/utils/tools.js'
const props = defineProps({
  tagDialog: {
    type: Object,
    default: () => {
      return {
        show: false, // 是否显示弹窗
        chooseList: [] // 已经选择的弹窗
      }
    },
    required: true
  }
})

const dialog = ref()
const show = toRef(props.tagDialog, 'show')
const addTagText = ref('')
const tagList = ref([]) // 所有列表
const chooseTag = ref([]) // 选中的列表
const loading = ref(true)
// 获取所有标签
function getALLTag() {
  loading.value = true
  findChildrenByKey({
    brandId: localStorage.getItem('brandInfo')
      ? JSON.parse(localStorage.getItem('brandInfo')).brandId
      : 0,
    key: 'video_label'
  })
    .then(res => {
      if (res.code === 0) {
        tagList.value = res.data || []
      }
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}
function init() {
  addTagText.value = ''
  if (props.tagDialog.chooseList && props.tagDialog.chooseList.length > 0) {
    const list = JSON.parse(JSON.stringify(props.tagDialog.chooseList))
    chooseTag.value = list.map(x => x.id)
  } else {
    chooseTag.value = []
  }
  getALLTag()
}
init()
const message = inject('$message')

// 生成GUID 唯一值
function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    .replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
    .replace(/-/g, '')
}
// 添加标签
const addTagLoading = ref(false)
const addTagFun = throttle(function () {
  addTagLoading.value = true
  if (addTagText.value) {
    let has = false
    tagList.value.forEach(x => {
      if (x.name === addTagText.value) {
        has = true
      }
    })
    if (has) {
      addTagLoading.value = false
      message.warning('标签已存在')
      return
    }
    saveDict({
      brandId: localStorage.getItem('brandInfo')
        ? JSON.parse(localStorage.getItem('brandInfo')).brandId
        : 0,
      parentKey: 'video_label',
      key: guid(),
      name: addTagText.value,
      value: addTagText.value
    })
      .then(res => {
        if (res.code === 0) {
          addTagText.value = ''
          message.success('添加成功')
          getALLTag()
        }
      })
      .finally(() => {
        addTagLoading.value = false
      })
  } else {
    addTagLoading.value = false
    message.warning('请先输入标签名称')
  }
}, 500)
function closeDialog() {
  dialog.value.handleClose()
}
const emits = defineEmits(['changeChooseTag'])
const saveDialog = throttle(function () {
  const chooseInfo = []
  tagList.value.forEach(x => {
    chooseTag.value.forEach(y => {
      if (x.id === y) {
        chooseInfo.push(x)
      }
    })
  })
  emits('changeChooseTag', chooseInfo)
  closeDialog()
}, 500)
function tagChange(val) {
  if (val && val.length > 5) {
    message.warning('最多只能选择5个标签')
    chooseTag.value.pop()
  }
}
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.content_box {
  padding: 0 0px 16px;
  .content_top {
    padding: 0 24px 5px;
    .title {
      font-size: 14px;
      font-weight: 400;
      color: #303133;
      line-height: 20px;
      margin-bottom: 6px;
    }
    .top_box {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      .top_input {
        width: 337px;
        height: 32px;
        border-radius: 4px;
        margin-right: 14px;
      }
    }
  }
  .content_bottom {
    // padding-top: 5px;
    max-height: 50vh;
    overflow-y: auto;
    padding: 0 24px;
    .none_box {
      width: 100%;
      height: 80px;
      text-align: center;
      line-height: 80px;
    }
    .has_box {
      width: 100%;
      height: 100%;
    }
    .one_tag {
      width: 25%;
      margin: 12px 0 0 0;
    }
    .group_box {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
      flex-wrap: wrap;
    }
  }
}
</style>
