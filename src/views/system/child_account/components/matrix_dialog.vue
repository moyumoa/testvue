<template>
  <div class="dialog">
    <el-dialog width="828px" v-model="show" :title="title">
      <div class="inner_box" v-if="false">
        <el-radio-group v-model="choiceMatrx" @change="changeRadio">
          <el-radio v-for="item in matrxData" :key="item.value" :label="item.value">
            {{ item.label }}
          </el-radio>
        </el-radio-group>
      </div>
      <template v-if="showBtn">
        <div class="border">
          <gTabs :data="tabs" v-model:current="currentTab" />
        </div>
        <!-- 矩阵树结构 -->
        <matrixTree
          :currentTab="currentTab"
          :accountIds="informatData.dataAccountIds"
          :accountGroupIds="informatData.dataAccountGroupIds"
          @dataOneList="dataOneList"
          @dataOneListIds="dataOneListIds"
          @dataTwoList="dataTwoList"
          @dataTwoListIds="dataTwoListIds"
        ></matrixTree>
      </template>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleConfirm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import gTabs from '../../components/g_tabs/index.vue'
import matrixTree from './matrix_tree.vue'
export default {
  props: {
    informatData: {
      type: Object,
      default: () => {
        return {
          show: false,
          title: '',
          row: null,
          dataAccountIds: [],
          dataAccountGroupIds: []
        }
      }
    },
    myPermissionType: {
      type: String,
      default: '0'
    }
  },
  components: { gTabs, matrixTree },
  emits: ['setResult', 'dataAccountGroupIds', 'dataAccountIds'],
  setup(props, { emit }) {
    const showBtn = ref(false)
    // watch(
    //   () => props.informatData,
    //   val => {
    //     if (val.dataAccountIds.length || val.dataAccountGroupIds.length) {
    //       choiceMatrx.value = '1'
    //       changeRadio(choiceMatrx.value)
    //     }
    //   },
    //   { deep: true }
    // )
    // watch(
    //   () => props.myPermissionType,
    //   val => {
    //     console.log('props.myPermissionType', props.myPermissionType)
    //     if (val === '1') {
    //       showBtn.value = true
    //     } else {
    //       showBtn.value = !true
    //     }
    //   },
    //   {
    //     immediate: true
    //   }
    // )
    const choiceMatrx = ref('1') // ref(props.myPermissionType)
    const matrxData = ref([
      {
        label: '全部矩阵号',
        value: '0'
      },
      {
        label: '指定矩阵号',
        value: '1'
      }
    ])
    const { show, title } = toRefs(props.informatData)
    const currentTab = ref('a')
    const tabs = ref([
      { label: '矩阵号', value: 'a' },
      { label: '组织架构', value: 'b' },
      { label: '矩阵号分组', value: 'c' }
    ])
    const handleClose = () => {
      show.value = false
    }
    const arrSection = ref([])
    const arrSectionOne = ref([])
    const arrSectionTwo = ref([])
    const handleConfirm = () => {
      show.value = false
      // 全部矩阵号
      if (choiceMatrx.value === '0') {
        arrSection.value = ['全部矩阵号']
      } else {
        arrSection.value = arrSectionOne.value.concat(arrSectionTwo.value)
      }
      emit('setResult', arrSection.value)
      emit('permissionType', choiceMatrx.value)
    }
    const changeRadio = val => {
      if (String(val) === '0') {
        showBtn.value = false
      } else {
        showBtn.value = true
      }
    }

    const dataOneList = val => {
      arrSectionOne.value = val
    }
    const dataOneListIds = val => {
      emit('dataAccountIds', val)
    }
    const dataTwoListIds = val => {
      emit('dataAccountGroupIds', val)
    }
    const dataTwoList = val => {
      arrSectionTwo.value = val
    }

    function init() {
      choiceMatrx.value = '1'
      changeRadio(choiceMatrx.value)
    }
    init()
    return {
      show,
      title,
      choiceMatrx,
      matrxData,
      tabs,
      currentTab,
      handleClose,
      handleConfirm,
      changeRadio,
      showBtn,
      dataOneList,
      dataTwoList,
      dataOneListIds,
      dataTwoListIds
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog {
  :deep(.el-dialog__body) {
    padding: 0 !important;
  }
  .inner_box {
    border-bottom: 1px solid #dcdfe6;
    padding: 16px 24px 32px;
  }

  .border {
    border-bottom: 1px solid #dcdfe6;
  }
}
</style>
