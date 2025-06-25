<template>
  <div class="brand_info" v-loading="loading">
    <div class="base_info block">
      <div class="block_header">
        <div class="title">基础信息</div>
      </div>
      <div class="info_group">
        <div class="group_left">
          <div class="info_item">
            <div class="label">品牌名：</div>
            <div class="value">
              {{ brandInfo.brandName }}
            </div>
          </div>
          <div class="info_item">
            <div class="label">开户时间：</div>
            <div class="value">{{ brandInfo.startTime }}</div>
          </div>
          <div class="info_item">
            <div class="label">到期时间：</div>
            <div class="value">{{ brandInfo.useTime }}</div>
          </div>
        </div>
        <div class="group_right">
          <div class="info_item">
            <div class="label">品牌logo：</div>
            <div class="value">
              <div class="upload_tip">建议尺寸为120*120px，大小不超过500K，仅支持png格式</div>

              <div class="has_cover" v-if="brandInfo.brandLogo">
                <el-image
                  style="width: 80px; height: 80px; border-radius: 2px"
                  :src="brandInfo.brandLogo"
                  fit="cover"
                  :preview-src-list="[brandInfo.brandLogo]"
                ></el-image>
                <img
                  @click="delImg"
                  src="https://tagvv-1256030678.file.myqcloud.com/202211253s881.png"
                  alt=""
                  class="del_icon"
                />
              </div>
              <uploadImg
                :showLoading="true"
                v-else
                :index="0"
                @success="uploadImgSuccess"
                accept="image/png"
                :acceptList="['image/png']"
                :useCommonReason="true"
                commonReason="大小不超过500k，支持png格式"
                style="width: 78px"
              >
                <div :class="{ upload_box: true }">
                  <el-icon class="upload_icon">
                    <i-plus />
                  </el-icon>
                  <div class="uploader_text">上传logo</div>
                </div>
              </uploadImg>
            </div>
          </div>
        </div>
      </div>
      <div class="info_logo"></div>
    </div>
    <div class="quota block">
      <div class="block_header">
        <div class="title">套餐额度</div>
        <el-button
          v-if="showRecharge"
          style="margin: 0 20px"
          @click="router.push('/system_manage/voucher_center')"
        >
          去充值
        </el-button>
        <el-link
          v-if="showRecharge"
          type="primary"
          @click="router.push('/system_manage/voucher_center?type=record')"
        >
          充值记录
        </el-link>
      </div>
      <div class="quota_group">
        <div class="quota_item">
          <div class="quota_item_header">
            <div class="text">矩阵号接入数量</div>
            <!-- 非企业版或企业版的历史客户显示具体数量 -->
            <div
              class="progress_text"
              v-if="systemVersion != 3 || (systemVersion == 3 && userInfo.isOldBrand)"
            >
              剩余
              <span>{{ productUseInfo.accountRemainNum }}</span>
              个
            </div>
            <div class="progress_text" v-else><span>不限</span></div>
            <div
              class="more"
              v-if="showRecord"
              @click="router.push('/system_manage/package_usage_record?type=account')"
            >
              详情
            </div>
          </div>
        </div>
        <div class="quota_item" v-if="systemVersion == 3">
          <div class="quota_item_header">
            <div class="text">直播录屏分钟数</div>
            <div class="progress_text">
              剩余
              <span>{{ productUseInfo.liveRecordRemainMinutes }}</span>
              分钟
            </div>
            <div
              class="more"
              v-if="showRecord"
              @click="router.push('/system_manage/package_usage_record?type=live')"
            >
              详情
            </div>
          </div>
        </div>
        <div class="quota_item">
          <div class="quota_item_header">
            <div class="text">视频智能生产合成星力值</div>
            <div class="progress_text">
              剩余
              <span>{{ productUseInfo.videoNumber }}</span>
              星力值
            </div>
            <div
              v-if="showRecord"
              class="more"
              @click="router.push('/system_manage/package_usage_record?type=video')"
            >
              详情
            </div>
          </div>
        </div>
        <!-- <div class="quota_item">
          <div class="quota_item_header">
            <div class="text">AI文案创作券</div>
            <div class="progress_text">
              剩余
              <span>{{ productUseInfo.aiCreationTicketRemainNum }}</span>
              张
            </div>
            <div
              v-if="showRecord"
              class="more"
              @click="router.push('/system_manage/package_usage_record?type=aiCreateTicket')"
            >
              详情
            </div>
          </div>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import uploadImg from '@/views/market/miniprogram_operation/components/upload_image.vue'
import { throttle } from '@/utils/tools'
import { selectBrand, getProductUseInfo } from '@/api/system_setting/brand_info'
import { useRouter } from 'vue-router'
import { updateBrandConfig } from '@/api/system_setting/setting'
import { useStore } from 'vuex'
const store = useStore()
const router = useRouter()
const { brandId } = JSON.parse(localStorage.getItem('brandInfo'))
const systemVersion = computed(() => store.state.user.systemVersion)
const userInfo = computed(() => store.getters.userInfo)
console.log('userInfo.value', userInfo.value)
// 品牌信息
const brandInfo = ref({})
const loading = ref(true)
function getBrandInfo() {
  loading.value = true
  selectBrand({ brandId })
    .then(res => {
      brandInfo.value = res.data
    })
    .finally(() => {
      loading.value = false
    })
}

// 套餐使用情况
const productUseInfo = ref({})
function _getProductUseInfo() {
  getProductUseInfo().then(res => {
    productUseInfo.value = res.data
  })
}

onMounted(() => {
  getBrandInfo()
  _getProductUseInfo()
})

// 根据菜单充值中心来判断是否显示跳转入口
const showRecharge = computed(() => {
  const systemModule = sessionStorage.getItem('systemModule')
  return systemModule.includes('system:voucher_center')
})

// 根据菜单套餐使用记录来判断是否显示跳转入口
const showRecord = computed(() => {
  const systemModule = sessionStorage.getItem('systemModule')
  return systemModule.includes('system:package_usage_record')
})

// 上传封面成功
function uploadImgSuccess(e) {
  updateLogo(e)
}
const delImg = throttle(() => {
  updateLogo('')
}, 500)
function updateLogo(e) {
  updateBrandConfig({
    brandLogo: e
  })
    .then(res => {
      if (res.code === 0) {
        brandInfo.value.brandLogo = e
        store.commit('user/setBrandLogo', e || '')
        if (e) {
          localStorage.setItem('brandLogo', e)
        } else {
          localStorage.removeItem('brandLogo')
        }
      }
    })
    .catch(() => {})
}
</script>

<style lang="scss" scoped>
.brand_info {
  .block {
    background-color: #fff;
    border-radius: 4px;
    margin-bottom: 10px;
    padding: 24px;
    .block_header {
      display: flex;
      align-items: center;
      .title {
        line-height: 24px;
        font-weight: bold;
        font-size: 16px;
      }
    }
  }
  .base_info {
    padding-bottom: 12px;
    .info_group {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
      margin-top: 12px;
      .info_item {
        display: flex;
        align-items: center;
        min-height: 46px;
        line-height: 20px;
        font-size: 15px;
        .label {
          flex-shrink: 0;
          font-size: 14px;
          color: #323233;
        }
        .value {
          flex: 1;
          font-size: 14px;
          color: #909399;
        }
      }

      .group_left {
        width: 25%;
        @media screen and (max-width: 1500px) {
          width: 50%;
        }
      }
      .group_right {
        .info_item {
          justify-content: flex-start;
          align-items: flex-start;
          .label {
            line-height: 46px;
          }
        }
      }
    }
  }
  .quota {
    .quota_group {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
      flex-wrap: wrap;
      margin-top: 20px;
      .quota_item {
        width: 25%;
        line-height: 36px;
        font-size: 14px;
        @media screen and (max-width: 1500px) {
          width: 50%;
        }
        .quota_item_header {
          display: flex;
          .text {
            margin-right: 24px;
          }
          .progress_text {
            flex-shrink: 0;
            margin-right: 12px;
            color: #909399;
            span {
              color: #303133;
            }
          }
          .more {
            cursor: pointer;
            color: #364fcd;
          }
        }
        .progress_content {
          margin-top: 20px;
        }
      }
    }
  }
  .has_cover {
    width: 80px;
    height: 80px;
    position: relative;
    .del_icon {
      width: 20px;
      height: 20px;
      object-fit: contain;
      cursor: pointer;
      position: absolute;
      right: 8px;
      top: 8px;
    }
  }
  .upload_box {
    width: 78px;
    height: 78px;
    background: #ffffff;
    border-radius: 2px;
    border: 1px dashed #dcdee0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    font-weight: 400;
    color: #333333;
    line-height: 20px;
    .upload_icon {
      font-size: 20px;
      margin-bottom: 4px;
      color: #909399;
    }
  }
  .dis_upload {
    cursor: not-allowed;
  }
  .upload_tip {
    font-size: 14px;
    font-weight: 400;
    color: #909399;
    line-height: 46px;
  }
}
</style>
