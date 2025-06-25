<template>
  <div class="diy_nav">
    <div class="nav_main">
      <div class="phone_view">
        <img
          class="phone_header"
          :style="{
            backgroundColor: navBarInfo.bgColor
          }"
          src="@/assets/images/diy/nav_header.png"
          alt=""
        />
        <span class="title" :style="{ color: navBarInfo.titleColor === 0 ? '#000' : '#fff' }">
          标题
        </span>
        <div
          class="tabbar"
          :style="{
            backgroundColor: tabbarInfo.bgColor,
            borderTop: `1px solid ${tabbarInfo.lineColor}`
          }"
        >
          <draggable
            v-model="tabbarInfo.navList"
            group="people"
            @start="drag = true"
            @end="drag = false"
            item-key="key"
            filter=".forbid"
            :move="onMove"
            style="display: flex; width: 100%"
          >
            <template #item="{ element, index }">
              <div
                class="tabbar_item"
                :class="{ forbid: element.default }"
                :style="{ width: 100 / tabbarInfo.navList.length + '%' }"
                @click="toggleTabbar(index)"
              >
                <i
                  :class="[
                    'item_icon',
                    'iconfont',
                    `icon-${
                      element.icon +
                      (tabbarInfo.currentNav === index ? '_xuanzhong' : '_weixuanzhong')
                    }`
                  ]"
                  :style="{ color: tabbarInfo.currentNav === index ? element.color : '#2F363F' }"
                ></i>
                <span
                  class="item_text"
                  :style="{
                    color:
                      tabbarInfo.currentNav === index
                        ? tabbarInfo.selectedTextColor
                        : tabbarInfo.textColor
                  }"
                >
                  {{ element.name }}
                </span>
              </div>
            </template>
          </draggable>
        </div>
      </div>
    </div>
    <config-setting text="修改后，需要小程序版本更新后才会生效" @save="onSave">
      <div class="nav_config">
        <p class="config_title">小程序导航</p>
        <el-tabs v-model="activeName">
          <el-tab-pane label="顶部导航" name="first">
            <div class="basic_setting">基础设置</div>
            <div class="config_item">
              <p class="label">导航栏背景色</p>
              <div class="content">
                <colorPicker v-model:color="navBarInfo.bgColor" hideAlpha />
              </div>
            </div>
            <div class="config_item">
              <p class="label">标题颜色</p>
              <div class="content">
                <el-radio-group v-model="navBarInfo.titleColor">
                  <el-radio :label="0">黑色</el-radio>
                  <el-radio :label="1">白色</el-radio>
                </el-radio-group>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="底部导航" name="second">
            <div class="basic_setting">基础设置</div>
            <div class="config_item">
              <p class="label">导航栏背景色</p>
              <div class="content">
                <colorPicker v-model:color="tabbarInfo.bgColor" hideAlpha />
              </div>
            </div>
            <div class="config_item">
              <p class="label">分割线颜色</p>
              <div class="content">
                <!-- <colorPicker v-model:color="tabbarInfo.lineColor" hideAlpha /> -->
                <el-radio-group v-model="tabbarInfo.lineColor">
                  <el-radio label="black">黑色</el-radio>
                  <el-radio label="white">白色</el-radio>
                </el-radio-group>
              </div>
            </div>
            <div class="config_item">
              <p class="label">文字默认颜色</p>
              <div class="content">
                <colorPicker v-model:color="tabbarInfo.textColor" hideAlpha />
              </div>
            </div>
            <div class="config_item">
              <p class="label">文字选中颜色</p>
              <div class="content">
                <colorPicker v-model:color="tabbarInfo.selectedTextColor" hideAlpha />
              </div>
            </div>
            <div class="underline"></div>
            <div class="nav_card">
              <draggable
                v-model="tabbarInfo.navList"
                group="people"
                @start="drag = true"
                @end="onEnd"
                item-key="key"
                :move="onMove"
              >
                <template #item="{ element, index }">
                  <div class="card_item">
                    <div class="card_header">
                      <img src="@/assets/images/diy/point.png" alt="" />
                      <span>底部导航{{ num[index + 1] }}</span>
                    </div>
                    <div class="card_main">
                      <div class="input_item">
                        <div class="label">导航名称</div>
                        <div class="content">
                          <el-input
                            v-model="element.name"
                            placeholder="请输入导航名称"
                            style="width: 150px"
                            maxlength="4"
                          />
                        </div>
                      </div>
                      <div class="input_item">
                        <div class="label">设置链接</div>
                        <div class="content">
                          <div class="link_wrapper">
                            <template v-if="element.default !== true">
                              <div class="link line-hidden1" style="height: 26px; width: 150px">
                                <span>{{ element.link }}</span>
                              </div>
                              <span
                                style="color: #364fcd; cursor: pointer"
                                @click="update(index, 1)"
                              >
                                修改
                              </span>
                            </template>
                            <template v-else>
                              <div class="link">
                                <span>{{ element.link }}</span>
                              </div>
                            </template>
                          </div>
                        </div>
                      </div>
                      <div class="input_item" style="align-items: flex-start">
                        <div class="label">图标</div>
                        <div class="content">
                          <div class="icon">
                            <p>要求：不大于128*100像素，支持PNG格式</p>
                            <div class="btns">
                              <div class="btn_item" @click="update(index, 0)">
                                <div class="box">
                                  <i
                                    :class="['iconfont', `icon-${element.icon}_weixuanzhong`]"
                                    style="font-size: 20px"
                                  ></i>
                                  <span>更换图片</span>
                                </div>
                                <span>未选中</span>
                              </div>
                              <div class="btn_item" @click="update(index, 0)">
                                <div class="box">
                                  <i
                                    :class="['iconfont', `icon-${element.icon}_xuanzhong`]"
                                    :style="{ color: element.color, fontSize: '20px' }"
                                  ></i>
                                  <span>更换图片</span>
                                </div>
                                <span>已选中</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <img
                      @click="delNav(index)"
                      v-if="element.default !== true"
                      class="del"
                      src="@/assets/images/diy/del2.png"
                      alt=""
                    />
                  </div>
                </template>
              </draggable>
              <div class="add_btn" v-if="tabbarInfo.navList.length < 5" @click="addNav">
                <img src="@/assets/images/diy/add.png" alt="" />
                <span>添加底部导航</span>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </config-setting>
    <chooseModal v-if="modal.show" :modal="modal" @upLink="upLink" />
    <icon-dialog v-if="modal.iconShow" :modal="modal" @select="selectIcon" />
  </div>
</template>

<script setup>
import { useNav } from './model/use_nav'
import ConfigSetting from './config_setting.vue'
import ColorPicker from '../page_decorate/components/color_picker/color_picker.vue'
import draggable from 'vuedraggable'
import ChooseModal from '@/views/operation/components/choose_modal/choose_modal.vue'
import IconDialog from './components/nav/icon_dialog.vue'
const drag = ref(false)
defineComponent(draggable)
const {
  navBarInfo,
  tabbarInfo,
  copyNav,
  copyTab,
  modal,
  update,
  upLink,
  addNav,
  toggleTabbar,
  delNav,
  selectIcon,
  onSave
} = useNav()
const activeName = ref('first')

const num = reactive({
  1: '一',
  2: '二',
  3: '三',
  4: '四',
  5: '五'
})
// 禁止拖动首页
const onMove = e => {
  return !e.relatedContext.element.default
}
const onEnd = e => {
  if (e.oldIndex === 0) {
    tabbarInfo.value.navList.unshift(tabbarInfo.value.navList[e.newIndex])
    tabbarInfo.value.navList.splice(e.newIndex + 1, 1)
  }
  drag.value = false
}

// 是否修改
const emits = defineEmits(['edit'])
watch(
  navBarInfo,
  val => {
    emits('edit', JSON.stringify(val) !== copyNav.value)
  },
  { deep: true }
)
watch(
  tabbarInfo,
  val => {
    emits('edit', JSON.stringify(val) !== copyTab.value)
  },
  { deep: true }
)
</script>

<style lang="scss" scoped>
* {
  box-sizing: border-box;
}
div::-webkit-scrollbar {
  width: 0;
  /**/
}
.diy_nav {
  display: flex;
  height: 100%;
  .nav_main {
    background-color: #f6f8fa;
    flex: 1;
    min-width: 400px;
    overflow-y: auto;
    padding: 40px 0;
    .phone_view {
      margin: 0 auto;
      width: 375px;
      height: 701px;
      background: #f2f2f2;
      box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
      position: relative;
      .phone_header {
        background-color: #fff;
        padding-bottom: 7px;
        width: 100%;
      }
      .title {
        position: absolute;
        top: 50px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 16px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #1f2329;
        line-height: 22px;
      }
      .tabbar {
        border-top: 1px solid #ececec;
        background-color: #fff;
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        display: flex;
        &_item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 7px 0;
          cursor: pointer;
          > .item_icon {
            font-size: 17px;
          }
          > .item_text {
            display: inline-block;
            width: 100px;
            text-align: center;
            margin-top: 3px;
            line-height: 14px;
            font-size: 20px;
            transform: scale(0.5);
          }
        }
      }
    }
  }
  .nav_config {
    .basic_setting {
      font-size: 16px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #323233;
      line-height: 20px;
      margin-bottom: 22px;
    }
    .underline {
      border-top: 1px solid #e8e8e8;
      margin-bottom: 4px;
    }
    .nav_card {
      padding: 16px 6px;
      .card_item {
        box-shadow: 0px 1px 6px 0px rgba(0, 0, 0, 0.1);
        margin-bottom: 16px;
        position: relative;
        &:hover {
          .del {
            display: block;
          }
        }
        .card_header {
          padding: 13px 12px;
          background-color: #f6f8fa;
          display: flex;
          align-items: center;
          > img {
            width: 14px;
            height: 14px;
          }
          > span {
            font-family: PingFangSC-Medium, PingFang SC;
            font-weight: 500;
            color: #323233;
            line-height: 20px;
            margin-left: 6px;
          }
        }
        .card_main {
          padding: 12px 16px;
          .input_item {
            display: flex;
            align-items: center;
            margin-bottom: 16px;
            .label {
              width: 60px;
              margin-right: 14px;
            }
            .content {
              flex: 1;
              .link_wrapper {
                display: flex;
                align-items: center;
                cursor: default;
                > .link {
                  background: rgba(54, 79, 205, 0.1);
                  border-radius: 2px;
                  border: 1px solid #364fcd;
                  padding: 0 14px;
                  margin-right: 8px;
                  > span {
                    font-size: 12px;
                    font-family: PingFangSC-Regular, PingFang SC;
                    color: #364fcd;
                    line-height: 24px;
                  }
                }
              }
              .icon {
                > p {
                  font-size: 12px;
                  color: #909399;
                  line-height: 17px;
                  margin-bottom: 10px;
                }
                > .btns {
                  display: flex;
                  .btn_item {
                    text-align: center;
                    margin-right: 20px;
                    > .box {
                      cursor: pointer;
                      width: 64px;
                      height: 64px;
                      background: #f1f4f6;
                      border: 1px solid #e8e8e8;
                      display: flex;
                      flex-direction: column;
                      justify-content: flex-end;
                      margin-bottom: 6px;
                      > span {
                        font-size: 12px;
                        font-family: PingFangSC-Regular, PingFang SC;
                        font-weight: 400;
                        color: #ffffff;
                        line-height: 17px;
                        background-color: rgba(0, 0, 0, 0.4);
                        padding: 1px 0 2px 0;
                        margin-top: 5px;
                      }
                    }
                    > span {
                      font-size: 12px;
                      font-family: PingFangSC-Regular, PingFang SC;
                      color: #606266;
                      line-height: 17px;
                    }
                  }
                }
              }
            }
          }
        }
        .del {
          position: absolute;
          right: 12px;
          top: 12px;
          width: 16px;
          height: 16px;
          cursor: pointer;
          display: none;
        }
      }
      .add_btn {
        box-shadow: 0px 1px 6px 0px rgba(0, 0, 0, 0.1);
        padding: 16px 0;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        > img {
          width: 14px;
          height: 14px;
          margin-right: 14px;
        }
        span {
          font-family: PingFangSC-Regular, PingFang SC;
          color: #364fcd;
          line-height: 20px;
          letter-spacing: 1px;
        }
      }
    }

    :deep(.el-tabs__nav) {
      width: 100%;
      .el-tabs__item {
        width: 50%;
        text-align: center;
        padding: 15px 60px;
      }
    }
  }
}
</style>
