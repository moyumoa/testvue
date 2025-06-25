<template>
  <div class="cover_make_page">
    <!-- 标题和保存入口 -->
    <div class="page_top">
      <div class="top_left">
        <img
          class="logo"
          src="https://tagvv-1256030678.file.myqcloud.com/20231021mmzqw.png"
          alt=""
        />
        <div class="top_name">
          <div class="name_un_edit" v-if="!$data.showEditName">
            <div class="name_text">{{ form.name || '请输入封面名称' }}</div>
            <img
              @click="showEditFun"
              class="edit_icon"
              src="https://tagvv-1256030678.file.myqcloud.com/20231021q0ibz.png"
              alt=""
            />
          </div>
          <div class="name_edit" v-else>
            <el-input
              ref="editRef"
              maxlength="10"
              v-model.trim="form.name"
              placeholder="请输入封面名称"
              @blur="editNameBlur"
            ></el-input>
          </div>
        </div>
      </div>
      <div class="top_right">
        <el-button type="primary" :loading="$data.saveLoading" @click="saveFun">保存</el-button>
      </div>
    </div>
    <!-- 操作区 -->
    <div class="page_bottom">
      <div class="bottom_left">
        <!-- <div class="left_title">创意素材</div> -->
        <div class="left_content">
          <!-- 文字 -->
          <div class="left_content_title">
            <img
              class="left_content_title_icon"
              src="https://tagvv-1256030678.file.myqcloud.com/20231021yspog.png"
              alt=""
            />
            文字
          </div>
          <div class="left_content_content">
            <el-button class="left_content_btn" type="primary" @click="addTextFun">
              添加文字
            </el-button>
          </div>
          <!-- 图片 -->
          <div class="left_content_title">
            <img
              class="left_content_title_icon"
              src="https://tagvv-1256030678.file.myqcloud.com/20231021oxfgv.png"
              alt=""
            />
            图片
          </div>
          <imgMaterial
            ref="imgMaterialRef"
            :canvasW="$data.canvasW"
            :canvasH="$data.canvasH"
            @addImgFun="addImgFun"
          />
        </div>
      </div>
      <div class="bottom_right">
        <operationArea
          :origin="$data.origin"
          :canvasW="$data.canvasW"
          :canvasH="$data.canvasH"
          :form="form"
          :newForm="newForm"
          :fontList="$data.fontList"
          ref="areaRef"
          @updateImgMaterial="updateImgMaterial"
          @delElementFun="delElementFun"
          @updateFormInfo="updateFormInfo"
        />
      </div>
    </div>
    <!-- 保存期间禁止操作 -->
    <div class="dis_box" v-if="$data.saveLoading"></div>
  </div>
</template>
<script setup>
import { getFontList } from '@/api/sumvideo/creative_templateSpectroscope.js'
import html2canvas from 'html2canvas'
import { ElMessage } from 'element-plus'
import { coverDetail, saveCover, base64Img } from '@/api/sumvideo/cloud_cover_management.js'
import { getTextSize, getNewIndex } from './js/tool.js'
import { isEmpty, throttle } from '@/utils/tools.js'
import { useRoute, useRouter } from 'vue-router'
import imgMaterial from './components/img_material.vue'
import operationArea from './components/operation_area.vue'
const route = useRoute()
const router = useRouter()
const $data = reactive({
  canvasW: 375, // 画布宽度
  canvasH: 500, // 画布高度
  loading: false, // 页面加载的loading
  saveLoading: false, // 页面保存的loading
  origin: '', // 页面来源
  id: null, // 编辑时封面的ID
  showEditName: false, // 是否显示修改封面名称的Input
  editName: '', // 显示Input时保存的旧名称
  fontList: [] // 字体列表
})

const form = ref({
  name: '' // 封面名称
}) // 页面信息
const newForm = ref({})
const editRef = ref(null)
// 显示修改的输入框
const showEditFun = throttle(() => {
  $data.editName = form.value.name || ''
  $data.showEditName = true
  nextTick(() => {
    editRef.value.focus()
  })
}, 500)
// 修改封面名称
const editNameBlur = () => {
  const reg =
    // eslint-disable-next-line no-misleading-character-class
    /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi
  const value = form.value.name.replace(reg, '')
  if (isEmpty(value)) {
    form.value.name = $data.editName
  }
  $data.showEditName = false
  $data.editName = ''
  newForm.value.name = form.value.name
}

const areaRef = ref(null) // 操作区元素
// 添加文字
const addTextNum = ref(0)
const addTextFun = throttle(() => {
  addTextNum.value++
  // 添加文字之前需要判断当前是否有文字元素
  const param = {
    id: new Date().getTime(),
    active: true,
    backColour: '', // 阴影颜色
    backOpacity: 0, // 阴影透明度 0-100，0表示完全透明
    borderStyle: null, // 边框格式类型 1描边 3背景
    content: '星麦云封面制作', // 内容
    font: 'alibaba-sans', // 字体，取值和模板分镜-替换规则一致
    fontColor: '#000000', // 字体颜色
    fontColorOpacity: 100, //	透明度 0-100，0表示完全透明
    fontFace: {
      bold: false, //	加粗
      italic: false, //	斜体
      underline: false //	下划线
    },
    fontSize: 32, // 字号
    level: getNewIndex(form.value), //	图层层级，数值越大越上层，数值小的会被遮盖
    lineSpacing: 0, // 行距
    locked: 0, //	0图层未锁定 1图层已锁定齐
    outline: 0, //	描边宽度
    outlineColour: '', // 描边颜色，16进制值
    outlineOpacity: 0, //	边透明度 0-100，0表示完全透明
    shadow: 0, //	阴影偏移
    spacing: 0, // 字间距
    x: 0, // 文字左上角距离画布左上角的 x 坐标
    y: 0 //	文字左上角距离画布左上角的 y 坐标，例:（0,0）表示文字和画布左上角对齐
  }
  const whInfo = getTextSize(
    param.content,
    param.fontSize,
    param.lineSpacing,
    $data.canvasW,
    $data.canvasH,
    addTextNum.value
  )
  param.width = whInfo.width
  param.height = whInfo.height
  param.x = whInfo.x
  param.y = whInfo.y
  if (form.value && form.value.textStyle && form.value.textStyle.length > 0) {
    form.value.textStyle.push(param)
    newForm.value.textStyle.push(JSON.parse(JSON.stringify(param)))
  } else {
    form.value.textStyle = [param]
    newForm.value.textStyle = [JSON.parse(JSON.stringify(param))]
  }
  nextTick(() => {
    // 修改选中的元素，显示对应的工具栏，并给新添加的元素设为活跃状态
    areaRef.value.changeActiveFun('text', form.value.textStyle.length - 1, true)
    areaRef.value.clearActiveFun(false, form.value.textStyle.length - 1, 'text')
  })
}, 500)
// 添加图片
const addImgFun = throttle(e => {
  console.log('添加图片', e)
  // 添加文字之前需要判断当前是否有文字元素
  const param = {
    id: new Date().getTime(),
    active: true,
    flip: '', // horizontal:水平翻转   vertical:竖直翻转  空表示无翻转
    height: e.height, // 图片高，相对于 1080*1920 画布的，放大或缩小后的实际高
    level: getNewIndex(form.value), // 图层层级，数值越大越上层，数值小的会被遮盖
    locked: 0, // 0图层未锁定  1图层已锁定
    tagvvMediaId: e.tagvvMediaId, // 内容中台素材id
    url: e.url, // 图片地址
    width: e.width, // 图片宽，相对于 1080*1920 画布的，放大或缩小后的实际宽
    x: e.x, // 图片左上角距离画布左上角的 x 坐标
    y: e.y // 图片左上角距离画布左上角的 y 坐标，例:（0,0）表示图片和画布左上角对齐
  }
  if (form.value && form.value.imageStyle && form.value.imageStyle.length > 0) {
    form.value.imageStyle.push(param)
    newForm.value.imageStyle.push(JSON.parse(JSON.stringify(param)))
  } else {
    form.value.imageStyle = [param]
    newForm.value.imageStyle = [JSON.parse(JSON.stringify(param))]
  }

  nextTick(() => {
    // 修改选中的元素，显示对应的工具栏，并给新添加的元素设为活跃状态
    areaRef.value.changeActiveFun('image', form.value.imageStyle.length - 1, true)
    areaRef.value.clearActiveFun(false, form.value.imageStyle.length - 1, 'image')
  })
}, 500)

// 更新图片元素库
const imgMaterialRef = ref(null)
function updateImgMaterial() {
  imgMaterialRef.value.resetSearch()
}
// 删除元素
function delElementFun(index, type) {
  areaRef.value.clearActiveFun(true, null, '')
  const nwF = JSON.parse(JSON.stringify(form.value))
  const nwF1 = JSON.parse(JSON.stringify(newForm.value))
  console.log('delElementFun', index, type)
  nextTick(() => {
    if (type === 'text') {
      nwF.textStyle.forEach(x => {
        if (x.level > nwF.textStyle[index].level) {
          x.level -= 1
        }
      })
      nwF1.textStyle.forEach(x => {
        if (x.level > nwF1.textStyle[index].level) {
          x.level -= 1
        }
      })
      nwF.textStyle.splice(index, 1)
      nwF1.textStyle.splice(index, 1)
    } else {
      nwF.imageStyle.forEach(x => {
        if (x.level > nwF.imageStyle[index].level) {
          x.level -= 1
        }
      })
      nwF1.imageStyle.forEach(x => {
        if (x.level > nwF.imageStyle[index].level) {
          x.level -= 1
        }
      })
      nwF.imageStyle.splice(index, 1)
      nwF1.imageStyle.splice(index, 1)
    }

    form.value = nwF
    newForm.value = nwF1
  })
}
// 更新form数据
function updateFormInfo(data, index, type) {
  if (type === 'text') {
    newForm.value.textStyle[index].x = data.left
    newForm.value.textStyle[index].y = data.top
    // newForm.value.textStyle[index].width = data.width
    // newForm.value.textStyle[index].height = data.height
    nextTick(() => {
      // text位置更新后，文本输入框的位置也要跟着变
      areaRef.value.changeReplaceTopFun(index)
    })
  } else {
    newForm.value.imageStyle[index].x = data.left
    newForm.value.imageStyle[index].y = data.top
    newForm.value.imageStyle[index].width = data.width
    newForm.value.imageStyle[index].height = data.height
  }
  console.log('更新form数据', data, index, type, newForm.value)
}
// 获取封面详情
function getDetail() {
  $data.loading = true
  coverDetail({
    id: $data.id
  })
    .then(res => {
      console.log('res')
      if (res.code === 0) {
        const data = res.data || {}
        if (data.textStyle && data.textStyle.length > 0) {
          recalculateFun('text', false, data)
        }
        if (data.imageStyle && data.imageStyle.length > 0) {
          recalculateFun('image', false, data)
        }
        if (data.backgroundStyle && data.backgroundStyle.url) {
          recalculateFun('back', false, data)
        }
        form.value = data
        newForm.value = JSON.parse(JSON.stringify(data || {}))
      }
      $data.loading = false
    })
    .catch(() => {
      console.log('catch')
      $data.loading = false
    })
}
onMounted(() => {
  $data.id = route.query.id || null
  $data.origin = route.query.origin || 'cover_management'
  form.value.coverType = $data.origin === 'cloud_cover_management' ? 1 : 2
  newForm.value.coverType = $data.origin === 'cloud_cover_management' ? 1 : 2
  if ($data.id) {
    getDetail()
  }
  getFontFun()
})

const saveFun = throttle(() => {
  $data.saveLoading = true
  areaRef.value.clearActiveFun(true)
  nextTick(async () => {
    // if (!newForm.value.name) {
    //   newForm.value.name = '未命名封面'
    // }

    if (
      !(
        (newForm.value.textStyle && newForm.value.textStyle.length > 0) ||
        (newForm.value.imageStyle && newForm.value.imageStyle.length > 0)
      )
    ) {
      ElMessage.warning('请先制作封面')
      $data.saveLoading = false
      return
    }
    if (newForm.value.backgroundStyle && newForm.value.backgroundStyle.url) {
      recalculateFun('back', true, newForm.value)
    }
    if (newForm.value.textStyle && newForm.value.textStyle.length > 0) {
      recalculateFun('text', true, newForm.value)
    }
    if (newForm.value.imageStyle && newForm.value.imageStyle.length > 0) {
      recalculateFun('image', true, newForm.value)
    }

    const canvas = await autoPicture(`canvasId`, { width: $data.canvasW, height: $data.canvasH })
    if (canvas) {
      base64Img({
        base64: canvas
      })
        .then(res => {
          if (res.code === 0) {
            newForm.value.cover = res.data || ''
            SaveReq()
          } else {
            $data.saveLoading = false
          }
        })
        .catch(() => {
          $data.saveLoading = false
        })
    } else {
      ElMessage.warning('封面合成失败')
      $data.saveLoading = false
    }
  })
}, 500)
function SaveReq() {
  saveCover(newForm.value)
    .then(res => {
      if (res.code === 0) {
        ElMessage.success('保存成功')
        router.go(-1)
      }
      $data.saveLoading = false
    })
    .catch(() => {
      $data.saveLoading = false
    })
}
// 重新计算x,y,w,h 按照375->1080 500->1920的比例换算 如果是375->1080，那文本宽度需要-12 x需要+6 因为UI界面绘制上文字左右各有6px的间距 反之一样
// type：类型 text 文字 image 图片 toLarget： 是否从小到大的换算规则
function recalculateFun(type, toLarge, data) {
  if (type === 'text') {
    if (toLarge) {
      data.textStyle.forEach(x => {
        x.x = x.x * 2.88
        x.y = x.y * 2.88
      })
    } else {
      data.textStyle.forEach(x => {
        x.active = false
        x.x = x.x / 2.88
        x.y = x.y / 2.88
      })
    }
  } else if (type === 'image') {
    if (toLarge) {
      data.imageStyle.forEach(x => {
        if (x.width) {
          x.width = x.width * 2.88
          x.height = x.height * 2.88
        }
        x.x = x.x * 2.88
        x.y = x.y * 2.88
      })
    } else {
      data.imageStyle.forEach(x => {
        x.active = false
        if (x.width) {
          x.width = x.width / 2.88
          x.height = x.height / 2.88
        }
        x.x = x.x / 2.88
        x.y = x.y / 2.88
      })
    }
  } else {
    if (toLarge) {
      data.backgroundStyle.width = data.backgroundStyle.width * 2.88
      data.backgroundStyle.height = data.backgroundStyle.height * 2.88
      data.backgroundStyle.x = data.backgroundStyle.x * 2.88
      data.backgroundStyle.y = data.backgroundStyle.y * 2.88
    } else {
      data.backgroundStyle.width = data.backgroundStyle.width / 2.88
      data.backgroundStyle.height = data.backgroundStyle.height / 2.88
      data.backgroundStyle.x = data.backgroundStyle.x / 2.88
      data.backgroundStyle.y = data.backgroundStyle.y / 2.88
    }
  }
}
const autoPicture = async (el, options) => {
  const {
    scale = 1,
    allowTaint = false,
    useCORS = true,
    width = '375',
    height = '500',
    backgroundColor = null
  } = options
  const id = document.getElementById(el)
  const canvas = await html2canvas(id, {
    scale, // 缩放比例,默认为1
    allowTaint, // 是否允许跨域图像污染画布
    useCORS, // 是否尝试使用CORS从服务器加载图像
    width, // 画布的宽度
    height, // 画布的高度
    backgroundColor // 画布的背景色，默认为透明
  })
  return canvas.toDataURL('image/png')
}
// const shareImg = async index => {

//   let canvas = await autoPicture(`capture${index}`, {width: $data.canvas, height:$data.canvasH })
//   if (canvas) {
//     currentImg.value = canvas
//     show.value = true
//     // canvas为转换后的Canvas对象
//     let oImg = new Image()
//     oImg = currentImg.value // 导出图片
//     console.log(oImg)
//     var oA = document.createElement('a')
//     oA.download = '分享内容' // 设置下载的文件名，默认是'下载'
//     oA.href = oImg
//     document.body.appendChild(oA)
//     oA.click()
//     oA.remove() // 下载之后把创建的元素删除
//   }

// 获取字体列表
function getFontFun() {
  getFontList({
    applyType: 2,
    orderSetting: '',
    pageNo: 1,
    pageSize: 1000,
    searchCount: true
  }).then(res => {
    if (res.code === 0) {
      const list = res.data.records || []
      $data.fontList = list
    }
  })
}
</script>
<style lang="scss" scoped>
@import './scss/index.scss';
.dis_box {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
.cover_make_page {
  position: relative;
}
</style>
