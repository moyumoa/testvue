<template>
  <el-dialog width="628px" v-model="show" :title="title" custom-class="xm_maxHeight_dialog">
    <div class="top">
      <div class="pic">
        <div v-if="row.userBrandName && !row.userPhoto" class="default_photo">
          <span v-if="row.userBrandName.length <= 2">{{ row.userBrandName.slice(0, 2) }}</span>
          <span v-else>{{ row.userBrandName.slice(row.userBrandName.length - 2) }}</span>
        </div>
        <template v-else-if="row.userPhoto">
          <img :src="row.userPhoto" alt />
        </template>
        <img v-else src="@/assets/images/operate/default_user.png" alt />
      </div>
      <pre class="name">{{ row.userBrandName || '-' }}</pre>
      <div class="tips" v-if="row.fsAccount">
        <img v-if="row.fsAccount.iconType === 2" src="@/assets/images/user/weChat.png" alt />
        <img v-if="row.fsAccount.iconType === 1" src="@/assets/images/user/feishu.png" alt />
        <img v-if="row.fsAccount.iconType === 3" src="@/assets/images/user/wx.png" alt />
      </div>
      <div class="status">
        <div class="content">
          <div class="table_point reverse" v-if="row.isValid !== 1">已禁用</div>
          <div class="table_point" v-else>已启用</div>
        </div>
      </div>
    </div>
    <div class="center">
      <div class="section">
        <div class="text">手机号</div>
        <div class="msg">
          <table_column_phone :phone="row.userPhone"></table_column_phone>
        </div>
      </div>
      <div class="section">
        <div class="text">角色</div>
        <div class="msg_msg_msg">
          {{ row.role && row.role.length > 0 ? row.role.map(i => i.roleName).join('/') : '-' }}
          <!-- <el-tooltip v-if="row.role && row.role.length > 0" placement="top">
            <template #content>
              <div style="max-width: 300px">{{ row.role.map(i => i.roleName).join('/') }}</div>
            </template>
            <div class="msg_msg">{{ row.role.map(i => i.roleName).join('/') }}</div>
          </el-tooltip>
          <span v-else>-</span> -->
        </div>
      </div>
      <div class="section">
        <div class="text">员工</div>
        <pre class="msg">{{ (row.fsAccount && row.fsAccount.name) || '-' }}</pre>
      </div>
    </div>
    <div class="center">
      <div class="section">
        <div class="text">运营矩阵号</div>
        <div class="pic">
          <div class="photos" v-if="row.operator && row.operator.length > 0">
            <template v-for="(item, index) in row.operator" :key="item.operatorId">
              <el-tooltip
                v-if="index < 3"
                effect="dark"
                :content="item.authAccountName"
                placement="bottom"
              >
                <div class="photos_item" :class="{ g_failure: isInvalid(item) }">
                  <img :src="item.authAccountPhoto" alt />
                  <div
                    :class="[`xm_platformIcon_${item.platform}`]"
                    style="width: 16px; height: 16px"
                  ></div>
                </div>
              </el-tooltip>
            </template>
            <div
              class="photo_more flex_center"
              @click="viewMore(row.operator, `运营矩阵号`)"
              v-if="row.operator.length > 3"
            >
              +{{ row.operator.length - 3 }}
            </div>
          </div>
          <template v-else>-</template>
        </div>
      </div>
      <div class="section">
        <div class="text">矩阵号数据权限</div>
        <div
          class="photos"
          v-if="
            row.userActDataPmsDetailVO &&
            row.userActDataPmsDetailVO.accountInfos &&
            row.userActDataPmsDetailVO.accountInfos.length > 0
          "
        >
          <div class="pic2" v-if="row.userActDataPmsDetailVO">
            <template v-for="(item, index) in row.userActDataPmsDetailVO.accountInfos" :key="index">
              <div v-if="index < 3">
                <img :src="item.authAccountPhoto" />
              </div>
            </template>

            <div
              @click="toMatrixModal(row)"
              v-if="
                row.userActDataPmsDetailVO &&
                row.userActDataPmsDetailVO.accountInfos &&
                row.userActDataPmsDetailVO.accountInfos.length > 3
              "
            >
              <div>+{{ row.userActDataPmsDetailVO.total - 3 }}</div>
            </div>
          </div>
        </div>
        <div style="margin-top: 8px" v-else>-</div>
      </div>
      <div class="section">
        <div class="text">组织架构权限</div>
        <div class="other">
          <template v-if="row.dataPermissionsList && row.dataPermissionsList.length > 0">
            <template v-for="(item, index) in row.dataPermissionsList" :key="index">
              <span v-if="index < 3">{{ item.name }}</span>
            </template>
            <span
              v-if="row.dataPermissionsList.length > 3"
              @click="toOrganizeModal(row.dataPermissionsList)"
            >
              +{{ row.dataPermissionsList.length - 3 }}
            </span>
          </template>
          <div v-else>-</div>
        </div>
      </div>
    </div>
    <div class="center">
      <!-- <div class="section">
        <div class="text">是否登录后台</div>
        <div class="msg">{{ row.loginBack === 1 ? '是' : '否' }}</div>
      </div> -->
      <div class="section">
        <div class="text">创建时间</div>
        <div class="msg">{{ row.createTime || '-' }}</div>
      </div>
    </div>
  </el-dialog>
  <dataDialog :informatData="informatData"></dataDialog>
  <organizationDialog
    v-if="matrixData.show"
    :matrixData="matrixData"
    :userId="detailData.userId"
    :permissionsType="detailData.row.userActDataPmsDetailVO.permissionsType"
  ></organizationDialog>
</template>

<script>
import dataDialog from './components/data_dialog.vue'
import organizationDialog from './components/organization_dialog.vue'

export default {
  props: {
    detailData: {
      type: Object
    }
  },
  components: { dataDialog, organizationDialog },
  emits: ['changeVisible'],
  setup(props, { emit }) {
    const { show, title, row } = toRefs(props.detailData)
    // 数据权限数据
    const informatData = reactive({
      show: false,
      title: '组织架构权限',
      row: null
    })
    // 矩阵号数据权限数据
    const matrixData = reactive({
      show: false,
      title: '数据权限矩阵号',
      row: null
    })
    // 跳到数据权限弹框
    const toOrganizeModal = (list = []) => {
      informatData.show = true
      informatData.row = list
    }

    onMounted(() => {})

    // 跳到矩阵号数据权限弹框
    const toMatrixModal = row => {
      matrixData.show = true
    }
    // 跳到运营矩阵号弹框
    const viewMore = (data, t) => {
      emit('changeVisible', data, t)
    }
    // 平台授权有效
    const isInvalid = item => {
      if ([1, 2, 3, 4].indexOf(item.platform) === -1) return true
      const authKey = {
        1: 'dyAuth',
        2: 'wxAuth',
        3: 'xhsAuth',
        4: 'dyAuth'
      }
      return item[authKey[item.platform]] === 2
    }
    return {
      show,
      title,
      row,
      informatData,
      matrixData,
      toOrganizeModal,
      toMatrixModal,
      viewMore,
      isInvalid
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';

.top {
  display: flex;
  margin-bottom: 24px;

  .pic {
    width: 62px;
    height: 62px;
    margin-right: 24px;

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
  }

  .default_photo {
    width: 62px;
    height: 62px;
    border-radius: 50%;
    background: #eff3fd;
    border: 1px solid #a9b0d1;
    color: #5d658e;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .name {
    vertical-align: middle;
    margin-right: 16px;
    font-size: 20px;
    line-height: 62px;
    overflow: hidden;
    text-overflow: ellipsis;
    //white-space: nowrap;
    overflow-wrap: break-word;
    max-width: 200px;
  }

  .tips {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    margin-right: 45px;
    margin-top: 20px;

    img {
      width: 100%;
      height: 100%;
      line-height: 62px;
    }
  }

  .status {
    height: 20px;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #333333;
    line-height: 62px;
  }
}

.center {
  margin-bottom: 32px;
  display: flex;

  .section {
    width: 33%;
    height: auto;

    .text {
      height: 20px;
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #909399;
      line-height: 20px;
    }

    .msg {
      height: 20px;
      font-size: 16px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #303133;
      line-height: 20px;
      margin-top: 6px;
      overflow: hidden;
      text-overflow: ellipsis;
      //white-space: nowrap;
      overflow-wrap: break-word;
      max-width: 200px;
    }
    .msg_msg {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow-wrap: break-word;
      max-width: 100%;
      width: max-content;
    }
    .msg_msg_msg {
      min-height: 20px;
      font-size: 16px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #303133;
      line-height: 20px;
      margin-top: 6px;
      padding-right: 6px;
    }
    .photos {
      .pic2 {
        margin-top: 8px;
        display: flex;
        margin-right: 6px;

        img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          margin-right: 6px;
        }

        > div {
          width: 32px;
          height: 32px;
          background: #eff2f8;
          border-radius: 50%;
          font-size: 12px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #364fcd;
          line-height: 32px;
          text-align: center;
          cursor: pointer;
          margin-right: 6px;
        }
      }
    }

    .pic {
      margin-top: 8px;
      display: flex;

      .photos {
        display: flex;

        .photos_item {
          margin-right: 6px;
          position: relative;
          width: 32px;
          height: 32px;

          > img {
            width: 32px;
            height: 32px;
            object-fit: cover;
            border-radius: 50%;

            vertical-align: middle;
          }
        }
      }

      .photo_more {
        width: 32px;
        height: 32px;
        background: #eff2f8;
        border-radius: 50%;
        font-weight: 500;
        color: #364fcd;
        font-size: 12px;
        cursor: pointer;
      }
    }

    .other {
      margin-top: 12px;

      span {
        display: inline-block;
        height: 24px;
        background: #f7f8fa;
        border-radius: 2px;
        border: 1px solid #dcdfe6;
        text-align: center;
        line-height: 24px;
        padding: 0 6px;
        margin-right: 8px;
        margin-bottom: 5px;

        &:nth-last-child(1) {
          cursor: pointer;
          margin-bottom: 0;
        }
      }
    }
  }
}
</style>
