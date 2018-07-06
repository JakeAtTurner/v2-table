<!-- 
  This should contain the slots for the columns of the section
  SLOTS -
    - default -this is where you put the v2-table-column s at so that we can have a column based section
-->
<template>
    <div>
        <slot></slot>
    </div>
</template>

<script>
  export default {
    name: 'v2-table-section',
    props: {
      label: String,
      seperate: Boolean
    },
    computed: {
      columns () {
        return this.$slots.default.filter(column => {
            return column.componentInstance &&
            column.componentInstance.$options.name === 'v2-table-column'
        }).map(column => column.componentInstance)
      }
    }
  };
</script>
