<template>
  <div class="rankings-account">
    <div class="top-wrapper">
      <div class="title">留资排行榜</div>
    </div>
    <div class="container" v-loading="loading">
      <el-table
        :data="tableData"
        stripe
        style="width: 100%"
        v-if="tableData.length > 0"
        max-height="464"
      >
        <el-table-column type="index" width="60" label="排名" />
        <el-table-column label="矩阵号" fit>
          <template v-slot="{ row }">
            <div class="table-user-info" @click="toDetail(row)">
              <el-image :src="row.dyHeadUrl" class="user-img"></el-image>
              <div class="user-name">{{ row.dyNickname }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="clientCount" width="110" label="留资数" align="right" />
      </el-table>
      <el-empty description="暂无数据" style="margin-top: 100px" :image-size="120" v-else>
        <template #image>
          <img src="@/assets/images/content_center/no_data.png" />
        </template>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { getCustomerRanking } from '@/api/scrm/operation.js'
import { sendHrefMessage } from '@/utils/OEA.js'
import { getUserMenu, getUserParentMenu } from '@/utils/tools'
const props = defineProps({
  params: {
    type: Object,
    default: () => {
      return {
        deptIds: '',
        endTime: '',
        startTime: ''
      }
    }
  }
})
const { params } = toRefs(props)

const tableData = ref([])
const loading = ref(false)
const getList = () => {
  loading.value = true
  tableData.value = []
  getCustomerRanking({
    ...params.value,
    stage: 3
  })
    .then(res => {
      loading.value = false
      if (res.code === 0) {
        tableData.value = res.data
        // tableData.value = tableData.value.splice(0, 7)
      }
    })
    .catch(err => {
      console.log(err)
      loading.value = false
    })
}

const toDetail = item => {
  // 跨菜单跳转 begin
  const menu = getUserMenu('content:matrix:manage')
  const parentMenu = menu ? getUserParentMenu(menu.parentId) : null
  if (menu && parentMenu) {
    sessionStorage.setItem('menuActive', menu?.scopeUrl)
    sessionStorage.setItem('module', parentMenu?.parentName || parentMenu?.scopeName)
    const url = location.origin + '/content_center/content_matrix/details?openId=' + item.dyOpenId
    sendHrefMessage(url)
  }
  // 跨菜单跳转 end
}

watch(
  () => params.value,
  value => {
    getList()
  },
  { deep: true, immediate: true }
)
</script>

<style lang="scss" scoped>
.rankings-account {
  height: 530px;
  background: #ffffff;
  border-radius: 4px;
  padding: 22px 20px;
  box-sizing: border-box;
  overflow: hidden;
  .top-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 14px;

    .title {
      flex: 1;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }

  .container {
    .table-user-info {
      display: flex;
      align-items: center;
      .user-img {
        flex-shrink: 0;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        margin-right: 12px;
      }
      .user-name {
        @include mult_line(2);
      }
    }
  }
}
</style>
