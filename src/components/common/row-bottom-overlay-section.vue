<template>
  <div class="row-bottom-overlay-section" :style="style">
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    heightOfRow: Number,
    lengthOfNonCoveredArea: Number,
    totalWidth: Number
  },
  computed: {
    style () {
      return {
        top: this.heightOfRow + 'px',
        left: this.lengthOfNonCoveredArea + 'px',
        width: this.totalWidth + 'px'
      }
    }
  }
};
</script>

<style lang='scss'>
.row-bottom-overlay-section {
    position: absolute !important;
    z-index: 100 !important;
    background-color: black;
    height: 20px;
}

</style>
