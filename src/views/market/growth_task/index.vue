<template>
  <div class="growth_task">
    <div class="page_top">
      <!-- <div class="top_title">
        成长任务
        <span>
          成长任务用在成长体系的成长等级中，目前{{
            employeeGrowthSystemState ? '已' : '未'
          }}开启成长体系
        </span>
        <el-link type="primary" @click="toSetting" v-if="!employeeGrowthSystemState">
          前往设置
        </el-link>
      </div> -->
      <div class="top_search">
        <xm_search
          :searchComponents="$data.searchComponents"
          @getData="searchList"
          :useOwnReset="true"
          @reset="resetSearch"
          ref="xmSearchRef"
        />
      </div>
    </div>
    <div class="page_bottom">
      <div class="create_box">
        <!-- <div class="one_create" > -->
        <!-- <div class="one_create_title">
            <img :src="GROWTH_TASK_TYPE.getCN(item).icon" />
            
          </div>
          <div class="one_create_mark">
            成员{{ GROWTH_TASK_TYPE.getCN(item).mark }}并达到指标后完成任务
          </div>
          <div class="one_create_btn"> -->
        <el-button
          class="create_btn"
          v-for="(item, index) in [1, 2, 5]"
          :key="index"
          type="primary"
          @click="createTask(item)"
        >
          创建{{ GROWTH_TASK_TYPE.getCN(item).label }}任务
        </el-button>
        <!-- </div> -->
        <!-- </div> -->
      </div>
      <xm_table
        v-loading="$data.tableForm.loading"
        :data="$data.tableForm.listData"
        v-model:page="$data.tableForm.page"
        @getTableData="getList"
      >
        <el-table-column
          label="任务标题"
          prop="taskName"
          min-width="180"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column label="任务类型" min-width="120">
          <template #default="{ row }">
            {{
              GROWTH_TASK_TYPE.getCN(row.taskType)
                ? GROWTH_TASK_TYPE.getCN(row.taskType).label + '任务'
                : '--'
            }}
          </template>
        </el-table-column>
        <el-table-column label="是否生效" prop="title" min-width="100">
          <template v-slot="{ row }">
            <div>{{ row.isValid ? '是' : '否' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="成长等级" prop="title" min-width="100">
          <template v-slot="{ row }">
            <div>{{ row.name || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="参与人数" prop="title" min-width="100">
          <template v-slot="{ row }">
            <div>{{ wanSliceFormat(row.joinCnt || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="参与成功人数" prop="title" min-width="120">
          <template v-slot="{ row }">
            <div>{{ wanSliceFormat(row.joinSucceedCnt || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="完成人数" prop="title" min-width="100">
          <template v-slot="{ row }">
            <div>{{ wanSliceFormat(row.completeCnt || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="title" width="180">
          <template v-slot="{ row }">
            <div>{{ row.gmtCreate || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="260" align="right" header-align="right">
          <template #default="{ row }">
            <div class="btn_box">
              <el-link type="primary" @click="copyTask(row)">复制</el-link>
              <p class="one_btn_line"></p>
              <el-link type="primary" @click="editTask(row)">
                {{ row.isValid === 1 && row.joinCnt > 0 ? '查看' : '编辑' }}
              </el-link>
              <p class="one_btn_line"></p>
              <el-link type="primary" @click="toDetail(row)">查看数据</el-link>
              <p class="one_btn_line" v-if="!row.isValid && !row.joinCnt"></p>
              <el-link type="primary" v-if="!row.isValid && !row.joinCnt" @click="delTask(row)">
                删除任务
              </el-link>
            </div>
          </template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>
<script setup>
import { GROWTH_TASK_TYPE } from '@/utils/dictionary/task'
import { getQuery } from '@/utils/get_query.js'
import { useRouter } from 'vue-router'
import { throttle, wanSliceFormat } from '@/utils/tools.js'
import { useStore } from 'vuex'
import { growthTasks } from '@/api/market/growth_system.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deleteTask } from '@/api/market/task.js'

const router = useRouter()
const store = useStore()
// 成长体系开关
// const employeeGrowthSystemState = computed(() => {
//   return store.state.user.employeeGrowthSystemState
// })
const $data = reactive({
  saveLoading: false,
  searchComponents: [
    {
      type: 'input',
      label: '任务名称',
      val: '',
      placeholder: '请输入任务名称',
      filed: 'taskName'
    },
    {
      type: 'select',
      label: '任务类型',
      val: -1,
      defaultVal: -1,
      placeholder: '请选择任务类型',
      filed: 'taskType',
      selects: [
        {
          value: -1,
          label: '全部'
        },
        {
          label: '视频任务',
          value: 1
        },
        {
          label: '直播任务',
          value: 2
        },
        {
          label: '学习任务',
          value: 5
        }
      ]
    },
    {
      type: 'select',
      label: '成长等级',
      val: -1,
      defaultVal: -1,
      placeholder: '请选择成长等级',
      filed: 'level',
      selectDefultName: ['level', 'name'],
      selects: [
        {
          level: -1,
          name: '全部'
        }
      ].concat(store.state.user.employeeGrowthLevelList)
    },
    {
      type: 'select',
      label: '是否生效',
      val: -1,
      defaultVal: -1,
      placeholder: '请选择是否生效',
      filed: 'isValid',
      selects: [
        {
          label: '全部',
          value: -1
        },
        {
          label: '否',
          value: 0
        },
        {
          label: '是',
          value: 1
        }
      ]
    },
    {
      type: 'input',
      label: '任务标签',
      val: '',
      filed: 'tagName'
    }
  ],
  tableForm: {
    loading: false,
    listData: [],
    page: {
      index: 1,
      size: 10,
      total: 0
    }
  },
  selectIds: []
})

// 前往设置成长体系
// const toSetting = throttle(() => {
//   router.push({
//     path: '/content_market/growth_system'
//   })
// }, 700)
// 新建任务
const createTask = throttle(item => {
  router.push({
    path: '/content_market/growth_setting/create',
    query: {
      type: item,
      pageSource: 'growth'
    }
  })
}, 700)

// 复制任务
const copyTask = throttle(item => {
  router.push({
    path: '/content_market/growth_setting/create',
    query: {
      copyId: item.taskId,

      pageSource: 'growth'
    }
  })
}, 700)
// 查看/编辑任务
const editTask = throttle(item => {
  const query = { id: item.taskId, pageSource: 'growth' }
  // 生效中 有人参与  全都不能编辑
  if (item.isValid && item.joinCnt > 0) {
    query.disEdit = 1
  }
  // 生效中 无人参与 能编辑基础信息和任务指标
  if (item.isValid && item.joinCnt <= 0) {
    // query.disEditOther === '1' 只能编辑 基础信息 和任务指标
    query.disEditOther = 1
  }
  // 没有生效 有人参与 能编辑基础信息
  if (!item.isValid && item.joinCnt > 0) {
    // query.disEditOther === '2' 只能编辑基础信息
    query.disEditOther = 2
  }
  // 没有生效 无人参与 都可以编辑

  router.push({
    path: '/content_market/growth_setting/create',
    query: query
  })
}, 700)
// 查看数据

const toDetail = throttle(item => {
  router.push({
    path: '/content_market/growth_setting/detail',
    query: {
      itemId: item.taskId,
      type: item.taskType,
      pageSource: 'growth'
    }
  })
}, 700)
// 删除任务
const delTask = throttle(item => {
  ElMessageBox.confirm('任务删除不可恢复，请再次确认当前操作', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteTask({ taskId: item.taskId }).then(res => {
      ElMessage.success(res.msg)
      getList()
    })
  })
}, 700)

function getList() {
  const data = getQuery($data.searchComponents)
  data.pageNo = $data.tableForm.page.index
  data.pageSize = $data.tableForm.page.size
  growthTasks(data)
    .then(res => {
      $data.tableForm.listData = res.data.records || []
      $data.tableForm.page.total = res.data.total || 0
      $data.tableForm.loading = false
    })
    .catch(() => {
      $data.tableForm.loading = false
    })
}
// 清空查询参数
function clearSearchQuery() {
  $data.tableForm.loading = true
  $data.tableForm.page.index = 1
  $data.tableForm.page.size = 10
}
// 重置
function resetSearch() {
  clearSearchQuery()
  getList()
}

clearSearchQuery()
const xmSearchRef = ref(null)
const menuOfKeepAlive = inject('$menuOfKeepAlive')
onMounted(() => {
  xmSearchRef.value?.reset()
  resetSearch()
})
onActivated(() => {
  if (menuOfKeepAlive('judge')) {
    if (xmSearchRef.value) {
      xmSearchRef.value?.reset()
    } else {
      resetSearch()
    }
    menuOfKeepAlive('reset')
  } else {
    getList()
  }
})
// 查询
function searchList() {
  $data.tableForm.loading = true
  $data.tableForm.page.index = 1
  getList()
}
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}

.growth_task {
  .page_top {
    width: 100%;
    background: #ffffff;
    border-radius: 4px;

    .top_title {
      padding: 22px 24px 16px;
      border-bottom: 1px solid #dcdee0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      line-height: 26px;

      span {
        font-size: 14px;
        font-weight: 400;
        color: #909399;
        margin: 0 12px;
      }
    }

    .top_search {
      .xm_search {
        padding: 20px 24px 4px 24px;
      }
    }
  }

  .page_bottom {
    margin-top: 16px;
    background: #ffffff;
    border-radius: 4px;
    padding: 22px 24px;

    .create_box {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
      flex-wrap: wrap;
      margin-bottom: 24px;
      .create_btn + .create_btn {
        margin-left: 16px;
      }

      .one_create {
        margin: 0 20px 24px 0;
        min-width: 230px;
        background: #f6f8fa;
        border-radius: 2px;
        padding: 12px 16px 13px 14px;

        .one_create_title {
          width: 100%;
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          padding-bottom: 8px;
          margin-bottom: 8px;
          border-bottom: 1px solid #dcdee0;
          font-size: 16px;
          font-weight: 600;
          color: #303133;
          line-height: 26px;

          img {
            width: 20px;
            height: 20px;
            margin: 0 8px 0 2px;
            font-size: 16px;
            font-weight: 600;
            color: #303133;
            line-height: 26px;
          }
        }

        .one_create_mark {
          font-size: 14px;
          font-weight: 400;
          color: #909399;
          line-height: 20px;
          margin-bottom: 8px;
        }

        .one_create_btn {
          width: 100%;
          display: flex;
          flex-direction: row;
          justify-content: flex-end;
          align-items: center;

          .create_btn {
            min-height: 24px;
            width: 58px;
            height: 24px;
            background: #364fcd;
            border-radius: 2px;
            padding: 0;
          }
        }
      }
    }
  }
}

.btn_box {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;

  .one_btn_line {
    width: 1px;
    height: 14px;
    background: #dcdee0;
    margin: 0 10px;
  }
}
</style>
