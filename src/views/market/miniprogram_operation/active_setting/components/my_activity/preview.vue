<template>
  <div>
    <img
      style="width: 100%"
      class="img1"
      src="https://tagvv-1256030678.file.myqcloud.com/202501065u0ib.png"
      alt=""
    />
    <div class="page_mask">
      <div class="mask_refer">仅供参考</div>
    </div>
  </div>
</template>
<script setup></script>
<style lang="scss" scoped>
@import '../../../components/css/preview_page.scss';
.none_box {
  width: 100%;
  height: calc(100vh - 292px);
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .none_img {
    width: 100px;
    height: 100px;
    object-fit: contain;
    display: flex;
    margin-bottom: 24px;
  }
  .none_text {
    font-size: 14px;
    font-weight: 400;
    color: #8f959e;
    line-height: 20px;
    span {
      color: rgba(31, 35, 41, 1);
      font-weight: 600;
    }
  }
}
</style>
