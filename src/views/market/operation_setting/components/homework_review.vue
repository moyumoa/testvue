<template>
  <div class="homework_review">
    <!-- 通用模块 -->
    <section>
      <h3>作业点评通知设置</h3>
      <el-form ref="formRef" :model="common" label-width="130px" @submit.enter.prevent>
        <el-form-item label="当前通知客户端：">
          <p style="margin-right: 8px">
            {{ isWeChat ? '企业微信' : isWeiXin ? '微信和星麦云App' : '飞书' }}
          </p>
          <img
            v-if="isWeChat"
            src="@/assets/images/user/weChat.png"
            style="width: 24px; height: 24px"
            alt
          />
          <img
            v-if="isFlyBook"
            src="@/assets/images/user/feishu.png"
            style="width: 24px; height: 24px"
            alt
          />
          <!--          <img-->
          <!--            v-if="isWeiXin"-->
          <!--            src="@/assets/images/user/wx.png"-->
          <!--            style="width: 24px; height: 24px"-->
          <!--            alt=""-->
          <!--          />-->
        </el-form-item>
        <el-form-item label="待点评通知：">
          <div>
            <el-switch
              v-model="common.isAuditVideoNotice"
              inline-prompt
              active-text="开"
              inactive-text="关"
              active-value="1"
              inactive-value="0"
              @change="commonSwitch"
            ></el-switch>
            <div style="display: flex">
              <p
                class="mt-2"
                style="
                  margin-bottom: 6px;
                  font-size: 12px;
                  font-family: PingFangSC-Regular, PingFang SC;
                  font-weight: 400;
                  color: #909399;
                "
              >
                开启后，有作业需要点评时，系统将在客户端给点评人推送通知
              </p>
            </div>
            <div>
              <span style="margin-right: 16px">每隔</span>
              <el-input-number
                :disabled="lockTime"
                v-model="common.auditVideoNoticeTime"
                :min="1"
                :max="100"
                :precision="0"
                controls-position="right"
              />
              <span style="margin: 0 16px">小时</span>
              <span>检查是否有待点评作业</span>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="点评结果通知：">
          <div>
            <el-switch
              v-model="common.isSendAuditResult"
              inline-prompt
              active-text="开"
              inactive-text="关"
              active-value="1"
              inactive-value="0"
              @change="commonSwitch"
            ></el-switch>
            <div style="display: flex">
              <p
                style="
                  font-size: 12px;
                  font-family: PingFangSC-Regular, PingFang SC;
                  font-weight: 400;
                  color: #909399;
                "
              >
                开启后，系统将给作业提交人实时推送点评结果
              </p>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </section>

    <!-- 任务审核设置 -->
    <section>
      <el-form ref="formRef" label-width="130px">
        <el-form-item label="点评人员：">
          <el-button type="primary" @click="changeAddShow">添加点评人</el-button>
        </el-form-item>
        <el-form-item label="点评人信息：">
          <div class="member_info" v-for="(i, index) in memberDate" :key="index">
            <img class="avatar_icon" :src="i.userPhoto ? i.userPhoto : avatarImg" alt />
            <div class="name_mobile">
              <div class="name_box">
                <div
                  class="name"
                  :style="
                    i.fsAccount && i.fsAccount.staffStatus && i.fsAccount.staffStatus == 2
                      ? 'max-width:calc(100% - 52px)'
                      : ''
                  "
                >
                  {{ i.name || '--' }}
                </div>
                <div
                  class="xm_depart"
                  v-if="i.fsAccount && i.fsAccount.staffStatus && i.fsAccount.staffStatus == 2"
                ></div>
              </div>
              <div class="phone_box" v-if="i.userPhone">
                <table_column_phone :phone="i.userPhone" size="small"></table_column_phone>
              </div>
            </div>
            <div
              style="margin-right: 12px; cursor: pointer; display: flex; align-items: center"
              @click="changeDeleteShow(i)"
            >
              <img src="@/assets/images/delete.png" style="width: 16px; height: 16px" alt />
            </div>
          </div>
        </el-form-item>
      </el-form>
    </section>
    <!-- 添加审核成员弹窗 -->
    <el-dialog v-model="addMemberShow" @close="_clear" title="添加点评人" width="30%">
      <el-form ref="formRef" @submit.enter.prevent>
        <el-form-item label="搜索成员">
          <div>
            <el-autocomplete
              v-model="searchMember"
              :fetch-suggestions="querySearchAsync"
              placeholder="请输入成员姓名或手机号"
              @select="handleSelect"
              ref="autocompleteRef"
            />
          </div>
        </el-form-item>
      </el-form>
      <!-- 视频审核多级审核 -->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addMemberShow = false">取消</el-button>
          <el-button type="primary" @click="_addAuditTaskUser">保存</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 删除成员弹窗 -->
    <el-dialog v-model="deleteMemberShow" title="系统提醒" width="400px">
      <p>确定删除点评人？</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteMemberShow = false">取消</el-button>
          <el-button type="primary" @click="deleteUser">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { pageList } from '../model/get_list'
import avatarImg from '@/assets/images/content_center/default_user.png'

// getAuditTaskUser 接口参数 获取作业点评人员列表 type = 4
const type = ref(4)

const chooseTab = ref('homework')
const {
  memberDate,
  addMemberShow,
  deleteMemberShow,
  searchMember,
  changeAddShow,
  changeDeleteShow,
  AuditTaskUser,
  querySearchAsync,
  handleSelect,
  _addAuditTaskUser,
  deleteUser,
  commonSetting,
  common,
  commonSwitch,
  lockTime,
  clear
} = pageList(chooseTab.value, type.value)

onMounted(() => {
  AuditTaskUser()
  commonSetting()
})
const isWeChat = ref(false)
isWeChat.value = localStorage.getItem('isWeChat') === '1'
const isWeiXin = ref(true)
isWeiXin.value = localStorage.getItem('isWeiXin') === '1'
const isFlyBook = ref(true)
isFlyBook.value = localStorage.getItem('isFlyBook') === '1'
const autocompleteRef = ref(null)

function _clear() {
  clear()
  if (autocompleteRef.value) {
    autocompleteRef.value.suggestions = []
    autocompleteRef.value.highlightedIndex = -1
  }
}
</script>

<style lang="scss" scoped>
.homework_review {
  section {
    // padding: 32px 33px 24px 33px;
    // background-color: #fff;
    // margin-bottom: 16px;

    h3 {
      margin-bottom: 16px;
      // height: 20px;
      font-size: 18px;
      font-weight: 600;
      // color: #323233;
      line-height: 20px;
    }
  }
}

section + section {
  margin-top: 20px;
}
:deep(.el-form-item__label) {
  height: 20px;
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #323233;
  line-height: 20px;
}

:deep(.el-form-item__content) {
  margin-top: -7px;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

.member_info {
  width: 220px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-right: 30px;
  margin-bottom: 20px;
  padding: 8px 0 8px 11px;
  box-shadow: 0px 2px 4px 0px rgba(42, 50, 89, 0.09);

  .avatar_icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
  }

  .name_mobile {
    margin-left: 16px;
    // flex: 1;
    width: calc(100% - 104px);
    .name_box {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
    }
    .name {
      overflow: hidden; //超出的文本隐藏
      text-overflow: ellipsis; //溢出用省略号显示
      white-space: nowrap; //溢出不换行
    }

    .mobile {
      font-size: 12px;
      color: #909399;
      line-height: 17px;
    }

    .phone_box {
      line-height: 17px;
    }
  }
}
</style>
