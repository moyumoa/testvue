<template>
  <div class="content_page live_inspection">
    <!-- 数据说明 -->
    <div class="data_illustrate">
      <div class="illustrate_title">
        <div>数据说明</div>
        <div class="title_right">
          <el-tooltip placement="left">
            <template #content>
              <div style="max-width: 450px">
                Q1：既完成了线索授权，又配置了线索推送，线索数据会重复吗？
                <br />
                A：不会。当线索授权有效时，系统不会接收线索推送。
                <br />
                <br />
                Q2：“已经操作过线索授权的企业号已经自动同步完成了推送配置”是什么意思？
                <br />
                A：当企业号向星麦云授权线索管理时，系统也将自动帮企业号完成线索推送的配置，以用于线索授权失效后的数据补充。
                <br />
                <br />
                Q3：只配置了线索推送能获取到线索数据吗？
                <br />
                A：可以的。但需满足以下两个条件：（1）请登录企业号线索版后台-运营工作台-用户管理-线索管理-线索推送检查配置是否正常且状态为开启；（2）请检查企业号是否已正常授权给星麦云系统
                <br />
                <br />
                Q4：数据更新与企业号后台有偏差？
                <br />
                A：线索授权和线索推送需至少有一个有效才能获取到最新线索数据，因授权失效造成的数据丢失无法补偿。
              </div>
            </template>
            <div class="xm_tooltipOfRight" style="width: max-content">常见问题</div>
          </el-tooltip>
        </div>
      </div>
      <div class="illustrate_btn">
        <div>
          1、线索数据首先来源于线索授权
          <el-button type="primary" @click="toAuth">去授权</el-button>
        </div>
        <div style="margin-top: 8px">
          2、当线索授权失效时，系统将通过接收线索版企业号的推送来补充数据（已经操作过线索授权的企业号已经自动同步完成了推送配置）
          <el-button type="primary" @click="showConfigFun">一键配置推送</el-button>
        </div>
      </div>
    </div>
    <!-- 筛选条件 -->
    <xm_search
      :useOwnReset="true"
      :searchComponents="searchComponents"
      :isNeedExport="isNeedExport"
      @getData="querySearch"
      @reset="resetSearch"
      @openChoseLabel="openChoseLabel"
      ref="xmSearchRef"
    >
      <template #searchBtn>
        <!-- <el-button @click="exportFiles">导出</el-button> -->
        <exp_button :asyncFunc="exportFiles">导出</exp_button>
      </template>
    </xm_search>
    <!-- 列表 -->
    <div class="table_box">
      <xm_table
        class="pic_table"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getList"
      >
        <el-table-column label="线索信息" prop="userNickname" min-width="180">
          <template #default="{ row }">
            <table_column_matrix_account
              :info="{
                dyAvatar: row.clueHeadImg,
                dyName: row.userNickname,
                dyNum: row.dyDisplayId
              }"
            >
              <template #name>
                <div class="customer_name">
                  <el-tooltip
                    :content="row.userNickname"
                    placement="top"
                    :disabled="!row.userNickname"
                  >
                    <div class="customer_name_text">
                      {{ row.userNickname || '--' }}
                    </div>
                  </el-tooltip>
                  <div class="scrm_sign" v-if="row.scrmCustomerId">矩阵获客</div>
                </div>
              </template>
            </table_column_matrix_account>
          </template>
        </el-table-column>
        <el-table-column min-width="130" label="联系方式">
          <template #default="{ row }">
            <table_column_phone :phone="row.tell"></table_column_phone>
          </template>
        </el-table-column>
        <el-table-column min-width="130" label="地区">
          <template #default="scope">
            <el-tooltip effect="dark" placement="top-start">
              <template #content>
                <div style="max-width: 300px">{{ scope.row.addr || '--' }}</div>
              </template>
              <div class="row_overflow" style="max-width: max-content">
                {{ scope.row.addr || '--' }}
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="来源信息" min-width="300">
          <template #default="{ row }">
            <div class="source_info">
              <img v-if="row.xuserHeadImg" :src="row.xuserHeadImg" alt="" class="head_img" />
              <img
                v-else
                src="/src/assets/images/content_center/default_user.png"
                alt=""
                class="head_img"
              />
              <div class="right_content">
                <div>
                  {{ row.nikename || '--' }}
                  <!-- 矩阵号被删除 -->
                  <div class="xm_delClass" v-if="row.xuserIsDel && row.xuserIsDel == 1"></div>
                </div>
                <div class="channel_container" v-if="row.soruceCarrier === 1">
                  <img
                    src="https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/034fcdc9f5214171a8c3b25c7f1bdff5_1686625497002.png"
                    alt=""
                    class="channel_icon"
                  />
                  <div class="channel_name">直播</div>
                  <!--                  <div class="channel_info_text">{{ row.xcontentTitle || '&#45;&#45;' }}</div>-->
                </div>
                <div class="channel_container" v-else-if="row.soruceCarrier === 0">
                  <img
                    src="https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/2fba5c46fc2e4c4185f2727376c6a886_1686625469765.png"
                    alt=""
                    class="channel_icon"
                  />
                  <div class="channel_name">视频</div>
                  <!--                  <div class="channel_info_text" :style="{ cursor: cursorStyle(row) }">-->
                  <!--                    {{ row.xcontentTitle || '&#45;&#45;' }}-->
                  <!--                  </div>-->
                </div>
                <div class="channel_container" v-else-if="row.soruceCarrier === 2">
                  <img
                    src="https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/bc3aa147c3284bcbb275aed8e1cdaab9_1686625525444.png"
                    alt=""
                    class="channel_icon"
                  />
                  <div class="channel_name">私信</div>
                </div>
                <div class="channel_container" v-else>
                  <div class="channel_name">其他</div>
                </div>
                <div
                  v-if="[1, 0].includes(row.soruceCarrier) && row.toolName"
                  style="margin-top: 8px"
                >
                  {{ row.toolName }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="留资时间" min-width="130">
          <template #default="scope">
            <div class="row_overflow" style="max-width: max-content">
              {{ scope.row.gmtFromTime ? scope.row.gmtFromTime.replace(/\//g, '.') : '--' }}
            </div>
          </template>
        </el-table-column>
      </xm_table>
    </div>

    <inspectionModal
      :inspectionModal="modal"
      @updateList="getList"
      v-if="modal.show"
    ></inspectionModal>
    <!-- 编辑标签的弹窗 -->
    <addTagDOM
      v-if="addTagDialog.show"
      :addDialog="addTagDialog"
      @updateTag="updateTag"
      subtitle="添加关键词快速过滤昵称中包含该词的线索（用于过滤同行或无效线索）"
    />
    <!-- 线索推送快捷配置弹窗 -->
    <configDOM v-if="configDialog.show" :configDialog="configDialog" />
  </div>
</template>
<script>
import configDOM from './components/config_dialog.vue'
import inspectionModal from '../components/inspection_modal.vue'
import { pageList } from './model/get_list.js'
import { wanSliceFormat, secondToDate, debounce, throttle, isEmpty } from '@/utils/tools.js'
import addTagDOM from '@/views/content_center/content_repository/components/addTag_dialog.vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { setBusinessChooseParam } from '@/utils/search.js'

// import { ElMessage } from 'element-plus'
export default {
  components: { configDOM, inspectionModal, addTagDOM },
  setup(props) {
    const modal = reactive({
      show: false,
      title: '直播质检',
      row: null,
      type: 'live'
    })

    const addTagDialog = reactive({
      show: false,
      hideTitleSpan: false,
      type: null,
      chooseTagList: []
    })

    const choseLabelList = ref([]) // 筛选项里选中的标签列表

    const {
      searchComponents,
      searchComponents1,
      isNeedExport,
      tableForm,
      statusList,
      getList,
      exportFiles,
      getNewGroupList
    } = pageList()
    const router = useRouter()
    // 进入线索详情
    // const showDetail = val => {
    //   if (val.mcClueId) {
    //     router.push({
    //       path: '/content_center/clue_manage/detail',
    //       query: {
    //         id: val.mcClueId
    //       }
    //     })
    //   } else {
    //     sessionStorage.setItem('clueList', JSON.stringify(val))
    //     router.push({
    //       path: '/content_center/clue_manage/detail'
    //     })
    //   }
    // }
    // 清空查询参数
    function clearSearchQuery() {
      tableForm.page = {
        index: 1,
        size: 10,
        total: 0
      }
    }
    function querySearch() {
      clearSearchQuery()
      getList()
    }
    function resetSearch() {
      choseLabelList.value = []
      addTagDialog.chooseTagList = []
      getList()
    }
    clearSearchQuery()
    const xmSearchRef = ref(null)
    const menuOfKeepAlive = inject('$menuOfKeepAlive')
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
      searchComponents.value = []
      nextTick(() => {
        searchComponents.value = searchComponents1.value
      })
    })
    // 视频的鼠标样式
    // const cursorStyle = row => {
    //   // let result = ''
    //   if ((row.isInner && row.openItemId) || row.outsideContentUrl) {
    //     return 'pointer'
    //   }
    //   return 'unset'
    // }
    // const toVideoDetail = row => {
    //   let url = ''
    //   if (row.isInner && row.openItemId) {
    //     url = `/content_center/content_manage/manage_detail?itemId=${window.encodeURIComponent(
    //       row.openItemId
    //     )}`
    //   } else {
    //     url = row.outsideContentUrl
    //   }
    //   if (url) {
    //     window.open(url)
    //   }
    // }
    // const toLiveDetail = row => {
    //   if (row.isInner) {
    //     window.open(
    //       `/content_center/live_center/detail?roomId=${row.roomId}&dyOpenId=${row.dyOpenId}`
    //     )
    //   } else {
    //     ElMessage.warning('未获取到直播间记录')
    //   }
    // }

    // 更新标签
    const updateTag = debounce(e => {
      choseLabelList.value = e
      const arr = ref([])
      choseLabelList.value.forEach(item => {
        arr.value.push(item.name)
      })
      searchComponents.value[6].val = arr.value
    }, 64)

    // 打开标签选择
    function openChoseLabel() {
      addTagDialog.type = 21
      addTagDialog.hideTitleSpan = false
      addTagDialog.chooseTagList = choseLabelList.value || []
      addTagDialog.show = true
    }
    // 显示配置的弹窗
    const configDialog = reactive({
      show: false
    })
    const showConfigFun = throttle(() => {
      configDialog.show = true
    }, 700)

    // 授权管理
    const toAuth = throttle(() => {
      router.push('/system_manage/matrixNumber_auth')
    }, 300)
    return {
      toAuth,
      configDialog,
      showConfigFun,
      xmSearchRef,
      wanSliceFormat,
      secondToDate,
      modal,
      tableForm,
      statusList,
      getList,
      searchComponents,
      isNeedExport,
      // showDetail,
      resetSearch,
      exportFiles,
      querySearch,
      addTagDialog,
      updateTag,
      openChoseLabel
      // toLiveDetail,
      // toVideoDetail,
      // cursorStyle
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../components/css/qrcode.scss';
@import '../components/css/page.scss';
@import '../components/css/inspection.scss';
@import '@/styles/layout.scss';
.live_inspection {
  .table_box {
    margin: $content_margin 0;
    background: #fff;
    padding: 24px;
    border-radius: $content_radius;
  }
  // table 线索信息
  .customer_name {
    display: flex;
    align-items: center;
    .customer_name_text {
      @include mult_line(1);
    }
    .scrm_sign {
      flex-shrink: 0;
      margin-left: 8px;
      padding: 0 4px;
      height: 18px;
      line-height: 18px;
      background: #fff5ed;
      border-radius: 2px;
      font-size: 12px;
      color: #ed6a0c;
    }
  }
  // table 来源信息
  .source_info {
    display: flex;
    align-items: center;
    height: 100px;
    .head_img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-right: 8px;
      background: #f2f3f5;
    }
    .right_content {
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #323233;
      line-height: 20px;
      .channel_container {
        display: flex;
        align-items: center;
        margin-top: 8px;
        .channel_icon {
          flex-shrink: 0;
          width: 16px;
          height: 16px;
          margin-right: 5px;
        }
        .channel_name {
          width: 45px;
          flex-shrink: 0;
        }
        .channel_info_text {
          cursor: pointer;
          height: 18px;
          color: #606266;
          line-height: 18px;
          padding: 0 4px;
          font-size: 12px;
          font-weight: 400;
          background: #f2f3f5;
          border-radius: 2px;
          @include mult_line(1);
        }
      }
    }
  }
  .live_box {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .live_img_box {
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
      max-width: calc(100% - 70px);
      min-height: 60px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      .content1 {
        margin: 6px 0;
        max-width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        font-size: 14px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 600;
        color: #303133;
        line-height: 20px;
        .content_text {
          width: calc(100% - 26px);
        }
        img {
          width: 18px;
          height: 18px;
          margin-left: 8px;
          cursor: pointer;
        }
      }
      .content2 {
        font-size: 12px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #909399;
        line-height: 17px;
      }
    }
  }
  .user_box {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .user_head {
      width: 48px;
      height: 48px;
      border-radius: 100%;
      margin-right: 10px;
    }
    .user_content {
      max-width: calc(100% - 58px);
      min-height: 48px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      .content1 {
        max-width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        font-size: 14px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 600;
        color: #303133;
        line-height: 20px;
        .content_text {
          width: calc(100% - 22px);
        }
        img {
          width: 16px;
          height: 16px;
          margin-left: 6px;
        }
      }
      .content2 {
        margin-top: 6px;
        font-size: 12px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #909399;
        line-height: 17px;
      }
    }
  }

  .data_illustrate {
    width: 100%;
    min-height: 110px;
    background: #ffffff;
    border-radius: 4px;
    padding: 20px 24px;
    margin-bottom: 16px;
    .illustrate_title {
      margin-bottom: 8px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      font-size: 16px;
      font-weight: 600;
      color: #323233;
      line-height: 22px;
      .title_right {
        font-size: 14px;
        font-weight: 400;
        color: #909399;
        line-height: 22px;
      }
    }
    .illustrate_btn {
      > div {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        font-size: 14px;
        font-weight: 400;
        color: #909399;
        line-height: 20px;
        .el-button {
          margin-left: 12px;
        }
      }
    }
  }
}
</style>
