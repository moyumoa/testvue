<template>
  <div class="set_function" :style="isHideTopMenu ? 'min-height:calc(100vh - 65px)' : ''">
    <div class="container">
      <div class="subtitle" v-if="false">开启后，系统自动将客户推送给员工跟进</div>
      <div
        class="module-wrapper"
        :class="{ 'module-wrapper__active': clickValue === item.key }"
        v-for="item in moduleList"
        :key="item.name"
        @click="changeType(item)"
      >
        <div class="title">
          {{ item.name }}
          <span class="active" v-if="item.key === currentValue">
            <el-icon><i-circle-check-filled /></el-icon>
            已启动
          </span>
        </div>
        <div class="tips">{{ item.tips }}</div>
        <!--        <div class="btn btn-inactive" v-if="item.key === currentValue">当前分配方式</div>-->
        <!--        <el-button type="primary" class="btn" v-else @click="setRule(item)">-->
        <!--          使用该分配规则-->
        <!--        </el-button>-->
      </div>
    </div>

    <div class="tip_box_area tip_box_area1" v-if="clickValue === 2">
      <div class="tip_box_title">自动分配规则解读</div>
      <div class="tip_box_title_text">
        1.客户被获取后会自动分配给来源抖音号的运营者，运营者可在小程序上用该抖音号进行私信和回评
        <br />
        2.无法进行自动分配的客户可手动进行分配
      </div>
      <div class="tip">
        <span class="tip_red">请注意:</span>
        分配到的员工在小程序上会使用来源抖音号进行私信和回评，请确保已获得来源抖音号的运营者的授权！
      </div>
    </div>

    <div class="choose_switch" v-if="false">
      <div class="choose_switch_title">
        跨区域留资分配
        <el-switch
          style="height: 22px; margin-left: 12px"
          v-model="switchVal"
          inline-prompt
          :width="45"
          active-text="开"
          inactive-text="关"
          @click="changSwitch"
        ></el-switch>
      </div>
      <div class="choose_switch_text" style="color: #303133">分配规则：</div>
      <div class="choose_switch_text">
        1.按照多出多进规则
        <br />
        根据员工贡献的异地客户数量为其分配相应数量的本地客户
      </div>
      <div class="choose_switch_text">
        2.按照金币数和任务参与率排行
        <br />
        根据员工上个自然月金币数和任务参与率综合排名按顺序分配
      </div>
    </div>

    <div class="tip_box_area tip_box_area2" v-if="clickValue === 0">
      <div class="tip_box_title">手动分配规则解读</div>
      <div class="tip_box_title_text">客户完全依赖管理员在后台进行手动分配</div>
      <div class="tip">
        <span class="tip_red">请注意:</span>
        分配到的员工在小程序上会使用来源抖音号进行私信和回评，请确保已获得来源抖音号的运营者的授权！
      </div>
    </div>
    <!--    v-if="item.key === currentValue"-->
    <div class="button_class_list">
      <div class="btn btn-inactive" v-if="tpyeInfo?.key === currentValue">当前分配方式</div>
      <el-button type="primary" class="btn" v-else @click="setRule(tpyeInfo)">
        使用该分配规则
      </el-button>
    </div>

    <!--        <div class="tip_box" v-if="[2, 1].indexOf(clickValue) !== -1">-->
    <!--          <div class="tips_1">-->
    <!--            为保证员工能够更高效的跟进潜客，建议开启“评论＋关键词自动触达用户”的互动策略-->
    <!--          </div>-->
    <!--          <div class="setting_but">-->
    <!--            <span class="go_setting" @click="goSetting">前往设置</span>-->
    <!--            <span class="open_setting" @click="allOpen">一键开启</span>-->
    <!--          </div>-->
    <!--          &lt;!&ndash; 提示 &ndash;&gt;-->
    <!--          <div class="tip_position">-->
    <!--            <el-popover effect="dark" :width="292" placement="right-start" popper-style="tip_popper">-->
    <!--              <template #reference>-->
    <!--                <img-->
    <!--                  style="width: 16px; height: 16px"-->
    <!--                  src="https://tagvv-1256030678.file.myqcloud.com/20221128i71r1.png"-->
    <!--                />-->
    <!--              </template>-->
    <!--              <template #default>-->
    <!--                <div>-->
    <!--                  <div-->
    <!--                    style="-->
    <!--                      font-size: 12px;-->
    <!--                      font-family: PingFangSC-Regular, PingFang SC;-->
    <!--                      font-weight: 400;-->
    <!--                      color: rgba(255, 255, 255, 0.8);-->
    <!--                      line-height: 18px;-->
    <!--                    "-->
    <!--                  >-->
    <!--                    互动策略开启后，可在消息列表直接搜索昵称-->
    <!--                  </div>-->

    <!--                  <div style="margin-top: 12px" v-for="(item, index) in tipList" :key="index">-->
    <!--                    <div-->
    <!--                      style="-->
    <!--                        font-size: 12px;-->
    <!--                        font-family: PingFangSC-Regular, PingFang SC;-->
    <!--                        font-weight: 400;-->
    <!--                        color: rgba(255, 255, 255, 0.8);-->
    <!--                        line-height: 18px;-->
    <!--                      "-->
    <!--                    >-->
    <!--                      {{ item.tip_title }}-->
    <!--                    </div>-->
    <!--                    <img-->
    <!--                      style="width: 100%; object-fit: cover; margin-top: 4px"-->
    <!--                      :src="item.tip_img"-->
    <!--                      alt-->
    <!--                    />-->
    <!--                  </div>-->
    <!--                </div>-->
    <!--              </template>-->
    <!--            </el-popover>-->
    <!--          </div>-->
    <!--        </div>-->
  </div>
</template>

<script setup>
import { getCustomerSetting, setClueDispatch } from '@/api/scrm/customer.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useStore } from 'vuex'
const store = useStore()
const isHideTopMenu = store.getters.isHideTopMenu
// import { useRouter } from 'vue-router'
// import { throttle } from '@/utils/tools.js'

// const $router = useRouter()

// function goSetting() {
//   $router.push({
//     path: '/scrm/message_policy',
//     query: {
//       openId: ''
//     }
//   })
// }

// const allOpen = throttle(() => {
//   oneKeyOpen({ type: 1 }).then(res => {
//     if (res.code === 0) {
//       $router.push({
//         path: '/scrm/message_policy'
//       })
//       ElMessage.success('开启成功')
//     } else {
//       ElMessage.error('操作失败')
//     }
//   })
// }, 2000)
// const tipList = [
//   {
//     id: 1,
//     tip_title: '① 打开抖音，进入“消息”菜单，点击搜索',
//     tip_img: 'https://tagvv-1256030678.file.myqcloud.com/20221128w44gn.png'
//   },
//   {
//     id: 2,
//     tip_title: '② 长按搜索框，复制昵称',
//     tip_img: 'https://tagvv-1256030678.file.myqcloud.com/202211281e2if.png'
//   },
//   {
//     id: 3,
//     tip_title: '③ 点击“发私信”跟进',
//     tip_img: 'https://tagvv-1256030678.file.myqcloud.com/20221128mmm6x.png'
//   }
// ]
const switchVal = ref(false)
const moduleList = ref([
  {
    name: '自动分配',
    tips: '按照系统默认规则自动分配所有客户',
    confirmText: '确认使用自动分配规则分配客户？',
    key: 2
  },
  {
    name: '手动分配',
    tips: '完全以手动分配为准，分配效率较低',
    confirmText: '确认手动分配客户？',
    key: 0
  }
])
const clickValue = ref(-1)
const currentValue = ref(-1)
const getSetting = () => {
  getCustomerSetting({ type: 3 }).then(res => {
    if (res.code === 0) {
      // 0 1 都是手动分配 2是自动分配
      const data = res.data ? (res.data === 1 ? 0 : res.data) : 0
      const temp = moduleList.value.find(item => item.key === data)
      console.log('temp', temp, res?.data, data)
      currentValue.value = typeof temp === 'undefined' ? -1 : temp.key
      clickValue.value = currentValue.value
      changeType(temp)
    }
  })
}
getSetting()

// 获取跨区域留资的开关
const getSwitchSetting = () => {
  getCustomerSetting({ type: 32 }).then(res => {
    if (res.code === 0) {
      if (res.data === 1) {
        switchVal.value = true
      } else {
        switchVal.value = false
      }
    }
  })
}
getSwitchSetting()

const setRule = item => {
  ElMessageBox.confirm(item.confirmText, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(res => {
    setClueDispatch({
      type: 3,
      val: item.key
    }).then(res => {
      if (res?.code === 0) {
        getSetting()
        ElMessage.success('分配规则修改成功')
      }
    })
  })
}

const tpyeInfo = ref(null)
function changeType(val) {
  clickValue.value = val.key
  tpyeInfo.value = val
}

function changSwitch() {
  let type
  let tip
  if (switchVal.value) {
    type = 1
    tip = '确定启用跨区域留资功能？'
  } else {
    type = 0
    tip = '确定关闭跨区域留资功能？'
  }
  ElMessageBox.confirm(tip, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
    .then(res => {
      setClueDispatch({
        type: 32,
        val: type
      }).then(res => {
        if (res?.code === 0) {
          getSwitchSetting()
          ElMessage.success('修改成功')
        }
      })
    })
    .catch(() => {
      switchVal.value = !switchVal.value
      console.log('点击了取消按钮')
    })
}
</script>

<style lang="scss" scoped>
.set_function {
  min-height: calc(100vh - 180px);
  background: #ffffff;
  border-radius: 4px;

  .container {
    padding: 20px 24px;
    font-size: 14px;
    color: #606266;
    display: flex;

    .module-wrapper {
      cursor: pointer;
      margin-right: 16px;
      box-sizing: border-box;
      padding: 16px;
      width: 280px;
      border-radius: 2px;
      border: 1px solid #dcdee0;
      display: flex;
      flex-direction: column;

      .title {
        font-size: 14px;
        font-weight: bold;
        color: #303133;
        display: flex;
        height: 20px;
        line-height: 20px;
        align-items: center;

        .active {
          margin-left: 7px;
          box-sizing: border-box;
          font-size: 12px;
          color: #00aa2f;
          padding: 0 7px;
          width: 64px;
          background-color: #edfbf1;
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
      }

      .tips {
        margin-top: 12px;
        font-size: 12px;
        font-weight: 400;
        color: #909399;
      }

      .btn {
        width: 122px;
        height: 32px;
        padding: 0;
        margin-top: 24px;
        text-align: center;
        line-height: 32px;
        align-self: flex-end;
      }

      .btn-inactive {
        cursor: not-allowed;
        color: #bfc4cd;
        background-color: #f7f8fa;
        border: 1px solid #ebedf0;
        border-radius: 2px;
      }
    }

    .module-wrapper__active {
      border: 1px solid #364fcd;
    }
  }

  .tip_box {
    margin: 0 0 0 24px;
    background: #f6f8fa;
    border-radius: 4px;
    padding: 12px 36px 12px 12px;
    width: 368px;
    position: relative;

    .tip_position {
      position: absolute;
      top: 8px;
      right: 8px;
    }

    :deep(.tip_popper) {
      padding: 12px;
      background: rgba(0, 0, 0, 0.8);
      border-radius: 4px;
    }

    .tips_1 {
      font-size: 14px;
      font-weight: 400;
      color: #606266;
      line-height: 20px;
    }

    .setting_but {
      margin-top: 8px;
      font-weight: 400;
      line-height: 20px;

      .go_setting {
        cursor: pointer;
        color: #364fcd;
      }

      .open_setting {
        cursor: pointer;
        color: #606266;
        margin-left: 12px;
      }
    }
  }
}
.tip_box_area1 {
  &::before {
    position: absolute;
    left: 16px;
    top: -20px;
    content: ' ';
    width: 0px;
    height: 0px;
    border: 10px solid transparent; /*以下四个样式对应四种三角形，任选其一即可实现*/
    /* border-top-color:lightseagreen; */
    /* border-left-color:lightseagreen; */
    /* border-right-color:lightseagreen; */
    border-bottom-color: #f6f8fa;
  }
}
.tip_box_area2 {
  &::before {
    position: absolute;
    left: 312px;
    top: -20px;
    content: ' ';
    width: 0px;
    height: 0px;
    border: 10px solid transparent; /*以下四个样式对应四种三角形，任选其一即可实现*/
    /* border-top-color:lightseagreen; */
    /* border-left-color:lightseagreen; */
    /* border-right-color:lightseagreen; */
    border-bottom-color: #f6f8fa;
  }
}
.tip_box_area {
  width: calc(100% - 48px);
  background: #f6f8fa;
  border-radius: 4px;
  padding: 16px;
  margin-left: 24px;
  position: relative;

  .tip_box_title {
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 600;
    color: #303133;
    line-height: 20px;
  }

  .tip_box_title_text {
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #606266;
    margin: 8px 0px;
    line-height: 20px;
  }

  .tip {
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #909399;
    line-height: 20px;

    .tip_red {
      // color: #d40000;
      font-size: 14px;
    }
  }
}
.choose_switch {
  margin-left: 24px;
  width: calc(100% - 48px);
  padding: 4px 16px 8px;
  border-radius: 4px;
  background: #f6f8fa;
  .choose_switch_title {
    height: 22px;
    font-size: 16px;
    font-family: PingFangSC-Semibold, PingFang SC;
    font-weight: 600;
    color: #303133;
    line-height: 22px;
    // margin-top: 20px;
    margin-bottom: 12px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
  .choose_switch_text {
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #606266;
    line-height: 20px;
    margin-bottom: 8px;
  }
}
.button_class_list {
  width: 100%;
  text-align: center;
  background: #ffffff;
  box-shadow: 0px 0px 7px 0px rgba(224, 224, 224, 0.5);
  border-radius: 0px 0px 4px 4px;
  height: 56px;
  line-height: 56px;
  //padding: 12px 0px;
  position: absolute;
  bottom: 0px;
  .btn {
    width: 122px;
    height: 32px;
    padding: 0;
    margin: auto;
    text-align: center;
    line-height: 32px;
  }

  .btn-inactive {
    cursor: not-allowed;
    color: #bfc4cd;
    background-color: #f7f8fa;
    border: 1px solid #ebedf0;
    border-radius: 2px;
    margin-top: 12px;
  }
}
</style>
