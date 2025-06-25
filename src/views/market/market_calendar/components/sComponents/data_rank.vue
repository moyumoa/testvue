<template>
  <div class="data_rank">
    <div class="rang_top">
      <span class="name">{{ dataList.name || '-' }}</span>
      <div class="rule_box">
        <div
          class="one_rule"
          @click="changeTitleRule(item.name)"
          :class="{ one_rule: true, choose_rule: item.name == chooseTitleRule }"
          v-for="(item, index) in titleRuleList"
          :key="index"
        >
          {{ item.label }}
        </div>
      </div>
    </div>
    <div class="rank_con">
      <ul class="rank_list" v-if="dataList.data.length > 0">
        <li class="rank_item" v-for="(item, index) in dataList.data" :key="index">
          <div class="rank_left">
            <div class="serial">{{ index + 1 }}</div>
            <div class="substance">
              <img :src="item.avatar" alt class="img" />
              <div class="s_right">
                <div class="s_right_one_box">
                  <p
                    class="tips_title"
                    :style="
                      chooseTitleRule == 1 && item.staffStatus && item.staffStatus == 2
                        ? 'max-width:148px'
                        : ''
                    "
                    v-if="chooseTitleRule == 1"
                  >
                    {{ item.userBrandName || '-' }}
                  </p>
                  <p
                    class="tips_title"
                    :style="chooseTitleRule != 1 ? 'max-width:148px' : ''"
                    v-else
                  >
                    {{ item.nickname || '-' }}
                  </p>
                  <div
                    class="xm_depart"
                    v-if="chooseTitleRule == 1 && item.staffStatus && item.staffStatus == 2"
                  ></div>
                  <!-- 矩阵号被删除 -->
                  <div
                    class="xm_delClass"
                    v-if="chooseTitleRule != 1 && item.xuserIsDel && item.xuserIsDel == 1"
                  ></div>
                </div>
                <p class="tips_t" v-if="chooseTitleRule == 1">
                  {{ (item.depts && item.depts.join('、')) || '-' }}
                </p>
              </div>
            </div>
          </div>
          <div class="num">{{ item.value || 0 }}</div>
        </li>
      </ul>
      <div class="no_data" v-else>
        <img src="@/assets/images/content_center/no_data.png" alt />
        <p>暂无数据</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { throttle } from '@/utils/tools.js'
const props = defineProps({
  dataList: {
    type: Object,
    default: () => {
      return {}
    }
  }
})
const { dataList } = toRefs(props)
const chooseTitleRule = ref(1)
const titleRuleList = ref([
  {
    name: 1,
    label: '达人'
  },
  {
    name: 2,
    label: '账号'
  }
])
const emits = defineEmits(['changeDimension'])
// 表头的tab切换
const changeTitleRule = throttle(e => {
  chooseTitleRule.value = e
  emits('changeDimension', chooseTitleRule.value)
}, 300)
emits('changeDimension', chooseTitleRule.value)
</script>

<style lang="scss" scoped>
.data_rank {
  width: 100%;
  margin-top: 20px;
  .rang_top {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    .name {
      font-size: 16px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #303133;
      line-height: 22px;
    }
    .rule_box {
      flex: 1;
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;
      .one_rule {
        padding-left: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        color: #909399;
        line-height: 20px;
        padding-right: 8px;
        &:last-child {
          padding-right: 0px;
        }
      }
      .one_rule + .one_rule {
        border-left: 1px solid #e8e8e8;
      }
      .choose_rule {
        color: $theme_color;
      }
    }
  }
  .rank_con {
    .rank_list {
      .rank_item {
        box-sizing: border-box;
        border-bottom: 1px solid #e8e8e8;
        // counter-increment: recordNumber;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px 8px 16px;
        .rank_left {
          display: flex;
          align-items: center;
          .serial {
            margin-right: 23px;
            font-size: 16px;
            font-family: Helvetica;
            color: #909399;
            line-height: 19px;
          }
        }
        .substance {
          display: flex;
          .img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
          }
          .s_right {
            margin-left: 12px;
            .s_right_one_box {
              display: flex;
              flex-direction: row;
              justify-content: flex-start;
              align-items: center;
            }
            .tips_title {
              font-size: 14px;
              font-family: PingFangSC-Regular, PingFang SC;
              font-weight: 400;
              color: #303133;
              line-height: 20px;
              text-overflow: ellipsis;
              white-space: nowrap;
              overflow-wrap: break-word;
              overflow: hidden;
              max-width: 200px;
            }
            .tips_t {
              font-size: 12px;
              font-family: PingFangSC-Regular, PingFang SC;
              font-weight: 400;
              color: #909399;
              line-height: 18px;
              margin-top: 2px;
              text-overflow: ellipsis;
              white-space: nowrap;
              overflow-wrap: break-word;
              overflow: hidden;
              max-width: 200px;
            }
          }
        }
      }
      // .rank_item:before {
      //   content: counter(recordNumber, decimal);
      // }
    }
  }
  .no_data {
    padding: 68px 0 46px 0;
    text-align: center;

    > img {
      width: 75px;
      height: 54px;
    }

    > p {
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      color: #303133;
      line-height: 20px;
    }
  }
}
</style>
