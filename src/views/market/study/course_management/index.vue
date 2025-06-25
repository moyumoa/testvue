<template>
  <div class="table_wrapper">
    <el-tabs
      class="tab_box hide_underline"
      v-if="!judgeOEA()"
      v-model="$data.chooseTab"
      @tab-click="resetSearch"
    >
      <el-tab-pane
        v-for="(tab, i) in $data.tabList"
        :key="i"
        :label="tab.label"
        :name="tab.name"
      ></el-tab-pane>
    </el-tabs>
    <xm_search
      :searchComponents="$data.searchComponents"
      @getData="searchList"
      :useOwnReset="true"
      @reset="resetSearch"
    ></xm_search>
    <div class="page_main mt_16">
      <div class="page_btns">
        <el-button type="primary" @click="toCreateCourse">创建课程</el-button>
      </div>
      <div class="table_content" v-loading="$data.loading">
        <div class="list">
          <div
            class="item"
            v-for="(item, index) in $data.list"
            :key="index"
            @click="toCourseDetail(item)"
          >
            <img
              v-if="item.brandId == 1"
              class="com_icon"
              src="https://tagvv-1256030678.file.myqcloud.com/20220524m7co2.png"
            />
            <img class="cover" :src="item.cover" />
            <div class="course_info">
              <div class="name">{{ item.name }}</div>
              <div class="desc">{{ item.description }}</div>
            </div>
            <div class="course_footer">
              <div class="total_num">共{{ item.courseContentVOList.length }}节</div>
              <span @click.stop v-if="item.brandId != 1">
                <el-dropdown trigger="click" size="small" @command="onCommand($event, item)">
                  <div class="drop_btn"></div>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="edit">&nbsp;编辑&nbsp;</el-dropdown-item>
                      <el-dropdown-item divided command="delete">&nbsp;删除&nbsp;</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </span>
            </div>
          </div>
        </div>
        <el-empty description="暂无课程" v-if="!$data.loading && !$data.list.length" />
      </div>
      <div class="xm_table_page">
        <el-pagination
          v-model:current-page="$data.pageIndex"
          background
          layout="total, prev, pager, next , jumper"
          :total="$data.page.total"
          :page-size="$data.page.size"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        ></el-pagination>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { getCourseList, deleteCourse } from '@/api/market/course'
import { getQuery } from '@/utils/get_query.js'
const judgeOEA = inject('$judgeOEA')
const router = useRouter()
const $data = reactive({
  chooseTab: judgeOEA() ? '0' : -1,
  tabList: [
    {
      label: '全部',
      name: -1
    },
    {
      label: '企业课程',
      name: '0'
    },
    {
      label: '星麦精选',
      name: '1'
    }
  ],
  searchComponents: [
    {
      type: 'input',
      label: '课程名称',
      val: '',
      filed: 'name'
    }
  ],
  loading: true,
  choosedTemplate: {},
  list: [],
  page: {
    index: 1,
    size: 16,
    total: 0
  },
  pageIndex: 1
})

function getList() {
  $data.loading = true
  const queryParam = getQuery($data.searchComponents)
  queryParam.pageSize = $data.page.size
  queryParam.pageNo = $data.page.index
  queryParam.source = $data.chooseTab === -1 ? null : $data.chooseTab
  getCourseList(queryParam)
    .then(res => {
      $data.list = res.data.records || []
      $data.page.total = res.data.total
    })
    .finally(() => {
      $data.loading = false
    })
}

function searchList() {
  $data.page.index = 1
  $data.pageIndex = 1
  getList()
}

function resetSearch() {
  $data.loading = true
  $data.page.index = 1
  $data.pageIndex = 1
  $data.page.size = 16
  getList()
}

function handleCurrentChange(val) {
  $data.page.index = val
  getList()
}

function handleSizeChange(val) {
  $data.page.index = 1
  $data.pageIndex = 1
  $data.page.size = val
  getList()
}

function toCreateCourse() {
  router.push('/content_market/course_management/edit_course')
}
// 下拉操作
function onCommand(command, item) {
  if (command === 'edit') {
    editCourse(item)
  } else if (command === 'delete') {
    delCourse(item)
  }
}
// 跳转课程详情
function toCourseDetail(item) {
  router.push({
    path: '/content_market/course_management/course_detail',
    query: {
      id: item.id
    }
  })
}
// 编辑课程
function editCourse(item) {
  router.push({
    path: '/content_market/course_management/edit_course',
    query: {
      id: item.id
    }
  })
}
// 删除课程
function delCourse(item) {
  ElMessageBox.confirm(`删除课程后，课程下的所有视频都将被删除！`, '系统提醒', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteCourse({ id: item.id }).then(res => {
      ElMessage.success('删除成功')
      getList()
    })
  })
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.page_main {
  padding-right: 4px;
  .table_content {
    .list {
      display: flex;
      flex-wrap: wrap;
      .item {
        position: relative;
        cursor: pointer;
        box-sizing: border-box;
        width: 184px;
        height: 261px;
        margin-right: 20px;
        margin-bottom: 20px;
        padding: 12px;
        background: #f6f8fa;
        border-radius: 4px;
        font-size: 0;
        .com_icon {
          position: absolute;
          top: 0;
          left: 0;
          width: 52px;
          height: 52px;
        }
        .cover {
          width: 160px;
          height: 160px;
          object-fit: cover;
          border-radius: 2px;
        }
        .course_info {
          margin-top: 10px;
          .name {
            @include mult_line(1);
            line-height: 20px;
            font-size: 14px;
            font-weight: bold;
            color: #303133;
          }
          .desc {
            @include mult_line(1);
            margin-top: 2px;
            font-size: 12px;
            color: #606266;
            height: 17px;
            line-height: 17px;
          }
        }
        .course_footer {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
          .total_num {
            line-height: 20px;
            padding: 0 4px;
            font-size: 12px;
            border-radius: 2px;
            color: #606266;
            background: #eaedf0;
          }
          .drop_btn {
            cursor: pointer;
            width: 20px;
            height: 20px;
            background-image: url('https://tagvv-1256030678.file.myqcloud.com/20220517xexmh.png');
            background-size: cover;
            &:active {
              background-color: #eaedf0;
            }
          }
        }
      }
    }
  }
}
.xm_table_page {
  display: flex;
  justify-content: flex-end;
}
.table_wrapper {
  // min-width: 1310px;
  :deep(.el-tabs__header) {
    padding: 16px 24px 0 24px;
    background-color: #fff;
    border-radius: 5px;
  }
  :deep(.el-tabs__item.is-active) {
    color: #303133;
    font-weight: 600;
  }
}
</style>
