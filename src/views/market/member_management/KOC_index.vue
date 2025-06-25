<template>
  <div>
    <xm_search
      useOwnReset
      :searchComponents="data.searchComponents"
      @getData="searchList"
      @reset="resetList"
    >
      <template #searchBtn>
        <exp_button :asyncFunc="exportListFile">导出</exp_button>
      </template>
    </xm_search>

    <div class="page_main mt_16">
      <div class="page_btns">
        <el-button type="primary" @click="openAddDialog">邀请</el-button>
      </div>
      <xm_table
        tableType="avatar"
        v-loading="data.loading"
        :data="data.tableData"
        v-model:page="data.page"
        @getTableData="getList"
      >
        <el-table-column label="用户信息" prop="name" min-width="170">
          <template #default="{ row }">
            <table_column_matrix_account
              :info="row"
              showPhone
              :showDyNum="false"
            ></table_column_matrix_account>
          </template>
        </el-table-column>
        <el-table-column label="运营矩阵号" prop="operator" width="190" v-if="false">
          <template #default="{ row }">
            <div class="photos" v-if="row.operator && row.operator.length > 0">
              <template v-for="(item, index) in row.operator" :key="item.operatorId">
                <el-tooltip
                  v-if="index < 3"
                  effect="dark"
                  :content="item.authAccountName"
                  placement="top"
                >
                  <div class="photos_item" :class="{ g_failure: isInvalid(item) }">
                    <img :src="item.authAccountPhoto" alt />
                    <div
                      :class="[`xm_platformIcon_${item.platform}`]"
                      style="width: 16px; height: 16px"
                    ></div>
                  </div>
                </el-tooltip>
              </template>
              <div
                class="photo_more flex_center"
                @click="openOtherAccount(row.operator)"
                v-if="row.operator.length > 3"
              >
                +{{ row.operator.length - 3 }}
              </div>
            </div>
            <template v-else>--</template>
          </template>
        </el-table-column>
        <el-table-column label="抖音授权状态" min-width="150">
          <template #default="{ row }">
            <div class="ellipsis table_ellipsis" style="-webkit-line-clamp: 2">
              <div style="display: flex; align-items: center">
                <span
                  class="status status-2"
                  :class="{
                    'status-2': row.dyAuthStatus === 0,
                    'status-3': row.dyAuthStatus === 1,
                    'status-4': row.dyAuthStatus === 2
                  }"
                ></span>
                {{ row.dyAuthStatusStr }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="视频号授权状态" min-width="150">
          <template #default="{ row }">
            <div class="ellipsis table_ellipsis" style="-webkit-line-clamp: 2">
              <div style="display: flex; align-items: center">
                <span
                  class="status status-2"
                  :class="{
                    'status-2': row.wxAuthStatus === 0,
                    'status-3': row.wxAuthStatus === 1,
                    'status-4': row.wxAuthStatus === 2
                  }"
                ></span>
                {{ row.wxAuthStatusStr || '未授权' }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="小红书授权状态" min-width="150">
          <template #default="{ row }">
            <div class="ellipsis table_ellipsis" style="-webkit-line-clamp: 2">
              <div style="display: flex; align-items: center">
                <span
                  class="status status-2"
                  :class="{
                    'status-2': row.xhsAuthStatus === 0,
                    'status-3': row.xhsAuthStatus === 1,
                    'status-4': row.xhsAuthStatus === 2
                  }"
                ></span>
                {{ row.xhsAuthStatusStr || '未授权' }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="快手授权状态" min-width="150">
          <template #default="{ row }">
            <div class="ellipsis table_ellipsis" style="-webkit-line-clamp: 2">
              <div style="display: flex; align-items: center">
                <span
                  class="status status-2"
                  :class="{
                    'status-2': row.ksAuthStatus === 0,
                    'status-3': row.ksAuthStatus === 1,
                    'status-4': row.ksAuthStatus === 2
                  }"
                ></span>
                {{ row.ksAuthStatusStr || '未授权' }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="粉丝数" min-width="100">
          <template #default="{ row }">
            <div>
              {{ row.fansNum === null ? '--' : wanSliceFormat(row.fansNum) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="金币余额" min-width="100">
          <template #default="{ row }">
            <div>{{ row.gold || 0 }}</div>
          </template>
        </el-table-column>
        <el-table-column label="加入时间" width="160">
          <template #default="{ row }">
            <div>{{ row.joinTime || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <span class="table_point" v-if="row.isValid === 1">已启用</span>
            <span class="table_point reverse" v-else>已禁用</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="right" width="220" fixed="right">
          <template #default="scope">
            <div class="table_btn">
              <el-link type="primary" @click="showDynamicDialog(scope.row)">成员动态</el-link>
              <el-link
                style="margin: 0 12px"
                class="one_btn"
                type="primary"
                @click="disableTalent(scope.row)"
              >
                {{ scope.row.isValid === 1 ? '禁用' : '启用' }}
              </el-link>
              <el-link class="one_btn" type="primary" @click="showUpdateGoldDialog(scope.row)">
                变更金币
              </el-link>
            </div>
          </template>
        </el-table-column>
      </xm_table>
    </div>
    <update-gold-dialog
      v-if="data.showDialog"
      v-model:showDialog="data.showDialog"
      :info="data.updateGoldInfo"
      @success="getList"
    ></update-gold-dialog>
    <addKOCDialog v-if="data.showAddDialog" v-model:showDialog="data.showAddDialog"></addKOCDialog>
    <!-- 成员动态 -->
    <memberDynamicDialog v-if="memberDynamicInfo.show" :dynamicDialog="memberDynamicInfo" />
    <!--运营矩阵号全部弹窗    -->
    <el-dialog
      v-model="showAllDialog"
      custom-class="hide_footer_line "
      title="运营矩阵号"
      width="300px"
    >
      <div class="photos_dialog">
        <div class="photo_item" v-for="item in accountList" :key="item.operatorId">
          <div :class="{ g_failure: isInvalid(item) }" style="position: relative" class="big">
            <img :src="item.authAccountPhoto" alt />
            <div
              :class="[`xm_platformIcon_${item.platform}`]"
              style="width: 20px; height: 20px"
            ></div>
          </div>
          <span style="margin-left: 16px">{{ item.authAccountName }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import memberDynamicDialog from './components/member_dynamic_dialog.vue'
import { throttle, wanSliceFormat } from '@/utils/tools.js'
import { getQuery } from '@/utils/get_query.js'
import { getMemberMangeList, exporMemberMangementFile } from '@/api/market/operate_analysis.js'
import { changeUserInfo } from '@/api/system_setting/account.js'
import updateGoldDialog from './components/update_gold_dialog.vue'
import addKOCDialog from './components/add_KOC_dialog.vue'
import { exportFileV2 } from '@/utils/exportFile'
import { ElMessageBox, ElMessage } from 'element-plus'
import { getKOCInfo } from '@/utils/doLogin'

const data = reactive({
  showAddDialog: false,
  showDialog: false,
  updateGoldInfo: {},
  searchComponents: [
    {
      type: 'input',
      label: '用户姓名',
      val: '',
      filed: 'name',
      placeholder: '请输入用户姓名'
    },
    {
      type: 'select',
      label: '成员状态',
      val: null,
      filed: 'isValid',
      selects: [
        {
          label: '已启用',
          value: 1
        },
        {
          label: '已禁用',
          value: 0
        }
      ]
    }
  ],
  tableData: [],
  loading: false,
  page: {
    index: 1,
    size: 10,
    total: 0
  },
  searchParams: {}
})
// 显示全部运营矩阵号信息
// 矩阵号是否授权有效
const isInvalid = item => {
  // （0：未授权，1：已授权，2：授权失败）
  if ([1, 2, 3, 4].indexOf(item.platform) === -1) return true
  const authKey = {
    1: 'dyAuth',
    2: 'wxAuth',
    3: 'xhsAuth',
    4: 'dyAuth'
  }
  return item[authKey[item.platform]] === 2
}
function openAddDialog() {
  data.showAddDialog = true
}

// 搜索
function searchList(searchData) {
  data.searchParams = searchData
  data.page.index = 1
  getList()
}

function resetList() {
  data.loading = true
  data.page.index = 1
  data.searchParams = {}
  getList()
}

function getList() {
  data.loading = true
  const searchQuery = getQuery(data.searchComponents)
  const params = Object.assign(searchQuery, {
    pageSize: data.page.size,
    pageNum: data.page.index,
    staffType: 2
  })
  getMemberMangeList(params)
    .then(res => {
      data.tableData = res.data.records.map(e => {
        e.gold = e.gold || 0
        e.phone = e.phoneNum
        if (e.deptInfo) {
          const depList = e.deptInfo.split('|')
          e.allDepList = depList
          e.depList = depList.length > 2 ? depList.slice(0, 2) : depList
        }
        return e
      })
      data.page.total = res.data.total || 0
    })
    .finally(() => {
      data.loading = false
    })
}

function showUpdateGoldDialog(row) {
  data.showDialog = true
  data.updateGoldInfo = row
}
function exportListFile() {
  const searchQuery = getQuery(data.searchComponents)
  const params = Object.assign({ staffType: 2 }, searchQuery)
  return exportFileV2(exporMemberMangementFile, params, 'KOC数据', 'xlsx')
}

function disableTalent(e) {
  ElMessageBox.confirm(
    '是否确定' + (e.isValid === 1 ? '禁用' : '启用') + '该KOC用户？',
    '系统提醒',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      changeUserInfo({ userBrandId: e.userBrandId }).then(res => {
        ElMessage.success('操作成功')
        getList()
      })
    })
    .catch(() => {
      // catch error
    })
}

onMounted(() => {
  resetList()
  getKOCInfo()
})
// 显示成员动态的弹窗
const memberDynamicInfo = reactive({
  show: false
})
const showDynamicDialog = throttle(e => {
  memberDynamicInfo.userId = e.userId
  memberDynamicInfo.show = true
}, 300)

const showAllDialog = ref(false)
const accountList = ref([])
// 预览其余矩阵号
const openOtherAccount = list => {
  accountList.value = list
  showAllDialog.value = true
}
</script>

<style lang="scss" scoped>
.part_name {
  @include mult_line(1);
}

.account_info {
  display: flex;
  align-items: center;
  img {
    margin-left: 8px;
    width: 16px;
    height: 16px;
  }
}

:deep(.page_main .el-tooltip__trigger) {
  display: inline-block !important;
}
.switch_box {
  width: 100%;
  height: 72px;
  background: #ffffff;
  border-radius: 4px;
  padding: 16px 24px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 16px;
  box-sizing: border-box;
  .switch_title {
    font-size: 16px;
    font-weight: 400;
    color: #323233;
    line-height: 20px;
    margin-right: 24px;
  }
  .switch_mark {
    margin-left: 11px;
    font-size: 12px;
    font-weight: 400;
    color: #909399;
    line-height: 20px;
  }
}
.page_btns {
  display: flex;
}

.photos {
  display: flex;
  .photos_item {
    margin-right: 6px;
    position: relative;
    > img {
      width: 32px;
      height: 32px;
      object-fit: cover;
      border-radius: 50%;

      vertical-align: middle;
    }
    &.main {
      position: relative;
      border: 1px solid $theme_color;
      border-radius: 50%;
      // &:after {
      //   content: '主';
      //   display: flex;
      //   justify-content: center;
      //   align-items: center;
      //   width: 20px;
      //   height: 20px;
      //   background: #364fcd;
      //   border-radius: 50%;
      //   position: absolute;
      //   bottom: 0;
      //   right: -6px;
      //   color: #fff;
      //   font-size: 12px;
      // }
    }
    .fs_icon {
      position: absolute;
      width: 14px;
      height: 14px;
      bottom: 0;
      left: 22px;
    }
  }

  .photo_more {
    width: 32px;
    height: 32px;
    background: #eff2f8;
    border-radius: 50%;
    font-weight: 500;
    color: #364fcd;
    font-size: 12px;
    cursor: pointer;
  }
}
// 弹框样式
.photos_dialog {
  display: flex;
  flex-direction: column;
  .photo_item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    img {
      width: 48px;
      height: 48px;
      border-radius: 50%;
    }
  }
}

.status {
  font-size: 5px;
  margin-right: 4px;
  display: inline-block;
  width: 4px;
  height: 4px;
  border-radius: 50%;
}

.status-2 {
  background-color: rgba(144, 147, 153, 1);
}

.status-3 {
  background-color: rgba(81, 248, 139, 1);
}

.status-4 {
  background-color: rgba(248, 81, 81, 1);
}
</style>
