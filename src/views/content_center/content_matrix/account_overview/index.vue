<template>
  <div>
    <div class="data_overview">
      <div class="title">数据总览</div>
      <div class="data_list">
        <el-popover
          placement="bottom"
          width="auto"
          trigger="hover"
          effect="dark"
          v-for="(item, index) in $data.dataList"
          :key="index"
          popper-class="data_popper_warp"
          :disabled="item.label == '潜客活跃矩阵号数'"
        >
          <template #reference>
            <div class="data_item overview_item">
              <div class="data_num">{{ item.value || '0' }}</div>
              <div :class="{ data_text: true, data_icon_box: item.icon }">
                {{ item.label }}
                <img
                  v-if="item.icon"
                  :src="item.icon"
                  class="data_icon"
                  alt=""
                  @click="toManage(item)"
                />
              </div>
              <div class="data_tip">
                <el-tooltip class="item" effect="dark" placement="top">
                  <template #content>
                    <template v-if="item.label === '矩阵号数'">
                      <div class="tooltip_wrap">
                        <!-- 授权接入过系统的所有抖音账号数（包含授权失效的账号） -->
                        授权接入过系统的所有矩阵号数量（包含已失效的）
                      </div>
                    </template>
                    <template v-if="item.label === '授权有效矩阵号数'">
                      <div class="tooltip_wrap">
                        <!-- 授权抖音开放平台并且授权状态为正常未失效的账号数量 -->
                        当前授权状态为有效的矩阵号数量
                      </div>
                    </template>
                    <template v-if="item.label === '活跃矩阵号数'">
                      <div class="tooltip_wrap">
                        <!-- 授权有效账号中，7天内发布过有效视频或者做过有效直播的账号数。 -->
                        7天内发布过有效视频或图文或做过有效直播的授权有效账号数量
                        <br />
                        有效视频：时长大于5秒，播放数大于50的视频
                        <br />
                        有效图文：播放数大于50的图文
                        <br />
                        有效直播：时长大于15分钟，场观大于30的直播
                      </div>
                    </template>
                    <template v-if="item.label === '沉默矩阵号数'">
                      <div class="tooltip_wrap">
                        <!-- 授权有效账号中，7天内没有发过视频也没有做过直播的矩阵号数 -->
                        7天内没有发过视频也没有做过直播的授权有效抖音号数量
                      </div>
                    </template>
                    <template v-if="item.label === '潜客活跃矩阵号数'">
                      <div class="tooltip_wrap">3天内有获取到新潜客的活跃矩阵号数量</div>
                    </template>
                    <!--                <template v-if="item.label === '企业号数'">-->
                    <!--                  <div class="tooltip_wrap">-->
                    <!--                    授权有效账号中，抖音账号类型为认证企业号的抖音号数量-->
                    <!--                  </div>-->
                    <!--                </template>-->
                    <!--                <template v-if="item.label === '个人号数'">-->
                    <!--                  <div class="tooltip_wrap">授权有效账号中，抖音账号类型为个人号的抖音号数量</div>-->
                    <!--                </template>-->
                  </template>
                  <img src="@/assets/images/operate/tip_line.png" alt />
                </el-tooltip>
              </div>
            </div>
          </template>
          <div class="tips_warp" v-if="item.detObj">
            <div class="platform_warp">
              <div class="platform_item" v-for="(pItem, pIndex) in platformArr" :key="pIndex">
                <div :class="`xm_platformIcon_${pItem.id}`" style="left: 0"></div>
                <div class="platform_data">{{ item.detObj[`${pItem.key}${item.key}`] }}</div>
              </div>
            </div>
          </div>
        </el-popover>
      </div>
    </div>
    <div class="table_wrapper">
      <div class="table_wrapper_header">
        <div class="title">
          <span>矩阵号等级分布</span>
          <span class="subtitle">每天02:00更新</span>
        </div>
        <div class="action">
          <!-- <el-cascader
            v-model="$data.currentDepartment"
            @change="onChangeDepartment"
            :options="$data.departmentList"
            :popperAppendToBody="false"
            clearable
            popper-class="department-cascader"
            :props="{
              checkStrictly: true,
              value: 'id',
              label: 'name',
              children: 'children',
              emitPath: false
            }"
            placeholder="请选择矩阵号部门"
          ></el-cascader> -->
          <choose_dept_search
            ref="chooseDeptSearchRef"
            @updateDeptIds="onChangeDepartment"
            :multiple="false"
            :isUsePermission="true"
            searchLabel="矩阵号部门"
          />
          <div class="rule_text" @click="toSetting">
            <span>账号等级规则</span>
            <img
              style="width: 18px; height: 18px"
              src="https://tagvvcloud-brandapp-1256030678.cos.ap-guangzhou.myqcloud.com/2cb9587bbb694c44ad66a2d0d5524d98形状@2x (1).png"
            />
          </div>
        </div>
      </div>
      <div class="table">
        <div class="table_scroll_view" v-loading="$data.listLoading">
          <div
            class="table_column"
            v-for="(item, index) in $data.tableList"
            :key="index"
            :style="{
              'background-color': item.backgroundColor
            }"
          >
            <div
              class="skewed"
              :style="{
                width: calcProgressWidth(item.accountNum || 0),
                background: item.color
              }"
            ></div>
            <div class="table_column_content">
              <div
                class="level"
                :style="{
                  color: item.fontColor
                }"
              >
                <i :style="{ 'background-image': `url(${item.icon})` }"></i>
                <span class="level_name">{{ item.gradeName || '--' }}</span>
                <span class="level_value">{{ wanSliceFormat(item.accountNum || 0) }}</span>
                <span class="unit" v-if="item.accountNum">个</span>
              </div>
              <div class="table_data">
                <div class="data_item">
                  <div class="data_num">{{ wanSliceFormat(item.avgFans || 0) }}</div>
                  <div class="data_text">平均粉丝数</div>
                </div>
                <div class="data_item">
                  <div class="data_num">{{ wanSliceFormat(item.avgVideoPlayNum || 0) }}</div>
                  <div class="data_text">近7日单条视频平均播放量</div>
                </div>
                <div class="data_item">
                  <div class="data_num">{{ wanSliceFormat(item.avgLiveWatch || 0) }}</div>
                  <div class="data_text">近7日单场直播平均观看人次</div>
                </div>
              </div>
              <!-- <div class="placeholder_block"></div> -->
              <div class="account_wrapper">
                <div class="line"></div>
                <template v-if="item.userListVOList && item.userListVOList.length">
                  <div class="account_list">
                    <template v-for="(user, i) in item.userListVOList" :key="i">
                      <div class="account_item" v-if="i <= 3" @click="toAccountDetail(user)">
                        <div class="img_warp">
                          <img :src="user.dyHeadUrl" class="avatar" />
                          <div
                            :class="`xm_platformIcon_${user.platform}`"
                            style="right: -8px"
                          ></div>
                        </div>
                        <div class="name">{{ user.dyNickname }}</div>
                      </div>
                    </template>
                  </div>
                  <div class="more" @click="toMore(item)">
                    <span>更多</span>
                    <el-icon><i-arrow-right /></el-icon>
                  </div>
                </template>
              </div>
            </div>
          </div>
          <el-empty description="暂无矩阵号" v-if="!$data.tableList.length" />
        </div>
      </div>
    </div>
    <el-dialog v-model="$data.ruleDialog" width="420px">
      <template #title>
        <div class="dialog_title">账号等级规则</div>
      </template>
      <div class="dialog_content">
        <div class="tips">
          账号指数根据账号的粉丝数、视频表现、直播表现、转化表现综合计算得出，每天更新一次。
        </div>
        <div class="rules">
          <p @click="showCalceDialog">
            计算规则
            <img
              src="https://tagvvcloud-brandapp-1256030678.cos.ap-guangzhou.myqcloud.com/1f581eb9b0224496b8a101e4825908cb矩形@2x(5).png"
            />
          </p>
        </div>
        <el-table :data="$data.levelRules" style="width: 100%">
          <el-table-column prop="name" label="账号级别" />
          <el-table-column prop="rule" label="账号指数" width="120" />
        </el-table>
      </div>
    </el-dialog>
    <!-- 账号指数计算规则 -->
    <el-dialog v-model="$data.calcDialog" width="420px" @close="closeCalcDialog">
      <template #title>
        <div class="dialog_title">账号指数计算规则</div>
      </template>
      <div class="dialog_content">
        <div class="tips">
          计算指数的维度有：
          <span v-for="(item, index) in $data.exponentRule" :key="index">
            {{ item.exponentName }}{{ index < $data.exponentRule.length - 1 ? '、' : '' }}
          </span>
        </div>
        <div class="tips" style="margin: 12px 0 18px">
          计算的方式为计算每个维度的得分并计算总和，作为最终账号指数单一维度得分
          <span>=</span>
          维度值
          <span>÷</span>
          量级参数
          <span>×</span>
          维度权重
        </div>
        <div class="calc_title">账号指数</div>
        <div class="calc_content">
          <template v-for="(x, y) in $data.exponentRule" :key="y">
            <div class="one_calc" v-if="x.isOpen === 1">
              <p class="add_calc">{{ y > 0 ? '+' : '=' }}</p>
              <p>
                {{ x.exponentName }} {{ x.factor ? '/ ' + x.factor : '' }} *
                {{ x.exponentValue }}
              </p>
            </div>
          </template>
        </div>
        <div class="rules" style="margin: 16px 0 0" v-if="haveSystemSetting">
          <p @click="toSetting">
            计算规则设置
            <img
              src="https://tagvvcloud-brandapp-1256030678.cos.ap-guangzhou.myqcloud.com/1f581eb9b0224496b8a101e4825908cb矩形@2x(5).png"
            />
          </p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import api from '@/api/content_center/content_matrix'
import { wanSliceFormat, throttle, isNotEmpty } from '@/utils/tools'
import { useRouter } from 'vue-router'

const router = useRouter()
const $data = reactive({
  currentDepartment: '',
  dataList: [
    {
      label: '矩阵号数',
      value: ''
    },
    {
      label: '授权有效矩阵号数',
      value: ''
    },
    {
      label: '活跃矩阵号数',
      icon: 'https://tagvv-1256030678.file.myqcloud.com/20221216574me.png',
      value: ''
    },
    {
      label: '沉默矩阵号数',
      icon: 'https://tagvv-1256030678.file.myqcloud.com/20221216574me.png',
      value: ''
    },
    {
      label: '潜客活跃矩阵号数',
      icon: 'https://tagvv-1256030678.file.myqcloud.com/20221216574me.png',
      value: ''
    }
    // {
    //   label: '企业号数',
    //   value: ''
    // },
    // {
    //   label: '个人号数',
    //   value: ''
    // }
  ],
  level: [
    {
      icon: 'https://tagvv-1256030678.file.myqcloud.com/20220623nsfdx.png',
      fontColor: '#6C63D2',
      color: 'linear-gradient(135deg, #C2BFFF 0%, #928BEA 100%)',
      backgroundColor: '#F1F0FF'
    },
    {
      fontColor: '#CC9034',
      icon: 'https://tagvv-1256030678.file.myqcloud.com/20220623t6uel.png',
      color: 'linear-gradient(135deg, #FADCA2 0%, #F7C477 100%)',
      backgroundColor: '#FFF8ED'
    },
    {
      fontColor: '#69A6D5',
      icon: 'https://tagvv-1256030678.file.myqcloud.com/20220623bemhi.png',
      color: 'linear-gradient(135deg, #D3EAFF 0%, #ADD2EF 100%)',
      backgroundColor: '#F0F9FF'
    },
    {
      fontColor: '#CA8F5C',
      icon: 'https://tagvv-1256030678.file.myqcloud.com/20220623q7oaw.png',
      color: 'linear-gradient(135deg, #FBDCBA 0%, #EDC29F 98%)',
      backgroundColor: '#FFF7F0'
    },
    {
      fontColor: '#78A4D9',
      icon: 'https://tagvv-1256030678.file.myqcloud.com/20220623wzywj.png',
      color: 'linear-gradient(135deg, #D7E4F4 0%, #A7C2E2 100%)',
      backgroundColor: '#F3F8FF'
    }
    // {
    //   fontColor: '#78A4D9',
    //   icon: 'https://tagvv-1256030678.file.myqcloud.com/20220623wzywj.png',
    //   color: 'linear-gradient(135deg, #D7E4F4 0%, #9AB5D7 100%)',
    //   backgroundColor: '#F3F8FF'
    // }
  ],
  tableList: [],
  listLoading: false,
  ruleDialog: false,
  levelRules: [],
  allAccountNum: 0, // 全部矩阵号数量
  maxAccountNum: 0,
  calcDialog: false, // 计算规则的弹窗
  exponentRule: [] // 指数计算规则
})

const platformArr = [
  { id: 1, key: 'dy' },
  { id: 3, key: 'xhs' },
  { id: 4, key: 'ks' },
  { id: 2, key: 'wx' }
]

// 数据概览
function getAccountData() {
  api.getAccountCountData().then(res => {
    $data.dataList = [
      {
        label: '矩阵号数',
        value: wanSliceFormat(res.data.accountNum),
        key: 'AccountNum',
        detObj: {
          dyAccountNum: wanSliceFormat(res.data.dyAccountNum),
          xhsAccountNum: wanSliceFormat(res.data.xhsAccountNum),
          wxAccountNum: wanSliceFormat(res.data.wxAccountNum),
          ksAccountNum: wanSliceFormat(res.data.ksAccountNum)
        } // 详细数据
      },
      {
        label: '授权有效矩阵号数',
        value: wanSliceFormat(res.data.authAccountNum),
        key: 'AuthAccountNum',
        detObj: {
          dyAuthAccountNum: wanSliceFormat(res.data.dyAuthAccountNum),
          xhsAuthAccountNum: wanSliceFormat(res.data.xhsAuthAccountNum),
          wxAuthAccountNum: wanSliceFormat(res.data.wxAuthAccountNum),
          ksAuthAccountNum: wanSliceFormat(res.data.ksAuthAccountNum)
        } // 详细数据
      },
      {
        label: '活跃矩阵号数',
        icon: 'https://tagvv-1256030678.file.myqcloud.com/20221216574me.png',
        value: wanSliceFormat(res.data.activeAccountNum),
        key: 'ActiveAccountNum',
        detObj: {
          dyActiveAccountNum: wanSliceFormat(res.data.dyActiveAccountNum),
          xhsActiveAccountNum: wanSliceFormat(res.data.xhsActiveAccountNum),
          wxActiveAccountNum: wanSliceFormat(res.data.wxActiveAccountNum),
          ksActiveAccountNum: wanSliceFormat(res.data.ksActiveAccountNum)
        } // 详细数据
      },
      {
        label: '沉默矩阵号数',
        icon: 'https://tagvv-1256030678.file.myqcloud.com/20221216574me.png',
        value: wanSliceFormat(res.data.silenceAccountNum),
        key: 'SilenceAccountNum',
        detObj: {
          dySilenceAccountNum: wanSliceFormat(res.data.dySilenceAccountNum),
          xhsSilenceAccountNum: wanSliceFormat(res.data.xhsSilenceAccountNum),
          wxSilenceAccountNum: wanSliceFormat(res.data.wxSilenceAccountNum),
          ksSilenceAccountNum: wanSliceFormat(res.data.ksSilenceAccountNum)
        } // 详细数据
      },
      {
        label: '潜客活跃矩阵号数',
        icon: 'https://tagvv-1256030678.file.myqcloud.com/20221216574me.png',
        value: wanSliceFormat(res.data.clientActiveAccountNum),
        key: '',
        detObj: null
      }
      // {
      //   label: '企业号数',
      //   value: wanSliceFormat(res.data.companyAccountNum)
      // },
      // {
      //   label: '个人号数',
      //   value: wanSliceFormat(res.data.personAccountNum)
      // }
    ]
  })
}
// 矩阵号等级分布
function getAccountLevel() {
  $data.listLoading = true
  api
    .getAccountGradeGroup({
      area: $data.currentDepartment
    })
    .then(res => {
      $data.listLoading = false
      const _listData = []
      const accountList = []
      let allCount = 0
      res.data.forEach((item, index) => {
        allCount += item.accountNum
        accountList.push(item.accountNum)
        let _item = JSON.parse(JSON.stringify(item))
        _item = Object.assign(_item, $data.level[index < 5 ? index : 4])
        _listData.push(_item)
      })
      $data.tableList = _listData
      $data.allAccountNum = allCount
      $data.maxAccountNum = Math.max(...accountList)
    })
}
function calcProgressWidth(num) {
  const ACCOUNT_WIDTH = 368 // 矩阵号宽度
  const PADDING = 36
  const maxCount = $data.maxAccountNum // 满进度条数量
  const percent = num > maxCount ? 1 : num / maxCount
  const progressWidth = `calc((${100}% - ${PADDING}px - ${ACCOUNT_WIDTH}px) *  (${percent}))`
  console.log('progressWidth', progressWidth)
  return progressWidth
}
// function getLevelRules() {
//   let brandInfo = localStorage.getItem('brandInfo')
//   brandInfo = brandInfo ? JSON.parse(brandInfo) : {}
//   api.getGradeRuleByBrandId({ realityEffect: 1, brandId: brandInfo.brandId }).then(res => {
//     const _judgeStr = {
//       1: '>',
//       2: '=',
//       3: '<'
//     }
//     $data.levelRules = res.data.accountGrade.map(e => {
//       return {
//         name: e.gradeName,
//         rule: e.isDefaule ? '默认初始等级' : `${_judgeStr[e.judge]}${e.gradeValue}`
//       }
//     })
//     $data.exponentRule = res.data.exponentRule.filter(e => e.isOpen)
//   })
// }
// 部门修改
function onChangeDepartment(e) {
  $data.currentDepartment = isNotEmpty(e) ? e : ''
  getAccountLevel()
}

function toAccountDetail(user) {
  window.open(`/content_center/content_matrix/details?openId=${user.openId}`)
}

function toMore(item) {
  router.push({
    path: '/content_center/content_matrix',
    query: {
      gradeId: item.gradeId
    }
  })
}

const toManage = throttle(item => {
  if (item.icon) {
    window.open(
      `/content_center/content_matrix?activeStatus=${
        item.label.indexOf('潜客') > -1 ? 3 : item.label.indexOf('活跃') > -1 ? 1 : 2
      }`
    )
  }
}, 700)

onMounted(() => {
  getAccountData()
  getAccountLevel()
  // getLevelRules()
})
function toSetting() {
  window.open('/system_manage/system_setting?type=levelRules', '_blank')
}
// 显示是否有系统设置菜单
const haveSystemSetting = computed(() => {
  const systemModule = sessionStorage.getItem('systemModule')
  return systemModule.includes('system:setting')
})
function showCalceDialog() {
  $data.calcDialog = true
  $data.ruleDialog = false
}
function closeCalcDialog() {
  $data.calcDialog = false
  $data.ruleDialog = true
}
</script>

<style lang="scss" scoped>
.title {
  font-size: 18px;
  line-height: 25px;
  font-weight: bold;
  .subtitle {
    color: #909399;
    font-size: 14px;
    margin-left: 24px;
    font-weight: normal;
  }
}
.data_overview {
  padding: 24px;
  background-color: #fff;
  border-radius: 4px;
  .data_list {
    display: flex;
    margin-top: 20px;
    .data_item {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-content: center;
      text-align: center;
      height: 85px;
      margin-right: 16px;
      background: #f6f7f8;
      border-radius: 4px;
      &:last-of-type {
        margin-right: 0;
      }
      .data_num {
        line-height: 22px;
        font-size: 18px;
        font-weight: bold;
        color: #333;
      }
      .data_text {
        margin-top: 6px;
        line-height: 17px;
        color: #909399;
        font-size: 12px;
      }
    }
  }
  .overview_item {
    position: relative;
    .data_tip {
      position: absolute;
      right: 10px;
      top: 10px;
      img {
        width: 16px;
        height: 16px;
        opacity: 0.6;
        // cursor: pointer;
      }
    }
  }
}
.table_wrapper {
  background-color: #fff;
  border-radius: 4px;
  margin-top: 16px;
  padding: 24px;
  .table_wrapper_header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .action {
      position: relative;
      display: flex;
      align-items: center;
      .rule_text {
        display: flex;
        align-items: center;
        cursor: pointer;
        span {
          margin-left: 24px;
          margin-right: 8px;
        }
      }
      :deep .department-cascader {
        top: 44px !important;
        right: 129px !important;
        left: auto !important;
        .el-popper__arrow {
          top: -5px !important;
          left: auto !important;
          right: 135px !important;
          &::before {
            border-top-color: #e4e7ed !important;
            border-left-color: #e4e7ed !important;
            border-right-color: transparent !important;
            border-right-color: transparent !important;
          }
        }
      }
    }
  }
  .table {
    margin-top: 16px;
    overflow-x: auto;
    .table_scroll_view {
      min-width: 1100px;
      min-height: 300px;
    }
    .table_column {
      position: relative;
      width: 100%;
      height: 80px;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 20px;
      .skewed {
        position: absolute;
        top: 0;
        left: 0;
        min-width: 66px;
        height: 80px;
        transform: skew(-23deg) translateX(-15px);
        border-radius: 4px;
      }
      .table_column_content {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        // justify-content: space-between;
        height: 100%;
        .level {
          flex-shrink: 0;
          flex-grow: 0;
          // width: 220px;
          width: 260px;
          padding-left: 16px;
          display: flex;
          align-items: center;
          box-sizing: border-box;
          i {
            display: inline-block;
            width: 48px;
            height: 48px;
            margin-right: 16px;
            background-size: cover;
          }
          .level_name {
            min-width: 60px;
            margin-right: 8px;
            font-size: 20px;
            font-weight: bold;
          }
          .level_value {
            font-size: 20px;
            font-weight: bold;
          }
          .unit {
            margin-left: 2px;
            margin-top: 3px;
            font-size: 12px;
            font-weight: bold;
          }
        }
        .table_data {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-grow: 1;
          .data_item {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            max-width: 200px;
            min-width: 160px;
            height: 80px;
            .data_num {
              line-height: 22px;
              font-size: 18px;
              font-weight: bold;
              color: #333;
            }
            .data_text {
              margin-top: 6px;
              line-height: 17px;
              color: #606266;
              font-size: 12px;
            }
          }
        }
        .placeholder_block {
          flex: 1;
        }
        .account_wrapper {
          display: flex;
          align-items: center;
          flex-grow: 0;
          padding-right: 24px;
          margin-left: 12px;
          width: 365px;
          box-sizing: border-box;
          .line {
            width: 1px;
            height: 40px;
            margin-right: 24px;
            background: rgba($color: #000, $alpha: 0.1);
            border-radius: 12px;
          }
          .account_list {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            .account_item {
              cursor: pointer;
              margin-right: 24px;
              text-align: center;
              width: 65px;
              display: flex;
              flex-direction: column;
              align-items: center;
              .img_warp {
                position: relative;
                width: max-content;
                height: max-content;
              }
              .avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
              }
              .name {
                @include mult_line(1);
                line-height: 18px;
                margin-top: 6px;
                font-size: 13px;
              }
            }
          }
          .more {
            cursor: pointer;
            display: flex;
            align-items: center;
            color: #909399;
            font-size: 14px;
            > span {
              flex-shrink: 0;
            }
          }
        }
      }
    }
  }
}
.dialog_title {
  font-size: 16px;
  font-weight: bold;
}
:deep .el-dialog__body {
  padding: 16px;
}
.dialog_content {
  .tips {
    color: #606266;
    font-size: 14px;
    line-height: 20px;
    span {
      font-family: 'Microsoft YaHei';
    }
  }
  .rules {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    font-size: 14px;
    font-weight: 400;
    color: #364fcd;
    line-height: 18px;
    margin-bottom: 16px;
    p {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;
      cursor: pointer;
    }
    img {
      width: 14px;
      height: 14px;
      margin-left: 2px;
    }
  }
  .calc_title {
    width: 388px;
    height: 56px;
    background: #f7f8fa;
    padding-left: 12px;
    line-height: 56px;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
    box-sizing: border-box;
  }
  .calc_content {
    .one_calc + .one_calc {
      margin-top: 8px;
    }
    .one_calc {
      display: flex;
      align-items: center;
      font-size: 14px;
      font-weight: 400;
      color: #303133;
      line-height: 20px;
      .add_calc {
        font-weight: 500;
        width: 29px;
        height: 20px;
        line-height: 20px;
        text-align: center;
      }
    }
  }
}
.data_icon_box {
  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  .data_icon {
    width: 14px;
    height: 14px;
    object-fit: contain;
    margin-left: 3px;
    margin-top: -2px;
  }
}
</style>
