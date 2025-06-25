<template>
  <div class="user_detail_wrapper">
    <div class="g_bg">
      <div class="info_title">
        <img src="@/assets/images/user/img1.png" />
        <span>用户详情</span>
      </div>
      <div class="info_wrapper">
        <div class="info_column">
          <div class="info_content">
            <div class="info_label">名称</div>
            <div class="info_value">张书亮</div>
          </div>
          <div class="info_content">
            <div class="info_label">运营权限账号</div>
            <div class="info_value">张书亮</div>
          </div>
        </div>
        <div class="info_column">
          <div class="info_content">
            <div class="info_label">手机号</div>
            <div class="info_value">张书亮</div>
          </div>
          <div class="info_content">
            <div class="info_label">是否登录后台</div>
            <div class="info_value">张书亮</div>
          </div>
        </div>
        <div class="info_column">
          <div class="info_content">
            <div class="info_label">角色</div>
            <div class="info_value">张书亮</div>
          </div>
          <div class="info_content">
            <div class="info_label">状态</div>
            <div class="info_value">张书亮</div>
          </div>
        </div>
        <div class="info_column">
          <div class="info_content">
            <div class="info_label">员工</div>
            <div class="info_value">张书亮</div>
          </div>
        </div>
        <div class="info_column">
          <div class="info_content">
            <div class="info_label">创建时间</div>
            <div class="info_value">张书亮</div>
          </div>
        </div>
      </div>
    </div>
    <div class="data_wrapper">
      <div class="g_bg data_left">
        <div class="info_title">
          <img src="@/assets/images/user/img2.png" />
          <span>直播数据</span>
        </div>
        <div class="info_list">
          <div class="list_item">
            <p class="num">242</p>
            <p class="label">直播场次</p>
          </div>
          <div class="list_item">
            <p class="num">242</p>
            <p class="label">直播场观</p>
          </div>
        </div>
      </div>
      <div class="g_bg data_right">
        <div class="info_title">
          <img src="@/assets/images/user/img3.png" />
          <span>视频数据</span>
        </div>
        <div class="info_list">
          <div class="list_item">
            <p class="num">242</p>
            <p class="label">视频播放</p>
          </div>
          <div class="list_item">
            <p class="num">242</p>
            <p class="label">视频评论</p>
          </div>
          <div class="list_item">
            <p class="num">242</p>
            <p class="label">视频分析</p>
          </div>
          <div class="list_item">
            <p class="num">242</p>
            <p class="label">视频点赞</p>
          </div>
        </div>
      </div>
    </div>
    <div class="page_main g_bg mt_16">
      <p class="table_title">运营账号</p>
      <xm_table
        class="pic_table"
        v-loading="loading"
        :data="listData"
        v-model:page="page"
        @getTableData="getList"
      >
        <el-table-column label="账号信息" width="170px">
          <template #default="{ row }">
            <div class="table_photo">
              <img :src="row.photo" />
              <div>
                <p>{{ row.name }}</p>
                <p>抖音号</p>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="手机号" prop="phone" />
        <el-table-column label="操作" width="100" align="left" header-align="right" fixed="right">
          <template #default="{ row }">
            <router-link to="/system_manage/user_detail">
              <el-link type="primary">{{ row && '详情' }}</el-link>
            </router-link>
          </template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>

<script setup>
const tableInfo = reactive({
  loading: false,
  listData: [
    {
      num: 1234,
      remark: '备注',
      photo: 'https://p3.douyinpic.com/aweme/100x100/241ce0003adea87b15704.jpeg?from=4010531038',
      name: '郭东生'
    }
  ],
  page: {
    index: 1,
    size: 10,
    total: 10
  }
})
const { loading, listData, page } = toRefs(tableInfo)
</script>

<style lang="scss" scoped>
.user_detail_wrapper {
  .info_title {
    display: flex;
    align-items: center;
    img {
      width: 24px;
      height: 24px;
      margin-right: 8px;
    }
    span {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }
  .info_wrapper {
    margin-top: 14px;
    display: flex;
    .info_column {
      width: 180px;
      .info_content {
        &:first-child {
          margin-bottom: 24px;
        }
        .info_label {
          color: #909399;
          margin-bottom: 4px;
        }
        .info_value {
          font-size: 16px;
          color: #303133;
        }
      }
    }
  }
  .data_wrapper {
    margin-top: 16px;
    .data_left {
      width: 344px;
      margin-right: 16px;
      display: inline-block;
    }
    .data_right {
      display: inline-block;
      width: 630px;
    }

    .info_list {
      padding: 21px 68px 8px 68px;
      display: flex;
      justify-content: space-between;
      .list_item {
        text-align: center;
        .num {
          font-size: 20px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 4px;
        }
        .label {
          color: #909399;
        }
      }
    }
  }
  .table_title {
    font-size: 18px;
    font-weight: 500;
    color: #333333;
    line-height: 25px;
    margin-bottom: 22px;
  }
}
</style>
