<template>
  <div class="content_page live_center">
    <template v-if="brandViewMode === 1">
      <el-tabs class="outtab_box" v-model="chooseHeaderTab" @tab-click="resetTab">
        <el-tab-pane label="直播带货榜" name="LiveTapeList">
          <template v-if="chooseHeaderTab === 'LiveTapeList'">
            <!-- 筛选条件 -->
            <xm_search>
              <div
                class="top"
                style="display: flex; align-items: center; width: 100%; margin-bottom: 30px"
              >
                <el-radio-group v-model="timePicker" border @change="changeTimeType">
                  <el-radio-button :label="1">日</el-radio-button>
                  <el-radio-button :label="2">周</el-radio-button>
                  <el-radio-button :label="3">月</el-radio-button>
                </el-radio-group>
                <el-date-picker
                  style="margin-left: 40px"
                  :clearable="false"
                  :picker-options="{ firstDayOfWeek: 1 }"
                  :format="timeselect.format"
                  v-model="research.time"
                  :type="timeselect.type"
                  :value-format="timeselect.valueformat"
                  placeholder="请选择时间"
                  :disabled-date="
                    time => {
                      return time.getTime() > Date.now() - 24 * 60 * 60 * 1000
                    }
                  "
                ></el-date-picker>
                <el-tooltip class="item" effect="dark" placement="top">
                  <template #content>
                    <div class="tooltip_wrap">
                      每日02:00左右更新前一日直播带货数据排行
                      <br />
                      1.
                      销售额，销售量为时间筛选维度产生的直播订单数据，即买家下单时间在筛选时间内的订单，包含以往买家在历史直播间加入直播间的订单数据；
                      <br />
                      2. 销售额（整场）、销售量（整场）是该场直播间整场的销售额、销售量；
                    </div>
                  </template>
                  <div class="tip_tip">
                    <p style="margin-left: 32px; margin-right: 4px">数据说明</p>
                    <img
                      src="https://tagvv-1256030678.file.myqcloud.com/20230609v2t8m.png"
                      style="width: 14px; height: 14px"
                      alt
                    />
                  </div>
                </el-tooltip>
              </div>
              <!-- 组织架构 -->
              <div class="search_item">
                <label class="item_label">矩阵号部门</label>
                <div class="item_content">
                  <!-- <el-cascader
                  v-model="research.department"
                  :options="options"
                  clearable
                  collapse-tags
                  placeholder="请选择矩阵号部门"
                  :show-all-levels="false"
                  :props="prop"
                ></el-cascader> -->
                  <choose_dept_search
                    ref="chooseDeptSearchRef"
                    @updateDeptIds="onChangeDepartment"
                    :multiple="true"
                    :isUsePermission="true"
                    searchLabel="矩阵号部门"
                  />
                </div>
              </div>
              <!-- 矩阵号昵称 -->
              <div class="search_item">
                <label class="item_label">矩阵号昵称</label>
                <div class="item_content">
                  <el-input
                    v-model="research.xuserNickname"
                    clearable
                    placeholder="请输入矩阵号昵称"
                  ></el-input>
                </div>
              </div>
              <!-- 分组 -->
              <div class="search_item">
                <label class="item_label">矩阵号分组</label>
                <div class="item_content">
                  <el-select
                    v-model="research.groupId"
                    placeholder="请选择矩阵号分组"
                    style="width: 100%"
                    clearable
                    multiple
                    filterable
                    collapse-tags
                  >
                    <el-option
                      v-for="item in userGroupOptions"
                      :label="item.groupName"
                      :value="item.id"
                      :key="item.id"
                    />
                  </el-select>
                </div>
              </div>

              <!-- 查询重置 -->
              <div class="search_item">
                <el-button type="primary" @click="searchList()">查询</el-button>
                <el-button @click="reset">重置</el-button>
              </div>
            </xm_search>
            <!-- 列表 -->
            <div class="tab_box">
              <div class="data_list">
                <div class="data_item" v-for="(item, index) of Goodslist" :key="index">
                  <div class="data_name">{{ item.name }}：</div>
                  <div class="data_val">{{ item.count || 0 }}</div>
                </div>
              </div>
              <el-tabs v-model="chooseTab" @tab-click="searchList">
                <el-tab-pane
                  v-for="(tab, i) in tabList"
                  :key="i"
                  :label="tab.label"
                  :name="tab.name"
                >
                  <template #label>
                    <div class="tab_label">
                      {{ tab.label }}
                      <img
                        v-if="chooseTab == tab.name"
                        src="@/assets/images/content_center/tab_sort.png"
                        alt
                      />
                    </div>
                  </template>
                  <xm_table
                    class="pic_table"
                    tableType="live"
                    v-loading="tableForm.loading"
                    :data="chooseTab == tab.name ? tableForm.listData : []"
                    v-model:page="tableForm.page"
                    @getTableData="queryList"
                  >
                    <el-table-column width="100" label="排名" type="index">
                      <template #default="scope">
                        {{ (tableForm.page.index - 1) * tableForm.page.size + scope.$index + 1 }}
                      </template>
                    </el-table-column>
                    <el-table-column min-width="240" label="直播间">
                      <template #default="scope">
                        <div
                          class="live_box"
                          @click="toDetail(scope.row.dyRoomId, scope.row.dyOpenId)"
                        >
                          <div class="live_img_box">
                            <el-image
                              v-if="scope.row.cover"
                              :src="scope.row.cover"
                              class="live_img"
                            >
                              <template #error>
                                <div class="live_img errImg_box"></div>
                              </template>
                            </el-image>
                            <img
                              class="live_img"
                              v-else
                              src="@/assets/images/content_center/default_cover.png"
                              alt
                            />
                            <liveAnimation v-if="scope.row.isLiving == true"></liveAnimation>
                          </div>

                          <div class="live_content">
                            <div class="content1">
                              <div class="content_text row_overflow">
                                {{ scope.row.roomTitle || '--' }}
                              </div>
                            </div>
                            <div class="content2">
                              时长：{{
                                scope.row.liveDurationTime != null
                                  ? secondToDate(
                                      (scope.row.liveDurationTime || 0) / 1000,
                                      '分钟',
                                      true,
                                      false,
                                      true
                                    )
                                  : '--'
                              }}
                            </div>
                            <template v-if="scope.row.isLiving == true">
                              <div class="content3">
                                {{ dayjs(scope.row.liveStartTime).format('MM-DD HH:mm') || '--' }}
                              </div>
                            </template>
                            <template v-else>
                              <div class="content3">
                                {{ dayjs(scope.row.liveStartTime).format('MM-DD HH:mm') || '--' }} -
                                {{ dayjs(scope.row.liveEndTime).format('MM-DD HH:mm') || '--' }}
                              </div>
                            </template>
                          </div>
                        </div>
                      </template>
                    </el-table-column>
                    <el-table-column min-width="200" label="矩阵号">
                      <template #default="scope">
                        <div class="fs_user_box">
                          <div
                            :class="
                              scope.row.operator && scope.row.operator.fsOpenId
                                ? 'fs_content'
                                : 'fs_content2'
                            "
                            @click="toUserDetail(scope.row.dyOpenId, scope.row)"
                          >
                            <div
                              class="user_box"
                              :style="
                                scope.row.xuserIsDel && scope.row.xuserIsDel == 1
                                  ? 'cursor: default'
                                  : ''
                              "
                            >
                              <img
                                v-if="scope.row.xuserHeadImg"
                                :src="scope.row.xuserHeadImg"
                                class="user_head"
                                alt
                              />
                              <img
                                v-else
                                src="@/assets/images/content_center/default_user.png"
                                class="user_head"
                                alt
                              />
                              <div class="user_content">
                                <div class="content1">
                                  <div class="content_text">
                                    {{ scope.row.nickname || '--' }}
                                    <template
                                      v-if="
                                        scope.row.dyAccountRole &&
                                        matrixTypeICON.getCN(scope.row.dyAccountRole)
                                      "
                                    >
                                      <el-tooltip effect="dark" placement="top">
                                        <template #content>
                                          <div style="max-width: 300px">
                                            {{ matrixTypeICON.getCN(scope.row.dyAccountRole).name }}
                                          </div>
                                        </template>
                                        <img
                                          :src="matrixTypeICON.getCN(scope.row.dyAccountRole).img"
                                          alt=""
                                        />
                                      </el-tooltip>
                                    </template>
                                    <!-- 矩阵号被删除 -->
                                    <div
                                      class="xm_delClass"
                                      v-if="scope.row.xuserIsDel && scope.row.xuserIsDel == 1"
                                    ></div>
                                  </div>
                                </div>
                                <table_column_department_info
                                  className="blue_department_info"
                                  :departmentName="scope.row.xuserDeptName"
                                  connectStr="/"
                                  divisionStr=";"
                                  trigger="hover"
                                  tipPlacement="right"
                                ></table_column_department_info>
                              </div>
                            </div>
                          </div>
                          <img
                            v-if="scope.row.operator && scope.row.operator.fsOpenId"
                            @click="toFschat(scope.row.operator.fsOpenId)"
                            class="fs_chat"
                            src="@/assets/images/content_center/fsChat.png"
                            alt=""
                          />
                        </div>
                      </template>
                    </el-table-column>
                    <el-table-column min-width="125" label="销售额(元)">
                      <template #default="scope">￥{{ scope.row.salesMoney / 100 || 0 }}</template>
                    </el-table-column>
                    <el-table-column min-width="110" label="销售量">
                      <template #default="scope">
                        {{ wanSliceFormat(scope.row.salesGoods || 0) }}
                      </template>
                    </el-table-column>
                    <el-table-column min-width="125" label="销售额(整场)">
                      <template #default="scope">
                        ￥{{ scope.row.allSalesMoney / 100 || 0 }}
                      </template>
                    </el-table-column>
                    <el-table-column min-width="110" label="销售量(整场)">
                      <template #default="scope">
                        {{ wanSliceFormat(scope.row.allSalesGoods || 0) }}
                      </template>
                    </el-table-column>
                  </xm_table>
                </el-tab-pane>
              </el-tabs>
            </div>
          </template>
        </el-tab-pane>
        <el-tab-pane :key="2" label="直播人气榜" name="LivePopularityList"></el-tab-pane>
      </el-tabs>
    </template>
    <!-- 筛选条件 直播人气榜 -->
    <template v-if="chooseHeaderTab === 'LivePopularityList'">
      <xm_search>
        <div
          class="top"
          style="display: flex; align-items: center; width: 100%; margin-bottom: 30px"
        >
          <el-radio-group v-model="timePicker" border @change="changeTimeType">
            <el-radio-button :label="1">日</el-radio-button>
            <el-radio-button :label="2">周</el-radio-button>
            <el-radio-button :label="3">月</el-radio-button>
          </el-radio-group>
          <el-date-picker
            style="margin-left: 40px"
            :clearable="false"
            :format="timeselect.format"
            v-model="research.time"
            :type="timeselect.type"
            :value-format="timeselect.valueformat"
            placeholder="请选择时间"
            :disabled-date="
              time => {
                return time.getTime() > Date.now() - 24 * 60 * 60 * 1000
              }
            "
          ></el-date-picker>

          <el-tooltip class="item" effect="dark" placement="right">
            <template #content>
              <div class="tooltip_wrap">每日02:00左右更新前一日开播的直播数据排行。</div>
            </template>
            <div class="tip_tip">
              <p style="margin-left: 32px; margin-right: 4px">数据说明</p>
              <img
                src="https://tagvv-1256030678.file.myqcloud.com/20230609v2t8m.png"
                style="width: 14px; height: 14px"
                alt
              />
            </div>
          </el-tooltip>
        </div>
        <!-- 组织架构 -->
        <div class="search_item">
          <label class="item_label">矩阵号部门</label>
          <div class="item_content">
            <!-- <el-cascader
              v-model="research.department"
              :options="options"
              clearable
              collapse-tags
              placeholder="请选择矩阵号部门"
              :show-all-levels="false"
              :props="prop"
            ></el-cascader> -->
            <choose_dept_search
              ref="chooseDeptSearchRef"
              @updateDeptIds="onChangeDepartment"
              :multiple="true"
              :isUsePermission="true"
              searchLabel="矩阵号部门"
            />
          </div>
        </div>
        <!-- 矩阵号类型 -->
        <!--        <div class="search_item">-->
        <!--          <label class="item_label">矩阵号类型</label>-->
        <!--          <div class="item_content">-->
        <!--            <el-select-->
        <!--              v-model="research.accountType"-->
        <!--              placeholder="请选择"-->
        <!--              style="width: 100%"-->
        <!--              clearable-->
        <!--            >-->
        <!--              <el-option-->
        <!--                v-for="item in accountType"-->
        <!--                :label="item.label"-->
        <!--                :value="item.value"-->
        <!--                :key="item.value"-->
        <!--              />-->
        <!--            </el-select>-->
        <!--          </div>-->
        <!--        </div>-->
        <!-- 矩阵号昵称 -->
        <div class="search_item">
          <label class="item_label">矩阵号昵称</label>
          <div class="item_content">
            <el-input
              v-model="research.xuserNickname"
              clearable
              placeholder="请输入矩阵号昵称"
            ></el-input>
          </div>
        </div>
        <!-- 分组 -->
        <div class="search_item">
          <label class="item_label">矩阵号分组</label>
          <div class="item_content">
            <el-select
              v-model="research.groupId"
              placeholder="请选择矩阵号分组"
              style="width: 100%"
              clearable
              multiple
              filterable
              collapse-tags
            >
              <el-option
                v-for="item in userGroupOptions"
                :label="item.groupName"
                :value="item.id"
                :key="item.id"
              />
            </el-select>
          </div>
        </div>

        <!-- 查询重置 -->
        <div class="search_item">
          <el-button type="primary" @click="searchList()">查询</el-button>
          <el-button @click="reset">重置</el-button>
        </div>
      </xm_search>
      <!-- 分块 -->
      <!-- <div class="list">
          <ul>
            <li v-for="i of Popularitylist" :key="i.name">
              <p>{{ i.count || 0 }}</p>
              <p>{{ i.name }}</p>
            </li>
          </ul>
        </div> -->
      <!-- 列表 -->
      <div class="tab_box">
        <div class="data_list">
          <div v-for="(item, index) of Popularitylist" :key="index">
            <div
              class="data_item"
              v-show="item.name === '线索数' ? (brandViewMode === 2 ? true : false) : true"
            >
              <div class="data_name">{{ item.name }}：</div>
              <div class="data_val">{{ item.count || 0 }}</div>
            </div>
          </div>
        </div>
        <el-tabs v-model="chooseTab" @tab-click="searchList">
          <el-tab-pane
            v-for="(tab, i) in populartabList"
            :key="i"
            :label="tab.label"
            :name="tab.name"
          >
            <template #label>
              <div
                class="tab_label"
                v-show="tab.label === '线索数' ? (brandViewMode === 2 ? true : false) : true"
              >
                {{ tab.label }}
                <img
                  v-if="chooseTab == tab.name"
                  src="@/assets/images/content_center/tab_sort.png"
                  alt
                />
              </div>
            </template>
            <xm_table
              class="pic_table"
              tableType="live"
              v-loading="tableForm.loading"
              :data="chooseTab == tab.name ? tableForm.listData : []"
              v-model:page="tableForm.page"
              @getTableData="queryList"
            >
              <el-table-column width="100" label="排名" type="index">
                <template #default="scope">
                  {{ (tableForm.page.index - 1) * tableForm.page.size + scope.$index + 1 }}
                </template>
              </el-table-column>
              <el-table-column min-width="240" label="直播间">
                <template #default="scope">
                  <div class="live_box" @click="toDetail(scope.row.dyRoomId, scope.row.dyOpenId)">
                    <div class="live_img_box">
                      <el-image v-if="scope.row.cover" :src="scope.row.cover" class="live_img">
                        <template #error>
                          <div class="live_img errImg_box"></div>
                        </template>
                      </el-image>
                      <img
                        class="live_img"
                        v-else
                        src="@/assets/images/content_center/default_cover.png"
                        alt
                      />
                      <liveAnimation v-if="scope.row.isLiving == true"></liveAnimation>
                    </div>

                    <div class="live_content">
                      <div class="content1">
                        <!-- <router-link
                      :to="toDetail(scope.row.roomId)"
                      :style="
                        scope.row.roomStatus == 1
                          ? 'max-width:calc(100% - 26px) !important'
                          : 'max-width:calc(100% - 0px) !important'
                      "
                          >-->
                        <div class="content_text row_overflow">
                          {{ scope.row.roomTitle || '--' }}
                        </div>
                        <!-- </router-link> -->

                        <!-- <el-popover
                          v-if="scope.row.roomStatus == 1"
                          placement="bottom"
                          popper-class="qrcode_popper"
                          width="154px"
                          trigger="click"
                        >
                          <template #reference>
                            <img src="@/assets/images/content_center/qrcode.png" alt />
                          </template>
                          <div class="qrcode_box" v-if="scope.row.dyRoomId">
                            <qrcode-vue
                              :value="
                                localOrign +
                                '/sumflyh5/activity?roomId=' +
                                scope.row.dyRoomId
                              "
                              :size="126"
                              level="H"
                            />
                            <div class="qr_mark">
                              <img
                                src="https://tagvv-1256030678.cos.ap-shanghai.myqcloud.com/img/202111061652346e85b3672b.png"
                                alt
                              />
                              抖音扫码观看
                            </div>
                          </div>
                          <div v-else class="qrcode_box">
                            <div class="qr_mark">暂未找到相关地址</div>
                          </div>
                          </el-popover>-->
                      </div>
                      <div class="content2">
                        时长：{{
                          scope.row.liveDurationTime != null
                            ? secondToDate(
                                (scope.row.liveDurationTime || 0) / 1000,
                                '分钟',
                                true,
                                false,
                                true
                              )
                            : '--'
                        }}
                      </div>
                      <template v-if="scope.row.isLiving == true">
                        <div class="content3">
                          {{ dayjs(scope.row.liveStartTime).format('MM-DD HH:mm') || '--' }}
                        </div>
                      </template>
                      <template v-else>
                        <div class="content3">
                          {{ dayjs(scope.row.liveStartTime).format('MM-DD HH:mm') || '--' }} -
                          {{ dayjs(scope.row.liveEndTime).format('MM-DD HH:mm') || '--' }}
                        </div>
                      </template>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column min-width="200" label="矩阵号">
                <template #default="scope">
                  <div class="fs_user_box">
                    <div
                      :class="
                        scope.row.operator && scope.row.operator.fsOpenId
                          ? 'fs_content'
                          : 'fs_content2'
                      "
                      @click="toUserDetail(scope.row.dyOpenId, scope.row)"
                    >
                      <div
                        class="user_box"
                        :style="
                          scope.row.xuserIsDel && scope.row.xuserIsDel == 1 ? 'cursor: default' : ''
                        "
                      >
                        <img
                          v-if="scope.row.xuserHeadImg"
                          :src="scope.row.xuserHeadImg"
                          class="user_head"
                          alt
                        />
                        <img
                          v-else
                          src="@/assets/images/content_center/default_user.png"
                          class="user_head"
                          alt
                        />
                        <div class="user_content">
                          <div class="content1">
                            <div class="content_text">
                              {{ scope.row.nickname || '--' }}

                              <template
                                v-if="
                                  scope.row.dyAccountRole &&
                                  matrixTypeICON.getCN(scope.row.dyAccountRole)
                                "
                              >
                                <el-tooltip effect="dark" placement="top">
                                  <template #content>
                                    <div style="max-width: 300px">
                                      {{ matrixTypeICON.getCN(scope.row.dyAccountRole).name }}
                                    </div>
                                  </template>
                                  <img
                                    :src="matrixTypeICON.getCN(scope.row.dyAccountRole).img"
                                    alt=""
                                  />
                                </el-tooltip>
                              </template>
                              <!-- 矩阵号被删除 -->
                              <div
                                class="xm_delClass"
                                v-if="scope.row.xuserIsDel && scope.row.xuserIsDel == 1"
                              ></div>
                            </div>
                          </div>
                          <table_column_department_info
                            className="blue_department_info"
                            :departmentName="scope.row.xuserDeptName"
                            connectStr="/"
                            divisionStr=";"
                            trigger="hover"
                            tipPlacement="right"
                          ></table_column_department_info>
                        </div>
                      </div>
                    </div>
                    <img
                      v-if="scope.row.operator && scope.row.operator.fsOpenId"
                      @click="toFschat(scope.row.operator.fsOpenId)"
                      class="fs_chat"
                      src="@/assets/images/content_center/fsChat.png"
                      alt=""
                    />
                  </div>
                </template>
              </el-table-column>

              <el-table-column min-width="110" label="人气峰值">
                <template #default="scope">
                  {{ wanSliceFormat(scope.row.maxOnlineNum || 0) }}
                </template>
              </el-table-column>
              <el-table-column min-width="110" label="观看人次">
                <template #default="scope">
                  {{ wanSliceFormat(scope.row.watchTimes || 0) }}
                </template>
              </el-table-column>
              <el-table-column min-width="110" label="涨粉数">
                <template #default="scope">
                  {{ wanSliceFormat(scope.row.fansAddNum || 0) }}
                </template>
              </el-table-column>
              <el-table-column min-width="110" v-if="brandViewMode === 2" label="线索数">
                <template #default="scope">
                  {{ wanSliceFormat(scope.row.clueCnt || 0) }}
                </template>
              </el-table-column>
              <el-table-column min-width="125" label="点赞数">
                <template #default="scope">{{ wanSliceFormat(scope.row.diggNum || 0) }}</template>
              </el-table-column>
            </xm_table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </template>
  </div>
</template>

<script>
import { matrixTypeICON } from '@/utils/dictionary/content-center.js'

import liveAnimation from '../components/live_animation.vue'
// import qrcodeVue from 'qrcode.vue'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'

import { pageList } from './model/get_list.js'
import { wanSliceFormat, secondToDate, throttle } from '@/utils/tools.js'
import { useStore } from 'vuex'
export default {
  components: {
    liveAnimation
  },

  setup(props) {
    const store = useStore()
    const brandViewMode = computed(() => store.state.user.brandViewMode)
    const localOrign = location.origin
    const {
      chooseDeptSearchRef,
      onChangeDepartment,
      Popularitylist,
      headerList,
      timeselect,
      timePicker,
      research,
      chooseTab,
      tabList,
      tableForm,
      Goodslist,
      chooseHeaderTab,
      accountType,
      populartabList,
      changeTimeType,
      queryList,
      searchList,
      reset,
      userGroupOptions,
      resetTab
    } = pageList()

    const router = useRouter()
    // 跳转详情页
    const toUserDetail = throttle(function (openId, e) {
      // 如果矩阵号被删除，就不能跳转
      if (e.xuserIsDel && e.xuserIsDel === 1) {
        return
      }
      router.push(`/content_center/content_matrix/details?openId=${openId}`)
    }, 500)
    const toDetail = throttle(function (roomId, dyOpenId) {
      router.push(`/content_center/live_center/detail?roomId=${roomId}&dyOpenId=${dyOpenId}`)
    }, 500)

    // 跳转飞书聊天
    function toFschat(openId) {
      window.open(`https://applink.feishu.cn/client/chat/open?openId=${openId}`)
    }
    return {
      chooseDeptSearchRef,
      onChangeDepartment,
      matrixTypeICON,
      brandViewMode,
      toFschat,
      dayjs,
      populartabList,
      Popularitylist,
      chooseHeaderTab,
      Goodslist,
      accountType,
      timeselect,
      timePicker,
      research,
      localOrign,
      tableForm,
      changeTimeType,
      tabList,
      chooseTab,
      wanSliceFormat,
      secondToDate,
      resetTab,
      headerList,
      queryList,
      searchList,
      reset,
      toUserDetail,
      toDetail,
      userGroupOptions
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../components/css/qrcode.scss';
@import '../components/css/page.scss';
.live_center {
  :deep(.el-tabs__header) {
    margin-bottom: 16px;
  }
  :deep(.el-input__prefix) {
    top: 9px;
  }
  :deep(.top .el-input__suffix) {
    top: 9px;
  }
  :deep(.outtab_box > .el-tabs__header) {
    padding-left: 24px;
    padding-top: 15px;
    border-radius: 4px;
    background-color: #fff;
  }
  :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    background-color: rgba(54, 79, 205, 0.1);
    color: #364fcd;
  }
  .xm_search {
    padding-left: 24px;
  }
  .list {
    padding: 16px 0;

    ul {
      padding: 0 24px;
      height: 133px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      background-color: #fff;
      li {
        margin-left: 16px;
        flex: 1;
        height: 85px;
        background: #f6f7f8;
        border-radius: 4px;
        display: flex;
        align-items: center;
        flex-direction: column;
        justify-content: center;
        &:nth-of-type(1) {
          margin-left: 0px;
        }
        p {
          &:nth-of-type(1) {
            height: 20px;
            font-size: 18px;
            font-family: Arial-BoldMT, Arial;
            font-weight: normal;
            color: #333333;
            line-height: 21px;
            margin-bottom: 6px;
          }
          &:nth-of-type(2) {
            height: 17px;
            font-size: 12px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: #909399;
            line-height: 17px;
          }
        }
      }
    }
  }
  .tab_box {
    background: #fff;
    margin-top: 16px;
    border-radius: 4px;
    padding: 16px 24px;
    .data_list {
      margin-bottom: 16px;
      display: flex;
      .data_item {
        margin-right: 24px;
        padding: 0 16px;
        height: 32px;
        display: flex;
        align-items: center;
        border: 1px solid rgba(124, 141, 225, 0.7);
        background: rgba(124, 141, 225, 0.1);
        border-radius: 4px;
        .data_name {
          font-size: 14px;
          color: #303133;
          line-height: 20px;
        }
        .data_val {
          margin-left: 8px;
          font-size: 18px;
          font-weight: bold;
          color: #364fcd;
          line-height: 22px;
        }
      }
    }
  }
  .outtab_box {
  }
  .tab_label {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;

    img {
      display: flex;
      width: 14px;
      height: 14px;
    }
  }
  .live_box {
    cursor: pointer;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .live_img_box {
      cursor: pointer;
      width: 60px;
      height: 60px;
      border-radius: 4px;
      margin-right: 10px;
      position: relative;
    }
    .live_img {
      width: 60px;
      height: 60px;
      border-radius: 4px;
      object-fit: cover;
    }
    .live_content {
      width: calc(100% - 70px);
      height: 70px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      .content1 {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        font-size: 14px;

        font-weight: 500;
        color: #303133;
        line-height: 20px;
        a {
          max-width: calc(100% - 26px) !important;
        }
        .content_text {
          // cursor: pointer;
          max-width: 100%;
        }
        img {
          width: 18px;
          height: 18px;
          margin-left: 8px;
          cursor: pointer;
        }
      }
      .content2 {
        // cursor: pointer;
        margin-top: 2px;
        font-size: 12px;

        font-weight: 400;
        color: #909399;
        line-height: 17px;
      }
      .content3 {
        // cursor: pointer;
        margin-top: 2px;
        font-size: 12px;
        font-weight: 400;
        color: #909399;
        line-height: 17px;
      }
    }
  }

  .user_box {
    cursor: pointer;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .user_head {
      width: 36px;
      height: 36px;
      border-radius: 100%;
      margin-right: 6px;
    }
    .user_content {
      width: calc(100% - 42px);
      min-height: 36px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      .content1 {
        width: 100%;
        // display: flex;
        // flex-direction: row;
        // justify-content: flex-start;
        // align-items: center;
        font-size: 13px;

        font-weight: 500;
        color: #303133;
        line-height: 20px;
        .content_text {
          width: max-content;
          max-width: 100%;
          // margin-bottom: 4px;
          // max-width: calc(100% - 40px);
        }
        img {
          width: 16px;
          height: 16px;
          margin-left: 4px;
          vertical-align: text-top;
        }
      }
      .content2 {
        margin-top: 6px;
        font-size: 12px;

        font-weight: 400;
        color: #909399;
        line-height: 17px;
      }
    }
  }
}
.tip_tip {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  color: #909399;
}
</style>
