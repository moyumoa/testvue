<template>
  <el-dialog
    ref="dialog"
    width="560px"
    :title="props.info.title"
    v-model="show"
    destroy-on-close
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="content">
      <div class="item_line">
        {{ props.info.type == 1 ? '将选择业务主体保存到' : props.info.type == 2 ? '移动至' : '' }}
        <el-select
          v-model="formData.groups"
          filterable
          placeholder="请选择分组"
          style="min-height: 32px; margin: 0 12px"
          :style="{ width: props.info.type === 1 ? '180px' : '230px' }"
        >
          <el-option
            v-for="item in groupList"
            :label="item.groupName"
            :value="item.id"
            :key="item.id"
            :disabled="item.id == currentId"
          />
        </el-select>
        或
        <div class="content_btn" @click="createGroup">
          <img src="https://tagvv-1256030678.file.myqcloud.com/20240328bjpfu.png" alt="" />
          新建分组
        </div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="handleConfirm"
          :disabled="!formData.groups"
        >
          保存
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
const props = defineProps({
  info: {
    type: Object,
    default: () => {
      return {
        show: false,
        title: '',
        type: 1, // 1保存分组 2移动分组
        principalType: null,
        groups: null,
        chooseIds: [],
        groupList: []
      }
    }
  }
})
const { show } = toRefs(props.info)
const loading = ref(false)
const groupList = ref([])
const currentId = ref(null) // 当前操作的分组id
const emits = defineEmits(['close', 'submit', 'createGroup'])
const formData = reactive({
  groups: null, // 选中的分组id
  ids: []
})
const message = inject('$message')

watch(
  () => props.info.groupList,
  val => {
    if (val && val.length > 0) {
      groupList.value = val
    }
  },
  {
    deep: true,
    immediate: true
  }
)

watch(
  () => props.info.groups,
  val => {
    if (val) {
      currentId.value = val
    }
  },
  {
    deep: true,
    immediate: true
  }
)

function createGroup() {
  emits('createGroup')
}
function handleClose() {
  emits('close')
}
function handleConfirm() {
  if (!formData.groups) {
    message.warning('请选择分组！')
    return
  }
  loading.value = true
  emits('submit', props.info.type, formData)
}
</script>
<style lang="scss" scoped>
.content {
  padding: 15px 0;
  .item_line {
    display: flex;
    align-items: center;
    .content_btn {
      width: max-content;
      cursor: pointer;
      margin-left: 12px;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      font-weight: 400;
      font-size: 12px;
      color: #364fcd;
      line-height: 18px;
      padding: 6px 16px;
      border: 1px solid #364fcd;
      border-radius: 4px;
      img {
        width: 12px;
        height: 12px;
        object-fit: contain;
        display: flex;
        margin-right: 3px;
      }
      &:hover {
        background: rgba(54, 79, 205, 0.1);
      }
    }
  }
}
</style>
