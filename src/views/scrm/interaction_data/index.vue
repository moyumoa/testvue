<template>
  <div>
    <xm_search
      :searchComponents="$data.searchComponents"
      @getData="searchList"
      :useOwnReset="true"
      @reset="resetSearch"
    >
      <template #searchBtn>
        <exp_button :asyncFunc="exportFiles">导出</exp_button>
      </template>
    </xm_search>
    <div class="page_main mt_16">
      <xm_table
        tableType="default"
        v-loading="listLoading"
        :data="list"
        v-model:page="page"
        @getTableData="getTableList"
        @sort-change="onSortChange"
      >
        <el-table-column label="矩阵号" width="260">
          <template #default="{ row }">
            <table_column_matrix_account
              :info="row.userInfo"
              :showDepart="true"
              departClassName=" gray_department_info"
              :departmentName="row.xuserDeptName"
              :showDel="row.xuserIsDel && row.xuserIsDel == 1 ? true : false"
              :showPlatform="true"
              :showBusiness="true"
              :businessNameList="row.businessNameList"
            ></table_column_matrix_account>
          </template>
        </el-table-column>
        <el-table-column
          v-for="(item, index) in $data.columns"
          :key="index"
          :label="item.name"
          :prop="item.orderKey"
          sortable="custom"
          min-width="130"
        >
          <template #default="{ row }">
            <!-- 小红书平台只有私信数，其余都是- -->
            <template v-if="row.platform && row.platform == 3">
              {{ item.code == 'privateMessageCnt' ? wanSliceFormat(row[item.code]) : '--' }}
            </template>
            <!-- 抖音平台显示所有数据 -->
            <template v-else>
              {{ wanSliceFormat(row[item.code]) }}
            </template>
          </template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>

<script setup>
import { setBusinessChooseParam } from '@/utils/search.js'

import tableList from '@/utils/com_composition/table_list.js'
import { wanSliceFormat, dateFormat } from '@/utils/tools.js'
import { getScrmAccountStat, statExportV2 } from '@/api/scrm/session_management'
import { getQuery } from '@/utils/get_query'
import api from '@/api/content_center/content_matrix.js'
import { exportFileV2 } from '@/utils/exportFile'

const $data = reactive({
  order: '',
  searchComponents: [
    {
      type: 'input',
      label: '矩阵号',
      val: '',
      placeholder: '请输入矩阵号昵称、抖音号',
      filed: 'nikename'
    },
    {
      type: 'select',
      label: '分组',
      placeholder: '请选择分组',
      filed: 'groupIds',
      multiple: true,
      filterable: true,
      'collapse-tags': true,
      val: null,
      selects: [],
      selectDefultName: ['id', 'groupName']
    },
    {
      type: 'chooseDept',
      label: '矩阵号部门',
      val: [],
      filed: 'deptIds',
      multiple: true,
      isUsePermission: true
    },
    {
      type: 'dateRange',
      label: '时间范围',
      val: '',
      filed: 'name',
      isDisEdit: true,
      disabledDate: time => {
        return time.getTime() > Date.now() - 24 * 60 * 60 * 1000
      },
      placeholder: ['开始时间', '结束时间']
    }
  ],
  columns: [
    {
      name: '私信数',
      code: 'privateMessageCnt',
      orderKey: 'private_message_cnt'
    },
    {
      name: '关注数',
      code: 'followCnt',
      orderKey: 'follow_cnt'
    },
    {
      name: '取关数',
      code: 'unFollowCnt',
      orderKey: 'un_follow_cnt'
    },
    {
      name: '点赞数',
      code: 'videoDiggCnt',
      orderKey: 'video_digg_cnt'
    },
    {
      name: '取消点赞数',
      code: 'videoUnDiggCnt',
      orderKey: 'video_un_digg_cnt'
    },
    {
      name: '评论数',
      code: 'videoCommentCnt',
      orderKey: 'video_comment_cnt'
    },
    {
      name: '进入会话数',
      code: 'imInCnt',
      orderKey: 'im_in_cnt'
    },
    {
      name: '主页互动数',
      code: 'homeInteractionCnt',
      orderKey: 'home_interaction_cnt'
    },
    {
      name: '直播弹幕',
      code: 'liveMsg',
      orderKey: 'live_msg'
    },
    {
      name: '直播赠礼',
      code: 'liveGift',
      orderKey: 'live_gift'
    },
    {
      name: '直播点赞',
      code: 'liveDigg',
      orderKey: 'live_digg'
    },
    {
      name: '直播关注',
      code: 'liveFollow',
      orderKey: 'live_follow'
    },
    {
      name: '直播分享',
      code: 'liveShare',
      orderKey: 'live_share'
    }
  ]
})

// 更新业务主体筛选项
const initSearch = function () {
  const list = setBusinessChooseParam()
  $data.searchComponents = $data.searchComponents.concat(list)
}
initSearch()

// 分组
function getNewGroupList() {
  api.getNewGroupList({}).then(res => {
    if (res.code === 0) {
      $data.searchComponents[1].selects = res.data || []
    }
  })
}
getNewGroupList()

// 导出
function exportFiles() {
  const param = getQuery($data.searchComponents, ['recordDateMin', 'recordDateMax'])
  if (param.recordDateMin) {
    param.recordDateMin = dateFormat(new Date(param.recordDateMin), 'YYYYMMDD')
    param.recordDateMax = dateFormat(new Date(param.recordDateMax), 'YYYYMMDD')
  }
  param.pageNo = page.index
  param.pageSize = page.size
  param.dateMode = 0
  param.userMode = 1
  if ($data.order) {
    param.orderSetting = $data.order
  }
  return exportFileV2(statExportV2, param, '互动数据', 'xlsx')
}

function getList(page) {
  const param = getQuery($data.searchComponents, ['recordDateMin', 'recordDateMax'])
  if (param.recordDateMin) {
    param.recordDateMin = dateFormat(new Date(param.recordDateMin), 'YYYYMMDD')
    param.recordDateMax = dateFormat(new Date(param.recordDateMax), 'YYYYMMDD')
  }
  param.pageNo = page.index
  param.pageSize = page.size
  param.dateMode = 0
  param.userMode = 1
  if ($data.order) {
    param.orderSetting = $data.order
  }
  return getScrmAccountStat(param).then(res => {
    let _list = res.data.records
    _list = _list.map(e => {
      e.userInfo = {
        dyAvatar: e.dyHeadUrl,
        dyName: e.dyNickname,
        dyNum: e.dyDisplayId,
        platform: e.platform
      }
      return e
    })
    page.total = res.data.total
    return _list
  })
}

function onSortChange(row) {
  if (row.order === 'descending') {
    $data.order = `DESC:${row.prop}`
  }
  if (row.order === 'ascending') {
    $data.order = `ASC:${row.prop}`
  }
  getTableList()
}

const { page, list, getTableList, listLoading, searchList, resetSearch } = tableList(getList)

onMounted(() => {
  $data.order = 'DESC:private_message_cnt'
  getTableList()
})
</script>

<style lang="scss" scoped>
.page_main {
  padding-bottom: 20px;
}
</style>
