<template>
  <div class="good_store">
    <!-- 筛选条件 -->
    <xm_search
      :searchComponents="searchComponents"
      @getData="searchList"
      :useOwnReset="true"
      @reset="resetSearch"
    />
    <!-- 列表 -->
    <div class="table_box">
      <div class="table_top">
        <div class="rule_box">
          <div class="left_rule">
            <div
              @click="changeTab(item.name)"
              :class="{ one_rule: true, choose_rule: item.name == chooseTab }"
              v-for="(item, index) in tabList"
              :key="index"
            >
              {{ item.label }}
            </div>
          </div>
        </div>
        <div class="btn_box">
          <el-button type="primary" @click="batchGrouping">批量分组</el-button>
          <el-button type="primary" @click="batchSelected">批量设置精选</el-button>
          <el-button @click="batchCancelSelected">批量取消精选</el-button>
        </div>
      </div>

      <xm_table
        showSelection
        tableType="live"
        ref="table"
        class="pic_table"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column min-width="300" label="商品名称">
          <template #default="scope">
            <div class="good_box">
              <div class="good_img_box">
                <!-- <img v-if="scope.row.img" :src="scope.row.img" class="good_img" /> -->
                <el-image class="good_img" :src="scope.row.img" alt>
                  <template #error>
                    <div class="good_img errImg_box"></div>
                  </template>
                </el-image>
                <!-- <img
                  class="good_img"
                  v-else
                  src="@/assets/images/content_center/default_cover.png"
                  alt=""
                /> -->
                <img
                  v-if="scope.row.featured == 1"
                  class="selected_img"
                  src="@/assets/images/content_center/selected.png"
                  alt=""
                />
              </div>
              <div class="good_content">
                <div class="content_text line-hidden2">
                  {{ scope.row.name || '--' }}
                </div>
                <div class="content_text" style="color: #909399; margin-top: 2px">
                  货号：{{
                    scope.row.outProductId === '0' ? scope.row.productIdStr : scope.row.outProductId
                  }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="120" label="价格">
          <template #default="scope">
            <div v-if="scope.row.showPrice == 1">
              ￥{{
                scope.row.discountPrice ? changeTwoDecimal(scope.row.discountPrice, false) : '0.00'
              }}
            </div>
            <div v-else>--</div>
          </template>
        </el-table-column>
        <el-table-column min-width="120" label="状态">
          <template #default="scope">
            <div class="status_content" v-if="scope.row.status == 0 && scope.row.checkStatus == 3">
              <div class="status_circle green_circle"></div>
              <div>售卖中</div>
            </div>
            <div class="status_content" v-else-if="scope.row.status == 1">
              <div class="status_circle red_circle"></div>
              <div>已下架</div>
            </div>
            <div class="status_content" v-else-if="scope.row.status == 2">
              <div class="status_circle"></div>
              <div>已删除</div>
            </div>
            <div v-else>
              <div class="status_content yellow_circle">
                <div class="status_circle"></div>
                <div>未上架</div>
              </div>
              <div style="color: #909399; margin-top: 6px">
                ({{
                  scope.row.checkStatus == 1
                    ? '未提审'
                    : scope.row.checkStatus == 2
                    ? '审核中'
                    : scope.row.checkStatus == 4
                    ? '审核驳回'
                    : scope.row.checkStatus == 5
                    ? '封禁'
                    : scope.row.checkStatus == 7
                    ? '待上架'
                    : '--'
                }})
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="160" label="分组">
          <template #default="scope">
            <template v-if="scope.row.groupList">
              <div class="table_group">
                <div class="one_group" v-for="(item, index) in scope.row.groupList" :key="index">
                  {{ item.name }}
                </div>
              </div>
            </template>

            <div v-else>--</div>
          </template>
        </el-table-column>
        <el-table-column min-width="140" label="店铺名称">
          <template #default="scope">
            <div>{{ scope.row.shopId ? shopMap.get(scope.row.shopId) : '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column width="200" label="创建时间">
          <template #default="scope">
            <div>{{ scope.row.gmtCreate || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          fixed="right"
          width="160"
          align="center"
          header-align="center"
        >
          <template #default="scope">
            <div class="table_btn">
              <el-link class="one_btn" type="primary" @click="setGroup(scope.row)">
                商品分组
              </el-link>
              <el-link
                class="one_btn"
                v-if="scope.row.featured == 1"
                type="primary"
                @click="setSelected(scope.row, false)"
              >
                取消精选
              </el-link>
              <el-link class="one_btn" v-else type="primary" @click="setSelected(scope.row, true)">
                设置精选
              </el-link>
            </div>
          </template>
        </el-table-column>
      </xm_table>
    </div>
    <!-- 设置商品分组 -->
    <setGroupModal
      @updateGroup="getGroupList"
      @updateList="updateList"
      v-if="setGroupForm.show"
      :setGroupForm="setGroupForm"
    ></setGroupModal>
  </div>
</template>
<script setup>
import { UpdateShopProduct } from '@/api/content_center/good_store.js'
import { throttle, changeTwoDecimal } from '@/utils/tools'
import setGroupModal from '../../components/setGroup_modal.vue'
import { pageList } from '../model/get_list.js'
defineComponent(setGroupModal)
const props = defineProps({
  shopList: {
    type: Array,
    default: () => []
  }
})
const shopList = toRef(props, 'shopList')
const message = inject('$message')
const $confirm = inject('$confirm')
// 设置分组弹窗的数据
const setGroupForm = reactive({
  show: false,
  goodId: [],
  groupList: []
})
const { searchComponents, chooseTab, tabList, tableForm, getList, getGroupList } = pageList(
  shopList.value
)
function arrChangeMap1(arr) {
  if (arr.length > 0) {
    return new Map(arr.map((value, key) => [value.shopId, value.shopName]))
  } else {
    return new Map()
  }
}
const shopMap = arrChangeMap1(shopList.value)
function changeTab(e) {
  chooseTab.value = e
  resetSearch()
}
// 重置
function resetSearch() {
  tableForm.loading = true
  tableForm.page.index = 1
  tableForm.page.size = 10
  getList()
}
// 查询
function searchList() {
  tableForm.loading = true
  tableForm.page.index = 1
  getList()
}
resetSearch()
const table = ref(null)
// 选中的数据
const selectIds = ref([])
// 表格的选择
function handleSelectionChange(e) {
  console.log('e', e)
  selectIds.value = e
}
// 商品分组-单个
function setGroup(e) {
  setGroupForm.goodId = [e.id]
  if (setGroupForm.goodId.length > 0) {
    const groupList = e.groupList || []
    let checkList = []
    checkList = groupList.map(x => {
      return x.id
    })
    setGroupForm.groupList = checkList
    setGroupForm.show = true
  } else {
    message.warning('请先选择商品')
  }
}
// 设置精选-单个
function setSelected(e, stu) {
  $confirm({
    title: '系统提醒',
    content: (stu ? '' : '取消') + '设置精选商品，是否确认？',
    success() {
      UpdateShopProduct([
        {
          id: e.id,
          featured: stu ? 1 : 0
        }
      ]).then(res => {
        if (res.code === 0) {
          message.success('设置成功')
          getList()
        }
      })
    }
  })
}
// 批量设置分组
const batchGrouping = throttle(function () {
  console.log('selectIds', selectIds.value)
  const list = selectIds.value.map(x => {
    return x.id
  })
  setGroupForm.goodId = list
  if (setGroupForm.goodId.length > 0) {
    setGroupForm.groupList = []
    setGroupForm.show = true
  } else {
    message.warning('请先选择商品')
  }
}, 300)
// 批量设置精选
const batchSelected = throttle(function () {
  console.log('selectIds', selectIds.value)

  const list = selectIds.value.map(x => {
    return { id: x.id, featured: 1 }
  })
  console.log('list', list)
  if (list.length > 0) {
    $confirm({
      title: '系统提醒',
      content: '批量设置精选商品，是否确认？',
      success() {
        UpdateShopProduct(list).then(res => {
          if (res.code === 0) {
            message.success('设置成功')
            updateList()
          }
        })
      }
    })
  } else {
    message.warning('请先选择商品')
  }
}, 300)
// 批量取消精选
const batchCancelSelected = throttle(function () {
  console.log('selectIds', selectIds.value)
  const list = selectIds.value.map(x => {
    return { id: x.id, featured: 0 }
  })
  if (list.length > 0) {
    $confirm({
      title: '系统提醒',
      content: '取消批量设置精选商品，是否确认？',
      success() {
        UpdateShopProduct(list).then(res => {
          if (res.code === 0) {
            message.success('设置成功')

            updateList()
          }
        })
      }
    })
  } else {
    message.warning('请先选择商品')
  }
}, 300)
// 设置成功--更新列表,清除选中状态
function updateList() {
  setGroupForm.show = false
  getList()
  // 清除表格的选中状态
  table.value.$refs.table.clearSelection()
}
</script>
<style lang="scss" scoped>
@import '../../components/css/page.scss';
.table_box {
  margin-top: $content_margin;
  border-radius: $content_radius;
  width: 100%;
  background: #fff;
  padding: 22px 24px;
  .table_top {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    .rule_box {
      margin-bottom: 16px;
    }
    .btn_box {
      margin-bottom: 16px;
      flex: 1;

      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
  }
}
.good_store {
  :deep(.el-tabs__header) {
    margin-bottom: 16px;
  }
  .table_head {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    img {
      margin-left: 6px;
      width: 16px;
      height: 16px;
      display: flex;
    }
  }
  .tab_box {
    background: #fff;
    margin-top: 10px;
    border-radius: 4px;
    padding: 30px 24px;
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
    .selected_img {
      position: absolute;
      left: 0;
      top: 0;
      width: 28px;
      height: 14px;
      display: flex;
    }
    .good_content {
      max-width: calc(100% - 70px);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      // height: 60px;
      font-size: 14px;
      font-weight: 500;
      color: #303133;
      line-height: 20px;
    }
  }
}
</style>
