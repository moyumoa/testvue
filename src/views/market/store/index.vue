<template>
  <div class="management-store">
    <div class="switch_box">
      <div class="switch_title">POI列表</div>
      <div class="switch_mark">
        为业务主体设置POI位置信息，员工做任务发视频时可直接挂载位置。
        <span class="link-text" @click="toPOIDetail">如何获取POI？</span>
        <br />
        注：组织架构中的部门需标记为业务主体后，才会出现在POI管理中。
        <span class="link-text" @click="toStore">前往标记业务主体</span>
        <br />
      </div>
    </div>
    <xm_search
      useOwnReset
      :searchComponents="data.searchComponents"
      @getData="searchList"
      @reset="resetList"
    ></xm_search>

    <div class="page_main mt_16">
      <div class="page_btns">
        <el-button type="primary" @click="showBatchSettingDialog = true">批量设置POI位置</el-button>
        <exp_button :asyncFunc="exportListFile">导出业务主体列表</exp_button>
      </div>
      <xm_table
        tableType="title"
        v-loading="data.loading"
        :data="data.tableData"
        v-model:page="data.page"
        @getTableData="getList"
      >
        <el-table-column label="部门名称">
          <template #default="{ row }">
            <div class="store_name_wrapper">
              <EntityIcon :type="row.principalType"></EntityIcon>
              <!--              <img-->
              <!--                class="store_icon"-->
              <!--                src="https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/a61d80ebbe014f93ae14995dd2f9abb7_1685516057597.png"-->
              <!--                alt="蓝"-->
              <!--              />-->
              <!--              <img-->
              <!--                class="store_icon"-->
              <!--                src="https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/9123d2891cb3458c9a833b1ac309f51e_1685516099730.png"-->
              <!--                alt="橙"-->
              <!--              />-->
              <!--              <img-->
              <!--                class="store_icon"-->
              <!--                src="https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/52e23574a7f145f48481a19047a69b15_1685516076934.png"-->
              <!--                alt="绿"-->
              <!--              />-->
              <span style="margin-left: 4px">{{ row.storeName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="所属部门">
          <template #default="{ row }">
            {{ row.shortParentDeptName }}
          </template>
        </el-table-column>
        <el-table-column width="150" label="员工数量">
          <template #default="{ row }">
            <div>{{ row.staffCnt === null ? '--' : wanSliceFormat(row.staffCnt) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="已设置POI位置" prop="poiCnt"></el-table-column>
        <el-table-column width="150" label="操作" align="right">
          <template #default="scope">
            <el-link
              type="primary"
              style="margin-left: 12px"
              @click="openSettingsDialog(scope.row)"
            >
              管理POI位置
            </el-link>
          </template>
        </el-table-column>
      </xm_table>
    </div>
    <!--  批量设置POI位置弹窗  -->
    <el-dialog
      ref="dialog"
      v-model="showBatchSettingDialog"
      title="批量设置POI位置"
      width="560px"
      :before-close="uploadDialogClose"
      custom-class="hide_footer_line"
    >
      <div class="batch-set-container">
        <div class="step-text">1.请严格按照导入模板的格式准备数据</div>
        <el-button type="primary" class="step-btn" @click="downLoadTemplate">
          下载导入模板
        </el-button>
        <div class="step-text">2.上传POI数据文件</div>
        <el-upload
          ref="uploadRef"
          v-model:file-list="fileList"
          class="upload-demo"
          accept=".xlsx,.xls"
          :limit="1"
          :auto-upload="false"
          :on-success="onUploadSuccess"
          :action="uploadPOIUrl"
        >
          <el-button type="primary">选择文件</el-button>
        </el-upload>
        <div class="tips">
          注：当出现店铺编号不存在或POI格式不正确，则整批POI导入失败，请核对数据后重新导入。
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showBatchSettingDialog = false">取消</el-button>
          <el-button type="primary" @click="uploadSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <!--    设置门店POI位置-->
    <PoiDialog v-model="showPOIDialog" :store-info="storeInfo" @confirm="onConfirm" />
  </div>
</template>

<script setup>
import EntityIcon from '@/views/system/business_entity/components/entity_icon.vue'
import { isNotEmpty, throttle, wanSliceFormat } from '@/utils/tools.js'
import {
  batchExportPOI,
  exportPoITemplate,
  getStoreList,
  setStorePOI,
  uploadPOIUrl
} from '@/api/market/store'
import { useRouter } from 'vue-router'
import { exportFile, exportFileV2 } from '@/utils/exportFile'
import { ElMessage } from 'element-plus'
import PoiDialog from '@/views/market/store/components/poi_dialog.vue'
import { getQuery } from '@/utils/get_query.js'

const router = useRouter()
const toStore = () => {
  // 跳转门店 system_manage/organnization_framework
  router.push('/system_manage/organnization_framework')
}

const toPOIDetail = () => {
  window.open('https://sumwhy0902.feishu.cn/docx/doxcnNkQ5jqV7ClFVHPWcw3Jbxf')
}

const data = reactive({
  showDialog: false,
  updateGoldInfo: {},
  searchComponents: [
    {
      type: 'input',
      label: '部门名称',
      val: '',
      filed: 'storeName'
    },
    {
      type: 'input',
      label: 'POI名称',
      val: '',
      filed: 'poiName'
    },
    {
      type: 'chooseDept',
      label: '组织结构',
      val: '',
      filed: 'deptIds',
      multiple: false,
      isUsePermission: true
    },
    {
      type: 'select',
      label: '已设置POI位置',
      val: -1,
      defaultVal: -1,
      placeholder: '请选择POI位置',
      filed: 'isSetPoi',
      selects: [
        {
          label: '全部',
          value: -1
        },
        {
          label: '是',
          value: 1
        },
        {
          label: '否',
          value: 0
        }
      ]
    }
  ],
  tableData: [],
  loading: false,
  page: {
    index: 1,
    size: 10,
    total: 0
  },
  searchParams: {}
})

// 搜索
function searchList(searchData) {
  data.page.index = 1
  getList()
}

function resetList() {
  data.page.index = 1
  data.searchParams = {}
  getList()
}

function getList() {
  data.loading = true
  data.searchParams = getQuery(data.searchComponents)
  const params = Object.assign(data.searchParams, {
    pageSize: data.page.size,
    pageNo: data.page.index
  })
  params.deptIds = isNotEmpty(params.deptIds) ? [params.deptIds] : []
  getStoreList(params)
    .then(res => {
      data.tableData = res?.data?.records || []
      data.page.total = res.data.total || 0
    })
    .finally(() => {
      data.loading = false
    })
}

function downLoadTemplate() {
  exportFile(exportPoITemplate, data.searchParams, '批量设置POI模板', 'xlsx')
}

// 导出模板
function exportListFile() {
  const params = Object.assign({ staffType: 1 }, data.searchParams)
  return exportFileV2(batchExportPOI, params, 'POI数据', 'xlsx')
}

onMounted(() => {
  getList()
})

// 设置门店POI位置
const showPOIDialog = ref(false)
const storeInfo = ref({
  storeName: '',
  storeId: 0
})
const openSettingsDialog = throttle(info => {
  showPOIDialog.value = true
  storeInfo.value = info
}, 300)

const onConfirm = throttle(value => {
  setStorePOI(value).then(res => {
    resetList()
    ElMessage({
      type: 'success',
      message: '设置成功'
    })
  })
})
const showBatchSettingDialog = ref(false)

// 批量导入模板
const uploadRef = ref(null)
const fileList = ref([])
const uploadSubmit = () => {
  uploadRef.value.submit()
}
const onUploadSuccess = response => {
  if (response?.code === 1) {
    ElMessage({
      type: 'warning',
      message: response.msg ? response.msg : '导入失败'
    })
  } else {
    showBatchSettingDialog.value = false
    ElMessage({
      type: 'success',
      message: '导入成功'
    })
    resetList()
  }
  fileList.value = []
}
const uploadDialogClose = done => {
  fileList.value = []
  done()
}
</script>

<style lang="scss" scoped>
.management-store {
  .switch_box {
    width: 100%;
    height: 80px;
    background: #ffffff;
    border-radius: 4px;
    padding: 16px 24px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: 16px;
    box-sizing: border-box;

    .switch_title {
      font-size: 16px;
      font-weight: 400;
      color: #323233;
      line-height: 20px;
      margin-right: 24px;
    }

    .switch_mark {
      margin-left: 11px;
      font-size: 12px;
      font-weight: 400;
      color: #909399;
      line-height: 20px;

      .link-text {
        color: $theme_color;
        cursor: pointer;
      }
    }
  }

  .page_btns {
    display: flex;
  }

  .batch-set-container {
    font-size: 14px;
    color: #333333;
    //margin-left: -8px;
    //margin-top: -20px;
    .step-text {
      //line-height: 36px;
      margin-bottom: 12px;
    }

    .step-btn {
      margin-bottom: 16px;
    }

    .tips {
      color: #909399;
      line-height: 20px;
      margin-top: 20px;
    }
  }
}

.store_name_wrapper {
  display: flex;
  align-items: center;
  .store_icon {
    width: 16px;
    height: 16px;
    margin-right: 4px;
  }
}

.part_name {
  @include mult_line(1);
}

.account_info {
  display: flex;
  align-items: center;

  .account_info_name {
    > span,
    > i {
      vertical-align: middle;
      margin-right: 4px;
    }
  }

  img {
    margin-left: 8px;
    width: 16px;
    height: 16px;
  }
}

:deep .el-tooltip__trigger {
  display: inline-block !important;
}
:deep(.input_box) {
  display: flex !important;
}
</style>
