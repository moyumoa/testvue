<template>
  <div style="position: relative">
    <div class="container">
      <div
        class="column"
        :infinite-scroll-delay="1000"
        v-infinite-scroll="load"
        :infinite-scroll-distance="100"
        :infinite-scroll-disabled="contentArr.length > 100"
        v-for="(column, index) in columns"
        :key="index"
      >
        <div
          class="item"
          v-for="(item, i) in column.columnArr"
          :key="i"
          :style="{
            height: item.showHeight + 'px',
            background: item.background
          }"
        >
          <!-- width: containerWidth ? containerWidth / columns.length + 'px' : '220px' -->
          {{ i }}
        </div>
      </div>
    </div>
    <div
      class="loading"
      v-if="loading"
      v-loading="loading"
      element-loading-text="加载中"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    ></div>
  </div>
</template>
<script setup>
import { throttle, getCWidth } from '@/utils/tools.js'
const contentArr = ref([
  {
    id: '1503758090692714498',
    brandId: '16',
    type: 1,
    name: 'videoplayback1',
    size: '7200969',
    wight: 640,
    height: 360,
    duration: 261,
    createTime: '2022-03-15 23:40:35',
    source: 3,
    userId: '1111',
    userName: '111',
    userPhone: '133333',
    userHeadUrl:
      'http://p3-webcast.douyinpic.com/img/aweme-avatar/tos-cn-avt-0015_e6c6459efd675a2323b24e9a753a284f~tplv-resize:0:0.image',
    remark: null,
    coverUrl:
      'http://xm-sumvideo.oss-cn-shanghai.aliyuncs.com/xm/image/89631a555e184d0fb61a0880cdd64ce0.snapshot.jpeg?Expires=7954558841&amp;OSSAccessKeyId=LTAI5t8N7JrzGRM4yWKvutwN&amp;Signature=ue9wNw5DaxA7Pnu9DL0Y%2FQzwgHM%3D',
    url: 'http://xm-sumvideo.oss-cn-shanghai.aliyuncs.com/xm/video/89631a555e184d0fb61a0880cdd64ce0.mp4?Expires=7954558841&amp;OSSAccessKeyId=LTAI5t8N7JrzGRM4yWKvutwN&amp;Signature=8A%2BTfVTTWOHlI2SmTUp9g4jXAd0%3D',
    fileFormat: 'mp4',
    isDelete: 0,
    fileKey: 'xm/video/89631a555e184d0fb61a0880cdd64ce0.mp4',
    fileCoverKey: 'xm/image/89631a555e184d0fb61a0880cdd64ce0.snapshot.jpeg',
    tagList: null
  },
  {
    id: '1503920038298189825',
    brandId: '16',
    type: 3,
    name: '3686887f-f3fa-4aec-850f-fea14a6f895a - 副本',
    size: '54057',
    wight: 591,
    height: 1280,
    duration: 0,
    createTime: '2022-03-16 10:24:13',
    source: 3,
    userId: '196790565470209',
    userName: '111',
    userPhone: '133333',
    userHeadUrl:
      'http://p3-webcast.douyinpic.com/img/aweme-avatar/tos-cn-avt-0015_e6c6459efd675a2323b24e9a753a284f~tplv-resize:0:0.image',
    remark: null,
    coverUrl: null,
    url: 'http://xm-sumvideo.oss-cn-shanghai.aliyuncs.com/xm/image/100e6259cabc4b1587b7621d64c6b4a4.jpg?Expires=7954597453&amp;OSSAccessKeyId=LTAI5t8N7JrzGRM4yWKvutwN&amp;Signature=eOpfRcmZFqmNb04UZOttTUrkkwA%3D',
    fileFormat: 'jpg',
    isDelete: 0,
    fileKey: 'xm/image/100e6259cabc4b1587b7621d64c6b4a4.jpg',
    fileCoverKey: null,
    tagList: null
  },
  {
    id: '1503966387156795393',
    brandId: '16',
    type: 1,
    name: '飞书20220316-1146012',
    size: '464368',
    wight: 720,
    height: 960,
    duration: 3,
    createTime: '2022-03-16 13:28:07',
    source: 3,
    userId: '1111',
    userName: '111',
    userPhone: '133333',
    userHeadUrl:
      'http://p3-webcast.douyinpic.com/img/aweme-avatar/tos-cn-avt-0015_e6c6459efd675a2323b24e9a753a284f~tplv-resize:0:0.image',
    remark: null,
    coverUrl:
      'http://xm-sumvideo.oss-cn-shanghai.aliyuncs.com/xm/image/1fdd280398254ec0a4108c3ac584995a.snapshot.jpeg?Expires=7954608501&amp;OSSAccessKeyId=LTAI5t8N7JrzGRM4yWKvutwN&amp;Signature=SL5NdtGwyn2jhEx4EcGQX1vn5MQ%3D',
    url: 'http://xm-sumvideo.oss-cn-shanghai.aliyuncs.com/xm/video/1fdd280398254ec0a4108c3ac584995a.mp4?Expires=7954608494&amp;OSSAccessKeyId=LTAI5t8N7JrzGRM4yWKvutwN&amp;Signature=3FqFVYqUVLkB4ftQBXU1APwpN5s%3D',
    fileFormat: 'mp4',
    isDelete: 0,
    fileKey: 'xm/video/1fdd280398254ec0a4108c3ac584995a.mp4',
    fileCoverKey: 'xm/image/1fdd280398254ec0a4108c3ac584995a.snapshot.jpeg',
    tagList: null
  },
  {
    id: '1504011295557120001',
    brandId: '16',
    type: 2,
    name: '1 - 副本',
    size: '309981',
    wight: 1100,
    height: 940,
    duration: 0,
    createTime: '2022-03-16 16:26:51',
    source: 3,
    userId: '196790565470209',
    userName: '111',
    userPhone: '133333',
    userHeadUrl:
      'http://p3-webcast.douyinpic.com/img/aweme-avatar/tos-cn-avt-0015_e6c6459efd675a2323b24e9a753a284f~tplv-resize:0:0.image',
    remark: null,
    coverUrl: null,
    url: 'http://xm-sumvideo.oss-cn-shanghai.aliyuncs.com/xm/image/ee7d3939920f42bb885bd27aa58f45ac.png?Expires=7954619210&amp;OSSAccessKeyId=LTAI5t8N7JrzGRM4yWKvutwN&amp;Signature=BNM%2BepcgCExPPGhY9mU5NoHh0Iw%3D',
    fileFormat: 'png',
    isDelete: 0,
    fileKey: 'xm/image/ee7d3939920f42bb885bd27aa58f45ac.png',
    fileCoverKey: null,
    tagList: null
  },
  {
    id: '1504015280053645314',
    brandId: '16',
    type: 1,
    name: '2021072009452392084e7c72',
    size: '4856744',
    wight: 720,
    height: 1280,
    duration: 14,
    createTime: '2022-03-16 16:42:39',
    source: 3,
    userId: '196790565470209',
    userName: '111',
    userPhone: '133333',
    userHeadUrl:
      'http://p3-webcast.douyinpic.com/img/aweme-avatar/tos-cn-avt-0015_e6c6459efd675a2323b24e9a753a284f~tplv-resize:0:0.image',
    remark: null,
    coverUrl:
      'http://xm-sumvideo.oss-cn-shanghai.aliyuncs.com/xm/image/e389e8bde0894842971e255e68891039.snapshot.jpeg?Expires=7954620160&amp;OSSAccessKeyId=LTAI5t8N7JrzGRM4yWKvutwN&amp;Signature=c5v6Uo8D89SkYYWa8JhrS9%2BJcsU%3D',
    url: 'http://xm-sumvideo.oss-cn-shanghai.aliyuncs.com/xm/video/e389e8bde0894842971e255e68891039.mp4?Expires=7954620160&amp;OSSAccessKeyId=LTAI5t8N7JrzGRM4yWKvutwN&amp;Signature=VtY1NZYwVCVaMBoNmmZFCKMSk8Y%3D',
    fileFormat: 'mp4',
    isDelete: 0,
    fileKey: 'xm/video/e389e8bde0894842971e255e68891039.mp4',
    fileCoverKey: 'xm/image/e389e8bde0894842971e255e68891039.snapshot.jpeg',
    tagList: null
  },
  {
    id: '1504028997310967810',
    brandId: '16',
    type: 3,
    name: 'TEST',
    size: '3688365',
    wight: 0,
    height: 0,
    duration: 230,
    createTime: '2022-03-16 17:37:10',
    source: 3,
    userId: '196790565470209',
    userName: '111',
    userPhone: '133333',
    userHeadUrl:
      'http://p3-webcast.douyinpic.com/img/aweme-avatar/tos-cn-avt-0015_e6c6459efd675a2323b24e9a753a284f~tplv-resize:0:0.image',
    remark: null,
    coverUrl: null,
    url: 'http://xm-sumvideo.oss-cn-shanghai.aliyuncs.com/xm/audio/1045bd4d083e4afe8e2b1fca3650cd1c.mp3?Expires=7954623431&amp;OSSAccessKeyId=LTAI5t8N7JrzGRM4yWKvutwN&amp;Signature=WvmpZZucJ478jiuii6QcJGIu%2Fto%3D',
    fileFormat: 'mp3',
    isDelete: 0,
    fileKey: 'xm/audio/1045bd4d083e4afe8e2b1fca3650cd1c.mp3',
    fileCoverKey: null,
    tagList: null
  }
])
contentArr.value = listChange(contentArr.value)
function listChange(list) {
  list.forEach(x => {
    if (x.type === 1 || x.type === 2) {
      const showHeight = (220 / x.wight) * x.height
      x.showHeight = showHeight < 86 ? 86 : showHeight
    } else if (x.type === 3) {
      x.showHeight = 86
    } else if (x.type === 4) {
      x.showHeight = 220
    } else {
      x.showHeight = 86
    }
    x.top = ''
  })
  return list
}
const columns = ref([])
const arrIndex = ref([])
const loading = ref(false)
const contentArr2 = ref([])

function pushElement() {
  return new Promise((resolve, reject) => {
    console.log('准备获取更多')
    setTimeout(() => {
      console.log('获取更多')
      const newList = []
      for (let i = 0; i < 20; i++) {
        newList[i] = {
          value: i + contentArr.value.length,
          height: 50 * Math.random() + 50,
          background: '#409eff',
          text: i + contentArr.value.length,
          top: '',
          wight: Math.random() + 100,
          type: Math.floor(Math.random() * 4 + 1)
        }
      }
      contentArr2.value = listChange(newList)
      contentArr.value = contentArr.value.concat(contentArr2.value)
      resolve()
    }, 500)
  })
}
function getMinHeight(arr) {
  const a = []
  for (let i = 0; i < arr.length; i++) {
    a.push(parseInt(arr[i].showHeight) + parseInt(arr[i].top))
  }
  return Math.min.apply(null, a)
}
function getMinIndex(val) {
  for (let i = 0; i < columns.value.length; i++) {
    const showHeight =
      columns.value[i].columnArr.length > 0
        ? columns.value[i].columnArr[columns.value[i].columnArr.length - 1].showHeight
        : 0
    const top =
      columns.value[i].columnArr.length > 0
        ? columns.value[i].columnArr[columns.value[i].columnArr.length - 1].top
        : 0
    if (parseInt(showHeight) + parseInt(top) === val) {
      arrIndex.value.push(i)
    }
  }
}
// const containerWidth = ref(null)
function init() {
  // console.log(container.value.clientWidth)
  columns.value = []

  const contentLen = contentArr.value.length
  // 根据可视区域的宽度判断需要几列
  const cWidth = document.documentElement.clientWidth || document.body.clientWidth
  // 假设图片宽度为100px
  // containerWidth.value = cWidth  - 32 - 48 - 84
  const cLen = Math.floor((getCWidth() - 32 - 48 - 84) / 220)

  // 初始化每一列的第一行元素
  for (let i = 0; i < cLen; i++) {
    if (i < contentArr.value.length) {
      contentArr.value[i].top = 0 // 预设距离顶部值为0
      columns.value.push({ columnArr: [contentArr.value[i]] })
    } else {
      columns.value.push({
        columnArr: []
      })
    }
  }
  console.log(cWidth, cLen, contentArr.value)
  // 对剩余元素的判断，应该放到哪一列
  for (let index = cLen; index < contentLen; index++) {
    arrIndex.value = []
    const arr = [] // 找到高度最小的一列，可能有多个
    let minHeight = 0 // 高度最小的一列的高度
    let pushIndex = 0 // 高度最小的一列所在位置的索引

    for (let i = 0; i < columns.value.length; i++) {
      arr.push({
        showHeight:
          columns.value[i].columnArr.length > 0
            ? columns.value[i].columnArr[columns.value[i].columnArr.length - 1].showHeight
            : 0,
        top:
          columns.value[i].columnArr.length > 0
            ? columns.value[i].columnArr[columns.value[i].columnArr.length - 1].top
            : 0
      })
    }

    minHeight = getMinHeight(arr)
    getMinIndex(minHeight)

    if (arrIndex.value.length > 0) {
      pushIndex = Math.min.apply(null, arrIndex.value) // 出现高度一样的，去索引最小的
    }

    contentArr.value[index].top = minHeight + 20
    columns.value[pushIndex].columnArr.push(contentArr.value[index])
  }
}
const load = throttle(function () {
  loading.value = true
  pushElement().then(() => {
    console.log('获取完了')
    //  从接口最新获取的元素push到目前高度最小的一列
    for (let index = 0; index < contentArr2.value.length; index++) {
      arrIndex.value = []
      const arr = [] // 找到高度最小的一列，可能有多个
      let minHeight = 0 // 高度最小的一列的高度
      let pushIndex = 0 // 高度最小的一列所在位置的索引

      for (let i = 0; i < columns.value.length; i++) {
        arr.push({
          showHeight:
            columns.value[i].columnArr.length > 0
              ? columns.value[i].columnArr[columns.value[i].columnArr.length - 1].showHeight
              : 0,

          top:
            columns.value[i].columnArr.length > 0
              ? columns.value[i].columnArr[columns.value[i].columnArr.length - 1].top
              : 0
        })
      }

      minHeight = getMinHeight(arr)
      getMinIndex(minHeight)
      if (arrIndex.value.length > 0) {
        pushIndex = Math.min.apply(null, arrIndex.value) // 出现高度一样的，去索引最小的
      }

      contentArr.value[index].top = minHeight + 20
      columns.value[pushIndex].columnArr.push(contentArr.value[index])
      loading.value = false
    }
  })
}, 1000)

init()
window.onresize = () => {
  console.time('aa')
  init()
  console.timeEnd('aa')
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
div,
p {
  margin: 0;
  padding: 0;
}
.container {
  margin: 0 auto;
  padding-bottom: 20px;
  display: flex;
  justify-content: flex-start;
  background: pink;
  transition: all 0.5s ease-in-out;
}
.item {
  /* border: 1px solid red; */
  background: red;
  width: 220px;
  color: #000;
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.5s ease-in-out;
  margin: 0 14px 14px 0;
}
.loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.column:last-child .item {
  margin-right: 0;
}
</style>
