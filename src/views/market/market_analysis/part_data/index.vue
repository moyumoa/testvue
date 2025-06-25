<template>
  <div>
    <div class="search_wrapper">
      <div class="search_item">
        <label class="item_label">部门：</label>
        <el-button type="primary" @click="openChooseFun">选择部门</el-button>
        <span style="margin: 0 8px">
          已选择
          {{
            $data.tableForm.searchInfo &&
            $data.tableForm.searchInfo.orgIds &&
            $data.tableForm.searchInfo.orgIds.length
              ? $data.tableForm.searchInfo.orgIds.length
              : 0
          }}
          个部门
        </span>
        <el-tooltip
          popper-class="tooltip-class"
          content="系统默认显示当前登录账号权限范围内的一级子部门"
          placement="top"
        >
          <img src="@/assets/images/operate/tip_line.png" style="width: 12px; height: 12px" />
        </el-tooltip>
      </div>
      <div class="search_item">
        <label class="item_label">任务开始时间：</label>
        <el-date-picker
          v-model="$data.filterDate"
          type="daterange"
          range-separator="至"
          unlink-panels
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          :editable="false"
          :disabled-date="time => time.getTime() > Date.now()"
          @change="onChangeDate"
        ></el-date-picker>
      </div>
      <div class="search_item">
        <label class="item_label">统计方式：</label>
        <el-radio-group v-model="$data.tableForm.searchInfo.exportType">
          <el-radio :label="1">统计部门及其子部门人员参与的任务</el-radio>
          <el-radio :label="2">统计部门直接创建的任务</el-radio>
          <el-radio :label="3">统计部门及其子部门创建任务</el-radio>
        </el-radio-group>
      </div>
      <div class="search_item">
        <el-button type="primary" @click="getList">查询</el-button>
        <el-button @click="resetSearchInfo">重置</el-button>
        <exp_button ref="expButton" :asyncFunc="exportData">导出</exp_button>
      </div>
    </div>
    <div class="page_main mt_16">
      <!-- <div class="page_btns"> -->
      <!-- <async_button :asyncFunc="exportData">导出数据</async_button> -->
      <!-- <exp_button :asyncFunc="exportData">导出数据</exp_button> -->
      <!-- <el-button type="default" @click="showChooseDepartment = true">导出部门数据</el-button> -->
      <!-- </div> -->
      <xm_table
        v-loading="$data.tableForm.loading"
        :data="$data.tableForm.listData"
        :showPage="false"
        @getTableData="getList"
      >
        <el-table-column
          v-for="(item, index) in $data.tableForm.columns"
          :key="index"
          :label="item.name"
          :prop="item.code"
          :fixed="item.code === 'dept_name'"
          :sortable="!$data.notNumberCols.includes(item.code)"
          :sort-method="
            (a, b) => {
              return a[item.code] - b[item.code]
            }
          "
          :min-width="
            item.name
              ? item.name.length >= 12
                ? '220'
                : item.name.length >= 10
                ? '200'
                : item.name.length >= 8
                ? '180'
                : '150'
              : '120'
          "
        >
          <template #default="{ row }">
            <div v-if="$data.notNumberCols.includes(item.code)">{{ row[item.code] || '-' }}</div>
            <div v-else>{{ wanSliceFormat(row[item.code]) }}</div>
          </template>
        </el-table-column>
      </xm_table>
    </div>
    <choose_dept_dialog
      ref="chooseDpetRef"
      :isUsePermission="true"
      :getAllChild="false"
      :allowEmpty="true"
      v-if="$data.deptDialog.show"
      :deptDialog="$data.deptDialog"
      @updateDept="onChangeDepartment"
    ></choose_dept_dialog>
  </div>
</template>

<script setup>
// import { handleGetList } from './get_list'
import { wanSliceFormat, dateFormat } from '@/utils/tools.js'
import { reactive } from 'vue'
import {
  getTaskDepartmentData,
  exportDepartmentData,
  getTaskDepartmentDataField
} from '@/api/market/operate_analysis.js'
import { exportFileV2 } from '@/utils/exportFile'
import Track from '@/utils/tracking/index.js'
// import { ElMessage } from 'element-plus'

const $data = reactive({
  deptDialog: { show: false }, // 部门弹窗的组件信息
  showChooseDepartment: false,
  filterDate: [],
  notNumberCols: ['dept_name', 'dept_code', 'last_dept_name'],
  tableForm: {
    columns: [],
    loading: false,
    listData: [],
    searchInfo: {
      endTime: '',
      exportType: 1,
      orgIds: [],
      startTime: ''
    }
  }
})

function onChangeDate(e) {
  if (e) {
    $data.tableForm.searchInfo.startTime = dateFormat(e[0]) + ' 00:00:00'
    $data.tableForm.searchInfo.endTime = dateFormat(e[1]) + ' 23:59:59'
  } else {
    $data.tableForm.searchInfo.startTime = null
    $data.tableForm.searchInfo.endTime = null
  }
  // const time = toRaw(e)
  // const range = time[1].getTime() - time[0].getTime()
  // if (range > 30 * 24 * 60 * 60 * 1000) {
  //   return ElMessage.warning('时间跨度超过30天，请导出报表查看数据')
  // }
}

// 近七天
function setWeekDate() {
  const MONTH = 1000 * 60 * 60 * 24 * 6
  const NOW = new Date().getTime()
  $data.filterDate = [new Date(NOW - MONTH), new Date()]
  onChangeDate($data.filterDate)
}
const chooseDpetRef = ref()
function resetSearchInfo() {
  setWeekDate()
  //  清空选中的部门数据
  $data.tableForm.searchInfo.orgIds = []
  $data.deptDialog.checkNode = []
  chooseDpetRef.value?.clearFun()
  $data.tableForm.searchInfo.exportType = 1
  getList()
}

function onChangeDepartment(nodes, ids) {
  $data.tableForm.searchInfo.orgIds = ids
  $data.deptDialog = {
    checkNode: nodes,
    show: false
  }
  $data.tableForm.searchInfo.exportType = 1
  getList()
}
// 打开弹窗
function openChooseFun() {
  $data.deptDialog.show = true
}

// 获取table字段
function _getTaskDepartmentDataField() {
  return getTaskDepartmentDataField().then(res => {
    $data.tableForm.columns = res.data
  })
}

const expButton = ref(null)
// table列表
function getList() {
  const time = toRaw($data.filterDate)
  const range = time[1].getTime() - time[0].getTime()
  if (range > 30 * 24 * 60 * 60 * 1000) {
    return expButton.value?.showTipDialog(30)
  }
  $data.tableForm.loading = true
  getTaskDepartmentData($data.tableForm.searchInfo)
    .then(res => {
      $data.tableForm.listData = res.data
    })
    .finally(() => {
      $data.tableForm.loading = false
    })
}

// 导出
function exportData() {
  Track.clickBtn(116)
  return exportFileV2(exportDepartmentData, $data.tableForm.searchInfo, '部门数据', 'xlsx')
}

onMounted(() => {
  setWeekDate()
  _getTaskDepartmentDataField().then(res => {
    getList()
  })
})
</script>

<style lang="scss" scoped>
.search_wrapper {
  padding: 24px 0 8px 24px;
  background: #fff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  .search_item {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #303133;
    margin-bottom: 16px;
    margin-right: 24px;
    .item_label {
      flex-shrink: 0;
      margin-right: 14px;
      text-align: right;
    }
    .item_content {
      flex-shrink: 0;
      .el-input {
        width: 230px;
      }
    }
    .el-select__tags {
      padding-left: 6px !important;
    }
  }
}
// :deep(.page_btns .el-button) {
//   margin-left: 0 !important;
// }
</style>
