<template>
  <div class="row-bottom-overlay-section">
    <div :style="style">
      <slot></slot>
    </div>
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
        left: this.lengthOfNonCoveredArea+ 'px',
        // TODO make sure that this - 40 is taken care of nicely
        width: (this.totalWidth - 40) + 'px'
      }
    }
  }
};
</script>

<style lang='scss'>
.row-bottom-overlay-section {
    position: absolute !important;
    z-index: 100 !important;
    height: 0px;
}

</style>
