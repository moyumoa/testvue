<template>
  <div>
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      title="修改部门信息"
      width="442px"
    >
      <div class="dialog_content">
        <div class="one_content">
          <div class="content_left">成员：</div>
          <div class="content_right content_phone" style="line-height: 32px">
            {{ userInfo.name }}（
            <div class="phone_box" v-if="userInfo.phoneNum && userInfo.phoneNum != '--'">
              <div v-if="userInfo.showPhone">{{ userInfo.phoneNum }}</div>
              <div v-else>
                {{ userInfo.phoneNum.substring(0, 3) }}****{{ userInfo.phoneNum.substring(7) }}
              </div>
              <!-- <div class="eye_icon" @click="showPhoneFun()">
                <img
                  v-if="userInfo.showPhone"
                  src="@/assets/images/operate/yanjing_xianshi.png"
                  alt
                />
                <img v-else src="@/assets/images/operate/yanjing_yincang.png" alt />
              </div> -->
            </div>
            <div v-else>--</div>
            ）
            <span
              class="xm_depart"
              style="display: inline-block"
              v-if="userInfo.staffStatus && userInfo.staffStatus == 2"
            ></span>
          </div>
        </div>
        <div class="one_content">
          <div class="content_left">所在部门：</div>
          <div class="content_right">
            <div class="right_one">
              <div class="line-hidden1" style="line-height: 30px; height: 30px">
                {{ getPartName(userInfo.departmentList) }}
              </div>
              <div class="right_right" @click="choosePartFun">
                <i class="icon iconfont icon-edit"></i>
              </div>
            </div>
            <div class="right_two">
              <el-icon class="two_icon"><i-warning /></el-icon>
              请谨慎操作，修改成员部门后，成员无法继续参与原部门相关任务
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" :loading="loading" @click="handleConfirm">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <choose_dept_dialog
      :isUsePermission="false"
      :getAllChild="false"
      :allowEmpty="false"
      v-if="choosePartForm.show"
      :show="choosePartForm.show"
      :deptDialog="choosePartForm"
      @updateDept="updatePart"
    ></choose_dept_dialog>
  </div>
</template>
<script setup>
import { udpateStaffDepart } from '@/api/market/operate_analysis.js'
import { throttle } from '@/utils/tools.js'
const props = defineProps({
  updateDialog: {
    type: Object,
    default: () => {
      return {
        show: true, // 是否显示弹窗
        info: {} // 用户信息
      }
    },
    required: true
  }
})
const oldGroupIds = ref([])
const dialog = ref()
const show = toRef(props.updateDialog, 'show')
const loading = ref(false)
const userInfo = ref({})
function init() {
  if (props.updateDialog.info) {
    if (
      props.updateDialog.info.departmentList &&
      props.updateDialog.info.departmentList.length > 0
    ) {
      // let midList = []
      // if (props.updateDialog.info.deptInfo) {
      //   const depList = props.updateDialog.info.deptInfo.split(';')

      //   depList.forEach(item => {
      //     const paths = item.split('/')
      //     const lastPath = paths[paths.length - 1]
      //     let canPush = true // 能否显示 false代表当前midList内已有相同的子部门
      //     midList.forEach(i => {
      //       if (i.name === lastPath) {
      //         canPush = false
      //         const str = i.all + ';' + paths.join('/') // 如果子部门相同，跟部门不同，就拼接起来
      //         midList = midList.map(x => {
      //           const y = x
      //           if (y.name === lastPath) {
      //             y.all = str // 放在all字段里
      //           }
      //           return y
      //         })
      //       } else {
      //         canPush = true
      //       }
      //     })
      //     if (canPush)
      //       midList.push({
      //         name: lastPath,
      //         all: item,
      //         visible: false
      //       })
      //   })
      // }
      props.updateDialog.info.departmentList.forEach(x => {
        // if (!x.fullPath) {
        //   x.fullPath = midList.find(y => y.name === x.name)?.all
        // }
        x.id = parseInt(x.id)
        oldGroupIds.value.push(x.id)
      })
      // oldGroupIds.value = props.updateDialog.info.departmentList.map(x => x.id)
    }
    userInfo.value = JSON.parse(JSON.stringify(props.updateDialog.info))
    userInfo.value.showPhone = false
  }
}
init()
const message = inject('$message')
const emits = defineEmits(['updateList'])
const handleConfirm = throttle(() => {
  loading.value = true
  let Ids = []
  if (userInfo.value.departmentList && userInfo.value.departmentList.length > 0) {
    Ids = userInfo.value.departmentList.map(x => x.id)
  }
  if (Ids.length > 0) {
    udpateStaffDepart({
      brandId: localStorage.getItem('brandInfo')
        ? JSON.parse(localStorage.getItem('brandInfo')).brandId
        : '',
      operUserId: localStorage.getItem('userInfo')
        ? JSON.parse(localStorage.getItem('userInfo')).userId
        : null,
      sourceDeptId: oldGroupIds.value,
      targetDeptId: Ids,
      userId: userInfo.value.userId
    })
      .then(res => {
        if (res.code === 0) {
          message.success('修改成功')
          emits('updateList')
          dialog.value.handleClose()
        }
      })
      .finally(() => {
        loading.value = false
      })
  } else {
    message.warning('一定要选择一个部门哦')
    loading.value = false
  }
}, 700)
function closeDialog() {
  dialog.value.handleClose()
}
const choosePartForm = reactive({
  show: false
})
// 选择部门
const choosePartFun = throttle(() => {
  choosePartForm.show = true
  if (userInfo.value.departmentList && userInfo.value.departmentList.length > 0) {
    const checkList = []
    userInfo.value.departmentList.forEach(x => {
      checkList.push({
        fullIds: x.fullIds || x.parentIds,
        fullPath: x.fullPath,
        id: parseInt(x.id),
        name: x.name
      })
    })
    choosePartForm.checkNode = checkList
  } else {
    choosePartForm.checkNode = []
  }
}, 700)
// 设置选中的部门
function updatePart(e) {
  userInfo.value.departmentList = e
}
// 将选中的部门名称提取出来
function getPartName(e) {
  return e ? e.map(x => x.name).join(';') : ''
}
// 手机号的显示隐藏
// function showPhoneFun() {
//   userInfo.value.showPhone = !userInfo.value.showPhone
// }
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.dialog_content {
  .one_content {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    .content_left {
      width: 80px;
      padding-right: 8px;
      text-align: right;
      font-size: 14px;
      font-weight: 400;
      color: #303133;
      line-height: 32px;
    }
    .content_phone {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      .phone_box {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        .eye_icon {
          width: 12px;
          height: 12px;
          margin-left: 5px;
          cursor: pointer;
          img {
            width: 100%;
            height: 100%;
            display: flex;
          }
        }
      }
    }
    .content_right {
      width: calc(100% - 80px);
      .right_one {
        width: 320px;
        height: 32px;
        padding: 0 0 0 12px;
        border-radius: 2px;
        border: 1px solid #dcdfe6;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        .line-hidden1 {
          width: 80%;
        }
        .icon {
          color: #364fcd;
        }
        .right_right {
          cursor: pointer;
          width: 20%;
          padding-right: 12px;
          height: 30px;
          display: flex;
          flex-direction: row;
          justify-content: flex-end;
          align-items: center;
        }
      }
      .right_two {
        margin-top: 4px;
        font-size: 14px;
        font-weight: 400;
        color: #909399;
        line-height: 20px;
        .two_icon {
          font-size: 10px;
          color: red;
          line-height: 1;
          transform: scale(1.8);
          margin-right: 8px;
        }
      }
    }
  }
  .one_content + .one_content {
    margin-top: 14px;
  }
}
</style>
