<template>
  <div class="">
    <el-dialog
      :model-value="props.showExport"
      destroy-on-close
      @close="closeDia"
      append-to-body
      width="62%"
      custom-class="export_center"
    >
      <template #title>
        <div class="my-header">
          <div class="header_left">
            <img class="img_download" src="@/assets/images/down_center.png" alt="" />
            <span class="download_txt">下载中心</span>
          </div>
        </div>
      </template>
      <div class="export_body" style="overflow: hidden">
        <!-- 筛选条件 -->
        <xm_search
          :searchComponents="searchComponents"
          @getData="querySearch"
          @reset="resetSearch"
        ></xm_search>
        <!-- 表格 -->
        <xm_table
          ref="table"
          class="pic_table"
          v-loading="tableForm.loading"
          :data="tableForm.listData"
          v-model:page="tableForm.page"
          @getTableData="getList"
          :pageSizes="[5, 10, 20, 50]"
        >
          <el-table-column label="文件名称" prop="fileName" min-width="150">
            <template #default="scope">
              <div>{{ scope.row.fileName || '--' }}</div>
            </template>
          </el-table-column>
          <!-- <el-table-column label="备注信息" prop="remark" width="180">
            <template v-slot="{ row }">
              <div v-for="item in row.remark" :key="item">{{ item || '--' }}</div>
            </template>
          </el-table-column> -->
          <el-table-column label="操作时间" prop="exportTime" min-width="110">
            <template #default="scope">
              <div>{{ scope.row.exportTime || '--' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="导出进度" prop="status" min-width="120">
            <template #default="scope">
              <!-- 未开始 -->
              <div v-if="scope.row.status == 1">
                <el-progress :stroke-width="4" :percentage="0" />
              </div>
              <!-- 进行中 -->
              <div v-if="scope.row.status == 2">
                <!-- 进行中--未开始--进度条 =》0% -->
                <template v-if="scope.row.subStatus == 0">
                  <el-progress :stroke-width="4" :percentage="33" :indeterminate="true" />
                </template>
                <!-- 进行中--数据汇报完毕--进度条 =》0%-33% -->
                <template v-if="scope.row.subStatus == 1">
                  <el-progress :stroke-width="4" :percentage="33" :indeterminate="true" />
                </template>
                <!-- 进行中--临时文件生成完毕--进度条 =》33%-66%-->
                <template v-if="scope.row.subStatus == 2">
                  <el-progress :stroke-width="4" :percentage="66" :indeterminate="true" />
                </template>
                <!-- 进行中--oss上传完毕--进度条 =》66%-99% -->
                <template v-if="scope.row.subStatus == 3">
                  <el-progress :stroke-width="4" :percentage="99" :indeterminate="true" />
                </template>
              </div>
              <!-- 已完成 -->
              <div v-if="scope.row.status == 3">
                <el-progress :stroke-width="4" :percentage="100" />
              </div>
              <!-- 已取消 -->
              <div v-if="scope.row.status == 4">
                <el-progress :stroke-width="4" :percentage="0" />
              </div>
              <!-- 导出失败 -->
              <div v-if="scope.row.status == 5">
                <el-progress :stroke-width="4" :percentage="0" />
              </div>
              <!-- 已过期 -->
              <div v-if="scope.row.status == 6">
                <el-progress :stroke-width="4" :percentage="100" />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="状态" prop="status" min-width="80">
            <template #default="scope">
              <div class="status_content" v-if="scope.row.status == 1">
                <div class="status_circle"></div>
                <div>未开始</div>
              </div>
              <div class="status_content" v-if="scope.row.status == 2">
                <div class="status_circle blue_circle"></div>
                <div>进行中</div>
              </div>
              <div class="status_content" v-if="scope.row.status == 3">
                <div class="status_circle green_circle"></div>
                <div>已完成</div>
              </div>
              <div class="status_content" v-if="scope.row.status == 4">
                <div class="status_circle"></div>
                <div>已取消</div>
              </div>
              <div class="status_content" v-if="scope.row.status == 5">
                <div class="status_circle"></div>
                <div>导出失败</div>
              </div>
              <div class="status_content" v-if="scope.row.status == 6">
                <div class="status_circle red_circle"></div>
                <div>已过期</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="80" align="center" header-align="center">
            <!-- <template #default="scope"> -->
            <template #header>
              <div class="column_header">
                <span>操作</span>
                <el-tooltip
                  popper-class="tooltip-class"
                  placement="top"
                  :style="{ 'margin-left': '4px' }"
                >
                  <template #content>
                    <p>注：15天内导出的文件支持重复下载，过期文件请重新导出</p>
                  </template>
                  <img
                    src="@/assets/images/operate/tip_line.png"
                    style="width: 13px; height: 13px; margin-left: 8px; margin-top: 3px"
                  />
                </el-tooltip>
              </div>
            </template>
            <template #default="scope">
              <!-- <el-link type="primary" @click="showDetail(scope.row)">下载</el-link> -->
              <el-link
                v-if="scope.row.status == 1 || scope.row.status == 2"
                type="primary"
                @click="cancel(scope.row)"
              >
                取消任务
              </el-link>
              <el-link
                v-else-if="scope.row.status == 3"
                type="primary"
                @click="download(scope.row)"
              >
                下载
              </el-link>
              <el-link v-else>{{ '--' }}</el-link>
            </template>
          </el-table-column>
        </xm_table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { listDownloadTask, updateDownloadTask } from '@/api/main/export_center'
import { getQuery } from '@/utils/get_query'
import { isEmpty, dateFormat } from '@/utils/tools'

// 父组件传递过来的值
const props = defineProps({
  showExport: {
    type: Boolean,
    default: false
  }
})
// 子传父
const emits = defineEmits(['closeDia', 'status'])
const flag = ref(false)
// 筛选条件
const searchComponents = ref([
  {
    type: 'input',
    label: '文件名称',
    val: '',
    placeholder: '请输入文件名称',
    filed: 'fileName'
  },
  {
    type: 'dateRange',
    label: '操作时间', // label展示
    val: '', // 响应式绑定
    disabledDate(time) {
      return time.getTime() > Date.now()
    }, // 禁用日期
    isDisEdit: true, // 是否禁用文本框输入
    placeholder: ['开始时间', '结束时间'],
    filed: 'dateRange' // 查询字段名
  }
])
// 表格的查询条件
const tableForm = reactive({
  loading: false,
  listData: [],
  page: {
    index: 1,
    size: 5,
    total: 0
  }
})
const timer = ref(null)
const pulling = ref(true)
// 关闭弹窗，需要触发父组件关闭
function closeDia(val) {
  emits('closeDia', false)
}
// 如果status==2时，将状态传递给父组件，父组件的按钮状态变成动效
function changeStatus() {
  flag.value = typeof tableForm.listData.find(item => item.status === 2) !== 'undefined'
  if (flag.value) {
    emits('status', flag.value)
  } else {
    clearInterval(timer.value)
    emits('status', flag.value)
  }
}
// 获取表格中的信息
async function getList() {
  const data = getQuery(searchComponents.value, ['startTime', 'endTime'])
  tableForm.loading = true
  const params = {
    pageNo: tableForm.page.index,
    pageSize: tableForm.page.size,
    fileName: data.fileName,
    startTime: data.startTime,
    endTime: data.endTime
  }
  if (isAdmin.value) {
    params.onlyShowSelfData = data.onlyShowSelfData
  }
  const res = await listDownloadTask(params)
  if (res.code === 0) {
    appenRemark(res.data.records)
    tableForm.listData = res.data.records
    tableForm.page.total = res.data.total
    changeStatus()
    // 判断是否需要打开轮询
    pulling.value =
      typeof tableForm.listData.find(item => item.status === 2 || item.status === 1) !== 'undefined'
    if (pulling.value) {
      timer.value = setTimeout(() => {
        getList()
      }, 4000)
    }
  } else {
    tableForm.listData = []
    tableForm.page.total = 0
  }
  tableForm.loading = false
}
// 监听showExport的值，当它为true时，开启轮询
watch(
  () => props.showExport,
  (newVal, oldVal) => {
    getIsAdmin().then(() => {
      if (newVal) {
        getList()
      } else {
        tableForm.page.index = 1
        tableForm.page.size = 5
        searchComponents.value = [
          {
            type: 'input',
            label: '文件名称',
            val: '',
            placeholder: '请输入文件名称',
            filed: 'fileName'
          },
          {
            type: 'dateRange',
            label: '操作时间', // label展示
            val: '', // 响应式绑定
            disabledDate(time) {
              return time.getTime() > Date.now()
            }, // 禁用日期
            isDisEdit: true, // 是否禁用文本框输入
            placeholder: ['开始时间', '结束时间'],
            filed: 'dateRange' // 查询字段名
          }
        ]
        getList()
        clearInterval(timer.value)
      }
    })
  }
)

// 取消下载
function cancel(row) {
  tableForm.listData.forEach(item => {
    if (item.status === 1 || item.status === 2) {
      updateDownloadTask({
        taskId: row.id,
        status: 4
      })
        .then(() => {
          item.status = 4
        })
        .catch(err => {
          console.log(err)
        })
    }
  })
}

const judgeOEA = inject('$judgeOEA')
// 点击下载后，下载到本地
function download(row) {
  window.open(row.fileUrl, '_blank', judgeOEA() ? 'download' : '')
}
// 重置
function resetSearch() {
  tableForm.loading = true
  tableForm.page.index = 1
  tableForm.page.size = 10
  getList()
}
// 查询
function querySearch() {
  tableForm.loading = true
  tableForm.page.index = 1
  getList()
}
function desc(labelObj, exportJson) {
  const list = []
  isEmpty()
  for (const key in labelObj) {
    let result = exportJson[key]
    // 对日期进行判断
    if (labelObj[key].type === 'date') {
      dateFormat(new Date())
    }
    // 对线索来源进行判断
    if (labelObj[key].type === 'select') {
      // 根据key读取值
      // 读取option对象
      result = labelObj[key].option[exportJson[key]]
    }
    // 对日期
    // value 判空
    // value label的判断
    list.push(`${labelObj[key].label}:${result}`)
  }
  return list
}
function appenRemark(list) {
  for (const data in list) {
    // ------------------------以下是内容数据中台 start--------------------------
    // 线索数据
    if (list[data].exporterType === 'CluesExporter') {
      const clueLable = {
        addr: {
          label: '线索地址'
        },
        nikename: {
          label: '关联矩阵号'
        },
        startTime: {
          label: '开始时间',
          type: 'date'
        },
        endTime: {
          label: '结束时间',
          type: 'date'
        },
        tell: {
          label: '线索手机'
        },
        sourceType: {
          label: '来源类型',
          type: 'select',
          option: {
            0: '全部',
            1: '视频',
            2: '直播'
          }
        },
        soruceCarrierType: {
          label: '线索来源',
          type: 'select',
          option: {
            0: '全部',
            1: '经营工具',
            2: '小程序'
          }
        }
      }
      const res = JSON.parse(list[data].exportJson)
      list[data].remark = desc(clueLable, res)
    }
    // 视频数据
    if (list[data].exporterType === 'VideoListExporter') {
      const videoLable = {
        title: {
          label: '视频名称'
        },
        nikename: {
          label: '矩阵号昵称'
        },
        platform: {
          label: '所属平台',
          type: 'select',
          option: {
            1: '抖音',
            2: '视频号'
          }
        },
        xuserType: {
          label: '矩阵号类型',
          typ: 'select',
          option: {
            null: '全部',
            1: '个人号',
            2: '普通企业号',
            3: '认证企业号',
            4: '品牌企业号'
          }
        },
        minCreateTime: {
          label: '开始时间',
          type: 'date'
        },
        maxCreateTime: {
          label: '结束时间',
          type: 'date'
        }
      }
      const res = JSON.parse(list[data].exportJson)
      list[data].remark = desc(videoLable, res)
    }
    // 直播数据
    if (list[data].exporterType === 'LiveListExporter') {
      const liveLable = {
        roomTitle: {
          label: '直播标题'
        },
        nikename: {
          label: '矩阵号昵称'
        },
        roomStatus: {
          label: '直播状态',
          type: 'select',
          option: {
            null: '全部',
            1: '直播中',
            2: '已下播'
          }
        },
        xuserType: {
          label: '矩阵号类型',
          typ: 'select',
          option: {
            null: '全部',
            1: '个人号',
            2: '普通企业号',
            3: '认证企业号',
            4: '品牌企业号'
          }
        },
        userRecordStatus: {
          label: '直播录屏',
          type: 'select',
          option: {
            1: '开启录屏',
            0: '未开启录屏'
          }
        },
        minCreateTime: {
          label: '开始时间',
          type: 'date'
        },
        maxCreateTime: {
          label: '结束时间',
          type: 'date'
        }
      }
      const res = JSON.parse(list[data].exportJson)
      list[data].remark = desc(liveLable, res)
    }
    // ------------------------以上是内容数据中台 end--------------------------

    // ------------------------以下是运营策略中心 start--------------------------
    // 门店管理
    if (list[data].exporterType === 'StoreListExporter') {
      const storeLable = {
        storeName: {
          label: '门店名称'
        },
        isSetPoi: {
          label: '已设置门店位置',
          type: 'select',
          option: {
            1: '是',
            2: '否'
          }
        }
      }
      const res = JSON.parse(list[data].exportJson)
      list[data].remark = desc(storeLable, res)
    }
    // 部门数据
    if (list[data].exporterType === 'OrgAnalyseDataExporter') {
      const taskListLable = {
        exportType: {
          label: '统计方式',
          type: 'select',
          option: {
            1: '统计部门及其子部门人员参与的任务',
            2: '统计部门直接创建的任务',
            3: '统计部门及其子部门创建任务'
          }
        },
        startTime: {
          label: '开始时间',
          type: 'date'
        },
        endTime: {
          label: '开始时间',
          type: 'date'
        }
      }
      const res = JSON.parse(list[data].exportJson)
      list[data].remark = desc(taskListLable, res)
    }
    // 成员数据
    if (list[data].exporterType === 'EmployeeDataExporter') {
      const EmployeeDataLable = {
        joinMissionUserType: {
          label: '成员范围',
          type: 'select',
          option: {
            null: '参与过任务的成员',
            1: '全部',
            2: '未参与过任务的成员'
          }
        },
        employeeName: {
          label: '成员姓名'
        },
        employeePhoneNum: {
          label: '手机号码'
        },
        startTime: {
          label: '开始时间',
          type: 'date'
        },
        endTime: {
          label: '开始时间',
          type: 'date'
        }
      }
      const res = JSON.parse(list[data].exportJson)
      list[data].remark = desc(EmployeeDataLable, res)
    }
    // 商城订单
    if (list[data].exporterType === 'GoldOrderExporter') {
      const goldOrderLable = {
        id: {
          label: '订单编号'
        },
        goodsName: {
          label: '商品名称'
        },
        telephone: {
          label: '联系方式'
        },
        deliverStatus: {
          label: '订单状态',
          type: 'select',
          option: {
            null: '全部',
            1: '待发货',
            2: '已发货'
          }
        },
        name: {
          label: '客户名称'
        }
      }
      const res = JSON.parse(list[data].exportJson)
      list[data].remark = desc(goldOrderLable, res)
    }
    // ------------------------以上是运营策略中心 end--------------------------
  }
}

const isAdmin = ref(false) // 是否是管理员
function getIsAdmin() {
  return new Promise((resolve, reject) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    if (userInfo.role && userInfo.role.length > 0) {
      const admin = userInfo.role.find(item => item.roleCode === 'admin')
      if (admin) {
        isAdmin.value = true
      } else {
        isAdmin.value = false
      }
    } else {
      isAdmin.value = false
    }
    if (isAdmin.value) {
      const selectData = {
        type: 'select',
        label: '数据范围',
        placeholder: '请选择数据范围',
        filed: 'onlyShowSelfData',
        val: true,
        defaultVal: true,
        clearable: true, // 是否可清空，true为不可清空
        selects: [
          {
            label: '只看自己的导出记录',
            value: true
          },
          {
            label: '全部成员的导出记录',
            value: false
          }
        ]
      }
      searchComponents.value.splice(0, 0, selectData)
    }
    resolve(isAdmin.value)
  })
}
</script>

<style lang="scss" scoped></style>
