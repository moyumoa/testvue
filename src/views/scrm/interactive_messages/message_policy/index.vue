<template>
  <div class="matrix_wrap">
    <div class="head_wrap">
      <xm_search
        :searchComponents="searchComponents"
        :useOwnReset="true"
        @getData="searchName"
        @reset="searchName"
      ></xm_search>
    </div>
    <!-- table -->
    <div class="table_wrap" style="padding-top: 22px">
      <div class="head_wrap_tip">
        <img
          src="https://tagvv-1256030678.file.myqcloud.com/20230529xhu7v.png"
          alt=""
          class="rules_img"
        />
        矩阵号策略状态： 私信回复{{ strategyOverviewData.imOpenCount }}个，正常执行
        <span class="main_color_font">{{ strategyOverviewData.imNormalPullCount }}</span>
        个；视频回评{{ strategyOverviewData.videoOpenCount }}个，正常执行
        <span class="main_color_font">{{ strategyOverviewData.videoNormalPullCount }}</span>
        个； 直播获客{{ strategyOverviewData.liveOpenCount }}个，正常执行
        <span class="main_color_font">{{ strategyOverviewData.liveNormalPullCount }}</span>
        个
      </div>
      <div class="table_title">
        <div></div>
        <!-- 批量操作开关 -->
        <div class="btn_box">
          <template v-if="switchVal">
            <el-button plain @click="allChooseFun">{{ isAll ? '取消全选' : '全选' }}</el-button>
            <el-dropdown>
              <el-button style="margin-left: 16px" type="primary" :loading="touchLoading">
                批量策略设置
                <!--                <el-tooltip-->
                <!--                  popper-class="tooltip-class"-->
                <!--                  placement="top"-->
                <!--                  :style="{ 'margin-left': '4px' }"-->
                <!--                >-->
                <!--                  <template #content>-->
                <!--                    <p>未授权抖音web端的个人号不可设置</p>-->
                <!--                  </template>-->
                <!--                  &lt;!&ndash;                  <img src="@/assets/images/operate/tip_line.png" />&ndash;&gt;-->
                <!--                  <img src="https://tagvv-1256030678.file.myqcloud.com/20230423vb7jv.png" />-->
                <!--                </el-tooltip>-->
                <img src="https://tagvv-1256030678.file.myqcloud.com/202305050d8x9.png" />
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="batchTouch(0)">私信回复</el-dropdown-item>
                  <el-dropdown-item @click="batchTouch(1)">视频回评</el-dropdown-item>
                  <el-dropdown-item @click="batchTouch(2)">直播获客</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <el-button
              style="margin-left: 16px"
              type="primary"
              :loading="stopLoading"
              @click="allStop"
            >
              一键关闭所有策略
            </el-button>
          </template>
          <el-switch
            style="margin: 0 12px 0 24px"
            v-model="switchVal"
            inline-prompt
            :width="45"
            active-text="开"
            inactive-text="关"
          ></el-switch>
          <span style="color: #909399">批量操作</span>
        </div>
      </div>
      <xm_table
        :showSelection="switchVal"
        class="pic_table"
        tableType="avatarV2"
        rowKey="id"
        v-loading="tableState.loading"
        :data="tableState.listData"
        v-model:page="tableState.page"
        @getTableData="getList"
        @selection-change="handleSelectionChange"
        :checkSelectable="handleCheckSelectable"
        :select="chooseList"
        ref="matrixTable"
        :default-sort="{
          prop: brandViewMode === 1 ? 'sellAmount' : 'fansCount',
          order: 'descending'
        }"
      >
        <el-table-column label="矩阵号" prop="name" min-width="450">
          <template #default="scope">
            <div class="account_wrap" style="cursor: unset">
              <div class="avatar_wrap">
                <liveAnimation v-if="scope.row.roomStatus === 1"></liveAnimation>
                <img
                  class="avatar_icon"
                  :src="scope.row.dyHeadUrl ? scope.row.dyHeadUrl : avatarImg"
                  alt=""
                />
                <!-- 1.4 接口未返回privacyAccountStatus 而且位置与平台ICON重叠 因此跟产品同步过先禁用  -->
                <!-- <table_column_private_account
                  v-if="scope.row.privacyAccountStatus === 1"
                ></table_column_private_account> -->
                <el-tooltip
                  effect="dark"
                  v-if="scope.row.dyAuth == 2 || scope.row.byAuth == 2"
                  placement="top-start"
                >
                  <template #content>
                    <div style="max-width: 300px">
                      {{ scope.row.byAuth == 2 ? '百应授权失效' : '' }}
                      {{ scope.row.byAuth == 2 && scope.row.dyAuth == 2 ? ',' : '' }}
                      {{ scope.row.dyAuth == 2 ? '抖音授权失效' : '' }}
                    </div>
                  </template>
                  <img
                    class="expired_img"
                    src="@/assets/images/content_center/warning_icon.png"
                    alt=""
                  />
                </el-tooltip>
                <div class="platform_icon_box">
                  <div :class="[`xm_platformIcon_${scope.row.platform}`]"></div>
                </div>
              </div>
              <div class="account_info">
                <div>
                  <el-tooltip
                    class="box-item"
                    effect="dark"
                    placement="top"
                    :content="showAccountInfoName(scope.row)"
                  >
                    <span>{{ scope.row.dyNickname ? scope.row.dyNickname : '--' }}</span>
                  </el-tooltip>

                  <template v-if="scope.row.eaccountRole">
                    <img :src="getTypeImg(scope.row.eaccountRole)" alt="" />
                  </template>
                  <!-- 矩阵号类别 -->
                  <template v-if="scope.row.platform && scope.row.platform === 3">
                    <div class="red_tip">专业号</div>
                  </template>
                  <template v-else>
                    <!-- 品牌企业号、认证企业号、 -->
                    <div
                      class="blue_tip"
                      v-if="['EAccountK', 'EAccountS'].indexOf(scope.row.newDyType) > -1"
                    >
                      {{ DYAllType.getCN(scope.row.newDyType) }}
                    </div>
                    <!-- 普通企业号[灰]、个人号[灰]、认证企业号-员工号、品牌企业号-员工号 -->
                    <el-tooltip class="box-item" effect="dark" placement="top" v-else>
                      <template #content>
                        <!-- 员工号 -->
                        <div
                          class="tooltip_tip"
                          v-if="
                            ['EAccountEmployeeS', 'EAccountEmployeeK'].indexOf(
                              scope.row.newDyType
                            ) > -1
                          "
                        >
                          所属企业：{{ scope.row.enterpriseOpenNickname || '--' }}
                        </div>
                        <!-- 个人号 -->
                        <div class="tooltip_tip" v-if="scope.row.newDyType == 'PERSONAL'">
                          个人号可授权绑定为企业号的员工号，以获取企业号同等获客能力，请登录企业号后台绑定，
                          <span @click="toFun(1)">点击前往</span>
                        </div>
                        <!-- 普通企业号 -->
                        <div class="tooltip_tip" v-if="scope.row.newDyType == 'EAccountM'">
                          普通企业号无私信获客及回复的能力，建议升级为认证企业号，
                          <span @click="toFun(2)">点击去认证</span>
                        </div>
                      </template>
                      <div
                        :class="
                          ['PERSONAL', 'EAccountM'].indexOf(scope.row.newDyType) > -1
                            ? 'gray_tip'
                            : 'blue_tip'
                        "
                      >
                        {{ DYAllType.getCN(scope.row.newDyType) }}
                      </div>
                    </el-tooltip>
                  </template>
                  <!--   授权状态   -->
                  <div class="auth_line">
                    <div
                      class="auth_status"
                      :class="[scope.row.isDel === 0 ? 'auth_status_active' : '']"
                    >
                      <img
                        v-if="scope.row.isDel === 0"
                        src="https://tagvv-1256030678.file.myqcloud.com/20230408wllrm.png"
                        alt=""
                        class="status_icon"
                      />
                      <img
                        v-else
                        src="https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/e802782620e143da806f73166eff56e9_1687934379716.png"
                        alt="x"
                        class="status_icon"
                      />
                      {{ scope.row.platform ? PLATFORM.getCN(scope.row.platform) : '抖音' }}授权
                    </div>
                    <!-- <div
                      class="auth_status"
                      :class="[scope.row.dyWebAuthStatus === 1 ? 'auth_status_active' : '']"
                    >
                      <img
                        v-if="scope.row.dyWebAuthStatus === 1"
                        src="https://tagvv-1256030678.file.myqcloud.com/20230408wllrm.png"
                        alt=""
                        class="status_icon"
                      />
                      <img
                        v-else
                        src="https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/e802782620e143da806f73166eff56e9_1687934379716.png"
                        alt="x"
                        class="status_icon"
                      />
                      获客互动能力授权
                    </div> -->
                  </div>
                  <!-- 分组名 -->
                  <!--                  <div class="group_list">-->
                  <!--                    <template v-for="(item, index) in scope.row.accountGroupName">-->
                  <!--                      <div v-if="index < 3" class="new_group_name line-hidden1" :key="item">-->
                  <!--                        {{ item }}-->
                  <!--                      </div>-->
                  <!--                    </template>-->
                  <!--                  </div>-->
                  <!--                  <el-tooltip-->
                  <!--                    class="box-item"-->
                  <!--                    effect="dark"-->
                  <!--                    placement="top"-->
                  <!--                    v-if="scope.row.accountGroupName && scope.row.accountGroupName.length > 3"-->
                  <!--                  >-->
                  <!--                    <template #content>-->
                  <!--                      <div class="group_box">-->
                  <!--                        <span-->
                  <!--                          v-for="(item, index) in scope.row.accountGroupName"-->
                  <!--                          :key="index"-->
                  <!--                          class="new_group_name"-->
                  <!--                        >-->
                  <!--                          {{ item }}-->
                  <!--                        </span>-->
                  <!--                      </div>-->
                  <!--                    </template>-->
                  <!--                    <div style="margin-left: 8px">...</div>-->
                  <!--                  </el-tooltip>-->
                </div>
                <!-- 列表只返回抖音矩阵号，没有小红书 视频号 -->
                <!-- <p v-if="scope.row.platform === 2">
                  <span>视频号：{{ scope.row.dyDisplayId ? scope.row.dyDisplayId : '--' }}</span>
                </p>
                <p v-else-if="scope.row.platform === 3">
                  <span>小红书：{{ scope.row.dyDisplayId ? scope.row.dyDisplayId : '--' }}</span>
                </p> -->
                <p>
                  <span>
                    {{
                      scope.row.platform
                        ? PLATFORM.getCN(scope.row.platform) +
                          (scope.row.platform == 2 || scope.row.platform == 3 ? '' : '号')
                        : '抖音号'
                    }}：{{ scope.row.dyDisplayId ? scope.row.dyDisplayId : '--' }}
                  </span>
                  <el-popover
                    v-if="scope.row.dyUId && scope.row.platform == 1"
                    placement="bottom"
                    popper-class="qrcode_popper"
                    width="154px"
                    trigger="hover"
                  >
                    <template #reference>
                      <img
                        class="qrcode_img"
                        style="cursor: pointer"
                        src="@/assets/images/content_center/qrcode.png"
                        alt=""
                      />
                    </template>
                    <div class="qrcode_box" v-if="scope.row.dyUId">
                      <qrcode-vue :value="scope.row.dyUId" :size="126" level="H" />
                      <div class="qr_mark">
                        <img
                          src="https://tagvv-1256030678.cos.ap-shanghai.myqcloud.com/img/202111061652346e85b3672b.png"
                          alt=""
                        />
                        抖音扫码查看
                      </div>
                    </div>
                    <div v-else class="qrcode_box">
                      <div class="qr_mark">暂未找到相关地址</div>
                    </div>
                  </el-popover>
                </p>
                <table_column_department_info
                  className="gray_department_info"
                  :departmentName="scope.row.xuserDeptName"
                  connectStr="/"
                  divisionStr=";"
                  trigger="hover"
                  tipPlacement="right"
                  :showDpeartTitle="true"
                ></table_column_department_info>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="运营者" prop="phone" min-width="170">
          <template #default="scope">
            <span>{{ scope.row.operatorName || '--' }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="私信回复"
          column-key="openStrategyImCount"
          min-width="170"
          prop="openStrategyImCount"
        >
          <template #default="{ row }">
            <div
              class="list_setting"
              v-if="
                (row.platform === 1 &&
                  ((row.eaccountRole &&
                    (row.eaccountRole == 'EAccountS' || row.eaccountRole == 'EAccountK')) ||
                    row.enterpriseType)) ||
                row.platform === 3
              "
            >
              <div class="switch_line">
                <div :class="[row.isOpenStrategyIm == 1 ? 'open_icon' : 'close_icon']"></div>
                {{ row.isOpenStrategyIm == 1 ? '开启' : '关闭' }}
                <span class="blue_color" @click="getOneSetting(row, 0)">去设置</span>
              </div>
              <!--  开启状态下  抖音授权失效  显示    -->
              <div class="switch_tips" v-if="row.isOpenStrategyIm == 1 && row.isDel !== 0">
                <el-tooltip
                  :content="`${row.platform ? PLATFORM.getCN(row.platform) : '抖音'}授权失效`"
                  placement="top"
                >
                  <div class="switch_tips_icon"></div>
                </el-tooltip>
                回复不可用
              </div>
            </div>
            <div v-else>--</div>
          </template>
        </el-table-column>
        <el-table-column
          label="视频回评"
          column-key="openStrategyVideoCount"
          min-width="170"
          prop="openStrategyVideoCount"
        >
          <template #default="{ row }">
            <template v-if="row.platform === 1">
              <div class="list_setting">
                <div class="switch_line">
                  <div :class="[row.isOpenStrategyVideo == 1 ? 'open_icon' : 'close_icon']"></div>
                  {{ row.isOpenStrategyVideo == 1 ? '开启' : '关闭' }}
                  <span class="blue_color" @click="getOneSetting(row, 1)">去设置</span>
                </div>
                <!--  开启状态下  抖音授权失效  显示    -->
                <div class="switch_tips" v-if="row.isOpenStrategyVideo == 1 && row.isDel !== 0">
                  <el-tooltip :content="'抖音授权失效'" placement="top">
                    <div class="switch_tips_icon"></div>
                  </el-tooltip>
                  回评不可用
                </div>
              </div>
            </template>
            <div v-else>--</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播获客"
          column-key="openStrategyLiveCount"
          min-width="170"
          prop="openStrategyLiveCount"
        >
          <template #default="{ row }">
            <template v-if="row.platform === 1">
              <div class="list_setting">
                <div class="switch_line">
                  <div :class="[row.isOpenStrategyLive == 1 ? 'open_icon' : 'close_icon']"></div>
                  {{ row.isOpenStrategyLive == 1 ? '开启' : '关闭' }}
                  <span class="blue_color" @click="getOneSetting(row, 2)">去设置</span>
                </div>
                <!--  开启状态下  抖音授权失效  显示    -->
                <div class="switch_tips" v-if="row.isOpenStrategyLive == 1 && row.isDel !== 0">
                  <el-tooltip :content="'抖音授权失效'" placement="top">
                    <div class="switch_tips_icon"></div>
                  </el-tooltip>
                  获客不可用
                </div>
              </div>
            </template>
            <div v-else>--</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="right" header-align="right" fixed="right">
          <template #default="scope">
            <!--            <div class="enterTalk" @click="tacticsSetting(scope.row)">-->
            <!--              <span>策略设置</span>-->
            <!--            </div>-->
            <div @click="toTouchRecords(scope.row)" class="toTouchRecords">
              <span>触达记录</span>
            </div>
          </template>
        </el-table-column>
      </xm_table>
    </div>
    <!-- 批量策略设置弹框 -->
    <batchStrategySetting
      v-if="showBatchStrategySetting.show"
      v-model:show="showBatchStrategySetting.show"
      :showBatchStrategySetting="showBatchStrategySetting"
      @confirm="searchName"
    />
    <!--策略设置弹窗-->
    <strategySetting
      :info="info"
      v-if="strategyShow"
      v-model:strategyShow="strategyShow"
      :strategyShow="strategyShow"
      :showBatchStrategySetting="showBatchStrategySetting"
      @confirm="searchName"
      :searchComponents="searchComponents"
    ></strategySetting>
    <!--触达记录-->
    <interactionRecordDialog
      v-if="recordshow"
      v-model:recordshow="recordshow"
      :openId="recordOpenId"
      :recordshow="recordshow"
      :platform="recordPlatform"
    ></interactionRecordDialog>
  </div>
</template>
<script setup>
import { setBusinessChooseParam } from '@/utils/search.js'
import { PLATFORM } from '@/utils/dictionary/company.js'
import { DYAllType } from '@/utils/dictionary/content-center.js'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import qrcodeVue from 'qrcode.vue'
import { throttle } from '@/utils/tools.js'
import { getQuery } from '@/utils/get_query.js'
import batchStrategySetting from './components/batchStrategySetting/index.vue'
import strategySetting from './components/strategySetting/index.vue'
import interactionRecordDialog from './components/Interaction_record_dialog/index.vue'
import api from '@/api/content_center/content_matrix.js'
import { getStrategyList, strategyOpenSet, strategyOverview } from '@/api/scrm/policy.js'

// 图片
import matrixTypep from '@/assets/images/content_center/matrix_typep1.png'
import matrixTyper from '@/assets/images/content_center/matrix_typer1.png'
// import brandIcon from '@/assets/images/content_center/brand_icon.png'
import avatarImg from '@/assets/images/content_center/default_user.png'
// 图片end
import liveAnimation from '@/views/content_center/components/live_animation.vue'

const store = useStore()
const router = useRouter()
const brandViewMode = computed(() => store.state.user.brandViewMode)

const $confirm = inject('$confirm')
const $message = inject('$message')

const isAll = ref(false) // 全选的状态
const chooseList = ref([]) // 选中用户
const touchLoading = ref(false) // 批量触达loading
const stopLoading = ref(false) // 一键关闭所有策略loading
const switchVal = ref(false) // 批量开关
const matrixTable = ref() // table Dom
const info = ref() // 策略的弹窗打开
const recordPlatform = ref(null) // 触达记录矩阵号的平台
const recordOpenId = ref('') // 触达记录矩阵号的dyOpenId
const recordshow = ref(false) // 触达弹窗是否打开
const strategyShow = ref(false) // 单个策略的矩阵号

// 显示批量设置弹框
const showBatchStrategySetting = reactive({
  show: false, // 是否显示弹框
  chooseList: null, // 选择的
  isAll: false, // 是否全选
  chooseLength: null, // 选中的个数
  needShowDetail: false, // 是否需要回显
  isBatch: false // 是否是批量设置 用于显示 “已选择x个矩阵号”
})

const searchComponents = ref([
  {
    type: 'input',
    label: '矩阵号',
    val: '',
    placeholder: '请输入矩阵号昵称、抖音号',
    filed: 'accountName'
  },
  {
    type: 'chooseDept',
    label: '矩阵号部门',
    val: [],
    filed: 'orgIds',
    multiple: true,
    isUsePermission: true
  },
  {
    type: 'select',
    label: '矩阵号分组',
    placeholder: '请选择矩阵号分组',
    filed: 'groupIds',
    multiple: true,
    filterable: true,
    'collapse-tags': true,
    val: null,
    selects: [],
    selectDefultName: ['id', 'groupName']
  },
  {
    type: 'input',
    label: '运营者姓名',
    val: '',
    placeholder: '请输入运营者姓名',
    filed: 'operatorName'
  },
  // {
  //   type: 'input',
  //   label: '运营者手机号',
  //   val: '',
  //   placeholder: '请输入运营者手机号',
  //   filed: 'operatorPhone',
  //   isPhone: true
  // },
  {
    type: 'select',
    label: '私信回复',
    filed: 'isOpenStrategyIm',
    val: -1,
    defaultVal: -1,
    selects: [
      {
        label: '全部',
        value: -1
      },
      {
        label: '开启',
        value: 1
      },
      {
        label: '关闭',
        value: 0
      }
    ]
  },
  {
    type: 'select',
    label: '视频回评',
    filed: 'isOpenStrategyVideo',
    val: -1,
    defaultVal: -1,
    selects: [
      {
        label: '全部',
        value: -1
      },
      {
        label: '开启',
        value: 1
      },
      {
        label: '关闭',
        value: 0
      }
    ]
  },
  {
    type: 'select',
    label: '直播获客',
    filed: 'isOpenStrategyLive',
    val: -1,
    defaultVal: -1,
    selects: [
      {
        label: '全部',
        value: -1
      },
      {
        label: '开启',
        value: 1
      },
      {
        label: '关闭',
        value: 0
      }
    ]
  },
  {
    type: 'select',
    label: '矩阵号授权状态',
    filed: 'dyOpenAuthStatus',
    val: 0,
    defaultVal: 0,
    selects: [
      {
        label: '全部',
        value: -1
      },
      {
        label: '已授权',
        value: 0
      },
      {
        label: '授权失效',
        value: 1
      }
    ]
  }
  // {
  //   type: 'select',
  //   label: '获客互动能力授权状态',
  //   filed: 'dyWebAuthStatus',
  //   val: -1,
  //   defaultVal: -1,
  //   selects: [
  //     {
  //       label: '全部',
  //       value: -1
  //     },
  //     {
  //       label: '已授权',
  //       value: 1
  //     },
  //     {
  //       label: '未授权',
  //       value: 0
  //     },
  //     {
  //       label: '授权失效',
  //       value: 2
  //     }
  //   ]
  // }
])

function initSearch() {
  const index = searchComponents.value.findIndex(x => x.filed === 'isOpenStrategyLive')
  if (index > -1) {
    searchComponents.value.splice(index, 1)
  }
  const list = setBusinessChooseParam()
  searchComponents.value = searchComponents.value.concat(list)
}

// 获取分组
function getNewGroupList() {
  api.getNewGroupList({}).then(res => {
    if (res.code === 0) {
      searchComponents.value.forEach(item => {
        if (item.filed === 'groupIds') {
          item.selects = res.data || []
        }
      })
    }
  })
}

getNewGroupList()

const strategyOverviewData = ref({
  imOpenCount: 0,
  imNormalPullCount: 0,
  videoOpenCount: 0,
  videoNormalPullCount: 0,
  liveOpenCount: 0,
  liveNormalPullCount: 0
})
// 获取矩阵获客开启情况的统计数据
const getStrategyOverview = () => {
  strategyOverview({}).then(res => {
    if (res.code === 0) {
      strategyOverviewData.value = res.data
    }
  })
}

function showAccountInfoName(row) {
  return row.dyNickname || row.dyNickname || '--'
}
// table列表
const tableState = reactive({
  loading: false,
  listData: [], // 列表
  page: {
    index: 1,
    size: 10,
    total: 10
  },
  orderItem: brandViewMode.value === 1 ? 'amount' : 'fans',
  orderBy: 2
})

// 获取列表
function getList() {
  getStrategyOverview()
  tableState.loading = true
  const data = getQuery(searchComponents.value)
  const query = {
    accountName: data.accountName,
    groupIds: data.groupIds || [],
    operatorName: data.operatorName,
    operatorPhone: data.operatorPhone,
    isOpenStrategyIm: data.isOpenStrategyIm,
    isOpenStrategyVideo: data.isOpenStrategyVideo,
    isOpenStrategyLive: data.isOpenStrategyLive,
    dyOpenAuthStatus: data.dyOpenAuthStatus === -1 ? null : data.dyOpenAuthStatus,
    dyWebAuthStatus: data.dyWebAuthStatus === -1 ? null : data.dyWebAuthStatus,
    orgIds: data.orgIds,
    pageNo: tableState.page.index,
    pageSize: tableState.page.size,
    searchCount: true
  }
  if (data.businessQueryParams) {
    query.businessQueryParams = data.businessQueryParams
  }
  // console.log('获取列表的入参', query)
  // if (query) return
  getStrategyList(query)
    .then(res => {
      if (res.code === 0) {
        console.log('获取到的矩阵号列表', res.data)
        tableState.page.total = res.data.total
        tableState.listData = res.data.records.map(x => {
          x = {
            ...x,
            newDyType: getDyType(x),
            strategyIsOpen: x.strategyIsOpen === 1 // 策略是否开启，1开启true，其他未开启false
          }
          return x
        })
        nextTick(() => {
          if (isAll.value) {
            // matrixTable.value?.$refs.table.toggleAllSelection()
            setCheck(true)
          }
        })
      }
      tableState.loading = false
    })
    .catch(() => {
      tableState.loading = false
    })
}
// 从groups里获取矩阵号类型 enterpriseType 有数据就代表是员工号 EAccountS 认证企业号-员工号 EAccountK 品牌企业号-员工号 其余就从eaccountRole拿
function getDyType(item) {
  if (item.enterpriseType) {
    return item.enterpriseType === 'EAccountS'
      ? 'EAccountEmployeeS'
      : item.enterpriseType === 'EAccountK'
      ? 'EAccountEmployeeK'
      : 'PERSONAL'
  } else {
    return item.eaccountRole || 'PERSONAL'
  }
  // const data = item.groups || []
  // if (data && data.length > 0) {
  //   let res = 'PERSONAL'
  //   data.forEach(x => {
  //     if (DYALLTypeList.indexOf(x.groupValue) > -1) {
  //       res = x.groupValue
  //     }
  //   })
  //   return res
  // } else {
  //   return item.eaccountRole || 'PERSONAL'
  // }
}
// 搜索
function searchName(isNotInit) {
  console.log('isNotInit', isNotInit)
  // 单个矩阵号设置成功不需要刷新回到第一页。
  if (!isNotInit) {
    tableState.page.index = 1
  }
  tableState.loading = true
  // 查询和重置的时候，都把选中项清空掉
  isAll.value = false
  // 清除表格所有的选中项
  matrixTable.value.$refs.table.clearSelection()
  getList()
}

// 表格全选
function setCheck(check) {
  tableState.listData.forEach(y => {
    matrixTable.value?.$refs.table.toggleRowSelection(y, check)
  })
  console.log('13412')
}

function getOneSetting(val, type) {
  strategyShow.value = true
  console.log('这是单个的设置', type, strategyShow.value)
  tacticsSetting(val, type)
}

// 点击全选的按钮
const allChooseFun = throttle(() => {
  if (isAll.value) {
    matrixTable.value?.$refs.table.clearSelection()
  } else {
    setCheck(true)
  }
  nextTick(() => {
    isAll.value = !isAll.value
  })
}, 700)
// 全选禁止选择
function handleCheckSelectable(row) {
  if (isAll.value) {
    return false
  } else {
    return true
  }
}

// 点击批量触达
// show: false, // 是否显示弹框
// chooseList: null, // 选择的ids
// isAll: false, // 是否全选
// chooseLength: null // 选中的个数
const batchTouch = throttle(type => {
  // 选择≥1个矩阵号才可以打开批量策略设置弹窗，否则toast“请选择矩阵号”，“全选”为全选所有矩阵号，列表表头的复选框为当前列表全选，点击矩阵号前的复选框，可选中当前矩阵号
  if (chooseList?.value.length < 1) return $message.warning('请选择矩阵号')
  touchLoading.value = true
  // 处理ID
  // 首先判断是否是全选，如果全选就要调用接口获取所有列表，如果不是就用table的选择列表
  // 2023/6/13 解决顾家数据量大(16000+)情况下，getList接口超时问题，批量开启接口不再获取所有列表，而是怎加是否全选字段
  if (chooseList.value && chooseList.value.length > 0) {
    showBatchStrategySetting.chooseList = chooseList.value // 选择的ids
    showBatchStrategySetting.isAll = isAll.value // 是否全选
    showBatchStrategySetting.needShowDetail = false
    showBatchStrategySetting.isBatch = true
    strategyShow.value = true
    showBatchStrategySetting.type = type // 选的三种类型的哪种类型
    if (isAll.value) {
      console.log('当前是全选状态下--')
      showBatchStrategySetting.chooseLength = tableState.page.total // 选择矩阵号数量
    } else {
      console.log('当前是非全选的情况下--')
      showBatchStrategySetting.chooseLength = chooseList.value.length
    }
    // 关闭loading
    touchLoading.value = false
  } else {
    touchLoading.value = false
    $message.warning('请先选择矩阵号')
  }
}, 700)
// 关闭所有策略
const allStop = throttle(() => {
  $confirm({
    title: '系统提醒',
    content: '确认关闭所有矩阵号的策略？',
    success() {
      stopLoading.value = true
      // 先获取所有矩阵号
      // const query = {
      //   accountName: '',
      //   groupIds: [],
      //   operatorName: '',
      //   operatorPhone: '',
      //   pageNo: 1,
      //   // pageSize: tableState.page.total,
      //   pageSize: 99999,
      //   searchCount: true
      // }
      // getStrategyList(query)
      //   .then(res => {
      //     if (res.code === 0) {
      //       // console.log('获取全部列表的返回->', res)
      //       const choseListPlatformDy = []
      //       res.data.records.forEach(item => {
      //         choseListPlatformDy.push(item.id)
      //       })
      //       if (choseListPlatformDy?.length === 0) {
      //         return $message.warning('暂无可操作的矩阵号')
      //       }
      const parma = {
        isControlAll: true,
        isOpen: 0
      }
      strategyOpenSet(parma).then(res => {
        if (res.code === 0) {
          $message.success('一键设置成功')
          searchName()
        }
      })
      stopLoading.value = false
    }
    // })
    // .catch(() => {
    //   stopLoading.value = false
    // })
    // }
  })
}, 700)

// table 选项发生变化
function handleSelectionChange(e) {
  chooseList.value = e
}

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

// // 点击策略设置
const tacticsSetting = throttle((item, type) => {
  showBatchStrategySetting.chooseList = [item] // 选择的矩阵号 {单个 对象}
  showBatchStrategySetting.isAll = false // 是否全选
  showBatchStrategySetting.chooseLength = 1 // 选择矩阵号数量
  showBatchStrategySetting.needShowDetail = true // 需要回显
  showBatchStrategySetting.isBatch = false // 是否是批量操作
  showBatchStrategySetting.type = type // 选的三种类型的哪种类型
}, 700)

// 去触达记录
const toTouchRecords = throttle(row => {
  console.log('去触达记录需要的dyOpenID', row)
  recordshow.value = true
  recordOpenId.value = row.dyOpenId
  recordPlatform.value = row.platform || 1
}, 700)

onMounted(() => {
  initSearch()
  if (router.currentRoute.value.query.dyNickname) {
    searchComponents.value.forEach(item => {
      if (item.filed === 'accountName') {
        item.val = router.currentRoute.value.query.dyNickname
      }
      if (item.filed === 'dyOpenAuthStatus') {
        item.val = -1
      }
    })
  }
  getList()
  getStrategyOverview()
})
// 普通企业号和个人号的跳转
const toFun = throttle(type => {
  const url =
    type === 1
      ? 'https://e.douyin.com/site/douyin-mp/login'
      : 'https://renzheng.douyin.com/site/home'

  window.open(url, '_blank')
}, 700)
</script>
<style lang="scss" scoped>
@import '@/views/content_center/content_matrix/manage/index.scss';
@import '@/views/content_center/components/css/qrcode.scss';

.head_wrap {
  position: relative;
}
.table_wrap {
  position: relative;
}

.head_wrap_tip {
  //position: absolute;
  display: flex;
  align-items: center;
  height: 48px;
  background: #eaedfa;
  border-radius: 4px;
  border: 1px solid #889cff;
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #323233;
  margin-bottom: 16px;

  .rules_img {
    width: 16px;
    height: 16px;
    min-width: 16px;
    margin-right: 8px;
    margin-left: 16px;
  }
}
.auth_line {
  display: flex;
  align-items: center;
  .auth_status {
    display: flex;
    align-items: center;
    height: 20px;
    font-size: 12px;
    background-color: rgba(144, 147, 153, 0.1);
    border-radius: 2px;
    color: #909399;
    padding: 0 4px;
    margin-left: 8px;
    .status_icon {
      width: 12px !important;
      height: 12px !important;
      margin-right: 3px;
      margin-left: 0 !important;
    }
  }
  .auth_status_active {
    color: #36c723;
    background-color: rgba(54, 199, 35, 0.1);
  }
}

.list_setting {
  .switch_line {
    display: flex;
    align-items: center;
  }
  .open_icon {
    width: 6px;
    height: 6px;
    background: #36c723;
    border-radius: 3px;
    margin-right: 8px;
  }
  .close_icon {
    width: 6px;
    height: 6px;
    background: #bfc4cd;
    border-radius: 3px;
    margin-right: 8px;
  }
  .switch_tips {
    margin-top: 4px;
    width: 86px;
    display: flex;
    align-items: center;
    background-color: rgba(144, 147, 153, 0.1);
    font-size: 12px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #909399;
    line-height: 18px;
    padding: 0 4px;
    border-radius: 2px;
    .switch_tips_icon {
      width: 14px;
      height: 14px;
      background-image: url('https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/9bc077aa7c6e415d9a690625fb30a891_1687934927660.png');
      background-size: contain;
      margin-right: 4px;
    }
  }
  img {
    width: 14px;
    height: 14px;
    margin-right: 2px;
    vertical-align: -2px;
  }

  .blue_color {
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #364fcd;
    margin-left: 8px;
    cursor: pointer;
  }
}

.toTouchRecords,
.enterTalk {
  display: inline-block;
  cursor: pointer;
  color: #364fcd;

  &:hover {
    color: rgb(102, 177, 255);
  }

  > span:hover {
    border-bottom: 1px solid #3575eb;
  }
}

.enterTalk {
  &::after {
    content: '';
    display: inline-block;
    height: 12px;
    margin: 0 10px;
    vertical-align: middle;
    border-right: 1px solid #bfc4cd;
  }
}

// .toTouchRecords {
//   &::after {
//     content: '';
//     display: inline-block;
//     height: 12px;
//     margin: 0 10px;
//     vertical-align: middle;
//     border-right: 1px solid #fff;
//   }
// }
.table_title {
  display: flex;
  align-items: center;
  justify-content: space-between;

  img {
    width: 13px;
    height: 13px;
    margin-left: 8px;
  }
}

.tooltips_box {
  display: flex;
}

.setting_color {
  color: #364fcd;
}
.tooltip_tip {
  max-width: 300px;
  span {
    color: rgb(35, 136, 255);
    cursor: pointer;
  }
}
.blue_tip {
  margin-left: 8px;
  padding: 0 4px;
  height: 18px !important;
  background: rgba(54, 79, 205, 0.1);
  border-radius: 2px;
  font-size: 12px !important;
  font-weight: 400;
  color: #364fcd !important;
  line-height: 18px !important;
}
.red_tip {
  margin-left: 8px;
  padding: 0 4px;
  height: 18px !important;
  background: #ffebeb;
  border-radius: 2px;
  font-size: 12px !important;
  font-weight: 400;
  color: #d40000 !important;
  line-height: 18px !important;
}
.gray_tip {
  color: #909399 !important;
  height: 18px !important;
  background: rgba(144, 147, 153, 0.1);
  font-size: 12px !important;
  border-radius: 2px;
  padding: 0 4px;
  margin-left: 8px;
  line-height: 18px !important;
}
.platform_icon_box {
  position: absolute;
  right: 6px;
  bottom: 6px;
}
</style>
