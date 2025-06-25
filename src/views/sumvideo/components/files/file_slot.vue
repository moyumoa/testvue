<template>
  <div
    :class="{
      one_file: true,
      click_file:
        (rightActionId == data.id || props.chooseId == data.id || data.id === '0') && showDropDown,
      choose_file: props.chooseId == data.id && !(showDropDown || showRadio)
    }"
  >
    <div :class="{ one_left: true, one_left_left: data.level < 5 }">
      <img
        v-if="!hideFileIcon"
        class="file_icon"
        src="https://tagvv-1256030678.file.myqcloud.com/20240326d93yy.png"
        alt=""
      />
      <span :title="node.label" class="file_title line-hidden1">{{ node.label }}</span>
    </div>
    <!-- 右侧操作区 新增 -->
    <div class="one_right_box" v-if="showDropDown">
      <div
        v-if="data.level < 5"
        :class="{ one_right: true, one_right_4: data.id !== '0' }"
        @click.stop="addFileFun"
      >
        <img
          class="right_icon"
          src="https://tagvv-1256030678.file.myqcloud.com/20240407g0rmh.png"
          alt=""
        />
      </div>

      <!-- 右侧操作区 移动、删除、重名等 -->
      <el-dropdown
        v-if="data.id !== '0' && !onlyShowAdd"
        popper-class="xm_dropDown"
        @click.stop="() => {}"
      >
        <div class="one_right">
          <img
            class="right_icon"
            src="https://tagvv-1256030678.file.myqcloud.com/20240326z14q1.png"
            alt=""
          />
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click.prevent="showRenameFun">重命名</el-dropdown-item>
            <el-dropdown-item @click.prevent="showRemoveFun">移动到</el-dropdown-item>
            <el-dropdown-item @click.prevent="showDelFun">删除</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <!-- 单选框 -->
    <div class="one_right2" v-if="showRadio">
      <img
        v-if="data.id == props.chooseId"
        src="https://tagvv-1256030678.file.myqcloud.com/2024032665c91.png"
        alt=""
      />
      <img v-else src="https://tagvv-1256030678.file.myqcloud.com/20240326yxu18.png" alt="" />
    </div>
  </div>
</template>
<script setup>
import { getTagFolderCount, getCreationTagFolderCount } from '@/api/sumvideo/files.js'
import { ElMessage } from 'element-plus'
import { throttle, isNotEmpty } from '@/utils/tools.js'
const props = defineProps({
  origin: {
    type: String,
    default: '' // material 原料库 finishProduct 素材库
  },
  node: {
    type: Object,
    default: () => {}
  },
  data: {
    type: Object,
    default: () => {}
  },
  chooseId: {
    type: String || Number,
    default: null
  },
  showRadio: {
    type: Boolean,
    default: false
  }, // 是否显示单选框
  showDropDown: {
    type: Boolean,
    default: false
  }, // 是否显示右侧操作区 删除 移动 新增等
  rightActionId: {
    type: String || Number,
    default: null
  }, // 右侧显示操作区的ID
  onlyShowAdd: {
    type: Boolean,
    default: false
  }, // 可编辑时，是否只显示新增
  hideFileIcon: {
    type: Boolean,
    default: false
  }, // 是否隐藏文件夹ICON
  fileType: Number // 文件夹类型 3原料库 4实拍库 5场景库
})
const { origin, node, data, rightActionId, onlyShowAdd, hideFileIcon, fileType } = toRefs(props)

const emits = defineEmits(['showRenameFun', 'showRemoveFun', 'showDelFun', 'addFileFun'])
// 重命名
const showRenameFun = throttle(() => {
  emits('showRenameFun', node.value, data.value)
}, 500)
// 移动到
const showRemoveFun = throttle(() => {
  emits('showRemoveFun', node.value, data.value)
}, 500)
// 删除
const showDelFun = throttle(() => {
  emits('showDelFun', node.value, data.value)
}, 500)

// 新增 文件夹总的层级最多5级，单个文件夹下的子文件夹数量最多100
const addFileFun = throttle(() => {
  console.log('新增', node.value, data.value)
  if (data.value.level >= 5) {
    ElMessage({
      type: 'warning',
      message: '文件夹最多5级'
    })
  } else {
    const param = {
      id: data.value.id
    }
    if (isNotEmpty(fileType.value)) {
      param.tagType = fileType.value
    }
    const countPromise = isNotEmpty(fileType.value)
      ? getTagFolderCount(param)
      : origin.value === 'material'
      ? getTagFolderCount(param)
      : getCreationTagFolderCount(param)
    countPromise
      .then(res => {
        if (res.code === 0) {
          // 调接口，获取子文件夹数量，超过100就提示
          if (res.data >= 100) {
            ElMessage({
              type: 'warning',
              message: '文件夹数量已达上限'
            })
          } else {
            emits('addFileFun', node.value, data.value)
          }
        }
      })
      .catch(() => {
        emits('addFileFun', node.value, data.value)
      })
  }
}, 500)
</script>
<style lang="scss" scoped>
.one_file {
  width: calc(100% - 24px);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  .one_left {
    width: calc(100% - 48px);
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .file_icon {
      width: 16px;
      height: 16px;
      display: flex;
      object-fit: contain;
      margin-right: 6px;
    }
    .file_title {
      width: calc(100% - 22px);
      font-weight: 400;
      font-size: 14px;
      color: #606266;
      line-height: 20px;
    }
  }
  .one_right {
    margin-right: 8px;
    width: 24px;
    height: 24px;
    border-radius: 2px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    img {
      width: 24px;
      height: 24px;
      display: flex;
      object-fit: contain;
    }
    &:hover {
      background: #e9e9e9;
    }
  }
  .one_right_4 {
    margin-right: 4px !important;
  }
  .one_right_box {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
  }
  .one_right2 {
    width: 16px;
    height: 16px;
    margin-right: 12px;
    img {
      width: 100%;
      height: 100%;
      display: flex;
      object-fit: contain;
    }
  }
}
.click_file {
  .one_left {
    width: calc(100% - 48px) !important;
  }
  .one_left_left {
    width: calc(100% - 68px) !important;
  }
  .one_right {
    opacity: 1 !important;
  }
}
.choose_file {
  background: #f2f2f2;
}
</style>
