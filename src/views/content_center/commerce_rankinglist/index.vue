<template>
  <div class="content_page live_center">
    <el-tabs
      class="outtab_box"
      style="margin-bottom: 20px"
      v-model="chooseHeaderTab"
      @tab-click="resetTab"
    >
      <el-tab-pane label="全部" name="all">
        <template v-if="chooseHeaderTab === 'all'">
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
                unlink-panels
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

              <el-tooltip class="item" effect="dark" placement="right">
                <template #content>
                  <div class="tooltip_wrap">每日02:00左右更新前一日矩阵带货数据排行。</div>
                </template>
                <div class="xm_tooltipOfRight" style="margin-left: 32px">数据说明</div>
                <!-- <img
                src="@/assets/images/content_center/tip_line.png"
                style="width: 14px; height: 14px"
                alt
              /> -->
              </el-tooltip>
            </div>
            <!-- 组织架构 -->
            <div class="search_item">
              <label class="item_label">矩阵号部门</label>
              <div class="item_content">
                <choose_dept_search
                  ref="chooseDeptSearchRef"
                  @updateDeptIds="onChangeDepartment"
                  :multiple="true"
                  :isUsePermission="true"
                  searchLabel="矩阵号部门"
                />
              </div>
            </div>
            <!-- 内容类型 -->
            <!-- <div class="search_item">
            <label class="item_label">内容类型</label>
            <div class="item_content">
              <el-select
                v-model="research.contentType"
                placeholder="请选择"
                style="width: 100%"
                clearable
              >
                <el-option
                  v-for="item in contentType"
                  :label="item.label"
                  :value="item.value"
                  :key="item.value"
                />
              </el-select>
            </div>
          </div>-->
            <!-- 矩阵号类型 -->
            <div class="search_item">
              <label class="item_label">矩阵号类型</label>
              <div class="item_content">
                <el-select
                  v-model="research.accountType"
                  placeholder="请选择"
                  style="width: 100%"
                  clearable
                >
                  <el-option
                    v-for="item in accountType"
                    :label="item.label"
                    :value="item.value"
                    :key="item.value"
                  />
                </el-select>
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
              <el-button type="primary" @click="queryList()">查询</el-button>
              <el-button @click="reset">重置</el-button>
            </div>
          </xm_search>
          <!-- 分块 -->
          <!-- <div class="list">
          <ul>
            <li v-for="i of alllist" :key="i.name">
              <p>{{ i.count || 0 }}</p>
              <p>{{ i.name }}</p>
            </li>
          </ul>
        </div>-->
          <!-- 列表 -->
          <div class="tab_box">
            <div class="data_list">
              <div class="data_item" v-for="(item, index) of alllist" :key="index">
                <div class="data_name">{{ item.name }}：</div>
                <div class="data_val">{{ item.count || 0 }}</div>
              </div>
            </div>
            <el-tabs v-model="chooseTab" @tab-click="reset">
              <el-tab-pane v-for="(tab, i) in allList" :key="i" :label="tab.label" :name="tab.name">
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
                  tableType="avatar"
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
                  <el-table-column label="矩阵号" prop="name" min-width="300">
                    <template #default="scope">
                      <div class="account_wrap" @click="toUserDetail(scope.row.dyOpenId)">
                        <div class="avatar_wrap">
                          <!-- <liveAnimation v-if="scope.row.hasLiving == true"></liveAnimation> -->
                          <img
                            class="avatar_icon"
                            :src="scope.row.xuserHeadImg ? scope.row.xuserHeadImg : avatarImg"
                            alt
                          />
                        </div>
                        <div class="account_info">
                          <div>
                            <span>{{ scope.row.nickname ? scope.row.nickname : '--' }}</span>
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
                          </div>
                          <p>
                            <span>
                              抖音号：{{ scope.row.dyDisplayId ? scope.row.dyDisplayId : '--' }}
                            </span>
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
                                  alt
                                />
                              </template>
                              <div class="qrcode_box" v-if="scope.row.dyUId">
                                <qrcode-vue
                                  :value="'https://www.iesdouyin.com/share/user/' + scope.row.dyUId"
                                  :size="126"
                                  level="H"
                                />
                                <div class="qr_mark">
                                  <img
                                    src="https://tagvv-1256030678.cos.ap-shanghai.myqcloud.com/img/202111061652346e85b3672b.png"
                                    alt
                                  />
                                  抖音扫码查看
                                </div>
                              </div>
                              <div v-else class="qrcode_box">
                                <div class="qr_mark">暂未找到相关地址</div>
                              </div>
                            </el-popover>
                          </p>
                        </div>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column label="运营者" prop="phone" min-width="170">
                    <template #default="scope">
                      <div
                        v-if="scope.row.operatorId"
                        class="user_wrap"
                        :class="scope.row.fsOpenId ? 'user_wrap_cursor' : ''"
                        @click="scope.row.fsOpenId ? toFschat(scope.row.fsOpenId) : ''"
                      >
                        <img
                          v-if="scope.row.operatorHeadImg"
                          :src="scope.row.operatorHeadImg"
                          alt
                        />
                        <default-photo v-else :name="scope.row.operatorName || '--'" />
                        <span
                          :style="
                            scope.row.staffStatus && scope.row.staffStatus == 2
                              ? 'max-width: calc(100% - 96px);'
                              : ''
                          "
                        >
                          {{ scope.row.operatorName || '--' }}
                        </span>
                        <div
                          class="xm_depart"
                          v-if="scope.row.staffStatus && scope.row.staffStatus == 2"
                        ></div>
                      </div>
                      <div v-else>--</div>
                    </template>
                  </el-table-column>
                  <el-table-column min-width="125" label="销售额">
                    <template #default="scope">￥{{ scope.row.salesMoney / 100 || 0 }}</template>
                  </el-table-column>
                  <el-table-column min-width="110" label="销售量">
                    <template #default="scope">
                      {{ wanSliceFormat(scope.row.salesGoods || 0) }}
                    </template>
                  </el-table-column>
                  <el-table-column min-width="125" label="涨粉数">
                    <template #default="scope">
                      {{ wanSliceFormat(scope.row.fansAddNum || 0) }}
                    </template>
                  </el-table-column>
                  <el-table-column min-width="110" label="发布视频">
                    <template #default="scope">
                      {{ wanSliceFormat(scope.row.videoNum || 0) }}
                    </template>
                  </el-table-column>
                  <el-table-column min-width="110" label="直播场次">
                    <template #default="scope">
                      {{ wanSliceFormat(scope.row.liveTimes || 0) }}
                    </template>
                  </el-table-column>
                </xm_table>
              </el-tab-pane>
            </el-tabs>
          </div>
        </template>
      </el-tab-pane>
      <el-tab-pane label="直播带货" name="live">
        <template v-if="chooseHeaderTab === 'live'">
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
              <el-tooltip class="item" effect="dark" placement="right">
                <template #content>
                  <div class="tooltip_wrap">每日02:00左右更新前一日矩阵带货数据排行。</div>
                </template>
                <div class="xm_tooltipOfRight" style="margin-left: 32px">数据说明</div>
              </el-tooltip>
            </div>
            <!-- 矩阵号部门 -->
            <div class="search_item">
              <label class="item_label">矩阵号部门</label>
              <div class="item_content">
                <choose_dept_search
                  ref="chooseDeptSearchRef"
                  @updateDeptIds="onChangeDepartment"
                  :multiple="true"
                  :isUsePermission="true"
                  searchLabel="矩阵号部门"
                />
              </div>
            </div>
            <!-- 内容类型 -->
            <!-- <div class="search_item">
            <label class="item_label">内容类型</label>
            <div class="item_content">
              <el-select
                v-model="research.contentType"
                placeholder="请选择"
                style="width: 100%"
                clearable
              >
                <el-option
                  v-for="item in contentType"
                  :label="item.label"
                  :value="item.value"
                  :key="item.value"
                />
              </el-select>
            </div>
          </div>-->
            <!-- 矩阵号类型 -->
            <div class="search_item">
              <label class="item_label">矩阵号类型</label>
              <div class="item_content">
                <el-select
                  v-model="research.accountType"
                  placeholder="请选择"
                  style="width: 100%"
                  clearable
                >
                  <el-option
                    v-for="item in accountType"
                    :label="item.label"
                    :value="item.value"
                    :key="item.value"
                  />
                </el-select>
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
              <el-button type="primary" @click="queryList()">查询</el-button>
              <el-button @click="reset">重置</el-button>
            </div>
          </xm_search>
          <!-- 分块 -->
          <!-- <div class="list">
          <ul>
            <li v-for="i of Goodslist" :key="i.name">
              <p>{{ i.count || 0 }}</p>
              <p>{{ i.name }}</p>
            </li>
          </ul>
        </div>-->
          <!-- 列表 -->
          <div class="tab_box">
            <div class="data_list">
              <div class="data_item" v-for="(item, index) of Goodslist" :key="index">
                <div class="data_name">{{ item.name }}：</div>
                <div class="data_val">{{ item.count || 0 }}</div>
              </div>
            </div>
            <el-tabs v-model="chooseTab" @tab-click="reset">
              <el-tab-pane
                v-for="(tab, i) in liveList"
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
                  tableType="avatar"
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
                  <el-table-column label="矩阵号" prop="name" min-width="300">
                    <template #default="scope">
                      <div class="account_wrap" @click="toUserDetail(scope.row.dyOpenId)">
                        <div class="avatar_wrap">
                          <!-- <liveAnimation v-if="scope.row.hasLiving == true"></liveAnimation> -->
                          <img
                            class="avatar_icon"
                            :src="scope.row.xuserHeadImg ? scope.row.xuserHeadImg : avatarImg"
                            alt
                          />
                        </div>
                        <div class="account_info">
                          <div>
                            <span>{{ scope.row.nickname ? scope.row.nickname : '--' }}</span>
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
                          </div>
                          <p>
                            <span>
                              抖音号：{{ scope.row.dyDisplayId ? scope.row.dyDisplayId : '--' }}
                            </span>

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
                                  alt
                                />
                              </template>
                              <div class="qrcode_box" v-if="scope.row.dyUId">
                                <qrcode-vue
                                  :value="'https://www.iesdouyin.com/share/user/' + scope.row.dyUId"
                                  :size="126"
                                  level="H"
                                />
                                <div class="qr_mark">
                                  <img
                                    src="https://tagvv-1256030678.cos.ap-shanghai.myqcloud.com/img/202111061652346e85b3672b.png"
                                    alt
                                  />
                                  抖音扫码查看
                                </div>
                              </div>
                              <div v-else class="qrcode_box">
                                <div class="qr_mark">暂未找到相关地址</div>
                              </div>
                            </el-popover>
                          </p>
                        </div>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column label="运营者" prop="phone" min-width="170">
                    <template #default="scope">
                      <div
                        v-if="scope.row.operatorId"
                        class="user_wrap"
                        :class="scope.row.fsOpenId ? 'user_wrap_cursor' : ''"
                        @click="scope.row.fsOpenId ? toFschat(scope.row.fsOpenId) : ''"
                      >
                        <img
                          v-if="scope.row.operatorHeadImg"
                          :src="scope.row.operatorHeadImg"
                          alt
                        />
                        <default-photo v-else :name="scope.row.operatorName || '--'" />
                        <span
                          :style="
                            scope.row.staffStatus && scope.row.staffStatus == 2
                              ? 'max-width: calc(100% - 96px);'
                              : ''
                          "
                        >
                          {{ scope.row.operatorName || '--' }}
                        </span>

                        <img
                          v-if="scope.row.iconType === 2"
                          class="fs_icon"
                          src="@/assets/images/user/weChat.png"
                          alt
                        />
                        <img
                          v-if="scope.row.iconType === 1"
                          class="fs_icon"
                          src="@/assets/images/user/feishu.png"
                          alt
                        />
                        <img
                          v-if="scope.row.iconType === 3"
                          class="fs_icon"
                          src="@/assets/images/user/wx.png"
                          alt
                        />
                        <div
                          class="xm_depart"
                          v-if="scope.row.staffStatus && scope.row.staffStatus == 2"
                        ></div>
                      </div>
                      <div v-else>--</div>
                    </template>
                  </el-table-column>
                  <el-table-column min-width="125" label="销售额">
                    <template #default="scope">￥{{ scope.row.salesMoney / 100 || 0 }}</template>
                  </el-table-column>
                  <el-table-column min-width="110" label="销售量">
                    <template #default="scope">
                      {{ wanSliceFormat(scope.row.salesGoods || 0) }}
                    </template>
                  </el-table-column>
                  <el-table-column min-width="125" label="直播场次">
                    <template #default="scope">
                      {{ scope.row.relatedDyRoomIds ? scope.row.relatedDyRoomIds.length : 0 }}
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="操作"
                    fixed="right"
                    width="120"
                    align="center"
                    header-align="center"
                  >
                    <template #default="scope">
                      <el-link type="primary" @click="details(scope.row.relatedDyRoomIds)">
                        详情
                      </el-link>
                    </template>
                  </el-table-column>
                </xm_table>
              </el-tab-pane>
            </el-tabs>
          </div>
        </template>
      </el-tab-pane>
      <el-tab-pane :key="2" label="视频带货" name="video">
        <template v-if="chooseHeaderTab === 'video'">
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
                  <div class="tooltip_wrap">每日02:00左右更新前一日矩阵带货数据排行。</div>
                </template>
                <div class="xm_tooltipOfRight" style="margin-left: 32px">数据说明</div>
              </el-tooltip>
            </div>
            <!-- 矩阵号部门 -->
            <div class="search_item">
              <label class="item_label">矩阵号部门</label>
              <div class="item_content">
                <choose_dept_search
                  ref="chooseDeptSearchRef"
                  @updateDeptIds="onChangeDepartment"
                  :multiple="true"
                  :isUsePermission="true"
                  searchLabel="矩阵号部门"
                />
              </div>
            </div>
            <!-- 内容类型 -->
            <!-- <div class="search_item">
            <label class="item_label">内容类型</label>
            <div class="item_content">
              <el-select
                v-model="research.contentType"
                placeholder="请选择"
                style="width: 100%"
                clearable
              >
                <el-option
                  v-for="item in contentType"
                  :label="item.label"
                  :value="item.value"
                  :key="item.value"
                />
              </el-select>
            </div>
          </div>-->
            <!-- 矩阵号类型 -->
            <div class="search_item">
              <label class="item_label">矩阵号类型</label>
              <div class="item_content">
                <el-select
                  v-model="research.accountType"
                  placeholder="请选择"
                  style="width: 100%"
                  clearable
                >
                  <el-option
                    v-for="item in accountType"
                    :label="item.label"
                    :value="item.value"
                    :key="item.value"
                  />
                </el-select>
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
              <el-button type="primary" @click="queryList()">查询</el-button>
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
        </div>-->
          <!-- 列表 -->
          <div class="tab_box">
            <div class="data_list">
              <div class="data_item" v-for="(item, index) of Popularitylist" :key="index">
                <div class="data_name">{{ item.name }}：</div>
                <div class="data_val">{{ item.count || 0 }}</div>
              </div>
            </div>
            <el-tabs v-model="chooseTab" @tab-click="reset">
              <el-tab-pane
                v-for="(tab, i) in videoList"
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
                  tableType="avatar"
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
                  <el-table-column label="矩阵号" prop="name" min-width="300">
                    <template #default="scope">
                      <div class="account_wrap" @click="toUserDetail(scope.row.dyOpenId)">
                        <div class="avatar_wrap">
                          <!-- <liveAnimation v-if="scope.row.hasLiving == true"></liveAnimation> -->
                          <img
                            class="avatar_icon"
                            :src="scope.row.xuserHeadImg ? scope.row.xuserHeadImg : avatarImg"
                            alt
                          />
                        </div>
                        <div class="account_info">
                          <div>
                            <span>{{ scope.row.nickname ? scope.row.nickname : '--' }}</span>
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
                          </div>
                          <p>
                            <span>
                              抖音号：{{ scope.row.dyDisplayId ? scope.row.dyDisplayId : '--' }}
                            </span>
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
                                  alt
                                />
                              </template>
                              <div class="qrcode_box" v-if="scope.row.dyUId">
                                <qrcode-vue
                                  :value="'https://www.iesdouyin.com/share/user/' + scope.row.dyUId"
                                  :size="126"
                                  level="H"
                                />
                                <div class="qr_mark">
                                  <img
                                    src="https://tagvv-1256030678.cos.ap-shanghai.myqcloud.com/img/202111061652346e85b3672b.png"
                                    alt
                                  />
                                  抖音扫码查看
                                </div>
                              </div>
                              <div v-else class="qrcode_box">
                                <div class="qr_mark">暂未找到相关地址</div>
                              </div>
                            </el-popover>
                          </p>
                        </div>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column label="运营者" prop="phone" min-width="170">
                    <template #default="scope">
                      <div
                        v-if="scope.row.operatorId"
                        class="user_wrap"
                        :class="scope.row.fsOpenId ? 'user_wrap_cursor' : ''"
                        @click="scope.row.fsOpenId ? toFschat(scope.row.fsOpenId) : ''"
                      >
                        <img
                          v-if="scope.row.operatorHeadImg"
                          :src="scope.row.operatorHeadImg"
                          alt
                        />
                        <default-photo v-else :name="scope.row.operatorName || '--'" />
                        <span
                          :style="
                            scope.row.staffStatus && scope.row.staffStatus == 2
                              ? 'max-width: calc(100% - 96px);'
                              : ''
                          "
                        >
                          {{ scope.row.operatorName || '--' }}
                        </span>

                        <img
                          v-if="scope.row.iconType === 2"
                          class="fs_icon"
                          src="@/assets/images/user/weChat.png"
                          alt
                        />
                        <img
                          v-if="scope.row.iconType === 1"
                          class="fs_icon"
                          src="@/assets/images/user/feishu.png"
                          alt
                        />
                        <img
                          v-if="scope.row.iconType === 3"
                          class="fs_icon"
                          src="@/assets/images/user/wx.png"
                          alt
                        />
                        <div
                          class="xm_depart"
                          v-if="scope.row.staffStatus && scope.row.staffStatus == 2"
                        ></div>
                      </div>
                      <div v-else>--</div>
                    </template>
                  </el-table-column>

                  <el-table-column min-width="110" label="销售额">
                    <template #default="scope">￥{{ scope.row.salesMoney / 100 || 0 }}</template>
                  </el-table-column>
                  <el-table-column min-width="110" label="销量">
                    <template #default="scope">
                      {{ wanSliceFormat(scope.row.salesGoods || 0) }}
                    </template>
                  </el-table-column>
                </xm_table>
              </el-tab-pane>
            </el-tabs>
          </div>
        </template>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="dialogTableVisible" title="订单来源直播间" width="60%">
      <xm_table
        class="pic_table"
        tableType="live"
        :data="relatedDyRoomIds"
        style="width: 100%"
        :showPage="false"
        :tableHeight="500"
      >
        <el-table-column width="220" label="直播间">
          <template #default="scope">
            <div class="live_box">
              <div class="live_img_box">
                <img v-if="scope.row.roomPhoto" :src="scope.row.roomPhoto" class="live_img" />
                <img
                  class="live_img"
                  v-else
                  src="@/assets/images/content_center/default_cover.png"
                  alt
                />
                <liveAnimation v-if="scope.row.liveEndTime === null"></liveAnimation>
              </div>

              <div class="live_content">
                <div class="content1">
                  <div class="content_text row_overflow" style="cursor: default">
                    {{ scope.row.roomTitle || '--' }}
                  </div>
                </div>
                <div class="content2" style="cursor: default">
                  {{ dayjs(scope.row.liveStartTime).format('MM-DD HH:mm') || '--' }}
                  {{
                    scope.row.liveEndTime
                      ? ` - ${dayjs(scope.row.liveEndTime).format('MM-DD HH:mm')}`
                      : ''
                  }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column min-width="100" label="销售额">
          <template #default="scope">￥{{ scope.row.salesMoney / 100 || 0 }}</template>
        </el-table-column>
        <el-table-column min-width="100" label="销售量">
          <template #default="scope">{{ wanSliceFormat(scope.row.salesGoods || 0) }}</template>
        </el-table-column>
        <el-table-column min-width="100" label="销售额(整场)">
          <template #default="scope">￥{{ scope.row.allSalesMoney / 100 || 0 }}</template>
        </el-table-column>

        <el-table-column min-width="100" label="销售量(整场)">
          <template #default="scope">{{ wanSliceFormat(scope.row.allSalesGoods || 0) }}</template>
        </el-table-column>
        <el-table-column min-width="100" label="直播时长">
          <template #default="scope">
            {{ Math.floor(scope.row.liveTime / 60000) || 0 }}分钟
          </template>
        </el-table-column>
        <el-table-column min-width="110" label="观看人次">
          <template #default="scope">{{ wanSliceFormat(scope.row.watchTimes || 0) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" header-align="center">
          <template #default="scope">
            <el-link type="primary" @click="toDetail(scope.row.dyRoomId)">详情</el-link>
          </template>
        </el-table-column>
      </xm_table>
    </el-dialog>
  </div>
</template>

<script>
import { matrixTypeICON } from '@/utils/dictionary/content-center.js'

import liveAnimation from '../components/live_animation.vue'
// import brandIcon from '@/assets/images/content_center/brand_icon.png'
import dayjs from 'dayjs'

import qrcodeVue from 'qrcode.vue'
import { pageList } from './model/get_list.js'
import { wanSliceFormat, getDateDiff, throttle } from '@/utils/tools.js'
import avatarImg from '@/assets/images/content_center/default_user.png'
import DefaultPhoto from '../../system/components/default_photo/index.vue'
import { useRoute, useRouter } from 'vue-router'
export default {
  components: {
    DefaultPhoto,
    qrcodeVue,
    liveAnimation
  },
  setup(props) {
    // const localOrign = 'https://test.tagvv.com'
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
      videoList,
      tableForm,
      Goodslist,
      chooseHeaderTab,
      // brandMark,
      contentType,
      accountType,
      allList,
      liveList,
      alllist,
      changeTimeType,
      queryList,
      reset,
      userGroupOptions,
      getUserGroupInfo
    } = pageList()
    reset()
    getUserGroupInfo()
    const dialogTableVisible = ref(false)
    const pagination = reactive({
      pageIndex: 1,
      pageLayout: 'total,sizes, prev, pager, next , jumper',
      total: 100,
      size: 10,
      pageSizes: [10, 20, 50, 100]
    })
    const handleSizeChange = val => {
      console.log(`${val} items per page`)
    }
    const handleCurrentChange = val => {
      console.log(`current page: ${val}`)
    }
    // 查询
    function resetTab() {
      if (chooseHeaderTab.value === 'all') {
        chooseTab.value = 3
      } else if (chooseHeaderTab.value === 'live') {
        chooseTab.value = 2
      } else {
        chooseTab.value = 1
      }
      reset()
    }
    const relatedDyRoomIds = ref([])
    function details(data) {
      dialogTableVisible.value = true
      relatedDyRoomIds.value = data || []
    }
    const router = useRouter()
    // 跳转详情页
    const toUserDetail = throttle(function (openId) {
      const link = `/content_center/content_matrix/details?openId=${openId}`
      router.push(link)
    }, 500)
    const toDetail = throttle(function (roomId) {
      const link = `/content_center/live_center/detail?roomId=${roomId}`
      router.push(link)
    }, 500)
    // 跳转飞书聊天
    function toFschat(openId) {
      window.open(`https://applink.feishu.cn/client/chat/open?openId=${openId}`)
    }
    const prop = {
      multiple: true,
      value: 'id',
      label: 'name',
      children: 'children',
      expandTrigger: 'click',
      emitPath: false,
      checkStrictly: true
    }
    // 大屏进来
    const route = useRoute()
    if (route.query.source) {
      chooseHeaderTab.value = 'live'
      chooseTab.value = 2
      reset()
    }
    return {
      chooseDeptSearchRef,
      onChangeDepartment,
      matrixTypeICON,
      dayjs,
      // brandIcon,
      handleSizeChange,
      handleCurrentChange,
      pagination,
      toFschat,
      avatarImg,
      relatedDyRoomIds,
      details,
      dialogTableVisible,
      toDetail,
      alllist,
      liveList,
      allList,
      prop,
      Popularitylist,
      chooseHeaderTab,
      Goodslist,
      // brandMark,
      contentType,
      accountType,
      timeselect,
      timePicker,
      research,
      localOrign,
      tableForm,
      changeTimeType,
      videoList,
      chooseTab,
      wanSliceFormat,
      getDateDiff,
      resetTab,
      headerList,
      queryList,
      reset,
      toUserDetail,
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
      // margin-top: 10px;
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
        // border: 1px solid #7c8de1;
        border: 1px solid rgba(124, 141, 225, 0.7);
        // background: rgba(54, 79, 205, 0.1);
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
    // background: #fff;
    // border-radius: 10px;
    // padding: 30px 0px;
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
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .live_img_box {
      // cursor: pointer;
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
      height: 60px;
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
          cursor: pointer;
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
        cursor: pointer;
        margin-top: 8px;
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
          margin-bottom: 4px;
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
  .account_wrap {
    display: flex;
    align-items: center;
    cursor: pointer;

    > .avatar_wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;

      > .avatar_icon {
        width: 40px;
        height: 40px;
        vertical-align: top;
        border-radius: 50%;
        box-sizing: border-box;
      }
      // > .avatar_icon_active{
      //   border: 1px solid #364FCD;
      // }
      > .expired_img {
        width: 14px;
        height: 14px;
        position: absolute;
        right: 0px;
        top: 0px;
      }
    }
    > .account_info {
      display: flex;
      flex-direction: column;
      margin-left: 8px;
      width: calc(100% - 64px);

      > div {
        width: 100%;
        display: flex;
        align-items: center;
        // justify-content: space-between;

        span {
          max-width: calc(100% - 56px);
          height: 20px;
          font-size: 14px;
          font-weight: 500;
          color: #303133;
          line-height: 20px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        > .brand_img {
          width: 32px;
          height: 14px;
          margin-left: 4px;
          border-radius: 0;
        }
        img {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          margin-left: 4px;
        }
      }
      p {
        width: 100%;
        white-space: nowrap;
        margin-top: 6px;
        display: flex;
        align-items: center;

        > span {
          max-width: calc(100% - 24px);
          white-space: nowrap;
          overflow: hidden;
          height: 17px;
          font-size: 12px;
          font-weight: 400;
          color: #909399;
          line-height: 17px;
        }
        > .qrcode_img {
          width: 18px;
          height: 18px;
          margin-left: 6px;
        }
      }
    }
  }
  .user_wrap {
    display: flex;
    align-items: center;
    position: relative;

    > img {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    > span {
      max-width: calc(100% - 44px);
      height: 20px;
      font-size: 14px;
      font-weight: 400;
      color: #303133;
      line-height: 20px;
      white-space: nowrap;
      margin-left: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    > .fs_icon {
      position: absolute;
      width: 14px;
      height: 14px;
      bottom: 0;
      left: 22px;
    }
    .default_photo {
      width: 36px;
      height: 36px;
      font-size: 12px;
      flex-shrink: 0;
    }
  }
  .xm_table_page {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
    width: 100%;
  }
}
.user_wrap_cursor {
  cursor: pointer;
}
</style>
