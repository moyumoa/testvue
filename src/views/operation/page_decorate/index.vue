<template>
  <div class="page_decorate">
    <div class="page_top">
      <el-button type="primary" @click="addFun">新增页面</el-button>
    </div>
    <xm_table
      v-loading="tableForm.loading"
      :data="tableForm.listData"
      v-model:page="tableForm.page"
      @getTableData="getList"
    >
      <el-table-column min-width="110" label="页面名称">
        <template #default="scope">
          <div class="name_box">
            <div class="row_overflow">
              {{ scope.row.title || '--' }}
            </div>
            <i v-if="haveApp && scope.row.isIndex" class="iconfont icon-shouye_xuanzhong"></i>
          </div>
        </template>
      </el-table-column>
      <el-table-column min-width="110" label="创建时间">
        <template #default="scope">
          {{ scope.row.gmtCreateTime ? String(scope.row.gmtCreateTime).replace(/T/, ' ') : '--' }}
        </template>
      </el-table-column>
      <!-- <el-table-column min-width="110" label="商品数">
        <template #default="scope">{{ wanSliceFormat(scope.row.watchTimes || 0) }}</template>
      </el-table-column> -->
      <el-table-column min-width="110" label="累计访客数/浏览量">
        <template #default="scope">
          {{ wanSliceFormat(scope.row.peopleCount || 0) }}/{{
            wanSliceFormat(scope.row.browseCount || 0)
          }}
        </template>
      </el-table-column>
      <el-table-column min-width="110" label="今日访客数/浏览量">
        <template #default="scope">
          {{ wanSliceFormat(scope.row.nowPeopleCount || 0) }}/{{
            wanSliceFormat(scope.row.nowBrowseCount || 0)
          }}
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="180" align="center" header-align="center">
        <template #default="scope">
          <div class="table_btn">
            <el-link type="primary" v-if="haveApp" class="one_btn" @click="extendFun(scope.row)">
              推广
            </el-link>
            <el-link type="primary" class="one_btn" @click="editFun(scope.row)">编辑</el-link>
            <el-link type="danger" class="one_btn" @click="delFun(scope.row)">删除</el-link>
          </div>
        </template>
      </el-table-column>
    </xm_table>

    <el-dialog
      v-model="extendModal.show"
      custom-class="hide_footer_line hide_header_line"
      title="推广"
      width="490px"
      destroy-on-close
      :before-close="hanleClose"
    >
      <div class="code_box">
        <div class="code_link">
          <div class="code_text">链接</div>
          <div class="link_box">
            <input class="one_link" type="text" v-model="extendModal.link" disabled />
            <div class="one_btn" v-if="extendModal.link" v-copy="extendModal.link">复制</div>
          </div>
        </div>
        <div class="code_link">
          <div class="code_text">APPID</div>
          <div class="link_box">
            <input class="one_link" type="text" v-model="extendModal.appid" disabled />
            <div class="one_btn" v-if="extendModal.appid" v-copy="extendModal.appid">复制</div>
          </div>
        </div>
        <div class="code_link">
          <div class="code_text">页面路径</div>
          <div class="link_box">
            <input class="one_link" type="text" v-model="extendModal.pageUrl" disabled />
            <div class="one_btn" v-if="extendModal.pageUrl" v-copy="extendModal.pageUrl">复制</div>
          </div>
        </div>
        <div class="one_code" v-loading="extendModal.loading">
          <img
            id="codeImg"
            v-if="extendModal.qrcode"
            :src="extendModal.qrcode"
            style="width: 140px"
            alt=""
          />
          <div class="code_mark" v-else>二维码暂时走丢了</div>
        </div>
        <el-button
          :disabled="!extendModal.qrcode"
          style="margin-top: 24px"
          type="primary"
          @click="downloadImg"
        >
          保存二维码
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script setup>
import { delDiyPage, putDiyPageUrl, getIsApp, getBaseCode } from '@/api/operation/page_decorate.js'
import { getBrandAppInfo } from '@/api/market/task'
import vCopy from '@/directive/copy'
import { useRouter } from 'vue-router'
import { wanSliceFormat, throttle } from '@/utils/tools.js'
import { pageList } from './model/get_list.js'
const router = useRouter()

sessionStorage.removeItem('diyPage')
const haveApp = ref(false)
// 获取是否存在小程序
function getApp() {
  getIsApp().then(res => {
    if (res.code === 0) {
      haveApp.value = res.data
    }
  })
}
getApp()
const { tableForm, getList } = pageList()
// 新增
const addFun = throttle(e => {
  router.push({
    path: '/content_market/diyPrograme_page_decorate/detail'
  })
}, 700)
// 编辑
const editFun = throttle(e => {
  sessionStorage.setItem('diyPage', JSON.stringify(e))
  router.push({
    path: '/content_market/diyPrograme_page_decorate/detail',
    query: {
      id: e.id
    }
  })
}, 700)

const message = inject('$message')
const $confirm = inject('$confirm')
// 删除
const delFun = throttle(e => {
  if (haveApp.value && e.isIndex) {
    message.warning('当前页面已设为首页，不能删除哦')
    return
  }
  $confirm({
    title: '系统提醒',
    content: `确定删除微页面【${e.title || '--'}】？`,
    success() {
      delDiyPage({
        id: e.id
      }).then(res => {
        message.success('删除成功')
        getList()
      })
    }
  })
})

// 推广
const extendModal = reactive({
  show: false,
  id: null,
  link: '',
  qrcode: '',
  loading: false,
  appid: '',
  pageUrl: ''
})
let brandInfo = localStorage.getItem('brandInfo')
brandInfo = brandInfo ? JSON.parse(brandInfo) : {}
const extendFun = throttle(e => {
  extendModal.id = e.id
  extendModal.loading = true
  extendModal.show = true
  extendModal.pageUrl = `pages/diypage/index?id=${e.id}&brandId=${brandInfo.brandId}`
  putDiyPageUrl({
    id: e.id
  })
    .then(res => {
      if (res.code === 0) {
        extendModal.link = res.data
      }
    })
    .catch(() => {})
  getBaseCode({ id: e.id })
    .then(res => {
      if (res.code === 0 && res.data) {
        extendModal.qrcode = 'data:image/jpeg;base64,' + res.data
      }
      console.log(res)
    })
    .finally(() => {
      extendModal.loading = false
    })
  getMiniAppId()
}, 700)
// 保存图片
const downloadImg = () => {
  const image = new Image()
  // 解决跨域 Canvas 污染问题
  image.setAttribute('crossOrigin', 'anonymous')
  image.onload = function () {
    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    const context = canvas.getContext('2d')
    context.drawImage(image, 0, 0, image.width, image.height)
    const url = canvas.toDataURL('image/jpg') // 得到图片的base64编码数据

    const a = document.createElement('a') // 生成一个a元素
    const event = new MouseEvent('click') // 创建一个单击事件
    a.download = '推广二维码' // 设置图片名称
    a.href = url // 将生成的URL设置为a.href属性
    a.dispatchEvent(event) // 触发a的单击事件
  }
  image.src = extendModal.qrcode
}
function hanleClose(done) {
  extendModal.qrcode = ''
  extendModal.link = ''
  done()
}
function getMiniAppId() {
  getBrandAppInfo().then(res => {
    extendModal.appid = res.data.appId
  })
}
</script>
<style lang="scss" soped>
.page_decorate {
  background: #fff;
  padding: 24px;
}
.name_box {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  .iconfont {
    margin-left: 6px;
    font-size: 16px;
    color: #364fcd;
  }
}
.page_top {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 16px;
}
div {
  box-sizing: border-box;
}
.row_overflow {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow-wrap: break-word;
}

.table_btn {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  .one_btn + .one_btn {
    margin-left: 20px;
  }
}

// 推广弹窗
.code_box {
  margin-top: -16px;
  padding-bottom: 24px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .one_code {
    width: 140px;
    height: 140px;
    margin-top: 6px;
    .code_mark {
      width: 140px;
      height: 140px;

      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: #909399;
    }
  }
  .code_link {
    margin-bottom: 10px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .code_text {
      flex-shrink: 0;
      width: 60px;
      text-align: right;
      font-size: 14px;
      font-weight: 400;
      color: #303133;
      line-height: 20px;
    }
    .link_box {
      margin-left: 14px;
      width: 400px;
      height: 32px;
      background: #f7f8fa;
      border-radius: 4px;
      border: 1px solid #dcdfe6;

      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding: 6px 12px 6px 15px;
      .one_link {
        font-size: 14px;
        font-weight: 400;
        color: #282c38;
        line-height: 20px;
        width: calc(100% - 40px);
        background: none;
        border: none;
      }
      .one_btn {
        cursor: pointer;
        font-size: 14px;
        font-weight: 400;
        color: #364fcd;
        line-height: 20px;
      }
    }
  }
}
</style>
