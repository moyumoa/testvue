<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    title="星力值管理"
    width="600px"
    custom-class="rule_setting_dialog show_header_line"
    append-to-body
  >
    <template #title>
      <div class="dialog_title">
        <div>星力值管理</div>
        <el-switch
          :disabled="editDisabled"
          v-model="form.opType"
          inline-prompt
          :width="45"
          :active-value="1"
          :inactive-value="2"
        ></el-switch>
      </div>
    </template>
    <div style="padding: 16px 32px 24px 12px" v-loading="loading">
      <el-form
        :model="form"
        :rules="rules"
        ref="ruleForm"
        label-width="170px"
        label-position="left"
        @submit.prevent
      >
        <el-form-item label="时间段限制" prop="time1" :label-width="100">
          <el-radio-group v-model="form.limitType" :disabled="disabled">
            <el-radio :label="1">每自然周</el-radio>
            <el-radio :label="2">每自然月</el-radio>
            <el-radio :label="3">每自然年</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="员工星力值使用上限" prop="limitNumber">
          <el-input-number
            :disabled="disabled"
            v-model="form.limitNumber"
            :min="0"
            :max="10000"
            controls-position="right"
          ></el-input-number>
        </el-form-item>
      </el-form>
      <!-- 分割线 -->
      <div class="middle_line">- 单个成员使用上限 -</div>
      <div
        v-infinite-scroll="loadMore"
        infinite-scroll-distance="20"
        :infinite-scroll-disabled="isFinished || listLoading"
        :infinite-scroll-immediate-check="false"
        class="other_box"
        id="scrollBox"
      >
        <!-- 新增的list -->
        <div
          class="other_line"
          v-for="(item, index) in list"
          :key="'other_line' + (item.userId || item.addId)"
        >
          <div class="other_line_item">
            <div class="other_label">成员：</div>
            <!--  -->
            <UserInfoSelect
              :info="item"
              :disabled="disabled"
              :list="list"
              @updateInfo="value => updateUserInfoSelect(value, index)"
            ></UserInfoSelect>
          </div>
          <div class="other_line_item">
            <div class="other_label">使用上限：</div>
            <el-input-number
              style="width: 100px"
              :disabled="disabled"
              :max="10000"
              :min="0"
              v-model="item.limitNum"
              controls-position="right"
            ></el-input-number>
          </div>
          <div :class="['btn', disabled ? 'disabled_class' : '']" @click="deleteItem(index)">
            删除
          </div>
        </div>
      </div>
      <div class="add_line_box">
        <div @click="addItem" :class="['add_line', disabled ? 'disabled_class' : '']">
          <img src="https://tagvv-1256030678.file.myqcloud.com/202503274r4zu.png" alt="" />
          添加成员
        </div>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button :disabled="btnDis || loading" @click="closeDialog">取消</el-button>
        <el-button
          type="primary"
          :disabled="btnDis || loading"
          :loading="btnLoading"
          @click="handleConfirm"
        >
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { throttle, isNotEmpty } from '@/utils/tools.js'
import {
  selectBrand,
  listUsersSumvideoConfig,
  updateUserSumvideoConfig
} from '@/api/system_setting/brand_info.js'
import { updateBrandConfig } from '@/api/system_setting/setting'
import UserInfoSelect from './userInfoSelect.vue'
const props = defineProps({
  computDialog: {
    type: Object,
    default: () => {
      return {
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const dialog = ref()

const show = toRef(props.computDialog, 'show')
const loading = ref(false) // 整个的loading
const btnDis = ref(false) // 按钮禁用
const btnLoading = ref(false) // 按钮Loaidng
const form = ref({
  opType: 2,
  limitType: 1,
  limitNumber: 1
})
const validateTime1 = (rule, value, callback) => {
  if (form.value.opType === 1) {
    if (isNotEmpty(form.value.limitType)) {
      callback()
    } else {
      callback(new Error('请选择时间段限制'))
    }
  } else {
    callback()
  }
}
const validateTime2 = (rule, value, callback) => {
  if (form.value.opType === 1) {
    if (isNotEmpty(form.value.limitNumber)) {
      callback()
    } else {
      callback(new Error('请填写星力值使用上限'))
    }
  } else {
    callback()
  }
}
const rules = {
  limitType: [
    { required: true, validator: validateTime1, message: '请选择时间段限制', trigger: 'change' }
  ],
  limitNumber: [
    { required: true, validator: validateTime2, message: '请填写星力值使用上限', trigger: 'change' }
  ]
}

// 星力值功能是否可以编辑  （只控制功能是否可以编辑  不控制功能是否开启）
const editDisabled = computed(() => {
  return form.value.sumvideoControlByBrand === 0
})
// 弹窗内容是否禁止修改
const disabled = computed(() => {
  // 开关是否打开 以及功能禁止关闭
  return form.value.opType === 2 || editDisabled.value
})

function init() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

init()
onMounted(() => {
  getBrandInfo()
  getRecords()
})

const ruleForm = ref(null)
const message = inject('$message')
// 弹窗的确定事件
/**
 * 获取品牌下的AI星力值配置信息
 */
function getBrandInfo() {
  // loading.value = true
  selectBrand({})
    .then(res => {
      if (res.code === 0) {
        // form.value = res.data
        if (res.data.sumvideoLimitConfig) {
          form.value = JSON.parse(res.data.sumvideoLimitConfig)
        }

        //
        // form.value= {
        //   opType:2,
        //   limitType:2,
        //   limitNumber: 2
        //
        // }
      }
    })
    .finally(() => {
      // loading.value = false
    })
}

const handleConfirm = throttle(() => {
  ruleForm.value.validate(async valid => {
    if (valid) {
      btnLoading.value = true
      Promise.all([
        // 更新配置
        updateBrandConfig({
          sumvideoLimitConfig: JSON.stringify(form.value)
        }),
        // 更新单独设置列表
        submitUpdateList()
      ]).then(resList => {
        if (resList.every(item => item.code === 0)) {
          message.success('保存成功')
          dialog.value.handleClose()
          btnLoading.value = false
        } else {
          btnLoading.value = false
        }
      })
    } else {
      setTimeout(() => {
        const isError = document.getElementsByClassName('is-error')
        if (isError && isError.length > 0) {
          document.querySelector('.layout_main').scrollTo(0, isError[0].offsetTop - 78)
          const errText = isError[0].innerText ? isError[0].innerText.split('\n') : []
          if (errText.length > 0) {
            message.warning(errText[errText.length - 1])
          }
        }
      }, 100)
    }
  })
}, 700)
function closeDialog() {
  console.log(dialog.value)
  dialog.value.handleClose()
}
const list = ref([]) // 成员列表

const isFinished = ref(false) // 是否加载完成
const listLoading = ref(false) // 是否加载中
const deleteList = ref([]) // 删除的列表
const pageSize = 10 // 每页条数
let pageNo = 1 // 当前页码
const brandId = localStorage.getItem('brandInfo')
  ? JSON.parse(localStorage.getItem('brandInfo')).brandId
  : null
const addItem = () => {
  if (disabled.value) return
  list.value.unshift({
    isAdd: true, // 这一项是否是本次新增的
    userId: '',
    addId: Date.now(),
    userBrandName: '',
    limitNum: 1
  })
  document.getElementById('scrollBox').scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth' // 使滚动平滑进行
  })
}
const deleteItem = index => {
  if (disabled.value) return
  if (!list.value[index].isAdd) {
    // 不是新增的记录一下
    deleteList.value.push(list.value[index])
  }
  list.value.splice(index, 1)
}
// 选中后更新信息
const updateUserInfoSelect = (value, index) => {
  if (disabled.value) return
  list.value[index] = {
    ...list.value[index],
    userId: value.userId,
    userBrandName: value.userBrandName,
    userPhone: value.userPhone,
    userInfoList: value.userInfoList
  }
}
const loadMore = () => {
  if (listLoading.value) return
  if (isFinished.value) return
  pageNo++
  getRecords()
}
const getRecords = () => {
  listLoading.value = true
  listUsersSumvideoConfig({
    brandId,
    pageNumber: pageNo,
    pageSize: pageSize
  })
    .then(res => {
      if (res.code === 0 || res.code === 200) {
        const { records, total } = res.data
        // 因为this.list 会新增与删除 所以需要判断是否已经加载完毕
        isFinished.value = (pageNo - 1) * pageSize + records.length >= total
        records.forEach(item => {
          item.userId = item.userId + '' // 统一转为字符串
          item.isAdd = false // 不是新增的
          item.limitNum = Number(item.limitNum)
          item.userInfoList = [item]
        })
        list.value = list.value.concat(records)
        // 如果没有就默认显示一组
        if (list.value.length <= 0) {
          list.value.unshift({
            isAdd: true, // 这一项是否是本次新增的
            userId: '',
            addId: Date.now(),
            userBrandName: '',
            limitNum: 1
          })
        }
      }
    })
    .finally(() => {
      listLoading.value = false
    })
}
// 修改单个列表
const submitUpdateList = () => {
  // 修改用户上限值
  const usersLimit = {}
  list.value
    .filter(item => isNotEmpty(item.userId) && isNotEmpty(item.limitNum))
    .forEach(item => {
      usersLimit[item.userId] = item.limitNum
    })
  return updateUserSumvideoConfig({
    brandId,
    channelUserIds: deleteList.value.map(item => item.userId),
    usersLimit: usersLimit
  })
}
</script>
<style lang="scss" scoped>
.dialog_title {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}
.middle_line {
  width: 100%;
  text-align: center;
  font-weight: 400;
  font-size: 14px;
  color: #909399;
  line-height: 20px;
}
.other_box {
  width: 100%;
  overflow-y: scroll;
  max-height: 180px;
  .other_line {
    width: 100%;
    display: flex;
    // justify-content: center;
    align-items: center;
    margin-top: 12px;
    .other_line_item {
      display: flex;
      align-items: center;
      margin-right: 8px;
      .other_label {
        min-width: 45px;
        margin-right: 8px;
        font-weight: 400;
        font-size: 14px;
        color: #323233;
        line-height: 20px;
        text-align: right;
      }
    }
    .btn {
      cursor: pointer;
      font-weight: 400;
      font-size: 14px;
      color: #364fcd;
      line-height: 20px;
    }
    .other_line_item + .other_line_item {
      margin-left: 24px;
    }
  }
}
.add_line_box {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.add_line {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: 400;
  font-size: 14px;
  color: #364fcd;
  line-height: 20px;
  margin: 12px auto;

  img {
    width: 20px;
    height: 20px;
    margin-right: 4px;
  }
}
.disabled_class {
  opacity: 0.5 !important;
  cursor: not-allowed !important;
}
</style>
