<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    title="导入酷家乐视频"
    width="540px"
    custom-class="daoruKJL_dialog"
  >
    <template #title>
      <div class="title_box">
        <div>导入酷家乐视频</div>
        <el-link class="title_btn" @click="toRecord" type="primary">导入记录</el-link>
      </div>
    </template>
    <el-form :model="form" :rules="rules" ref="ruleForm" label-width="100px">
      <el-form-item label="酷家乐账号" prop="openId">
        <el-select filterable v-model="form.openId" placeholder="请选择" clearable>
          <el-option
            v-for="item in selectData"
            :key="item.openId"
            :label="item.accountName"
            :value="item.openId"
          ></el-option>
        </el-select>
        <el-link type="primary" style="margin: 0 10px" @click="toAuth">去授权</el-link>
        <el-link type="primary" @click="refreshAccount">刷新</el-link>
      </el-form-item>
      <el-form-item label="拉取条数">
        <el-input
          style="width: 380px"
          oninput="value=value.replace(/[^\d]/g,'')"
          @blur="retEmit($event)"
          v-model.trim="form.bigPullNum"
          placeholder="本次导入最大拉取条数，默认100，每次最多拉取500条"
        ></el-input>
      </el-form-item>
      <el-form-item label="自动打标签">
        <el-input
          style="width: 380px"
          @blur="retEmitEmj($event)"
          v-model.trim="form.tag"
          placeholder="多个标签请用英文逗号隔开"
        ></el-input>
        <!-- <el-select-v2
          ref="selectForm"
          style="width: 320px"
          v-model="form.tagList"
          multiple
          filterable
          allow-create
          default-first-option
          :reserve-keyword="false"
          placeholder="请选择标签"
          :filter-method="filterMethods"
          @change="changeMethods"
          :options="tagList"
        >
          </el-select-v2> -->
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button :disabled="btnDis" @click="closeDialog">取消</el-button>
        <el-button type="primary" :disabled="btnDis" :loading="loading" @click="handleConfirm">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { getKujialeAuthInfoList } from '@/api/system_setting/authorization'
import { importKJL } from '@/api/content_center/content_repository.js'
import { throttle } from '@/utils/tools.js'
const store = useStore()
const systemVersion = computed(() => store.state.user.systemVersion)

const props = defineProps({
  addDialog: {
    type: Object,
    default: () => {
      return {
        show: true // 是否显示弹窗
      }
    },
    required: true
  },
  version: {
    type: Object,
    default: () => {
      return 2
    }
  }
})
const dialog = ref()
const show = toRef(props.addDialog, 'show')
const version = toRef(props, 'version')
const loading = ref(false)
const form = ref({
  labelList: [],
  tag: '',
  bigPullNum: '',
  openId: '',
  importType: 1
})
const rules = {
  openId: [{ required: true, message: '请选择酷家乐账号', trigger: 'blur' }]
}
const selectData = ref([])

// 检查是否超出500
function retEmit(e) {
  console.log(e.target.value)
  const data = e.target.value
  if (data) {
    if (parseInt(data) > 500) {
      form.value.bigPullNum = 500
    } else if (parseInt(data) <= 0) {
      form.value.bigPullNum = ''
    } else {
      form.value.bigPullNum = parseInt(data)
    }
  }
}
// 检查是否有表情包
function retEmitEmj(e) {
  const reg = /[^\u4e00-\u9fa5a-zA-Z0-9/,]/gi
  form.value.tag = e.target.value.replace(reg, '')
}
// 获取酷家乐账号
function getAccount() {
  const brandInfo = localStorage.getItem('brandInfo')
    ? JSON.parse(localStorage.getItem('brandInfo'))
    : {}
  getKujialeAuthInfoList({
    brandId: brandInfo.brandId || null
  })
    .then(res => {
      if (res.code === 0) {
        console.log(res)
        selectData.value = res.data || []
      } else {
        selectData.value = []
      }
    })
    .catch(() => {
      selectData.value = []
    })
    .finally(() => {
      btnDis.value = false
    })
}
getAccount()
const btnDis = ref(false)
// 刷新酷家乐账号
const refreshAccount = throttle(() => {
  btnDis.value = true
  form.value.openId = ''
  getAccount()
}, 700)
// 去授权
const toAuth = throttle(() => {
  window.open('/system_manage/tripartitlePlatform_auth?type=kjl', '_blank')
})
// 获取标签
// const tagList = ref([])
// function getTag() {
//   creationTagList({
//     orderSetting: '',
//     pageNo: 1,
//     pageSize: 1000,
//     searchCount: true,
//     tagName: ''
//   }).then(res => {
//     if (res.code === 0 && res.data) {
//       const list = res.data.records || []
//       list.forEach(x => {
//         x.label = x.name
//         x.value = x.name
//       })
//       tagList.value = list
//     }
//   })
// }
// getTag()
// const selectForm = ref(null)
const ruleForm = ref(null)
const emits = defineEmits(['showSuccessFun'])
// 弹窗的确定事件
const handleConfirm = throttle(() => {
  // console.log('新建：', selectForm.value)
  ruleForm.value.validate(valid => {
    if (valid) {
      loading.value = true
      const tagList = form.value.tag ? form.value.tag.split(';') : []
      if (tagList.length > 0) {
        form.value.labelList = [...new Set(tagList)].filter(x => x !== '')
      } else {
        form.value.labelList = []
      }

      importKJL(form.value)
        .then(res => {
          if (res.code === 0) {
            emits('showSuccessFun')
            dialog.value.handleClose()
            loading.value = false
          } else {
            loading.value = false
          }
        })
        .catch(() => {
          loading.value = false
        })
    }
  })
}, 700)
function closeDialog() {
  console.log(dialog.value)
  dialog.value.handleClose()
}
//
// function filterMethods(e) {
//   console.log('filter：', e)
// }
// function changeMethods(e) {
//   console.log('change：', e)
// }
const router = useRouter()
const toRecord = throttle(function () {
  console.log('version', version.value)
  let url = '/sumwhy_video/finish_product_store/import_record'
  if (version.value === 1) {
    url = '/content_center/work_library/import_record'
  }
  if (systemVersion.value === 1) {
    url = '/content_market/finish_product_store/import_record'
  }
  router.push({
    path: url
  })
  closeDialog()
}, 700)
</script>
<style lang="scss" scoped>
.error_text {
  color: #ff0000;
  margin-top: 8px;
}
.title_box {
  padding-right: 16px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  font-size: 16px;
  .title_btn {
    margin-left: 16px;
  }
}
</style>
