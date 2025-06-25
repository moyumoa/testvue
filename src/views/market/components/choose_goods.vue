<template>
  <div>
    <slot name="default">
      <el-button type="primary" @click="data.goodsDialog = true" v-if="!data.selectedInfo.id">
        设置
      </el-button>
      <div class="selected" v-else>
        <span>【抖店商品】：{{ data.selectedInfo.name }}</span>
        <el-icon style="cursor: pointer" @click="cancelSelect">
          <i-delete color="#f85151" />
        </el-icon>
      </div>
    </slot>

    <el-dialog v-model="data.goodsDialog" title="Tips" :width="1080">
      <template #title>
        <div class="dialog_title">
          <span class="title">选择商品</span>
        </div>
      </template>
      <div class="page_link_dialog">
        <xm_search :searchComponents="data.searchComponents" @getData="searchList"></xm_search>
        <xm_table
          v-loading="data.loading"
          :data="data.tableData"
          v-model:page="data.page"
          @getTableData="getList"
          :pageSizes="[5, 10, 20]"
        >
          <el-table-column label="商品名称" prop="name">
            <template #default="scope">
              <div class="goods_info">
                <img v-if="scope.row.img" :src="scope.row.img" class="good_img" />
                <img
                  class="good_img"
                  v-else
                  src="@/assets/images/content_center/default_cover.png"
                  alt
                />
                <div class="goods_name">{{ scope.row.name || '--' }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="商品分组" prop="name"></el-table-column>
          <el-table-column min-width="120" label="价格" :width="120">
            <template #default="scope">
              <div v-if="scope.row.showPrice == 1">
                ￥{{ scope.row.discountPrice ? changeTwoDecimal(scope.row.discountPrice) : '0.00' }}
              </div>
              <div v-else>--</div>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" prop="gmtCreate" :width="180"></el-table-column>
          <el-table-column label="操作" align="right" :width="120">
            <template #default="scope">
              <el-link type="primary" @click="select(scope.row)">选择</el-link>
            </template>
          </el-table-column>
        </xm_table>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="data.goodsDialog = false">取消</el-button>
          <el-button type="primary" @click="data.goodsDialog = false">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { selectSimpleList, selectList } from '@/api/content_center/good_store.js'
import { changeTwoDecimal } from '@/utils/tools'

const data = reactive({
  goodsDialog: false,
  loading: false,
  searchComponents: [
    {
      type: 'input',
      label: '商品名称',
      val: '',
      placeholder: '请输入商品名称',
      filed: 'name'
    },
    {
      type: 'select',
      label: '商品分组',
      val: -1,
      defaultVal: -1,
      placeholder: '请选择商品分组',
      filed: 'groupsId',
      selectDefultName: ['id', 'name'],
      selects: []
    }
  ],
  page: {
    index: 1,
    size: 5,
    total: 0
  },
  searchParams: {},
  tableData: [
    {
      id: 1,
      title: '星麦严选',
      createTime: '2021-12-12 12:12:43'
    }
  ],
  selectedInfo: {}
})

const emits = defineEmits(['choose'])

// 搜索
function searchList(searchData) {
  data.searchParams = searchData
  getList()
}

// 获取商品列表
function getList() {
  data.loading = true
  const params = Object.assign(data.searchParams, {
    pageSize: data.page.size,
    pageNo: data.page.index
  })
  selectList(params)
    .then(res => {
      data.tableData = res.data.records || []
      data.page.total = res.data.total || 0
    })
    .finally(() => {
      data.loading = false
    })
}

// 获取商品分组
function getGroupList() {
  selectSimpleList().then(res => {
    const list = res.data || []
    list.unshift({
      id: null,
      name: '全部'
    })
    data.searchComponents[1].selects = list
  })
}

// 选择页面
function select(row) {
  emits('choose', row)
  console.log('选择商品', row)
  data.selectedInfo = row
  data.goodsDialog = false
}

// 取消选择
function cancelSelect() {
  data.selectedInfo = {}
}

onMounted(() => {
  getList()
  getGroupList()
})
</script>

<style lang="scss" scoped>
:deep .el-dialog__header {
  padding: 0;
  border-bottom: 1px solid #eff1f4;
  .dialog_title {
    display: flex;
    align-items: center;
    height: 60px;
    padding: 0 24px;
    .title {
      font-size: 20px;
      color: #333;
      margin-right: 8px;
    }
  }
}
:deep .el-dialog__footer {
  border-top: 1px solid #eff1f4;
}
:deep .xm_search {
  padding: 0 0 8px 0;
}
.selected {
  display: flex;
  align-items: center;
  justify-content: space-between;
  line-height: 30px;
  padding: 0 12px;
  border-radius: 2px;
  border: 1px solid #dcdfe6;
  > span {
    @include mult_line(1);
  }
}
.page_link_dialog {
  .select_page_type {
    margin-top: 10px;
  }
}
.goods_info {
  display: flex;
  align-items: center;
  .good_img {
    width: 54px;
    height: 54px;
    border-radius: 2px;
    margin-right: 12px;
  }
}
</style>
