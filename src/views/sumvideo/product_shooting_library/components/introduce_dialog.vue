<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    title=""
    width="820px"
    custom-class="xm_element_dialog xm_element_noHead_dialog"
  >
    <div class="dialog_content">
      <div class="one_content">
        <div class="content_title">
          如果实拍图是
          <span>真人模特</span>
        </div>
        <div class="content_content">
          <div class="content_imgBox">
            <img
              class="one_img"
              src="https://tagvv-1256030678.file.myqcloud.com/202410096cy1u.png"
              alt=""
            />
          </div>
          <div class="content_table">
            <div class="table_th">
              <div class="one_th th_94">操作思路</div>
              <div class="one_th left_border">
                主要解决场景搭建、外出拍摄的成本问题；找一面白墙，弄两个补光灯，拍摄完之后换脸、换背景
              </div>
            </div>
            <div class="table_tbody">
              <div class="table_tr">
                <div class="table_td td_94">实拍图要求</div>
                <div class="table_td left_border">
                  图片清晰：分辨率不低于256×256像素且不超过4096×4096像素
                  <br />
                  图像比例：长宽比大于1:2且小于2:1
                  <br />
                  图像大小：不超过5M
                  <br />
                  图片格式：JPEG、JPG、PNG、WEBP
                  <div class="br_10"></div>
                  画面完整：模特在图中轮廓清晰，人体姿态完整可见，不能有遮挡，人脸占比不低于128×128像素
                  <div class="br_10"></div>
                  光线充足：避免出现光线阴暗不均的情况
                </div>
              </div>
              <div class="table_tr">
                <div class="table_td td_94">优势</div>
                <div class="table_td left_border">真人模特动作灵活、自然，AI出图则不会显得僵硬</div>
              </div>
              <div class="table_tr">
                <div class="table_td td_94">劣势</div>
                <div class="table_td left_border">需要真人出镜，对出镜人物的身材有一定要求</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="one_content">
        <div class="content_title">
          如果实拍图是
          <span>人台假模</span>
        </div>
        <div class="content_content">
          <div class="content_imgBox">
            <img
              class="one_img"
              src="https://tagvv-1256030678.file.myqcloud.com/202410093hyvc.png"
              alt=""
            />
            <img
              style="margin-top: 12px"
              class="one_img"
              src="https://tagvv-1256030678.file.myqcloud.com/20241009m6r8t.png"
              alt=""
            />
          </div>
          <div class="content_table">
            <div class="table_th">
              <div class="one_th th_94">操作思路</div>
              <div class="one_th left_border">
                把衣服套在假模身上拍照，然后转绘成真人，解决没有真人模特以及外出拍摄成本高的问题
              </div>
            </div>
            <div class="table_tbody">
              <div class="table_tr">
                <div class="table_td td_94">实拍图要求</div>
                <div class="table_td left_border">
                  图片清晰：分辨率不低于256×256像素且不超过4096×4096像素
                  <br />
                  图像比例：长宽比大于1:2且小于2:1
                  <br />
                  图像大小：不超过5M
                  <br />
                  图片格式：JPEG、JPG、PNG、WEBP
                  <div class="br_10"></div>
                  画面完整：模特在图中轮廓清晰，人体姿态完整可见，不能有遮挡，人脸占比不低于128×128像素
                  <div class="br_10"></div>
                  光线充足：避免出现光线阴暗不均的情况
                </div>
              </div>
              <div class="table_tr">
                <div class="table_td td_94">优势</div>
                <div class="table_td left_border">无需真人出镜，成本低</div>
              </div>
              <div class="table_tr">
                <div class="table_td td_94">劣势</div>
                <div class="table_td left_border">相较真人出镜，动作稍显僵硬</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="one_content">
        <div class="content_title">
          如果实拍图
          <span>没有模特</span>
        </div>
        <div class="content_content">
          <div class="content_imgBox content_imgBox_flex">
            <img
              class="one_img"
              src="https://tagvv-1256030678.file.myqcloud.com/20241009ev1yp.png"
              alt=""
            />
            <img
              class="one_img"
              src="https://tagvv-1256030678.file.myqcloud.com/202410091d8me.png"
              alt=""
            />
          </div>
          <div class="content_table content_table_404">
            <div class="table_th">
              <div class="one_th th_94">操作思路</div>
              <div class="one_th left_border">更换商品背景，生成多场景下的商品图片</div>
            </div>
            <div class="table_tbody">
              <div class="table_tr">
                <div class="table_td td_94">实拍图要求</div>
                <div class="table_td left_border" style="height: 115px">
                  图片清晰：必须为带透明背景的png, webp格式图片
                  <br />
                  图像大小：长边不超过2048像素
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="br_10"></div>
  </el-dialog>
</template>
<script setup>
const props = defineProps({
  introduceDialog: {
    type: Object,
    default: () => {
      return {
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const { show } = toRefs(props.introduceDialog)
</script>
<style lang="scss" scoped>
.br_10 {
  height: 10px;
}
.dialog_content {
  padding: 0 0 6px 16px;

  width: 100%;
  max-height: 70vh;
  overflow-y: auto;
  .one_content {
    width: 100%;
    .content_title {
      margin-bottom: 12px;
      width: 100%;
      text-align: center;
      font-size: 18px;
      color: #323233;
      line-height: 26px;
      font-style: normal;
      font-weight: 600;
      span {
        color: #364fcd;
      }
    }
    .content_content {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
      .content_imgBox {
        margin-right: 12px;
        flex-shrink: 0;
        img {
          width: 180px;
          display: flex;
        }
      }
      .content_imgBox_flex {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: flex-start;
        .one_img + .one_img {
          margin-left: 12px;
        }
      }
      .content_table {
        width: 598px;
        background: #ffffff;
        outline: 1px solid #dcdee0;
        font-weight: 400;
        font-size: 14px;
        color: #606266;
        line-height: 20px;
      }
      .content_table_404 {
        width: 404px !important;

        .table_th {
          height: 40px !important;
        }
      }
      .th_94,
      .td_94 {
        font-weight: 600;
        color: #323233;
        width: 94px;
        flex-basis: 94px;
        flex-shrink: 0;
      }
      .left_border {
        border-left: 1px solid #dcdee0;
      }
      .one_th,
      .table_td {
        padding: 10px 12px;
      }

      .table_th {
        width: 100%;
        height: 60px;
        background: #f6f8fa;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: flex-start;
      }
      .table_tbody {
        width: 100%;
        .table_tr {
          border-top: 1px solid #dcdee0;
          width: 100%;
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: flex-start;
        }
      }
    }
  }
  .one_content + .one_content {
    margin-top: 24px;
  }
}
</style>
