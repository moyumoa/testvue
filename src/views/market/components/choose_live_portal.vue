<template>
  <div>
    <slot name="default">
      <el-button type="primary" @click="data.isShowDialog = true" v-if="!livePortalInfo">
        设置
      </el-button>
      <div class="selected" v-else>
        <span>【直播传送门】：{{ livePortalInfo.name }}</span>
        <el-icon style="cursor: pointer" @click="cancelSelect">
          <i-delete color="#f85151" />
        </el-icon>
      </div>
    </slot>

    <el-dialog v-model="data.isShowDialog" title="Tips" :width="950">
      <template #title>
        <div class="dialog_title">
          <span class="title">选择页面</span>
        </div>
      </template>
      <div class="page_link_dialog">
        <xm_search :searchComponents="data.searchComponents" @getData="searchList"></xm_search>
        <xm_table
          v-loading="data.loading"
          :data="data.tableData"
          tableType="avatar"
          v-model:page="data.page"
          @getTableData="getList"
          :pageSizes="[5, 10, 20]"
        >
          <el-table-column label="抖音信息" min-width="150">
            <template #default="{ row }">
              <div class="user_info">
                <img class="avatar" :src="row.headImg ? row.headImg : avatarImg" alt />
                <div class="info">
                  <div class="name">{{ row.name }}</div>
                  <div class="dy_num">抖音号：{{ row.dyId || '-' }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="uid" prop="uid"></el-table-column>
          <el-table-column label="创建时间" prop="gmtCreate"></el-table-column>
          <el-table-column label="操作" align="right">
            <template #default="scope">
              <el-link type="primary" @click="select(scope.row)">选择</el-link>
            </template>
          </el-table-column>
        </xm_table>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="data.isShowDialog = false">取消</el-button>
          <el-button type="primary" @click="data.isShowDialog = false">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import avatarImg from '@/assets/images/content_center/default_user.png'
import { getLivePoartalList } from '@/api/market/business_tools'

const props = defineProps({
  livePortalInfo: Object
})
const livePortalInfo = toRef(props, 'livePortalInfo')
const emits = defineEmits(['update:livePortalInfo'])
const data = reactive({
  isShowDialog: false,
  loading: false,
  searchComponents: [
    {
      type: 'input',
      label: '抖音昵称',
      val: '',
      filed: 'name',
      placeholder: '请输入抖音昵称'
    },
    {
      type: 'input',
      label: 'UID',
      val: '',
      filed: 'uid',
      placeholder: '请输入抖音UID'
    }
  ],
  searchParams: {},
  page: {
    index: 1,
    size: 5,
    total: 0
  },
  tableData: []
})

// 搜索
function searchList(searchData) {
  data.page.index = 1
  data.searchParams = searchData
  getList()
}

// 获取自定义页面列表
function getList() {
  data.loading = true
  const params = Object.assign(data.searchParams, {
    pageSize: data.page.size,
    pageNo: data.page.index
  })
  getLivePoartalList(params)
    .then(res => {
      data.tableData = res.data.records || []
      data.page.total = res.data.total || 0
    })
    .finally(() => {
      data.loading = false
    })
}

// 选择页面
function select(row) {
  emits('update:livePortalInfo', row)
  data.isShowDialog = false
}

// 取消选择
function cancelSelect() {
  emits('update:livePortalInfo', null)
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
:deep .el-dialog__header {
  padding: 0;
  border-bottom: 1px solid #eff1f4;
  .dialog_title {
    display: flex;
    align-items: center;
    height: 60px;
    padding: 0 24px;
    .title {
      font-size: 20px;
      color: #333;
      margin-right: 8px;
    }
  }
}
:deep .el-dialog__footer {
  border-top: 1px solid #eff1f4;
}
:deep .xm_search {
  padding: 0 0 8px 0;
}
.selected {
  display: flex;
  align-items: center;
  justify-content: space-between;
  line-height: 30px;
  padding: 0 12px;
  border-radius: 2px;
  border: 1px solid #dcdfe6;
  > span {
    @include mult_line(1);
  }
}
.page_link_dialog {
  .select_page_type {
    margin-top: 10px;
  }
}
.user_info {
  display: flex;
  align-items: center;
  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }
  .info {
    margin-left: 12px;
    .name {
      font-size: 14px;
      color: #303133;
      line-height: 17px;
      font-weight: bold;
    }
    .dy_num {
      margin-top: 4px;
      font-size: 12px;
      color: #909399;
      line-height: 17px;
    }
  }
}
</style>
