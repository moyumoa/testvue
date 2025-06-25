<template>
  <div>
    <slot name="default">
      <el-button v-if="!classInfo.id" type="primary" @click="$data.isShowDialog = true">
        设置
      </el-button>
      <div class="selected" v-else>
        <span style="font-size: 14px">{{ classInfo.title }}</span>
        <span class="action" @click="previewClass(classInfo)">预览</span>
        <br />
        <el-image
          style="width: 100px; height: 100px; margin-bottom: 10px"
          :src="classInfo.cover"
          fit="cover"
        />
        <br />
        <el-button type="primary" v-if="!disabled" @click="$data.isShowDialog = true">
          去修改
        </el-button>
      </div>
    </slot>

    <el-dialog v-model="$data.isShowDialog" :width="560">
      <template #title>
        <div class="dialog_title">
          <span class="title">学习内容设置</span>
        </div>
      </template>
      <div class="dialog_content">
        <div class="search_wrapper">
          <el-select
            v-if="!judgeOEA()"
            v-model="$data.source"
            placeholder="请选择课程分类"
            style="width: 254px"
          >
            <el-option
              v-for="item in $data.classifyList"
              :label="item.label"
              :value="item.value"
              :key="item.value"
            />
          </el-select>
          <el-input
            v-model="$data.queryName"
            placeholder="请输入课程名称或具体内容标题"
            style="margin-right: 16px"
            :validate-event="false"
          ></el-input>
          <el-button type="primary" @click="getList">查询</el-button>
          <el-button @click="resetList">重置</el-button>
        </div>
        <div class="course_list" v-loading="$data.loading">
          <div class="course_item" v-for="(course, index) in $data.list" :key="index">
            <div
              class="course_name"
              @click="selectCourse(course)"
              :class="{ active: currentCourse.id === course.id }"
            >
              <el-icon color="#909399" :class="[course.expand ? 'expand' : 'put']">
                <i-caret-right />
              </el-icon>
              <span class="name">{{ course.name }}</span>
              <span class="total">(共{{ course.courseContentVOList.length }}节)</span>
            </div>
            <el-collapse-transition v-show="course.expand">
              <div class="class_list">
                <div
                  class="class_item"
                  v-for="(item, k) in course.courseContentVOList"
                  :class="{ active: item.id == $data.selectedClass.id }"
                  :key="k"
                  @click="selectClass(item)"
                >
                  <div class="class_name">第{{ k + 1 }}节：{{ item.title }}</div>
                  <div class="preview" v-if="showPreview" @click.stop="previewClass(item)">
                    预览
                  </div>
                </div>
              </div>
            </el-collapse-transition>
          </div>
          <div class="none_course" v-if="$data.list.length === 0">暂未找到相关课程</div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="$data.isShowDialog = false">取消</el-button>
          <el-button type="primary" @click="onConfirm">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <preview-class-dialog
      v-model:dialogVisible="$data.previewDialogVisible"
      :classInfo="$data.previewClassInfo"
    ></preview-class-dialog>
  </div>
</template>

<script setup>
import { getCourseListByName } from '@/api/market/course'
import { ElCollapseTransition, ElMessage } from 'element-plus'
import previewClassDialog from '@/views/market/study/course_management/components/preview_class_dialog.vue'

const props = defineProps({
  classInfo: Object,
  disabled: Boolean,
  show: {
    type: Boolean,
    default: false
  },
  showPreview: {
    // 是否显示课程预览
    type: Boolean,
    default: true
  },
  canChooseCourse: {
    // 能选择大的课程
    type: Boolean,
    default: false
  }
})
const { classInfo, disabled, showPreview, canChooseCourse } = toRefs(props)

const judgeOEA = inject('$judgeOEA')
const emits = defineEmits(['select', 'update:classInfo', 'update:show', 'confirm'])
const $data = reactive({
  isShowDialog: false,
  loading: false,
  queryName: '',
  list: [],
  selectedClass: {},
  previewClassInfo: {},
  previewDialogVisible: false,
  source: -1,
  classifyList: [
    {
      label: '全部',
      value: -1
    },
    {
      label: '企业课程',
      value: 0
    },
    {
      label: '星麦精选',
      value: 1
    }
  ]
})
watch(
  () => props.show,
  newValue => {
    $data.isShowDialog = newValue
  },
  { immediate: true }
)
watch(
  () => $data.isShowDialog,
  newValue => {
    // $data.isShowDialog = newValue
    emits('update:show', newValue)
  }
)

function getList() {
  $data.loading = true
  getCourseListByName({
    name: $data.queryName,
    source: judgeOEA() ? 0 : $data.source === -1 ? null : $data.source
  })
    .then(res => {
      $data.list = res.data.map(e => {
        e.expand = false
        return e
      })
      $data.selectedClass = classInfo.value || {}
    })
    .finally(() => {
      $data.loading = false
    })
}

function resetList() {
  $data.source = -1
  $data.queryName = ''
  getList()
}
const currentCourse = ref({
  id: -1
})
// 选择课程
function selectClass(item) {
  $data.selectedClass = item
  // 选中小节课程时，整节课程置空
  currentCourse.value = { id: -1 }
}

// 选择一整节课程
const selectCourse = item => {
  item.expand = !item.expand
  if (canChooseCourse.value) {
    currentCourse.value = item
  }
}
// 课程预览
function previewClass(item) {
  $data.previewClassInfo = item
  $data.previewDialogVisible = true
}

function onConfirm() {
  if (!$data.selectedClass.id && !canChooseCourse.value) {
    ElMessage.warning('请选择课程')
    return
  }
  emits('update:classInfo', $data.selectedClass)
  // 如果选择一大课程就触发
  if (currentCourse.value.id !== -1) {
    console.log('---大课程选中 ', currentCourse.value)
    emits('confirm', currentCourse.value)
  } else {
    console.log('---小课程触发 ', $data.selectedClass)
    emits('confirm', $data.selectedClass)
  }
  $data.isShowDialog = false
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.search_wrapper {
  display: flex;
}
.selected {
  .action {
    cursor: pointer;
    color: #364fcd;
    margin-left: 10px;
  }
}
.course_list {
  margin-top: 12px;
  color: #303133;
  font-size: 14px;
  height: 330px;
  overflow-y: auto;
  .course_item {
    cursor: pointer;
    .course_name {
      display: flex;
      align-items: center;
      height: 40px;
      padding: 0 10px;
      &:hover {
        background: #f5f7fa;
      }
      .expand {
        transition: all 0.5s;
        transform: rotate(90deg);
      }
      .put {
        transition: all 0.5s;
        transform: rotate(0);
      }
      .name {
        @include mult_line(1);
        flex: 1;
        margin-left: 4px;
      }
      .total {
        font-size: 12px;
        color: #909399;
      }
    }
    .class_list {
      .class_item {
        cursor: pointer;
        padding-left: 34px;
        padding-right: 10px;
        line-height: 40px;
        display: flex;
        justify-content: space-between;
        &:hover {
          background: #f5f6fd;
        }
        &.active {
          background: #f5f6fd;
        }
        .class_name {
          @include mult_line(1);
          color: #606266;
        }
        .preview {
          color: #364fcd;
        }
      }
    }
  }
  .active {
    background: #f5f6fd;
  }
  .none_course {
    width: 100%;
    height: 100%;
    color: #909399;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
  }
}
:deep .el-dialog__header {
  .dialog_title {
    .title {
      font-size: 20px;
      color: #333;
      margin-right: 8px;
    }
  }
}
:deep .el-dialog__body {
  .el-input__inner {
    border-color: #dcdfe6 !important;
  }
}
</style>
