<template>
  <div class="rR_setting" v-loading="loading">
    <div class="one_box">
      <div class="switch_warp">
        <div class="title">
          用户授权矩阵号数量限制
          <el-tooltip class="item" effect="dark" placement="top">
            <template #content>
              <div class="tooltip_wrap">
                开关开启后，只会拦截用户在小程序上的授权操作，
                <br />
                对后台操作授权没有影响，对历史授权的矩阵号状态也没有影响
              </div>
            </template>
            <img
              src="@/assets/images/content_center/tip_line.png"
              style="width: 16px; height: 16px; margin: 0 16px 0 8px"
              alt
            />
          </el-tooltip>
        </div>
        <el-switch
          style="height: 22px"
          :loading="$switch.loading"
          @change="update"
          v-model="$switch.value"
          inline-prompt
          :width="45"
        ></el-switch>
      </div>
      <div class="rR_content" v-if="$switch.value">
        <el-form ref="settingForm" :model="$form">
          <el-form-item label="是否区分矩阵号类型：" v-if="false">
            <el-radio-group v-model="$form.divisionType" @change="update">
              <el-radio :label="1">是</el-radio>
              <el-radio :label="0">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label-width="0" v-if="$form.divisionType === 0">
            允许单个用户最多授权
            <el-input-number
              @change="update"
              v-model="$form.accountLimitNum"
              controls-position="right"
              style="width: 120px; margin: 0 8px"
              placeholder="请输入"
              :min="1"
            />
            个矩阵号
          </el-form-item>
          <el-form-item label-width="0" v-else>
            允许单个用户最多授权
            <el-input-number
              @change="update"
              v-model="$form.eAccountLimitnum"
              controls-position="right"
              style="width: 120px; margin: 0 8px"
              placeholder="请输入"
              :min="1"
            />
            个I类矩阵号，
            <el-input-number
              @change="update"
              v-model="$form.employeeAccountLimitnum"
              controls-position="right"
              style="width: 120px; margin: 0 8px"
              placeholder="请输入"
              :min="1"
            />
            个II类矩阵号，
            <el-input-number
              @change="update"
              v-model="$form.accountLimitNum"
              controls-position="right"
              style="width: 120px; margin: 0 8px"
              placeholder="请输入"
              :min="1"
            />
            个III类矩阵号，共
            <span style="color: #364fcd">
              {{
                $form.accountLimitNum +
                ($form.eAccountLimitnum || 0) +
                ($form.employeeAccountLimitnum || 0)
              }}
            </span>
            个矩阵号
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="one_box" style="padding-bottom: 17px">
      <div class="switch_warp">
        <div class="title">
          用户授权矩阵号类型限制
          <el-tooltip class="item" effect="dark" placement="top">
            <template #content>
              <div class="tooltip_wrap">
                开关开启后，只会拦截用户在小程序、批量授权的授权操作，
                <br />
                对后台操作授权没有影响，对历史授权的矩阵号状态也没有影响
              </div>
            </template>
            <img
              src="@/assets/images/content_center/tip_line.png"
              style="width: 16px; height: 16px; margin: 0 16px 0 8px"
              alt
            />
          </el-tooltip>
        </div>
        <el-switch
          style="height: 22px"
          :loading="$matrixTypeSwitch.loading"
          @change="update"
          v-model="$matrixTypeSwitch.value"
          inline-prompt
          :width="45"
        ></el-switch>
      </div>
      <div class="rR_content_white" v-if="$matrixTypeSwitch.value">
        <el-form ref="settingForm" :model="$matrixTypeForm">
          <el-form-item label="矩阵号类型：">
            <el-checkbox-group v-model="$matrixTypeForm.typeList" @change="update">
              <el-checkbox :label="1" disabled>抖音号</el-checkbox>
              <el-checkbox :label="2">视频号</el-checkbox>
              <el-checkbox :label="3">小红书</el-checkbox>
              <el-checkbox :label="4">快手</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { debounce } from '@/utils/tools'
import { updateBrandConfig } from '@/api/system_setting/setting'
import { selectBrand } from '@/api/system_setting/brand_info'

const loading = ref(true)
const configValue = ref({}) // 配置的原始数据 因为还有两个数据在其他页面进行配置，不保存会导致数据丢失，所以要保存
// 开关数据
const $switch = reactive({
  value: false, // 开关值， true: 开启， false: 关闭
  loading: false // 加载状态
})
const $form = reactive({
  divisionType: 0, // 是否区分个人号与企业号， 0: 否 不区分， 1: 是 区分
  accountLimitNum: 1, // 企业号数量
  eAccountLimitnum: 1, // 个人号数量
  employeeAccountLimitnum: 1 // 员工号数量
})
// 用户授权矩阵号类型限制的开关
const $matrixTypeSwitch = reactive({
  value: false, // 开关值， true: 开启， false: 关闭
  loading: false // 加载状态
})
const $matrixTypeForm = reactive({
  typeList: [1] // 矩阵号类型
})
const update = debounce(() => {
  const data = {
    ...configValue.value,
    limitSwitchOpen: $switch.value, // 限制开关是否开启
    limitByXuserType: $form.divisionType === 1, // 是否按矩阵号类别限制
    accountLimitNum: $form.accountLimitNum, // 个人号限制数 如果 limitByXuserType=false的时候，此字段代表总限制数
    eAccountLimitnum: $form.eAccountLimitnum, // 企业号限制数
    employeeAccountLimitnum: $form.employeeAccountLimitnum, // 企业号限制数
    limitTypeSwitchOpen: $matrixTypeSwitch.value,
    allowDyOpenAuth: $matrixTypeForm.typeList.indexOf(1) > -1,
    allowWxAuth: $matrixTypeForm.typeList.indexOf(2) > -1,
    allowXhsAuth: $matrixTypeForm.typeList.indexOf(3) > -1,
    allowKsAuth: $matrixTypeForm.typeList.indexOf(4) > -1
  }
  updateBrandConfig({
    xuserConfig: JSON.stringify(data)
  })
    .then(res => {
      // 失败了更新数据
      if (res.code !== 0) {
        getInfo()
      }
    })
    .catch(() => {
      getInfo()
    })
}, 800)

//
const getInfo = () => {
  loading.value = true
  selectBrand({})
    .then(res => {
      loading.value = false
      if (res.code === 0 && res.data?.xuserConfig) {
        const config = JSON.parse(res.data?.xuserConfig)
        configValue.value = config
        $switch.value = config.limitSwitchOpen || false
        $form.divisionType = 0 // config.limitByXuserType ? 1 : 0 不区分矩阵号类型了（24/6/6
        $form.accountLimitNum = config.accountLimitNum || 0
        $form.eAccountLimitnum = config.eAccountLimitnum || 0
        // 兼容老数据，如果之前开关开了，但是没有设置过员工号的，就调接口给他设置。
        if (config.employeeAccountLimitnum) {
          $form.employeeAccountLimitnum = config.employeeAccountLimitnum || 0
        } else {
          if ($switch.value && $form.divisionType) {
            $form.employeeAccountLimitnum = 1
            update()
          } else {
            $form.employeeAccountLimitnum = config.employeeAccountLimitnum || 0
          }
        }
        const xuserConfig = res.data?.xuserConfig
        // 判断是否有矩阵号类型限制的字段存在，存在就代表修改过，否则就是初次，要给他设置默认全选
        if (xuserConfig && xuserConfig.indexOf('limitTypeSwitchOpen') > -1) {
          $matrixTypeSwitch.value = config.limitTypeSwitchOpen || false
          const typeList = []
          if (config.allowDyOpenAuth) {
            typeList.push(1)
          }
          if (config.allowWxAuth) {
            typeList.push(2)
          }
          if (config.allowXhsAuth) {
            typeList.push(3)
          }
          if (config.allowKsAuth) {
            typeList.push(4)
          }
          $matrixTypeForm.typeList = typeList || [1]
        } else {
          $matrixTypeSwitch.value = false
          $matrixTypeForm.typeList = [1, 2, 3, 4]
        }
      } else {
        $matrixTypeSwitch.value = false
        $matrixTypeForm.typeList = [1, 2, 3, 4]
      }
    })
    .catch(() => {
      $matrixTypeSwitch.value = false
      $matrixTypeForm.typeList = [1, 2, 3, 4]
    })
}
// 初始化
getInfo()
</script>

<style lang="scss" scoped>
.one_box + .one_box {
  margin-top: 16px;
}
.one_box {
  width: 100%;
  padding: 20px 24px;
  background: #ffffff;

  .switch_warp {
    display: flex;
    align-items: center;
    //border-radius: 4px;
    margin-bottom: 16px;

    .title {
      font-size: 16px;
      font-weight: 600;
      line-height: 22px;
      color: #323233;
      display: flex;
      align-items: center;
    }
  }

  .rR_content {
    //margin-top: 16px;
    border-radius: 4px;
    padding: 22px 24px 24px;
    background-color: #f6f8fa;
    color: #606266;
  }
  .rR_content_white {
    margin-top: -5px;
  }
}
</style>
