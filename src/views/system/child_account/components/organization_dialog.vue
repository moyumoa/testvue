<template>
  <el-dialog width="1070px" v-model="show" :title="title">
    <el-form class="title_wrap" :model="formInline" :inline="true" @submit.prevent>
      <div v-if="permissionsType === null || permissionsType === 0" class="all">全部矩阵号</div>
      <el-form-item v-else label-position="right" style="margin-bottom: 0px; margin-right: 24px">
        <el-select
          style="width: 118px"
          v-model="formInline.matrixStatus"
          placeholder="请选择矩阵号"
          @change="changeSelect"
        >
          <el-option
            v-for="(item, index) in selects"
            :label="item.label"
            :value="item.value"
            :key="index"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        label
        label-position="right"
        style="width: 240px; margin-bottom: 0px; margin-right: 24px"
      >
        <el-input
          v-model.trim="formInline.matrixName"
          class="w-50 m-2"
          size="large"
          @keyup.enter="getPmsPage"
          @clear="getPmsPage"
          placeholder="请输入矩阵号名称"
          clearable
          :suffix-icon="transElIconName('Search')"
        ></el-input>
      </el-form-item>
    </el-form>
    <xm_table
      class="pic_table"
      v-loading="tableForm.loading"
      :data="tableForm.listData"
      v-model:page="tableForm.page"
      @getTableData="getPmsPage"
    >
      <el-table-column min-width="200" label="矩阵号">
        <template #default="scope">
          <div class="user_box">
            <img
              v-if="scope.row.authAccountPhoto"
              :src="scope.row.authAccountPhoto"
              class="user_head"
              alt
            />
            <img
              v-else
              src="@/assets/images/content_center/default_user.png"
              class="user_head"
              alt
            />
            <div class="user_content">
              <div class="content1">
                <div style="max-width: 300px" class="content_text row_overflow">
                  {{ scope.row.authAccountName || '--' }}
                </div>
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column width="160" label="粉丝数">
        <template #default="scope">{{ wanSliceFormat(scope.row.fansNum || 0) }}</template>
      </el-table-column>
      <el-table-column min-width="200" label="所属" v-if="formInline.matrixStatus !== 'a'">
        <template #default="scope">
          <template v-if="scope.row && scope.row.categoryNames.length > 0">
            <div class="user_box" v-for="(item, index) in scope.row.categoryNames" :key="index">
              <img
                v-if="formInline.matrixStatus === 'b'"
                src="@/assets/images/content_config/shelf.png"
                class="user_right"
                alt
              />
              <img v-else src="@/assets/images/content_config/copy.png" class="user_right" alt />
              <div class="user_content">
                <div class="content1">
                  <div style="max-width: 300px" class="content_text row_overflow">{{ item }}</div>
                </div>
              </div>
            </div>
          </template>
          <div v-else>--</div>
        </template>
      </el-table-column>
    </xm_table>
  </el-dialog>
</template>

<script>
import { transElIconName, wanSliceFormat } from '@/utils/tools.js'
import { getUserActDataPmsPage } from '@/api/system_setting/personal'
import { reactive } from 'vue'
export default {
  props: {
    matrixData: {
      type: Object,
      default: () => {
        return {
          show: false,
          title: '',
          row: null
        }
      }
    },
    userId: {
      default: null,
      type: Number
    },
    permissionsType: {
      default: null,
      type: Number
    }
  },
  setup(props) {
    console.log(props.permissionsType, 'permissionsType')
    const { show, title, row } = toRefs(props.matrixData)
    // 昵称搜索
    const formInline = reactive({
      // showSelect: true,
      matrixName: '',
      matrixStatus: 'a'
    })
    // table数据
    const tableForm = reactive({
      loading: false,
      listData: [],
      page: {
        index: 1,
        size: 10,
        total: 0
      }
    })

    watch(
      () => props.matrixData.row,
      (newVal, oldVal) => {
        if (newVal) {
          tableForm.page.index = newVal.current
          tableForm.page.size = newVal.size
          tableForm.page.total = newVal.total
          tableForm.listData = newVal.records
        }
      }
    )
    watch(
      () => props.userId,
      val => {
        console.log(val)
      },
      { immediate: true }
    )
    // 下拉框数据
    const selects = ref([
      { label: '矩阵号', value: 'a' },
      { label: '组织架构', value: 'b' },
      { label: '矩阵号分组', value: 'c' }
    ])
    const changeSelect = val => {
      if (val === 'a') {
        formInline.matrixStatus = 'a'
      } else if (val === 'b') {
        formInline.matrixStatus = 'b'
      } else if (val === 'c') {
        formInline.matrixStatus = 'c'
      }
      getPmsPage()
    }
    // 分页查询 数据权限矩阵号
    function getPmsPage() {
      tableForm.loading = true
      const permissionType = props.permissionsType === null ? 0 : props.permissionsType
      let relationType = null
      if (formInline.matrixStatus === 'a') {
        relationType = 0
      } else if (formInline.matrixStatus === 'b') {
        relationType = 1
      } else if (formInline.matrixStatus === 'c') {
        relationType = 2
      }
      const temp = {
        pageNumber: tableForm.page.index,
        pageSize: tableForm.page.size,
        permissionType: permissionType, //	权限类型 null:无数据权限，0:全部矩阵号，1:指定矩阵号
        userId: props.userId,
        accountName: formInline.matrixName,
        brandId: JSON.parse(localStorage.getItem('brandInfo')).brandId
      }
      if (temp.permissionType === 1) {
        temp.relationType = relationType
      }
      getUserActDataPmsPage(temp)
        .then(res => {
          tableForm.listData = res.data.records
          tableForm.page.total = res.data.total
        })
        .finally((tableForm.loading = false))
    }
    onMounted(() => {
      getPmsPage()
    })
    return {
      show,
      title,
      row,
      formInline,
      transElIconName,
      wanSliceFormat,
      tableForm,
      selects,
      changeSelect,
      getPmsPage
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/layout.scss';
.title_wrap {
  display: flex;
  margin-bottom: 16px;
  .all {
    width: 118px;
    height: 32px;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    text-align: center;
    line-height: 32px;
    box-sizing: border-box;
    margin-right: 24px;
  }
}
.pic_table {
  .user_box {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    cursor: pointer;
    .user_head {
      width: 48px;
      height: 48px;
      border-radius: 100%;
      margin-right: 10px;
    }
    .user_right {
      width: 16px;
      height: 16px;
      border-radius: 100%;
      margin-right: 10px;
    }
    .user_content {
      max-width: calc(100% - 58px);
      min-height: 48px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      .content1 {
        max-width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        font-size: 14px;
        font-weight: 500;
        color: #303133;
        line-height: 20px;
        .content_text {
          // width: calc(100% - 22px);
        }
        img {
          width: 16px;
          height: 16px;
          margin-left: 6px;
        }
      }
      .content2 {
        // margin-top: 6px;
        font-size: 12px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #909399;
        line-height: 17px;
      }
    }
  }
}
</style>
