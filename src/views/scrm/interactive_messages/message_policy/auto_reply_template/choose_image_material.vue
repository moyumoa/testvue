<template>
  <el-dialog v-model="show" :width="560" @close="close">
    <template #title>
      <div class="dialog_title">图片素材</div>
    </template>
    <div class="dialog_content">
      <div class="action_btns">
        <form-upload
          styleType="btn"
          uploadType="image"
          @success="onUploadSuccess"
          :maxSize="5000"
        ></form-upload>
        <div class="tip">不超过5M，长宽不超过1500，格式bmp/gif/png/jpeg/jpg</div>
      </div>
      <xm_table
        v-model:page="page"
        v-loading="listLoading"
        :data="list"
        @getTableData="getTableList"
        pageLayout="total, prev, pager, next , jumper"
      >
        <el-table-column label="素材">
          <template #default="{ row }">
            <el-image
              style="width: 40px; height: 40px"
              :src="row.mediaUrl1"
              preview-teleported
              fit="cover"
              :preview-src-list="[row.mediaUrl1]"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120px">
          <template #default="{ row }">
            <!-- <el-link type="primary" @click="previewImage(row)" style="margin-right: 12px">
              查看
            </el-link> -->
            <el-link type="primary" @click="delImage(row)">删除</el-link>
          </template>
        </el-table-column>
        <el-table-column label="选择" align="right" width="80px">
          <template #default="{ row }">
            <div class="action">
              <div class="check_btn" @click="onCheck(row)">
                <el-icon v-if="row.checked">
                  <i-circle-check-filled :size="16" color="#364FCD" />
                </el-icon>
                <div class="no_check" v-else></div>
              </div>
            </div>
          </template>
        </el-table-column>
      </xm_table>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="confirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import tableList from '@/utils/com_composition/table_list'
import { ElMessage, ElMessageBox } from 'element-plus'
import formUpload from '@/views/market/study/course_management/components/form_upload.vue'
import { getMediaList, uploadMedia, deleteMedia } from '@/api/scrm/policy'
import { useStore } from 'vuex'

const store = useStore()
const props = defineProps({
  show: Boolean,
  checkedRow: Object
})
const { show } = toRefs(props)
const emits = defineEmits(['update:show', 'confirm'])
const $data = reactive({
  currentRow: null
})

function getList(page) {
  return getMediaList({
    pageNo: page.index,
    pageSize: page.size,
    openId: store.state.chat.policyOpenId
  }).then(res => {
    const _list = res.data.records
    _list.forEach(item => {
      if ($data.currentRow && item.id === $data.currentRow.id) {
        item.checked = true
      }
    })
    page.total = res.data.total
    return _list
  })
}
const { page, list, getTableList, listLoading } = tableList(getList)
page.size = 5

function onUploadSuccess(response) {
  console.log('response', response)
  uploadMedia({
    openId: store.state.chat.policyOpenId,
    mediaUrl: response.data
  }).then(res => {
    ElMessage.success('上传成功')
    getTableList()
  })
}

// function previewImage(row) {}

function delImage(row) {
  ElMessageBox.confirm(`确认删除素材`, '系统提醒', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteMedia({
      mediaId: row.mediaId,
      openId: store.state.chat.policyOpenId
    }).then(res => {
      ElMessage.success('删除成功')
      getTableList()
    })
  })
}

function onCheck(item) {
  if (item.checked) {
    item.checked = false
    $data.currentRow = null
    return
  }
  item.checked = !item.checked
  $data.currentRow = item
  list.value.forEach(e => {
    if (e.id !== item.id) {
      e.checked = false
    }
  })
}

function close() {
  emits('update:show', false)
}
function confirm() {
  if (!$data.currentRow) {
    ElMessage.warning('请先选择图片素材')
    return
  }
  close()
  emits('confirm', $data.currentRow)
}

watch(
  () => props.checkedRow,
  val => {
    $data.currentRow = JSON.parse(JSON.stringify(val))
  }
)

onMounted(() => {
  getTableList()
})
</script>

<style lang="scss" scoped>
.selected {
  display: flex;
  align-items: center;
}
.action {
  display: flex;
  justify-content: flex-end;
  font-size: 18px;
  .check_btn {
    cursor: pointer;
    display: inline-block;
    padding: 5px;
  }
  .no_check {
    width: 16px;
    height: 16px;
    margin-right: 1px;
    border-radius: 8px;
    border: 1px solid #dcdee0;
  }
}
.action_btns {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  .tip {
    margin-left: 12px;
    color: #909399;
  }
}
</style>
