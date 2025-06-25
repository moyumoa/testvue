<template>
  <div class="mcn_page">
    <div class="search_box">
      <div class="built_in_warp">
        星麦云公共抖音机构号
        <el-tooltip placement="bottom" trigger="hover" effect="dark">
          <template #content>
            <div class="explain_warp" style="max-width: 261px">
              <div class="text">
                若暂时无法申请自有机构号，可选择启用星麦云公共机构号，以便员工正常进行抖音授权。
                <br />
                （申请启用请联系与您对接的客户成功顾问）
              </div>
              <img
                src="https://tagvv-1256030678.file.myqcloud.com/202504141rjlh.jpg"
                alt=""
                class="exp_img"
                style="width: 261px; margin-top: 8px"
              />
            </div>
          </template>
          <img
            src="@/assets/images/operate/tip_line.png"
            style="width: 14px; height: 14px; margin-left: 8px"
          />
        </el-tooltip>
        <el-switch style="margin-left: 12px" disabled v-model="switchValue"></el-switch>
      </div>
    </div>
    <xm_table
      :maxTableHeight="450"
      v-loading="data.loading"
      :data="data.listData"
      v-model:page="data.page"
      @getTableData="getList"
      :pageSizes="[5, 10, 20, 50]"
    >
      <el-table-column label="抖音机构号名称" prop="wxMcnName">
        <template #default="{ row }">
          {{ row.wxMcnName || '--' }}
          <span class="public_mark" v-if="row.brandId == 0">公共</span>
        </template>
      </el-table-column>
      <el-table-column label="授权状态" prop="authStatus">
        <template #default="{ row }">
          <div class="xm_status_content">
            <div :class="'status_circle ' + statusList.get(row.authStatus || 0).class"></div>
            <div>{{ statusList.get(row.authStatus || 0).label }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="状态更新时间">
        <template #default="{ row }">
          {{
            row.authStatus == 0 || row.authStatus == 1
              ? changeTime(row.authTime)
              : changeTime(row.invalidTime)
          }}
        </template>
      </el-table-column>
      <el-table-column label="操作" prop="name">
        <template #default="{ row }">
          <!-- 星麦云公共机构号不支持解除 其余授权有效的时候显示 -->
          <!-- <el-popconfirm
            v-if="row.authStatus === 0 && row.brandId != 0"
            title="是否解除授权?"
            @confirm="removeAuth(row.wxMcnId, 1)"
          >
            <template #reference> -->
          <el-link
            v-if="row.authStatus === 0 && row.brandId != 0"
            type="danger"
            style="margin-right: 16px"
            @click="removeAuth(row.wxMcnId, 1)"
          >
            解除
          </el-link>
          <!-- </template>
          </el-popconfirm> -->

          <el-link type="primary" :disabled="row.authStatus !== 0" @click="showPreviewFileFun(row)">
            预览合约文件
          </el-link>
        </template>
      </el-table-column>
    </xm_table>

    <!-- 预览文件弹窗 -->
    <previewFileDOM v-if="previewFileDialog.show" :previewFileDialog="previewFileDialog" />
  </div>
</template>
<script setup>
import previewFileDOM from '@/views/system/enterprise_intelligent_agent/components/preview_file_dialog.vue'

import { ElMessageBox } from 'element-plus'
import { listWxMcnAuths, cancelMcnAccountAuth } from '@/api/system_setting/authorization.js'
import { throttle } from '@/utils/tools.js'

const props = defineProps({
  switchValue: Boolean
})
const { switchValue } = toRefs(props)

const statusList = reactive(
  new Map([
    [0, { label: '授权有效', class: 'green_circle' }],
    [2, { label: '授权失效', class: 'red_circle' }],
    [1, { label: '待星麦云确认', class: 'orange_circle' }],
    [3, { label: '授权失败', class: 'red_circle' }]
  ])
)

const data = reactive({
  loading: false,
  page: {
    index: 1,
    size: 5,
    total: 0
  },
  listData: []
})

function searchList() {
  data.page.index = 1
  getList()
} // 搜索
function getList() {
  data.loading = true
  const searchForm = {
    authStatus: null,
    pageNo: data.page.index,
    pageSize: data.page.size,
    platform: 1,
    showDefaultMcn: true
  }
  listWxMcnAuths(searchForm)
    .then(res => {
      if (res.code === 0) {
        const arr = res.data.records || []
        data.listData = arr
        data.page.total = res.data.total
      } else {
        data.listData = []
        data.page.total = 0
      }
      data.loading = false
    })
    .catch(() => {
      data.listData = []
      data.page.total = 0
      data.loading = false
    })
}
onMounted(() => {
  searchList()
})
function changeTime(e) {
  if (e) {
    return e
  } else {
    return '--'
  }
}

const message = inject('$message')

// 解除授权
const removeAuth = throttle((id, type) => {
  ElMessageBox.confirm('确认是否解除授权?', '系统提醒', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    cancelMcnAccountAuth({
      mcnId: id
    }).then(res => {
      if (res.code === 0) {
        message.success(`解除授权成功`)
        searchList()
      }
    })
  })
}, 500)

// 显示预览文件的弹窗
const previewFileDialog = ref({
  show: false
})
const showPreviewFileFun = throttle(item => {
  // item.contractTemplateFile =
  //   'https://tagvvcloud-material-center-dev.oss-cn-shenzhen.aliyuncs.com/dymcn/20250418/pw009.pdf'
  if (!item.contractTemplateFile) {
    return message.warning('暂无文件')
  }
  const suffix = item.contractTemplateFile.split('.').at(-1).toLowerCase()
  const fileType = {
    doc: 'doc',
    docx: 'doc',
    md: 'md',
    pdf: 'pdf',
    csv: 'csv',
    xls: 'xls',
    xlsx: 'xls',
    txt: 'txt'
  }

  previewFileDialog.value = {
    show: true,
    name: item.fileName || '合约文件',
    url: item.contractTemplateFile,
    fileType: fileType[suffix]
  }
}, 700)
</script>
<style lang="scss" scoped>
.mcn_page {
  margin-top: 16px;
  padding: 16px;
  width: 100%;
  padding: 20px 24px;
  background: #ffffff;
  border-radius: 4px;
}
.search_box {
  margin-bottom: 16px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  .built_in_warp {
    display: flex;
    align-items: center;
    .explain_warp {
      .text {
        font-family: PingFangSC, PingFang SC;
        font-weight: 400;
        font-size: 12px;
        color: #ffffff;
        line-height: 18px;
        text-align: left;
      }
    }
  }
}
:deep(.el-pagination) {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: wrap;
}
.el-link.el-link--primary.is-disabled {
  color: #c0c4cc;
}
</style>
