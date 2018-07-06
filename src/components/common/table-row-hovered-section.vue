<template>
  <div class="row_hover_overlay">
      <div :style="nameStyle" >
      </div>
      <!-- The row_hover_overlay__overLayPortion is the custom CSS for the background color -->
      <div class="row_hover_overlay__overLayPortion" :style="overlayStyle">
          <div class="table-hover-over-background row_hover_overlay__background"></div>
          <slot></slot>
      </div>
  </div>
</template>

<script>
export default {
    props: {
        nameStyle: Object,
        overlayStyle: Object
    }
};
</script>

<style>
.table-hover-over-background {
    position: absolute !important;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1000;
}
</style>
