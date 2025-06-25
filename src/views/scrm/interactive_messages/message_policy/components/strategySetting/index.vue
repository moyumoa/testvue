<template>
  <div>
    <el-dialog
      v-model="strategyShow"
      :width="560"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="close"
      custom-class="addTaskToLevelDialog"
    >
      <template #title>
        <div class="dialog_title">
          <div style="margin-right: 12px">
            {{ tabList[showBatchStrategySetting.type].label }}
          </div>
          <div v-if="showBatchStrategySetting.type !== 0">
            <!--   v-if="switchOpen || showBatchStrategySetting.type !== 0 || numberType !== 'one'"-->
            <el-switch
              v-model="switchVal"
              :disabled="switchDisabled"
              inline-prompt
              :width="45"
              active-text="开"
              inactive-text="关"
              @click="changSwitchVal"
            ></el-switch>
            <!--            <el-tooltip-->
            <!--              v-if="!switchOpen && showBatchStrategySetting.type === 0 && numberType === 'one'"-->
            <!--              placement="right"-->
            <!--              :style="{ 'margin-left': '4px' }"-->
            <!--            >-->
            <!--              <template #content>-->
            <!--                <span v-if="$data.userMessageTemplateInfo.strategys[0].isOpen === 1">-->
            <!--                  需要授权获客互动能力才可恢复-->
            <!--                </span>-->
            <!--                <span v-else>需要授权获客互动能力才可开启</span>-->
            <!--              </template>-->
            <!--              <el-switch-->
            <!--                v-model="switchVal"-->
            <!--                :disabled="!replySwitch"-->
            <!--                inline-prompt-->
            <!--                :width="45"-->
            <!--                active-text="开"-->
            <!--                inactive-text="关"-->
            <!--              ></el-switch>-->
            <!--            </el-tooltip>-->
          </div>
          <!--          <div-->
          <!--            class="blue_tip"-->
          <!--            v-if="!switchOpen && showBatchStrategySetting.type === 0 && numberType === 'one'"-->
          <!--            @click="gotoweb"-->
          <!--          >-->
          <!--            去授权获客互动能力-->
          <!--          </div>-->
          <!-- <div class="top_other_tip" v-if="numberType === 'all'">
            <img src="https://tagvv-1256030678.file.myqcloud.com/20230505loul6.png" />
            <span v-html="tabList[showBatchStrategySetting.type].titleTips || '-'"></span>
          </div> -->
        </div>
      </template>
      <div class="dialog_content" v-loading="loading || keyWordsObj.loading">
        <!--  私信策略  抖音授权失效  获客互动能力没有授权给出提示    -->
        <!-- <div
          class="head_wrap_tip"
          v-if="
            numberType === 'one' &&
            showBatchStrategySetting.type === 0 &&
            (!useInfo.webAuthStatus || useInfo.dyAuthStatus !== 0)
          "
        >
          <img
            src="https://tagvv-1256030678.file.myqcloud.com/20230529xhu7v.png"
            alt=""
            class="rules_img"
          /> -->
        <!--   如果是 私信策略      -->
        <!--  {{
            useInfo.dyAuthStatus !== 0
              ? '当前抖音授权失效，无法进行获客和回复'
              : '当前获客互动能力授权失效或未授权，无法进行获客和回复'
          }}
          <span class="head_wrap_tip_btn" @click="gotoweb">
            去授权
            <el-icon><i-arrow-right-bold /></el-icon>
          </span>
        </div> -->
        <!--  视频策略 直播策略  抖音授权失效  提示    -->
        <!-- <div
          class="head_wrap_tip"
          v-if="
            numberType === 'one' &&
            showBatchStrategySetting.type !== 0 &&
            useInfo.dyAuthStatus !== 0
          "
        >
          <img
            src="https://tagvv-1256030678.file.myqcloud.com/20230529xhu7v.png"
            alt=""
            class="rules_img"
          />
          当前抖音授权失效，无法进行获客
          <span class="head_wrap_tip_btn" @click="gotoweb">
            去授权
            <el-icon><i-arrow-right-bold /></el-icon>
          </span>
        </div> -->
        <div class="dialog_content_title">
          <div class="title">获客规则</div>
          <el-tooltip placement="left" :style="{ 'margin-left': '4px' }">
            <template #content>
              <div style="max-width: 300px">
                我们为您内置了一套通用的高意向关键词，您可以在“客户管理”菜单中“获客规则”tab
                内进行编辑或新增
              </div>
            </template>
            <div class="title_tip">
              高意向关键词
              <img src="@/assets/images/operate/tip_line.png" />
            </div>
          </el-tooltip>
        </div>
        <div class="get_setting" v-if="showBatchStrategySetting.type == 0">
          <div
            :class="{ one_setting: true, choose_setting: getCurSetting == item.id }"
            @click="chooseCurSetting(item.id)"
            v-for="(item, index) in settingList"
            :key="index"
          >
            <div class="setting_title">
              {{ item.title || '' }}
            </div>
            <div class="setting_tip">{{ item.tip || '' }}</div>
            <el-checkbox class="choose_check" checked disabled></el-checkbox>
          </div>
          <!-- <span class="dialog_tip_black">获客设置：</span>
          <el-radio-group v-model="getCurSetting" :disabled="!switchVal">
            <el-radio :label="1" style="margin-right: 30px">仅私信</el-radio>
            <el-radio :label="2">含高意向关键词的私信</el-radio>
          </el-radio-group> -->
        </div>
        <div class="setting_rule" v-if="showBatchStrategySetting.type == 1">
          识别
          <span>视频评论</span>
          中
          <span>发送高意向关键词</span>
          的用户为潜客
        </div>
        <div class="setting_rule" v-if="showBatchStrategySetting.type == 2">
          识别
          <span>直播弹幕</span>
          中
          <span>发送高意向关键词</span>
          的用户为潜客
        </div>
        <!--<div class="dialog_tip">
          <span class="dialog_tip_black">功能解读：</span>-->
        <!--          {{ tabList[showBatchStrategySetting.type].text }}-->
        <!-- <span v-if="showBatchStrategySetting.type === 0">
            识别
            <span class="dialog_tip_black">
              发送{{ getCurSetting == 1 ? '私信' : '含高意向关键词的私信' }}
            </span>
            的用户为潜客，您还可以设置回复规则对潜客进行私信回复
          </span>
          <span v-if="showBatchStrategySetting.type === 1">
            识别
            <span class="dialog_tip_black">视频评论</span>
            中
            <span class="dialog_tip_black">发送高意向关键词</span>
            的用户为潜客，您还可以设置回复规则对潜客进行私信回复
          </span>
          <span v-if="showBatchStrategySetting.type === 2">
            识别
            <span class="dialog_tip_black">直播弹幕</span>
            中
            <span class="dialog_tip_black">发送高意向关键词</span>
            的用户为潜客，您还可以设置回复规则对潜客进行私信回复
          </span>
        </div>-->
        <!-- 直播获客的提示       -->
        <div class="dialog_tip mt_16" v-if="showBatchStrategySetting.type === 2">
          <span class="dialog_tip_black">
            注意事项：请在直播时确认【设置】中开启了【允许观众查看他人资料】，否则将无法进行获客！
          </span>
        </div>
        <!-- <div
          class="text_library"
          v-if="!(showBatchStrategySetting.type === 0 && getCurSetting == 1)"
        >
          <div class="text_library_title">高意向关键词库：</div>
          <div class="text_library_area">
            <div class="text_library_area_list">
              <div
                class="text_library_area_list_item"
                v-for="(item, index) in xmkeyWordsObj"
                :key="index"
              >
                <el-tooltip placement="top" :style="{ 'margin-left': '4px' }">
                  <template #content>
                    <div class="group_box">
                      <span
                        class="new_group_name"
                        v-for="(detailItem, detailIndex) in item.scrmKeywords"
                        :key="detailIndex"
                      >
                        {{ detailItem.keyName }}
                      </span>
                    </div>
                  </template>
                  <span>{{ item.groupName }}词组</span>
                </el-tooltip>
              </div>
            </div>
            <div class="text_library_tip">
              我们为您内置了一套行业通用的高意向关键词库，您也可以在“潜客规则”菜单下管理属于品牌自有的高意向关键词。
              <span class="blue_color" @click="goToSetting">前往设置</span>
            </div>
          </div>
        </div> -->
        <div class="chang_rule">
          <!-- <div
            class="head_wrap_tip"
            v-if="
              numberType === 'one' && showBatchStrategySetting.type !== 0 && !useInfo.webAuthStatus
            "
          >
            <img
              src="https://tagvv-1256030678.file.myqcloud.com/20230529xhu7v.png"
              alt=""
              class="rules_img"
            />
            当前获客互动能力授权失效或未授权，无法回复
            <span class="head_wrap_tip_btn" @click="gotoweb">
              去授权
              <el-icon><i-arrow-right-bold /></el-icon>
            </span>
          </div> -->
          <div
            class="chang_rule_title"
            :style="showBatchStrategySetting.type === 1 ? 'margin-bottom:16px' : ''"
            v-if="showBatchStrategySetting.type !== 2"
          >
            <div class="chang_rule_tip">
              回复规则
              <el-switch
                style="margin-left: 16px"
                v-if="showBatchStrategySetting.type === 0"
                v-model="switchVal"
                :disabled="switchDisabled"
                inline-prompt
                :width="45"
                active-text="开"
                inactive-text="关"
                @click="changSwitchVal"
              ></el-switch>
            </div>
            <!--            <div-->
            <!--              class="chang_rule_tip_other"-->
            <!--              v-if="!replySwitch && showBatchStrategySetting.type !== 0 && numberType === 'one'"-->
            <!--            >-->
            <!--              <el-tooltip placement="right" :style="{ 'margin-left': '4px' }">-->
            <!--                <template #content>-->
            <!--                  <span>需要授权获客互动能力才可使用</span>-->
            <!--                </template>-->
            <!--                <div class="tip_img_icon">-->
            <!--                  <img src="https://tagvv-1256030678.file.myqcloud.com/20230421pkpzg.png" />-->
            <!--                </div>-->
            <!--              </el-tooltip>-->
            <!--              <div class="blue_tip" @click="gotoweb">去授权获客互动能力</div>-->
            <!--            </div>-->
            <!-- <div
              class="bottom_other_tip"
              v-if="[1, 2].includes(showBatchStrategySetting.type) && numberType === 'all'"
            >
              <img src="https://tagvv-1256030678.file.myqcloud.com/20230505loul6.png" />
              <span>未授权获客互动能力，无法回复</span>
            </div> -->
          </div>
          <!--私信回复（规则多选）-->
          <div v-if="showBatchStrategySetting.type === 0">
            <el-checkbox-group v-model="checkedRules">
              <el-checkbox
                v-for="(item, index) in ruleList"
                :key="index"
                :label="item.value"
                :disabled="item.disabled || !switchVal"
              >
                {{ item.lable }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
          <!--视频/直播回复（规则单选）-->
          <!-- <div v-if="showBatchStrategySetting.type !== 0">
            <el-radio-group v-model="checkedRule" @change="changRuleOne">
              <el-radio
                v-for="(item, index) in ruleList"
                :key="index"
                :label="item.value"
                :disabled="!switchVal || !replySwitch"
              >
                {{ item.lable }}
              </el-radio>
            </el-radio-group>
          </div> -->
        </div>

        <div class="strategy">
          <!-- 私信潜客策略 -->
          <div class="userMessage" v-if="chooseTab == 'userMessage'">
            <!-- 招呼语 -->
            <div class="say_hello" v-if="checkedRules.indexOf(1) !== -1">
              <div class="text">
                欢迎语回复
                <span style="color: #909399">
                  （对主动私信的用户发送欢迎语，同一个用户24小时1次）
                </span>
              </div>
              <el-form ref="formRef" label-width="94px">
                <el-form-item label="回复内容:">
                  <el-input
                    v-model.trim="$data.userMessageTemplateInfo.strategys[0].welcomeMessage"
                    :disabled="!switchVal || !replySwitch"
                    placeholder="请输入回复内容"
                    type="textarea"
                    resize="none"
                    maxlength="100"
                    :autosize="{ minRows: 6, maxRows: 6 }"
                    :style="{ width: '418px' }"
                    show-word-limit
                  ></el-input>
                </el-form-item>
              </el-form>
            </div>
            <replayContent
              v-if="checkedRules.indexOf(2) !== -1 && !keyWordsObj.loading"
              :disabled="$data.userMessageTemplateInfo.enable || !switchVal || !replySwitch"
              :options="
                $data.userMessageTemplateInfo.strategys[0].keyWordAutoReplyOptions
                  ? $data.userMessageTemplateInfo.strategys[0].keyWordAutoReplyOptions
                  : oneOptions
              "
              :sourcePosition="{
                from: 'strategySetting',
                canCreate: true,
                showType: 'userMessage',
                reply_content: true,
                keyWordsObj: keyWordsObj
              }"
            />
          </div>
          <!--视频潜客策略-->
          <div class="videoCustomer" v-if="chooseTab == 'videoCustomer'">
            <!--            <div class="strategy_rules">触达规则：</div>-->
            <!-- 视频潜客，非认证企业号和员工号-认证企业号都不显示规则配置 -->
            <!-- <template
              v-if="
                showBatchStrategySetting.chooseList &&
                showBatchStrategySetting.chooseList.length == 1 &&
                !(
                  showBatchStrategySetting.chooseList[0].enterpriseType ||
                  showBatchStrategySetting.chooseList[0].eaccountRole == 'EAccountS' ||
                  showBatchStrategySetting.chooseList[0].eaccountRole == 'EAccountK'
                )
              "
            >
              <div
                class="reply_tip"
                v-if="showBatchStrategySetting.chooseList[0].eaccountRole == 'EAccountM'"
              >
                <img src="https://tagvv-1256030678.file.myqcloud.com/20230830x8oja.png" alt="" />
                <div class="reply_content">
                  普通企业号无视频回评的能力，建议升级为认证企业号
                  <span @click="toFun(2)">点击去认证</span>
                </div>
              </div>
              <div class="reply_tip" v-else>
                <img src="https://tagvv-1256030678.file.myqcloud.com/20230830x8oja.png" alt="" />
                <div class="reply_content">
                  个人号可授权绑定为企业号的员工号，以获取企业号同等视频回评能力，请登录企业号后台绑定
                  <span @click="toFun(1)">点击前往</span>
                </div>
              </div>
            </template>
            <template v-else> -->
            <div class="say_hello" v-if="checkedRules.indexOf(1) !== -1">
              <div class="text">
                全部回复
                <span style="color: #909399">（对每个视频潜客主动私信）</span>
              </div>
              <el-form ref="formRef" label-width="94px">
                <el-form-item label="回复内容:">
                  <el-input
                    v-model.trim="$data.videoCustomerTemplateInfo.strategys[0].welcomeMessage"
                    placeholder="请输入回复内容"
                    :disabled="!switchVal || !replySwitch"
                    type="textarea"
                    resize="none"
                    maxlength="200"
                    :autosize="{ minRows: 6, maxRows: 6 }"
                    :style="{ width: '418px' }"
                    show-word-limit
                  ></el-input>
                </el-form-item>
              </el-form>
            </div>
            <replayContent
              v-if="checkedRules.indexOf(2) !== -1 && !keyWordsObj.loading"
              :disabled="$data.videoCustomerTemplateInfo.enable || !switchVal || !replySwitch"
              :options="
                $data.videoCustomerTemplateInfo.strategys[0].keyWordAutoReplyOptions
                  ? $data.videoCustomerTemplateInfo.strategys[0].keyWordAutoReplyOptions
                  : oneOptions
              "
              :sourcePosition="{
                from: 'strategySetting',
                canCreate: false,
                showType: 'videoCustomer',
                reply_content: true,
                keyWordsObj: keyWordsObj
              }"
            />
            <!-- </template> -->
          </div>
          <!-- 直播潜客-->
          <div class="liveCustomer" v-if="chooseTab == 'liveCustomer'">
            <div class="say_hello" v-if="checkedRules.indexOf(1) !== -1">
              <div class="text">
                全部回复
                <span style="color: #909399">（对每个直播潜客主动私信）</span>
              </div>
              <el-form ref="formRef" label-width="94px">
                <el-form-item label="回复内容:">
                  <el-input
                    v-model.trim="$data.liveCustomerTemplateInfo.strategys[0].welcomeMessage"
                    :disabled="!switchVal || !replySwitch"
                    placeholder="请输入回复内容"
                    type="textarea"
                    resize="none"
                    maxlength="200"
                    :autosize="{ minRows: 6, maxRows: 6 }"
                    :style="{ width: '418px' }"
                    show-word-limit
                  ></el-input>
                </el-form-item>
              </el-form>
            </div>
            <replayContent
              v-if="checkedRules.indexOf(2) !== -1 && !keyWordsObj.loading"
              :disabled="$data.liveCustomerTemplateInfo.enable || !switchVal || !replySwitch"
              :options="
                $data.liveCustomerTemplateInfo.strategys[0].keyWordAutoReplyOptions
                  ? $data.liveCustomerTemplateInfo.strategys[0].keyWordAutoReplyOptions
                  : oneOptions
              "
              :sourcePosition="{
                from: 'strategySetting',
                canCreate: false,
                showType: 'liveCustomer',
                reply_content: true,
                keyWordsObj: keyWordsObj
              }"
            />
          </div>
        </div>
      </div>
      <template #footer>
        <div class="footer_info">
          <!-- 仅用来占位-->
          <span v-if="!showBatchStrategySetting.isBatch"></span>
          <span v-if="showBatchStrategySetting.isBatch" class="has_color_gary">
            已选择矩阵号
            <span class="has_color">{{ showBatchStrategySetting.chooseLength || 0 }}</span>
            个
          </span>
          <span class="dialog-footer">
            <el-button @click="close">取消</el-button>
            <el-button type="primary" @click="confirm(null)">保存</el-button>
          </span>
        </div>
      </template>
    </el-dialog>

    <!-- 没有UID 开启失败的弹窗   -->
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="NoUidShow"
      title="开启失败"
      width="420px"
      custom-class="xm_element_dialog"
    >
      <div class="content_box">
        <div class="content1">
          系统暂未获取到矩阵号“{{
            showBatchStrategySetting.chooseList[0].dyNickname
              ? showBatchStrategySetting.chooseList[0].dyNickname
              : ''
          }}”的UID，无法开启获客策略
        </div>
        <div class="content2">
          <span style="color: rgba(48, 49, 51, 1)">解决方法：</span>
          使用抖音号在抖音App新发布一条公开视频，系统将每日0:00/12:00/20:00统一获取，未获取到之前请勿删除或隐藏
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="NoUidShow = false">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!--    :close-on-click-modal="false"-->
    <!-- 保存失败弹窗   -->
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="openfail"
      title="提示"
      width="420px"
      custom-class="xm_element_dialog"
      @closed="closeopenfail"
    >
      <div class="content_box">
        <div class="title_tip">
          <img src="https://tagvv-1256030678.file.myqcloud.com/20230421m5g5u.png" />
          部分保存失败
        </div>
        <!--   没有UID 的失败提示     -->
        <div class="content_text" v-if="failSetListsOpenNoUid.length > 0">
          因系统暂未获取到部分抖音号的UID，共
          <span class="blue_text">
            {{ failSetListsOpenNoUid ? failSetListsOpenNoUid.length : '' }}
          </span>
          个抖音号无法开启{{ tabList[showBatchStrategySetting.type].label }}：
          <span v-for="(item, index) in failSetListsOpenNoUid" :key="index">
            {{ item }}
            <span v-if="index !== failSetListsOpenNoUid.length - 1">、</span>
          </span>
        </div>
        <div class="content_text_gray" v-if="failSetListsOpenNoUid.length > 0">
          解决办法：使用抖音号在抖音App新发布一条公开视频，系统将每日0:00/12:00/20:00统一获取，未获取到之前请勿删除或隐藏
        </div>
        <!-- 没有授权获客互动能力（抖音开放平台） 的失败提示 checkedRule 是视频/直播的单选 -->
        <div
          class="content_text"
          v-if="failSetListsReplyNoAuth.length > 0 && (checkedRule === 1 || checkedRule === 2)"
        >
          因部分抖音号未授权获客互动能力，共
          <span class="blue_text">
            {{ failSetListsReplyNoAuth ? failSetListsReplyNoAuth.length : '' }}
          </span>
          个矩阵号无法使用回复规则：
          <span v-for="(item, index) in failSetListsReplyNoAuth" :key="index">
            {{ item }}
            <span v-if="index !== failSetListsReplyNoAuth.length - 1">、</span>
          </span>
        </div>
        <!-- 没有授权抖音 的失败提示 -->
        <div class="content_text" v-if="failSetListsOpenNoAuth.length > 0">
          因部分抖音号未授权获客互动能力，共
          <span class="blue_text">
            {{ failSetListsOpenNoAuth ? failSetListsOpenNoAuth.length : '' }}
          </span>
          个矩阵号无法开启{{ tabList[showBatchStrategySetting.type].label }}：
          <span v-for="(item, index) in failSetListsOpenNoAuth" :key="index">
            {{ item }}
            <span v-if="index !== failSetListsOpenNoAuth.length - 1">、</span>
          </span>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="closeopenfail">我知道了</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { getQuery } from '@/utils/get_query.js'
import { ElMessage } from 'element-plus'
import replayContent from './reply_content_update.vue'
import { throttle } from '@/utils/tools.js'
import { strategyOpenSet, keywordList, strategyDetail } from '@/api/scrm/policy.js'
// import { useRouter } from 'vue-router'
const settingList = reactive([
  {
    id: 1,
    title: '全部私信',
    tip: '识别发送私信的用户为潜客'
  },
  {
    id: 2,
    title: '含高意向关键词的私信',
    tip: '识别发送含高意向关键词的私信用户为潜客'
  }
])
const props = defineProps({
  strategyShow: {
    type: Boolean,
    default: false
  },
  // type: 0私信  1视频  2直播
  showBatchStrategySetting: Object,
  searchComponents: Object
})
const loading = ref(false)
const { showBatchStrategySetting, strategyShow, searchComponents } = toRefs(props)
console.log('showBatchStrategySetting', showBatchStrategySetting.value)
// const $router = useRouter()
// const store = useStore()
// 策略
const tabList = [
  {
    name: 'userMessage',
    label: '私信回复',
    titleTips: '',
    show: true
  },
  {
    name: 'videoCustomer',
    label: '视频回评',
    titleTips: '',
    show: true
  },
  {
    name: 'liveCustomer',
    label: '直播获客',
    titleTips: '',
    show: true
  }
]

const NoUidShow = ref(false)

const openfail = ref(false)
const failSetListsOpenNoAuth = ref(null)
const failSetListsOpenNoUid = ref(null)
const failSetListsReplyNoAuth = ref(null)
// 用户的信息
const useInfo = ref({})

// 回复的规则列表
const ruleList = ref([
  // { lable: '不回复', value: 0, disabled: true },
  { lable: '欢迎语回复', value: 1, disabled: true },
  { lable: '匹配关键词回复', value: 2, disabled: true }
])

// 回复选中的规则
const checkedRules = ref([])
const checkedRule = ref(0)
// const message = inject('$message')

// 回复规则没有的话赋初始值
const oneOptions = ref([
  {
    reply_type: null,
    auto_reply_keywords: [],
    auto_keywords_blacklist: [],
    auto_reply_seq: [{ reply_type: null, reply_content: null, name: null, id: null }]
  }
])

// function changRule(val) {
//   // 禁用互斥
//   console.log('点击了互相禁用', val, checkedRules.value)
//   // // 当前选中的为0
//   // if (checkedRules.value.length === 0) {
//   //   checkedRules.value = [val]
//   //   message.warning('请至少勾选一种规则')
//   //   return
//   // }
//   // if (val === 0 && checkedRules.value.indexOf(0) !== -1) {
//   //   checkedRules.value = [0]
//   // }
//   if (checkedRule.value && checkedRule.value.length > 0) {
//     checkedRule.value = checkedRule.value.filter(x => x !== 0)
//   } else {
//     checkedRule.value = [0]
//   }

//   // if (val !== 0 && checkedRules.value.indexOf(val) !== -1) {
//   //   // checkedRules.value=[0]
//   //   checkedRules.value = checkedRules.value.filter(item => item !== 0)
//   console.log('选中了其他的', checkedRules.value)
//   // }

//   // if (checkedRules.value.indexOf(0) !== -1) {
//   //   ruleList.value[1].disabled = true
//   //   ruleList.value[2].disabled = true
//   // } else {
//   //   ruleList.value[1].disabled = false
//   //   ruleList.value[2].disabled = false
//   // }
//   // if (checkedRules.value.indexOf(1) !== -1 || checkedRules.value.indexOf(2) !== -1) {
//   //   ruleList.value[0].disabled = true
//   // } else {
//   //   ruleList.value[0].disabled = false
//   // }
// }

// 单个的规则赋值
function changRuleOne(val) {
  console.log('看看是什么值', val)
  checkedRules.value = [val]
}

// 开关和回复规则
function changSwitchVal(val) {
  // console.log('点击事件触发了吗',val,switchVal.value)
  // 没有UID 如果按钮打开
  // if (switchVal.value && !useInfo.value.uid && numberType.value === 'one') {
  //   NoUidShow.value = true
  //   switchVal.value = false
  //   return
  // }
  // if (!switchOpen.value && !(val && val === 1)) {
  //   switchVal.value = false
  //   console.log('没有开启开关的权限')
  //   if (showBatchStrategySetting.value.type === 1 || showBatchStrategySetting.value.type === 2) {
  //     NoUidShow.value = true
  //   }
  //   return
  // }

  // 单个的私人号授权失败后不可用
  // if (
  //   !switchOpen.value &&
  //   showBatchStrategySetting.value.type === 0 &&
  //   numberType.value === 'one' &&
  //   $data.userMessageTemplateInfo.strategys[0].isOpen === 1
  // ) {
  //   switchVal.value = true
  //   return
  // }
  //
  // if (!switchOpen.value && !(val && val === 1)) {
  //   switchVal.value = false
  //   console.log('没有开启开关的权限')
  //   if (showBatchStrategySetting.value.type === 1 || showBatchStrategySetting.value.type === 2) {
  //     NoUidShow.value = true
  //   }
  //   return
  // }
  // if (switchVal.value) {
  //   changRule()
  // } else {
  ruleList.value[0].disabled = false
  ruleList.value[1].disabled = false
  // ruleList.value[2].disabled = false
  // }
}

const switchVal = ref(false) // 是否开启
const switchDisabled = ref(false) // 开关是否禁用
const switchOpen = ref(true) // 是否含有开启开关的权限
const replySwitch = ref(true) // 是否更改开启回复的权限
const emits = defineEmits(['confirm', 'update:strategyShow'])
// 当前选择的策略
const chooseTab = ref('userMessage')
// 空状态，用于初始化
const initStrategys = {
  accountIds: [],
  isOpen: 0, // 是否开启 1-开 0 关
  strategys: [
    {
      keyWordAutoReplyOptions: [
        {
          auto_keywords_blacklist: [],
          auto_reply_keywords: [], // 回复关键词
          auto_reply_seq: [
            // 自动回复内容
            {
              id: '',
              name: '',
              reply_content: '',
              reply_type: ''
            }
          ],
          reply_type: ''
        }
      ],
      type: null, // 	类型 112-用户私信 110 视频潜客 210 -直播潜客
      welcomeMessage: '' // 欢迎语
    }
  ]
}
// const tooltipsVisible = ref(false)
// 弹窗的数据，维护这里的
const $data = reactive({
  // 用户私信 userMessage
  userMessageTemplateInfo: {
    strategys: JSON.parse(JSON.stringify(initStrategys.strategys))
  },
  // 视频潜客 videoCustomer
  videoCustomerTemplateInfo: {
    strategys: JSON.parse(JSON.stringify(initStrategys.strategys))
  },
  // 直播潜客 liveCustomer
  liveCustomerTemplateInfo: {
    strategys: JSON.parse(JSON.stringify(initStrategys.strategys))
  },

  saving: false,
  isShowDialog: false
})
// 矩阵策略数量
const numberType = ref('one')

// 关闭弹窗
function close() {
  // strategyShow.value = false
  emits('update:strategyShow', false)
}

// 处理入参的ids
function getIds() {
  const ids = []
  showBatchStrategySetting.value.chooseList.forEach(item => {
    ids.push(item.id)
  })
  return ids
}

// 转换类型
function getOpenType(val) {
  if (val) {
    return 1
  } else {
    return 0
  }
}

// 验证规则
function saveRules() {
  const pass = ref(true)
  const noPassReason = ref('') // 未通过原因
  // 用户私信规则验证
  if (showBatchStrategySetting.value.type === 0) {
    const userMessageRulesData = $data.userMessageTemplateInfo.strategys[0]
    console.log('私信验证', userMessageRulesData)
    if (
      (checkedRules.value &&
        checkedRules.value.length > 0 &&
        checkedRules.value.indexOf(0) !== -1) ||
      !(checkedRules.value && checkedRules.value.length > 0)
    ) {
      pass.value = false
      noPassReason.value = '请选择回复规则'
    }
    // 如果选中欢迎语，没填写欢迎语
    if (checkedRules.value.indexOf(1) !== -1 && !userMessageRulesData.welcomeMessage) {
      pass.value = false
    }
    if (userMessageRulesData.welcomeMessage && userMessageRulesData.welcomeMessage.length > 100) {
      userMessageRulesData.welcomeMessage = userMessageRulesData.welcomeMessage.substring(0, 100)
    }
    if (checkedRules.value.indexOf(2) !== -1) {
      userMessageRulesData.keyWordAutoReplyOptions.forEach(item => {
        // 匹配关键词回复不能有空
        if (item.auto_reply_keywords.length === 0 || !item.auto_reply_seq[0].reply_content) {
          pass.value = false
        }
        if (
          item.auto_reply_seq[0].reply_content &&
          item.auto_reply_seq[0].reply_content.length > 100
        ) {
          item.auto_reply_seq[0].reply_content = item.auto_reply_seq[0].reply_content.substring(
            0,
            100
          )
        }
      })
    }
  }

  // 视频获客规则验证
  else if (showBatchStrategySetting.value.type === 1) {
    const videoCustomerRulesData = $data.videoCustomerTemplateInfo.strategys[0]
    console.log('视频验证', videoCustomerRulesData)
    if (checkedRules.value.indexOf(1) !== -1 && !videoCustomerRulesData.welcomeMessage) {
      pass.value = false
    }
    if (checkedRules.value.indexOf(2) !== -1) {
      videoCustomerRulesData.keyWordAutoReplyOptions.forEach(item => {
        // 匹配关键词回复不能有空
        if (item.auto_reply_keywords.length === 0 || !item.auto_reply_seq[0].reply_content) {
          pass.value = false
        }
        if (
          item.auto_reply_seq[0].reply_content &&
          item.auto_reply_seq[0].reply_content.length > 100
        ) {
          item.auto_reply_seq[0].reply_content = item.auto_reply_seq[0].reply_content.substring(
            0,
            100
          )
        }
      })
    }
  }

  // 直播获客规则验证
  else if (showBatchStrategySetting.value.type === 2) {
    const liveCustomerRulesData = $data.liveCustomerTemplateInfo.strategys[0]
    console.log('直播验证', liveCustomerRulesData)
    if (checkedRules.value.indexOf(1) !== -1 && !liveCustomerRulesData.welcomeMessage) {
      pass.value = false
    }
    if (checkedRules.value.indexOf(2) !== -1) {
      liveCustomerRulesData.keyWordAutoReplyOptions.forEach(item => {
        // 匹配关键词回复不能有空
        if (item.auto_reply_keywords.length === 0 || !item.auto_reply_seq[0].reply_content) {
          pass.value = false
        }
      })
    }
  }
  return {
    pass: pass.value,
    noPassReason: noPassReason.value
  }
}

// // 获取哪个策略是空的
// function getIsNullStrategys(strategysItem) {
//   return strategysItem.length === 0
// }
const getCurSetting = ref(1) // 私信获客策略下 获客设置的值 1仅私信 2含高意向关键词的私信
// 保存
const confirm = throttle(openType => {
  console.log('筛选条件', searchComponents.value)
  if (switchVal.value) {
    const { pass, noPassReason } = saveRules()
    console.log('pass', pass, noPassReason)
    if (!pass) return ElMessage.warning(noPassReason || '请填写规则内容')
  }
  // if (!$data.saving) return
  $data.saving = true
  let allStrategys = null

  // 用户
  if (showBatchStrategySetting.value.type === 0) {
    console.log(
      '用户的策略',
      $data.userMessageTemplateInfo.strategys,
      '选中的策略',
      checkedRules.value
    )
    $data.userMessageTemplateInfo.strategys[0].replyType =
      checkedRules.value && checkedRules.value.length > 0 ? checkedRules.value : [0]
    $data.userMessageTemplateInfo.strategys[0].type = 112
    $data.userMessageTemplateInfo.strategys[0].isOpen = getOpenType(switchVal.value)
    $data.userMessageTemplateInfo.strategys[0].obtainWay = getCurSetting.value
    allStrategys = $data.userMessageTemplateInfo.strategys
  }

  // 视频
  else if (showBatchStrategySetting.value.type === 1) {
    $data.videoCustomerTemplateInfo.strategys[0].replyType = [2]
    $data.videoCustomerTemplateInfo.strategys[0].type = 110
    $data.videoCustomerTemplateInfo.strategys[0].isOpen = getOpenType(switchVal.value)
    allStrategys = $data.videoCustomerTemplateInfo.strategys
  }

  // 直播
  else if (showBatchStrategySetting.value.type === 2) {
    $data.liveCustomerTemplateInfo.strategys[0].replyType = [0]
    $data.liveCustomerTemplateInfo.strategys[0].type = 210
    $data.liveCustomerTemplateInfo.strategys[0].isOpen = getOpenType(switchVal.value)
    allStrategys = $data.liveCustomerTemplateInfo.strategys
  }

  let parma = {
    groupIds: [],
    strategys: allStrategys,
    accountIds: [],
    isControlAll: false
  }
  // accountIds: getIds(), // 矩阵号id
  // isControlAll: showBatchStrategySetting.value.isAll,
  console.log('是否全选', showBatchStrategySetting.value.isAll)
  if (showBatchStrategySetting.value.isAll) {
    parma.isControlAll = true
    const searchQuery = getQuery(searchComponents.value)
    parma = { ...parma, ...searchQuery }
  } else {
    parma.accountIds = getIds()
  }
  console.log('入参', parma)
  // if (parma) return
  failSetListsOpenNoAuth.value = []
  failSetListsOpenNoUid.value = []
  failSetListsReplyNoAuth.value = []
  strategyOpenSet(parma)
    .then(res => {
      console.log('保存/保存并开启的返回', res)
      if (res.code === 0) {
        // failSetListsOpenNoAuth 未授权web端无法开启矩阵策略  failSetListsOpenNoUid 没有uid无法开启矩阵策略   failSetListsReplyNoAuth未授权web端无法使用回复规则
        if (
          numberType.value === 'all' &&
          (res.data.failSetListsOpenNoAuth.length > 0 ||
            res.data.failSetListsOpenNoUid.length > 0 ||
            res.data.failSetListsReplyNoAuth.length > 0)
        ) {
          failSetListsOpenNoAuth.value = res.data.failSetListsOpenNoAuth
          failSetListsOpenNoUid.value = res.data.failSetListsOpenNoUid
          failSetListsReplyNoAuth.value = res.data.failSetListsReplyNoAuth
          openfail.value = true
        } else {
          // if (switchVal.value) {
          //   ElMessage.success('保存并开启成功')
          // } else {
          ElMessage.success('保存成功')
          // }
          close()
          emits('confirm', !showBatchStrategySetting.value.isBatch)
        }
        $data.saving = false
      }
    })
    .catch(() => {
      $data.saving = false
    })
}, 500)

// 获取子组件筛选关键词
const keyWordsObj = reactive({
  list: [],
  loading: true
})

const xmkeyWordsObj = ref([])

// 获取关键词
const remoteMethodGetKeyWords = throttle(() => {
  keyWordsObj.loading = true
  const parma = {
    // pageNo: 1,
    // pageSize: 2000,
    keyType: 1
  }
  keywordList(parma)
    .then(res => {
      if (res.code === 0) {
        const data = res.data || []
        const result = data.filter(e => e.scrmKeywords && e.scrmKeywords.length > 0)
        result.forEach(x => {
          x.keyName = x.groupName
        })
        keyWordsObj.list = result

        xmkeyWordsObj.value = res.data.filter(
          e =>
            e.groupName === '门店地址' ||
            e.groupName === '使用效果' ||
            e.groupName === '购买' ||
            e.groupName === '属性'
        )
      }
      nextTick(() => {
        keyWordsObj.loading = false
      })
    })
    .catch(() => {
      keyWordsObj.loading = false
    })
}, 100)
remoteMethodGetKeyWords()

// function goToSetting() {
//   // 需要跳转至客户管理-潜客管理菜单下的潜客规则tab的品牌自有tab
//   $router.push({
//     path: '/scrm/potential_customer_list',
//     query: {
//       type: 2
//     }
//   })
// }

// function gotoweb() {
//   // 需要跳转至客户管理-潜客管理菜单下的潜客规则tab的品牌自有tab
//   $router.push({
//     path: '/system_manage/authorization',
//     query: {
//       type: 'account'
//     }
//   })
// }

// 获取策略详情
function getStrategyDetail(param) {
  strategyDetail(param)
    .then(res => {
      if (res.code === 0 && res.data) {
        if (res.data.strategyDtos && res.data.strategyDtos.length > 0) {
          res.data.strategyDtos.forEach(item => {
            // 赋值并且回显完成度
            if (item.type === 112) {
              // 用户私信
              $data.userMessageTemplateInfo.strategys = [item]
              // console.warn($data.userMessageTemplateInfo.strategys)
              // 如果回复规则为空 解决keyWordAutoReplyOptions 为null 的错误
              if (!$data.userMessageTemplateInfo.strategys[0].keyWordAutoReplyOptions) {
                $data.userMessageTemplateInfo.strategys[0].keyWordAutoReplyOptions =
                  oneOptions.value
              }
              // 回显回复规则
              getCurSetting.value = $data.userMessageTemplateInfo.strategys[0].obtainWay || 1
            }
            if (item.type === 110) {
              // 视频潜客
              $data.videoCustomerTemplateInfo.strategys = [item]
              if (!$data.videoCustomerTemplateInfo.strategys[0].keyWordAutoReplyOptions) {
                $data.videoCustomerTemplateInfo.strategys[0].keyWordAutoReplyOptions =
                  oneOptions.value
              }
              // console.warn($data.videoCustomerTemplateInfo.strategys)
            }
            if (item.type === 210) {
              // 直播潜客
              $data.liveCustomerTemplateInfo.strategys = [item]
              if (!$data.liveCustomerTemplateInfo.strategys[0].keyWordAutoReplyOptions) {
                $data.liveCustomerTemplateInfo.strategys[0].keyWordAutoReplyOptions =
                  oneOptions.value
              }
              // console.warn($data.liveCustomerTemplateInfo.strategys)
            }
          })
        }
        // 用户的信息
        useInfo.value = {
          eaccount: res.data.eaccount,
          dyAuthStatus: res.data.dyAuthStatus,
          uid: res.data.uid,
          webAuthStatus: res.data.webAuthStatus
        }
        console.error('', useInfo.value)
        getStrategySetting('one')
      } else {
        loading.value = false
      }
    })
    .catch(() => {
      loading.value = false
    })
}

//  处理按钮和回复规则的回显
function getStrategySetting(type) {
  // <!-- eaccount   true是企业号  false是个人号  webAuthStatus是否授权web账号 uid是否有uid -->
  // 默认开关状态是关闭状态，回复设置为不回复
  switchVal.value = false
  checkedRules.value = []
  if (showBatchStrategySetting.value.type === 0) {
    chooseTab.value = 'userMessage'
    console.log('私信模式', $data.userMessageTemplateInfo.strategys[0].replyType)

    if (type === 'one') {
      // 判断是否有开启开关的权限 (仅个人号的web授权部分) !useInfo.value.eaccount &&
      // if (!useInfo.value.webAuthStatus) {
      // switchOpen.value = false
      // replySwitch.value = false
      // }
      // 判断类型回显--私信模式下，如果老数据是[0](不回复)的要重置为[]
      if ($data.userMessageTemplateInfo.strategys[0].replyType) {
        const replyType = $data.userMessageTemplateInfo.strategys[0].replyType
        checkedRules.value =
          replyType && replyType.length === 1 && replyType[0] === 0
            ? []
            : $data.userMessageTemplateInfo.strategys[0].replyType
        changSwitchVal()
      }

      // 判断开关是否打开
      if ($data.userMessageTemplateInfo.strategys[0].isOpen === 1) {
        switchVal.value = true
        changSwitchVal($data.userMessageTemplateInfo.strategys[0].isOpen)
      } else {
        switchVal.value = false
      }
    } else if (type === 'all') {
      changSwitchVal()
    }
  } else if (showBatchStrategySetting.value.type === 1) {
    chooseTab.value = 'videoCustomer'
    ruleList.value[1].lable = '全部回复'
    if (type === 'one') {
      console.log('视频单个')
      // 判断是否有开启开关的权限 (个人号需要uid) !useInfo.value.eaccount &&
      if (!useInfo.value.uid) {
        switchOpen.value = false
      }

      // 个人号没授权web   不可以回复 !useInfo.value.eaccount &&
      // if (!useInfo.value.webAuthStatus) {
      //   replySwitch.value = false
      // }
      console.log('回显', $data.videoCustomerTemplateInfo.strategys[0].replyType)
      // 判断类型回显--视频模式下，老数据都改成匹配关键词回复(2)
      // if ($data.videoCustomerTemplateInfo.strategys[0].replyType) {
      checkedRule.value = 2
      changRuleOne(checkedRule.value)
      // changSwitchVal()
      // }

      // 判断开关是否打开
      if ($data.videoCustomerTemplateInfo.strategys[0].isOpen === 1) {
        switchVal.value = true
        // changSwitchVal()
      } else {
        switchVal.value = false
      }
    } else {
      checkedRule.value = 2
      changRuleOne(checkedRule.value)
    }
    // else if (type === 'all') {
    //   changSwitchVal()
    // }
  } else if (showBatchStrategySetting.value.type === 2) {
    chooseTab.value = 'liveCustomer'
    ruleList.value[1].lable = '全部回复'
    console.log('直播模式')
    if (type === 'one') {
      console.log('视频单个', useInfo.value.uid)
      //  个人号和企业号如果没有uid 都不让开启
      if (!useInfo.value.uid) {
        switchOpen.value = false
      }

      // 个人号和企业号没授权web   不可以回复
      // if (!useInfo.value.webAuthStatus) {
      //   replySwitch.value = false
      // }

      // 判断类型回显-直播模式下，都都改成不回复(0)。
      // if ($data.liveCustomerTemplateInfo.strategys[0].replyType) {
      checkedRule.value = 0
      changRuleOne(checkedRule.value)
      // changSwitchVal()
      // }

      // 判断开关是否打开
      if ($data.liveCustomerTemplateInfo.strategys[0].isOpen === 1) {
        switchVal.value = true
        // changSwitchVal()
      } else {
        switchVal.value = false
      }
    }
    // else if (type === 'all') {
    //   changSwitchVal()
    // }
  }
  nextTick(() => {
    loading.value = false
  })
}

function closeopenfail() {
  openfail.value = false
  close()
  emits('confirm')
}

onMounted(() => {
  loading.value = true
  if (showBatchStrategySetting.value.chooseList.length === 1) {
    numberType.value = 'one'
    getStrategyDetail({ accountId: showBatchStrategySetting.value.chooseList[0].id })
  } else {
    numberType.value = 'all'
    getStrategySetting('all')
  }
})
function chooseCurSetting(id) {
  getCurSetting.value = id
}
// // 普通企业号和个人号的跳转
// const toFun = throttle(type => {
//   const url =
//     type === 1
//       ? 'https://e.douyin.com/site/douyin-mp/login'
//       : 'https://renzheng.douyin.com/site/home'

//   window.open(url, '_blank')
// }, 700)
</script>

<style lang="scss" scoped>
//@import "src/views/scrm/interactive_messages/message_policy/components/css/dialog.scss";

:deep .el-dialog__body {
  padding: 16px !important;
  max-height: 600px;
  overflow-y: auto;
  overflow-x: hidden;
}

.dialog_title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  line-height: 24px;
  padding: 14px 16px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.dialog_content {
  // max-height: 500px;
  // overflow-y: scroll;
  // overflow-x: hidden;

  .head_wrap_tip {
    //position: absolute;
    display: flex;
    align-items: center;
    height: 48px;
    background: #eaedfa;
    border-radius: 4px;
    border: 1px solid #889cff;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #323233;
    margin-bottom: 16px;
    padding-right: 10px;

    .rules_img {
      width: 16px;
      height: 16px;
      min-width: 16px;
      margin-right: 8px;
      margin-left: 16px;
    }

    .head_wrap_tip_btn {
      color: $theme_color;
      display: flex;
      align-items: center;
      margin-left: auto;
      cursor: pointer;
    }
  }

  .dialog_tip {
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #909399;
    line-height: 20px;

    span {
      color: #909399;
    }
  }
  .get_setting {
    margin-top: 4px;
    margin-bottom: 16px;
    display: flex;
    align-items: flex-start;
    flex-direction: row;
    justify-content: space-between;
    .dialog_tip_black {
      color: #303133;
      margin-right: 8px;
    }
    .one_setting {
      cursor: pointer;
      width: calc(50% - 6px);
      min-height: 68px;
      background: #f6f8fa;
      border-radius: 2px;
      border: 1px solid #f6f8fa;
      position: relative;
      padding: 12px 0px 12px 16px;
      .setting_title {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
        line-height: 20px;
      }
      .setting_tip {
        margin-top: 6px;
        font-size: 12px;
        font-weight: 400;
        color: #606266;
        line-height: 18px;
      }
      .choose_check {
        width: 14px;
        height: 20px;
        object-fit: contain;
        display: flex;
        position: absolute;
        right: 16px;
        top: 12px;
        opacity: 0;
        cursor: pointer !important;
      }
      :deep(.el-checkbox__original) {
        cursor: pointer !important;
      }
      :deep(.el-checkbox__input.is-disabled.is-checked .el-checkbox__inner) {
        cursor: pointer !important;
        background-color: var(--el-checkbox-checked-bg-color) !important;
        border-color: var(--el-checkbox-checked-input-border-color) !important;
      }
      :deep(.el-checkbox__input.is-disabled.is-checked .el-checkbox__inner::after) {
        border-color: var(--el-checkbox-checked-icon-color) !important;
        cursor: pointer !important;
      }
    }
    .choose_setting {
      border: 1px solid #364fcd;
      .choose_check {
        opacity: 1;
      }
    }
  }

  .text_library {
    width: 548px;

    .text_library_title {
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #333333;
      margin-top: 20px;
      margin-bottom: 8px;
    }

    .text_library_area {
      height: 96px;
      background: #f6f8fa;
      border-radius: 1px;
      padding: 12px;

      .text_library_area_list {
        display: flex;
        margin-bottom: 10px;

        .text_library_area_list_item {
          height: 24px;
          line-height: 24px;
          background: #eaedfa;
          border-radius: 2px;
          padding: 0px 8px;
          font-size: 12px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #364fcd;
          margin-right: 12px;
        }
      }

      .text_library_tip {
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #909399;
        line-height: 20px;

        .blue_color {
          color: #364fcd;
          cursor: pointer;
        }
      }
    }
  }

  .chang_rule {
    margin: 20px 0px 8px 0px;

    .chang_rule_title {
      display: flex;
      vertical-align: middle;
      align-items: center;
      margin-bottom: 7px;

      .chang_rule_tip {
        font-size: 16px;
        font-weight: 600;
        color: #333333;
        line-height: 22px;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
      }

      .chang_rule_tip_other {
        display: flex;
        align-items: center;
        vertical-align: middle;
        margin-left: 8px;

        .tip_img_icon {
          width: 16px;

          img {
            width: 16px;
            height: 16px;
            vertical-align: -5px;
          }
        }

        .chang_rule_tip_other_tip {
          font-size: 14px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #4f5eca;
          margin-left: 8px;
          cursor: pointer;
        }
      }
    }
  }

  .strategy_rules {
    font-size: 14px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: #333333;
    line-height: 20px;
    margin-bottom: 16px;
  }

  .say_hello {
    margin-bottom: 20px;

    .text {
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 500;
      color: #333333;
      line-height: 20px;
      margin-bottom: 16px;
    }

    :deep(.el-form) {
      margin-bottom: 20px;
    }
  }
}

.group_box {
  max-width: 210px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;

  .new_group_name {
    //max-width: 100px;
    margin: 4px;
    height: 20px;
    padding: 0px 5px;
    background: #dce1f8;
    border-radius: 2px;
    font-size: 12px;
    font-weight: 400;
    color: #364fcd;
    line-height: 20px;
  }
}

.footer_info {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 16px 24px;

  .info_left {
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #909399;
  }

  .has_color_gary {
    color: #909399;
  }

  .has_color {
    color: #364fcd;
  }
}

.blue_tip {
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #4f5eca;
  height: 24px;
  line-height: 26px;
  cursor: pointer;
  margin-left: 8px;
}

.top_other_tip {
  img {
    width: 16px;
    height: 16px;
    vertical-align: -2px;
    margin: 0px 8px;
  }

  height: 24px;
  font-size: 14px;
  font-weight: 400;
  color: #909399;
  line-height: 26px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.bottom_other_tip {
  img {
    width: 16px;
    height: 16px;
    vertical-align: -3px;
    margin: 0px 4px 0px 0px;
  }

  height: 22px;
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #909399;
  line-height: 22px;
}

.content_box {
  padding-bottom: 12px;

  .content1 {
    font-size: 14px;
    font-weight: 400;
    color: #323233;
    line-height: 20px;
  }

  .content2 {
    margin-top: 8px;
    font-size: 14px;
    font-weight: 400;
    color: #606266;
    line-height: 20px;
  }

  .title_tip {
    display: flex;
    align-items: center;
    height: 24px;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #323233;
    line-height: 24px;
    margin-bottom: 8px;

    img {
      width: 20px;
      height: 20px;
      margin-right: 8px;
      vertical-align: -2px;
    }
  }

  .content_text {
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #303133;
    line-height: 20px;
    margin-bottom: 2px;

    .blue_text {
      color: #364fcd;
    }
  }

  .content_text_gray {
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #909399;
    line-height: 20px;
    margin-bottom: 8px;
  }
}

:deep .el-switch {
  height: 24px;
  line-height: 24px;
  vertical-align: -5px;
}
.dialog_content_title {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  line-height: 22px;
  .title_tip {
    cursor: default;
    font-size: 14px;
    font-weight: 400;
    color: #909399;
    line-height: 20px;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    img {
      width: 16px;
      height: 16px;
      margin-left: 6px;
    }
  }
}
:deep(.el-checkbox),
:deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
  color: #303133;
}
:deep(.el-checkbox__input.is-disabled + span.el-checkbox__label) {
  color: #303133;
}
.setting_rule {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  font-size: 14px;
  font-weight: 400;
  color: #909399;
  line-height: 20px;
  span {
    color: #303133;
    padding: 0 4px;
    display: inline-block;
  }
}
.reply_tip {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  font-size: 14px;
  line-height: 20px;
  color: #909399;
  padding-bottom: 8px;
  width: 100%;
  background: #ffffff;
  img {
    width: 16px;
    height: 16px;
    margin-right: 4px;
    margin-top: 2px;
  }
  .reply_content {
    width: calc(100% - 20px);
    span {
      cursor: pointer;
      margin-left: 4px;
      color: #364fcd;
    }
  }
}
</style>
