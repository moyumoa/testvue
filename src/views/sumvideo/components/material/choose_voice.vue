<template>
  <!-- 音色选择器 -->
  <div class="choose_voice_page" :class="classList">
    <div class="page_top">
      <div class="title" v-if="title">{{ title }}</div>
      <div class="top_icon" v-if="topIcon">
        <img :src="topIcon" alt="" />
      </div>
      <div class="sex_box">
        <div
          :class="{ one_sex: true, choose_sex: chooseSex == item.id }"
          v-for="(item, index) in sexList"
          :key="index"
          @click="sexChangeFun(item)"
        >
          {{ item.label }}
        </div>
      </div>
      <div class="select_box">
        <el-select v-model="chooseTypeId" placeholder="选择音色" @change="typeChangeFun">
          <el-option
            v-for="item in typeList"
            :label="item.voiceTypeName"
            :value="item.id"
            :key="item.id"
          />
        </el-select>
      </div>
    </div>
    <div class="page_center" v-loading="loading">
      <div class="voice_box">
        <div
          :class="{ one_voice: true, choose_voice: item.isChoose }"
          v-for="(item, index) in voiceList"
          :key="item.id"
          @click="voiceChangeFun(item, index)"
        >
          <div class="voice_play_box" @click.stop="playFun(item, index)">
            <img
              v-show="previewInfo.id == item.id"
              src="https://tagvv-1256030678.file.myqcloud.com/20240328cqvyv.png"
              alt=""
            />
            <img
              v-show="previewInfo.id != item.id"
              src="https://tagvv-1256030678.file.myqcloud.com/20240328yo7nl.png"
            />
          </div>
          <div class="voice_name">{{ item.voiceName }}</div>
          <div class="voice_check_box">
            <div :class="{ check_box: true, check_box_active: item.isChoose }"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="page_bottom" v-if="showChooseNum">
      已选择
      <span>{{ chooseVoiceList.length }}</span>
      个
    </div>
    <!-- 预览音色 -->
    <audio
      v-if="previewInfo.id !== -1"
      :src="previewInfo.voiceUrl"
      autoplay
      style="display: none"
      @ended="previewInfo = { id: -1 }"
    ></audio>
  </div>
</template>
<script setup>
import { getVoiceLabel, getVoices } from '@/api/sumvideo/material.js'
import { throttle, isNotEmpty } from '@/utils/tools'
import { defineEmits } from 'vue'
const props = defineProps({
  topIcon: {
    type: String,
    default: ''
  }, // 是否显示左侧顶部的icon
  title: {
    type: String,
    default: ''
  }, // 标题
  showChooseNum: {
    type: Boolean,
    default: true
  }, // 是否显示选中的数量
  chooseInfo: {
    type: Array,
    default: () => {
      return []
    }
  }, // 默认选中的音色信息
  initOver: {
    type: Boolean,
    default: false
  }, // 是否在父级初始化完成（已获取默认的音色和类型列表）
  defaultVoiceList: {
    type: Array,
    default: () => {
      return []
    }
  }, // 默认的音色列表
  defaultTypeList: {
    type: Array,
    default: () => {
      return []
    }
  }, // 默认的类型列表
  classList: {
    type: Array,
    default: () => {
      return []
    }
  },
  creativeReplaceId: {
    type: Number || String,
    default: null
  } // 音色对应的分镜ID
})
const { topIcon, title, showChooseNum, classList } = toRefs(props)
const loading = ref(true)
const sexList = reactive([
  {
    id: 1,
    label: '女性'
  },
  {
    id: 2,
    label: '男性'
  }
]) // 性别列表
const chooseSex = ref(1) // 选中的性别
const typeList = ref([
  {
    voiceTypeName: '全部',
    id: -1,
    voiceTypeCode: null,
    gender: 1
  }
]) // 类型列表 不同性别 类型也不同
const chooseTypeId = ref(-1) // 选中的类型id 全部是-1
const chooseTypeName = ref('全部') // 选中的类型名称
const voiceList = ref([]) // 音色列表 不同类型 音色也不同
const chooseVoiceList = ref([]) // 选中的音色列表
const previewInfo = ref({
  id: -1,
  voiceUrl: ''
}) // 音色预览的信息

// 获取类型和音色
function getAllVoice() {
  loading.value = true
  getTypeList()
  getVoiceList()
}
// 获取类型列表
function getTypeList() {
  getVoiceLabel({
    gender: chooseSex.value || 1
  })
    .then(res => {
      if (res.code === 0) {
        const list = res.data || []
        list.unshift({
          voiceTypeName: '全部',
          id: -1,
          voiceTypeCode: null,
          gender: chooseSex.value
        })
        typeList.value = list
      }
    })
    .catch(() => {
      typeList.value = [
        {
          voiceTypeName: '全部',
          id: -1,
          voiceTypeCode: null,
          gender: chooseSex.value
        }
      ]
    })
}
// 获取音色列表
function getVoiceList() {
  loading.value = true
  getVoices({
    gender: chooseSex.value || 1,
    voiceTypeName: chooseTypeId.value === -1 ? '' : chooseTypeName.value || ''
  })
    .then(res => {
      if (res.code === 0) {
        const list = res.data || []
        list.forEach(x => {
          let isChoose = false
          chooseVoiceList.value.forEach(y => {
            if (x.id === y.id) {
              isChoose = true
            }
          })
          x.isChoose = isChoose
        })
        voiceList.value = list
      }
      loading.value = false
      loadingOver.value = true
    })
    .catch(() => {
      voiceList.value = []
      loading.value = false
      loadingOver.value = true
    })
}

// 根据性别获取类型和音色
const sexChangeFun = throttle(item => {
  if (chooseSex.value === item.id) return
  chooseSex.value = item.id
  chooseTypeId.value = -1
  chooseTypeName.value = '全部'
  getAllVoice()
})
// 类型改变 获取对应的音色
function typeChangeFun(e) {
  loading.value = true
  console.log(e)
  chooseTypeName.value = typeList.value.filter(x => x.id === chooseTypeId.value)[0].voiceTypeName
  getVoiceList()
}
// 播放音色
const playFun = throttle((e, index) => {
  if (previewInfo.value.id === e.id) {
    // 暂停
    previewInfo.value = { id: -1 }
  } else {
    // 播放
    previewInfo.value = e
  }
}, 300)
// 音色选择
const voiceChangeFun = throttle((e, index) => {
  e.isChoose = !e.isChoose
  if (e.isChoose) {
    // 选中
    chooseVoiceList.value.push(e)
  } else {
    // 取消选中
    const index = chooseVoiceList.value.findIndex(x => x.id === e.id)
    chooseVoiceList.value.splice(index, 1)
  }
}, 300)
const loadingOver = ref(false) // 是否加载完成
const emits = defineEmits(['updateVoiceFun'])
watch(
  () => chooseVoiceList.value,
  val => {
    if (loadingOver.value) {
      emits('updateVoiceFun', chooseVoiceList.value, props.creativeReplaceId)
    }
  },
  { deep: true }
)
onMounted(() => {
  if (props.chooseInfo && props.chooseInfo.length > 0) {
    chooseVoiceList.value = JSON.parse(JSON.stringify(props.chooseInfo))
  }
  chooseSex.value = 1
  if (props.initOver) {
    loading.value = true
    typeList.value = isNotEmpty(props.defaultTypeList)
      ? JSON.parse(JSON.stringify(props.defaultTypeList))
      : [
          {
            voiceTypeName: '全部',
            id: -1,
            voiceTypeCode: null,
            gender: chooseSex.value
          }
        ]
    const voiceList1 = isNotEmpty(props.defaultVoiceList)
      ? JSON.parse(JSON.stringify(props.defaultVoiceList))
      : []
    console.log('vvv', voiceList1)
    voiceList1.forEach(x => {
      let isChoose = false
      chooseVoiceList.value.forEach(y => {
        if (x.id === y.id) {
          isChoose = true
        }
      })
      x.isChoose = isChoose
    })
    voiceList.value = voiceList1
    nextTick(() => {
      loadingOver.value = true
      loading.value = false
    })
  } else {
    getAllVoice()
  }
})
</script>
<style lang="scss" scoped>
.choose_voice_page {
  width: 100%;
  padding: 12px 16px;
  .page_top {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;

    .title {
      margin-right: 20px;
      font-family: PingFangSC, PingFang SC;
      font-weight: 500;
      font-size: 16px;
    }
    .top_icon {
      width: 22px;
      height: 22px;
      object-fit: contain;
      display: flex;
      margin-right: 17px;
    }
    .sex_box {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      .one_sex {
        cursor: pointer;
        width: 48px;
        height: 24px;
        background: #f6f8fa;
        border-radius: 4px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        font-weight: 400;
        font-size: 13px;
        color: #909399;
        line-height: 18px;
        &:hover {
          color: #606266;
        }
      }
      .one_sex + .one_sex {
        margin-left: 8px;
      }
      .choose_sex {
        background: #364fcd;
        color: #ffffff !important;
      }
    }
    .select_box {
      width: 120px;
      margin-left: 16px;
    }
  }
  .page_center {
    margin-top: 20px;
    height: 156px;
    overflow-y: auto;
    .voice_box {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
      flex-wrap: wrap;
    }
    .one_voice {
      border: 1px solid #fff;
      width: 168px;
      height: 40px;
      background: #f6f8fa;
      border-radius: 4px;
      cursor: pointer;
      margin-bottom: 12px;
      margin-right: 12px;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      padding: 0 8px;
      .voice_play_box {
        width: 28px;
        height: 28px;
        cursor: pointer;
        margin-right: 8px;
        img {
          width: 28px;
          height: 28px;
          object-fit: contain;
          display: flex;
        }
      }
      .voice_name {
        width: calc(100% - 68px);
        font-weight: 600;
        font-size: 14px;
        color: #303133;
        line-height: 20px;
      }
      .voice_check_box {
        .check_box {
          width: 16px;
          height: 16px;
          background: #ffffff;
          border-radius: 2px;
          border: 1px solid #dcdee0;
          margin-left: 16px;
          cursor: pointer;
          position: relative;
        }
        .check_box_active {
          background: #364fcd;
          position: relative;
          &::after {
            box-sizing: content-box;
            content: '';
            border: 1px solid #fff;
            border-left: 0;
            border-top: 0;
            height: 8px;
            left: 5px;
            position: absolute;
            top: 1px;
            transform: rotate(45deg) scaleY(1);
            width: 4px;
            transition: transform 0.15s ease-in 0.05s;
            transform-origin: center;
          }
        }
      }
      &:hover {
        border: 1px solid #dcdee0;
      }
    }
    .choose_voice {
      border: 1px solid #dcdee0;
    }
  }
  .page_bottom {
    font-weight: 400;
    font-size: 14px;
    color: #909399;
    line-height: 20px;
    margin-top: 8px;
    span {
      font-weight: 600;
      color: rgba(54, 79, 205, 1);
    }
  }
}
</style>
