<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="info.show"
    :title="info.title"
    width="560px"
    custom-class="info_dialog"
  >
    <div class="content">
      <div class="add_plat">
        <div class="label">适用平台：</div>
        <el-radio-group @change="platSelectChange" v-model="platSelect">
          <el-radio v-for="(item, index) in platArr" :key="index" :label="item.id">
            {{ item.label }}
          </el-radio>
        </el-radio-group>
      </div>
      <div class="add_title" :class="{ add_title_xhs: platSelect === 1 }">
        <div class="label">标题：</div>
        <div class="title_input_warp">
          <el-input
            v-model="titleInput"
            :type="platSelect === 1 ? 'input' : 'textarea'"
            placeholder="请输入标题内容"
            :maxlength="platSelect === 1 ? 20 : 500"
            :rows="platSelect === 1 ? 1 : 6"
          />
          <div class="num">{{ titleInput.length || 0 }}/{{ platSelect === 1 ? 20 : 500 }}</div>
        </div>
      </div>
      <div class="add_decs" v-if="platSelect === 1">
        <div class="label">描述：</div>
        <div class="title_input_warp">
          <el-input
            v-model="decsInput"
            type="textarea"
            placeholder="请输入描述内容"
            :maxlength="500"
            :rows="6"
          />
          <div class="num">{{ decsInput.length || 0 }}/ 500</div>
        </div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeFun">取消</el-button>
        <el-button type="primary" :loading="loading" @click="saveFun">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { throttle } from '@/utils/tools.js'
import { saveOrUpdateTitleAndDesc } from '@/api/sumvideo/creative_ai_title.js'
const props = defineProps({
  info: {
    type: Object,
    default: () => {
      return {
        show: true, // 是否显示弹窗
        title: '添加标题', // 弹窗的标题
        editItem: null // 编辑时item
      }
    },
    required: true
  },
  creativeId: {
    type: String || Number,
    default: null
  }
})
const dialog = ref()
const { info, creativeId } = toRefs(props)
const emits = defineEmits(['updateList'])
const message = inject('$message')

const loading = ref(false)

const platArr = [
  {
    id: 0,
    label: '通用'
  },
  {
    id: 1,
    label: '小红书'
  },
  {
    id: 2,
    label: '抖音'
  },
  {
    id: 3,
    label: '快手'
  },
  {
    id: 4,
    label: '视频号'
  }
]
const platSelect = ref(0) // 选中的适用平台
const titleInput = ref('') // 输入的标题内容
const decsInput = ref('') // 输入的描述内容
const lastTitle = ref('') // 小红书tab切走前的title
const lastPlatSelect = ref(0)

// 适应平台变化
function platSelectChange(e) {
  if (e === 1) {
    // 切换到小红书
    const copyTitle = JSON.parse(JSON.stringify(titleInput.value))
    const regex = new RegExp(lastTitle.value)
    const match = copyTitle.match(regex)
    // 匹配一下，如果没有修改就用原来的
    if (match && lastTitle.value) {
      titleInput.value = match[0]
      decsInput.value = copyTitle.substring(match.index + titleInput.value.length)
    } else {
      titleInput.value = copyTitle.substring(0, 20)
      decsInput.value = copyTitle.substring(20)
    }
  } else {
    if (lastPlatSelect.value === 1) {
      lastTitle.value = JSON.parse(JSON.stringify(titleInput.value))
      let finTitle = titleInput.value + decsInput.value || ''
      if (finTitle.length > 500) {
        finTitle = finTitle.substring(0, 500)
      }
      titleInput.value = finTitle
    } else {
      if (!lastTitle.value) {
        console.log('初始化选中小红书并且首次从小红书切换到其他平台')
        let finTitle = titleInput.value + decsInput.value || ''
        if (finTitle.length > 500) {
          finTitle = finTitle.substring(0, 500)
        }
        titleInput.value = finTitle
      }
    }
  }
  lastPlatSelect.value = JSON.parse(JSON.stringify(e))
}

function closeFun() {
  dialog.value.handleClose()
  loading.value = false
}
const saveFun = throttle(() => {
  if (
    (platSelect.value !== 1 && !titleInput.value) ||
    (platSelect.value === 1 && (!titleInput.value || !decsInput.value))
  ) {
    message.warning('文案不能为空！')
    return
  }
  loading.value = true
  saveOrUpdateTitleAndDescFn()
}, 500)

function saveOrUpdateTitleAndDescFn() {
  const params = {
    creativeId: creativeId.value, // 	创意id
    creationType: platSelect.value, // 0通用 1小红书文案 2抖音标题 3快手标题 4视频号标题
    title: titleInput.value //	标题
  }
  if (params.creationType === 1) {
    params.desc = decsInput.value // 	描述
  }
  // 编辑
  if (info.value?.editItem?.id) {
    params.id = info.value.editItem.id
  }
  saveOrUpdateTitleAndDesc(params)
    .then(res => {
      if (res.code === 0 && res.msg === '成功') {
        if (info.value?.editItem?.id) {
          emits('updateList', 'success', '操作成功！')
        } else {
          emits('updateList', 'success', '添加成功！')
        }
      }
    })
    .catch(() => {
      loading.value = false
    })
}

onMounted(() => {
  if (info.value.editItem) {
    platSelect.value = info.value.editItem.creationType
    titleInput.value = info.value.editItem.title

    if (info.value.editItem.description) {
      decsInput.value = info.value.editItem.description
    }
  }
})
</script>
<style lang="scss" scoped>
.content {
  padding: 16px;
  .label {
    white-space: nowrap;
  }
  .add_plat {
    display: flex;
    align-items: center;
  }
  .add_title {
    display: flex;
    margin-top: 20px;
    .label {
      margin-top: 6px;
    }
  }
  .add_title_xhs {
    align-items: center;
    .label {
      margin-top: 0;
    }
  }
  .add_decs {
    display: flex;
    margin-top: 20px;
    :deep(.el-textarea__inner) {
      padding: 5px 11px;
    }
    .label {
      margin-top: 6px;
    }
  }
  .title_input_warp {
    width: 100%;
    margin-left: 8px;
    height: max-content;
    position: relative;
    .num {
      color: #909399;
      background: #fff;
      position: absolute;
      font-size: 12px;
      line-height: 14px;
      bottom: 5px;
      right: 10px;
      padding: 1px 2px;
    }
  }
}
</style>
