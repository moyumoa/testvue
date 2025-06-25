<template>
  <div class="material_library sumvideo_page_xmy">
    <!-- 客户端 -->
    <!-- <down-load-client></down-load-client> -->
    <!-- 筛选条件 -->
    <div ref="xmSearchRef" class="search_warp">
      <xm_search
        :searchComponents="searchComponents"
        :useOwnReset="true"
        :showShrink="true"
        @getData="querySearch"
        @reset="resetSearch"
        @openChoseLabel="openChoseLabel"
        @updateShrink="updateShrink"
      ></xm_search>
    </div>
    <div
      class="library_page"
      :style="{
        height: contentHeight + 'px'
      }"
      v-loading="changeFileLoading"
    >
      <div class="library_left">
        <filesDOM
          ref="filesRef"
          origin="material"
          :showDropDown="true"
          :hideFileIcon="true"
          @updateId="updateChooseId"
        />
      </div>
      <!-- 数据列表 -->
      <div class="manage_table" v-loading="!changeFileLoading && tableForm.loading">
        <!--   词云标签信息 最新版按创建时间排序  -->
        <div class="tag_container" v-if="tagCloudList.length > 0">
          <div
            :class="['tag_item', item.id === currentTagCloud.id ? 'tag_item_active' : '']"
            v-for="item in tagCloudList"
            :key="item.id"
            @click="tagCloudSearch(item)"
          >
            <!--   source = 1 星麦内置       -->
            <el-icon v-if="item.source === 1" style="font-size: 14px; margin-right: 2px">
              <i-star />
            </el-icon>
            {{ item.name }}
          </div>
        </div>
        <div style="position: relative; padding-top: 30px">
          <el-tabs class="tab_box" v-model="chooseTab" @tab-click="changeTab">
            <el-tab-pane v-for="(tab, i) in tabList" :key="i" :label="tab.label" :name="tab.name">
              <template #label>
                <div class="tab_label">{{ tab.label }}</div>
              </template>
            </el-tab-pane>
          </el-tabs>
          <div class="batch-operation" v-if="showBatch">
            <el-button style="margin-right: 16px" @click="handleCommandMerge">原料合并</el-button>
            <!-- trigger="click" -->
            <el-dropdown popper-class="xm_dropDown" @command="handleCommandRemove">
              <el-button>
                移动
                <el-icon class="el-icon--right"><i-arrow-down /></el-icon>
              </el-button>
              <!-- <div class="batch_icon_box">
                <img
                  class="batch_icon"
                  src="https://tagvv-1256030678.file.myqcloud.com/202404025j615.png"
                  alt=""
                />
              </div> -->
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="1">批量移动选中原料</el-dropdown-item>
                  <el-dropdown-item command="2">批量移动搜索出的所有原料</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-dropdown popper-class="xm_dropDown" @command="handleCommandAddTag">
              <el-button>
                打标/去标
                <el-icon class="el-icon--right"><i-arrow-down /></el-icon>
              </el-button>
              <!-- <div class="batch_icon_box">
                <img
                  class="batch_icon"
                  src="https://tagvv-1256030678.file.myqcloud.com/20240402aipbr.png"
                  alt=""
                />
              </div> -->
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="1">批量打标选中原料</el-dropdown-item>
                  <el-dropdown-item command="2">批量打标搜索出的所有原料</el-dropdown-item>
                  <el-dropdown-item command="3">批量去标选中原料</el-dropdown-item>
                  <el-dropdown-item command="4">批量去标搜索出的所有原料</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <el-dropdown popper-class="xm_dropDown" @command="handleCommandDelete">
              <el-button>
                删除
                <el-icon class="el-icon--right"><i-arrow-down /></el-icon>
              </el-button>
              <!-- <div class="batch_icon_box">
                <img
                  class="batch_icon"
                  src="https://tagvv-1256030678.file.myqcloud.com/20240402dty1i.png"
                  alt=""
                />
              </div> -->
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="1">批量删除选中原料</el-dropdown-item>
                  <el-dropdown-item command="2">批量删除搜索出的所有原料</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-dropdown popper-class="xm_dropDown" @command="handleCommandDown">
              <el-button>
                下载
                <el-icon class="el-icon--right"><i-arrow-down /></el-icon>
              </el-button>
              <!-- <div class="batch_icon_box">
                <img
                  class="batch_icon"
                  src="https://tagvv-1256030678.file.myqcloud.com/20240402aipbr.png"
                  alt=""
                />
              </div> -->
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="1">批量下载选中原料</el-dropdown-item>
                  <el-dropdown-item command="2">批量下载搜索出的所有原料</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div class="action_btn">
            <!-- <el-button type="primary" @click="isBatch" class="btn">
            {{ !showBatch ? '批量操作' : '退出批量操作' }}
          </el-button> -->

            <el-button
              v-if="!showBatch"
              type="primary"
              :loading="fileLoading"
              class="btn"
              @click="clickShow('upload', '上传原料')"
            >
              上传
            </el-button>
            <!-- </el-upload> -->
            <el-button v-if="!showBatch" type="primary" @click="showDialogFun" class="btn">
              添加文本
            </el-button>
            <el-switch
              style="margin: 0 12px 0 16px"
              :model-value="showBatch"
              inline-prompt
              :width="45"
              @click="isBatch"
            ></el-switch>
            <span style="color: #909399">批量操作</span>
          </div>
        </div>
        <div
          class="page_scroll"
          :style="tagCloudList.length > 0 ? '' : ' height: calc(100% - 70px);'"
          ref="pageScroll"
        >
          <!-- 列表 -->
          <div class="container">
            <template v-if="tableForm.listData && tableForm.listData.length > 0">
              <div
                class="column"
                :infinite-scroll-delay="1000"
                v-infinite-scroll="load"
                :infinite-scroll-distance="50"
                :infinite-scroll-immediate="false"
                :infinite-scroll-disabled="tableForm.listData.length >= tableForm.page.total"
                v-for="(column, index) in columns"
                :key="index"
              >
                <div
                  :class="{
                    item: true,
                    xm_item: item.source == 6,
                    xm_item_click: pageClickId == item.id
                  }"
                  v-for="(item, itemIndex) in column.columnArr"
                  :key="item.id"
                  :style="{
                    height:
                      ((listWidth - (columns.length - 1) * 14) / columns.length / 176) *
                        item.showHeight +
                      'px',
                    width: (listWidth - (columns.length - 1) * 14) / columns.length + 'px'
                  }"
                  @click="toDetail(item, itemIndex, index)"
                >
                  <!-- 视频 -->
                  <div class="one_video one_item" v-if="item.type === 1">
                    <img class="item_cover" :src="item.coverUrl" alt="" />
                    <img
                      v-if="item.source === 6"
                      class="item_xm"
                      src="https://tagvv-1256030678.file.myqcloud.com/202405134bhlq.png"
                      alt=""
                    />
                    <div
                      class="chose-mask"
                      :class="{ 'show-chose-mask': showBatch }"
                      @click.prevent="clickBatch(item, $event)"
                    >
                      <div :class="{ 'select-state': true, 'selected-state': item.itemChose }">
                        <div :class="{ 'state-chose': item.itemChose }"></div>
                      </div>
                    </div>
                    <div class="item_content" v-if="!showBatch">
                      <div class="item_box item_box1">
                        <div class="item_title line-hidden1">
                          {{ item.name || '--' }}
                        </div>
                        <div class="item_status">视频</div>
                      </div>
                      <div class="item_parent_box">
                        <fileTag
                          v-if="item.folderList && item.folderList.length > 0 && item.source != 6"
                          class="file_tagbox"
                          :fileName="item.folderList[0].name"
                          :fileInfo="item.folderList[0]"
                          @showRemoveFun="showRemoveFun(item, itemIndex, index)"
                        />
                        <div class="item_box" style="align-items: flex-end">
                          <div class="item_box item_label" style="justify-content: unset">
                            <div v-for="(tag, tagIndex) in item.tagList" :key="tagIndex">
                              {{ tag.name }}
                            </div>
                          </div>
                          <!-- v-if="item.source != 6" -->
                          <el-tooltip effect="dark" content="编辑标签" placement="top">
                            <div
                              class="item_detail"
                              @click.stop="changeTagFun(item, itemIndex, index)"
                            >
                              <img
                                src="https://tagvv-1256030678.file.myqcloud.com/20230307m325c.png"
                                alt=""
                              />
                            </div>
                          </el-tooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- 图片 -->
                  <div class="one_pic one_item" v-else-if="item.type === 2">
                    <img class="item_cover" :src="item.url" alt="" />
                    <img
                      v-if="item.source === 6"
                      class="item_xm"
                      src="https://tagvv-1256030678.file.myqcloud.com/202405134bhlq.png"
                      alt=""
                    />

                    <div
                      class="chose-mask"
                      :class="{ 'show-chose-mask': showBatch }"
                      @click.prevent="clickBatch(item, $event)"
                    >
                      <div :class="{ 'select-state': true, 'selected-state': item.itemChose }">
                        <div :class="{ 'state-chose': item.itemChose }"></div>
                      </div>
                    </div>
                    <div class="item_content" v-if="!showBatch">
                      <div class="item_box item_box1">
                        <div class="item_title line-hidden1">
                          {{ item.name || '--' }}
                        </div>
                        <div class="item_status">图片</div>
                      </div>
                      <div class="item_parent_box">
                        <fileTag
                          v-if="item.folderList && item.folderList.length > 0 && item.source != 6"
                          class="file_tagbox"
                          :fileName="item.folderList[0].name"
                          :fileInfo="item.folderList[0]"
                          @showRemoveFun="showRemoveFun(item, itemIndex, index)"
                        />
                        <div class="item_box" style="align-items: flex-end">
                          <div class="item_box item_label" style="justify-content: unset">
                            <div v-for="(tag, tagIndex) in item.tagList" :key="tagIndex">
                              {{ tag.name }}
                            </div>
                          </div>
                          <el-tooltip effect="dark" content="编辑标签" placement="top">
                            <div
                              class="item_detail"
                              @click.stop="changeTagFun(item, itemIndex, index)"
                            >
                              <img
                                src="https://tagvv-1256030678.file.myqcloud.com/20230307m325c.png"
                                alt=""
                              />
                            </div>
                          </el-tooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- 文本-->
                  <div class="one_text" v-else-if="item.type === 4">
                    <img
                      v-if="item.source === 6"
                      class="item_xm"
                      src="https://tagvv-1256030678.file.myqcloud.com/202405134bhlq.png"
                      alt=""
                    />

                    <div
                      v-if="showBatch"
                      class="chose-mask"
                      :class="{ 'show-chose-mask': showBatch }"
                      @click.prevent="clickBatch(item, $event)"
                    >
                      <div :class="{ 'select-state': true, 'selected-state': item.itemChose }">
                        <div :class="{ 'state-chose': item.itemChose }"></div>
                      </div>
                    </div>

                    <div style="height: 100%">
                      <div class="text_content">
                        <div>{{ item.content || '--' }}</div>
                      </div>
                      <div class="item_title line-hidden1" style="margin: 8px 0">
                        {{ item.name || '--' }}
                      </div>
                      <div class="item_box" style="margin-bottom: 6px">
                        <div class="item_status">文本</div>
                      </div>
                      <div class="item_parent_box">
                        <fileTag
                          v-if="item.folderList && item.folderList.length > 0 && item.source != 6"
                          class="file_tagbox"
                          :fileName="item.folderList[0].name"
                          :fileInfo="item.folderList[0]"
                          @showRemoveFun="showRemoveFun(item, itemIndex, index)"
                        />
                        <div class="item_box item_label_box">
                          <div class="item_box item_label" style="justify-content: unset">
                            <div v-for="(tag, tagIndex) in item.tagList" :key="tagIndex">
                              {{ tag.name }}
                            </div>
                          </div>
                          <el-tooltip effect="dark" content="编辑标签" placement="top">
                            <div
                              class="item_detail"
                              @click.stop="changeTagFun(item, itemIndex, index)"
                            >
                              <img
                                src="https://tagvv-1256030678.file.myqcloud.com/20230307m325c.png"
                                alt=""
                              />
                            </div>
                          </el-tooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- 音频 -->
                  <div class="one_audio one_item" v-else-if="item.type === 3">
                    <img
                      v-if="item.source === 6"
                      class="item_xm"
                      src="https://tagvv-1256030678.file.myqcloud.com/202405134bhlq.png"
                      alt=""
                    />
                    <div
                      v-if="showBatch"
                      class="chose-mask"
                      :class="{ 'show-chose-mask': showBatch }"
                      @click.prevent="clickBatch(item, $event)"
                    >
                      <div :class="{ 'select-state': true, 'selected-state': item.itemChose }">
                        <div :class="{ 'state-chose': item.itemChose }"></div>
                      </div>
                    </div>
                    <div class="one_audio_box">
                      <div class="one_audio_top">
                        <img
                          class="audio_img"
                          src="@/assets/images/content_center/material/audio.png"
                          alt=""
                        />
                        <div class="audio_right">
                          <div class="item_title line-hidden1">{{ item.name || '--' }}</div>
                          <div class="item_status">音频</div>
                        </div>
                      </div>
                      <div class="item_parent_box">
                        <fileTag
                          v-if="item.folderList && item.folderList.length > 0 && item.source != 6"
                          class="file_tagbox"
                          :fileName="item.folderList[0].name"
                          :fileInfo="item.folderList[0]"
                          @showRemoveFun="showRemoveFun(item, itemIndex, index)"
                        />
                        <div class="item_box">
                          <div class="item_box item_label" style="justify-content: unset">
                            <div v-for="(tag, tagIndex) in item.tagList" :key="tagIndex">
                              {{ tag.name }}
                            </div>
                          </div>

                          <el-tooltip effect="dark" content="编辑标签" placement="top">
                            <div
                              class="item_detail"
                              @click.stop="changeTagFun(item, itemIndex, index)"
                            >
                              <img
                                src="https://tagvv-1256030678.file.myqcloud.com/20230307m325c.png"
                                alt=""
                              />
                            </div>
                          </el-tooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- 未知 -->
                  <div class="one_audio one_item" v-else>
                    <img
                      v-if="item.source === 6"
                      class="item_xm"
                      src="https://tagvv-1256030678.file.myqcloud.com/202405134bhlq.png"
                      alt=""
                    />
                    <div
                      v-if="showBatch"
                      class="chose-mask"
                      :class="{ 'show-chose-mask': showBatch }"
                      @click.prevent="clickBatch(item, $event)"
                    >
                      <div :class="{ 'select-state': true, 'selected-state': item.itemChose }">
                        <div :class="{ 'state-chose': item.itemChose }"></div>
                      </div>
                    </div>
                    <div class="one_audio_box">
                      <div class="one_audio_top">
                        <img
                          class="audio_img"
                          src="@/assets/images/content_center/material/none.png"
                          alt=""
                        />
                        <div class="audio_right">
                          <div class="item_title line-hidden1">未知名称</div>
                          <div class="item_status">未知</div>
                        </div>
                      </div>
                      <div class="item_parent_box">
                        <fileTag
                          v-if="item.folderList && item.folderList.length > 0 && item.source != 6"
                          class="file_tagbox"
                          :fileName="item.folderList[0].name"
                          :fileInfo="item.folderList[0]"
                          @showRemoveFun="showRemoveFun(item, itemIndex, index)"
                        />
                        <div class="item_box">
                          <div class="item_box item_label" style="justify-content: unset">
                            <div v-for="(tag, tagIndex) in item.tagList" :key="tagIndex">
                              {{ tag.name }}
                            </div>
                          </div>

                          <el-tooltip effect="dark" content="编辑标签" placement="top">
                            <div
                              class="item_detail"
                              @click.stop="changeTagFun(item, itemIndex, index)"
                            >
                              <img
                                src="https://tagvv-1256030678.file.myqcloud.com/20230307m325c.png"
                                alt=""
                              />
                            </div>
                          </el-tooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <div v-else class="no_echart">
              <img src="@/assets/images/content_center/no_activity.png" alt />
              暂无数据
            </div>
          </div>
          <div class="loading_library" v-if="tableForm.listData && tableForm.listData.length > 0">
            <img
              src="/public/loading.gif"
              v-if="tableForm.loading && tableForm.page.index > 1"
              alt=""
            />
            {{
              tableForm.loading
                ? tableForm.page.index === 1
                  ? ''
                  : '加载中...'
                : tableForm.listData.length >= tableForm.page.total
                ? '已经到底了~'
                : '上拉加载更多~'
            }}
          </div>
        </div>
      </div>
    </div>
    <addTextDialog v-if="addDialog.show" :addDialog="addDialog" @updateList="updateList" />
    <!-- 上传的mask 后加入批量操作相关，不做组件了-->
    <div
      :class="{
        'upload-mask': true,
        'dialog-fade-enter-active': true,
        'dialog-fade-enter-to': true,
        no_menu_upload_mask: isHideLeftMenu
      }"
      v-if="showUploadMask.isShow"
    >
      <div
        class="upload-mask-con dialog-fade-enter-active dialog-fade-enter-to"
        :style="showUploadMask.type === 'allMarking' ? 'width:560px' : ''"
      >
        <div class="top">
          <span>
            {{ showUploadMask.title }}
          </span>
          <img
            style="width: 16px; height: 16px; cursor: pointer"
            @click="uploadCancelBatch"
            src="https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/no_1659602199940.png"
            alt
          />
        </div>
        <!-- 批量上传  :file-list="fileListBatch"-->
        <div class="con" v-if="showUploadMask.type === 'upload'">
          <el-upload
            :disabled="fileLoading"
            :show-file-list="false"
            ref="upload"
            class="upload-demo"
            accept=".jpeg, .jpg, .png, .gif,video/mp4,video/quicktime,audio/mp3"
            action=""
            :headers="headers"
            :http-request="handleRequest"
            :before-upload="handleBeforeUpload"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :on-exceed="handleExceed"
            :limit="50"
            :multiple="true"
          >
            <div class="flex" style="align-items: center">
              <el-button type="primary" :loading="fileLoading" class="btn" @click="handleUpload">
                添加
              </el-button>
              <div style="margin-left: 30px">
                已添加数量：
                <span style="margin-left: 4px; font-size: 18px; color: #364fcd">
                  {{ successFileList.length }}
                </span>
              </div>
            </div>
          </el-upload>
          <div class="little-tips">
            支持批量添加，每次最多选择50个文件，图片支持：jpg/jpeg/png/gif，大小不超过15M，视频支持：mp4/mov，大小不超过500M，音频支持：mp3，大小不超过20M。
          </div>
          <div class="files-list" v-if="successFileList.length > 0">
            <div class="file-item" v-for="(file, index) in successFileList" :key="index">
              <!-- 图标 -->
              <div class="file-item-l">
                <!-- 视频 -->
                <img
                  v-if="initFiletype(file.data[0].fileFormat) == 'video'"
                  src="@/assets/images/content_center/material/video.png"
                  alt
                />
                <!-- 图片 -->
                <img
                  v-else-if="initFiletype(file.data[0].fileFormat) == 'image'"
                  src="@/assets/images/content_center/material/photo.png"
                  alt
                />
                <!-- 音频 --MP3、WAV、WMA、MP2、Flac、MIDI、RA、APE、AAC、CDA、MOV -->
                <img
                  v-else-if="initFiletype(file.data[0].fileFormat) == 'radio'"
                  src="@/assets/images/content_center/material/music.png"
                  alt
                />
                <!-- 其他 -->
                <img src="@/assets/images/content_center/material/none.png" v-else alt />

                <div class="name">{{ file.name }}</div>
              </div>
              <!--  -->
              <div class="file-item-r" v-if="!fileLoading">
                <img
                  src="https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/bbdfc407182749598d2f532561e587c8_1659961431125.png"
                  alt
                />
                <div class="delete" @click="deleteFileS(file)">删除</div>
              </div>
            </div>
          </div>
          <div class="batch-label">
            <div class="title upload_mark" style="margin-right: 14px">批量打标：</div>
            <div style="width: 696px">
              <batchMarking @choseOptions="choseOptions" />
            </div>
          </div>
          <div class="batch-label" style="margin-top: 0" v-if="false">
            <div class="title upload_mark">文件夹选择：</div>
            <div style="width: 696px">
              <searchFileDOM
                :fileID="showUploadMask.saveFileInfo"
                @select="changeFileFun"
                @fileChange="fileChange"
                failType="listTagFolder"
              />
            </div>
          </div>

          <div class="last-num">
            <div class="title upload_mark">上传批次号：</div>
            <div class="num-r" style="width: 696px">
              <div class="num-r-top">
                {{ (batchNumAbout.value && batchNumAbout.value.batchNumber) || '' }}
              </div>
              <div class="num-r-bottom">
                上传批次号便于查找批量上传的同批原料，批量进行打标、删除操作
              </div>
            </div>
          </div>
          <div class="new-bottom-btn">
            <div class="bottom-btn-left">
              <el-checkbox
                v-if="showUploadMask.hasAudio"
                v-model="showUploadMask.validAudio"
                label="请确保您上传的音频可免费商用或取得著作人许可"
                size="large"
              />
            </div>
            <div class="bottom-btn-right">
              <el-button
                type="primary"
                :disabled="fileLoading || saveLoading"
                class="cancel-btn"
                @click="uploadCancelBatch"
              >
                取消
              </el-button>
              <el-button
                type="primary"
                :loading="saveLoading"
                :disabled="
                  !(
                    successFileList.length > 0 &&
                    ((showUploadMask.hasAudio && showUploadMask.validAudio) ||
                      !showUploadMask.hasAudio)
                  ) || fileLoading
                "
                class="ok-btn"
                @click="saveFileUpload"
              >
                上传
              </el-button>
            </div>
          </div>
        </div>
        <!-- 批量去标 -->
        <div class="con" v-else-if="showUploadMask.type === 'allMarking'">
          <!-- 批量删除 -->
          <div class="all-delete-tips" v-if="batchItem === 6 || batchItem === 5">
            是否批量删除{{
              batchItem === 5
                ? batchOperationArr.length + '个'
                : '选中的' + batchOperationArr.length + '个'
            }}原料？此操作不可恢复，请谨慎操作。
          </div>
          <!--  批量去标-->
          <div class="batch-label" v-if="batchItem === 2 || batchItem === 1">
            <div class="title">标签：</div>
            <div style="width: 90%">
              <batchMarking :batchAbout="batchAbout" @choseOptions="choseOptions" />
              <div class="batch-tips">去除所选{{ batchOperationArr.length }}个原料的指定标签</div>
            </div>
          </div>
          <!-- 批量打标 -->
          <div class="batch-label" v-if="batchItem === 4 || batchItem === 3">
            <div class="title">标签：</div>
            <div style="width: 90%">
              <batchMarking :batchAbout="batchAbout" @choseOptions="choseOptions" />
              <div class="batch-tips">批量打标{{ batchOperationArr.length }}个原料</div>
            </div>
          </div>
          <div class="bottom-btn">
            <el-button :disabled="saveTagLoading" class="cancel-btn" @click="cancelBatch">
              取消
            </el-button>
            <el-button type="primary" :loading="saveTagLoading" class="ok-btn" @click="okBatch">
              确定
            </el-button>
          </div>
        </div>
      </div>
    </div>
    <!-- 原料详情的弹窗 -->
    <elementDetailDialog
      ref="elementDetailDialogRef"
      v-if="elementDialog.show"
      :elementDialog="elementDialog"
      @updateList="updateList"
      @showRemoveFun="showRemoveFun"
      @closeDialog="closeClickIdByDialog"
      @disassemble="disassembleFun"
    ></elementDetailDialog>
    <!-- 编辑标签的弹窗 -->
    <addTagDOM v-if="addTagDialog.show" :addDialog="addTagDialog" @updateTag="updateTag" />
    <!-- 移动到文件夹的弹窗 -->
    <removeDOM
      origin="material"
      v-if="removeDialog.show"
      :removeDialog="removeDialog"
      @removeSuccessFun="removeSuccessFun"
      @closeDialog="closeClickIdByDialog"
    />
    <!-- 合并&拆解 -->
    <mergeDisassembleDialog
      v-if="mergeDisassembleInfo.show"
      :info="mergeDisassembleInfo"
      @submit="submitMergeDisassemble"
      @updateFile="updateFile"
    />
  </div>
</template>

<script setup>
import searchFileDOM from '@/views/sumvideo/components/files/search_file.vue'

import removeDOM from '@/views/sumvideo/components/files/file_remove_dialog.vue'
import fileTag from '@/views/sumvideo/components/files/file_tag.vue'
import filesDOM from '@/views/sumvideo/components/files/choose_file_tree.vue'

// import filesDOM from '@/views/sumvideo/components/files/files.vue'
// import downLoadClient from '@/views/sumvideo/components/downloadClient.vue'
import addTagDOM from '@/views/content_center/content_repository/components/addTag_dialog.vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import elementDetailDialog from './components/element_detail_dialog.vue'
import {
  getSts,
  getBatchNum,
  batchUpload,
  deleteFile,
  fileOk,
  detail,
  batchOpr,
  batchAddRemove,
  getTags,
  use
} from '@/api/content_center/material_library.js'
import OSS from 'ali-oss'
import addTextDialog from './components/addText_dialog.vue'
import { pageList } from './model/get_material_list.js'
import { throttle, getCWidth, getCHeight, isNotEmpty } from '@/utils/tools.js'
import batchMarking from '@/views/content_center/content_repository/components/batch_marking.vue'
// import { ArrowDown } from '@element-plus/icons-vue'
import initFiletype from '@/views/content_center/content_repository/components/JS/material_library'
import { useStore } from 'vuex'
// import { downLoadFile } from '@/utils/exportFile.js'
import { downLoadAllFile, cancelDownFile } from '@/utils/batchDownloadFile.js'
import mergeDisassembleDialog from './components/merge_disassemble_dialog.vue'

const addTagDialog = reactive({
  show: false,
  id: null,
  hideTitleSpan: false,
  type: null,
  chooseTagList: [],
  index: [],
  source: null
})

const mergeDisassembleInfo = reactive({
  resultInfo: {
    result: false, // 是否操作成功
    isAddFile: false // 是否添加了文件夹
  },
  show: false,
  type: 'merge' // merge 合并  disassemble拆解
})
const store = useStore()
const isHideLeftMenu = store.getters.isHideLeftMenu
const choseLabelList = ref([]) // 筛选项里选中的标签列表

function submitMergeDisassemble(type) {
  console.log('type', type)
  if (type === 'merge') {
    querySearch()
  } else {
    mergeDisassembleInfo.resultInfo.result = true
  }
}
// 如果更新了文件夹树，那关闭弹窗时就刷新
function updateFile(type) {
  if (type === 'merge') {
    filesRef.value?.refreshFun()
  } else {
    mergeDisassembleInfo.resultInfo.isAddFile = true
  }
}
// 打开选择标签弹窗
function openChoseLabel() {
  addTagDialog.type = 15
  addTagDialog.hideTitleSpan = false
  addTagDialog.id = null
  addTagDialog.index = []
  addTagDialog.source = null
  addTagDialog.chooseTagList = choseLabelList.value || []
  addTagDialog.show = true
}
// 打开设置标签弹窗
function changeTagFun(e, itemIndex, index) {
  addTagDialog.type = 5
  addTagDialog.hideTitleSpan = true
  addTagDialog.id = e.id
  addTagDialog.index = [index, itemIndex]
  addTagDialog.source = 0
  detail({
    id: e.id
  })
    .then(res => {
      if (res.code === 0) {
        addTagDialog.chooseTagList = res.data.tagList || []
        addTagDialog.show = true
      }
    })
    .catch(() => {
      addTagDialog.chooseTagList = e.tagList ? JSON.parse(JSON.stringify(e.tagList)) : []
      addTagDialog.show = true
    })
}
// 更新标签
function updateTag(e) {
  if (addTagDialog.type === 5) {
    columns.value[addTagDialog.index[0]].columnArr[addTagDialog.index[1]].tagList = e
  } else {
    choseLabelList.value = e
    // 传值给search组件
    const arr = ref([])
    choseLabelList.value.forEach(item => {
      arr.value.push(item.id)
    })
    const searchIndex = searchComponents.value.findIndex(x => x.filed === 'tags')
    if (searchIndex > -1) {
      searchComponents.value[searchIndex].val = arr.value
    }
    // 如果标签取消的 词云选中的标签 就置空
    if (choseLabelList.value.findIndex(item => item.id === currentTagCloud.value.id) === -1) {
      resetTagCloud()
    }
  }
}

// 原料合并
const handleCommandMerge = throttle(function () {
  const videoArr = batchOperationArr.value.filter(x => x.type === 1)
  if (batchOperationArr.value.length < 2) {
    return message.warning('最少勾选2个原料')
  } else if (
    videoArr.length < batchOperationArr.value.length &&
    batchOperationArr.value.length > 0
  ) {
    return message.warning('原料合并仅支持视频类型')
  } else if (batchOperationArr.value.length > 5) {
    return message.warning('最多支持同时合并5个视频原料')
  }
  console.log('选择的视频原料', videoArr)
  mergeDisassembleInfo.type = 'merge'
  mergeDisassembleInfo.show = true
  mergeDisassembleInfo.resourceIds = batchOperationArr.value.map(x => x.id)
  mergeDisassembleInfo.resourceName = name || ''
  mergeDisassembleInfo.duration = null
  mergeDisassembleInfo.resultInfo = {}
}, 500)

// 原料拆分
function disassembleFun(id, duration, name) {
  console.log('原料拆分 - elementDialog', id)
  mergeDisassembleInfo.type = 'disassemble'
  mergeDisassembleInfo.show = true
  mergeDisassembleInfo.resourceIds = [id]
  mergeDisassembleInfo.resourceName = name || ''
  mergeDisassembleInfo.duration = duration
  mergeDisassembleInfo.resultInfo = {}
}

const select1 = '批量去标'
const select2 = '批量打标'
const select3 = '批量删除'
const select4 = '移动到文件夹'
const select5 = '批量下载'

// const handleCommand = command => {
//   if (command === '1') {
//     optionChange(1)
//   } else if (command === '2') {
//     optionChange(2)
//   }
// }
const handleCommandAddTag = command => {
  if (command === '1') {
    optionChange(3)
  } else if (command === '2') {
    optionChange(4)
  } else if (command === '3') {
    optionChange(1)
  } else if (command === '4') {
    optionChange(2)
  }
}
const handleCommandDelete = command => {
  if (command === '1') {
    optionChange(5)
  } else if (command === '2') {
    optionChange(6)
  }
}
const handleCommandRemove = command => {
  if (command === '1') {
    optionChange(7)
  } else if (command === '2') {
    optionChange(8)
  }
}
const handleCommandDown = command => {
  if (command === '1') {
    console.log('下载选择')
    optionChange(9)
  } else if (command === '2') {
    console.log('xiazaisuoyou')
    optionChange(10)
  }
}
const filesRef = ref(null)
const saveLoading = ref(false)
// 更新树
function fileChange() {
  showUploadMask.uploadAddFile = true
}
// 获取到的文件夹信息
function changeFileFun(e) {
  console.log('获取到的文件夹信息', e)
  // showUploadMask.saveFileId = e.id
  showUploadMask.saveFileInfo = e
}
const saveFileUpload = throttle(function () {
  saveLoading.value = true
  console.log(saveLoading.value, 'saveLoading.value')
  const uploadBelongFiles = [showUploadMask.saveFileInfo?.id || '0']
  const params = reactive({
    batchNumber: batchNumAbout.value.batchNumber,
    brandId: JSON.parse(localStorage.getItem('brandInfo')).brandId,
    userId: JSON.parse(localStorage.getItem('userInfo')).userId,
    tags: (choseLabelIds.value || []).concat(uploadBelongFiles)
  })
  // 判断文件列表是否为空
  if (successFileList.value.length === 0) {
    saveLoading.value = false
    message.warning('未上传原料')
    return
  }
  fileOk(params)
    .then(res => {
      console.log(res, 'fileOk res')
      if (res.code === 0) {
        saveLoading.value = false
        showUploadMask.isShow = false
        // 如果更新了文件夹树，那关闭弹窗时就刷新
        if (showUploadMask.uploadAddFile) {
          filesRef.value?.refreshFun()
        }
        fileLoading.value = false
        message.success('原料批量上传成功')
        // 重新获取视频列表
        successFileList.value = []
        querySearch()
      } else {
        saveLoading.value = false
        fileLoading.value = false
      }
    })
    .catch(() => {
      saveLoading.value = false
      fileLoading.value = false
    })
})

// 选择的标签ids
const choseLabelIds = ref([])
function choseOptions(val) {
  choseLabelIds.value = val
  // console.log(choseLabelIds.value, '触发choseLabelIds.value ')
}
// 获取上传批次号，每次打开弹窗都不同
const batchNumAbout = reactive({ batchNumber: '' })
function fetBatchNumInit() {
  getBatchNum({ batchNumber: '' }).then(res => {
    batchNumAbout.value = res.data
  })
}

// 显示批量上传
const showUploadMask = reactive({
  isShow: false,
  type: '',
  title: '',
  uploadAddFile: false, // 是否新增了文件夹，是的话弹窗关闭时要刷新整个树
  saveFileId: null, // 上传选择的文件夹ID
  saveFileInfo: null, // 上传选择的文件夹信息
  validAudio: false, // 音频的许可是否勾选
  hasAudio: false // 上传的列表里是否有音频
})

function clickShow(type, title) {
  choseLabelIds.value = []
  showUploadMask.validAudio = false
  showUploadMask.hasAudio = false
  showUploadMask.title = title
  showUploadMask.isShow = true
  showUploadMask.type = type
  showUploadMask.uploadAddFile = false
  showUploadMask.saveFileId = null
  showUploadMask.saveFileInfo =
    type === 'upload'
      ? {
          id: chooseFileId.value
        }
      : null
  batchAbout.type = title
  batchAbout.dataList = batchOperationArr.value
  // if (title === '批量去标') {
  //   batchAbout.noBatchDelete = false
  // }
  if (showUploadMask.isShow) {
    // 每次打开都重新获取上传批次号
    fetBatchNumInit()
  }
  if (type === 'upload') {
    //  防止上传中关闭弹窗，所以打开弹窗的时候清零
    mutipImg = 0
  }
}

const isBatch = throttle(function () {
  // 进入批量操作的时候，需要获取200条数据，退出的时候获取50条
  // false 进入
  const sourceIndex = searchComponents.value.findIndex(x => x.filed === 'sources')

  if (!showBatch.value) {
    tableForm.loading = true
    if (sourceIndex > -1) {
      const sourceList = searchComponents.value[sourceIndex]?.selects.map(x => x.value)
      const sourceList2 = sourceList.filter(x => x !== 6)
      searchComponents.value[sourceIndex].val = sourceList2
    }

    tableForm.page = {
      index: 1,
      size: 200,
      total: 0
    }
    pageScroll.value?.scrollTo(0, 0)
    getList().then(() => {
      init()
    })
  } else {
    //  不要获取了直接
    tableForm.loading = true
    if (sourceIndex > -1) {
      searchComponents.value[sourceIndex].val = []
    }
    tableForm.page = {
      index: 1,
      size: 50,
      total: 0
    }
    pageScroll.value?.scrollTo(0, 0)
    getList().then(() => {
      init()
    })
  }
  // 取消选择
  batchOperationArr.value.forEach(item => {
    // console.log(item, 'batchOperationArr item')
    getChoseOrNo(columns.value, item, false)
  })
  batchOperationArr.value = []
  batchAbout.dataList = batchOperationArr.value

  nextTick(() => {
    showBatch.value = !showBatch.value
  })
}, 500)
// 批量操作选择
const batchOperationArr = ref([])
const batchAbout = reactive({
  // noBatchDelete: true, // 是否允许新增
  dataList: [], // 选择数据
  type: '' // 哪个批量
}) // 批量操作同步到子组件
// 获取已选择
function clickBatch(item, e) {
  e.stopPropagation()
  // 点击一次push两次delete
  if (batchOperationArr.value.indexOf(item) !== -1) {
    getChoseOrNo(columns.value, item, false)
    batchOperationArr.value.splice(batchOperationArr.value.indexOf(item), 1) // 取消
  } else {
    getChoseOrNo(columns.value, item, true)
    batchOperationArr.value.push(item) // 选中添加到数组里
  }
  batchAbout.dataList = batchOperationArr.value
}
// 获取单个类型下的选择与取消选择
function getChoseOrNo(columns, choseItem, type) {
  ;(columns || []).forEach(column => {
    column.columnArr.forEach(subItem => {
      if (subItem.id === choseItem.id) {
        subItem.itemChose = type
      }
    })
  })
}
// 当前所在的批量操作
const batchItem = ref(-1)

function optionChange(item) {
  // 1 去标选中创意原料 2 去标搜索出的所有创意原料 3 打标选中创意原料 4 打标搜索出的所有创意原料 5 删除选中创意原料 6 删除搜索出的所有创意原料 7移动选中原料 8移动搜索出的所有原料
  batchItem.value = item
  const title =
    item === 1 || item === 2
      ? select1
      : item === 3 || item === 4
      ? select2
      : item === 5 || item === 6
      ? select3
      : item === 7 || item === 8
      ? select4
      : item === 9 || item === 10
      ? select5
      : '未知操作'
  // 如果是批量操作所有，那么就要放进数组
  if (item === 2 || item === 4 || item === 6 || item === 8 || item === 10) {
    console.log('操作所有')
    batchOperationArr.value = []
    // 所有样式已选择
    columns.value.forEach(column => {
      column.columnArr.forEach(listItem => {
        listItem.itemChose = true
      })
    })
    tableForm.listData.forEach(x => {
      batchOperationArr.value.push(x)
    })

    // batchAbout.dataList = batchOperationArr.value
  } else {
    if (batchOperationArr.value.length === 0) {
      message.warning('您未选择原料')
      return
    }
  }
  batchAbout.dataList = []
  batchAbout.dataList = batchOperationArr.value
  if (
    !(
      batchItem.value === 7 ||
      batchItem.value === 8 ||
      batchItem.value === 9 ||
      batchItem.value === 10
    )
  ) {
    clickShow('allMarking', title)
  } else if (batchItem.value === 9 || batchItem.value === 10) {
    let removeArr = []
    if (batchItem.value === 9) {
      removeArr = batchOperationArr.value
    } else {
      removeArr = tableForm.listData
    }
    console.log('ids', removeArr)
    if (removeArr.length === 0) {
      message.warning('您未选择原料')
      return
    }
    batchDownLoadFun(removeArr)
  } else {
    const ids = []
    const deleteFileIds = []
    let removeArr = []
    if (batchItem.value === 7) {
      removeArr = batchOperationArr.value
    } else {
      removeArr = tableForm.listData
    }
    if (removeArr.length === 0) {
      message.warning('您未选择原料')
      return
    }
    removeArr.forEach(item => {
      ids.push(item.id)
    })
    removeDialog.isBatchRemove = true
    removeDialog.openOrigin = ''
    removeDialog.onlyRemoveFile = false
    removeDialog.index = null
    removeDialog.itemIndex = null
    removeDialog.materialIds = ids || []
    removeDialog.deleteFileIds = deleteFileIds || []
    removeDialog.fileId = null
    removeDialog.parentId = null
    removeDialog.show = true
  }
}
// 批量下载原料
function batchDownLoadFun(removeArr) {
  // 排除文本类型，其他拿到url进行下载
  ElMessageBox.confirm(
    `已选择 ${removeArr.length} 条原料，${
      removeArr.length > 50 ? '单次下载不超过 50 条，' : ''
    }是否下载${removeArr.length > 50 ? '前 50 条原料' : '选中原料'}？`,
    '批量下载',
    {
      closeOnClickModal: false,
      confirmButtonText: '下载',
      cancelButtonText: '取消',
      type: '',
      customClass: 'xm_dialog_messageBox',
      beforeClose: (action, instance, done) => {
        if (action === 'confirm') {
          instance.confirmButtonLoading = true
          instance.confirmButtonText = '下载'
          const urlList = []
          const idList = []
          const list = removeArr.slice(0, 50)
          list.forEach(x => {
            idList.push(x.id)
            urlList.push({
              name: x.name,
              url: x.url,
              content: x.content
            })
          })
          downLoadAllFile(urlList, 'material', instance)
            .then(() => {
              ElMessage({
                type: 'success',
                message: `下载成功`
              })
              use({
                ids: idList
              })

              done()
              setTimeout(() => {
                instance.confirmButtonLoading = false
              }, 300)
            })
            .catch(() => {
              done()
              setTimeout(() => {
                instance.confirmButtonLoading = false
              }, 300)
            })
        } else {
          cancelDownFile()
          done()
        }
      }
    }
  ).then(() => {})
}

function deleteFileS(item) {
  console.log(item, 'deleteFileS item')
  deleteFile({ id: item.data[0].id }).then(res => {
    if (res.code === 0) {
      successFileList.value = successFileList.value.filter(x => x.data[0].id !== item.data[0].id)
      let hasA = false
      successFileList.value.forEach(xx => {
        if (xx.data && xx.data.length > 0) {
          if (initFiletype(xx.data[0].fileFormat) === 'radio') {
            hasA = true
          }
        }
      })
      showUploadMask.hasAudio = hasA
    }
  })
  console.log('删除后的', successFileList.value)
}

const {
  showBatch,
  init,
  columns,
  load,
  searchComponents,
  tableForm,
  getList,
  chooseTab,
  tabList,
  chooseFileId
} = pageList()

function cancelBatch() {
  choseLabelIds.value = []
  showUploadMask.isShow = false
  fileLoading.value = false
  tableForm.loading = false
}
function uploadCancelBatch() {
  // 如果更新了文件夹树，那关闭弹窗时就刷新
  if (showUploadMask.uploadAddFile) {
    filesRef.value?.refreshFun()
  }
  fileLoading.value = false
  // 清空上传成功列表
  successFileList.value = []
  cancelBatch()
  console.log('取消')
}

const saveTagLoading = ref(false)
function okBatch() {
  saveTagLoading.value = true
  if (batchItem.value === 5 || batchItem.value === 6) {
    const ids = []
    const deleteArr = ref([])
    if (batchItem.value === 5) {
      deleteArr.value = batchOperationArr.value
    } else {
      deleteArr.value = tableForm.listData
    }
    deleteArr.value.forEach(item => {
      // console.log(item, 'all delete item')
      ids.push(item.id)
    })
    batchOprD({
      isDelete: 1,
      ids
    })
  } else {
    const ids = ref([])

    const addArr = ref([])
    // 创意原料的选择
    if (batchItem.value === 3 || batchItem.value === 1) {
      addArr.value = batchOperationArr.value
    } else {
      addArr.value = tableForm.listData
    }

    addArr.value.forEach(item => {
      ids.value.push(item.id)
    })
    const params = reactive({
      ids: ids.value
    })
    if (choseLabelIds.value && choseLabelIds.value.length > 0) {
      // 打标还是去标
      if (batchItem.value === 3 || batchItem.value === 4) {
        params.addTagIds = choseLabelIds.value
      } else {
        params.deleteTagIds = choseLabelIds.value
      }
      console.log(params, '批量打标 去标 入参')
      if (batchOperationArr.value.length === 0) {
        message.warning('您未选择原料')
        saveTagLoading.value = false
        return
      }
      batchAddRemoveS(params)
    } else {
      message.warning('请先选择标签')
      saveTagLoading.value = false
    }
  }
}
function batchOver() {
  showUploadMask.isShow = false
  isBatch()
}
const pageClickId = ref(null) // 页面点击的是哪个id
const removeDialog = reactive({
  show: false
})
function closeClickIdByDialog(origin) {
  pageClickId.value = null
  if (origin === 'elementDetail') {
    if (isNotEmpty(mergeDisassembleInfo.resultInfo)) {
      if (mergeDisassembleInfo.resultInfo.result) {
        querySearch()
      }
      if (mergeDisassembleInfo.resultInfo.isAddFile) {
        filesRef.value?.refreshFun()
      }
    }
    nextTick(() => {
      mergeDisassembleInfo.resultInfo = {}
    })
  }
}
// 打开移动的弹窗 origin detailDialog 代表是详情弹窗打开的，移动成功后，需要更新详情弹窗
function showRemoveFun(item, itemIndex, index, origin) {
  // pageClickId.value = item.id
  removeDialog.isBatchRemove = false
  removeDialog.openOrigin = origin || ''
  removeDialog.onlyRemoveFile = false
  removeDialog.index = index
  removeDialog.itemIndex = itemIndex
  removeDialog.materialIds = [item.id]
  removeDialog.deleteFileIds =
    item.folderList && item.folderList.length > 0 ? [item.folderList[0].id] : []
  removeDialog.fileId = item.folderList && item.folderList.length > 0 ? item.folderList[0].id : null
  removeDialog.parentId = null
  removeDialog.show = true
}
const elementDetailDialogRef = ref()
function removeSuccessFun(id, info) {
  console.log('移动成功', id, info, removeDialog.fileId)

  if (showBatch.value) {
    batchOver()
  } else {
    // 如果当前左侧文件夹列表选中的不是根文件夹，那移动成功后就刷新列表
    if (chooseFileId.value !== '0') {
      querySearch()
    } else {
      // 否则就直接更新文件夹名称
      if (id === '0') {
        columns.value[removeDialog.index].columnArr[removeDialog.itemIndex].folderList = []
      } else {
        if (id !== removeDialog.fileId && info && info.name) {
          columns.value[removeDialog.index].columnArr[removeDialog.itemIndex].folderList = [info]
        }
      }
    }
    if (removeDialog.openOrigin === 'detailDialog') {
      // 更新详情接口
      elementDetailDialogRef.value?.init()
    }
  }
}
// 批量删除

function batchOprD(params) {
  batchOpr(params)
    .then(res => {
      if (res.code === 0) {
        // 删除成功,退出批量，重新获取列表
        ElMessage.success('删除成功！')
        batchOver()
      }
      saveTagLoading.value = false
    })
    .catch(() => {
      saveTagLoading.value = false
    })
}
// 批量打标去标
function batchAddRemoveS(params) {
  batchAddRemove(params)
    .then(res => {
      console.log(res, '批量操作')
      if (res.code === 0) {
        // 删除成功,退出批量，重新获取列表
        ElMessage.success('操作成功！')
        batchOver()
      }
      saveTagLoading.value = false
    })
    .catch(() => {
      saveTagLoading.value = false
    })
}
const addDialog = reactive({
  show: false
})

const showDialogFun = throttle(() => {
  addDialog.show = true
}, 700)

const headers = ref({
  'X-Requested-With': 'XMLHttpRequest',
  token: localStorage.getItem('token'),
  brandId: localStorage.getItem('brandInfo')
    ? JSON.parse(localStorage.getItem('brandInfo')).brandId
    : '',
  userId: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo')).userId
    : ''
})
// tab切换
function changeTab(val, event) {
  console.log(val)
  chooseTab.value = val.props.name
  const searchIndex = searchComponents.value.findIndex(x => x.filed === 'type')
  if (searchIndex > -1) {
    searchComponents.value[searchIndex].val = val.props.name === -1 ? null : val.props.name
  }
  querySearch()
  // 退出批量操作
  // 将已选择内容清空就好，不要退出批量操作
  batchOperationArr.value.forEach(item => {
    // console.log(item, 'batchOperationArr item')
    getChoseOrNo(columns.value, item, false)
  })
  batchOperationArr.value = []
  batchAbout.dataList = batchOperationArr.value
}
const changeFileLoading = ref(false) // 是否是更新文件夹触发的loading
// 更新选中的文件夹ID
function updateChooseId(e) {
  console.log('更新选中的文件夹', e)
  changeFileLoading.value = true
  chooseFileId.value = e
  querySearch()
}
const pageScroll = ref() // 滚动的区域
// 查询的回调
const querySearch = throttle(function () {
  // 退出批量操作--防止选了星麦内置，但在批量操作的页面
  showBatch.value = false
  tableForm.page.index = 1
  tableForm.loading = true
  fileLoading.value = false
  // console.log(fileLoading.value, 'fileLoading.value-909行')
  pageScroll.value?.scrollTo(0, 0)
  getList().then(() => {
    init()
    changeFileLoading.value = false
  })
}, 500)
// 重置的回调
const resetSearch = throttle(function () {
  // 重置的时候将已选择的标签全部清空
  choseLabelList.value = []
  // 退出批量操作
  showBatch.value = false
  tableForm.loading = true
  tableForm.page = {
    index: 1,
    size: 50,
    total: 0
  }
  resetTagCloud()
  pageScroll.value?.scrollTo(0, 0)
  getList().then(() => {
    init()
  })
}, 500)

const message = inject('$message')
const upload = ref()
const fileLoading = ref(false) // 图片的loading
let mutipImg = 0
let uploadNum = 0
let clickTime = ''
function handleExceed(files, fileList) {
  if (files.length > 50) {
    message.warning('单次最多选择50个原料！')
    // console.log(upload.value, 'upload.value.============')
    upload.value.clearFiles()
  }
}
const maxSizeList = {
  video: 500 * 1024 * 1024,
  audio: 20 * 1024 * 1024,
  image: 15 * 1024 * 1024
}

const videoTypeList = ref(['mp4', 'm4v', 'mov'])
const audioTypeList = ref(['mp3'])
const imageTypeList = ref(['jpg', 'png', 'gif', 'jpeg'])

function handleBeforeUpload(file, fileList) {
  // loading
  // console.log(file)
  const size = file.size
  const suffix = file.name.split('.').at(-1)
  const allType = videoTypeList.value.concat(audioTypeList.value).concat(imageTypeList.value)
  const type = videoTypeList.value.includes(suffix.toLowerCase())
    ? 'video'
    : audioTypeList.value.includes(suffix.toLowerCase())
    ? 'audio'
    : imageTypeList.value.includes(suffix.toLowerCase())
    ? 'image'
    : ''
  if (!allType.includes(suffix.toLowerCase())) {
    mutipImg = 0
    message({
      type: 'warning',
      message: `不支持${suffix}格式文件`
    })
    upload.value.clearFiles()
    tableForm.loading = false
    fileLoading.value = false
    return false
  } else if (
    (type === 'video' && size > maxSizeList[type]) ||
    (type === 'audio' && size > maxSizeList[type]) ||
    (type === 'image' && size > maxSizeList[type])
  ) {
    mutipImg = 0
    // const limitSize = maxSizeList[type] / 1024 / 1024
    message({
      type: 'warning',
      // message: `素材大小不能超过${limitSize || 0}M`，
      message: '单个图片不超过15M，单个音频不超过20M，单个视频不超过500M且单次上传不超过50个原料'
    })
    // console.log(upload.value, 'upload.value-----------创意原料大小不能超过50M')
    upload.value.clearFiles()
    tableForm.loading = false
    fileLoading.value = false
    return false
  } else {
    mutipImg++
    // tableForm.loading = true
    fileLoading.value = true
  }
}
function handleUploadSuccess(res, file) {
  // 加载列表
  console.log('成功')
  // console.log(res)
  // console.log(file)
  if (res) {
    if (res.code === 0) {
      uploadNum++
      if (uploadNum >= mutipImg) {
        mutipImg = 0
        uploadNum = 0
        upload.value.clearFiles()
        message.success('原料添加成功')
        fileLoading.value = false
        // querySearch()
      }
    } else {
      mutipImg = 0
      uploadNum = 0
      message.warning('原料添加失败')
      tableForm.loading = false
      fileLoading.value = false
    }
  }
}

function handleUploadError() {
  mutipImg = 0
  uploadNum = 0
  // message.warning('创意原料上传失败')
  // 关闭loading
  tableForm.loading = false
  fileLoading.value = false
  upload.value.clearFiles()
}

function handleUpload() {
  // 最近一次上传的表示
  clickTime = new Date().getTime() + ''
}
// 生成GUID 唯一值
function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    .replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
    .replace(/-/g, '')
}

async function putObject(data, file) {
  try {
    const client = new OSS({
      // yourRegion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
      region: data.region,
      secure: true, //* 这句话很重要！！！！！！！！！
      endpoint: data.endPoint, // 这句话更重要,不设置为报错。STS接入地址，例如sts.cn-hangzhou.aliyuncs.com。
      // 从STS服务获取的临时访问密钥（AccessKey ID和AccessKey Secret）。
      accessKeyId: data.stsData.credentials.accessKeyId,
      accessKeySecret: data.stsData.credentials.accessKeySecret,
      // 从STS服务获取的安全令牌（SecurityToken）。
      stsToken: data.stsData.credentials.securityToken,
      // refreshSTSToken: async () => {
      //   console.log('过期')
      //   // 向您搭建的STS服务获取临时访问凭证。
      //   const info = await fetch('your_sts_server')
      //   return {
      //     accessKeyId: info.accessKeyId,
      //     accessKeySecret: info.accessKeySecret,
      //     stsToken: info.stsToken
      //   }
      // },
      // // 刷新临时访问凭证的时间间隔，单位为毫秒。
      refreshSTSTokenInterval: 300000,
      timeout: 600000,
      // 填写Bucket名称。
      bucket: data.bucketName
    })
    const point = file.name.lastIndexOf('.')
    // const fileName = file.name.substr(0, point)
    const name = 'xm/file/' + guid() + '_' + clickTime + file.name.substr(point)
    return await client.put(name, file)
  } catch (e) {
    console.log(e)
  }
}
// 本次上传成功的返回
async function handleRequest(option) {
  const suffix = option.file.name.split('.').at(-1)
  const type = videoTypeList.value.includes(suffix.toLowerCase())
    ? 'video'
    : audioTypeList.value.includes(suffix.toLowerCase())
    ? 'audio'
    : imageTypeList.value.includes(suffix.toLowerCase())
    ? 'image'
    : ''

  if (
    (type === 'video' && option.file.size < maxSizeList[type]) ||
    (type === 'audio' && option.file.size < maxSizeList[type]) ||
    (type === 'image' && option.file.size < maxSizeList[type])
  ) {
    const res = await getSts()
    if (res.code === 0) {
      putObject(res.data, option.file).then(resPut => {
        if (resPut) {
          // console.log('handleRequest-resPut', resPut)
          const point = option.file.name.lastIndexOf('.')
          const fileName = option.file.name.substr(0, point)
          // 获取这个文件是不是最近一次上传的，如果不是就不掉接口
          const namePoit = resPut.name.lastIndexOf('_')
          const namePonita = resPut.name.substr(namePoit + 1)
          const namePonitab = namePonita.split('.')
          if (fileLoading.value && namePonitab[0] === clickTime) {
            const uploadForm = {
              // fileFormat: option.file.type,
              // fileKey: resPut.name,
              batchNumber: batchNumAbout.value.batchNumber,
              url: decodeURIComponent(resPut.url),
              name: fileName,
              size: option.file.size
            }

            // getFileInfo(option.file)
            //   .then(resFile => {
            //     console.log('resFile', resFile)
            //     if (resFile.type !== 'none') {
            //       switch (resFile.type) {
            //         case 'video':
            //           uploadForm.wight = resFile.width
            //           uploadForm.height = resFile.height
            //           uploadForm.duration = resFile.duration ? parseInt(resFile.duration * 1000) : 0
            //           break
            //         case 'audio':
            //           uploadForm.duration = resFile.duration ? parseInt(resFile.duration * 1000) : 0
            //           break
            //         case 'image':
            //           uploadForm.wight = resFile.width
            //           uploadForm.height = resFile.height
            //           break
            //       }
            //       uploadFile(uploadForm, option)
            //     } else {
            //       uploadFile(uploadForm, option)
            //     }
            //   })
            //   .catch(() => {
            //     uploadFile(uploadForm, option)
            //   })

            uploadFile(uploadForm, option)
          }
        } else {
          option.onError()
        }
      })
    }
  }
}

// 上传成功列表
const successFileList = ref([])
// 上传文件给后端
async function uploadFile(uploadForm, option) {
  const arr = []
  arr.push(uploadForm)
  await batchUpload(arr)
    .then(resUpload => {
      console.log(resUpload, '入存入临时表成功返回，resUpload==========')
      resUpload.name = resUpload.data[0].name
      resUpload.fileCoverKey = resUpload.data[0].fileCoverKey
        ? resUpload.data[0].fileCoverKey
        : resUpload.data[0].url
      successFileList.value.push(resUpload)
      if (!showUploadMask.hasAudio && initFiletype(resUpload.data[0].fileFormat) === 'radio') {
        showUploadMask.hasAudio = true
      }
      option.onSuccess(resUpload, option.file)
    })
    .catch(() => {
      option.onError()
    })
}
function updateList() {
  querySearch()
}
const xmSearchRef = ref()
const listWidth = ref()
const contentHeight = ref(80) // 178
function getWidth() {
  contentHeight.value = getCHeight() - 10 - 16 - (xmSearchRef.value?.offsetHeight || 80)
  listWidth.value = getCWidth() - 264 - 32 - 48 - 7
  console.log('cccccheight', contentHeight.value, xmSearchRef.value?.offsetHeight)
}
onMounted(() => {
  getWidth()
  window.onresize = () => {
    init()
    getWidth()
  }
})

// 筛选项折叠/展开
function updateShrink() {
  nextTick(() => {
    getWidth()
  })
}

const elementDialog = reactive({
  show: false
})
function toDetail(e, itemIndex, index) {
  elementDialog.id = e.id
  elementDialog.source = e.source
  elementDialog.index = index
  elementDialog.itemIndex = itemIndex
  elementDialog.info = e
  elementDialog.show = true
}
onUnmounted(() => {
  window.onresize = null
})

// 获取标签词云的信息
const tagCloudList = ref([])
const currentTagCloud = ref({})
const getTagCloudList = () => {
  getTags({
    orderSetting: 'ASC:gmt_create',
    tagType: 1,
    pageNo: 1,
    pageSize: 30
  }).then(res => {
    if (res.code === 0) {
      tagCloudList.value = res.data.records || []
    }
  })
}
// 词云查询
const tagCloudSearch = throttle(item => {
  const oldLabel = JSON.parse(JSON.stringify(currentTagCloud.value))
  const index = choseLabelList.value.findIndex(i => item.id === i.id)
  addTagDialog.type = 15
  if (currentTagCloud.value.id === item.id) {
    // 多次选中同一个
    currentTagCloud.value = {}
    choseLabelList.value.splice(index, 1)
    updateTag(choseLabelList.value)
  } else {
    // 与以前选中的不同
    // 如果切走前的标签已经在标签列表里，需要把数据删掉
    const index2 = choseLabelList.value.findIndex(i => i.id === oldLabel.id)
    if (index2 > -1) {
      choseLabelList.value.splice(index2, 1)
    }
    if (index === -1) {
      choseLabelList.value = choseLabelList.value.concat([item])
      //  如果没有
      updateTag(choseLabelList.value)
    } else {
      choseLabelList.value[index] = item
      updateTag(choseLabelList.value)
    }
    currentTagCloud.value = item
  }
  querySearch()
}, 500)
const resetTagCloud = () => {
  currentTagCloud.value = {}
}
onMounted(() => {
  getTagCloudList()
  resetSearch()
})
</script>

<style lang="scss" scoped>
.material_library {
  .item_label_box {
    height: 32px;
  }
  :deep(.item_label) {
    flex-basis: auto;
    width: auto;
    margin-right: 14px;
    text-align: right;
  }
}
.bgk {
  background: #364fcd;
  overflow: hidden;
  border-radius: 4px;
}
.library_page {
  margin-top: 16px;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  .library_left {
    width: 248px;
    height: 100%;
    background: #ffffff;
    border-radius: 4px;
    margin-right: 16px;
    :deep(.content_content_box) {
      padding-right: 0;
    }
    :deep(.one_left .file_title) {
      width: 100% !important;
    }
  }
}
.manage_table {
  width: calc(100% - 264px);
  height: 100%;
  border-radius: 4px;
  padding: 0px 24px 20px;
  background: #fff;
  position: relative;
  :deep(.el-tabs__item.is-active) {
    color: #303133;
    font-weight: 600;
  }
  :deep(.el-tabs__header) {
    padding: 0 !important;
  }
  .batch-operation {
    position: absolute;
    top: 15px;
    right: 112px;
    display: flex;
    > div {
      height: 24px;
      line-height: 24px;
      margin-right: 16px;
    }
  }
  .action_btn {
    position: absolute;
    top: 15px;
    right: 0;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    .el-button + .el-button {
      margin-left: 16px;
    }
    .right_choice {
      cursor: pointer;
      width: 78px;
      height: 32px;
      overflow: hidden;
      display: flex;
      background: #f6f7f8;

      .table_choice {
        padding: 8px 11px;
        img {
          width: 16px;
          height: 16px;
        }
      }
    }
  }
  .tab_box {
    background: #fff;
    .tab_label {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      img {
        display: flex;
        width: 14px;
        height: 14px;
      }
    }
  }
}
.add_item .item_box {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
:deep(.add_item .el-input.el-input--default) {
  width: 127px;
}
:deep(.add_item .el-input__inner) {
  border: 0;
  padding: 0 31px 0 11px;
  text-align: left;
}
// :deep(.el-input-number__increase) {
//   display: none !important;
//   width: 0 !important;
// }
// :deep(.el-input-number__decrease, ) {
//   display: none !important;
//   width: 0 !important;
// }
// :deep(.el-input-number) {
//   width: auto !important;
// }
.page_box {
  margin: 0 24px;
  display: flex;
  justify-content: flex-end;
}
.tag_container {
  margin-top: 20px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  flex-wrap: wrap;
  height: 40px;
  overflow: hidden;
  padding-bottom: 6px;
  //justify-content: ;
  //margin-bottom: 30px;
  .tag_item {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 3px 8px;
    height: 24px;
    line-height: 24px;
    border: 1px solid #dcdee0;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 400;
    color: #606266;
    margin-bottom: 20px;
    margin-right: 12px;
    &:hover {
      background-color: #f6f8fa;
    }
  }
  .tag_item_active {
    border: 1px solid $theme_color;
    background-color: $theme_color;
    color: #ffffff;
    &:hover {
      background-color: $theme_color;
    }
  }
}
.page_scroll {
  overflow-y: auto;
  width: 100%;
  height: calc(100% - 128px);
  overflow-x: hidden;
}
.container {
  margin: 0 auto;
  // padding-bottom: 20px;
  display: flex;
  justify-content: flex-start;
  transition: all 0.2s ease-in-out;
}
div {
  box-sizing: border-box;
}
.item_xm {
  position: absolute;
  left: 0;
  top: 0;
  width: 52px;
  height: 52px;
  object-fit: contain;
  transform: rotate(270deg);
}
.item {
  cursor: pointer;
  width: 220px;
  color: #000;
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.5s ease-in-out;
  margin: 0 14px 14px 0;
  > div {
    width: 100%;
    height: 100%;
    background: #e6e8ee;
    border-radius: 4px;
  }
  .one_pic,
  .one_video {
    position: relative;
    .item_content {
      position: absolute;
      left: 0;
      top: 0;
    }
    .item_box {
      padding-left: unset;
      align-items: center;
    }
    .item_title {
      opacity: 0;
      padding: 10px 0px 0px 12px !important;
      transition: all 0.2s ease-in-out;
      // background: linear-gradient(180deg, rgba(0, 0, 0, 0.36) 0%, rgba(0, 0, 0, 0) 100%);
      padding-bottom: 10px !important;
      border-radius: 4px 4px 0px 0px !important;
      width: calc(100% - 52px) !important;
    }
  }
  .one_pic:hover,
  .one_video:hover {
    .file_tagbox {
      opacity: 1;
      display: flex;
    }
    .item_title {
      opacity: 1;
    }
    .item_box1 {
      padding-bottom: 0;
      border-radius: 4px 4px 0px 0px !important;
      background: linear-gradient(180deg, rgba(0, 0, 0, 0.36) 0%, rgba(0, 0, 0, 0) 100%);
    }
  }
  .one_item {
    .item_cover {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 4px;
      display: flex;
      overflow-clip-margin: border-box;
      -webkit-overflow-clip-margin: border-box;
    }
    .item_content {
      border-radius: 4px;
      overflow: hidden;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-start;
      .item_title {
        width: 70%;
        padding: 10px 12px 0;
        font-size: 14px;
        font-weight: 400;
        color: #ffffff;
        line-height: 20px;
      }
    }
  }
  .item_box {
    width: 100%;
    padding: 0 12px 12px 12px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
    .item_label {
      width: 100%;
      margin-right: 0px;
      flex-wrap: wrap;
      max-height: 20px;
      padding: 0 0 0 12px;
      overflow: hidden;
      > div {
        padding: 0px 6px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 2px;
        min-height: 20px;
        line-height: 20px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #fff;
        font-size: 12px;
        // margin-top: 4px;
        margin-right: 8px;
      }
    }
    .item_status {
      background: rgba(51, 51, 51, 0.2);
      border-radius: 12px;
      font-size: 12px;
      font-weight: 400;
      color: #ffffff;
      height: 18px;
      padding: 0 10px;
      line-height: 18px;
    }
    .item_detail {
      opacity: 0;
      width: 0;
      height: 32px;
      cursor: pointer;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      border-radius: 100%;
      background: rgba(51, 51, 51, 0.2);
      img {
        width: 16px;
        height: 16px;
        object-fit: contain;
      }
    }
  }
  .one_audio {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: flex-start;
    flex-direction: column;
    padding: 12px;
    position: relative;
    .one_audio_box {
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-start;
    }
    .item_box {
      padding: unset;
    }
    .one_audio_top {
      width: 100%;
      display: flex;
      justify-content: flex-start;
      .item_title {
        width: 100%;
        font-size: 14px;
        font-weight: 400;
        color: #333333 !important;
        line-height: 20px;
      }
      .item_status {
        background: rgba(51, 51, 51, 0.2);
        border-radius: 12px;
        font-size: 12px;
        font-weight: 400;
        color: #ffffff;
        height: 18px;
        // padding: 0 10px;
        line-height: 18px;
        width: 50px;
        text-align: center;
        margin-top: 16px;
      }
    }
    .audio_img {
      width: 60px;
      height: 60px;
      border-radius: 4px;
      margin-right: 8px;
      display: flex;
      object-fit: cover;
    }
    .audio_right {
      width: calc(100% - 68px);
      // display: flex;
      // flex-direction: column;
      // justify-content: space-between;
      // align-items: flex-start;
    }
    .audio_content {
      width: calc(100% - 79px) !important;
      height: 74px !important;
      .item_box,
      .item_title {
        padding: 0;
        color: #333333 !important;
      }
    }
  }
  .one_text {
    padding: 12px;
    position: relative;
    .text_content {
      width: 100%;
      padding: 8px;
      height: calc(100% - 116px);
      background: #d2d5de;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 400;
      color: #303133;
      line-height: 17px;
      div {
        white-space: pre-wrap;
        word-break: break-all;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        // -webkit-line-clamp: 2;
        overflow: hidden;
        height: 100%;
      }
    }
    .text_img {
      width: 100%;
      // width: 188px;
      // height: 135px;
      display: flex;
    }
    .item_title {
      margin: 5px 0;
      font-size: 14px;
      font-weight: 400;
      color: #333333;
      line-height: 20px;
      height: 20px;
    }
    .item_box,
    .item_title {
      padding: 0;
      color: #333333 !important;
    }
  }
}
.one_item:hover,
.one_text:hover {
  .file_tagbox {
    opacity: 1;
    display: flex;
  }
  .item_detail {
    opacity: 1 !important;
    width: 32px !important;
    flex-shrink: 0 !important;
  }
  .item_label {
    width: calc(100% - 32px);
  }
}
.column:last-child .item {
  margin-right: 0;
}
.xm_item {
  .item_label {
    width: 100% !important;
  }
}
.no_echart {
  background: #fff;
  width: 100%;
  height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  font-weight: 400;
  color: #909399;
  line-height: 20px;
  img {
    width: 70px;
    height: 70px;
    object-fit: cover;
    margin-bottom: 7px;
  }
}
.search_warp {
  :deep(.el-input-number__increase) {
    display: none !important;
    width: 0 !important;
  }
  :deep(.el-input-number__decrease, ) {
    display: none !important;
    width: 0 !important;
  }
  :deep(.el-input-number) {
    width: auto !important;
  }
}

.line-hidden2 {
  white-space: pre-wrap;
  word-break: break-all;
}
.loading_library {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 15px;
  margin-bottom: 15px;
  font-size: 12px;
  color: #909399;
  img {
    height: 25px;
    margin-right: 4px;
  }
}
// 上传时的mask
.upload-mask {
  min-width: 1366px;
  width: 100%;
  height: 100%;
  z-index: 2001;
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  .upload_mark {
    width: 100px;
    padding-right: 8px;
    text-align: right;
    margin: 0 !important;
    line-height: 32px;
  }

  .upload-mask-con {
    width: 60%;
    max-width: 820px;
    background: #fff;
    border-radius: 4px;
    position: absolute;
    // top: 54%;
    top: 15vh;
    left: 50%;
    // transform: translate(-50%, -50%);
    transform: translate(-50%, 0);
    .top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 53px;
      box-sizing: border-box;
      border-bottom: 1px solid #dcdee0;
      padding: 0 16px;
      font-size: 16px;
      font-weight: 600;
      color: #323233;
    }

    .con {
      width: 100%;
      height: calc(100% - 53px);
      padding: 16px;

      .all-delete-tips {
        font-size: 14px;
        font-weight: 400;
        color: #323233;
      }
      .title {
        font-size: 14px;
        font-weight: 400;
        color: #333333;
        margin-top: 6px;
      }

      .btn {
        margin-top: 4px;
      }
      .little-tips {
        margin-top: 20px;
        line-height: 20px;
      }
      .files-list {
        margin-top: 16px;
        height: 164px;
        box-sizing: border-box;
        background-color: #f6f8fa;
        padding: 16px;
        overflow-y: auto;
        .file-item:first-child {
          margin-top: unset;
        }
        .file-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
          .file-item-l,
          .file-item-r {
            display: flex;
            align-items: center;
          }
          .file-item-l {
            > img {
              width: 14px;
              height: 14px;
              margin-right: 8px;
            }
            .name {
              max-width: 600px;
              height: 20px;
              font-size: 14px;
              font-weight: 400;
              color: #303133;
              line-height: 20px;
              white-space: nowrap; //不换行
              overflow: hidden; //超出隐藏
              text-overflow: ellipsis; //变成...
            }
          }
          .file-item-r {
            > img {
              width: 16px;
              height: 16px;
              margin-right: 20px;
            }
            .delete {
              font-size: 14px;
              font-weight: 400;
              color: #364fcd;
              cursor: pointer;
            }
          }
        }
      }
      .batch-label {
        margin-top: 20px;
        // min-height: 84px;
        display: flex;
        padding-bottom: 20px;
        .batch-tips {
          font-size: 14px;
          margin-top: 26px;
          font-weight: 400;
          color: #909399;
        }
        .title {
          margin-top: 10px;
        }
      }
      .last-num {
        // margin-top: 20px;
        // height: 64px;
        display: flex;
        .title {
          margin-top: 10px;
        }

        .num-r-top {
          height: 32px;
          line-height: 32px;
          background: #f6f8fa;
          border-radius: 2px;
          border: 1px solid #dcdee0;
          text-indent: 12px;
          // user-select: none; //禁止用户选中文本
          // //user-select有2个值（none表示不能选中文本，text表示可以选择文本）
          // -moz-user-select: none; /*兼容火狐*/
          // -webkit-user-select: none; /*webkit浏览器*/
          // -ms-user-select: none; /*IE10*/
          // -khtml-user-select: none; /*早期浏览器*/
        }
        .num-r-bottom {
          font-size: 14px;
          margin-top: 12px;
          font-weight: 400;
          color: #909399;
        }
      }
      .bottom-btn {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        margin-top: 32px;
      }

      .cancel-btn {
        border-radius: 2px;
        border: 1px solid #dcdee0;
        background-color: #fff;
        color: #000;
      }
    }

    .little-tips {
      height: 40px;
      font-size: 14px;
      font-weight: 400;
      color: #909399;
    }
  }
}
.no_menu_upload_mask {
  min-width: 1200px !important;
}
.chose-mask {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  opacity: 0;
  border-radius: 4px;
  .select-state {
    width: 14px;
    height: 14px;
    background-color: #fff;
    margin: 8px 0 0 8px;
    line-height: 14px;
    text-align: center;
    transition: all 0.2s;
    cursor: pointer;
    padding-top: 2px;
    display: flex;
    flex-direction: row;
    justify-content: center;
  }
  .state-chose {
    width: 4px;
    height: 8px;
    border-color: #fff;
    border-style: solid;
    border-width: 0 1px 1px 0;
    transform: rotate(45deg);
  }
  .selected-state {
    background: #364fcd !important;
  }
}
.batch-operation {
  white-space: nowrap;
}
.show-chose-mask {
  opacity: 1;
  transition: all 0.3s ease;
}
.no-padding {
  padding: unset !important;
}
.el-select {
  width: 134px;
}
.el-dropdown {
  .el-button {
    // background: #ffffff;
    // color: #606266;
  }
  .el-icon {
    color: #c0c4cc;
  }
}
.new-bottom-btn {
  margin-top: 32px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  .bottom-btn-left {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    height: 32px;
    :deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
      color: #909399;
    }
    :deep(.el-checkbox.el-checkbox--large .el-checkbox__label) {
      color: #909399;
    }
  }
  .bottom-btn-right {
    display: flex;
    flex-direction: row;
    justify-content: flex-right;
    align-items: center;
  }
}
:deep(.xm_search .el-select .el-select__tags > span) {
  margin-left: 6px !important;
}
:deep(.xm_search .search_item .el-select__tags) {
  padding-left: 0 !important;
}
.item_parent_box {
  width: 100%;
  .file_tagbox {
    opacity: 0;
    display: none;
  }
  :deep(.file_tag) {
    margin-left: 12px;
    max-width: calc(100% - 24px);
    margin-bottom: 6px;
  }
  // .file_tagbox + .item_box {
  //   margin-top: 12px;
  // }
}
.one_text,
.one_audio {
  .item_parent_box {
    :deep(.file_tag) {
      margin-left: 0;
      max-width: 100%;
    }
  }
}
.xm_item_click {
  .file_tagbox {
    opacity: 1;
    display: flex;
  }
  .one_pic,
  .one_video {
    .item_title {
      opacity: 1;
    }
    .item_box1 {
      padding-bottom: 0;
      border-radius: 4px 4px 0px 0px !important;
      background: linear-gradient(180deg, rgba(0, 0, 0, 0.36) 0%, rgba(0, 0, 0, 0) 100%);
    }
  }
  .one_item,
  .one_text {
    .item_detail {
      opacity: 1 !important;
      width: 32px !important;
      flex-shrink: 0 !important;
    }
    .item_label {
      width: calc(100% - 32px);
    }
  }
}
:deep(.xm_dropDown),
:deep(.el-dropdown) {
  .el-button {
    padding: 8px 10px;
  }
}
</style>
