<template>
  <div class="row_hover_overlay">
      <!-- the name style is the technical location of the name of the table,
        we use it to define the first section in the table,
        this will make sure that the overlay does not cover up this section in the row
      -->
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

<style lang='scss'>
.row_hover_overlay {
    position: absolute !important;
    z-index: 100 !important;
    width: 100%;

    &__overLayPortion {
        float: left;
    }
}

.table-hover-over-background {
    position: absolute !important;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1000;
}

</style>
