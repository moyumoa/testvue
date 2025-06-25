<template>
  <div class="home_wrapper">
    <div class="head_wrap">
      <h4 class="name">{{ userPhone }}</h4>
      <img class="logo" src="@/assets/imgs/video-icon.png" alt="" />
    </div>
    <!-- 主体区域 -->
    <div class="matter-container">
      <!-- 选择 -->
      <div class="matter-select">
        <div class="matter-select-top">
          <div class="matter-select-btn">
            <el-button class="matter-btn-item" type="primary"
              >选择素材</el-button
            >
            <el-button class="matter-btn-item" type="primary"
              >选择文件夹</el-button
            >
          </div>
          <div class="matter-select-right">
            <span>上传到</span>
            <div>
              <ElementTreeSelect
                v-model="treeSelectedId"
                :options="treeOptions"
                placeholder="请选择节点"
                @change="onTreeChange"
              />
            </div>
            <!-- <div>
              <el-switch v-model="tagSwitch"> </el-switch>
              <span>智能打标</span>
            </div> -->
          </div>
        </div>
        <div class="matter-select-btm">
          支持批量添加，图片支持：jpg/jpeg/png/gif，视频支持：mp4/mov，音频支持：mp3。
        </div>
      </div>
      <!-- 列表有数据 -->
      <div class="matter-list" v-if="list.length > 0">
        <!-- 上传列表 -->
        <div class="matter-table">
          <!-- 进度条 -->
          <div class="progress">
            <span>上传中</span>
            <el-progress
              :text-inside="true"
              :stroke-width="15"
              :percentage="percentage"
            ></el-progress>

            <div class="progress-switch">
              <span class="progress-switch-item">暂停</span>
              <span class="progress-switch-item" style="color: #0052d9"
                >继续</span
              >
              <span class="progress-switch-item" @click="stopUpload">终止</span>
            </div>
          </div>
          <!-- 列表 -->
          <div class="matter-table-list">
            <el-table :data="pagedList" style="width: 100%">
              <el-table-column prop="name" label="名称" />
              <el-table-column prop="catalogue" label="文件目录" />
              <el-table-column prop="type" label="类型" />
              <el-table-column prop="size" label="文件大小" />
              <el-table-column prop="status" label="状态" />
              <el-table-column label="操作">
                <template>
                  <div style="color: #0052d9">移除</div>
                </template>
              </el-table-column>
            </el-table>
            <el-pagination
              style="margin-top: 16px; text-align: right"
              background
              layout="prev, pager, next"
              :page-size="pageSize"
              :current-page.sync="currentPage"
              :total="list.length"
            />
          </div>
        </div>
        <!-- 按钮 -->
        <div class="matter-btn">
          <el-button class="matter-btn-item" @click="goback">返回</el-button>
          <el-button class="matter-btn-item" type="primary">上传</el-button>
        </div>
      </div>
      <!-- 无上传数据 -->
      <div class="matter-empty" v-else>
        <img src="@/assets/imgs/upload-success.png" alt="" />
        <p>上传成功</p>
      </div>
    </div>
  </div>
</template>
<script>
import electronStore from "electron-store";
import ElementTreeSelect from "@/components/ElementTreeSelect.vue";

const _store = new electronStore();
const { ipcRenderer } = window.require("electron");

export default {
  components: {
    ElementTreeSelect,
  },
  data() {
    return {
      percentage: 70, //进度条百分比
      tagSwitch: false, //打标开关
      userPhone: _store.get("USERPHONE"),
      treeSelectedId: null,
      treeOptions: [
        {
          id: 1,
          label: "一级 1",
          children: [
            { id: 11, label: "二级 1-1" },
            {
              id: 12,
              label: "二级 1-2",
              children: [{ id: 121, label: "三级 1-2-1" }],
            },
          ],
        },
        {
          id: 2,
          label: "一级 2",
          children: [{ id: 21, label: "二级 2-1" }],
        },
      ],
      // 新增列表和分页数据
      list: [
        { name: "文件1.mp4", size: "10MB", status: "上传中" },
        { name: "文件2.jpg", size: "2MB", status: "已完成" },
        { name: "文件3.png", size: "1.5MB", status: "失败" },
        { name: "文件4.mov", size: "20MB", status: "上传中" },
        { name: "文件5.mp3", size: "3MB", status: "已完成" },
        { name: "文件6.gif", size: "0.8MB", status: "已完成" },
        { name: "文件7.mp4", size: "15MB", status: "上传中" },
        { name: "文件8.jpg", size: "2.2MB", status: "失败" },
        { name: "文件9.png", size: "1.1MB", status: "已完成" },
        { name: "文件10.mov", size: "18MB", status: "上传中" },
        { name: "文件11.mp3", size: "2.5MB", status: "已完成" },
        { name: "文件12.gif", size: "0.9MB", status: "已完成" },
      ],
      pageSize: 5, //条数
      currentPage: 1, //当前页
    };
  },
  computed: {
    pagedList() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.list.slice(start, start + this.pageSize);
    },
  },
  mounted() {
    // 在组件加载完成后发送事件到主进程调整窗口大小
    ipcRenderer.send("resize-window", { width: 1000, height: 600 });
  },
  beforeDestroy() {
    // 组件销毁前恢复窗口大小
    ipcRenderer.send("resize-window", { width: 440, height: 460 });
  },
  methods: {
    // 上传文件夹改变
    onTreeChange(node) {
      this.$message && this.$message.success("选中节点: " + node.label);
    },
    // 终止上传
    stopUpload() {
      this.$confirm(
        "终止上传将清空剩余未上传文件，已上传文件不受影响，是否确认终止上传？",
        "终止上传",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(() => {});
    },
    // 返回
    goback() {
      this.$router.push({ name: "template_select" });
    },
  },
};
</script>
<style lang="less" scoped>
@import "./matter_template.less";
</style>
