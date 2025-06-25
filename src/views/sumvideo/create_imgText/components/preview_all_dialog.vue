<template>
  <el-dialog
    :close-on-click-modal="false"
    ref="dialog"
    custom-class="rule_setting_dialog hide_footer_line"
    destroy-on-close
    v-model="show"
    :title="title"
    width="680px"
    :before-close="beforeCloseFun"
  >
    <div class="dialog_content" v-loading="loading">
      <div
        class="all_img_warp"
        ::infinite-scroll-distance="1000"
        v-infinite-scroll="loadFun"
        :infinite-scroll-distance="50"
        :infinite-scroll-immediate="false"
        :infinite-scroll-disabled="listData.length >= page.total"
      >
        <template v-if="listData && listData.length > 0">
          <div class="all_img">
            <!-- :class="{
                item_img_active: chooseIds && chooseIds.length > 0 && chooseIds.includes(item.id)
              }" -->
            <div
              class="item_img"
              :style="{
                height: type == 'scene' ? '120px' : '160px'
              }"
              v-for="(item, index) in listData"
              :key="index"
              @click="previewFun(item)"
            >
              <!-- 组图 -->
              <template v-if="type === 'scene'">
                <sceneCover :list="item.pictures ? JSON.parse(item.pictures) : []" />
                <div class="item_activ"></div>
              </template>
              <!-- 其余图 -->
              <template v-else>
                <div class="item_activ"></div>
                <img :src="item.url" alt="" class="cover_img" />
              </template>
            </div>
          </div>

          <div class="loading_library">
            <img src="/public/loading.gif" v-if="loading && page.index > 1" alt="" />
            {{
              loading
                ? page.index === 1
                  ? ''
                  : '加载中...'
                : listData.length >= page.total
                ? listData.length > 12
                  ? '已经到底了~'
                  : ''
                : '上拉加载更多~'
            }}
          </div>
        </template>
        <div v-if="!loading && !(listData && listData.length > 0)" class="no_echart">
          <img src="@/assets/images/content_center/no_activity.png" alt />
          暂无数据
        </div>
      </div>
    </div>
  </el-dialog>
</template>
<script setup>
import sceneCover from '@/views/sumvideo/components/scene_cover.vue'
import { throttle } from '@/utils/tools'

import { list } from '@/api/content_center/material_library.js'

const props = defineProps({
  allDialog: {
    show: false,
    type: null, // realImg实拍图 virtual虚拟模特 scence组图
    title: '',
    includeIds: [],
    chooseIds: [] // 选中数据
  }
})

const { show, title, type, includeIds } = toRefs(props.allDialog)

const dialog = ref(null)
const loading = ref(true)
const listData = ref([])
const emits = defineEmits(['preview'])

const previewFun = throttle(function (item) {
  console.log('预览一个', item)
  const infoSet = {
    realImg: { title: '图片预览', type: 'image' },
    virtual: { title: '图片预览', type: 'image' },
    scene: { title: '图片预览', type: 'scene' }
  }
  const previewTitle = infoSet[type.value]?.title || ''
  const previewType = infoSet[type.value]?.type || ''

  const params = {
    title: previewTitle,
    type: previewType,
    url: item.url,
    cover: item.cover || '',
    urlList: item.pictures
  }
  emits('preview', params)
}, 500)

const page = reactive({
  index: 1,
  size: 20,
  total: 0
})

function resetList() {
  loading.value = true
  page.index = 1
  getList()
}
function getList() {
  console.log('获取列表')
  const params = {
    includeIds: includeIds.value,
    pageNo: page.index,
    pageSize: page.size,
    orderSetting: '',
    searchCount: true
  }
  list(params)
    .then(res => {
      console.log('列表', res)
      if (res.code === 0) {
        page.total = res.data.total
        if (page.index === 1) {
          listData.value = res.data.records
        } else {
          listData.value = listData.value.concat(res.data.records)
        }
      }

      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}
function loadFun() {
  if (loading.value) return
  console.log('滚动到底')
  loading.value = true
  page.index++
  getList()
}

function beforeCloseFun(done) {
  done()
}
onMounted(() => {
  resetList()
})
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}

.dialog_content {
  min-height: 100px;
  max-height: 60vh;
  .all_img_warp {
    min-height: 100px;
    width: 100%;
    max-height: 60vh;
    overflow-y: auto;
    .all_img {
      display: flex;
      flex-wrap: wrap;
      padding-top: 16px;
      padding-left: 12px;
      .item_img {
        width: 120px;
        min-width: 120px;
        height: 160px;
        margin-right: 12px;
        margin-bottom: 12px;
        // background: #b9b9b9;
        border-radius: 4px;
        border: 1px solid #eaedf0;
        position: relative;
        cursor: pointer;
        .cover_img {
          width: 100%;
          height: 100%;
          border-radius: 2px;
          object-fit: cover;
          display: flex;
          overflow-clip-margin: border-box;
          -webkit-overflow-clip-margin: border-box;
        }
      }
      .item_img_active {
        border-color: #364fcd;
        .item_activ {
          background: #364fcd;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          border: 1px solid #dcdee0;
          margin-left: 16px;
          cursor: pointer;
          position: absolute;
          right: 8px;
          bottom: 8px;
          &::after {
            box-sizing: content-box;
            content: '';
            border: 1px solid #fff;
            border-left: 0;
            border-top: 0;
            height: 8px;
            left: 5px;
            position: absolute;
            top: 1px;
            transform: rotate(45deg) scaleY(1);
            width: 4px;
            transition: transform 0.15s ease-in 0.05s;
            transform-origin: center;
          }
        }
      }
    }
  }
  .loading_library {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin-top: 15px;
    padding-bottom: 15px;
    img {
      height: 25px;
      margin-right: 4px;
    }
  }
  .no_echart {
    width: 100%;
    height: 400px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    font-weight: 400;
    color: #8f939a;
    line-height: 20px;
    img {
      width: 70px;
      height: 70px;
      object-fit: cover;
      margin-bottom: 7px;
    }
  }
}
</style>
