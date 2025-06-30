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
              :disabled="!allowSelectAfterStop && (uploadBtnLoading || (isUploading && !isPaused))"
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
              :disabled="folderLoading || (!allowSelectAfterStop && (uploadBtnLoading || (isUploading && !isPaused)))"
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
                :disabled="!allowSelectAfterStop && (uploadBtnLoading || (isUploading && !isPaused))"
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
          <div class="progress" v-if="showProgress && !isUploadStopped">
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
                v-if="
                  !isUploadStopped &&
                  !isPaused &&
                  !isAllUploadCompleted &&
                  !isProgressComplete
                "
                >暂停</span
              >
              <span
                class="progress-switch-item"
                style="color: #0052d9"
                @click="continueUpload"
                v-if="
                  !isUploadStopped &&
                  isPaused &&
                  !isAllUploadCompleted &&
                  !isProgressComplete
                "
                >继续</span
              >
              <span
                class="progress-switch-item"
                @click="stopUpload"
                v-if="!isUploadStopped && !isProgressComplete"
                >终止</span
              >
            </div>
          </div>
          <!-- 列表 -->
          <div class="matter-table-list">
            <el-table :data="pagedList" style="width: 100%" height="280">
              <el-table-column prop="name" label="名称" align="center"/>
              <el-table-column prop="catalogue" label="文件目录" align="center"/>
              <el-table-column prop="type" label="类型" align="center"/>
              <el-table-column prop="size" label="文件大小" align="center"/>
              <el-table-column prop="status" label="状态" width="108" align="center">
                <template slot-scope="{ row }">
                  <div v-if="row.status == null"  class="status-pending">待上传</div>
                  <div v-if="row.status == '0'"  class="status-uploading">上传中</div>
                  <div v-if="row.status == '1'"  class="status-failed">上传失败</div>
                  <div v-if="row.status == '2'"  class="status-success">上传成功</div>
                  <div v-if="row.status == '3'"  class="status-tag-required">需要打标而未打标</div>
                  <div v-if="row.status == '4'"  class="status-tag-failed">打标失败</div>
                  <div v-if="row.status == '5'"  class="status-tag-complete">打标完成</div>
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center">
                <template slot-scope="scope">
                  <div
                    :style="{
                      color:
                        uploadBtnLoading ||
                        (isUploading && !isPaused) ||
                        (isPaused && scope.row.hasAssociatedSubTask && scope.row.status !== null) ||
                        ([0, 1, 2, 5].includes(scope.row.status) && !(isPaused && scope.row.status === null))
                          ? '#ccc'
                          : '#bd3124',
                      cursor:
                        uploadBtnLoading ||
                        (isUploading && !isPaused) ||
                        (isPaused && scope.row.hasAssociatedSubTask && scope.row.status !== null) ||
                        ([0, 1, 2, 5].includes(scope.row.status) && !(isPaused && scope.row.status === null))
                          ? 'not-allowed'
                          : 'pointer',
                    }"
                    @click="
                      !(
                        uploadBtnLoading ||
                        (isUploading && !isPaused) ||
                        (isPaused && scope.row.hasAssociatedSubTask && scope.row.status !== null) ||
                        ([0, 1, 2, 5].includes(scope.row.status) && !(isPaused && scope.row.status === null))
                      ) && delItem(scope.row, scope.$index)
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
      <!-- <div class="matter-empty" v-if="uploadAllSuccess">
        <img src="@/assets/imgs/upload-success.png" alt="" />
        <p>上传成功</p>
      </div> -->
      <!-- 按钮 -->
      <div class="matter-btn">
        <el-button class="matter-btn-item" @click="goback">返回</el-button>
        <el-button
          class="matter-btn-item"
          type="primary"
          @click="uploadList"
          :disabled="
            pagedList.length === 0 ||
            (!allowSelectAfterStop &&
              (uploadBtnLoading || isPaused || isUploading))
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
      allowSelectAfterStop: false, // 终止后允许选择
      isUploadStopped: false, // 终止后隐藏进度条和操作按钮
      polledUrls: [], // 用于轮询的 ossUrl
    };
  },
  computed: {
    pagedList() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.list.slice(start, start + this.pageSize);
    },
    showProgress() {
      // 只要有未完成的文件（不是全部上传成功），就显示进度条
      return this.list.length > 0 && !this.isAllUploadCompleted;
    },
    // 新增：只要有已上传但未成功的文件，或者 uploadBtnLoading 为 true，就认为正在上传
    isUploading() {
      return (
        this.uploadBtnLoading ||
        this.list.some((item) => item.ossUrl && item.status !== 2)
      );
    },
    // 判断是否全部上传完成
    isAllUploadCompleted() {
      return (
        this.list.length > 0 && this.list.every((item) => item.status === 2)
      );
    },
    // 判断进度是否达到100%
    isProgressComplete() {
      return this.percentage >= 100;
    },
  },
  mounted() {
    // 在组件加载完成后发送事件到主进程调整窗口大小
    ipcRenderer.send("resize-window", { width: 1000, height: 600 });
    this.loadRootTree();
    // 恢复上传状态
    this.restoreUploadState();
    console.log("[mounted] isPaused:", this.isPaused);
  },
  beforeDestroy() {
    // 组件销毁前恢复窗口大小
    ipcRenderer.send("resize-window", { width: 440, height: 460 });
    // 清除定时器
    if (this.statusTime) {
      clearInterval(this.statusTime);
      this.statusTime = null;
    }
    // 保存上传状态
    this.saveUploadState();
  },
  beforeRouteLeave(to, from, next) {
    // 离开页面时自动暂停并保存状态
    this.isPaused = true;
    this.saveUploadState();
    next();
  },
  methods: {
    // 保存上传状态到本地存储
    saveUploadState() {
      const uploadState = {
        list: this.list,
        taskId: this.taskId,
        percentage: this.percentage,
        finished: this.finished,
        isPaused: this.isPaused,
        uploadBtnLoading: this.uploadBtnLoading,
        isUploadStopped: this.isUploadStopped,
        allowSelectAfterStop: this.allowSelectAfterStop,
        tagId: this.tagId,
        treeSelectedId: this.treeSelectedId,
        currentPage: this.currentPage,
        uploadAllSuccess: this.uploadAllSuccess,
        polledUrls: this.polledUrls,
        hasActiveUpload:
          this.list.some((item) => item.status === 0) &&
          !this.isAllUploadCompleted,
      };
      _store.set("UPLOAD_STATE", uploadState);
    },

    // 从本地存储恢复上传状态
    restoreUploadState() {
      const uploadState = _store.get("UPLOAD_STATE");
      console.log("[restoreUploadState] 恢复上传状态:", uploadState);

      if (uploadState && uploadState.list && uploadState.list.length > 0) {
        // 恢复状态
        this.list = uploadState.list || [];
        this.taskId = uploadState.taskId;
        this.percentage = uploadState.percentage || 0;
        this.finished = uploadState.finished || 0;
        this.isPaused = uploadState.isPaused || false;
        this.uploadBtnLoading = uploadState.uploadBtnLoading || false;
        this.isUploadStopped = uploadState.isUploadStopped || false;
        this.allowSelectAfterStop = uploadState.allowSelectAfterStop || false;
        this.tagId = uploadState.tagId || "0";
        this.treeSelectedId = uploadState.treeSelectedId || "0";
        this.currentPage = uploadState.currentPage || 1;
        this.uploadAllSuccess = uploadState.uploadAllSuccess || false;
        this.polledUrls = uploadState.polledUrls || [];
        // 如果所有文件都已上传成功，自动将 isPaused 设为 false
        if (
          this.list.length > 0 &&
          this.list.every((item) => item.status === 2)
        ) {
          this.isPaused = false;
          this.uploadAllSuccess = true;
        }
        // 只要 polledUrls 有 status=0 的文件就自动轮询
        if (
          this.polledUrls.some((url) => {
            const item = this.list.find((i) => i.ossUrl === url);
            return item && item.status === 0;
          })
        ) {
          this.startStatusPolling();
        }
        console.log("[restoreUploadState] 恢复后的 isPaused:", this.isPaused);
        if (this.isPaused && this.list.some((item) => item.status === 0)) {
          this.$message.info('检测到暂停的上传任务，点击"继续"按钮恢复上传');
        }
      } else {
        console.log("[restoreUploadState] 没有需要恢复的上传状态");
      }
    },

    // 开始状态轮询
    startStatusPolling() {
      if (this.statusTime) return; // 已有定时器不重复启动
      console.log(
        "[startStatusPolling] 启动定时器，polledUrls:",
        this.polledUrls
      );
      this.statusTime = setInterval(() => {
        // 只要 status !== 2（不是上传成功）的 polledUrls 都要轮询
        const urls = this.polledUrls.filter((url) => {
          const item = this.list.find((i) => i.ossUrl === url);
          return item && item.status !== 2;
        });
        console.log(
          "[轮询] 当前 polledUrls:",
          this.polledUrls,
          "urls:",
          urls,
          "list:",
          this.list.map((i) => ({
            name: i.name,
            status: i.status,
            ossUrl: i.ossUrl,
          }))
        );
        if (urls.length > 0) {
          this.getStatus(urls);
        } else {
          console.log("[轮询] 没有未完成的 polledUrls，清除定时器");
          clearInterval(this.statusTime);
          this.statusTime = null;
        }
      }, 2000);
    },

    // 清空列表方法
    clearList() {
      if (this.isAllUploadCompleted) {
        this.list = [];
        this.uploadAllSuccess = false;
        this.percentage = 0;
        this.finished = 0;
        this.currentPage = 1;
        // 清除存储的状态
        _store.delete("UPLOAD_STATE");
      }
    },
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
      if (this.isUploadStopped || this.isAllUploadCompleted) {
        this.list = [];
        this.isUploadStopped = false;
        this.uploadAllSuccess = false;
        this.percentage = 0;
        this.finished = 0;
        this.currentPage = 1;
      }
      this.$refs.fileInput && this.$refs.fileInput.click();
    },
    // 合并新文件到 this.list，去重（按 name+size）
    mergeNewFiles(newFiles) {
      const existingKeys = new Set(this.list.map(f => f.name + '_' + f.size));
      newFiles.forEach(file => {
        const key = file.name + '_' + file.size;
        if (!existingKeys.has(key)) {
          this.list.push(file);
        }
      });
    },
    handleFileInputChange(e) {
      const files = Array.from(e.target.files);
      const newFiles = files.map(file => ({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + "MB",
        type: file.type,
        status: null,
        catalogue: file.path || "",
        file: file,
        ossUrl: undefined,
        hasAssociatedSubTask: false,
      }));
      this.mergeNewFiles(newFiles);
      e.target.value = "";
      this.currentPage = Math.ceil(this.list.length / this.pageSize) || 1;
      this.isUploadStopped = false;
    },
    // 上传文件夹改变
    onTreeChange(node) {
      // 不清空原有未上传和已上传的文件
      this.tagId = node.id;
    },
    // 终止上传
    stopUpload() {
      // 打开弹窗时立即暂停进度
      this.isPaused = true;
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
        this.allowSelectAfterStop = true;
        this.isUploadStopped = true;
        // 移除待上传的项
        this.list = this.list.filter(item => item.status !== null);
        // 不清空 this.list，不删除 UPLOAD_STATE，保留所有历史
        this.saveUploadState();
      });
    },
    pauseUpload() {
      this.isUploadStopped = false;
      this.allowSelectAfterStop = false;
      this.isPaused = true;
      // 不再清除定时器
      this.saveUploadState();
    },
    continueUpload() {
      if (this.isPaused) {
        this.isUploadStopped = false;
        this.allowSelectAfterStop = false;
        this.isPaused = false;

        this.uploadList();
        console.log("[continueUpload] isPaused:", this.isPaused);
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
      // 离开页面时自动暂停并保存状态
      this.isPaused = true;
      this.saveUploadState();
      this.$router.push({ name: "template_select" });
    },
    // 上传按钮
    async uploadList() {
     console.log('[uploadList] called, isPaused:', this.isPaused, 'uploadBtnLoading:', this.uploadBtnLoading, 'list:', this.list);
      this.isUploadStopped = false;
      this.allowSelectAfterStop = false;
      // 只上传 status=null 的新文件，保留已上传的文件
      const uploadList = this.list.filter(item => item.status === null);
      this.uploadBtnLoading = true;
      const batchSize = 5;
      const total = uploadList.length;
      let start = 0;
      if (!this.isPaused) {
        this.finished = 0;
        this.percentage = 0;
      }
      // 统计已完成数（ossUrl存在或status==1为失败）
      this.finished = this.list.filter(
        (item) => item.ossUrl || item.status === 1
      ).length;
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
              // 保存暂停状态
              this.saveUploadState();
              return;
            }
            const batch = uploadList.slice(start, start + batchSize);
            // 1. 上传本批次到OSS
            for (const fileInfo of batch) {
              if (this.isPaused) {
                this.uploadBtnLoading = false;
                // 保存暂停状态
                this.saveUploadState();
                return;
              }
              if (!fileInfo.ossUrl) {
                // 只上传未上传过的
                try {
                  const { uploadToOss } = await import("@/libs/ossUploadUtil");
                  const result = await uploadToOss(fileInfo.file);
                  fileInfo.ossUrl = result.url;
                } catch (e) {
                  console.log(e);
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
            if (subtasks.length > 0) {
              await api.addAssociatedSubTask({
                taskId: this.taskId,
                subtasks,
              });
              batch.forEach((item) => {
                if (item.ossUrl) {
                  const realItem = this.list.find((f) => f.file === item.file);
                  if (realItem)
                    this.$set(realItem, "hasAssociatedSubTask", true);
                }
              });
              const batchUrls = batch
                .map((item) => item.ossUrl)
                .filter(Boolean);
              this.polledUrls = Array.from(
                new Set([...this.polledUrls, ...batchUrls])
              );
              this.startStatusPolling();
            }
            start += batchSize;
          }
        } else {
          this.$message.error("初始化上传任务失败: " + initRes.msg);
          this.list = [];
        }
      } catch (err) {
        this.$message.error("初始化上传任务异常");
        this.list = [];
      }
      this.uploadBtnLoading = false;
      // 保存状态
      this.saveUploadState();
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
          }
        });
        // 检查所有已上传文件是否都成功
        if (
          this.list
            .filter((item) => item.ossUrl)
            .every((item) => item.status === 2)
        ) {
          if (this.statusTime) {
            clearInterval(this.statusTime);
            this.statusTime = null;
          }
          this.uploadAllSuccess = true;
          this.isPaused = false;
          _store.delete("UPLOAD_STATE");
        }
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
      const newFiles = filtered.map(file => ({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + "MB",
        type: file.type,
        status: null,
        catalogue: file.webkitRelativePath || file.path || "",
        file,
        ossUrl: undefined,
        hasAssociatedSubTask: false,
      }));
      this.mergeNewFiles(newFiles);
      e.target.value = "";
      this.folderLoading = false;
      this.currentPage = Math.ceil(this.list.length / this.pageSize) || 1;
      this.isUploadStopped = false;
    },
    triggerFolderInput() {
      if (this.isUploadStopped || this.isAllUploadCompleted) {
        this.list = [];
        this.isUploadStopped = false;
        this.uploadAllSuccess = false;
        this.percentage = 0;
        this.finished = 0;
        this.currentPage = 1;
      }
      this.$refs.folderInput && this.$refs.folderInput.click();
    },
  },
};
</script>
<style lang="less" scoped>
@import "./matter_template.less";
</style>
