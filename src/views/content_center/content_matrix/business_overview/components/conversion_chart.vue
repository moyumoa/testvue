<template>
  <div class="conversion_chart g_bg">
    <div class="top_wrapper">
      <div class="title">经营概览</div>
      <div class="subtitle ml_16">实时更新</div>
      <div class="select_warp">
        <div class="select_show" :class="{ select_show_active: selectOpen }">
          <!-- 选择内容的显示 -->
          <div class="select_content">
            <div class="platform_item">
              {{ getPlatformZn }}
              <div
                class="xm_platformIcon_1_24"
                style="position: static; margin-left: 4px"
                v-if="platformSelect == 0 || platformSelect == 1"
              ></div>
              <div
                class="xm_platformIcon_3_24"
                style="position: static; margin-left: 4px"
                v-if="platformSelect == 0 || platformSelect == 3"
              ></div>
              <div
                class="xm_platformIcon_4_24"
                style="position: static; margin-left: 4px"
                v-if="platformSelect == 0 || platformSelect == 4"
              ></div>
              <div
                class="xm_platformIcon_2_24"
                style="position: static; margin-left: 4px"
                v-if="platformSelect == 0 || platformSelect == 2"
              ></div>
            </div>
          </div>
          <!-- 箭头 -->
          <div class="indicate" :class="{ indicate_180: selectOpen }">
            <el-icon><i-arrow-down /></el-icon>
          </div>
        </div>
        <el-select
          v-model="platformSelect"
          placeholder="请选择平台"
          popper-class="icon_select"
          @visible-change="handleVisibleChange"
          @change="selectChange"
        >
          <el-option
            v-for="(item, index) in selectOptions"
            :key="index"
            :label="item.label"
            :value="item.value"
            :class="[`option_${item.pinY}`, 'back_position']"
          ></el-option>
        </el-select>
      </div>
      <div class="btn_box" @click="toForm">
        <i class="icon iconfont icon-shuju" style="margin-right: 4px"></i>
        数据明细
      </div>
      <!--  只有账号/成员视角才会显示 分组筛选-->
      <!-- <el-select
        v-if="['account'].includes(props.tab)"
        v-model="selectValue"
        collapse-tags
        @change="onChange"
        clearable
        filterable
        placeholder="全部矩阵号"
      >
        <el-option
          v-for="item in props.options"
          :key="item.id"
          :label="item.groupName"
          :value="item.id"
        />
      </el-select> -->
      <!-- 筛选 -->
      <search_popover
        v-if="['account', 'member'].includes(props.tab)"
        :hasGroup="true"
        :hasBusiness="true"
        :searchQuery="searchComponents"
        :searchParams="otherComponents"
        @updateQuery="updateQuery"
      ></search_popover>
    </div>
    <div :class="['chart_container', selfEntityList.length > 4 ? 'five_card' : 'four_card']">
      <template v-for="(item, index) in selfEntityList" :key="item.key">
        <div class="rectangle_wrapper">
          <div
            :class="['rectangle', `rectangle_${index}`]"
            :style="{ width: rectangleWidth }"
          ></div>
          <div class="rectangle_text">
            <div class="card_title">
              {{ item.label }}
              <el-tooltip v-if="item.tips" :style="{ 'margin-left': '4px' }" placement="top">
                <img
                  src="@/assets/images/operate/tip_white.png"
                  style="width: 16px; height: 16px; margin-left: 4px"
                />
                <template #content>
                  <div v-html="item.tips"></div>
                </template>
              </el-tooltip>
            </div>
            <div class="card_value">{{ item.value }}</div>
          </div>
        </div>
        <!-- 有比率才会显示       -->
        <div class="arrow_position_line" v-if="selfRatioList[index]">
          <div class="convert_arrow_container">
            <div class="arrow_info">
              <div class="arrow_text">{{ selfRatioList[index].label }}</div>
              <div class="arrow_value">{{ selfRatioList[index].value + '%' }}</div>
            </div>
            <div :class="['convert_arrow', `convert_arrow_${index}`]"></div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import {
  accountViewData,
  userViewData,
  principalViewData
} from '@/api/content_center/business_overview.js'
import { isNotEmpty } from '@/utils/tools.js'

const props = defineProps({
  settings: {
    type: Object,
    default: () => {
      return {
        entityList: [],
        ratioList: [],
        isGroup: false
      }
    }
  },
  // 分组的筛选项 放在父组件 避免每次都要请求接口
  options: {
    type: Array,
    default: () => []
  },
  groupId: String,
  tab: String
})
const emits = defineEmits(['update:groupId', 'selectChange', 'paramChange'])
const selfEntityList = toRef(props.settings, 'entityList')
const selfRatioList = toRef(props.settings, 'ratioList')

const selectValue = computed({
  get() {
    return props.groupId
  },
  set(value) {
    emits('update:groupId', value)
  }
})
const rectangleWidth = computed(() => {
  return selfEntityList.value.length > 4 ? '190px' : '220px'
})
const paramsPlatform = ref(0) // 入参平台
const platformSelect = ref(0) // 选择的平台
const selectOptions = ref([
  {
    id: 0,
    label: '全平台',
    pinY: 'qpt',
    value: 0
  },
  {
    id: 1,
    label: '抖音',
    pinY: 'dy',
    value: 1
  },
  {
    id: 3,
    label: '小红书',
    pinY: 'xhs',
    value: 3
  },
  {
    id: 4,
    label: '快手',
    pinY: 'ks',
    value: 4
  },
  {
    id: 2,
    label: '视频号',
    pinY: 'wx',
    value: 2
  }
])
const selectOpen = ref(false)
function handleVisibleChange(visible) {
  selectOpen.value = visible
}
const objPlatform = {
  0: '全平台',
  1: '抖音',
  3: '小红书',
  4: '快手',
  2: '视频号'
}
const getPlatformZn = computed(() => {
  return objPlatform[platformSelect.value]
})
const searchComponents = ref([
  {
    hiddenItem: !['account'].includes(props.tab),
    type: 'select',
    label: '分组',
    placeholder: '请选择分组',
    filed: 'groupIds',
    multiple: false,
    filterable: true,
    'collapse-tags': true,
    val: null,
    defaultVal: null,
    selects: [],
    selectDefultName: ['id', 'groupName']
  },
  {
    type: 'chooseDept',
    label: '部门',
    val: [],
    defaultVal: [],
    filed: 'areaIds',
    multiple: true,
    isUsePermission: false
  }
])
const otherParams = ref()
const otherComponents = ref([])
// 筛选组件获取到的值
function updateQuery(e, searchComponents) {
  if (e.groupIds) {
    e.groupIds = [e.groupIds]
  }
  otherParams.value = isNotEmpty(e) ? e : null
  otherComponents.value = isNotEmpty(searchComponents)
    ? JSON.parse(JSON.stringify(searchComponents))
    : null
  getList()
  emits('paramChange', otherParams.value)
}
function selectChange() {
  emits('selectChange', platformSelect.value)
}
const getList = () => {
  let promiseRequest = null
  // const groupIds = selectValue.value ? [selectValue.value] : []
  if (props.tab === 'account') {
    // 账号视角
    let params = {
      platform: paramsPlatform.value
    }
    if (isNotEmpty(otherParams.value)) {
      params = { ...params, ...otherParams.value }
    }
    promiseRequest = accountViewData(params)
  } else if (props.tab === 'member') {
    // 成员视角
    let params = {
      platform: paramsPlatform.value
    }
    if (isNotEmpty(otherParams.value)) {
      params = { ...params, ...otherParams.value }
    }
    promiseRequest = userViewData(params)
  } else {
    promiseRequest = principalViewData({
      platform: paramsPlatform.value,
      // groupIds,
      principalType: props.tab, // 考虑一下tab
      groupModel: props?.settings?.isGroup ? 1 : 0
    })
  }

  promiseRequest.then(res => {
    if (res.code === 0) {
      const data = res.data || {}
      selfEntityList.value = selfEntityList.value.map(item => {
        return {
          ...item,
          value: data[item.key]
        }
      })
      selfRatioList.value = selfRatioList.value.map(item => {
        return {
          ...item,
          value: data[item.key]
        }
      })
    }
  })
}
getList()

// 去数据明细的页面
const toForm = () => {
  window.open(
    `${location.origin}/content_center/operate_report?tab=${props.tab}&groupId=${
      selectValue.value ? selectValue.value : ''
    }`
  )
}

// const onChange = async () => {
//   await nextTick()

//   getList()
// }
function platformChange(platform) {
  paramsPlatform.value = platform
  getList()
}

defineExpose({ platformChange })
</script>

<style lang="scss" scoped>
// 有五个色块 屏幕小于 1800 将箭头放在下面
@media screen and(max-width: 1900px) {
  .five_card {
    .arrow_position_line {
      width: 1px;
      height: 220px;
      position: relative;
      overflow: visible;
    }

    .convert_arrow_container {
      position: absolute;
      left: -80px;
      bottom: 20px;
      z-index: 20;
    }
  }
}

// 只有四个色块的时候 屏幕小于1650 将箭头放在下面
@media screen and(max-width: 1650px) {
  .four_card {
    .arrow_position_line {
      width: 1px;
      height: 220px;
      position: relative;
      overflow: visible;
    }

    .convert_arrow_container {
      position: absolute;
      left: -70px;
      bottom: 20px;
      z-index: 20;
    }
  }
}

:deep(.el-select__tags) {
  padding-left: 4px !important;

  .el-select__tags-text {
    display: inline-block;
    @include mult_line(1);
  }
}

.conversion_chart {
  background-color: #fff;

  .top_wrapper {
    display: flex;
    align-items: center;
    //justify-content: ;
    .title {
      font-size: 18px;
      font-family: PingFangSC-Semibold, PingFang SC;
      font-weight: bold;
      color: #303133;
      line-height: 26px;
    }

    .subtitle {
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #909399;
      line-height: 20px;
    }
    .select_warp {
      flex: 1;
      margin-left: 24px;
      position: relative;
      // 自定义显示，将原显示透明保留唤起选项方法
      :deep(.el-input) {
        opacity: 0;
      }
      .select_show {
        width: 214px;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        box-sizing: border-box;
        border: 1px solid #dcdee0;
        padding-left: 11px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-radius: 4px;
        overflow: hidden;
        color: #606266;
      }
      .select_show_active {
        border-color: #364fcd;
      }
      .indicate {
        padding: 0 9px;
        transition: all 0.3s;
        color: #c0c4cc;
      }
      .indicate_180 {
        transform: rotate(-180deg);
      }
      .select_content {
        font-size: 14px;
        font-family: PingFangSC, PingFang SC;
        font-weight: 400;
        color: #303133;
        .platform_item {
          display: flex;
          align-items: center;
        }
      }
    }

    .btn_box {
      cursor: pointer;
      margin-right: 16px;
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #303133;
      line-height: 29px;
      text-align: center;
      border-radius: 4px;
      border: 1px solid #dcdee0;
      padding: 0 12px;

      .iconfont {
        color: #979aa0;
      }
    }
  }

  .chart_container {
    margin-top: 20px;
    height: 220px;
    background: #f7f8fa;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    //padding-left: 3px;
    padding: 0 20px;

    .pl_24 {
      padding-left: 24px;
    }

    .rectangle_wrapper {
      position: relative;
    }

    .rectangle_text {
      position: absolute;
      top: 0;
      z-index: 99;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      flex-direction: column;
      font-family: PingFangSC-Regular, PingFang SC;
      font-size: 14px;
      color: #ffffff;
      padding-left: 15px;
      padding-right: 9px;

      .card_title {
        display: flex;
        align-items: center;
      }

      .card_value {
        margin-top: 10px;
        height: 32px;
        font-size: 26px;
        font-family: Helvetica-Bold, Helvetica;
        font-weight: bold;
        color: #ffffff;
        line-height: 32px;
      }
    }

    .rectangle {
      width: 185px;
      height: 175px;
      position: relative;
      z-index: 10;
      border-radius: 4px;

      &::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        z-index: -1;
        border-radius: 4px;
        background: linear-gradient(90deg, #6de8a8 0%, #62db9c 100%);
        transform: perspective(110px) rotateY(3deg);
        //box-shadow: 0 0 7px #666;
      }
    }

    .convert_arrow_container {
      min-width: 160px;
      height: 55px;
      background-color: rgba(247, 248, 250, 0.8);
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 11px 10px;
    }

    .convert_arrow {
      height: 9px;
      width: 100px;
      position: relative;
      background: linear-gradient(90deg, rgba(98, 219, 156, 0) 0%, rgba(26, 198, 196, 0.8) 100%);

      &::before {
        position: absolute;
        top: -60%;
        right: -9px;
        content: '';
        width: 0;
        height: 0;
        display: inline-block;
        border-style: solid;
        border-color: transparent;
        border-width: 10px 0 10px 15px;
        border-left-color: #5ad5d0;
      }
    }

    .arrow_info {
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      //@include mult_line(1);

      .arrow_text {
        font-size: 12px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #909399;
        line-height: 17px;
      }

      .arrow_value {
        margin-left: 4px;
        font-size: 16px;
        font-family: Helvetica;
        color: #303133;
        line-height: 19px;
      }
    }

    //  卡片背景种类
    .rectangle_0 {
      height: 175px;

      &::before {
        background: #13c89e;
      }
    }

    .rectangle_1 {
      height: 155px;

      &::before {
        background: #1ac9c7;
      }
    }

    .rectangle_2 {
      height: 138px;

      &::before {
        background: #40b5f5;
      }
    }

    .rectangle_3 {
      height: 125px;

      &::before {
        background: #4e67e5;
      }
    }

    .rectangle_4 {
      height: 113px;

      &::before {
        background: #5747cf;
      }
    }

    // 箭头背景种类
    .convert_arrow_0 {
      background: linear-gradient(90deg, rgba(98, 219, 156, 0) 0%, rgba(26, 198, 196, 0.8) 100%);

      &::before {
        border-left-color: #46d0cd;
      }
    }

    .convert_arrow_1 {
      background: linear-gradient(90deg, rgba(26, 201, 199, 0) 0%, #40b5f5 100%);

      &::before {
        border-left-color: #48b9f2;
      }
    }

    .convert_arrow_2 {
      background: linear-gradient(90deg, rgba(64, 181, 245, 0) 0%, #4e67e5 100%);

      &::before {
        border-left-color: #5570e6;
      }
    }

    .convert_arrow_3 {
      background: linear-gradient(90deg, rgba(78, 103, 229, 0) 0%, #6858dd 100%);

      &::before {
        border-left-color: #6e61de;
      }
    }
  }
}

.btn_box + .popover_page {
  :deep(.search_btn) {
    margin: 0;
  }
}
</style>
