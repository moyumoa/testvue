<template>
  <div class="page_layout">
    <enterprise-account-list
      ref="enterpriseAccountListRef"
      @change="onChangeAccount"
    ></enterprise-account-list>
    <div class="policy_main">
      <div class="policy_header">
        <div class="account_info">
          <el-avatar :size="48" :src="$data.currentAccount.dyHeadUrl" />
          <div class="name">{{ $data.currentAccount.dyNickname }}</div>
        </div>
        <div class="action">
          <el-button
            type="primary"
            :disabled="!$data.currentAccount.dyOpenId"
            @click="routerChange('/scrm/session_management')"
          >
            会话管理
          </el-button>
          <el-button
            type="primary"
            :disabled="!$data.currentAccount.dyOpenId"
            @click="routerChange('/scrm/Interaction_record', '_blank')"
          >
            触达记录
          </el-button>
          <span class="tip">抖音私信规则解读</span>
          <el-tooltip popper-class="tooltip-class" :style="{ 'margin-left': '4px' }">
            <template #content>
              <p>1. 用户主动咨询</p>
              <p>用户主动发送一条消息后，可在48小时内向用户发送6条消息</p>
              <p>2. 用户无主动咨询</p>
              <p>可给同一用户发送最多3条消息</p>
              <p>3. 1小时最多发送40个用户，1天最多发送100个用户</p>
            </template>
            <img
              src="@/assets/images/operate/tip_line.png"
              style="width: 12px; height: 12px; margin-left: 8px"
            />
          </el-tooltip>
        </div>
      </div>
      <div class="policy_list">
        <div
          class="policy_item"
          v-for="(item, index) in $data.list"
          :key="index"
          @click="showReplyDialog(item)"
        >
          <div class="item_top">
            <div class="title">
              <i
                class="iconfont icon"
                :class="item.icon"
                :style="{
                  color: item.color
                }"
              ></i>
              <div class="text">{{ item.title }}</div>
              <div class="status" v-if="item.enable">
                <el-icon><i-success-filled /></el-icon>
                <span style="margin-left: 4px">已启用</span>
              </div>
            </div>
            <div class="tip">{{ item.tip }}</div>
          </div>
          <div class="item_bottom" v-if="item.template">
            <div
              class="detail_item"
              v-if="item.template[0].auto_reply_options[0].auto_reply_keywords"
            >
              <div class="label">关键词：</div>
              <div class="keywords">
                <div
                  class="keyword"
                  v-for="(keyword, index) in item.template[0].auto_reply_options[0]
                    .auto_reply_keywords"
                  :key="index"
                >
                  {{ keyword }}
                </div>
              </div>
            </div>
            <div class="detail_item">
              <div class="label">回复内容：</div>
              <div class="content">
                <div
                  v-for="(replySeq, i) in item.template[0].auto_reply_options[0].auto_reply_seq"
                  :key="i"
                  class="message_item"
                  :class="{
                    line_3: replySeq.reply_type === 'text' && i === 0,
                    line_2: replySeq.reply_type === 'text' && i === 1
                  }"
                >
                  <template v-if="replySeq.reply_type === 'text'">
                    {{ replySeq.reply_content || '' }}
                  </template>
                  <template
                    v-else-if="item.template[0].auto_reply_options[0].reply_type === 'group_invite'"
                  >
                    <i class="iconfont icon icon-jiaoseguanlibeifen"></i>
                    <span style="margin-left: 8px">
                      {{ replySeq.name }}
                    </span>
                  </template>
                  <template v-else-if="replySeq.reply_type === 'image'">
                    <el-image style="width: 40px; height: 40px" :src="replySeq.name" :fit="cover" />
                  </template>
                  <template v-else-if="replySeq.reply_type === 'card'">
                    <el-icon><i-credit-card color="#364fcd" /></el-icon>
                    <span style="margin-left: 8px">
                      {{ replySeq.name }}
                    </span>
                  </template>
                </div>
              </div>
            </div>
          </div>
          <div class="switch" @click.stop>
            <el-switch
              v-model="item.enable"
              :disabled="!$data.currentAccount.dyOpenId"
              :before-change="onStatusBeforeChange.bind(this, item)"
            />
          </div>
        </div>
      </div>
    </div>
    <reply-rules-dialog
      v-if="$data.isShowReplyDialog && $data.currentTemplate.title === '用户主动私信'"
      v-model:show="$data.isShowReplyDialog"
      :info="$data.currentTemplate"
      @confirm="updatePolicy"
    ></reply-rules-dialog>
    <reply-rules-dialog
      v-if="$data.isShowReplyDialog && $data.currentTemplate.title === '用户评论视频'"
      v-model:show="$data.isShowReplyDialog"
      :info="$data.currentTemplate"
      @confirm="updatePolicy"
    ></reply-rules-dialog>
    <auto-reply-template
      v-if="
        $data.isShowReplyDialog &&
        $data.currentTemplate.title !== '用户评论视频' &&
        $data.currentTemplate.title !== '用户主动私信'
      "
      v-model:show="$data.isShowReplyDialog"
      :info="$data.currentTemplate"
      @confirm="updatePolicy"
    ></auto-reply-template>
  </div>
</template>

<script setup>
import enterpriseAccountList from './enterprise_account_list.vue'
import autoReplyTemplate from './auto_reply_template/index.vue'
import replyRulesDialog from './reply_rules_dialog/index.vue'
import { getMessagePolicyList, saveMessagePolicy } from '@/api/scrm/policy'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const enterpriseAccountListRef = ref(null)
const router = useRouter()
const $data = reactive({
  isShowReplyDialog: false,
  currentAccount: {},
  currentTemplate: {},
  list: [
    {
      title: '用户主动私信',
      enable: false,
      icon: 'icon-yonghuzhudongsixin',
      tip: '用户主动发送私信后，自动给用户回复私信',
      color: '#537af4',
      type: 3
    },
    {
      title: '用户关注',
      enable: false,
      icon: 'icon-yonghuguanzhu',
      tip: '用户关注账号后，自动给用户发送私信打招呼',
      color: '#ff7256',
      type: 4
    },
    {
      title: '用户取消关注',
      enable: false,
      icon: 'icon-yonghuquxiaoguanzhu',
      tip: '用户取关账号后，自动给用户发送私信挽留',
      color: '#69c872',
      type: 5
    },
    {
      title: '用户进入会话',
      enable: false,
      icon: 'icon-yonghujinruhuihua',
      tip: '用户进入私聊页面后，自动给用户发送私信打招呼',
      color: '#c089ed',
      type: 6
    },
    {
      title: '用户评论视频',
      enable: false,
      icon: 'icon-yonghupinglunshipin',
      tip: '用户评论视频后，自动给用户发送私信打招呼',
      color: '#ffab45',
      type: 1
    },
    {
      title: '用户主页互动',
      enable: false,
      icon: 'icon-yonghuzhuyehudong',
      tip: '用户在主页留资后，自动给用户发送私信打招呼',
      color: '#4ad7e3',
      type: 9
    },
    {
      title: '用户点赞视频',
      enable: false,
      icon: 'icon-yonghudianzanshipin',
      tip: '用户点赞视频后，自动发送私信打招呼',
      color: '#ff7256',
      type: 7
    },
    {
      title: '用户取消点赞',
      enable: false,
      icon: 'icon-yonghuquxiaodianzan',
      color: '#69c872',
      tip: '用户取消视频点赞后，自动发送私信询问原因',
      type: 8
    }
  ]
})

function getPolicyList() {
  getMessagePolicyList({ openId: $data.currentAccount.dyOpenId }).then(res => {
    $data.list.forEach(item => {
      const policy = res.data.filter(e => e.type === item.type)[0]
      policy.template[0].auto_reply_options.forEach(e => {
        e.reply_type = e.reply_type || 'text'
      })
      item.enable = policy.isOpen === 1
      item = Object.assign(item, policy)
    })
  })
}

function onChangeAccount(accountInfo) {
  $data.currentAccount = accountInfo
  getPolicyList()
}

function showReplyDialog(item) {
  if (!item.template) return
  $data.currentTemplate = item
  $data.isShowReplyDialog = true
}

function onStatusBeforeChange(item) {
  return new Promise((resolve, reject) => {
    const _before = item
    const parma = {
      id: _before.id,
      isOpen: _before.enable ? 0 : 1,
      openId: $data.currentAccount.dyOpenId,
      strategyType: _before.strategyType,
      type: _before.type,
      template: _before.template
    }
    saveMessagePolicy(parma).then(() => {
      ElMessage.success(`${parma.isOpen === 1 ? '策略已开启' : '策略已关闭'}`)
      item.enable = !item.enable
      item.isOpen = item.enable ? 1 : 0
      enterpriseAccountListRef.value.updateList()
      resolve()
    })
  })
}

function updatePolicy() {
  getPolicyList()
  enterpriseAccountListRef.value.updateList()
}

function routerChange(url, type) {
  if (type === '_blank') {
    window.open(`${url}?openId=${$data.currentAccount.dyOpenId}`, '_blank')
  } else {
    router.push({
      path: url,
      query: {
        openId: $data.currentAccount.dyOpenId
      }
    })
  }
}
</script>

<style lang="scss" scoped>
* {
  box-sizing: border-box;
}
.page_layout {
  display: flex;
  height: 100%;
  .policy_main {
    flex: 1;
    margin-left: 16px;
    padding: 16px 24px;
    background: #fff;
    border-radius: 4px;
    overflow-y: auto;
    overflow-x: hidden;
    .policy_header {
      display: flex;
      justify-content: space-between;
      .account_info {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        .name {
          margin-left: 12px;
          font-size: 16px;
        }
      }
      .action {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        .tip {
          color: #606266;
          margin-left: 24px;
        }
      }
    }
    .policy_list {
      display: flex;
      flex-wrap: wrap;
      margin-right: -25px;
      .policy_item {
        position: relative;
        cursor: pointer;
        width: 340px;
        height: 208px;
        margin: 20px 20px 0 0;
        padding: 0 16px;
        border-radius: 2px;
        border: 1px solid #dcdee0;
        transition: background 0.3s;
        &:hover {
          background: #f6f8fa;
        }
        .item_top {
          border-bottom: 1px solid #dcdee0;
          height: 76px;
          padding: 12px 0;
          .title {
            display: flex;
            align-items: center;
            .icon {
              font-size: 24px;
              margin-right: 8px;
            }
            .text {
              margin-right: 12px;
              line-height: 20px;
              font-weight: bold;
            }
            .status {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 64px;
              height: 20px;
              background: #edfbf1;
              border-radius: 2px;
              color: #00aa2f;
              font-size: 12px;
            }
          }
          .tip {
            line-height: 17px;
            margin-top: 10px;
            margin-left: 32px;
            font-size: 12px;
            color: #909399;
          }
        }
        .item_bottom {
          .detail_item {
            display: flex;
            margin-top: 12px;
            font-size: 12px;
            line-height: 16px;
            .label {
              flex-shrink: 0;
              margin-right: 4px;
            }
            .keywords {
              flex: 1;
              display: flex;
              overflow: hidden;
              // flex-wrap: wrap;
              .keyword {
                flex-shrink: 0;
                margin: 0 6px 4px 0;
                padding: 0 4px;
                line-height: 18px;
                height: 18px;
                background: #f6f8fa;
                border-radius: 2px;
                color: #606266;
              }
            }
            .content {
              flex: 1;
              .message_item {
                display: flex;
                align-items: center;
                color: #909399;
                margin-bottom: 5px;
                i {
                  color: #364fcd;
                }
                &.line_2 {
                  @include mult_line(2);
                }
                &.line_3 {
                  @include mult_line(3);
                }
              }
            }
          }
        }
        .switch {
          position: absolute;
          right: 16px;
          top: 7px;
        }
      }
    }
  }
}
</style>
