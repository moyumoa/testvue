/*
 * @Author: Dong wen hao
 * @Date: 2022-03-23 19:44:48
 * @LastEditors: Dong wen hao
 * @LastEditTime: 2022-03-24 10:32:46
 * @Description: 任务列表操作相关
 */

import { setTask, deleteTask, sendLarkNoticeOfTask } from '@/api/market/task.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { getCreateTaskPath } from '@/utils/tools'

export default function taskListOfAction(vm, taskBaseInfo, getTaskList, handleClose, calendarData) {
  const router = useRouter()
  // 跳转任务数据详情
  function toTaskDataDetail(row) {
    router.push({
      path: taskBaseInfo.path,
      query: {
        itemId: row.id,
        type: taskBaseInfo.type
      }
    })
  }

  // 跳转任务详情
  function toTaskDetail(row) {
    router.push({
      path: getCreateTaskPath(row.type),
      query: {
        id: row.id
      }
    })
  }

  // 创建任务
  function toCreateTask() {
    vm.appContext.config.globalProperties.$tracking.clickBtn(113)
    router.push({
      path: getCreateTaskPath(taskBaseInfo.type),
      query: {
        type: taskBaseInfo.type
      }
    })
  }
  // 复制任务
  function copyTaskDetail(row) {
    router.push({
      path: getCreateTaskPath(row.type),
      query: {
        copyId: row.id
      }
    })
  }
  // 设置任务状态
  function setTaskStatus(opearteStatus, id) {
    let name = ''
    if (opearteStatus === 1) {
      name = '开启任务后，员工可正常查看/参与该任务，是否确认开启'
    } else if (opearteStatus === 2) {
      name = '任务将暂时停止，暂停后员工不可继续参与任务 ，是否确认暂停？'
    } else {
      name = '任务将终止，终止后不可再次开启，员工不可参与该任务，是否确认终止？'
    }
    ElMessageBox.confirm(name, '系统提醒', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      setTask({
        opearteStatus: opearteStatus,
        taskId: id
      }).then(res => {
        if (calendarData) {
          calendarData.isAction = true
        }
        ElMessage.success(res.msg)
        getTaskList()
      })
    })
  }

  // 删除任务
  function delTask(id, type) {
    ElMessageBox.confirm('任务删除不可恢复，请再次确认当前操作', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      deleteTask({ taskId: id }).then(res => {
        ElMessage.success(res.msg)
        if (type === 'dialog') {
          handleClose()
        } else {
          getTaskList()
        }
      })
    })
  }
  // 发送通知
  function sendPass(id) {
    sendLarkNoticeOfTask({ taskId: id }).then(res => {
      // console.log(res)
      ElMessage.success(res.msg)
    })
  }

  return {
    toTaskDataDetail,
    toTaskDetail,
    copyTaskDetail,
    toCreateTask,
    setTaskStatus,
    delTask,
    sendPass
  }
}
