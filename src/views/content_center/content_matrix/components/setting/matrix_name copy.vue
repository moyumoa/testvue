<template>
  <div class="conditionPage">
    <!-- 原来未修改的 -->
    <div :class="errorStu ? 'conditionBox errorBox' : 'conditionBox'">
      <div class="conditionTitle">输入矩阵号名称:</div>
      <div class="conditionContent">
        <div style="width: 100%">
          <div style="display: flex; align-items: end">
            <el-input
              v-if="!data.edit"
              class="orderInput"
              v-model="data.listText"
              type="textarea"
              :autosize="false"
              @blur="inputBlur"
              placeholder="若有多个矩阵号请用；号隔开"
            />
            <!-- @change="inputChange" -->
            <div v-else class="list_box">
              <div class="list">
                <div class="no_exist" v-for="(item, index) in data.notExistDyNames" :key="item">
                  <span class="item_name error">{{ item }}</span>
                  <span class="cel_btn" @click="delItem(index, 1)">×</span>
                </div>
                <div class="no_exist" v-for="(item, index) in data.existDyNames" :key="item">
                  <span class="item_name">{{ item }}</span>
                  <span class="cel_btn" @click="delItem(index, 2)">×</span>
                </div>
              </div>
            </div>
            <span class="check_btn" v-if="!data.edit" @click="checkName">检查</span>
            <span class="edit_btn" v-else @click="editName">编辑</span>
          </div>
          <div v-if="data.edit" class="ascension">
            <span v-if="data.notExistDyNames.length">
              红色高亮的矩阵号不存在，请检查输入是否有误，
            </span>
            <span v-if="data.isDelRepeatName">已帮您删除重复矩阵号</span>
          </div>
        </div>
      </div>
    </div>
    <el-icon
      v-if="props.complexType === 2"
      :class="errorStu ? 'closeCondition errorIcon' : 'closeCondition'"
      @click="delCondtionList('matrixName')"
    >
      <i-close />
    </el-icon>
  </div>
</template>
<script setup>
import api from '@/api/content_center/content_matrix.js'
import { useRoute } from 'vue-router'

const route = useRoute()
const emit = defineEmits(['changeMatrixNameList', 'changeConditionList'])
const props = defineProps({
  complexType: {
    type: Number,
    default: null
  },
  errorStu: {
    type: Boolean,
    default: false
  },
  matrixNameList: {
    type: Array,
    default() {
      return []
    }
  },
  form: {
    type: Object,
    default() {
      return {}
    }
  }
})
const errorStu = toRef(props, 'errorStu')
const matrixNameList = toRef(props, 'matrixNameList')
const data = reactive({
  list: [], // 矩阵号名称列表
  existDyNames: [], // 存在的矩阵号的名字列表
  notExistDyNames: [], // 不存在的矩阵号名字列表
  listText: '', // 矩阵号名称字符串
  edit: false, // 是否显示编辑（删除）标签
  isDelRepeatName: false // 是否删除重复的标签
})

// 输入框失去焦点的回调
function inputBlur(e) {
  const newList = []
  if (data.listText) {
    // const list = data.listText.split('；')
    const list = data.listText.split(/[；;]/g)
    list.forEach(x => {
      console.log(x)
      x = x.trim()
      if (x) {
        newList.push(x)
      }
    })
    const oldListLength = newList.length
    data.list = Array.from(new Set(newList))
    const newListLength = data.list.length
    data.isDelRepeatName = oldListLength !== newListLength
    // console.log(oldListLength, newListLength)
    data.listText = newList.join('；')
  } else {
    data.isDelRepeatName = false
    data.list = []
  }
  emit('changeMatrixNameList', data.list)
}
// 点击检查按钮的回调
const checkName = async function () {
  emit('changeMatrixNameList', data.list)
  const res = await api.statisticalNum({ groupId: route.query.id, extra: props.form })
  if (res.success) {
    data.notExistDyNames = res.data.notExistDyNames
    data.existDyNames = res.data.existDyNames
    data.edit = true
  }
}
// 点击编辑按钮的回调
function editName() {
  data.isDelRepeatName = false
  data.list = [...data.notExistDyNames, ...data.existDyNames]
  data.listText = data.list.join('；')
  data.edit = false
}
// 删除不存在的矩阵号的回调
function delItem(index, type) {
  // data.list.splice(index, 1)
  if (type === 1) {
    data.notExistDyNames.splice(index, 1)
  } else {
    data.existDyNames.splice(index, 1)
  }
  data.list = [...data.notExistDyNames, ...data.existDyNames]
  data.listText = data.list.join('；')
  emit('changeMatrixNameList', data.list)
}
// 关闭筛选条件的回调
function delCondtionList(stu) {
  emit('changeConditionList', stu)
}
onMounted(() => {
  console.log('mounted')
  data.list = matrixNameList.value
  console.log(matrixNameList.value)
  data.listText = matrixNameList.value.join('；')
})
</script>
<style lang="scss" scoped>
@import './css/condition.scss';
:deep(.conditionBox) {
  align-items: flex-start !important;
  min-height: 228px;
  .conditionContent {
    width: calc(100% - 109px);
  }
  .orderInput {
    min-width: 300px !important;
    width: 80%;
    textarea {
      min-height: 200px !important;
    }
  }
}
.list_box {
  padding: 5px 15px;
  display: inline-block;
  height: 188px;
  width: calc(80% - 32px);
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow-y: auto;
  &::-webkit-scrollbar {
    width: 2px;
  }
  .list {
    // height: 100%;
    width: 100%;
    display: flex;
    flex-wrap: wrap;
  }
  .no_exist {
    height: 22px;
    line-height: 22px;
    background: rgba(54, 79, 205, 0.2);
    border-radius: 2px;
    padding: 0 6px 0 4px;
    margin: 0 8px 8px 0;
    .item_name.error {
      color: #f85151;
    }
    .cel_btn {
      margin-left: 6px;
      cursor: pointer;
    }
  }
}
.check_btn {
  margin-left: 12px;
  font-size: 14px;
  font-weight: 400;
  color: #364fcd;
  cursor: pointer;
}
.edit_btn {
  margin-left: 12px;
  font-size: 14px;
  font-weight: 400;
  color: #364fcd;
  cursor: pointer;
}
.ascension {
  line-height: 20px;
  font-size: 14px;
  margin-top: 8px;
  color: #f56c6c;
}
</style>
