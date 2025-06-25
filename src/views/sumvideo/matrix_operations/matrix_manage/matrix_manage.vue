<template>
  <div class="matrix_manage">
    <div class="m_left">
      <selectMatrix origin="sumvideo" @updateTableInfo="updateTableInfo" />
    </div>
    <div class="m_right_warp">
      <div class="m_right">
        <div class="m_right_top_info">
          <div class="top_info_l">
            <span class="group_name">{{ titleName }}</span>
            <span class="num_warp">
              约
              <span class="num">{{ tableState.page.total || 0 }}</span>
              个
            </span>
          </div>
          <div class="top_info_r">
            <el-dropdown popper-class="xm_dropDown">
              <el-button type="primary">
                授权矩阵号
                <el-icon class="el-icon--right">
                  <i-arrow-down />
                </el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <!-- <el-dropdown-item @click="openAuth(1)">
                    授权抖音个人号/普通企业号（非蓝V）
                  </el-dropdown-item> -->
                  <el-dropdown-item @click="openAuth(2)">授权抖音号</el-dropdown-item>
                  <!-- <el-dropdown-item @click="openAuth(3)">授权员工号</el-dropdown-item> -->
                  <el-dropdown-item @click="openAuth(4)">授权小红书</el-dropdown-item>
                  <el-dropdown-item @click="openAuth(5)">授权快手号</el-dropdown-item>
                  <el-dropdown-item @click="openAuth(6)">授权视频号</el-dropdown-item>
                  <!-- <el-dropdown-item @click="openAuth(7)">授权机构号</el-dropdown-item> -->
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button style="margin-left: 18px" type="primary" @click="showAuthDialog">
              批量授权
            </el-button>
          </div>
        </div>
        <!-- 列表 -->
        <xm_table
          class="matrix_table"
          :maxTableHeight="tableHeight"
          :data="tableState.listData"
          v-loading="tableState.loading"
          v-model:page="tableState.page"
          @getTableData="getList"
        >
          <el-table-column min-width="450" label="矩阵号">
            <template #default="scope">
              <div class="account_wrap" style="padding: 10px 0">
                <div class="avatar_wrap">
                  <img
                    class="avatar_icon"
                    :src="scope.row.dyHeadUrl ? scope.row.dyHeadUrl : avatarImg"
                    alt=""
                  />
                  <table_column_private_account
                    style="z-index: 10"
                    v-if="scope.row.privacyAccountStatus === 1"
                  ></table_column_private_account>
                  <el-tooltip
                    effect="dark"
                    v-if="scope.row.dyAuth == 2 || scope.row.wxAuth == 2 || scope.row.xhsAuth == 2"
                    placement="top-start"
                  >
                    <template #content>
                      <div style="max-width: 300px">
                        <span v-if="scope.row.dyAuth == 2 && scope.row.platform == 1">
                          {{ scope.row.dyAuth == 2 ? '抖音授权失效' : '' }}
                        </span>
                        <span v-if="scope.row.wxAuth == 2 && scope.row.platform == 2">
                          {{ scope.row.wxAuth == 2 ? '视频号授权失效' : '' }}
                        </span>
                        <span v-if="scope.row.xhsAuth == 2 && scope.row.platform == 3">
                          {{ scope.row.xhsAuth == 2 ? '小红书授权失效' : '' }}
                        </span>
                        <span v-if="scope.row.dyAuth == 2 && scope.row.platform == 4">
                          {{ scope.row.dyAuth == 2 ? '快手授权失效' : '' }}
                        </span>
                      </div>
                    </template>
                    <img
                      class="expired_img"
                      src="@/assets/images/content_center/warning_icon.png"
                      alt=""
                    />
                  </el-tooltip>
                  <!-- 平台icon -->
                  <div :class="`xm_platformIcon_${scope.row.platform}`"></div>
                </div>
                <div class="account_info">
                  <div>
                    <span>{{ scope.row.dyNickname ? scope.row.dyNickname : '--' }}</span>

                    <template v-if="scope.row.eaccountRole">
                      <el-tooltip effect="dark" placement="top">
                        <template #content>
                          <div style="max-width: 300px">
                            {{
                              scope.row.eaccountRole === 'EAccountM'
                                ? '普通企业号'
                                : scope.row.eaccountRole === 'EAccountS'
                                ? '认证企业号'
                                : '认证企业号'
                            }}
                          </div>
                        </template>
                        <img :src="getTypeImg(scope.row.eaccountRole)" alt="" />
                      </el-tooltip>
                    </template>
                    <template v-else>
                      <el-tooltip v-if="scope.row.enterpriseType" effect="dark" placement="top">
                        <template #content>
                          <div style="max-width: 300px">
                            {{
                              scope.row.enterpriseType === 'EAccountS'
                                ? '员工号-认证企业号'
                                : '员工号-认证企业号'
                            }}
                          </div>
                        </template>
                        <img
                          :src="
                            getTypeImg(
                              scope.row.enterpriseType === 'EAccountS'
                                ? 'EAccountEmployeeS'
                                : 'EAccountEmployeeK'
                            )
                          "
                          alt=""
                        />
                      </el-tooltip>
                    </template>
                    <!-- 分组名 -->
                    <div class="group_list">
                      <template v-for="(item, index) in scope.row.accountGroupList">
                        <template v-if="index < 3">
                          <div
                            class="new_group_name line-hidden1"
                            :key="index"
                            v-if="DYEmployeeType.indexOf(item.groupValue) == -1"
                          >
                            {{ item.groupName }}
                          </div>
                          <el-tooltip
                            v-else
                            class="box-item"
                            effect="dark"
                            placement="top"
                            :key="index + 'x'"
                          >
                            <template #content>
                              <div style="max-width: 300px">
                                所属企业号：{{ scope.row.enterpriseOpenNickname || '--' }}
                              </div>
                            </template>
                            <div class="new_group_name line-hidden1">
                              {{ item.groupName }}
                            </div>
                          </el-tooltip>
                        </template>
                      </template>
                    </div>
                    <el-tooltip
                      class="box-item"
                      effect="dark"
                      placement="top"
                      v-if="scope.row.accountGroupList && scope.row.accountGroupList.length > 3"
                    >
                      <!-- popper-class="tooltip-class" -->

                      <template #content>
                        <div class="group_box">
                          <span
                            v-for="(item, index) in scope.row.accountGroupList"
                            :key="index"
                            class="new_group_name"
                          >
                            {{ item.groupName }}
                          </span>
                        </div>
                      </template>
                      <div style="margin-left: 8px">...</div>
                    </el-tooltip>
                  </div>
                  <!-- 各个平台显示对应的账号 -->
                  <p v-if="scope.row.platform != 1">
                    <span>
                      {{
                        `${PLATFORM.getCN(scope.row.platform)}${
                          scope.row.platform == 2 || scope.row.platform == 3 ? '' : '号'
                        }`
                      }}：{{ scope.row.dyDisplayId ? scope.row.dyDisplayId : '--' }}
                    </span>
                    <!-- 小红书增加专业号标识 -->
                    <span
                      class="xm_xhsZYH"
                      v-if="
                        scope.row.platform == 3 &&
                        scope.row.customerUserType &&
                        scope.row.customerUserType == 'BUSINESS'
                      "
                    ></span>
                  </p>
                  <p v-else>
                    <span>抖音号：{{ scope.row.dyDisplayId ? scope.row.dyDisplayId : '--' }}</span>
                  </p>
                  <!-- 绑定poi -->
                  <p class="poi_warp">
                    <el-tooltip
                      effect="dark"
                      placement="right-start"
                      :content="scope.row.poiName"
                      :disabled="!scope.row.poiName"
                    >
                      <span class="poi_name">绑定POI：{{ scope.row.poiName || '-' }}</span>
                    </el-tooltip>
                  </p>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column min-width="120" label="发布视频数">
            <template #header>
              <div class="column_header">
                <span>发布视频数</span>
                <el-tooltip
                  popper-class="tooltip-class"
                  placement="top"
                  :style="{ 'margin-left': '4px' }"
                >
                  <template #content>
                    <p>通过系统发布的视频数量</p>
                  </template>
                  <img
                    src="@/assets/images/operate/tip_line.png"
                    style="width: 12px; height: 12px; margin-left: 8px"
                  />
                </el-tooltip>
              </div>
            </template>

            <template #default="scope">
              {{ wanSliceFormat(scope.row.videosCount) || 0 }}
            </template>
          </el-table-column>
          <el-table-column label="播放数">
            <template #default="scope">
              {{ wanSliceFormat(scope.row.playCount) || 0 }}
            </template>
          </el-table-column>
          <el-table-column label="点赞数">
            <template #default="scope">
              {{ wanSliceFormat(scope.row.diggCount) || 0 }}
            </template>
          </el-table-column>
          <el-table-column label="评论数">
            <template #default="scope">
              {{ wanSliceFormat(scope.row.commentCount) || 0 }}
            </template>
          </el-table-column>
          <el-table-column label="分享数">
            <template #default="scope">
              {{ wanSliceFormat(scope.row.shareCount) || 0 }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center" header-align="center">
            <template #default="scope">
              <el-link
                type="primary"
                @click="changePOI(scope.row)"
                v-if="scope.row.platform == 1 || scope.row.platform == 3"
              >
                {{ scope.row.poiId ? '更换POI' : '绑定POI' }}
              </el-link>
              <span v-else>-</span>
            </template>
          </el-table-column>
        </xm_table>
      </div>
    </div>
    <!-- 更改poi弹窗 -->
    <changePoiDom
      v-if="changePOiInfo.show"
      :show="changePOiInfo.show"
      :info="changePOiInfo"
      @updatePoi="updatePoi"
      @close="closeChangePoiDom"
    />
    <!-- 授权员工号弹窗 -->
    <authDOM v-if="authDialog.show" :authDialog="authDialog" @updateFun="updateFun" />
    <!-- 授权小红书弹窗 -->
    <authDOMXhs v-if="authDialogXhs.show" :authDialog="authDialogXhs" @updateFun="updateFun" />
    <!-- 授权快手弹窗 -->
    <authDOMKs v-if="authDialogKs.show" :authDialog="authDialogKs" @updateFun="updateFun" />
    <!-- 授权视频号弹窗 -->
    <authDOMSph v-if="authDialogSph.show" :authDialog="authDialogSph" @updateFun="updateFun" />
    <!-- 机构号管理 -->
    <mcnManagement v-if="mcnInfo.show" :mcnDialog="mcnInfo" @updateInfo="updateFun" />
    <confirm-dialog
      v-model:visible="dialog.confirmVisible"
      tip="确认是否已授权?"
      @confirm="operationSuccessFun"
    />
    <!-- 批量授权弹窗 -->
    <batchAuthDOM v-if="batchAuthDialog.show" :batchAuthDialog="batchAuthDialog" />
    <!--授权消耗弹框  -->
    <AuthCostDialog
      v-if="costDialog.show"
      :dialogInfo="costDialog"
      @auth="authFun(costDialog.type)"
    />
  </div>
</template>

<script setup>
import AuthCostDialog from '@/views/system/authorization/components/accountCostWarn_dialog.vue'

import batchAuthDOM from '../components/batchAuth_dialog.vue'
import selectMatrix from '@/views/sumvideo/components/matrix/select_matrix.vue'
import changePoiDom from '@/views/sumvideo/components/matrix/changePoi.vue'
import authDOM from '@/views/system/authorization/components/authEmployee_dialog.vue'
import authDOMXhs from '@/views/system/authorization/components/authXHS_dialog.vue'
import authDOMKs from '@/views/system/authorization/components/authKS_dialog.vue'
import authDOMSph from '@/views/system/authorization/components/authSPH_dialog.vue'
import confirmDialog from '@/views/system/authorization/components/confirm_dialog.vue'
import mcnManagement from '@/views/system/authorization/components/mcn_management/index.vue'

import { useAccountAuth } from '@/views/system/authorization/model/use_account_auth.js'
import { debounce, throttle, wanSliceFormat } from '@/utils/tools.js'
import { updateAccountPoiData, listAccountBySumVideo } from '@/api/sumvideo/matrix_manage.js'
import { PLATFORM } from '@/utils/dictionary/company.js'
import { listWxMcnAuths } from '@/api/system_setting/authorization.js'
// import api from '@/api/content_center/content_matrix.js'

// 图片
import avatarImg from '@/assets/images/content_center/default_user.png'
import matrixTyped from '@/assets/images/content_center/matrix_typed1.png'
import matrixTypep from '@/assets/images/content_center/matrix_typep1.png'
import matrixTyper from '@/assets/images/content_center/matrix_typer1.png'
import matrixEmployee from '@/assets/images/content_center/matrix_employee.png'

const { addAuth, state, checkCanAuthorize, accountDataAuthHide } = useAccountAuth()
const { dialog } = toRefs(state)
const message = inject('$message')
const tableState = reactive({
  loading: true,
  listData: [], // 列表数据
  page: {
    index: 1,
    size: 10,
    total: 0
  },
  groupIds: [],
  platform: ''
})
// 员工号的类型数组
const DYEmployeeType = ['EAccountEmployeeS', 'EAccountEmployeeK']

const titleName = ref('') // 右边显示的分组名称
// 更改POI
const changePOiInfo = reactive({
  show: false,
  platform: 1, // 1抖音poi 2小红书poi
  info: {} // 更改时信息
})
// 授权员工号
const authDialog = reactive({
  show: false
})
// 授权小红书
const authDialogXhs = reactive({
  show: false
})
// 授权快手
const authDialogKs = reactive({
  show: false
})
// 授权视频号
const authDialogSph = reactive({
  show: false
})
// 机构号管理信息--
const mcnInfo = reactive({
  num: null, // 机构号数量
  show: false
})

// 获取对应类型的图片
function getTypeImg(type) {
  let img = ''
  switch (type) {
    case 'PERSONAL':
      img = matrixTyped
      break
    case 'EAccountM':
      img = matrixTypep
      break
    case 'EAccountS':
      img = matrixTyper
      break
    case 'EAccountK':
      img = matrixTyper
      break
    case 'EAccountEmployeeS':
    case 'EAccountEmployeeK':
      img = matrixEmployee
      break
  }
  return img
}

// 更新列表
function updateTableInfo(info) {
  tableState.loading = info.tableState?.loading || false
  tableState.page.index = info.tableState?.page?.index || 1
  tableState.page.total = info.tableState?.page?.total || 0
  titleName.value = info.titleName
  if (info.groupId) {
    const arr = []
    arr.push(Number(info.groupId))
    tableState.groupIds = arr
  } else {
    tableState.groupIds = []
  }
  tableState.platform = info.platform ? info.platform : ''
  console.log('是否获取列表', info.getTableList)
  if (info.getTableList) getList()
}
// 获取列表
function getList() {
  tableState.loading = true
  const params = {
    pageNo: tableState.page.index,
    pageSize: tableState.page.size,
    groupIds: tableState.groupIds, // 分组
    platform: tableState.platform, // 筛选
    areaId: null
  }
  // api
  //   .getGroupTable(params)
  listAccountBySumVideo(params)
    .then(res => {
      console.log('获取列表返回', res)
      if (res.code === 0) {
        tableState.page.total = res.data?.total || 0
        tableState.listData = res.data?.records || []
      }
      tableState.loading = false
    })
    .catch(() => {
      tableState.loading = false
    })
}
// 更换poi
function changePOI(row) {
  console.log('点击更换poi', row)
  changePOiInfo.info = {
    poiId: row.poiId,
    poiName: row.poiName,
    openId: row.openId
  }
  changePOiInfo.platform = row.platform
  changePOiInfo.show = true
}
// 绑定/更改绑定poi
function updatePoi(poiInfo, accountInfo) {
  console.log('poiInfo', poiInfo)
  console.log('accountInfo', accountInfo)
  const params = {
    openId: accountInfo.info.openId,
    platform: accountInfo.platform || 1,
    poiId: poiInfo.poi,
    poiName: poiInfo.poiName,
    poiSubname: poiInfo.subname || '',
    poiType: poiInfo.source || ''
  }
  updateAccountPoiData(params)
    .then(res => {
      if (res.code === 0) {
        message.success('操作成功！')
        getList()
        closeChangePoiDom()
      } else {
        message.error('操作失败！')
      }
    })
    .catch(() => {
      message.error('操作失败！')
    })
}
function closeChangePoiDom() {
  changePOiInfo.info = {}
  changePOiInfo.show = false
}
// 确定抖音授权
function operationSuccessFun() {
  getList()
}
// 员工号
const addAuthEmployee = debounce(() => {
  authDialog.show = true
}, 700)
function updateFun(isRefresh) {
  console.log('授权员工号isRefresh', isRefresh)
  if (isRefresh) {
    console.log('需要获取列表')

    getList()
  }
  authDialog.show = false
  authDialogXhs.show = false
  authDialogKs.show = false
}
// 新增授权机构号
const showMcnFun = throttle(() => {
  mcnInfo.show = true
}, 500)
// 新增视频号授权
const openAuthSph = throttle(() => {
  listWxMcnAuths({
    authStatus: 0,
    pageNo: 1,
    pageSize: 10,
    showDefaultMcn: true
  }).then(res => {
    if (res.code === 0) {
      const total = res.data?.total
      if (total) {
        authDialogSph.show = true
      } else {
        message.warning('请先授权机构号！')
      }
    }
  })
}, 300)

// 新增小红书授权
const openAuthXhs = throttle(() => {
  authDialogXhs.show = true
}, 300)
// 新增快手授权
const openAuthKs = throttle(() => {
  authDialogKs.show = true
}, 300)
// 授权消耗弹框
const costDialog = ref({
  show: false,
  type: null
})
// 打开授权弹窗
function openAuth(type) {
  console.log('打开类型', type)
  checkCanAuthorize(type)
    .then(() => {
      if (accountDataAuthHide.value) {
        // 检测是否隐藏数据授权提示，隐藏就直接进行授权
        authFun(type)
      } else {
        // 否则就显示弹窗，在弹窗里点击确认再进行授权
        costDialog.value = {
          show: true,
          type
        }
      }
    })
    .catch(() => {})
}
function authFun(type) {
  switch (type) {
    case 1:
      console.log('授权抖音个人号/普通企业号（非蓝V）')
      addAuth(1, 1)
      break
    case 2:
      console.log('授权抖音认证企业号（蓝V）')
      addAuth(1, 2)
      break
    case 3:
      console.log('授权员工号')
      addAuthEmployee()
      break
    case 4:
      console.log('授权小红书')
      openAuthXhs()
      break
    case 5:
      console.log('授权快手号')
      openAuthKs()
      break
    case 6:
      console.log('授权视频号')
      openAuthSph()
      break
    case 7:
      console.log('授权机构号')
      showMcnFun()
      break
  }
}
const tableHeight = ref(null)
function onResize() {
  tableHeight.value = parseInt(document.body.clientHeight) - 278
}
onMounted(() => {
  tableState.loading = true
  onResize()
  window.addEventListener('resize', onResize)
})
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})
// 批量授权弹窗----
const batchAuthDialog = reactive({
  show: false
})
const showAuthDialog = throttle(() => {
  batchAuthDialog.show = true
}, 500)
// 批量授权弹窗----
</script>
<style lang="scss" scoped>
.account_wrap {
  display: flex;
  align-items: center;
  > .avatar_wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 56px;
    height: 56px;
    > .private_account {
      bottom: 6px;
      right: 5px;
    }
    > .avatar_icon {
      width: 40px;
      height: 40px;
      vertical-align: top;
      border-radius: 50%;
      box-sizing: border-box;
      object-fit: cover;
    }
    > .expired_img {
      width: 14px;
      height: 14px;
      position: absolute;
      right: 0px;
      top: 0px;
    }
  }
  > .account_info {
    display: flex;
    flex-direction: column;
    margin-left: 8px;
    width: calc(100% - 64px);

    > div {
      width: 100%;
      display: flex;
      align-items: center;
      // justify-content: space-between;

      span {
        max-width: 106.91px;
        min-width: 10px;
        height: 20px;
        font-size: 14px;
        font-weight: 500;
        color: #303133;
        line-height: 20px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex-shrink: 5555;
      }
      > .brand_img {
        width: 32px;
        height: 14px;
        margin-left: 4px;
        border-radius: 0;
      }
      img {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        margin-left: 4px;
      }
    }
    p {
      width: 100%;
      white-space: nowrap;
      margin-top: 4px;
      display: flex;
      align-items: center;

      > span {
        max-width: calc(100% - 24px);
        white-space: nowrap;
        overflow: hidden;
        height: 17px;
        font-size: 12px;
        font-weight: 400;
        color: #909399;
        line-height: 17px;
      }
      > .qrcode_img {
        width: 18px;
        height: 18px;
        margin-left: 6px;
      }
    }
    .group_list {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
      .new_group_name {
        width: max-content;
        max-width: 70px;
      }
    }
    .pre_time {
      white-space: nowrap;
      overflow: hidden;
      height: 17px;
      font-size: 12px;
      font-weight: 400;
      color: #909399;
      line-height: 17px;
      margin-top: 4px;
    }
  }
}

.new_group_name {
  height: 20px;
  padding: 0 5px;
  margin-left: 8px;
  background: #dce1f8;
  border-radius: 2px;
  font-size: 12px;
  font-weight: 400;
  color: #364fcd;
  line-height: 20px;
}
.group_box {
  max-width: 250px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  .new_group_name {
    margin: 4px;
  }
}
</style>
<style lang="scss" scoped>
.matrix_manage {
  background: #fff;
  display: flex;
  height: 100%;
  .m_left {
    width: 250px;
    border-radius: 4px;
  }
  .m_right_warp {
    padding-left: 16px;
    flex: 1;
    background: #f6f8fa;
    width: calc(100% - 250px);
  }
  .m_right {
    background: #fff;
    height: 100%;
    padding: 0 24px 24px;
    .m_right_top_info {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 66px;
      .top_info_l {
        display: flex;
        align-items: center;
      }
      .top_info_r {
        cursor: pointer;
      }
      .group_name {
        height: 22px;
        font-size: 16px;
        font-weight: 500;
        color: #303133;
        line-height: 22px;
      }
      .num_warp {
        margin-left: 9px;
        font-size: 12px;
        font-weight: 400;
        color: #909399;
        line-height: 20px;
        .num {
          color: #364fcd;
          font-size: 16px;
        }
      }
    }

    .matrix_table {
      height: auto;
      max-height: calc(100% - 66px);
      overflow-y: auto;
    }
  }
}
:deep .column_header {
  display: flex;
  align-items: center;
}
</style>
