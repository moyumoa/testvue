<template>
  <div class="rightBox">
    <!-- 已选择的条件 -->
    <div class="left_box">
      <!-- <div class="left_header">
        <el-icon class="el-icon--right" @click="goBack">
          <i-arrow-left-bold />
        </el-icon>
        {{ data.title }}
      </div> -->
      <el-form
        :model="data"
        ref="formRef"
        label-width="94px"
        :rules="rules"
        style="padding-bottom: 20px; border-bottom: 1px solid #e8e8e8"
        :inline="true"
      >
        <el-form-item label="分组名" prop="name" style="margin: 18px 0 0">
          <el-input
            maxlength="20"
            v-model="data.name"
            clearable
            @blur="retEmit($event)"
            style="width: 264px"
          />
        </el-form-item>
        <el-form-item
          label="分组类型"
          prop="complexType"
          style="margin: 18px 0 0 36px"
          label-width="50px"
        >
          <el-radio-group v-model="data.complexType" @change="changeType">
            <el-radio :disabled="data.edit" :label="1">固定分组</el-radio>
            <el-radio :disabled="data.edit" :label="2">动态分组</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <!-- 按条件筛选新位置 -->
      <div class="choose_box" v-if="data.complexType === 2">
        <span style="margin-right: 14px">按条件筛选</span>
        <div
          :class="item.check ? 'check_box checkbox_input_active' : 'check_box'"
          v-for="(item, index) in data.conditionList"
          :key="index"
          @click="chooseCondition(item, index)"
          v-show="item.show"
        >
          <span class="checkbox_input"></span>
          <span class="checkbox_label">{{ item.label }}</span>
        </div>
      </div>
      <!-- <div v-else style="height: 24px"></div> -->
      <!-- 280px 没有统计时 -->
      <div
        :class="[
          data.isShowCount ? 'screening_content is_show_count' : 'screening_content',
          data.complexType == 1 ? 'screening_content_one' : ''
        ]"
      >
        <div
          v-for="(item, index) in data.chooseConditionList"
          :key="index"
          :style="{ height: data.complexType == 1 ? '100%' : '' }"
        >
          <!-- 粉丝数 -->
          <component
            :is="item.name"
            v-if="item.name == 'fans'"
            :fansMin="data.form.fansNumberStart"
            :fansMax="data.form.fansNumberEnd"
            :errorStu="data.errorList.fans"
            @changeFans="changeFans"
            @changeConditionList="changeConditionList"
          ></component>
          <!-- 地区 -->
          <component
            :is="item.name"
            v-if="item.name == 'region'"
            :regionAll="data.form.regionAll"
            :errorStu="data.errorList.region"
            @changeRegion="changeRegion"
            @changeConditionList="changeConditionList"
          ></component>
          <!-- 矩阵号名称 -->
          <component
            :is="item.name"
            v-if="item.name == 'matrixName'"
            :complexType="data.complexType"
            :matrixNameList="data.form.matrixNameList"
            :errorStu="data.errorList.matrixName"
            :form="data.form"
            :originList="fatherList"
            @addMatrix="addMatrix"
            @removeOne="removeOne"
            @SearchOk="SearchOk"
            @SearchClear="SearchClear"
            @changeMatrixNameList="changeMatrixNameList"
            @changeConditionList="changeConditionList"
          ></component>
          <!-- 矩阵号类型 -->
          <component
            :is="item.name"
            v-if="item.name == 'matrixType'"
            :matrixType="data.form.matrixType"
            :errorStu="data.errorList.matrixType"
            @changeMatrixType="changeMatrixType"
            @changeConditionList="changeConditionList"
          ></component>
          <!-- 视频总数 -->
          <component
            :is="item.name"
            v-if="item.name == 'videoTotality'"
            :videoMin="data.form.videoNumberStart"
            :videoMax="data.form.videoNumberEnd"
            :errorStu="data.errorList.videoTotality"
            @changeVideoNum="changeVideoNum"
            @changeConditionList="changeConditionList"
          ></component>
          <!-- 直播总数 -->
          <component
            :is="item.name"
            v-if="item.name == 'liveTotality'"
            :liveMin="data.form.liveNumberStart"
            :liveMax="data.form.liveNumberEnd"
            :errorStu="data.errorList.liveTotality"
            @changeLiveNum="changeLiveNum"
            @changeConditionList="changeConditionList"
          ></component>
          <!-- 矩阵号用户类型 -->
          <component
            :is="item.name"
            v-if="item.name == 'userType'"
            :userType="data.form.userType"
            :errorStu="data.errorList.userType"
            @changeUserType="changeUserType"
            @changeConditionList="changeConditionList"
          ></component>
          <!-- 所属平台 -->
          <component
            :is="item.name"
            v-if="item.name == 'platform'"
            :platform="data.form.platform"
            :errorStu="data.errorList.platform"
            @changePlatform="changePlatform"
            @changeConditionList="changeConditionList"
          ></component>
        </div>
      </div>
      <div class="screening_num" v-if="data.isShowCount">
        共筛选出
        <span style="color: #364fcd">{{ data.showCount }}</span>
        个矩阵号
      </div>
      <div class="footer_btn">
        <el-button :loading="data.countDis" @click="counting">统计</el-button>
        <el-button v-if="data.complexType === 2" @click="clearProp">清空属性</el-button>
        <el-button type="primary" :loading="saveDis" @click="saveGroup">保存分组</el-button>
      </div>
    </div>
    <!-- 筛选条件 -->
    <!-- <div class="right_box" v-if="data.complexType === 2"> -->
    <div class="right_box" v-if="false">
      <div class="right_header">
        <div class="title">按条件筛选</div>
      </div>
      <div class="right_content">
        <div
          :class="item.check ? 'oneCondition active' : 'oneCondition'"
          v-for="(item, index) in data.conditionList"
          :key="index"
          @click="chooseCondition(item, index)"
        >
          {{ item.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import fans from './setting/fans.vue'
import region from './setting/region.vue'
import matrixName from './setting/matrix_name.vue'
import matrixType from './setting/matrix_type.vue'
import userType from './setting/user_type.vue'
import liveTotality from './setting/live_totality.vue'
import videoTotality from './setting/video_totality.vue'
import platform from './setting/platform.vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api/content_center/content_matrix.js'
import { throttle } from '@/utils/tools.js'
export default {
  components: {
    fans,
    region,
    matrixName,
    matrixType,
    userType,
    liveTotality,
    videoTotality,
    platform
  },
  setup() {
    const data = reactive({
      id: '',
      name: '', // 分组名
      edit: false, // 是否为编辑分组页面
      complexType: 1, // 类型
      title: '新建分组',
      chooseConditionList: [],
      // 筛选条件列表
      conditionList: [
        {
          check: false,
          value: '0',
          name: 'fans',
          label: '粉丝数',
          show: true
        },
        {
          check: false,
          value: '1',
          name: 'region',
          label: '地区',
          show: false
        },
        {
          check: false,
          value: '2',
          name: 'matrixName',
          label: '矩阵号名称',
          show: false
        },
        {
          check: false,
          value: '3',
          name: 'matrixType',
          label: '矩阵号类型',
          show: true
        },
        {
          check: false,
          value: '4',
          name: 'videoTotality',
          label: '视频总数',
          show: true
        },
        {
          check: false,
          value: '5',
          name: 'liveTotality',
          label: '直播场次总数',
          show: true
        },
        {
          check: false,
          value: '6',
          name: 'userType',
          label: '矩阵号用户类型',
          show: true
        },
        {
          check: false,
          value: '7',
          name: 'platform',
          label: '所属平台',
          show: true
        }
      ],
      errorList: {
        fans: false,
        region: false,
        matrixName: false,
        matrixType: false,
        videoTotality: false,
        liveTotality: false,
        userType: false,
        platform: false
      },
      countDis: false,
      showCount: 0, // 统计得到的用户数
      isShowCount: false, // 是否显示统计的用户数
      // 筛选提交的表单
      form: {
        flag: 0, // 是否选择了条件 1代表选择了
        fansNumberStart: undefined, // 最少粉丝数
        fansNumberEnd: undefined, // 最多粉丝数
        videoNumberStart: undefined, // 最少视频数
        videoNumberEnd: undefined, // 最多视频数
        liveNumberStart: undefined, // 最少直播场次数
        liveNumberEnd: undefined, // 最多直播场次数
        userType: '', // 矩阵号用户类型（1：内部达人，2：外部达人）
        matrixType: '', // 矩阵号类型（1：个人号，2：普通企业号，3：认证企业号，4：品牌企业号）
        matrixNameList: [], // 矩阵号名称列表
        regionAll: [], // 所有选择的地区
        platform: '' // 所属平台 1抖音2视频号3小红书
      }
    })
    // 筛选提交的表单
    // let form = reactive({
    //   flag: 0, // 是否选择了条件 1代表选择了
    //   name: '', // 分组名
    //   fansNumberStart: undefined, // 最少粉丝数
    //   fansNumberEnd: undefined, // 最多粉丝数
    //   videoNumberStart: undefined, // 最少视频数
    //   videoNumberEnd: undefined, // 最多视频数
    //   liveNumberStart: undefined, // 最少直播场次数
    //   liveNumberEnd: undefined, // 最多直播场次数
    //   userType: '', // 矩阵号用户类型
    //   matrixType: '', // 矩阵号类型
    //   matrixNameList: [], // 矩阵号名称列表
    //   regionAll: [] // 所有选择的地区
    // })
    // 表单校验规则
    const rules = reactive({
      name: [{ required: true, message: '请输入分组名', trigger: 'blur' }]
    })
    // 选择条件
    function chooseCondition(item, index) {
      // console.log('选择了哪一个', item, index)
      // if (item.check) return
      clearCondition(item.name)
      data.errorList[item.name] = false
      data.conditionList[index].check = !data.conditionList[index].check
      if (data.conditionList[index].check) {
        data.chooseConditionList.push(item)
      } else {
        data.chooseConditionList = data.chooseConditionList.filter(x => x.value !== item.value)
      }
    }
    // 删除条件
    function changeConditionList(stu) {
      clearCondition(stu)
      data.conditionList.forEach(x => {
        if (x.name === stu) {
          x.check = false
        }
      })
      data.chooseConditionList = data.chooseConditionList.filter(x => x.name !== stu)
    }
    // 移除筛选项后清空对应筛选的条件
    function clearCondition(stu) {
      switch (stu) {
        case 'fans':
          data.form.fansNumberStart = undefined // 最少粉丝数
          data.form.fansNumberEnd = undefined // 最多粉丝数
          break
        case 'region':
          data.form.regionAll = [] // 所有选择的地区
          break
        case 'matrixName':
          data.form.matrixNameList = [] // 矩阵号名称列表
          break
        case 'matrixType':
          data.form.matrixType = '' // 矩阵号类型
          break
        case 'videoTotality':
          data.form.videoNumberStart = undefined // 最少视频数
          data.form.videoNumberEnd = undefined // 最多视频数
          break
        case 'liveTotality':
          data.form.liveNumberStart = undefined // 最少直播场次数
          data.form.liveNumberEnd = undefined // 最多直播场次数
          break
        case 'userType':
          data.form.userType = '' // 用户类型
          break
        case 'platform':
          data.form.platform = '' // 所属平台
          break
      }
    }
    // 判断是否可以发送请求 once 是否只对单个进行判断 type是单个的类型
    function saveCondition(once, type) {
      if (once) {
        const status = judeType(type)
        return status
      } else {
        let status = true
        if (!data.chooseConditionList || data.chooseConditionList.length === 0) {
          data.form.flag = 0
        } else {
          data.form.flag = 1
        }
        data.chooseConditionList.forEach(x => {
          if (!judeType(x.name)) {
            status = false
          }
        })
        return status
      }
    }
    // 判断各个类型的数据是否正确
    function judeType(type) {
      let status = true
      switch (type) {
        case 'fans':
          if (!data.form.fansNumberStart && !data.form.fansNumberEnd) {
            if (data.form.fansNumberStart === 0) {
              data.errorList.fans = false
            } else {
              data.errorList.fans = true
              status = false
            }
          } else {
            data.errorList.fans = false
          }
          break
        case 'region':
          if (data.form.regionAll.length === 0) {
            data.errorList.region = true
            status = false
          } else {
            data.errorList.region = false
          }
          break
        case 'matrixName':
          if (data.form.matrixNameList.length === 0) {
            data.errorList.matrixName = true
            status = false
          } else {
            data.errorList.matrixName = false
          }
          break
        case 'matrixType':
          if (!data.form.matrixType) {
            data.errorList.matrixType = true
            status = false
          } else {
            data.errorList.matrixType = false
          }
          break
        case 'videoTotality':
          if (!data.form.videoNumberStart && !data.form.videoNumberEnd) {
            if (data.form.videoNumberStart === 0) {
              data.errorList.videoTotality = false
            } else {
              data.errorList.videoTotality = true
              status = false
            }
          } else {
            data.errorList.videoTotality = false
          }
          break
        case 'liveTotality':
          if (!data.form.liveNumberStart && !data.form.liveNumberEnd) {
            if (data.form.liveNumberStart === 0) {
              data.errorList.liveTotality = false
            } else {
              data.errorList.liveTotality = true
              status = false
            }
          } else {
            data.errorList.liveTotality = false
          }
          break
        case 'userType':
          if (!data.form.userType) {
            data.errorList.userType = true
            status = false
          } else {
            data.errorList.userType = false
          }
          break
        case 'platform':
          if (!data.form.platform) {
            data.errorList.platform = true
            status = false
          } else {
            data.errorList.platform = false
          }
          break
      }

      return status
    }

    // 统计人数
    const counting = throttle(async function () {
      const status = saveCondition()
      // 如果是固定分组，就不用调接口了
      if (data.complexType === 1) {
        if (!status) {
          ElMessage({ type: 'warning', message: '请添加矩阵号' })
          return
        } else {
          data.isShowCount = true
          data.showCount = fatherList.value.length
        }
        return
      }

      data.countDis = true
      console.log(status)
      if (data.form.flag === 0) {
        data.isShowCount = false
        data.countDis = false
        ElMessage({ type: 'warning', message: '请选择条件' })
        return false
      }
      if (!status) {
        data.isShowCount = false
        data.countDis = false
        ElMessage({ type: 'warning', message: '请填写条件' })
      } else {
        data.countDis = true
        const param = {
          extra: {},
          groupId: route.query.id,
          groupModules: getGroupData()
        }
        // param.extra.b = JSON.stringify(data.chooseConditionList)

        api
          .checkGroup(param)
          .then(res => {
            if (res.code === 0) {
              ElMessage({ type: 'success', message: '统计成功' })
              data.isShowCount = true
              data.showCount = res.data
            } else {
              data.isShowCount = false
              ElMessage({ type: 'error', message: '统计失败' })
            }
            data.countDis = false
          })
          .catch(() => {
            data.isShowCount = false
            data.countDis = false
          })
      }
    }, 700)
    // 将数据改成数组的形式
    function getGroupData() {
      const list = []
      data.chooseConditionList.forEach(x => {
        switch (x.name) {
          case 'fans':
            list.push({
              module_name: 'fansNum',
              options: {
                min: data.form.fansNumberStart === 0 ? 0 : data.form.fansNumberStart || undefined,
                max: data.form.fansNumberEnd === 0 ? 0 : data.form.fansNumberEnd || undefined
              }
            })
            break
          case 'region':
            list.push({
              module_name: 'area',
              options: {
                val: data.form.regionAll || ''
              }
            })
            break
          case 'matrixName':
            if (data.complexType === 1) {
              // 固定分组这里的入参改掉了，module_name固定为dyName，val为openId数组
              const dyNicknameList = []
              data.form.matrixNameList.forEach(item => {
                if (item.openId) {
                  dyNicknameList.push(item.openId)
                }
              })
              list.push({
                module_name: 'openIds',
                options: {
                  val: dyNicknameList
                }
              })
            } else {
              list.push({
                module_name: 'dyName',
                options: {
                  val: data.form.matrixNameList || ''
                }
              })
            }

            break
          case 'matrixType':
            list.push({
              module_name: 'dyType',
              options: {
                val: data.form.matrixType || ''
              }
            })
            break
          case 'videoTotality':
            list.push({
              module_name: 'videoNum',
              options: {
                min: data.form.videoNumberStart === 0 ? 0 : data.form.videoNumberStart || undefined,
                max: data.form.videoNumberEnd === 0 ? 0 : data.form.videoNumberEnd || undefined
              }
            })
            break
          case 'liveTotality':
            list.push({
              module_name: 'liveNum',
              options: {
                min: data.form.liveNumberStart === 0 ? 0 : data.form.liveNumberStart || undefined,
                max: data.form.liveNumberEnd === 0 ? 0 : data.form.liveNumberEnd || undefined
              }
            })
            break
          case 'userType':
            list.push({
              module_name: 'dyUserType',
              options: {
                val: data.form.userType || ''
              }
            })
            break
          case 'platform':
            list.push({
              module_name: 'platform',
              options: {
                val: data.form.platform || ''
              }
            })
            break
        }
      })
      return list
    }
    // 保存分组
    const formRef = ref(null)
    const saveDis = ref(false)
    const saveGroup = throttle(function () {
      formRef.value.validate(valid => {
        if (valid) {
          saveDis.value = true
          const status = saveCondition()
          if (data.form.flag === 0) {
            ElMessage({ type: 'warning', message: '请选择条件' })
            saveDis.value = false
            return
          }
          if (!status) {
            ElMessage({ type: 'warning', message: '请填写条件' })
            saveDis.value = false
            return
          }
          const param = {
            id: data.id ? data.id : null,
            extra: {},
            groupName: data.name,
            groupType: 2
          }
          param.groupModules = getGroupData()
          param.complexType = data.complexType
          // param.extra.b = JSON.stringify(data.chooseConditionList)
          console.log(param)
          api
            .saveNewGroup(param)
            .then(res => {
              if (res.success) {
                ElMessage({ type: 'success', message: '保存成功' })
                goBack()
              }
            })
            .finally(() => {
              saveDis.value = false
            })
        }
      })
    }, 700)
    // 清空属性
    const clearProp = throttle(function () {
      data.conditionList.forEach(x => {
        x.check = false
      })
      data.showCount = 0
      data.isShowCount = false
      data.form = {
        // id: this.id,
        flag: 0, // 是否选择了条件 1代表选择了
        fansNumberStart: undefined, // 最少粉丝数
        fansNumberEnd: undefined, // 最多粉丝数
        videoNumberStart: undefined, // 最少视频数
        videoNumberEnd: undefined, // 最多视频数
        liveNumberStart: undefined, // 最少直播场次数
        liveNumberEnd: undefined, // 最多直播场次数
        userType: '', // 用户类型
        matrixType: '', // 矩阵号类型
        matrixNameList: [], // 矩阵号名称列表
        regionAll: [], // 所有选择的地区
        platform: '' // 所属平台
      }
      // data.name = '' // 清空分组名
      console.log(data.form.matrixNameList)
      data.chooseConditionList = []
    }, 700)
    // 修改粉丝的回调
    function changeFans(min, max) {
      data.form.fansNumberStart = min
      data.form.fansNumberEnd = max
      if (min || max) {
        saveCondition(true, 'fans')
      }
    }
    // 修改视频数的回调
    function changeVideoNum(min, max) {
      data.form.videoNumberStart = min
      data.form.videoNumberEnd = max
      if (min || max) {
        saveCondition(true, 'videoTotality')
      }
    }
    // 修改直播场次数的回调
    function changeLiveNum(min, max) {
      data.form.liveNumberStart = min
      data.form.liveNumberEnd = max
      if (min || max) {
        saveCondition(true, 'liveTotality')
      }
    }
    // 修改矩阵号用户类型的回调
    function changeUserType(type) {
      data.form.userType = type
      saveCondition(true, 'userType')
    }
    // 修改矩阵号类型的回调
    function changeMatrixType(type) {
      data.form.matrixType = type
      saveCondition(true, 'matrixType')
    }
    // 修改筛选的矩阵号名称的回调
    function changeMatrixNameList(list) {
      data.form.matrixNameList = list
      saveCondition(true, 'matrixName')
    }
    // 修改所属平台回调
    function changePlatform(type) {
      data.form.platform = type
      saveCondition(true, 'platform')
    }
    // 固定分组，维护一个父数组，页面显示的数组data.form.matrixNameList基于这个父数组copy
    const fatherList = ref([])
    // 选中添加的回调
    function addMatrix(list) {
      // console.log('看看选择就是显示列表', list)
      if (fatherList.value.length > 0) {
        const midList = fatherList.value.concat(list)
        fatherList.value = unRepeat(midList, 'xuserId')
      } else {
        fatherList.value = list
      }
      data.form.matrixNameList = JSON.parse(JSON.stringify(fatherList.value))
    }
    // 去重
    function unRepeat(arr, key) {
      const newArr = arr.filter((objItem, currentIndex, currentArr) => {
        return currentArr.findIndex(cV => cV[key] === objItem[key]) === currentIndex
      })
      return newArr
    }
    // 删除一个
    function removeOne(item) {
      // 维护父数组，确保数据一致性
      fatherList.value = data.form.matrixNameList.filter(x => x.xuserId !== item.xuserId)
      data.form.matrixNameList = JSON.parse(JSON.stringify(fatherList.value))
      // 如果统计人数显示在页面上，删除的时候统计任务也要重新统计
      if (data.isShowCount) {
        data.showCount = fatherList.value.length
      }
    }
    // 筛选结果回调
    function SearchOk(list) {
      data.form.matrixNameList = list
    }
    // 清空筛选
    function SearchClear() {
      data.form.matrixNameList = JSON.parse(JSON.stringify(fatherList.value))
    }
    // 修改筛选的地区的回调
    function changeRegion(list) {
      data.form.regionAll = list
      saveCondition(true, 'region')
    }
    // 返回上一个页面
    const router = useRouter()
    function goBack() {
      router.go(-1)
    }
    // 编辑页面，获取上次保存的筛选条件
    const getGroup = async function (id) {
      const res = await api.getNewGroupDetail({ groupId: id })
      // console.log('编辑时获取的列表', res)
      if (res.success) {
        data.name = res.data.groupName
        data.complexType = res.data.complexType ? res.data.complexType : 2
        if (res.data.groupModules && res.data.groupModules.length > 0) {
          res.data.groupModules.forEach(x => {
            switch (x.module_name) {
              case 'fansNum':
                data.form.fansNumberStart =
                  x.options.min === 0 ? 0 : x.options.min ? parseInt(x.options.min) : undefined
                data.form.fansNumberEnd =
                  x.options.max === 0 ? 0 : x.options.max ? parseInt(x.options.max) : undefined
                data.conditionList[0].check = true
                data.chooseConditionList.push(data.conditionList[0])
                break
              case 'area':
                data.form.regionAll = x.options.val || []
                data.conditionList[1].check = true
                data.chooseConditionList.push(data.conditionList[1])
                break
              case 'dyName':
                data.form.matrixNameList = x.options.val || []
                data.conditionList[2].check = true
                data.chooseConditionList.push(data.conditionList[2])
                break
              case 'openIds':
                // 固定分组配置，列表赋值在下面
                data.conditionList[2].check = true
                data.chooseConditionList.push(data.conditionList[2])
                break
              case 'dyType':
                data.form.matrixType = x.options.val || ''
                data.conditionList[3].check = true
                data.chooseConditionList.push(data.conditionList[3])
                break
              case 'videoNum':
                data.form.videoNumberStart =
                  x.options.min === 0 ? 0 : x.options.min ? parseInt(x.options.min) : undefined
                data.form.videoNumberEnd =
                  x.options.max === 0 ? 0 : x.options.max ? parseInt(x.options.max) : undefined
                data.conditionList[4].check = true
                data.chooseConditionList.push(data.conditionList[4])
                break
              case 'liveNum':
                data.form.liveNumberStart =
                  x.options.min === 0 ? 0 : x.options.min ? parseInt(x.options.min) : undefined
                data.form.liveNumberEnd =
                  x.options.max === 0 ? 0 : x.options.max ? parseInt(x.options.max) : undefined
                data.conditionList[5].check = true
                data.chooseConditionList.push(data.conditionList[5])
                break
              case 'dyUserType':
                data.form.userType = x.options.val || ''
                data.conditionList[6].check = true
                data.chooseConditionList.push(data.conditionList[6])
                break
              case 'platform':
                data.form.platform = x.options.val || ''
                data.conditionList[7].check = true
                data.chooseConditionList.push(data.conditionList[7])
                break
            }
          })
        } else {
          data.form = res.data.extra
          data.chooseConditionList = res.data.extra.b ? JSON.parse(res.data.extra.b) : []
          data.conditionList.forEach(x => {
            let stu = false
            data.chooseConditionList.forEach(y => {
              if (y.value === x.value) {
                stu = true
              }
            })
            x.check = stu
          })
        }
        // 固定分组回显，因为switch里已经处理了其他内容，这里只处理列表的回显
        if (res.data.accountUserVOS && res.data.accountUserVOS.length > 0) {
          fatherList.value = res.data.accountUserVOS
          const list = JSON.parse(JSON.stringify(fatherList.value))
          data.form.matrixNameList = list
        } else {
          fatherList.value = []
        }
      }
    }
    function retEmit(e, index) {
      // const reg = /[^\u4e00-\u9fa5a-zA-Z0-9]/gi
      const reg =
        /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
      data.name = e.target.value.replace(reg, '')
    }
    // 判断是否为新建分组页面
    const route = useRoute()
    onMounted(() => {
      if (route.query.id) {
        data.id = route.query.id
        data.edit = true
        data.title = '编辑分组'
        getGroup(data.id)
      } else {
        changeType()
      }
    })
    function clearPropNew() {
      data.conditionList.forEach(x => {
        x.check = false
      })
      data.showCount = 0
      data.isShowCount = false
      data.form = {
        // id: this.id,
        flag: 0, // 是否选择了条件 1代表选择了
        fansNumberStart: undefined, // 最少粉丝数
        fansNumberEnd: undefined, // 最多粉丝数
        videoNumberStart: undefined, // 最少视频数
        videoNumberEnd: undefined, // 最多视频数
        liveNumberStart: undefined, // 最少直播场次数
        liveNumberEnd: undefined, // 最多直播场次数
        userType: '', // 用户类型
        matrixType: '', // 矩阵号类型
        matrixNameList: [], // 矩阵号名称列表
        regionAll: [], // 所有选择的地区
        platform: '' // 所属平台
      }
      // data.name = '' // 清空分组名
      data.chooseConditionList = []
    }
    // 类型选择
    function changeType() {
      if (data.complexType === 1) {
        clearPropNew()
        nextTick(() => {
          chooseCondition(data.conditionList[2], 2)
        })
      } else {
        clearPropNew()
      }
    }
    return {
      fatherList,
      changeType,
      rules,
      data,
      chooseCondition,
      changeConditionList,
      changeFans,
      changeVideoNum,
      changeLiveNum,
      changeUserType,
      changeMatrixType,
      changeMatrixNameList,
      changePlatform,
      addMatrix,
      removeOne,
      SearchOk,
      SearchClear,
      changeRegion,
      saveCondition,
      counting,
      clearProp,
      saveGroup,
      formRef,
      goBack,
      retEmit,
      saveDis
    }
  }
}
</script>

<style lang="scss" scoped>
.rightBox {
  width: 100%;
  height: 100%;
  display: flex;
  .left_box {
    min-width: 770px;
    flex: 1;
    background: #fff;
    border-radius: 5px;
    position: relative;
    .left_header {
      height: 60px;
      display: flex;
      align-items: center;
      padding-left: 25px;
      border-bottom: 1px solid #f7f7f7;
      line-height: 60px;
      font-size: 16px;
      font-weight: 400;
      color: #333;
      .el-icon {
        cursor: pointer;
        margin-right: 10px;
      }
    }
    .has_choose {
      margin: 24px 30px 0;
      height: 48px;
      background: #f6f7f8;
      font-size: 14px;
      font-weight: 700;
      color: #333;
      line-height: 22px;
      line-height: 48px;
      letter-spacing: 1px;
      padding-left: 20px;
      margin-bottom: 14px;
    }

    .choose_box {
      padding: 20px 24px;
      display: flex;
      align-items: center;
      .check_box {
        position: relative;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        white-space: nowrap;
        -webkit-user-select: none;
        user-select: none;
      }
      .checkbox_input {
        display: inline-block;
        width: 16px;
        height: 16px;
        background: #fff;
        border-radius: 2px;
        border: 1px solid #dcdee0;
        box-sizing: border-box;
        margin-right: 8px;
        transition: transform 0.15s ease-in 50ms;
      }
      .checkbox_input::after {
        box-sizing: content-box;
        content: '';
        border: 2px solid #fff;
        border-left: 0;
        border-top: 0;
        height: 9px;
        left: 6px;
        position: absolute;
        top: 1px;
        transform: rotate(45deg) scaleY(0);
        width: 3px;
        transition: transform 0.15s ease-in 50ms;
        transform-origin: center;
      }
      .checkbox_input_active {
        .checkbox_input {
          background: #364fcd;
          border: 1px solid #364fcd;
        }
        .checkbox_input::after {
          transform: rotate(45deg) scaleY(1);
        }
        .checkbox_label {
          color: #364fcd;
        }
      }
      .checkbox_label {
        margin-right: 24px;
      }
    }
    .screening_content_one {
      overflow-y: auto !important;
      height: calc(100% - 160px) !important;
      max-height: calc(100% - 160px) !important;
    }
    .screening_content {
      padding: 0 30px;
      height: calc(100% - 280px);
      overflow-y: auto;
      &::-webkit-scrollbar {
        display: none;
      }
    }
    .screening_content.is_show_count {
      max-height: calc(100% - 316px);
      height: auto;
    }
    .screening_num {
      height: 36px;
      line-height: 36px;
      background: #fff;
      text-indent: 24px;
      width: 100%;
      font-size: 14px;
    }
    .footer_btn {
      position: absolute;
      height: 56px;
      left: -16px;
      right: 0;
      bottom: -15px;
      border-top: 1px solid #f7f7f7;
      text-align: center;
      line-height: 56px;
      background: #fff;
      width: calc(100% + 32px);
    }
  }
  .right_box {
    width: 360px;
    min-width: 360px;
    background: #fff;
    margin-left: 22px;
    border-radius: 5px;
    .right_header {
      height: 60px;
      padding-left: 25px;
      border-bottom: 1px solid #f7f7f7;
      .title {
        line-height: 60px;
        font-size: 16px;
        font-weight: 400;
        color: #333;
      }
    }
    .right_content {
      padding: 26px 8px 26px 18px;
      width: calc(100% - 26px);
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
      flex-wrap: wrap;
      .oneCondition {
        cursor: pointer;
        padding: 8px 28px;
        background: #f7f7f7;
        border-radius: 4px;
        font-size: 16px;
        font-weight: 400;
        color: #333333;
        line-height: 22px;
        letter-spacing: 1px;
        margin-bottom: 18px;
        margin-right: 10px;
        border: 1px solid #f7f7f7;
      }
      .active {
        font-weight: 500;
        color: #364fcd;
        // background: #f2f9ff;
        background: #eff3fd;
        border-radius: 4px;
        border: 1px solid #364fcd;
      }
    }
  }
}
</style>
