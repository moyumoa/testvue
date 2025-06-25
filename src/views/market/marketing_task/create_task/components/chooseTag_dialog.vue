<template>
  <el-dialog
    custom-class="task_init_dialog"
    ref="dialog"
    destroy-on-close
    v-model="show"
    title="选择标签"
    width="420px"
  >
    <div class="content_box" v-loading="$data.loading">
      <template v-if="$data.tagList && $data.tagList.length > 0">
        <el-radio-group v-model="$data.tagId">
          <el-radio :label="item.id" v-for="(item, index) in $data.tagList" :key="index">
            <div
              class="one_color"
              :style="{
                background: `rgba(${(item.tagColor, 0.1)})`,
                borderColor: `rgb(${item.tagColor})`,
                color: `rgb(${item.tagColor})`
              }"
            >
              {{ item.tagName }}
            </div>
          </el-radio>
        </el-radio-group>
      </template>
      <div v-else class="none_box">
        暂无标签，
        <el-link type="primary" @click="toAdd">快去添加吧！</el-link>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" :loading="$data.btnLoading" @click="handleConfirm">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { useRouter } from 'vue-router'
import { tagList } from '@/api/market/task_tag.js'
import { throttle } from '@/utils/tools.js'
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

const $data = reactive({
  tagList: [],
  tagId: null,
  btnLoading: false,
  loading: false
})

function getTaskTagList() {
  tagList({})
    .then(res => {
      if (res.code === 0) {
        $data.tagList = res.data || []
      }
      nextTick(() => {
        $data.loading = false
      })
    })
    .catch(() => {
      $data.loading = false
    })
}
function init() {
  $data.loading = true
  console.log('id', props.chooseDialog.id)
  if (props.chooseDialog.id) {
    $data.tagId = JSON.parse(JSON.stringify(props.chooseDialog.id))
  }
  getTaskTagList()
}
init()

const message = inject('$message')
const emits = defineEmits(['updateTag'])

const handleConfirm = throttle(() => {
  $data.btnLoading = true
  console.log($data.tagId)
  if ($data.tagId) {
    const chooseTagInfo = $data.tagList.filter(x => x.id === $data.tagId)
    emits('updateTag', chooseTagInfo && chooseTagInfo[0])

    dialog.value.handleClose()
  } else {
    $data.btnLoading = false
    message.warning('请先选择标签')
  }
}, 700)
function closeDialog() {
  dialog.value.handleClose()
}
const router = useRouter()
const toAdd = throttle(() => {
  router.push({
    path: '/content_market/task_tag',
    query: {
      type: 'tag'
    }
  })
}, 500)
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.one_color {
  padding: 2px 4px;
  border-radius: 2px;
  border: 1px solid #fff;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  cursor: pointer;
}
.content_box {
  min-height: 80px;
  padding: 0px 0 0px 16px;
  :deep(.el-radio-group) {
    height: max-content !important;
    max-height: 60vh !important;
    overflow-y: auto;
    .el-radio--default {
      margin-right: 24px;
      margin-top: 20px;
    }
  }
  .none_box {
    padding-top: 16px;
    padding-right: 16px;
    height: 80px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
}
</style>
