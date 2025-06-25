<template>
  <div class="remind_box">
    <div class="title">直播违规提醒</div>
    <div class="mark">
      自动监控矩阵号直播违规提示，及时通知到人或群（只能监控授权过百应的矩阵号）
    </div>
    <div class="switch_box">
      <el-switch
        @click="editRole(openRemind)"
        :model-value="openRemind"
        inline-prompt
        :width="45"
        active-text="开"
        inactive-text="关"
      ></el-switch>
      <el-link v-if="openRemind" class="edit_btn" type="primary" @click="openDialog">编辑</el-link>
    </div>
    <div class="remind_user" v-if="openRemind">
      <template v-for="item in remindData" :key="item.notifyType">
        <template v-if="item.notifyType === 1">
          <div class="one_user">
            <div class="iconfont icon-juzhenhaoyunyingzhe"></div>
            矩阵号运营者
          </div>
        </template>
        <template v-else>
          <div class="one_user" v-for="x in item.typeList" :key="x.notifyId">
            <div
              :class="{
                iconfont: true,
                'icon-jiaose1': item.notifyType === 2,
                'icon-qun': item.notifyType === 3
              }"
            ></div>
            {{ x.notifyComment || '--' }}
          </div>
        </template>
      </template>
    </div>

    <el-dialog
      :close-on-click-modal="false"
      v-model="settingForm.show"
      title="设置"
      width="500px"
      destroy-on-close
    >
      <div class="dialog">
        <div>
          <el-checkbox v-model="settingForm.operatorCheck">矩阵号运营者</el-checkbox>
        </div>
        <div style="margin: 0; padding-left: 22px">
          直播间出现违规，将发送{{
            isWeChat ? '企业微信' : isWeiXin ? '微信公众号' : '飞书'
          }}消息给相应的运营者
        </div>
      </div>
      <div class="dialog mb">
        <div>
          <el-checkbox
            v-model="settingForm.roleCheck"
            @change="roleChange"
            :style="{
              width: isWeChat ? '106px' : ''
            }"
          >
            <template v-if="isWeChat">角&emsp;&emsp;&emsp;色 ：</template>
            <template v-else>角&emsp;色：</template>
          </el-checkbox>

          <el-select
            :disabled="!settingForm.roleCheck"
            v-model="settingForm.role"
            multiple
            placeholder="请选择角色"
            style="width: 100%; min-height: 32px"
          >
            <el-option
              v-for="item in roleList"
              :label="item.roleName"
              :value="item.roleId"
              :key="item.roleId"
            />
          </el-select>
        </div>
        <div
          :style="{
            paddingLeft: isWeChat ? '106px' : ''
          }"
        >
          每天早上9:00将给设置的角色发送{{
            isWeChat ? '企业微信' : isWeiXin ? '微信公众号' : '飞书'
          }}消息，推送矩阵违规日报
        </div>
      </div>
      <div class="dialog mb" v-if="!isWeiXin">
        <div>
          <el-checkbox v-model="settingForm.feishuCheck" @change="feishuChange">
            {{ isWeChat ? '企业微信' : '飞书' }}群：
          </el-checkbox>

          <el-select
            :disabled="!settingForm.feishuCheck"
            v-model="settingForm.feishu"
            multiple
            :placeholder="`请选择${isWeChat ? '企业微信' : '飞书'}群`"
            style="width: 100%; min-height: 32px"
          >
            <el-option
              v-for="item in feishuList"
              :label="item.name"
              :value="item.groupId"
              :key="item.groupId"
            />
          </el-select>
        </div>
        <div v-if="isWeChat" style="padding-left: 106px">只可选择已添加的企业微信群</div>
        <div v-else>
          每天早上9:00将给设置的飞书群发送飞书消息，推送矩阵违规日报，只可选择机器人所在的群
          <el-popover
            placement="right"
            :width="dialogWidth"
            trigger="hover"
            popper-class="g_popper_gray"
          >
            <template #reference>
              <i style="font-size: 14px; cursor: pointer" class="iconfont icon-wenhao"></i>
            </template>
            <div class="myTips">
              <div class="left">
                <div>移动端</div>
                <p>1.点击群设置</p>
                <img src="@/assets/images/content_config/a.png" alt class="tip_img" />
                <p>2.点击群机器人</p>
                <img src="@/assets/images/content_config/b.png" alt class="tip_img" />
                <p>3.点击添加</p>
                <img src="@/assets/images/content_config/c.png" alt class="tip_img" />
                <p>4.找到tagvv，添加即可</p>
                <img
                  src="@/assets/images/content_config/d.png"
                  alt
                  style="width: 260px; height: 190px"
                />
              </div>
              <div class="right">
                <div>PC端</div>
                <p>1.点击群设置，点击群机器人</p>
                <img src="@/assets/images/content_config/e.png" alt class="tip_img" />
                <p>2.点击添加机器人</p>
                <img src="@/assets/images/content_config/f.png" alt class="tip_img" />
                <p>3.找到tagvv，添加即可</p>
                <img src="@/assets/images/content_config/gg.png" alt class="tip_img" />
              </div>
            </div>
          </el-popover>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelFun">取消</el-button>
          <el-button
            type="primary"
            @click="okFun"
            :loading="settingForm.loading"
            :disabled="dialogDis"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { getChatPage } from '@/api/system_setting/notice'
import { selectRoleList } from '@/api/system_setting/role'
import { settingRemind, saveRemind } from '@/api/content_center/live_violation.js'

const isWeChat = ref(true)
isWeChat.value = localStorage.getItem('isWeChat') === '1'
const isWeiXin = ref(true)
isWeiXin.value = localStorage.getItem('isWeiXin') === '1'
const openRemind = ref(false)

const remindData = ref([])
// 获取提醒
function getInfo() {
  settingRemind({}).then(res => {
    if (res.code === 0 && res.data) {
      openRemind.value = res.data.isOpen === 1
      remindData.value = res.data.detail || []
    }
  })
}
getInfo()
function editRole(status) {
  console.log(status, 'status')
  if (!status) {
    openDialog()
  } else {
    // 关闭提醒
    saveFun({
      isOpen: 0,
      typeParamList: []
    })
    // openRemind.value = false
  }
}
const dialogWidth = ref('590px')
window.addEventListener('resize', () => {
  if (document.body.clientWidth > 1600) {
    dialogWidth.value = '590px'
  } else {
    dialogWidth.value = '490px'
  }
})
const roleList = ref()
const feishuList = ref()
const settingForm = reactive({
  show: false,
  loading: false,
  operatorCheck: false,
  roleCheck: false,
  role: null,
  feishuCheck: false,
  feishu: null
})
// 设置弹窗是否禁用，必须有一个选中才可以
const dialogDis = computed(() => {
  if (settingForm.show === true) {
    if (settingForm.operatorCheck || settingForm.roleCheck || settingForm.feishuCheck) {
      if (
        (!settingForm.roleCheck ||
          (settingForm.roleCheck && settingForm.role !== null && settingForm.role.length > 0)) &&
        (!settingForm.feishuCheck ||
          (settingForm.feishuCheck && settingForm.feishu !== null && settingForm.feishu.length > 0))
      ) {
        return false
      } else {
        return true
      }
    } else {
      return true
    }
  } else {
    return true
  }
})
// 获取角色列表
function getRoleList() {
  selectRoleList({
    pageNumber: 1,
    pageSize: 999
  }).then(res => {
    roleList.value = res.data
  })
}
// 获取飞书群列表
function getFeishuList() {
  getChatPage({ pageSize: 999, pageToken: '' }).then(res => {
    if (res.code === 0 && res.data) {
      feishuList.value = res.data.chatList || []
    }
  })
}
// 打开弹窗
function openDialog() {
  settingForm.loading = false
  if (remindData.value.length > 0) {
    let operatorCheck = false
    let roleList = []
    let feishuList = []
    remindData.value.forEach(x => {
      if (x.notifyType === 1) {
        operatorCheck = true
      }
      if (x.notifyType === 2 && x.typeList.length > 0) {
        roleList = x.typeList.map(x => parseInt(x.notifyId))
      }
      if (x.notifyType === 3 && x.typeList.length > 0) {
        feishuList = x.typeList.map(x => parseInt(x.notifyId))
      }
    })
    settingForm.operatorCheck = operatorCheck
    settingForm.roleCheck = roleList.length > 0
    settingForm.role = roleList.length > 0 ? roleList : null
    settingForm.feishuCheck = feishuList.length > 0
    settingForm.feishu = feishuList.length > 0 ? feishuList : null
  } else {
    settingForm.operatorCheck = false
    settingForm.roleCheck = false
    settingForm.role = null
    settingForm.feishuCheck = false
    settingForm.feishu = null
  }
  getFeishuList()
  getRoleList()
  settingForm.show = true
}
// 角色修改
function roleChange(e) {
  if (!e) {
    settingForm.role = null
  }
}
// 飞书群修改
function feishuChange(e) {
  if (!e) {
    settingForm.feishu = null
  }
}
// 弹窗的取消事件
function cancelFun() {
  settingForm.show = false
}
const message = inject('$message')
// 弹窗的确定事件
function okFun() {
  settingForm.loading = true
  const list = []
  if (settingForm.operatorCheck) {
    list.push({
      notifyType: 1,
      typeList: [{ notifyComment: '矩阵号运营者', notifyId: 100 }]
    })
  }
  if (settingForm.roleCheck) {
    const chooseRole = []
    console.log(settingForm, roleList, 'CHOOSE')
    settingForm.role.forEach(x => {
      roleList.value.forEach(y => {
        if (y.roleId === x) {
          chooseRole.push({
            notifyComment: y.roleName,
            notifyId: y.roleId
          })
        }
      })
    })
    console.log(chooseRole, 'CHOOSE')
    list.push({
      notifyType: 2,
      typeList: chooseRole
    })
  }
  if (settingForm.feishuCheck) {
    const chooseRole = []
    settingForm.feishu.forEach(x => {
      feishuList.value.forEach(y => {
        if (y.groupId === parseInt(x)) {
          chooseRole.push({
            notifyComment: y.name,
            notifyId: y.groupId,
            webhookUrl: y.webhookUrl
          })
        }
      })
    })
    list.push({
      notifyType: 3,
      typeList: chooseRole
    })
  }
  console.log(list)
  saveFun({
    isOpen: 1,
    typeParamList: list
  })
}
// 开启或关闭开关的接口
function saveFun(data) {
  saveRemind(data)
    .then(res => {
      if (res.code === 0) {
        console.log(res, 'res')
        getInfo()
        message.success(data.isOpen === 1 ? '设置成功' : '关闭成功')

        settingForm.show = false
      }
    })
    .finally(() => {
      settingForm.loading = false
    })
}
</script>
<style lang="scss" scoped>
.remind_box {
  width: 100%;
  // min-height: 196px;
  background: #ffffff;
  border-radius: 4px;
  padding: 22px 24px;
  .title {
    font-size: 18px;
    font-weight: 600;
    color: #323233;
    line-height: 20px;
  }
  .mark {
    margin: 8px 0 10px;
    font-size: 12px;
    font-weight: 400;
    color: #909399;
    line-height: 20px;
  }
  .switch_box {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .edit_btn {
      margin-left: 20px;
      font-size: 14px;
      line-height: 22px;
    }
  }
  .remind_user {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;
    .one_user {
      margin-top: 12px;

      background: #ebedfa;

      border-radius: 13px;
      padding: 0px 8px;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      font-size: 12px;
      font-weight: 400;
      color: #323233;
      line-height: 24px;
      height: 24px;
      margin-right: 16px;
      .iconfont {
        font-size: 14px;
        color: var(--el-color-primary);
        margin-right: 8px;
      }
    }
  }

  .dialog {
    &.mb {
      margin-top: 20px;
    }
    > div:nth-child(1) {
      display: flex;
      .label {
        width: 70px;
        line-height: 40px;
        margin-left: 10px;
      }
    }
    > div:nth-child(2) {
      padding-left: 85px;
      margin-top: 6px;
      font-size: 12px;
      line-height: 20px;
      color: #909399;
    }
  }
}
.myTips {
  color: #fff;
  padding: 12px 30px 0 6px;
  display: flex;
  .left {
    margin-right: 40px;
    margin-left: 10px;
  }
  .left,
  .right {
    > div {
      height: 22px;
      font-size: 16px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #ffffff;
      line-height: 22px;
    }
    > p {
      margin-left: 12px;
      margin: 12px 0 13px 0;
      font-size: 12px;
    }
  }
  .tip_img {
    width: 260px;
  }
}
@media screen and (max-width: 1600px) {
  .myTips {
    padding: 0;
    .tip_img {
      width: 220px;
    }
    .left {
      margin-right: 10px;
      margin-left: 0;
    }
  }
}
.dialog-footer {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
}
</style>
