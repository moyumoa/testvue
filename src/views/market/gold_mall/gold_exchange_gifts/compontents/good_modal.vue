<template>
  <div class="good_modal page_detail">
    <el-dialog
      ref="dialog"
      v-model="goodModal.show"
      :title="goodModal.title"
      top="8vh"
      width="720px"
    >
      <div class="dialog_content">
        <el-form :model="form" :rules="rules" ref="ruleForm" label-width="137px">
          <el-form-item label="商品名称" prop="goodsName">
            <el-input
              @blur="retEmit($event)"
              :disabled="props.goodModal.isOpen"
              class="width400"
              maxlength="20"
              v-model="form.goodsName"
              show-word-limit
              placeholder="请输入商品名称"
            ></el-input>
          </el-form-item>
          <el-form-item label="商品图片" prop="goodsImg">
            <div>
              <div class="mark" style="line-height: 32px">
                商品主图宽度为750px，高度为750px；图片大小不得大于2M，支持png、jpg、jpeg。
              </div>
              <div class="file_box">
                <div class="one_file" v-if="form.goodsImg">
                  <img class="file_cover" :src="form.goodsImg" alt />
                  <div class="file_action">
                    <div class="check_icon" @click="showFile(form.goodsImg)">预览</div>
                    <div
                      class="del_icon"
                      @click="form.goodsImg = ''"
                      v-if="!props.goodModal.isOpen"
                    >
                      <img src="@/assets/images/operate/inspection_del.png" alt />
                    </div>
                  </div>
                </div>
                <el-upload
                  v-loading="imgLoading"
                  v-if="!form.goodsImg"
                  :show-file-list="false"
                  accept="image/jpeg, image/jpg, image/png"
                  :action="action"
                  list-type="picture"
                  :on-success="handleSuccess"
                  :on-error="handleError"
                  :before-upload="fire => beforeUploadFile(fire, 'goodsImg')"
                >
                  <div class="upload_text">
                    <img src="@/assets/images/operate/inspection_add.png" alt />
                    商品图片
                  </div>
                </el-upload>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="商品详情">
            <div>
              <div class="mark" style="line-height: 32px">
                商品详情宽度为750px，高度为950px；图片大小不得大于2M，支持png、jpg、jpeg。
              </div>
              <div class="file_box">
                <div class="one_file" v-for="(item, index) in form.goodsDetail" :key="item">
                  <img class="file_cover" :src="item" alt />
                  <div class="file_action">
                    <div class="check_icon" @click="showFile(item)">预览</div>
                    <div class="del_icon" @click="delFile(index)" v-if="!props.goodModal.isOpen">
                      <img src="@/assets/images/operate/inspection_del.png" alt />
                    </div>
                  </div>
                </div>
                <el-upload
                  v-loading="detailLoading"
                  v-if="form.goodsDetail?.length < 3"
                  :show-file-list="false"
                  accept="image/jpeg, image/jpg, image/png"
                  :action="action"
                  list-type="picture"
                  :on-success="handleDetailSuccess"
                  :on-error="handleError"
                  :before-upload="fire => beforeUploadFile(fire, 'goodsDetail')"
                >
                  <div class="upload_text">
                    <img src="@/assets/images/operate/inspection_add.png" alt />
                    商品详情
                  </div>
                </el-upload>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="商品属性" class="hide_require">
            <el-radio-group v-model="form.goodsType" :disabled="goodModal.isEdit">
              <el-radio :label="0">实物商品</el-radio>
              <el-radio :label="1">虚拟商品</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="商品价格" prop="oldPrice" class="hide_require">
            <el-input
              :disabled="props.goodModal.isOpen"
              type="number"
              class="width400"
              v-model="form.oldPrice"
              placeholder="请输入商品人民币价格(仅作为参考展示)"
            ></el-input>
          </el-form-item>
          <el-form-item label="兑换金币" prop="needGoldNum">
            <el-input
              :disabled="props.goodModal.isOpen"
              type="number"
              class="width240"
              v-model="form.needGoldNum"
              placeholder="请输入兑换金币数"
            ></el-input>
          </el-form-item>
          <el-form-item label="金币类型">
            <el-select
              placeholder="请选择"
              v-model="form.goldTypeId"
              :disabled="props.goodModal.isOpen"
              class="width240"
            >
              <el-option label="不限" value="-1"></el-option>
              <el-option
                v-for="item in goldTypeList"
                :key="item.value"
                :label="`${item.name}（${expiredValueFilter(item.expiredValue)}）`"
                :value="item.id"
                :disabled="item.isValid === 0"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="库存" prop="stock">
            <el-input
              type="number"
              class="width240"
              v-model="form.stock"
              placeholder="请输入库存"
            ></el-input>
          </el-form-item>
          <el-form-item label="秒杀商品" prop="isSecKill">
            <el-switch
              :model-value="form.isSecKill"
              :disabled="props.goodModal.isOpen"
              inline-prompt
              active-text="开"
              inactive-text="关"
              @click="toggleSecKill"
            ></el-switch>
          </el-form-item>
          <el-form-item v-if="form.isSecKill" label="秒杀金币价格" prop="secKillPrice">
            <el-input
              :disabled="props.goodModal.isOpen"
              type="number"
              class="width240"
              v-model="form.secKillPrice"
              placeholder="秒杀价格需低于正常价格"
            ></el-input>
          </el-form-item>
          <el-form-item label="可兑换时间" prop="time">
            <el-date-picker
              :disabled="props.goodModal.isOpen"
              v-model="form.time"
              style="width: 400px"
              type="datetimerange"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              range-separator="至"
              :editable="false"
              :default-time="DefaultSetting.defaultTime"
              :disabled-date="
                time => {
                  return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
                }
              "
            ></el-date-picker>
            <!-- <p style="font-size: 12px; color: #c0c4cc">若设置了为秒杀商品，则必须设置可兑换时间</p> -->
          </el-form-item>
          <el-form-item
            label="可见范围"
            :prop="KOCInfo.hasKOC && KOCInfo.isValid ? 'goodsMarketList' : 'goodsMarket'"
          >
            <!-- 有开通小程序 并且 授权有效  或者  已经开启兑换并且可见范围包含KOC的 的才显示 -->
            <el-checkbox-group
              v-if="
                (KOCInfo.hasKOC && KOCInfo.isValid) ||
                (props.goodModal.isOpen && form.goodsMarketList.includes(2))
              "
              v-model="form.goodsMarketList"
              :disabled="props.goodModal.isOpen"
            >
              <el-checkbox :label="1">KOS成员</el-checkbox>
              <el-checkbox :label="2">KOC成员</el-checkbox>
            </el-checkbox-group>
            <div v-if="form.goodsMarketList.includes(1)">
              <choose_dept_search
                :shootDeptSearch="true"
                ref="chooseDeptSearchRef"
                @updateDeptIds="onChangeCascader"
                :multiple="true"
                :isUsePermission="false"
                searchLabel="组织架构"
                :defaultValue="showDeptIds"
                :disabled="props.goodModal.isOpen"
              />
              <div class="mark" style="margin-top: 8px">
                *仅选中的部门及子部门的成员可见且可兑换，不选则默认全部可见
              </div>
            </div>
          </el-form-item>
          <el-form-item label="限购" prop="limitExchangeTimes" class="hide_require">
            <el-input
              :disabled="props.goodModal.isOpen"
              type="number"
              class="width240"
              v-model="form.limitExchangeTimes"
              placeholder="输入限购次数，默认不限购"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" :loading="loading" @click="handleConfirm">
            {{ goodModal.isEdit ? '确认' : '确认' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog title="查看附件" v-model="checkDialog" destroy-on-close>
      <div class="check_modal">
        <img :src="dialogFile" alt />
      </div>
    </el-dialog>
  </div>
</template>
<script setup>
import { dateFormat, throttle, isEmpty, isNotEmpty } from '@/utils/tools.js'
import { getGoldList, saveGood, updateGood } from '@/api/market/gold_exchange_gifts.js'
import { ElMessage } from 'element-plus'
import { useStore } from 'vuex'
const props = defineProps({
  goodModal: {
    type: Object,
    default: function () {
      return {
        show: false,
        data: null,
        title: '新建商品',
        isEdit: false,
        isOpen: false // 是否开启兑换
      }
    }
  }
})
const goodModal = toRef(props, 'goodModal')
const store = useStore()
const KOCInfo = computed(() => store.state.app.KOCInfo)

const action = '/api/mission/file/upload'
const message = inject('$message')
const dialog = ref(null) // ==$refs.dialog
const ruleForm = ref(null)
const loading = ref(false) // 弹窗的Loading
const imgLoading = ref(false) // 附件的loading
const detailLoading = ref(false) // 商品详情loading

// 表单相关数据
const form = reactive({
  goodsName: '', // 商品名称
  goodsImg: '', // 商品图片--接口所需要字段
  goodsDetail: [], // 商品详情接口
  oldPrice: null, // 商品价格
  goodsType: 0, // 商品类型 0 实物商品 1 虚拟商品
  goodsPrice: null, // 商品价格--以分为单位
  needGoldNum: null, // 兑换金币
  goldTypeId: '-1', // 金币类型
  goodsMarketList: [1], // 可见范围 1 KOS 2 KOC
  stock: null, // 库存
  time: '', // 可兑换时间
  startExchangeTime: '', // 可兑换时间--开始
  endExchangeTime: '', // 可兑换时间--结束
  deptIds: [],
  limitExchangeTimes: null // 限购
})
const showDeptIds = ref([])
// 默认时间
const DefaultSetting = reactive({
  defaultTime: [new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59)]
})
// 表单规则
const validateImg = (rule, value, callback) => {
  if (form.goodsImg) {
    callback()
  } else {
    return callback(new Error('请上传商品图片'))
  }
}
const validatePrice = (rule, value, callback) => {
  if (form.oldPrice != null && form.oldPrice !== '' && form.oldPrice !== undefined) {
    const regE = /^([1-9]\d*(\.\d{1,2})?|([0](\.([0][1-9]|[1-9]\d{0,1}))))$/
    if (regE.test(form.oldPrice)) {
      if (form.oldPrice > 999999) {
        return callback(new Error('商品价格最大为999999'))
      } else {
        callback()
      }
    } else {
      return callback(new Error('商品价格必须大于0，最多显示2位小数'))
    }
  } else {
    callback()
  }
}
const validateSeckillGold = (rule, value, callback) => {
  const regE = /^[1-9]\d*$/g
  if (regE.test(form.secKillPrice)) {
    if (Number(form.secKillPrice) >= Number(form.needGoldNum)) {
      return callback(new Error('秒杀价格需低于正常价格'))
    } else if (form.secKillPrice > 999999) {
      return callback(new Error('金币数最大为999999'))
    } else {
      callback()
    }
  } else {
    return callback(new Error('请输入秒杀金币价数，金币数为正整数'))
  }
}
const validateGold = (rule, value, callback) => {
  const regE = /^[1-9]\d*$/g
  if (regE.test(form.needGoldNum)) {
    if (form.needGoldNum > 999999) {
      return callback(new Error('金币数最大为999999'))
    } else {
      callback()
    }
  } else {
    return callback(new Error('请输入兑换金币数，金币数为正整数'))
  }
}
const validateStock = (rule, value, callback) => {
  const regE = /^[0-9]\d*$/g
  if (regE.test(form.stock)) {
    if (form.stock > 999999) {
      return callback(new Error('库存最大为999999'))
    } else {
      callback()
    }
  } else {
    return callback(new Error('请输入库存，库存为非负整数'))
  }
}
const validateLimit = (rule, value, callback) => {
  if (
    form.limitExchangeTimes != null &&
    form.limitExchangeTimes !== '' &&
    form.limitExchangeTimes !== undefined
  ) {
    const regE = /^[0-9]\d*$/g
    if (regE.test(form.limitExchangeTimes)) {
      if (form.limitExchangeTimes > 999999) {
        return callback(new Error('限购次数最大为999999'))
      } else {
        callback()
      }
    } else {
      return callback(new Error('限购次数必须是非负整数'))
    }
  } else {
    callback()
  }
}

const validateGoodMarket = (rule, value, callback) => {
  console.log('校验可见范围', form.goodsMarketList)
  if (isEmpty(form.goodsMarketList)) {
    return callback(new Error('请选择可见范围'))
  }
  callback()
}

const rules = {
  goodsName: [
    {
      required: true,
      message: '请输入商品名称，最多20个字符',
      trigger: 'blur'
    },
    {
      min: 1,
      max: 20,
      message: '请输入商品名称，最多20个字符',
      trigger: 'blur'
    }
  ],
  goodsImg: [{ required: true, validator: validateImg, trigger: 'change' }],
  oldPrice: [{ required: true, validator: validatePrice, trigger: 'change' }],
  secKillPrice: [{ required: true, validator: validateSeckillGold, trigger: 'change' }],
  needGoldNum: [{ required: true, validator: validateGold, trigger: 'change' }],
  stock: [{ required: true, validator: validateStock, trigger: 'change' }],
  limitExchangeTimes: [{ required: true, validator: validateLimit, trigger: 'change' }],
  goodsMarketList: [{ required: true, validator: validateGoodMarket, trigger: 'change' }]
}

const emits = defineEmits(['updateList'])

const backShowData = ref([])

function getNumberId(id) {
  if (!id) return id
  return Number(id)
}

// 选择组织架构
function onChangeCascader(e) {
  form.deptIds = e || []
}

function toggleSecKill() {
  if (props.goodModal.isOpen) return
  form.isSecKill = !form.isSecKill
}

// 表单提交
const handleConfirm = throttle(() => {
  if (form.isSecKill && isEmpty(form.time)) {
    return message.warning('开启秒杀后需要设置可兑换时间')
  }
  ruleForm.value.validate(valid => {
    if (valid) {
      loading.value = true
      if (form.oldPrice) {
        form.goodsPrice = form.oldPrice * 100
      } else {
        form.goodsPrice = null
      }
      if (form.time) {
        form.startExchangeTime = dateFormat(
          new Date(form.time[0].toString().replace(/-/g, '/')),
          'YYYY-MM-DD hh:mm:ss'
        )
        form.endExchangeTime = dateFormat(
          new Date(form.time[1].toString().replace(/-/g, '/')),
          'YYYY-MM-DD hh:mm:ss'
        )
      } else {
        form.startExchangeTime = ''
        form.endExchangeTime = ''
      }
      // 设置可见范围
      form.goodsMarket = isNotEmpty(form.goodsMarketList)
        ? form.goodsMarketList.length === 2
          ? 0
          : form.goodsMarketList[0]
        : 1
      if (goodModal.isEdit) {
        updateFun()
      } else {
        saveFun()
      }
    }
  })
}, 700)

// 保存
function saveFun() {
  const param = JSON.parse(JSON.stringify(form))
  // 处理商品详情的图片
  if (param.goodsDetail) {
    param.goodsDetail = JSON.stringify(form.goodsDetail)
  }

  param.isSecKill = param.isSecKill ? 1 : 0
  saveGood(param)
    .then(res => {
      if (res.code === 0) {
        loading.value = false
        emits('updateList', true)
        dialog.value.handleClose()
      } else {
        loading.value = false
      }
    })
    .catch(() => {
      loading.value = false
    })
}

// 修改
function updateFun() {
  const param = JSON.parse(JSON.stringify(form))
  // 处理商品详情的图片
  if (param.goodsDetail) {
    param.goodsDetail = JSON.stringify(form.goodsDetail)
  }
  param.isSecKill = param.isSecKill ? 1 : 0
  updateGood(param)
    .then(res => {
      if (res.code === 0) {
        loading.value = false
        message.success('编辑商品成功')
        emits('updateList', false)
        dialog.value.handleClose()
      } else {
        loading.value = false
      }
    })
    .catch(() => {
      loading.value = false
    })
}
// 打开弹窗并将数据填写
function init() {
  if (props.goodModal.data) {
    goodModal.isEdit = props.goodModal.isEdit
    const data = JSON.parse(JSON.stringify(props.goodModal.data))
    form.id = data.id
    form.goodsName = data.goodsName
    form.goodsImg = data.goodsImg
    form.goodsDetail = JSON.parse(data.goodsDetail) || []
    form.oldPrice = data.goodsPrice ? (data.goodsPrice / 100).toFixed(2) : null
    form.goodsType = data.goodsType
    form.goodsPrice = data.goodsPrice || null
    form.needGoldNum = data.needGoldNum || 0
    form.goldTypeId = data.goldTypeId ?? '-1'
    form.stock = data.stock || 0
    form.isSecKill = data.isSecKill === 1
    backShowData.value = data.orgInfoDTOS || null // 保存的组织架构数据，在组织架构获取完毕后回填和回显
    form.secKillPrice = data.secKillPrice
    if (data.orgInfoDTOS && data.orgInfoDTOS.length > 0) {
      const uniqueArr = [...new Map(data.orgInfoDTOS.map(item => [item.deptId, item])).values()]
      const deptIdArr = []
      const deptInfo = []
      uniqueArr.forEach(x => {
        deptIdArr.push(getNumberId(x.deptId))
        deptInfo.push({
          fullIds:
            x.deptIds && x.deptIds.length > 0
              ? x.deptIds.map(x => parseInt(x))
              : [getNumberId(x.deptId)],
          fullPath: x.deptNames && x.deptNames.length > 0 ? x.deptNames.join('/') : x.deptName,
          label: x.deptName,
          value: getNumberId(x.deptId)
        })
      })
      form.deptIds = deptIdArr || []
      showDeptIds.value = deptInfo || [] // 回显
    }
    if (data.startExchangeTime && data.endExchangeTime) {
      form.time = [data.startExchangeTime, data.endExchangeTime]
    } else {
      form.time = ''
    }
    form.limitExchangeTimes = data.limitExchangeTimes || null
    form.goodsMarketList =
      (KOCInfo.value.hasKOC && KOCInfo.value.isValid) ||
      (props.goodModal.isOpen && (data.goodsMarket === 0 || data.goodsMarket === 2))
        ? data.goodsMarket === 0
          ? [1, 2]
          : [data.goodsMarket || 1]
        : [1] // 有授权有效的KOC小程序 或者 已经开启兑换并且可见范围包含了KOC的商品 显示KOS和KOC 否则只显示KOS
  }
}

init()

// 检查是否有表情包
function retEmit(e) {
  const reg =
    /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
  form.goodsName = e.target.value.replace(reg, '')
}

// 文件上传之前
function beforeUploadFile(file, key) {
  const typeList = ['image/jpeg', 'image/jpg', 'image/png']
  if (typeList.indexOf(file.type) === -1) {
    ElMessage.warning('仅支持png、jpg、jpeg格式的图片')
    return false
  }
  const size = file.size
  if (size > 2048000) {
    message({
      type: 'warning',
      message: '图片大小不得大于2M'
    })
    return false
  }
  // goodsImg 商品图片上传 goodsDetail 商品详情上传
  imgLoading.value = key === 'goodsImg'
  detailLoading.value = key === 'goodsDetail'
}

// 文件上传成功 商品主图
function handleSuccess(res, file) {
  if (res.code === 0) {
    // 添加到文件上传列表中
    form.goodsImg = res.data
  }
  imgLoading.value = false
}

// 文件上传成功 商品详情
function handleDetailSuccess(res, file) {
  if (res.code === 0) {
    // 添加到文件上传列表中
    form.goodsDetail.push(res.data)
  }
  detailLoading.value = false
}

// 文件上传失败
function handleError() {
  imgLoading.value = false
  detailLoading.value = false
}

const checkDialog = ref(false) // 是否显示查看附件的弹窗
// 查看附件相关数据
const dialogFile = ref('') // 查看附件的data

// 查看附件
function showFile(url) {
  if (!url) return
  checkDialog.value = true
  dialogFile.value = url
  // form.goodsImg
}

// 删除详情附件
function delFile(index) {
  form.goodsDetail.splice(index, 1)
}

// 关闭整个弹窗
function closeDialog() {
  dialog.value.handleClose()
}

// 获取金币类型选项
const goldTypeList = ref([])
onBeforeMount(() => {
  getGoldList({}).then(res => {
    if (res?.code === 0) {
      goldTypeList.value = res.data || []
      goldTypeList.value.sort(item => (item?.isValid === 0 ? 1 : -1))
    }
  })
})
// 过期
const expiredValueFilter = value => {
  if (value === '-1') return '永久'
  return /^[\d]*$/.test(value) ? value + '天' : value
}
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}

:deep(.el-dialog__body) {
  padding: 0;
}
.dialog_content {
  max-height: calc(92vh - 182px);
  overflow: auto;
  padding: 22px 0px 28px 0;
}
.mark {
  font-size: 14px;
  font-weight: 400;
  color: #909399;
  line-height: 20px;
}

:deep(.el-input__count) {
  --el-color-info: #c0c4cc;
}

.file_box {
  margin-top: 8px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;

  .one_file {
    width: 120px;
    height: 120px;
    margin-right: 14px;
    position: relative;

    border-radius: 4px;
    overflow: hidden;

    .file_cover {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 4px;
    }

    .file_action {
      opacity: 0;
      width: 120px;
      height: 120px;
      position: absolute;
      left: 0;
      top: 0;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      // padding: 0 8px 8px 0;

      background: rgba(0, 0, 0, 0.4);
      font-size: 14px;
      font-weight: 400;
      color: #ffffff;
      line-height: 20px;

      .check_icon {
        width: 120px;
        height: 40px;
        padding: 8px;
        cursor: pointer;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
      }

      .del_icon {
        position: absolute;
        bottom: 0px;
        right: 0px;
        width: 120px;
        height: 40px;
        padding: 0 8px 8px 0;
        cursor: pointer;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: flex-end;

        img {
          width: 16px;
          height: 16px;
          display: flex;
        }
      }

      &:hover {
        opacity: 1;
      }
    }
  }

  .upload_text {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    font-weight: 400;
    color: #303133;
    line-height: 20px;

    img {
      width: 20px;
      height: 20px;
      margin-bottom: 16px;
    }
  }
}

:deep(.el-upload--picture) {
  width: 118px;
  height: 118px;
  border-radius: 0;
  border: 1px dashed #dbdfe7;
  background: #fff;

  &:hover {
    border-color: $theme_color;
  }
}

.check_modal {
  width: 100%;
  height: 400px;
  padding-left: 24px;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  video {
    width: 100%;
    height: 100%;
  }
}

// 隐藏input[number]的默认上下按钮
:deep(input::-webkit-outer-spin-button, input::-webkit-inner-spin-button) {
  -webkit-appearance: none !important;
}

:deep(input[type='number']) {
  -moz-appearance: textfield !important;
}

.width400 {
  width: 400px;
}

.width240 {
  width: 240px;
}

:deep(.hide_require .el-form-item__label:before) {
  display: none;
}
:deep(.input_box) {
  width: 240px !important;
}
:deep(.input_box .input_choose .one_choose) {
  max-width: 130px !important;
}
</style>
