<template>
  <div :class="['one_preview', 'task_overview_preview']">
    <!-- 标题 -->
    <div class="title_box">
      <img src="https://tagvv-1256030678.file.myqcloud.com/20250610662u6.png" alt="" />
      任务概览
    </div>
    <!-- 数据 -->
    <div class="data_box">
      <div class="data_item">
        <div class="data_value">999w</div>
        <div class="data_title">待参与</div>
      </div>
      <div class="data_item">
        <div class="data_value">999w</div>
        <div class="data_title">参与中</div>
      </div>
      <div class="data_item">
        <div class="data_value">999w</div>
        <div class="data_title">已参与</div>
      </div>
      <div class="data_item">
        <div class="data_value">999w</div>
        <div class="data_title">已完成</div>
      </div>
    </div>
    <!-- 任务列表 -->
    <div class="list_box">
      <template v-for="(item, index) in 3" :key="index">
        <div class="one_list">
          <img
            class="list_icon"
            src="https://tagvv-1256030678.file.myqcloud.com/202211218cq4m.png"
            alt=""
          />
          <div class="list_info">
            <div class="info_title">任务标题仅供参考</div>
            <div class="info_tag">
              <div class="one_tag">发布视频</div>
              <div class="one_tag">一键转发</div>
            </div>
          </div>
          <div class="list_btn">
            <div class="btn1">去完成</div>
            <div class="btn2">2天后结束</div>
          </div>
        </div>
        <div class="one_list_line" v-if="index < 2"></div>
      </template>
    </div>
  </div>
</template>
<script setup></script>
<style lang="scss" scoped>
@import '../../../components/css/preview_page.scss';
.task_overview_preview {
  width: 100%;
  height: 280px;
  background: #ffffff !important;
  border-radius: 12px;
  padding: 16px 12px 0;
  overflow: hidden;
  .title_box {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    font-weight: 600;
    font-size: 18px;
    color: #1f2329;
    line-height: 26px;
    img {
      margin-right: 8px;
      width: 22px;
      height: 22px;
      display: flex;
    }
  }
  .data_box {
    padding: 12px 12px 16px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    .data_item {
      .data_value {
        font-weight: 600;
        font-size: 18px;
        color: #1f2329;
        line-height: 26px;
      }
      .data_title {
        margin-top: 2px;
        font-weight: 400;
        font-size: 12px;
        color: #8f959e;
        line-height: 18px;
      }
    }
  }
  .list_box {
    width: calc(100% + 12px);
    padding-right: 12px;
    max-height: 164px;
    overflow-y: auto;
    padding-bottom: 16px;
    .one_list {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      .list_icon {
        width: 48px;
        height: 48px;
        display: flex;
        border-radius: 8px;
        margin-right: 12px;
        flex-shrink: 0;
      }
      .list_info {
        flex: 1;
        .info_title {
          font-weight: 400;
          font-size: 15px;
          color: #1f2329;
          line-height: 22px;
        }
        .info_tag {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          margin-top: 6px;
          .one_tag {
            margin-right: 8px;
            width: max-content;
            padding: 0 4px;
            height: 16px;
            background: rgba(143, 149, 158, 0.1);
            border-radius: 2px;

            font-weight: 400;
            font-size: 11px;
            color: #8f959e;
            line-height: 16px;
          }
        }
      }
      .list_btn {
        width: 62px;
        flex-shrink: 0;
        margin-left: 12px;
        .btn1 {
          width: 100%;
          height: 28px;
          background: #fe603f;
          border-radius: 14px;
          font-weight: 400;
          font-size: 13px;
          color: #ffffff;
          line-height: 28px;
          text-align: center;
        }
        .btn2 {
          width: 100%;
          font-size: 10px;
          color: #bbbfc3;
          line-height: 14px;
          text-align: center;
          margin-top: 6px;
        }
      }
    }
    .one_list_line {
      margin-top: 12px;
      margin-bottom: 12px;
      margin-left: 78px;
      width: calc(100% - 78px);
      height: 1px;
      border: 1px dashed rgba(31, 35, 41, 0.1);
    }
  }
}
</style>
