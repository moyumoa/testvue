<template>
  <div class="diy_brand">
    <div class="brand_main">
      <div class="phone_view">
        <img class="phone_header" src="@/assets/images/diy/brand_header.png" alt="" />
        <div class="card_wrapper">
          <div class="left">
            <template v-for="(item, index) in leftList" :key="index">
              <div
                class="card_item"
                :class="{ list_style: configInfo.listStyle === 2 }"
                :style="{
                  borderRadius: configInfo.borderRadius,
                  boxShadow: configInfo.boxShadow
                }"
              >
                <img class="cover" :src="item.img" alt="" />
                <div class="bottom_content">
                  <div class="desc" style="margin-bottom: 8px">
                    <p class="line-hidden2" :style="{ fontWeight: configInfo.fontWeight }">
                      {{ item.videoTitle }}
                    </p>
                  </div>
                  <div class="live_wrapper">
                    <img class="live_photo" :src="item.phone" alt="" />
                    <p class="live_name line-hidden1">{{ item.name }}</p>
                    <img class="love" src="@/assets/images/diy/love.png" alt="" />
                    <p class="love_num">{{ item.dzCount }}</p>
                  </div>
                </div>
              </div>
            </template>
          </div>
          <div class="right">
            <template v-for="(item, index) in rightList" :key="index">
              <div
                class="card_item"
                :class="{ list_style: configInfo.listStyle === 2 }"
                :style="{
                  borderRadius: configInfo.borderRadius,
                  boxShadow: configInfo.boxShadow
                }"
              >
                <img class="cover" :src="item.img" alt="" />
                <div class="bottom_content">
                  <div class="desc" style="margin-bottom: 8px">
                    <p class="line-hidden2" :style="{ fontWeight: configInfo.fontWeight }">
                      {{ item.videoTitle }}
                    </p>
                  </div>
                  <div class="live_wrapper">
                    <img class="live_photo" :src="item.phone" alt="" />
                    <p class="live_name line-hidden1">{{ item.name }}</p>
                    <img class="love" src="@/assets/images/diy/love.png" alt="" />
                    <p class="love_num">{{ item.dzCount }}</p>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
    <config-setting @save="onSave">
      <div class="brand_config">
        <p class="config_title">品牌号</p>
        <div class="config_item" style="margin-bottom: 12px">
          <p class="label">添加方式</p>
          <div class="content">
            <el-radio-group v-model="configInfo.saveType" @change="typeChange">
              <el-radio :label="0">手动添加</el-radio>
              <el-radio :label="1">自动添加</el-radio>
            </el-radio-group>
          </div>
        </div>
        <div class="video_wrapper">
          <template v-if="configInfo.saveType === 0">
            <div class="video_list">
              <draggable
                v-model="configInfo.videoList"
                group="people"
                @start="drag = true"
                @end="drag = false"
                item-key="id"
                style="display: flex; flex-wrap: wrap"
              >
                <template #item="{ element, index }">
                  <div class="video_item">
                    <img class="cover" :src="element.img" alt="" />
                    <img
                      class="del"
                      src="@/assets/images/diy/del.png"
                      alt=""
                      @click="delVideo(index)"
                    />
                  </div>
                </template>
                <template #footer>
                  <div class="add_btn flex_center" @click="addVideo">
                    <img src="@/assets/images/diy/add.png" alt="" />
                  </div>
                </template>
              </draggable>
            </div>
            <p class="tip">最多添加30个视频，按照添加顺序排列</p>
          </template>
          <template v-else>
            <div class="video_list account">
              <template v-for="(element, index) in configInfo.accountList" :key="index">
                <div class="video_item">
                  <img class="cover" :src="element.phone" alt="" />
                  <img
                    class="del"
                    src="@/assets/images/diy/del.png"
                    alt=""
                    @click="delVideo(index)"
                  />
                </div>
              </template>
              <div class="add_btn flex_center" @click="addVideo">
                <img src="@/assets/images/diy/add.png" alt="" />
              </div>
            </div>
            <!-- <p class="tip">自动获取按照抖音号的视频点赞数量降序排列</p> -->
          </template>
        </div>
        <div class="config_item">
          <p class="label">列表样式</p>
          <div class="content">
            <g-select :options="dict.listStyle" v-model:value="configInfo.listStyle" />
          </div>
        </div>
        <div class="config_item">
          <p class="label">卡片样式</p>
          <div class="content">
            <g-select :options="dict.kpysList" v-model:value="configInfo.boxShadow" />
          </div>
        </div>
        <div class="config_item">
          <p class="label">卡片倒角</p>
          <div class="content">
            <g-select
              :options="dict.kpdjList"
              v-model:value="configInfo.borderRadius"
              type="icon"
            />
          </div>
        </div>
        <div class="config_item">
          <p class="label">文本样式</p>
          <div class="content">
            <g-select :options="dict.wbysList" v-model:value="configInfo.fontWeight" type="icon" />
          </div>
        </div>
      </div>
    </config-setting>
    <!-- 视频列表 -->
    <videoModal
      v-if="dialogInfo.show"
      :videoForm="dialogInfo"
      @select="selectVideo"
      :list="configInfo.videoList"
    />
    <account-dialog
      v-if="dialogInfo.accountVisible"
      v-model:visible="dialogInfo.accountVisible"
      @select="selectAccount"
      :list="configInfo.accountList"
    />
  </div>
</template>

<script setup>
import videoModal from './components/brand/video_modal.vue'
import AccountDialog from './components/brand/account_dialog.vue'
import ConfigSetting from './config_setting.vue'
import GSelect from '../components/g_select.vue'
import { useBrand } from './model/use_brand'
import draggable from 'vuedraggable'
defineComponent(draggable, videoModal)

const {
  dict,
  configInfo,
  copyData,
  drag,
  dialogInfo,
  addVideo,
  selectVideo,
  selectAccount,
  delVideo,
  typeChange,
  onSave
} = useBrand()

// 是否修改
const emits = defineEmits(['edit'])
watch(
  configInfo,
  val => {
    emits('edit', JSON.stringify(val) !== copyData.value)
  },
  { deep: true }
)

// 展示列表
const leftList = computed(() => {
  return configInfo.videoList.filter((i, index) => index % 2 === 0)
})
const rightList = computed(() => {
  return configInfo.videoList.filter((i, index) => index % 2 !== 0)
})
</script>

<style lang="scss" scoped>
* {
  box-sizing: border-box;
}
/*修改滚动条样式*/
div::-webkit-scrollbar {
  width: 0;
  /**/
}
.diy_brand {
  display: flex;
  height: 100%;
  .brand_main {
    background-color: #f6f8fa;
    flex: 1;
    min-width: 400px;
    overflow-y: auto;
    padding: 40px 0;
    .phone_view {
      margin: 0 auto;
      width: 375px;
      height: 701px;
      background: #f8f9fa;
      box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
      .phone_header {
        background-color: #fff;
        padding-bottom: 7px;
        width: 100%;
      }
      .card_wrapper {
        padding: 10px;
        overflow-y: auto;
        height: calc(100% - 82px);
        display: flex;
        .left,
        .right {
          width: 50%;
        }
        .left {
          margin-right: 4px;
        }
        .card_item {
          margin-bottom: 7px;
          width: 174px;
          overflow: hidden;
          &.list_style {
            .bottom_content {
              position: relative;
              .desc {
                padding: 4px 10px;
                position: absolute;
                top: -50px;
                left: 0;
                width: 100%;
                height: 50px;
                color: #fff;
                background: linear-gradient(180deg, rgba(0, 0, 0, 0) 1%, rgba(0, 0, 0, 0.6) 98%);
              }
            }
          }
          .cover {
            width: 100%;
            height: 232px;
          }
          .bottom_content {
            width: 100%;
            padding: 10px;
            background: #fff;
            .desc {
              width: 100%;
              font-size: 12px;
              font-family: PingFangSC-Medium, PingFang SC;
              color: #303133;
              line-height: 17px;
            }
            .live_wrapper {
              display: flex;
              align-items: center;
              .live_photo {
                width: 20px;
                height: 20px;
                border: 1px solid #979797;
                border-radius: 50%;
              }
              .live_name {
                width: 100px;
                font-size: 12px;
                transform: scale(0.83);
                white-space: nowrap;
                overflow: hidden;
              }
              .love {
                width: 12px;
                height: 11px;
              }
              .love_num {
                font-size: 12px;
                transform: scale(0.83);
              }
            }
          }
        }
      }
    }
  }
  .brand_config {
    .video_wrapper {
      border-top: 1px solid #e8e8e8;
      border-bottom: 1px solid #e8e8e8;
      padding: 24px 0 20px 0;
      margin-bottom: 20px;
      .video_list {
        &.account {
          display: flex;
          flex-wrap: wrap;
          .video_item {
            &:before {
              border-radius: 50%;
            }
            > .cover {
              width: 48px;
              height: 48px;
              border-radius: 50%;
            }
            > .del {
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%);
            }
          }
          .add_btn {
            width: 48px;
            height: 48px;
            border-radius: 50%;
          }
        }
        .video_item {
          margin: 0 14px 14px 0;
          position: relative;
          &:before {
            content: '';
            display: block;
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 4px;
          }
          &:hover {
            &:before {
              background-color: rgba($color: #000000, $alpha: 0.4);
            }
            .del {
              display: block;
            }
          }
          > .cover {
            width: 64px;
            height: 64px;
            border-radius: 4px;
            vertical-align: middle;
          }
          > .del {
            cursor: pointer;
            width: 16px;
            height: 16px;
            position: absolute;
            bottom: 8px;
            right: 8px;
            display: none;
          }
        }
        .add_btn {
          cursor: pointer;
          width: 64px;
          height: 64px;
          border-radius: 4px;
          background: #ffffff;
          box-shadow: 0px 1px 6px 0px rgba(0, 0, 0, 0.1);
          margin-bottom: 14px;
          > img {
            width: 20px;
            height: 20px;
          }
        }
      }
      .tip {
        font-size: 12px;
        color: #909399;
        line-height: 20px;
        margin-top: 2px;
      }
    }
  }
}
</style>
