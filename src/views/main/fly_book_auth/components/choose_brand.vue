<template>
  <div class="right-container">
    <el-form
      class="form"
      :model="codeForm"
      :rules="codeFormRules"
      ref="codeFormRef"
      label-width="100px"
    >
      <div class="info_name" style="margin-bottom: 0.22rem">选择品牌</div>
      <el-form-item label="品牌" prop="brandId">
        <el-select style="width: 100%" v-model="chooseBrandId" placeholder="请选择品牌">
          <el-option
            v-for="item in brandList"
            :label="item.brandName || '-'"
            :value="item.brandId"
            :key="item.brandId"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <el-button class="submit_btn" type="primary" @click="saveFun">进入后台</el-button>
    <slot name="cancelBtn"></slot>
  </div>
</template>

<script setup>
import { throttle } from '@/utils/tools'
import { loginFun } from '@/utils/doLogin'
const props = defineProps({
  brandList: {
    type: Array,
    default: () => {
      return []
    },
    required: true
  },
  loginCode: {
    type: String,
    default: ''
  },
  origin: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})
const brandList = toRef(props, 'brandList') // 选择品牌的列表
const chooseBrandId = ref(null) // 选中的品牌ID
const loginCode = toRef(props, 'loginCode') // 选择品牌需要的loginCode
init()
function init() {
  if (props.brandList && props.brandList.length > 0) {
    chooseBrandId.value = props.brandList[0].brandId
  }
}
const emits = defineEmits(['update:loading'])

const message = inject('$message')
// 进入后台
const saveFun = throttle(() => {
  emits('update:loading', true)
  if (chooseBrandId.value) {
    const chooseBrand = brandList.value.filter(x => x.brandId === chooseBrandId.value)
    if (chooseBrand.length > 0) {
      loginFun(
        {
          brandId: chooseBrand[0].brandId,
          userId: chooseBrand[0].userId,
          loginType: 1,
          loginCode: loginCode.value
        },
        props.origin
      )
        .then(res => {
          sessionStorage.clear()
          // loading.value = false
        })
        .catch(() => {
          emits('update:loading', false)
        })
    } else {
      message.warning('请先选择品牌')
      emits('update:loading', false)
    }
  } else {
    message.warning('请先选择品牌')
    emits('update:loading', false)
  }
}, 700)
</script>

<style lang="scss" scoped>
.right-container {
  .submit_btn {
    margin-top: 28px;
    width: 100%;
    height: 44px;
  }
}
.info_name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  line-height: 32px;
}
.submit_btn {
  margin-top: 28px;
  width: 100%;
  height: 44px;
  background: linear-gradient(315deg, #1857ff 0%, #72bfff 100%);
  box-shadow: 0px 2px 15px 0px rgba(0, 0, 0, 0.02);
  border: none;
  color: #fff;
  &:hover {
    opacity: 0.66;
  }
}
.el-button--default.is-disabled.submit_btn {
  opacity: 0.3;
}
</style>
