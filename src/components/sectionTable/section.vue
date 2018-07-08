<!-- 
  This should contain the slots for the columns of the section
  A section can be seperate, meaning it is seperated
  this will increase the number of columns by int(NumOfColumns / 2)
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
      seperate: Boolean,
      backgroundColor: {
        type: String,
        default: 'white'
      },
      color: {
        type: String,
        default: 'black'
      },
      addToStyle: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    methods: {
      getStyle (width) {
        return {
          'display': 'inline-block',
          'width': width + 'px',
          'text-align': 'center',
          'height': '30px',
          'font-style': 'italic',
          'font-size': '1.5em',
          'border': '1px solid black',
          'background-color': this.backgroundColor,
          'color': this.color,
          ...this.addToStyle
        }
      }
    },
    computed: {
      columns () {
        const columns = this.$slots.default.filter(column => {
            return column.componentInstance &&
            column.componentInstance.$options.name === 'v2-table-column'
        }).map(column => column.componentInstance);
        if (this.seperate) {
          const seperateColumns = [];
          for (let i = 0; i < columns.length; i++) {
            if ( i > 0) {
              seperateColumns.push({
                width: 10,
                seperator: true
              });
            }
            seperateColumns.push(columns[i]);
          }
          return seperateColumns;
        } else {
          return columns;
        }
      },
      numberOfColumns () {
        const numOfColumns = this.columns.length;
        if (numberOfColumns === 0) {
          return 0;
        } else if (this.seperate) {
          return numberOfColumns + Math.floor(numberOfColumns / 2);
        } else {
          return numberOfColumns;
        }
      }
    }
  };
</script>
