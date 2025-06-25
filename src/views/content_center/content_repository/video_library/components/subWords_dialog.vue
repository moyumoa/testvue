<template>
  <div>
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      title="订阅词管理"
      width="960px"
      custom-class="rule_setting_dialog show_header_line hide_footer_line"
    >
      <div class="dialog_container">
        <!-- 订阅词添加+总数 -->
        <div class="container_top">
          <div class="top_left">
            共订阅
            <span>{{ page.total || 0 }}</span>
            个词
          </div>
          <div class="top_right">
            <el-input
              class="right_input"
              v-model.trim="addText"
              maxlength="20"
              @blur="retEmitEmj($event)"
              placeholder="请输入订阅词"
            ></el-input>
            <el-button class="right_btn" :loading="addLoading" type="primary" @click="addFun">
              添加
            </el-button>
          </div>
        </div>
        <!-- 表格 -->
        <xm_table
          class="pic_table"
          v-loading="listLoading"
          :data="list"
          v-model:page="page"
          @getTableData="getList"
          @sort-change="sortChange"
          :pageSizes="[5, 10, 20, 50]"
          :default-sort="{
            prop: 'gmtCreate',
            order: 'descending'
          }"
        >
          <el-table-column label="订阅词">
            <template #default="scope">
              {{ scope.row.word || '--' }}
            </template>
          </el-table-column>
          <el-table-column prop="gmtCreate" sortable="custom" label="创建时间">
            <template #default="scope">
              {{ scope.row.gmtCreate || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="创建人">
            <template #default="scope">
              {{
                scope.row.brandName || scope.row.userName
                  ? `${scope.row.brandName || ''}${scope.row.brandName ? ' - ' : ''}${
                      scope.row.userName || ''
                    }`
                  : '--'
              }}
            </template>
          </el-table-column>
          <el-table-column prop="relateVideoCount" sortable="custom" label="关联灵感">
            <template #default="scope">
              <div
                @click.stop="showAssociationFun(scope.row)"
                style="color: #364fcd; cursor: pointer"
              >
                共{{ wanSliceFormat(scope.row.relateVideoCount || 0) }}个
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-link type="primary" @click.stop="delFun(scope.row)">删除</el-link>
            </template>
          </el-table-column>
        </xm_table>
      </div>
    </el-dialog>
    <!-- 关联灵感 -->
    <associationDOM
      v-if="associationDialog.show"
      :associationDialog="associationDialog"
      @updateFun="updateFun"
    />
  </div>
</template>
<script setup>
import { listSubscribeWord, saveWord, deleteWord } from '@/api/content_center/video_library.js'
import { throttle, isNotEmpty, wanSliceFormat } from '@/utils/tools'
import associationDOM from './association_dialog.vue'
import { ElMessageBox } from 'element-plus'
const props = defineProps({
  subWordsDialog: {
    type: Object,
    default: () => {
      return {
        show: true // 是否显示弹窗
      }
    }
  }
})
const show = toRef(props.subWordsDialog, 'show')
// 表格查询 begin--
const page = reactive({
  index: 1,
  size: 5,
  total: 0
})
const orderSetting = ref('DESC:gmt_create')
const list = ref([])
const listLoading = ref(false)
function resetList() {
  page.index = 1
  listLoading.value = true
  getList()
}
function sortChange(column, prop, order) {
  if (column.prop === 'gmtCreate') {
    if (column.order === 'ascending') {
      orderSetting.value = 'ASC:cisw.gmt_create'
    } else if (column.order === 'descending') {
      orderSetting.value = 'DESC:cisw.gmt_create'
    } else {
      orderSetting.value = ''
    }
  } else if (column.prop === 'relateVideoCount') {
    if (column.order === 'ascending') {
      orderSetting.value = 'ASC:relate_video_count'
    } else if (column.order === 'descending') {
      orderSetting.value = 'DESC:relate_video_count'
    } else {
      orderSetting.value = ''
    }
  } else {
    orderSetting.value = ''
  }
  resetList()
}
function getList() {
  listLoading.value = true
  listSubscribeWord({
    orderSetting: orderSetting.value,
    type: 1,
    pageNo: page.index,
    pageSize: page.size
  })
    .then(res => {
      if (res.code === 0) {
        list.value = res.data.records
        page.total = res.data.total
      }
    })
    .finally(() => {
      listLoading.value = false
    })
}

// 表格查询 end--

const message = inject('$message')

// 添加订阅词 begin--
const addText = ref('')
const addLoading = ref(false)
// 检查是否有表情包
function retEmitEmj(e) {
  const reg =
    // eslint-disable-next-line no-misleading-character-class
    /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi

  addText.value = e.target.value.replace(reg, '')
}
// 检查订阅词是否存在
function checkKeyword() {
  return new Promise((resolve, reject) => {
    resolve()
    // checkName({
    //   brandId: '0',
    //   //  localStorage.getItem('brandInfo')
    //   //   ? JSON.parse(localStorage.getItem('brandInfo')).brandId
    //   //   : 0,
    //   name: addText.value,
    //   childKeyPrefix: 't_c_s_keyword_'
    // })
    //   .then(res => {
    //     if (res.code === 0) {
    //       if (res.data) {
    //         message.warning('该订阅词已存在')
    //         reject(res)
    //       } else {
    //         resolve()
    //       }
    //     } else {
    //       reject(res)
    //     }
    //   })
    //   .catch(err => {
    //     reject(err)
    //   })
  })
}

const addFun = throttle(() => {
  if (isNotEmpty(addText.value)) {
    addLoading.value = true
    checkKeyword()
      .then(() => {
        saveWord({
          type: 1,
          word: addText.value
        })
          .then(res => {
            if (res.code === 0) {
              message.success('添加成功')
              resetList()
              addText.value = ''
            }
            addLoading.value = false
          })
          .catch(() => {
            addLoading.value = false
          })
      })
      .catch(() => {
        addLoading.value = false
      })
  } else {
    message.warning('请先输入订阅词')
  }
})
// 添加订阅词 end--

// 删除订阅词 begin--
function delFun(item) {
  ElMessageBox.confirm('删除后不可恢复，是否确认?', '系统提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: '',
    customClass: 'drawer_systemBox'
  })
    .then(() => {
      //  调接口删除
      deleteWord(item.id).then(res => {
        if (res.code === 0) {
          message.success('删除成功')
          resetList()
        }
      })
    })
    .catch(() => {})
}
// 删除订阅词 end--

// 关联灵感 begin--
const associationDialog = ref({
  show: false, // 是否显示弹窗
  ids: [] // 要显示关联灵感的订阅词ID
})
const showAssociationFun = throttle(item => {
  associationDialog.value = {
    show: true,
    ids: [item.id] // 要显示关联灵感的订阅词ID
  }
}, 500)
const emits = defineEmits('updateFun')
// 删除灵感，除了更新订阅词列表，还要更新外层的灵感列表
function updateFun() {
  getList()
  emits('updateFun')
}
// 关联灵感 end--
onMounted(() => {
  resetList()
})
</script>
<style lang="scss" scoped>
.dialog_container {
  padding: 16px;
  width: 100%;
  .container_top {
    margin-bottom: 16px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    .top_left {
      display: flex;
      font-weight: 400;
      font-size: 14px;
      color: #909399;
      line-height: 20px;
      span {
        margin: 0 2px;
        font-weight: 600;
        color: #364fcd;
      }
    }
    .top_right {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;
      .right_input {
        width: 220px;
        margin-right: 12px;
      }
      .right_btn {
        width: 74px;
      }
    }
  }
}
:deep(.el-table__body-wrapper) {
  max-height: 428px;
  overflow-y: auto;
}
:deep(.xm_table_page) {
  padding-bottom: 20px;
}
</style>
