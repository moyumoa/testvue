<template>
  <!-- <div v-if="currentTab === 'b'">2</div> -->
  <div class="inner_box2">
    <template v-if="currentTab !== 'b'">
      <div class="left_box">
        <div class="left">
          <el-form @submit.prevent>
            <el-form-item label label-position="right" style="width: 360px; margin-bottom: 0px">
              <el-input
                v-model="formInline.name"
                class="w-50 m-2"
                size="large"
                placeholder="请输入矩阵账号名称"
                :suffix-icon="transElIconName('Search')"
                debounce
                clearable
                @change="getAccount"
                v-if="currentTab === 'a'"
              ></el-input>
              <el-input
                v-model="formInline.nameGroup"
                class="w-50 m-2"
                size="large"
                placeholder="请输入分组名称"
                :suffix-icon="transElIconName('Search')"
                debounce
                clearable
                @change="getGroupList"
                v-if="currentTab === 'c'"
              ></el-input>
            </el-form-item>

            <div class="section_left">
              <!-- 矩阵号 -->
              <template v-if="currentTab === 'a'">
                <div v-if="matrix.name.length">
                  <div class="left_a">
                    <el-checkbox
                      v-for="item in matrix.name"
                      :label="item.authAccountName"
                      :key="item.authAccountName"
                      @change="changeAccount($event, item)"
                      v-model="item.checked"
                      class="left_container"
                    >
                      <img
                        class="user_head"
                        alt
                        v-if="item.authAccountPhoto"
                        :src="item.authAccountPhoto"
                      />
                      <img
                        src="@/assets/images/content_center/default_user.png"
                        class="user_head"
                        alt
                        v-else
                      />
                      {{ item.authAccountName }}
                    </el-checkbox>
                  </div>
                </div>
                <div v-else style="margin-top: 20px; text-align: center; color: gray">暂无数据</div>
              </template>
              <!-- 矩阵号分组 -->
              <template v-if="currentTab === 'c'">
                <div v-if="matrixGroup.name.length > 0">
                  <div class="left_a">
                    <el-checkbox
                      v-for="item in matrixGroup.name"
                      :label="item.groupName"
                      :key="item.groupName"
                      v-model="item.checked"
                      @change="changeGroupAccount($event, item)"
                      class="left_container"
                    >
                      {{ item.groupName }}
                    </el-checkbox>
                  </div>
                </div>
                <div v-else style="margin-top: 20px; text-align: center; color: gray">暂无数据</div>
              </template>
            </div>
          </el-form>
        </div>
      </div>
      <div class="right_box">
        <div class="right">
          <div class="choice_user">
            <!-- 矩阵号 -->
            <template v-if="currentTab === 'a'">
              <span>已选：{{ matrix.rightName.length }}个账号</span>
              <div
                v-if="!matrix.rightName.length"
                style="margin-top: 40px; text-align: center; margin-left: -50px; color: gray"
              >
                暂无数据
              </div>
            </template>
            <!-- 组织架构 -->
            <!-- 矩阵号分组 -->
            <template v-if="currentTab === 'c'">
              <span>已选：{{ matrixGroup.rightName.length }}个分组</span>
              <div
                v-if="!matrixGroup.rightName.length"
                style="margin-top: 40px; text-align: center; margin-left: -50px; color: gray"
              >
                暂无数据
              </div>
            </template>
            <span style="cursor: pointer" @click="clearChecked" v-if="currentTab === 'a'">
              清空
            </span>
            <span style="cursor: pointer" @click="clearGroupChecked" v-if="currentTab === 'c'">
              清空
            </span>
          </div>
          <div class="section_right">
            <!-- 矩阵号 -->
            <div class="box" v-if="currentTab === 'a'">
              <div>
                <div class="left_a">
                  <el-checkbox
                    v-for="item in matrix.rightName"
                    :label="item.authAccountName"
                    :key="item.authAccountName"
                    :model-value="true"
                    @change="changeAccount($event, item)"
                    class="left_container"
                  >
                    <img
                      class="user_head"
                      alt
                      v-if="item.authAccountPhoto"
                      :src="item.authAccountPhoto"
                    />
                    <img
                      src="@/assets/images/content_center/default_user.png"
                      class="user_head"
                      alt
                      v-else
                    />
                    {{ item.authAccountName }}
                  </el-checkbox>
                </div>
              </div>
            </div>
            <!-- 组织架构 -->
            <!-- 矩阵号分组 -->
            <div class="box" v-if="currentTab === 'c'">
              <div>
                <div class="left_a">
                  <el-checkbox
                    v-for="item in matrixGroup.rightName"
                    :label="item.groupName"
                    :key="item.groupName"
                    :model-value="true"
                    class="left_container"
                    @change="changeGroupAccount($event, item)"
                  >
                    {{ item.groupName }}
                  </el-checkbox>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div
        style="
          font-size: 14px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #303133;
          line-height: 20px;
          text-align: center;
          line-height: 300px;
        "
      >
        使用【组织架构权限】，设置后可查看该部门及下属部门员工运营账号的数据
      </div>
    </template>
  </div>
</template>

<script setup>
import { transElIconName } from '@/utils/tools.js'
import { getAccountGroupList } from '@/api/system_setting/personal'
import { getOperatorAccount } from '@/api/system_setting/account.js'

const props = defineProps({
  currentTab: {
    type: String,
    default: ''
  },
  accountIds: Array,
  accountGroupIds: Array
})
const emit = defineEmits(['dataOneList', 'dataTwoList', 'dataTwoListIds', 'dataOneListIds'])
const data = reactive({
  accountIds: [],
  accountGroupIds: []
})
const formInline = reactive({
  name: '',
  nameGroup: ''
})
const matrixGroup = reactive({
  checkedNames: [],
  name: [],
  rightName: []
})
const matrix = reactive({
  checkedNames: [],
  name: [],
  rightName: []
})
// watch(
//   () => props.currentTab,
//   () => {
//     getGroupList()
//     getAccount()
//   }
// )
// 矩阵号列表
const getAccount = (val = []) => {
  getOperatorAccount({
    authAccountName: formInline.name,
    operatorIdList: []
  }).then(res => {
    matrix.checkedNames = res.data
      .filter(e => {
        const isExist = data.accountIds.includes(e.operatorId)
        e.checked = isExist
        return isExist
      })
      .map(e => e.authAccountName)
    matrix.name = res.data
    if (!formInline.name) {
      matrix.rightName = matrix.name.filter(item => {
        return data.accountIds.includes(item.operatorId) // matrix.checkedNames.includes(item.authAccountName) 通过名称匹配可能出现同名情况
      })
      updateAccountList()
    }
  })
}
// 矩阵号分组列表
function getGroupList(val) {
  getAccountGroupList({
    groupName: formInline.nameGroup
  }).then(res => {
    matrixGroup.checkedNames = res.data
      .filter(e => {
        const isExist = data.accountGroupIds.includes(e.groupId)
        e.checked = isExist
        return isExist
      })
      .map(e => e.groupName)
    matrixGroup.name = res.data
    if (!formInline.nameGroup) {
      matrixGroup.rightName = matrixGroup.name.filter(item => {
        return data.accountGroupIds.includes(item.groupId) // matrixGroup.checkedNames.includes(item.groupName) name有重复的
      })
      updateGroupList()
    }
  })
}
// 选择/取消矩阵号
function changeAccount(value, item) {
  changeBoxItem(value, item, matrix, 'operatorId')
}
// 选择/取消矩阵号分组
function changeGroupAccount(value, item) {
  changeBoxItem(value, item, matrixGroup, 'groupId')
}
function changeBoxItem(checkValue, item, obj, key) {
  const list = obj.rightName.filter(e => item[key] === e[key])
  const isExist = list && list.length
  if (!checkValue && isExist) {
    obj.rightName.forEach((e, k) => {
      if (e[key] === item[key]) {
        obj.rightName.splice(k, 1)
      }
    })
    obj.name.forEach((e, k) => {
      if (e[key] === item[key]) {
        e.checked = false
      }
    })
  }
  if (checkValue && !isExist) {
    obj.rightName.push(item)
  }
  key === 'operatorId' ? updateAccountList() : updateGroupList()
}
const clearChecked = () => {
  matrix.checkedNames = []
  matrix.rightName = []
  matrix.name.forEach(e => {
    e.checked = false
  })
  updateAccountList()
}
const clearGroupChecked = () => {
  matrixGroup.checkedNames = []
  matrixGroup.rightName = []
  matrixGroup.name.forEach(e => {
    e.checked = false
  })
  updateGroupList()
}
const updateAccountList = () => {
  const arr = []
  const brr = []
  toRaw(matrix.rightName).forEach(item => {
    arr.push(toRaw(item).authAccountName)
    brr.push(toRaw(item).operatorId)
  })
  data.accountIds = brr
  emit('dataOneList', arr)
  emit('dataOneListIds', brr)
}
const updateGroupList = () => {
  const arr = []
  const brr = []
  toRaw(matrixGroup.rightName).forEach(item => {
    arr.push(toRaw(item).groupName)
    brr.push(toRaw(item).groupId)
  })
  data.accountGroupIds = brr
  emit('dataTwoList', arr)
  emit('dataTwoListIds', brr)
}

onMounted(() => {
  data.accountIds = props.accountIds
  data.accountGroupIds = props.accountGroupIds
  getAccount()
  getGroupList()
})
</script>

<style lang="scss" scoped>
.node_icon {
  width: 26px;
  height: 26px;
  margin-right: 8px;
  background: #364fcd;
  opacity: 0.6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.inner_box2 {
  display: flex;
  .left_box {
    border-right: 1px solid #dcdfe6;
    .left {
      margin: 16px 24px 30px 24px;
      width: 370px;
      .check_section {
        padding: 4px 12px 18px 24px;
        width: 50%;
        height: 100%;
        overflow-y: auto;
        box-sizing: border-box;
      }
      .section_left {
        // height: calc(100% - 100px);
        height: 360px;
        overflow-y: auto;
        .left_a {
          display: flex;
          flex-direction: column;
          margin-top: 16px;
          .left_container {
            margin-bottom: 16px;
            .user_head {
              width: 40px;
              height: 40px;
              border: 1px solid #f7f7f7;
              border-radius: 100%;
              vertical-align: middle;
              margin-right: 6px;
            }
          }
        }
        .tree_node {
          display: flex;
          line-height: 26px;
          align-items: center;
        }
      }
    }
  }
  .right_box {
    .right {
      margin: 16px 24px 32px 24px;
      .choice_user {
        display: flex;
        justify-content: space-between;
        padding-top: 6px;
        margin-bottom: 16px;
        span:nth-child(1) {
          height: 20px;
          font-size: 14px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #333333;
          line-height: 20px;
        }
        span:nth-child(2) {
          width: 30px;
          height: 20px;
          font-size: 14px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #364fcd;
          line-height: 20px;
          cursor: pointer;
        }
      }
      .section_right {
        .box {
          display: flex;
          overflow-y: auto;
          height: 350px;
          .left_a {
            display: flex;
            flex-direction: column;
            .left_container {
              margin-bottom: 16px;
              .user_head {
                width: 40px;
                height: 40px;
                border: 1px solid #f7f7f7;
                border-radius: 100%;
                vertical-align: middle;
                margin-right: 6px;
              }
            }
          }
          .originazeContent {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 325px;
            > div:nth-child(2):hover {
              color: red;
              cursor: pointer;
            }
            .top {
              height: 20px;
              font-size: 14px;
              font-family: PingFangSC-Regular, PingFang SC;
              font-weight: 400;
              color: #323233;
              line-height: 20px;
            }
            .bottom {
              margin-top: 2px;
              height: 20px;
              font-size: 12px;
              font-family: PingFangSC-Regular, PingFang SC;
              font-weight: 400;
              color: #909399;
              line-height: 20px;
            }
          }
        }
        .box2 {
          height: 350px;
          display: block;
          overflow-y: auto;
          .box2_content {
            display: flex;
            margin-bottom: 12px;
          }
        }
      }
    }
  }
  > div {
    flex: 1;
    height: 410px;
  }
}
:deep(.el-checkbox) {
  height: 42px;
}
</style>
