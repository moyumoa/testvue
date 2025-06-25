<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    width="20px"
    height="20px"
    viewBox="0 0 24 24"
    style="margin-right: 6px"
    xml:space="preserve"
  >
    <rect x="0" y="0" width="4" height="7" fill="#7188ff" transform="scale(1 1.94336)">
      <animateTransform
        attributeType="xml"
        attributeName="transform"
        type="scale"
        values="1,1; 1,3; 1,1"
        begin="0s"
        dur="0.6s"
        repeatCount="indefinite"
      ></animateTransform>
    </rect>
    <rect x="10" y="0" width="4" height="7" fill="#7188ff" transform="scale(1 2.72331)">
      <animateTransform
        attributeType="xml"
        attributeName="transform"
        type="scale"
        values="1,1; 1,3; 1,1"
        begin="0.2s"
        dur="0.6s"
        repeatCount="indefinite"
      ></animateTransform>
    </rect>
    <rect x="20" y="0" width="4" height="7" fill="#7188ff" transform="scale(1 1.38997)">
      <animateTransform
        attributeType="xml"
        attributeName="transform"
        type="scale"
        values="1,1; 1,3; 1,1"
        begin="0.4s"
        dur="0.6s"
        repeatCount="indefinite"
      ></animateTransform>
    </rect>
  </svg>
</template>

<script setup></script>

<style lang="scss" scoped>
svg {
  transform: rotate(180deg);
  margin-bottom: 5px;
}
</style>
