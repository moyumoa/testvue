<template>
  <div class="page_main">
    <el-form label-width="120px" v-loading="$data.loading">
      <el-form-item label="充值项目" class="one_form">
        <div class="recharge_items">
          <div
            class="recharge_item"
            :class="{ active: $data.currentRecharge.type === item.type, isPackage: item.packages }"
            v-for="(item, index) in $data.rechargeItems"
            :key="index"
            @click="onSelectRecharge(item)"
          >
            <div class="text" v-if="item.packages || item.type.indexOf('xuser') == -1">
              {{ item.name }}
              <!-- 星力值管理 -->
              <div class="comput_box" v-if="item.goodsId == 'sumvideo'" @click.stop="showDialog">
                <img src="https://tagvv-1256030678.file.myqcloud.com/20250107sdtua.png" alt="" />
                管理
              </div>
            </div>
            <el-tooltip v-else placement="top">
              <template #content>
                <div>
                  在星麦云系统中不同类型的矩阵号能力和服务成本均有差异，因此收费标准有所不同。其中：
                  <br />
                  I类矩阵号包含：抖音认证企业号
                  <br />
                  II类矩阵号包含：抖音员工号-认证企业号
                  <br />
                  III类矩阵号包含：抖音普通企业号、抖音个人号、小红书账号、视频号、快手账号
                </div>
              </template>
              <div class="text">
                {{ item.name }}
                <img
                  style="width: 14px; height: 14px; background-size: cover; margin-left: 4px"
                  src="https://tagvv-1256030678.file.myqcloud.com/20230830iva2v.png"
                  alt=""
                />
              </div>
            </el-tooltip>

            <div class="balance" v-if="!item.packages">剩余：{{ item.balance }}{{ item.unit }}</div>
            <!-- 促销活动图片 -->
            <img
              v-if="item.activity && item.activity.id"
              src="https://tagvv-1256030678.file.myqcloud.com/20230316x1ill.png"
              alt
              class="activity_img"
            />
            <!-- 特惠活动图片 -->
            <img
              v-if="item.packages"
              src="https://tagvv-1256030678.file.myqcloud.com/20240507jojdo.png"
              alt=""
              class="activity_img"
            />
          </div>
        </div>
      </el-form-item>
      <el-form-item label="充值数量">
        <div>
          <el-input style="width: 200px" v-model="$data.itemNumber" @input="checkInt"></el-input>
          <span style="margin-left: 4px">{{ $data.currentRecharge.unit }}</span>
          <!-- 非套餐包类型的商品才显示单价 -->
          <template v-if="!$data.currentRecharge.packages">
            <div
              class="price"
              v-if="!($data.currentRecharge.activity && $data.currentRecharge.activity.id)"
            >
              单价：{{ $data.currentRecharge.unitPrice }}
            </div>
            <div class="price price_activity_box" v-else>
              <div>
                单价：
                <span
                  :class="{
                    price_activity: true
                  }"
                >
                  {{ $data.currentRecharge.activity._config.unitPrice }}
                </span>
                <!-- <span
                :class="{
                  unit_activity: true
                }"
              >
                价格单位
              </span> -->
              </div>
              <span class="lineation">{{ $data.currentRecharge.unitPrice }}</span>
              <div class="countDown_box">
                <span class="countDown_text">倒计时</span>
                <countDown
                  v-if="$data.currentRecharge.activity.timeDiffer"
                  :totalSeconds="$data.currentRecharge.activity.timeDiffer"
                  :countDownClass="['count_down_box']"
                  @countDownEnd="countDownEnd"
                />
              </div>
            </div>
          </template>
        </div>
      </el-form-item>
      <el-form-item label="付款方式">
        <div
          class="pay_type"
          v-for="(item, index) in $data.payTypes"
          :key="index"
          :class="{ active: $data.currentPayType.type === item.type }"
          @click="onSelectPayType(item)"
        >
          <img :src="item.img" />
        </div>
      </el-form-item>
      <el-form-item>
        <div class="form_footer">
          <async_button type="primary" :asyncFunc="onSubmit">确认支付</async_button>
          <div class="payment_amount">
            金额:
            <span style="color: #f56c6c; font-weight: bold">{{ payAmount / 100 }}元</span>
          </div>
        </div>
      </el-form-item>
    </el-form>

    <!-- 微信支付 -->
    <el-dialog v-model="$data.wxPayDialog" width="480px">
      <div class="wx_pay_dialog" v-if="$data.wxPayStatus == 1">
        <div class="title">微信支付</div>
        <qrcode-vue :value="$data.wxPayQrcode" :size="200" level="H" />
        <div class="tips">请使用微信扫码支付</div>
      </div>
      <div class="wx_pay_dialog" v-else-if="$data.wxPayStatus == 2">
        <img src="https://tagvv-1256030678.file.myqcloud.com/20220427sg1i2.png" />
        <div class="pay_text">支付成功</div>
      </div>
      <div class="wx_pay_dialog" v-else-if="$data.wxPayStatus == 3">
        <img src="https://tagvv-1256030678.file.myqcloud.com/202204272exjd.png" />
        <div class="pay_text">支付失败</div>
      </div>
    </el-dialog>
    <!-- 星力值管理 -->
    <computDOM v-if="computDialog.show" :computDialog="computDialog"></computDOM>
  </div>
</template>

<script setup>
import computDOM from './components/comput_dialog.vue'
import { sendHrefMessage } from '@/utils/OEA.js'
import qrcodeVue from 'qrcode.vue'
import {
  getProductUseInfo,
  getProductGoodsPrice,
  createOrder,
  getOrderStatus
} from '@/api/system_setting/brand_info'
import request from '@/utils/request'
import countDown from './countDown.vue'
import { getQueryVariable, throttle } from '@/utils/tools'

const message = inject('$message')
const emits = defineEmits(['changeTab'])
// 订单状态轮询
const orderInterval = ref(null)
const $data = reactive({
  loading: true,
  itemNumber: '', // 充值数量
  wxPayQrcode: '', // 微信支付码
  currentRecharge: {}, // 当前选择
  currentPayType: {},
  rechargeItems: [],
  payTypes: [
    {
      type: 1,
      img: 'https://tagvv-1256030678.file.myqcloud.com/20220426gaze8.png'
    },
    {
      type: 2,
      img: 'https://tagvv-1256030678.file.myqcloud.com/20220426ur94b.png'
    }
  ],
  wxPayDialog: false,
  // 订单状态 1 待支付 2支付成功 3支付失败
  wxPayStatus: 1
})
// 计算倒计时时间间隔，单位 秒
function getTimeDiffer(targetTime) {
  if (!targetTime) return 0
  const targetTimeTimestamp = new Date(targetTime).getTime() / 1000
  const nowTimeTimestamp = parseInt(new Date().getTime() / 1000)
  let differTimestamp = targetTimeTimestamp - nowTimeTimestamp
  if (isNaN(differTimestamp)) {
    differTimestamp = 0
  }
  return differTimestamp
}

// 选择项目
function onSelectRecharge(item) {
  $data.itemNumber = ''
  $data.currentRecharge = item
}

// 选择支付方式
function onSelectPayType(item) {
  $data.currentPayType = item
}

// 套餐使用情况
function _getProductUseInfo(tab = null) {
  getProductUseInfo()
    .then(res => {
      $data.rechargeItems.forEach(item => {
        if (item.type === 'xuser') {
          item.balance = res.data.accountRemainNum || 0
        }
        if (item.type === 'xuser_e') {
          item.balance = res.data.accountERemainNum || 0
        }
        if (item.type === 'xuser_employee') {
          item.balance = res.data.accountEmployeeRemainNum || 0
        }
        if (item.type === 'liverecord') {
          item.balance = res.data.liveRecordRemainMinutes || 0
        }
        if (item.type === 'sumvideo') {
          item.balance = res.data.videoNumber || 0
        }
        if (item.type === 'ai_creation_ticket') {
          item.balance = res.data.aiCreationTicketRemainNum || 0
        }
        if (item.type === 'mini_client') {
          item.balance = res.data.miniClientRealRemainNum || 0
        }
      })
      let showItem = null
      if (tab) {
        showItem = $data.rechargeItems.find(s => {
          return s.type === tab
        })
      } else {
        showItem = $data.rechargeItems[0]
      }
      onSelectRecharge(showItem)
    })
    .finally(() => {
      $data.loading = false
    })
}

// 处理活动 进行中的活动 并且 itemGoodsId: 筛选当前活动的config（企业号、个人号活动会在一个config里返回）
function getActivity(activity, itemGoodsId) {
  if (!activity) return {}
  let obj = {
    ...activity,
    timeDiffer: getTimeDiffer(activity.endTime),
    // 过滤config只保留与当前goodsId对应的config (进行中)
    _config:
      activity.config.filter(x => {
        return x.goodsId === itemGoodsId && activity.status === 2
      })[0] || {}
  }
  if (obj._config.goodsId) {
    const _price = obj._config.price / 100
    obj._config = {
      ...obj._config,
      unitPrice:
        itemGoodsId === 'xuser'
          ? `${_price}元/个`
          : itemGoodsId === 'xuser_e' ||
            itemGoodsId === 'xuser_employee' ||
            itemGoodsId === 'mini_client'
          ? `${_price}元/个`
          : itemGoodsId === 'liverecord'
          ? `${_price}元/分钟`
          : `${_price}元/张`,
      unit:
        itemGoodsId === 'xuser' ||
        itemGoodsId === 'xuser_e' ||
        itemGoodsId === 'xuser_employee' ||
        itemGoodsId === 'mini_client'
          ? '个'
          : itemGoodsId === 'liverecord'
          ? '分钟'
          : '张'
    }
  } else {
    obj = {}
  }
  return obj
}
// 增加index 属性用于排序
function addIndex(goodsId) {
  const obj = {
    liverecord: 2,
    sumvideo: 3,
    ai_creation_ticket: 4,
    xuser_e: 5,
    xuser: 7,
    xuser_employee: 6,
    mini_client: 1
  }
  return obj[goodsId] || 0
}

// 套餐价格
function _getProductGoodsPrice(tab) {
  $data.loading = true
  getProductGoodsPrice({source: 1})
    .then(res => {
      // 未排序
      const midItemRechargeItems = res.data.goodsList.map(item => {
        let midItem = JSON.parse(JSON.stringify(item))
        const _price = midItem.price / 100
        midItem = {
          ...midItem,
          index: addIndex(midItem.goodsId),
          type: midItem.goodsId,
          name: midItem.goodsName,
          price: midItem.price,
          activity: getActivity(midItem.activity, midItem.goodsId),
          unitPrice: midItem.packages
            ? `${_price}元/份`
            : midItem.goodsId === 'xuser'
            ? `${_price}元/个`
            : midItem.goodsId === 'xuser_e' ||
              midItem.goodsId === 'xuser_employee' ||
              midItem.goodsId === 'mini_client'
            ? `${_price}元/个`
            : midItem.goodsId === 'liverecord'
            ? `${_price}元/分钟`
            : midItem.goodsId === 'sumvideo'
            ? `${_price}元/星力值`
            : midItem.goodsId === 'sumvideo_personal'
            ? `${_price}元/星力值`
            : `${_price}元/张`,
          unit: midItem.packages
            ? '份'
            : midItem.goodsId === 'xuser' ||
              midItem.goodsId === 'xuser_e' ||
              midItem.goodsId === 'xuser_employee' ||
              midItem.goodsId === 'mini_client'
            ? '个'
            : midItem.goodsId === 'liverecord'
            ? '分钟'
            : midItem.goodsId === 'sumvideo'
            ? '星力值'
            : midItem.goodsId === 'sumvideo_personal'
            ? '星力值'
            : '张'
        }
        return midItem
      })
      // $data.rechargeItems = res.data.goodsList.map(e => {
      //   const obj = {
      //     type: e.goodsId, // 项目类型
      //     name: e.goodsName, // 项目名称
      //     price: e.price, // 项目单价 单位分
      //     activity: e.activity || {} // 活动
      //   }
      //   const _price = e.price / 100
      //   // 项目单价 字符串 区分活动非活动
      //   obj.unitPrice =
      //     e.goodsId === 'xuser'
      //       ? `${_price}元/个`
      //       : e.goodsId === 'xuser_e'
      //       ? `${_price}元/个`
      //       : e.goodsId === 'liverecord'
      //       ? `${_price}元/分钟`
      //       : `${_price}元/条`
      //   obj.unit =
      //     e.goodsId === 'xuser' || e.goodsId === 'xuser_e'
      //       ? '个'
      //       : e.goodsId === 'liverecord'
      //       ? '分钟'
      //       : '条'
      //   // if (e.activity.id) {
      //   //   obj.activity.config = e.activity.config.filter(x => {
      //   //     return x.goodsId === e.goodsId
      //   //   })
      //   // }
      //   // 活动价格的充值配置 单价、划线价格（obj.price 、倒计时结束时间差 单位秒
      //   console.log('活动配置', obj.activityDispose)
      //   return obj
      // })

      // 排序 直播录制分钟 视频智能生产合成券 企业号接入数 个人号接入数
      $data.rechargeItems = midItemRechargeItems.sort((a, b) => {
        return a.index > b.index ? 1 : -1
      })
      // console.log('$data.rechargeItems', $data.rechargeItems)
      _getProductUseInfo(tab)
    })
    .catch(() => {
      $data.loading = false
    })
}

// 计算价格 单位分
const payAmount = computed(() => {
  // 活动价格与普通价格区分
  if ($data.currentRecharge.activity && $data.currentRecharge.activity.id)
    return $data.currentRecharge.activity._config.price * $data.itemNumber
  return $data.currentRecharge.price * $data.itemNumber
})

// 输入框转为正整数
function checkInt(value) {
  const MAX_NUM = 99999999
  const _value = parseInt(value) > MAX_NUM ? MAX_NUM : parseInt(value)
  $data.itemNumber = isNaN(_value) ? '' : _value
}

// 套餐明细
const passbackDesc = computed(() => {
  // 套餐类型的商品描述统一为购买了X份商品名称，其余商品不变
  if ($data.currentRecharge.packages) {
    return `购买了 ${$data.itemNumber} 份${$data.currentRecharge.goodsName || ''}`
  } else if ($data.currentRecharge.type === 'xuser') {
    return `个人号接入数：新增个人号接入数 ${$data.itemNumber} 个`
  } else if ($data.currentRecharge.type === 'xuser_e') {
    return `企业号接入数：新增企业号接入数 ${$data.itemNumber} 个`
  } else if ($data.currentRecharge.type === 'liverecord') {
    return `直播录屏分钟数：充值直播录屏分钟数 ${$data.itemNumber} 分钟`
  } else if ($data.currentRecharge.type === 'sumvideo') {
    return `视频智能生产合成星力值：视频智能生产合成星力值 ${$data.itemNumber} 星力值`
  } else if ($data.currentRecharge.type === 'ai_creation_ticket') {
    return `AI文案创作券：AI文案创作券张数${$data.itemNumber}张`
  } else if ($data.currentRecharge.type === 'mini_client') {
    return `员工AI终端账号：新增AI终端账号接入数${$data.itemNumber} 个`
  }
})

// 支付宝支付
function aliPay(orderInfo) {
  const passbackParams = {
    orderNo: orderInfo.orderId,
    omgOrderNo: orderInfo.orderId,
    serverNo: 4
  }
  const afterParams = encodeURIComponent(JSON.stringify(passbackParams))
  const url = `${orderInfo.payUrl}?totalAmount=${orderInfo.yuan}&subject=${$data.currentRecharge.name} *${$data.itemNumber}&passbackParams=${afterParams}`
  console.log('url', url)
  // document.location.href = url
  sendHrefMessage(url, true)
}

// 微信支付
function wxPay(orderInfo) {
  request
    .get(orderInfo.payUrl, {
      params: {
        total_fee: orderInfo.fen,
        order_no: orderInfo.orderId,
        title: $data.currentRecharge.name + ' *' + $data.itemNumber,
        attach: {
          orderNo: orderInfo.orderId,
          omgOrderNo: orderInfo.orderId,
          serverNo: 4
        }
      }
    })
    .then(res => {
      $data.wxPayQrcode = res.data.data
      $data.wxPayDialog = true
      // 开启订单状态轮询
      orderInterval.value = setInterval(() => {
        getOrderStatus({ orderId: orderInfo.orderId }).then(order => {
          // 订单状态 1 待支付 2支付成功 3支付失败
          if (order.data.status === 2) {
            clearOrderInterval()
            $data.wxPayStatus = order.data.status
            emits('changeTab', 'record')
          }
          if (order.data.status === 3) {
            clearOrderInterval()
            $data.wxPayStatus = order.data.status
          }
        })
      }, 1000)
    })
}

// 清除订单状态轮询
function clearOrderInterval() {
  if (orderInterval.value) {
    clearInterval(orderInterval.value)
  }
  orderInterval.value = null
}

function onSubmit() {
  return new Promise((resolve, reject) => {
    if (!$data.itemNumber) {
      message.warning('请填写充值数量')
      reject(new Error('充值数量为空'))
      return
    }
    clearOrderInterval()
    createOrder({
      goodsId: $data.currentRecharge.type,
      num: $data.itemNumber,
      payAmount: payAmount.value,
      payChannel: $data.currentPayType.type,
      desc: passbackDesc.value
    })
      .then(res => {
        if ($data.currentPayType.type === 1) {
          aliPay(res.data)
        }
        if ($data.currentPayType.type === 2) {
          wxPay(res.data)
        }
        setTimeout(() => {
          resolve()
        }, 2000)
      })
      .catch(err => {
        reject(new Error(err))
      })
  })
}

// 倒计时结束
function countDownEnd() {
  // console.log('倒计时结束')
  // 如果是在支付中，就不要刷新页面
  if (orderInterval.value) {
    return
  }
  _getProductGoodsPrice()
  onSelectPayType($data.payTypes[0])
}

onMounted(() => {
  // 获取是否有指点选中
  const tab = getQueryVariable('tab')
  // 获取路由参数，选择对应充值项
  _getProductGoodsPrice(tab)
  onSelectPayType($data.payTypes[0])
})
onBeforeUnmount(() => {
  clearOrderInterval()
})

// 显示星力值弹窗
const computDialog = reactive({
  show: false
})
const showDialog = throttle(() => {
  computDialog.show = true
}, 500)
</script>

<style lang="scss" scoped>
.page_main {
  padding-top: 40px;
  .recharge_items {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;

    .recharge_item {
      min-height: 72px;
      cursor: pointer;
      display: inline-block;
      text-align: center;
      line-height: 20px;
      padding: 12px 0;
      width: 220px;
      border: 1px solid #dcdfe6;
      margin-right: 30px;
      position: relative;
      margin-bottom: 20px;
      &.active,
      &:hover {
        border-color: #364fcd;
      }
      .text {
        font-weight: 600;
        font-size: 16px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
      }
      .balance {
        margin-top: 6px;
        font-size: 14px;
        color: #909399;
      }
      .activity_img {
        position: absolute;
        top: 0;
        right: 0;
        width: 52px;
        height: 52px;
      }
      .comput_box {
        margin-left: 6px;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        font-weight: 400;
        font-size: 12px;
        color: #364fcd;
        line-height: 18px;
        img {
          margin-right: 2px;
          width: 16px;
          height: 16px;
          display: flex;
        }
      }
    }
    .isPackage {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      padding: 0 28px;
      .text {
        display: inline-block;
      }
      img {
        display: inline-block !important;
      }
    }
  }
  .pay_type {
    cursor: pointer;
    width: 200px;
    height: 80px;
    margin-right: 30px;
    border: 1px solid #dcdfe6;
    &.active,
    &:hover {
      border-color: #364fcd;
    }
    img {
      width: 100%;
      height: 100%;
    }
  }
  .form_footer {
    display: flex;
    margin-top: 12px;
    .payment_amount {
      margin-left: 12px;
      font-size: 18px;
    }
  }
}

.wx_pay_dialog {
  text-align: center;
  padding-bottom: 20px;
  .title {
    color: #515a6e;
    font-weight: bold;
    font-size: 18px;
    margin-bottom: 20px;
  }
  .tips {
    color: #515a6e;
    font-size: 14px;
    margin-top: 15px;
  }
  > img {
    width: 150px;
  }
  .pay_text {
    margin-top: 30px;
    font-size: 18px;
  }
}

:deep .el-dialog__header {
  border: none !important;
}
// 价格
.price_activity_box {
  margin-top: 8px;
}
.price {
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  display: flex;
  align-items: center;
  .price_activity {
    font-weight: 500;
    color: #f35b38;
  }
  .unit_activity {
    color: #909399;
  }
  .lineation {
    text-decoration: line-through;
    color: #909399;
    margin-left: 12px;
    margin-right: 16px;
    font-size: 12px;
  }
  .countDown_box {
    background: rgba(243, 91, 56, 0.1);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 24px;
    .countDown_text {
      display: inline-block;
      width: 58px;
      height: 24px;
      line-height: 24px;
      text-align: center;
      margin-right: 8px;
      background: #f35b38;
      border-radius: 4px 13px 13px 4px;
      font-size: 14px;
      color: #ffffff;
    }
    .count_down_box {
      display: inline-block;
      height: 24px;
      line-height: 24px;
      padding-right: 10px;
      color: #f35b38;
    }
  }
}
.one_form {
  margin-bottom: 0 !important;
}
</style>
