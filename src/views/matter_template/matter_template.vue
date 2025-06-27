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
            <input
              ref="fileInput"
              type="file"
              :accept="matterAccept"
              multiple
              style="display: none"
              @change="handleFileInputChange"
            />
            <el-button
              class="matter-btn-item"
              type="primary"
              style="margin-right: 60px"
              @click="triggerFileInput"
              :disabled="uploadBtnLoading"
              >选择素材</el-button
            >
            <input
              ref="folderInput"
              type="file"
              webkitdirectory
              multiple
              style="display: none"
              @change="handleFolderChange"
            />
            <el-button
              class="matter-btn-item"
              type="primary"
              @click="triggerFolderInput"
              :loading="folderLoading"
              :disabled="folderLoading || uploadBtnLoading"
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
                :disabled="uploadBtnLoading"
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
          <div class="progress" v-if="showProgress">
            <!-- <span>上传中</span> -->
            <el-progress
              :text-inside="true"
              :stroke-width="15"
              :percentage="percentage"
            ></el-progress>

            <div class="progress-switch">
              <span
                class="progress-switch-item"
                @click="pauseUpload"
                v-if="!isPaused"
                >暂停</span
              >
              <span
                class="progress-switch-item"
                style="color: #0052d9"
                @click="continueUpload"
                v-if="isPaused"
                >继续</span
              >
              <span class="progress-switch-item" @click="stopUpload">终止</span>
            </div>
          </div>
          <!-- 列表 -->
          <div class="matter-table-list">
            <el-table :data="pagedList" style="width: 100%" height="280">
              <el-table-column prop="name" label="名称" />
              <el-table-column prop="catalogue" label="文件目录" />
              <el-table-column prop="type" label="类型" />
              <el-table-column prop="size" label="文件大小" />
              <el-table-column prop="status" label="状态">
                <template slot-scope="{ row }">
                  <div>{{ statusMap[row.status] }}</div>
                </template>
              </el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <div
                    :style="{
                      color: uploadBtnLoading ? '#ccc' : '#bd3124',
                      cursor: uploadBtnLoading ? 'not-allowed' : 'pointer',
                    }"
                    @click="
                      !uploadBtnLoading && delItem(scope.row, scope.$index)
                    "
                  >
                    移除
                  </div>
                </template>
              </el-table-column>
            </el-table>
            <el-pagination
              style="margin-top: 16px; text-align: right"
              background
              layout="total , prev, pager, next"
              :page-size="pageSize"
              :current-page.sync="currentPage"
              :total="list.length"
            />
          </div>
        </div>
      </div>
      <!-- 全部上传成功时显示 -->
      <div class="matter-empty" v-if="uploadAllSuccess">
        <img src="@/assets/imgs/upload-success.png" alt="" />
        <p>上传成功</p>
      </div>
      <!-- 按钮 -->
      <div class="matter-btn">
        <el-button class="matter-btn-item" @click="goback">返回</el-button>
        <el-button
          class="matter-btn-item"
          type="primary"
          @click="uploadList"
          :disabled="
            pagedList.length === 0 ||
            uploadBtnLoading ||
            isPaused ||
            showProgress
          "
          :loading="uploadBtnLoading"
          >上传</el-button
        >
      </div>
    </div>
  </div>
</template>
<script>
import electronStore from "electron-store";
import ElementTreeSelect from "@/components/ElementTreeSelect.vue";
import api from "../../api";

const _store = new electronStore();
const { ipcRenderer } = window.require("electron");

export default {
  components: {
    ElementTreeSelect,
  },
  data() {
    return {
      statusTime: null,
      statusMap: {
        null: "待上传",
        0: "上传中",
        1: "上传失败",
        2: "上传成功",
        3: "需要打标而未打标",
        4: "打标失败",
        5: "打标完成",
      }, //上传状态
      tagId: "0", // 素材分类id
      taskId: undefined, //父任务id
      matterAccept: ".jpg,.jpeg,.png,.gif,.mp4,.mov,.mp3", // 素材选择类型，图片支持：jpg/jpeg/png/gif，视频支持：mp4/mov，音频支持：mp3
      percentage: 0, //进度条百分比
      tagSwitch: false, //打标开关
      userPhone: _store.get("USERPHONE"),
      brandId: _store.get("USERBRANDID"),
      userId: _store.get("USERID"),
      treeSelectedId: "0", // 默认选中根节点
      treeOptions: [
        {
          id: "0",
          label: "素材库",
          children: [],
        },
      ],
      // 新增列表和分页数据
      list: [],
      pageSize: 5, //条数
      currentPage: 1, //当前页
      folderLoading: false,
      uploadBtnLoading: false, // 上传按钮 loading
      isPaused: false, // 是否暂停
      finished: 0, // 已处理文件数
      uploadAllSuccess: false, // 是否全部上传成功
    };
  },
  computed: {
    pagedList() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.list.slice(start, start + this.pageSize);
    },
    showProgress() {
      return this.list.some((item) => item.status === 0);
    },
  },
  mounted() {
    // 在组件加载完成后发送事件到主进程调整窗口大小
    ipcRenderer.send("resize-window", { width: 1000, height: 600 });
    this.loadRootTree();
  },
  beforeDestroy() {
    // 组件销毁前恢复窗口大小
    ipcRenderer.send("resize-window", { width: 440, height: 460 });
  },
  methods: {
    // 加载第一级"素材库"下的子节点
    loadRootTree() {
      this.loadTreeChildren("0", this.treeOptions[0]);
    },
    // 递归加载树节点
    async loadTreeChildren(id, parentNode) {
      try {
        const res = await api.listTagFolder({ id });
        if (res && res.code === 0 && Array.isArray(res.data)) {
          parentNode.children = [];
          for (const item of res.data) {
            const node = {
              id: item.id,
              label: item.name,
              hasChildren: item.hasChildren,
              children: [],
            };
            parentNode.children.push(node);
            if (item.hasChildren) {
              await this.loadTreeChildren(item.id, node);
            }
          }
        }
      } catch (e) {
        console.error("加载树节点失败", e);
      }
    },
    // 选择素材或文件夹
    triggerFileInput() {
      this.$refs.fileInput && this.$refs.fileInput.click();
    },
    handleFileInputChange(e) {
      const files = Array.from(e.target.files);
      files.forEach((file) => {
        if (!this.list.some((item) => item.file === file)) {
          const fileInfo = {
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2) + "MB",
            type: file.type,
            status: null,
            catalogue: file.path || "",
            file: file,
            ossUrl: undefined,
          };
          this.list.push(fileInfo);
        }
      });
      e.target.value = "";
    },
    // 上传文件夹改变
    onTreeChange(node) {
      this.tagId = node.id;
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
      ).then(() => {
        this.isPaused = false;
        this.uploadBtnLoading = false;
        this.percentage = 0;
        this.list = this.list.filter(
          (item) => item.ossUrl || [1, 2, 5].includes(item.status)
        );
      });
    },
    pauseUpload() {
      this.isPaused = true;
    },
    continueUpload() {
      if (this.isPaused) {
        this.isPaused = false;
        this.uploadList();
      }
    },
    // 移除项
    delItem(row, index) {
      this.$confirm(`确认移除${row.name}这一项？`, "移除", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.list.splice((this.currentPage - 1) * this.pageSize + index, 1);
      });
    },
    // 返回
    goback() {
      this.$router.push({ name: "template_select" });
    },
    // 上传按钮
    async uploadList() {
      this.uploadBtnLoading = true;
      const batchSize = 5;
      const total = this.list.length;
      let start = 0;
      if (!this.isPaused) {
        this.finished = 0;
        this.percentage = 0;
      }
      // 统计已完成数（ossUrl存在或status==1为失败）
      this.finished = this.list.filter(
        (item) => item.ossUrl || item.status === 1
      ).length;
      // 先将所有待上传文件状态设为"上传中"
      this.list.forEach((item) => {
        item.status = 0;
      });
      // 初始化上传任务
      const configJson = JSON.stringify({ tagId: this.tagId });
      try {
        const initRes = await api.initUploadTask({
          brandId: this.brandId,
          configJson: configJson,
          userId: this.userId,
        });
        if (initRes.code === 0) {
          this.taskId = initRes.data;
          while (start < total) {
            if (this.isPaused) {
              this.uploadBtnLoading = false;
              return;
            }
            const batch = this.list.slice(start, start + batchSize);
            // 1. 上传本批次到OSS
            for (const fileInfo of batch) {
              if (this.isPaused) {
                this.uploadBtnLoading = false;
                return;
              }
              if (!fileInfo.ossUrl) {
                // 只上传未上传过的
                try {
                  const { uploadToOss } = await import("@/libs/ossUploadUtil");
                  const result = await uploadToOss(fileInfo.file);
                  fileInfo.ossUrl = result.url;
                } catch (e) {
                  fileInfo.status = 1; // 上传失败
                }
              }
              this.finished++;
              this.percentage = Math.round((this.finished / total) * 100);
            }
            // 2. 组装subtasks并调用后端
            const subtasks = batch
              .filter((item) => item.ossUrl)
              .map((item) => {
                let typeNum = 0;
                if (item.type) {
                  if (item.type.startsWith("video/")) typeNum = 1;
                  else if (item.type.startsWith("image/")) typeNum = 2;
                  else if (item.type.startsWith("audio/")) typeNum = 3;
                }
                return {
                  mediaName: item.name,
                  url: item.ossUrl,
                  type: typeNum,
                };
              });
            let urls = [];
            if (subtasks.length > 0) {
              await api.addAssociatedSubTask({
                taskId: this.taskId,
                subtasks,
              });
              // 新增：本批次上传后立即查状态
              urls = batch.map((item) => item.ossUrl).filter(Boolean);
              if (urls.length > 0) {
                this.getStatus(urls);
              }
            }
            start += batchSize;
           this.statusTime =  setInterval(() => {
              this.getStatus(urls);
            }, 2000);
          }
        } else {
          this.$message.error("初始化上传任务失败: " + initRes.msg);
        }
      } catch (err) {
        this.$message.error("初始化上传任务异常");
      }
      this.uploadBtnLoading = false;
      // 如果所有文件都已上传且无失败，清空列表并提示，否则不显示成功页
      // if (
      //   this.list.length > 0 &&
      //   this.list.every(item => (item.ossUrl || [2, 5].includes(item.status))) &&
      //   !this.list.some(item => item.status === 1)
      // ) {
      //   this.list = [];
      //   this.uploadAllSuccess = true;
      //   this.$message.success('上传成功');
      // } else {
      //   this.uploadAllSuccess = false;
      // }
    },
    async getStatus(urls) {
      const statusRes = await api.getSubtaskStatus({
        taskId: this.taskId,
        urls: urls,
      });
      if (statusRes.code === 0) {
        statusRes.data.forEach((item) => {
          const idx = this.list.findIndex((f) => f.ossUrl === item.url);
          if (idx !== -1) {
            this.list[idx].status = item.status;
            if(item.status === 2) {
              clearInterval(this.statusTime)
            }
          }
        });
      }
    },
    async handleFolderChange(e) {
      this.folderLoading = true;
      const files = Array.from(e.target.files);
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "video/mp4",
        "video/quicktime",
        "audio/mp3",
        "audio/mpeg",
      ];
      const allowedExts = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".mp4",
        ".mov",
        ".mp3",
      ];
      const notAllowedExtensions = [".zip", ".rar", ".7z"];
      const filtered = files.filter((f) => {
        const lowerName = f.name.toLowerCase();
        const isCompressed = notAllowedExtensions.some((ext) =>
          lowerName.endsWith(ext)
        );
        const isAllowedType =
          allowedTypes.includes(f.type) ||
          allowedExts.some((ext) => lowerName.endsWith(ext));
        return !isCompressed && isAllowedType;
      });
      for (const file of filtered) {
        if (!this.list.some((item) => item.file === file)) {
          const fileInfo = {
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2) + "MB",
            type: file.type,
            status: null,
            catalogue: file.webkitRelativePath || file.path || "",
            file,
            ossUrl: undefined,
          };
          this.list.push(fileInfo);
        }
      }
      e.target.value = "";
      this.folderLoading = false;
    },
    triggerFolderInput() {
      this.$refs.folderInput && this.$refs.folderInput.click();
    },
  },
};
</script>
<style lang="less" scoped>
@import "./matter_template.less";
</style>
