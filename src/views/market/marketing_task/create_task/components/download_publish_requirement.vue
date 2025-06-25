<template>
  <div class="setting_block">
    <div class="setting_title">任务要求</div>
    <div class="setting_main">
      <el-form-item class="tag_formItem" label="需携带话题：" style="flex: 1">
        <chooseKeywordDOM
          v-if="initOver"
          placeholder="输入话题名称，以回车键确认，最多可添加3个话题"
          origin="task2"
          :maxSize="30"
          :historyType="2"
          :disabled="disabled || topicDisabled"
          :topicType="2"
          v-model:topicList="formData.topicList"
        />
      </el-form-item>
      <el-form-item class="tag_formItem" label="需设置POI：" style="flex: 1">
        <div class="poi_name" v-if="disabled || poiDisabled">
          {{ formData.dyPoiInfo ? formData.dyPoiInfo.poiName : '输入需要挂载POI位置名称' }}
        </div>
        <el-select
          v-else
          popper-class="poi_select"
          :style="{ width: '100%' }"
          v-model="formData.dyPoiInfo"
          filterable
          remote
          clearable
          :remote-method="_getPOIList"
          :disabled="disabled || poiDisabled"
          placeholder="输入需要挂载POI位置名称"
          value-key="poi"
          :fit-input-width="true"
          :loading="poiLoading"
          @change="updateTask"
        >
          <el-option v-for="item in POIList" :key="item.poi" :label="item.poiName" :value="item">
            <div class="one_options">
              <div class="option_name">{{ item.poiName || '' }}</div>
              <div class="option_addr">
                {{ item.province }}{{ item.city }}{{ item.district }}{{ item.simpleAddr }}
              </div>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item class="tag_formItem" label="抖音需@对象：" style="flex: 1" v-if="showDyAt">
        <chooseAtPerson
          v-if="initOver"
          placeholder="选择@的人，最多可添加3个@的人"
          type="dy"
          origin="task2"
          :historyType="1"
          :disabled="disabled || dyAtDisabled"
          v-model:atPersonList="formData.dyAtList"
        />
      </el-form-item>
      <el-form-item class="tag_formItem" label="小红书需@对象：" style="flex: 1" v-if="showXhsAt">
        <chooseAtPerson
          v-if="initOver"
          placeholder="选择@的人，最多可添加3个@的人"
          type="xhs"
          origin="task2"
          :historyType="1"
          :disabled="disabled || xhsAtDisabled"
          v-model:atPersonList="formData.xhsAtList"
        />
      </el-form-item>
      <!--  视频任务才会显示   -->
      <!-- <el-form-item
        v-if="taskType == 1"
        class="tag_formItem keyword_formItem"
        label="标题需携带关键词："
        style="flex: 1"
      >
        <template #label>
          <div class="keyword_label">
            标题需携带关键词：
            <el-tooltip placement="top">
              <template #content>
                <div style="max-width: 330px">员工发布时会参考生成的标题自动仿写</div>
              </template>
              <span class="xm_tooltipOfRight"></span>
            </el-tooltip>
          </div>
        </template>
        <keywordToTitle
          v-if="initOver"
          btnText="AI一键生成标题"
          width="542px"
          :formData="formData"
          :platformList="platformList"
          :disabled="disabled"
          :dyTopicList="formData.topicList"
          :dyAtList="formData.dyAtList"
          :xhsTopicList="formData.topicList"
          :xhsAtList="formData.xhsAtList"
          :keywordList="formData.keywordList"
        />
      </el-form-item> -->
      <!--      <el-form-item class="tag_formItem" label="需设置小红书POI：" style="flex: 1">-->
      <!--        <div class="poi_name" v-if="disabled">-->
      <!--          {{ formData.xhsPoiInfo ? formData.xhsPoiInfo.poiName : '输入需要挂载POI位置名称' }}-->
      <!--        </div>-->
      <!--        <el-select-->
      <!--          v-else-->
      <!--          popper-class="poi_select"-->
      <!--          :style="{ width: '100%' }"-->
      <!--          v-model="formData.xhsPoiInfo"-->
      <!--          filterable-->
      <!--          remote-->
      <!--          clearable-->
      <!--          :remote-method="_getXhsPOIList"-->
      <!--          :disabled="disabled"-->
      <!--          placeholder="输入需要挂载POI位置名称"-->
      <!--          value-key="poi"-->
      <!--          :fit-input-width="true"-->
      <!--          :loading="xhsPoiLoading"-->
      <!--          @change="updateTask"-->
      <!--        >-->
      <!--          <el-option v-for="item in xhsPOIList" :key="item.poi" :label="item.poiName" :value="item">-->
      <!--            <div class="one_options">-->
      <!--              <div class="option_name">{{ item.poiName || '' }}</div>-->
      <!--              <div class="option_addr">-->
      <!--                {{ item.subname }}-->
      <!--              </div>-->
      <!--            </div>-->
      <!--          </el-option>-->
      <!--        </el-select>-->
      <!--      </el-form-item>-->
    </div>
  </div>
</template>
<script setup>
import { isNotEmpty } from '@/utils/tools.js'
import { poiLocation } from '@/api/market/store'
import chooseKeywordDOM from './video_setting/choose_dy_topic.vue'
import chooseAtPerson from './video_setting/choose_atPerson.vue'
// import keywordToTitle from './video_setting/keyword_to_title.vue'
const props = defineProps({
  taskInfo: Object,
  disabled: Boolean,
  taskType: Number
})
const disabled = toRef(props, 'disabled')
const platformList = ref([]) // 当前选中的平台列表
// 视频设置
const videoConfig = props.taskInfo?.infoConfigs.find(item => item.ckey === 'video_set')
const formData = reactive({
  keywordList: [],
  topicList: [],
  dyPoiInfo: null,
  dyAtList: [],
  xhsAtList: []

  // atList: [],
  // xhsPoiInfo: null
})

// 数据修改
watch(
  () => formData,
  () => {
    if (initOver.value) {
      updateTask()
    }
  },
  {
    deep: true
  }
)

// watch(
//   () => formData.topicList,
//   () => {
//     updateTask()
//   },
//   {
//     deep: true
//   }
// )
// watch(
//   () => formData.atList,
//   () => {
//     updateTask()
//   },
//   {
//     deep: true
//   }
// )

function updateTask() {
  const cvalue = {}
  cvalue.keywordList = isNotEmpty(formData.keywordList) ? formData.keywordList : []
  cvalue.topicList = isNotEmpty(formData.topicList) ? formData.topicList : []
  cvalue.dyPoiInfo = isNotEmpty(formData.dyPoiInfo) ? formData.dyPoiInfo : {}
  cvalue.dyAtList = isNotEmpty(formData.dyAtList) ? formData.dyAtList : []
  cvalue.xhsAtList = isNotEmpty(formData.xhsAtList) ? formData.xhsAtList : []
  videoConfig.children.forEach(config => {
    if (config.ckey === 'video_common_mount') {
      // 视频设置 图文发布设置会修改标题 这里注意不要覆盖了
      let data = isNotEmpty(config.cvalue) ? JSON.parse(config.cvalue) : {}
      data = {
        ...data,
        ...cvalue
      }
      console.warn('视频设置', data)

      config.cvalue = JSON.stringify(data)
    }
    // 设置抖音@的人
    if (config.ckey === 'video_@_person') {
      config.cvalue = JSON.stringify(formData.dyAtList)
    }
    // 设置小红书@的人
    if (config.ckey === 'video_xhs_@_person') {
      config.cvalue = JSON.stringify(formData.xhsAtList)
    }

    // if (config.ckey === 'intelligent_ai_title') {
    //   if (formData.otherTitle || formData.xhsDescription || formData.xhsTitle) {
    //     config.cvalue = JSON.stringify({
    //       otherTitle: formData.otherTitle,
    //       xhsDescription: formData.xhsDescription,
    //       xhsTitle: formData.xhsTitle
    //     })
    //   } else {
    //     config.cvalue = ''
    //   }
    // }
  })
}

onMounted(() => {
  init()
})
const initOver = ref(false)

function init() {
  videoConfig.children.forEach(config => {
    if (config.ckey === 'video_common_mount' && isNotEmpty(config.cvalue)) {
      const cvalue = JSON.parse(config.cvalue)
      if (isNotEmpty(cvalue.keywordList)) {
        formData.keywordList = cvalue.keywordList
      }
      if (isNotEmpty(cvalue.topicList)) {
        formData.topicList = cvalue.topicList
      }
      if (isNotEmpty(cvalue.dyPoiInfo)) {
        formData.dyPoiInfo = cvalue.dyPoiInfo
        POIList.value = [cvalue.dyPoiInfo]
      }
      // if (isNotEmpty(cvalue.dyAtList)) {
      //   formData.dyAtList = cvalue.dyAtList
      // }
      // if (isNotEmpty(cvalue.xhsAtList)) {
      //   formData.xhsAtList = cvalue.xhsAtList
      // }
    }
    // 设置抖音@的人
    if (config.ckey === 'video_@_person' && isNotEmpty(config.cvalue)) {
      formData.dyAtList = JSON.parse(config.cvalue)
    }
    // 设置小红书@的人
    if (config.ckey === 'video_xhs_@_person' && isNotEmpty(config.cvalue)) {
      formData.xhsAtList = JSON.parse(config.cvalue)
    }
    // 获取发布平台
    if (config.ckey === 'video_publish_platform' && isNotEmpty(config.cvalue)) {
      console.log('平台', config.cvalue)
      if ([1, 6].includes(props.taskType)) {
        platformList.value = config.cvalue.split(',').map(Number)
      }
    }
    // if (config.ckey === 'intelligent_ai_title' && config.cvalue !== '') {
    //   const cvalue = JSON.parse(config.cvalue)
    //   if (isNotEmpty(cvalue)) {
    //     formData.otherTitle = cvalue.otherTitle
    //     formData.xhsDescription = cvalue.xhsDescription
    //     formData.xhsTitle = cvalue.xhsTitle
    //   }
    // }
  })
  nextTick(() => {
    initOver.value = true
  })
}

// POI
const poiLoading = ref(false)
const POIList = ref([])
// 获取POIlist
const _getPOIList = name => {
  if (name) {
    poiLoading.value = true
    poiLocation({
      keyword: name || ''
    })
      .then(res => {
        if (res.code === 0 && res.data) {
          const list = res.data || []
          POIList.value = list.map(item => {
            const {
              simplePoiInfo: { addressInfo, poiId, poiName }
            } = item
            return {
              poi: poiId,
              poiName,
              storeName: poiName,
              province: addressInfo.province,
              city: addressInfo.city,
              district: addressInfo.district,
              simpleAddr: addressInfo.simpleAddr,
              cityCode: addressInfo.cityCode
            }
          })
        } else {
          POIList.value = []
        }
        poiLoading.value = false
      })
      .catch(() => {
        POIList.value = []
        poiLoading.value = false
      })
  }
}

const xhsAtDisabled = ref(false)
const dyAtDisabled = ref(false)
const topicDisabled = ref(false)
const poiDisabled = ref(false)
const showXhsAt = ref(true)
const showDyAt = ref(true)

const publishPlatformChange = platform => {
  // 2025.1 视频平台从单选变成多选
  console.log('pl', platform, props.taskType)
  xhsAtDisabled.value = false
  dyAtDisabled.value = false
  topicDisabled.value = false
  poiDisabled.value = false
  // 有小红书 就显示小红书@ 有抖音 就显示抖音@ --视频 2025.1
  if (props.taskType === 1) {
    platformList.value = platform.map(Number)
    showDyAt.value = platform.includes('1')
    showXhsAt.value = platform.includes('3')
  } else {
    const type = Number(platform)
    if (type === 1) {
      // 抖音不显示 小红书@
      xhsAtDisabled.value = true
      formData.xhsAtList = []
    } else if (type === 2) {
      // 视频号 话题 POI @ 都没有
      xhsAtDisabled.value = true
      formData.xhsAtList = []
      dyAtDisabled.value = true
      formData.dyAtList = []
      poiDisabled.value = true
      formData.dyPoiInfo = null
      topicDisabled.value = true
      formData.topicList = []
    } else if (type === 3) {
      // 小红书 不显示 抖音@
      dyAtDisabled.value = true
      formData.dyAtList = []
    } else if (type === 4) {
      // 快手没有 小红书@ 抖音@   POI
      xhsAtDisabled.value = true
      formData.xhsAtList = []
      dyAtDisabled.value = true
      formData.dyAtList = []
      poiDisabled.value = true
      formData.dyPoiInfo = null
    }
  }
  initOver.value = false
  nextTick(() => {
    updateTask()
    initOver.value = true
  })
}

defineExpose({
  publishPlatformChange
})
</script>
<style lang="scss" scoped>
.poi_name {
  line-height: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: not-allowed;
  border: 1px solid #e4e7ed;
  padding: 0 31px 0 11px;
  background: #f5f7fa;
  color: #c0c4cc;
  @include mult_line(1);
}
:deep(.keyword_formItem) {
  .el-form-item__label {
    padding-right: 4px !important;
  }
  .keyword_label {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    .xm_tooltipOfRight::after {
      margin-left: 0;
      width: 16px;
      height: 16px;
    }
  }
  .el-form-item__content {
    flex: auto;
  }
  .one_result {
    width: 542px;
  }
}
:deep(.el-form-item__label) {
  padding-right: 20px;
}
</style>
