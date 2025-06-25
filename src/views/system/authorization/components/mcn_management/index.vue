<template>
  <div>
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      title="机构号管理"
      width="820px"
      custom-class="rule_setting_dialog rule_setting_form_dialog 90 hide_footer_line"
      :before-close="handleClose"
    >
      <div class="dialog_content">
        <div class="search_box">
          <el-button type="primary" :icon="transElIconName('Plus')" @click="showAuthFun">
            新增机构号
          </el-button>
          <div class="built_in_warp">
            星麦云公共机构号
            <el-tooltip placement="bottom" trigger="hover" effect="dark">
              <template #content>
                <div class="explain_warp" style="max-width: 261px">
                  <div class="text">
                    若暂时无法申请自有机构号，可选择启用星麦云公共机构号，以便员工正常进行视频号授权。（申请启用请联系与您对接的客户成功顾问）
                  </div>
                  <img
                    src="https://tagvv-1256030678.file.myqcloud.com/20240226dbrl0.png"
                    alt=""
                    class="exp_img"
                    style="width: 261px; height: 108px; margin-top: 8px"
                  />
                </div>
              </template>
              <img
                src="@/assets/images/operate/tip_line.png"
                style="width: 14px; height: 14px; margin-left: 8px"
              />
            </el-tooltip>
            <el-switch
              style="margin-left: 12px"
              v-model="builtInValue"
              :disabled="true"
            ></el-switch>
          </div>
        </div>
        <xm_table
          :maxTableHeight="450"
          v-loading="data.loading"
          :data="data.listData"
          v-model:page="data.page"
          @getTableData="getList"
        >
          <el-table-column label="机构号名称" prop="wxMcnName" min-width="200">
            <template #default="{ row }">{{ row.wxMcnName || '--' }}</template>
          </el-table-column>
          <el-table-column label="授权状态" prop="authStatus" min-width="200">
            <template #default="{ row }">
              <div class="xm_status_content">
                <div :class="'status_circle ' + statusList.get(row.authStatus || 0).class"></div>
                <div>{{ statusList.get(row.authStatus || 0).label }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="状态更新时间" width="180">
            <template #default="{ row }">
              {{
                row.authStatus == 0 || row.authStatus == 1
                  ? changeTime(row.authTime)
                  : changeTime(row.invalidTime)
              }}
            </template>
          </el-table-column>
          <el-table-column label="操作" prop="name" width="150">
            <template #default="{ row }">
              <el-popconfirm
                v-if="row.authStatus === 0"
                title="是否解除授权?"
                @confirm="removeAuth(row.wxMcnId, 1)"
              >
                <template #reference>
                  <el-link type="danger">解除</el-link>
                </template>
              </el-popconfirm>
              <el-link
                v-if="row.authStatus === 2 || row.authStatus === 3"
                type="primary"
                @click="showAuthFun"
              >
                重新授权
              </el-link>
              <el-popconfirm
                v-if="row.authStatus === 1"
                title="是否确认取消授权?"
                @confirm="removeAuth(row.wxMcnId, 2)"
              >
                <template #reference>
                  <el-link type="primary">取消</el-link>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </xm_table>
      </div>
    </el-dialog>
    <!-- 机构号授权 -->
    <authDOM v-if="authInfo.show" :authDialog="authInfo" @updateList="searchList" />
  </div>
</template>
<script setup>
import authDOM from './auth.vue'
import {
  listWxMcnAuths,
  cancelWxMcnAccountAuth,
  getBrandDefaultMcnConfig
} from '@/api/system_setting/authorization.js'
import { throttle, transElIconName } from '@/utils/tools.js'
const props = defineProps({
  mcnDialog: {
    type: Object,
    default: () => {
      return {
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const show = toRef(props.mcnDialog, 'show')

const builtInValue = ref(false)
function getBrandDefaultMcnConfigFn() {
  getBrandDefaultMcnConfig({}).then(res => {
    if (res.code === 0) {
      builtInValue.value = res?.data || false
    }
  })
}

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
    size: 10,
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
    showDefaultMcn: false
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
  getBrandDefaultMcnConfigFn()
})
function changeTime(e) {
  if (e) {
    return e.replace(/-/gi, '.')
  } else {
    return '--'
  }
}
const authInfo = reactive({
  show: false
})
const message = inject('$message')
// 新增授权
const showAuthFun = throttle(() => {
  authInfo.show = true
}, 500)
// 解除授权
const removeAuth = throttle((id, type) => {
  cancelWxMcnAccountAuth({
    wxMcnId: id
  }).then(res => {
    if (res.code === 0) {
      message.success(`${type === 1 ? '解除' : '取消'}授权成功`)
      searchList()
    }
  })
}, 500)

const emits = defineEmits(['updateInfo'])
// 弹窗关闭时，重新获取机构数量
function handleClose(done) {
  emits('updateInfo')
  done()
}
</script>
<style lang="scss" scoped>
.dialog_content {
  padding: 16px;
}
.search_box {
  margin-bottom: 16px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
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
</style>
