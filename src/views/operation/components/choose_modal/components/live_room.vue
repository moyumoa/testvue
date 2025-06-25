<template>
  <div class="live_room">
    <el-form :model="form" :rules="rules" ref="ruleForm" label-width="90px">
      <el-form-item label="主播UID" prop="UID">
        <el-input
          style="width: 350px"
          @blur="retEmit($event, 'UID')"
          v-model.trim="form.UID"
          placeholder="抖音主播UID"
        ></el-input>
        <el-link style="margin-left: 14px" @click="toUID" type="primary">如何获取主播UID</el-link>
      </el-form-item>
      <el-form-item label="主播名称" prop="name">
        <el-input
          style="width: 350px"
          @blur="retEmit($event, 'name')"
          v-model.trim="form.name"
          placeholder="小程序上不展现，只用于后台装修时区分直播间"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="chooseFun">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup>
import { throttle } from '@/utils/tools.js'

// 表单相关数据
const form = reactive({
  UID: null,
  name: ''
})
const rules = {
  UID: [
    {
      required: true,
      message: '请输入抖音主播UID',
      trigger: 'blur'
    }
  ],
  name: [
    {
      required: true,
      message: '请输入抖音主播名称',
      trigger: 'blur'
    }
  ]
}
const ruleForm = ref()
const emits = defineEmits(['upPage'])
// 选择页面
const chooseFun = throttle(e => {
  ruleForm.value.validate(valid => {
    if (valid) {
      const data = {
        type: 'liveRoom',
        name: 'liveRoom',
        label: `【直播间】：${form.name}`,
        url: `${form.UID}`
      }
      emits('upPage', data)
    }
  })
}, 300)
function toUID() {
  window.open(
    'http://applet-1256030678.cos.ap-chengdu.myqcloud.com/202011271343348f18680b13.jpg',
    '_blank'
  )
}
// 检查是否有表情包
function retEmit(e, name) {
  const val = e.target.value
  const reg =
    /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
  form[name] = val.replace(reg, '')
}
</script>
<style lang="scss" scoped></style>
