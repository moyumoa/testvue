<template>
  <div class="oneBox" style="padding-bottom: 24px">
    <nav class="top">
      <p class="titleLeft">快速入口</p>
    </nav>
    <div class="content">
      <section
        v-for="item of list"
        :key="item.id"
        @click="fastEnter(item.id)"
        style="cursor: pointer"
      >
        <img :src="item.imgUrl" alt="" />
        <p>{{ item.title }}</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const list = [
  {
    title: '任务中心',
    id: 0,
    imgUrl:
      'https://tagvv-1256030678.file.myqcloud.com/img/202112221501562af696db6a.png?imageMogr2/rquality/100/thumbnail/750',
    show: true
  },
  {
    title: '审核中心',
    id: 1,
    imgUrl:
      'https://tagvv-1256030678.file.myqcloud.com/img/202112221505197c9c171325.png?imageMogr2/rquality/100/thumbnail/750',
    show: true
  },
  {
    title: '部门成员',
    id: 2,
    imgUrl:
      'https://tagvv-1256030678.file.myqcloud.com/img/2021122215245945a286ef51.png?imageMogr2/rquality/100/thumbnail/750',
    show: true
  },
  {
    title: '金币商城',
    id: 3,
    imgUrl:
      'https://tagvv-1256030678.file.myqcloud.com/img/20211222152520603ceb30ea.png?imageMogr2/rquality/100/thumbnail/750',
    show: true
  },
  {
    title: '运营分析',
    id: 4,
    imgUrl:
      'https://tagvv-1256030678.file.myqcloud.com/img/2021122215254036a4aaf745.png?imageMogr2/rquality/100/thumbnail/750',
    show: true
  }
]
const fastEnter = id => {
  const pathUrl = ref(null)
  if (id !== 2) {
    switch (id) {
      case 0:
        pathUrl.value = 'video_task'
        break
      case 1:
        pathUrl.value = '/content_market/audit_center'
        break
      case 2:
        pathUrl.value = '/content_center/content_matrix'
        break
      case 3:
        pathUrl.value = 'gold_exchange_gifts'
        break
      case 4:
        pathUrl.value = 'analysis'
        break
    }
    router.push({
      path: pathUrl.value
    })
  } else {
    window.open(
      `${location.origin}/system_manage/user_manage?module=${window.encodeURI(
        window.encodeURI('系统管理')
      )}`
    )
  }
}
</script>

<style lang="scss" scoped>
.oneBox {
  border-radius: 4px;
  padding: 0 14px;
  margin: 16px 0;
  background: #fff;
  // 头部标题
  .top {
    padding-top: 22px;
    font-size: 18px;
    font-family: PingFangSC-Semibold, PingFang SC;
    font-weight: 600;
    color: #303133;
  }

  .content {
    margin-top: 22px;
    display: flex;
    padding: 0 12px;
    justify-content: space-between;
    section {
      display: flex;
      align-items: center;
      img {
        width: 48px;
        height: 48px;
      }
      p {
        margin-left: 12px;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #333333;
      }
    }
  }
}
</style>
