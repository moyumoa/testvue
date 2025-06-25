<template>
  <el-dialog
    ref="dialog"
    destroy-on-close
    v-model="show"
    custom-class="info_dialog"
    width="820px"
    @close="close"
  >
    <template #title>
      <div class="title">
        {{ props.reductionDialogData.title }}
        <span class="title_label">{{ props.reductionDialogData.label }}</span>
      </div>
    </template>
    <div class="add_content">
      <div
        class="content_item"
        v-for="(item, index) in strategyList"
        :key="index"
        v-show="item.show"
      >
        <div class="top">
          <div class="top_l">
            <img :src="item.iconPath" alt class="icon" />
            {{ item.name }}
          </div>
          <el-switch
            class="top_r"
            inline-prompt
            :width="44"
            v-model="item.switchStatus"
            :loading="item.loading"
            :before-change="beforeUpdateSwitchStatus.bind(this, item)"
          ></el-switch>
        </div>
        <div class="label_warp">
          <div
            class="label_item"
            :style="labelIndex == 2 ? 'color:#ED6A0C' : ''"
            v-for="(labelItem, labelIndex) in item.label"
            :key="labelIndex"
          >
            <span v-if="item.label.length > 1">{{ `${labelIndex + 1}、` }}</span>
            {{ labelItem }}
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>
<script setup>
import { updateStrategyConfig } from '@/api/sumvideo/creative_templateSpectroscope.js'
const props = defineProps({
  reductionDialogData: {
    type: Object,
    default: () => {
      return {
        show: false,
        strategyInfo: {
          id: null, // 策略id
          strategyIds: '' // 开启的策略
        } // 策略配置信息
      }
    },
    required: true
  }
})
const dialog = ref()
const show = toRef(props.reductionDialogData, 'show')
const emits = defineEmits(['updateStrategyIds'])
// 策略列表
const strategyList = ref([
  {
    id: 1,
    show: true, // 是否显示
    loading: false, // 加载状态
    iconPath: 'https://tagvv-1256030678.file.myqcloud.com/202309185kyc9.png',
    name: '视频',
    switchStatus: true, // 开关状态
    switchFiled: '', // 回显时字段
    label: [
      '模板跟拍时，非替换项的视频分镜会进行智能降重',
      '流水线合成时，所有视频分镜会进行智能降重',
      '降重可能会出现画面镜像'
    ] // 对配置项的解释，每一项为一条
  },
  {
    id: 2,
    show: true,
    loading: false,
    iconPath: 'https://tagvv-1256030678.file.myqcloud.com/20230918afev1.png',
    name: '图片',
    switchStatus: true,
    switchFiled: '',
    label: [
      '模板跟拍时，非替换项的图片分镜会进行智能降重',
      '流水线合成时，所有图片分镜会进行智能降重',
      '降重可能会出现画面镜像'
    ]
  },
  {
    id: 3,
    show: true,
    loading: false,
    iconPath: 'https://tagvv-1256030678.file.myqcloud.com/20230918x61lz.png',
    name: 'BGM',
    switchStatus: false,
    switchFiled: '',
    label: [
      '模板跟拍和流水线合成时，被系统智能识别为 BGM 的音频分镜（非替换项）会替换抖音实时热门BGM'
    ]
  },
  {
    id: 4,
    show: true,
    loading: false,
    iconPath: 'https://tagvv-1256030678.file.myqcloud.com/202309180zhcw.png',
    name: '字幕',
    switchStatus: false,
    switchFiled: '',
    label: ['模板跟拍和流水线合成时，被系统智能识别为 字幕 的文本会整体替换样式']
  },
  {
    id: 5,
    show: true,
    loading: false,
    iconPath: 'https://tagvv-1256030678.file.myqcloud.com/20230918m6unp.png',
    name: '转场',
    switchStatus: true,
    switchFiled: '',
    label: ['模板跟拍和流水线合成时，系统会识别视频片段，智能替换或添加视频转场']
  }
])
// 改变开关状态
function beforeUpdateSwitchStatus(item) {
  item.loading = true
  return new Promise((resolve, reject) => {
    let strategyIds = strategyList.value.filter(item => item.switchStatus).map(item => item.id)
    // 当前更改项
    if (!item.switchStatus) {
      strategyIds.push(item.id)
    } else {
      strategyIds = strategyIds.filter(x => {
        return x !== item.id
      })
    }
    const params = {
      id: props.reductionDialogData.strategyInfo.id,
      strategyIds: strategyIds.toString()
    }
    updateStrategyConfig(params)
      .then(res => {
        if (res.code === 0) {
          item.loading = false
          item.switchStatus = !item.switchStatus
          resolve()
        } else {
          reject(new Error('修改降重策略失败'))
        }
      })
      .catch(err => {
        console.log('策略修改失败', err)
        reject(new Error('修改降重策略失败'))
      })
  })
}

// 回显开关状态
function getList() {
  const strategyIds = props.reductionDialogData.strategyInfo.strategyIds.split(',').map(Number)
  strategyList.value.forEach(item => {
    item.switchStatus = strategyIds.includes(item.id)
  })
}
getList()

function close() {
  emits('updateStrategyIds')
}
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
:deep .el-switch {
  height: 22px;
}
.title {
  font-size: 16px;
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: 500;
  color: #323233;
  .title_label {
    margin-left: 12px;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #909399;
  }
}
.add_content {
  width: 100%;
  padding: 4px 16px 16px 16px;
  display: flex;
  flex-wrap: wrap;
  .content_item {
    width: calc(50% - 6px);
    min-height: 102px;
    background: #f2f3f5;
    border-radius: 4px;
    margin-top: 12px;
    padding: 16px;
    &:nth-child(2n) {
      margin-left: 12px;
    }
    .top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 16px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #303133;
      .top_l {
        display: flex;
        align-items: center;
        .icon {
          width: 20px;
          height: 20px;
          margin-right: 8px;
        }
      }
    }
    .label_warp {
      margin-top: 12px;
      .label_item {
        font-size: 12px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #606266;
        line-height: 18px;
      }
    }
  }
}
</style>
