<template>
  <div>
    <section style="position: relative">
      <template v-if="chooseTab != '2' && chooseTab != '5'">
        <div class="audit_btn">
          <el-button type="primary" @click="batch(chooseTab)">批量审核</el-button>
        </div>
      </template>
      <xm_table
        ref="multipleTableRef"
        :showSelection="chooseTab != '2' && chooseTab != '5'"
        class="pic_table"
        v-loading="tableForm.loading"
        tableType="avatar"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getTableData"
        @selection-change="handleSelectionChange"
        :select="chooseList"
        :checkSelectable="handleCheckSelectable"
        rowKey="id"
      >
        <!-- <el-table-column
          v-if="chooseTab != '2'"
          type="selection"
          :reserve-selection="true"
          width="55"
        /> -->
        <el-table-column label="审核信息" min-width="150">
          <template #default="scope">
            <p>{{ scope.row.title || scope.row.auditDesc || '-' }}</p>
          </template>
        </el-table-column>

        <el-table-column label="提交人" min-width="200">
          <template #default="scope">
            <div class="member_info">
              <img
                class="avatar_icon"
                :src="
                  scope.row.headImg
                    ? scope.row.headImg
                    : scope.row.submitUserAvatar
                    ? scope.row.submitUserAvatar
                    : avatarImg
                "
                alt
              />
              <div class="name_mobile">
                <div class="name">
                  {{ scope.row.name || scope.row.submitUsername || '-' }}
                  <div
                    class="xm_depart"
                    style="display: inline-block"
                    v-if="scope.row.staffStatus && scope.row.staffStatus == 2"
                  ></div>
                </div>
                <table_column_phone
                  :phone="scope.row.mobile || scope.row.submitUserPhone"
                  size="small"
                ></table_column_phone>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="类型" v-if="chooseTab == '2' || chooseTab == '5'">
          <template #default="scope">
            <p>{{ scope.row.auditType == 1 ? '视频' : '图文' }}</p>
          </template>
        </el-table-column>
        <el-table-column
          label="智能风险得分"
          min-width="120"
          v-if="chooseTab == '2' || chooseTab == '5'"
        >
          <template #default="scope">
            <p>{{ scope.row.auditResult === 0 ? '-' : scope.row.score || '-' }}</p>
          </template>
        </el-table-column>
        <el-table-column label="状态变更时间" min-width="160">
          <template #default="scope">
            <p>{{ scope.row.gmtUpdate || scope.row.updateTime || '-' }}</p>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" min-width="150">
          <template #default="scope">
            <div class="status">
              <span
                style="
                  font-size: 5px;
                  margin-right: 4px;
                  display: inline-block;
                  width: 4px;
                  height: 4px;
                  border-radius: 50%;
                "
                :class="{
                  'status-0':
                    scope.row.status === 3 ||
                    scope.row.status === 4 ||
                    scope.row.auditResult == 1 ||
                    scope.row.auditResult == 4 ||
                    scope.row.auditResult == 0,
                  'status-2': scope.row.status === 2 || scope.row.auditResult == 3,
                  'status-1': scope.row.status === 1 || scope.row.auditResult == 2
                }"
              ></span>
              <p v-if="chooseTab == '2' || chooseTab == '5'">
                {{ auditResultObj[scope.row.auditResult] }}
              </p>
              <p v-else>
                {{
                  scope.row.status === 3
                    ? '待审核'
                    : scope.row.status === 2
                    ? '审核不通过'
                    : scope.row.status === 1
                    ? '审核通过'
                    : '审核已过期'
                }}
              </p>
              <template v-if="scope.row.status === 2">
                <el-tooltip effect="dark" :content="scope.row.remark" placement="top-start">
                  <template #content>
                    <div style="max-width: 200px">
                      {{ scope.row.remark || '-' }}
                    </div>
                  </template>
                  <el-icon style="margin-left: 8px">
                    <i-warning />
                  </el-icon>
                </el-tooltip>
              </template>
              <template v-if="scope.row.auditResult === 3">
                <el-tooltip effect="dark" :content="scope.row.auditOpinion" placement="top-start">
                  <template #content>
                    <div style="max-width: 400px; max-height: 350px; overflow-y: auto">
                      <p v-for="(a, b) in JSON.parse(scope.row.auditOpinion)" :key="b">
                        {{ b + 1 }}、{{ a.reason }}
                      </p>
                    </div>
                  </template>
                  <el-icon style="margin-left: 8px">
                    <i-warning />
                  </el-icon>
                </el-tooltip>
              </template>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="审核人" min-width="120">
          <template v-slot="{ row }">
            <div class="name">
              {{ row.auditUsername || row.auditUsername || '-' }}
              <div
                class="xm_depart"
                style="display: inline-block"
                v-if="row.auditorStaffStatus && row.auditorStaffStatus == 2"
              ></div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="right" min-width="110">
          <template #default="scope">
            <!-- 智能审核中显示- -->
            <template
              v-if="
                ((chooseTab == '2' || chooseTab == '5') && scope.row.auditResult != 0) ||
                (chooseTab != '2' && chooseTab != '5')
              "
            >
              <el-link
                type="primary"
                v-if="scope.row.status === 3 || scope.row.auditResult == 1"
                @click="taskAudit(scope.row, chooseTab)"
              >
                审核
              </el-link>
              <el-link type="primary" v-else class="ml_16" @click="taskAudit(scope.row, chooseTab)">
                查看
              </el-link>
            </template>
            <div v-else>-</div>
          </template>
        </el-table-column>
      </xm_table>
      <video-audit-modal
        v-if="query.type === 2"
        v-model:isShow="isShow"
        :videoData="taskDetail"
        :taskId="query.auditIds"
        @upData="getTableData"
      ></video-audit-modal>
      <task-audits-modal
        v-if="query.type === 1"
        v-model:isShow="isShow"
        :taskData="taskData"
        :taskId="query.auditIds"
        @upData="getTableData"
      ></task-audits-modal>
      <collect-audit-modal
        v-if="query.type === 3 || query.type === 4"
        v-model:isShow="isShow"
        :auditInfo="taskDetail"
        :taskId="query.auditIds"
        :auditType="query.type"
        @upData="getTableData"
      ></collect-audit-modal>
      <!-- 批量审核 -->
      <div>
        <el-dialog
          v-model="allAudit.show"
          title="批量审核"
          width="400px"
          style="height: 280px"
          destroy-on-close
          @closed="closeDialog"
        >
          <p class="infoNum">当前已勾选{{ allAudit.number }}条信息</p>
          <el-radio-group v-model="query.auditResult">
            <el-radio :label="1">审核通过</el-radio>
            <el-radio :label="2">审核不通过</el-radio>
          </el-radio-group>
          <template v-if="query.auditResult == 2">
            <el-form :rules="rules" label-position="top">
              <el-form-item prop="reason" label="不通过理由：">
                <el-input
                  v-model="query.remark"
                  :rows="1"
                  type="textarea"
                  resize="none"
                  placeholder="请输入审核不通过理由，最多15字"
                  style="font-size: 14px"
                  :maxlength="15"
                  show-word-limit
                />
              </el-form-item>
            </el-form>
          </template>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="allAudit.show = false">取消</el-button>
              <async_button type="primary" :asyncFunc="updateTask">保存</async_button>
            </span>
          </template>
        </el-dialog>
      </div>
    </section>
  </div>
</template>

<script setup>
import { pageList } from './model/get_list'
import videoAuditModal from '../components/video_audit_modal.vue'
import taskAuditsModal from '../components/task_audit_modal.vue'
import collectAuditModal from '../components/collect_audit_modal.vue'
import avatarImg from '@/assets/images/content_center/default_user.png'

const emits = defineEmits(['getTableData', 'resetTableData'])
const props = defineProps({
  tableForm: {
    type: Object,
    required: true
  },
  chooseTab: {
    type: String
  }
})
const { tableForm, chooseTab } = toRefs(props)
// const typeEnums = {
//   1: '任务',
//   2: '视频',
//   3: '征集原料',
//   4: '征集视频'
// }
function closeDialog() {
  query.auditResult = null
  query.remark = ''
}
sessionStorage.removeItem('KOSToRecord')
function handleCheckSelectable(row) {
  return row.status === 3
}
const multipleTableRef = ref()
const {
  auditResultObj,
  chooseList,
  isShow,
  taskDetail,
  query,
  handleSelectionChange,
  taskAudit,
  taskData,
  batch,
  allAudit,
  rules,
  updateTask
  // getTableData
} = pageList(emits, null, null, multipleTableRef)
function getTableData() {
  emits('getTableData')
}
function resetTableSelect() {
  if (multipleTableRef.value) {
    multipleTableRef.value.$refs.table.clearSelection()
  }
}
defineExpose({ resetTableSelect })
</script>

<style lang="scss" scoped>
.status {
  display: flex;
  align-items: center;
}
.status-0 {
  background-color: rgba(144, 147, 153, 1);
}
.status-1 {
  background-color: rgba(81, 248, 139, 1);
}
.status-2 {
  background-color: rgba(248, 81, 81, 1);
}
.member_info {
  display: flex;
  align-items: center;
  .avatar_icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
  }
  .name_mobile {
    margin-left: 12px;
    .mobile {
      font-size: 12px;
      color: #909399;
      line-height: 17px;
    }
  }
}
.infoNum {
  height: 20px;
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #ced2d8;
  line-height: 20px;
  margin-bottom: 16px;
}
.department_info_tooltip-class {
  padding: 0;
}
.audit_btn {
  position: absolute;
  right: 0;
  top: -62px;
}
</style>
