<template>
  <div class="msgsetting">
    <!-- 通用模块 -->
    <section>
      <h3
        style="
          margin-bottom: 20px;
          height: 20px;
          font-size: 18px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #323233;
          line-height: 20px;
        "
      >
        审核通知设置
      </h3>
      <div class="client">
        <el-form ref="formRef" :model="common" label-width="130px" @submit.enter.prevent>
          <el-form-item label="当前通知客户端：">
            <p style="margin-right: 8px">
              {{ isWeChat ? '企业微信' : isWeiXin ? '微信和星麦云App' : '飞书' }}
            </p>
            <img
              v-if="isWeChat"
              src="@/assets/images/user/weChat.png"
              style="width: 24px; height: 24px"
              alt=""
            />
            <img
              v-if="isFlyBook"
              src="@/assets/images/user/feishu.png"
              style="width: 24px; height: 24px"
              alt=""
            />
<!--            <img-->
<!--              v-if="isWeiXin"-->
<!--              src="@/assets/images/user/wx.png"-->
<!--              style="width: 24px; height: 24px"-->
<!--              alt=""-->
<!--            />-->
          </el-form-item>
          <el-form-item :label="msg">
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
                  {{
                    `开启后，有${
                      chooseTab === 'video' ? '视频' : '任务'
                    }需要审核时，系统将在客户端给相关审核人员推送通知`
                  }}
                </p>
                <el-tooltip class="box-item" popper-class="tooltip-class" placement="right">
                  <template #content>
                    <section
                      style="
                        display: flex;

                        border-radius: 5px;
                      "
                    >
                      <div style="margin-right: 16px">
                        <p style="color: #ffffff; margin-bottom: 15px">移动端</p>
                        <img
                          style="width: 216px; height: 243px"
                          src="https://tagvv-1256030678.file.myqcloud.com/202202225fcom.png"
                          alt=""
                        />
                      </div>
                      <div>
                        <p style="color: #ffffff; margin-bottom: 15px">PC端</p>
                        <img
                          style="width: 325px; height: 243px"
                          src="https://tagvv-1256030678.file.myqcloud.com/202202229fj23.png"
                          alt=""
                        />
                      </div>
                    </section>
                  </template>
                  <span
                    style="
                      font-size: 14px;
                      font-family: PingFangSC-Regular, PingFang SC;
                      font-weight: 400;
                      color: #364fcd;
                      margin-left: 12px;
                    "
                  >
                    示例
                  </span>
                </el-tooltip>
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
                <span>{{ `检查是否有待审核${chooseTab === 'video' ? '视频' : '任务'}` }}</span>
              </div>
            </div>
          </el-form-item>

          <el-form-item label="审核结果通知：">
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
                  开启后，审核结果则将以机器人通知的方式通知
                </p>
                <el-tooltip class="box-item" popper-class="tooltip-class" placement="right">
                  <template #content>
                    <section style="display: flex; border-radius: 5px">
                      <div style="margin-right: 16px">
                        <p style="color: #ffffff; margin-bottom: 15px">移动端</p>
                        <img
                          v-if="chooseTab === 'task'"
                          style="width: 216px; height: 243px"
                          src="https://tagvv-1256030678.file.myqcloud.com/20220223s908p.png"
                          alt=""
                        />
                        <img
                          v-else
                          style="width: 207px; height: 318px"
                          src="https://tagvv-1256030678.file.myqcloud.com/20220223uiczi.png"
                          alt=""
                        />
                      </div>
                      <div>
                        <p style="color: #ffffff; margin-bottom: 15px">PC端</p>
                        <img
                          v-if="chooseTab === 'task'"
                          style="width: 325px; height: 243px"
                          src="https://tagvv-1256030678.file.myqcloud.com/20220223y6nuz.png"
                          alt=""
                        />
                        <img
                          v-else
                          style="width: 405px; height: 317px"
                          src="https://tagvv-1256030678.file.myqcloud.com/202202231nfma.png"
                          alt=""
                        />
                      </div>
                    </section>
                  </template>
                  <span
                    style="
                      font-size: 14px;
                      font-family: PingFangSC-Regular, PingFang SC;
                      font-weight: 400;
                      color: #364fcd;
                      margin-left: 12px;
                    "
                  >
                    示例
                  </span>
                </el-tooltip>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </section>

    <!-- 任务审核设置 -->
    <section v-if="chooseTab === 'task'">
      <el-form ref="formRef" label-width="130px">
        <el-form-item label="审核人员">
          <el-button type="primary" @click="changeAddShow">添加审核人</el-button>
        </el-form-item>
        <el-form-item label="审核人信息">
          <div class="member_info" v-for="(i, index) in memberDate" :key="index">
            <img class="avatar_icon" :src="i.userPhoto ? i.userPhoto : avatarImg" alt />
            <div class="name_mobile">
              <div class="name">{{ i.name || '--' }}</div>
              <div class="phone_box" v-if="i.userPhone">
                <table_column_phone :phone="i.userPhone" size="small"></table_column_phone>
              </div>
              <div v-else style="line-height: 17px; height: 17px">--</div>
            </div>
            <div
              style="
                margin-left: 38px;
                margin-right: 12px;
                cursor: pointer;
                display: flex;
                align-items: center;
              "
              @click="changeDeleteShow(i)"
            >
              <img src="@/assets/images/delete.png" style="width: 16px; height: 16px" alt="" />
            </div>
          </div>
        </el-form-item>
      </el-form>
    </section>
    <!-- 视频审核设置 -->
    <section v-if="chooseTab === 'video'" style="padding: 28px 24px 25px 24px">
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        "
      >
        <p
          style="
            height: 20px;
            font-size: 18px;
            font-family: PingFangSC-Medium, PingFang SC;
            font-weight: 500;
            color: #323233;
            line-height: 20px;
          "
        >
          审核节点
          <!-- <el-tooltip
            class="item"
            effect="dark"
            content="同一层级若有多人审核时，有一人审核通过即可通过"
            placement="top"
          >
            <img
              style="width: 14px; height: 14px; margin-left: 8px"
              src="@/assets/images/operate/tip_line.png"
              alt
            />
          </el-tooltip> -->
        </p>
        <el-button type="primary" @click="changeAddShow">添加审核节点</el-button>
      </div>
      <el-table :data="auditNode" stripe style="width: 100%" @submit.enter.prevent>
        <el-table-column min-width="100">
          <template #header>
            <div class="table_head" style="display: inline-block">
              审核节点
              <el-tooltip effect="dark" placement="top">
                <template #content>审核层级数越大级别越高</template>
                <img
                  style="width: 14px; height: 14px; vertical-align: -10%"
                  src="@/assets/images/operate/tip_gray.png"
                  alt
                />
              </el-tooltip>
            </div>
          </template>
          <template #default="scope">
            <p>{{ scope.row.level }}</p>
          </template>
        </el-table-column>
        <el-table-column min-width="150" align="center">
          <template #header>
            <div class="table_head" style="display: inline-block">
              审核人
              <el-tooltip effect="dark" placement="top">
                <template #content>同一级层若有多人审核时，有一人审核通过即可通过</template>
                <img
                  style="width: 14px; height: 14px; vertical-align: -10%"
                  src="@/assets/images/operate/tip_gray.png"
                  alt
                />
              </el-tooltip>
            </div>
          </template>
          <template #default="scope">
            <div>
              <span v-for="(item, index) of scope.row.auditNames" :key="index">
                <span v-for="(i, index) of item.userDepartment" :key="index">{{ i }}·</span>
                {{ item.name }}&nbsp;&nbsp;
                <span v-if="index !== scope.row.auditNames.length - 1">|&nbsp;&nbsp;</span>
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          min-width="100"
          fixed="right"
          header-align="right"
          align="right"
        >
          <template #default="scope">
            <el-link type="primary" @click="changeAddShow(scope.row)">添加审核人</el-link>
            <el-link type="danger" class="ml_16" @click="changeDeleteNode(scope.row)">删除</el-link>
          </template>
        </el-table-column>
      </el-table>
    </section>
    <!-- 添加审核成员弹窗 -->
    <el-dialog
      v-model="addMemberShow"
      @close="clear"
      :title="member.nodeId || chooseTab === 'task' ? '添加审核成员' : '添加审核节点'"
      width="30%"
    >
      <el-form ref="formRef" @submit.enter.prevent>
        <el-form-item label="搜索成员">
          <div>
            <p
              v-if="!member.nodeId && chooseTab === 'video'"
              style="
                font-size: 14px;
                font-family: PingFangSC-Regular, PingFang SC;
                font-weight: 400;
                color: #c0c4cc;
              "
            >
              请同时添加节点审核员
            </p>
            <el-autocomplete
              v-model="searchMember"
              :fetch-suggestions="querySearchAsync"
              placeholder="请输入成员姓名或手机号"
              @select="handleSelect"
            />
          </div>
        </el-form-item>
      </el-form>
      <!-- 视频审核多级审核 -->
      <div v-if="chooseTab === 'video'" style="border-top: 1px solid #dcdee0; margin-top: 24px">
        <p
          style="
            margin-top: 24px;
            height: 24px;
            font-size: 14px;
            font-family: PingFangSC-Medium, PingFang SC;
            font-weight: 600;
            color: #303133;
            line-height: 24px;
          "
        >
          已添加审核人
        </p>
        <div
          style="display: flex; justify-content: space-between; margin-top: 12px"
          v-for="(item, index) in auditList"
          :key="index"
        >
          <p>
            {{ item.name }}
            <span
              class="xm_depart"
              style="display: inline-block"
              v-if="item.staffStatus && item.staffStatus == 2"
            ></span>
          </p>
          <el-link type="danger" @click="deleteItem(index)">删除</el-link>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addMemberShow = false">取消</el-button>
          <el-button type="primary" @click="_addAuditTaskUser">保存</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 删除成员弹窗 -->
    <el-dialog v-model="deleteMemberShow" title="系统提醒" width="30%">
      <p>删除不可恢复，且只对新增的审核信息生效,是否确认</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteMemberShow = false">取消</el-button>
          <el-button type="primary" @click="deleteUser">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 删除节点弹窗 -->
    <el-dialog
      v-if="chooseTab === 'video'"
      v-model="deleteNodeShow.show"
      title="系统提醒"
      width="30%"
    >
      <p>删除{{ deleteNodeShow.node }}，是否确认？</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteNodeShow.show = false">取消</el-button>
          <el-button type="primary" @click="deleteNode">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { pageList } from '../model/get_list'
import avatarImg from '@/assets/images/content_center/default_user.png'
const props = defineProps({
  chooseTab: {
    type: String
  }
})
const { chooseTab } = toRefs(props)
const msg = ref('审核视频通知：')
const {
  memberDate,
  addMemberShow,
  deleteMemberShow,
  deleteNodeShow,
  auditNode,
  searchMember,
  changeAddShow,
  changeDeleteShow,
  AuditTaskUser,
  querySearchAsync,
  handleSelect,
  // handleChange,
  _addAuditTaskUser,
  getAuditNode,
  changeDeleteNode,
  deleteUser,
  auditList,
  deleteItem,
  deleteNode,
  commonSetting,
  common,
  commonSwitch,
  lockTime,
  clear,
  member
} = pageList(props)

watchEffect(() => {
  if (chooseTab.value === 'task') {
    AuditTaskUser()
    commonSetting()
    msg.value = '审核任务通知：'
  } else if (chooseTab.value === 'video') {
    getAuditNode()
    commonSetting()
    msg.value = '审核视频通知：'
  }
})

const isWeChat = ref(true)
isWeChat.value = localStorage.getItem('isWeChat') === '1'
const isWeiXin = ref(true)
isWeiXin.value = localStorage.getItem('isWeiXin') === '1'
const isFlyBook = ref(true)
isFlyBook.value = localStorage.getItem('isFlyBook') === '1'
</script>

<style lang="scss" scoped>
h3 {
  height: 20px;
  font-size: 18px;
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: 500;
  color: #323233;
  line-height: 20px;
}
.msgsetting {
  section {
    padding: 32px 33px 24px 33px;
    background-color: #fff;
    margin-bottom: 16px;
  }
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
  }
  .name_mobile {
    margin-left: 16px;
    min-width: 80px;
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

<style lang="scss" scoped>
.tooltip-class.is-dark .el-popper__arrow::before {
  background-color: #6e738a;
}
.tooltip-class {
  font-size: 12px !important;
  line-height: 17px !important;
  background-color: #6e738a !important;
  padding: 15px 15px 10px 15px;
}
</style>
