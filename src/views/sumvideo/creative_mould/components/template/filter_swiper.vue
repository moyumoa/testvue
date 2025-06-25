<template>
  <div>
    <!-- 面部/人物模型 -->
    <div class="faceMould_box" v-if="props.rulesOrigin == 11 || props.rulesOrigin == 12">
      <div
        :class="{
          one_faceMould: true,
          choose_box: item.isChoose && props.filterOrigin === 'staticSearch',
          dynamic_box: props.filterOrigin === 'dynamic'
        }"
        v-for="(item, index) in props.list"
        :key="index"
      >
        <template v-if="props.rulesOrigin == 12">
          <img
            class="material_item_badge"
            v-if="item.source === 6"
            src="https://tagvv-1256030678.file.myqcloud.com/202405134bhlq.png"
            alt="云原料"
          />

          <img class="one_faceMould_cover" :src="item.shadeImg" alt="" />
          <img
            @click="
              previewFun(
                item.videoUrl,
                'digitalVideo',
                '查看人物模型',
                item.shadeImg,
                item.maskPosition
              )
            "
            class="one_faceMould_play"
            src="https://tagvv-1256030678.file.myqcloud.com/20230308mdq3m.png"
            alt=""
          />
        </template>
        <template v-if="props.rulesOrigin == 11">
          <img
            style="cursor: pointer"
            @click="previewFun(item.coverUrl, 'image', '查看面部模型')"
            class="one_faceMould_cover"
            :src="item.coverUrl"
            alt=""
          />
        </template>
        <!-- 静态资源的查找结果  可以有一个选中的操作 -->
        <el-checkbox
          v-if="props.filterOrigin === 'staticSearch'"
          v-model="item.isChoose"
          @change="chooseFun($event, item, index)"
          class="one_faceMould_checkBox"
        ></el-checkbox>
        <!-- 静态资源的选中结果 可以有一个删除的操作-->
        <img
          v-if="props.filterOrigin === 'staticChoose'"
          class="one_faceMould_del"
          src="https://tagvv-1256030678.file.myqcloud.com/20230309ux5hc.png"
          alt=""
          @click="delFun(item, index)"
        />
      </div>
    </div>
    <!-- 文本 -->
    <div class="textElement_box" v-if="props.rulesOrigin == 4">
      <div
        :class="{
          one_textElement: true,
          static_textElement: props.filterOrigin === 'staticSearch',
          choose_box: item.isChoose && props.filterOrigin === 'staticSearch'
        }"
        v-for="(item, index) in props.list"
        :key="index"
      >
        <div class="one_textElement_text">
          {{ item.content || '-' }}
          <img
            class="material_item_badge"
            v-if="item.source === 6"
            src="https://tagvv-1256030678.file.myqcloud.com/202405134bhlq.png"
            alt="云原料"
          />
        </div>
        <!-- 静态资源的查找结果  可以有一个选中的操作 -->
        <el-checkbox
          v-if="props.filterOrigin === 'staticSearch'"
          v-model="item.isChoose"
          @change="chooseFun($event, item, index)"
          class="one_textElement_checkBox"
        ></el-checkbox>
        <!-- 静态资源的选中结果 可以有一个删除的操作-->
        <img
          v-if="props.filterOrigin === 'staticChoose'"
          class="one_faceMould_del"
          src="https://tagvv-1256030678.file.myqcloud.com/20230309ux5hc.png"
          alt=""
          @click="delFun(item, index)"
        />
      </div>
    </div>
    <!-- 视频 / 图片-->
    <div class="faceMould_box" v-if="props.rulesOrigin == 1 || props.rulesOrigin == 2">
      <div
        :class="{
          one_faceMould: true,
          choose_box: item.isChoose && props.filterOrigin === 'staticSearch',
          dynamic_box: props.filterOrigin === 'dynamic'
        }"
        v-for="(item, index) in props.list"
        :key="index"
      >
        <img
          class="material_item_badge"
          v-if="item.source === 6"
          src="https://tagvv-1256030678.file.myqcloud.com/202405134bhlq.png"
          alt="云原料"
        />
        <template v-if="props.rulesOrigin == 1">
          <img class="one_faceMould_cover" :src="item.coverUrl" alt="" />
          <img
            @click="previewFun(item.url, 'video', '查看视频', item.coverUrl)"
            class="one_faceMould_play"
            src="https://tagvv-1256030678.file.myqcloud.com/20230308mdq3m.png"
            alt=""
          />
        </template>
        <template v-if="props.rulesOrigin == 2">
          <img
            style="cursor: pointer"
            @click="previewFun(item.url, 'image', '查看图片')"
            class="one_faceMould_cover"
            :src="item.url"
            alt=""
          />
        </template>
        <!-- 静态资源的查找结果  可以有一个选中的操作 -->
        <el-checkbox
          v-if="props.filterOrigin === 'staticSearch'"
          v-model="item.isChoose"
          @change="chooseFun($event, item, index)"
          class="one_faceMould_checkBox"
        ></el-checkbox>
        <!-- 静态资源的选中结果 可以有一个删除的操作-->
        <img
          v-if="props.filterOrigin === 'staticChoose'"
          class="one_faceMould_del"
          src="https://tagvv-1256030678.file.myqcloud.com/20230309ux5hc.png"
          alt=""
          @click="delFun(item, index)"
        />
      </div>
    </div>
    <!-- 音频 -->
    <div class="textElement_box" v-if="props.rulesOrigin == 3">
      <div
        :class="{
          one_textElement: true,
          static_textElement: props.filterOrigin === 'staticSearch',
          choose_box: item.isChoose && props.filterOrigin === 'staticSearch'
        }"
        v-for="(item, index) in props.list"
        :key="index"
      >
        <div class="one_videoElement_text">
          <img
            class="material_item_badge"
            v-if="item.source === 6"
            src="https://tagvv-1256030678.file.myqcloud.com/202405134bhlq.png"
            alt="云原料"
          />
          <img
            @click="previewFun(item.url, 'audio', '查看音频')"
            class="one_videoElement_cover"
            src="https://tagvv-1256030678.file.myqcloud.com/20230308mdq3m.png"
            alt=""
          />
          <div class="one_videoElement_content">
            <div class="video_title line-hidden1">
              {{ item.name || '-' }}
            </div>
            <div class="video_time">
              {{ item.duration ? secondToDate(item.duration / 1000, '秒', true, true) : '--' }}
            </div>
          </div>
        </div>
        <!-- 静态资源的查找结果  可以有一个选中的操作 -->
        <el-checkbox
          v-if="props.filterOrigin === 'staticSearch'"
          v-model="item.isChoose"
          @change="chooseFun($event, item, index)"
          class="one_textElement_checkBox"
        ></el-checkbox>
        <!-- 静态资源的选中结果 可以有一个删除的操作-->
        <img
          v-if="props.filterOrigin === 'staticChoose'"
          class="one_faceMould_del"
          src="https://tagvv-1256030678.file.myqcloud.com/20230309ux5hc.png"
          alt=""
          @click="delFun(item, index)"
        />
      </div>
    </div>
    <previewDialog v-if="previewInfo.show" :previewDialog="previewInfo"></previewDialog>
  </div>
</template>
<script setup>
import previewDialog from '@/components/preview_dialog/preview_dialog.vue'
import { throttle, secondToDate } from '@/utils/tools.js'
const props = defineProps({
  list: {
    type: Array,
    default: () => {
      return []
    }
  },
  filterOrigin: {
    type: String,
    default: ''
  }, // 筛选结果的来源 dynamic 动态资源 staticSearch 静态资源的查找结果 staticChoose 静态资源的选中结果
  rulesOrigin: {
    type: Number,
    default: null
  } // 规则来源 // 1视频 2图片 3音频 4文本   11面部模型 12 任务模型
})
console.log('list', props.list)
const emits = defineEmits(['chooseFun', 'delFun'])
// 静态规则-选中数据
const chooseFun = (e, item, i) => {
  emits('chooseFun', {
    chooseResult: e,
    item: item,
    i: i
  })
}
// 静态规则-删除选中的数据
const delFun = throttle((item, index) => {
  emits('delFun', {
    item: item,
    index: index
  })
}, 500)

const previewInfo = ref({
  show: false
}) // 预览弹窗的信息
const previewFun = throttle((url, type, title, cover, maskPosition) => {
  previewInfo.value = {
    show: true,
    title: title,
    url: url,
    type: type,
    cover: cover || '',
    maskPosition: maskPosition ? JSON.parse(maskPosition) : {}
  }
}, 500)
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
// 云原料的标志
.material_item_badge {
  position: absolute;
  top: 0;
  right: 0;
  width: 52px;
  height: 52px;
}
.one_textElement_text .material_item_badge {
  position: absolute;
  top: 0;
  left: 0;
  transform: rotate(270deg);
  width: 35px;
  height: 35px;
}
// 面部/人物模型的样式
.faceMould_box {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
  .one_faceMould {
    width: 90px;
    height: 120px;
    background: #fff;
    border-radius: 4px;
    margin: 12px 12px 0px 0;
    border: 1px solid #fff;
    position: relative;
    .one_faceMould_cover {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 4px;
    }
    .one_faceMould_play {
      cursor: pointer;
      width: 36px;
      height: 36px;
      object-fit: contain;
      position: absolute;
      left: 27px;
      top: 42px;
    }
  }
  // .one_faceMould.dynamic_box {
  //   margin: 0px 12px 12px 0;
  // }
}
.one_faceMould_checkBox {
  width: 16px;
  height: 16px;
  position: absolute;
  right: 8px;
  bottom: 8px;
}
.one_faceMould_del {
  width: 16px;
  height: 16px;
  position: absolute;
  right: -6px;
  top: -6px;
  cursor: pointer;
}
// 文本原料的样式
.textElement_box {
  width: 100%;
  height: 100%;
  padding-top: 4px;
  overflow-y: auto;
  .one_videoElement_text {
    width: calc(100%);

    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .one_videoElement_cover {
      cursor: pointer;
      width: 32px;
      height: 32px;
      object-fit: cover;
      margin-right: 14px;
    }
    .one_videoElement_content {
      width: calc(100% - 46px);
      .video_title {
        width: 100%;

        font-size: 14px;
        font-weight: 400;
        color: #303133;
        line-height: 20px;
      }
      .video_time {
        margin-top: 4px;
        font-size: 12px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #909399;
        line-height: 18px;
      }
    }
  }
  .one_textElement {
    width: calc(100% - 16px);
    padding: 10px;
    background: #f2f3f5;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    color: #606266;
    line-height: 17px;
    border: 1px solid #f2f3f5;
    margin: 8px 16px 8px 0;
    position: relative;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .static_textElement {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    .one_textElement_text {
      width: calc(100% - 24px);
      white-space: pre-wrap;
      word-break: break-word;
    }
    .one_videoElement_text {
      width: calc(100% - 24px);
    }
    .one_textElement_checkBox {
      width: 16px;
      height: 16px;
    }
  }
}
.choose_box {
  border-color: #364fcd !important;
}
</style>
