<template>
  <el-dialog v-model="show" :width="580" :before-close="beforeClose" title="异常提示">
    <div class="err_content">
      <div class="err_tips">
        导入完成，{{ successList && successList.length }} 个矩阵号导入成功，{{
          errList && errList.length
        }}
        个矩阵号导入失败
        <div style="color: #d40000; margin-top: 6px">
          <p>导入失败的原因：</p>
          <p>1、矩阵号ID和昵称不正确或不唯一</p>
          <p>2、当前账户不具备数据权限</p>
        </div>
      </div>
      <!--      <div class="err_num">{{ (errList && errList.join('、')) || '' }}</div>-->
      <div class="err_down" @click="downloadErr">
        下载异常矩阵号列表
        <el-tooltip effect="dark" placement="top">
          <template #content>
            <div>
              您可以直接将本次导入失败的异常矩阵号以excel文件的形式保存至本地，逐个核对后尝试重新导入。
            </div>
          </template>
          <img class="expired_img" src="@/assets/images/content_center/tip_gray.png" alt="" />
        </el-tooltip>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { downloadError } from '@/api/content_center/content_matrix.js'
import { exportFile } from '@/utils/exportFile'

const show = true
const props = defineProps({
  errList: Array,
  successList: Array
})
const { errList, successList } = toRefs(props)
const emits = defineEmits(['errorClose'])

function beforeClose() {
  emits('errorClose')
}
function downloadErr() {
  // const  test=successList.value
  // console.log(test)
  // debugger
  // 下载错误列表
  const params = errList.value || []
  return exportFile(downloadError, params, '异常矩阵号列表', 'xlsx')
}
</script>

<style lang="scss" scoped>
.err_content {
  .err_tips {
    padding-bottom: 12px;
    margin-top: -4px;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    line-height: 1.5;
  }
  .err_num {
    min-height: 100px;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    padding: 10px 12px;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #303133;
    line-height: 20px;
  }
  .err_down {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #364fcd;
    margin-top: 12px;
    cursor: pointer;
    .expired_img {
      width: 16px;
      height: 16px;
      margin-left: 9px;
    }
  }
}
</style>
