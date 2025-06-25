<template>
  <div class="detail">
    <div style="background: #fff; margin-bottom: 16px">
      <div class="box">线索详情</div>
      <div class="line"></div>
      <ul class="box2">
        <!-- <li style="margin-bottom: 60px"> -->
        <li style="">
          <span>商品信息</span>
          <template v-if="false">
            <img src="@/assets/images/content_center/cover.jpg" alt />
            <div>
              <div class="title">测试名字</div>
              <div class="price">
                <span>￥14.90 --暂无字段</span>
                <span>￥14.90 --暂无字段</span>
              </div>
            </div>
          </template>
          <template v-else>
            <div style="width: calc(100% - 84px)">
              <div class="title" style="width: 100%">
                <span>{{ myClueList.soruceInfo.split(' - ')[0] || '--' }}</span>
              </div>
              <div class="price">
                <span>{{ myClueList.soruceInfo.split(' - ')[1] || '--' }}</span>
              </div>
            </div>
          </template>
        </li>
        <li>
          <span>留资时间</span>
          <span>{{ myClueList.gmtFromTime || '--' }}</span>
        </li>
        <li>
          <span>线索状态</span>
          <span>{{ myClueList.isFollowUp === 0 ? '待跟进' : '已跟进' }}</span>
        </li>
      </ul>
    </div>
    <div style="background: #fff; margin-bottom: 16px">
      <div class="box">基础信息</div>
      <div class="line"></div>
      <ul class="box2">
        <li>
          <span>线索昵称</span>
          <span>{{ myClueList.userNickname || '--' }}</span>
        </li>
        <li>
          <span>手机号码</span>
          <!-- <span v-if="isShowPhone">{{ myClueList.tell }}</span> -->
          <span>{{ myClueList.tell.substring(0, 3) }}****{{ myClueList.tell.substring(7) }}</span>
          <!-- <div class="eye_icon">
            <img
              src="@/assets/images/content_center/yanjing_xianshi.png"
              alt
              @click="showPhoneFun()"
              v-if="isShowPhone"
            />
            <img
              src="@/assets/images/content_center/yanjing_yincang.png"
              alt
              @click="showPhoneFun()"
              v-else
            />
          </div> -->
        </li>
        <li>
          <span>姓名</span>
          <span>{{ myClueList.username || '--' }}</span>
        </li>
        <!-- <li>
          <span>地址</span>
          <span>{{ myClueList.addr || '--' }}</span>
        </li>-->
        <!-- <li>
          <span>其他字段1</span>
          <span>----暂无字段</span>
        </li>
        <li>
          <span>其他字段2</span>
          <span>----暂无字段</span>
        </li>-->
      </ul>
    </div>
    <div style="background: #fff; margin-bottom: 16px">
      <div class="box">线索来源</div>
      <div class="line"></div>
      <ul class="box2">
        <li>
          <span>线索来源</span>
          <span>
            {{
              myClueList.cluseSourceType
                ? myClueList.cluseSourceType === 0
                  ? '小程序'
                  : '经营工具'
                : '--'
            }}
          </span>
        </li>
        <!-- <li>
          <span>地址</span>
          <span>{{ myClueList.addr || '--' }}</span>
        </li>-->
        <!-- <li style="margin-bottom: 60px">
          <span>线索视频</span>
          <div class="pic">
            <img src="@/assets/images/content_center/cover.jpg" alt />
            <div>
              <el-tooltip class="item" effect="dark" content="测试标题" placement="top">
                <div class="title" style="width: 200px">测试标题--暂无</div>
              </el-tooltip>
              <div class="price">
                <span>发布时间</span>
                <span>2021/04/21 12:21:21 --暂无</span>
              </div>
            </div>
          </div>
          <div class="pic">
            <img
              style="width: 60px; height: 60px"
              src="@/assets/images/content_center/cover.jpg"
              alt
            />
            <div>
              <el-tooltip class="item" effect="dark" content="测试标题" placement="top">
                <div class="title" style="width: 200px">测试标题 --暂无</div>
              </el-tooltip>
              <div class="price">
                <span>直播时间</span>
                <span>2021/04/21 12:21:21--暂无</span>
              </div>
              <div class="price" style="margin-top: 6px">
                <span>直播时长</span>
                <span>0时20分--暂无字段</span>
              </div>
            </div>
          </div>
        </li>-->
        <li>
          <span>关联矩阵号</span>
          <span @click="toDetails(myClueList.dyOpenId)" style="color: #364fcd; cursor: pointer">
            {{ myClueList.nikename || '--' }}
          </span>
        </li>
        <!-- <li>
          <span>关联任务</span>
          <span>--暂无字段</span>
        </li>-->
      </ul>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
// const isShowPhone = ref(false)
// const showPhoneFun = () => {
//   isShowPhone.value = !isShowPhone.value
// }
const clueList = JSON.parse(sessionStorage.getItem('clueList'))
const myClueList = clueList
// 跳转详情
const router = useRouter()
function toDetails(item) {
  router.push({
    path: '/content_center/content_matrix/details',
    query: {
      openId: item
    }
  })
}
</script>

<style lang="scss" scoped>
@import url(../content_manage/components/comment.css);
.detail {
  font-size: 14px;
  .box {
    // margin-bottom: 16px;
    border-radius: 4px;
    background: #fff;
    padding: 0 0 0 24px;
    font-size: 18px;
    font-weight: 600;
    color: #323233;
    line-height: 50px;
  }
  .box2 {
    padding: 28px 24px;
    margin-left: 15vw;

    li {
      display: flex;
      margin-bottom: 22px;
      // height: 20px;
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #303133;
      line-height: 20px;
      .eye_icon {
        width: 20px;
        height: 20px;
        margin-left: 8px;
        cursor: pointer;
        display: flex;
        img {
          width: 100%;
          height: 100%;
          display: flex;
        }
      }
      &:nth-last-child(1) {
        margin-bottom: 0;
      }
      .pic {
        display: flex;
        width: 343px;
        // overflow: hidden;
        img {
          width: 60px;
          height: 80px;
          background: #e0e0e0;
          border-radius: 4px;
          margin-right: 10px;
        }
        .title {
          height: max-content;
          min-height: 20px;
          width: 200px;
          font-size: 14px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #303133;
          line-height: 20px;
          margin-bottom: 6px;
        }
        .price {
          height: max-content;
          min-height: 20px;
          font-size: 14px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #303133;
          line-height: 20px;
          > span {
            width: 100%;
            white-space: pre-wrap;
            word-break: break-all;
            margin-right: 8px;
            color: #909399;
            &:nth-child(2) {
              color: #909399;
              text-decoration: none;
            }
          }
        }
      }
      > span {
        &:nth-child(1) {
          margin-right: 14px;
          display: block;
          width: 70px;
          text-align: right;
        }
        &:nth-child(2) {
          color: #909399;
        }
      }
      > img {
        width: 60px;
        height: 60px;
        border-radius: 4px;
        margin-right: 10px;
      }
      > div {
        .title {
          height: max-content;
          min-height: 20px;
          width: 100%;
          font-size: 14px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #303133;
          line-height: 20px;
          margin-bottom: 6px;
        }
        .price {
          height: max-content;
          min-height: 20px;
          font-size: 14px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #303133;
          line-height: 20px;
          > span {
            width: 100%;
            white-space: pre-wrap;
            word-break: break-all;
            margin-right: 8px;
            &:nth-child(2) {
              color: #909399;
              text-decoration: line-through;
            }
          }
        }
      }
    }
  }
  .line {
    width: 100%;
    height: 1px;
    background: #e8e8e8;
  }
}
</style>
