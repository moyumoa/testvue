<template>
  <div style="height: 100%">
    <!-- <down-load-client v-if="systemVersion != 3"></down-load-client> -->
    <div class="template_edit" v-loading="$data.loading">
      <!-- 模板概览   -->
      <div class="module_overview">
        <!-- <div class="module_overview_title">
        模板概览
        <div
          class="save_template save_template_no"
          title="以当前模板为基础创建一个新的剪辑工程"
          @click="copyMould"
        >
          复制创作
        </div>
      </div> -->
        <div class="module_overview_container">
          <div class="module_info">
            <div class="module_info_img">
              <img
                v-if="moduleInfo.coverUrl"
                :src="moduleInfo.coverUrl"
                alt=""
                class="module_info_img"
              />
              <img
                v-if="moduleInfo.tag == 2"
                class="digital_icon"
                src="https://tagvv-1256030678.file.myqcloud.com/20230309l1jh0.png"
                alt=""
              />
              <div
                class="module_info_mask"
                v-if="moduleInfo.coverUrl"
                @click="
                  previewFun(
                    moduleInfo.materialPath,
                    'video',
                    '查看视频',
                    moduleInfo.coverUrl || null
                  )
                "
              >
                <img
                  class="play_img"
                  src="https://tagvv-1256030678.file.myqcloud.com/20230304m2yx9.png"
                  alt=""
                />
              </div>
            </div>

            <div class="module_info_warp">
              <div class="one_module_info_box">
                <div class="module_info_title" v-if="!showEditName">
                  <div class="module_info_text">
                    {{ moduleInfo.name }}
                  </div>
                  <!-- 只有企业模板才允许在外面修改模板名字。其余云模板都是在弹窗里修改 -->
                  <img
                    v-if="$data.origin == 'creative_mould'"
                    @click="switchEdit"
                    src="https://tagvv-1256030678.file.myqcloud.com/202303049vra6.png"
                    alt=""
                  />
                </div>
                <div class="module_info_title" v-else>
                  <el-input maxlength="20" v-model="newName" @blur="editNameBlur(item)"></el-input>
                </div>
                <div class="module_info_btn">
                  <!-- 云模板管理：显示开放开关 和 管理模板入口 -->
                  <template v-if="$data.origin == 'cloud_template_management'">
                    <el-switch
                      class="public_switch"
                      v-model="moduleInfo.isCloudOpen"
                      :before-change="beoreCloudOpenChange.bind(this, moduleInfo)"
                      :width="72"
                      :active-value="1"
                      :inactive-value="0"
                      :active-text="$data.origin == 'creative_mould' ? '已开放' : '已公开'"
                      inactive-text="已隐藏"
                    ></el-switch>
                    <div class="link_text" @click="showManagementFun" style="margin-left: 16px">
                      管理模板
                      <img
                        src="https://tagvv-1256030678.file.myqcloud.com/20230918mejhj.png"
                        alt
                        class="r_icon"
                      />
                    </div>
                  </template>
                  <!-- 企业模板：显示公开开关 -->
                  <template v-if="$data.origin == 'creative_mould'">
                    <el-switch
                      v-if="
                        $data.origin == 'cloud_template_management' ||
                        $data.origin == 'creative_mould'
                      "
                      class="public_switch"
                      v-model="moduleInfo.isOpenTemplate"
                      :before-change="beoreOpenChange.bind(this, moduleInfo)"
                      :width="72"
                      :active-value="1"
                      :inactive-value="0"
                      :active-text="$data.origin == 'creative_mould' ? '已开放' : '已公开'"
                      inactive-text="已隐藏"
                    ></el-switch>
                    <el-tooltip class="item" effect="dark" content="" placement="right">
                      <template #content>
                        <div style="max-width: 400px">
                          开启开关后，模板及模板批量合成的视频将在小程序首页“发视频”模块内开放给员工直接跟拍发布或转发视频到平台，可在模板详情页开启
                        </div>
                      </template>
                      <img
                        src="https://tagvv-1256030678.file.myqcloud.com/20231207op3gl.png"
                        style="width: 16px; height: 16px; margin-left: 8px"
                        alt
                      />
                    </el-tooltip>
                  </template>
                  <!-- 云模板：显示下载入口 -->
                  <el-button
                    type="primary"
                    v-if="$data.origin == 'cloud_template'"
                    @click="showManagementFun"
                  >
                    保存到我的企业模板
                  </el-button>
                </div>
              </div>
              <div class="module_info_text" v-if="$data.origin == 'creative_mould'">
                分类：{{
                  moduleInfo.categoryNames && moduleInfo.categoryNames.length > 0
                    ? moduleInfo.categoryNames.join(',')
                    : '--'
                }}
              </div>
              <div class="module_info_text">
                时长：{{ parseInt((moduleInfo.duration || 0) / 1000 / 1000) + 's' }}
              </div>
              <div class="module_info_text">制作者：{{ moduleInfo.createUserName }}</div>
              <!-- 云模板管理 增加模板类型 -->
              <!-- <div class="module_info_text" v-if="$data.origin == 'cloud_template_management'">
                类型：图集模板/视频模板
              </div> -->
            </div>
          </div>
          <div class="modult_right">
            <!-- 智能降重策略 只有企业模板有-->
            <div
              class="right_setting"
              v-if="$data.strategyList.length > 0 && $data.origin == 'creative_mould'"
            >
              <div class="one_setting" v-for="(item, index) in $data.strategyList" :key="index">
                <div class="top_l">
                  {{ item.name }}
                  <template v-if="!item.show">
                    <el-switch
                      v-model="item.switchStatus"
                      inline-prompt
                      style="margin-left: 8px"
                      :width="44"
                      :before-change="beforeUpdateStrategyStatus.bind(this, item)"
                      :loading="item.loading"
                    ></el-switch>
                  </template>
                  <img
                    src="https://tagvv-1256030678.file.myqcloud.com/202311078my65.png"
                    alt=""
                    v-if="item.show"
                    class="new_img"
                  />
                </div>
                <div class="tips" v-if="item.strategyType == 2">{{ item.label }}</div>
                <div class="ai_btns" v-if="item.strategyType == 2">
                  <div class="ai_btn_item ai_btn_item_1" @click="toNext(item.strategyType)">
                    去看看
                    <img
                      src="https://tagvv-1256030678.file.myqcloud.com/20240228zw8vb.png"
                      alt
                      class="r_icon"
                    />
                  </div>
                  <div class="ai_btn_item ai_btn_item_2" @click="toAiTitle('create_title')">
                    <div class="text">AI一键生成抖音、小红书营销标题文案</div>
                    <img
                      src="https://tagvv-1256030678.file.myqcloud.com/20240228zw8vb.png"
                      alt
                      class="r_icon"
                    />
                  </div>
                </div>
                <div class="top_r" v-if="item.strategyType == 1" @click="toNext(item.strategyType)">
                  自定义设置
                  <img
                    src="https://tagvv-1256030678.file.myqcloud.com/20240228zw8vb.png"
                    alt
                    class="r_icon"
                  />
                </div>
              </div>
            </div>
          </div>
          <!-- 复制创作和重新剪辑的按钮，云模板管理和企业模板都有 -->
          <!-- <div class="right_btn" v-if="$data.origin != 'cloud_template'"> -->
          <!-- <el-button @click="copyMould" title="以当前模板为基础创建一个新的剪辑工程">
            复制创作
          </el-button> -->
          <!-- <el-button :loading="reEditLoading" @click="reEditFun">重新剪辑</el-button> -->
          <!-- </div> -->
        </div>
      </div>
      <!-- 模板分镜  -->
      <div class="scriptStructure_wrap">
        <el-affix :offset="isHideTopMenu ? 0 : 58">
          <div class="structure_head">
            <div style="display: flex">
              <span class="title">脚本结构/{{ $data.mirrorsLength }}个分镜</span>
              <div class="iconimg">
                <div class="DescriptiveImg">
                  <img src="https://tagvv-1256030678.file.myqcloud.com/20231207op3gl.png" />
                </div>
                <div class="DescriptiveText">
                  1.
                  分镜名称和分镜说明会直接展示给做模板合成任务的员工，请尽量使用简洁易懂的语言描述
                  <br />
                  2. 提词器会在跟拍模式/音频录制时展示，方便员工跟拍跟读
                </div>
              </div>
              <trackChart
                :showTimeLine="true"
                :timeLineTop="true"
                :templateConfigJson="moduleInfo.templateConfigJson"
                :duration="Math.ceil(moduleInfo.duration / 1000000)"
                @choseTrack="choseTrack"
                @hideTrackAreaFn="hideTrackAreaFn"
              />
              <!-- <div class="track_warp">
              <img
                src="https://tagvv-1256030678.file.myqcloud.com/20231107uvxsw.png"
                alt=""
                class="tr_img"
                @click="showTrackAreaFn"
              />
              <div class="track_are" ref="showTrackAreaRef" v-if="$data.showTrackArea">
                <div class="track_title">分镜轨道图</div>
                <div class="track_con">-->
              <!-- 每个轨道 -->
              <!--  <div
                    class="track_item"
                    v-for="(item, index) in $data.VideoTracks"
                    :key="index"
                    v-show="item.length > 0"
                  >-->
              <!-- 每个分镜 -->
              <!--   <div
                      :class="{ story_item: true, story_item_checked: storyItem.trackChecked }"
                      v-for="(storyItem, storyIndex) in item"
                      :key="storyIndex"
                      :style="{
                        width: storyItem.TimelineWidth + 'px',
                        left: storyItem.TimelineInPosition + 'px',
                        background: $data.trackStyle[storyItem.Type]
                          ? $data.trackStyle[storyItem.Type].backgroundColor
                          : ''
                      }"
                      @click="choseTrack($event, storyItem)"
                    >
                      <img :src="$data.trackStyle[storyItem.Type].icon" alt="" class="story_icon" />
                      {{ $data.trackStyle[storyItem.Type].text }}
                    </div>
                  </div>
                </div>
              </div>
            </div> -->
            </div>
            <div class="structure_head_r" v-if="$data.origin !== 'cloud_template'">
              <!-- 有分镜组就显示 -->
              <template v-if="isGroup">
                非替换项分镜显示
                <el-tooltip class="item" effect="dark" placement="top">
                  <template #content>
                    <div style="max-width: 290px">
                      开启后，所有分组内的非替换项分镜也会在小程序显示
                    </div>
                  </template>
                  <img
                    src="https://tagvv-1256030678.file.myqcloud.com/20231122xve4d.png"
                    style="width: 16px; height: 16px; margin: 0 8px"
                    alt
                  />
                </el-tooltip>
                <el-switch
                  :value="moduleInfo.noReplaceClipSwitch ? true : false"
                  inline-prompt
                  :width="44"
                  :style="{ marginRight: $data.batchSwitch ? '20px' : 0 }"
                  @click="updateReReplaceStatus(moduleInfo.noReplaceClipSwitch)"
                ></el-switch>
              </template>

              <template v-if="$data.batchSwitch">
                <el-button type="primary" @click="addGroup">
                  组合分镜
                  <el-tooltip class="item" effect="dark" placement="top">
                    <template #content>
                      <div style="max-width: 220px">
                        将同一个画面或内容的分镜绑定在一起，更方便员工理解和跟拍哦
                      </div>
                    </template>
                    <img
                      src="https://tagvv-1256030678.file.myqcloud.com/20231122w21lt.png"
                      style="width: 16px; height: 16px; margin-left: 4px"
                      alt
                    />
                  </el-tooltip>
                </el-button>
              </template>
              <el-switch
                :value="$data.batchSwitch"
                inline-prompt
                :width="44"
                style="margin: 0 8px 0 20px"
                @click="$data.batchSwitch = !$data.batchSwitch"
              ></el-switch>
              组合/打散
            </div>
          </div>
        </el-affix>

        <!-- v-loading="$data.loading"         :infinite-scroll-distance="50"
        :infinite-scroll-disabled="$data.finished"
        v-infinite-scroll="loadMore" -->
        <div class="list">
          <!-- 列表 -->
          <div class="list_warp">
            <div
              class="list_group"
              :class="{ list_group_no_group: sItem.isRealGroup !== 1 }"
              v-for="(sItem, sIndex) in $data.groupOrderList"
              :key="sIndex"
            >
              <!-- 分镜组信息&操作 -->
              <div class="group_info" v-if="sItem.isRealGroup == 1">
                <div class="group_l">
                  <!-- 分组名称 -->
                  <div class="group_name name_warp">
                    <template v-if="!sItem.showGroupName">
                      <p class="show_name">
                        {{ `${sIndex + 1}.${sItem.groupName ? sItem.groupName : '未命名分组'}` }}
                      </p>
                      <img
                        v-if="$data.origin !== 'cloud_template'"
                        src="https://tagvv-1256030678.file.myqcloud.com/202311080lpkk.png"
                        alt=""
                        class="change_icon"
                        @click="editNameGroup(sItem)"
                      />
                    </template>
                    <!-- 分组名称编辑 -->
                    <template v-else>
                      <p class="show_name">
                        {{ `${sIndex + 1}.` }}
                      </p>
                      <el-input
                        :readonly="$data.origin == 'cloud_template'"
                        @blur="renameGroupFn(sItem)"
                        maxlength="10"
                        resize="none"
                        v-model="sItem.groupName"
                        placeholder="请输入分组名称"
                        show-word-limit
                        :ref="setItemRef($el, sItem.id, 'groupName')"
                      ></el-input>
                    </template>
                  </div>

                  <!-- 分组说明编辑 -->
                  <div class="group_reName">
                    分组说明：
                    <div class="name_warp" v-if="!sItem.showGroupDesc">
                      <p class="show_name line-hidden1">
                        {{ sItem.groupDesc || '--' }}
                      </p>
                      <img
                        v-if="$data.origin !== 'cloud_template'"
                        src="https://tagvv-1256030678.file.myqcloud.com/202311080lpkk.png"
                        alt=""
                        class="change_icon"
                        @click="editRemarkGroup(sItem)"
                      />
                    </div>
                    <el-input
                      v-else
                      :readonly="$data.origin == 'cloud_template'"
                      @blur="renameFn(sItem)"
                      maxlength="100"
                      :rows="3"
                      resize="none"
                      v-model="sItem.groupDesc"
                      placeholder="请输入分组说明"
                      show-word-limit
                      :ref="setItemRef($el, sItem.id, 'groupDesc')"
                      class="textarea_input"
                      type="textarea"
                    ></el-input>
                  </div>
                </div>
                <div class="group_r">
                  <el-popconfirm
                    title="确认打散组合吗？"
                    @confirm="breakGroup(sItem)"
                    v-if="$data.batchSwitch"
                  >
                    <template #reference>
                      <el-button type="primary" class="diffuse_btn">打散</el-button>
                    </template>
                  </el-popconfirm>

                  <img
                    src="https://tagvv-1256030678.file.myqcloud.com/202311092qgj7.png"
                    alt=""
                    class="move_icon"
                    :class="{
                      move_icon_top_one:
                        sIndex >=
                        $data.groupOrderList.filter(x => {
                          return x.isRealGroup === 1
                        }).length -
                          1
                    }"
                    @click="moveDown(sItem, sIndex)"
                  />
                  <img
                    src="https://tagvv-1256030678.file.myqcloud.com/202311093dtcn.png"
                    alt=""
                    class="move_icon move_icon_top"
                    :class="{ move_icon_top_one: sIndex === 0 }"
                    @click="moveUp(sItem, sIndex)"
                  />
                </div>
              </div>
              <!-- 分镜 + 分组的多选 -->
              <div class="group_info_warp">
                <!-- 分组的多选 -->
                <div
                  class="chose_box"
                  :class="{ chose_box_active: sItem.checked }"
                  v-if="$data.batchSwitch && sItem.isRealGroup == 1"
                  @click="choseItem(sItem, 'group')"
                ></div>
                <!-- 分镜 -->
                <div class="list_item_warp">
                  <div
                    :class="{
                      list_item: true,
                      list_item_in_g: true,
                      list_item_trackChecked: item.trackChecked
                    }"
                    v-for="(item, index) in sItem.groupClipList"
                    :key="index"
                    :ref="setItemRefListItem($el, item.replaceId)"
                  >
                    <div class="item_l">
                      <!-- 选择框 -->
                      <div
                        class="chose_box"
                        :class="{ chose_box_active: item.checked }"
                        v-if="$data.batchSwitch && sItem.isRealGroup !== 1"
                        @click="choseItem(item)"
                      ></div>
                      <div class="l_info">
                        <div class="icon_warp">
                          <template v-if="item.mediaType === 1">
                            <img
                              class="left_cover"
                              v-if="item.coverUrl"
                              :src="item.coverUrl"
                              alt=""
                            />
                            <img
                              v-else
                              class="left_cover"
                              src="https://tagvv-1256030678.file.myqcloud.com/20230304poee2.png"
                            />
                            <img
                              @click="
                                previewFun(
                                  item.clipMediaUrl || item.aliyunMediaUrl,
                                  'video',
                                  '查看视频',
                                  item.coverUrl || null
                                )
                              "
                              class="play_img"
                              src="https://tagvv-1256030678.file.myqcloud.com/20230304m2yx9.png"
                              alt=""
                            />
                          </template>
                          <template v-if="item.mediaType === 2">
                            <!-- <img
                      @click="
                        previewFun(item.clipMediaUrl || item.aliyunMediaUrl, 'audio', '查看音频')
                      "
                      class="play_img"
                      src="https://tagvv-1256030678.file.myqcloud.com/20230304m2yx9.png"
                      alt=""
                    /> -->
                            <img
                              src="https://tagvv-1256030678.file.myqcloud.com/20231108x525v.png"
                              @click="
                                previewFun(
                                  item.clipMediaUrl || item.aliyunMediaUrl,
                                  'audio',
                                  '查看音频'
                                )
                              "
                              alt=""
                              class="audio_icon"
                            />
                          </template>
                          <template v-if="item.mediaType === 3">
                            <div class="mediaType_cont">
                              文本
                              <br />
                              内容
                            </div>
                          </template>
                          <template v-if="item.mediaType === 8">
                            <img
                              :src="
                                item.aliyunMediaUrl
                                  ? item.aliyunMediaUrl
                                  : 'https://tagvv-1256030678.file.myqcloud.com/20231108fm8hm.png'
                              "
                              alt=""
                              class="mediaType_img"
                              @click="
                                previewFun(
                                  item.clipMediaUrl || item.aliyunMediaUrl,
                                  'image',
                                  '查看图片',
                                  item.coverUrl || null
                                )
                              "
                              :style="{
                                width: item.aliyunMediaUrl ? '100%' : '32px',
                                height: item.aliyunMediaUrl ? '100%' : '32px'
                              }"
                            />
                          </template>
                          <template v-if="item.mediaType === 21"></template>
                        </div>
                        <div class="desc">
                          <div class="time">
                            {{ item.mediaType == 3 ? '字幕' : conversionTime(item.itemDuration) }}
                          </div>
                          <div class="text" :class="[`text_${item.mediaType}`]">
                            {{ showMediaType(item.mediaType, item.isBgm) }}
                          </div>
                        </div>
                      </div>
                      <div class="l_edit">
                        <div class="s_name">
                          <span class="text_no_warp">分镜名称：</span>
                          <div class="name_warp" v-if="!item.showEdit">
                            <p class="show_name line-hidden1">{{ item.name }}</p>
                            <img
                              v-if="$data.origin !== 'cloud_template'"
                              src="https://tagvv-1256030678.file.myqcloud.com/202311080lpkk.png"
                              alt=""
                              class="change_icon"
                              @click="editName(item)"
                            />
                          </div>
                          <el-input
                            v-if="item.showEdit"
                            :readonly="$data.origin == 'cloud_template'"
                            @blur="changListName(item)"
                            maxlength="30"
                            resize="none"
                            placeholder="请输入分镜名称"
                            v-model="item.name"
                            show-word-limit
                            :ref="setItemRef($el, item.creativeReplaceId, 'name')"
                          ></el-input>
                        </div>
                        <div class="s_illustrate">
                          <span class="text_no_warp">分镜说明：</span>
                          <div class="name_warp" v-if="!item.showRemark">
                            <p class="show_name line-hidden1">{{ item.remark || '--' }}</p>
                            <img
                              v-if="$data.origin !== 'cloud_template'"
                              src="https://tagvv-1256030678.file.myqcloud.com/202311080lpkk.png"
                              alt=""
                              class="change_icon"
                              @click="editRemark(item)"
                            />
                          </div>
                          <el-input
                            v-if="item.showRemark"
                            :readonly="$data.origin == 'cloud_template'"
                            @blur="modifyRelationInfoFun(item)"
                            maxlength="30"
                            resize="none"
                            v-model="item.remark"
                            placeholder="请输入分镜说明"
                            show-word-limit
                            :ref="setItemRef($el, item.creativeReplaceId, 'remark')"
                          ></el-input>
                        </div>
                      </div>
                    </div>
                    <div class="item_r">
                      <el-button
                        v-if="item.mediaType !== 3"
                        style="margin-right: 20px; background: transparent"
                        :disabled="$data.origin == 'cloud_template'"
                        @click="setRuleFun(item)"
                      >
                        规则设置
                      </el-button>
                      <span class="text_no_warp">设置为替换项</span>
                      <!-- @click="updateStrRelOvwStuFun($event, item)" -->
                      <el-switch
                        style="margin-left: 8px"
                        :disabled="item.mediaType === 21 || $data.origin == 'cloud_template'"
                        :before-change="beforeSwitchChange.bind(this, item)"
                        :model-value="item.isReplace"
                        inline-prompt
                        :width="45"
                        :active-value="1"
                        :inactive-value="0"
                      ></el-switch>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- <div class="structure_box_none" >暂无数据</div> -->
          <div v-if="$data.showList.length === 0 && false" class="structure_box_none">
            <!-- <img src="@/assets/images/content_center/no_activity.png" alt /> -->
            <!-- 暂无数据 -->
          </div>
        </div>
        <!-- 视频预览 -->
        <!-- <div v-if="$data.videoPlayVisible" @click="hiddenVideo" class="vedio_preview_wrap">
        <div
          class="vedio_preview"
          :style="$data.sourceType === 2 ? 'background:rgba(0,0,0,0)' : ''"
        >
          <video
            v-if="$data.sourceType === 1"
            class="previewVideo"
            :src="$data.materialUrl"
            controls
            autoplay
          ></video>
          <audio
            v-if="$data.sourceType === 2"
            class="previewVideo"
            :src="$data.materialUrl"
            controls
            autoplay
          ></audio>
        </div>
      </div> -->
      </div>
      <!-- 重新剪辑的按钮，云模板管理和企业模板都有 -->
      <div class="page_btn" v-if="$data.origin != 'cloud_template'">
        <el-button type="primary" :loading="reEditLoading" @click="reEditFun">剪辑模板</el-button>
      </div>
    </div>
    <!-- 复制创作的弹窗 -->
    <copyTemplateDOM v-if="$data.copyDialog.show" :copyDialog="$data.copyDialog"></copyTemplateDOM>
    <!-- 数字人的 规则设置 -->
    <digitalRuleDOM v-if="$data.digitalRuleInfo.show" :ruleDialog="$data.digitalRuleInfo" />
    <!-- 视频的 规则设置 -->
    <videoRuleDOM
      v-if="$data.videoRuleInfo.show"
      :cropTypeList="cropTypeList"
      :replaceModelList="replaceModelList"
      :ruleDialog="$data.videoRuleInfo"
      :notReplaceTip="notReplaceTip"
    ></videoRuleDOM>
    <!-- 图片的 规则设置 -->
    <imgRuleDOM
      v-if="$data.imgRuleInfo.show"
      :notReplaceTip="notReplaceTip"
      :ruleDialog="$data.imgRuleInfo"
    ></imgRuleDOM>
    <!-- 音频的 规则设置 -->
    <audioRuleDOM
      v-if="$data.audioRuleInfo.show"
      :replaceModelList="replaceModelList"
      :notReplaceTip="notReplaceTip"
      :ruleDialog="$data.audioRuleInfo"
    ></audioRuleDOM>
    <!-- 预览分镜的弹窗 -->
    <previewDialog v-if="previewInfo.show" :previewDialog="previewInfo"></previewDialog>
    <!-- 预览视频弹窗   -->
    <!-- <PreviewVideo :videoDialog="videoDialog"></PreviewVideo> -->
    <!-- 降重策略设置的弹窗 -->
    <strategyReductionDialog
      :reductionDialogData="$data.reductionDialogData"
      @updateStrategyIds="_getStrategyConfigByCreativeId"
      v-if="$data.reductionDialogData.show"
    />
    <!-- 模板管理的弹窗 -->
    <cloudTemplateDOM
      v-if="managementDialog.show"
      :managementDialog="managementDialog"
      @updateOneInfo="updateOneInfo"
    />
  </div>
</template>
<script setup>
// import downLoadClient from '@/views/sumvideo/components/downloadClient.vue'
import trackChart from '@/views/sumvideo/components/track_chart.vue'
import { sendHrefMessage } from '@/utils/OEA.js'
import cloudTemplateDOM from '../cloud_template_management/components/management_dialog.vue'
import previewDialog from '@/components/preview_dialog/preview_dialog.vue'

import audioRuleDOM from './components/template/rulesDialog_of_audio.vue'
import imgRuleDOM from './components/template/rulesDialog_of_img.vue'
import videoRuleDOM from './components/template/rulesDialog_of_video.vue'
import digitalRuleDOM from '@/views/sumvideo/creative_mould/components/template/rulesDialog_of_digital.vue'
import copyTemplateDOM from './components/template/copyTemplate_dialog.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
// import PreviewVideo from '@/components/preview_video/preview_video.vue'
import {
  getStructureDetail,
  // getStructureDetailByPage,
  updateStrRelOvwStu,
  modifyReplaceName,
  modifyRelationInfo,
  getCreativeRplaceById,
  getStrategyConfigByCreativeId,
  updateStrategyConfig,
  listGroupClip,
  bindClipGroup,
  addGroupClip,
  updateCreativeGroup,
  cancelBindClipGroup,
  updateGroupOrder,
  noReplaceClipSwitch
} from '@/api/sumvideo/creative_templateSpectroscope.js'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { isEmpty, throttle, secToMin } from '@/utils/tools.js'
import { details, modify, updateOpenTemplate, hasVideo } from '@/api/sumvideo/creative_mould.js'
import strategyReductionDialog from './components/strategy_reduction_dialog.vue'
import { useStore } from 'vuex'

const route = useRoute()
// 基础版模板空间显示客户端
// const systemVersion = computed(() => store.state.user.systemVersion)

const router = useRouter()
const $data = reactive({
  origin: '', // 页面来源 cloud_template_management 云模板管理 cloud_template 云模板 creative_mould 企业模板
  loading: true,
  finished: false,
  pageNo: 0,
  pageSize: 30,
  hasDigitalPerson: false, // 是否有数字人
  copyDialog: {
    show: false
  },
  addCreateNameloading: false,
  progressShow: false,

  creativeId: null,
  status: null,
  isEdit: true,
  structureList: [],
  showList: [],
  mirrorsLength: 0,
  materialUrl: '',
  videoPath: '',
  videoPlayVisible: false,
  sourceType: null,
  categoryList: [
    {
      value: -1,
      label: '全部'
    },
    {
      value: 1,
      label: '视频'
    },
    {
      value: 8,
      label: '图片'
    },
    {
      value: 2,
      label: '音频'
    },
    {
      value: 3,
      label: '文本'
    },
    {
      value: 21,
      label: '数字人'
    }
  ],
  chooseValue: -1,
  digitalRuleInfo: {
    show: false,
    id: null,
    replaceRule: null
  }, // 数字人的规则设置弹窗信息
  videoRuleInfo: {
    minDuration: undefined,
    show: false,
    id: null,
    replaceRule: null
  }, // 视频的规则设置弹窗信息
  audioRuleInfo: {
    minDuration: undefined,
    show: false,
    id: null,
    replaceRule: null
  }, // 音频的规则设置弹窗信息
  imgRuleInfo: {
    show: false,
    id: null,
    replaceRule: null
  }, // 图片的规则设置弹窗信息
  strategyList: [
    {
      id: null,
      strategyType: 2,
      strategyIds: '',
      loading: false,
      name: 'AI短视频标题文案',
      show: true,
      showNext: false,
      switchStatus: false,
      label: '员工不会写短视频标题影响流量？标题文案库提前储备！'
    }
    // {
    //   id: null,
    //   strategyType: 1,
    //   strategyIds: '', // 已开启策略ids
    //   loading: false, // 是否正在加载
    //   name: '智能降重策略', // 策略名称
    //   show: false, // 是否显示尽情期待
    //   showNext: true, // 是否显示编辑入口
    //   switchStatus: false, // 策略开关 true开启 false关闭
    //   label: '智能降重模板内视频、图片、BGM、字幕、转场，从此视频流量蹭蹭上涨！' // 描述
    // }
  ],
  reductionDialogData: {
    show: false,
    title: '智能降重策略',
    label: '模板开启降重后会应用到所有模板使用的场景（跟拍、流水线合成、模板式合成等）',
    strategyInfo: {} // 配置信息
  },
  // showTrackArea: false, // 是否显示轨道图
  batchSwitch: false, // 是否显示组合按钮
  VideoTracks: [], // 显示的轨道信息，数据结构为二维数据，第一维是轨道，第二维是轨道内的分镜
  // trackStyle: {
  //   Video: {
  //     icon: 'https://tagvv-1256030678.file.myqcloud.com/20231107ld2qw.png',
  //     text: '视频',
  //     backgroundColor: '#004A51'
  //   },
  //   Image: {
  //     icon: 'https://tagvv-1256030678.file.myqcloud.com/20231107zk1fw.png',
  //     text: '图片',
  //     backgroundColor: '#936442'
  //   },
  //   Text: {
  //     icon: 'https://tagvv-1256030678.file.myqcloud.com/2023110789bu0.png',
  //     text: '文本',
  //     backgroundColor: '#BA533D'
  //   },
  //   Audio: {
  //     icon: 'https://tagvv-1256030678.file.myqcloud.com/20231107vsxmu.png',
  //     text: '音频',
  //     backgroundColor: '#744A82'
  //   },
  //   Filter: {}, // 进一步描述滤镜子类型
  //   Transition: {}, // 进一步描述转场子类型
  //   VFX: {} // 进一步描述特效子类型
  // },
  groupOrderList: [] // 分镜组列表
})

const isGroup = ref(false) // 是否有分镜组
// const showTrackAreaRef = ref(null) // 分镜轨道图
const itemRefs = ref([]) // 分镜名称ref列表，用于显示编辑框时自动聚焦
const itemRefsRemark = ref([]) // 分镜说明ref列表，用于显示编辑框时自动聚焦
const itemRefsGroupName = ref([]) // 分组名称ref列表，用于显示编辑框时自动聚焦
const itemRefsRemarkGroup = ref([]) // 分组说明ref列表，用于显示编辑框时自动聚焦
const itemRefsListItem = ref([]) // 每个分镜的实例
const notReplaceTip = ref('不可替换原料会根据选择的原料范围进行随机合成，无需员工选择')
// 原料比例选择项
const cropTypeList = ref([
  {
    label: '自适应',
    value: 1
  },
  {
    label: '填充',
    value: 2
  }
])
// 长原料处理方式
const replaceModelList = ref([
  {
    label: '随机选取',
    tip: '从原料中随机选取分镜时长长度的片段',
    value: 0
  },
  {
    label: '选取前段',
    tip: '从原料中选取分镜时长长度的前部分片段',
    value: 1
  },
  {
    label: '智能倍速',
    tip: '对原料进行倍速，超过分镜时长 2 倍的原料不会被使用',
    value: 3
  }
])
const store = useStore()
const isHideTopMenu = store.getters.isHideTopMenu

$data.creativeId = route.query.id || null
$data.origin = route.query.origin || 'creative_mould'
onMounted(() => {
  getDetail()
  // getInfo()
  getAll()
  // showIf()
  _getStrategyConfigByCreativeId()
  listGroupClipFn()
})
// 获取输入框的ref，用于聚焦
const setItemRef = (el, id, type) => {
  return el => {
    if (el) {
      const existingItem =
        type === 'name'
          ? itemRefs.value.find(item => item.id === id)
          : type === 'remark'
          ? itemRefsRemark.value.find(item => item.id === id)
          : type === 'groupName'
          ? itemRefsGroupName.value.find(item => item.id === id)
          : type === 'groupDesc'
          ? itemRefsRemarkGroup.value.find(item => item.id === id)
          : ''
      if (!existingItem) {
        // 如果不存在，则添加新的项
        if (type === 'name') itemRefs.value.push({ id, ref: el })
        if (type === 'remark') itemRefsRemark.value.push({ id, ref: el })
        if (type === 'groupName') itemRefsGroupName.value.push({ id, ref: el })
        if (type === 'groupDesc') itemRefsRemarkGroup.value.push({ id, ref: el })
      } else {
        // 如果存在，则更新现有项的引用
        existingItem.ref = el
      }
    }
  }
}
// 获取每个分镜的实例，用于点击轨道定位
const setItemRefListItem = (el, id) => {
  return el => {
    if (el) {
      const existingItem = itemRefsListItem.value.find(item => item.id === id)
      if (!existingItem) {
        itemRefsListItem.value.push({ id, ref: el })
      } else {
        existingItem.ref = el
      }
    }
  }
}
// const loadMore = () => {
//   if ($data.finished || $data.loading) {
//     return
//   }
//   console.log('没有分页了')
//   // getInfo()
//   // listGroupClipFn()
// }
const updateReReplaceStatus = throttle(function (status) {
  noReplaceClipSwitch({
    id: route.query.id,
    operateWay: status ? 0 : 1
  }).then(res => {
    if (res.code === 0) {
      moduleInfo.value.noReplaceClipSwitch = status ? 0 : 1
    }
  })
}, 500)
// 下移
function moveDown(item, index) {
  console.log('下移分镜组')

  if (
    index >=
    $data.groupOrderList.filter(x => {
      return x.isRealGroup === 1
    }).length -
      1
  )
    return
  updateGroupOrderFn(item.id, 1)
}
// 上移
function moveUp(item, index) {
  if (index === 0) return
  updateGroupOrderFn(item.id, 0)
}
// 调整分组顺序
const updateGroupOrderFn = throttle(function (groupId, operateWay) {
  updateGroupOrder({
    creativeId: $data.creativeId,
    groupId,
    operateWay
  })
    .then(res => {
      console.log('调整分组顺序返回', res)
      if (res.code === 0) {
        listGroupClipFn()
      }
    })
    .catch(err => {
      console.log('调整分组顺序错误', err)
    })
}, 500)

// 打散
const breakGroup = throttle(function (item) {
  console.log('点击打散分镜组')
  if (!item.id) return

  cancelBindClipGroup({ groupId: item.id }).then(res => {
    if (res.code === 0) {
      listGroupClipFn()
    }
  })
}, 500)
// 显示分组说明输入框
function editRemarkGroup(item) {
  item.showGroupDesc = true
  nextTick(() => {
    const itemRef = itemRefsRemarkGroup.value.find(itemRefsItem => {
      return itemRefsItem.id === item.id
    })
    itemRef.ref.focus()
  })
}
// 分组说明编辑提交
function renameFn(item) {
  if ($data.origin === 'cloud_template') {
    return
  }
  item.groupDesc = item.groupDesc.trim()
  if (!item.groupDesc) return (item.showGroupDesc = false)
  const params = {
    groupId: item.id,
    groupDesc: item.groupDesc
  }
  updateGroupIfo(params).then(() => {
    item.showGroupDesc = false
  })
}
// 显示分组名称编辑框
function editNameGroup(item) {
  item.showGroupName = true
  nextTick(() => {
    const itemRef = itemRefsGroupName.value.find(itemRefsItem => {
      return itemRefsItem.id === item.id
    })
    itemRef.ref.focus()
  })
}
// 分组名称提交
function renameGroupFn(item) {
  console.log('分组名称编辑提交')
  if ($data.origin === 'cloud_template') {
    return
  }
  item.groupName = item.groupName.trim()
  if (!item.groupName) return (item.showGroupName = false)
  const params = {
    groupId: item.id,
    groupName: item.groupName
  }
  updateGroupIfo(params).then(() => {
    item.showGroupName = false
  })
}
// 分组信息修改
function updateGroupIfo(params) {
  return new Promise(resolve => {
    updateCreativeGroup(params)
      .then(res => {
        console.log('修改分组信息返回', res)
        // listGroupClipFn()
      })
      .finally(() => {
        resolve()
      })
  })
}

const choseItem = throttle(function (item, type) {
  if (type === 'group') {
    // 单选
    $data.groupOrderList.forEach(x => {
      if (x.isRealGroup === 1 && x.id !== item.id) {
        x.checked = false
      }
      if (x.isRealGroup === 1 && x.id === item.id) {
        item.checked = !item.checked
      }
    })
  } else {
    item.checked = !item.checked
  }
}, 128)
function editName(item) {
  item.showEdit = true
  nextTick(() => {
    const itemRef = itemRefs.value.find(itemRefsItem => {
      return itemRefsItem.id === item.creativeReplaceId
    })
    itemRef.ref.focus()
  })
}
function editRemark(item) {
  item.showRemark = true
  nextTick(() => {
    const itemRef = itemRefsRemark.value.find(itemRefsItem => {
      return itemRefsItem.id === item.creativeReplaceId
    })
    itemRef.ref.focus()
  })
}
// 显示原料类别
function showMediaType(val, isBgm) {
  if (isBgm === 1) return 'BGM'
  const type = { 1: '视频', 2: '音频', 3: '文本', 8: '图片', 21: '数字人' }
  return type[val]
}
// 分镜轨道的点击
const choseTrack = throttle(function (e, storyItem) {
  const { MediaURL, Content } = storyItem
  const currentId = MediaURL || Content
  console.log('点击轨道', currentId, storyItem)
  // 单选storyItem.trackChecked = true
  // $data.VideoTracks.forEach(s => {
  //   s.forEach(ss => {
  //     if ((ss.MediaURL ? ss.MediaURL : ss.Content) === currentId) {
  //       ss.trackChecked = true
  //     } else {
  //       ss.trackChecked = false
  //     }
  //   })
  // })
  let isGroup = false // 当前分镜是否在分镜组内
  // 在所有分镜列表内找到对应的分镜
  $data.groupOrderList.forEach(s => {
    s.groupClipList.forEach(ss => {
      if (`$${ss.replaceId}` === currentId) {
        ss.trackChecked = true
        if (s.isRealGroup === 1) isGroup = true
      } else {
        ss.trackChecked = false
      }
    })
  })

  console.log('isGroup', isGroup)
  if (!isGroup) {
    const itemRef = itemRefsListItem.value.find(itemRefsItem => {
      console.log('itemRefsItem', itemRefsItem)
      return `$${itemRefsItem.id}` === currentId
    })
    console.log('itemRef', itemRef)
    if (itemRef && !isElementInViewport(itemRef.ref)) {
      itemRef.ref.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }
}, 500)
// 判断当前数据是否超出可是范围
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect()
  // rect.top >= 336 被轨道图挡住也算可视区域外
  return (
    rect.top >= 336 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

// 加入分组
const addGroup = throttle(function () {
  const checkedGroupItems = $data.groupOrderList.filter(item => item.checked) // 选中的分组
  const uncheckedGroupItems = $data.groupOrderList.filter(item => !item.checked) // 没有选中的分组
  const allStoryCheckedReplaceIds = [] // 所有没有分组并且被选中的分镜Ids
  uncheckedGroupItems.forEach(item => {
    console.log('item', item)
    item.groupClipList.forEach(s => {
      if (s.checked) {
        allStoryCheckedReplaceIds.push(s.replaceId)
      }
    })
  })

  console.log('所有被选中的未分组的分镜', allStoryCheckedReplaceIds)
  // console.log('将分镜加入已有分组')
  if (checkedGroupItems.length > 0) {
    addGroupClip({
      addReplaceIds: allStoryCheckedReplaceIds,
      groupId: checkedGroupItems[0].id
    }).then(res => {
      console.log('将分镜加入已有分组返回', res)
      if (res.code === 0) {
        listGroupClipFn()
      }
    })
    return
  }

  // console.log('将分镜绑定分组')
  if (allStoryCheckedReplaceIds.length > 1) {
    // 调接口绑定分镜组
    bindClipGroup({
      replaceIds: allStoryCheckedReplaceIds,
      creativeId: $data.creativeId
    }).then(res => {
      if (res.code === 0) {
        listGroupClipFn()
      }
    })
  } else {
    ElMessage({
      message: '请至少选择两个分镜',
      type: 'warning'
    })
  }
}, 500)

// 隐藏轨道图
function hideTrackAreaFn() {
  // 将数据内的选中去除
  $data.groupOrderList.forEach(s => {
    s.groupClipList.forEach(ss => {
      ss.trackChecked = false
    })
  })
}
// function showTrackAreaFn() {
//   $data.showTrackArea = !$data.showTrackArea
//   if ($data.showTrackArea) {
//     nextTick(() => {
//       const { offsetWidth } = showTrackAreaRef.value // 整体宽度，用来计算时长对应像素关系，时长取小数点后一位
//       const totalLength = offsetWidth * 10 // 当前宽度下60秒对应的总宽度，因为取一位小数，最后结果除以10

//       let { AudioTracks, VideoTracks } = moduleInfo.value.templateConfigJson
//       // 将文本轨道，视频轨道、音频轨道分离，字幕轨道一定在最上边，音频轨道一定在最下边，视频轨道（包括图片轨道）在中间，再在个类型轨道内通过Id排序，id小的在下边
//       let TextTracks = VideoTracks.filter(item => {
//         return item.Type === 'Subtitle'
//       })
//       let VideoTracksMid = VideoTracks.filter(item => {
//         return item.Type === 'Video'
//       })
//       AudioTracks = AudioTracks.sort((a, b) => b.Id - a.Id)
//       TextTracks = TextTracks.sort((a, b) => b.Id - a.Id)
//       VideoTracksMid = VideoTracksMid.sort((a, b) => b.Id - a.Id)

//       const totalTracks = [...TextTracks, ...VideoTracksMid, ...AudioTracks]
//       console.log('totalTracks', totalTracks)

//       $data.VideoTracks = totalTracks.map(itemTrack => {
//         return (itemTrack?.VideoTrackClips || itemTrack?.AudioTrackClips).map(itemShot => {
//           // 处理分镜开始位置和宽度
//           const TimelineInPosition = (((itemShot.TimelineIn * 10) / 600) * totalLength) / 10
//           // const TimelineOutPosition = (((itemShot.TimelineOut * 10) / 600) * totalLength) / 10
//           const TimelineWidth =
//             ((((itemShot.TimelineOut - itemShot.TimelineIn) * 10) / 600) * totalLength) / 10
//           return (itemShot = {
//             ...itemShot,
//             TimelineInPosition,
//             // TimelineOutPosition,
//             TimelineWidth,
//             trackChecked: false // 轨道是否被选中
//           })
//         })
//       })
//       console.log('结果', $data.VideoTracks)
//     })
//   } else {
//     // 将数据内的选中去除
//     $data.groupOrderList.forEach(s => {
//       s.groupClipList.forEach(ss => {
//         ss.trackChecked = false
//       })
//     })
//   }
// }
// 获取分镜（组）列表
function listGroupClipFn() {
  listGroupClip({ creativeId: $data.creativeId })
    .then(res => {
      // console.log('获取分镜列表的返回', res)
      // 没有分页
      if (res.code === 0) {
        $data.mirrorsLength = res.data.clipNum
        let { groupOrderList } = res.data
        groupOrderList = groupOrderList.map(item => {
          item.checked = false // 是否选择分组
          item.showGroupName = false // 是否显示分组命名输入框
          item.showGroupDesc = false // 是否显示分组说明输入框
          item.groupClipList = item.groupClipList.map(s => {
            return (s = {
              ...s,
              showEdit: false, // 是否显示分镜名称编辑框
              showRemark: false, // 是否显示分镜说明编辑框
              checked: false, // 是否选中分镜
              trackChecked: false // 分镜轨道图对应的数据是否选中，选中的话在分镜组的分镜需要给边框，不在分镜组的分镜需要给边框+移入页面可视范围
            })
          })
          return item
        })
        $data.groupOrderList = groupOrderList
        isGroup.value =
          $data.groupOrderList.findIndex(x => {
            return x.isRealGroup
          }) !== -1
        console.log('分镜组处理后的列表', $data.groupOrderList)
      }
    })
    .finally(() => {
      $data.loading = false
    })
}

// 查询降重策略信息
function _getStrategyConfigByCreativeId() {
  getStrategyConfigByCreativeId({ creativeId: $data.creativeId }).then(res => {
    if (res.code === 0) {
      $data.strategyList[1].switchStatus = res.data.isOpen === 1
      $data.strategyList[1].id = res.data.id
      // 区分res.data.strategyIds是null 还是 "" null需要初始化成'1,2,5' "" 不需要
      if (res.data.strategyIds == null) {
        res.data.strategyIds = '1,2,5'
      }
      $data.strategyList[1].strategyIds = res.data.strategyIds
      $data.reductionDialogData.strategyInfo = $data.strategyList[1]
    }
  })
}

// 智能降重策略开关
function beforeUpdateStrategyStatus(item) {
  item.loading = true
  return new Promise((resolve, reject) => {
    updateStrategyConfig({
      isOpen: item.switchStatus ? 0 : 1, // 开了要关，关了要开，相反操作
      id: item.id
    })
      .then(res => {
        if (res.code === 0) {
          item.loading = false
          item.switchStatus = !item.switchStatus
          resolve()
        } else {
          item.loading = false
          reject(new Error('修改降重策略失败'))
        }
      })
      .catch(err => {
        console.log('修改降重策略失败', err)
        item.loading = false
        reject(new Error('修改降重策略失败'))
      })
  })
}
// 打开智能降重策略弹窗
function toNext(type) {
  if (type === 1) {
    $data.reductionDialogData.show = true
  }
  if (type === 2) {
    toAiTitle('title_l')
  }
}

const toAiTitle = throttle(tab => {
  router.push({
    path: '/sumwhy_video/template_space/titleLibrary',
    query: {
      id: $data.creativeId,
      name: moduleInfo.value.name,
      tab
    }
  })
}, 500)
// 是否显示
// function showIf() {
//   const brandId = localStorage.getItem('brandInfo')
//     ? JSON.parse(localStorage.getItem('brandInfo')).brandId
//     : '' // 品牌Id
//   const brandIds = [39, 43, 57]
//   // 当前品牌id不包含在brandIds
//   if (!brandIds.includes(brandId)) {
//     $data.strategyList = []
//   } else {
//     _getStrategyConfigByCreativeId()
//   }
// }

// 根据创意id查询结构详情
// function getInfo(a = true) {
//   console.log('老的获取列表接口调用')
//   $data.loading = false
//   if (a) return
//   $data.loading = true
//   $data.pageNo++
//   getStructureDetailByPage({
//     creativeId: $data.creativeId,
//     pageNo: $data.pageNo,
//     pageSize: $data.pageSize,
//     mediaType: $data.chooseValue === -1 ? undefined : $data.chooseValue
//   })
//     .then(res => {
//       if (res.code === 0) {
//         const list = res.data?.records || []
//         if ($data.pageNo === 1) {
//           $data.showList = []
//           $data.showList = list
//         } else {
//           $data.showList = $data.showList.concat(list)
//         }
//         $data.mirrorsLength = res.data.total
//         $data.finished = $data.showList.length >= $data.mirrorsLength
//         $data.loading = false
//         list.forEach(x => {
//           if (x.mediaType === 21) {
//             $data.hasDigitalPerson = true
//           }
//         })
//         getList()
//         // $data.loading = false
//       } else {
//         $data.loading = false
//       }
//     })
//     .catch(() => {
//       $data.loading = false
//     })
// }

// function getList() {
// $data.showList =
//   $data.chooseValue === -1
//     ? $data.structureList
//     : $data.structureList.filter(x => {
//         return x.mediaType === $data.chooseValue
//       })
// setTimeout(() => {
//   $data.loading = false
// }, 100)
// }
// 获取所有的模板
const getAll = () => {
  getStructureDetail({
    creativeId: $data.creativeId
  }).then(res => {
    if (res.code === 0) {
      $data.structureList = res.data || []
    }
  })
}

// 选中分类
// const chooseFun = throttle(function (e) {
//   $data.loading = true
//   $data.chooseValue = e.value
//   $data.pageNo = 0
//   getInfo()
//   // getList()
// }, 0)

// 将毫秒转换成分秒
function conversionTime(time) {
  return secToMin((time || 0) / 1000)
}

// 设置为替换项的开关状态改变前
const beforeSwitchChange = item => {
  console.log('item', item)
  return new Promise(resolve => {
    // 云模板进入，按钮禁用
    if ($data.origin === 'cloud_template') {
      resolve()
      return
    }
    if (item.mediaType !== 21) {
      if (item.isReplace === 1) {
        const list = $data.structureList.filter(sItem => sItem.isReplace === 1)
        if (list && list.length <= 1) {
          ElMessage({
            message: '至少设置一项替换项',
            type: 'warning'
          })
          resolve()
          return
        }
      }
      // 之前设置过原料范围的
      if (item.mediaType !== 3 && !item.isInitRule) {
        ElMessageBox.confirm(`更换分镜替换项类型将清除所设置规则`, '替换项设置提示', {
          confirmButtonText: '确认调整替换类型',
          cancelButtonText: '取消',
          type: '',
          customClass: 'xm_dialog_messageBox'
        })
          .then(() => {
            updateStrRelOvwStuFun(null, item, resolve)
          })
          .catch(() => {})
      } else {
        updateStrRelOvwStuFun(null, item, resolve)
      }
    }
  })
}
// 更新结构体关联原料是否可替换状态--设置替换项的开关修改
const updateStrRelOvwStuFun = (e, item, resolve) => {
  // 云模板进入，按钮禁用
  // if ($data.origin === 'cloud_template') {
  //   return
  // }
  if (item.mediaType !== 21) {
    // console.log(e, item)
    if (item.isReplace === 1) {
      // let length = 0
      // $data.structureList.forEach(sItem => {
      //   if (sItem.isReplace === 1) {
      //     length = length + 1
      //   }
      // })
      // if (length <= 1) {
      //   ElMessage({
      //     message: '至少设置一项替换项',
      //     type: 'warning'
      //   })
      //   return
      // }
      item.isReplace = 0
    } else {
      item.isReplace = 1
    }
    const data = {
      id: item.creativeReplaceId
    }
    updateStrRelOvwStu(data)
      .then(res => {
        if (res.code === 0) {
          // getInfo()
          listGroupClipFn()
          getAll()
        }
        resolve()
      })
      .catch(() => {
        resolve()
      })
  }
}

// 修改分镜名称
function changListName(item) {
  if ($data.origin === 'cloud_template') {
    return
  }
  item.name = item.name.trim()
  if (!item.name) {
    ElMessage({
      message: '分镜名称不能为空',
      type: 'warning'
    })
    return
  }
  const data = {
    id: item.creativeReplaceId,
    name: item.name
  }
  modifyReplaceName(data).then(() => {
    item.showEdit = false
  })
}

// 更新原料说明关联信息
function modifyRelationInfoFun(item) {
  if ($data.origin === 'cloud_template') {
    return
  }
  item.remark = item.remark.trim()
  if (!item.remark) return (item.showRemark = false)
  const data = {
    id: item.creativeReplaceId,
    remark: item.remark
  }
  modifyRelationInfo(data).then(() => {
    item.showRemark = false
  })
}

// 复制模板
// const copyMould = throttle(() => {
//   // 企业模板下，如果有阿里云剪辑工程ID，就可以复制
//   if ($data.origin === 'creative_mould' && !moduleInfo.value.aliyunProjectId) {
//     ElMessage({
//       message: '抱歉，模板工程数据缺失，无法完成操作！',
//       type: 'warning'
//     })
//     return
//   }
//   $data.copyDialog = {
//     id: $data.creativeId,
//     show: true,
//     origin: $data.origin
//   }
// }, 500)

// 获取最低的分镜时长
function getMinDuration(e) {
  return e && e >= 2000 ? Number(parseFloat(e / 2000).toFixed(2)) : 0
}

// 设置分镜规则
function setRuleDialog(e) {
  switch (e.mediaType) {
    case 1:
      $data.videoRuleInfo = {
        isReplace: e.isReplace, // 是否可替换
        mediaType: 1,
        templateId: parseInt(route.query.id),
        minDuration: getMinDuration(e.itemDuration),
        show: true,
        id: e.creativeReplaceId,
        replaceRule: e.replaceRule || null
      }
      break
    case 2:
      $data.audioRuleInfo = {
        isReplace: e.isReplace, // 是否可替换
        mediaType: 3,
        templateId: parseInt(route.query.id),
        materialDuration: e.itemDuration || 0,
        minDuration: getMinDuration(e.itemDuration),
        show: true,
        id: e.creativeReplaceId,
        replaceRule: e.replaceRule || null
      }
      break
    case 8:
      $data.imgRuleInfo = {
        isReplace: e.isReplace, // 是否可替换
        mediaType: 2,
        templateId: parseInt(route.query.id),
        show: true,
        id: e.creativeReplaceId,
        replaceRule: e.replaceRule || null
      }
      break
    case 21:
      $data.digitalRuleInfo = {
        isReplace: e.isReplace, // 是否可替换
        mediaType: e.mediaType,
        templateId: parseInt(route.query.id),
        show: true,
        id: e.creativeReplaceId,
        replaceRule: e.replaceRule || null
      }
      break
  }
}

// 规则设置
const setRuleFun = throttle(e => {
  getCreativeRplaceById({
    id: e.creativeReplaceId
  })
    .then(res => {
      if (res.code === 0 && res.data) {
        setRuleDialog(res.data)
      }
    })
    .catch(() => {
      setRuleDialog(e)
    })
}, 500)

const previewInfo = ref({
  show: false
}) // 预览弹窗的信息
const previewFun = throttle((url, type, title, cover) => {
  previewInfo.value = {
    show: true,
    title: title,
    url: url,
    type: type,
    cover: cover || ''
  }
}, 500)

const loading = ref(true)
const moduleInfo = ref({})
// const moduleNum = {
// mergeVideoNum: '合成视频数量',
// forwardVideoNum: '发布视频数（一键转发）',
// templatePublishVideoNum: '发布视频数（模板跟拍）',
// watchNum: '播放数',
// likeNum: '点赞数',
// shareNum: '分享数',
// commentNum: '评论数'
// }

// 获取模板详情
const getDetail = async () => {
  loading.value = true
  const res1 = await details(route.query.id)
  console.log('获取数据返回，轨道图就是', JSON.parse(res1.data.templateConfigJson))
  // const res2 = await getTemplateCount({
  //   pageNum: 1,
  //   pageSize: 1,
  //   condition: {
  //     name: '',
  //     startCreateTime: '',
  //     endCreateTime: '',
  //     categoryId: null,
  //     isDraft: 2,
  //     descUse: 0,
  //     categoryIds: [],
  //     orderBy: 2,
  //     templateId: route.query.id,
  //     orderItem: 'mergeVideoNum'
  //   }
  // })

  if (res1.code === 0) {
    const { data } = res1
    if (data.templateConfigJson) {
      data.templateConfigJson = JSON.parse(data.templateConfigJson)
      console.log('data.templateConfigJson', data.templateConfigJson)
    } else {
      data.templateConfigJson = null
    }

    moduleInfo.value = {
      ...data
    }
    loading.value = false
    console.log('moduleInfo.value', moduleInfo.value)
  }
}
// 显示编辑名称
const showEditName = ref(false)
const newName = ref('')
const switchEdit = () => {
  showEditName.value = true
  newName.value = moduleInfo.value.name
  console.log('应该有赋值的吧', newName.value, moduleInfo.value.name)
}
const editNameBlur = () => {
  // if (isEmpty([])) return
  const reg =
    // eslint-disable-next-line no-misleading-character-class
    /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi
  const value = newName.value.replace(reg, '')
  // 新输入为空不保存 值没有变化 不保存
  if (isEmpty(value) || value === moduleInfo.value.name) {
    showEditName.value = false
    return
  }
  modify({
    creativeId: route.query.id,
    name: value
  }).then(res => {
    if (res.code === 0) {
      showEditName.value = false
      moduleInfo.value.name = value
      console.warn(moduleInfo.value.name)
      ElMessage.success('修改成功')
      getDetail()
    }
  })
}

// 云模板开关开启/关闭之前
function beoreCloudOpenChange(item) {
  return new Promise(resolve => {
    ElMessageBox.confirm(`确认${item.isCloudOpen ? '取消设置' : '设置'}为公开云模板吗？`, '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
      customClass: 'drawer_systemBox'
    })
      .then(() => {
        modify({
          creativeId: item.id,
          isCloudOpen: item.isCloudOpen === 1 ? 0 : 1
        })
          .then(res => {
            if (res.code === 0) {
              ElMessage({
                message: '设置成功',
                type: 'success'
              })

              // 调接口，成功后返回true 否则false
              resolve(true)
            } else {
              resolve(false)
            }
          })
          .catch(() => {
            resolve(false)
          })
      })
      .catch(() => {
        resolve(false)
      })
  })
}
// 开关开启/关闭之前
function beoreOpenChange(item) {
  return new Promise(resolve => {
    ElMessageBox.confirm(`确认${item.isOpenTemplate ? '取消设置' : '设置'}为开放模板吗？`, '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
      customClass: 'drawer_systemBox'
    })
      .then(() => {
        updateOpenTemplate({
          creativeId: item.id,
          isOpenTemplate: item.isOpenTemplate === 1 ? 0 : 1
        })
          .then(res => {
            if (res.code === 0) {
              ElMessage({
                message: '设置成功',
                type: 'success'
              })

              // 调接口，成功后返回true 否则false
              resolve(true)
            } else {
              resolve(false)
            }
          })
          .catch(() => {
            resolve(false)
          })
      })
      .catch(() => {
        resolve(false)
      })
  })
}
// 显示云模板详情的弹窗
const managementDialog = reactive({
  show: false,
  id: null,
  index: null,
  origin: $data.origin
})
const showManagementFun = throttle(() => {
  managementDialog.id = $data.creativeId
  managementDialog.show = true
}, 500)
// 更新单条数据
function updateOneInfo() {
  getDetail()
}

const reEditLoading = ref(false) // 重新剪辑的Loading
// 重新剪辑
const reEditFun = throttle(() => {
  // 企业模板下，如果有阿里云剪辑工程ID，就可以重新剪辑
  if ($data.origin === 'creative_mould') {
    if (moduleInfo.value.aliyunProjectId) {
      getHasVideo()
    } else {
      ElMessage({
        message: '抱歉，模板工程数据缺失，无法完成操作！',
        type: 'warning'
      })
    }
  } else if ($data.origin === 'cloud_template_management') {
    // 云模板管理下，如果没有生产视频过，就可以重新剪辑
    reEditLoading.value = true
    getHasVideo()
  }
}, 500)
// 检查模板是否已合成过视频
function getHasVideo() {
  hasVideo({
    creativeId: $data.creativeId
  })
    .then(res => {
      if (res.code === 0) {
        if (res.data) {
          ElMessage({
            message: '模板已生成视频，无法重新剪辑！',
            type: 'warning'
          })
        } else {
          showReDialogFun()
        }
      }
      reEditLoading.value = false
    })
    .catch(() => {
      reEditLoading.value = false
    })
}
// 显示重新剪辑的提示弹窗
function showReDialogFun() {
  ElMessageBox.confirm(
    `重新剪辑后，模板配置和流水线配置可能会混乱，请谨慎操作`,
    '模板重新剪辑提示',
    {
      confirmButtonText: '确认进入剪辑页面',
      cancelButtonText: '取消',
      type: '',
      customClass: 'xm_dialog_messageBox'
    }
  )
    .then(() => {
      sendHrefMessage(
        `${location.origin}/sumvideo/editing_project_web/${moduleInfo.value.templateId}/${
          moduleInfo.value.id
        }?origin=${
          $data.origin === 'cloud_template_management' ? $data.origin : 'template_space'
        }&hideSave=true`
      )
    })
    .catch(() => {})
}
onBeforeRouteLeave((to, from) => {
  if (to.path !== '/sumwhy_video/intelligent_material') {
    sessionStorage.removeItem('intelligent_tab')
  }
})

onUnmounted(() => {
  ElMessageBox.close(false)
})
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}

.template_edit {
  height: 100%;

  .module_overview {
    //width: 1678px;
    min-height: 136px;
    background: #ffffff;
    border-radius: 4px;
    margin-bottom: 16px;
    padding: 20px 24px;

    .module_overview_container {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;

      .module_info {
        display: flex;
        align-items: center;

        .module_info_img {
          position: relative;
          width: 72px;
          height: 96px;
          background: #dcdee0;
          border-radius: 4px;
          cursor: pointer;
          object-fit: cover;

          .digital_icon {
            position: absolute;
            top: 0;
            left: 0;
            width: 45px;
            height: 45px;
          }
          .module_info_mask {
            opacity: 0;
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            width: 72px;
            height: 96px;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            background: rgba(0, 0, 0, 0.2);
            .play_img {
              width: 30px;
              height: 30px;
              display: flex;
            }
          }
        }
        .module_info_img:hover {
          .module_info_mask {
            opacity: 1;
          }
        }

        .module_info_warp {
          margin-left: 12px;
          //height: 20px;
          font-size: 12px;
          color: #303133;
          line-height: 18px;

          .module_info_title {
            font-size: 14px;
            //line-height: 20px;
            height: 28px;
            line-height: 28px;
            font-weight: 400;
            display: flex;
            align-items: center;

            img {
              width: 14px;
              height: 14px;
              margin-left: 8px;
              cursor: pointer;
            }
          }

          :deep(.el-input__inner) {
            padding: 0 12px;
            color: #323233;
            font-size: 14px;
            height: 28px;
            line-height: 28px;
            font-weight: 400;
            background: #f7f8fa;
            border-radius: 2px;
            border: 1px solid #dcdee0;
          }

          .module_info_text {
            font-weight: 400;
            max-width: 526px;
            @include mult_line(1);
          }
          .module_info_text + .module_info_text {
            margin-top: 4px;
          }
        }
      }

      .module_number {
        text-align: center;

        .module_number_warp {
          font-size: 18px;
          font-weight: bold;
          color: #333333;
          line-height: 22px;
        }

        .module_number_tips {
          margin-top: 6px;
          font-size: 12px;
          font-weight: 400;
          color: #909399;
          line-height: 18px;
        }
      }
    }
  }

  .scriptStructure_wrap {
    width: 100%;
    height: calc(100% - 136px - 16px - 56px);
    background: #ffffff;
    border-radius: 4px;
    .list {
      width: 100%;
      height: calc(100% - 64px);
      overflow-y: auto;
    }
    .structure_head {
      display: flex;
      align-items: center;
      height: 64px;
      padding: 0 24px;
      justify-content: space-between;
      background: #ffffff;
      border-radius: 4px 4px 0 0;
      .title {
        line-height: 64px;
        height: 64px;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        margin-right: 8px;
      }

      .iconimg {
        width: 20px;
        height: 20px;
        //background: #000000;
        border-radius: 50%;
        border: solid #ffffff 1px;
        //color: #FFFFFF;
        text-align: center;
        align-items: center;
        margin-top: 22px;
        //display: flex;
      }

      .track_warp {
        margin-left: 16px;
        height: 64px;
        padding-top: 19px;
        // position: relative;
        // .tr_img {
        //   width: 101px;
        //   height: 28px;
        //   cursor: pointer;
        //   transition: all 0.3s;
        //   &:hover {
        //     opacity: 0.8;
        //   }
        // }
        // .track_are {
        //   position: absolute;
        //   top: 55px;
        //   left: 0;
        //   width: calc(100vw - 467px);
        //   min-width: 900px;
        //   max-height: 218px;
        //   box-sizing: border-box;
        //   border: 1px solid #000;
        //   border-radius: 4px;
        //   background: rgba(0, 0, 0, 0.8);
        //   z-index: 199;
        //   .track_title {
        //     padding: 16px 20px 10px 20px;
        //     color: #fff;
        //   }
        //   .track_con {
        //     width: 100%;
        //     overflow: auto;
        //     padding-left: 20px;
        //     height: 158px;
        //     margin-bottom: 20px;
        //     .track_item {
        //       margin-top: 10px;
        //       height: 28px;
        //       display: flex;
        //       align-items: center;
        //       box-sizing: border-box;
        //       position: relative;
        //       .story_item {
        //         display: flex;
        //         align-items: center;
        //         height: 100%;
        //         box-sizing: border-box;
        //         border-radius: 4px;
        //         position: absolute;
        //         top: 0;
        //         color: #fff;
        //         font-size: 12px;
        //         cursor: pointer;
        //         overflow: hidden;
        //         white-space: nowrap;
        //         text-overflow: ellipsis;
        //         border: 2px solid transparent;
        //         // &:hover {
        //         //   z-index: 200;
        //         //   min-width: 60px;
        //         // }
        //         .story_icon {
        //           width: 16px;
        //           height: 16px;
        //           margin-right: 4px;
        //           margin-left: 6px;
        //         }
        //       }
        //       .story_item_checked {
        //         border-color: #fff;
        //       }
        //     }
        //   }
        // }
      }

      .structure_head_r {
        display: flex;
        align-items: center;
        :deep(.el-button) {
          // height: 28px;
          // min-height: 28px;
          padding: 6px 12px !important;
        }
      }

      .iconimg:hover {
        .DescriptiveText {
          display: block;
        }
      }

      .DescriptiveImg {
        width: 16px;
        height: 16px;

        img {
          width: 16px;
          height: 16px;
        }
      }

      .DescriptiveText {
        text-align: left;
        background: rgb(37, 39, 45, 1);
        border-radius: 4px;
        width: 600px;
        height: 68px;
        font-size: 14px;
        font-weight: 400;
        color: #b0b0b2;
        line-height: 22px;
        padding: 12px;
        z-index: 999;
        position: relative;
        top: -20px;
        left: 30px;
        display: none;
      }

      .playBtn_wrap {
        background: #2282ff;
        border-radius: 4px;
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 1px 6px;

        img {
          width: 12px;
          height: 12px;
          margin-right: 4px;
        }

        span {
          font-size: 14px;
          font-weight: 400;
          color: #ffffff;
          line-height: 20px;
        }
      }
    }

    .list_warp {
      padding: 0 24px 20px 24px;
      .item_l,
      .l_info,
      .l_edit,
      .s_name,
      .s_illustrate,
      .item_r,
      .name_warp,
      .group_info,
      .group_l,
      .group_reName,
      .group_r,
      .group_info_warp,
      .list_item {
        display: flex;
        align-items: center;
      }
      .item_l {
        width: calc(100% - 278px);
        // flex: 1;
      }
      :deep(.el-input) {
        // width: 276px;
        border-radius: 4px;
        .el-input__inner {
          padding-right: 60px;
        }
        .el-input__suffix {
          right: 11px;
        }
      }
      .chose_box {
        width: 16px;
        height: 16px;
        background: #ffffff;
        border-radius: 2px;
        border: 1px solid #dcdee0;
        margin-left: 16px;
        cursor: pointer;
        position: relative;
      }
      .chose_box_active {
        background: #364fcd;
        position: relative;
        &::after {
          box-sizing: content-box;
          content: '';
          border: 1px solid #fff;
          border-left: 0;
          border-top: 0;
          height: 8px;
          left: 5px;
          position: absolute;
          top: 1px;
          transform: rotate(45deg) scaleY(1);
          width: 4px;
          transition: transform 0.15s ease-in 0.05s;
          transform-origin: center;
        }
      }
      // 一个分镜
      .list_item {
        justify-content: space-between;
        background: #f2f3f5;
        border-radius: 4px;
        border: 1px solid #d5d5d5;
        height: 64px;
        box-sizing: border-box;
        .l_info {
          width: 144px;
          padding-left: 12px;
          .icon_warp {
            width: 40px;
            height: 40px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 2px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .desc {
            margin-left: 8px;
            .time {
              font-size: 12px;
              color: #ffffff;
              line-height: 18px;
              padding: 0 4px;
              background: rgba(0, 0, 0, 0.4);
              border-radius: 2px;
            }
            .text {
              font-size: 12px;
              color: #ffffff;
              line-height: 18px;
              padding: 0 4px;
              border-radius: 2px;
              margin-top: 4px;
              text-align: center;
              align-self: flex-start;
            }
            .text_1 {
              background: #2388ff;
            }
            .text_8 {
              background: #936442;
            }
            .text_3 {
              background: #3e851b;
            }
            .text_2 {
              background: #bbae3b;
            }
            .text_21 {
              background: #364fcd;
            }
          }
        }
        .l_edit {
          width: calc(100% - 144px - 12px);
          line-height: 20px;
          flex: 1;
          // max-width: 612px;
          // overflow: auto;
          .s_name {
            width: calc((100% - 56px) / 2);
            // width: max-content;
          }
          .s_illustrate {
            width: calc((100% - 56px) / 2);
            margin-left: 40px;
            margin-right: 16px;
          }
        }
        .item_r {
          padding-right: 20px;
        }
        .play_img {
          width: 28px;
          height: 28px;
          position: absolute;
          left: 6px;
          top: 6px;
          cursor: pointer;
        }
        .left_cover {
          width: 100%;
          height: 100%;
          position: absolute;
          left: 0;
          top: 0;
          object-fit: cover;
          border-radius: 2px;
        }
        .mediaType_cont {
          // cursor: pointer;
          color: #606266;
          font-size: 12px;
          line-height: 17px;
        }
        .mediaType_img {
          border-radius: 2px;
          cursor: pointer;
        }
        .audio_icon {
          position: absolute;
          top: 4px;
          left: 4px;
          width: 32px;
          height: 32px;
          cursor: pointer;
        }
      }

      // 一个分镜组
      .list_group {
        margin-top: 8px;
        padding: 12px 20px 12px 16px;
        border-radius: 4px;
        border: 1px solid #d5d5d5;
        box-sizing: border-box;
        background: #f2f3f5;
        &:first-child {
          margin-top: 0;
        }
        .group_info {
          justify-content: space-between;
          padding-bottom: 12px;
          .group_l {
            width: calc(100% - 100px);
            line-height: 32px;
            .group_name {
              flex-shrink: 0;
              width: max-content;
              color: #323233;
              line-height: 20px;
              font-size: 14px;
            }
            .group_reName {
              width: calc(100% - 200px);
              max-width: 50%;
              margin-left: 40px;
              white-space: nowrap;
              :deep(.el-input) {
                width: 500px;
              }
            }
          }
          .group_r {
            :deep(.el-button) {
              height: 28px;
              min-height: 28px;
            }
            .diffuse_btn {
              margin-right: 16px;
            }
            .move_icon {
              width: 20px;
              height: 20px;
              min-width: 20px;
              cursor: pointer;
            }
            .move_icon_top {
              margin-left: 12px;
            }
            .move_icon_top_one {
              opacity: 0.3;
              // cursor: not-allowed;
            }
          }
        }
        .group_info_warp {
          > .chose_box {
            margin-left: 0;
            margin-right: 12px;
          }
        }
        .list_item_warp {
          flex: 1;
          overflow: hidden;
        }
        .list_item_in_g {
          width: 100%;
          border: unset;
          background: #fcfcfd;
          margin-top: 8px;
          &:first-child {
            margin-top: 0;
          }
        }
        .list_item_trackChecked {
          border: 2px solid #364fcd;
        }
      }
      // 分镜组不存在的情况下。所有对应样式
      .list_group_no_group {
        padding: unset;
        margin-top: 0;
        border: unset;
        background: unset;
        margin-top: 8px;
        &:first-child {
          margin-top: 0;
        }
        .group_info_warp {
          > .chose_box {
            display: none;
          }
        }
        .list_item_in_g {
          background: #f2f3f5;
          border-radius: 4px;
          border: 1px solid #d5d5d5;
        }
      }
    }

    .structure_category {
      padding-left: 24px;
      margin-bottom: 20px;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;

      .one_category {
        padding: 2px 6px;
        font-size: 14px;
        font-weight: 400;
        line-height: 20px;
        border-radius: 4px;
        margin-right: 8px;
        cursor: pointer;
        color: #909399;
      }

      .choose_category {
        color: #303133;
        background: #e0e0e0;
      }
    }

    .structure_box_none {
      width: calc(100% - 24px);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 300px;
      color: #8f939a;
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;

      img {
        width: 70px;
        height: 70px;
        object-fit: cover;
        margin-bottom: 7px;
      }
    }

    .structure_box {
      width: calc(100% - 24px);
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
      flex-wrap: wrap;
      margin-left: 24px;
      max-height: calc(100% - 108px);
      overflow-y: auto;

      .one_structure {
        width: calc((100% - 60px) / 3);
        background: #f2f3f5;
        border-radius: 4px;
        margin-right: 20px;
        margin-bottom: 20px;

        .one_box {
          width: 100%;
          padding: 12px;
          height: 196px;

          background: #f2f3f5;
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-start;

          .one_box_top {
            width: 100%;
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: flex-start;
          }

          .one_box_top_left {
            width: 90px;
            height: 120px;
            background: #cccccc;
            border-radius: 2px;
            margin-right: 12px;
            position: relative;
            overflow: hidden;

            .left_cover {
              width: 100%;
              height: 100%;
              position: absolute;
              left: 0;
              top: 0;
              object-fit: cover;
            }

            .left_content {
              width: 100%;
              height: 100%;
              position: absolute;
              left: 0;
              top: 0;
              padding: 8px 10px;
              overflow: hidden;
              font-size: 12px;
              font-weight: 400;
              color: #606266;
              line-height: 20px;
              background: #cccccc;
            }

            .left_mask {
              display: none;
              width: 100%;
              height: 100%;
              position: absolute;
              left: 0;
              top: 0;
              background: rgba(0, 0, 0, 0.2);
            }

            .left_duration {
              position: absolute;
              left: 6px;
              top: 6px;
              padding: 0 4px;
              height: 20px;
              background: rgba(0, 0, 0, 0.6);
              border-radius: 2px;
              font-size: 12px;
              font-weight: 400;
              color: #ffffff;
              line-height: 20px;
            }

            .play_img {
              display: none;
              width: 36px;
              height: 36px;
              position: absolute;
              left: 27px;
              top: 42px;
              cursor: pointer;
            }

            .left_tag {
              font-size: 12px;
              font-weight: 400;
              color: #ffffff;
              line-height: 20px;
              padding: 0px 4px;
              position: absolute;
              bottom: 6px;
              right: 6px;
              height: 20px;
              border-radius: 2px;
            }

            .video_tag {
              background: rgba(35, 136, 255, 0.6);
            }

            .img_tag {
              background: rgba(147, 100, 66, 0.6);
            }

            .digital_tag {
              background: rgba(54, 79, 205, 0.6);
            }

            .audio_tag {
              background: rgba(187, 174, 59, 0.6);
            }

            .text_tag {
              background: rgba(54, 115, 23, 0.6);
            }
            .label_tag {
              background: rgba(48, 49, 51, 0.6);
              margin-right: 4px;
            }
            .left_tag_warp {
              position: absolute;
              bottom: 6px;
              right: 6px;
              display: flex;
              .left_tag {
                position: static;
              }
            }
          }

          .one_box_bottom {
            width: 100%;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;

            .box_bottom_left {
              display: flex;
              flex-direction: row;
              justify-content: flex-start;
              align-items: center;

              .switch_mark {
                margin-right: 8px;
                font-size: 14px;
                font-weight: 400;
                color: #606266;
                line-height: 20px;
              }
            }
          }

          .box_play_left:hover {
            .left_mask,
            .play_img {
              display: block;
            }
          }

          .one_box_top_right {
            width: calc(100% - 102px);
            height: 120px;

            .right_name {
              width: 100%;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              font-size: 14px;
              font-weight: 400;
              color: #ffffff;
              line-height: 17px;
              display: flex;
              flex-direction: row;
              justify-content: flex-start;
              align-items: flex-start;
            }

            .right_explain {
              width: 100%;
              margin: 8px 0 14px;
              color: #ffffff;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }
      }
    }
  }
}

.right_bottom {
  width: 100%;
  margin-top: 25px;
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  //color: #FFFFFF;
  line-height: 25px;

  .cancle {
    height: 25px;
    padding: 0 8px;
    border-radius: 4px;
    //border: 1px solid rgba(255, 255, 255, 0.2);
    font-size: 14px;
    font-weight: 400;
    //color: #ffffff;
    color: #303133;
    line-height: inherit;
    cursor: pointer;
    border: 1px solid #999999;

    &:hover {
      //border: 1px solid rgba(255, 255, 255, 0.3) !important;
    }

    &:active {
      //border: 1px solid rgba(255, 255, 255, 0.45) !important;
    }
  }

  .replace {
    padding: 0 8px;
    height: 25px;
    border: 1px solid #364fcd;
    background: #364fcd;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 400;
    color: #ffffff;
    line-height: inherit;

    &:hover {
      background: #364fcd;
    }

    &:active {
      background: #6084f5;
    }
  }
}

.right_name_one {
  margin-top: 6px;
  font-size: 14px;
  font-weight: 400;
  color: #303133;
  line-height: 20px;
}

.right_name_two {
  margin-top: 6px;
  font-size: 14px;
  font-weight: 400;
  color: #303133;
  line-height: 20px;
}

:deep(.el-textarea__inner) {
  padding: 6px 12px;

  .el-input__count {
    bottom: 8px;
    right: 17px;
  }
}
.modult_right {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: flex-start;
  flex: 1;
}
:deep(.modult_right .el-button + .el-button) {
  margin-left: 16px;
}
.one_module_info_box {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 4px;
}
.module_info_btn {
  margin-left: 20px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  :deep(.el-switch) {
    height: 28px;
  }
  :deep(.el-switch__label) {
    position: absolute;
    display: none;
    color: #fff;
  }
  /*打开时文字位置设置*/
  :deep(.el-switch__label--right) {
    z-index: 1;
    right: 20px;
  }
  /*关闭时文字位置设置*/
  :deep(.el-switch__label--left) {
    z-index: 1;
    left: 20px;
  }
  /*显示文字*/
  :deep(.el-switch__label.is-active) {
    display: block;
  }
  :deep(.el-switch .el-switch__core, .el-switch .el-switch__label) {
    width: 72px;
  }
}
.link_text {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 400;
  color: #364fcd;
  line-height: 20px;
  cursor: pointer;
  .r_icon {
    width: 14px;
    height: 14px;
    margin-left: 4px;
  }
}
.right_setting {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  .one_setting {
    box-sizing: border-box;
    min-width: 190px;
    width: 100%;
    height: 96px;
    padding: 12px 20px;
    position: relative;
    background: linear-gradient(180deg, #e0eaff 0%, #ffffff 100%);
    border-radius: 4px;
    border: 1px solid rgba(54, 79, 205, 0.1);
    // margin-right: 20px;
    &:first-child {
      margin-left: 76px;
    }
    :deep(.el-switch) {
      height: 22px;
    }
    .top_l {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      line-height: 22px;
      display: flex;
      align-items: center;
      .new_img {
        width: 36px;
        height: 17px;
        margin-left: 8px;
      }
    }
    .tips {
      margin-top: 4px;
      color: #606266;
      line-height: 20px;
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .ai_btns {
      display: flex;
      width: 100%;
      justify-content: space-between;
      margin-top: 6px;
      white-space: nowrap;
      .ai_btn_item {
        line-height: 20px;
        display: flex;
        align-items: center;
        font-size: 14px;
        .r_icon {
          width: 14px;
          height: 14px;
          margin-left: 4px;
          object-fit: contain;
          display: flex;
          // margin-top: 2px;
        }
      }
      .ai_btn_item_1 {
        color: #364fcd;
        cursor: pointer;
      }
      .ai_btn_item_2 {
        cursor: pointer;
        // color: #f85151;
        color: #364fcd;
        overflow: hidden;
        margin-left: 20px;
        min-width: 170px;
        position: relative;
        padding-right: 18px;
        .text {
          width: 100%;
          box-sizing: border-box;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .r_icon {
          position: absolute;
          right: 0;
        }
      }
    }
    .top_r {
      cursor: pointer;
      display: flex;
      flex-direction: row;
      align-items: center;
      margin-top: 30px;
      font-size: 14px;
      font-weight: 400;
      color: #364fcd;
      line-height: 20px;
      .r_icon {
        width: 14px;
        height: 14px;
        object-fit: contain;
        display: flex;
        margin-left: 4px;
      }
    }
  }
  .right_btn {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: flex-start;
    // position: absolute;
    // top: 12px;
    // right: 20px;
  }
}
.list_item_trackChecked {
  border: 2px solid #364fcd !important;
}
.text_no_warp {
  white-space: nowrap;
}
.name_warp {
  width: calc(100% - 72px);
  .show_name {
    max-width: calc(100% - 24px);
    word-break: break-all;
  }
  .change_icon {
    width: 16px;
    height: 16px;
    margin-left: 8px;
    cursor: pointer;
  }
}

.page_btn {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 56px;
  background: #ffffff;
  box-shadow: 0px 0px 7px 0px rgba(224, 224, 224, 0.5);
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.textarea_input {
  width: 100%;
  // width: 243px;
  margin: 8px 0;
}
</style>
