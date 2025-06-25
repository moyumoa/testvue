<template>
  <div class="fs_setting_wrapper mt_16">
    <div class="fs_setting_header g_bg">
      <div class="logo">
        <img src="@/assets/images/user/feishu.png" alt />
        <span>飞书:</span>
      </div>
      <p class="text1">利用飞书基础能力（组织架构）进行全员内容创作</p>
      <p class="text2">
        星麦云支持飞书平台，同步飞书组织架构，便捷管理各部门员工进行矩阵营销任务分发，建立企业私域流量池
      </p>
    </div>
    <div class="fs_setting_main g_bg mt_16">
      <div class="form">
        <div class="form_item">
          <div class="form_item_label">企业编号：</div>
          <div class="form_item_content">
            <el-input v-model="code" disabled style="width: 400px" @blur="onBlur" />
          </div>
        </div>
        <div class="form_item">
          <div class="form_item_label">同步组织架构：</div>
          <div class="form_item_content">
            <el-button type="primary" @click="synchronous" v-loading.fullscreen.lock="loading">
              同步飞书结构
            </el-button>
            <p class="tip">同步后您可在组织结构菜单中查看部门信息</p>
          </div>
        </div>
        <!-- <div class="form_item" style="margin-top: -10px">
          <div class="form_item_label">员工自动注册：</div>
          <div class="form_item_content">
            <el-switch
              v-model="autoRegister"
              inline-prompt
              active-text="是"
              inactive-text="否"
              :active-value="1"
              :inactive-value="0"
              @change="onChange"
              style="height: 32px"
            />
            <el-button type="primary" @click="onEdit" style="margin-left: 10px">编辑</el-button>
            <p class="tip">开启后，未注册员工可在飞书上打开应用，自助注册</p>
          </div>
        </div> -->
        <!-- <div class="form_item" v-if="autoRegister === 1 && roles.length > 0">
          <div class="form_item_label">默认角色：</div>
          <div class="form_item_content" style="line-height: 30px">
            <div class="role_list">
              <template v-for="item in roles" :key="item.roleId">
                <el-tag class="role_item">{{ item.roleName }}</el-tag>
              </template>
            </div>
          </div>
        </div> -->
        <!-- style="margin-top: -10px" -->
        <!-- <div class="form_item" v-if="autoRegister">
          <div class="form_item_label">是否绑定手机号：</div>
          <div class="form_item_content">
            <span style="line-height: 32px">{{ info.forceBindPhoneState == 1 ? '是' : '否' }}</span>
          </div>
        </div> -->
        <hierarchy-alias></hierarchy-alias>
      </div>
    </div>
    <el-dialog v-model="visible" title="默认角色" width="500px" :before-close="onClose">
      <div>
        <span>角色：</span>
        <el-select v-model="role" multiple placeholder="请选择角色" style="width: 80%">
          <el-option
            v-for="item in roleList"
            :label="item.roleName"
            :value="item.roleId"
            :key="item.roleId"
          />
        </el-select>
      </div>
      <div class="mt_16">
        <span>是否需要绑定手机号：</span>
        <el-radio-group v-model="info.forceBindPhoneState">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="onClose">取消</el-button>
          <el-button type="primary" @click="onConfirm" :disabled="role.length === 0">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import hierarchyAlias from './components/hierarchy_alias.vue'
import {
  syncOrg,
  setDefaultRole,
  updateAutoRegisterStatus,
  orgSyncConfig,
  updateDisplayId
} from '@/api/system_setting/section'
import { selectRoleList } from '@/api/system_setting/role'

const $message = inject('$message')
const loading = ref(false)
const visible = ref(false)
const roleList = ref([])
const roles = ref([])
const isEdit = ref(false)
const info = reactive({
  code: '',
  role: [],
  forceBindPhoneState: false,
  autoRegister: 0
})
const { role, code, autoRegister } = toRefs(info)

const onBlur = () => {
  updateDisplayId({ displayId: code.value })
    .then(res => {
      $message.warning('修改成功')
    })
    .catch(() => {
      getInfo()
    })
}
// 同步
const synchronous = () => {
  loading.value = true
  syncOrg({})
    .then(res => {
      loading.value = false
      $message.success('提交同步指令成功,同步时长受部门及员工数量影响,请稍后再查看最新部门人员数据')
    })
    .catch(() => {
      loading.value = false
    })
}

// const onChange = () => {
//   if (autoRegister.value === 1 && roles.value.length === 0) {
//     isEdit.value = false
//     visible.value = true
//   } else {
//     onUpdate(2)
//   }
// }
const onConfirm = () => {
  setDefaultRole({
    defaultRoleIds: role.value.join(','),
    updateForceBindPhoneState: info.forceBindPhoneState
  }).then(res => {
    $message.success('修改成功')
    visible.value = false
    if (isEdit.value !== true) {
      onUpdate(1)
    }
    getInfo(1)
  })
}
const onClose = () => {
  role.value = []
  visible.value = false
  getInfo()
}
const onUpdate = type => {
  updateAutoRegisterStatus({
    autoRegisterStatus: autoRegister.value
  }).then(res => {
    if (type === 2) {
      $message.success('修改成功')
    }
  })
}
// const onEdit = () => {
//   isEdit.value = true
//   role.value = roles.value.map(i => i.roleId)
//   visible.value = true
// }
const fetchRoleList = () => {
  selectRoleList({
    pageNumber: 1,
    pageSize: 999
  }).then(res => {
    roleList.value = res.data
  })
}
const getInfo = () => {
  orgSyncConfig().then(({ data }) => {
    code.value = data.displayId
    autoRegister.value = data.autoRegisterStatus
    roles.value = data.roleList
    info.forceBindPhoneState = data.forceBindPhoneState
  })
}

onMounted(() => {
  fetchRoleList()
  getInfo()
})
</script>

<style lang="scss" scoped>
.fs_setting_wrapper {
  .fs_setting_header {
    .logo {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      > img {
        width: 32px;
        height: 32px;
        margin-right: 8px;
      }
      > span {
        font-size: 18px;
        font-weight: 600;
        color: #323233;
      }
    }
    .text1 {
      line-height: 20px;
      font-size: 16px;
    }
    .text2 {
      margin-top: 4px;
      color: #909399;
      font-size: 12px;
      line-height: 20px;
    }
  }
  :deep(.fs_setting_main) {
    .form {
      &_item {
        display: flex;
        margin-bottom: 20px;
        &_label {
          width: 120px;
          text-align: right;
          margin-right: 8px;
          line-height: 32px;
        }
        &_content {
          flex: 1;
          .tip {
            color: #909399;
            font-size: 12px;
            margin-top: 4px;
            line-height: 17px;
          }
          .role_list {
            width: 400px;
            display: flex;
            flex-wrap: wrap;
            .role_item {
              height: 32px;
              line-height: 32px;
              margin-right: 24px;
              margin-bottom: 6px;
            }
          }
        }
      }
    }
  }
}
</style>
