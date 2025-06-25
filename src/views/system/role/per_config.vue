<template>
  <div class="per_config_wrapper">
    <div class="config_header">
      <div class="config_header_icon flex_center">
        <i class="iconfont icon-jiaose"></i>
      </div>
      <div class="config_header_text">
        角色：
        <span>{{ roleInfo.roleName }}</span>
      </div>
    </div>
    <div class="config_main">
      <div class="config_main_header">
        <div class="header_tab">访问权限</div>
        <div class="header_tab">功能权限</div>
      </div>
      <div class="config_main_content">
        <!-- 公共权限 -->
        <div class="public_box" v-if="publicList.length > 0">
          <div class="public_label">公共权限</div>
          <div class="public_content">
            <el-checkbox-group v-model="checkPublicList">
              <template v-for="item in publicList" :key="item.scopeId">
                <el-checkbox :disabled="roleInfo.roleId === 0" :label="item.scopeId">
                  {{ item.scopeName }}
                </el-checkbox>
              </template>
            </el-checkbox-group>
          </div>
        </div>
        <el-tree
          :ref="el => (tree = el)"
          :data="treeData"
          show-checkbox
          node-key="scopeId"
          default-expand-all
          :expand-on-click-node="false"
          :props="{
            label: 'scopeName',
            children: 'childrenMenuList',
            disabled: 'disabled'
          }"
        >
          <template #default="{ node, data }">
            <span
              class="custom-tree-node"
              :style="{
                position: data.childrenPermissionList.length > 0 ? 'relative' : 'static'
              }"
            >
              <span>{{ node.label }}</span>
              <div
                class="per_wrapper"
                :style="{ left: level[data.scopeLevel] }"
                v-if="data.childrenPermissionList.length > 0"
              >
                <el-checkbox-group v-model="checkList">
                  <template v-for="item in data.childrenPermissionList" :key="item.scopeId">
                    <el-checkbox
                      :disabled="perCheckedDisabled"
                      style="height: auto"
                      :label="item.scopeId"
                    >
                      {{ item.scopeName }}
                    </el-checkbox>
                  </template>
                </el-checkbox-group>
              </div>
            </span>
          </template>
        </el-tree>
      </div>
    </div>
    <div class="config_footer flex_center">
      <el-button @click="handleBack">返回</el-button>
      <el-button type="primary" @click="handleSave" :disabled="roleInfo.roleId === 0">
        保存
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { selectRolePermission, addOrUptRolePermission } from '@/api/system_setting/permission'
import { useRouter } from 'vue-router'
// 工具
const router = useRouter()
const $message = inject('$message')
const roleInfo = ref({})
const level = {
  1: '267px',
  2: '250px',
  3: '232px'
}
const publicList = ref([]) // 公共权限
const checkPublicList = ref([]) // 选中的公共权限
const publicParentId = ref() // 公共权限的父级ID，如果选中了公共权限，那父级也要选中
const perCheckedDisabled = ref(false)
const checkList = ref([])
// 树结构相关数据
const treeInfo = reactive({
  tree: null,
  treeData: []
})
const { tree, treeData } = toRefs(treeInfo)
const handleSave = () => {
  const publickParent = []
  // 如果选择了公共权限，那他的父级ID也要选中
  if (checkPublicList.value.length > 0) {
    publickParent.push(publicParentId.value)
  }
  addOrUptRolePermission({
    roleId: roleInfo.value.roleId,
    scopeIdList: checkList.value
      .concat(tree.value.getCheckedKeys())
      .concat(checkPublicList.value)
      .concat(publickParent)
  }).then(res => {
    $message.success('保存成功')
    handleBack()
  })
}
const handleBack = () => {
  router.go(-1)
}
const fetchDetail = () => {
  selectRolePermission({ roleId: roleInfo.value.roleId }).then(res => {
    const allData = res.data
    // 提取公共权限
    if (allData[0]?.scopeCode === 'public_authority') {
      publicList.value = allData[0].childrenPermissionList
      publicParentId.value = allData[0].scopeId
      if (roleInfo.value.roleId === 0) {
        checkPublicList.value = publicList.value.map(x => {
          return x.scopeId
        })
      } else {
        publicList.value.forEach(x => {
          if (x.hasChoose === 1) {
            checkPublicList.value.push(x.scopeId)
          }
        })
      }

      allData.shift()
    }
    fetchPerIds(allData)
    treeData.value = allData
    if (roleInfo.value.roleId === 0) {
      tree.value.setCheckedKeys(fetchIds(treeData.value, 'all'))
    } else {
      tree.value.setCheckedKeys(fetchIds(allData))
    }
  })
}
// 获取功能权限ids
const fetchPerIds = data => {
  data.forEach(ele => {
    if (ele.childrenMenuList.length > 0) {
      //  获取子集是否都选中，hasChoose=1
      const isChoose = getValuesByKey(ele, 'hasChoose')
      const unIndex = isChoose.findIndex(x => x === 0)
      ele.hasChoose = unIndex === -1 ? 1 : 0
      fetchPerIds(ele.childrenMenuList)
    }
    if (ele.childrenPermissionList.length > 0) {
      ele.childrenPermissionList.forEach(i => {
        if (i.hasChoose === 1) {
          checkList.value.push(i.scopeId)
        }
      })
    }
  })
}
const fetchIds = (target, type) => {
  const arr = []
  target.forEach(ele => {
    if (type === 'all') {
      ele.disabled = true
      arr.push(ele.scopeId)
      if (ele.childrenPermissionList.length > 0) {
        perCheckedDisabled.value = true
        ele.childrenPermissionList.forEach(i => checkList.value.push(i.scopeId))
      }
    } else {
      if (ele.hasChoose === 1) {
        arr.push(ele.scopeId)
      }
    }
    if (ele.childrenMenuList.length > 0) {
      arr.push(...fetchIds(ele.childrenMenuList, type))
    }
  })
  return arr
}
// 获取子集是否都选中
function getValuesByKey(obj, key) {
  let arr = []
  if (obj) {
    if (obj && obj.childrenMenuList && obj.childrenMenuList.length > 0) {
      obj.childrenMenuList.forEach(x => {
        arr.push(x[key])
        arr = arr.concat(getValuesByKey(x, key))
      })
    }
  }
  return arr
}
onMounted(() => {
  roleInfo.value = JSON.parse(sessionStorage.getItem('roleInfo'))
  fetchDetail()
})
onBeforeUnmount(() => {
  sessionStorage.removeItem('roleInfo')
})
</script>

<style lang="scss">
.per_config_wrapper {
  .config_header {
    background: #ffffff;
    border-radius: 4px;
    display: flex;
    align-items: center;
    padding: 16px 28px 20px 28px;
    &_icon {
      width: 32px;
      height: 32px;
      background: #364fcd;
      border-radius: 50%;
      color: #fff;
      margin-right: 16px;
    }
    &_text {
      line-height: 20px;
      > span {
        color: #364fcd;
        font-size: 18px;
      }
    }
  }
  .config_main {
    height: calc(100vh - 258px);
    overflow-y: auto;
    margin-top: 16px;
    background-color: #fff;
    border-radius: 4px;
    &_header {
      display: flex;
      padding: 16px 56px;
      border-bottom: 1px solid #eeeff5;
      .header_tab {
        font-weight: 500;
        color: #323233;
        line-height: 20px;
        &:first-child {
          width: 300px;
        }
        &:last-child {
          flex: 1;
        }
      }
    }
    &_content {
      padding: 24px 56px;
      .check_wrapper {
        position: absolute;
        left: 220px;
        top: 0;
        .el-checkbox {
          height: inherit;
        }
      }
    }
  }
  .config_footer {
    background: #ffffff;
    border-radius: 4px;
    padding: 13px 0;
    width: 100%;
    margin-top: 16px;
    // position: fixed;
    // right: 0;
    // bottom: 0;
    // z-index: 10;
    // width: calc(100% - 210px);
  }
}
.per_wrapper {
  position: absolute;
  top: 0;
}
// 公共权限
.public_box {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  margin-bottom: 12px;
  .public_label {
    width: 300px;
    line-height: 32px;
  }
  .public_content {
    width: calc(100% - 300px);
  }
}
</style>
