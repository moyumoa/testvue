<template>
  <el-dialog
    custom-class="xm_maxHeight_dialog"
    :model-value="visible"
    :title="title + '用户'"
    width="550px"
    :before-close="handleClose"
    :close-on-click-modal="false"
  >
    <el-form :model="form" :rules="rules" ref="refForm" label-width="120px">
      <el-form-item label="用户名称" prop="userBrandName">
        <el-input
          v-model.trim="form.userBrandName"
          placeholder="请输入账号名称"
          maxlength="10"
          :disabled="form.isMain === 1 || judgeOEA()"
        />
      </el-form-item>
      <el-form-item
        label="手机号"
        prop="userPhone"
        :class="form && form.staffType === 1 && form.isMain !== 1 ? 'noneValite' : ''"
      >
        <el-input
          :disabled="judgeOEA()"
          v-model.trim="form.userPhone"
          oninput="value=value.replace(/[^\d]/g,'')"
          maxlength="11"
          placeholder="请输入手机号"
        />
      </el-form-item>
      <!-- 只有有编辑第三方员工ID权限的才能编辑 目前只有索菲亚支持 -->
      <el-form-item v-if="canEditThirdPartyStaffId" label="员工ID" prop="thirdPartyStaffId">
        <el-input
          maxlength="100"
          v-model.trim="form.thirdPartyStaffId"
          placeholder="请输入员工ID"
        />
      </el-form-item>
      <el-form-item label="角色" prop="roleIdList">
        <el-select
          :disabled="form.isMain === 1 || judgeOEA()"
          v-model="form.roleIdList"
          placeholder="请选择角色"
          multiple
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="item in dict"
            :key="item.roleId"
            :label="item.roleName"
            :value="item.roleId"
          />
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="是否登录后台" prop="loginBack">
        <el-radio-group v-model="form.loginBack" :disabled="form.isMain === 1">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item> -->
      <!-- <template v-if="title === '新增'">
        <el-form-item label="绑定员工" prop="section">
          <input type="text" v-model="form.section" style="display: none" />
          <div @click="alertSection" class="section_select" :class="{ disabled: props.fsInfo }">
            <div class="section_list" v-if="form.section">
              <div class="section">
                <span class="section_name">{{ form.section.name }}</span>
                <el-icon
                  @click.stop="unchoiceSection"
                  color="#364FCD"
                  :size="12"
                  style="cursor: pointer"
                >
                  <i-close />
                </el-icon>
              </div>
            </div>
            <div v-else>请选择员工</div>
            <i class="icon iconfont icon-edit"></i>
          </div>
        </el-form-item>
      </template>
      <template v-else>
        <el-form-item v-if="form.section" label="员工">
          <div class="unbind">
            <p>{{ form.section.name }}</p>
            <el-button type="primary" v-if="form.userPhone" @click="unbind">解除绑定</el-button>
          </div>
        </el-form-item>
        <el-form-item v-else label="绑定员工" prop="section">
          <input type="text" v-model="form.section" style="display: none" />
          <div @click="alertSection" class="section_select">
            <div class="section_list" v-if="form.section">
              <div class="section">
                <span class="section_name">{{ form.section.name }}</span>
                <el-icon
                  @click.stop="unchoiceSection"
                  color="#364FCD"
                  :size="12"
                  style="cursor: pointer"
                >
                  <i-close />
                </el-icon>
              </div>
            </div>
            <div v-else>请选择员工</div>
            <i class="icon iconfont icon-edit"></i>
          </div>
        </el-form-item>
      </template> -->
      <el-form-item
        label="员工姓名"
        prop="section"
        v-if="form.section && form.section.userId && form.staffType != 3"
      >
        <pre class="section_name">{{ form.section.name || '-' }}</pre>
      </el-form-item>
      <el-form-item label="运营矩阵号" prop="operateAccount">
        <input type="text" v-model="form.operateAccount" style="display: none" />
        <div @click="addItem" class="section_select">
          <div class="section_list" v-if="form.operateAccount.length > 0">
            <div
              class="section"
              v-for="(item, index) in form.operateAccount"
              :key="item.operatorId"
            >
              <span class="section_name">{{ item.authAccountName }}</span>
              <el-icon
                @click.stop="delItem(index)"
                color="#364FCD"
                :size="12"
                style="cursor: pointer"
              >
                <i-close />
              </el-icon>
            </div>
          </div>
          <div v-else>请选择账号</div>
          <i class="icon iconfont icon-edit"></i>
        </div>
        <div class="photos" v-if="form.operateAccount && form.operateAccount.length > 0">
          <template v-for="item in form.operateAccount" :key="item.operatorId">
            <div
              class="photos_item middle"
              :class="{ g_failure: isInvalid(item) }"
              @click="toggleMain(item.operatorId)"
            >
              <img :src="item.authAccountPhoto" alt />
              <div :class="[`xm_platformIcon_${item.platform}`]"></div>
            </div>
          </template>
        </div>
      </el-form-item>
      <!-- 矩阵号数据权限 -->
      <el-form-item label="矩阵号数据权限" prop="operateAccount">
        <input type="text" v-model="matrixList" style="display: none" />
        <div @click="addMatrix(form.permissionType)" class="section_select">
          <div class="section_list" v-if="matrixList.length > 0">
            <template v-for="(item, index) in matrixList" :key="index">
              <div class="section" v-if="index < 3">
                <span class="section_name">{{ item }}</span>
              </div>
            </template>
            <div class="section" v-if="matrixList.length > 3">+{{ matrixList.length - 3 }}</div>
          </div>

          <div v-else>请选择数据权限</div>
          <i class="icon iconfont icon-edit"></i>
        </div>
      </el-form-item>

      <el-form-item label="组织架构权限" prop="dataPermissionsList">
        <input type="text" v-model="form.dataPermissionsList" style="display: none" />
        <div @click="addFramework" class="section_select">
          <div class="section_list" v-if="form.dataPermissionsList.length > 0">
            <template v-for="(item, index) in permissionsList" :key="index">
              <div class="section" v-if="index < 3">
                <span class="section_name">{{ item.name }}</span>
              </div>
            </template>
            <div class="section" v-if="form.dataPermissionsList.length > 3">
              +{{ form.dataPermissionsList.length - 3 }}
            </div>
          </div>

          <div v-else>请选择数据权限</div>
          <i class="icon iconfont icon-edit"></i>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="saveLoading" @click="handleConfirm">
          {{ title === '修改' ? '确定' : '创建' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
  <sectionChoice :showModal="sectionShow" v-if="sectionShow.show" @setResult="setSection" />
  <selectAccount :showDialog="accountShow" v-if="accountShow.visible" @setResult="setOPerate" />
  <matrixDialog
    v-if="informatData.show"
    :informatData="informatData"
    @setResult="setMatrix"
    @permissionType="getType"
    @dataAccountIds="dataAccountIds"
    @dataAccountGroupIds="dataAccountGroupIds"
    :myPermissionType="myPermissionType"
  ></matrixDialog>
  <!-- <frameworkDialog
    v-if="frameworkData.show"
    :frameworkData="frameworkData"
    @setResult="setFrameWorkData"
  ></frameworkDialog> -->
  <choose_dept_dialog
    dialogTitle="组织架构权限"
    :isUsePermission="false"
    :getAllChild="false"
    :allowEmpty="true"
    v-if="frameworkData.show"
    :deptDialog="frameworkData"
    @updateDept="setFrameWorkData"
    :isConfigPermission="true"
  ></choose_dept_dialog>
</template>

<script setup>
import sectionChoice from '../components/section_choice/index.vue'
import selectAccount from './components/select_account.vue'
import matrixDialog from './components/matrix_dialog.vue'
// import frameworkDialog from './components/framework_dialog.vue'
import { addOrUptUser } from '@/api/system_setting/account'
// import { ElMessageBox } from 'element-plus'
import { throttle } from '@/utils/tools.js'
import { getUserRoleInfo } from '@/utils/doLogin'
import { useStore } from 'vuex'
const props = defineProps({
  visible: { type: Boolean, default: false },
  data: { type: Object }, // 编辑数据
  dict: { type: Array }, // 角色下拉数据
  organization: {
    type: Array
  }, // 组织架构下拉数据
  fsInfo: { type: Object }, // 架构页面进入传参
  editActDataPmsEditVO: { type: Object },
  permissionsType: {
    type: Number || String
  }
})
const emits = defineEmits(['update:visible', 'updateList'])

const judgeOEA = inject('$judgeOEA')
const store = useStore()
// 是否拥有编辑第三方员工ID的权限
const canEditThirdPartyStaffId = computed(() => store.state.user.canEditThirdPartyStaffId)
// 手机号的验证
const validatePhone = (rule, value, callback) => {
  if (form.value.userPhone) {
    if (!/^1[3456789][\d]{9}$/.test(form.value.userPhone)) {
      callback(new Error('手机号码有误，请重填'))
    } else {
      callback()
    }
  } else {
    if (form.value.staffType === 1 && form.value.isMain !== 1) {
      callback()
    } else {
      callback(new Error('请输入手机号'))
    }
  }
}
// 表单相关数据
const formData = reactive({
  refForm: null,
  form: {
    userBrandName: '',
    userPhone: '',
    roleIdList: [],
    // matrixList: [],
    dataPermissionsList: [], //	组织架构数据权限(部门id集合)
    section: '',
    permissionType: null,
    operateAccount: [],
    loginBack: 1,
    //
    dataAccountIds: [], // 数据权限矩阵号id列表
    dataAccountGroupIds: [] // 数据权限矩阵号分组id列表
  },
  rules: {
    userBrandName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
    roleIdList: [{ type: 'array', required: true, message: '请选择', trigger: 'change' }],
    loginBack: [{ required: true, message: '请选择', trigger: 'blur,change' }],
    userPhone: [
      {
        required: true,
        validator: validatePhone,
        trigger: 'change'
      }
    ]
  },
  // 部门选择
  sectionShow: {
    show: false,
    data: null
  },
  accountShow: {
    visible: false,
    data: null
  },
  //  主账号
  mainId: null
})
if (!props.data) {
  formData.rules.userPhone = [
    {
      required: true,
      pattern: /^1[3456789]\d{9}$/,
      message: '请输入正确的手机号',
      trigger: 'blur'
    }
  ]
}
const { rules, refForm, form, sectionShow, accountShow, mainId } = toRefs(formData)
// const $message = inject('$message')

// 矩阵号数据权限数据
const informatData = reactive({
  show: false,
  title: '矩阵号数据权限',
  row: null,
  dataAccountGroupIds: [],
  dataAccountIds: []
})

// 组织架构数据权限数据
const frameworkData = reactive({
  show: false,
  title: '组织架构权限',
  row: null,
  ids: [],
  checkNode: [] // 选中的详细信息列表
})

const title = computed(() => {
  return !props.data ? '新增' : '修改'
})
const saveLoading = ref(false)
const handleConfirm = throttle(() => {
  saveLoading.value = true
  refForm.value.validate(valid => {
    if (valid) {
      addOrUptUser({
        ...form.value,
        dataPermissionsList: form.value.dataPermissionsList,
        fsOpenId: form.value.section ? form.value.section.feishuOpenId : '',
        staffId: form.value.section ? form.value.section.id : '',
        operatorIdList: form.value.operateAccount.map(i => i.operatorId),
        appType: 1,
        operatorId: mainId.value,
        unionId: (props.data && props.data.feishuUnionId) || '',
        permissionType:
          form.value.permissionType === null ? null : Number(form.value.permissionType),
        pcThirdPartyStaffId: form.value.thirdPartyStaffId || '', // 修改后的员工ID
        thirdPartyStaffId: '' // 员工ID入参设置为空
      })
        .then(res => {
          if (res.code === 0) {
            emits('updateList')

            const userId1 = form.value.section ? form.value?.section?.userId || '' : ''
            const userId2 = localStorage.getItem('userInfo')
              ? JSON.parse(localStorage.getItem('userInfo')).userId
              : ''
            if (userId1 === userId2) {
              // 如果编辑的是当前登录账号的用户信息，则重新获取一下用户角色，是否是管理员，任务创建需要
              getUserRoleInfo()
            }

            handleClose()
          }
        })
        .finally(() => {
          saveLoading.value = false
        })
    } else {
      saveLoading.value = false
    }
  })
}, 1000)
const handleClose = () => {
  emits('update:visible', !props.visible)
}
// 选择员工
// const alertSection = () => {
//   sectionShow.value.data = form.value.section
//   sectionShow.value.show = true
// }
// const unchoiceSection = index => {
//   form.value.section = ''
// }
const setSection = res => {
  form.value.section = res
}
const getType = res => {
  form.value.permissionType = res
}
const dataAccountIds = res => {
  form.value.dataAccountIds = res
}
const dataAccountGroupIds = res => {
  form.value.dataAccountGroupIds = res
}
// const unbind = () => {
//   ElMessageBox.confirm('确定是否解除绑定', {
//     confirmButtonText: '确定',
//     cancelButtonText: '取消',
//     type: 'warning'
//   }).then(() => {
//     relieveFsAccount({ accountId: form.value.accountId, userId: form.value.userId }).then(res => {
//       emits('updateList')
//       form.value.section = null
//       $message.success('解绑成功')
//     })
//   })
// }
// 选择运营账号
const delItem = index => {
  if (form.value.operateAccount[index].operatorId === mainId.value) {
    form.value.operateAccount.splice(index, 1)
    const arr = form.value.operateAccount.filter(i => i.status !== 2)
    mainId.value = arr.length > 0 ? arr[0].operatorId : null
  } else {
    form.value.operateAccount.splice(index, 1)
  }
}
// 运营矩阵号
const addItem = () => {
  accountShow.value.data = form.value.operateAccount
  accountShow.value.visible = true
}
const myPermissionType = ref('')
// 矩阵号数据权限
const addMatrix = val => {
  informatData.show = true
  myPermissionType.value = val === null ? '0' : String(val)
}
// 组织架构数据权限
const addFramework = () => {
  frameworkData.show = true
  // accountShow.value.data = form.value.operateAccount
}

const setOPerate = data => {
  form.value.operateAccount = data
  mainId.value =
    form.value.operateAccount.length > 0 ? form.value.operateAccount[0].operatorId : null
}
const matrixList = ref([])
const setMatrix = (data = []) => {
  // form.value.matrixList = data
  matrixList.value = data
}
const permissionsList = ref([]) // 组织架构数据权限的id集合

const setFrameWorkData = data => {
  permissionsList.value = data
  form.value.dataPermissionsList = data.map(e => e.id)
  frameworkData.ids = form.value.dataPermissionsList
  frameworkData.checkNode = data
  console.log('组织架构数据权限ids', form.value.dataPermissionsList)
}
const toggleMain = id => {
  mainId.value = id
}

watch(
  () => props.editActDataPmsEditVO,
  val => {
    console.log('矩阵号数据权限', val)
    const permissionNameList = []
    if (val.accountGroups) {
      const dataAccountGroupIds = []
      val.accountGroups.forEach(item => {
        dataAccountGroupIds.push(item.id)
        permissionNameList.push(item.name)
      })
      informatData.dataAccountGroupIds = dataAccountGroupIds
      form.value.dataAccountGroupIds = dataAccountGroupIds
    }
    if (val.accounts) {
      const dataAccountIds = []
      val.accounts.forEach(item => {
        dataAccountIds.push(item.id)
        console.log('form.value.dataAccountIds', form.value.dataAccountIds)
        permissionNameList.push(item.name)
      })
      informatData.dataAccountIds = dataAccountIds
      form.value.dataAccountIds = dataAccountIds
    }
    form.value.permissionType = val.permissionsType
    if (val.permissionsType === 0) {
      matrixList.value = ['全部矩阵号']
    } else {
      matrixList.value = permissionNameList
    }
  },
  { immediate: true }
)

watch(
  () => props.data,
  (val, oldVal) => {
    if (val) {
      const copy = JSON.parse(JSON.stringify(val))
      copy.loginBack = 1
      form.value = copy
      form.value.roleIdList = copy.role.map(r => r.roleId)
      form.value.operateAccount = copy.operator || []
      form.value.section = copy.fsAccount
      permissionsList.value = copy.dataPermissionsList
      if (copy.dataPermissionsList && copy.dataPermissionsList.length) {
        form.value.dataPermissionsList = copy.dataPermissionsList.map(e => e.id)
      }
      frameworkData.checkNode = permissionsList.value
      frameworkData.ids = form.value.dataPermissionsList
      const item = form.value.operateAccount.find(i => i.isMasterAccount === 1)
      if (item) {
        mainId.value = item.operatorId
      } else {
        if (form.value.operateAccount.length > 0) {
          mainId.value = form.value.operateAccount[0].operatorId
        }
      }
    }
  },
  { immediate: true }
)
watch(
  () => props.fsInfo,
  (val, oldVal) => {
    if (val) {
      form.value.section = val
    }
  },
  { immediate: true }
)
// 平台授权有效
const isInvalid = item => {
  if ([1, 2, 3, 4].indexOf(item.platform) === -1) return true
  const authKey = {
    1: 'dyAuth',
    2: 'wxAuth',
    3: 'xhsAuth',
    4: 'dyAuth'
  }
  return item[authKey[item.platform]] === 2
}
</script>

<style lang="scss" scoped>
@import '@/views/system/components/css/common.scss';
.disabled {
  pointer-events: none;
  cursor: not-allowed;
  background: #f5f7fa;
}
.el-form {
  .el-form-item {
    :deep(.el-form-item__label) {
      min-width: 128px;
    }
    :deep(.el-form-item__content) {
      height: auto;
    }
    :deep(.el-select .el-select__tags .el-tag) {
      background: rgba(54, 79, 205, 0.2);
      border-radius: 2px;
      color: #323233;
      .el-tag__close {
        color: #364fcd;
      }
    }
    :deep(.el-input__inner) {
      &::placeholder {
        font-family: PingFangSC-Regular, PingFang SC, Arial, sans-serif;
      }
    }
  }
}
.unbind {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
:deep(.el-input__validateIcon) {
  display: none;
}
.photos {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  .photos_item {
    position: relative;
    border: 1px solid transparent;
    border-radius: 50%;
    margin-right: 24px;
    margin-bottom: 24px;
    cursor: pointer;
    > img {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      vertical-align: middle;
    }
  }
}
.disPhone_box {
  background-color: var(--el-disabled-bg-color);
  border-color: var(--el-disabled-border-color);
  color: var(--el-disabled-text-color);
  cursor: not-allowed;
  height: 32px;
  line-height: 30px;
  -webkit-appearance: none;

  background-image: none;
  border-radius: var(--el-input-border-radius, var(--el-border-radius-base));
  border: var(--el-input-border, var(--el-border-base));
  box-sizing: border-box;

  display: inline-block;
  font-size: inherit;

  outline: 0;
  padding: 0 11px;
  transition: var(--el-transition-border);
  width: 100%;
}

:deep(.noneValite .el-form-item__label:before) {
  display: none;
}
:deep(.section_name) {
  max-width: 100%;
  height: 100%;
  @include mult_line(1);
}
</style>
