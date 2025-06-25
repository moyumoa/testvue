<template>
  <div class="create_activity">
    <div class="activity_form">
      <el-form ref="activtyForm" :model="data.activityInfo" :rules="rules" label-width="240px">
        <!-- 新建活动 -->
        <create-activity :activityInfo="data.activityInfo"></create-activity>
        <!-- 活动信息收集 -->
        <collect-information :activityInfo="data.activityInfo"></collect-information>
      </el-form>
      <div
        v-if="!data.activityInfo.disabled"
        class="detail_btn"
        :style="{
          left: `${isHideLeftMenu ? '0px' : isCollapse ? '210px' : '63px'}`,
          width: `calc(100% - ${isHideLeftMenu ? '0px' : isCollapse ? '210px' : '63px'})`
        }"
      >
        <el-button @click="closePage">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleConfirm">保存</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
// getAppointmentInfoById
import { saveOrUpdateAppointment, getAppointmentInfoById } from '@/api/market/business_tools.js'
import createActivity from './components/create.vue'
import collectInformation from './components/collect_information.vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
const message = inject('$message')
const router = useRouter()
const route = useRoute()
const store = useStore()
const activtyForm = ref(null)
const isCollapse = store.getters.isCollapse
const isHideLeftMenu = store.getters.isHideLeftMenu
const data = reactive({
  // disabled: false,
  activityId: null,
  uploadImgUrl: '/api/mission/file/upload', // 图片上传地址
  activityInfo: {
    title: '创建活动',
    name: '', // 活动标题
    originalPrice: '', // 服务原价
    sellingPrice: '', // 服务售价
    structureType: 1, // 活动页结构类型
    identity: '', // 自定义标识
    headImgList: [], // 图片列表 (活动头图)
    detailImgList: [], // 图文详情列表
    info: [] // 留资信息列表
  }
})
// 活动头图的验证
const validateHeadImg = (rule, value, callback) => {
  if (data.activityInfo.headImgList.length > 0) {
    callback()
  } else {
    callback(new Error('请上传活动头图'))
  }
}
// 图文详情的验证
const validateDetailImg = (rule, value, callback) => {
  if (data.activityInfo.detailImgList.length > 0) {
    callback()
  } else {
    callback(new Error('请上传图文详情'))
  }
}
// 服务原价的验证
const validatePrice1 = (rule, value, callback) => {
  if (data.activityInfo.originalPrice) {
    const regE = /^\d{1,9}$|^\d{1,9}[.]\d{1,2}$/
    if (data.activityInfo.originalPrice < 0) {
      return callback(new Error('输入的原价不能为负数'))
    } else if (regE.test(data.activityInfo.originalPrice) && data.activityInfo.originalPrice > 0) {
      callback()
    } else {
      return callback(new Error('输入的原价必须大于0，整数位不得超过9位，最多保留两位小数'))
    }
  } else {
    callback()
  }
}
// 服务售价的验证
const validatePrice2 = (rule, value, callback) => {
  if (data.activityInfo.sellingPrice) {
    const regE = /^\d{1,9}$|^\d{1,9}[.]\d{1,2}$/
    if (!data.activityInfo.originalPrice) {
      return callback(new Error('请先输入商品原价'))
    } else if (data.activityInfo.sellingPrice < 0) {
      return callback(new Error('输入的售卖价不能为负数'))
    } else if (regE.test(data.activityInfo.sellingPrice)) {
      if (
        parseFloat(data.activityInfo.sellingPrice) < parseFloat(data.activityInfo.originalPrice)
      ) {
        callback()
      } else {
        return callback(new Error('输入的售卖价应低于原价，整数位不得超过9位，最多保留两位小数'))
      }
    } else {
      return callback(new Error('输入的售卖价应低于原价，最多保留两位小数'))
    }
  } else {
    callback()
  }
}
// 留资列表的验证
const validateInfo = (rule, value, callback) => {
  if (data.activityInfo.info && data.activityInfo.info.length > 0) {
    callback()
  } else {
    return callback(new Error('请设置留资信息'))
  }
}
// 创建活动表单校验
const rules = {
  name: [{ required: true, message: '请输入任务标题', trigger: 'blur' }],
  activityHeadImg: [{ required: true, validator: validateHeadImg, trigger: 'change' }],
  activityDetailImg: [{ required: true, validator: validateDetailImg, trigger: 'change' }],
  structureType: [{ required: true, message: '请选择活动页结构', trigger: 'change' }],
  originalPrice: [{ required: false, validator: validatePrice1, trigger: 'blur' }],
  sellingPrice: [{ required: false, validator: validatePrice2, trigger: 'blur' }],
  info: [{ required: true, validator: validateInfo, trigger: 'blur' }]
}
// 保存按钮的loading状态
const saving = ref(false)
// 取消新建活动
function closePage() {
  console.log('取消')
  router.push({
    path: '/content_market/online_booking'
  })
}
// 确定创建活动的回调
function handleConfirm() {
  console.log('确定')
  activtyForm.value.validate(valid => {
    console.log(valid)
    if (valid) {
      console.log('验证通过')
      const activityInfo = JSON.parse(JSON.stringify(data.activityInfo))
      const originalPrice = activityInfo.originalPrice
        ? activityInfo.originalPrice * 100
        : activityInfo.originalPrice
      const presentPrice = activityInfo.sellingPrice
        ? activityInfo.sellingPrice * 100
        : activityInfo.sellingPrice
      const params = {
        id: data.activityId,
        activityTitle: activityInfo.name,
        activityHeadImg: JSON.stringify(activityInfo.headImgList),
        pictureDetail: JSON.stringify(activityInfo.detailImgList),
        originalPrice: originalPrice,
        presentPrice: presentPrice,
        activityPageStructure: activityInfo.structureType,
        customIdentity: activityInfo.identity
      }
      console.log('新建/跟新活动的请求参数', params)
      saving.value = true
      saveOrUpdateAppointment(params)
        .then(res => {
          message.success(res.msg)
          data.saving = false
          router.go(-1)
        })
        .catch(() => {
          data.saving = false
        })
    }
  })
}
// 获取
function getActivityInfo() {
  getAppointmentInfoById(data.activityId).then(res => {
    const info = res.data
    console.log(info)
    data.activityInfo.name = info.activityTitle // 活动标题
    data.activityInfo.originalPrice = info.originalPrice
      ? ((info.originalPrice * 1.0) / 100).toFixed(2)
      : info.originalPrice // 服务原价
    data.activityInfo.sellingPrice = info.presentPrice
      ? ((info.presentPrice * 1.0) / 100).toFixed(2)
      : info.presentPrice // 服务售价
    data.activityInfo.structureType = info.activityPageStructure // 活动页结构类型
    data.activityInfo.identity = info.customIdentity // 自定义标识
    data.activityInfo.headImgList = JSON.parse(info.activityHeadImg) // 图片列表 (活动头图)
    data.activityInfo.detailImgList = JSON.parse(info.pictureDetail) // 图文详情列表
    data.activityInfo.disabled = info.status === 1
    console.log(data.activityInfo)
  })
}
onMounted(() => {
  data.activityId = route.query.id
  if (route.query.id) {
    // data.disabled = true
    data.activityInfo.title = '编辑活动'
    getActivityInfo()
  }
})
</script>

<style lang="scss" scoped>
.create_activity {
  padding-bottom: 38px;
}
:deep .setting_block {
  background: #ffffff;
  border-radius: 4px;
  margin-bottom: 16px;
  min-width: 1270px;
  .setting_title {
    padding-left: 24px;
    line-height: 50px;
    font-weight: bold;
    border-bottom: 1px solid #e8e8e8;
    font-size: 18px;
    color: #323233;
  }
  .setting_main {
    padding: 32px 0;
    display: flex;
  }
  .tip {
    color: #c0c4cc;
    font-size: 14px;
  }
  .bottom_tip {
    color: #c0c4cc;
    font-size: 14px;
    line-height: 20px;
    margin-top: 4px;
  }
  .upload_list {
    display: flex;
    flex-wrap: wrap;
    .upload_item_wrapper {
      position: relative;
      flex-shrink: 0;
      width: 120px;
      height: 120px;
      margin-right: 12px;
      margin-bottom: 12px;
      .upload_item {
        cursor: pointer;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .close {
        cursor: pointer;
        position: absolute;
        top: -10px;
        right: -10px;
        font-size: 20px;
        color: #f56c6c;
      }
    }
  }
}
:deep .uploader {
  .upload_btn {
    width: 120px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    box-sizing: border-box;
    border: 1px dashed #d8d8d8;
    .upload_btn_text {
      font-size: 14px;
      margin-top: 5px;
      color: #333;
    }
  }
}
:deep .el-form-item__content {
  display: block;
  // flex: 0 0 650px;
}
.detail_btn {
  z-index: 99;
  width: calc(100% - 210px);
  padding: 10px 0;
  background: #fff;
  position: fixed;
  left: 210px;
  bottom: 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
</style>
