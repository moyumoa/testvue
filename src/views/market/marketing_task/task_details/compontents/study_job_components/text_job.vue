<template>
  <div>
    <!--作业要求    -->
    <div class="top-container">
      <div class="top-container--title">作业要求</div>
      <div class="top-container--item">{{ subject.title }}</div>
      <el-image
        class="top-container--img"
        v-for="item in subject.imgList"
        :key="item"
        :preview-src-list="subject.imgList"
        :src="item"
      ></el-image>
    </div>
    <div class="wrapper">
      <div class="wrapper-title">作业内容</div>
      <div class="text_job" @click="clickHtml">
        <div v-html="props.textInfo"></div>
      </div>
    </div>
    <el-dialog title="查看图片" top="10vh" @close="imgDialog.show = false" v-model="imgDialog.show">
      <div class="img_dialog">
        <!-- 左側 -->
        <div class="img_left">
          <el-icon class="img_icon" @click="showImg('pre')">
            <i-arrow-left-bold />
          </el-icon>
        </div>
        <!-- 圖片 -->

        <img class="img_center" :src="imgDialog.url" />
        <!-- 右側 -->
        <div class="img_right">
          <el-icon class="img_icon" @click="showImg('next')">
            <i-arrow-right-bold />
          </el-icon>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script setup>
const props = defineProps({
  textInfo: String,
  homeworkInfo: Object,
  taskInfo: Object
})
const imgDialog = reactive({
  show: false,
  url: '',
  index: null
})
const imgList = ref([])

const subject = computed({
  get() {
    const { requirement,sample } = props.homeworkInfo
    const result = {
      title: requirement,
      imgList: sample ?JSON.parse(sample)?.map(item => item.url) : []
    }
    // const result = {
    //   title: '',
    //   imgList: []
    // }
    // const list = props.taskInfo?.taskConfigs || []
    // list.forEach(item => {
    //   if (item.ckey === 'course_homework_requirement') {
    //     result.title = item.cvalue
    //   }
    //   if (item.ckey === 'course_homework_sample') {
    //     result.imgList = item.cvalue ? JSON.parse(item.cvalue)?.map(item => item.url) : []
    //   }
    // })
    return result
  }
})

function init() {
  const RegEx = /(?<=(img src="))[^"]*?(?=")/gims
  const imgUrlList = props.textInfo.match(RegEx)
  imgList.value = imgUrlList
}

function clickHtml(e) {
  if (e.target.nodeName === 'IMG') {
    imgDialog.index = imgList.value.indexOf(e.target.currentSrc)
    imgDialog.url = e.target.currentSrc
    imgDialog.show = true
  }
}

function showImg(type) {
  if (type === 'pre') {
    if (imgDialog.index > 0) {
      imgDialog.index = type === 'pre' ? imgDialog.index - 1 : imgDialog.index + 1
      imgDialog.url = imgList.value[imgDialog.index]
    }
  } else {
    if (imgDialog.index < imgList.value.length - 1) {
      imgDialog.index = type === 'pre' ? imgDialog.index - 1 : imgDialog.index + 1
      imgDialog.url = imgList.value[imgDialog.index]
    }
  }
}

init()
</script>
<style lang="scss" scoped>
.top-container {
  margin-right: 16px;
  margin-bottom: 16px;
  background: #f6f8fa;
  border-radius: 2px;
  padding: 12px;

  .top-container--title {
    height: 20px;
    line-height: 20px;
    font-size: 14px;
    font-weight: bold;
    color: #606266;
  }

  .top-container--item {
    margin-top: 5px;
    line-height: 20px;
    font-size: 14px;
    font-weight: 400;
    color: #909399;
  }

  .top-container--img {
    width: 80px;
    height: 80px;
  }
}

.wrapper {
  .wrapper-title {
    width: 64px;
    height: 22px;
    font-size: 16px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: #303133;
    line-height: 22px;
    margin-bottom: 5px;
  }

  .text_job {
    max-height: 300px;
    overflow-y: auto;
    padding: 0 16px 20px 0;
    line-height: 1.5;

    :deep(img) {
      margin-top: 6px;
      max-width: 375px !important;
      display: flex;
    }
  }
}

.img_dialog {
  width: 100%;
  height: 70vh;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  .img_left,
  .img_right {
    width: 30px;

    .img_icon {
      width: 30px;
      cursor: pointer;
      font-size: 18px;
      border: 1px solid rgb(96, 98, 102);
      border-radius: 100%;
      height: 30px;
    }
  }

  .img_center {
    margin: 0 20px;
    max-width: calc(100% - 100px);
    max-height: 70vh;
    object-fit: contain;
  }
}
</style>
