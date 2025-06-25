<template>
  <div>
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      title="实拍图选择替换区"
      width="100%"
      custom-class="xm_element_dialog"
    >
      <div
        v-if="props.canvasDialog && props.canvasDialog.isNeedReplaceFace == 1"
        :style="dialogLoading ? 'opacity:0' : ''"
        class="content_tip"
      >
        如需要保留模特脸部形象，仅更换背景，请同时选中脸部区域
      </div>
      <div class="content_close" @click="handleClose" :style="dialogLoading ? 'opacity:0' : ''">
        <img src="https://tagvv-1256030678.file.myqcloud.com/20241014rc7i3.png" alt="" />
      </div>
      <div class="dialog_content" v-loading="dialogLoading">
        <div class="content_canvas">
          <!-- 用于保存选中区域 要求画布里是二值图像 -->
          <canvas ref="canvasRef" id="myCanvas3" :width="imgWidth" :height="imgHeight"></canvas>
          <!-- 用于获取每个模块的白色区域位置 -->
          <canvas id="myCanvas2" :width="canvasWidth" :height="canvasHeight"></canvas>
          <!-- 页面上实际展示的canvas -->
          <div class="myCanvas_back" id="myCanvasBack">
            <img
              class="myCanvas_backImg"
              :src="imgUrl"
              :style="{
                width: canvasWidth + 'px',
                height: canvasHeight + 'px'
              }"
            />
            <!-- :style="`background-image:url('${imgUrl}')`" -->
            <canvas id="myCanvas" :width="canvasWidth" :height="canvasHeight"></canvas>
          </div>
        </div>
        <div
          :class="{ content_btn: true, dis_btn: !(clickIndexList && clickIndexList.length > 0) }"
        >
          <div class="left_btn">
            <div class="btn_btn" @click="goBack">撤销</div>
            <div class="btn_line"></div>
            <div class="btn_btn" @click="resetFun">重置</div>
          </div>

          <div class="right_btn" @click="saveFun">确认保留区域</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script setup>
import { throttle, isNotEmpty, getCHeight } from '@/utils/tools'
import { base64Img } from '@/api/sumvideo/cloud_cover_management.js'
import { ElMessageBox } from 'element-plus'
import {
  getInteractiveFullSegmentationAdvanceResult,
  uploadShoot,
  pageMannequinShoot
} from '@/api/sumvideo/product_shooting_library.js'
import html2canvas from 'html2canvas'
const message = inject('$message')
const emits = defineEmits(['updateFun'])

const dialogLoading = ref(true) // 弹窗的全局Loading
const props = defineProps({
  canvasDialog: {
    type: Object,
    default: () => {
      return {
        show: false
      }
    }
  }
})
const { show } = toRefs(props.canvasDialog)

const dialog = ref()
const dialogDesotry = ref(false) // 弹窗是否销毁了
const canvasWidth = ref(500) // 画布宽度
const canvasHeight = ref(500) // 画布高度
const imgWidth = ref(null) // 原图的原始宽度
const imgHeight = ref(null) // 原图的原始高度
const imgUrl = ref('') // 原图地址
const saveUrl = ref('') // 绘制区域保存后的地址 黑白图地址
const redrawYellowUrl = ref('') // 绘制区域保存后的黄色图地址
// 三个画布
let canvas = null
let ctx = null
let canvas2 = null
let ctx2 = null
let canvas3 = null
let ctx3 = null

const base64Images = ref([]) // 根据分割结果将所有base64图片组成一个列表
let imgElements = [] // Image对象数组
const imageXYMap = {} // 按图片index存每张图片占据的xy

let imageDataMap = {} // 存储每张图片的像素数据-后面改色需要
let imageDataMap3 = {} // 存储每张图片的像素数据-后面改色需要
const clickIndexList = ref([]) // 选中要去绘制的index列表

// 通过原图算出画布的宽高
function getCanvasWHFun() {
  return new Promise(resolve => {
    // 画布的基础宽高为屏幕高度-188
    // 计算缩放比例
    const scaleWidth = dialogHeight.value / imgWidth.value
    const scaleHeight = dialogHeight.value / imgHeight.value
    const scale = Math.min(scaleWidth, scaleHeight) // 取较小的缩放比例

    // 等比例缩放图片
    canvasWidth.value = imgWidth.value * scale
    canvasHeight.value = imgHeight.value * scale
    resolve()
  })
}
const imgDataTimer = ref(null) // 获取图片分割结果的轮询
function clearImgDataTimer() {
  console.log('清空定时器')
  clearInterval(imgDataTimer.value)
  imgDataTimer.value = null
}
// 通过原图获取到分割后的结果
function getImageListFun() {
  return new Promise((resolve, reject) => {
    const _queryImgData = () => {
      getInteractiveFullSegmentationAdvanceResult({
        url: imgUrl.value
      })
        .then(res => {
          if (res.code === 0 && res.data) {
            clearImgDataTimer()
            const result = res.data
            // 拿到所有分割的图片
            if (
              result &&
              result.output &&
              result.output.regionInfo &&
              result.output.regionInfo.length > 0
            ) {
              result.output.regionInfo.forEach(x => {
                base64Images.value.push('data:image/png;base64,' + x.region)
              })

              // 根据图片列表创建对应的image对象数组
              imgElements = base64Images.value.map(() => new Image())

              imgElements.forEach((img, index) => {
                // 保存每张图片都加载完成后再去绘制
                img.onload = () => {
                  if (dialogDesotry.value) return
                  // 初始化一下xy的对象，保存后面能给对应图片插入对应的XY
                  imageXYMap[index] = []
                  // 先往canvas里绘制图片 canvas和canvas2的宽高都一样，所以直接用canvas了
                  ctx2.drawImage(img, 0, 0, canvas.width, canvas.height)
                  // 再通过canvas.getImageData获取所有的像素点信息。一个像素点返回4个数据（R、G、B、A）
                  const imageData = ctx2.getImageData(0, 0, canvas.width, canvas.height)
                  // console.log('每一个key图片的像素点', index, imageData)

                  // 获取对应的xy，只要是RGB都是白色的，就代表是要存的，因为返回的图片保证是白色黑底。
                  for (let i = 0; i < imageData.data.length; i += 4) {
                    if (
                      imageData.data[i] === 255 ||
                      imageData.data[i + 1] === 255 ||
                      imageData.data[i + 2] === 255
                    ) {
                      const x = (i / 4) % canvas.width
                      const y = Math.floor(i / 4 / canvas.width)
                      imageXYMap[index].push(`${x},${y}`)
                    } else {
                      // --这个看后面能否去掉
                      // 将黑色图片设置为透明，只要给ALPHA设置0即可
                      imageData.data[i + 3] = 0
                    }
                  }
                  // console.log(Object.keys(imageXYMap).length, base64Images.value.length)
                  // 保证获取到的xy图片个数等于分割图片个数，就代表初始化完成。
                  if (Object.keys(imageXYMap).length === base64Images.value.length) {
                    nextTick(() => {
                      dialogLoading.value = false
                      resolve()
                    })
                  }
                }
                img.src = base64Images.value[index]
              })
            }
          } else {
            if (!imgDataTimer.value) {
              imgDataTimer.value = setInterval(() => {
                _queryImgData()
              }, 3000)
            }
            // reject(new Error())
          }
        })
        .catch(() => {
          // reject(new Error())
        })
    }
    _queryImgData()
  })
}
// 监听canvas的点击事件
function canvasClickFun() {
  canvas.addEventListener('click', function (event) {
    isSave.value = false
    // 获取点击的XY,y因为会有小数，所以向下取整和向上取整都存了，防止落了，毕竟xy都是我们自己算的，预估的
    const rect = canvas.getBoundingClientRect()
    const x = Math.floor(event.clientX - rect.left)
    const x2 = Math.ceil(event.clientX - rect.left)
    const y = Math.floor(event.clientY - rect.top)
    const y2 = Math.ceil(event.clientY - rect.top)
    // console.log('点击的位置', x, x2, y, y2, imageXYMap)

    // 根据xy去匹配属于哪个分割图片
    const qualifiedList = [] // 符合条件列表
    // for (const key in imageXYMap) {
    //   if (
    //     imageXYMap[key].includes(`${x},${y}`) ||
    //     imageXYMap[key].includes(`${x},${y2}`) ||
    //     imageXYMap[key].includes(`${x2},${y}`) ||
    //     imageXYMap[key].includes(`${x2},${y2}`)
    //   ) {
    //     console.log('符合条件的key', key)
    //     qualifiedList.push(key)
    //   }
    // }
    // 这个方法转换成下面的，AI推荐，会快一点 像素点多的情况下会快50s
    // 预处理坐标
    const coordsToCheck = new Set([`${x},${y}`, `${x},${y2}`, `${x2},${y}`, `${x2},${y2}`])

    // 将 imageXYMap 转换为数组
    const imageXYArray = []
    for (const key in imageXYMap) {
      imageXYArray.push({
        key: parseInt(key),
        coords: imageXYMap[key]
      })
    }

    // 直接遍历数组
    for (const { key, coords } of imageXYArray) {
      // 只需要检查当前坐标组中是否有任何一个坐标匹配
      const hasMatch = coords.some(coord => coordsToCheck.has(coord))
      if (hasMatch) {
        qualifiedList.push(key + '')
      }
    }

    // console.log('符合条件的key列表', qualifiedList, clickIndexList.value)
    // 因为会有多张图片的白色区域位置重叠，所以如果已经点击过了，就不再触发绘制
    if (qualifiedList && qualifiedList.length > 0) {
      let has = false
      qualifiedList.forEach(x => {
        if (clickIndexList.value.includes(x)) has = true
      })

      // 没有跟点击过的重叠并且点击过列表不存在该图片Index 就将该index存起来并进行绘制
      if (!has && !clickIndexList.value.includes(qualifiedList[0])) {
        clickIndexList.value.push(qualifiedList[0])
        drawFun('ctx')
      }
    }
  })
}
// 根据选中区域进行绘制 保存是白色黑底 绘制是黄色透明底
function drawFun(name) {
  // 每次绘制都要重置一下像素数据
  if (name === 'ctx') {
    imageDataMap = {}
  } else {
    imageDataMap3 = {}
  }
  imgElements.forEach((img, index) => {
    // 如果是点击过的分割图片，就获取对应的像素数据并存起来
    if (clickIndexList.value.includes(index + '')) {
      const width = name === 'ctx' ? canvas.width : canvas3.width
      const height = name === 'ctx' ? canvas.height : canvas3.height
      ;(name === 'ctx' ? ctx : ctx3).drawImage(img, 0, 0, width, height)
      const imageData = (name === 'ctx' ? ctx : ctx3).getImageData(0, 0, width, height)

      if (name === 'ctx') {
        imageDataMap[index] = imageData
      } else {
        imageDataMap3[index] = imageData
      }
      const imgDataObj = name === 'ctx' ? imageDataMap : imageDataMap3
      // 当所有图片的像素数据都存起来后，就进行绘制
      if (Object.keys(imgDataObj).length === clickIndexList.value.length) {
        combineImages(name)
      }
    }
  })
}
// 合并所有的白色部分，将他们改成黄色并填充进去
function combineImages(name) {
  // console.log('合并', name)
  const width = name === 'ctx' ? canvas.width : canvas3.width
  const height = name === 'ctx' ? canvas.height : canvas3.height
  const combinedData = (name === 'ctx' ? ctx : ctx3).createImageData(width, height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4
      let isWhite = false
      for (let i = 0; i < clickIndexList.value.length; i++) {
        const data = (name === 'ctx' ? imageDataMap : imageDataMap3)[clickIndexList.value[i]].data
        if (data[index] === 255 && data[index + 1] === 255 && data[index + 2] === 255) {
          if (!isWhite) {
            isWhite = true
          }
          break
        }
      }
      // 保存是白色黑底 绘制是黄色透明底
      if (isWhite) {
        combinedData.data[index] = 255 // R
        combinedData.data[index + 1] = 255 // G
        combinedData.data[index + 2] = name === 'ctx' ? 0 : 255 // B
        combinedData.data[index + 3] = name === 'ctx' ? 200 : 255 // Alpha
      } else {
        combinedData.data[index] = 0 // R
        combinedData.data[index + 1] = 0 // G
        combinedData.data[index + 2] = 0 // B
        combinedData.data[index + 3] = name === 'ctx' ? 0 : 255 // Alpha
      }
    }
  }
  ;(name === 'ctx' ? ctx : ctx3).putImageData(combinedData, 0, 0)
  // 如果是ctx3保存过来的,等绘制完成需要将canvas生成图片并上传到阿里云

  nextTick(() => {
    if (name === 'ctx3') {
      canvasToImgFun()
    }
  })
}
// canvas转图片保存
const canvasRef = ref()
function canvasToImgFun() {
  const canvas = canvasRef.value
  const dataURL = canvas.toDataURL('image/png')

  base64Img({
    base64: dataURL
  })
    .then(res => {
      if (res.code === 0) {
        if (props.canvasDialog.origin && props.canvasDialog.origin === 'table' && res.data) {
          // 如果是表格过来的，实时更新实拍图信息
          updateShootFun(res.data)
        } else {
          isSave.value = true
          saveUrl.value = res.data || ''
          message.success('操作成功')
          dialogLoading.value = false
        }
      } else {
        dialogLoading.value = false
      }
    })
    .catch(() => {
      dialogLoading.value = false
    })
}
// 撤销 就是清空点击的最后一个，然后重新画
const goBack = throttle(() => {
  isSave.value = false
  clickIndexList.value.pop()
  if (clickIndexList.value && clickIndexList.value.length > 0) {
    drawFun('ctx')
  } else {
    resetFun()
  }
})
// 重置 就是把画面的内容清空
const resetFun = throttle(() => {
  isSave.value = false
  clickIndexList.value = []
  ctx.clearRect(0, 0, canvas.width, canvas.height)
})
const isSave = ref(false) // 是否触发了保留选取
// 保存 将选中的分割图片以白色黑底的形式保存并上传到阿里云
const saveFun = throttle(() => {
  if (dialogLoading.value) return
  if (isNotEmpty(clickIndexList.value)) {
    dialogLoading.value = true
    setTimeout(() => {
      saveYellowFun()
        .then(() => {
          drawFun('ctx3')
        })
        .catch(() => {
          dialogLoading.value = false
        })
    }, 100)
  }
})
// 将页面保存起来 选区黄色的图片
function saveYellowFun() {
  return new Promise((resolve, reject) => {
    const scale = 2
    const allowTaint = false
    const useCORS = true
    const width = canvasWidth.value
    const height = canvasHeight.value
    const backgroundColor = null

    const id = document.getElementById('myCanvasBack')
    html2canvas(id, {
      removeContainer: true,
      scale, // 缩放比例,默认为1
      allowTaint, // 是否允许跨域图像污染画布
      useCORS, // 是否尝试使用CORS从服务器加载图像
      width, // 画布的宽度
      height, // 画布的高度
      backgroundColor // 画布的背景色，默认为透明
    })
      .then(canvas11 => {
        // 1. 导出画布为图片
        const canvasAllUrl = canvas11.toDataURL('image/png') // 或使用 toBlob() 导出为 Blob
        console.log('图片数据:', canvasAllUrl)

        // 2. 清空画布
        const ctx = canvas11.getContext('2d')
        ctx.clearRect(0, 0, canvas11.width, canvas11.height)

        // 3. 可选：移除画布 DOM 节点
        // document.body.removeChild(canvas11)

        // 4. 可选：释放画布对象（确保没有其他引用）
        canvas11 = null

        if (canvasAllUrl) {
          base64Img({
            base64: canvasAllUrl
          })
            .then(res => {
              if (res.code === 0) {
                redrawYellowUrl.value = res.data || ''
                resolve()
              } else {
                if (res.msg) {
                  message.warning(res.msg || '')
                }

                reject(new Error())
              }
            })
            .catch(err => {
              console.log('err', err)
              if (isNotEmpty(err)) {
                message.warning(JSON.stringify(err))
              }
              reject(new Error())
            })
        } else {
          message.warning('图片提取失败')
          reject(new Error())
        }
      })
      .catch(err => {
        message.warning('图片提取失败' + err)
        reject(new Error())
      })
  })
}
// 如果是表格过来的，点击保留区域就去更新实拍图信息
function updateShootFun(url) {
  uploadShoot([
    {
      materialId: props.canvasDialog.materialId,
      markUrl: url,
      indexs: clickIndexList.value.join(','),
      redrawYellowUrl: redrawYellowUrl.value
    }
  ])
    .then(res => {
      if (res.code === 0) {
        message.success('操作成功')
        saveUrl.value = url
        isSave.value = true
      }
      dialogLoading.value = false
    })
    .catch(() => {
      dialogLoading.value = false
    })
}
const dialogHeight = ref()
onMounted(() => {
  dialogHeight.value = getCHeight(false) - 58 - 188
  // 如果是表格的编辑选区，就通过接口去取最新的数据
  if (props.canvasDialog.materialId) {
    pageMannequinShoot({
      materialId: props.canvasDialog.materialId,
      pageNo: 1,
      pageSize: 1
    })
      .then(res => {
        if (res.code === 0 && res.data && res.data.records && res.data.records.length > 0) {
          const imgInfo = res.data.records[0]
          setDetail(
            imgInfo.coverUrl,
            imgInfo.width,
            imgInfo.height,
            isNotEmpty(imgInfo.indexs) ? imgInfo.indexs.split(',') : [],
            imgInfo.markUrl
          )
        } else {
          dialogLoading.value = false
        }
      })
      .catch(() => {
        dialogLoading.value = false
      })
    return
  }
  if (props.canvasDialog.url) {
    dialogLoading.value = true
    setDetail(
      props.canvasDialog.url,
      props.canvasDialog.width,
      props.canvasDialog.height,
      props.canvasDialog.indexList && props.canvasDialog.indexList.length > 0
        ? props.canvasDialog.indexList
        : [],
      props.canvasDialog.markUrl
    )
  } else {
    dialogLoading.value = false
  }
})
function setDetail(url, width, height, indexList, markUrl) {
  imgUrl.value = url

  imgWidth.value = width
  imgHeight.value = height

  console.log('imgur', imgUrl.value, imgWidth.value, imgHeight.value)
  getCanvasWHFun().then(() => {
    // 获取画布
    canvas = document.getElementById('myCanvas')
    ctx = canvas.getContext('2d')
    canvas2 = document.getElementById('myCanvas2')
    ctx2 = canvas2.getContext('2d')
    canvas3 = document.getElementById('myCanvas3')
    ctx3 = canvas3.getContext('2d')
    nextTick(() => {
      getImageListFun()
        .then(() => {
          // 之前是否保存过区域，进行回显
          if (indexList && indexList.length > 0) {
            clickIndexList.value = JSON.parse(JSON.stringify(indexList))
            saveUrl.value = markUrl
            isSave.value = true
            drawFun('ctx')
          }
        })
        .catch(() => {
          dialogDesotry.value = true
          dialog.value.handleClose()
        })
      // 监听canvas的点击事件
      canvasClickFun()
    })
  })
}
// 未选择分割图片，弹窗关闭时进行提示
function handleClose() {
  if (dialogLoading.value) {
    return
  }
  if (isSave.value && clickIndexList.value && clickIndexList.value.length > 0 && saveUrl.value) {
    emits('updateFun', saveUrl.value, clickIndexList.value, isSave.value, redrawYellowUrl.value)
    dialogDesotry.value = true
    dialog.value.handleClose()
  } else {
    ElMessageBox.confirm(
      '您尚未确认保留区域，退出后将对您的操作不做保存，是否仍要退出？',
      '系统提示',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: '',
        customClass: ' drawer_systemBox3 hide_footer_line'
      }
    )
      .then(() => {
        dialogDesotry.value = true
        dialog.value.handleClose()
      })
      .catch(() => {})
  }
}
onBeforeUnmount(clearImgDataTimer)
</script>
<style lang="scss" scoped>
.dialog_content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.content_canvas {
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background: #f2f3f5;
}
#myCanvas3 {
  position: absolute;
  left: 0;
  top: 0;
  display: none;
}
#myCanvas2 {
  opacity: 0;
}
#myCanvas {
  background-repeat: no-repeat;
  background-size: contain;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateY(-50%) translateX(-50%);
}
:deep(.xm_element_dialog) {
  height: calc(100vh - 58px);
  margin: 58px 0 0 0;
  .el-dialog__header,
  .el-dialog__footer {
    display: none;
  }
  .el-dialog__body {
    padding: 60px 40px;
    width: 100%;
    height: 100%;
  }
}
.content_tip {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  text-align: center;
  line-height: 60px;
}
.content_close {
  position: absolute;
  right: 0;
  top: 0;
  padding: 20px 40px;
  img {
    width: 24px;
    height: 24px;
    cursor: pointer;
    display: flex;
  }
}
.content_btn {
  padding-top: 36px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  .left_btn {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 0 16px;
    height: 32px;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 16px;
    font-weight: 400;
    font-size: 12px;
    color: #606266;
    line-height: 18px;
    .btn_icon {
      width: 20px;
      height: 20px;
      cursor: pointer;
      display: flex;
    }
    .btn_btn {
      cursor: pointer;
    }
    .btn_line {
      width: 1px;
      height: 12px;
      background: rgba(0, 0, 0, 0.2);
      margin: 0 8px;
    }
  }
  .right_btn {
    cursor: pointer;
    margin-left: 16px;
    width: 104px;
    height: 32px;
    background: #3865f3;
    border-radius: 16px;
    text-align: center;
    line-height: 32px;
    font-weight: 400;
    font-size: 12px;
    color: #ffffff;
  }
}
.dis_btn {
  .btn_icon,
  .btn_btn {
    opacity: 0.3;
  }
  .right_btn {
    cursor: not-allowed;
    opacity: 0.3;
  }
}
.myCanvas_back {
  background-repeat: no-repeat;
  background-size: contain;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateY(-50%) translateX(-50%);
}
.myCanvas_backImg {
  display: flex;
  object-fit: contain;
}
</style>
