<template>
  <el-dialog
    :modelValue="props.visible"
    width="900px"
    title="选择成员"
    :before-close="cancel"
    :close-on-click-modal="false"
  >
    <div class="main">
      <div class="left">
        <el-input
          class="search_input"
          v-model.trim="sectionInput"
          clearable
          placeholder="请输入部门名称"
          @change="filterText"
          @clear="clearInput"
        />
        <div class="selected_wrapper">
          <el-tree
            v-show="showTree"
            class="mt_16"
            :data="leftTree"
            node-key="id"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            :props="{ label: 'name' }"
            @node-click="onNodeClick"
          >
            <template #default="{ node }">
              <div class="tree_node">
                <div class="node_text">
                  <div class="node_icon">
                    <i class="icon iconfont icon-jiagou"></i>
                  </div>
                  <div>{{ node.label }}</div>
                </div>
              </div>
            </template>
          </el-tree>
          <div v-show="!showTree" style="margin-top: 16px">
            <div v-if="treeData.length">
              <div
                class="tree_section"
                v-for="(item, index) in treeData"
                :key="index"
                @click="onTreeClick(item)"
              >
                <div class="node_icon">
                  <i class="icon iconfont icon-jiagou"></i>
                </div>
                <div class="text">{{ item.name }}</div>
              </div>
            </div>
            <div style="text-align: center; color: #c0c4cc" v-else>暂无数据</div>
          </div>
        </div>
      </div>
      <div class="right">
        <el-input
          class="search_input"
          v-model="personInput"
          clearable
          @change="getStaffList"
          placeholder="请输入成员名称"
        />
        <div class="selected_wrapper mt_16">
          <template v-for="item in listData" :key="item.userId">
            <div class="selected_item">
              <el-checkbox-group v-model="selectedIdList">
                <el-checkbox :label="item.userId">
                  <div class="info">
                    <img class="photo" :src="item.photo" alt="" />
                    <p class="name">{{ item.name }}</p>
                  </div>
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </template>
          <template v-if="listData.length === 0">
            <p style="text-align: center; color: #c0c4cc">暂无数据</p>
          </template>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button @click="cancel">取消</el-button>
      <el-button type="primary" @click="confirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import sectionModel from '@/views/system/organization_framework/model/section_model.js'
import { deptStaffPage } from '@/api/system_setting/account'
import { dept } from '@/api/system_setting/section'
const props = defineProps({
  visible: {
    type: Boolean
  },
  model: {
    type: Object
  }
})
const emits = defineEmits(['update:visible', 'confirm'])
const selectedIdList = ref([])
selectedIdList.value = JSON.parse(JSON.stringify(props.model.selectedIdList))
const listData = ref([])

const { leftTree, filterNode, getData } = sectionModel()
getData()
const sectionInput = ref('')
const personInput = ref('')
const showTree = ref(true)
const department = reactive({
  id: null,
  name: ''
})

const onNodeClick = data => {
  department.name = data.name
  department.id = data.id
  getStaffList()
}
const getStaffList = () => {
  deptStaffPage({
    name: sectionInput.value,
    staffName: personInput.value,
    departmentId: department.id,
    pageNumber: 1,
    pageSize: 2000
  }).then(res => {
    listData.value = res.data.records
  })
}
getStaffList()

const onTreeClick = item => {
  department.name = item.name
  department.id = item.departmentId
  getStaffList()
}
const treeData = ref([])
const filterText = () => {
  sectionInput.value && (showTree.value = false)
  dept({ name: sectionInput.value, pageNumber: 1, pageSize: 10 })
    .then(res => {
      treeData.value = res.data.records
    })
    .catch(err => {
      console.log(err, 'errr')
    })
  getStaffList()
}
const clearInput = () => {
  showTree.value = true
  department.name = ''
  department.id = ''
  getStaffList()
}
const cancel = () => {
  emits('update:visible', false)
}
const confirm = () => {
  emits('confirm', selectedIdList.value)
}
</script>

<style lang="scss" scoped>
.main {
  display: flex;
  height: 500px;
  .left,
  .right {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0 16px;
    .title {
      line-height: 24px;
      margin-bottom: 12px;
    }
    .selected_wrapper {
      flex: 1;
      overflow-y: auto;
      .selected_item {
        margin-bottom: 8px;
        .el-checkbox {
          width: 100%;
          height: 36px;
          :deep(.el-checkbox__label) {
            width: 100%;
            .info {
              display: flex;
              align-items: center;
              width: 80%;
              .photo {
                width: 36px;
                height: 36px;
                border-radius: 50%;
              }
              .name {
                margin-left: 8px;
              }
            }
          }
        }
        &:hover {
          background-color: #eee;
        }
      }
    }
  }
}
.tree_node {
  display: flex;
  line-height: 26px;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  .node_text {
    display: flex;
    align-items: center;
    .node_icon {
      width: 26px;
      height: 26px;
      margin-right: 8px;
      background: #364fcd;
      opacity: 0.6;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
    .node_empty {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      margin-right: 10px;
    }
  }
  .node_btns {
    display: none;
    align-items: center;
    i {
      color: $theme_color;
      margin-right: 24px;
      &:last-child {
        margin-right: 16px;
        color: #303133;
      }
    }
  }
  &:hover {
    .node_btns {
      display: flex;
    }
  }
}
.tree_section {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 16px;
  cursor: pointer;
  padding: 5px;
  &:hover {
    background: #ecf5ff;
  }
  .node_icon {
    width: 26px;
    height: 26px;
    margin-right: 8px;
    background: #364fcd;
    opacity: 0.6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }
  .text {
    line-height: 26px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow-wrap: break-word;
  }
}
</style>
