<template>
  <div class="team-manage border-wrapper">
    <div class="team-card">
      <div>
        <div class="card-item add-team" @click="openAddTeamModal('add')">
          <i class="iconfont icon-add"></i>
          <p>新增小组</p>
        </div>
      </div>
      <div
        class="card-item"
        v-for="(item, index) in teamList"
        :key="index"
        :style="{ borderTopColor: item.color }"
      >
        <div class="team-title">
          <span class="team-name" @click="openAddTeamModal('edit', item)">
            {{ item.groupName }}
          </span>
          <div class="flex" style="align-items: center">
            <img
              class="info_img"
              src="@/assets/images/group/info.png"
              alt=""
              @click="openInfoModal(item)"
            />
            <i
              class="iconfont icon-edit"
              @click="openPersonnelModal(item)"
              v-if="item.staffCount < 10"
            ></i>
            <i
              class="iconfont icon-shanchu"
              style="margin-left: 11px"
              @click="delGroup(item.groupId)"
            />
          </div>
        </div>
        <template v-if="item.staffCount > 0">
          <div class="team-num">{{ item.staffCount }}人</div>
          <div class="personnel-avatar">
            <div class="avatar-wrapper" v-for="(pItem, pIndex) in item.staffVoList" :key="pIndex">
              <div class="avatar-tip" @click="selectRole(item.groupId, pItem)">
                <img class="photo" :src="pItem.photo" alt="" />
                <i
                  class="iconfont icon-delete_fill del-icon"
                  @click.stop="delTeamPerson(item, pItem)"
                />
              </div>
              <div class="item_info">
                <p class="name">{{ pItem.name }}</p>
                <div class="roles_wrapper" v-if="pItem.roleVos">
                  <template v-for="(r, index) in pItem.roleVos" :key="r">
                    <!-- <role-tag v-if="index <= 1" :role="r.roleName" /> -->
                    <role_tag v-if="index <= 1" :role="r.roleName" />
                  </template>
                  <el-popover
                    placement="bottom"
                    :width="200"
                    trigger="hover"
                    popper-class="role_popper"
                  >
                    <template #reference>
                      <div class="num" v-if="pItem.roleVos.length > 2">
                        {{ pItem.roleVos.length - 2 }}
                      </div>
                    </template>
                    <div style="display: flex; flex-wrap: wrap" class="all_role">
                      <template v-for="r in pItem.roleVos" :key="r">
                        <role_tag :role="r.roleName" />
                      </template>
                    </div>
                  </el-popover>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="empty_data">
            <img src="@/assets/images/group/live_default.png" alt="" class="empty_img" />
            <div class="empty_text">暂无成员</div>
            <div class="add_btn" @click="openPersonnelModal(item)">添加成员</div>
          </div>
        </template>
      </div>
    </div>
    <el-dialog
      v-model="addTeamModal"
      :title="teamModalStatus === 'add' ? '新增小组' : '编辑小组'"
      width="400px"
    >
      <div class="content">
        <div class="form-wrapper">
          <div class="form-item">
            <div class="label-title">小组名称:</div>
            <el-input
              type="text"
              v-model.trim="addTeamForm.groupName"
              placeholder="请输入小组名称"
              :maxlength="10"
              style="width: 260px"
            ></el-input>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="addTeamCancel">取消</el-button>
        <el-button type="primary" @click="addTeamConfirm">确定</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="infoModal" title="排班信息" width="825px">
      <div class="modal_content">
        <el-table :data="infoData" style="width: 100%" max-height="500">
          <el-table-column prop="liveRoomName" label="直播间" width="200" />
          <el-table-column label="排班时间">
            <template #default="{ row }">
              <div class="slot-time">{{ row.startTime }} - {{ row.endTime }}</div>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="180">
            <template #default="{ row }">
              <div :class="['slot-status', `${row.status !== 0 ? 'confirm' : ''}`]">
                {{ row.status === 0 ? '未确认' : '已确认' }}
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
    <el-dialog v-model="roleDialog" title="选择职位" width="400px">
      <div class="content">
        <div class="form-wrapper">
          <div class="form-item">
            <div class="label-title">职位:</div>
            <el-select v-model="roles" multiple placeholder="请选择职位" style="width: 260px">
              <el-option v-for="i in roleList" :key="i" :label="i" :value="i"></el-option>
            </el-select>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="cancelSelectRole">取消</el-button>
        <el-button type="primary" @click="addRole">确定</el-button>
      </template>
    </el-dialog>
    <select-person
      v-if="addPersonnelModal"
      v-model:visible="addPersonnelModal"
      :model="model"
      @confirm="addPerson"
    />
  </div>
</template>

<script>
import { debounce } from '@/utils/tools'
import SelectPerson from './components/select_person.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  addOrUpdateGroup,
  fetchGroup,
  deleteGroup,
  getGroupStaffSchedulingList,
  addGroupStaff,
  deleteGroupStaff,
  addOrUptGroupAccountRole
} from '@/api/market/group.js'

export default {
  name: 'team-manage',
  components: { SelectPerson },
  data() {
    return {
      roleDialog: false,
      roles: [],
      roleList: ['管理员', '主播', '运营', '场控', '中控', '财务', '投手'],
      currentStaffId: 0,
      model: {
        selectedIdList: []
      },
      visible: false,
      type: undefined,
      infoPage: {
        currentPage: 1,
        total: 0,
        pageSize: 10
      },
      infoData: [],
      infoModal: false,
      teamModalStatus: '',
      // 删除人员弹窗
      delPersonModal: false,
      // 删除人员信息
      delPersonInfo: {
        anchorId: '',
        groupId: ''
      },
      // 添加团队弹窗
      addTeamModal: false,
      // 添加成员弹窗
      addPersonnelModal: false,
      // 搜索成员
      personnelName: '',
      // 团队卡片颜色列表集合
      colorList: [
        '#6647ff',
        '#FFBF55',
        '#FF6F6F',
        '#88D1EA',
        '#975FE5',
        '#4ECB73',
        '#43A2FF',
        '#0082FF',
        '#DC81D2'
      ],
      teamData: {},
      // 团队列表
      teamList: [],
      // 人员列表
      personnelList: [],
      // 已选人员列表
      selectedList: [],
      addTeamForm: {
        color: '',
        groupId: '',
        groupName: ''
      },
      teamPage: {
        pageNumber: 1,
        pageSize: 10,
        total: 0
      },
      modalSeachName: '',
      searchList: []
    }
  },
  computed: {
    filterPersonList({ modalSeachName, personnelList }) {
      const arr = []
      if (modalSeachName) {
        for (const item of personnelList) {
          const obj = JSON.parse(JSON.stringify(item))
          const child = item.children.filter(children =>
            children.anchorName.includes(modalSeachName)
          )
          obj.children = child
          arr.push(obj)
        }
        return arr
      }
      return personnelList
    }
  },
  filters: {
    formatStatus(status) {
      if (status === 0) {
        return '未确认'
      } else if (status) {
        return '已确认'
      }
    }
  },
  mounted() {
    this.selectGroup()
  },
  methods: {
    // 绑定角色
    selectRole(groupId, { staffId, roleVos }) {
      this.groupId = groupId
      this.currentStaffId = staffId
      this.roles = roleVos ? roleVos.map(i => i.roleName) : []
      this.roleDialog = true
    },
    cancelSelectRole() {
      this.roleDialog = false
    },
    addRole() {
      addOrUptGroupAccountRole({
        groupId: this.groupId,
        staffId: this.currentStaffId,
        roleNames: this.roles
      })
        .then(res => {
          if (res.msg === '成功') {
            this.selectGroup()
          }
        })
        .finally(() => {
          this.cancelSelectRole()
        })
    },
    // 添加成员
    addPerson(ids) {
      addGroupStaff({
        staffIds: ids,
        groupId: this.groupId
      }).then(res => {
        if (res.data === '添加成功') {
          ElMessage.success('添加成功')
          this.selectGroup()
          this.addPersonnelModal = false
        }
      })
    },
    // 添加成员
    openPersonnelModal(item) {
      this.groupId = item.groupId
      this.model.selectedIdList = (item.staffVoList || []).map(i => parseInt(i.staffId))
      this.addPersonnelModal = true
    },

    openInfoModal({ groupId }) {
      getGroupStaffSchedulingList({
        groupId
      }).then(res => {
        this.infoData = res.data
        this.infoModal = true
      })
    },
    // 查询团队
    selectGroup() {
      fetchGroup({
        pageNumber: 1,
        pageSize: 9999
      }).then(res => {
        this.teamList = res.data.dataList
        this.teamPage.total = res.data.total
      })
    },
    // 添加团队
    handleAddOrUpdate() {
      addOrUpdateGroup(this.addTeamForm).then(res => {
        this.selectGroup()
        this.addTeamModal = false
      })
    },
    // 团队添加成员
    async addGroupAnchor(sendData) {
      const res = await this.$api.group.addGroupAnchor(sendData)
      this.$tips({
        msg: res.msg,
        type: res.success,
        isTips: true,
        success: () => {
          this.selectGroup()
          this.addPersonnelModal = false
        }
      })
    },
    // 同步选中状态
    initSelected(status) {
      let arr = []
      for (let i = 0; i < this.personnelList.length; i++) {
        arr = arr.concat(this.personnelList[i].children)
      }
      if (status === 'sync') {
        arr.forEach(item => {
          item.selected = false
          this.selectedList.forEach(sItem => {
            if (item.anchorId === sItem.anchorId) {
              item.selected = true
            }
          })
        })
      } else {
        arr.forEach(item => {
          item.selected = false
        })
      }
    },
    // 删除团队人员
    delTeamPerson(item, pItem) {
      ElMessageBox.confirm('删除后仅从小组移除，不影响现有排班规划，确定删除?', '友情提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteGroupStaff({
          groupId: item.groupId,
          staffId: pItem.staffId
        }).then(res => {
          this.selectGroup()
        })
      })
    },
    // 删除团队
    openAddTeamModal(type, item) {
      this.teamModalStatus = type
      if (type === 'add') {
        const randomNum = Math.floor(Math.random() * 9)
        this.addTeamForm.groupName = ''
        this.addTeamForm.groupId = ''
        this.addTeamForm.color = this.colorList[randomNum]
      } else {
        this.addTeamForm.groupName = item.groupName
        this.addTeamForm.color = item.color
        this.addTeamForm.groupId = item.groupId
      }
      this.addTeamModal = true
    },
    delGroup(groupId) {
      ElMessageBox.confirm('删除后不可回复，确认删除', '友情提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteGroup({
          groupId
        }).then(res => {
          this.selectGroup()
        })
      })
    },
    // 选择查询人员
    selectSearchPersonnel(pItem) {
      if (this.selectedList.length >= 10) {
        return ElMessage.error('团队成员不能超过10人')
      }
      let flag = true
      for (let i = 0; i < this.selectedList.length; i++) {
        if (this.selectedList[i].anchorId === pItem.anchorId) {
          flag = false
          break
        }
      }
      flag && this.selectedList.push(pItem)
    },
    // 删除已选人员
    delPersonnel(item, index) {
      this.selectedList.splice(index, 1)
      this.initSelected('sync')
    },
    // 添加成员弹窗确认
    addPersonnelConfirm: debounce(function () {
      const anchorIds = []
      this.selectedList.forEach(item => {
        anchorIds.push(item.anchorId)
      })
      if (anchorIds.length > 0) {
        this.isGroupPopup()
      } else {
        ElMessage.error('请选择成员')
      }
    }, 500),
    // 判断小组是否有弹框
    isGroupPopup() {
      const anchorIds = this.selectedList.map(i => i.anchorId)
      const sendData = {
        anchorIds,
        groupId: this.teamData.groupId,
        applyType: this.type
      }
      this.$api.group.isGroupPopup(sendData).then(res => {
        if (!res.data) {
          this.handleOk(1)
        } else {
          this.visible = true
        }
      })
    },
    handleOk(type) {
      if (type !== 1) {
        if ([0, 1].indexOf(this.type) === -1) {
          return ElMessage.error('请先选择')
        }
      }
      const anchorIds = this.selectedList.map(i => i.anchorId)
      const sendData = {
        anchorIds,
        groupId: this.teamData.groupId,
        applyType: this.type || 0
      }
      this.addGroupAnchor(sendData)
      this.cancel()
    },
    cancel() {
      this.visible = false
      this.type = undefined
    },
    onTeamPageSizeChange(pageSize) {
      this.teamPage.pageSize = pageSize
      this.selectGroup()
    },
    onTeamPageChange(page) {
      this.teamPage.pageNumber = page
      this.selectGroup()
    },
    // 添加团队取消
    addTeamCancel() {
      this.addTeamModal = false
    },
    personnelModalChange() {
      this.modalSeachName = ''
    },
    // 添加团队确认
    addTeamConfirm: debounce(function () {
      if (this.addTeamForm.groupName) {
        this.handleAddOrUpdate()
      } else {
        ElMessage.error('请输入团队名称')
      }
    }, 500),
    // 根据输入查询人员
    getAnchorPage: debounce(function () {
      if (!this.modalSeachName) {
        this.searchList = []
        return
      }
      this.$api.user
        .getAnchorPage({
          anchorName: this.modalSeachName
        })
        .then(res => {
          this.searchList = res.data.records.filter(item => item.isDelete === 0)
          this.searchList = this.searchList.map(item => {
            item.roleName = item.anchorRoleName
            return item
          })
        })
    }, 500)
  }
}
</script>

<style lang="scss" scoped>
.team-manage {
  position: relative;
  background-color: #fff;
  padding: 16px 16px 0 16px;
  .team-card {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(346px, max-content));
    justify-content: space-between;
    grid-column-gap: 16px;
    margin-bottom: 16px;
    .card-item {
      position: relative;
      width: 312px;
      height: 234px;
      padding: 18px 16px;
      margin-bottom: 27px;
      // margin-right: 27px;
      background: #ffffff;
      box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.1);
      border-radius: 5px;
      border-top: 8px solid $theme-color;
      &:hover {
        box-shadow: 0px 0px 8px 8px #eee;
      }

      .team-title {
        display: flex;
        justify-content: space-between;
        font-size: 16px;
        font-weight: 500;
        color: #303133;
        line-height: 22px;
        letter-spacing: 1px;
        text-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
        .team-name {
          cursor: pointer;
        }
        .info_img {
          display: none;
          width: 18px;
          height: 18px;
          margin-right: 11px;
          cursor: pointer;
        }
        .icon-edit,
        .icon-shanchu {
          color: #6647ff;
          cursor: pointer;
        }
        .iconfont {
          display: none;
        }
      }
      .team-num {
        margin: 4px 0 18px;
        font-size: 14px;
        font-weight: 400;
        color: #909399;
        line-height: 20px;
        text-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
      }
      .personnel-avatar {
        display: grid;
        grid-template-columns: repeat(2, 50%);
        justify-content: space-between;
        max-height: 140px;
        overflow-y: auto;
        .avatar-wrapper {
          margin-bottom: 7px;
          display: flex;
          padding: 5px 0;
          .avatar-tip {
            position: relative;
            display: flex;
            flex-direction: column;
            margin-right: 8px;
            img {
              width: 36px;
              height: 36px;
              box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.1);
              border: 1px solid rgba(0, 0, 0, 0.1);
              border-radius: 50%;
              cursor: pointer;
            }
            .role-tag {
              position: relative;
              top: -10px;
              left: -2px;
            }
            .del-icon {
              display: none;
              position: absolute;
              top: -4px;
              right: -2px;
            }
            &:hover .del-icon {
              display: block;
            }
            .del-icon:hover {
              color: #ff0b00 !important;
            }
          }
          .item_info {
            flex-grow: 1;
            .name {
              font-size: 14px;
              color: #303133;
              line-height: 20px;
              text-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
              margin-bottom: 2px;
            }
            .roles_wrapper {
              display: flex;
              .num {
                border: 1px solid rgba(80, 109, 255, 0.3);
                background-color: rgba(80, 109, 255, 0.2);
                border-radius: 50%;
                color: #506dff;
                font-size: 10px;
                width: 16px;
                height: 16px;
                line-height: 16px;
                text-align: center;
                cursor: pointer;
              }

              .role-tag {
                margin-right: 4px;
              }
            }
          }
        }
      }
      .add-personnel {
        // position: absolute;
        // bottom: 16px;
        // right: 20px;
        // width: 36px;
        // height: 36px;
        // line-height: 40px;
        // text-align: center;
        // border-radius: 50%;
        // background: #ffffff;
        // box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.1), 0px 2px 5px 0px rgba(0, 0, 0, 0.1);
        // cursor: pointer;
        // display: none;
        height: 22px;
        margin-right: 8px;
        color: $theme-color;
      }
    }
    .card-item:hover {
      .iconfont,
      .info_img,
      .add-personnel {
        display: block;
      }
    }
    .add-team {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      border-top-color: #f2f3f5;
      cursor: pointer;
      p {
        margin-top: 14px;
        font-size: 14px;
        font-weight: 400;
        color: #333333;
      }
    }
  }
}

.form-wrapper .form-item {
  display: flex;
  align-items: center;
  .label-title {
    margin-right: 12px;
  }
}
.modal_content {
  .slot-status {
    padding-left: 10px;
    position: relative;
    &::before {
      content: '';
      display: inline-block;
      width: 6px;
      height: 6px;
      background-color: red;
      border-radius: 50%;
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
    }
    &.confirm {
      &::before {
        background-color: #52c41a;
      }
    }
  }
}
.empty_data {
  width: 100%;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 44px;
  .empty_img {
    width: 48px;
    height: 48px;
    margin-bottom: 4px;
  }
  .empty_text {
    color: #c0c4cc;
    margin-bottom: 16px;
  }
  .add_btn {
    width: 87px;
    height: 29px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid $theme-color;
    border-radius: 4px;
    color: $theme-color;
    transition: opacity 0.2s;
    cursor: pointer;
    &:hover {
      opacity: 0.6;
    }
  }
}
</style>
