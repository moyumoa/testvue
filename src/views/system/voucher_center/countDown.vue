<template>
  <span :class="[...countDownClass]">
    {{
      hour
        ? hourString + ':' + minuteString + ':' + secondString
        : minuteString + ':' + secondString
    }}
  </span>
</template>

<script setup>
const props = defineProps({
  totalSeconds: {
    type: Number,
    default: 0
  },
  countDownClass: {
    type: Array
  }
})
const emits = defineEmits('countDownEnd')
const hour = ref('')
const minutes = ref('')
const seconds = ref('')
const timer = ref('')

function countDown() {
  clearInterval(timer.value)
  timer.value = setInterval(function () {
    if (hour.value === 0) {
      if (minutes.value !== 0 && seconds.value === 0) {
        seconds.value = 59
        minutes.value -= 1
      } else if (minutes.value === 0 && seconds.value === 0) {
        seconds.value = 0
        emits('countDownEnd', true)
        clearInterval(timer.value)
      } else {
        seconds.value -= 1
      }
    } else {
      if (minutes.value !== 0 && seconds.value === 0) {
        seconds.value = 59
        minutes.value -= 1
      } else if (minutes.value === 0 && seconds.value === 0) {
        hour.value -= 1
        minutes.value = 59
        seconds.value = 59
      } else {
        seconds.value -= 1
      }
    }
  }, 1000)
}

function formatNum(num) {
  return num < 10 ? '0' + num : '' + num
}

const hourString = computed(() => {
  return formatNum(hour.value)
})

const minuteString = computed(() => {
  return formatNum(minutes.value)
})

const secondString = computed(() => {
  return formatNum(seconds.value)
})

watch(
  () => props.totalSeconds,
  val => {
    if (val) {
      hour.value = Math.floor(val / 3600)
      minutes.value = Math.floor((val / 60) % 60)
      seconds.value = Math.floor(val % 60)
      countDown()
    }
  },
  { deep: true, immediate: true }
)
</script>
