<template>
  <div class="account">
    <div class="module_title">矩阵指数</div>
    <div class="account_container" v-if="list.length > 0">
      <div
        class="account_item"
        v-for="(item, index) in list"
        :key="item.brandId"
        @click="toDetail(item)"
      >
        <div :class="['item_index', `index_${index}`]">{{ index + 1 }}.</div>
        <div class="item_main">
          <img class="account_cover" :src="item.dyHeadUrl" />
          <div class="account_info">
            <div class="account_title">{{ item.dyNickname || '--' }}</div>
            <div class="account_img">
              <div class="user_name">{{ item.dyDisplayId || '--' }}</div>
            </div>
          </div>
        </div>
        <div class="item_right">{{ numberFormat(item.exponent) }}</div>
      </div>
      <div class="more_info" @click="toMore" v-if="props.showMore">
        更多
        <el-icon>
          <i-arrow-right />
        </el-icon>
      </div>
    </div>
    <div class="no_data" v-else>
      <el-empty
        :image-size="70"
        image="https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/bb500557fe2e43cea32c45b68eca89dc_1685948431961.png"
        description="暂无数据"
      />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { numberFormat, isNotEmpty } from '@/utils/tools.js'
import { getAccountGradeRank } from '@/api/content_center/content_overview.js'

const props = defineProps({
  size: {
    type: Number,
    default: 5
  },
  // 是否显示更多
  showMore: {
    type: Boolean,
    default: true
  },
  groupId: String
})
watch(
  () => props.groupId,
  () => {
    getList()
  }
)
const otherParams = ref()
const list = ref([])
const getList = () => {
  let params = { pageNo: 1, pageSize: props.size, groupIds: props.groupId ? [props.groupId] : [] }
  params = { ...params, ...otherParams.value }
  getAccountGradeRank(params).then(res => {
    if (res.code === 0) {
      list.value = res?.data?.records || []
    }
  })
}
getList()
const router = useRouter()
// 去 矩阵指数
const toMore = () => {
  router.push('/content_center/account_overview')
}
// 去当前 账号详情
const toDetail = item => {
  console.log(item.dyOpenId)
  router.push(`/content_center/content_matrix/details?openId=${item.dyOpenId}`)
}
function paramChange(param) {
  otherParams.value = isNotEmpty(param) ? param : null
  getList()
}
defineExpose({
  paramChange
})
</script>

<style lang="scss" scoped>
.account {
  flex: 1;
  margin-top: 16px;
  //margin-right: 16px;
  padding: 22px 24px;
  background-color: #fff;
  border-radius: 4px;
  //height: 531px;

  .module_title {
    font-size: 18px;
    font-family: PingFangSC-Semibold, PingFang SC;
    font-weight: 600;
    color: #303133;
    line-height: 26px;
  }

  .account_container {
    margin-top: 20px;
    color: #8f939a;
    height: calc(100% - 50px);
    display: flex;
    flex-direction: column;
    //justify-content: ;

    .account_item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 36px;
      cursor: pointer;

      .item_index {
        width: 26px;
        font-family: Helvetica;
        font-size: 16px;
      }

      .index_0 {
        color: #db5335;
      }

      .index_1 {
        color: #dd713e;
      }

      .index_2 {
        color: #eeaf14;
      }

      .item_main {
        flex: 1;
        display: flex;
        align-items: center;
        margin-right: 15px;

        .account_cover {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          border-radius: 24px;
          margin-right: 10px;
          object-fit: cover;
        }

        .account_info {
          .account_title {
            //max-width: 188px;
            height: 20px;
            font-size: 14px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: #303133;
            line-height: 20px;
            @include mult_line(1);
          }

          .account_img {
            display: flex;
            align-items: center;
            margin-top: 6px;

            .user_icon {
              width: 18px;
              height: 18px;
              border-radius: 50%;
              object-fit: cover;
              margin-right: 8px;
            }
          }
        }
      }
    }

    .more_info {
      margin-top: auto;
      text-align: center;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .no_data {
    display: flex;
    align-items: center;
    justify-content: center;
    height: calc(100% - 50px);
  }
}
</style>
