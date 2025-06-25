<template>
  <div class="content_page">
    <!--  顶部搜索栏  -->
    <div class="top-bar">
      <div class="top-title">数据看板</div>
      <!-- <el-cascader
        v-model="cascaderValue"
        :options="organizations"
        :clearable="true"
        :show-all-levels="false"
        :props="cascaderProps"
        placeholder="请选择"
      ></el-cascader> -->
      <!-- <choose_dept_search
        ref="chooseDeptSearchRef"
        @updateDeptIds="onChangeDepartment"
        :multiple="false"
        :isUsePermission="true"
        searchLabel=""
      /> -->
      <div class="data-range-group btn-margin">
        <div
          class="data-range-btn"
          :class="{ active: item === timeType }"
          @click="chooseTime(item)"
          v-for="item in btnList"
          :key="item"
        >
          {{ item === 0 ? '今' : item }}天
        </div>
      </div>
      <el-date-picker
        v-model="dateRangeValue"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="datePickerChange"
        :clearable="false"
        :disabled-date="time => time.getTime() > Date.now()"
      />
      <!-- 筛选 -->
      <search_popover
        :hasGroup="true"
        :hasBusiness="true"
        :searchQuery="searchComponents"
        :searchParams="otherComponents"
        @updateQuery="updateQuery"
      ></search_popover>
    </div>
    <div class="flex-line">
      <!-- 获客大盘     -->
      <CustomerOverview :params="params" class="item_2"></CustomerOverview>
      <!-- 获客排行榜     -->
      <rankings-list :params="params" class="item_1"></rankings-list>
    </div>
    <div class="flex-line" v-if="false">
      <!-- 漏斗图      -->
      <funnel-chart :params="params" class="item_2"></funnel-chart>
      <!--  留资排行榜    -->
      <rankings-account :params="params" class="item_1"></rankings-account>
    </div>
    <customer-line-chart :params="params"></customer-line-chart>
  </div>
</template>
<script setup>
import { dateFormat, isNotEmpty } from '@/utils/tools.js'
// 获客排行榜
import RankingsList from './components/rankings_list.vue'
//  留资排行榜
import RankingsAccount from './components/rankings_account.vue'
// 客户漏斗图
import FunnelChart from './components/funnel_chart.vue'
// 客户折线图
import CustomerLineChart from './components/customer_line_chart.vue'
// 获客大盘
import CustomerOverview from './components/customer_overview.vue'
// import api from '@/api/content_center/content_matrix.js'
// import { setBusinessChooseParam } from '@/utils/search.js'

// const cascaderValue = ref('')
const dateRangeValue = ref([])
const timeType = ref(30)
const searchComponents = ref([
  {
    type: 'chooseDept',
    label: '矩阵号部门',
    val: '',
    filed: 'deptIds',
    multiple: true,
    isUsePermission: true
  },
  {
    type: 'select',
    label: '矩阵号分组',
    placeholder: '请选择矩阵号分组',
    filed: 'groupIds',
    multiple: true,
    filterable: true,
    'collapse-tags': true,
    val: null,
    defaultVal: null,
    selects: [],
    selectDefultName: ['id', 'groupName']
  },
  {
    type: 'select',
    label: '平台',
    placeholder: '请选择平台',
    filed: 'platform',
    multiple: true,
    filterable: false,
    'collapse-tags': true,
    val: null,
    defaultVal: null,
    selects: [
      {
        label: '抖音',
        value: 1
      },
      {
        label: '小红书',
        value: 3
      }
      // {
      //   label: '快手',
      //   value: 4
      // },
      // {
      //   label: '视频号',
      //   value: 2
      // }
    ]
  },
  {
    type: 'input',
    label: '矩阵号昵称',
    val: '',
    defaultVal: null,
    placeholder: '请输入矩阵号昵称',
    filed: 'nickname'
  }
])
const otherParams = ref()
const otherComponents = ref([])
function updateQuery(e, searchComponents) {
  console.log('searchParamssearchParamssearchParams', e, searchComponents)
  otherParams.value = isNotEmpty(e) ? e : null
  otherComponents.value = isNotEmpty(searchComponents)
    ? JSON.parse(JSON.stringify(searchComponents))
    : null
}
// function onChangeDepartment(e) {
//   cascaderValue.value = isNotEmpty(e) ? e : null
// }
// 全局参数
const params = computed(() => {
  const data = {
    ...otherParams.value,

    endTime: dateFormat(dateRangeValue.value[1]) + ' 23:59:59',
    startTime: dateFormat(dateRangeValue.value[0]) + ' 00:00:00'
  }
  return data
})

const btnList = [0, 7, 15, 30]
// 选择时间范围
const chooseTime = days => {
  timeType.value = days
  const startTime = new Date()
  const endTime = new Date()
  if (days !== 0) {
    startTime.setTime(endTime - (days - 1) * 24 * 60 * 60 * 1000)
  }
  dateRangeValue.value = [startTime, endTime]
}
// 时间范围手动改变
const datePickerChange = value => {
  if (!Array.isArray(value)) return
  if (dateFormat(value[1]) !== dateFormat(new Date())) {
    timeType.value = -1
    return
  }
  const dateList = btnList.map(item => {
    let date = new Date()
    if (item !== 0) date = new Date(date - (item - 1) * 24 * 60 * 60 * 1000)
    return {
      day: item,
      dateValue: dateFormat(date)
    }
  })

  const temp = dateList.find(item => item.dateValue === dateFormat(value[0]))
  console.log(dateList, temp)
  // 有时间段匹配 没有置空选择
  timeType.value = typeof temp === 'undefined' ? -1 : temp.day
}
const init = () => {
  //  默认选中30天
  chooseTime(30)
}
init()
</script>
<style lang="scss" scoped>
@import '@/views/content_center/components/css/page.scss';

.content_page {
  min-width: 1000px;

  .top-bar {
    display: flex;
    align-items: center;
    height: 70px;
    background: #ffffff;
    border-radius: 4px;
    padding: 0 24px;
    margin-bottom: 16px;

    .top-title {
      flex: 1;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }

    .btn-margin {
      margin: 0 16px;
    }

    .data-range-group {
      .data-range-btn {
        position: relative;
        cursor: pointer;
        display: inline-block;
        width: 66px;
        height: 32px;
        color: #595959;
        text-align: center;
        line-height: 32px;
        border: 1px solid #d9d9d9;
      }

      .active {
        color: $theme_color;
        z-index: 10;
        background: rgba(54, 79, 205, 0.1);
        border: 1px solid #364fcd;
      }

      :not(:last-child) {
        margin-right: -1px;
      }

      :first-child {
        border-radius: 4px 0 0 4px;
      }

      :last-child {
        border-radius: 0 4px 4px 0;
      }
    }
  }

  .page_center {
    margin-bottom: 16px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;

    .center_left {
      width: 100%;

      .sub_title {
        font-size: 14px;
        margin-left: 6px;
        color: #909399;
      }
    }

    .data_screening {
      padding: 22px 24px;
      background: #ffffff;
      border-radius: $content-radius;

      .title {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }

      .data_box {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        flex-wrap: wrap;

        .one_data {
          box-sizing: border-box;
          height: 85px;
          background: #f6f8fa;
          width: calc((100% - 36px) / 5);
          padding: 20px;
          margin-bottom: 12px;
          border-radius: 4px;
          text-align: center;
          position: relative;

          .tooltip-img {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 14px;
            height: 14px;
            margin-left: 8px;
          }

          .one_data_value {
            font-size: 18px;
            font-weight: bold;
            color: #333333;
            line-height: 22px;
          }

          .one_data_title {
            margin-top: 6px;

            font-size: 12px;
            font-weight: 400;
            color: #909399;
            line-height: 17px;
          }
        }
      }
    }
  }

  .flex-line {
    width: 100%;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    flex-direction: row;

    .item_1 {
      flex: 1;
      padding: 22px 20px;
      box-sizing: border-box;
    }

    > :not(:first-child) {
      margin-left: 16px;
    }

    .item_2 {
      padding: 22px 20px;
      width: calc(100% - (100% / 3) - 5px);
    }
  }
}
</style>
