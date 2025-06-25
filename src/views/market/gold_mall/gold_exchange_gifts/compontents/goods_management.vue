<template>
  <div class="page">
    <!-- 头部 -->
    <header class="top">
      <!-- 无库存自动下架 -->
      <aside>
        <el-switch
          :loading="goldSwitch.loading"
          :before-change="stockBeforeChange"
          @change="stockChange"
          v-model="goldSwitch.value"
          inline-prompt
          :width="45"
          active-text="开"
          inactive-text="关"
        ></el-switch>
        <div class="title">无库存自动下架</div>
        <p style="margin: 0 0 0 16px">开启后，若商品库存为0，则自动下架</p>
      </aside>
      <aside>
        <el-switch
          @change="limitChange"
          v-model="limitSwitch.isOpen"
          :loading="limitSwitch.loading"
          :before-change="limitBeforeChange"
          inline-prompt
          :width="45"
          active-text="开"
          inactive-text="关"
        ></el-switch>
        <div class="title">全场限购</div>
        <el-button
          type="text"
          style="padding: 8px 16px; color: #364fcd"
          @click="limitData.show = true"
        >
          设置
        </el-button>
      </aside>
      <!-- 商城弹窗提醒
      <aside></aside>-->
    </header>
    <!-- 筛选条件 -->
    <section class="search">
      <xm_search
        :searchComponents="searchComponents"
        @getData="searchList"
        :useOwnReset="true"
        @reset="resetSearch"
      />
    </section>
    <!-- 内容 -->
    <section class="content">
      <div class="page_main mt_16">
        <div class="page_btns">
          <el-button type="primary" @click="addGood">新建商品</el-button>
        </div>
        <xm_table
          class="pic_table"
          tableType="live"
          v-loading="tableForm.loading"
          :data="tableForm.listData"
          v-model:page="tableForm.page"
          @getTableData="getList"
        >
          <el-table-column width="150" label="排序">
            <template #default="scope">
              <div class="num_box" v-if="!scope.row.isEdit">
                {{ scope.row.goodsSort || 1 }}
                <img
                  @click="scope.row.isEdit = true"
                  src="@/assets/images/content_center/edit.png"
                  alt
                />
              </div>
              <div v-else>
                <el-input class="green_btn" v-model.number="scope.row.goodsSort" type="text">
                  <template #append>
                    <el-button
                      @click="changeGroup(scope.$index, scope.row)"
                      :icon="transElIconName('Select')"
                    ></el-button>
                  </template>
                </el-input>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="商品信息" min-width="200">
            <template #default="scope">
              <div style="display: flex; align-items: center">
                <img v-if="scope.row.goodsImg" :src="scope.row.goodsImg" alt class="good_img" />
                <img
                  v-else
                  src="@/assets/images/content_center/default_cover.png"
                  alt
                  class="good_img"
                />
                <div style="width: calc(100% - 60px)">{{ scope.row.goodsName || '--' }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="商品价格" min-width="120">
            <template #default="scope">
              <div v-if="scope.row.goodsPrice != null">
                ￥{{ (scope.row.goodsPrice / 100).toFixed(2) || '0' }}
              </div>
              <div v-else>--</div>
            </template>
          </el-table-column>

          <el-table-column label="兑换金币" prop="needGoldNum" min-width="120">
            <template #default="scope">
              <div>{{ scope.row.needGoldNum || 0 }}</div>
            </template>
          </el-table-column>

          <el-table-column label="已兑换" prop="soldVolume" min-width="120">
            <template #default="scope">
              <div>{{ scope.row.soldVolume || 0 }}</div>
            </template>
          </el-table-column>
          <el-table-column label="库存" prop="stock" min-width="120">
            <template #default="scope">
              <div>{{ scope.row.stock || 0 }}</div>
            </template>
          </el-table-column>
          <el-table-column label="秒杀商品" prop="stock" min-width="120">
            <template #default="scope">
              <div>{{ scope.row.isSecKill == 1 ? '是' : '否' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="秒杀金币" prop="stock" min-width="120">
            <template #default="scope">
              <div>{{ scope.row.secKillPrice || 0 }}</div>
            </template>
          </el-table-column>
          <el-table-column label="限购" min-width="120">
            <template #default="scope">
              <div>{{ scope.row.limitExchangeTimes ? scope.row.limitExchangeTimes : '--' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="可见范围" min-width="200">
            <template v-slot="{ row }">
              <!-- koc -->
              <el-tooltip v-if="[0, 2].includes(row.goodsMarket)" placement="top">
                <template #content>
                  <div>KOC成员</div>
                </template>
                <div class="koc_line">KOC成员</div>
              </el-tooltip>
              <table_column_department_info
                connectStr="/"
                divisionStr=";"
                v-if="row.orgInfo && [0, 1].includes(row.goodsMarket)"
                :departmentName="row.orgInfo"
                trigger="hover"
              ></table_column_department_info>
              <span v-if="!row.orgInfo && row.goodsMarket == 1">全部</span>
            </template>
          </el-table-column>

          <el-table-column label="可兑换时间" min-width="180">
            <template #default="scope">
              <div v-if="scope.row.startExchangeTime">
                {{ scope.row.startExchangeTime }}至
                <br />
                {{ scope.row.endExchangeTime }}
              </div>
              <div v-else>--</div>
            </template>
          </el-table-column>

          <el-table-column label="开启兑换" min-width="120">
            <template #default="scope">
              <div style="-webkit-line-clamp: 2">
                <el-switch
                  :before-change="
                    goldSwitch.value && scope.row.stock == 0 && !scope.row.isOpen
                      ? oneBeforeChange
                      : null
                  "
                  v-model="scope.row.isOpen"
                  inline-prompt
                  :width="45"
                  active-text="开"
                  inactive-text="关"
                  @change="val => oneChange(val, scope.$index, scope.row)"
                ></el-switch>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="120" align="right" fixed="right">
            <template #default="scope">
              <el-link type="primary" @click="editGood(scope.row)">设置</el-link>
              <el-link
                type="danger"
                v-if="!scope.row.isOpen"
                class="ml_16"
                @click="delGood(scope.row)"
              >
                删除
              </el-link>
            </template>
          </el-table-column>
        </xm_table>
      </div>

      <goodModal v-if="modal.show" :goodModal="modal" @updateList="updateList"></goodModal>
      <limitModel v-if="limitData.show" :limitModal="limitData" />
    </section>
  </div>
</template>

<script setup>
import { deleteGood, updateWeightAndStatus } from '@/api/market/gold_exchange_gifts.js'
import { pageList } from '../modal/get_list.js'
import { pageSwitch } from '../modal/get_switch'
import { throttle, transElIconName } from '@/utils/tools.js'

import goodModal from './good_modal.vue'
import limitModel from './limit_modal.vue'
defineComponent(goodModal)
defineComponent(limitModel)

const message = inject('$message')
const { goldSwitch, limitSwitch, stockBeforeChange, limitBeforeChange } = pageSwitch()
const { searchComponents, tableForm, getList } = pageList()

// 重置
function resetSearch() {
  tableForm.loading = true
  tableForm.page.index = 1
  tableForm.page.size = 10
  getList()
}
resetSearch()
// 查询
function searchList() {
  tableForm.loading = true
  tableForm.page.index = 1
  getList()
}
const $confirm = inject('$confirm')
function stockChange() {
  searchList()
}
// 单个开关的提示--开启了无库存自动下架，并且该商品库存为0
function oneBeforeChange(e) {
  return new Promise((resolve, reject) => {
    if (!e) {
      $confirm({
        title: '系统提醒',
        content:
          '当前已开启无库存自动下架功能，您需添加该商品库存或关闭无库存自动下架功能，才可上架该商品',
        confirmButtonText: '我知道了',
        success() {
          return resolve(false)
        }
      })
    } else {
      return resolve(true)
    }
  })
}
function oneChange(e, i, row) {
  updateWeightAndStatus({
    id: row.id,
    openStatus: e ? 1 : 0
  }).then(res => {
    if (res.code === 0) {
      getList()
    }
  })
}
// 修改排序
const changeGroup = throttle(function (index, row) {
  const regE = /^[1-9]\d*$/g
  if (regE.test(row.goodsSort)) {
    if (parseInt(row.goodsSort) <= tableForm.page.total) {
      // 请求接口
      updateWeightAndStatus({
        id: row.id,
        weight: row.goodsSort
      }).then(res => {
        if (res.code === 0) {
          getList()
        }
      })
    } else {
      message.warning('只能输入1到' + tableForm.page.total + '的正整数')
    }
  } else {
    tableForm.listData[index].goodsSort = row.weight
    message.warning('只能输入1到' + tableForm.page.total + '的正整数')
  }
}, 300)
// 删除商品
const delGood = throttle(e => {
  $confirm({
    title: '系统提醒',
    content: '删除商品信息后不可恢复，是否确认？',
    success() {
      deleteGood({
        query: `?goodsId=${e.id}`
      }).then(res => {
        if (res.code === 0) {
          message.success('删除成功')
          getList()
        }
      })
    }
  })
}, 300)
const modal = reactive({
  show: false,
  data: null,
  title: '',
  isEdit: false,
  isOpen: false
})
// 修改商品
const editGood = throttle(e => {
  modal.title = '编辑商品'
  modal.data = e
  modal.show = true
  modal.isEdit = true
  modal.isOpen = e.isOpen
}, 700)
// 添加商品
const addGood = throttle(() => {
  modal.title = '新建商品'
  modal.show = true
  modal.data = null
  modal.isEdit = false
  modal.isOpen = false
}, 300)
// 弹窗确定后刷新页面
function updateList(stu) {
  if (stu) {
    searchList()
  } else {
    getList()
  }
}
// 全场限购状态
const limitData = reactive({
  show: false, // 是否显示限购设置弹窗
  title: '限购设置'
})

// 限购设置弹窗开关
function limitChange() {
  searchList()
}
</script>

<style lang="scss" scoped>
.page {
  .top {
    // padding: 16px;
    border-radius: 4px;
    display: flex;
    height: 92px;
    justify-content: space-between;
    background: #fff;
    margin-bottom: 16px;
    flex-direction: column;
    aside {
      flex: 1;
      border-radius: 4px;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      padding: 0 24px;
      &:last-child {
        margin-top: -20px;
      }
      .title {
        margin-left: 24px;
        font-size: 16px;
        font-weight: 400;
        font-family: PingFangSC-Regular, PingFang SC;

        color: #323233;
      }
      p {
        margin-top: 2px;
        margin-left: 5px;
        font-size: 12px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #909399;
      }
    }
  }
  .search {
    margin-bottom: 16px;
  }
  .content {
    border-radius: 4px;
    background-color: #fff;
    .el-table-column {
      color: #333333;
    }
  }
}
.num_box {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  height: 32px;
  img {
    width: 16px;
    height: 16px;
    margin-left: 5px;
    cursor: pointer;
  }
}
.green_btn {
  width: max-content;

  :deep(.el-input__inner) {
    width: 80px;
  }
  :deep(.el-input-group__append) {
    background: none;
    padding: 0 12px;
  }
  :deep(.el-icon) {
    color: #87d661;
  }
}
.good_img {
  width: 52px;
  height: 52px;
  margin-right: 16px;
  object-fit: cover;
  border-radius: 4px;
}
.row_overflow2 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow-wrap: break-word;
}
.koc_line {
  width: max-content;
  cursor: pointer;
  margin: 2px 5px 0px 0;
  padding: 0px 9px;
  font-size: 12px;
  color: #ed6a0c;
  line-height: 22px;
  background: rgba(237, 106, 12, 0.2);
  border: 1px solid #ed6a0c;
  border-radius: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  word-break: break-all;
  line-break: anywhere;
}
</style>
