<template>
  <div class="store_set">
    <div class="title">新建部门</div>
    <el-form class="section_form" :model="form" :rules="rules" ref="ruleForm" label-width="100px">
      <el-form-item label="部门编号：" prop="name">
        <el-input
          v-model="form.name"
          oninput="value=value.replace(/[^\d]/g,'')"
          maxlength="10"
          placeholder="请输入部门编号"
        ></el-input>
      </el-form-item>
      <el-form-item label="部门名称：" prop="num">
        <el-input v-model="form.num" placeholder="请输入部门名称" maxlength="40"></el-input>
      </el-form-item>
      <el-form-item label="所属上级：" prop="num">
        <input type="text" v-model="form.section" style="display: none" />
        <div @click="alertSection" class="section_select" style="width: 380px">
          <div class="section_list" v-if="form.section.length > 0">
            <div class="section" v-for="(item, index) in form.section" :key="item.id">
              <span class="section_name">{{ item.label }}</span>
              <el-icon
                @click.stop="unchoiceSection(index)"
                color="#364FCD"
                :size="12"
                style="cursor: pointer"
              >
                <i-close />
              </el-icon>
            </div>
          </div>
          <div v-else>请选择所属上级</div>
          <i class="icon iconfont icon-edit"></i>
        </div>
      </el-form-item>
      <el-form-item label="是否门店：" prop="isStore">
        <el-radio-group v-model="form.isStore">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="2">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <template v-if="form.isStore === 1">
        <el-form-item label="地址：" prop="address">
          <el-cascader
            v-model="form.address"
            :options="options"
            placeholder="请选择地址"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址：" prop="addressDetail">
          <el-input
            v-model="form.addressDetail"
            placeholder="请输入详细地址"
            maxlength="50"
          ></el-input>
        </el-form-item>
        <div class="address_tips">
          请规范填写地址，以免影响门店搜索
          <br />
          例1，道路+门牌号，如“人民东路18号”
          <br />
          例2，道路+门票号+标志性建筑+楼层，如“九盛路9号东方电子商务园15号楼4楼”
        </div>
        <el-form-item label="门店类型：" prop="storeType">
          <el-radio-group v-model="form.storeType">
            <el-radio :label="1">品类势能店</el-radio>
            <el-radio :label="2">品类综合店</el-radio>
            <el-radio :label="3">旗舰店</el-radio>
            <el-radio :label="4">系列单店</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="门店系列：" prop="storeSeries">
          <el-select v-model="form.storeSeries" clearable></el-select>
        </el-form-item>
        <el-form-item label="营业时间：" prop="storeTime">
          <el-radio-group v-model="form.storeTime">
            <el-radio :label="1">无</el-radio>
            <el-radio :label="2">24小时</el-radio>
            <el-radio :label="3">自定义</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="门店电话：" prop="phone">
          <el-input
            v-model="form.phone"
            oninput="value=value.replace(/[^\d]/g,'')"
            maxlength="11"
            placeholder="请输入门店电话"
          ></el-input>
        </el-form-item>
      </template>
    </el-form>
    <div class="form_btns">
      <el-button>返回</el-button>
      <el-button type="primary">提交</el-button>
    </div>
    <sectionChoice :showModal="sectionShow" v-if="sectionShow.show" @setResult="setSection" />
  </div>
</template>

<script setup>
import sectionChoice from '@/views/system/components/section_choice/index.vue'

const form = ref({
  name: '',
  num: '',
  section: [],
  isStore: 1,
  address: '',
  addressDetail: '',
  storeType: 1,
  storeSeries: '',
  storeTime: 1,
  phone: ''
})
const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  num: [{ required: true, message: '请输入数字', trigger: 'blur' }],
  section: [{ required: true, message: '请选择', trigger: 'change' }],
  isStore: [{ required: true, message: '请选择', trigger: 'change' }],
  address: [{ required: true, message: '请选择', trigger: 'blur' }],
  storeType: [{ required: true, message: '请选择', trigger: 'change' }],
  storeSeries: [{ required: true, message: '请选择', trigger: 'change' }]
}
// 部门选择
const sectionShow = reactive({
  show: false,
  data: null
})
const options = ref([
  {
    value: 'guide',
    label: '浙江省',
    children: [
      {
        value: 'disciplines',
        label: '杭州市',
        children: [
          {
            value: 'consistency',
            label: '余杭区'
          },
          {
            value: 'feedback',
            label: '临平区'
          },
          {
            value: 'efficiency',
            label: '上城区'
          },
          {
            value: 'controllability',
            label: '钱塘区'
          }
        ]
      }
    ]
  }
])
function alertSection() {
  sectionShow.data = form.value.section
  sectionShow.show = true
}
function setSection(res) {
  form.value.section = res
}
function unchoiceSection(index) {
  form.value.section.splice(index, 1)
}
</script>

<style lang="scss" scoped>
@import '@/views/system/components/css/common.scss';
.store_set {
  background: #fff;
  padding: 24px 32px;
  .title {
    width: 100%;
    height: 40px;
    padding: 10px 23px;
    line-height: 20px;
    box-sizing: border-box;
    background: #f7f8fa;
    margin-bottom: 32px;
    position: relative;
    &::before {
      content: ' ';
      position: absolute;
      width: 3px;
      height: 14px;
      top: 12px;
      left: 12px;
      background: #155bd4;
    }
  }
}
.section_form {
  padding-left: 250px;
  :deep(.el-input) {
    width: 380px;
  }
  .address_tips {
    margin: -10px 0 16px 0;
    padding-left: 100px;
    color: #909399;
    line-height: 20px;
  }
}
.form_btns {
  width: calc(100% - 210px);
  height: 58px;
  position: fixed;
  left: 0;
  bottom: 0;
  margin-left: 210px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
