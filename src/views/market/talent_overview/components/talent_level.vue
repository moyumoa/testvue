<template>
  <div class="talent_level">
    <div class="talent_title">
      <div class="title_left">达人等级分布</div>
      <div class="title_right">
        <el-button style="margin-left: 20px" type="primary" @click="toLevel">
          等级规则设置
        </el-button>
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
              width: calcProgressWidth(item.userCnt || 0),
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
              <span class="level_name">{{ item.levelName || '- -' }}</span>
              <span class="level_value">{{ wanSliceFormat(item.userCnt || '- -') }}</span>
              <!-- <span class="unit" v-if="item.userCnt">个</span> -->
            </div>
            <div class="table_data">
              <div class="data_item">
                <div class="data_num">{{ wanSliceFormat(item.avgFans || '- -') }}</div>
                <div class="data_text">平均粉丝数</div>
              </div>
              <div class="data_item">
                <div class="data_num">{{ wanSliceFormat(item.avgPlayCnt || '- -') }}</div>
                <div class="data_text">近7天单条视频平均播放量</div>
              </div>
              <div class="data_item">
                <div class="data_num">{{ wanSliceFormat(item.avgLiveWatchTimes || '- -') }}</div>
                <div class="data_text">近7天单场直播平均观看人次</div>
              </div>
            </div>
            <!-- <div class="placeholder_block"></div> -->
            <div class="account_wrapper">
              <div class="line"></div>
              <template v-if="item.users && item.users.length">
                <div class="account_list">
                  <template v-for="(user, i) in item.users" :key="i">
                    <div class="account_item" v-if="i <= 3">
                      <img :src="user.userPhoto" class="avatar" />
                      <div class="name">{{ user.userBrandName }}</div>
                    </div>
                  </template>
                </div>
                <div class="more" @click="toMore(item)">
                  <span>更多</span>
                  <img src="https://tagvv-1256030678.file.myqcloud.com/20220805pqvmq.png" />
                </div>
              </template>
            </div>
          </div>
        </div>
        <el-empty description="暂无达人" v-if="!$data.tableList.length" />
      </div>
    </div>
  </div>
</template>
<script setup>
import { wanSliceFormat, throttle } from '@/utils/tools'
import { useRouter } from 'vue-router'
import { userLevelDistributed } from '@/api/market/growth_system.js'
const props = defineProps({
  currentDepartment: {
    type: Number
  }
})

const router = useRouter()
const $data = reactive({
  level: [
    {
      fontColor: 'rgba(65, 54, 54, 1)',
      icon: 'https://tagvv-1256030678.file.myqcloud.com/20220805f3904.png',
      color: 'linear-gradient(135deg, #6B5C58 0%, #A4887C 100%)',
      backgroundColor: 'rgba(105, 89, 84, 0.1)'
    },
    {
      fontColor: 'rgba(47, 62, 94, 1)',
      icon: 'https://tagvv-1256030678.file.myqcloud.com/20220805rbfgu.png',
      color: 'linear-gradient(135deg, #6C7A99 0%, #BAC4DD 100%)',
      backgroundColor: 'rgba(47, 62, 94, 0.1)'
    },
    {
      fontColor: 'rgba(111, 47, 8, 1)',
      icon: 'https://tagvv-1256030678.file.myqcloud.com/20220805hh0oz.png',
      color: 'linear-gradient(135deg, #B2714E 0%, #FCCFAE 100%)',
      backgroundColor: 'rgba(111, 47, 8, 0.1)'
    },
    {
      fontColor: 'rgba(149, 74, 21, 1)',
      icon: 'https://tagvv-1256030678.file.myqcloud.com/202208051pvim.png',
      color: 'linear-gradient(135deg, #BF7E37 0%, #FFDA9A 100%)',
      backgroundColor: 'rgba(149, 74, 21, 0.1)'
    },
    {
      fontColor: 'rgba(68, 86, 103, 1)',
      icon: 'https://tagvv-1256030678.file.myqcloud.com/20220805x7u7q.png',
      color: 'linear-gradient(135deg, #718FA7 0%, #B9CAD8 100%)',
      backgroundColor: 'rgba(68, 86, 103, 0.1)'
    },
    {
      fontColor: 'rgba(72, 70, 103, 1)',
      icon: 'https://tagvv-1256030678.file.myqcloud.com/20220805wfywp.png',
      color: 'linear-gradient(135deg, #7178A7 0%, #B9C3D8 100%)',
      backgroundColor: 'rgba(114, 122, 168, 0.1)'
    }
  ],
  tableList: [],
  listLoading: false,
  ruleDialog: false,
  levelRules: [],
  maxAccountNum: 0,
  calcDialog: false, // 计算规则的弹窗
  exponentRule: [] // 指数计算规则
})
function calcProgressWidth(num) {
  const ACCOUNT_WIDTH = 368 // 矩阵号宽度
  const PADDING = 36
  const maxCount = $data.maxAccountNum // 满进度条数量
  const percent = num > maxCount ? 1 : num / maxCount
  const progressWidth = `calc((${100}% - ${PADDING}px - ${ACCOUNT_WIDTH}px) *  (${percent}))`
  console.log('progressWidth', progressWidth)
  return progressWidth
}
const toMore = throttle(item => {
  router.push({
    path: '/content_market/member_list',
    query: {
      levelId: item.levelId
    }
  })
}, 700)
const toLevel = throttle(() => {
  router.push({
    path: '/content_market/growth_setting'
  })
}, 700)

// 矩阵号等级分布
function getTalentLevel() {
  console.log('请求  矩阵号等级分布 的接口')

  $data.listLoading = true
  userLevelDistributed({
    deptIds: props.currentDepartment == null ? [] : [props.currentDepartment],
    lastFewDays: 7
  })
    .then(res => {
      $data.listLoading = false
      const _listData = []
      const accountList = []
      const resData = (res.data || []).reverse()
      // const dataLen = res.data.length
      resData.forEach((item, index) => {
        accountList.push(item.userCnt)
        let _item = JSON.parse(JSON.stringify(item))
        _item = Object.assign(_item, $data.level[index < 6 ? index : 5])
        _listData.push(_item)
      })
      $data.tableList = _listData
      $data.maxAccountNum = Math.max(...accountList)
    })
    .catch(() => {
      $data.listLoading = false
    })
}
// 部门修改
watch(
  () => props.currentDepartment,
  val => {
    getTalentLevel()
  },
  { immediate: true }
)
</script>
<style lang="scss" scoped>
@import './title.scss';
.talent_level {
  width: 100%;
  min-height: 280px;
  background: #ffffff;
  border-radius: 4px;
  padding: 22px 24px;
  margin-bottom: 16px;
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
            margin-right: 24px;
            text-align: center;
            width: 65px;
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
          min-width: 45px;
          img {
            width: 14px;
            height: 14px;
            margin-left: 2px;
          }
        }
      }
    }
  }
}
</style>
