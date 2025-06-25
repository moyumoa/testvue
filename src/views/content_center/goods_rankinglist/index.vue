<template>
  <div class="content_page live_center">
    <!-- 筛选条件 -->
    <xm_search>
      <div class="top" style="display: flex; align-items: center; width: 100%; margin-bottom: 30px">
        <el-radio-group v-model="timePicker" border @change="changeTimeType">
          <el-radio-button :label="1">日</el-radio-button>
          <el-radio-button :label="2">周</el-radio-button>
          <el-radio-button :label="3">月</el-radio-button>
        </el-radio-group>
        <el-date-picker
          style="margin-left: 40px"
          :format="timeselect.format"
          :clearable="false"
          v-model="research.time"
          :type="timeselect.type"
          :value-format="timeselect.valueformat"
          placeholder="请选择时间"
          :disabled-date="
            time => {
              return time.getTime() > Date.now()
            }
          "
        ></el-date-picker>
        <el-tooltip class="item" effect="dark" placement="right">
          <template #content>
            <div class="tooltip_wrap">
              更新频率：实时更新；
              <br />
              数据来源：
              <br />
              指定筛选时间内，系统用户数据权限内可见的矩阵号产生的直播商品订单数据（订单创建时间）；
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
      <!-- 品牌标记 -->
      <!--      <div class="search_item">-->
      <!--        <label class="item_label">品牌标记</label>-->
      <!--        <div class="item_content">-->
      <!--          <el-select v-model="research.brandId" placeholder="请选择" style="width: 100%" clearable>-->
      <!--            <el-option-->
      <!--              v-for="item in brandMark"-->
      <!--              :label="item.label"-->
      <!--              :value="item.value"-->
      <!--              :key="item.value"-->
      <!--            />-->
      <!--          </el-select>-->
      <!--        </div>-->
      <!--      </div>-->
      <!-- 内容类型 -->
      <!--      <div class="search_item">-->
      <!--        <label class="item_label">内容类型</label>-->
      <!--        <div class="item_content">-->
      <!--          <el-select-->
      <!--            v-model="research.contentType"-->
      <!--            placeholder="请选择"-->
      <!--            style="width: 100%"-->
      <!--            clearable-->
      <!--          >-->
      <!--            <el-option-->
      <!--              v-for="item in contentType"-->
      <!--              :label="item.label"-->
      <!--              :value="item.value"-->
      <!--              :key="item.value"-->
      <!--            />-->
      <!--          </el-select>-->
      <!--        </div>-->
      <!--      </div>-->

      <!-- <el-select v-model="research.value" multiple collapse-tags placeholder="Select">
        <el-option-group v-for="group in Options" :key="group.label" :label="group.label">
          <el-option
            v-for="item in group.options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-option-group>
      </el-select>-->
      <!-- 矩阵号类型 -->
      <!-- <div class="search_item">
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
      </div>-->

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
        <el-tab-pane v-for="(tab, i) in tabList" :key="i" :label="tab.label" :name="tab.name">
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
            <!-- 排名 -->
            <el-table-column width="100" label="排名" type="index">
              <template #default="scope">
                {{ (tableForm.page.index - 1) * tableForm.page.size + scope.$index + 1 }}
              </template>
            </el-table-column>
            <!-- 商品 -->
            <el-table-column min-width="200" label="商品">
              <template #default="scope">
                <div class="live_box">
                  <div class="live_img_box">
                    <img v-if="scope.row.productPic" :src="scope.row.productPic" class="live_img" />
                    <img
                      class="live_img"
                      v-else
                      src="@/assets/images/content_center/default_cover.png"
                      alt
                    />
                  </div>
                  <div class="live_content">
                    <div class="content1">
                      <div class="content_text row_overflow">
                        {{ scope.row.productName || '--' }}
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="商品分组" prop="productGroup" min-width="170">
              <template #default="scope">
                <div>{{ scope.row.productGroup || '--' }}</div>
              </template>
            </el-table-column>
            <!-- 矩阵号 -->
            <el-table-column label="运营矩阵号" width="200">
              <template #default="{ row }">
                <div class="photos" v-if="row.xuserInfos && row.xuserInfos.length > 0">
                  <template v-for="(item, index) in row.xuserInfos" :key="item.xuserId">
                    <el-tooltip
                      v-if="index < 3"
                      effect="dark"
                      :content="item.nickname"
                      placement="bottom"
                    >
                      <div
                        class="photos_item"
                        :style="item.operator && item.operator.fsOpenId ? 'cursor: pointer' : ''"
                        @click="
                          item.operator && item.operator.fsOpenId
                            ? toFschat(item.operator.fsOpenId)
                            : ''
                        "
                      >
                        <img :src="item.avatar" alt />
                        <img
                          v-if="item.operator.iconType === 2"
                          class="fs_icon"
                          src="@/assets/images/user/weChat.png"
                          alt=""
                        />
                        <img
                          v-if="item.operator.iconType === 1"
                          class="fs_icon"
                          src="@/assets/images/content_center/fs.png"
                          alt=""
                        />
                        <img
                          v-if="item.operator.iconType === 3"
                          class="fs_icon"
                          src="@/assets/images/user/wx.png"
                          alt=""
                        />
                      </div>
                    </el-tooltip>
                  </template>
                  <div
                    v-if="row.xuserInfos.length > 3"
                    class="photo_more flex_center"
                    @click="viewMore(row.xuserInfos, '运营矩阵号')"
                  >
                    +{{ row.xuserInfos.length - 3 }}
                  </div>
                </div>
                <template v-else>--</template>
              </template>
            </el-table-column>

            <!-- 抖店 -->
            <el-table-column min-width="125" label="抖店">
              <template #default="scope">{{ scope.row.shopName || '--' }}</template>
            </el-table-column>
            <!-- 价格 -->
            <el-table-column min-width="200" label="价格">
              <template #default="scope">
                <span>￥{{ scope.row.discountPrice / 100 || 0 }}</span>
                <span style="text-decoration: line-through; color: #ccc; margin-left: 20px">
                  ￥{{ scope.row.marketPrice / 100 || 0 }}
                </span>
              </template>
            </el-table-column>
            <el-table-column min-width="125" label="销售额(元)">
              <template #default="scope">￥{{ scope.row.payAmount / 100 || 0 }}</template>
            </el-table-column>
            <!-- 价格 -->
            <el-table-column min-width="110" label="销售量">
              <template #default="scope">{{ wanSliceFormat(scope.row.itemNum || 0) }}</template>
            </el-table-column>
          </xm_table>
        </el-tab-pane>
      </el-tabs>
    </div>
    <el-dialog
      v-model="photosVisible"
      custom-class="hide_footer_line "
      :title="title"
      width="300px"
    >
      <div class="photos_dialog">
        <div class="photo_item" v-for="item in userList" :key="item.xuserId">
          <div :class="{ g_failure: item.status === 2 }" class="big">
            <img :src="item.avatar" alt />
          </div>
          <span style="margin-left: 16px">{{ item.nickname }}</span>
        </div>
      </div>
      <template #footer></template>
    </el-dialog>
  </div>
</template>

<script>
import { pageList } from './model/get_list.js'
import { wanSliceFormat, getDateDiff } from '@/utils/tools.js'

export default {
  setup(props) {
    const localOrign = location.origin
    const {
      chooseDeptSearchRef,
      onChangeDepartment,
      timeselect,
      timePicker,
      research,
      searchComponents,
      chooseTab,
      tabList,
      tableForm,
      Goodslist,
      brandMark,
      contentType,
      accountType,
      changeTimeType,
      queryList,
      reset
    } = pageList()
    reset()
    // 弹框相关
    const dialog = reactive({
      // 更多账号弹框
      photosVisible: false,
      userList: [],
      title: ''
    })
    const { photosVisible, userList, title } = toRefs(dialog)
    const viewMore = (data, t) => {
      photosVisible.value = true
      userList.value = data
      title.value = t
    }

    // 跳转飞书聊天
    function toFschat(openId) {
      window.open(`https://applink.feishu.cn/client/chat/open?openId=${openId}`)
    }
    return {
      chooseDeptSearchRef,
      onChangeDepartment,
      toFschat,
      title,
      userList,
      photosVisible,
      Goodslist,
      brandMark,
      contentType,
      accountType,
      timeselect,
      timePicker,
      research,
      localOrign,
      tableForm,
      changeTimeType,
      queryList,
      searchComponents,
      tabList,
      chooseTab,
      wanSliceFormat,
      getDateDiff,
      reset,
      viewMore
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../components/css/qrcode.scss';
@import '../components/css/page.scss';
.live_center {
  :deep(.el-tabs__header) {
    margin-bottom: 24px;
  }
  :deep(.el-input__prefix) {
    top: 9px;
  }
  :deep(.top .el-input__suffix) {
    top: 9px;
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
      // width: 100%;
      height: 133px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      background-color: #fff;
      li {
        margin-left: 16px;
        // width: 22%;
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

  .photos {
    display: flex;
    .photos_item {
      margin-right: 6px;
      position: relative;
      > img {
        width: 32px;
        height: 32px;
        object-fit: cover;
        border-radius: 50%;

        vertical-align: middle;
      }
      &.main {
        position: relative;
        border: 1px solid $theme_color;
        border-radius: 50%;
        // &:after {
        //   content: '主';
        //   display: flex;
        //   justify-content: center;
        //   align-items: center;
        //   width: 20px;
        //   height: 20px;
        //   background: #364fcd;
        //   border-radius: 50%;
        //   position: absolute;
        //   bottom: 0;
        //   right: -6px;
        //   color: #fff;
        //   font-size: 12px;
        // }
      }
      .fs_icon {
        position: absolute;
        width: 14px;
        height: 14px;
        bottom: 0;
        left: 22px;
      }
    }

    .photo_more {
      width: 32px;
      height: 32px;
      background: #eff2f8;
      border-radius: 50%;
      font-weight: 500;
      color: #364fcd;
      font-size: 12px;
      cursor: pointer;
    }
  }
  // 弹框样式
  .photos_dialog {
    display: flex;
    flex-direction: column;
    .photo_item {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      img {
        width: 48px;
        height: 48px;
        border-radius: 50%;
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
