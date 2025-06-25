<template>
  <div class="page">
    <!-- 筛选条件 -->
    <xm_search
      :searchComponents="searchComponents"
      @getData="searchList"
      :useOwnReset="true"
      @reset="resetSearch"
    >
      <template #searchBtn>
        <el-button @click="createActivity" type="primary">新建活动</el-button>
      </template>
    </xm_search>

    <!-- 表单 -->
    <div class="page_main mt_16">
      <xm_table
        class="pic_table"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getActivityList"
      >
        <!-- 活动标题 -->
        <el-table-column label="活动标题" prop="activityTitle" min-width="150">
          <template v-slot="{ row }">
            <div>{{ row.activityTitle || '--' }}</div>
          </template>
        </el-table-column>
        <!-- 浏览次数 -->
        <!-- <el-table-column prop="deliverCount">
          <template #header>
            <div class="table_head" style="display: inline-block">
              浏览次数(PV)
              <el-tooltip effect="dark" placement="top">
                <template #content>活动详情页浏览次数</template>
                <img
                  style="width: 16px; height: 16px; vertical-align: -15%"
                  src="@/assets/images/operate/tip_gray.png"
                  alt
                />
              </el-tooltip>
            </div>
          </template>
          <template v-slot="{ row }">
            <div>{{ wanSliceFormat(row.deliverCount) || '--' }}</div>
          </template>
        </el-table-column> -->
        <!-- 独立访客数 -->
        <!-- <el-table-column prop="deliverCount">
          <template #header>
            <div class="table_head" style="display: inline-block">
              独立访客数(UV)
              <el-tooltip effect="dark" placement="top">
                <template #content>活动详情页的独立访客数</template>
                <img
                  style="width: 16px; height: 16px; vertical-align: -15%"
                  src="@/assets/images/operate/tip_gray.png"
                  alt
                />
              </el-tooltip>
            </div>
          </template>
          <template v-slot="{ row }">
            <div>{{ wanSliceFormat(row.deliverCount) || '--' }}</div>
          </template>
        </el-table-column> -->
        <!-- 获客数 -->
        <el-table-column label="线索数" prop="appointNum" align="center">
          <template v-slot="{ row }">
            <div>{{ wanSliceFormat(row.appointNum) || '--' }}</div>
          </template>
        </el-table-column>
        <!-- 创建时间 -->
        <el-table-column label="创建时间" min-width="150">
          <template #default="scope">
            <div>{{ scope.row.createTime || '--' }}</div>
          </template>
        </el-table-column>
        <!-- 活动状态 -->
        <el-table-column label="活动状态" align="center">
          <template #default="scope">
            <div>{{ scope.row.statusName || '--' }}</div>
          </template>
        </el-table-column>
        <!-- 操作 -->
        <el-table-column label="操作" align="right" min-width="110">
          <template #default="scope">
            <template v-if="scope.row.status === 1">
              <el-link type="primary" class="ml_16" @click="edit(scope.row)">查看</el-link>
              <el-link type="primary" class="ml_16" @click="updateStatus(scope.row, 0)">
                关闭
              </el-link>
            </template>
            <template v-else>
              <el-link type="primary" class="ml_16" @click="updateStatus(scope.row, 1)">
                开启
              </el-link>
              <el-link type="primary" class="ml_16" @click="edit(scope.row)">编辑</el-link>
              <el-link type="danger" class="ml_16" @click="del(scope.row, 2)">删除</el-link>
            </template>
          </template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>

<script setup>
import { pageList } from './model/get_list.js'
import { useRouter } from 'vue-router'
import { throttle, wanSliceFormat } from '@/utils/tools.js'
import { ElMessageBox } from 'element-plus'
import { updateAppointmentStatus, deleteAppointmentById } from '@/api/market/business_tools.js'
const message = inject('$message')
const { searchComponents, tableForm, getActivityList } = pageList()

// 查询
const searchList = throttle(function (val) {
  tableForm.loading = true
  tableForm.page.index = 1
  getActivityList()
}, 500)
searchList()
// 重置
const resetSearch = throttle(function () {
  tableForm.loading = true
  tableForm.page.index = 1
  tableForm.page.size = 10
  getActivityList()
}, 500)
// 创建活动 (跳转到创建活动页面)
const router = useRouter()
function createActivity() {
  router.push({
    path: '/content_market/online_booking/create_activity'
  })
}
// 更新活动状态
function updateStatus(data, type) {
  console.log(data, type)
  const id = data.activityId
  const status = type
  const text =
    type === 0
      ? '关闭后活动页面将不展示，用户不可参与活动，是否确认关闭活动？'
      : '开启后活动页面将正常展示，用户可正常参与活动，是否确认开启活动？'
  ElMessageBox.confirm(text, '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    center: true
  })
    .then(async () => {
      console.log(id)
      const res = await updateAppointmentStatus({ id, status })
      message({ type: 'success', message: '状态更新成功' })
      searchList()
      console.log(res)
    })
    .catch(() => {})
}
// 编辑活动
function edit(row) {
  const id = row.activityId
  router.push({
    path: '/content_market/online_booking/create_activity',
    query: {
      id
    }
  })
}
// 删除活动
function del(row) {
  console.log(row)
  const activityId = row.activityId
  ElMessageBox.confirm('删除活动不可恢复，是否确认删除?', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    center: true
  })
    .then(async () => {
      const res = await deleteAppointmentById(activityId)
      message({ type: 'success', message: '删除成功' })
      searchList()
      console.log(res)
    })
    .catch(() => {})
}
</script>

<style lang="scss" scoped>
:deep(.el-message-box__message p) {
  text-align: left;
}
</style>
