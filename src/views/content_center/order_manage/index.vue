<template>
  <div class="good_store">
    <!-- 筛选条件 -->
    <xm_search
      :searchComponents="searchComponents"
      @getData="querySearch"
      :useOwnReset="true"
      @reset="resetSearch"
    />
    <!-- 列表 -->
    <el-tabs
      class="tab_box"
      v-model="chooseTab"
      @tab-click="choceTabs"
      v-loading="tableForm.loading"
    >
      <el-tab-pane v-for="(tab, i) in tabList" :key="i" :label="tab.label" :name="tab.value">
        <div class="expand_table">
          <template v-if="tableForm.page.total">
            <div class="mian" v-for="(item, index) in tableForm.listData" :key="index">
              <div class="main_top">
                <div>
                  <div class="number" style="display: flex">
                    订单编号:&nbsp;&nbsp;{{ item.orderId }}
                    <img v-copy="item.orderId" src="@/assets/images/content_center/order.png" alt />
                    <div style="margin-left: 30px; display: flex">
                      店铺名称:&nbsp;&nbsp;
                      <div v-if="item.shopId">{{ filterShopName(item.shopId) }}</div>
                      <div v-else>--</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div class="number">
                    下单时间:&nbsp;&nbsp;{{ String(item.createTime).replace(/T/, ' ') }}
                  </div>
                </div>
                <div>
                  <div class="number" v-if="item.orderStatus == 1">{{ '待支付' }}</div>
                  <div class="number" v-if="item.orderStatus == 105">{{ '已支付' }}</div>
                  <div class="number" v-if="item.orderStatus == 2">{{ '备货中' }}</div>
                  <div class="number" v-if="item.orderStatus == 101">{{ '部分发货' }}</div>
                  <div class="number" v-if="item.orderStatus == 3">{{ '已发货' }}</div>
                  <div class="number" v-if="item.orderStatus == 4">{{ '已取消' }}</div>
                  <div class="number" v-if="item.orderStatus == 5">{{ '已完成' }}</div>
                </div>
              </div>

              <div class="main_bootom" v-for="(val, index) in item.childVoList" :key="index">
                <div>
                  <img v-if="val.productPic" :src="val.productPic" alt />
                  <img v-else src="@/assets/images/content_center/default_user.png" alt />
                  <div class="section">
                    <div class="title" v-if="val.productName">{{ val.productName }}</div>
                    <div v-else>{{ '--' }}</div>
                    <div class="price">
                      ¥{{ (val.originAmount / 100).toFixed(2) }} *
                      {{ val.itemNum }}
                    </div>
                  </div>
                </div>
                <div>
                  <div class="section">
                    <div class="title">{{ val.postReceiver }} {{ val.postTel }}</div>
                    <div class="price">{{ val.postAddr }}</div>
                  </div>
                </div>
                <div>
                  <div class="section">
                    <div class="title">
                      商品总价:&nbsp;&nbsp;￥{{ (item.orderAmount / 100).toFixed(2) }}(运费:￥{{
                        (item.postAmount / 100).toFixed(2)
                      }})
                    </div>
                    <div class="price" v-if="item.promotionAmount">
                      优惠:&nbsp;&nbsp;-￥{{ (item.promotionAmount / 100).toFixed(2) }}
                    </div>
                    <div class="title" v-if="item.payAmount">
                      实付:&nbsp;&nbsp;￥{{ (item.payAmount / 100).toFixed(2) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <div class="noData" v-else>暂无数据</div>
        </div>
        <div class="expand_page">
          <el-pagination
            v-model:current-page="pageIndex"
            background
            layout="sizes, prev, pager, next , jumper"
            :total="tableForm.page.total"
            :page-size="page.size"
            :page-sizes="[5, 10, 20]"
            @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
          ></el-pagination>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script setup>
import vCopy from '@/directive/copy'
import { pageList } from './model/get_list.js'
const {
  searchComponents,
  chooseTab,
  tabList,
  tableForm,
  getList,
  page,
  pageIndex,
  getHaveStore,
  shopList
} = pageList()
const filterShopName = val => {
  const shopName = shopList.value.find(item => {
    return val + '' === item.shopId + ''
  })
  return shopName ? shopName.shopName : '--'
}
const handleCurrentChange = val => {
  pageIndex.value = val
  page.index = val
  getList()
}
const handleSizeChange = val => {
  pageIndex.value = 1
  page.index = 1
  page.size = val
  getList()
}
function querySearch() {
  pageIndex.value = 1
  page.index = 1
  getList()
}
// 重置
function resetSearch() {
  tableForm.loading = true
  tableForm.page = {
    index: 1,
    size: 5,
    total: 0
  }
  getList()
}
function choceTabs() {
  searchComponents.value[2].val = chooseTab.value
  getList()
}
getHaveStore()
getList() // 查询
</script>
<style lang="scss" scoped>
@import '../components/css/page.scss';
.good_store {
  .tab_box {
    background: #fff;
    margin-top: 10px;
    border-radius: 4px;
    padding: 30px 24px;
    .expand_table {
      .noData {
        padding: 20px 0;
        text-align: 14px;
        text-align: center;
        color: #909399;
      }
      .head {
        width: 100%;
        height: 58px !important;
        background-color: #f7f8fa;
        text-align: left;
        background: #f6f7f8;
        padding: 17px 20px;
        height: 23px;
        color: #000000;
        font-size: 14px;
        font-weight: 500;
        line-height: 23px;
        border-bottom: #ebeef5 1px solid;
        display: flex;
        div:nth-child(1) {
          flex: 4;
        }
        div:nth-child(2) {
          flex: 3;
        }
        div:nth-child(3) {
          flex: 2;
        }
      }
      .mian {
        &:hover {
          background-color: #f7f8fa;
        }
        margin-top: 12px;
        border: #ebeef5 1px solid;
        .main_top {
          width: 100%;
          background-color: #f7f8fa;

          line-height: 20px;
          padding: 12px 20px;
          display: flex;
          > div {
            display: flex;
            margin-right: 24px;
            .number {
              height: 20px;
              font-size: 14px;
              font-family: PingFangSC-Regular, PingFang SC;
              font-weight: 400;
              color: #909399;
              line-height: 20px;
            }
            img {
              width: 16px;
              height: 16px;
              margin-left: 6px;
              vertical-align: middle;
              margin-top: 2px;
              cursor: pointer;
            }
          }
          div:nth-child(1) {
            flex: 4;
            word-break: break-all;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
            overflow: hidden;
          }
          div:nth-child(2) {
            flex: 3;
          }
          div:nth-child(3) {
            flex: 2;
          }
        }
        .main_bootom {
          width: 100%;
          border-top: #ebeef5 1px solid;
          display: flex;
          text-align: left;
          padding: 17px 20px;
          color: #000000;
          font-size: 14px;
          font-weight: 500;
          line-height: 23px;
          div:nth-child(1) {
            flex: 4;
            display: flex;
            img {
              width: 60px;
              height: 60px;
              border-radius: 4px;
              margin-right: 10px;
            }
            .section {
              flex-direction: column;
              .title {
                font-size: 14px;
                font-family: PingFangSC-Medium, PingFang SC;
                font-weight: 500;
                color: #303133;
                margin: 6px 0;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 1;
                -webkit-box-orient: vertical;
                overflow-wrap: break-word;
                max-width: 500px;
              }
              .price {
                font-size: 14px;
                font-family: PingFangSC-Regular, PingFang SC;
                font-weight: 400;
                color: #909399;
              }
            }
          }
          div:nth-child(2) {
            flex: 3;
            .section {
              flex-direction: column;
              .title {
                font-size: 14px;
                font-family: PingFangSC-Medium, PingFang SC;
                font-weight: 500;
                color: #303133;
                margin: 6px 0;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 1;
                -webkit-box-orient: vertical;
                overflow-wrap: break-word;
                max-width: 300px;
              }
              .price {
                font-size: 14px;
                font-family: PingFangSC-Regular, PingFang SC;
                font-weight: 400;
                color: #909399;
              }
            }
          }
          div:nth-child(3) {
            flex: 2;
            .section {
              flex-direction: column;
              .title {
                font-size: 14px;
                font-family: PingFangSC-Medium, PingFang SC;
                font-weight: 500;
                color: #303133;
                margin: 6px 0;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 1;
                -webkit-box-orient: vertical;
                overflow-wrap: break-word;
                max-width: 300px;
              }
              .price {
                font-size: 14px;
                font-family: PingFangSC-Regular, PingFang SC;
                font-weight: 400;
                color: #909399;
              }
            }
          }
        }
      }
    }
    .expand_page {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
      width: 100%;
    }
  }
  .good_box {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .good_img_box {
      width: 60px;
      height: 60px;
      border-radius: 4px;
      margin-right: 10px;
      position: relative;
    }
    .good_img {
      width: 60px;
      height: 60px;
      border-radius: 4px;
      object-fit: cover;
    }
    .good_content {
      max-width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      font-size: 14px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 600;
      color: #303133;
      line-height: 20px;
    }
  }
}
</style>
