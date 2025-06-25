<template>
  <div>
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      title="查看图片风险"
      width="820px"
      custom-class="rule_setting_dialog hide_footer_line"
    >
      <div class="dialog_container">
        <div class="container_left">
          <div class="img_dom">
            <el-image
              class="one_img"
              :src="imgUrlList[imgIndex]"
              fit="cover"
              :preview-src-list="imgUrlList"
              :initial-index="imgIndex"
            >
              <template #placeholder>
                <div class="image_placeholder_loading">
                  <div class="image_placeholder_icon"></div>
                </div>
              </template>
            </el-image>
          </div>
          <div class="img_nums">
            <!-- 上一张 -->
            <div
              :class="{ pre_img: true, active_img: imgIndex > 0, dis_img: imgIndex == 0 }"
              @click="changeImg(2)"
            >
              <img src="https://tagvv-1256030678.file.myqcloud.com/20250513a3tjo.png" />
            </div>
            <!-- 总数 -->
            <div class="img_num">{{ imgIndex + 1 }}/{{ imgUrlList.length }}</div>
            <!-- 下一张 -->
            <div
              :class="{
                next_img: true,
                active_img: imgIndex < imgUrlList.length - 1,
                dis_img: imgIndex == imgUrlList.length - 1
              }"
              @click="changeImg(1)"
            >
              <img src="https://tagvv-1256030678.file.myqcloud.com/20250513zdu8v.png" />
            </div>
          </div>
        </div>
        <div class="container_right" v-if="isNotEmpty(chooseInfo)">
          <div class="one_right">
            <div class="right_label">风险分析</div>
            <div :class="[`${riskLevelMap[chooseInfo.score].color}_back_color`]">
              {{ riskLevelMap[chooseInfo.score].label || '' }}
            </div>
          </div>
          <div class="one_right">
            <div class="right_label">画面定位</div>
            <div class="rigth_time">
              <!-- 视频就显示具体的时间 图片显示第*张  -->
              {{
                isVideo
                  ? secondToDate(chooseInfo.frame / 1000, 's', false, false)
                  : `第${chooseInfo.frame}张`
              }}
            </div>
          </div>
          <div class="one_right one_right2">
            <div class="right_label">问题说明</div>
            <div class="rigth_content">
              <el-input
                :disabled="chooseInfo.isMark || status != 1"
                :rows="4"
                type="textarea"
                maxlength="90"
                v-model="remark"
                show-word-limit
                resize="none"
                placeholder=""
                @blur="retEmitEmj($event)"
              ></el-input>
            </div>
          </div>
          <!-- 待审核下才显示 -->
          <div class="right_btn" v-if="status == 1">
            <el-button @click="closeDialog">取消</el-button>
            <el-button
              :disabled="chooseInfo.isMark"
              type="primary"
              style="padding: 6px 12px"
              @click="handleConfirm"
            >
              {{ chooseInfo.isMark ? '已' : '' }}标记为修改意见
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script setup>
import { throttle, isEmpty, isNotEmpty, secondToDate } from '@/utils/tools'
import { riskLevelMap } from '../model/tool'

const props = defineProps({
  status: Number,
  riskDetectionResultList: Array,
  reasonList: Array,
  info: Object,
  isVideo: Boolean,
  checkDialog: {
    type: Object,
    default: () => {
      return {
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const message = inject('$message')
const emits = defineEmits(['markFun'])
const dialog = ref()
const show = toRef(props.checkDialog, 'show')
const { info, riskDetectionResultList, isVideo, status } = toRefs(props)

const chooseInfo = ref({}) // 目前点击的图片信息
const remark = ref('') // 问题说明
const imgUrlList = ref([])
const imgIndex = ref(0)

// 检查是否有表情包
function retEmitEmj(e) {
  const reg =
    // eslint-disable-next-line no-misleading-character-class
    /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi

  remark.value = e.target.value.replace(reg, '')
}
// 切换图片
const changeImg = throttle(e => {
  console.log('changeImg', imgIndex.value, e)
  if (e === 1) {
    // 下一张
    if (imgIndex.value < imgUrlList.value.length - 1) {
      imgIndex.value += 1
      chooseInfo.value = props.checkDialog.imgList[imgIndex.value]
      remark.value = props.checkDialog.imgList[imgIndex.value].markDesc || ''
    }
  } else {
    // 上一张
    if (imgIndex.value >= 1) {
      imgIndex.value -= 1
      chooseInfo.value = props.checkDialog.imgList[imgIndex.value]
      remark.value = props.checkDialog.imgList[imgIndex.value].markDesc || ''
    }
  }
}, 300)

// 取消
function closeDialog() {
  console.log(dialog.value)
  dialog.value.handleClose()
}
// 标记为修改意见
const handleConfirm = throttle(() => {
  if (chooseInfo.value.isMark) {
    return
  }
  if (isEmpty(remark.value)) {
    message.warning('请先输入问题说明')
    return
  }
  if (remark.value.length > 90) {
    message.warning('问题说明不超过90字')
    return
  }
  console.log('props.reasonList', props.reasonList.length)
  if (props.reasonList && props.reasonList.length < 30) {
    chooseInfo.value.isMark = true

    chooseInfo.value.markDesc = remark.value
    console.log('handleConfirm')
    // 校验是否为空
    emits(
      'markFun',
      'img',
      chooseInfo.value.id,
      chooseInfo.value.frame,
      chooseInfo.value.score,
      `${
        isVideo.value
          ? '画面' + secondToDate(chooseInfo.value.frame / 1000, 's', false, false)
          : '第' + chooseInfo.value.frame + '张图片'
      }${remark.value}`
    )
  } else {
    message.warning('最多支持添加30条修改意见')
  }
}, 500)

onMounted(() => {
  console.log('onMounted')
  console.log(info.value)
  console.log(riskDetectionResultList.value)
  if (isNotEmpty(props.checkDialog.imgList)) {
    console.log('xxxxxxx', props.checkDialog.imgList)
    imgUrlList.value = props.checkDialog.imgList.map(item => {
      return item.pictureUrl
    })
    imgIndex.value = props.checkDialog.index || 0
    chooseInfo.value = props.checkDialog.imgList[props.checkDialog.index || 0]
    remark.value = props.checkDialog.imgList[props.checkDialog.index || 0].markDesc || ''
  }
  // imgUrlList.value = riskDetectionResultList.value.map(item => {
  //   return item.imageUrl
  // })
})
</script>
<style lang="scss" scoped>
.red_back_color {
  font-weight: 600;
  font-size: 12px;
  line-height: 18px;
  width: max-content;
  padding: 2px 6px;
  border-radius: 4px;
  color: #d40000;
  background: rgba(212, 0, 0, 0.1);
}
.orange_back_color {
  font-weight: 600;
  font-size: 12px;
  line-height: 18px;
  width: max-content;
  padding: 2px 6px;
  border-radius: 4px;
  color: #ed6a0c;
  background: rgba(237, 106, 12, 0.1);
}
.green_back_color {
  font-weight: 600;
  font-size: 12px;
  line-height: 18px;
  width: max-content;
  padding: 2px 6px;
  border-radius: 4px;
  color: #2da641;
  background: rgba(45, 166, 65, 0.1);
}
.dialog_container {
  padding: 16px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  .container_left {
    width: 300px;
    margin-right: 20px;

    .img_dom {
      width: 100%;
      height: 400px;
      position: relative;
      .one_img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: flex;
        border-radius: 4px;
      }
    }
    .img_nums {
      margin-top: 15px;

      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      .img_num {
        margin: 0 24px;
        font-weight: 400;
        font-size: 11px;
        color: #646a73;
        line-height: 16px;
      }
      .pre_img,
      .next_img {
        cursor: pointer;
        width: 28px;
        height: 28px;
        background: rgba(0, 0, 0, 0.05);
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        border-radius: 100%;
        img {
          width: 16px;
          height: 16px;
          display: flex;
          object-fit: contain;
        }
      }
      .pre_img:hover,
      .next_img:hover {
        background: rgba(0, 0, 0, 0.1);
      }
      .dis_img {
        cursor: not-allowed;
        background: rgba(0, 0, 0, 0.05) !important;
      }
    }
  }
  .container_right {
    width: calc(100% - 320px);
    .one_right {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      .right_label {
        flex-shrink: 0;
        margin-right: 8px;
        font-weight: 600;
        font-size: 14px;
        color: #303133;
        line-height: 20px;
      }
      .rigth_time {
        font-weight: 400;
        font-size: 14px;
        color: #909399;
        line-height: 20px;
      }
      .rigth_content {
        width: 100%;
        margin-top: 8px;
      }
      :deep(.el-textarea__inner) {
        height: 163px;
      }
    }
    .one_right2 {
      flex-direction: column;
      align-items: flex-start;
    }
    .one_right + .one_right {
      margin-top: 12px;
    }
    .right_btn {
      margin-top: 172px;
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;
    }
  }
}
:deep(.el-textarea.is-disabled .el-textarea__inner) {
  background-color: transparent;
  color: #606266;
}
</style>
