<template>
  <div class="matrix_wrap_warp">
    <div class="tab_box">
      <el-tabs v-model="chooseTab" @tab-click="changeTab">
        <el-tab-pane :name="tab.key" v-for="tab in tabList" :key="tab.key">
          <template #label>
            <span
              class="custom-tabs-label"
              :class="{ 'custom-tabs-label-no-padding': !tab.platform }"
            >
              <div
                v-if="tab.platform"
                :class="`xm_platformIcon_${tab.platform}`"
                style="left: 0"
              ></div>
              <span>{{ tab.label }}</span>
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div class="matrix_wrap">
      <div class="head_wrap">
        <xm_search
          :searchComponents="searchComponents"
          :useOwnReset="true"
          @getData="searchName"
          @reset="searchName"
          :btnDis="tableState.loading"
          ref="xmSearchRef"
        >
          <template #searchBtn>
            <exp_button :asyncFunc="exportFiles">导出</exp_button>
          </template>
        </xm_search>
      </div>
      <!-- table -->
      <div class="table_wrap">
        <div class="table_title">
          <el-tooltip class="item" effect="dark" placement="right">
            <template #content>
              <div class="tooltip_wrap">
                1. 矩阵号基础信息：每天0点、06点、12点、18点更新
                <br />
                2. 视频数据、直播数据、粉丝数据、账号指数与等级：每日02点前更新
              </div>
            </template>

            <p>
              <span>数据说明</span>

              <img src="@/assets/images/content_center/tip_line.png" alt="" />
            </p>
          </el-tooltip>

          <!-- 批量操作开关 -->
          <div class="btn_box">
            <!-- <el-button type="primary" @click="batchJoin">批量加入分组</el-button>
          <el-button type="primary" @click="toAuthorize">授权管理</el-button> -->
            <template v-if="switchVal">
              <el-button plain @click="allChooseFun">{{ isAll ? '取消全选' : '全选' }}</el-button>
              <el-button type="primary" :loading="joinLoading" @click="joinFun">加入分组</el-button>
              <!-- <el-button
                type="primary"
                :loading="recordLoading"
                v-if="showRcordingBtn"
                @click="recordFun"
              >
                录屏开关
              </el-button> -->
              <!--            <el-button-->
              <!--              type="primary"-->
              <!--              :loading="commentLoading"-->
              <!--              v-if="true"-->
              <!--              @click="commentFun(1)"-->
              <!--            >-->
              <!--              直播弹幕获取开关-->
              <!--            </el-button>-->
              <!--            <el-button-->
              <!--              type="primary"-->
              <!--              :loading="videoCommentLoading"-->
              <!--              v-if="true"-->
              <!--              @click="commentFun(2)"-->
              <!--            >-->
              <!--              视频评论获取开关-->
              <!--            </el-button>-->
              <!--            <el-button-->
              <!--              type="primary"-->
              <!--              :loading="imLoading"-->
              <!--              v-if="true"-->
              <!--              @click="commentFun(3)"-->
              <!--            >-->
              <!--              私信获取开关-->
              <!--            </el-button>-->
            </template>
            <!-- <div class="switch_box"> -->
            <el-switch
              style="margin: 0 12px 0 24px"
              v-model="switchVal"
              inline-prompt
              :width="45"
              active-text="开"
              inactive-text="关"
            ></el-switch>
            <span style="color: #909399">批量操作</span>
            <!-- </div> -->
          </div>
          <!-- <el-button type="primary" @click="bulkMark">批量标记</el-button> -->
        </div>
        <xm_table
          :showSelection="switchVal"
          class="pic_table"
          rowKey="openId"
          v-loading="tableState.loading"
          :data="tableState.listData"
          v-model:page="tableState.page"
          @sort-change="sortMoney"
          @getTableData="getList"
          @selection-change="handleSelectionChange"
          :checkSelectable="handleCheckSelectable"
          :select="chooseList"
          ref="matrixTable"
          :default-sort="{
            prop: brandViewMode === 1 ? 'sellAmount' : 'fansCount',
            order: 'descending'
          }"
        >
          <!-- @select="handleSelect"
        @select-all="handleSelectAll" -->
          <!-- <el-table-column props="enterpriseVerifyReason" min-width="22">
          <template #default="scope">
            <img
              class="certification_img"
              v-if="scope.row.enterpriseVerifyReason"
              :src="scope.row.enterpriseVerifyReason"
              alt=""
            />
          </template>
        </el-table-column> -->
          <!-- <el-table-column type="selection" prop="num" min-width="50"></el-table-column> -->
          <el-table-column label="矩阵号" prop="name" min-width="450">
            <template #default="scope">
              <div
                class="account_wrap"
                style="padding: 10px 0"
                @click="toDetails(scope.row.openId)"
              >
                <div class="avatar_wrap">
                  <liveAnimation
                    v-if="scope.row.roomStatus === 1"
                    style="z-index: 19"
                  ></liveAnimation>
                  <img
                    class="avatar_icon"
                    :src="scope.row.dyHeadUrl ? scope.row.dyHeadUrl : avatarImg"
                    alt=""
                  />
                  <table_column_private_account
                    style="z-index: 10"
                    v-if="scope.row.privacyAccountStatus === 1"
                  ></table_column_private_account>
                  <el-tooltip
                    effect="dark"
                    v-if="scope.row.dyAuth == 2 || scope.row.wxAuth == 2 || scope.row.xhsAuth == 2"
                    placement="top-start"
                  >
                    <template #content>
                      <div style="max-width: 300px">
                        <span v-if="scope.row.dyAuth == 2 && scope.row.platform == 1">
                          {{ scope.row.dyAuth == 2 ? '抖音授权失效' : '' }}
                        </span>
                        <span v-if="scope.row.wxAuth == 2 && scope.row.platform == 2">
                          {{ scope.row.wxAuth == 2 ? '视频号授权失效' : '' }}
                        </span>
                        <span v-if="scope.row.xhsAuth == 2 && scope.row.platform == 3">
                          {{ scope.row.xhsAuth == 2 ? '小红书授权失效' : '' }}
                        </span>
                        <span v-if="scope.row.dyAuth == 2 && scope.row.platform == 4">
                          {{ scope.row.dyAuth == 2 ? '快手授权失效' : '' }}
                        </span>
                      </div>
                    </template>
                    <img
                      class="expired_img"
                      src="@/assets/images/content_center/warning_icon.png"
                      alt=""
                    />
                  </el-tooltip>
                  <!-- 平台icon -->
                  <div :class="`xm_platformIcon_${scope.row.platform}`"></div>
                </div>
                <div class="account_info">
                  <div>
                    <!-- <el-tooltip effect="dark" v-if="scope.row.dyNickname" placement="top-start">
                    <template #content>
                      <div style="max-width: 300px">
                        {{ scope.row.dyNickname || '--' }}
                      </div>
                    </template>
                    <div class="title row_overflow" style="max-width: calc(100% - 60px)">
                      {{ scope.row.dyNickname || '--' }}
                    </div>
                  </el-tooltip>
                  <div v-else class="title row_overflow">--</div> -->
                    <span>{{ scope.row.dyNickname ? scope.row.dyNickname : '--' }}</span>
                    <!--                  <img-->
                    <!--                    class="brand_img"-->
                    <!--                    v-if="scope.row.accountType != 1"-->
                    <!--                    :src="brandIcon"-->
                    <!--                    alt=""-->
                    <!--                  />-->
                    <template v-if="scope.row.eaccountRole">
                      <el-tooltip effect="dark" placement="top">
                        <template #content>
                          <div style="max-width: 300px">
                            {{
                              scope.row.eaccountRole === 'EAccountM'
                                ? '普通企业号'
                                : scope.row.eaccountRole === 'EAccountS'
                                ? '认证企业号'
                                : '认证企业号'
                            }}
                          </div>
                        </template>
                        <img :src="getTypeImg(scope.row.eaccountRole)" alt="" />
                      </el-tooltip>
                    </template>
                    <!-- 分组名 -->

                    <div class="group_list">
                      <template v-for="(item, index) in scope.row.accountGroupList">
                        <template v-if="index < 3">
                          <div
                            v-if="DYEmployeeType.indexOf(item.groupValue) == -1"
                            class="new_group_name line-hidden1"
                            :key="index"
                          >
                            {{ item.groupName }}
                          </div>
                          <el-tooltip
                            v-else
                            class="box-item"
                            effect="dark"
                            placement="top"
                            :key="index + 'x'"
                          >
                            <!-- popper-class="tooltip-class" -->

                            <template #content>
                              <div style="max-width: 300px">
                                所属企业号：{{ scope.row.enterpriseOpenNickname || '--' }}
                              </div>
                            </template>
                            <div class="new_group_name line-hidden1">
                              {{ item.groupName }}
                            </div>
                          </el-tooltip>
                        </template>
                      </template>
                    </div>
                    <el-tooltip
                      class="box-item"
                      effect="dark"
                      placement="top"
                      v-if="scope.row.accountGroupList && scope.row.accountGroupList.length > 3"
                    >
                      <!-- popper-class="tooltip-class" -->

                      <template #content>
                        <div class="group_box">
                          <span
                            v-for="(item, index) in scope.row.accountGroupList"
                            :key="index"
                            class="new_group_name"
                          >
                            {{ item.groupName }}
                          </span>
                        </div>
                      </template>
                      <div style="margin-left: 8px">...</div>
                    </el-tooltip>
                  </div>
                  <!-- 各个平台显示对应的账号 -->
                  <p v-if="scope.row.platform != 1">
                    <span>
                      {{
                        `${PLATFORM.getCN(scope.row.platform)}${
                          scope.row.platform == 2 || scope.row.platform == 3 ? '' : '号'
                        }`
                      }}：{{ scope.row.dyDisplayId ? scope.row.dyDisplayId : '--' }}
                    </span>
                    <!-- 小红书增加专业号标识 -->
                    <span
                      class="xm_xhsZYH"
                      v-if="
                        scope.row.platform == 3 &&
                        scope.row.customerUserType &&
                        scope.row.customerUserType == 'BUSINESS'
                      "
                    ></span>
                  </p>
                  <p v-else>
                    <span>抖音号：{{ scope.row.dyDisplayId ? scope.row.dyDisplayId : '--' }}</span>
                    <el-popover
                      v-if="scope.row.dyUId"
                      placement="bottom"
                      popper-class="qrcode_popper"
                      width="154px"
                      trigger="hover"
                    >
                      <template #reference>
                        <img
                          class="qrcode_img"
                          style="cursor: pointer"
                          src="@/assets/images/content_center/qrcode.png"
                          alt=""
                        />
                      </template>
                      <div class="qrcode_box" v-if="scope.row.dyUId">
                        <qrcode-vue :value="scope.row.dyUId" :size="126" level="H" />
                        <div class="qr_mark">
                          <img
                            src="https://tagvv-1256030678.cos.ap-shanghai.myqcloud.com/img/202111061652346e85b3672b.png"
                            alt=""
                          />
                          抖音扫码查看
                        </div>
                      </div>
                      <div v-else class="qrcode_box">
                        <div class="qr_mark">暂未找到相关地址</div>
                      </div>
                    </el-popover>
                  </p>
                  <!--   加上部门             -->
                  <p>
                    <el-tooltip
                      effect="dark"
                      placement="right-start"
                      :content="scope.row.xuserDeptName"
                    >
                      <span>
                        部门：{{
                          scope.row.xuserDeptName ? scope.row.xuserDeptName.split('/').pop() : '--'
                        }}
                      </span>
                    </el-tooltip>
                  </p>
                  <!--                <table_column_department_info-->
                  <!--                    :departmentName="'部门名称'"-->
                  <!--                    connectStr="/"-->
                  <!--                    divisionStr=";"-->
                  <!--                    trigger="hover"-->
                  <!--                ></table_column_department_info>-->
                  <div class="pre_time" v-if="scope.row.latestVideoPublishTime">
                    上次发布视频时间：{{ scope.row.latestVideoPublishTime || '--' }}
                  </div>
                  <!-- 业务主体 -->
                  <table_column_business_entity :list="scope.row.businessNameList" />
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="运营者" prop="phone" min-width="170">
            <template #default="scope">
              <div v-if="scope.row.operatorId">
                <el-tooltip placement="top">
                  <template #content>
                    <p style="max-width: 300px">
                      运营的矩阵号：{{ scope.row.nikenameList || '--' }}
                    </p>
                  </template>
                  <div
                    class="user_wrap"
                    :class="scope.row.fsOpenId ? 'user_wrap_cursor' : ''"
                    @click="scope.row.fsOpenId ? toFschat(scope.row.fsOpenId) : ''"
                  >
                    <img v-if="scope.row.operatorHead" :src="scope.row.operatorHead" alt="" />
                    <default-photo v-else :name="scope.row.operatorName || '--'" />
                    <span>{{ scope.row.operatorName || '--' }}</span>
                    <img
                      v-if="scope.row.iconType === 2"
                      class="fs_icon"
                      src="@/assets/images/user/weChat.png"
                      alt=""
                    />
                    <img
                      v-if="scope.row.iconType === 1"
                      class="fs_icon"
                      src="@/assets/images/user/feishu.png"
                      alt=""
                    />
                    <img
                      v-if="scope.row.iconType === 3"
                      class="fs_icon"
                      src="@/assets/images/user/wx.png"
                      alt=""
                    />
                    <div
                      class="xm_depart"
                      v-if="scope.row.staffStatus && scope.row.staffStatus == 2"
                    ></div>
                  </div>
                </el-tooltip>
              </div>
              <div v-else>--</div>
            </template>
          </el-table-column>
          <!-- 只有索菲亚品牌才显示 -->
          <el-table-column
            label="员工ID"
            v-if="showEmployeeId"
            prop="thirdPartyStaffId"
            min-width="170"
          >
            <template #default="scope">
              {{ scope.row.thirdPartyStaffId || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="账号等级" min-width="180">
            <template #default="{ row }">
              <!--            <template v-if="row.platform === 1">-->
              <template v-if="row.exponentStr === '-' && row.gradeIdStr === '-'">--</template>
              <template v-else>
                {{ transLevelName(row.gradeId) }}&nbsp;&nbsp;指数：{{ numberFormat(row.exponent) }}
              </template>
              <!--            <div v-else>-</div>-->
            </template>
          </el-table-column>
          <el-table-column
            label="总粉丝"
            sortable="custom"
            column-key="fans"
            prop="fansCount"
            min-width="112"
          >
            <template #default="scope">{{ wanSliceFormat(scope.row.fansCount || 0) }}</template>
          </el-table-column>
          <el-table-column
            v-if="brandViewMode === 1"
            label="销售总额"
            sortable="custom"
            column-key="totalAmount"
            prop="totalSellAmount"
            min-width="128"
          >
            <template #default="scope">
              {{ '￥' + wanSliceFormat(scope.row.totalSellAmount || 0) }}
            </template>
          </el-table-column>
          <el-table-column
            v-if="brandViewMode === 1"
            label="直播销售额"
            sortable="custom"
            column-key="amount"
            prop="sellAmount"
            min-width="128"
          >
            <template #default="scope">
              {{ '￥' + wanSliceFormat(scope.row.sellAmount || 0) }}
            </template>
          </el-table-column>
          <el-table-column
            v-if="brandViewMode === 1"
            label="场均销售额"
            sortable="custom"
            column-key="avgAmount"
            prop="avgSellAmount"
            min-width="128"
          >
            <template #default="scope">
              {{ '￥' + wanSliceFormat(scope.row.avgSellAmount || 0) }}
            </template>
          </el-table-column>
          <el-table-column
            v-if="brandViewMode === 1"
            label="视频销售额"
            sortable="custom"
            column-key="videoAmount"
            prop="videoSellAmount"
            min-width="128"
          >
            <template #default="scope">
              {{ '￥' + wanSliceFormat(scope.row.videoSellAmount || 0) }}
            </template>
          </el-table-column>
          <el-table-column
            label="总视频数"
            sortable="custom"
            column-key="video"
            prop="videosCount"
            min-width="112"
          >
            <template #default="scope">{{ wanSliceFormat(scope.row.videosCount || 0) }}</template>
          </el-table-column>
          <el-table-column
            label="播放数"
            sortable="custom"
            column-key="play"
            prop="playCount"
            min-width="112"
          >
            <template #default="scope">{{ wanSliceFormat(scope.row.playCount || 0) }}</template>
          </el-table-column>
          <el-table-column
            label="点赞数"
            sortable="custom"
            column-key="digg"
            prop="diggCount"
            min-width="112"
          >
            <template #default="scope">{{ wanSliceFormat(scope.row.diggCount || 0) }}</template>
          </el-table-column>
          <el-table-column
            label="评论数"
            sortable="custom"
            column-key="comment"
            prop="commentCount"
            min-width="112"
          >
            <template #default="scope">{{ wanSliceFormat(scope.row.commentCount || 0) }}</template>
          </el-table-column>
          <el-table-column
            label="分享数"
            sortable="custom"
            column-key="share"
            prop="shareCount"
            min-width="112"
          >
            <template #default="scope">{{ wanSliceFormat(scope.row.shareCount || 0) }}</template>
          </el-table-column>
          <el-table-column
            label="总直播场次"
            sortable="custom"
            column-key="site"
            prop="roomSiteCount"
            min-width="128"
          >
            <template #default="scope">{{ wanSliceFormat(scope.row.roomSiteCount || 0) }}</template>
          </el-table-column>
          <el-table-column
            label="直播时长"
            sortable="custom"
            column-key="time"
            prop="liveTime"
            min-width="128"
          >
            <template #default="scope">
              {{ timeSecond(scope.row.liveTime / 1000 || 0, '', false) }}
            </template>
          </el-table-column>
          <el-table-column
            label="观看人次"
            sortable="custom"
            column-key="people"
            prop="livePeopleCount"
            min-width="112"
          >
            <template #default="scope">
              {{ wanSliceFormat(scope.row.livePeopleCount || 0) }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            fixed="right"
            width="260"
            align="center"
            header-align="center"
          >
            <template #header>
              <div class="column_header">
                <span>操作</span>
                <el-tooltip
                  popper-class="tooltip-class"
                  placement="top"
                  content="播放量处于更新状态下的小红书、快手矩阵号可以正常发布视频"
                  raw-content
                  :style="{ 'margin-left': '4px' }"
                >
                  <img
                    src="@/assets/images/operate/tip_line.png"
                    style="width: 12px; height: 12px; margin-left: 8px"
                  />
                </el-tooltip>
              </div>
            </template>
            <template #default="scope">
              <!--            <el-link-->
              <!--              v-if="scope.row.accountType == 1"-->
              <!--              type="primary"-->
              <!--              @click="confirmMark(scope.row)"-->
              <!--              style="margin-right: 20px"-->
              <!--            >-->
              <!--              标记品牌-->
              <!--            </el-link>-->
              <!--            <el-link-->
              <!--              v-else-->
              <!--              type="primary"-->
              <!--              style="margin-right: 20px"-->
              <!--              @click="cancleMark(scope.row)"-->
              <!--            >-->
              <!--              取消标记-->
              <!--            </el-link>-->
              <!-- :disabled="scope.row.platform !== 1" -->
              <el-link type="primary" style="margin-right: 20px" @click="joinGroupFun(scope.row)">
                分组
              </el-link>

              <el-link type="primary" @click="toDetails(scope.row.openId)">详情</el-link>
              <!-- 抖音或者视频号平台隐藏发布视频的入口 -->
              <template
                v-if="isPublishVideo && !(scope.row.platform == 1 || scope.row.platform == 2)"
              >
                <template v-if="scope.row.nativeIsDel === 1">
                  <el-tooltip effect="dark" placement="top">
                    <template #content>
                      <div style="max-width: 300px">
                        {{
                          scope.row.platform === 1
                            ? '抖音'
                            : scope.row.platform === 2
                            ? '视频号'
                            : scope.row.platform === 3
                            ? '小红书'
                            : scope.row.platform === 4
                            ? '快手'
                            : ''
                        }}授权失效
                      </div>
                    </template>
                    <el-link
                      type="primary"
                      :disabled="scope.row.nativeIsDel === 1"
                      style="margin-left: 20px"
                    >
                      发布视频
                    </el-link>
                  </el-tooltip>
                  <!-- <el-link
                  v-else
                  type="primary"
                  :disabled="scope.row.isDel === 1"
                  style="margin-left: 20px"
                >
                  发布视频
                </el-link> -->
                </template>
                <el-link
                  v-else
                  type="primary"
                  :disabled="scope.row.nativeIsDel === 1"
                  @click="toDetailOfVideo(scope.row.openId, scope.row.platform)"
                  style="margin-left: 20px"
                >
                  发布视频
                </el-link>
              </template>
            </template>
          </el-table-column>
        </xm_table>
      </div>
      <!-- <joinGroupDialog
      v-if="joinDialog.show"
      :joinDialog="joinDialog"
      @updateList="getList"
    ></joinGroupDialog> -->
      <!-- <import-file-dialog
      v-model:show="showBatchJoinDialog"
      title="批量加入分组"
      subTitle="批量将【手机号】对应成员所运营的【矩阵号主号】加入对应分组"
      uploadUrl="/api/cgp/web/xUserGroup/template/batch/add"
      :exportFile="exportFiles"
      @uploadSuccess="getList"
    ></import-file-dialog> -->
      <!-- 批量加入分组 -->
      <batchJoinGroup
        v-if="batchJoinDialog.show"
        :addDialog="batchJoinDialog"
        @updateList="getList"
      />
      <!-- 批量管理录屏开关 -->
      <batchRecord
        v-if="batchRecordDialog.show"
        :addDialog="batchRecordDialog"
        @updateList="getList"
        @errFun="recordErrFun"
      ></batchRecord>
      <!-- 批量管理弹幕开关 -->
      <batchOpComment
        v-if="batchCommentDialog.show"
        :opType="1"
        :addDialog="batchCommentDialog"
        @updateList="getList"
        @errFun="recordErrFun"
      ></batchOpComment>
      <batchOpComment
        :opType="2"
        v-if="batchVideoCommentDialog.show"
        :addDialog="batchVideoCommentDialog"
        @updateList="getList"
        @errFun="recordErrFun"
      ></batchOpComment>
      <batchOpComment
        :opType="3"
        v-if="batchImDialog.show"
        :addDialog="batchImDialog"
        @updateList="getList"
        @errFun="recordErrFun"
      ></batchOpComment>
      <!-- 单矩阵号分组管理 -->
      <oneJoinGroup
        v-if="oneJoinDialog.show"
        :addDialog="oneJoinDialog"
        @updateList="getList"
      ></oneJoinGroup>
      <!-- 操作失败的弹窗 -->

      <err_dialog v-if="actionDialog.show" :actionDialog="actionDialog"></err_dialog>
    </div>
  </div>
</template>

<script setup>
// tab列表
// 当前选中的列表
import { setBusinessChooseParam } from '@/utils/search.js'
import { PLATFORM } from '@/utils/dictionary/company.js'
import { DYEmployeeType, DYALLTypeList } from '@/utils/dictionary/content-center.js'

import oneJoinGroup from './components/one_joinGroup.vue'
import batchRecord from './components/batch_record.vue'
import batchOpComment from './components/batch_op_comment.vue'
import batchJoinGroup from './components/batch_joinGroup.vue'
import { exportGetUserListV2 } from '@/api/content_center/rank.js'
// import importFileDialog from '@/views/market/components/import_file_dialog.vue'
// import joinGroupDialog from '../components/join_group_dialog.vue'
import qrcodeVue from 'qrcode.vue'
import DefaultPhoto from '../../../system/components/default_photo/index.vue'
import liveAnimation from '../../components/live_animation.vue'
// import api, { getExportData } from '@/api/content_center/content_matrix.js'
import api from '@/api/content_center/content_matrix.js'

// 图片
import matrixTypep from '@/assets/images/content_center/matrix_typep.png'
import matrixTyper from '@/assets/images/content_center/matrix_typer.png'
import avatarImg from '@/assets/images/content_center/default_user.png'
// import brandIcon from '@/assets/images/content_center/brand_icon.png'
// 图片end
import { dateFormat, wanSliceFormat, throttle, numberFormat, isEmpty } from '@/utils/tools.js'
import { timeSecond } from '../components/js/setCharts.js'
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router'
import { getQuery, checkNumberRange } from '@/utils/get_query.js'
import { useStore } from 'vuex'
const tabList = ref([
  {
    label: '全部',
    key: 'all',
    platform: null
  },
  {
    label: '抖音',
    key: 'dy',
    platform: 1
  },
  {
    label: '小红书',
    key: 'xhs',
    platform: 3
  },
  {
    label: '快手',
    key: 'ks',
    platform: 4
  },
  {
    label: '视频号',
    key: 'wx',
    platform: 2
  }
])
const chooseTab = ref('all')
// import { exportFile } from '@/utils/exportFile'
const router = useRouter()
const message = inject('$message')
const route = useRoute()
const store = useStore()
const brandViewMode = computed(() => store.state.user.brandViewMode)
// const dyVersion = computed(() => store.state.user.dyVersion)
const showEmployeeId = computed(() => store.state.user.showEmployeeId)
// 是否有后台发布视频权限
const isPublishVideo = computed(() => {
  const systemModule = sessionStorage.getItem('systemModule')
  return systemModule.includes('publish_video')
})

// 矩阵号类型切换
function changeTab() {
  console.log('切换tab platform')
  searchName()
}

// 昵称搜索
// const dyNickName = ref('')
function clearSearchQuery() {
  tableState.page.index = 1
  tableState.loading = true
  // 查询和重置的时候，都把选中项清空掉
  isAll.value = false
  matrixTable.value?.$refs.table.clearSelection()
}
function searchName() {
  clearSearchQuery()
  getList()
}
const searchComponents1 = ref([
  {
    type: 'input',
    label: '矩阵号',
    val: '',
    placeholder: '请输入矩阵号昵称、抖音号',
    filed: 'dyNickName'
  },
  {
    type: 'select',
    label: '矩阵号分组',
    placeholder: '请选择矩阵号分组',
    filed: 'groupIds',
    multiple: true,
    filterable: true,
    'collapse-tags': true,
    val: null,
    selects: [],
    selectDefultName: ['id', 'groupName']
  },
  {
    type: 'chooseDept',
    label: '矩阵号部门',
    val: [],
    filed: 'area',
    multiple: true,
    isUsePermission: true
  },
  {
    type: 'input',
    label: '运营者姓名',
    val: '',
    placeholder: '请输入运营者姓名',
    filed: 'name'
  },
  {
    hiddenItem: !showEmployeeId.value,
    type: 'input',
    label: '员工ID',
    val: '',
    placeholder: '请输入员工ID',
    filed: 'thirdPartyStaffId'
  },
  {
    type: 'select',
    label: '账号等级',
    filed: 'gradeId',
    val: -1,
    defaultVal: -1,
    selects: [{ label: '全部', value: -1 }]
  },
  {
    type: 'numberRange',
    label: '账号指数',
    minVal: '',
    maxVal: '',
    isNumber: true,
    minFiled: 'exponentBegin',
    maxFiled: 'exponentEnd',
    placeholder: ['最低指数', '最高指数']
  },
  {
    type: 'select',
    label: '活跃状态',
    placeholder: '请选择活跃状态',
    val: -1,
    defaultVal: -1,
    filed: 'activeStatus',
    selects: [
      {
        label: '全部',
        value: -1
      },
      {
        label: '活跃账号',
        value: 1
      },
      {
        label: '沉默账号',
        value: 2
      },
      {
        label: '潜客活跃',
        value: 3
      }
    ]
  },
  {
    type: 'select',
    label: '授权状态',
    placeholder: '请选择授权状态',
    val: -1,
    defaultVal: -1,
    filed: 'authStatus',
    selects: [
      {
        label: '全部',
        value: -1
      },
      {
        label: '授权有效',
        value: 0
      },
      {
        label: '授权无效',
        value: 1
      }
    ]
  }
])
// 因为有涉及到KeepAlive，所以就先复制一份，后续可用
const searchComponents = ref(searchComponents1.value)
// 因为有涉及到KeepAlive，所以就先复制一份，后续可用
const initSearch = function () {
  const list = setBusinessChooseParam()
  searchComponents.value = searchComponents.value.concat(list)
}
initSearch()
const level = ref(null)
function getLevel(type) {
  let brandInfo = localStorage.getItem('brandInfo')
  brandInfo = brandInfo ? JSON.parse(brandInfo) : {}
  api.getGradeRuleByBrandId({ realityEffect: 1, brandId: brandInfo.brandId }).then(res => {
    level.value = res.data.accountGrade
    searchComponents.value.forEach(item => {
      if (item.filed === 'gradeId') {
        const list = res.data.accountGrade.map(e => {
          return {
            label: e.gradeName,
            value: e.gradeId
          }
        })
        list.unshift({
          label: '全部',
          value: -1
        })
        item.selects = list
        if (route.query.gradeId && type === 'setQuery') {
          item.val = route.query.gradeId
          getList()
        }
      }
    })
  })
}
function transLevelName(levelId) {
  if (!level) return '-'
  for (const i in level.value) {
    const _item = level.value[i]
    if (_item.gradeId === levelId) {
      return _item.gradeName
    }
  }
}
// getLevel()

// 选择列表
// const formValue = reactive({
//   accountType: ''
// })
// const formSelect = reactive({
//   accountType: [
//     { label: '品牌', value: 1 },
//     { label: '会员', value: 2 }
//   ],
//   amountType: [
//     { label: '1w以下', value: 1 },
//     { label: '1w-10w', value: 2 },
//     { label: '10w-100w', value: 3 },
//     { label: '100w-1000w', value: 4 },
//     { label: '1000w以上', value: 5 }
//   ],
//   area: [
//     { label: '华北', value: 1 },
//     { label: '华东', value: 2 },
//     { label: '华南', value: 3 },
//     { label: '欧洲', value: 4 },
//     { label: '东南亚', value: 5 }
//   ],
//   fansType: [
//     { label: '10w以下', value: 1 },
//     { label: '10w-100w', value: 2 },
//     { label: '100w-300w', value: 3 },
//     { label: '300w-500w', value: 4 },
//     { label: '500w-1000w', value: 5 },
//     { label: '1000w以上', value: 6 }
//   ],
//   livePeopleType: [
//     { label: '100以下', value: 1 },
//     { label: '100-1000', value: 2 },
//     { label: '1000-1w', value: 3 },
//     { label: '1w以上', value: 4 }
//   ],
//   platform: [
//     { label: '抖音', value: 1 },
//     { label: '快手', value: 2 }
//   ]
// })
// 时间展示
const dataTime = ref('')
dataTime.value = dateFormat(new Date()) + ' 00:30:00'
// table列表
const tableState = reactive({
  loading: false,
  listData: [],
  page: {
    index: 1,
    size: 10,
    total: 10
  },
  orderItem: brandViewMode.value === 1 ? 'amount' : 'fans',
  orderBy: 2
})
// 获取对应类型的图片
function getTypeImg(type) {
  let img = ''
  switch (type) {
    case 'EAccountM':
      img = matrixTypep
      break
    case 'EAccountS':
      img = matrixTyper
      break
    case 'EAccountK':
      img = matrixTyper
      break
  }
  return img
}
function getData() {
  const searchData = getQuery(searchComponents.value)
  searchData.area = searchData.area ? searchData.area.join(',') : ''
  searchData.pageSize = tableState.page.size
  searchData.pageNo = tableState.page.index
  searchData.orderBy = tableState.orderBy
  searchData.orderItem = tableState.orderItem
  searchData.platform = (tabList.value.find(x => x.key === chooseTab.value) || {}).platform || null
  // console.log('getData', searchData)
  return searchData
}
// 获取列表
function getList() {
  const stu = checkNumberRange(searchComponents.value)
  if (stu) {
    return
  }
  tableState.loading = true
  api
    .getMatrixList(getData())
    .then(res => {
      if (res.code === 0) {
        console.log(res, '数据列表')
        const list = res.data.records || []
        // 将默认分组放在前面
        list.forEach(x => {
          if (x.accountGroupList && x.accountGroupList.length > 0) {
            x.accountGroupList.sort(a => {
              if (DYALLTypeList.indexOf(a.groupValue) > -1) {
                return -1
              } else {
                return 11
              }
            })
          }
        })
        tableState.listData = list
        tableState.page.total = res.data.total
        // 如果选择了全选，那每次切换页面，都要全选
        nextTick(() => {
          if (isAll.value) {
            // matrixTable.value?.$refs.table.toggleAllSelection()

            setCheck(true)
          }
        })
      }
    })
    .finally(() => {
      tableState.loading = false
    })
}
// 列表排序
function sortMoney(e) {
  // console.log(e.column.columnKey)
  if (e.order === 'ascending') {
    tableState.orderItem = e.column.columnKey
    tableState.orderBy = 1
  } else if (e.order === 'descending') {
    tableState.orderItem = e.column.columnKey
    tableState.orderBy = 2
  } else {
    tableState.orderBy = null
    tableState.orderItem = ''
  }
  getList()
}
// 批量标记
// const openIdList = reactive([])
// function selctList(selection) {
//   openIdList.value = []
//   selection.forEach(item => {
//     openIdList.push(item.openId)
//   })
// }
const matrixTable = ref()
// function bulkMark() {
//   const data = {
//     openIdList: openIdList,
//     accountType: 2
//   }
//   api.editMatrixList(data).then(() => {
//     matrixTable.value.$refs.table.clearSelection()
//     openIdList.value = []
//     getList()
//   })
// }
// 取消标记
// function cancleMark(item) {
//   // if (item.platform === 1) {
//   const data = {
//     openIdList: [item.openId],
//     accountType: 1
//   }
//   api.editMatrixList(data).then(() => {
//     item.accountType = 1
//   })
// }
// if (item.platform === 2) {
//   // 视频号取消标记
//   console.log('视频号取消标记')
// }
// if (item.platform === 3) {
//   // 小红书取消标记
//   console.log('小红书取消标记')
// }
// }
// 标记品牌
// function confirmMark(item) {
//   // 不区分抖音视频号，小红书，入参都是openid
//   // if (item.platform === 1) {
//   // 抖音标记品牌
//   const data = {
//     openIdList: [item.openId],
//     accountType: 2
//   }
//   api.editMatrixList(data).then(() => {
//     item.accountType = 2
//   })
// }
// if (item.platform === 2) {
//   // 视频号标记品牌
//   console.log('视频号标记品牌')
// }
// if (item.platform === 3) {
//   // 小红书标记品牌
//   console.log('小红书标记品牌')
// }
// }
// 授权按钮
// 是否在飞书客户端
// const isFlyBook = ref(true)
// const isWeChat = ref(true)
// isFlyBook.value = localStorage.getItem('isFlyBook') === '1'
// isWeChat.value = localStorage.getItem('isWeChat') === '1'
// const isBrowser = localStorage.getItem('is_browser') === '1'
// 授权管理
// function toAuthorize() {
//   if (isBrowser) {
//     router.push({ path: '/system_manage/matrixNumber_auth', query: { type: 'account' } })
//   } else {
//     window.open(`${location.origin}/system_manage/matrixNumber_auth?type=account`)
//   }
//   // router.push({
//   //   path: '/system_manage/matrixNumber_auth'
//   // })
// }
// 跳转详情-发布视频
const toDetailOfVideo = throttle((item, platform) => {
  if (platform === 1) {
    message.warning('平台接口调整，功能不可使用')
    return
  }
  router.push({
    path: '/content_center/content_matrix/details',
    query: { openId: item, type: 'publishVideo' }
  })
}, 700)
// 跳转详情
const toDetails = throttle(function (item) {
  const link = `/content_center/content_matrix/details?openId=${item}`
  router.push(link)
}, 500)
// 跳转飞书聊天
function toFschat(openId) {
  window.open(`https://applink.feishu.cn/client/chat/open?openId=${openId}`)
}
// 分组
function getNewGroupList() {
  api.getNewGroupList({}).then(res => {
    if (res.code === 0) {
      searchComponents.value[1].selects = res.data || []
    }
  })
}
// // 加入分组的弹窗
// const joinDialog = reactive({
//   show: false,
//   info: {}
// })
// const joinGroupFun = throttle(e => {
//   joinDialog.show = true
//   joinDialog.info = e
// })
// 批量加入分组
// const showBatchJoinDialog = ref(false)
// const batchJoin = throttle(() => {
//   showBatchJoinDialog.value = true
// })
//
// 导出文件
// const exportFiles = throttle(() => {
//   exportFile(getExportData, {}, '批量加入分组的模板', 'xlsx')
// }, 500)
onMounted(() => {
  tableState.loading = true
  if (route.query.activeStatus) {
    const index = searchComponents.value.findIndex(x => x.filed === 'activeStatus')
    if (index > -1) {
      searchComponents.value[index].val = parseInt(route.query.activeStatus)
    }
  }

  // if (!route.query.gradeId) {
  //   getList()
  // }
})
// 如果上一页是矩阵号概览或者是刷新进入的要把账号等级填上去
function setQueryGrade() {
  const fromPath = store.state.page.fromPath
  if (
    (fromPath === '/' || fromPath === '/content_center/account_overview') &&
    route.query.gradeId
  ) {
    getLevel('setQuery')
  } else {
    getLevel()
    getList()
  }
}
const xmSearchRef = ref(null)
const menuOfKeepAlive = inject('$menuOfKeepAlive')
onActivated(() => {
  if (menuOfKeepAlive('judge')) {
    switchVal.value = false
    isAll.value = false
    chooseTab.value = 'all'
    xmSearchRef.value?.clearQuery()
    xmSearchRef.value?.resetDeptMoreLine()
    clearSearchQuery()
    setQueryGrade()
    menuOfKeepAlive('reset')
  } else {
    setQueryGrade()
  }
  getNewGroupList()
  // 为保证业务主体是最新的，
  const businessChooseObj = {}
  searchComponents.value.forEach(item => {
    if (!item.hiddenItem) {
      if (item.type === 'chooseBusiness' || item.type === 'chooseBusinessGroup') {
        const info = {
          ids: item.ids || [],
          isCheckAll: item.isCheckAll || false
        }
        businessChooseObj[item.principalType] = info
      }
    }
  })
  if (isEmpty(businessChooseObj)) {
    const list = setBusinessChooseParam(businessChooseObj)
    searchComponents.value = searchComponents1.value.concat(list)
  }
})
// 页面里开的时候 清空分组组件
onBeforeRouteLeave((to, from) => {
  if (to.path !== '/content_center/content_matrix/details') {
    searchComponents.value = []
    nextTick(() => {
      searchComponents.value = searchComponents1.value
    })
  }
})
// 显示矩阵号设置
// const showRcordingBtn = computed(() => {
//   const systemModule = sessionStorage.getItem('systemModule')
//   return systemModule.includes('live_recording_screen')
// })
// 选中用户
const chooseList = ref([])
// 当选择项发生变化时
function handleSelectionChange(e) {
  chooseList.value = e
}

function handleCheckSelectable(row) {
  if (isAll.value) {
    return false
  } else {
    return row.platform === 1
  }
  // return !isAll.value
}
// 批量开关
const switchVal = ref(false)
// 全选的状态
const isAll = ref(false)
// 设置表格全选
function setCheck(check) {
  tableState.listData.forEach(y => {
    if (y.platform === 1) {
      matrixTable.value?.$refs.table.toggleRowSelection(y, check)
    }
  })
}
// 点击全选的按钮
const allChooseFun = throttle(() => {
  if (isAll.value) {
    matrixTable.value.$refs.table.clearSelection()
  } else {
    setCheck(true)
  }
  nextTick(() => {
    isAll.value = !isAll.value
  })
}, 500)
// 加入分组的弹窗
const batchJoinDialog = reactive({
  show: false,
  chooseList: null,
  isAll: false, // 是否全选
  chooseLength: null // 选中的个数
})

// 点击加入分组的按钮
const joinLoading = ref(false)
const joinFun = throttle(() => {
  console.log('点击了加入分组')
  joinLoading.value = true
  if (chooseList.value && chooseList.value.length > 0) {
    if (!isAll.value) {
      const chooseList1 = []
      chooseList.value.forEach(x => {
        if (x.platform === 1) {
          chooseList1.push(x.openId)
        }
      })
      batchJoinDialog.chooseList = chooseList1
      batchJoinDialog.isAll = isAll.value
      batchJoinDialog.chooseLength = chooseList1.length
      batchJoinDialog.form = {}
      batchJoinDialog.show = true

      joinLoading.value = false
      return
    }
    const data = getData()
    data.pageSize = 1
    data.platform = 1
    api
      .getMatrixList(data)
      .then(res => {
        if (res.code === 0) {
          const chooseList1 = chooseList.value.map(x => x.openId)
          batchJoinDialog.chooseList = chooseList1
          batchJoinDialog.isAll = isAll.value
          batchJoinDialog.chooseLength = res.data.total
          batchJoinDialog.form = getData()
          batchJoinDialog.show = true
        }
        joinLoading.value = false
      })
      .catch(() => {
        joinLoading.value = false
      })
  } else {
    joinLoading.value = false
    message.warning('请先选择矩阵号')
  }
}, 500)
// 批量设置录屏的弹窗
const batchRecordDialog = reactive({
  show: false,
  chooseList: [],
  isAll: false, // 是否全选
  chooseLength: null // 选中的个数
})
// 批量设置弹幕的弹窗
const batchCommentDialog = reactive({
  show: false,
  chooseList: [],
  isAll: false, // 是否全选
  chooseLength: null // 选中的个数
})
// 批量设置视频的弹窗
const batchVideoCommentDialog = reactive({
  show: false,
  chooseList: [],
  isAll: false, // 是否全选
  chooseLength: null // 选中的个数
})
// 批量设置私信的弹窗
const batchImDialog = reactive({
  show: false,
  chooseList: [],
  isAll: false, // 是否全选
  chooseLength: null // 选中的个数
})
// 点击录屏开关的按钮 录屏只针对抖音号有效，所以要筛选抖音号
// const recordLoading = ref(false)
// const commentLoading = ref(false)
// const videoCommentLoading = ref(false)
// const imLoading = ref(false)
// const recordFun = throttle(() => {
//   message.warning('平台接口调整，功能不可使用')

// recordLoading.value = true
// console.log('点击了录屏开关', isAll.value)
// if (chooseList.value && chooseList.value.length > 0) {
//   if (!isAll.value) {
//     const chooseList1 = []
//     chooseList.value.forEach(x => {
//       if (x.platform === 1) {
//         chooseList1.push(x.openId)
//       }
//     })
//     batchRecordDialog.chooseList = chooseList1
//     batchRecordDialog.isAll = isAll.value
//     batchRecordDialog.chooseLength = chooseList1.length
//     batchRecordDialog.form = {}
//     batchRecordDialog.show = true

//     recordLoading.value = false
//     return
//   }
//   const data = getData()
//   data.pageSize = 1
//   data.platform = 1
//   api
//     .getMatrixList(data)
//     .then(res => {
//       if (res.code === 0) {
//         const chooseList1 = chooseList.value.map(x => x.openId)
//         batchRecordDialog.chooseList = chooseList1
//         batchRecordDialog.isAll = isAll.value
//         batchRecordDialog.chooseLength = res.data.total
//         batchRecordDialog.form = getData()
//         batchRecordDialog.show = true
//       }
//       recordLoading.value = false
//     })
//     .catch(() => {
//       recordLoading.value = false
//     })
// } else {
//   recordLoading.value = false
//   message.warning('请先选择矩阵号')
// }
// }, 500)
// const commentFun = throttle((type) => {
//   if(type===1){
//     commentLoading.value = true
//   }
//   if(type===2){
//     videoCommentLoading.value = true
//   }
//   if(type===3){
//     imLoading.value = true
//   }
//
//   console.log('点击了弹幕开关', isAll.value)
//   if (chooseList.value && chooseList.value.length > 0) {
//     if (!isAll.value) {
//       const chooseList1 = []
//       chooseList.value.forEach(x => {
//         if (x.platform === 1) {
//           chooseList1.push(x.openId)
//         }
//       })
//       if(type===1){
//         batchCommentDialog.chooseList = chooseList1
//         batchCommentDialog.isAll = isAll.value
//         batchCommentDialog.chooseLength = chooseList1.length
//         batchCommentDialog.show = true
//         commentLoading.value = false
//       }
//       if(type===2){
//         batchVideoCommentDialog.chooseList = chooseList1
//         batchVideoCommentDialog.isAll = isAll.value
//         batchVideoCommentDialog.chooseLength = chooseList1.length
//         batchVideoCommentDialog.show = true
//         videoCommentLoading.value = false
//       }
//       if(type===3){
//         batchImDialog.chooseList = chooseList1
//         batchImDialog.isAll = isAll.value
//         batchImDialog.chooseLength = chooseList1.length
//         batchImDialog.show = true
//         imLoading.value = false
//       }
//
//       return
//     }
//     const data = getData()
//     data.pageSize = 1
//     data.platform = 1
//     api
//       .getMatrixList(data)
//       .then(res => {
//         if(type===1){
//           if (res.code === 0) {
//             const chooseList1 = chooseList.value.map(x => x.openId)
//             batchCommentDialog.chooseList = chooseList1
//             batchCommentDialog.isAll = isAll.value
//             batchCommentDialog.chooseLength = res.data.total
//             batchCommentDialog.show = true
//           }
//           commentLoading.value = false
//         }
//         if(type===2){
//           if (res.code === 0) {
//             const chooseList1 = chooseList.value.map(x => x.openId)
//             batchVideoCommentDialog.chooseList = chooseList1
//             batchVideoCommentDialog.isAll = isAll.value
//             batchVideoCommentDialog.chooseLength = res.data.total
//             batchVideoCommentDialog.show = true
//           }
//           videoCommentLoading.value = false
//         }
//         if(type===3){
//           if (res.code === 0) {
//             const chooseList1 = chooseList.value.map(x => x.openId)
//             batchImDialog.chooseList = chooseList1
//             batchImDialog.isAll = isAll.value
//             batchImDialog.chooseLength = res.data.total
//             batchImDialog.show = true
//           }
//           imLoading.value = false
//         }
//
//       })
//       .catch(() => {
//         debugger
//         if(type===1){
//           commentLoading.value = false
//         }
//         if(type===2){
//           videoCommentLoading.value = false
//         }
//         if(type===3){
//           imLoading.value = false
//         }
//       })
//   } else {
//     if(type===1){
//       commentLoading.value = false
//     }
//     if(type===2){
//       videoCommentLoading.value = false
//     }
//     if(type===3){
//       imLoading.value = false
//     }
//
//     message.warning('请先选择矩阵号')
//   }
// }, 500)
// 单个矩阵号设置分组的弹窗
const oneJoinDialog = reactive({
  show: false,
  info: {}
})
const joinGroupFun = throttle(e => {
  console.log('加入分组row-->', e)
  oneJoinDialog.info = e
  oneJoinDialog.show = true
})
// 操作失败的弹窗
const actionDialog = reactive({
  show: false,
  info: {}
})
// 录屏失败的操作
function recordErrFun(info) {
  actionDialog.info = info
  actionDialog.show = true
}
const track = inject('$tracking')
// 下载中心的导出
function exportFiles() {
  return exportGetUserListV2(getData()).then(() => {
    track.clickBtn(204)
  })
}
</script>
<style lang="scss" scoped>
.matrix_wrap_warp {
  //min-width: 1500px;
  .tab_box {
    background-color: #ffffff;
    height: 52px;
    border-radius: 4px;
    padding: 18px 24px 0;

    //margin-bottom
    :deep(.el-tabs__nav-wrap) {
      &::after {
        background-color: #ffffff;
      }

      .el-tabs__item {
        color: #909399;
        font-weight: 400;
        font-family: PingFangSC-Regular, PingFang SC;
      }

      .is-active {
        font-weight: 500;
        color: #303133;
      }
      .custom-tabs-label {
        display: inline-block;
        position: relative;
        padding-left: 24px;
      }
      .custom-tabs-label-no-padding {
        padding-left: 0;
      }
    }
  }
}
</style>
<style lang="scss" scoped>
@import './index.scss';
@import '../../components/css/qrcode.scss';
.matrix_wrap {
  margin-top: 16px;
}
:deep(.el-link.el-link--primary.is-disabled) {
  color: #bfc4cd;
}
.btn_box {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
}
</style>
