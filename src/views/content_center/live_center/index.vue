<template>
  <div class="content_page live_center">
    <!-- 筛选条件 -->
    <xm_search
      :searchComponents="searchComponents"
      @getData="searchList"
      :useOwnReset="true"
      @reset="resetSearch"
      ref="xmSearchRef"
    >
      <template #searchBtn>
        <exp_button :asyncFunc="exportReport">导出</exp_button>
      </template>
    </xm_search>
    <!-- 列表 -->
    <div class="content">
      <el-tabs class="tab_box" v-model="chooseTab" @tab-click="resetSearch">
        <template v-for="(tab, i) in tabList">
          <el-tab-pane v-if="tab.show" :key="i" :label="tab.label" :name="tab.name">
            <template #label>
              <div class="tab_label">
                {{ tab.label }}
                <img
                  v-if="chooseTab == tab.name"
                  src="@/assets/images/content_center/tab_sort.png"
                  alt
                />
              </div>
            </template>
            <xm_table
              class="pic_table"
              tableType="default"
              v-loading="tableForm.loading"
              :data="chooseTab == tab.name ? tableForm.listData : []"
              v-model:page="tableForm.page"
              @getTableData="getList"
            >
              <el-table-column min-width="220" label="直播">
                <template #default="scope">
                  <div class="live_box">
                    <div
                      class="live_img_box"
                      @click="toDetail(scope.row.roomId, scope.row.dyOpenId)"
                    >
                      <el-image
                        v-if="scope.row.roomPhoto"
                        :src="scope.row.roomPhoto"
                        class="live_img"
                      >
                        <template #error>
                          <div class="live_img errImg_box"></div>
                        </template>
                      </el-image>
                      <img
                        class="live_img"
                        v-else
                        src="@/assets/images/content_center/default_cover.png"
                        alt
                      />
                      <liveAnimation v-if="scope.row.roomStatus == 1"></liveAnimation>
                      <!-- <div class="living" v-if="scope.row.roomStatus == 1">
                    <div class="living_animation">
                      <p></p>
                      <p></p>
                      <p></p>
                    </div>
                    直播中
                      </div>-->
                    </div>

                    <div class="live_content">
                      <div class="content1">
                        <div
                          @click="toDetail(scope.row.roomId, scope.row.dyOpenId)"
                          :style="
                            scope.row.roomStatus == 1
                              ? 'max-width:calc(100% - 26px) !important;cursor:pointer'
                              : 'max-width:calc(100% - 0px) !important;cursor:pointer'
                          "
                        >
                          <div class="content_text row_overflow">
                            {{ scope.row.roomTitle || '--' }}
                          </div>
                        </div>

                        <el-popover
                          v-if="scope.row.roomStatus == 1"
                          placement="bottom"
                          popper-class="qrcode_popper"
                          width="154px"
                          trigger="click"
                        >
                          <template #reference>
                            <img src="@/assets/images/content_center/qrcode.png" alt />
                          </template>
                          <div class="qrcode_box" v-if="scope.row.roomId">
                            <qrcode-vue
                              :value="localOrign + '/sumflyh5/activity?roomId=' + scope.row.roomId"
                              :size="126"
                              level="H"
                            />
                            <div class="qr_mark">
                              <img
                                src="https://tagvv-1256030678.cos.ap-shanghai.myqcloud.com/img/202111061652346e85b3672b.png"
                                alt
                              />
                              抖音扫码观看
                            </div>
                          </div>
                          <div v-else class="qrcode_box">
                            <div class="qr_mark">暂未找到相关地址</div>
                          </div>
                        </el-popover>
                      </div>
                      <div class="content2" @click="toDetail(scope.row.roomId, scope.row.dyOpenId)">
                        时长：{{ scope.row.liveDurationTimeStr || '--' }}
                      </div>
                      <!-- <div class="content2">
                    直播时间：{{ scope.row.createTime ? getDateDiff(scope.row.createTime) : '--' }}
                    </div>-->
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column min-width="240" label="矩阵号昵称">
                <template #default="scope">
                  <div class="fs_user_box">
                    <div
                      :class="
                        scope.row.operator && scope.row.operator.fsOpenId
                          ? 'fs_content'
                          : 'fs_content2'
                      "
                      @click="toUserDetail(scope.row.dyOpenId, scope.row)"
                    >
                      <div
                        class="user_box"
                        :style="
                          scope.row.xuserIsDel && scope.row.xuserIsDel == 1 ? 'cursor: default' : ''
                        "
                      >
                        <div class="user_left_box">
                          <img
                            v-if="scope.row.avatar"
                            :src="scope.row.avatar"
                            class="user_head"
                            alt
                          />
                          <img
                            v-else
                            src="@/assets/images/content_center/default_user.png"
                            class="user_head"
                            alt
                          />
                          <template v-if="scope.row.platform === 1 && scope.row.openIdAuthStatusVo">
                            <el-tooltip
                              effect="dark"
                              v-if="scope.row.openIdAuthStatusVo.dyAuth == 2"
                              placement="top-start"
                            >
                              <template #content>
                                <div style="max-width: 300px">
                                  {{
                                    scope.row.openIdAuthStatusVo.dyAuth == 2 ? '抖音授权失效' : ''
                                  }}
                                </div>
                              </template>
                              <img
                                class="expired_img"
                                src="@/assets/images/content_center/warning_icon.png"
                                alt
                              />
                            </el-tooltip>
                          </template>
                        </div>
                        <div class="user_content">
                          <div class="content1">
                            <div class="content_text">
                              {{ scope.row.nickName || '--' }}

                              <template v-if="scope.row.xuserType && scope.row.xuserType > 1">
                                <el-tooltip effect="dark" placement="top">
                                  <template #content>
                                    <div style="max-width: 300px">
                                      {{ matrixTypeICON.getCN(scope.row.xuserType).name }}
                                    </div>
                                  </template>
                                  <img
                                    :src="matrixTypeICON.getCN(scope.row.xuserType).img"
                                    alt=""
                                  />
                                </el-tooltip>
                              </template>
                              <!-- 矩阵号被删除 -->
                              <div
                                class="xm_delClass"
                                v-if="scope.row.xuserIsDel && scope.row.xuserIsDel == 1"
                              ></div>
                            </div>
                          </div>
                          <table_column_department_info
                            className="blue_department_info"
                            :departmentName="scope.row.xuserDeptName"
                            connectStr="/"
                            divisionStr=";"
                            trigger="hover"
                            tipPlacement="right"
                          ></table_column_department_info>
                          <!-- <div class="content2">粉丝数 {{ wanSliceFormat(scope.row.fansNum || 0) }}</div> -->
                          <!-- 业务主体 -->
                          <table_column_business_entity :list="scope.row.businessNameList" />
                        </div>
                      </div>
                    </div>
                    <!-- v-if="scope.row.fsOpenId" -->
                    <img
                      v-if="scope.row.operator && scope.row.operator.fsOpenId"
                      @click="toFschat(scope.row.operator.fsOpenId)"
                      class="fs_chat"
                      src="@/assets/images/content_center/fsChat.png"
                      alt=""
                    />
                  </div>
                </template>
              </el-table-column>

              <el-table-column width="180" label="开播时间">
                <template #default="scope">{{ scope.row.createTime || '--' }}</template>
              </el-table-column>
              <el-table-column min-width="110" label="直播销量" v-if="brandViewMode === 1">
                <template #default="scope">{{ wanSliceFormat(scope.row.sellNum || 0) }}</template>
              </el-table-column>
              <el-table-column min-width="125" label="直播销售额(元)" v-if="brandViewMode === 1">
                <template #default="scope">
                  {{ wanSliceFormat(scope.row.sellAmount || 0) }}
                </template>
              </el-table-column>
              <el-table-column min-width="110" label="观看人次">
                <template #default="scope">
                  {{ wanSliceFormat(scope.row.watchTimes || 0) }}
                </template>
              </el-table-column>
              <el-table-column min-width="110" label="人气峰值">
                <template #default="scope">
                  {{ wanSliceFormat(scope.row.maxOnlineNum || 0) }}
                </template>
              </el-table-column>
              <el-table-column min-width="110" label="点赞数">
                <template #default="scope">
                  {{ wanSliceFormat(scope.row.likeNum || 0) }}
                </template>
              </el-table-column>
              <el-table-column min-width="110" label="涨粉数">
                <template #default="scope">
                  {{ wanSliceFormat(scope.row.addFansNum || 0) }}
                </template>
              </el-table-column>
              <el-table-column min-width="110" label="线索数">
                <template #default="scope">
                  {{ wanSliceFormat(scope.row.clueCnt || 0) }}
                </template>
              </el-table-column>

              <el-table-column
                label="操作"
                fixed="right"
                width="120"
                align="center"
                header-align="center"
              >
                <template #default="scope">
                  <el-link type="primary" @click="toDetail(scope.row.roomId, scope.row.dyOpenId)">
                    详情
                  </el-link>
                </template>
              </el-table-column>
            </xm_table>
          </el-tab-pane>
        </template>
      </el-tabs>
    </div>
    <el-dialog v-model="dialogVisible" title="导出文档" width="30%">
      <span>{{ exportMessage }}</span>
      <template #footer>
        <span class="dialog-footer">
          <!-- <el-button @click="dialogVisible = false">Cancel</el-button> -->
          <el-button type="primary" @click="confirmClick(confirm)">查看</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { matrixTypeICON } from '@/utils/dictionary/content-center.js'
import { setBusinessChooseParam } from '@/utils/search.js'
import liveAnimation from '../components/live_animation.vue'
import qrcodeVue from 'qrcode.vue'
import { pageList } from './model/get_list.js'
import { wanSliceFormat, getDateDiff, throttle, isEmpty } from '@/utils/tools.js'
import { getQuery } from '@/utils/get_query.js'
import { liveExportExcel } from '@/api/content_center/live_center.js'
import { exportFileV2 } from '@/utils/exportFile.js'
import { useStore } from 'vuex'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
export default {
  components: {
    qrcodeVue,
    liveAnimation
  },
  setup(props) {
    const store = useStore()
    const brandViewMode = computed(() => store.state.user.brandViewMode)
    // const localOrign = 'https://test.tagvv.com'
    const vm = getCurrentInstance()
    const localOrign = location.origin
    const {
      searchComponents,
      searchComponents1,
      chooseTab,
      tabList,
      tableForm,
      getList,
      getNewGroupList
    } = pageList()
    // 清空查询参数
    function clearSearchQuery() {
      tableForm.loading = true
      tableForm.page.index = 1
      tableForm.page.size = 10
    }
    // 重置
    function resetSearch() {
      clearSearchQuery()
      getList()
    }
    clearSearchQuery()

    const xmSearchRef = ref(null)
    const menuOfKeepAlive = inject('$menuOfKeepAlive')
    onActivated(() => {
      if (menuOfKeepAlive('judge')) {
        chooseTab.value = 'live_start_time'
        if (xmSearchRef.value) {
          xmSearchRef.value?.reset()
        } else {
          resetSearch()
        }
        menuOfKeepAlive('reset')
      } else {
        getList()
      }
      getNewGroupList()
      // 为保证业务主体是最新的，
      const businessChooseObj = {}
      searchComponents.value.forEach(item => {
        if (!item.hiddenItem) {
          if (item.type === 'chooseBusiness' || item.type === 'chooseBusinessGroup') {
            const info = {
              ids: item.ids || [],
              isCheckAll: item.isCheckAll || false
            }
            businessChooseObj[item.principalType] = info
          }
        }
      })
      if (isEmpty(businessChooseObj)) {
        const list = setBusinessChooseParam(businessChooseObj)
        searchComponents.value = searchComponents1.value.concat(list)
      }
    })

    // 页面里开的时候 清空分组组件
    onBeforeRouteLeave((to, from) => {
      if (to.path !== '/content_center/live_center/detail') {
        searchComponents.value = []
        nextTick(() => {
          searchComponents.value = searchComponents1.value
        })
      }
    })
    // 查询
    function searchList() {
      tableForm.loading = true
      tableForm.page.index = 1
      getList()
    }
    const router = useRouter()
    // 跳转详情页
    const toDetail = throttle(function (roomId, dyOpenId) {
      router.push(`/content_center/live_center/detail?roomId=${roomId}&dyOpenId=${dyOpenId}`)
    }, 500)
    const toUserDetail = throttle(function (openId, e) {
      // 如果矩阵号被删除，就不能跳转
      if (e.xuserIsDel && e.xuserIsDel === 1) {
        return
      }
      router.push(`/content_center/content_matrix/details?openId=${openId}`)
    }, 500)
    // const toUserDetail = throttle(function (openId) {
    //   if (openId) {
    //     router.push({
    //       path: '',
    //       query: {
    //         openId: openId
    //       }
    //     })
    //   } else {
    //     message({
    //       type: 'warning',
    //       message: '暂未获取到账号相关信息'
    //     })
    //   }
    // }, 700)
    const fullscreenLoading = ref(false)
    const dialogVisible = ref(false)
    const exportMessage = ref('导出成功，点击查看按钮')

    const isWeChat = ref(true)
    isWeChat.value = localStorage.getItem('isWeChat') === '1'
    const url = ref('')
    function exportReport() {
      fullscreenLoading.value = true
      const data = getQuery(searchComponents.value, ['liveStartTimeFrom', 'liveStartTimeTo'])
      data.liveStartTimeFrom = data.liveStartTimeFrom.split(' ')[0]
      data.liveStartTimeTo = data.liveStartTimeTo.split(' ')[0]
      data.searchCount = true
      data.orderSetting = 'DESC:' + chooseTab.value
      // data.pageNo = tableForm.page.index
      // data.pageSize = tableForm.page.size
      vm.appContext.config.globalProperties.$tracking.clickBtn(104)

      return exportFileV2(liveExportExcel, data, '直播数据', 'xlsx')
        .then(() => {
          fullscreenLoading.value = false
        })
        .catch(() => {
          fullscreenLoading.value = false
        })
    }
    function confirmClick() {
      window.open(url.value, '_blank')
    }
    // 跳转飞书聊天
    function toFschat(openId) {
      window.open(`https://applink.feishu.cn/client/chat/open?openId=${openId}`)
    }
    return {
      xmSearchRef,
      brandViewMode,
      toFschat,
      localOrign,
      tableForm,
      getList,
      searchComponents,
      tabList,
      chooseTab,
      wanSliceFormat,
      getDateDiff,
      resetSearch,
      searchList,
      toDetail,
      toUserDetail,
      fullscreenLoading,
      dialogVisible,
      exportReport,
      confirmClick,
      exportMessage,
      getNewGroupList,
      matrixTypeICON
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../components/css/qrcode.scss';
@import '../components/css/page.scss';
.live_center {
  :deep(.el-tabs__header) {
    margin-bottom: 16px;
  }
  .content {
    position: relative;
    .tab_box {
      background: #fff;
      margin-top: 10px;
      border-radius: 4px;
      padding: 30px 24px;
    }
    .right_choice {
      position: absolute;
      top: 15px;
      right: 0px;
      // width: 78px;
      // height: 32px;
      overflow: hidden;
      display: flex;
      .btn {
        margin-right: 24px;
      }
    }
  }
  .tab_label {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;

    img {
      display: flex;
      width: 14px;
      height: 14px;
    }
  }
  .live_box {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .live_img_box {
      cursor: pointer;
      width: 60px;
      height: 60px;
      border-radius: 4px;
      margin-right: 10px;
      position: relative;
    }
    .live_img {
      width: 60px;
      height: 60px;
      border-radius: 4px;
      object-fit: cover;
    }
    .live_content {
      width: calc(100% - 70px);
      height: 60px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      .content1 {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        font-size: 14px;

        font-weight: 500;
        color: #303133;
        line-height: 20px;
        a {
          max-width: calc(100% - 26px) !important;
        }
        .content_text {
          cursor: pointer;
          max-width: 100%;
        }
        img {
          width: 18px;
          height: 18px;
          margin-left: 8px;
          cursor: pointer;
        }
      }
      .content2 {
        cursor: pointer;
        margin-top: 8px;
        font-size: 12px;

        font-weight: 400;
        color: #909399;
        line-height: 17px;
      }
    }
  }
  .user_box {
    cursor: pointer;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    position: relative;
    .user_head {
      width: 36px;
      height: 36px;
      border-radius: 100%;
    }
    .expired_img {
      width: 14px;
      height: 14px;
      position: absolute;
      left: 22px;
      top: 0px;
    }
    .user_left_box {
      position: relative;
      width: 36px;
      height: 36px;
      margin-right: 6px;
    }
    .user_content {
      width: calc(100% - 42px);
      min-height: 36px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      .content1 {
        width: 100%;
        // display: flex;
        // flex-direction: row;
        // justify-content: flex-start;
        // align-items: center;
        font-size: 13px;

        font-weight: 500;
        color: #303133;
        line-height: 20px;
        .content_text {
          width: max-content;
          max-width: 100%;
          // margin-bottom: 4px;
          // max-width: calc(100% - 40px);
        }
        img {
          width: 16px;
          height: 16px;
          margin-left: 4px;
          vertical-align: text-top;
        }
      }
      .content2 {
        margin-top: 6px;
        font-size: 12px;

        font-weight: 400;
        color: #909399;
        line-height: 17px;
      }
    }
  }
}
</style>
