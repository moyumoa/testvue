<template>
  <div class="total_page" v-loading="loading">
    <div class="total_box">
      <div class="one_total" :class="{ one_total_v2: systemVersion !== 3 }">
        <div class="box_left">
          <div class="box_top">矩阵号总数</div>
          <div class="box_bottom num1">
            {{ loading ? '-' : wanSliceFormat(totalInfo.total || 0) }}
            <template v-if="systemVersion !== 3">
              {{ loading ? '-' : `/\n${totalInfo.accountNumber || 0}` }}
              <el-tooltip
                popper-class="tooltip-class"
                placement="top"
                :style="{ 'margin-left': '4px' }"
                v-if="!loading"
              >
                <template #content>
                  <div class="flex_box">可接入的矩阵号总数</div>
                </template>
                <img
                  src="@/assets/images/operate/tip_line.png"
                  style="width: 13px; height: 13px; margin-left: 8px; align-self: flex-start"
                />
              </el-tooltip>
            </template>
          </div>
        </div>
        <div class="box_right">
          <pieChart
            v-if="!loading"
            id="pieChart1"
            style="width: 80px; height: 64px"
            :data="totalInfo.chartInfo"
            :showLabel="false"
          />
          <div class="right_box">
            <div class="one_right" v-for="(item, index) in totalInfo.chartInfo" :key="index">
              <div :class="`right_circle ${item.color}_circle`"></div>
              <div class="right_label">{{ item.xData }}：</div>
              <div :class="`right_num ${item.color}_num`">
                {{ loading ? '-' : wanSliceFormat(item.yData || 0) }}
              </div>
              <el-tooltip
                v-if="item.color == 'orange' && systemVersion !== 3"
                popper-class="tooltip-class"
                placement="top"
                :style="{ 'margin-left': '4px' }"
              >
                <template #content>
                  <div class="flex_box">
                    授权有效的矩阵号才会占用套餐额度
                    <!-- <span v-if="!judgeHWork()">，</span>
                    <div class="jump_btn" @click="toFun" v-if="!judgeHWork()">
                      余额详情
                      <img
                        src="https://tagvv-1256030678.file.myqcloud.com/20240122f961s.png"
                        alt=""
                        class="jump_icon"
                      />
                    </div> -->
                  </div>
                </template>
                <img
                  src="@/assets/images/operate/tip_line.png"
                  style="width: 13px; height: 13px; margin-left: 8px"
                />
              </el-tooltip>
            </div>
          </div>
        </div>
      </div>
      <div
        :class="['one_box', `one_box_${index}`, systemVersion == 3 ? '' : 'one_box_v2']"
        v-for="(item, index) in platformList"
        :key="index"
      >
        <div class="box_top">
          <div class="top_platform">
            <div :class="`xm_platformIcon_${item.platform}`"></div>
          </div>
          {{ item.label }}
        </div>
        <div class="box_bottom">
          <div class="num1">{{ loading ? '-' : wanSliceFormat(item.total || 0) }}</div>
          <div class="num2">
            有效：
            <span>{{ loading ? '-' : wanSliceFormat(item.validTotal || 0) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import pieChart from './pie_chart.vue'
import { wanSliceFormat, isNotEmpty } from '@/utils/tools.js'
// import { useRouter } from 'vue-router'
import { getAccountAuthCount } from '@/api/system_setting/authorization.js'
import { useStore } from 'vuex'

const store = useStore()
const systemVersion = computed(() => store.state.user.systemVersion)

// const router = useRouter()
// const judgeHWork = inject('$judgeHWork')
// console.log(judgeHWork())

const totalInfo = reactive({
  total: null,
  accountNumber: null, // 总数
  chartInfo: [
    { xData: '授权有效', yData: 20, color: 'orange' },
    { xData: '授权失效', yData: 2, color: 'gray' }
  ]
})
const platformList = ref([
  {
    platform: 1,
    label: '抖音',
    total: null,
    validTotal: null
  },
  {
    platform: 3,
    label: '小红书',
    total: null,
    validTotal: null
  },
  {
    platform: 2,
    label: '视频号',
    total: null,
    validTotal: null
  },
  {
    platform: 4,
    label: '快手',
    total: null,
    validTotal: null
  }
])

const loading = ref(true)
function getCount() {
  getAccountAuthCount()
    .then(res => {
      if (res.code === 0 && isNotEmpty(res.data)) {
        const data = res.data
        totalInfo.total = data.totalAuthCnt || 0
        totalInfo.accountNumber = data.accountNumber || null
        totalInfo.chartInfo[0].yData = data.totalAuthValidCnt || 0
        totalInfo.chartInfo[1].yData = data.totalAuthInvalidCnt || 0
        platformList.value.forEach(x => {
          switch (x.platform) {
            case 1:
              x.total = data.dyAuthCnt || 0
              x.validTotal = data.dyAuthValidCnt || 0
              break
            case 2:
              x.total = data.wxCnt || 0
              x.validTotal = data.wxValidCnt || 0
              break
            case 3:
              x.total = data.xhsCnt || 0
              x.validTotal = data.xhsValidCnt || 0
              break
            case 4:
              x.total = data.ksCnt || 0
              x.validTotal = data.ksValidCnt || 0
              break
          }
        })
      }
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}
getCount()
// const message = inject('$message')
// const toFun = throttle(() => {
//   const systemModule = sessionStorage.getItem('systemModule')

//   if (systemModule.includes('system:voucher_center')) {
//     router.push('/system_manage/voucher_center?tab=xuser_e')
//   } else {
//     message.warning('暂无权限')
//   }
// }, 700)
defineExpose({
  getCount
})
</script>
<style lang="scss" scoped>
.total_box {
  position: relative;
  width: 100%;
}
.total_box {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  min-height: 154px;
  background: #ffffff;
  border-radius: 4px;
  padding: 6px 24px 22px;
  margin-bottom: 16px;

  .one_box {
    min-width: calc((100% - 4 * 16px - 426px) / 4);
    padding: 24px 10px 0 24px;
    margin-right: 16px;
    margin-top: 16px;
    height: 110px;
    background: #f7f8fa;
    border-radius: 4px;
    &:last-child {
      margin-right: 0;
    }
  }
  .one_box_v2 {
    min-width: calc((100% - 4 * 16px - 466px) / 4);
  }
  .one_total {
    padding: 24px 10px 0 24px;
    margin-top: 16px;
    margin-right: 16px;
    min-width: 426px;
    height: 110px;
    background: #f7f8fa;
    border-radius: 4px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .box_left {
      padding-right: 40px;
    }
    .box_right {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      .right_box {
        margin-left: 10px;
        .one_right {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          flex-wrap: wrap;
          .right_circle {
            width: 8px;
            height: 8px;
            margin-right: 6px;
            border-radius: 100%;
          }
          .orange_circle {
            background: #ff7614;
          }
          .gray_circle {
            background: #bfc4cd;
          }
          .right_label {
            font-size: 14px;
            font-weight: 400;
            color: #909399;
            line-height: 20px;
          }
          .right_num {
            font-size: 14px;
            font-weight: 600;
            line-height: 20px;
          }
          .orange_num {
            color: #ff7615;
          }
          .gray_num {
            color: #606266;
          }
        }
        .one_right + .one_right {
          margin-top: 12px;
        }
      }
    }
  }
  .one_total_v2 {
    min-width: 466px;
  }
  .box_top {
    font-size: 14px;
    font-weight: 400;
    color: #606266;
    line-height: 20px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .top_platform {
      width: 20px;
      height: 20px;
      position: relative;
      margin-right: 6px;
    }
  }
  .box_bottom {
    margin-top: 4px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
  .num1 {
    font-size: 26px;
    font-weight: 600;
    color: #303133;
    line-height: 38px;
  }
  .num2 {
    margin-left: 12px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    font-size: 14px;
    font-weight: 400;
    color: #909399;
    line-height: 20px;
    flex-wrap: wrap;
    span {
      color: #ff7614;
      font-weight: 600;
    }
  }
}
@media screen and(max-width:1440px) {
  .total_box {
    flex-wrap: wrap;

    .one_box {
      min-width: calc((100% - 32px) / 3) !important;
    }
    .one_box_0 {
      margin-right: 0 !important;
    }
    .one_total {
      min-width: calc((100% - 32px) / 3 * 2 + 16px) !important;
    }
  }
}
.jump_btn {
  color: #8695e1;
  display: flex;
  align-items: center;
  font-size: 12px;
  line-height: 18px;
  cursor: pointer;
  .jump_icon {
    width: 14px;
    height: 14px;
    margin-left: 2px;
  }
}
.flex_box {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}
</style>
