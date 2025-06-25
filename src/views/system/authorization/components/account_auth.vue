<template>
  <div>
    <el-dialog
      v-model="show"
      title="编辑矩阵号信息"
      width="448px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <div v-loading="userInfoLoading || getFirstIdLoading">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          :hide-required-asterisk="true"
          label-width="90px"
        >
          <el-form-item label="运营者">
            <el-select
              v-model="form.userId"
              style="width: 100%"
              filterable
              remote
              clearable
              @change="onChange"
              reserve-keyword
              placeholder="请输入成员姓名、手机号"
              remote-show-suffix
              :remote-method="remoteMethod"
            >
              <el-option
                v-for="item in options"
                :key="item.userId"
                :label="item.userBrandName"
                :value="item.userId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="矩阵号部门" prop="dept">
            <!-- <el-cascader
              style="width: 100%"
              v-model="form.dept"
              :show-all-levels="false"
              :options="organizations"
              :clearable="true"
              :props="cascaderProps"
              placeholder="请选择"
            ></el-cascader> -->
            <choose_dept_search
              v-if="!getFirstIdLoading"
              ref="chooseDeptSearchRef"
              @updateDeptIds="updateDeptIds"
              :multiple="false"
              :isUsePermission="false"
              searchLabel="矩阵号部门"
              :defaultValue="form.deptInfo"
              :isConfigPermission="props.isConfigPermission || false"
            />
          </el-form-item>
        </el-form>
        <div class="warning_tips" v-if="showWarningTips">
          <el-alert
            title="矩阵号部门与运营者所在部门不一致，请谨慎操作"
            type="warning"
            show-icon
            :closable="false"
          />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="show = false">取消</el-button>
          <el-button type="primary" @click="confirm">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { getFirstDeptInfo, getFullInfoById } from '@/utils/get_dept.js'
import { getListUserInfo } from '@/api/market/operation.js'
import { debounce, isNotEmpty } from '@/utils/tools.js'
import { uptAuthOperation } from '@/api/system_setting/authorization.js'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
  // 矩阵号信息
  info: {
    type: Object,
    default: () => {
      return {
        opeName: '', // string 矩阵号名称
        operationUserId: -1, // number 当前运营者id
        openId: -1, // string 矩阵号openid
        brandId: null, // string 品牌id
        accountDeptVo: {
          // 矩阵号 部门信息
          id: -1 // number 矩阵号部门id
        }
      }
    },
    required: true
  },
  isConfigPermission: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits(['update:modelValue', 'update'])
const show = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    if (!value) {
      reset()
    }
    return emits('update:modelValue', value)
  }
})
// const showDept=ref(false)
// 表单与筛选项
const formRef = ref(null)
const form = ref({
  userId: '', // 运营者
  dept: '', //
  deptInfo: [] // 选中的部门全路径信息
})
const rules = {
  dept: [{ required: true, message: '请选择部门', trigger: 'blur' }]
}
const getFirstIdLoading = ref(true)
const deptFirstInfo = ref()
function getDeptFirstInfo() {
  getFirstDeptInfo(false)
    .then(res => {
      deptFirstInfo.value = res
      getFirstIdLoading.value = false
    })
    .catch(() => {
      getFirstIdLoading.value = false
    })
}
getDeptFirstInfo()
function updateDeptIds(e) {
  form.value.dept = isNotEmpty(e) ? e : null
  formRef.value.validateField('dept')
}

// 重置表单信息
const reset = () => {
  form.value = {
    userId: '',
    dept: '',
    deptInfo: []
  }
}

// 实时匹配输入
const options = ref([])
const remoteMethod = debounce(queryString => {
  if (!queryString) return
  queryUserOption(queryString)
})
// 查询运营者选项
const userInfoLoading = ref(false)
const queryUserOption = (queryString, loading) => {
  if (loading) {
    userInfoLoading.value = true
  }
  getListUserInfo({
    userBrandName: queryString,
    staffStatus: 1,
    isValid: 1
  }).then(res => {
    if (res.code === 0) {
      userInfoLoading.value = false
      options.value = res.data || []
    }
  })
}
const onChange = value => {
  // 运营者选中的时候 将矩阵号部门改为运营者所在的部门
  const userInfo = options.value.find(item => item.userId === form.value.userId)
  const operatorDepList = userInfo?.fsAccount?.departmentList || []
  if (operatorDepList.length > 0) {
    form.value.dept = operatorDepList[0].id + ''
    const parentIds = userInfo.parentIds
      ? userInfo.parentIds.split('/').map(x => {
          return parseInt(x)
        })
      : []
    form.value.deptInfo = [
      {
        label: operatorDepList[0].name,
        value: parseInt(operatorDepList[0].id),
        fullIds:
          parentIds && parentIds.length > 0 ? [parentIds] : [[parseInt(operatorDepList[0].id)]],
        fullPath: userInfo.fullPath || operatorDepList[0].name
      }
    ]
  } else {
    // fsAccount 为null 默认选中根部门，运营者的部门为根部门的时候 fsAccount
    if (isNotEmpty(deptFirstInfo.value)) {
      form.value.dept = deptFirstInfo.value[0].id + ''
      form.value.deptInfo = deptFirstInfo.value
    } else {
      form.value.dept = null
      form.value.deptInfo = []
    }
  }
}

// 显示提示 矩阵号部门与运营者所在部门不一致，请谨慎操作
const showWarningTips = computed(() => {
  if (isNotEmpty(form.value.userId) && isNotEmpty(form.value.dept)) {
    const accountDeptId = form.value.dept + ''
    let userDeptList =
      options.value.find(item => item.userId === form.value.userId)?.fsAccount?.departmentList || []
    // fsAccount 为null 默认选中根部门
    if (userDeptList.length === 0 && isNotEmpty(deptFirstInfo.value)) {
      userDeptList = [{ id: +deptFirstInfo.value[0].value + '' }]
    }
    if (userDeptList.length > 0) {
      return typeof userDeptList.find(item => accountDeptId === item.id) === 'undefined'
    }
  }
  return false
})

// 提交更新
const confirm = () => {
  formRef.value.validate(valid => {
    if (valid) {
      uptAuthOperation({
        userId: form.value.userId || 0, // 运营者id
        openId: props.info.openId, // 矩阵号openid
        brandId: props.info.brandId, // 品牌id
        deptId: form.value.dept // 矩阵号部门id
      }).then(res => {
        if (res.code === 0) {
          ElMessage.success('操作成功')
          show.value = false
          emits('update')
        }
      })
    }
  })
}
watch(
  () => props.info,
  value => {
    form.value = {
      userId: value.operationUserId ? value.operationUserId + '' : null,
      dept: value?.accountDeptVo ? value.accountDeptVo.id + '' : ''
    }
    if (value.opeName) {
      queryUserOption(value.opeName, true)
    }
    // 如果已经设置过部门ID了，就去获取该部门ID的全路径信息
    if (value && value.accountDeptVo && value.accountDeptVo.id + '') {
      if (value.accountDeptVo.id + '' === '0') {
        form.value.deptInfo = [0]
      } else {
        getFullInfoById([parseInt(value.accountDeptVo.id)], false).then(res => {
          form.value.deptInfo = [res]
        })
      }
    }
  },
  { deep: true, immediate: true }
)
</script>

<style lang="scss" scoped>
.warning_tips {
  margin-top: 20px;
}
:deep(.input_box) {
  width: 310px !important;
}
:deep(.input_box .input_choose .one_choose) {
  max-width: 180px !important;
}
</style>
