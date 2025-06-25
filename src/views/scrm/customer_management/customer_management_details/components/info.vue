<template>
  <div class="info">
    <!-- 客户信息 -->
    <div class="info_title">
      客户信息
      <div v-if="clientIntentStatus === 2" class="high">高意向</div>
      <div v-if="clientIntentStatus === 3" class="middle">中意向</div>
      <div v-if="clientIntentStatus === 4" class="low">低意向</div>
    </div>
    <div class="info_content">
      <div class="c_item">
        <span class="item_label">昵称：</span>
        <span class="item_val">{{ getInfoValue('clientNickname') }}</span>
      </div>
      <div class="c_item">
        <span class="item_label">性别：</span>
        <el-select size="small" v-model="clientGender" placeholder="未知" @change="handleChange">
          <el-option label="未知" :value="0" />
          <el-option label="男" :value="1" />
          <el-option label="女" :value="2" />
        </el-select>
      </div>
      <div class="c_item">
        <span class="item_label">年龄：</span>
        <el-input-number
          size="small"
          v-model="clientAge"
          :min="0"
          :max="109"
          @change="handleChange"
        />
      </div>
      <div class="c_item">
        <span class="item_label">地区：</span>
        <xm_area size="small" v-model="clientCity" columns-num="2" @change="handleChange"></xm_area>
      </div>
      <div class="c_item" v-for="item in infoList" :key="item.key">
        <span class="item_label">
          <template v-if="item.key == 'ownerNickname'">
            {{
              props.info && props.info.platform
                ? `来源${PLATFORM.getCN(props.info.platform)}`
                : item.label
            }}
          </template>
          <template v-else>
            {{ item.label }}
          </template>
          ：
        </span>
        <!-- 对手机号码做特殊处理-->
        <span
          class="item_val"
          v-if="item.label.indexOf('联系方式') === -1 || getInfoValue(item.key) === '-'"
        >
          {{ getInfoValue(item.key) }}
        </span>
        <span class="item_val" v-else>
          <table_column_phone :phone="getInfoValue(item.key)"></table_column_phone>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { PLATFORM } from '@/utils/dictionary/company.js'
import { isEmpty } from '@/utils/tools.js'
import {
  CUSTOMER_FOLLOW_STATUS,
  CUSTOMER_INTENT_STATUS,
  CUSTOMER_RELATE,
  CUSTOMER_SOURCE
} from '@/utils/dictionary/customer.js'
import { updateCustomDetail } from '@/api/scrm/customer.js'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const props = defineProps({
  info: {
    type: Object,
    default: () => {}
  },
  clientUserType: {
    type: Number
  }
})
const emits = defineEmits(['updateInfo'])
const { info } = toRefs(props)
const clientGender = ref('')
const clientAge = ref(0)
const clientCity = ref(['北京市', '北京市'])
const clientIntentStatus = ref(0)

watch(
  () => props.info,
  value => {
    if (!isEmpty(value)) {
      clientGender.value = value.clientGender
      clientAge.value = value.clientAge || 0
      clientCity.value = [value.clientProvince, value.clientCity]
      clientIntentStatus.value = value.clientIntentStatus
    }
  }
)
const { query } = useRoute()

function handleChange(list) {
  const data = {
    markProvince: clientCity.value[0],
    markCity: clientCity.value[1],
    markAge: clientAge.value,
    markGender: clientGender.value,
    openId: query.fromOpenId,
    clientUserBindId: query.clientUserBindId,
    clientUserId: query.clientUserId
  }
  updateCustomDetail(data).then(res => {
    if (res.code === 0) {
      ElMessage.success('用户信息更新成功！')
      emits('updateInfo')
    }
  })
}

let infoList = reactive([])
getInfoList()
function getInfoList() {
  // query.clientUserType为1 -潜客管理 2-留资客户
  if (query.clientUserType === '2') {
    infoList = reactive([
      {
        label: '联系方式',
        key: 'clientPhone'
      },
      // {
      //   label: '留资来源',
      //   key: 'clientSource'
      // },
      {
        label: '来源抖音',
        key: 'ownerNickname'
      },
      // {
      //   label: '客户关系',
      //   key: 'clientRelate'
      // },
      {
        label: '归属人',
        key: 'clientBelongedName'
      },
      {
        label: '归属人联系方式',
        key: 'clientBelongedPhone'
      }
    ])
  } else {
    infoList = reactive([
      {
        label: '来源抖音',
        key: 'ownerNickname'
      },
      // {
      //   label: '客户关系',
      //   key: 'clientRelate'
      // },
      {
        label: '归属人',
        key: 'clientBelongedName'
      },
      {
        label: '归属人联系方式',
        key: 'clientBelongedPhone'
      }
    ])
  }
}

const getInfoValue = key => {
  console.log('客户的信息', info.value)
  let result = ''
  const value = info.value
  if (isEmpty(value)) return '--'
  result = isEmpty(value[key]) ? '--' : value[key]
  switch (key) {
    case 'clientConsultStatus':
      result = CUSTOMER_FOLLOW_STATUS.getCN(value.clientConsultStatus)
      break
    case 'clientIntentStatus':
      result = CUSTOMER_INTENT_STATUS.getCN(value.clientIntentStatus)
      break
    case 'clientRelate':
      result = CUSTOMER_RELATE.getCN(value.clientRelate)
      break
    case 'clientSource':
      result = CUSTOMER_SOURCE.getCN(value.clientSource)
      break
    case 'ownerDisplayId':
      result = value.ownerDisplayId
      break
    case 'clientBelongedName':
      result = isEmpty(value.clientBelongedName) ? '--' : value.clientBelongedName
      break
    case 'clientGender':
      result = value.clientGender === 1 ? '男' : value.clientGender === 2 ? '女' : '未知'
      break
  }
  result = isEmpty(result) ? '--' : result
  return result
}
</script>

<style lang="scss" scoped>
.info {
  padding-bottom: 22px;
  background-color: #fff;

  .info_title {
    padding: 22px 24px;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    border-bottom: 1px solid #dcdee0;

    div {
      width: 44px;
      // height: 18px;
      line-height: 18px;
      display: inline-block;
      margin-left: 12px;
      text-align: center;
      font-size: 12px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      background: #ffffff;
      border-radius: 2px;
    }

    .high {
      color: #00aa2f;
      border: 1px solid #00aa2f;
    }

    .middle {
      border: 1px solid #ff6000;
      color: #ff6000;
    }

    .low {
      border: 1px solid #606266;
      color: #606266;
    }
  }

  .info_content {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    padding-top: 8px;
    padding-left: 24px;
    text-align: left;
    //width: 900px;

    .c_item {
      font-weight: 400;
      display: flex;
      align-items: center;
      //justify-content: center;
      margin-top: 12px;
      box-sizing: border-box;
      width: 340px;
      line-height: 22px;

      .item_label {
        display: inline-block;
        font-size: 14px;
        color: #606266;
        margin-right: 12px;
      }

      .item_val {
        width: calc(100% - 130px);
        display: inline-block;
        font-size: 14px;
        color: #323233;
        overflow: hidden;
        word-break: break-all; /* break-all(允许在单词内换行。) */
        text-overflow: ellipsis; /* 超出部分省略号 */
        display: -webkit-box; /** 对象作为伸缩盒子模型显示 **/
        -webkit-box-orient: vertical; /** 设置或检索伸缩盒对象的子元素的排列方式 **/
        -webkit-line-clamp: 1; /** 显示的行数 **/
      }
    }
  }
}
</style>
