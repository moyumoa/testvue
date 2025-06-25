<template>
  <div class="storyboard_list" :class="{ storyboard_list_first: index == 0 }">
    <div class="s_top">
      <span class="name">{{ `分镜${index + 1}` }}</span>
      <div class="edit_warp">
        场景描述：
        <span class="desc_warp" @click="showPartDesc(false)" v-if="isShowPartDesc">
          {{ info.clipDesc ? info.clipDesc : '请在此输入' }}
          <img
            src="https://tagvv-1256030678.file.myqcloud.com/202403285nqr0.png"
            alt=""
            class="input_icon"
          />
        </span>
        <el-input
          v-else
          ref="inputRef"
          :maxlength="50"
          style="width: 360px; height: 24px; min-height: 24px"
          v-model.trim="info.clipDesc"
          show-word-limit
          placeholder="请输入场景描述"
          @blur="partDescChange"
        />
      </div>
    </div>
    <div class="textarea_warp">
      <el-form-item
        :prop="'list.' + index + '.clipAside'"
        :rules="rules.clipAside"
        style="width: 100%"
      >
        <el-input
          type="textarea"
          resize="none"
          :autosize="false"
          :maxlength="500"
          style="width: 100%; height: 112px"
          v-model.trim="info.clipAside"
          show-word-limit
          placeholder="请在此输入旁白"
          @blur="clipAsideChange($event, info)"
        />
      </el-form-item>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  info: {
    type: Object,
    default: () => {
      return {}
    }
  },
  index: {
    type: Number,
    default: 0
  }
})
const emits = defineEmits(['updateDesc', 'updateCipAside'])

const rules = reactive({
  clipAside: [{ required: true, message: ' ', trigger: 'blur' }]
})
const { index, info } = toRefs(props)
const inputRef = ref(null)
const isShowPartDesc = ref(true) // 是否显示分镜场景描述输入提示
function showPartDesc(val) {
  isShowPartDesc.value = val
  if (!val) {
    nextTick(() => {
      inputRef.value.focus()
    })
  }
}
// function removeEmoji(str) {
//   return str.replace(/[\u231A-\uDFFF\u2190-\u21FF]/gu, '')
// }

// 输入场景描述
function partDescChange() {
  showPartDesc(true)
  if (info.value.clipDesc) emits('updateDesc', info.value)
}
// 文本内容校验
function retEmit(e) {
  const reg =
    /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
  return e.trim().replace(reg, '')
}
// 输入旁白
function clipAsideChange(e, item) {
  item.clipAside = retEmit(item.clipAside)
  if (info.value.clipAside) emits('updateCipAside', info.value)
}
</script>

<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
:deep(.el-input__inner) {
  height: 24px;
  line-height: 24px;
}
:deep(.el-textarea__inner) {
  height: 112px;
}
.storyboard_list {
  border: 1px solid #000;
  padding: 12px;
  background: #f2f3f5;
  border-radius: 2px;
  border: 1px solid #eaedf0;
  margin-top: 12px;
  .s_top {
    display: flex;
    align-items: center;
    .name {
      font-family: PingFangSC, PingFang SC;
      font-weight: 600;
      font-size: 16px;
      color: #323233;
      line-height: 22px;
    }
    .edit_warp {
      margin-left: 20px;
      display: flex;
      align-items: center;
      font-family: PingFangSC, PingFang SC;
      font-weight: 400;
      font-size: 12px;
      color: #606266;
      line-height: 18px;
      white-space: nowrap;
      height: 24px;
      :deep(.el-input__count-inner) {
        padding: 0;
      }
      :deep(.el-input__inner) {
        padding-right: 56px;
      }
      .desc_warp {
        font-family: PingFangSC, PingFang SC;
        font-weight: 400;
        font-size: 12px;
        color: #909399;
        line-height: 18px;
        display: flex;
        align-items: center;
        cursor: pointer;
        .input_icon {
          width: 16px;
          height: 16px;
          margin-left: 4px;
          min-width: 16px;
        }
      }
    }
  }
  .textarea_warp {
    height: 112px;
    margin-top: 12px;
  }
}
.storyboard_list_first {
  margin-top: 20px;
}
</style>
