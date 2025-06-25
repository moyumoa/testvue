<template>
  <div>
    <div class="block">
      <!-- <div class="block_title">创建直播传送门</div> -->
      <div class="block_main">
        <el-form label-width="240px">
          <el-form-item label="链接抖音号UID：">
            <div>
              <div class="uid_wapper">
                <el-input v-model="$data.uid" placeholder="请输入UID"></el-input>
                <async_button type="primary" style="margin-left: 24px" :asyncFunc="discern">
                  识别
                </async_button>
              </div>
              <div class="tips">
                <el-tooltip popper-class="tooltip-class" placement="right-start" raw-content>
                  <template #content>
                    <div class="live_portal_tooltip_content">
                      <p class="title">UID获取指南</p>
                      <p>1. 打开抖音，点击右下角的“我”</p>
                      <img src="https://tagvv-1256030678.file.myqcloud.com/20220413bbhxx.png" />
                      <p>2. 点击右上角三道杠，选择“设置”</p>
                      <img src="https://tagvv-1256030678.file.myqcloud.com/20220413daxro.png" />
                      <br />
                      <img src="https://tagvv-1256030678.file.myqcloud.com/202204130ln0p.png" />
                      <p>3. 划到页面最下方，找到抖音版本号的字样</p>
                      <img src="https://tagvv-1256030678.file.myqcloud.com/2022041351047.png" />
                      <p>4. 快速点击这一行字五次，即可显示UID</p>
                      <img src="https://tagvv-1256030678.file.myqcloud.com/20220413n2xgo.png" />
                    </div>
                  </template>
                  <span class="live_portal_tip">
                    如何获取UID
                    <i class="iconfont icon icon-wenhao"></i>
                  </span>
                </el-tooltip>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="效果预览：">
            <div class="preview">
              <div class="live_bottom">
                <breath-lamp :size="48" :cover="$data.uidInfo.avatarUrl"></breath-lamp>
                <span class="name">{{ $data.uidInfo.nickname || '-' }}</span>
                <div class="to_btn">进入直播间</div>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="footer_btns">
      <el-button @click="cancel">取消</el-button>
      <async_button type="primary" :asyncFunc="save">保存</async_button>
    </div>
  </div>
</template>

<script setup>
import { getUIDInfo, updateLivePoartal } from '@/api/market/business_tools'
import { useRouter } from 'vue-router'
import breathLamp from './breath_lamp.vue'

const $message = inject('$message')
const router = useRouter()
const $data = reactive({
  uid: '',
  saving: false,
  uidInfo: {}
})

function discern() {
  return new Promise((resolve, reject) => {
    $data.uidInfo = {}
    if (!$data.uid) {
      $message.warning('请输入UID')
      reject(new Error())
    }
    getUIDInfo($data.uid)
      .then(res => {
        if (!res.data || !res.data.nickname) {
          return $message.warning('UID输入有误！请重新输入')
        }
        $data.uidInfo = {
          name: res.data.nickname,
          dyId: res.data.uniqueId  || res.data.shortId
        }
        if (res.data.avatarUrl) {
          $data.uidInfo.headImg =
            res.data.avatarUrl||
            'https://tagvv-1256030678.file.myqcloud.com/20220414mh1o3.png'
        }
        $message.success('识别成功')
      })
      .finally(() => {
        resolve()
      })
  })
}

function save() {
  return new Promise((resolve, reject) => {
    if (!$data.uid) {
      $message.warning('请输入UID')
      reject(new Error())
      return
    }
    if (!$data.uidInfo.name) {
      $message.warning('请先识别UID')
      reject(new Error())
      return
    }
    updateLivePoartal({
      uid: $data.uid,
      headImg: $data.uidInfo.headImg,
      name: $data.uidInfo.name,
      dyId: $data.uidInfo.dyId
    })
      .then(res => {
        $message.success(res.msg)
        router.go(-1)
      })
      .finally(() => {
        resolve()
      })
  })
}

function cancel() {
  router.go(-1)
}
</script>

<style lang="scss" scoped>
.block {
  background: #ffffff;
  border-radius: 4px;
  margin-bottom: 16px;
  .block_title {
    padding-left: 24px;
    line-height: 60px;
    font-weight: bold;
    border-bottom: 1px solid #e8e8e8;
    font-size: 18px;
    color: #323233;
  }
  .block_main {
    padding-top: 20px;
    padding-bottom: 50px;
    .uid_wapper {
      display: flex;
    }
    .preview {
      position: relative;
      width: 270px;
      height: 560px;
      background-image: url('https://tagvv-1256030678.file.myqcloud.com/20220415o5kfo.png');
      background-size: cover;
      .live_bottom {
        position: absolute;
        bottom: 50px;
        left: 0;
        right: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        .name {
          @include mult_line(1);
          font-size: 12px;
          color: #fff;
          line-height: 17px;
          margin: 16px 0;
        }
        .to_btn {
          width: 128px;
          line-height: 34px;
          height: 34px;
          text-align: center;
          background: linear-gradient(90deg, #ff2784 0%, #fd2a63 100%);
          border-radius: 6px;
          color: #fff;
          font-size: 16px;
        }
      }
    }
  }
}
.footer_btns {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 58px;
  box-sizing: border-box;
  background: #fff;
  > button {
    margin: 0 16px;
  }
}
</style>

<style lang="scss">
.live_portal_tooltip_content {
  font-size: 14px;
  line-height: 20px;
  color: #fff;

  .title {
    font-weight: bold;
  }

  img {
    width: 256px;
  }

  p {
    margin: 12px 0;
  }
}

.live_portal_tip {
  cursor: pointer;
  color: #364fcd;
  font-size: 14px;
  > i {
    font-size: 14px;
  }
}
</style>
