<template>
  <div class="setting_block">
    <div class="setting_title">内容设置</div>
    <div class="setting_main">
      <!-- 视频发布平台  dyVersion没有全局开就显示单独的配置-->
      <el-form-item
        v-if="dyVersion == 3"
        class="tag_formItem"
        label="视频发布平台："
        prop="video_publish_platform"
        style="flex: 1"
      >
        <el-checkbox-group
          @change="changePlatform2"
          v-model="data.publishPlatform"
          :disabled="disabled"
          style="height: unset"
          :min="1"
        >
          <el-checkbox label="1">抖音</el-checkbox>
          <el-checkbox label="3">小红书</el-checkbox>
          <el-checkbox label="4">快手</el-checkbox>
          <el-checkbox label="2">视频号</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <template v-for="(item, index) in videoConfig.children" :key="item.ckey">
        <el-form-item
          :key="item.ckey + index"
          v-if="item.ckey === 'video_push_mode'"
          :label="item.name + '：'"
          :prop="item.ckey"
        >
          <el-radio-group
            v-model="data.modeList"
            :disabled="disabled"
            @change="changePushMode($event, item)"
          >
            <el-radio label="1">自由创作</el-radio>
            <!-- <el-radio label="2" :disabled="hasDirect" v-if="architectureMode != 3">
              抖音拍摄直接发布
            </el-radio> -->
            <el-radio label="4">一键转发</el-radio>
            <el-radio label="3">创意模板发布</el-radio>
          </el-radio-group>
          <div class="tip" v-show="item.cvalue == 1">账号上传视频后直接发布</div>
          <div class="tip" v-show="item.cvalue == 2">打开抖音官方拍摄器拍摄完直接发布</div>
          <div class="tip" v-show="item.cvalue == 3">
            从企业模板中选择模板，使用后成员需按照此模板制作视频
          </div>
          <!-- <template v-if="item.cvalue == 4">
            <div class="tip">用户执行任务时从视频池中挑选视频发布</div>
            <div></div>
          </template> -->
        </el-form-item>
        <!-- 上传要显示 视频示例和图片指引 -->
        <videoImgExample
          v-if="
            item.ckey === 'video_push_mode' &&
            pushMode == RELEASE_TYPE.get('upload') &&
            dyVersion == 3
          "
          :taskInfo="taskInfo"
          :disabled="disabled"
          :taskType="taskType"
        />
        <!-- 重复参与 下载发布模式下的普通视频任务才加 -->
        <!-- <el-form-item
          :key="item.ckey + index"
          v-else-if="
            pushMode == RELEASE_TYPE.get('upload') &&
            item.ckey === 'multi_join_set' &&
            pageSource != 'growth' &&
            dyVersion == 3
          "
          :label="item.name + '：'"
          :prop="item.ckey"
        >
          <div
            class="repeated_wrapper"
            :style="{ height: repeatedInfo.switchStatus == 1 ? '130px' : '64px' }"
          >
            <div class="audit_wrapper">
              <el-switch
                v-model="repeatedInfo.switchStatus"
                :active-value="1"
                :inactive-value="0"
                @change="repeatedInfoChange($event, 'switchStatus')"
                :disabled="disabled"
                inline-prompt
                active-text="开"
                inactive-text="关"
              />
            </div>
            <div class="tip">开启后，任务将支持成员在时间范围内多次参与，任务奖励也会多次发放</div>
            <el-radio-group
              v-if="repeatedInfo.switchStatus === 1"
              v-model="repeatedInfo.typeRadio"
              :disabled="disabled"
              @change="repeatedInfoChange($event, 'typeRadio')"
            >
              <el-radio :label="1">
                <div class="repeated_radio">
                  每
                  <el-input-number
                    class="repeated_radio_input_number"
                    v-model="repeatedInfo.everyday"
                    @change="repeatedInfoChange($event, 'everyday')"
                    :disabled="disabled"
                    :min="1"
                    :max="100"
                    :step="1"
                    :precision="0"
                    controls-position="right"
                  />
                  日可参与1次，任务范围内每位成员最多参与
                  <el-input-number
                    class="repeated_radio_input_number"
                    @change="repeatedInfoChange($event, 'maximum')"
                    v-model="repeatedInfo.maximum"
                    :disabled="disabled"
                    :min="2"
                    :max="100"
                    :step="1"
                    :precision="0"
                    controls-position="right"
                  />
                  次
                </div>
              </el-radio>
              <el-radio :label="2">
                <div class="repeated_radio">
                  完成1次任务后可继续参与，任务范围内每位成员最多参与
                  <el-input-number
                    class="repeated_radio_input_number"
                    @change="repeatedInfoChange($event, 'totalMaximum')"
                    v-model="repeatedInfo.totalMaximum"
                    :disabled="disabled"
                    :min="2"
                    :max="100"
                    :step="1"
                    :precision="0"
                    controls-position="right"
                  />
                  次
                </div>
              </el-radio>
            </el-radio-group>
          </div>
        </el-form-item> -->
        <!-- 优质矩阵号转发提醒 成长任务不加 -->
        <!-- <el-form-item
          :key="item.ckey + index"
          v-else-if="
            item.ckey == 'forward_alarm' &&
            pushMode == RELEASE_TYPE.get('forward') &&
            pageSource != 'growth'
          "
          :label="item.name + '：'"
          :prop="item.ckey"
        >
          <div class="flex_box">
            <el-switch
              v-model="item.cvalue"
              :disabled="disabled"
              inline-prompt
              active-text="开"
              inactive-text="关"
              active-value="1"
              inactive-value="0"
            />
            <el-tooltip placement="right">
              <template #content>
                <div style="max-width: 360px">
                  一键转发任务推荐新手账号参与，开关开启后系统将自动提示S级和A级矩阵号运营者
                </div>
              </template>
              <div class="xm_tooltipOfRight" style="margin-left: 4px"></div>
            </el-tooltip>
          </div>
        </el-form-item> -->
        <!-- 一键转发扩展内容 -->
        <el-form-item
          :key="item.ckey + index"
          v-else-if="
            item.ckey === 'video_forward_conditions' &&
            videoSelectMode == '1' &&
            pushMode == RELEASE_TYPE.get('forward')
          "
          :prop="item.ckey"
        >
          <el-button type="primary" :disabled="disabled" @click="data.showVideoListDialog = true">
            视频池设置
          </el-button>
          <template v-if="data.forwardConditions">
            <div class="rule">
              <p class="title">当前视频池规则</p>
              <div class="content" v-if="!allRule">
                <p v-if="data.forwardConditions.publishTimeStart">
                  创建时间:&nbsp;&nbsp;&nbsp;{{ data?.forwardConditions.publishTimeStart }}~{{
                    data?.forwardConditions.publishTimeEnd
                  }}
                </p>
                <p v-if="data.forwardConditions.useCountMin">
                  使用次数:&nbsp;&nbsp;{{ data?.forwardConditions.useCountMin }}次~{{
                    data?.forwardConditions.useCountMax
                  }}次
                </p>
                <p v-if="data.forwardConditions.videoDurationMin">
                  视频时长:&nbsp;&nbsp;{{ data?.forwardConditions.videoDurationMin }}秒~{{
                    data?.forwardConditions.videoDurationMax
                  }}秒
                </p>
                <p v-if="data.forwardConditions.tagNames.length !== 0">
                  标签:&nbsp;&nbsp;&nbsp;{{ data?.forwardConditions.tagNames.join('/') }}
                </p>
                <p v-if="isNotEmpty(data.forwardConditions.fileInfo)">
                  文件夹:&nbsp;&nbsp;&nbsp;{{ data.forwardConditions.fileInfo.name || '' }}
                </p>
                <p v-if="data.forwardConditions.sourceNames.length !== 0">
                  视频来源:&nbsp;&nbsp;{{
                    changeName(data?.forwardConditions.sourceNames.join('/'))
                  }}
                </p>
              </div>
              <div v-else class="content">
                <p>全部内容库视频</p>
              </div>
              <p style="display: flex; align-items: center">
                从素材库中共筛选了约&nbsp;&nbsp;
                <span style="color: rgba(54, 79, 205, 1)">
                  {{ data?.forwardConditions.total || 0 }}
                </span>
                &nbsp; 条视频
              </p>
            </div>
          </template>
        </el-form-item>
        <!-- 模板发布扩展内容 -->
        <el-form-item
          :key="item.ckey + index"
          v-else-if="item.ckey === 'video_set_template' && pushMode == RELEASE_TYPE.get('sumvideo')"
          :prop="item.ckey"
        >
          <div class="sumvideo_template" style="display: flex" v-if="data.templateInfo">
            <div>
              <div
                class="template_cover"
                :style="{ 'background-image': `url(${data.templateInfo.coverUrl})` }"
              >
                <div class="digital_icon_left" v-if="data.templateInfo.tag == 2"></div>
                <template v-if="!disabled">
                  <div class="del_btn" @click="deleteTemplate(item)">
                    <el-icon color="#ffffff" size="18">
                      <i-delete />
                    </el-icon>
                  </div>
                </template>
              </div>
              <div class="template_name">{{ data.templateInfo.name }}</div>
            </div>
            <!-- 右边 分镜提示等 -->
            <div class="template_r_tips">
              创意包含
              <span class="num_tips">{{ data.templateInfo.totalCnt || 0 }}</span>
              个分镜，目前
              <span class="num_tips">{{ data.templateInfo.replaceCnt || 0 }}</span>
              个分镜为可替换
              <span class="num_tips get_new" @click="getReplaceCnt(data.templateInfo.id, true)">
                {{ '刷新' }}
              </span>
              <br />
              <span class="num_tips go_det" @click="goReplaceDet">查看模板详情>></span>
            </div>
          </div>
          <div class="sumvideo_btn" @click="data.showTemplateDialog = true" v-else>
            <el-icon size="24" color="#999">
              <i-plus />
            </el-icon>
            <div class="sumvideo_btn_text">添加模板</div>
          </div>
        </el-form-item>
        <!-- 控制开关显隐部分 -->
        <el-form-item
          :key="item.ckey + index"
          v-else-if="
            item.ckey === 'video_audit_set' &&
            (pushMode == RELEASE_TYPE.get('upload') || pushMode == RELEASE_TYPE.get('sumvideo')) &&
            dyVersion != 3
          "
          :label="item.name + '：'"
          :prop="item.ckey"
        >
          <div class="audit_wrapper">
            <el-switch
              v-model="data.auditStatus"
              @change="item.cvalue = data.auditStatus ? 1 : 0"
              :disabled="!data.hasAuditNode || disabled"
              inline-prompt
              active-text="开"
              inactive-text="关"
            />
            <span style="margin-left: 12px" v-if="!data.hasAuditNode">您还未设置审核规则</span>
            <span class="audit_text" @click="toAuditRules">
              <span>{{ data.hasAuditNode ? '查看审核规则' : '去设置' }}</span>
              <el-icon><i-arrow-right /></el-icon>
            </span>
          </div>
          <div class="tip">
            开启后视频需要审核才能发布
            <span v-if="data.auditStatus && pageSource != 'growth'">
              （审核不通过允许重新参与
              <el-switch
                v-model="data.rePublishStatus"
                @change="changeRepublishStatus"
                :disabled="!data.hasAuditNode || disabled"
                inline-prompt
              />
              ）
            </span>
          </div>
        </el-form-item>
        <!-- <el-form-item
          :key="item.ckey + index"
          class="tag_formItem"
          :label="item.name + '：'"
          v-else-if="item.ckey === 'video_tags_set' && hasTag"
          :prop="item.ckey"
        >
          <tagSetting
            :disabled="disabled"
            :tagInfo="item.cvalue"
            :hideTip="pushMode == RELEASE_TYPE.get('upload') ? true : false"
            type="videoTagSet"
            @updateTag="filterVideoTag"
          ></tagSetting>
        </el-form-item> -->
        <!-- 视频发布平台  dyVersion没有全局开就显示单独的配置-->
        <el-form-item
          :key="item.ckey + index"
          class="tag_formItem"
          :label="item.name + '：'"
          v-else-if="item.ckey === 'video_publish_platform' && hasVideoPlatform && dyVersion != 3"
          :prop="item.ckey"
          style="flex: 1"
        >
          <el-checkbox-group
            @change="changePlatform2"
            v-model="data.publishPlatform"
            :disabled="disabled"
            style="height: unset"
            :min="1"
          >
            <el-checkbox label="1">抖音</el-checkbox>
            <el-checkbox label="3">小红书</el-checkbox>
            <el-checkbox label="4">快手</el-checkbox>
            <el-checkbox label="2">视频号</el-checkbox>
          </el-checkbox-group>
          <!-- <el-radio-group
            @change="changePlatform"
            v-model="item.cvalue"
            :disabled="disabled"
            style="height: unset"
          >
            <el-radio label="0">不限制平台</el-radio>
            <el-radio label="1">抖音</el-radio> -->
          <!-- <el-radio label="2">视频号</el-radio> -->
          <!-- <el-radio label="3">小红书</el-radio>
            <el-radio label="4">快手</el-radio>
          </el-radio-group> -->
        </el-form-item>
        <!--  扫码发布      -->
        <el-form-item
          :key="item.ckey + index"
          v-else-if="item.ckey == 'scan_and_publish' && hasVideoPlatform && dyVersion != 2 && false"
          :label="item.name + '：'"
          :prop="item.ckey"
        >
          <div class="flex_box">
            <el-switch
              v-model="item.cvalue"
              :disabled="disabled || scanPublishDisabled"
              inline-prompt
              active-text="开"
              inactive-text="关"
              active-value="1"
              inactive-value="0"
            />
            <div class="tip" style="margin-left: 5px">
              开启后，抖音平台将通过扫码发布，其他平台不受影响
            </div>
          </div>
        </el-form-item>
        <!-- 一键转发的视频选择方式 -->
        <el-form-item
          :key="item.ckey + index"
          v-else-if="item.ckey === 'video_select_mode' && pushMode == RELEASE_TYPE.get('forward')"
          :label="item.name + '：'"
          :prop="item.ckey"
        >
          <el-radio-group
            v-model="item.cvalue"
            :disabled="disabled"
            @change="selectModeChange($event, item)"
          >
            <el-radio label="1">从素材库中选视频</el-radio>
            <el-radio label="2">按创意模板发视频</el-radio>
          </el-radio-group>
          <div class="tip" v-show="item.cvalue == 1">
            从素材库中框选出视频池，员工做任务时需要从视频池中选择一个视频发布
          </div>
          <div class="tip" v-show="item.cvalue == 2">
            员工做任务时需选择一个创意模板，系统自动发布一个该模板生产的视频
          </div>
        </el-form-item>
        <!-- 一键转发-按创意模板法发视频的选项 -->
        <el-form-item
          :key="item.ckey + index"
          v-else-if="
            item.ckey == 'video_set_template' &&
            videoSelectMode == '2' &&
            pushMode == RELEASE_TYPE.get('forward')
          "
          :prop="item.ckey"
          class="video_set_box"
        >
          <el-button type="primary" :disabled="disabled" @click="data.showTemplateDialog = true">
            选择创意模板
          </el-button>
          <!-- 选中的创意模板信息 -->

          <div
            class="template_box"
            v-if="data.videoTemplateList && data.videoTemplateList.length > 0"
          >
            <draggable
              :disabled="true"
              style="
                display: flex;
                flex-wrap: wrap;
                align-items: flex-start;
                justify-content: flex-start;
                flex-direction: row;
              "
              @end="dragEnd"
              v-model="data.videoTemplateList"
              group="fowardVideoTemplate"
              item-key="id"
              animation="300"
              chosenClass="chosen"
              ghostClass="ghost"
            >
              <template #item="{ element, index }">
                <div class="one_template">
                  <div class="template_top">
                    <div class="digital_icon_left" v-if="element.tag == 2"></div>
                    <img class="template_cover" :src="element.coverUrl" />
                    <div class="template_mask"></div>
                    <!-- 播放按钮 -->
                    <img
                      class="template_play"
                      @click="playFun(element)"
                      src="@/assets/images/content_center/inspection_play.png"
                      alt
                    />

                    <!-- 删除按钮 -->
                    <img
                      v-if="!disabled"
                      class="template_del"
                      @click="delFun(index)"
                      src="@/assets/images/content_center/delete.png"
                      alt
                    />
                  </div>
                  <div class="template_bottom">
                    <el-tooltip effect="dark" placement="right">
                      <template #content>
                        <div class="bottom_text" style="max-width: 300px">
                          {{ element.name || '--' }}
                        </div>
                      </template>
                      <div class="line-hidden1 bottom_text" style="max-width: max-content">
                        {{ element.name || '--' }}
                      </div>
                    </el-tooltip>
                  </div>
                </div>
              </template>
            </draggable>
          </div>
          <div class="tip" v-if="data.videoTemplateList && data.videoTemplateList.length > 0">
            系统将自动对成员实际可见的模板进行智能排序
          </div>
        </el-form-item>
        <!-- 一键转发-按创意模板转发-视频使用次数限制 -->
        <el-form-item
          :key="item.ckey + index"
          v-else-if="
            item.ckey == 'video_use_times_limit_switch' &&
            pushMode == RELEASE_TYPE.get('forward') &&
            pageSource != 'growth'
          "
          :label="videoSelectMode == '2' ? '视频使用次数限制：' : '成员转发模板视频次数限制：'"
          :prop="item.ckey"
          :class="isFromCalendar && videoSelectMode != '2' ? 'limit_switch_box' : ''"
        >
          <el-radio-group v-model="item.cvalue" :disabled="disabled" @change="_remainTemplateNum()">
            <el-radio label="0">不限制</el-radio>
            <el-radio label="1">限制</el-radio>
          </el-radio-group>
          <div class="num_box" v-if="item.cvalue == '1'">
            {{ videoSelectMode == '2' ? '每个视频最多使用' : '每个成员最多转发同一个模板中的视频' }}
            <el-input-number
              :disabled="disabled"
              @change="updateUseTimeFun"
              v-model="data.useTime"
              controls-position="right"
              style="width: 120px; margin: 0 8px"
              placeholder="请输入"
              :min="1"
              :max="5"
            />
            次
            <template v-if="videoSelectMode == '2'">
              &emsp;限制后，实际可用模板数量：
              <span v-loading="data.videoUseResidueNumLoading" style="color: #364fcd">
                {{ data.videoUseResidueNum }}
              </span>
            </template>
          </div>
        </el-form-item>
        <!-- 发布标题 -->
        <el-form-item
          :key="item.ckey + index"
          label="发布标题："
          prop="publish_title_config"
          v-else-if="item.ckey == 'publish_title_config' && hasVideoPlatform && dyVersion != 3"
        >
          <el-radio-group
            v-if="data.modeList == 3 || data.modeList == 4"
            :disabled="disabled"
            v-model="item.cvalue"
            style="height: unset"
            @change="
              () => {
                titleOver = false
                ;(
                  videoConfig.children.find(s => {
                    return s.ckey === 'video_title'
                  }) || { cvalue: null }
                ).cvalue = ''
              }
            "
          >
            <el-radio label="1">手动填写</el-radio>
            <!-- <el-radio label="2">固定标题</el-radio> -->
            <el-radio label="3">智能推荐</el-radio>
          </el-radio-group>
          <div class="title_warp">
            <!-- <div class="tip" v-if="item.cvalue == 1">
              员工在做任务时可自由选择是否填写并携带标题发布内容
            </div> -->
            <el-input
              v-if="item.cvalue == 1"
              :disabled="disabled"
              :placeholder="`请输入预设发布标题，员工可手动修改`"
              v-model="
                (
                  videoConfig.children.find(s => {
                    return s.ckey === 'video_title'
                  }) || { cvalue: null }
                ).cvalue
              "
              type="textarea"
              resize="none"
              show-word-limit
              :autosize="{ minRows: 3, maxRows: 4 }"
              :maxlength="500"
              @input="titleInput"
            ></el-input>
            <div
              class="tip"
              v-if="titleOver && item.cvalue == 1 && (showMount2 == '0' || showMount2 == '3')"
            >
              发布到小红书时，超出20字的部分将自动拆为笔记正文描述
            </div>
            <div class="tip" v-if="item.cvalue == 3">
              智能自动填写关联模板标题文案库中的文案，员工可修改
            </div>
          </div>
        </el-form-item>
        <el-form-item
          v-else-if="item.ckey === 'intelligent_ai_title'"
          class="tag_formItem keyword_formItem"
          label="视频参考标题："
          style="flex: 1"
        >
          <template #label>
            <div class="keyword_label">
              视频参考标题：
              <el-tooltip placement="top">
                <template #content>
                  <div style="max-width: 330px">员工发布时会参考生成的标题自动仿写</div>
                </template>
                <span class="xm_tooltipOfRight"></span>
              </el-tooltip>
            </div>
          </template>
          <keywordToTitle
            btnText="AI一键生成标题"
            width="542px"
            :formData="formData"
            :platformList="platformList"
            :disabled="disabled"
            :keywordList="formData.keywordList"
            :dyTopicList="atAndTopicAndPoi.topicList"
            :dyAtList="atAndTopicAndPoi.dyAtList"
            :xhsTopicList="atAndTopicAndPoi.topicList"
            :xhsAtList="atAndTopicAndPoi.xhsAtList"
          />
        </el-form-item>
      </template>
      <!--挂在项设置 不限平台 和 只限抖音才显示配置   -->
      <el-form-item
        label="挂载项设置："
        prop="mountContent"
        v-if="showMount && hasVideoPlatform && dyVersion != 3"
      >
        <mount-dialog :taskType="taskType" :disabled="disabled" :taskInfo="taskInfo"></mount-dialog>
      </el-form-item>
    </div>
    <!-- 创意弹窗 -->
    <sumvideo-template-dialog
      ref="sumvideoTemplateDialogEle"
      v-if="data.showTemplateDialog"
      @chooseTemplate="chooseTemplate"
      :type="pushMode"
      :templateType="'video'"
      :videoTemplateList="data.videoTemplateList"
      v-model:showDialog="data.showTemplateDialog"
    ></sumvideo-template-dialog>
    <!-- 选择转发视频弹窗 -->
    <videoList
      ref="videoListRef"
      title="任务视频池设置"
      subTitle="执行任务时达人从设置的视频池中挑选视频发布"
      materialType="video"
      @filterConditions="filterConditions"
      v-model:showDialog="data.showVideoListDialog"
    ></videoList>
  </div>
</template>

<script setup>
import videoImgExample from './video_img_example.vue'
import { throttle, debounce, isEmpty, isNotEmpty } from '@/utils/tools.js'
import draggable from 'vuedraggable'
import keywordToTitle from './keyword_to_title.vue'
// import tagSetting from '../tag_setting/index.vue'
import videoList from './video_list.vue'
import sumvideoTemplateDialog from './sumvideo_template_dialog.vue'
import { RELEASE_TYPE } from '@/utils/dictionary/task'
import { isHaveAuditNode, getCreativeReplaceCnt } from '@/api/market/task_audit'
import { useRouter } from 'vue-router'
import { getForwardVideoList, remainTemplateNum } from '@/api/market/task.js'
import { ElMessage } from 'element-plus'
import MountDialog from './mount_dialog.vue'
import { useStore } from 'vuex'
const store = useStore()
const dyVersion = computed(() => store.state.user.dyVersion)
const router = useRouter()
const props = defineProps({
  videoConfig: Object,
  taskInfo: Object,
  disabled: Boolean,
  pageSource: String,
  taskType: Number,
  isFromCalendar: Boolean // 是否从营销计划进入
})

const isFromCalendar = toRef(props, 'isFromCalendar')
const videoConfig = toRef(props, 'videoConfig')
const requireConfig = props.taskInfo?.infoConfigs.find(item => item.ckey === 'task_require') // 为了在复制任务->选择转发任务时去除视频、图片样例

const disabled = toRef(props, 'disabled')

const emits = defineEmits(['updateValidate', 'getOffsetTop', 'publishPlatformChange'])
const sumvideoTemplateDialogEle = ref(null)
const videoListRef = ref(null)

const data = reactive({
  publishPlatform: ['1'], // 视频发布平台
  templateId: null,
  showTemplateDialog: false,
  showVideoListDialog: false,
  templateInfo: null,
  hasAuditNode: false,
  auditStatus: false,
  forwardConditions: null,
  modeList: '', // 视频发布方式
  rePublishStatus: true, // 审核不通过是否可以重新参与，默认可以
  videoTemplateList: [], // 一键转发-选中的创意模板列表
  useTime: '1', // 次数限制： 1-5
  videoUseResidueNum: 0, // 限制次数后，剩余的使用次数
  videoUseResidueNumLoading: false, // 计算loading
  titleValue: '' // 视频标题
})

// 显示挂载项配置 不限平台 抖音 小红书 这三个需要显示挂载项设置
const showMount = computed(() => {
  // 获取视频发布设置的当前值
  // 值为0 或者 1  显示
  const value = videoConfig?.value.children.find(
    item => item.ckey === 'video_publish_platform'
  )?.cvalue
  return value === '0' || value === '1' || value === '3'
})
// 显示扫码发布 不限平台 抖音 才可以使用
const scanPublishDisabled = computed(() => {
  // 值为0 或者 1  显示
  const value = videoConfig?.value.children.find(
    item => item.ckey === 'video_publish_platform'
  )?.cvalue
  return value !== '0' && value !== '1'
})
// 选择平台改变
const changePlatform2 = value => {
  for (const i in videoConfig.value.children) {
    const config = videoConfig.value.children[i]
    if (config.ckey === 'video_publish_platform') {
      config.cvalue = data.publishPlatform.join(',')
    }
    // 早没有任务里支持配置扫码发布了，目前都是全局配置
    // if (value !== '0' && value !== '1') {
    //   const config2 = videoConfig.value.children[i]
    //   if (config2.ckey === 'scan_and_publish') {
    //     config2.cvalue = '0'
    //   }
    // }
  }
  // 如果选择了抖音 清空小红书POI 选择了小红书 清空抖音POI 选择了快手或者视频号 清空小红书和抖音POI
  emits('publishPlatformChange', value)
}
// const changePlatform = value => {
//   if (value !== '0' && value !== '1') {
//     videoConfig.value.children.forEach(e => {
//       if (e.ckey === 'scan_and_publish') {
//         e.cvalue = '0'
//       }
//     })
//   }
// }
// 组织结构模式
// const architectureMode = computed(() => {
//   const brandInfo = JSON.parse(localStorage.getItem('brandInfo'))
//   return brandInfo.architectureMode
// })

const pushMode = computed(() => {
  for (const i in videoConfig.value.children) {
    const config = videoConfig.value.children[i]
    if (config.ckey === 'video_push_mode') {
      return config.cvalue
    }
  }
})

const showMount2 = computed(() => {
  const value = videoConfig?.value.children.find(
    item => item.ckey === 'video_publish_platform'
  )?.cvalue
  return value
})

const titleOver = ref(false) // 标题是否超过20字

function titleInput(e) {
  if (e?.length > 20) {
    titleOver.value = true
  } else {
    titleOver.value = false
  }
}

// 是否显示视频标签
// const hasTag = computed(() => {
//   const set = new Set(data.modeList)
//   // set.has('1') ||
//   if (set.has('3')) {
//     return true
//   } else {
//     return false
//   }
// })
// 是否显示视频发布平台
const hasVideoPlatform = computed(() => {
  if (dyVersion.value === 3) {
    return true
  } else {
    const set = new Set(data.modeList)
    if (set.size) {
      return !set.has('2')
    } else {
      return false
    }
  }
})
function rule() {
  if (
    data.forwardConditions.publishTimeStart.length !== 0 ||
    data.forwardConditions.videoDurationMin ||
    data.forwardConditions.useCountMin ||
    data.forwardConditions.tagIds.length !== 0 ||
    data.forwardConditions.sourceNames.length !== 0 ||
    isEmpty(data.forwardConditions.fileInfo)
  ) {
    allRule.value = false
  } else {
    allRule.value = true
  }
}
// 选择转发视频的方式
function deleteTemplate(item) {
  item.cvalue = null
  data.templateInfo = null
  if (sumvideoTemplateDialogEle.value) {
    sumvideoTemplateDialogEle.value.clearCheck()
  }
}
// 去查看素材详情
function goReplaceDet() {
  window.open(
    `${location.origin}/sumwhy_video/template_space/template_edit?id=${data.templateInfo.id}`,
    '_blank'
  )
}
// 获取分镜数和可替换分镜数
function getReplaceCnt(creativeId, refresh = false) {
  getCreativeReplaceCnt({ creativeId }).then(res => {
    data.templateInfo = {
      ...data.templateInfo,
      replaceCnt: res.data.replaceCnt,
      totalCnt: res.data.totalCnt
    }
    if (refresh) {
      ElMessage.success('刷新成功！')
    }
  })
}
// 更新模板信息 item 是要更新的数据  type 是视频发布方式  skipSetType 是跳过设置data的数据
function chooseTemplate(item, type, skipSetType) {
  if (!skipSetType) {
    if (type === '3') {
      data.templateInfo = item
    } else {
      data.videoTemplateList = item
    }
  }
  for (const i in videoConfig.value.children) {
    const config = videoConfig.value.children[i]
    if (config.ckey === 'video_set_template') {
      if (type === '3') {
        // 创意模板是单选
        config.cvalue = JSON.stringify(item)
      } else {
        // 转发是多选
        config.cvalue =
          item && item.length > 0
            ? JSON.stringify({
                type: 'multi',
                data: item
              })
            : ''
      }
    }
  }
  if (type === '3') {
    getReplaceCnt(item.id)
  }
  emits('updateValidate', 'video_set_template')
  _remainTemplateNum()
}
const allRule = ref(false)
function filterConditions(option) {
  data.forwardConditions = JSON.parse(JSON.stringify(option))
  for (const i in videoConfig.value.children) {
    const config = videoConfig.value.children[i]
    if (config.ckey === 'video_forward_conditions') {
      config.cvalue = JSON.stringify(option)
    }
  }
  rule()
  emits('updateValidate', 'video_forward_conditions')
}

function toAuditRules() {
  const isFlyBook = localStorage.getItem('isFlyBook') === '1'
  if (isFlyBook) {
    router.push('/content_market/examine_setting?type=video')
  } else {
    window.open('/content_market/examine_setting?type=video')
  }
}

function getAuditNode() {
  isHaveAuditNode().then(res => {
    data.hasAuditNode = res.data === 1
  })
}

function changePushMode(value, item) {
  item.cvalue = value
  titleOver.value = false
  // 如果是转发任务（一键转发&创意模板转发，就将视频设置里的样例视频、图片挂载项初始化
  if (Number(item.cvalue) === 4 || Number(item.cvalue) === 3) {
    requireConfig.children.forEach(e => {
      if (e.ckey === 'video_demo' || e.ckey === 'image_guide') {
        e.cvalue = null
      }
    })
  }
  if (Number(item.cvalue) !== 1) {
    // 将视频审核、重复参与相关去掉了
    videoConfig.value.children.forEach(e => {
      if (e.ckey === 'video_audit_set') {
        e.cvalue = 0
        data.auditStatus = false
      }
      if (e.ckey === 'multi_join_set') {
        e.cvalue = 0
        repeatedInfo.value.switchStatus = 0
      }
      if (e.ckey === 'multi_join_type') {
        e.cvalue = 1
        repeatedInfo.value.typeRadio = 1
      }
      if (e.ckey === 'join_interval') {
        e.cvalue = 1
        repeatedInfo.value.everyday = 1
      }
      if (e.ckey === 'total_join_times') {
        e.cvalue = 1
        repeatedInfo.value.maximum = 2
        repeatedInfo.value.totalMaximum = 2
      }
    })
  }
  // 除了创意模板和抖音上传直接发布以外的都清空标签
  if (!(value.indexOf('1') > -1 || value.indexOf('3') > -1)) {
    videoConfig.value.children.forEach(e => {
      if (e.ckey === 'video_tags_set') {
        e.cvalue = ''
      }
    })
  }
  // 视频发布平台，如果带了拍摄的就是不限制，否则默认就是全部
  // 下载发布模式下 选择发布方式不影响发布平台
  if (value.indexOf('2') > -1) {
    if (dyVersion.value !== 3) {
      videoConfig.value.children.forEach(e => {
        if (e.ckey === 'video_publish_platform') {
          e.cvalue = '0'
        }
      })
    }
  } else {
    if (dyVersion.value !== 3) {
      videoConfig.value.children.forEach(e => {
        if (e.ckey === 'video_publish_platform') {
          e.cvalue = '0'
        }
      })
    }
  }
  // 每次选择，清空创意模板的信息
  videoConfig.value.children.forEach(e => {
    if (e.ckey === 'video_set_template') {
      e.cvalue = ''
    }
    if (e.ckey === 'video_select_mode') {
      e.cvalue = '1'
    }
  })
  // 每次选择清空发布视频选择的平台
  videoConfig.value.children.forEach(e => {
    if (e.ckey === 'publish_title_config') {
      e.cvalue = '1'
    }
    // 清空填写标题
    if (e.ckey === 'video_title') {
      e.cvalue = ''
    }
  })

  videoConfig.value.children.forEach(e => {
    if (e.ckey === 'video_push_mode' && e.cvalue === '3') {
      changeTitleValue()
    }
  })

  data.videoTemplateList = []
  data.titleValue = ''
  // emits('chooseType', data.modeList)
  emits('getOffsetTop')
}
async function updateNum() {
  const res = await getForwardVideoList(data.forwardConditions)
  data.forwardConditions.total = res.data.total
}
onMounted(() => {
  getAuditNode()
  for (const i in videoConfig.value.children) {
    const config = videoConfig.value.children[i]
    if (config.cvalue) {
      if (config.ckey === 'video_set_template') {
        if (pushMode.value === '3') {
          data.templateInfo = JSON.parse(config.cvalue)
          // 回显操作 （编辑，调用下方法
          getReplaceCnt(data.templateInfo.id)
        } else {
          data.videoTemplateList = JSON.parse(config.cvalue).data
          _remainTemplateNum()
        }
      }
      if (config.ckey === 'video_forward_conditions') {
        data.forwardConditions = JSON.parse(config.cvalue)
        videoListRef.value.setDefaultParam(data.forwardConditions)
        updateNum()
      }
      if (config.ckey === 'video_push_mode') {
        data.modeList = config.cvalue
      }
      if (config.ckey === 'video_use_times_limit') {
        data.useTime = config.cvalue
      }
      if (config.ckey === 'video_title') {
        titleOver.value = config.cvalue && config.cvalue.length > 20
      }
      // 回显重复参与相关信息--
      if (config.ckey === 'multi_join_set') {
        repeatedInfo.value.switchStatus = Number(config.cvalue) || 0
      }
      if (config.ckey === 'multi_join_type') {
        repeatedInfo.value.typeRadio = Number(config.cvalue) || 1
      }
      if (config.ckey === 'join_interval') {
        repeatedInfo.value.everyday =
          repeatedInfo.value.typeRadio === 1 ? Number(config.cvalue) || 1 : 1
      }
      if (config.ckey === 'total_join_times') {
        if (repeatedInfo.value.typeRadio === 1) {
          repeatedInfo.value.maximum = Number(config.cvalue) || 2
        } else {
          repeatedInfo.value.totalMaximum = Number(config.cvalue) || 2
        }
      }
      // 回显重复参与相关信息--
    }
    if (config.ckey === 'video_audit_set') {
      data.auditStatus = Number(config.cvalue) === 1
    }
    if (config.ckey === 'allow_audit_refuse_rejoin') {
      data.rePublishStatus = Number(config.cvalue) === 1
    }
    // 兼容老数据，2025.1开始 视频发布平台从单选变成多选 删除选项不限制'0'
    if (config.ckey === 'video_publish_platform') {
      if (config.cvalue === '0') {
        // 默认选中所有
        config.cvalue = '1,2,3,4'
        data.publishPlatform = ['1', '2', '3', '4']
      } else {
        if (config.cvalue) {
          data.publishPlatform = config.cvalue.split(',')
        } else {
          // 默认选中抖音
          data.publishPlatform = ['1']
        }
      }
      emits('publishPlatformChange', data.publishPlatform)
    }
    if (config.ckey === 'video_common_mount' && isNotEmpty(config.cvalue)) {
      const cvalue = JSON.parse(config.cvalue)
      // 兼容显示以前的关键词
      if (isNotEmpty(cvalue?.keywordList)) {
        // 提交是数组 回显是字符串
        formData.titlePrompt = cvalue?.keywordList.join('、')
      }
      if (isNotEmpty(cvalue.titlePrompt)) {
        // 提交是数组 回显是字符串
        formData.titlePrompt = cvalue.titlePrompt[0]
      }
      if (isNotEmpty(cvalue.otherTitle)) {
        formData.otherTitle = cvalue.otherTitle
      }
      if (isNotEmpty(cvalue.xhsTitle)) {
        formData.xhsTitle = cvalue.xhsTitle
      }
      if (isNotEmpty(cvalue.xhsDescription)) {
        formData.xhsDescription = cvalue.xhsDescription
      }
    }
  }
})
// 更新视频标签
// function filterVideoTag(option) {
//   for (const i in videoConfig.value.children) {
//     const config = videoConfig.value.children[i]
//     if (config.ckey === 'video_tags_set') {
//       config.cvalue = option ? JSON.stringify(option) : ''
//     }
//   }
// }
function changeRepublishStatus(val) {
  videoConfig.value.children.forEach(e => {
    if (e.ckey === 'allow_audit_refuse_rejoin') {
      e.cvalue = val ? 1 : 0
    }
  })
}
// 创意模板拖拽结束--更新item.value
function dragEnd() {
  chooseTemplate(data.videoTemplateList, pushMode.value, true)
}
// 创意模板播放
const playFun = throttle(e => {
  window.open(e.videoUrl, '_blank')
}, 500)
// 创意模板删除
const delFun = throttle(i => {
  data.videoTemplateList.splice(i, 1)
  chooseTemplate(data.videoTemplateList, pushMode.value, true)
}, 500)
const videoSelectMode = computed(() => {
  for (const i in videoConfig.value.children) {
    const config = videoConfig.value.children[i]
    if (config.ckey === 'video_select_mode') {
      return config.cvalue
    }
  }
})
// 发布标题默认选中智能推荐
function changeTitleValue() {
  videoConfig.value.children.forEach(e => {
    if (e.ckey === 'publish_title_config') {
      e.cvalue = '1'
    }
  })
}

// 一键转发的视频选择方式修改
function selectModeChange(item) {
  data.useTime = '1'
  videoConfig.value.children.forEach(e => {
    if (e.ckey === 'video_use_times_limit') {
      e.cvalue = data.useTime
    } else if (e.ckey === 'video_use_times_limit_switch') {
      e.cvalue = '0'
    }
  })
  if (item === '2') {
    changeTitleValue()
  } else {
    videoConfig.value.children.forEach(e => {
      if (e.ckey === 'publish_title_config') {
        e.cvalue = '1'
      }
    })
  }
}

// input框修改视频使用次数限制
function updateUseTimeFun() {
  videoConfig.value.children.forEach(e => {
    if (e.ckey === 'video_use_times_limit') {
      e.cvalue = data.useTime
      _remainTemplateNum()
    }
  })
}
// 获取剩余使用次数
const _remainTemplateNum = debounce(() => {
  if (videoSelectMode.value !== '2') return
  if (!data.videoTemplateList.length) {
    data.videoUseResidueNum = 0
    return
  }
  data.videoUseResidueNumLoading = true
  const templateIds = data.videoTemplateList.map(item => item.id)
  remainTemplateNum({
    limitNum: data.useTime,
    creationTemplateIds: templateIds
  })
    .then(res => {
      data.videoUseResidueNum = res.data
    })
    .finally(() => {
      data.videoUseResidueNumLoading = false
    })
}, 300)
// 内容库改名叫素材库 兼容老数据
function changeName(names) {
  return names.replace('内容库', '素材库')
}
// --重复参与 begin
const repeatedInfo = ref({
  switchStatus: 0,
  typeRadio: 1, //
  everyday: 1, // 每日可重复参加几次
  maximum: 2, // 每日参加最多几次
  totalMaximum: 2 // 完成即可参与，最高参与次数
})
// 数据修改
// function repeatedInfoChange(data, key) {
//   if (key === 'switchStatus') {
//     videoConfig.value.children.forEach(e => {
//       if (e.ckey === 'multi_join_set') {
//         e.cvalue = data
//       }
//       if (e.ckey === 'multi_join_type') {
//         e.cvalue = repeatedInfo.value.typeRadio
//       }
//       if (e.ckey === 'join_interval') {
//         if (repeatedInfo.value.typeRadio === 1) {
//           e.cvalue = repeatedInfo.value.everyday
//         } else {
//           e.cvalue = ''
//         }
//       }
//       if (e.ckey === 'total_join_times') {
//         if (repeatedInfo.value.typeRadio === 1) {
//           e.cvalue = repeatedInfo.value.maximum
//         } else {
//           e.cvalue = repeatedInfo.value.totalMaximum
//         }
//       }
//     })
//   } else if (key === 'typeRadio') {
//     // 切换参与类型 要设置对应的参数
//     videoConfig.value.children.forEach(e => {
//       if (e.ckey === 'multi_join_type') {
//         e.cvalue = data
//       }
//       if (e.ckey === 'join_interval') {
//         if (data === 1) {
//           e.cvalue = repeatedInfo.value.everyday
//         } else {
//           e.cvalue = ''
//         }
//       }
//       if (e.ckey === 'total_join_times') {
//         if (data === 1) {
//           e.cvalue = repeatedInfo.value.maximum
//         } else {
//           e.cvalue = repeatedInfo.value.totalMaximum
//         }
//       }
//     })
//   } else if (key === 'everyday') {
//     // 重复参与开关开启 & 第一种参与类型[每X日一次，最多参与Y次] 才可以设置参与间隔
//     if (repeatedInfo.value.switchStatus === 1 && repeatedInfo.value.typeRadio === 1) {
//       videoConfig.value.children.forEach(e => {
//         if (e.ckey === 'join_interval') {
//           e.cvalue = data
//         }
//       })
//     }
//   } else if (key === 'maximum') {
//     // 重复参与开关开启 & 第一种参与类型[每X日一次，最多参与Y次] 才可以设置总参与次数
//     if (repeatedInfo.value.switchStatus === 1 && repeatedInfo.value.typeRadio === 1) {
//       videoConfig.value.children.forEach(e => {
//         if (e.ckey === 'total_join_times') {
//           e.cvalue = data
//         }
//       })
//     }
//   } else if (key === 'totalMaximum') {
//     // 重复参与开关开启 & 第二种规则[完成一次后，最多参与Y次] 才可以设置总参与次数
//     if (repeatedInfo.value.switchStatus === 1 && repeatedInfo.value.typeRadio === 2) {
//       videoConfig.value.children.forEach(e => {
//         if (e.ckey === 'total_join_times') {
//           e.cvalue = data
//         }
//       })
//     }
//   }
// }

// --重复参与 end、
const formData = reactive({
  titlePrompt: '',
  // keywordList: [],
  otherTitle: '', // 除小红书外的 抖音/视频号/快手标题
  xhsTitle: '',
  xhsDescription: ''
})
const atAndTopicAndPoi = computed(() => {
  const data = {
    topicList: [],
    dyPoiInfo: null,
    dyAtList: [],
    xhsAtList: []
  }
  videoConfig.value.children.forEach(config => {
    if (config.ckey === 'video_common_mount' && isNotEmpty(config.cvalue)) {
      const cvalue = JSON.parse(config.cvalue)
      data.topicList = cvalue?.topicList || []
    }
    // 设置抖音@的人
    if (config.ckey === 'video_@_person' && isNotEmpty(config.cvalue)) {
      data.dyAtList = JSON.parse(config.cvalue)
    }
    // 设置小红书@的人
    if (config.ckey === 'video_xhs_@_person' && isNotEmpty(config.cvalue)) {
      data.xhsAtList = JSON.parse(config.cvalue)
    }
  })

  return data
})
// 数据修改
watch(
  () => formData,
  () => {
    updateTask()
  },
  {
    deep: true
  }
)

const platformList = computed(() => {
  return data.publishPlatform.map(item => Number(item))
})
function updateTask() {
  videoConfig.value.children.forEach(config => {
    if (config.ckey === 'intelligent_ai_title') {
      if (formData.otherTitle || formData.xhsDescription || formData.xhsTitle) {
        config.cvalue = JSON.stringify({
          otherTitle: formData.otherTitle,
          xhsDescription: formData.xhsDescription,
          xhsTitle: formData.xhsTitle,
          titlePrompt: formData.titlePrompt // 前端 移动端会用到
        })
      } else {
        config.cvalue = ''
      }
    }
    if (config.ckey === 'video_common_mount') {
      let data = isNotEmpty(config.cvalue) ? JSON.parse(config.cvalue) : {}
      data = {
        ...data,
        ...formData,
        titlePrompt: formData.titlePrompt ? [formData.titlePrompt] : [] // 转为数组 后端要求加上
      }
      config.cvalue = JSON.stringify(data)
    }
  })
}
</script>

<style lang="scss" scoped>
.rule {
  margin-top: 20px;
  background: #f6f7f8;
  border-radius: 4px;
  padding: 16px 16px 24px 16px;

  .title {
    height: 20px;
    font-size: 15px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 600;
    color: rgba(48, 49, 51, 1);
    line-height: 20px;
    margin-bottom: 16px;
  }
  .content {
    p {
      padding-left: 12px;
      background: #e2e5f4;
      border-radius: 4px;
      margin-bottom: 12px;
      word-break: break-all;
      padding-right: 12px;
    }
  }
}
.sumvideo_btn {
  cursor: pointer;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  box-sizing: border-box;
  border: 1px dashed #d8d8d8;
  .sumvideo_btn_text {
    font-size: 14px;
    margin-top: 5px;
    color: #333;
  }
}
.sumvideo_template {
  .template_r_tips {
    margin-left: 20px;
    .num_tips {
      color: #364fcd;
    }
    .get_new {
      cursor: pointer;
      margin-left: 10px;
    }
    .go_det {
      cursor: pointer;
    }
  }
  .template_cover {
    position: relative;
    width: 120px;
    height: 120px;
    border-radius: 2px;
    background: linear-gradient(135deg, #eff2ff 0%, #dbe0ff 100%);
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    &:hover {
      .detail_btn,
      .del_btn {
        display: block;
      }
    }
    .detail_btn {
      display: none;
      cursor: pointer;
      position: absolute;
      bottom: 26px;
      left: 50%;
      transform: translateX(-50%);
      width: 85px;
      line-height: 24px;
      text-align: center;
      background: #364fcd;
      border-radius: 2px;
      color: #fff;
      font-size: 14px;
    }
    .del_btn {
      display: none;
      cursor: pointer;
      position: absolute;
      left: 50%;
      bottom: 0;
      height: 24px;
      text-align: center;
      transform: translateX(-50%);
    }
  }
  .template_name {
    width: 120px;
    padding: 0 2px;
    box-sizing: border-box;
    @include mult_line(1);
  }
}
.audit_wrapper {
  display: flex;
  align-items: center;
  .audit_text {
    cursor: pointer;
    display: flex;
    align-items: center;
    margin-left: 10px;
    color: #364fcd;
  }
}
.template_box {
  margin-top: 16px;
  background: #f6f7f8;
  border-radius: 4px;
  padding: 16px 0 0 16px;
  width: max-content;
  max-width: 614px;
  max-height: 550px;
  overflow-y: auto;
}
.one_template {
  width: 102px;
  margin: 0 16px 16px 0;
  .template_top {
    width: 102px;
    height: 136px;
    border-radius: 2px;
    position: relative;
    overflow: hidden;
    .template_cover {
      width: 102px;
      height: 136px;
      object-fit: cover;
      position: absolute;
      left: 0;
      top: 0;
      display: flex;
      box-shadow: 0 0 0 2px #f6f7f8;
      border-radius: 2px;
    }
    .template_mask {
      width: 102px;
      height: 136px;
      object-fit: cover;
      position: absolute;
      left: 0;
      top: 0;
      background: rgba(0, 0, 0, 0.4);
      opacity: 0;
    }
    .template_play {
      width: 36px;
      height: 36px;
      object-fit: cover;
      position: absolute;
      left: 33px;
      top: 50px;
      cursor: pointer;
      opacity: 0;
    }
    .template_del {
      width: 16px;
      height: 16px;
      object-fit: cover;
      position: absolute;
      bottom: 8px;
      right: 8px;
      cursor: pointer;
      opacity: 0;
    }
  }
  .template_bottom {
    margin-top: 8px;
    width: 100%;
    text-align: center;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    font-weight: 400;
    color: #303133;
    line-height: 20px;
    .bottom_text {
      font-size: 14px;
      font-weight: 400;
      color: #303133;
      line-height: 20px;
    }
  }
}
.one_template:hover {
  // .template_top {
  //   box-shadow: 0 0 0 2px #364fcd;
  // }
  // .bottom_text {
  //   color: #364fcd;
  // }background: red;
  .template_mask,
  .template_play,
  .template_del {
    opacity: 1;
  }
}
.chosen {
  // background: red;
  .template_top {
    box-shadow: 0 0 0 2px #364fcd;
  }
  .template_bottom,
  .bottom_text {
    color: #364fcd !important;
  }
}
.ghost {
}
.repeated_wrapper {
  display: block;
  height: 130px;
  :deep(.el-radio) {
    height: 40px;
  }
  .repeated_radio {
    color: #303133;
    margin: 6px 0;
    .repeated_radio_input_number {
      width: 120px;
      margin: 0 8px;
    }
  }
}
:deep(.video_set_box .el-form-item__content) {
  flex: auto !important;
}
.setting_main {
  .mount_content_text {
    margin-left: 10px;
    margin-right: 10px;
    display: inline-block;
  }
  .mount_content {
    display: inline-block;
  }
}
.flex_box {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}
.num_box {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  color: #606266;
  width: max-content;
  :deep(.circular) {
    width: 20px;
  }
}
:deep(.limit_switch_box .el-form-item__label) {
  padding-left: 40px;
  line-height: 1.3;
}
.tag_formItem {
  :deep(.el-checkbox__input.is-disabled + span.el-checkbox__label) {
    color: var(--el-checkbox-checked-text-color);
  }
  :deep(.el-checkbox__input.is-disabled.is-checked .el-checkbox__inner) {
    background-color: var(--el-checkbox-checked-bg-color);
    border-color: var(--el-checkbox-checked-input-border-color);
  }
}
:deep(.keyword_formItem) {
  .el-form-item__label {
    padding-right: 4px !important;
  }
  .keyword_label {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    .xm_tooltipOfRight::after {
      margin-left: 0;
      width: 16px;
      height: 16px;
    }
  }
  .el-form-item__content {
    flex: auto;
  }
  .one_result {
    width: 542px;
  }
}
:deep(.el-form-item__label) {
  padding-right: 20px;
}
</style>
