<template>
  <div class="live_detail" v-loading="infoLoading">
    <!-- 直播信息+达人信息 -->
    <div class="detail_left">
      <div class="one_left">
        <div class="left_title">
          <div class="title">
            <img src="@/assets/images/content_center/live.png" alt />
            直播信息
            <div class="tip" style="margin-left: 4px">
              <el-tooltip placement="right">
                <template #content>
                  1、直播中：每15分钟更新一次
                  <br />
                  2、已下播：下播后每6小时更新一次，持续更新三天
                </template>
                <img
                  style="
                    width: 16px;
                    height: 16px;
                    object-fit: contain;
                    display: flex;
                    margin-left: 4px;
                  "
                  src="https://tagvv-1256030678.file.myqcloud.com/20230609cffz6.png"
                  alt=""
                />
              </el-tooltip>
            </div>
          </div>
          <template v-if="!showTip">
            <el-button v-if="videoListTotal > 0" size="small" @click="toggleShowVideo">
              查看{{ showVideo ? '数据' : '录屏' }}
            </el-button>
            <p style="font-size: 14px; color: #909399" v-else>暂无录屏</p>
          </template>
          <template v-else>
            <el-tooltip placement="right">
              <template #content>
                {{ showTip }}
              </template>
              <p class="none_tip">
                无录屏数据
                <img src="https://tagvv-1256030678.file.myqcloud.com/20230609cffz6.png" alt="" />
              </p>
            </el-tooltip>
          </template>
        </div>
        <div class="info_box">
          <div class="info_head">
            <el-image v-if="byInfo.roomPhoto" :src="byInfo.roomPhoto" alt class="live_img">
              <template #error>
                <div class="live_img errImg_box"></div>
              </template>
            </el-image>
            <img
              v-else
              src="@/assets/images/content_center/default_cover.png"
              class="live_img"
              alt
            />
            <liveAnimation v-if="byInfo.roomStatus === 1"></liveAnimation>
            <div class="play_box" @click="playLive">
              <img src="@/assets/images/content_center/inspection_play.png" alt />
            </div>
          </div>
          <div class="info_content">
            <div class="content1">
              <div class="content_text row_overflow2">{{ byInfo.roomTitle || '--' }}</div>
              <el-popover
                v-if="byInfo.roomStatus === 1"
                placement="bottom"
                popper-class="qrcode_popper"
                width="154px"
                trigger="click"
              >
                <template #reference>
                  <img src="@/assets/images/content_center/qrcode.png" alt />
                </template>
                <div class="qrcode_box">
                  <qrcode-vue
                    v-if="roomId"
                    :value="localOrign + '/sumflyh5/activity?roomId=' + roomId"
                    :size="126"
                    level="H"
                  />
                  <div class="qr_mark" v-if="byInfo.roomUrl">
                    <img
                      src="https://tagvv-1256030678.cos.ap-shanghai.myqcloud.com/img/202111061652346e85b3672b.png"
                      alt
                    />
                    抖音扫码观看
                  </div>
                  <div class="qr_mark" v-else style="margin: 0">暂未找到相关地址</div>
                </div>
              </el-popover>
            </div>
            <div class="content2">开播时间：{{ byInfo.liveStartTime || '--' }}</div>
            <!-- <div class="content2" v-if="byInfo.living">正在直播</div> -->
            <div class="content2" v-if="byInfo.roomStatus !== 1">
              下播时间：{{ byInfo.liveEndTime || '--' }}
            </div>
            <div class="content2">开播时长：{{ byInfo.liveDurationTimeStr || '--' }}</div>
          </div>
        </div>
        <div class="expired-video" v-if="showVideo && videoExpired">
          <img
            src="https://tagvv-1256030678.file.myqcloud.com/20221226tz8r4.png"
            style="width: 100px; height: 100px"
            alt=""
          />
          <div class="expired-title">内容已过期</div>
          <div class="expired-tips">直播前对应矩阵号未开启直播录屏开关或直播已超过30天</div>
        </div>
        <div class="expired-video" v-if="!videoUrl && showVideo && !videoExpired">
          <img
            src="https://tagvv-1256030678.file.myqcloud.com/20221226tz8r4.png"
            style="width: 100px; height: 100px"
            alt=""
          />
          <div class="expired-title">正在生成中，请稍等...</div>
        </div>
        <template v-if="videoUrl">
          <replay-video
            v-show="showVideo && !videoExpired"
            ref="videoRef"
            :videoList="videoList"
            :video="video"
            :videoUrl="videoUrl"
            @showMask="clickShowMask"
            @shareLeave="shareLeave"
            @timeupdate="timeupdate"
          />
        </template>

        <div class="live-tips" v-if="showVideo && !videoExpired & false">
          <el-icon style="margin-right: 5px"><i-warning /></el-icon>
          录屏文件保存3个月
        </div>
        <!--   弹幕内容     -->
        <talk-tab
          v-if="false"
          :talkList="talkList"
          :talkListTotal="talkListTotal"
          ref="talkTab"
        ></talk-tab>
        <infoBY
          v-show="!showVideo"
          :haveBy="haveBy"
          :liveData="byInfo"
          :statusInfo="statusInfo"
          :launchData="launchData"
        />
      </div>
      <div class="one_left" v-show="!showVideo">
        <div class="left_title">
          <div class="title">
            <img src="@/assets/images/content_center/user.png" alt />
            账号信息
          </div>
        </div>
        <div class="info_box">
          <img
            @click="toDetail"
            :style="
              byInfo.roomStat.xuserIsDel && byInfo.roomStat.xuserIsDel == 1
                ? 'cursor: default'
                : 'cursor: pointer'
            "
            v-if="byInfo.roomStat.avatar"
            :src="byInfo.roomStat.avatar"
            alt
            class="info_avatar"
          />
          <img
            @click="toDetail"
            :style="
              byInfo.roomStat.xuserIsDel && byInfo.roomStat.xuserIsDel == 1
                ? 'cursor: default'
                : 'cursor: pointer'
            "
            v-else
            src="@/assets/images/content_center/default_user.png"
            class="info_avatar"
            alt
          />
          <el-tooltip
            effect="dark"
            v-if="byInfo.roomStat.openIdAuthStatusVo.dyAuth == 2"
            placement="top-start"
          >
            <template #content>
              <div style="max-width: 300px">
                {{ byInfo.roomStat.openIdAuthStatusVo.dyAuth == 2 ? '抖音授权失效' : '' }}
              </div>
            </template>
            <img class="expired_img" src="@/assets/images/content_center/warning_icon.png" alt />
          </el-tooltip>
          <div class="info_content" style="max-width: calc(100% - 60px)">
            <div class="content1" style="margin-top: 3px">
              <!-- <el-tooltip effect="dark" placement="top-start" v-if="byInfo.name">
                <template #content>
                  <div style="max-width: 300px">{{ byInfo.name || '--' }}</div>
              </template>-->
              <div class="content_text content_text_name" style="max-width: 100%; width: 100%">
                <div class="row_overflow2">
                  {{ byInfo.roomStat.nickName || '--' }}
                </div>
                <!-- 矩阵号被删除 -->
                <div
                  class="xm_delClass"
                  v-if="byInfo.roomStat.xuserIsDel && byInfo.roomStat.xuserIsDel == 1"
                ></div>
              </div>
              <!-- </el-tooltip>
              <div class="content_text row_overflow" v-else>--</div>-->
            </div>
            <div class="content2">粉丝数 {{ wanSliceFormat(byInfo.roomStat.fansNum || 0) }}</div>
            <div
              v-if="byInfo.roomStat.operator && byInfo.roomStat.operator.operatorName"
              class="fs_user_box content2"
              :style="byInfo.roomStat.operator.fsOpenId ? 'cursor: pointer' : ''"
              @click="
                byInfo.roomStat.operator.fsOpenId ? toFschat(byInfo.roomStat.operator.fsOpenId) : ''
              "
            >
              <div style="max-width: calc(100% - 21px)" class="line-hidden1">
                运营者：{{ byInfo.roomStat.operator.operatorName || '--' }}
              </div>
              <img
                v-if="byInfo.roomStat.operator.fsOpenId"
                style="width: 18px; margin-left: 3px"
                src="@/assets/images/content_center/fsChat.png"
                alt=""
              />
            </div>
          </div>
        </div>
        <div class="num_box" style="border: none; margin: 0">
          <div class="one_num">
            <div class="num_o">
              <div class="num1">{{ wanSliceFormat(byInfo.roomStat.liveNum || 0) }}</div>
              <div class="num2">直播场次</div>
            </div>
          </div>
          <div class="one_num">
            <div class="num_o">
              <div class="num1">
                {{
                  secondToDate(
                    byInfo.roomStat.avgLiveDuration ? byInfo.roomStat.avgLiveDuration * 60 : 0,
                    'm',
                    false
                  )
                }}
              </div>

              <div class="num2">平均直播时长</div>
            </div>
          </div>
          <div class="one_num">
            <div class="num_o">
              <div class="num1">{{ wanSliceFormat(byInfo.roomStat.avgWatchNum || 0) }}</div>
              <div class="num2">平均观看人次</div>
            </div>
          </div>
        </div>
        <div class="more_btn">
          <!-- 矩阵号被删除就没有Ta的更多数据 -->
          <el-button
            @click="toDetail"
            v-if="!(byInfo.roomStat.xuserIsDel && byInfo.roomStat.xuserIsDel == 1)"
          >
            Ta的更多数据
          </el-button>
        </div>
      </div>
    </div>
    <!-- 数据概览+效果分析 -->
    <div class="detail_right">
      <div class="action_btn">
        <div class="err_box1" v-if="statusInfo.byAuth === 2">
          <img class="err_img" src="@/assets/images/content_center/warning_icon.png" alt="" />
          当前账号百应授权已失效
        </div>
        <div v-if="statusInfo.byAuth != 1 || statusInfo.shopAuth != 1">
          <el-tooltip
            trigger="hover"
            effect="light"
            placement="bottom-end"
            popper-class="auth_tooltip"
          >
            <template #content>
              <div class="auth_box">
                <div class="one_auth" v-if="statusInfo.byAuth != 1">
                  <div class="auth_top">
                    <div class="top_left">更多直播间数据</div>
                    <div class="top_right">
                      <el-link type="primary" @click="toAuth('by')">去授权 ></el-link>
                    </div>
                  </div>
                  <div class="auth_bottom">
                    授权百应账号后可获得更多直播间数据，包括平均在线时长、平均在线人数、付费流量、自然流量、互动率、流量转化分析、短视频引流分析、销售转化率、商品点击率等
                  </div>
                </div>
                <div class="one_auth" v-if="statusInfo.shopAuth != 1">
                  <div class="auth_top">
                    <div class="top_left">直播间带货转化数据</div>
                    <div class="top_right">
                      <el-link type="primary" @click="toAuth('shop')">去授权 ></el-link>
                    </div>
                  </div>
                  <div class="auth_bottom">
                    授权抖店后可获得直播间带货相关数据，包括直播间销售额、商品销售数据、订单详情数据、UV价值、千次观看成交额、客单价、连带率等
                  </div>
                </div>
              </div>
            </template>
            <div class="auth_mark">
              查看更多数据维度
              <img src="https://tagvv-1256030678.file.myqcloud.com/20230609cffz6.png" alt="" />
            </div>
          </el-tooltip>
        </div>
      </div>
      <el-tabs class="tab_box hide_underline" v-model="chooseTab">
        <el-tab-pane label="数据概览" name="dataOverview">
          <baiyingOverviewVue :roomId="roomId" :showTab="chooseTab" :statusInfo="statusInfo">
            <template v-if="isShow">
              <div class="live_replay_body_chart" v-show="statusInfo.byStatus === 1">
                <div class="check-tips-warpper flex just-center">
                  <div
                    class="tips-item flex align-center m-right-32"
                    :class="{ active: chartsChangeLine[item.value] }"
                    @click="sortChartsLine(item.value, item.poistion, item.dataTool)"
                    v-for="(item, index) in lineLegend"
                    :key="index"
                  >
                    <div
                      class="box flex just-center align-center"
                      :style="{ background: chartsChangeLine[item.value] ? item.color : '#909399' }"
                    >
                      <i
                        class="iconfont icon-gou"
                        style="color: #fff; font-weight: bold; font-size: 14px"
                      ></i>
                    </div>
                    <div class="tips-text">
                      {{ item.label }}
                      <!-- <span>
                        [
                        {{
                          ['fkjs', 'jcrs', 'zxrs'].indexOf(item.value) !== -1
                            ? wanSliceFormat(aboutData[item.value] || 0)
                            : wanSliceFormat((aboutData[item.value] || 0).toFixed(2))
                        }}
                        ]
                      </span> -->
                    </div>
                  </div>
                  <div class="tips-item flex align-center m-right-32"></div>
                  <div class="tips-item flex align-center m-right-32"></div>
                </div>
                <div class="check-tips-warpper check2 flex just-center">
                  <div
                    class="tips-item flex align-center m-right-32"
                    :class="{ active: chartsChangeLine[item.value] }"
                    @click="sortChartsLine(item.value, item.poistion, item.dataTool)"
                    v-for="(item, index) in lineLegend2"
                    :key="index"
                  >
                    <div
                      class="box flex just-center align-center"
                      :style="{ background: chartsChangeLine[item.value] ? item.color : '#909399' }"
                    >
                      <!-- <i class="el-icon-check" style="color: #fff; font-weight: bold"></i> -->
                      <i
                        class="iconfont icon-gou"
                        style="color: #fff; font-weight: bold; font-size: 14px"
                      ></i>
                    </div>
                    <div class="tips-text">
                      {{ item.label }}
                      <!-- <span>
                        [
                        {{
                          ['fkjs', 'jcrs', 'zxrs'].indexOf(item.value) !== -1
                            ? wanSliceFormat(aboutData[item.value] || 0)
                            : wanSliceFormat((aboutData[item.value] || 0).toFixed(2))
                        }}
                        {{ ['hdl', 'zfl'].indexOf(item.value) !== -1 ? '%' : '' }} ]
                      </span> -->
                    </div>
                  </div>
                  <div class="tips-item flex align-center m-right-32"></div>
                  <br />
                </div>
                <div v-loading="showChart" style="min-height: 400px">
                  <replay-chart
                    :chartsData="chartsDataTool1"
                    ref="chartsDataTool1"
                    :chartsHeight="200"
                    v-if="!showChart"
                  />
                  <div style="height: 10px"></div>
                  <replay-chart
                    :chartsData="chartsDataTool2"
                    ref="chartsDataTool2"
                    :chartsHeight="200"
                    v-if="!showChart"
                  />
                </div>
                <div class="video-time-warpper flex align-center">
                  <div class="video-desc-title"></div>
                  <div class="video-time-warpper">
                    <template v-if="realTimeXList.length > 0">
                      <div
                        class="time-item"
                        :style="{ left: item.left + 'px' }"
                        v-for="(item, index) in realTimeXList"
                        :key="`realTimeXList${index}`"
                      >
                        <div class="line"></div>
                        <div class="time-text">{{ item.text }}</div>
                      </div>
                    </template>
                    <div
                      class="move-time-sub"
                      :style="{
                        left:
                          aboutData.croseClickLineLeft === 0
                            ? '0px'
                            : aboutData.croseClickLineLeft - aboutData.leftMargin + 'px'
                      }"
                    >
                      <div class="flex align-center">
                        <svg
                          t="1629798235468"
                          class="icon"
                          viewBox="0 0 1075 1024"
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          p-id="4737"
                          width="10"
                          height="10"
                        >
                          <path
                            d="M526.2336 1001.2672c-142.1312-3.2768-260.2496-51.968-354.4576-146.2272C77.568 760.8832 28.8768 642.7136 25.6 500.6336c3.2768-142.1312 51.968-260.2496 146.176-354.4576C265.984 51.968 384.1024 3.2768 526.2336 0c142.08 3.2768 260.2496 51.968 354.4064 146.176 94.208 94.208 142.9504 212.3264 146.2272 354.4576-3.2768 142.08-52.0192 260.2496-146.2272 354.4064-94.1568 94.208-212.3264 142.9504-354.4064 146.2272z m0-500.6336v-281.6a31.2832 31.2832 0 1 0-62.5664 0v312.832c0 17.3056 13.9776 31.3344 31.232 31.3344h250.368a31.2832 31.2832 0 1 0 0-62.5664h-219.0336z"
                            p-id="4738"
                            fill="#ffffff"
                          />
                        </svg>
                        <span class="m-left-4">{{ aboutData.croseClickLineText }}</span>
                      </div>
                      <div class="flex align-center">
                        <svg
                          t="1629798177000"
                          class="icon"
                          viewBox="0 0 1024 1024"
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          p-id="3597"
                          width="10"
                          height="10"
                        >
                          <path
                            d="M844.8 610.133333L311.466667 960c-55.466667 34.133333-128 21.333333-162.133334-29.866667-12.8-17.066667-21.333333-42.666667-21.333333-64V157.866667C128 93.866667 179.2 42.666667 247.466667 42.666667c21.333333 0 46.933333 8.533333 64 21.333333l533.333333 354.133333c55.466667 34.133333 68.266667 106.666667 34.133333 162.133334-12.8 8.533333-21.333333 21.333333-34.133333 29.866666z"
                            p-id="3598"
                            fill="#ffffff"
                          />
                        </svg>
                        <span class="m-left-4">{{ getVideoTime() }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="video-time-right"></div>
                </div>
                <charts-tips :chartsTipsData="chartsTipsData"></charts-tips>
                <div
                  class="category-desc-warpper time-scale-warpper flex align-center"
                  style="margin-top: 40px"
                >
                  <div class="category-desc-title"></div>
                  <div class="category-time-warpper">
                    <div
                      class="scale-bg"
                      :style="{ width: timeScale.bgWidth + 'px', left: timeScale.bgLeft + 'px' }"
                    ></div>
                    <div
                      class="left"
                      :class="{ 'a-zindex': timeScale.activeArrow === 'left' }"
                      @mousedown="leftConDown"
                      :style="{ left: timeScale.conLeft + 'px' }"
                    ></div>
                    <div
                      class="right"
                      :class="{ 'a-zindex': timeScale.activeArrow === 'right' }"
                      @mousedown="rightConDown"
                      :style="{ left: timeScale.conRight + 8 + 'px' }"
                    ></div>
                  </div>
                  <div class="category-time-right"></div>
                </div>
                <div class="category-desc-warpper flex align-center">
                  <div class="category-desc-title">商品讲解</div>
                  <div class="category-time-warpper">
                    <div
                      class="category-point"
                      v-for="(item, index) in ProductsInfoCopyList"
                      :key="index"
                      :style="{ left: item.left + 'px' }"
                      ref="prodectRef"
                      @click="productClick(item)"
                    >
                      <el-tooltip class="item" placement="top" effect="light">
                        <template #content>
                          <div class="tooltip-con-shop-desc">
                            <div class="shop-at-time">
                              {{ byInfo.liveStartTime.split(' ')[0] }} {{ item.atTime }} （{{
                                item.minute
                              }}min）
                            </div>
                            <div class="shop-sub flex">
                              <img :src="item.cover" alt="" />
                              <div class="lib-desc flex col just-b">
                                <div class="lib-title two-hidden">{{ item.name }}</div>
                                <div class="lib-money">￥{{ item.retailPrice }}</div>
                              </div>
                            </div>
                          </div>
                        </template>
                        <span style="font-size: 12px; opacity: 0; display: flex">1</span>
                      </el-tooltip>
                    </div>
                  </div>
                  <div class="category-time-right"></div>
                </div>
                <div class="category-desc-warpper anchorList-warpper flex align-center">
                  <div class="category-desc-title">排班</div>
                  <div class="category-time-warpper">
                    <div
                      class="category-point normal flex align-center warp"
                      v-for="(item, index) in anchorInfoList"
                      :key="index"
                      :style="{
                        left: item.left + 'px',
                        width: item.width + 'px',
                        background: item.color
                      }"
                      ref="prodectRef"
                    >
                      <el-tooltip class="item" effect="light" placement="top">
                        <div
                          class="anchorList-warpper flex just-center align-center"
                          style="padding-left: 50px"
                        >
                          <div
                            class="anchorList"
                            v-for="(row, index1) in item.anchorArr"
                            :key="`anchorList${index1}`"
                          >
                            <span>{{ row.name }}</span>
                          </div>
                          <!-- <div class="gmvAmount">（￥{{ item.gmvAmount }}）</div> -->
                          <div class="gmvAmount"></div>
                        </div>
                        <template #content>
                          <div class="tooltip-con-anchor-desc">
                            <div
                              class="anchor-item flex"
                              v-for="(row, index) in item.staffList"
                              :key="`img${index}`"
                            >
                              <div class="anchor-item-img">
                                <img :src="row.photo" alt="" v-if="row.photo" />
                                <div class="img-no flex just-center align-center" v-else>
                                  {{ row.name.substr(-2) }}
                                </div>
                              </div>
                              <div class="anchor-name flex col just-b line-hidden">
                                <div class="line-hidden">{{ row.name }}</div>
                                <role_tag v-if="row.roleName" :role="row.roleName" />
                              </div>
                            </div>
                            <div
                              class="anchor-no-data flex just-center"
                              v-if="item.staffList.length === 0"
                            >
                              暂无团队信息
                            </div>
                          </div>
                        </template>
                      </el-tooltip>
                    </div>
                  </div>
                  <div class="category-time-right"></div>
                </div>

                <div
                  class="cross-line"
                  v-show="crossShow"
                  :style="{ left: aboutData.croseLineLeft + 'px' }"
                ></div>
                <div
                  class="cross-line click-sure"
                  :style="{
                    left:
                      aboutData.croseClickLineLeft === 0
                        ? '92px'
                        : `${aboutData.croseClickLineLeft}px`
                  }"
                ></div>
                <div
                  class="event-marsk"
                  @mousemove="toolTipOver"
                  @mouseout="toolTipOut"
                  @click="eventClick"
                  @mouseleave="toolTipOut"
                ></div>
              </div>
            </template>
            <template v-else>
              <div class="no_data">
                <img src="@/assets/images/content_center/no_data.png" alt />
                <p>暂无数据</p>
              </div>
            </template>
          </baiyingOverviewVue>
        </el-tab-pane>
        <el-tab-pane label="线索数据" name="cluesData" :lazy="true">
          <clueData :roomId="roomId"></clueData>
        </el-tab-pane>
        <el-tab-pane label="流量分析" name="traffic" v-if="statusInfo.byStatus === 1">
          <baiyingFlows
            :flowAnalysis="byFlows.flowAnalysis"
            :flowConversion="byFlows.flowConversion"
            :haveBy="haveBy"
          ></baiyingFlows>
          <baiyingVideoTable :roomId="roomId" :haveBy="haveBy"></baiyingVideoTable>
        </el-tab-pane>
        <el-tab-pane label="销售数据" name="ecommerceData" v-if="statusInfo.shopAuth === 1">
          <ecommerceData :roomId="roomId" :haveBy="haveBy"></ecommerceData>
        </el-tab-pane>
        <el-tab-pane
          label="直播小组统计"
          name="liveGroupStatistics"
          v-if="statusInfo.shopAuth === 1 && false"
        >
          <live-group-statistics></live-group-statistics>
        </el-tab-pane>
      </el-tabs>
    </div>
    <share :data="shareAbout" @hideMask="hideMask" @enterS="enterS" v-if="ismaskshow"></share>
  </div>
</template>
<script>
import qrcodeVue from 'qrcode.vue'
import { useRoute, useRouter } from 'vue-router'
import liveAnimation from '../components/live_animation.vue'
import infoBY from './components/info/info_baiying.vue'
import baiyingOverviewVue from './components/overview/baiying_overview.vue'
import ecommerceData from './components/ecommerce/ecomerce_data.vue'
import ReplayVideo from './components/replay/replay_video.vue'
import ReplayChart from './components/replay/replay_chart.vue'
import baiyingVideoTable from './components/overview/baiying_vedeo_table.vue'
import baiyingFlows from './components/overview/baiying_flows.vue'
import TalkTab from './components/replay/TalkTab.vue'
import ChartsTips from './components/replay/ChartsTips.vue'
import liveGroupStatistics from './components/live_group_statistics.vue'
import clueData from './components/overview/clue_data.vue'
import { pageInfo } from './model/get_liveInfo.js'
import { wanSliceFormat, secondToDate, throttle, isNotEmpty } from '@/utils/tools'
import { getFlowsTwo } from './model/data_overview/get_by_flows_two.js'
import share from './components/replay/share_mask.vue'
import { getShare } from './model/data_overview/get_share.js'
import {
  getLiveRoomVideo,
  getMessage,
  getLiveTrendByRoomId,
  getVideoInfo,
  selectEventRibbon,
  getAnchorInfo
} from '@/api/content_center/live_center.js'
import { format } from 'date-fns'

export default {
  name: 'liveDetail',
  components: {
    liveAnimation,
    qrcodeVue,
    ecommerceData,
    baiyingOverviewVue,
    infoBY,
    baiyingVideoTable,
    baiyingFlows,
    ReplayVideo,
    ReplayChart,
    TalkTab,
    ChartsTips,
    liveGroupStatistics,
    share,
    clueData
  },
  data() {
    return {
      showTip: '',
      chartsTipsData: {
        left: 10,
        show: false,
        jcrs: 0, // 进场人数
        zxrs: 0, // 在线人数
        zhl: 0, // 转化率
        zfl: 0, // 转粉率
        hdl: 0, // 互动率
        fkje: 0, // 付款金额
        fkjs: 0, // 付款件数
        uvjz: 0, // uv价值
        xh: 0,
        zbjgks: 0,
        pjdjdw: 0,
        zss: 0,
        zhs: 0,
        djs: 0,
        zbjcgyfzgks: 0,
        zbjgzs: 0,
        djl: 0,
        pjqczsfy: 0,
        zjdjs: 0,
        zjdjl: 0,
        zjdjcb: 0,
        cb: 0
      },
      crossShow: false,
      moveChartWarpper: {},
      showVideo: false,
      videoList: [],
      videoListTotal: -1,
      shopCardShow: false,
      shopCardInfo: {},
      videoUrl: null,
      videoTime: 0,
      lostType: false,
      lostTime: '1970-01-01',
      video: {
        width: 272,
        height: 422,
        iconShow: true,
        isPause: true,
        coverShow: true,
        isClick: false,
        ratio: 1,
        copyTime: 0,
        currentTime: 0,
        timeArr: [],
        cover: '',
        isLoading: false,
        volume: 1
      },
      aboutData: {
        startTime: null,
        endTime: null,
        startDay: null,
        endDay: null,
        totalMin: null,
        totalSeconds: null,
        width: null,
        r: null,
        croseLineLeft: 0,
        croseClickLineLeft: 0,
        startTotalSeconds: 0,
        croseLineText: '00:00',
        croseClickLineText: '00:00',
        jcrs: 0, // 进场人数
        zxrs: 0, // 在线人数
        zhl: 0, // 转化率
        zfl: 0, // 转粉率
        hdl: 0, // 互动率
        fkje: 0, // 付款金额
        fkjs: 0, // 付款件数
        uvjz: 0, // uv价值

        leftMargin: 92,
        rightMargin: 30
      },
      timeScale: {
        bgWidth: 0,
        bgLeft: 0,
        conLeft: 0,
        conRight: 0,
        totalMin: 0,
        leftIndex: 0,
        rightIndex: 0,
        activeArrow: '',
        leftTotal: 0,
        rightTotal: 0
      },
      chartsData: {},
      copyChartsData: {},
      ProductsInfoList: [],
      ProductsInfoCopyList: [], // 商品讲解转换数据
      anchorInfoList: [],
      chartsDataTool1: {},
      chartsDataTool2: {},
      chartsDataTool11: {},
      chartsDataTool22: {},
      realTimeXList: [],
      talkList: [],
      talkListTotal: -1,
      chartsChangeLine: {
        jcrs: true,
        zxrs: true,
        zhl: true,
        zfl: true,
        hdl: true,
        zrll: true,
        ffll: true,
        fkje: true,
        uvjz: true,
        rjkbsc: true,
        fkjs: true,
        xh: true,
        zbjgks: true,
        pjdjdw: true,
        zss: true,
        zhs: true,
        djs: true,
        zbjcgyfzgks: true,
        zbjgzs: true,
        djl: true,
        pjqczsfy: true,
        zjdjs: true,
        zjdjl: true,
        zjdjcb: true,
        cb: true
      },
      legendType: [
        {
          label: 'jcrs',
          value: 0
        },
        {
          label: 'fkjs',
          value: 3
        },
        {
          label: 'zxrs',
          value: 8
        },
        {
          label: 'fkje',
          value: 11
        },
        {
          label: 'hdl',
          value: 80
        },
        {
          label: 'zfl',
          value: 81
        },
        {
          label: 'uvjz',
          value: 82
        },
        {
          label: 'ffll',
          value: 100
        },
        {
          label: 'zrll',
          value: 101
        }
      ],
      lineLegend: [
        {
          label: '进场人数',
          value: 'jcrs',
          color: '#1966ff',
          poistion: 'left',
          dataTool: 'chartsDataTool1'
        },
        {
          label: '在线人数',
          value: 'zxrs',
          color: '#ff6666',
          poistion: 'left',
          dataTool: 'chartsDataTool1'
        },
        {
          label: '付费流量',
          value: 'ffll',
          color: '#FF4797',
          poistion: 'left',
          dataTool: 'chartsDataTool1'
        },
        {
          label: '自然流量',
          value: 'zrll',
          color: '#FF66EB',
          poistion: 'left',
          dataTool: 'chartsDataTool1'
        }
      ],
      lineLegend2: [
        {
          label: '付款金额',
          value: 'fkje',
          color: '#ffa666',
          poistion: 'right',
          dataTool: 'chartsDataTool2'
        },
        {
          label: '互动率',
          value: 'hdl',
          color: '#A347FF',
          poistion: 'left',
          dataTool: 'chartsDataTool2'
        },
        {
          label: 'UV价值',
          value: 'uvjz',
          color: '#22CAFF',
          poistion: 'left',
          dataTool: 'chartsDataTool2'
        },
        {
          label: '转粉率',
          value: 'zfl',
          color: '#FFDE66',
          poistion: 'left',
          dataTool: 'chartsDataTool2'
        },
        {
          label: '付款件数',
          value: 'fkjs',
          color: '#0bd7f2',
          poistion: 'left',
          dataTool: 'chartsDataTool2'
        }
      ],
      filterChartData: {},
      showChart: true,
      isShow: true
    }
  },
  setup(props, context) {
    const localOrign = location.origin
    const message = inject('$message')
    const router = useRouter()
    const route = useRoute()
    const roomId = route.query.roomId || ''
    const dyOpenId = route.query.dyOpenId || ''
    // 分享相关,传roomId
    const { shareAbout } = getShare(roomId)
    // 直播信息
    const { infoLoading, haveBy, byInfo, statusInfo } = pageInfo(roomId)
    const chooseTab = ref('dataOverview')

    // 跳转详情页
    const toDetail = throttle(() => {
      // 如果矩阵号被删除，就不能跳转
      if (byInfo.value.roomStat.xuserIsDel && byInfo.value.roomStat.xuserIsDel === 1) {
        return
      }
      if (byInfo.value.roomStat.openId) {
        router.push({
          path: '/content_center/content_matrix/details',
          query: {
            openId: byInfo.value.roomStat.openId
          }
        })
      } else {
        message({
          type: 'warning',
          message: '暂未获取到账号相关信息'
        })
      }
    }, 700)
    const playLive = throttle(() => {
      if (byInfo.value.roomUrl) {
        window.open(byInfo.value.roomUrl)
      }
    }, 700)
    const { byFlows, launchData } = getFlowsTwo(roomId, haveBy)
    // 跳转飞书聊天
    const toFschat = throttle(openId => {
      window.open(`https://applink.feishu.cn/client/chat/open?openId=${openId}`)
    }, 700)
    const toAuth = throttle(e => {
      if (e === 'by') {
        window.open(`${location.origin}/system_manage/matrixNumber_auth`)
      } else {
        window.open(`${location.origin}/system_manage/tripartitlePlatform_auth?type=dy`)
      }
    }, 700)

    // 是否在0.5秒内进入mask
    const isEnter = ref(false)

    // 是否点击分享
    const ismaskshow = ref(false)
    const clickShowMask = value => {
      ismaskshow.value = value
    }

    // 点击隐藏
    const hideMask = value => {
      ismaskshow.value = value
      isEnter.value = false
    }

    const enterS = val => {
      isEnter.value = val
    }

    const shareLeave = val => {
      setTimeout(() => {
        // 离开没有进入，隐藏，离开，进入不隐藏
        if (val) {
          if (!isEnter.value) {
            ismaskshow.value = false
          }
        }
      }, 500)
    }

    return {
      // handleClick,
      enterS,
      shareLeave,
      shareAbout,
      ismaskshow,
      hideMask,
      clickShowMask,
      toAuth,
      toFschat,
      byFlows,
      playLive,
      localOrign,
      roomId,
      toDetail,
      launchData,
      infoLoading,
      haveBy,
      byInfo,
      wanSliceFormat,
      secondToDate,
      chooseTab,
      dyOpenId,
      count: 0,
      statusInfo
    }
  },
  watch: {
    infoLoading(val) {
      if (val === false) {
        this.getLiveRoomInfo()
        this.getVideoInfo()
      }
    }
  },
  computed: {
    lengendAll({ lineLegend, lineLegend2 }) {
      return lineLegend.concat(lineLegend2)
    },
    videoExpired() {
      // if (this.byInfo?.liveStartTime) {
      //   const starTime = new Date(this.byInfo?.liveStartTime.replace(/-/g, '/'))
      //   const threeMonth = new Date().setMonth(new Date().getMonth() - 3)
      //   return starTime < threeMonth
      // }
      return false
    },
    videoDownloadTitle() {
      let result = ''
      if (this.byInfo?.liveStartTime && this.byInfo?.roomTitle) {
        result = this.byInfo?.roomTitle + this.byInfo?.liveStartTime
      }
      return result
    }
  },
  methods: {
    // 商品讲解
    getProductsInfoList() {
      selectEventRibbon({
        roomId: this.roomId
      }).then(res => {
        if (res.success) {
          this.ProductsInfoList = res.data.spjj
          this.ProductsInfoList.forEach(item => {
            const time = new Date(item.timePoint)
            item.atTime = `${time.getHours() >= 10 ? time.getHours() : `0${time.getHours()}`}:${
              time.getMinutes() >= 10 ? time.getMinutes() : `0${time.getMinutes()}`
            }`
          })
          this.calcProductInfo(this.ProductsInfoList, 'ProductsInfoList')
        }
      })
    },
    productClick(item) {
      if (this.talkTimer) {
        clearInterval(this.talkTimer)
      }
      this.talkList = []
      this.talkListTotal = -1
      this.video.iconShow = true
      this.video.coverShow = false
      this.video.isLoading = false
      const total = item.cLeft / this.aboutData.r
      this.calcVideo(total)
    },
    // 排班
    getAnchorInfo() {
      getAnchorInfo({
        roomId: this.roomId
        // liveRoomUid: this.replayTopInfo.liveRoomUid
      }).then(res => {
        if (res.success) {
          this.anchorInfoList = res.data
          this.calcProductInfo(this.anchorInfoList, 'anchorInfoList')
        }
      })
    },
    calcProductInfo(newVal, key) {
      newVal.forEach((item, index) => {
        this[key][index] = {}
        this[key][index] = item
        const startTime = item.time.split(' - ')[0]
        const endTime = item.time.split(' - ')[1]
        const h = parseInt(startTime.split(':')[0])
        const m = parseInt(startTime.split(':')[1])
        const s = parseInt(startTime.split(':')[2])
        const totalS = h * 3600 + m * 60 + s
        const left = totalS * this.aboutData.r
        if (key === 'ProductsInfoList') {
          const endH = parseInt(endTime.split(':')[0])
          const endM = parseInt(endTime.split(':')[1])
          const endS = parseInt(endTime.split(':')[2])
          const endTotalS = endH * 3600 + endM * 60 + endS
          this[key][index].endTotalS = endTotalS
        }
        this[key][index].totalS = totalS
        this[key][index].left = left
        this[key][index].cLeft = left
        item.timePoint = item.timePoint / 1000
        if (key === 'anchorInfoList') {
          const endH = parseInt(endTime.split(':')[0])
          const endM = parseInt(endTime.split(':')[1])
          const endS = parseInt(endTime.split(':')[2])
          const endTotalS = endH * 3600 + endM * 60 + endS
          const anchorArr = []
          // const otherArr = []
          this[key][index].width = (endTotalS - totalS) * this.aboutData.r
          if (this[key][index].width + this[key][index].left > this.aboutData.width) {
            this[key][index].width = this.aboutData.width - this[key][index].left
          }
          if (this[key][index].staffList.length > 0) {
            this[key][index].staffList.forEach(row => {
              anchorArr.push(row)
              // if (row.userCompanyJob === 1) {
              //   // 筛选主播
              //   anchorArr.push(row)
              // } else {
              //   otherArr.push(row)
              // }
            })
          }
          // otherArr = otherArr.sort((a, b) => {
          //   return a.userCompanyJob - b.userCompanyJob
          // })
          this[key][index].anchorArr = anchorArr
          // this[key][index].staffList = anchorArr.concat(otherArr)
        }
      })
      if (key === 'ProductsInfoList') {
        this.ProductsInfoCopyList = [...this[key]]
      } else {
        this[`${key}Copy`] = [...this[key]]
      }
    },
    // 拖拉
    leftConDown() {
      document.addEventListener('mousemove', this.leftConMove)
      document.addEventListener('mouseup', this.leftConUp)
      this.timeScale.activeArrow = 'left'
      this.updateEcharts()
    },
    rightConDown() {
      document.addEventListener('mousemove', this.rightConMove)
      document.addEventListener('mouseup', this.rightConUp)
      this.timeScale.activeArrow = 'right'
      this.updateEcharts()
    },
    updateEcharts() {
      if (this.count === 0) {
        this.$refs.chartsDataTool1.updateEcharts()
        this.$refs.chartsDataTool2.updateEcharts()
      }
      this.count += 1
    },
    rightConMove(e) {
      let diff = e.clientX - this.moveChartWarpper.left - this.aboutData.leftMargin
      diff = diff >= this.aboutData.width - 16 ? this.aboutData.width - 16 : diff
      diff = diff <= this.timeScale.conLeft ? this.timeScale.conLeft : diff
      this.timeScale.conRight = diff
      this.timeScale.bgWidth = diff - this.timeScale.conLeft + 16
      const total = (this.timeScale.conRight + 16) / this.aboutData.r
      this.timeScale.rightTotal = total
      this.aboutData.copyR =
        this.aboutData.width / (this.timeScale.rightTotal - this.timeScale.leftTotal)
      const time = this.formatTime(total, true)
      const index = this.chartsData.jcrs.findIndex(item => {
        const s = item.realTime.split(':')
        const s1 = time.split(':')
        return s[0] === s1[0] && s[1] === s1[1]
      })
      this.timeScale.rightIndex = index < 0 ? this.chartsData.jcrs.length - 1 : index
      throttle(() => {
        this.scaleMoveData(total, time)
        this.scalePointData()
        this.getMoveRealTimeXList()
      })()
    },
    rightConUp() {
      document.removeEventListener('mousemove', this.rightConMove)
      document.removeEventListener('mouseup', this.rightConUp)
    },

    leftConMove(e) {
      let diff = e.clientX - this.moveChartWarpper.left - this.aboutData.leftMargin
      diff = diff >= this.timeScale.conRight ? this.timeScale.conRight : diff
      diff = diff <= 0 ? 0 : diff
      this.timeScale.conLeft = diff
      this.timeScale.bgWidth = this.timeScale.conRight + 16 - diff
      this.timeScale.bgLeft = diff
      const total = this.timeScale.conLeft / this.aboutData.r
      this.timeScale.leftTotal = total
      this.aboutData.copyR =
        this.aboutData.width / (this.timeScale.rightTotal - this.timeScale.leftTotal)
      const time = this.formatTime(total, true)
      const index = this.chartsData.jcrs.findIndex(item => {
        const s = item.realTime.split(':')
        const s1 = time.split(':')
        return s[0] === s1[0] && s[1] === s1[1]
      })
      this.timeScale.leftIndex = index < 0 ? this.chartsData.jcrs[0] : index
      throttle(() => {
        this.scaleMoveData(total, time)
        this.scalePointData()
        this.getMoveRealTimeXList()
      })()
    },
    leftConUp() {
      document.removeEventListener('mousemove', this.leftConMove)
      document.removeEventListener('mouseup', this.leftConUp)
      // this.aboutData.r = this.aboutData.copyR
      this.timeScale.activeArrow = ''
      const total = this.timeScale.conLeft / this.aboutData.r
      const time = this.formatTime(total + this.aboutData.startTotalSeconds)
      this.talkList = []
      this.talkListTotal = -1
      this.video.iconShow = true
      this.video.coverShow = false
      this.video.isLoading = false
      this.calcVideo(total)
      throttle(() => {
        this.scaleMoveData(total, time)
      })
    },
    scaleMoveData(total, time) {
      const index = this.chartsData.jcrs.findIndex(item => {
        const s = item.time.split(':')
        const s1 = time.split(':')
        return s[0] === s1[0] && s[1] === s1[1]
      })
      this.chartsDataTool1 = this.areaChartData(this.chartsDataTool1, index)
      this.$refs.chartsDataTool1.handler(this.chartsDataTool1)
      this.chartsDataTool2 = this.areaChartData(this.chartsDataTool2, index)

      this.$refs.chartsDataTool2.handler(this.chartsDataTool2)
      this.timeScale.totalMin = this.chartsDataTool1.xData.length
    },
    areaChartData(data, index) {
      const obj = {
        xData: [],
        left: {},
        right: {}
      }
      obj.xData = this.scaleRightIndexIsEnd()
        ? this.filterChartData.xData.slice(this.timeScale.leftIndex)
        : this.filterChartData.xData.slice(this.timeScale.leftIndex, this.timeScale.rightIndex + 1)
      Object.keys(data).forEach(item => {
        if (item !== 'xData') {
          Object.keys(data[item]).forEach(row => {
            obj[item][row] = this.scaleRightIndexIsEnd()
              ? this.filterChartData[row].slice(this.timeScale.leftIndex)
              : this.filterChartData[row].slice(
                  this.timeScale.leftIndex,
                  this.timeScale.rightIndex + 1
                )
          })
        }
      })
      return obj
    },
    scaleRightIndexIsEnd() {
      return !!(
        this.timeScale.rightIndex === 0 ||
        this.timeScale.rightIndex === this.filterChartData.xData.length
      )
    },
    scalePointData() {
      const r =
        1 - (this.timeScale.rightTotal - this.timeScale.leftTotal) / this.aboutData.totalSeconds
      this.ProductsInfoCopyList = this.clacPointData(this.ProductsInfoList, r)
      // this.replayWarningList = this.clacPointData(this.replayWarningListCopy, r)
      // this.roomJobList = this.clacPointData(this.roomJobListCopy, r)
      // this.violationVoList = this.clacPointData(this.violationVoListCopy, r)
      // this.blessingVoList = this.clacPointData(this.blessingVoListCopy, r)
      // this.couponList = this.clacPointData(this.couponListCopy, r)
      // this.windmillList = this.clacPointData(this.windmillListCopy, r)
    },
    clacPointData(data, r) {
      const ProductArr = []
      const arr = []
      data.forEach(item => {
        if (item.totalS >= this.timeScale.leftTotal && item.totalS <= this.timeScale.rightTotal) {
          const obj = { ...item }
          ProductArr.push(obj)
          arr.push(item.totalS)
        }
      })
      ProductArr.forEach((item, index) => {
        if (this.timeScale.conLeft === 0 && this.timeScale.conRight + 16 === this.aboutData.width) {
          item.left = item.cLeft
        } else {
          item.left =
            (arr[index] - this.timeScale.leftTotal) *
            (this.aboutData.width / (this.timeScale.rightTotal - this.timeScale.leftTotal))
        }
      })
      return ProductArr
    },
    getMoveRealTimeXList() {
      const arr = []
      let num = 9
      const liveStartTimeTotal = new Date(this.byInfo.liveStartTime.replace(/\\-/g, '/')).getTime()
      const start = liveStartTimeTotal + this.timeScale.leftTotal * 1000
      const end = liveStartTimeTotal + this.timeScale.rightTotal * 1000
      const diffMin = (end - start) / 1000 / 60
      if (diffMin < 10) {
        num = diffMin - 1
      }
      const oneDiff = diffMin / num
      for (let i = 0; i <= num; i++) {
        const obj = {}
        obj.text = this.formatDateForHour(new Date(start + i * oneDiff * 60 * 1000))
        obj.left = (this.aboutData.width / num) * i
        arr.push(obj)
      }
      this.realTimeXList = arr
    },
    formatDateForHour(date) {
      return format(date, 'HH:mm')
    },
    getVideoInfo() {
      const { brandId } = JSON.parse(localStorage.getItem('brandInfo') || {})
      getVideoInfo({ roomId: this.roomId, dyOpenId: this.dyOpenId, brandId }).then(res => {
        this.showTip = res.data
      })
    },
    getLiveRoomInfo() {
      // if (!this.byInfo.liveEndTime) {
      //   this.isShow = false
      //   return
      // }
      if (this.byInfo.liveEndTime) {
        this.initAboutData()
      }
      const categoryWarpper = document
        .querySelector('.category-time-warpper')
        .getBoundingClientRect()
      this.moveChartWarpper = document
        .querySelector('.live_replay_body_chart')
        .getBoundingClientRect()
      this.aboutData.width = categoryWarpper.width
      this.timeScale.bgWidth = this.aboutData.width
      this.timeScale.conRight = this.aboutData.width - 16
      this.aboutData.r = this.aboutData.width / this.aboutData.totalSeconds
      this.aboutData.copyR = this.aboutData.width / this.aboutData.totalSeconds
      this.aboutData.croseClickLineText = this.formatTime(
        0 / this.aboutData.r + this.aboutData.startTotalSeconds
      )
        .split(':')
        .slice(0, 3)
        .join(':')
      this.getVideoUrl()
      this.getEchartsData()
      this.getRealTimeXList()
      this.getProductsInfoList()
      this.getAnchorInfo()
    },
    // 查询弹幕
    getTalkList(time) {
      getMessage(time).then(res => {
        if (res.success) {
          this.talkAtTime = this.aboutData.croseClickLineText
          const list = res.data || []
          if (list.length > 0) {
            list.forEach(item => {
              item.atTime = item.now.split(' ')[1].split(':').slice(0, 2).join(':')
              item.timePoint = new Date(item.now.replace(/\\-/g, '/')).getTime()
            })
          }
          // this.talkList = list.concat(this.talkList)
          this.talkList = list
          this.talkList = this.talkList.sort((a, b) => {
            return b.timePoint - a.timePoint
          })
          for (let i = 0; i <= this.talkList.length - 1; i++) {
            const str = this.talkList[i].nickName + this.talkList[i].content
            for (let j = i + 1; j < this.talkList.length; j++) {
              const str1 = this.talkList[j].nickName + this.talkList[j].content
              if (str === str1) {
                this.talkList.splice(i, 1)
              }
            }
          }
          if (this.talkList.length > 100) {
            this.talkList.splice(100)
          }
          this.talkListTotal = this.talkList.length
        }
      })
    },
    // 获取视频-拿到m3u8格式的
    getVideoUrl() {
      getLiveRoomVideo({
        roomId: this.roomId,
        uid: '',
        brandId: localStorage.getItem('brandInfo')
          ? JSON.parse(localStorage.getItem('brandInfo')).brandId
          : null
      }).then(res => {
        if (res.code === 0 && isNotEmpty(res.data)) {
          this.videoList = res.data
          this.videoListTotal = res.data.length
          this.videoList.forEach(item => {
            item.videoStartTime = item.videoStartTime / 1000
            item.videoEndTime = item.videoEndTime / 1000
            item.videoTime = item.videoEndTime - item.videoStartTime
          })
          let total = 0
          this.videoList.forEach(item => {
            total += item.videoTime
            this.video.timeArr.push(total)
          })
          this.videoUrl = res.data[0].m3u8Url
        }
      })
    },
    // 获取统计数据
    getEchartsData() {
      const typeList = []
      for (const key in this.chartsChangeLine) {
        if (this.chartsChangeLine[key]) {
          const current = this.legendType.find(i => i.label === key)
          if (current) {
            typeList.push(current.value)
          }
        }
      }
      getLiveTrendByRoomId({
        roomId: this.roomId,
        // roomId: this.roomId,
        trendType: typeList.join(',')
      }).then(res => {
        const result = {}
        res.data.forEach(item => {
          const currentLegend = this.legendType.find(i => i.value === item.trendType)
          result[currentLegend.label] = item.trends.map(i => {
            return {
              number: i.yaxis,
              time: i.xaxis.split(' ')[1],
              timePoint: String(new Date(i.xaxis).getTime() / 1000),
              flowInfo: null
            }
          })
        })
        const startTime = new Date(this.byInfo.liveStartTime).getTime() / 1000
        this.showChart = false
        res.data = this.fillZero(result)
        for (const key in res.data) {
          for (const item of res.data[key]) {
            const sub = item.timePoint - startTime
            item.realTime = this.formatTime(sub > 0 ? sub : 0, true)
          }
        }
        // res.data.zxrs = res.data.zx
        this.chartsData = res.data
        this.copyChartsData = { ...res.data }
        this.filterChartData = this.calcAllEchartsData(this.chartsData)
        this.timeScale.totalMin = this.filterChartData.xData.length
        const chartsDataTool11 = {
          left: {}
        }
        const chartsDataTool22 = {
          left: {},
          right: {}
        }
        for (const key in this.chartsChangeLine) {
          if (!this.chartsChangeLine[key]) continue
          const obj = this.lengendAll.find(item => item.value === key)
          if (!obj) continue
          if (obj.dataTool === 'chartsDataTool1') {
            chartsDataTool11.left[key] = this.copyChartsData[key]
          } else {
            if (obj.poistion === 'left') {
              chartsDataTool22.left[key] = this.copyChartsData[key]
            } else {
              chartsDataTool22.right[key] = this.copyChartsData[key]
            }
          }
        }
        this.chartsDataTool11 = chartsDataTool11
        this.chartsDataTool1 = this.calcEchartsData(this.chartsDataTool11)
        this.chartsDataTool22 = chartsDataTool22
        this.chartsDataTool2 = this.calcEchartsData(this.chartsDataTool22)
        this.$nextTick(() => {
          this.$refs.chartsDataTool1.handler(this.chartsDataTool1)
          this.$refs.chartsDataTool2.handler(this.chartsDataTool2)
        })
        this.getBaseData(this.aboutData.croseClickLineText, 'aboutData')
        this.isRrepare = true
      })
    },
    resetChart() {},
    toolTipOver(e) {
      this.count = 0
      if (Object.keys(this.chartsData).length < 1) {
        return
      }
      this.crossShow = true
      this.chartsTipsData.show = true
      const diff = e.clientX - this.moveChartWarpper.left - this.aboutData.leftMargin
      const arr = []
      for (let i = 1; i <= this.timeScale.totalMin - 1; i++) {
        arr.push(i * (this.aboutData.width / (this.timeScale.totalMin - 1)))
      }
      arr.unshift(0)
      arr.push(Number.MAX_VALUE)
      for (let j = 0; j < arr.length - 1; j++) {
        if (diff >= arr[j] && diff < arr[j + 1]) {
          this.aboutData.croseLineLeft = arr[j] + this.aboutData.leftMargin
          this.aboutData.croseLineText = this.chartsDataTool1.xData[j]
          let x = 0
          if (
            this.aboutData.croseLineLeft + (this.isGujia ? 360 : 170) <=
            this.aboutData.width + this.aboutData.leftMargin
          ) {
            x = this.aboutData.croseLineLeft + 10
          } else {
            x = this.aboutData.croseLineLeft - (this.isGujia ? 370 : 180)
          }
          this.chartsTipsData.left = x
          this.chartsTipsData.time = this.aboutData.croseLineText
          this.getBaseData(this.aboutData.croseLineText, 'chartsTipsData')
          this.showLineToolTip(this.aboutData.croseLineText)
        }
      }
    },
    showLineToolTip(time = '') {
      if (this.$refs.chartsDataTool1) {
        this.$refs.chartsDataTool1.lineEcharts.dispatchAction({
          type: 'showTip',
          seriesIndex: 0,
          name: 'left',
          dataIndex: this.chartsDataTool1.xData.findIndex(item => {
            const s = item.split(':')
            const s1 = time.split(':')
            return s[0] === s1[0] && s[1] === s1[1]
          })
        })
      }
      if (this.$refs.chartsDataTool2) {
        this.$refs.chartsDataTool2.lineEcharts.dispatchAction({
          type: 'showTip',
          name: 'left',
          seriesIndex: 0,
          dataIndex: this.chartsDataTool1.xData.findIndex(item => {
            const s = item.split(':')
            const s1 = time.split(':')
            return s[0] === s1[0] && s[1] === s1[1]
          })
        })
      }
    },
    calcVideo(total, isPlaying = false) {
      this.video.coverShow = false
      this.video.currentTime = total
      // this.$refs.videoRef.setVideoCurrentTime(total)
      this.video.isPause = true
      const timeText = this.formatTime(total + this.aboutData.startTotalSeconds)
        .split(':')
        .slice(0, 3)
        .join(':')
      this.getBaseData(timeText, 'aboutData')

      if (!isPlaying) {
        this.video.iconShow = true
        // this.$refs.videoRef?.setVideoPause()
        this.video.isPause = true
      } else {
        this.video.iconShow = false
        // setTimeout(() => {
        // this.$refs.videoRef?.setVideoPlay()
        //  }, 100)
        this.video.isPause = false
      }
    },
    toolTipOut() {
      this.crossShow = false
      this.chartsTipsData.show = false
      // this.hideTips()
      //   this.hideLineToolTip()
    },
    hideLineToolTip() {
      this.$refs.chartsDataTool1.handler(this.chartsDataTool1)
      this.$refs.chartsDataTool2.handler(this.chartsDataTool2)
    },
    eventClick(e) {
      let diff = this.aboutData.croseLineLeft
      diff = diff < this.aboutData.leftMargin ? this.aboutData.leftMargin : diff
      const total =
        (diff - this.aboutData.leftMargin) / this.aboutData.copyR + this.timeScale.leftTotal
      const max = Math.max(...this.video.timeArr)
      if (total > max) {
        return
      }
      if (this.talkTimer) {
        clearInterval(this.talkTimer)
      }
      this.aboutData.croseClickLineLeft = diff
      this.talkList = []
      this.talkListTotal = -1
      this.video.iconShow = true
      this.video.coverShow = false
      this.video.isLoading = false
      this.calcVideo(total)
    },
    toggleShowVideo() {
      this.$nextTick(() => {
        this.$refs.videoRef?.setVideoPause()
        this.toggleVideoStatus()
        if (!this.showVideo) {
          this.$tracking.clickBtn(103)
        }
        this.showVideo = !this.showVideo
      })
    },
    // 补0
    fillZero(obj) {
      const maxSecondList = []
      const minSecondList = []
      // 最大最小时间
      let maxSecond = null
      let minSecond = null
      // 获取最大值最小值
      for (const key in obj) {
        if (obj[key].length > 0) {
          minSecondList.push(Number(obj[key][0].timePoint))
          maxSecondList.push(Number(obj[key][obj[key].length - 1].timePoint))
        }
      }
      maxSecondList.sort()
      minSecondList.sort()
      maxSecond = maxSecondList[minSecondList.length - 1]
      minSecond = minSecondList[0]
      // 补0数组
      const tempArr = []
      for (let i = minSecond; i <= maxSecond; i = i + 60) {
        tempArr.push({
          number: 0,
          time: this.timetrans(i),
          timePoint: String(i),
          flowInfo: null
        })
      }
      // 合并原数组与补0数组
      for (const key in obj) {
        const copyTempArr = JSON.parse(JSON.stringify(tempArr))
        copyTempArr.forEach(ele => {
          const item = obj[key].find(i => i.timePoint === ele.timePoint)
          for (const key in ele) {
            if (item) {
              ele[key] = item[key]
            }
          }
        })
        obj[key] = copyTempArr
      }
      return obj
    },
    calcAllEchartsData(data) {
      const obj = {
        xData: []
      }
      Object.keys(data).forEach(item => {
        // if (item === 'jcrs') {
        //   obj.xData = data[item].map(row => {
        //     return row.time
        //   })
        // }
        if (obj.xData.length === 0) {
          obj.xData = data[item].map(row => {
            return row.time
          })
        }
        obj[item] = data[item].map(row => {
          return row.number
        })
      })
      return obj
    },
    calcEchartsData(data) {
      const obj = {
        xData: [],
        left: {},
        right: {}
      }
      Object.keys(data).forEach(item => {
        Object.keys(data[item]).forEach(row => {
          if (data[item][row]) {
            if (obj.xData.length === 0) {
              obj.xData = data[item][row].map(child => {
                return child.time
              })
            }
            obj[item][row] = data[item][row].map(child => {
              return child.number
            })
          }
        })
      })
      return obj
    },
    timetrans(d) {
      const date = new Date(d * 1000)
      const h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':'
      const m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
      return h + m
    },
    initAboutData() {
      this.aboutData.startTime = this.byInfo.liveStartTime
        .split(' ')[1]
        .split(':')
        .slice(0, 3)
        .join(':')
      this.aboutData.endTime = this.byInfo.liveEndTime
        .split(' ')[1]
        .split(':')
        .slice(0, 3)
        .join(':')
      this.aboutData.startDay = parseInt(
        this.byInfo.liveStartTime.split(' ')[0].split('-').slice(2)[0]
      )
      this.aboutData.endDay = parseInt(this.byInfo.liveEndTime.split(' ')[0].split('-').slice(2)[0])
      if (this.aboutData.endDay === 1 && this.aboutData.startDay !== this.aboutData.endDay) {
        this.aboutData.endDay = this.aboutData.startDay + 1
      }
      const startTime = this.aboutData.startTime.split(':')
      const endTime = this.aboutData.endTime.split(':')
      const startTime1 = this.byInfo.liveStartTime.split(' ')[1].split(':')
      const endTime1 = this.byInfo.liveEndTime.split(' ')[1].split(':')
      this.aboutData.startTotalSeconds =
        (parseInt(startTime[0]) * 60 + parseInt(startTime[1])) * 60 + parseInt(startTime[2])
      // (parseInt(startTime[0]) * 60 + parseInt(startTime[1])) * 60
      if (this.aboutData.endDay - this.aboutData.startDay === 0) {
        // 没有跨天
        this.aboutData.totalMin =
          (parseInt(endTime[0]) - parseInt(startTime[0]) - 1) * 60 +
          (60 - parseInt(startTime[1]) - 1) +
          parseInt(endTime[1])
        this.aboutData.totalSeconds =
          ((parseInt(endTime[0]) - parseInt(startTime[0]) - 1) * 60 +
            (60 - parseInt(startTime[1]) - 1) +
            parseInt(endTime[1])) *
            60 +
          (60 - parseInt(startTime1[2]) + parseInt(endTime1[2]))
        this.timeScale.rightTotal = this.aboutData.totalSeconds
      } else {
        // 跨天
        const diff = this.aboutData.endDay - this.aboutData.startDay - 1
        this.aboutData.totalMin =
          diff * 1440 +
          (24 - parseInt(startTime[0]) - 1) * 60 +
          (60 - parseInt(startTime[1]) - 1) +
          parseInt(endTime[0]) * 60 +
          parseInt(endTime[1])
        this.aboutData.totalSeconds =
          this.aboutData.totalMin * 60 + (60 - parseInt(startTime1[2]) + parseInt(endTime1[2]))
        this.timeScale.rightTotal = this.aboutData.totalSeconds
      }
    },
    timeupdate(currentTime) {
      if (this.$refs.videoRef && isNotEmpty(currentTime)) {
        this.video.isLoading = false
        this.video.currentTime = currentTime
        this.aboutData.croseClickLineLeft =
          (this.videoTime + this.video.currentTime - this.timeScale.leftTotal) *
            this.aboutData.copyR +
          this.aboutData.leftMargin
        if (this.aboutData.croseClickLineLeft >= this.aboutData.width + this.aboutData.leftMargin) {
          this.aboutData.croseClickLineLeft = this.aboutData.width + this.aboutData.leftMargin
        }
        this.aboutData.croseClickLineText = this.formatTime(
          this.videoTime + this.video.currentTime + this.aboutData.startTotalSeconds
        )
          .split(':')
          .slice(0, 3)
          .join(':')
        this.getBaseData(this.aboutData.croseClickLineText, 'aboutData')
        const copy = [...this.ProductsInfoCopyList]
        for (let i = 0; i <= copy.length - 1; i++) {
          if (
            this.videoTime + this.video.currentTime >= copy[i].totalS &&
            this.videoTime + this.video.currentTime <= copy[i].endTotalS
          ) {
            this.shopCardShow = true
            this.shopCardInfo = copy[i]
            break
          } else {
            this.shopCardShow = false
          }
        }
      }
    },
    toggleVideoStatus() {
      if (this.video.isPause) {
        this.video.isPause = false
        this.video.coverShow = false
        // this.$refs.videoRef?.setVideoPlay()
      } else {
        this.video.isPause = true
        // this.$refs.videoRef?.setVideoPause()
        // talkTimer不知道是啥 先不注释
        if (this.talkTimer) {
          clearInterval(this.talkTimer)
        }
      }
    },
    formatTime(time, show24 = false) {
      let h = Math.floor(time / 3600) >= 24 ? Math.floor(time / 3600) - 24 : Math.floor(time / 3600)
      if (show24) {
        h = Math.floor(time / 3600)
      } else {
        h = Math.floor(time / 3600) >= 24 ? Math.floor(time / 3600) - 24 : Math.floor(time / 3600)
      }
      let m = Math.floor((time % 3600) / 60)
      let s = Math.floor(time % 60)
      h = h >= 10 ? h : `0${h}`
      m = m >= 10 ? m : `0${m}`
      s = s >= 10 ? s : `0${s}`
      return `${h}:${m}:${s}`
    },
    getBaseData(time, key) {
      if (Object.keys(this.chartsData).length < 1) {
        return
      }
      for (const chartKey in this.chartsData) {
        if (this.chartsData[chartKey].length === 0) {
          this[key][chartKey] = 0
        } else {
          const value =
            this.chartsData[chartKey].find(item => {
              const s = item.time.split(':')
              const s1 = time ? time.split(':') : []
              return s[0] === s1[0] && s[1] === s1[1]
            }) || {}
          this[key][chartKey] = value.number || 0
        }
      }
    },
    getRealTimeXList() {
      const arr = []
      let num = 9
      let half = null
      let startTime = this.byInfo.liveStartTime.replace(/\\-/g, '/')
      startTime = new Date(startTime).getTime()
      if (this.aboutData.totalMin < 10) {
        num = this.aboutData.totalMin - 1
      }
      half = this.aboutData.totalMin / num
      for (let i = 1; i <= num; i++) {
        const obj = {}
        const time = new Date(startTime + i * half * 60 * 1000)
        let hour = time.getHours()
        let min = time.getMinutes()
        // const seconds = time.getSeconds()
        hour = hour >= 10 ? hour : `0${hour}`
        min = min >= 10 ? min : `0${min}`
        obj.text = `${hour}:${min}`
        obj.left = (this.aboutData.width / num) * i
        arr.push(obj)
      }
      if (arr.length > 1) {
        arr.unshift({
          text: this.aboutData.startTime.split(':').slice(0, 2).join(':'),
          left: 0
        })
      }
      // arr.unshift({
      //   text: this.aboutData.startTime.split(':').slice(0, 2).join(':'),
      //   left: 0
      // })
      this.realTimeXList = arr
    },
    // 获取视频播放时间
    getVideoTime() {
      const total = this.videoTime + this.video.currentTime
      return this.formatTime(total, true)
    },
    sortChartsLine(LineType, type, data) {
      this.showChart = true
      const status = (this.chartsChangeLine[LineType] = !this.chartsChangeLine[LineType])
      if (status) {
        this[data][type][LineType] = this.filterChartData[LineType]
          ? this.filterChartData[LineType].slice(this.timeScale.leftIndex)
          : []
      } else {
        delete this[data][type][LineType]
      }
      this.getEchartsData()
    }
  },
  mounted() {
    this.getTalkList({
      type: 2,
      roomId: this.roomId,
      playTime: this.formatTime(0)
    })
  }
}
</script>
<style lang="scss" scoped>
@import '../components/css/qrcode.scss';
@import '../components/css/page.scss';
@import './detail.scss';
.none_tip {
  color: #909399;
  font-size: 14px;
  font-weight: 400;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  img {
    width: 16px !important;
    height: 16px !important;
    object-fit: contain;
    display: flex;
    margin-left: 4px !important;
  }
}
.align-center {
  align-items: center;
}

.live_detail {
  min-width: 780px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;

  .detail_left {
    height: 100%;
    max-height: 100%;
    overflow-y: auto;
    padding: 0 24px;
    width: 320px;
    margin-right: $content_margin;
    border-radius: $content_radius;
    background: #fff;

    .one_left {
      padding: 22px 0 0;
    }

    .one_left + .one_left {
      border-top: 1px solid #e8e8e8;
      padding-top: 24px;
    }

    .left_title {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      line-height: 22px;

      .title {
        display: flex;
        align-items: center;
      }

      .tip {
        font-size: 12px;
        font-family: PingFangSC-Regular, PingFang SC;
        color: #909399;
        line-height: 17px;

        .iconfont {
          font-size: 14px;
        }
      }

      img {
        width: 20px;
        height: 20px;
        margin-right: 6px;
      }
    }

    .info_box {
      margin-top: 20px;
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
      position: relative;

      .info_head {
        margin-right: 10px;
        width: 66px;
        height: 66px;
        border-radius: 4px;
        position: relative;

        .live_img {
          width: 66px;
          height: 66px;
          border-radius: 4px;
          object-fit: cover;
        }

        .play_box {
          opacity: 0;
          border-radius: 4px;
          background: rgba(0, 0, 0, 0.4);
          cursor: pointer;
          position: absolute;
          left: 0;
          top: 0;
          width: 66px;
          height: 66px;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;

          &:hover {
            opacity: 1;
          }

          img {
            width: 25px;
            height: 25px;
          }
        }
      }

      .info_content {
        width: 100%;
        max-width: calc(100% - 76px);

        .content1 {
          max-width: 100%;
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: flex-start;
          font-size: 14px;

          font-weight: 500;
          color: #303133;
          line-height: 20px;

          .content_text {
            max-width: calc(100% - 24px);
          }

          img {
            width: 18px;
            height: 18px;
            margin-left: 6px;
            cursor: pointer;
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

    .expired-video {
      position: relative;
      width: 100%;
      height: 420px;
      margin-top: 10px;
      background: #f8f9fa;
      border-radius: 5px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      .expired-title {
        color: #303133;
        font-weight: bold;
        font-size: 14px;
        text-align: center;
        line-height: 30px;
      }
      .expired-tips {
        line-height: 20px;
        margin: 0 20px;
        color: #909399;
        font-size: 12px;
      }
    }

    .live-tips {
      display: flex;
      align-items: center;
      line-height: 30px;
      color: #909399;
      margin-left: 15px;
    }

    .info_avatar {
      width: 48px;
      height: 48px;
      border-radius: 100%;
      object-fit: cover;
      margin-right: 12px;
    }

    .expired_img {
      width: 14px;
      height: 14px;
      position: absolute;
      left: 34px;
      top: 0;
    }

    .num_box {
      padding: 24px 2px 0;
      margin-top: 24px;
      border-top: 1px solid #e8e8e8;
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
      flex-wrap: wrap;

      .one_num {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        width: 33.33%;
        margin-bottom: 24px;

        .num_o {
          width: max-content;
          max-width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .num1 {
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          color: #333333;
          line-height: 22px;
        }

        .num2 {
          text-align: center;
          margin-top: 6px;
          font-size: 12px;

          font-weight: 400;
          color: #909399;
          line-height: 17px;

          span {
            font-size: 10px;
          }
        }
      }

      .one_num:nth-child(3n + 2) {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
      }

      .one_num:nth-child(3n + 3) {
        // justify-content: flex-end;
        // align-items: flex-end;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
      }
    }

    .more_btn {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      padding-bottom: 24px;

      .el-button {
        padding: 5px 14px;

        border-radius: 4px;
        border: 1px solid rgba(54, 79, 205, 0.5);
        font-size: 12px;

        font-weight: 400;
        color: $theme_color;
        line-height: 17px;
      }
    }
  }

  .detail_right {
    width: calc(100% - 320px - $content_margin);
    height: 100%;

    position: relative;
    :deep(.tab_box) {
      height: 100%;
    }

    :deep(.el-tabs__header) {
      background: #fff;
      padding: 16px 0 0 24px;
      border-radius: 4px;
    }

    :deep(.el-tabs__content) {
      height: calc(100% - 60px);
      width: 100%;
      padding-right: 4px;
      overflow-y: auto;

      &::-webkit-scrollbar {
        /*滚动条整体样式*/
        width: 7px;
        /*高宽分别对应横竖滚动条的尺寸*/
        height: 7px;
        margin: 0 2px;
      }

      &::-webkit-scrollbar-thumb {
        /*滚动条里面小方块*/
        border-radius: 7px;
        background-color: #c0c2c2;
        // margin: 0 5px;
      }
    }
  }
}

.detail_left::-webkit-scrollbar {
  display: none;
}

.no_data {
  padding: 68px 0 46px 0;
  text-align: center;

  > img {
    width: 75px;
    height: 54px;
  }

  > p {
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    color: #303133;
    line-height: 20px;
  }
}
.action_btn {
  padding-bottom: 16px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  position: absolute;
  top: -36px;
  right: 0;
  line-height: 20px;

  .auth_mark {
    cursor: pointer;
    color: #909399;
    font-size: 14px;
    font-weight: 400;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    img {
      width: 16px;
      height: 16px;
      object-fit: contain;
      display: flex;
      margin-left: 4px;
    }
  }
}

.err_box1 {
  margin-right: 20px;
  text-align: right;
  color: rgb(242, 101, 100);
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  .err_img {
    width: 14px;
    height: 14px;
    object-fit: cover;
    margin-right: 4px;
  }
}
.content_text_name {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  .row_overflow2 {
    max-width: calc(100% - 48px);
  }
}
.none_video {
}
</style>
