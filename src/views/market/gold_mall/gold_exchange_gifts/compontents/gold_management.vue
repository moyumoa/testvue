<template>
  <div class="gold-management" v-loading="loading">
    <div class="top-banner" v-if="!showInValid">
      <el-button type="primary" @click="onOpen">添加金币类型</el-button>
      <div class="top_right--tips" v-if="showInValidEnter" @click="switchStatus(true)">
        已失效的金币类型
        <el-icon>
          <i-arrow-right-bold />
        </el-icon>
      </div>
    </div>
    <div class="top-banner right-btn" v-else>
      <el-button type="primary" @click="switchStatus(false)">返回金币列表</el-button>
    </div>

    <xm_table class="pic_table" :data="listData" :showPage="false" @getTableData="getList">
      <el-table-column label="金币类型" prop="name"></el-table-column>
      <el-table-column label="金币属性" prop="goldType">
        <template v-slot="{ row }">{{ propertyFilter(row) }}</template>
      </el-table-column>
      <el-table-column label="过期方式" prop="goldType">
        <template v-slot="{ row }">{{ goldFilter(row.goldType) }}</template>
      </el-table-column>
      <el-table-column label="有效期" prop="expiredValue">
        <template v-slot="{ row }">
          {{ expiredValueFilter(row.expiredValue) }}
        </template>
      </el-table-column>
      <el-table-column label="已发放" prop="issued"></el-table-column>
      <el-table-column label="已消耗" prop="consumed">
        <template v-slot="{ row }">{{ absConsumed(row.consumed) }}</template>
      </el-table-column>
      <el-table-column label="余量" prop="balance"></el-table-column>
      <el-table-column label="操作" align="right" min-width="100">
        <template v-slot="{ row }">
          <template v-if="showInValid">-</template>
          <template v-else>
            <el-button
              type="text"
              class="table-btn"
              :disabled="settingDisabled(row)"
              @click="setting(row)"
            >
              设置
            </el-button>
            <el-button
              type="text"
              class="table-btn"
              v-if="row.goldType + '' !== '1'"
              :disabled="deleteDisabled(row)"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </template>
      </el-table-column>
    </xm_table>
    <edit-gold-dialog
      v-if="showDialog"
      v-model="showDialog"
      @confirm="addConfirm"
      @close="onClose"
      :init-value="currentRow"
    ></edit-gold-dialog>
  </div>
</template>

<script setup>
import { addGold, deleteGold, getGoldList } from '@/api/market/gold_exchange_gifts.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import EditGoldDialog from './edit_gold_dialog.vue'
import {isEmpty, isNotEmpty} from '@/utils/tools.js'

const showDialog = ref(false)
const loading = ref(false)
const listData = ref([])
const page = ref({
  index: 0,
  size: 10,
  total: 0
})
// 查询
const getList = isValid => {
  loading.value = true
  getGoldList({
    detail: true,
    isValid: isEmpty(isValid) ? 1 : isValid
  }).then(res => {
    loading.value = false
    if (res?.code === 0 && res?.data) {
      listData.value = res.data || []
    }
  })
}
// 余量取绝对值
const absConsumed = value => {
  const num = Number(value)
  return isNaN(num) ? 0 : Math.abs(num)
}
// getList()
const resetList = () => {
  page.value = {
    index: 0,
    size: 10,
    total: 0
  }
  getList()
}
// 编辑设置
const currentRow = ref(null)
const setting = row => {
  currentRow.value = row
  showDialog.value = true
}

// 打开弹窗
const onOpen = key => {
  if (listData.value.filter(item => item?.isValid === 1)?.length >= 6) {
    ElMessage.warning('最多添加5种金币类型')
    return
  }
  showDialog.value = true
}

// 弹窗关闭
const onClose = () => {
  currentRow.value = null
}

// 新增
const addConfirm = value => {
  addGold(value).then(res => {
    if (res?.code === 0) {
      showDialog.value = false
      ElMessage.success('添加成功')
      resetList()
      currentRow.value = {}
    }
  })
}

// 删除
const handleDelete = row => {
  ElMessageBox.confirm('确定删除？', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(res => {
    deleteGold({ id: row.id }).then(res => {
      if (res?.code === 0) {
        showDialog.value = false
        ElMessage.success('删除成功')
        resetList()
      }
    })
  })
}
// 金币类型过滤
const goldFilter = value => {
  const temp = {
    '-1': '不过期', // 自定义 永久类型
    1: '不过期', // 系统默认 不过期
    2: '绝对时间过期',
    3: '相对时间过期'
  }
  return temp[value + '']
}
// 有效期过滤
const expiredValueFilter = value => {
  if (value === '-1' || isEmpty(value)) return '永久'
  return /^[\d]*$/.test(value) ? value + '天' : value.replace(/-/g, '.')
}
// 金币属性过滤
const propertyFilter = row => {
  const { goldType } = row
  return goldType + '' === '1' ? '系统默认' : `自定义`
}
// 设置按钮禁用
const settingDisabled = row => {
  const { issued, isValid } = row
  //  只要已经发放的金币都不可以修改
  if (issued > 0 || isValid === 0) return true
}
// 删除按钮禁用情况
const deleteDisabled = row => {
  const { issued, isValid } = row
  // 只要已经发放的金币都不可以修改 已经失效的
  if (issued > 0 || isValid === 0) return true
  return false
}

// 显示失效状态入口
const showInValidEnter = ref(false)
// 显示失效状态
const showInValid = ref(false)
const switchStatus = flag => {
  showInValid.value = flag
  getList(flag ? 0 : 1)
}
onBeforeMount(() => {
  loading.value = true
  getGoldList({
    detail: true
  }).then(res => {
    loading.value = false
    if (res?.code === 0 && res?.data) {
      const list = res.data || []
      listData.value = list.filter(item => item.isValid === 1)
      const invalidList = list.find(item => item.isValid === 0)
      showInValidEnter.value = isNotEmpty(invalidList)
      console.log(invalidList,showInValidEnter.value)

    }
  })
})
</script>

<style lang="scss" scoped>
.gold-management {
  background-color: #fff;
  padding: 22px 24px;

  .top-banner {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;

    .top_right--tips {
      cursor: pointer;
      display: flex;
      align-items: center;
      color: $theme_color;
      margin-left: 5px;
    }
  }

  .right-btn {
    flex-direction: row-reverse;
  }

  .table-btn {
    padding: 0;
  }
}
</style>
