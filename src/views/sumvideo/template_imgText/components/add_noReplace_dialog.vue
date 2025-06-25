<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    title="添加不可替换图片"
    width="560px"
    custom-class="xm_element_dialog"
    :before-close="handleClose"
  >
    <div class="dialog_content">
      <!-- 上传图片区域 -->
      <div class="upload_box">
        <div class="one_img" v-for="(item, index) in imgList" :key="index">
          <img class="img_cover" :src="item" alt="" />
          <!-- <el-image class="img_cover" :src="item" alt fit="cover" :preview-src-list="[item]">
            <template #error>
              <div class="img_cover errImg_box"></div>
            </template>
          </el-image> -->
          <div class="img_del" @click="delImgFun(index)">
            <img src="https://tagvv-1256030678.file.myqcloud.com/2024032998kkl.png" alt="" />
          </div>
        </div>
        <div
          class="one_upload"
          v-loading="uploadLoading"
          v-if="imgList && imgList.length < maxSize"
        >
          <uploadMaterial
            ref="uploadRef"
            :showLoading="false"
            :imgMaxSize="15360"
            :index="1"
            :limit="parseInt(maxSize - imgList.length)"
            :multiple="true"
            :acceptVideoImg="true"
            :commonErrTip="commonErrTip"
            v-model:uploadLoading="uploadLoading"
            @success="uploadSuccessFun"
            @error="uploadErrFun"
            :acceptTypeList="['image/jpeg', 'image/jpg', 'image/png']"
          >
            <div class="one_upload2">
              <el-icon class="icon-plus">
                <i-plus />
              </el-icon>
              <div>上传图片</div>
            </div>
          </uploadMaterial>
        </div>
      </div>
      <!-- 位置 -->
      <div class="form_box">
        <div class="form_label">不可替换图片位置：</div>
        <div class="form_content">
          <el-radio-group v-model="position">
            <el-radio :label="1">按顺序</el-radio>
            <el-radio :label="2">随机</el-radio>
          </el-radio-group>
        </div>
      </div>
    </div>
    <template #footer>
      <span class="dialog_footer">
        <div class="footer_left">
          最多添加数量：
          <span>{{ imgList.length || 0 }}</span>
          /{{ maxSize }}
        </div>
        <div class="footer_right">
          <el-button :disabled="btnDis" @click="closeDialog">取消</el-button>
          <el-button
            type="primary"
            :disabled="!(imgList && imgList.length > 0) || btnDis"
            :loading="btnLoading"
            @click="handleConfirm"
          >
            上传
          </el-button>
        </div>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import uploadMaterial from '@/views/sumvideo/components/material/upload_material_dialog.vue'
import { throttle } from '@/utils/tools'
const dialog = ref()

const props = defineProps({
  addDialog: {
    type: Object,
    default: () => {
      return {
        list: [], // 目前已上传的图片列表
        maxSize: null, // 最多添加的个数
        show: true // 是否显示弹窗
      }
    },
    required: true
  },
  imgLen: {
    type: Number,
    default: null
  }, // 图片总数
  previewImg: {
    type: Array,
    default: () => {
      return []
    }
  } // 预览的图片列表
})
const { show, list } = toRefs(props.addDialog)
const maxSize = ref()
onMounted(() => {
  console.log('xxx', props.imgLen, list.value.length)
  maxSize.value = props.imgLen - (list.value.length || 0)
})
const position = ref(1)
// -- 上传图片
const uploadLoading = ref(false)
// 上传失败的公共提示语
const commonErrTip = computed(() => {
  return `最多选择${parseInt(maxSize.value - imgList.value.length)}张图片，每张图片不超过15M`
})
const imgList = ref([])
watch(
  () => uploadLoading.value,
  val => {
    btnDis.value = val
  },
  {
    deep: true
  }
)

// 上传成功
function uploadSuccessFun(data) {
  console.log('上传成功', data)
  ;(data || []).forEach(item => {
    imgList.value.push(item.url)
  })
  uploadLoading.value = false
}
// 本地上传失败
function uploadErrFun() {
  console.log('上传失败')
  uploadLoading.value = false
}

// 删除图片
const delImgFun = throttle(i => {
  imgList.value.splice(i, 1)
}, 700)

// -- 上传图片 end

function closeDialog() {
  console.log(dialog.value)
  dialog.value.handleClose()
}
const emits = defineEmits(['updateFun'])

const message = inject('$message')
/**
 * @param {Array} arr - 范围
 * @param {Number} len -几个
 * @description 获取范围内的几个随机数
 * @returns 返回的数据
 */
function getRandomThree(arr, emptyIndexList) {
  // 创建一个包含数组索引的数组
  const indices = []
  for (let i = 0; i < arr.length; i++) {
    indices.push(i)
  }

  // 随机选择几个不同的索引
  const randomIndices = []
  while (randomIndices.length < emptyIndexList) {
    const randomIndex = Math.floor(Math.random() * indices.length)
    randomIndices.push(indices[randomIndex])
    indices.splice(randomIndex, 1) // 移除已选择的索引，避免重复
  }

  // 使用索引从数组中取出对应的几个数
  const result = []
  for (let i = 0; i < randomIndices.length; i++) {
    result.push(arr[randomIndices[i]])
  }

  return result
}
// 将一个数组顺序打乱
function ArrayShuffle(arr) {
  for (let i = 1; i < arr.length; i++) {
    const random = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[random]] = [arr[random], arr[i]]
  }
  return arr
}

// 弹窗的确定事件
const btnDis = ref(false) // 按钮是否禁用
const btnLoading = ref(false)
const handleConfirm = throttle(() => {
  if (btnLoading.value) return
  btnLoading.value = true
  const lastList = [] // 要返回的不可替换图片列表 按上传顺序排
  const previewList = [] // 要预览的图片列表 按index排
  const copyImgList = JSON.parse(JSON.stringify(imgList.value)) // 当前上传的图片列表 [url,url]
  const copyList = JSON.parse(JSON.stringify(list.value)) // 已经上传的图片列表 [{resourceUrl,index}]
  // 把两个图片列表合成一个
  imgList.value.forEach(x => {
    copyList.push({
      resourceUrl: x,
      index: null
    })
  })
  // 按顺序
  if (position.value === 1) {
    // 预览的图片区里，如果哪个位置没有图片，就按顺序填充进去
    props.previewImg.forEach((x, i) => {
      if (!x.url) {
        previewList.push({
          url: copyImgList.shift(),
          index: i
        })
      } else {
        previewList.push(x)
      }
    })
  } else {
    // 获取空余的位置index列表
    const emptyIndexList = []
    for (let i = 0; i < props.previewImg.length; i++) {
      if (!props.previewImg[i].url) {
        emptyIndexList.push(i)
      }
    }
    // 根据空余的位置，随机取对应的位置个数
    const showIndexList = getRandomThree(emptyIndexList, imgList.value.length)
    // 将上传的图片列表顺序打乱
    const getShuffleIndexList = ArrayShuffle(
      copyImgList.map((x, i) => {
        return i
      })
    )
    console.log('打乱后的位置顺序和图片顺序', showIndexList, getShuffleIndexList)
    // 根据获取到的位置进行图片填充
    props.previewImg.forEach((x, i) => {
      if (showIndexList.indexOf(i) > -1) {
        previewList.push({
          url: copyImgList[getShuffleIndexList.shift()],
          index: i
        })
      } else {
        previewList.push(x)
      }
    })
  }
  // 把图片列表的index依次填充 生成最后要返回的数据
  copyList.forEach(x => {
    const filterInfo = previewList.filter(y => x.resourceUrl === y.url)
    if (filterInfo && filterInfo.length > 0) {
      lastList.push({
        resourceUrl: filterInfo[0].url,
        index: filterInfo[0].index
      })
    }
  })
  nextTick(() => {
    console.log('上传成功', lastList, previewList)
    message.success('不可替换图片添加成功')
    emits('updateFun', lastList, previewList)
    dialog.value.handleClose()
  })
}, 700)

function handleClose(done) {
  if (uploadLoading.value) {
    message.warning('图片上传中，禁止关闭')
  } else {
    done()
  }
}
</script>
<style lang="scss" scoped>
.dialog_content {
  width: calc(100% + 16px);
  min-height: 240px;
  max-height: 400px;
  overflow-y: auto;
}
.upload_box {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
  .one_img {
    // cursor: pointer;
    margin: 0 12px 12px 0;
    width: 120px;
    height: 160px;
    border-radius: 2px;
    position: relative;
    .img_cover {
      border-radius: 2px;
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: flex;
      overflow-clip-margin: border-box;
      -webkit-overflow-clip-margin: border-box;
    }
    .img_del {
      position: absolute;
      right: 8px;
      bottom: 8px;
      width: 24px;
      height: 24px;
      cursor: pointer;
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.4);
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: flex;
      }
    }
  }
  .one_upload {
    margin: 0px 12px 12px 0;
    width: 120px;
    height: 160px;
    background: #ffffff;
    border-radius: 2px;
    border: 1px dashed #d8d8d8;
    overflow: hidden;

    .one_upload2 {
      width: 120px;
      height: 160px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      font-weight: 400;
      font-size: 12px;
      color: #909399;
      line-height: 18px;
    }
    .icon-plus {
      margin-bottom: 8px;
      color: #333;
      font-size: 18px;
    }
  }
}
.form_box {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  .form_label {
    margin-right: 8px;
    width: max-content;
    height: 20px;
    font-weight: 400;
    font-size: 14px;
    color: #303133;
    line-height: 20px;
  }
  .form_content {
    width: calc(100% - 140px);
  }
}
.dialog_footer {
  padding: 12px 0 0 16px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  .footer_left {
    font-weight: 400;
    font-size: 14px;
    color: #606266;
    line-height: 20px;
    display: flex;
    span {
      color: #364fcd;
      font-weight: 600;
    }
  }
}
</style>
