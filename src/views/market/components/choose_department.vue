<template>
  <div>
    <slot name="default" :showDialog="showDialog">
      <el-link type="primary" @click="showDialog">选择</el-link>
    </slot>
    <choose_dept_dialog
      :isUsePermission="true"
      :getAllChild="false"
      :allowEmpty="false"
      v-if="data.deptDialog.show"
      :deptDialog="data.deptDialog"
      @updateDept="confirm"
      :isSearchSelf="true"
      :isSearchSelfById="data.expandKey ? data.expandKey : null"
    ></choose_dept_dialog>
  </div>
</template>

<script setup>
// const props = defineProps({
//   keys: Array, // 默认选中的key
//   autoLoad: {
//     // 是否直接加载
//     type: Boolean,
//     default: true
//   }
// })

const data = reactive({
  expandKey: '0',
  depDialog: false,
  orgData: null,
  loading: true,
  deptName: '', // 筛选项的部门名称
  chooseKeys: [], // 选中的key列表
  chooseKeyInfoList: [], // 选中的key详细列表
  params: {}, // 筛选项
  deptDialog: {
    show: false
  }
})

const emits = defineEmits(['choose'])

function showDialog() {
  data.depDialog = true
}
function initDepart(e, keys, keyInfos) {
  data.deptName = ''
  data.params = e || {}
  if (e.chooseOrgId) {
    data.expandKey = e.chooseOrgId
  }
  console.log(keys, 'keys', keyInfos)
  const checkNode = []
  if (keys && keys.length > 0) {
    data.chooseKeys = JSON.parse(JSON.stringify(keys))
    data.chooseKeyInfoList = JSON.parse(JSON.stringify(keyInfos))
    keyInfos.forEach(x => {
      checkNode.push({
        fullIds: x.orgParentIds,
        fullPath: x.orgFullName,
        id: x.orgId,
        name: x.orgName
      })
    })
  } else {
    data.chooseKeys = []
    data.chooseKeyInfoList = []
  }
  data.deptDialog = {
    show: true,
    checkNode: checkNode
  }
}

function cancelFun() {
  data.deptName = ''
  data.depDialog = false
  data.deptDialog.show = false
}
function confirm(e) {
  console.log('选中的部门信息', e)
  const nodeNames = []
  const ids = []
  e.forEach(x => {
    nodeNames.push({
      orgId: x.id,
      orgName: x.name,
      orgParentIds: x.fullIds, // 新增部门的全路径ID 字符串
      orgFullName: x.fullPath // 新增部门的全路径名称 弹窗回显需要
    })
    ids.push(x.id)
  })
  data.chooseKeys = ids || []
  data.chooseKeyInfoList = nodeNames || []
  cancelFun()
  emits('choose', data.chooseKeys, nodeNames, data.chooseKeyInfoList)
}

defineExpose({
  initDepart
})
</script>

<style lang="scss" scoped></style>
