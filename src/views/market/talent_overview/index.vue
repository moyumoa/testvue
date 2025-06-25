<template>
  <div class="talent_overview">
    <!-- 达人概况 -->
    <div class="talent_top">
      <!-- 标题 -->
      <div class="talent_title" style="padding-right: 18px">
        <div class="title_left">
          达人概况
          <span>只统计内部达人数据</span>
        </div>
        <div class="title_right">
          <!-- <el-cascader
            style="width: 180px"
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
            placeholder="请选择部门"
          ></el-cascader> -->
          <choose_dept_search
            ref="chooseDeptSearchRef"
            @updateDeptIds="onChangeDepartment"
            :multiple="false"
            :isUsePermission="true"
            searchLabel="部门"
          />
        </div>
      </div>
      <!-- 数据 -->
      <div class="top_data" v-loading="$data.loading">
        <div class="one_data">
          <div class="data_num">{{ wanSliceFormat($data.topData.userCnt || 0) }}</div>
          <div class="data_title">总人数</div>
          <div class="data_tip">
            <el-tooltip class="item" effect="dark" placement="top">
              <template #content>
                <div class="tooltip_wrap">内部达人总人数</div>
              </template>
              <img
                src="https://tagvvcloud-brandapp-1256030678.cos.ap-guangzhou.myqcloud.com/b290e00ab7e34530b961e8a355b37b2a形状@2x.png"
                alt
              />
            </el-tooltip>
          </div>
        </div>
        <div class="one_data">
          <div class="data_num">{{ wanSliceFormat($data.topData.validAuthCnt || 0) }}</div>
          <div class="data_title">授权有效人数</div>
          <div class="data_tip">
            <el-tooltip class="item" effect="dark" placement="top">
              <template #content>
                <div class="tooltip_wrap">抖音账号授权抖音开放平台还未失效的人数</div>
              </template>
              <img
                src="https://tagvvcloud-brandapp-1256030678.cos.ap-guangzhou.myqcloud.com/b290e00ab7e34530b961e8a355b37b2a形状@2x.png"
                alt
              />
            </el-tooltip>
          </div>
        </div>
        <div class="one_data">
          <div class="data_num">{{ wanSliceFormat($data.topData.joinTaskCnt || 0) }}</div>
          <div class="data_title">近30天参与任务人数</div>
          <div class="data_tip">
            <el-tooltip class="item" effect="dark" placement="top">
              <template #content>
                <div class="tooltip_wrap">近30天参与过任务的人数</div>
              </template>
              <img
                src="https://tagvvcloud-brandapp-1256030678.cos.ap-guangzhou.myqcloud.com/b290e00ab7e34530b961e8a355b37b2a形状@2x.png"
                alt
              />
            </el-tooltip>
          </div>
        </div>
        <div class="one_data">
          <div class="data_num">{{ wanSliceFormat($data.topData.goldCnt || 0) }}</div>
          <div class="data_title">近30天金币发放数</div>
          <div class="data_tip">
            <el-tooltip class="item" effect="dark" placement="top">
              <template #content>
                <div class="tooltip_wrap">近30天金币发放总数</div>
              </template>
              <img
                src="https://tagvvcloud-brandapp-1256030678.cos.ap-guangzhou.myqcloud.com/b290e00ab7e34530b961e8a355b37b2a形状@2x.png"
                alt
              />
            </el-tooltip>
          </div>
        </div>
        <div class="one_data">
          <div class="data_num">{{ wanSliceFormat($data.topData.joinVideoTaskCnt || 0) }}</div>
          <div class="data_title">近30天视频任务人数</div>
          <div class="data_tip">
            <el-tooltip class="item" effect="dark" placement="top">
              <template #content>
                <div class="tooltip_wrap">近30天参与过视频任务的人数</div>
              </template>
              <img
                src="https://tagvvcloud-brandapp-1256030678.cos.ap-guangzhou.myqcloud.com/b290e00ab7e34530b961e8a355b37b2a形状@2x.png"
                alt
              />
            </el-tooltip>
          </div>
        </div>
        <div class="one_data">
          <div class="data_num">{{ wanSliceFormat($data.topData.joinLiveTaskCnt || 0) }}</div>
          <div class="data_title">近30天直播任务人数</div>
          <div class="data_tip">
            <el-tooltip class="item" effect="dark" placement="top">
              <template #content>
                <div class="tooltip_wrap">近30天参与过直播任务的人数</div>
              </template>
              <img
                src="https://tagvvcloud-brandapp-1256030678.cos.ap-guangzhou.myqcloud.com/b290e00ab7e34530b961e8a355b37b2a形状@2x.png"
                alt
              />
            </el-tooltip>
          </div>
        </div>
        <!-- <div class="one_data">
          <div class="data_num">{{ wanSliceFormat($data.topData.userVideoCnt || 0) }}</div>
          <div class="data_title">近30天发过视频人数</div>
          <div class="data_tip">
            <el-tooltip class="item" effect="dark" placement="top">
              <template #content>
                <div class="tooltip_wrap">近30天有发过视频的人数</div>
              </template>
              <img
                src="https://tagvvcloud-brandapp-1256030678.cos.ap-guangzhou.myqcloud.com/b290e00ab7e34530b961e8a355b37b2a形状@2x.png"
                alt
              />
            </el-tooltip>
          </div>
        </div>
        <div class="one_data">
          <div class="data_num">{{ wanSliceFormat($data.topData.userLiveCnt || 0) }}</div>
          <div class="data_title">近30天开过直播人数</div>
          <div class="data_tip">
            <el-tooltip class="item" effect="dark" placement="top">
              <template #content>
                <div class="tooltip_wrap">近30天有做过直播的人数</div>
              </template>
              <img
                src="https://tagvvcloud-brandapp-1256030678.cos.ap-guangzhou.myqcloud.com/b290e00ab7e34530b961e8a355b37b2a形状@2x.png"
                alt
              />
            </el-tooltip>
          </div>
        </div> -->
      </div>
    </div>
    <!-- 达人等级分布 -->
    <talent-level
      :currentDepartment="$data.currentDepartment"
      v-if="employeeGrowthSystemState"
    ></talent-level>
    <!-- 参与任务人数 -->
    <talent-chart :currentDepartment="$data.currentDepartment"></talent-chart>
  </div>
</template>
<script setup>
import talentChart from './components/talent_chart.vue'
import talentLevel from './components/talent_level.vue'
import { wanSliceFormat, isNotEmpty } from '@/utils/tools.js'
import { useStore } from 'vuex'
import { userOverview } from '@/api/market/growth_system.js'
const store = useStore()
const employeeGrowthSystemState = computed(() => {
  return store.state.user.employeeGrowthSystemState
})
const $data = reactive({
  loading: true,
  currentDepartment: null, // 达人概况选择的部门数据
  departmentList: [],
  topData: {}
})

function getTopData() {
  $data.loading = true
  userOverview({
    deptIds: $data.currentDepartment == null ? [] : [$data.currentDepartment]
  })
    .then(res => {
      if (res.code === 0) {
        console.log(res.data)
        $data.topData = res.data
      }
      $data.loading = false
    })
    .catch(() => {
      $data.loading = false
    })
}
getTopData()
// 达人概况-部门修改
function onChangeDepartment(e) {
  // getAccountLevel()
  $data.currentDepartment = isNotEmpty(e) ? e : null
  console.log('请求概况的数据', e)
  getTopData()
}
</script>
<style lang="scss" scoped>
@import './components/title.scss';
.talent_overview {
  .talent_top {
    width: 100%;
    min-height: 280px;
    background: #ffffff;
    border-radius: 4px;
    padding: 22px 8px 6px 24px;
    margin-bottom: 16px;
    .top_data {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
      flex-wrap: wrap;
      .one_data {
        margin-right: 16px;
        margin-bottom: 15px;
        width: calc((100% - 64px) / 3);
        min-width: 140px;
        height: 85px;
        background: #f6f7f8;
        border-radius: 4px;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        .data_num {
          font-size: 18px;
          font-weight: bold;
          color: #333333;
          line-height: 22px;
          margin-bottom: 6px;
        }
        .data_title {
          font-size: 12px;
          font-weight: 400;
          color: #909399;
          line-height: 17px;
        }
        .data_tip {
          position: absolute;
          top: 8px;
          right: 8px;
          img {
            width: 16px;
            height: 16px;
          }
        }
      }
    }
  }
}
</style>
