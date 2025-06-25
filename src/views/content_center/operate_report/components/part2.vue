<template>
  <div>
    <xm_search
      v-if="initOver"
      class="search_box"
      :searchComponents="searchComponents"
      :useOwnReset="true"
      @getData="querySearch"
      @reset="resetSearch"
    >
      <template #searchBtn>
        <exp_button ref="expButton" :asyncFunc="exportReport">导出</exp_button>
      </template>
      <!-- <div class="search_item"> -->
      <!-- <exp_button :asyncFunc="exportReport">导出</exp_button> -->
      <!--        <el-button-->
      <!--            class="btn"-->
      <!--            v-loading.fullscreen.lock="fullscreenLoading"-->
      <!--            @click="exportReport"-->
      <!--        >-->
      <!--          导出-->
      <!--        </el-button>-->
      <!-- </div> -->
    </xm_search>
    <div class="page_main mt_16">
      <!--      <el-tabs class="tabs" v-model="chooseRule" @tab-click="changeTab">-->
      <!--        <el-tab-pane label="日报" name="1"></el-tab-pane>-->
      <!--        <el-tab-pane label="周报" name="2"></el-tab-pane>-->
      <!--        <el-tab-pane label="月报" name="3"></el-tab-pane>-->
      <!--      </el-tabs>-->
      <!--      <div class="import_box">-->
      <!--        <el-button-->
      <!--          type="primary"-->
      <!--          class="btn"-->
      <!--          v-loading.fullscreen.lock="fullscreenLoading"-->
      <!--          @click="exportReport"-->
      <!--        >-->
      <!--          导出成Excel-->
      <!--        </el-button>-->
      <!--      </div>-->
      <div style="margin-bottom: 20px">
        <div class="xm_promptAboveTheTable">
          每日02:00左右更新前一日除粉丝数与涨粉数外的统计分析数据
        </div>
      </div>
      <xm_table
        tableType="default"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getList"
        :maxTableHeight="tableHeight"
        :showSummary="true"
        sumText="汇总"
        :summaryMethod="summaryMethod"
        @sort-change="sortMoney"
        :default-sort="{
          prop: 'fansIncrement',
          order: 'descending'
        }"
      >
        <!--        <el-table-column label="统计日期" prop="date" width="300">-->
        <!--          <template #default="scope">-->
        <!--            <div>{{ scope.row.date || '&#45;&#45;' }}</div>-->
        <!--          </template>-->
        <!--        </el-table-column>-->
        <el-table-column label="矩阵号" prop="accountDTO" width="300">
          <template #default="scope">
            <div v-if="scope.row.accountDTO">
              <div @click="toDetails(scope.row.accountDTO.openId)">
                <div class="account_wrap">
                  <div class="avatar_wrap">
                    <!-- <liveAnimation v-if="scope.row.roomStatus === 1"></liveAnimation> -->
                    <img
                      class="avatar_icon"
                      :src="
                        scope.row.accountDTO.dyHeadUrl ? scope.row.accountDTO.dyHeadUrl : avatarImg
                      "
                      alt
                    />
                    <table_column_private_account
                      v-if="scope.row.accountDTO && scope.row.accountDTO.privacyAccountStatus === 1"
                    ></table_column_private_account>
                    <!-- <el-tooltip
                    effect="dark"
                    v-if="scope.row.accountDTO.dyAuth == 2 || scope.row.accountDTO.byAuth == 2"
                    placement="top-start"
                  >
                    <template #content>
                      <div style="max-width: 300px">
                        {{ scope.row.accountDTO.byAuth == 2 ? '百应授权失效' : '' }}
                        {{ scope.row.accountDTO.byAuth == 2 && scope.row.accountDTO.dyAuth == 2 ? ',' : '' }}
                        {{ scope.row.accountDTO.dyAuth == 2 ? '抖音授权失效' : '' }}
                      </div>
                    </template>
                    <img
                      class="expired_img"
                      src="@/assets/images/content_center/warning_icon.png"
                      alt
                    />
                    </el-tooltip>-->
                  </div>
                  <div class="account_info">
                    <div>
                      <span>
                        {{
                          scope.row.accountDTO.dyNickname ? scope.row.accountDTO.dyNickname : '--'
                        }}
                      </span>
                      <!-- 所属平台 begin-->
                      <div class="platform_icon_box">
                        <div :class="[`xm_platformIcon_${scope.row.accountDTO.platform}`]"></div>
                      </div>
                      <!-- 所属平台 end -->
                      <img
                        class="brand_img"
                        v-if="scope.row.accountDTO.accountType != 1"
                        :src="brandIcon"
                        alt
                      />
                      <template v-if="scope.row.accountDTO.eaccountRole">
                        <el-tooltip effect="dark" placement="top">
                          <template #content>
                            <div style="max-width: 300px">
                              {{
                                scope.row.accountDTO.eaccountRole === 'EAccountM'
                                  ? '普通企业号'
                                  : scope.row.accountDTO.eaccountRole === 'EAccountS'
                                  ? '认证企业号'
                                  : '认证企业号'
                              }}
                            </div>
                          </template>
                          <img :src="getTypeImg(scope.row.accountDTO.eaccountRole)" alt="" />
                        </el-tooltip>
                        <!-- <img :src="getTypeImg(scope.row.accountDTO.eaccountRole)" alt /> -->
                      </template>
                    </div>
                    <p>
                      <span>
                        {{
                          scope.row.accountDTO.platform == 1
                            ? '抖音号'
                            : scope.row.accountDTO.platform == 2
                            ? '视频号'
                            : scope.row.accountDTO.platform == 3
                            ? '小红书'
                            : '快手号'
                        }}：{{
                          scope.row.accountDTO.dyDisplayId ? scope.row.accountDTO.dyDisplayId : '--'
                        }}
                      </span>
                      <el-popover
                        v-if="scope.row.accountDTO.dyUId"
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
                        <div class="qrcode_box" v-if="scope.row.accountDTO.dyUId">
                          <qrcode-vue :value="scope.row.accountDTO.dyUId" :size="126" level="H" />
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
                      </el-popover>
                    </p>
                    <div class="pre_time" v-if="scope.row.accountDTO.latestVideoPublishTime">
                      上次发布视频时间：{{ scope.row.accountDTO.latestVideoPublishTime || '--' }}
                    </div>
                    <table_column_department_info
                      className="gray_department_info"
                      :departmentName="scope.row.xuserDeptName"
                      connectStr="/"
                      divisionStr=";"
                      trigger="hover"
                      tipPlacement="right"
                      :showDpeartTitle="true"
                    ></table_column_department_info>
                    <!-- 业务主体 -->
                    <table_column_business_entity :list="scope.row.businessNameList" />
                  </div>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <!-- <el-table-column label="矩阵号类型" prop="fansIncrement2" width="190">
          <template v-slot="{ row }">
            <div>{{ accountType(row) }}</div>
          </template>
        </el-table-column> -->
        <el-table-column label="账号等级" prop="accountLevel" width="190">
          <template v-slot="{ row }">
            <div v-if="row?.accountDTO?.platform !== 1">--</div>
            <div v-else>
              {{ row?.accountDTO?.gradeName }} 指数：{{ numberFormat(row?.accountDTO?.exponent) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="运营者" prop="operator" width="190">
          <template #default="scope">
            <div v-if="scope.row.accountDTO">
              <div
                v-if="scope.row.accountDTO.operatorId"
                class="user_wrap"
                :class="scope.row.accountDTO.fsOpenId ? 'user_wrap_cursor' : ''"
                @click="
                  scope.row.accountDTO.fsOpenId ? toFschat(scope.row.accountDTO.fsOpenId) : ''
                "
              >
                <img
                  v-if="scope.row.accountDTO.operatorHead"
                  :src="scope.row.accountDTO.operatorHead"
                  alt
                />
                <default-photo v-else :name="scope.row.accountDTO.operatorName || '--'" />
                <span
                  :style="
                    scope.row.accountDTO.staffStatus && scope.row.accountDTO.staffStatus == 2
                      ? 'max-width: calc(100% - 96px);'
                      : ''
                  "
                >
                  {{ scope.row.accountDTO.operatorName || '--' }}
                </span>
                <!-- <img
                  v-if="scope.row.accountDTO.fsOpenId"
                  class="fs_icon"
                  src="@/assets/images/content_center/fs.png"
                  alt
                /> -->
                <img
                  v-if="scope.row.accountDTO.iconType === 2"
                  class="fs_icon"
                  src="@/assets/images/user/weChat.png"
                  alt=""
                />
                <img
                  v-if="scope.row.accountDTO.iconType === 1"
                  class="fs_icon"
                  src="@/assets/images/user/feishu.png"
                  alt=""
                />
                <img
                  v-if="scope.row.accountDTO.iconType === 3"
                  class="fs_icon"
                  src="@/assets/images/user/wx.png"
                  alt=""
                />
                <div
                  class="xm_depart"
                  v-if="scope.row.accountDTO.staffStatus && scope.row.accountDTO.staffStatus == 2"
                ></div>
              </div>
              <div v-else>--</div>
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
        <el-table-column
          label="涨粉数"
          prop="fansIncrement"
          width="190"
          sortable="custom"
          column-key="fansIncrement"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.fansIncrement || 0) }}</div>
          </template>
        </el-table-column>
        <!-- v-if="chooseRule == 1" -->
        <el-table-column
          label="总粉丝数"
          prop="fansCount"
          width="190"
          sortable="custom"
          column-key="fansCount"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.fansCount || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="线索数"
          v-if="brandViewMode === 2"
          prop="relatedInfos"
          width="190"
          sortable="custom"
          column-key="relatedInfos"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.relatedInfos || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="总销售额(元)"
          prop="totalSaleAccount"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.totalSaleAccount || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="总销售量"
          prop="totalSaleNum"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.totalSaleNum || 0) }}</div>
          </template>
        </el-table-column>
        <!-- <el-table-column label="平均标价折扣率" prop="avgPriceDiscountRate" width="190">
          <template #default="scope">
            <div>{{ scope.row.avgPriceDiscountRate || '0' }}</div>
          </template>
        </el-table-column> -->

        <el-table-column
          label="直播总场次"
          prop="liveBroadcast"
          width="190"
          sortable="custom"
          column-key="roomSiteCount"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.liveBroadcast || '0') }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播总时长"
          prop="liveDuration"
          width="190"
          class-name="isTime"
          sortable="custom"
          column-key="roomLiveTimeIncrement"
        >
          <template #default="scope">
            <div>{{ scope.row.liveDuration || '0' }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播场均时长"
          prop="avgRoomLiveTimeIncrement"
          width="190"
          class-name="isTime"
          sortable="custom"
          column-key="avgRoomLiveTimeIncrement"
        >
          <template #default="scope">
            <div>{{ scope.row.avgRoomLiveTimeIncrement || '0' }}</div>
          </template>
        </el-table-column>

        <el-table-column label="直播曝光人次" prop="roomWatchPv" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.roomWatchPv || '0') }}</div>
          </template>
        </el-table-column>
        <el-table-column label="直播曝光人数" prop="roomWatchPeople" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.roomWatchPeople || '0') }}</div>
          </template>
        </el-table-column>

        <el-table-column
          label="直播观看人次"
          prop="liveWatchTimes"
          width="190"
          sortable="custom"
          column-key="roomWatchTimes"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.liveWatchTimes || '0') }}</div>
          </template>
        </el-table-column>

        <el-table-column label="直播观看人数" prop="liveWatchUv" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.liveWatchUv || 0) }}</div>
          </template>
        </el-table-column>

        <el-table-column label="直播新加团人数" prop="newGroupNumSum" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.newGroupNumSum || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="直播自然UV" prop="natureUvSum" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.natureUvSum || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="直播付费UV" prop="payedUvSum" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.payedUvSum || 0) }}</div>
          </template>
        </el-table-column>

        <el-table-column label="直播人气峰值" prop="maxOnlineNum" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.maxOnlineNum || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="直播平均在线人数" prop="liveAvgOnlineUv" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.liveAvgOnlineUv || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播人均看播时长"
          prop="liveAvgWatchDuration"
          width="190"
          class-name="isTime"
        >
          <template #default="scope">
            <div>{{ scope.row.liveAvgWatchDuration || '0' }}</div>
          </template>
        </el-table-column>

        <el-table-column
          label="直播销售额(元)"
          prop="liveSaleAccount"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.liveSaleAccount || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播销售量"
          prop="liveSaleNum"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.liveSaleNum || 0) }}</div>
          </template>
        </el-table-column>

        <el-table-column
          label="直播订单数"
          prop="roomSalesOrders"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.roomSalesOrders || 0) }}</div>
          </template>
        </el-table-column>

        <el-table-column
          label="直播UV价值(元)"
          prop="liveUvValue"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.liveUvValue || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播在售商品数"
          prop="roomProductNumSum"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.roomProductNumSum || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播动销商品数"
          prop="roomPayedProductNumSum"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.roomPayedProductNumSum || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播千次观看成交额(元)"
          prop="gpm"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.gpm || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播单小时成交额(元)"
          prop="hourAmount"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.hourAmount || 0) }}</div>
          </template>
        </el-table-column>

        <el-table-column
          label="直播退款金额(元)"
          prop="refundSalesMoney"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.refundSalesMoney || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播退款件数"
          prop="refundSalesGoods"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.refundSalesGoods || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播商品点击人数"
          prop="productClickUvSum"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.productClickUvSum || 0) }}</div>
          </template>
        </el-table-column>

        <el-table-column
          label="直播商品点击率(次数)"
          prop="avgClickGoodsRateFrequency"
          width="190"
          class-name="isRate"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ scope.row.avgClickGoodsRateFrequency || '0' }}%</div>
          </template>
        </el-table-column>

        <el-table-column
          label="直播商品点击率(人数)"
          prop="avgClickGoodsRatePeople"
          width="190"
          class-name="isRate"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ scope.row.avgClickGoodsRatePeople || '0' }}%</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播看播成交转化率"
          prop="avgKanBoChengJiaoRatePeople"
          width="190"
          class-name="isRate"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ scope.row.avgKanBoChengJiaoRatePeople || 0 }}%</div>
          </template>
        </el-table-column>

        <el-table-column
          label="直播点击成交转化率"
          prop="avgClickPayRatePeople"
          width="190"
          class-name="isRate"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ scope.row.avgClickPayRatePeople || 0 }}%</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播客单价(元)"
          prop="keDanJia"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.keDanJia || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播件均价(元)"
          prop="avgProductPrice"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.avgProductPrice || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播连带率"
          prop="multiProductRate"
          width="190"
          class-name="isTime"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ scope.row.multiProductRate || 0 }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播曝光进入转化率"
          prop="exposureIn"
          width="190"
          class-name="isRate"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ scope.row.exposureIn || 0 }}%</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播曝光成交转化率"
          prop="exposureDone"
          width="190"
          class-name="isRate"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ scope.row.exposureDone || 0 }}%</div>
          </template>
        </el-table-column>

        <!-- <el-table-column label="直播场均销售量" prop="liveAvgSaleNum" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.liveAvgSaleNum || 0) }}</div>
          </template>
        </el-table-column> -->
        <el-table-column
          label="直播涨粉数"
          prop="liveFansIncrement"
          width="190"
          sortable="custom"
          column-key="liveFansIncrement"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.liveFansIncrement || '0') }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播点赞数"
          prop="liveDiggIncrement"
          width="190"
          sortable="custom"
          column-key="liveDiggIncrement"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.liveDiggIncrement || '0') }}</div>
          </template>
        </el-table-column>
        <el-table-column label="直播评论数" prop="roomCommentNum" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.roomCommentNum || '0') }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播互动率"
          prop="liveRoomInteractionRate"
          width="190"
          class-name="isRate"
        >
          <template #default="scope">
            <div>{{ scope.row.liveRoomInteractionRate || '0' }}%</div>
          </template>
        </el-table-column>

        <el-table-column
          label="视频数"
          prop="videoCount"
          width="190"
          sortable="custom"
          column-key="videoCount"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.videoCount || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="视频播放数"
          prop="videoPlayCount"
          width="190"
          sortable="custom"
          column-key="videoPlayCount"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.videoPlayCount || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="视频点赞数"
          prop="videoDiggCount"
          width="190"
          sortable="custom"
          column-key="videoDiggCount"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.videoDiggCount || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="视频分享数"
          prop="videoShareCount"
          width="190"
          sortable="custom"
          column-key="videoShareCount"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.videoShareCount || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="视频评论数"
          prop="videoCommentCount"
          width="190"
          sortable="custom"
          column-key="videoCommentCount"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.videoCommentCount || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="视频销售额(元)"
          prop="videoSaleAccount"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.videoSaleAccount || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="视频销售量"
          prop="videoSaleNum"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.videoSaleNum || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="视频完播率"
          prop="videoPlayOverRate"
          width="190"
          class-name="isRate"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ scope.row.videoPlayOverRate || 0 }}%</div>
          </template>
        </el-table-column>
        <el-table-column
          label="视频平均观看时长"
          prop="videoAvgWatchDuration"
          width="190"
          class-name="isTime"
        >
          <template #default="scope">
            <div>{{ scope.row.videoAvgWatchDuration || 0 }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="视频购物车曝光次数"
          prop="videoCartExposureTimes"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.videoCartExposureTimes || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="视频千次观看成交额(元)"
          prop="videoGpm"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.videoGpm || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="视频引流直播间金额(元)"
          prop="videoDrainLiveAmount"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.videoDrainLiveAmount || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="视频引流直播间次数"
          prop="videoDrainLiveTimes"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.videoDrainLiveTimes || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="视频直播入口点击率"
          prop="videoLiveEntranceClickRate"
          width="190"
          class-name="isRate"
        >
          <template #default="scope">
            <div>{{ scope.row.videoLiveEntranceClickRate || 0 }}%</div>
          </template>
        </el-table-column>

        <!-- <el-table-column label="商品卡销售额(元)" prop="otherSalesMoney" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat1(scope.row.otherSalesMoney || 0) }}</div>
          </template>
        </el-table-column> -->
      </xm_table>
    </div>
    <el-dialog v-model="dialogVisible" title="导出文档" width="30%">
      <span>{{ exportMessage }}</span>
      <template #footer>
        <span class="dialog-footer">
          <!-- <el-button @click="dialogVisible = false">Cancel</el-button> -->
          <el-button type="primary" @click="confirmClick(confirm)">{{ confirm }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import qrcodeVue from 'qrcode.vue'
import DefaultPhoto from '../../../system/components/default_photo/index.vue'
import { handleGetList } from './get_list2'
import { wanSliceFormat, numberFormat } from '@/utils/tools.js'
// 图片
import matrixTypep from '@/assets/images/content_center/matrix_typep.png'
import matrixTyper from '@/assets/images/content_center/matrix_typer.png'
import { useStore } from 'vuex'
// import { defineComponent } from 'vue'
// import { ElMessage } from 'element-plus'
// import EventBus from './bus.js'

const props = defineProps({
  recordInfo: {
    type: Object,
    default: () => {
      return {}
    }
  },
  tableHeight: {
    type: Number,
    default: null
  },
  groupId: {
    type: String,
    default: ''
  }
})
console.warn('838383', props.groupId)

// export default defineComponent({
// components: {
//   //   liveAnimation
//   qrcodeVue,
//   DefaultPhoto
// },
// methods: {
//   wanSliceFormat
// },
// props: {
//   recordInfo: {
//     type: Object,
//     default: () => {
//       return {}
//     }
//   },
//   tableHeight: {
//     type: Number,
//     default: null
//   }
// },
// setup(props) {
const store = useStore()
const brandViewMode = computed(() => store.state.user.brandViewMode)
const showEmployeeId = computed(() => store.state.user.showEmployeeId)
const tableHeight = ref(null)
const initOver = ref(false)
onMounted(() => {
  tableHeight.value = props.tableHeight
  // EventBus.$on('operateReportSearchChange', info => {
  //   init(info)
  // })
  if (props.recordInfo.startTime) {
    defaultTime.value = [new Date(props.recordInfo.startTime), new Date(props.recordInfo.endTime)]
    // nextTick(() => {
    xuserIds.value = props.recordInfo.xuserIds
    if (props.recordInfo.oldJiagou && props.recordInfo.oldJiagou.length > 0) {
      const checkNodes = JSON.parse(JSON.stringify(props.recordInfo.oldJiagou))
      const checkIds = []
      checkNodes.forEach(x => {
        checkIds.push(x.fullIds[x.fullIds.length - 1])
      })
      jiagou.value = checkIds
      jiagouFullIds.value = checkNodes
    } else {
      jiagou.value = []
      jiagouFullIds.value = []
    }
    nextTick(() => {
      initOver.value = true
    })
  } else {
    const time = initTime()
    defaultTime.value = [time.startTime, time.endTime]
    initOver.value = true
  }
  handleImgSrc()
  getList()

  getSummary()
  // getAccountList()
})
const avatarImg = ref('')
const brandIcon = ref('')
const handleImgSrc = async () => {
  const m = await import('@/assets/images/content_center/default_user.png')
  avatarImg.value = m.default
  const m1 = await import('@/assets/images/content_center/brand_icon.png')
  brandIcon.value = m1.default
}
const {
  defaultTime,
  xuserIds,
  jiagou,
  jiagouFullIds,
  searchComponents,
  tableForm,
  // chooseRule,
  // fullscreenLoading,
  dialogVisible,
  exportMessage,
  confirm,
  resetSearch,
  // changeTab,
  // handleChange,
  getList,
  getSummary,
  // getAccountList,
  exportReport,
  confirmClick,
  // init,
  initTime,
  sortMoney
} = handleGetList(props.groupId, showEmployeeId.value)

function wanSliceFormat1(e) {
  return wanSliceFormat(e)
}

function toDetails(item) {
  if (item) {
    window.open(`${location.origin}/content_center/content_matrix/details?openId=` + item, '_blank')
  } else {
    return ''
  }
}

// 跳转飞书聊天
function toFschat(openId) {
  window.open(`https://applink.feishu.cn/client/chat/open?openId=${openId}`)
}

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

function summaryMethod({ columns, data }) {
  const sums = []
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '汇总'
      return
    }
    if (
      ['accountDTO', 'fansIncrement2', 'operator', 'accountLevel', 'thirdPartyStaffId'].indexOf(
        column.property
      ) !== -1
    ) {
      sums[index] = '--'
      return
    }
    const res = tableForm.summaryData[column.property] || 0
    sums[index] =
      column.className === 'isRate'
        ? res + '%'
        : column.className === 'isTime'
        ? res
        : wanSliceFormat(res)
    return sums
  })
  return sums
}

// 抖音号账号类型 个人号 企业号
// const accountType = item => {
//   const row = item?.accountDTO
//   if (!row || row?.platform !== 1) {
//     return '-'
//   }
//   const typeObj = {
//     EAccountM: '普通企业号',
//     EAccountS: '认证企业号',
//     EAccountK: '品牌企业号'
//   }
//   return typeObj[row?.eaccountRole] ? typeObj[row?.eaccountRole] : '个人号'
// }
const expButton = ref(null)
function querySearch() {
  const time = toRaw(searchComponents.value.find(item => item.type === 'dateRange').val)
  const range = time[1].getTime() - time[0].getTime()
  if (range > 30 * 24 * 60 * 60 * 1000) {
    // ElMessage.warning('时间跨度超过30天，请导出报表查看')
    // 不能查询的时候自动帮用户导出数据
    expButton.value?.showTipDialog(30)
    return
  }
  tableForm.page.index = 1
  getList()
  getSummary()
}

//     return {
//       brandViewMode,
//       defaultTime,
//       xuserIds,
//       avatarImg,
//       brandIcon,
//       searchComponents,
//       tableForm,
//       chooseRule,
//       // fullscreenLoading,
//       dialogVisible,
//       exportMessage,
//       confirm,
//       querySearch,
//       resetSearch,
//       rangeTimeChange,
//       changeTab,
//       handleChange,
//       getTypeImg,
//       toDetails,
//       toFschat,
//       wanSliceFormat1,
//       exportReport,
//       confirmClick,
//       getList,
//       init,
//       initTime,
//       summaryMethod,
//       accountType
//     }
//   }
// })
</script>

<style lang="scss" scoped>
.page_main {
  position: relative;
  padding-bottom: 11px;

  .import_box {
    position: absolute;
    right: 24px;
    top: 11px;

    .btn {
      margin-left: 24px;
    }
  }
}

// :deep(.el-table__footer .cell) {
//   padding-left: 14px !important;
// }
:deep(.el-table__footer > tbody > tr > td) {
  &:nth-of-type(1) {
    width: 300px;
  }
}

@import './index.scss';
@import '../../components/css/qrcode.scss';
</style>
