<template>
  <div class="good_store">
    <!-- 筛选条件 -->
    <xm_search
      :searchComponents="searchComponents"
      @getData="querySearch"
      :useOwnReset="true"
      @reset="resetSearch"
    ></xm_search>
    <!-- 列表 -->
    <div class="tab_box">
      <div class="btn">
        <el-button type="primary" @click="openImportDialog(1)">批量发货</el-button>
        <el-button type="primary" @click="openImportDialog(2)">批量核销</el-button>
        <!-- <async_button style="margin-bottom: 22px" :asyncFunc="exportFiles">导出</async_button> -->
        <exp_button :asyncFunc="exportFiles">导出</exp_button>
      </div>
      <el-tabs v-model="chooseTab" @tab-click="choceTabs" v-loading="tableForm.loading">
        <el-tab-pane v-for="(tab, i) in tabList" :key="i" :label="tab.label" :name="tab.value">
          <div class="expand_table">
            <template v-if="tableForm.page.total">
              <div class="head">
                <div>
                  <span>{{ '订单信息' }}</span>
                </div>
                <div>收货信息</div>
                <div>兑换信息</div>
                <div>发货信息</div>
                <div>状态</div>
                <div>操作</div>
              </div>
              <div class="mian" v-for="(item, index) in tableForm.listData" :key="index">
                <div class="main_top">
                  <div>
                    <div class="number" style="display: flex">
                      订单编号:&nbsp;&nbsp;{{ item.id }}
                      <img
                        v-copy="String(item.id)"
                        src="@/assets/images/content_center/order.png"
                        alt
                      />
                      <div style="margin-left: 30px; display: flex">
                        兑换时间:&nbsp;&nbsp;
                        <div v-if="item.exchangeTime">{{ item.exchangeTime }}</div>
                        <div v-else>--</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="main_bootom" :key="index">
                  <!--  订单信息 -->
                  <div>
                    <img v-if="item.goodsImg" :src="item.goodsImg" alt />
                    <img v-else src="@/assets/images/content_center/default_user.png" alt />
                    <div class="section">
                      <div class="title" v-if="item.goodsName">{{ item.goodsName }}</div>
                      <div v-else>{{ '--' }}</div>
                      <div class="price">
                        ¥{{ (Number(item.goodsPrice) / 100).toFixed(2) }}({{ item.goldNum
                        }}{{ item.goldTypeName ? item.goldTypeName : '金币' }})
                      </div>
                    </div>
                  </div>
                  <!--  收获信息 -->
                  <div>
                    <div class="section">
                      <div class="title">
                        <span style="margin-right: 6px">{{ item.receiverName }}</span>
                        <table_column_phone :phone="item.receiverPhone"></table_column_phone>
                      </div>
                      <div class="price">{{ item.address }}</div>
                    </div>
                  </div>
                  <!--  兑换信息 -->
                  <div style="line-height: 60px">
                    {{ item.exchangeType === 1 ? '成员兑换' : '--' }}
                  </div>
                  <!--  发货信息 -->
                  <div>
                    <div class="section">
                      <div style="line-height: 60px" v-if="item.deliverStatus === 3">-</div>
                      <div v-else-if="item.trackingCompany" style="flex-direction: column">
                        <div class="title">{{ item.trackingCompany || '--' }}</div>
                        <div class="price" v-if="item.trackingNo">
                          {{ item.trackingNo || '--' }}
                          <img
                            style="
                              width: 16px;
                              height: 16px;
                              margin-left: 6px;
                              vertical-align: middle;
                              margin-top: 2px;
                              cursor: pointer;
                            "
                            v-copy="item.trackingNo"
                            src="@/assets/images/content_center/order.png"
                            alt
                          />
                        </div>
                      </div>
                      <div style="line-height: 60px" v-else>暂无</div>
                    </div>
                  </div>
                  <!--  状态 -->
                  <div style="line-height: 60px">
                    {{
                      item.deliverStatus === 2
                        ? '已完成'
                        : item.deliverStatus === 1
                        ? '待发货'
                        : '待核销'
                    }}
                  </div>
                  <!--  操作 -->
                  <div
                    style="cursor: pointer; line-height: 60px; color: #364fcd"
                    v-if="item.deliverStatus === 3"
                    @click="beforeWriteOff(item)"
                  >
                    核销
                  </div>
                  <div
                    style="cursor: pointer; line-height: 60px; color: #364fcd"
                    v-else-if="item.deliverStatus === 1"
                    @click="handleEdit(item, 'add')"
                  >
                    发货
                  </div>
                  <!-- isVirtual 1虚拟 0实物  -->
                  <div
                    style="cursor: pointer; line-height: 60px; color: #364fcd"
                    v-else-if="item.deliverStatus === 2 && item.isVirtual === 0"
                    @click="handleEdit(item, 'edit')"
                  >
                    修改
                  </div>
                  <div style="line-height: 60px;" v-else>-</div>
                </div>
              </div>
            </template>
            <div class="noData" v-else>暂无数据</div>
          </div>
          <div class="expand_page">
            <el-pagination
              v-model:current-page="tableForm.page.index"
              background
              layout="total, sizes, prev, pager, next , jumper"
              :total="tableForm.page.total"
              :page-size="tableForm.page.size"
              :page-sizes="tableForm.page.sizes"
              @current-change="handleCurrentChange"
              @size-change="handleSizeChange"
            ></el-pagination>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <!-- 发货弹窗   -->
    <el-dialog v-model="dialogDate.showDialog" v-if="dialogDate.showDialog" :title="dialogDate.title" width="30%">
      <el-form :rules="rules" :model="formInline" ref="myFormRef" class="demo-form-inline">
        <el-form-item label="快递单号" prop="code">
          <el-input
            v-model.trim="formInline.code"
            placeholder="请输入快递单号"
            clearable
            maxlength="30"
          ></el-input>
        </el-form-item>
        <el-form-item label="快递公司" prop="codeName">
          <el-input
            v-model.trim="formInline.codeName"
            placeholder="请输入快递公司"
            maxlength="30"
            clearable
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelDialog">取消</el-button>
          <el-button type="primary" @click="saveDialog">保存</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 导入弹窗   -->
    <import-file-dialog
      v-model:show="importData.showImport"
      :title="importData.title"
      :successTips = 'false'
      :other-data="{ importType: importData.importType }"
      :subTitle="importData.subTitle"
      tips="（注：单次最多导入1000行）"
      uploadUrl="/api/mission/gold/exchange/record/importBatchShipping"
      :exportFile="batchAddExportFiles"
      :canBatchAddExportFiles="canBatchAddExportFiles"
      @uploadSuccess="successExport"
    ></import-file-dialog>
  </div>
</template>
<script setup>
import vCopy from '@/directive/copy'
import { pageList } from './model/get_list.js'
import importFileDialog from '@/views/market/components/import_file_dialog.vue'
import {ElMessage, ElMessageBox} from "element-plus";
import {writeOffOrder} from "@/api/market/gold.js";

const {
  searchComponents,
  chooseTab,
  tabList,
  tableForm,
  getList,
  exportFiles,
  batchAddExportFiles,
  canBatchAddExportFiles,
  dialogDate,
  handleEdit,
  saveDialog,
  cancelDialog,
  rules,
  formInline,
  myFormRef,
  // beforeWriteOff,
  openImportDialog,
  importData
} = pageList()
const handleCurrentChange = val => {
  tableForm.pageIndex = val
  tableForm.page.index = val
  getList()
}
const handleSizeChange = val => {
  tableForm.pageIndex = 1
  tableForm.page.index = 1
  tableForm.page.size = val
  getList()
}

// 查询
function querySearch(val) {
  tableForm.page.index = 1
  getList()
}

// 重置
function resetSearch() {
  tableForm.loading = true
  tableForm.page = {
    index: 1,
    size: 10,
    total: 0
  }
  getList()
}
function choceTabs() {
  tableForm.page.index = 1
  searchComponents.value[2].val = chooseTab.value
  getList()
}

onMounted(() => {
  getList()
})
// 导出成功
const successExport = (res) => {
  if (res.code === 0){
    ElMessage.success(res.data)
    getList()
  }
}
// 商品核销
const beforeWriteOff = (item) => {
  ElMessageBox.confirm('确定已核销该商品?', '核销虚拟商品', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    writeOffOrder({
      id: item.id,
      writeOffResult: true
    }).then(res => {
      if (res.code === 0){
        ElMessage.success('核销成功')
        // 重新刷新 重置
        querySearch()
      }
    })
  })
}
</script>
<style lang="scss" scoped>
@import '@/styles/layout.scss';
.good_store {
  .tab_box {
    background: #fff;
    margin-top: 10px;
    border-radius: 4px;
    padding: 22px 24px 57px 24px;
    .btn {
      display: flex;
      margin-bottom: 20px;
    }
    .expand_table {
      .noData {
        padding: 20px 0;
        text-align: 14px;
        text-align: center;
        color: #909399;
      }
      .head {
        padding: 17px 20px;
        text-align: left;
        background: #f6f7f8;
        color: #000000;
        font-size: 14px;
        font-weight: 500;
        line-height: 23px;
        border-bottom: #ebeef5 1px solid;
        display: flex;
        margin-bottom: 12px;
        div:nth-child(1) {
          flex: 4;
        }
        div:nth-child(2) {
          flex: 3;
        }
        div:nth-child(3) {
          flex: 1;
        }
        div:nth-child(4) {
          flex: 3;
        }
        div:nth-child(5) {
          flex: 1;
        }
        div:nth-child(6) {
          flex: 1;
        }
      }
      .mian {
        border: #ebeef5 1px solid;
        .main_top {
          background-color: #f7f8fa;
          // padding-top: 12px;
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
          }
          div:nth-child(2) {
            flex: 3;
          }
          div:nth-child(3) {
            flex: 1;
          }
          div:nth-child(4) {
            flex: 3;
          }
          div:nth-child(5) {
            flex: 1;
          }
          div:nth-child(6) {
            flex: 1;
          }
        }
        .main_bootom {
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
          }
          div:nth-child(2) {
            flex: 3;
          }
          div:nth-child(3) {
            flex: 1;
          }
          div:nth-child(4) {
            flex: 3;
          }
          div:nth-child(5) {
            flex: 1;
          }
          div:nth-child(6) {
            flex: 1;
          }
          div {
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
                img {
                }
              }
              .price {
                font-size: 14px;
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
      font-weight: 600;
      color: #303133;
      line-height: 20px;
    }
  }
}
</style>
