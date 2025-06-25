<template>
  <div>
    <el-dialog v-model="recordshow" :width="960" top="60px" title="触达记录" @close="close">
      <template #title>
        <div class="dialog_title">
          触达记录
          <span class="head_wrap_tip" v-if="platform && platform === 1">
            抖音私信回复规则解读
            <el-tooltip effect="dark" placement="right" :style="{ 'margin-left': '4px' }">
              <template #content>
                <p>1.用户主动咨询：认证企业号可在24小时内向用户发送6条消息</p>
                <p>2.消息发送次数限制：1 个小时最多发送 40 个用户，1 天最多发送 100 个用户</p>
              </template>
              <img src="@/assets/images/operate/tip_line.png" />
            </el-tooltip>
          </span>
        </div>
      </template>
      <xm_search
        :searchComponents="$data.searchComponents"
        @getData="searchList"
        :useOwnReset="true"
        @reset="resetSearch"
      ></xm_search>
      <div class="page_main">
        <xm_table
          tableType="avatar"
          v-loading="listLoading"
          :data="list"
          v-model:page="page"
          @getTableData="getTableList"
          pageLayout="total, prev, pager, next , jumper"
        >
          <el-table-column label="客户信息" width="200px">
            <template #default="{ row }">
              <table_column_matrix_account
                :info="row.userInfo"
                :showDyNum="false"
                :showPlatform="true"
              ></table_column_matrix_account>
            </template>
          </el-table-column>
          <el-table-column label="客户互动行为">
            <template #default="{ row }">{{ USER_INTERACTION_TYPE.getCN(row.eventType) }}</template>
          </el-table-column>
          <el-table-column label="客户互动内容">
            <template #default="{ row }">
              <el-tooltip effect="dark" placement="top">
                <template #content>
                  <div style="max-width: 300px">
                    {{ row.eventStr }}
                  </div>
                </template>
                <div class="more_text" style="max-width: max-content">
                  {{ row.eventStr }}
                </div>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="触达状态">
            <template #default="{ row }">
              <div class="message_type">
                <!--状态值1表示成功，0表示失败-->
                <span>{{ row.status === 1 ? '成功' : '失败' }}</span>
                <el-tooltip
                  v-if="row.failReason"
                  popper-class="tooltip-class"
                  :content="row.failReason"
                >
                  <el-icon><i-question-filled color="#bfc4cd" /></el-icon>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="回复内容">
            <template #default="{ row }">
              <el-tooltip effect="dark" placement="top">
                <template #content>
                  <div style="max-width: 300px">
                    {{ row.replyWord }}
                  </div>
                </template>
                <div class="more_text" style="max-width: max-content">
                  {{ row.replyWord }}
                </div>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="回复时间" width="180px">
            <template #default="{ row }">{{ row.gmtCreate }}</template>
          </el-table-column>
        </xm_table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import tableList from '@/utils/com_composition/table_list.js'
import { getTriggerList } from '@/api/scrm/session_management'
import { getQuery } from '@/utils/get_query'
import { USER_INTERACTION_TYPE } from '@/utils/dictionary/session-management'

const props = defineProps({
  recordshow: {
    type: Boolean,
    default: false
  },
  // 矩阵号的抖音openId
  openId: {
    type: String,
    default: ''
  },
  // 矩阵号的平台
  platform: {
    type: Boolean,
    default: false
  }
})
const { recordshow, openId, platform } = toRefs(props)
const $data = reactive({
  searchComponents: [
    {
      type: 'select',
      label: '客户互动行为',
      val: -1,
      defaultVal: -1,
      filed: 'eventType',
      selects: [
        {
          label: '全部',
          value: -1
        },
        {
          label: '视频评论',
          value: 110
        },
        {
          label: '私信',
          value: 112
        }
        // {
        //   label: '直播弹幕',
        //   value: 210
        // }
      ],
      hiddenItem: platform.value && platform.value !== 1
    },
    {
      type: 'dateRange',
      label: '回复时间',
      val: '',
      isDisEdit: true,
      disabledDate(time) {
        return (
          new Date(new Date().toLocaleDateString()).getTime() - 60 * 24 * 3600 * 1000 >
            time.getTime() || time.getTime() > Date.now()
        )
      }, // 禁用日期
      placeholder: ['开始时间', '结束时间']
    }
  ]
})

function getList(page) {
  const param = getQuery($data.searchComponents, ['startTime', 'endTime'])
  page.size = 5
  param.pageNo = page.index
  param.pageSize = page.size
  if (!param.groupIds) {
    param.groupIds = []
  }
  if (openId.value) {
    param.dyOpenId = openId.value
  }
  return getTriggerList(param).then(res => {
    let _list = res.data.records
    _list = _list.map(e => {
      // e.enterpriseInfo = {
      //   dyAvatar: e.dyHeadUrl,
      //   dyName: e.dyNickname,
      //   dyNum: e.dyDisplayId
      // }
      e.userInfo = {
        dyAvatar: e.clientAvatar,
        dyName: e.clientNickname,
        platform: e.platform || platform.value
      }
      return e
    })
    page.total = res.data.total
    return _list
  })
}

const emits = defineEmits(['update:recordshow'])
// 关闭弹窗
function close() {
  console.log('会进来这里吗')
  recordshow.value = false
  emits('update:recordshow', false)
}

const { page, list, getTableList, listLoading, searchList, resetSearch } = tableList(getList)

onMounted(() => {
  getTableList()
})
</script>

<style lang="scss" scoped>
.dialog_title {
  font-size: 18px;
  .head_wrap_tip {
    color: #909399;
    font-size: 14px;

    img {
      width: 13px;
      height: 13px;
      margin-left: 2px;
      vertical-align: -2px;
    }
  }
}
.xm_search {
  padding: 0px;
}
.page_main {
  padding: 0px;
}
.message_type {
  display: flex;
  align-items: center;
  > span {
    margin-right: 5px;
  }
}
.more_text {
  overflow: hidden; // 溢出隐藏
  text-overflow: ellipsis; // 溢出用省略号显示
  display: -webkit-box; // 作为弹性伸缩盒子模型显示。
  -webkit-box-orient: vertical; // 设置伸缩盒子的子元素排列方式：从上到下垂直排列
  -webkit-line-clamp: 2; // 显示的行数
}
</style>
