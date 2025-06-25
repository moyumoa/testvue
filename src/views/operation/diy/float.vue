<template>
  <div class="diy_float">
    <div class="float_main">
      <div class="phone_view">
        <img class="phone_header" src="@/assets/images/diy/phone_header.png" alt="" />
        <div class="float-windows">
          <div
            class="live-group"
            :class="[
              {
                'live-group-more float-item': liveList.length > 2
              }
            ]"
          >
            <template v-if="liveList.length < 3">
              <div
                v-for="(item, index) in liveList"
                class="float-item"
                :key="index"
                :style="{
                  'background-image': `url(${item.photo})`
                }"
              ></div>
            </template>
            <template v-if="liveList.length > 2">
              <div
                v-if="liveList.length >= 4"
                class="live-item live-first-item float-item"
                :style="{
                  'background-image': `url(${liveList[0].photo})`
                }"
              ></div>
              <div
                class="shrink float-item live-item"
                @click="hideWindow"
                v-if="liveList.length >= 3 && showAll"
              ></div>
              <div
                class="stretch float-item live-item"
                @click="showWindow"
                v-if="liveList.length >= 3 && !showAll"
              ></div>
              <!-- 1-3个时 -->
              <template v-if="liveList.length < 4">
                <div
                  v-for="(item, index) in liveList"
                  class="live-item float-item"
                  :key="index"
                  :style="{
                    'background-image': `url(${item.photo})`,
                    transform: `translateY(${
                      showAll ? (44 + 8) * (index - liveList.length) : index == 0 ? -52 : 0
                    }px)`
                  }"
                ></div>
              </template>
              <template v-if="liveList.length >= 4">
                <div
                  class="more-window-box"
                  :style="{
                    transform: showAll ? 'scale(1)' : 'scale(0)',
                    'overflow-y': liveList.length > 7 ? 'auto' : 'hidden'
                  }"
                >
                  <template v-for="(item, index) in liveList">
                    <div
                      v-if="index > 0"
                      class="live-item float-item"
                      :key="index"
                      :style="{
                        'background-image': `url(${item.photo})`
                      }"
                    ></div>
                  </template>
                </div>
              </template>
            </template>
          </div>
          <div class="jump-group float-group">
            <div
              class="jump-item float-item"
              :style="{
                'background-image': `url(${linkPageInfo.photo})`
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>
    <config-setting @save="onSave">
      <div class="float_config">
        <p class="config_title">悬浮窗</p>
        <div class="config_item">
          <p class="label">是否启用悬浮窗</p>
          <div class="content">
            <el-switch
              v-model="configInfo.isUse"
              inline-prompt
              active-text="开"
              inactive-text="关"
            />
          </div>
        </div>
        <el-tabs v-model="activeName">
          <el-tab-pane label="内容设置" name="first">
            <div class="float_card">
              <p class="config_title" style="font-size: 16px">直播间窗口</p>
              <draggable
                v-model="liveList"
                group="people"
                @start="drag = true"
                @end="drag = false"
                item-key="name"
              >
                <template #item="{ element, index }">
                  <div class="card_item">
                    <div class="card_header">
                      <img src="@/assets/images/diy/point.png" alt="" />
                      <span>直播间{{ index > 0 ? index + 1 : '' }}</span>
                    </div>
                    <div class="card_main">
                      <div class="input_item" style="align-items: flex-start">
                        <div class="label" style="width: 40px">图标</div>
                        <div class="content">
                          <div class="icon">
                            <div class="btns">
                              <el-upload
                                :action="uploadUrl"
                                :headers="headers"
                                accept="image/jpeg, image/jpg, image/png"
                                :on-success="handleSuccess"
                                :show-file-list="false"
                              >
                                <div class="btn_item" @click="upload(index)">
                                  <div class="box">
                                    <img
                                      v-if="element.photo"
                                      class="img"
                                      :src="element.photo"
                                      alt=""
                                    />
                                    <span>更换图片</span>
                                  </div>
                                </div>
                              </el-upload>
                            </div>
                            <p>建议用50*50像素的圆形png图片</p>
                          </div>
                        </div>
                      </div>
                      <div class="input_item">
                        <div class="label">抖音号昵称</div>
                        <div class="content">
                          <el-select
                            filterable
                            v-model="element.name"
                            placeholder="请选择抖音号昵称"
                            @blur="onBlur(index, $event)"
                            @change="onChange(index, $event)"
                            style="width: 220px"
                          >
                            <el-option
                              v-for="item in nameList"
                              :key="item.id"
                              :label="item.name"
                              :value="item.name"
                            ></el-option>
                          </el-select>
                        </div>
                      </div>
                      <div class="input_item">
                        <div class="label">主播UID</div>
                        <div class="content">
                          <el-input
                            v-model.number="element.uid"
                            placeholder="请输入主播UID"
                            style="width: 220px"
                          />
                        </div>
                      </div>
                      <a
                        href="http://applet-1256030678.cos.ap-chengdu.myqcloud.com/202011271343348f18680b13.jpg"
                        style="text-align: right; color: #364fcd; display: block"
                        target="_blank"
                      >
                        如何获取主播UID
                      </a>
                    </div>
                    <img
                      class="del"
                      src="@/assets/images/diy/del2.png"
                      alt=""
                      @click="delLive(index)"
                    />
                  </div>
                </template>
              </draggable>
              <p class="tip">C端仅显示正在直播的直播间窗口</p>
              <div class="add_btn" @click="addLive">
                <img src="@/assets/images/diy/add.png" alt="" />
                <span>添加直播间窗口</span>
              </div>
              <p
                class="config_title"
                style="
                  font-size: 16px;
                  border-top: 1px solid #e8e8e8;
                  padding-top: 20px;
                  margin-top: 20px;
                "
              >
                跳转窗口
              </p>
              <div class="card_item">
                <div class="card_header">
                  <img src="@/assets/images/diy/point.png" alt="" />
                  <span>跳转页面</span>
                </div>
                <div class="card_main">
                  <div class="input_item" style="align-items: flex-start">
                    <div class="label" style="width: 40px">图标</div>
                    <div class="content">
                      <div class="icon">
                        <div class="btns">
                          <el-upload
                            :action="uploadUrl"
                            :headers="headers"
                            accept="image/jpeg, image/jpg, image/png"
                            :on-success="handleSuccess2"
                            :show-file-list="false"
                          >
                            <div class="btn_item">
                              <div class="box">
                                <img class="img" :src="linkPageInfo.photo" alt="" />
                                <span>更换图片</span>
                              </div>
                            </div>
                          </el-upload>
                        </div>
                        <p>建议用50*50像素的圆形png图片</p>
                      </div>
                    </div>
                  </div>
                  <div class="input_item">
                    <div class="label" style="width: 40px">链接</div>
                    <div class="content">
                      <div v-if="linkPageInfo.link" class="link line-hidden1">
                        <span>{{ linkPageInfo.link }}</span>
                        <i class="iconfont icon-close" @click="delLink"></i>
                      </div>
                      <el-button v-else type="primary" @click="addLink">设置链接</el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="启用页面" name="second">
            <div class="page">
              <div class="config_item">
                <p class="label">所有页面</p>
                <div class="content">
                  <span></span>
                  <el-checkbox v-model="configInfo.checkAll" @change="onCheckAll"></el-checkbox>
                </div>
              </div>
              <template v-for="(item, index) in configInfo.checkList" :key="index">
                <div class="config_item">
                  <p class="label">{{ item.label }}</p>
                  <div class="content">
                    <span>{{ item.value ? '应用' : '未应用' }}</span>
                    <el-checkbox v-model="item.value" size="large" @change="onCheck" />
                  </div>
                </div>
              </template>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </config-setting>
    <choose-modal v-if="modal.show" :modal="modal" @upLink="upLink" />
  </div>
</template>

<script setup>
import draggable from 'vuedraggable'
import ConfigSetting from './config_setting.vue'
import { useFloat } from './model/use_float.js'
import ChooseModal from '@/views/operation/components/choose_modal/choose_modal.vue'
defineComponent(draggable)
const {
  copyConfig,
  copyLink,
  copyLive,
  nameList,
  configInfo,
  liveList,
  linkPageInfo,
  modal,
  delLink,
  addLink,
  upLink,
  onSave,
  delLive,
  addLive
} = useFloat()
const activeName = ref('first')
const drag = ref(false)
const current = ref(0)
// 上传图片
const uploadUrl = ref('/api/v1/system/account/uploadImage')
const headers = ref({
  'X-Requested-With': 'XMLHttpRequest',
  token: localStorage.getItem('token')
})
const handleSuccess = res => {
  if (res.data) {
    liveList.value[current.value].photo = res.data
  }
}
const handleSuccess2 = res => {
  if (res.data) {
    linkPageInfo.value.photo = res.data
  }
}
const upload = index => {
  current.value = index
}
// 弹框
const showAll = ref(false)
const hideWindow = () => {
  showAll.value = false
}
const showWindow = () => {
  showAll.value = true
}

// 昵称输入选择框
const onBlur = (index, e) => {
  if (e.target.value) {
    liveList.value[index].name = e.target.value
  }
}
const onChange = (index, e) => {
  const temp = nameList.value.find(i => i.name === e)
  liveList.value[index].uid = temp.uid || ''
  liveList.value[index].photo = temp.phone || ''
}
// 全选
const onCheckAll = val => {
  configInfo.value.checkList.forEach(ele => {
    ele.value = val
  })
}
const onCheck = val => {
  const temp = configInfo.value.checkList.map(i => i.value)
  if (temp.indexOf(false) === -1) {
    configInfo.value.checkAll = true
  } else {
    configInfo.value.checkAll = false
  }
}

// 是否修改
const emits = defineEmits(['edit'])
watch(
  liveList,
  val => {
    emits('edit', JSON.stringify(val) !== copyLive.value)
  },
  { deep: true }
)
watch(
  linkPageInfo,
  val => {
    emits('edit', JSON.stringify(val) !== copyLink.value)
  },
  { deep: true }
)
watch(
  configInfo,
  val => {
    emits('edit', JSON.stringify(val) !== copyConfig.value)
  },
  { deep: true }
)
</script>

<style lang="scss" scoped>
.diy_float {
  display: flex;
  height: 100%;
  .float_main {
    background-color: #f6f8fa;
    flex: 1;
    min-width: 400px;
    overflow-y: auto;
    padding: 40px 0;
    .phone_view {
      margin: 0 auto;
      width: 375px;
      height: 667px;
      background-color: #fff;
      position: relative;
      .phone_header {
        width: 100%;
      }
      .float-windows {
        position: absolute;
        bottom: 34px;
        right: 16px;
        .float-item {
          flex-shrink: 0;
          margin-bottom: 8px;
          width: 44px;
          height: 44px;
          background: #ffffff;
          background-size: cover;
          border-radius: 50%;
          background-repeat: no-repeat;
          box-shadow: 0px 2px 3px 0px rgba(156, 156, 156, 0.5);
        }
        .live-group-more {
          position: relative;
          .live-item {
            position: absolute;
            top: 0;
            left: 0;
            transition: transform 0.3s;
          }
          .live-first-item {
            top: -52px;
          }
          .more-window-box {
            position: absolute;
            left: -234px;
            top: -104px;
            min-width: 204px;
            max-width: 214px;
            height: 129px;
            background: rgba(0, 0, 0, 0.6);
            border-radius: 5px;
            padding: 13px 16px;
            box-sizing: border-box;
            font-size: 0;
            transition: all 0.3s;
            transform-origin: 100% 100%;
            .live-item {
              position: static;
              display: inline-block;
              margin-right: 20px;
              margin-bottom: 16px;
              &:nth-child(3n) {
                margin-right: 0;
              }
            }
          }
        }
        .shrink {
          padding: 5px;
          z-index: 1;
          background-image: url('https://tagvv-1256030678.cos.ap-shanghai.myqcloud.com/img/202105250941145a5d2b61f8.png?imageMogr2/rquality/70/thumbnail/750x1334');
        }
        .stretch {
          padding: 5px;
          z-index: 1;
          background-image: url('https://tagvv-1256030678.cos.ap-shanghai.myqcloud.com/img/20210525094127087da067ab.png?imageMogr2/rquality/70/thumbnail/750x1334');
        }
      }
    }
  }
  .float_config {
    .page {
      .config_item {
        margin-bottom: 0;
        .content {
          padding-left: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          > span {
            font-weight: 500;
            color: #303133;
            line-height: 24px;
          }
        }
      }
    }
    .float_card {
      padding: 0 6px 6px 6px;
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
              color: #909399;
              width: 70px;
              margin-right: 14px;
            }
            .content {
              flex: 1;
              .link {
                display: inline-block;
                max-width: 200px;
                background: rgba(54, 79, 205, 0.1);
                border-radius: 2px;
                border: 1px solid #364fcd;
                font-size: 12px;
                font-family: PingFangSC-Regular, PingFang SC;
                color: #364fcd;
                line-height: 24px;
                padding: 0 28px 0 14px;
                position: relative;
                .iconfont {
                  position: absolute;
                  top: 0;
                  right: 7px;
                  font-size: 12px;
                  margin-left: 16px;
                  cursor: pointer;
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
                      position: relative;
                      > img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                      }
                      > span {
                        position: absolute;
                        width: 100%;
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
      .tip {
        font-size: 12px;
        font-family: PingFangSC-Regular, PingFang SC;
        color: #909399;
        line-height: 17px;
        letter-spacing: 1px;
        margin-bottom: 12px;
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

    :deep(.el-tabs__nav) {
      width: 100%;
      .el-tabs__item {
        width: 50%;
        text-align: center;
        padding: 15px 60px;
        border-top: 1px solid #e8e8e8;
      }
    }
  }
}
</style>
