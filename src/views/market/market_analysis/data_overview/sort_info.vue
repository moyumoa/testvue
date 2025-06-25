<template>
  <div>
    <div class="table_title" style="margin-bottom: 16px">
      <div class="index">排名</div>
      <div class="info">成员信息</div>
      <div class="detail">{{ name1 }}</div>
    </div>

    <div style="position: relative; height: 100%">
      <template v-if="sortData.length">
        <div class="table_title sort_data" v-for="(item, index) in sortData" :key="index">
          <div class="index">
            <img v-if="index == 0" src="@/assets/images/sort_img/num_one.png" alt />
            <img v-else-if="index == 1" src="@/assets/images/sort_img/num_two.png" alt />
            <img v-else-if="index == 2" src="@/assets/images/sort_img/num_three.png" alt />
            <div v-else>{{ index + 1 }}</div>
          </div>
          <div class="info">
            <img v-if="item.avatar" :src="item.avatar" alt />
            <img v-else src="@/assets/images/content_center/default_user.png" alt />
            <el-tooltip class="name" effect="dark" :content="item.xuserName" placement="top">
              <div class="info_name">{{ item.xuserName || '--' }}</div>
            </el-tooltip>
          </div>
          <div class="detail">
            <div class="process">
              <div class="inner" :style="{ width: item.percent + '%' }"></div>
            </div>
            <div class="val">{{ item.cvalue }}</div>
          </div>
        </div>
      </template>
      <div class="xm_noneData no_echart" v-else>
        <img src="@/assets/images/content_center/no_activity.png" alt />
        暂无数据
      </div>
    </div>
    <!-- <div v-else style="margin-top: 90px; color: #909399; line-height: 20px; text-align: center">
      暂无数据
    </div>-->
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Array,
      default: () => []
    },
    name: {
      type: String,
      default: '--'
    }
  },
  setup(props) {
    const { data } = toRefs(props)
    const name1 = toRef(props, 'name')
    return {
      sortData: data,
      name1: name1
    }
  }
}
</script>

<style lang="scss" scoped>
.no_echart {
  width: 100%;
  height: 100%;
  background: #fff;
  position: absolute;
  left: 0;
  top: 0;
}
.table_title {
  width: 100%;
  display: flex;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  .index {
    width: 30px;
  }
  .info {
    margin-left: 20px;
    width: 120px;
    > img {
      margin-right: 16px;
    }
    .info_name {
      @include mult_line(1);
    }
  }
  .detail {
    flex: 1;
    text-align: right;
  }
}
.sort_data {
  // height: 48px;
  margin-bottom: 20px;
  .index {
    display: flex;
    justify-content: center;
    align-items: center;
    img {
      width: 28px;
      height: 28px;
    }
  }
  .info {
    display: flex;
    align-items: center;
    img {
      width: 28px;
      height: 28px;
      border-radius: 50%;
    }
    .name {
      margin-left: 16px;
      font-size: 14px;
      color: #606266;
      line-height: 20px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
    }
  }
  .detail {
    display: flex;
    align-items: center;
    .process {
      flex: 1;
      height: 12px;
      background: #f5f6fa;
      border-radius: 8px;
      overflow: hidden;
      .inner {
        height: 100%;
        border-radius: 8px;
        background-color: #889cff;
      }
    }
    .val {
      width: 75px;
      font-size: 14px;
      color: #303133;
      line-height: 20px;
      text-align: right;
    }
  }
}
</style>
