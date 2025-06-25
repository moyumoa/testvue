<template>
  <div class="matrixDetails_wrap">
    <!-- 左侧数据 -->
    <div class="matrixDetails_left">
      <div class="account_info">
        <div class="title">
          <img src="@/assets/images/content_center/user.png" alt />
          <span>矩阵号信息</span>
        </div>
        <div class="avatar_wrap">
          <div class="img_wrap">
            <el-image
              class="avatar_img"
              :src="matrixInfo.dyHeadUrl ? matrixInfo.dyHeadUrl : avatarImg"
              alt
              :class="matrixInfo.dySecId ? 'cursor' : ''"
              @click="matrixInfo.dySecId ? toAccount(matrixInfo.dySecId) : ''"
            >
              <template #error>
                <div class="avatar_img errImg_box" style="width: 100%; height: 100%"></div>
              </template>
            </el-image>
            <el-tooltip
              effect="dark"
              v-if="
                (matrixInfo.dyAuth == 2 && matrixInfo.platform == 1) ||
                (matrixInfo.wxAuth == 2 && matrixInfo.platform == 2) ||
                (matrixInfo.xhsAuth == 2 && matrixInfo.platform == 3) ||
                (matrixInfo.dyAuth == 2 && matrixInfo.platform == 4)
              "
              placement="top-start"
            >
              <template #content>
                <div style="max-width: 300px">
                  <span v-if="matrixInfo.dyAuth == 2 && matrixInfo.platform == 1">
                    {{ matrixInfo.dyAuth == 2 ? '抖音授权失效' : '' }}
                  </span>
                  <span v-if="matrixInfo.wxAuth == 2 && matrixInfo.platform == 2">
                    {{ matrixInfo.wxAuth == 2 ? '视频号授权失效' : '' }}
                  </span>
                  <span v-if="matrixInfo.xhsAuth == 2 && matrixInfo.platform == 3">
                    {{ matrixInfo.xhsAuth == 2 ? '小红书授权失效' : '' }}
                  </span>
                  <span v-if="matrixInfo.dyAuth == 2 && matrixInfo.platform == 4">
                    {{ matrixInfo.dyAuth == 2 ? '快手授权失效' : '' }}
                  </span>
                </div>
              </template>
              <img class="warning_icon" src="@/assets/images/content_center/warning_icon.png" alt />
            </el-tooltip>
            <liveAnimation v-if="matrixInfo.roomStatus === 1"></liveAnimation>
            <table_column_private_account
              v-if="matrixInfo.privacyAccountStatus === 1"
            ></table_column_private_account>
          </div>
          <div class="info_wrap">
            <div class="name">
              <span>{{ matrixInfo.dyNickname || '--' }}</span>
              <!-- 所属平台 begin-->
              <div class="platform_icon_box">
                <div
                  :class="[`xm_platformIcon_${matrixInfo.platform}`]"
                  style="width: 16px; height: 16px"
                ></div>
              </div>
              <!-- 所属平台 end -->
              <el-popover
                placement="bottom"
                popper-class="qrcode_popper"
                width="154px"
                trigger="hover"
                v-if="matrixInfo.dyUId"
              >
                <template #reference>
                  <img
                    class="qrcode_img"
                    style="cursor: pointer"
                    src="@/assets/images/content_center/qrcode.png"
                    alt
                  />
                </template>
                <div class="qrcode_box" v-if="matrixInfo.dyUId">
                  <qrcode-vue :value="matrixInfo.dyUId" :size="126" level="H" />
                  <div class="qr_mark">
                    <img
                      src="https://tagvv-1256030678.cos.ap-shanghai.myqcloud.com/img/202111061652346e85b3672b.png"
                      alt
                    />
                    抖音扫码查看
                  </div>
                </div>
                <div v-else class="qrcode_box">
                  <div class="qr_mark" style="text-align: center">暂未找到相关地址</div>
                </div>
              </el-popover>
            </div>
            <div class="company_name" v-if="matrixInfo.eaccountRole">
              <img :src="getTypeImg(matrixInfo.eaccountRole)" alt />
              <span>{{ matrixInfo.enterpriseVerifyReason || '--' }}</span>
            </div>
          </div>
        </div>
        <p class="tiktok_num">
          {{
            matrixInfo.platform === 1
              ? '抖音号：'
              : matrixInfo.platform === 2
              ? '视频号：'
              : matrixInfo.platform === 3
              ? '小红书：'
              : matrixInfo.platform === 4
              ? '快手号：'
              : ''
          }}
          <span v-if="matrixInfo.dyDisplayId">{{ matrixInfo.dyDisplayId }}</span>
          <span v-else>--</span>
        </p>
        <p class="area">
          <el-tooltip effect="dark" placement="right-start" :content="matrixInfo.xuserDeptName">
            <span>
              部门：{{
                matrixInfo.xuserDeptName ? matrixInfo.xuserDeptName.split('/').pop() : '--'
              }}
            </span>
          </el-tooltip>
        </p>
        <p class="area">
          地区：
          <span v-if="!matrixInfo.province && !matrixInfo.location">--</span>
          <span v-else>{{ matrixInfo.province }}{{ matrixInfo.location }}</span>
        </p>

        <div class="operator_name" v-if="matrixInfo.operatorId && matrixInfo.fsOpenId">
          <span>运营者：</span>
          <el-tooltip effect="dark" placement="right-start" v-if="matrixInfo.operatorId">
            <template #content>
              姓名：
              <span v-if="matrixInfo.operatorName">{{ matrixInfo.operatorName }}</span>
              <span v-else>--</span>
              <br />
              电话：
              <table_column_phone
                v-if="matrixInfo.operatorPhone"
                :phone="matrixInfo.operatorPhone"
                color="fff"
              ></table_column_phone>
              <span v-else>--</span>
              <br />
              <p v-for="(e, i) in matrixInfo.UserDepDetails" :key="i">{{ e }}</p>
            </template>
            <div
              v-if="matrixInfo.fsOpenId"
              :class="matrixInfo.fsOpenId ? 'cursor' : ''"
              @click="matrixInfo.fsOpenId ? toFschat(matrixInfo.fsOpenId) : ''"
            >
              <img v-if="matrixInfo.operatorHead" :src="matrixInfo.operatorHead" alt />
              <default-photo v-else :name="matrixInfo.operatorName || '--'" />
              <span class="name">{{ matrixInfo.operatorName || '--' }}</span>
              <img
                v-if="matrixInfo.iconType === 2"
                class="fs_icon"
                src="@/assets/images/user/weChat.png"
                alt
              />
              <img
                v-if="matrixInfo.iconType === 3"
                class="fs_icon"
                src="@/assets/images/user/wx.png"
                alt
              />
              <img
                v-if="matrixInfo.iconType === 1"
                class="fs_icon"
                src="@/assets/images/content_center/fs.png"
                alt
              />
            </div>
          </el-tooltip>
          <span v-else>--</span>
        </div>
        <!-- 企微的运营者 -->
        <div v-else style="font-size: 12px; font-weight: 400; color: #909399; margin-top: 10px">
          <span>运营者：</span>
          <el-tooltip effect="dark" placement="right-start" v-if="matrixInfo.operatorId">
            <template #content>
              姓名：
              <span v-if="matrixInfo.operatorName">{{ matrixInfo.operatorName }}</span>
              <span v-else>--</span>
              <br />
              电话：
              <table_column_phone
                v-if="matrixInfo.operatorPhone"
                :phone="matrixInfo.operatorPhone"
                color="fff"
              ></table_column_phone>
              <span v-else>--</span>
              <br />
              <p v-for="(e, i) in matrixInfo.UserDepDetails" :key="i">{{ e }}</p>
            </template>
            <span style="cursor: pointer">
              <!-- 判断是否有名字，没有就-- -->
              <span v-if="matrixInfo.operatorName">{{ matrixInfo.operatorName }}</span>
              <span v-else>- -</span>
            </span>
          </el-tooltip>
          <span v-else>--</span>
        </div>

        <!--  编辑信息按钮-->
        <div class="edit_info" v-if="hasEditInfoPermission">
          <div class="edit_info_btn" @click="setAccount">编辑信息</div>
        </div>
        <!-- 企微跟飞书都没有运营者 -->
        <!-- <div
          class="operator_name"
          style="margin-top: 11px; font-size: 12px; font-weight: 400; color: #909399"
          v-else
        >
          运营者：--
        </div> -->

        <!-- <p class="introduction" :class="expandIntro ? 'introduction_active' : ''">
          {{ '简介：太平鸟官方直播间，感谢您的关注,感谢您的关注～新品上新！新品上新！新品上新!' }}
        </p>
        <div class="expand_wrap" @click="expand">
          <span>{{ expandIntro ? '收缩简介' : '展开简介' }}</span>
          <el-icon class="expand_icon" v-if="expandIntro"><arrow-up /></el-icon>
          <el-icon class="expand_icon" v-else><arrow-down /></el-icon>
        </div>-->
      </div>
      <div class="account_date">
        <h4 class="title">矩阵号数据</h4>
        <div class="date_list">
          <el-col class="date_item" :span="12" v-if="brandViewMode === 1">
            <span>{{ '￥' + wanSliceFormat(matrixInfo.sellAmount || 0) }}</span>
            <b>销售额</b>
          </el-col>
          <el-col class="date_item" :span="12">
            <span>{{ wanSliceFormat(matrixInfo.clueCnt || 0) }}</span>
            <b>线索数</b>
          </el-col>
          <el-col class="date_item" :span="12">
            <span>{{ wanSliceFormat(matrixInfo.fansCount || 0) }}</span>
            <b>粉丝数</b>
          </el-col>
          <el-col class="date_item" :span="12">
            <span>{{ wanSliceFormat(matrixInfo.fansGroupCount || 0) }}</span>
            <b>粉丝团</b>
          </el-col>
        </div>
      </div>
      <!-- <div class="account_date">
        <h4 class="title">线索数据</h4>
      <div class="date_list">-->
      <!-- <el-col class="date_item" :span="8">
            <span>{{wanSliceFormat(matrixInfo.fansGroupCount || 0)}}</span>
            <b>小程序</b>
      </el-col>-->
      <!-- <el-col class="date_item" :span="8">
            <span>{{wanSliceFormat(matrixInfo.fansGroupCount||0)}}</span>
            <b>经营工具</b>
      </el-col>-->
      <!-- </div>
      </div>-->
      <div class="account_date">
        <h4 class="title">直播数据</h4>
        <div class="date_list">
          <el-col class="date_item" :span="12" v-if="brandViewMode === 1">
            <span>{{ '￥' + wanSliceFormat(matrixInfo.liveSaleAmount || 0) }}</span>
            <b>销售额</b>
          </el-col>
          <el-col class="date_item" :span="12">
            <span>{{ wanSliceFormat(matrixInfo.livePeopleCount || 0) }}</span>
            <b>观看人次</b>
          </el-col>
          <el-col class="date_item" :span="12">
            <span>{{ wanSliceFormat(matrixInfo.roomSiteCount || 0) }}</span>
            <b>直播场次</b>
          </el-col>
          <el-col class="date_item" :span="12" v-if="brandViewMode === 1">
            <span>{{ '￥' + wanSliceFormat(matrixInfo.avgLiveSaleSaleAmount || 0) }}</span>
            <b>场均销售</b>
          </el-col>
        </div>
      </div>
      <div class="account_date">
        <h4 class="title">视频数据</h4>
        <div class="date_list">
          <el-col class="date_item" :span="12" v-if="brandViewMode === 1">
            <span>{{ '￥' + wanSliceFormat(matrixInfo.videoSaleAmount || 0) }}</span>
            <b>销售额</b>
          </el-col>
          <el-col class="date_item" :span="12">
            <span>{{ wanSliceFormat(matrixInfo.videosCount || 0) }}</span>
            <b>视频数</b>
          </el-col>
          <el-col class="date_item" :span="12">
            <span>{{ wanSliceFormat(matrixInfo.playCount || 0) }}</span>
            <b>视频播放</b>
          </el-col>
          <el-col class="date_item" :span="12">
            <span>{{ wanSliceFormat(matrixInfo.diggCount || 0) }}</span>
            <b>视频点赞</b>
          </el-col>
          <el-col class="date_item" :span="12">
            <span>{{ wanSliceFormat(matrixInfo.commentCount || 0) }}</span>
            <b>视频评论</b>
          </el-col>
          <el-col class="date_item" :span="12">
            <span>{{ wanSliceFormat(matrixInfo.shareCount || 0) }}</span>
            <b>视频分享</b>
          </el-col>
        </div>
      </div>
    </div>
    <div
      :class="{
        matrixDetails_right: true,
        platform_right:
          matrixInfo.platform !== 1
            ? !(isPublishVideo && matrixInfo.nativeIsDel === 0 && matrixInfo.platform != 2)
            : false
      }"
    >
      <el-tabs v-model="chooseTab" class="tab_components" @tab-click="changeTab">
        <el-tab-pane label="数据概览" name="dataOverview">
          <!-- 修改，除了抖音外其他平台的显示都与视频号相同 -->
          <dataOverview
            :platform="matrixInfo.platform !== 1 ? 'sph' : ''"
            v-if="chooseTab === 'dataOverview'"
            :openId="openId"
          />
        </el-tab-pane>
        <el-tab-pane label="直播分析" name="liveAnalysis" v-if="matrixInfo.platform === 1">
          <liveAnalysis v-if="chooseTab === 'liveAnalysis'" :openId="openId" />
        </el-tab-pane>
        <el-tab-pane label="视频分析" name="videoAnalysis" v-if="matrixInfo.platform === 1">
          <videoAnalysis v-if="chooseTab === 'videoAnalysis'" :openId="openId" />
        </el-tab-pane>
        <el-tab-pane
          label="矩阵号设置"
          name="setting"
          v-if="showSettingTab && matrixInfo.platform === 1"
        >
          <matrix-account-setting
            v-if="matrixInfo.xuserId && chooseTab === 'setting'"
          ></matrix-account-setting>
        </el-tab-pane>
        <!-- 发布视频的显示前提：发布平台权限 + 账号授权正常 + 非(抖音或者视频号平台) -->
        <el-tab-pane
          label="发布视频"
          name="publishVideo"
          v-if="
            isPublishVideo &&
            matrixInfo.nativeIsDel === 0 &&
            !(matrixInfo.platform == 1 || matrixInfo.platform == 2)
          "
        >
          <publishVideoDOM
            v-if="matrixInfo.xuserId && chooseTab === 'publishVideo'"
            :xuserId="matrixInfo.xuserId"
            :openId="openId"
            :platform="matrixInfo.platform"
          ></publishVideoDOM>
        </el-tab-pane>
      </el-tabs>
      <!-- <TabPane label="数据概览" name="dataOverview">
        <dataOverview v-if="chooseTab == 'dataOverview'" />
        :openId="openId" :isTalent="isTalent" :isBusiness="isBusiness" :isLark="isLark"
        :nickName="userInfo.nickName" :totalFansNum="userData.fansCount" :avatar="userInfo.head"
      </TabPane>-->
    </div>
    <!-- 编辑矩阵号信息   -->
    <AccountAuth
      v-if="accountAuthInfo.show"
      v-model="accountAuthInfo.show"
      :info="accountAuthInfo.info"
      @update="getMatrixInfo"
      :isConfigPermission="true"
    ></AccountAuth>
  </div>
</template>
<script setup>
import { resetPushState } from '@/utils/getRoute'
import qrcodeVue from 'qrcode.vue'
import DefaultPhoto from '../../../system/components/default_photo/index.vue'
import api from '@/api/content_center/content_matrix.js'
import liveAnimation from '../../components/live_animation.vue'
// 图片
import matrixTypep from '@/assets/images/content_center/matrix_typep.png'
import matrixTyper from '@/assets/images/content_center/matrix_typer.png'
import avatarImg from '@/assets/images/content_center/default_user.png'
// 图片end
// import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import dataOverview from '../components/data_overview/index.vue'
import liveAnalysis from '../components/live_analysis/index.vue'
import videoAnalysis from '../components/video_analysis/index.vue'
import matrixAccountSetting from '../components/matrix_account_setting.vue'
import publishVideoDOM from '../components/publish_video/publish_video.vue'
import AccountAuth from '@/views/system/authorization/components/account_auth.vue'
import { useRoute } from 'vue-router'
import { getUserPermission, wanSliceFormat } from '@/utils/tools.js'
import { useStore } from 'vuex'
import { concatDep } from './index.js'

const store = useStore()
const brandViewMode = computed(() => store.state.user.brandViewMode)
// const dyVersion = computed(() => store.state.user.dyVersion)

// 获取对应类型的图片
function getTypeImg(type) {
  let img = ''
  switch (type) {
    case 'EAccountM':
      img = matrixTypep
      break
    case 'EAccountS':
      img = matrixTyper
      break
    case 'EAccountK':
      img = matrixTyper
      break
  }
  return img
}
// 右侧tabbar
const rightTab = ref(['dataOverview', 'liveAnalysis', 'videoAnalysis', 'setting', 'publishVideo'])
// 获取左侧数据
const openId = ref('')
// const xUserId = ref('')
const matrixInfo = ref({})
const getMatrixInfo = () => {
  const data = {
    openId: openId.value
    // xuserId: xUserId.value
  }
  api.getMatrixInfo(data).then(res => {
    // console.log(res)
    const strArr = ref([])
    matrixInfo.value = res.data
    ;(matrixInfo.value.operatorDep || []).forEach(item => {
      item.userDepDetails.forEach(subItem => {
        // console.log(concatDep(subItem), 'concat')
        const str = ref(concatDep(subItem))
        console.log('str', str.value)
        // 增加规则部门嵌套<=4不处理>4取第一、二、三以及最后
        const concatArr = concatDep(subItem) && concatDep(subItem).split('/')
        if (concatArr && concatArr.length > 4) {
          str.value = `${concatArr[0]}/${concatArr[1]}/${concatArr[2]}/.../${
            concatArr[concatArr.length - 1]
          }`
        }
        strArr.value.push(str.value)
      })
      // 处理后的组织架构数组
      matrixInfo.value.UserDepDetails = strArr.value
    })
    console.log(matrixInfo.value, '获取matrixInfo.value的值-----------')
  })
}
// 拼接depName
// function concatDep(item) {
//   if (!item.childrenDep) return item.depName
//   return item.depName + '/' + concatDep(item.childrenDep)
// }
// 展开简介
// const expandIntro = ref(false)
// function expand() {
//   expandIntro.value = !expandIntro.value
// }
// tab切换
const chooseTab = ref('dataOverview')
// const router = useRouter()
function changeTab() {
  // const query = {
  //   openId: openId.value,
  //   type: chooseTab.value
  // }
  // router.push({ path: route.path, query })
  // 切换路由不刷新页面
  const newQuery = `?openId=${openId.value}&type=${chooseTab.value}`
  resetPushState(newQuery)
}
const route = useRoute()
if (route.query.openId) {
  openId.value = route.query.openId
}
if (route.query.type) {
  if (rightTab.value.indexOf(route.query.type) > -1) {
    chooseTab.value = route.query.type
  }
}
// 跳转矩阵号主页
function toAccount(dySecId) {
  window.open(`https://www.douyin.com/user/${dySecId}`)
}
// 跳转飞书聊天
function toFschat(openId) {
  window.open(`https://applink.feishu.cn/client/chat/open?openId=${openId}`)
}

// 显示矩阵号设置
const showSettingTab = computed(() => {
  return false
  // const systemModule = sessionStorage.getItem('systemModule')
  // return systemModule.includes('live_recording_screen')
})
// 是否有后台发布视频权限
const isPublishVideo = computed(() => {
  const systemModule = sessionStorage.getItem('systemModule')
  return systemModule.includes('publish_video')
})
onMounted(() => {
  getMatrixInfo()
  hasEditInfoPermission.value = !!getUserPermission('edit_info')
})

// 有编辑信息的权限
const hasEditInfoPermission = ref(false)
const accountAuthInfo = reactive({
  show: false,
  info: {}
})
const setAccount = () => {
  const { brandId, accountDepartmentId, openId, operatorId, operatorName } = matrixInfo.value
  accountAuthInfo.info = {
    brandId,
    openId,
    operationUserId: operatorId,
    accountDeptVo: {
      // 矩阵号 部门信息
      id: accountDepartmentId // number 矩阵号部门id
    },
    opeName: operatorName
  }
  accountAuthInfo.show = true
}
</script>
<style lang="scss" scoped>
@import './index.scss';
@import '../../components/css/qrcode.scss';
:deep(.platform_right .el-tabs__header.is-top) {
  display: none;
}
.edit_info {
  margin-top: 15px;
  text-align: center;
  .edit_info_btn {
    width: 98px;
    height: 32px;
    line-height: 32px;
    border-radius: 4px;
    border: 1px solid $theme_color;
    color: $theme_color;
    cursor: pointer;
    margin: 0 auto;
  }
}
</style>
