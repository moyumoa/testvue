<template>
  <div>
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      title="原料操作"
      width="560px"
      custom-class="rule_setting_dialog hide_footer_line"
      :before-close="handleClose"
    >
      <div class="dialog_content">
        <div class="content1">
          将选中的{{
            chooseMaterialList && chooseMaterialList.length > 0 ? chooseMaterialList.length : 0
          }}个原料存入原料库
        </div>
        <div class="content1">
          原料命名规则：
          <el-input
            style="width: 310px; margin: 0 4px 0 8px"
            placeholder="请输入命名规则"
            type="text"
            v-model.trim="namePrefix"
            @blur="retEmit($event)"
            maxlength="20"
          />
          <!-- <div class="back_title">{{ videoTitle || '--' }}</div> -->
          +x
        </div>
        <div class="content1">
          <span>若需存入文件夹，请选择</span>
          <searchFileDOM
            failType="listTagFolder"
            @select="changeFileFun"
            style="width: 230px; margin-left: 8px"
          />
        </div>
        <div class="content1">
          <span>若需自动打上标签，请在此处设置</span>
          <div class="content_btn" @click="openChoseLabel">
            <img src="https://tagvv-1256030678.file.myqcloud.com/20240328bjpfu.png" alt="" />
            原料标签
          </div>
          <div class="tag_mark">
            已选
            <span>{{ tags.length }}</span>
            个标签
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button :disabled="saveLoading" @click="closeDialog">取消</el-button>
          <el-button
            type="primary"
            :disabled="saveLoading"
            :saveLoading="saveLoading"
            @click="handleConfirm"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 编辑标签的弹窗 -->
    <addTagDOM v-if="addTagDialog.show" :addDialog="addTagDialog" @updateTag="updateTag" />
  </div>
</template>
<script setup>
import { saveToMaterial } from '@/api/sumvideo/intelligent_material.js'
import addTagDOM from '@/views/content_center/content_repository/components/addTag_dialog.vue'

import searchFileDOM from '@/views/sumvideo/components/files/search_file.vue'
import { throttle, isEmpty } from '@/utils/tools.js'
const props = defineProps({
  operationDialog: {
    type: Object,
    default: () => {
      return {
        show: true, // 是否显示弹窗
        videoId: null, // 原视频ID
        videoTitle: '', // 原视频标题
        recordId: null, // 拆解记录ID
        chooseMaterialList: [] // 选中的原料列表
      }
    },
    required: true
  }
})
const dialog = ref()
const show = toRef(props.operationDialog, 'show')
const chooseMaterialList = toRef(props.operationDialog, 'chooseMaterialList')
const saveLoading = ref(false) // 按钮的确定Loading
const fileInfo = ref() // 要存入的文件夹信息
// 获取到的文件夹信息
function changeFileFun(e) {
  fileInfo.value = e
}
const addTagDialog = reactive({
  show: false,
  id: null,
  hideTitleSpan: false,
  type: null,
  chooseTagList: [],
  index: [],
  source: null
})
const tags = ref([])
// 打开选择标签弹窗
function openChoseLabel() {
  addTagDialog.type = 15
  addTagDialog.hideTitleSpan = true
  addTagDialog.id = null
  addTagDialog.index = []
  addTagDialog.source = 0
  addTagDialog.chooseTagList = tags.value || []
  addTagDialog.show = true
}
// 要打上的标签
function updateTag(e) {
  console.log('获取到的标签', e)
  tags.value = e
}

const namePrefix = ref('') // 命名前缀
onMounted(() => {
  namePrefix.value = props.operationDialog.videoTitle
})
// 文本内容校验
function retEmit(e) {
  const reg =
    /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
  namePrefix.value = e.target.value.trim().replace(reg, '')
}
const $message = inject('$message')
const emits = defineEmits(['successFun', 'closeDialog'])
// 弹窗的确定事件
const handleConfirm = throttle(() => {
  console.log('handleConfirm')
  if (isEmpty(namePrefix.value)) {
    $message.warning('原料命名规则不能为空！')
    return
  }
  saveLoading.value = true
  const tagIds = []
  tags.value.forEach(x => {
    tagIds.push(x.id)
  })
  saveToMaterial({
    folderIds: fileInfo.value?.id ? [fileInfo.value.id] : [],
    namePrefix: namePrefix.value || '',
    splitResultIds: chooseMaterialList.value || [],
    tags: tagIds || []
  })
    .then(res => {
      if (res.code === 0) {
        $message.success('操作成功')
        emits('successFun')
        dialog.value.handleClose()
      }
      saveLoading.value = false
    })
    .catch(() => {
      saveLoading.value = false
    })
}, 700)
function closeDialog() {
  dialog.value.handleClose()
}
function handleClose(done) {
  console.log('handleClose')
  emits('closeDialog')
  done()
}
</script>
<style lang="scss" scoped>
.dialog_content {
  padding: 16px 16px 20px 16px;
  width: 100%;
  .content1 + .content1 {
    margin-top: 18px;
  }
  .content1:last-child {
    margin-top: 20px;
  }
  .content1 {
    font-weight: 400;
    font-size: 14px;
    color: #303133;
    line-height: 20px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
  .back_title {
    margin: 0 4px 0 8px;
    font-weight: 400;
    font-size: 14px;
    color: #303133;
    line-height: 20px;
    padding: 2px 8px;
    background: #f2f3f5;
    border-radius: 4px;
  }
  .content_btn {
    cursor: pointer;
    margin-left: 8px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    font-weight: 400;
    font-size: 12px;
    color: #364fcd;
    line-height: 18px;
    padding: 3px 8px;
    border: 1px solid #364fcd;
    border-radius: 4px;
    img {
      width: 12px;
      height: 12px;
      object-fit: contain;
      display: flex;
      margin-right: 3px;
    }
    &:hover {
      background: rgba(54, 79, 205, 0.1);
    }
  }
}
.tag_mark {
  color: #909399;
  margin-left: 12px;
  span {
    color: #364fcd;
  }
}
</style>
