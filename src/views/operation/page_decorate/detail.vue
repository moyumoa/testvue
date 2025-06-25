<template>
  <div class="page">
    <div class="page_head">
      <el-button @click="cancelPage">取消</el-button>
      <el-button type="primary" :loading="loading" @click="save">保存</el-button>
    </div>
    <div class="page_content">
      <div class="left">
        <template v-for="item in asideList" :key="item.title">
          <div class="brand_item">
            <p class="title" @click="item.isShow = !item.isShow">
              <img
                class="arrow"
                :class="{ rotate: !item.isShow }"
                src="@/assets/images/diy/arrow.png"
                alt=""
              />
              <span>{{ item.title }}（{{ item.list.length }}）</span>
            </p>
            <div class="list" v-show="item.isShow">
              <template v-for="i in item.list" :key="i.type">
                <div class="list_item flex_center" @click="addCom(i.type)">
                  <div class="content_wrapper">
                    <i :class="['iconfont', `icon-${i.icon}`, 'item_icon']"></i>
                    <p>{{ i.title }}</p>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>
      </div>
      <div class="center">
        <page-view
          v-model:pageInfo="pageInfo"
          v-model:data="componentList"
          :current="currentCom"
          @change="toggleCom"
          @del="delCom"
        />
      </div>
      <div class="right">
        <div class="right_postion">
          <template v-for="(item, index) in rightList" :key="index">
            <div
              :class="{
                one_postion: true,
                check_postion: currentCom.data ? item.type === currentCom.data.type : false
              }"
              @click="addPageCom(item.type)"
            >
              <i :class="['iconfont', `icon-${item.icon}`, 'item_icon']"></i>
              {{ item.title }}
            </div>
          </template>
        </div>
        <div class="right_center">
          <template v-if="Object.keys(currentCom).length !== 0">
            <component
              :is="currentCom.editor"
              v-model:componentData="currentCom.data.params"
              @upPageSetup="upPageSetup"
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { saveOrUpDiyPage } from '@/api/operation/diy.js'

import { useRouter } from 'vue-router'
import { throttle } from '@/utils/tools.js'
import PageView from './page_view.vue'
import { useDetail } from './model/use_detail.js'
const router = useRouter()
const {
  pageInfo,
  asideList,
  rightList,
  componentList,
  currentCom,
  toggleCom,
  delCom,
  addCom,
  addPageCom,
  echoCom
} = useDetail()

onMounted(() => {
  getInfo()
})
const loading = ref(false)
const id = ref()
const pageType = ref(99)
const type = ref(1)
// 获取页面信息
function getInfo() {
  let detailInfo = sessionStorage.getItem('diyPage')
  if (detailInfo) {
    detailInfo = JSON.parse(detailInfo)
    id.value = detailInfo.id
    pageType.value = detailInfo.pageType
    type.value = detailInfo.type
    echoCom(detailInfo.data)
  } else {
    echoCom('{}')
  }
}

// 页面设置修改
function upPageSetup(e) {
  console.log('detail,.', e, currentCom.value)
  if (currentCom.value.data.type === 'pageSetup') {
    pageInfo.value.info = e
  } else {
    pageInfo.value.nav = e
  }
}

const message = inject('$message')
// 取消
const cancelPage = throttle(() => {
  router.go(-1)
}, 300)
// 保存
const save = throttle(() => {
  if (componentList.value.length === 0) {
    message.warning('请先添加组件')
    return
  }
  let stu = true
  let errorText = ''
  componentList.value.forEach(x => {
    const xResult = x.validate()
    console.log(xResult)
    if (xResult !== true) {
      if (errorText === '') {
        errorText = xResult
      }
      stu = false
    }
  })
  if (!stu) {
    message.warning(errorText)
    return
  }
  if (pageInfo.value.info && pageInfo.value.info.title) {
    loading.value = true
    const component = componentList.value.map(x => x.data)
    saveOrUpDiyPage({
      id: id.value,
      data: JSON.stringify({
        pageInfo: pageInfo.value,
        component: component
      }),
      name: pageInfo.value.info.title,
      pageType: pageType.value,
      title: pageInfo.value.info.title,
      type: type.value
    })
      .then(res => {
        if (res.code === 0) {
          message.success('保存成功')
          router.go(-1)
        }
      })
      .finally(() => {
        loading.value = false
      })
  } else {
    message.warning('请在页面设置中输入页面标题')
  }
}, 300)
</script>

<style scoped lang="scss">
div {
  box-sizing: border-box;
}
.page {
  height: 100%;
  .page_head {
    background: #fff;
    width: calc(100% - 0px);
    height: 56px;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    padding-right: 16px;
  }
  .page_content {
    display: flex;
    height: calc(100% - 56px);

    .left {
      width: 208px;
      overflow-y: auto;
      background: #fff;
      padding: 40px 0px 0 24px;
      .brand_item {
        .title {
          margin-bottom: 8px;
          cursor: pointer;
          .arrow {
            width: 12px;
            height: 12px;
            transition: all 250ms;
            &.rotate {
              transform: rotate(-0.25turn);
            }
          }
          > span {
            font-family: PingFangSC-Medium, PingFang SC;
            font-weight: 500;
            color: #23272d;
            line-height: 24px;
            margin-left: 10px;
          }
        }
        .list {
          display: flex;
          flex-wrap: wrap;
          margin-bottom: 32px;
          &_item {
            width: 80px;
            height: 89px;
            cursor: pointer;
            color: #606266;
            &:hover {
              background-color: #364fcd;
              color: #fff;
              .content_wrapper .item_icon {
                color: #fff;
              }
            }
            .content_wrapper {
              text-align: center;
              .item_icon {
                font-size: 36px;
                color: #909399;
              }
              > p {
                margin-top: 4px;
                font-size: 12px;
                line-height: 17px;
              }
            }
          }
        }
      }
    }
    .center {
      flex: 1;
      min-width: 400px;
      padding: 40px 0;
      background-color: #f6f8fa;
    }
    .right {
      background: #fff;
      width: 380px;
      height: 100%;
      position: relative;
      .right_postion {
        position: absolute;
        left: -112px;
        top: 40px;
        .one_postion {
          width: 96px;
          height: 36px;
          background: #ffffff;
          box-shadow: 0px 4px 8px 0px rgba(95, 104, 147, 0.1);
          border-radius: 2px;
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          padding-left: 8px;
          font-size: 14px;
          font-weight: 400;
          color: #303133;
          line-height: 20px;
          i {
            font-size: 14px;
            margin-right: 6px;
          }
          &.check_postion {
            background: #364fcd;
            color: #fff;
          }
        }
        .one_postion + .one_postion {
          margin-top: 16px;
        }
      }
      .right_center {
        height: 100%;
        overflow-y: auto;
      }
    }
  }
}
</style>
