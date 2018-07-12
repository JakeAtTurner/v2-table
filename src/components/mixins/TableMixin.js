import Bus from '../../bus.js';
import findIndex from 'lodash.findindex';
import { applyFilters } from '../../common/filtering';
import { createSortFunction } from '../../common/sorting';

/**
 * REFS --
 *      content -
 *      tableArea - 
 *      headers -
 *      header -
 *      leftBody -
 *      rightBody - 
 *      footer - 
 */

const tableMixin = {
  props: {
    data: {
        type: Array,
        default: () => [],
        required: true
    },
    sort: {
        type: Object,
        default: () => {
            return {
                prop: '',
                order: 'ascending', // ['ascending', 'descending'],
                type: String
            };
        }
    },
    border: {   // Not sure if this should be here
        type: Boolean,
        default: false
    },
    stripe: {   // Not sure if this should be here
        type: Boolean,
        default: false
    },
    loading: { // not sure if this should be here
        type: Boolean,
        default: false
    },
    emptyText: {    // not sure if tyhis should be here
        type: String,
        default: 'No Data'
    },
    paginationInfo: {
        type: Object,
        default: () => {
            return {
                text: '',
                pageSize: 10,
                nextPageText: 'Next',
                prePageText: 'Prev'
            };
        }
    },
    total: {    // should probably reconsider how this is computed
        type: Number,
        default: 0
    },
    rowHeight: {
        type: [Number, String],
        default: 40
    },
    // column header height
    colHeight: {    // Isnt this the same as rowHeight.....
        type: [Number, String],
        default: 40
    },
    shownPagination: {  // should not have a boolean for pagination.... Not sure...
        type: Boolean,
        default: false
    },
    height: {   // Another Height thing... so much out of context, assuming this is the height of the table
        type: [Number, String],
        default: 'auto'
    },
    showSummary: {  // All the Summary stuff should be in its own class/object
        type: Boolean,
        default: false
    },
    sumText: {
        type: String,
        default: 'Sum'
    },
    summaryMethod: Function,
    rowClassName: [String, Function],
    lazyLoad: {
        type: Boolean,
        default: false
    },
    hoverOverlayComponent: String,
    bottomOverlayComponent: String,
    overlayColumnStart: {   // this is where the overlay will start after when the overlay displays
        type: Number,
        default: 1
    },
    windowData: {
        type: Boolean,
        default: false
    },
    externalFiltering: Function,
    onSort: Function
  },

  provide () {
      return {
          table: this
      };
  },

  data () {
      const ch = Number.parseInt(this.height, 10);
      const rh = Number.parseInt(this.rowHeight, 10);
      const voewportMin = 100;
      return {
          rows: [],   // TODO change the name to displayed rows
          columns: [],
          leftColumns: [],
          rightColumns: [],
          selectionColumn: null,
          selectedBottomOverlayIndex: null,

          displayData: [],
          __sortingFunc: (d) => d,
          // row select status
          selectedIndex: [],
          isAll: false,
          isIndeterminate: false,

          containerWith: 0,
          __sort: {
              prop: '',
              order: ''
          },

          eventBus: null,
          scrollbar: null,
          isContainerScroll: true, // Whether scroll event binding table-container element or table-body element

          curPage: 1,
          totalPage: 1,
          renderPages: [],
          pageDiff: 2,

          // Windowing
          increaseWindowHeight: 3000, /** [NUMBER] this is the height that the windowed data increases and decreases by*/

          // for on demand loading
          VOEWPORT_MIN_HEIGHT: voewportMin,
          ITEM_MIN_HEIGHT: 20,
          // TODO rh is not a valid number, it does not contain the row Height all the time
          // need to ensure that this is always correct
          // there is a way to get the rh, it is using the 
          // BEFORE rh: (this.isValidNumber(rh) || rh <= this.ITEM_MIN_HEIGHT) ? this.ITEM_MIN_HEIGHT : rh,
          rh: 58, // AFTER: this will service my needs all my rows have 56 hieght
          bodyHeight: voewportMin,
          contentMarginTop: 0,
          scrollTop: 0,
          scrollLeft: 0,

          // Styles
          bodyStyle: null
      };
  },

  computed: {
      isEmpty () {
          return !this.displayData || !this.displayData.length;
      },
      contentWidth () {
          let bodyMinWidth = 0;
          this.columns.forEach(column => {
              const colWidth = isNaN(parseInt(column.width, 10)) ? 90 : parseInt(column.width, 10);
              bodyMinWidth = bodyMinWidth + colWidth;
          });
          // < this.containerWith ? this.containerWith : bodyMinWidth
          return bodyMinWidth;
      },
      leftContainerWidth () {
          return this.getFixedContainerWidth(this.leftColumns);
      },
      rightContainerWidth () {
          return this.getFixedContainerWidth(this.rightColumns);
      },
      isMetLazyLoad () {
          const booleanValue = this.lazyLoad && !this.shownPagination && this.bodyHeight > this.VOEWPORT_MIN_HEIGHT;
          return booleanValue;
      },
      tbodyHeight () {
          return Math.ceil(this.bodyHeight / this.rh) * this.rh;
      },
      heightOfAllData () {
          return Math.ceil(this.displayData.length * this.rh);
      },
      heightOfScrollingArea () {
          return this.isMetLazyLoad || this.windowData ? this.heightOfAllData : this.$refs.content.scrollHeight;
      },
      columnSlots () {
        return this.$slots.default.filter(column => {
            return column.componentInstance && column.componentInstance.$options.name === 'v2-table-column'
        }).map(column => column.componentInstance);
      },
      sectionSlots () {
        return this.$slots.default.filter(column => {
            return column.componentInstance && column.componentInstance.$options.name === 'v2-table-section'
        }).map(column => column.componentInstance);
      },
      columnsFromSections () {
        return this.sectionSlots.map(section => section.columns)
      }
  },
  beforeUpdate () {
      const fun = () => {
          const columnComponents = this.columnSlots;
          if (columnComponents.length > 0) {
              this.setColumns(columnComponents);
          } else {
              setTimeout(fun, 50);
          }
      };
      fun();
  },
  watch: {
      data: {
          deep: true,
          immediate: true,
          handler (val) {
              if (val.length > 0) {
                  this.displayData = [].concat(val);
                  this.filter();
              }
          }
      },

      total (val) {
          if (val > 0 && this.shownPagination) {
              this.computedTotalPage();
          }
      },

      curPage () {
          this.resetSelection();
      },

      scrollTop (val) {
          this.adjustRows();
      }
  },

  methods: {
      // exposed table method 
      toggleRowSelection (row, selected) {
          const curIndex = findIndex(this.rows, row);

          if (curIndex >= 0) {
              if (typeof selected === 'undefined') {
                  this.toggleSelect(curIndex);
              } else {
                  if (selected) {
                      this.toggleSelect(curIndex);
                  } else if (!selected && this.selectedIndex.includes(curIndex)) {
                      this.handleRowSelect(false, curIndex);
                  }
              }
          }
      },
      setBottomOverlay (rowIndex) {
            if (this.selectedBottomOverlayIndex === rowIndex) {
                this.selectedBottomOverlayIndex = null;
            } else {
                this.selectedBottomOverlayIndex = rowIndex;
            }
      },
      handleScrollingAndAdjustments () {
        // Whether scroll event binding table-container element or table-body element
        if (this.leftColumns.length || this.rightColumns.length || this.bodyHeight > this.VOEWPORT_MIN_HEIGHT) {
            this.isContainerScroll = false;
        }

        if (this.total > 0 && this.shownPagination) {
            this.computedTotalPage();
        }
        this.computeBodyStyle();
        window.addEventListener('resize', this.computeBodyStyle);
      },

      computeBodyStyle () {
          setTimeout(() => {
              if (this.setSectionWidths) {
                  this.setSectionWidths()
              }
              let heightOfBody = null;
              if (this.$refs.tableArea) {
                  heightOfBody = this.$refs.tableArea.offsetParent.offsetHeight;
                  heightOfBody -= 40; // offset for the cell height, look in table-header for the 40 px offset
                  // TODO need to get the constants organized better
              }
              this.bodyStyle = {
                  width: this.isContainerScroll ? this.contentWidth + 'px' : '100%',
                  height: heightOfBody ? heightOfBody + 'px' : null
              };
          }, 10);
      },

      updateScrollbar () {
          if (this.scrollbar) {
              this.$nextTick(() => {
                  this.scrollbar.update({
                      contentWidth: this.$refs.content.scrollWidth,
                      contentHeight: this.heightOfScrollingArea
                  });
              });
          }
      },
      // exposed table method --end

      toggleSelect (rowIndex) {
          if (this.selectedIndex.includes(rowIndex)) {
              this.handleRowSelect(false, rowIndex);
          } else {
              this.handleRowSelect(true, rowIndex);
          }
      },

      getFixedContainerWidth (columns) {
          let containerWidth = 0;

          columns.forEach(column => {
              const colWidth = isNaN(parseInt(column.width, 10)) ? 90 : parseInt(column.width, 10);
              containerWidth = containerWidth + colWidth;
          });

          return containerWidth;
      },

      sortChange (col) {
          const { prop } = col;
          let order = 'ascending';

          if (this.__sort.prop === prop) {
              order = this.__sort.order === 'descending' ? 'ascending' : 'descending';
          }
          this.__sort = Object.assign({}, {
              prop: prop,
              order: order,
              type: col.type
          });
          if (this.onSort) {
              this.onSort(this.__sort);
          }
          this.resetDataOrder();
      },
      filter () {
          let data = this.data;
          if (this.$refs.headers) {
              // TODO when you implement the filters, make sure that you get the values of the filters
              const headers = this.$refs.headers

              let filters = []
              if (Array.isArray(headers)) {
                filters = this.$refs.headers.reduce((arr, header) => {
                    return arr.concat(header.getFilters())
                }, []);
              } else {
                filters = this.$refs.headers.getFilters();
              }
              data = applyFilters(filters, data);
          }
          if (this.externalFiltering) {
              data = this.externalFiltering(data);
          }
          this.displayData = [].concat(data);
          this.sortDisplayData();
          this.initRows();
      },
      resetDataOrder () {
          this.sortDisplayData();
          this.initRows();
      },
      setSortingFunction () {
          if (this.__sort && this.__sort.prop) {
              this.__sortingFunc = createSortFunction(this.__sort.prop, this.__sort.order, this.__sort.type);
          } else {
              this.__sortingFunc = (data) => data;
          }
      },
      sortDisplayData () {
          this.setSortingFunction();
          this.displayData = [].concat(this.displayData).sort(this.__sortingFunc);
      },
      changeCurPage (e) {
          let page = e.target.dataset ? e.target.dataset.page : e.target.getAttribute('data-page');

          if (!page) {
              return;
          }
          if (page === 'prev') {
              page = (this.curPage - 1) >= 1 ? this.curPage - 1 : 1;
          }

          if (page === 'next') {
              page = (this.curPage + 1) <= this.totalPage ? (this.curPage + 1) : this.totalPage;
          }

          if (page === this.curPage) {
              return;
          }

          this.curPage = parseInt(page, 10);
          this.$emit('page-change', parseInt(page, 10));
          
          if (this.totalPage > 7) {
              this.getRenderPages();
          }
      },

      computedTotalPage () {
          if (isNaN(parseInt(this.total, 10))) {
              return;
          }
          
          const totalPage = Math.ceil(parseInt(this.total, 10) / (this.paginationInfo.pageSize || 10));
          this.totalPage = totalPage > 1 ? totalPage : 1;                
          this.getRenderPages();
      },

      getRenderPages () {
          const pages = [];
          const middlePage = this.curPage;

          let start = (middlePage - this.pageDiff) > 1 ? middlePage - this.pageDiff : 1;
          let end = (middlePage + this.pageDiff) < this.totalPage ? middlePage + this.pageDiff : this.totalPage;

          start = ((this.totalPage - middlePage) < 3 && this.totalPage - middlePage >= 0) ? (this.totalPage - 5) : start;
          end = (end <= 6 && this.totalPage >= 6) ? 6 : end;

          start = start > 0 ? start : 1;

          for (let i = start; i <= end; i++) {
              pages.push({
                  page: i,
                  text: i
              });
          }
          if (start !== 1) {
              pages.unshift({
                  page: 1,
                  text: start - 1 > 1 ? `...1` : 1
              });
          }

          if (end !== this.totalPage) {
              pages.push({
                  page: this.totalPage,
                  text: (this.totalPage - end > 1 && this.totalPage > 7) ? `...${this.totalPage}` : this.totalPage
              });
          }

          this.renderPages = [].concat(pages);   
      },

      // 固定头部时更改头部的 scroll left
      updateHeaderWrapScrollLeft () {
          const ele = this.scrollbar.element;
          if (!this.isContainerScroll) {
              this.$refs.header.scrollLeft = ele.scrollLeft;
          }

          if (this.leftColumns.length) {
              this.$refs.leftBody.scrollTop = ele.scrollTop;
          }

          if (this.rightColumns.length > 0) {
              this.$refs.rightBody.scrollTop = ele.scrollTop;
          }

          if (this.$refs.footer) {
              this.$refs.footer.scrollLeft = ele.scrollLeft;
          }
          
          this.scrollTop = ele.scrollTop;
          this.scrollLeft = ele.scrollLeft;
      },

      isValidNumber (number) {
          return isNaN(parseInt(number, 10));
      },

      getColumnComponentsByType (columns, type) {
          let cols = [];
          switch (type) {
              case 'selection':
                  cols = columns.filter(column => column.type === 'selection');
                  cols = cols.length > 1 ? [cols[0]] : cols; 
                  break;
              case 'left':
                  cols = columns.filter(column => (column.fixed === 'left' && column.type !== 'selection'));
                  break;
              case 'right':
                  cols = columns.filter(column => (column.fixed === 'right' && column.type !== 'selection'));
                  break;  
              default:
                  cols = columns.filter(column => {
                      return !['left', 'right'].includes(column.fixed) && column.type !== 'selection';
                  });
                  break;  
          }

          return cols;
      },

      resetSelection () {
          this.selectedIndex = [];
          this.isAll = false;
          this.isIndeterminate = false;
          this.emitSelectChange();
      },

      handleRowSelect (isChecked, rowIndex) {
          if (isChecked) {
              this.selectedIndex.push(rowIndex);
          } else {
              const delIndex = this.selectedIndex.indexOf(rowIndex);
              this.selectedIndex.splice(delIndex, 1);
          }
      
          this.isAll = this.selectedIndex.length === this.displayData.length;
          this.isIndeterminate = this.selectedIndex.length > 0 && !this.isAll;
          this.$nextTick(() => {
              this.emitSelectChange();
          });
      },

      getAllSelectedRows () {
          if (!this.uniqueField) {
              return Array.from(Array(this.displayData.length).keys());
          }
          return this.displayData.map(item => item[this.uniqueField]);
      },

      handleRowSelectAll (isChecked) {
          this.isAll = isChecked;
          this.isIndeterminate = false;
          this.selectedIndex = isChecked ? this.getAllSelectedRows() : [];
          this.$nextTick(() => {
              this.emitSelectChange();
          });
      },

      initRows () {
          if (this.displayData.length) {
              if (this.isMetLazyLoad) {
                  this.setRenderedRows();
              } else if (this.windowData) {
                  this.setRenderedRowsBasedOffWindow();
              } else {
                  this.rows = [].concat(this.displayData);
              }
          }
          this.rows = this.rows.slice(0, 200);
      },

      adjustRows () {
          if (this.isMetLazyLoad) {
              this.setRenderedRows();
          } else if (this.windowData) {
              this.setRenderedRowsBasedOffWindow();
          }
      },
      setRenderedRows () {
          // TODO I do not like the idea of using [].concat  need faster shifting here...
          this.rows = [].concat(this.getRenderRows());
      },
      setRenderedRowsBasedOffWindow () {
          // TODO need to figure out the best way to seperat the row and the new array generated
          this.getWindowedRenderedRows();
      },

      getWindowedRenderedRows () {
          // TODO not sure if rh is up to date, need to make sure if it is the value of the actual height
          let startingRowLength = this.rows.length;
          const maxRowLength = this.displayData.length;
          const showingAllData = startingRowLength === maxRowLength;
          if (showingAllData) {
              return;
          }
          const thresholdMark = 0.2;
          const seenHeight = this.scrollTop + this.tbodyHeight;
          const currentMaxHeight = this.rh * startingRowLength;
          const threshold = 1 + thresholdMark;
          const belowThreshold = 2 + thresholdMark;
          const thresholdHeight = seenHeight * threshold;
          const minimumHeight = this.increaseWindowHeight;
          const minimumDataLength = Math.ceil(minimumHeight / this.rh);
          const hasMetMinimum = startingRowLength >= minimumDataLength;
          const isAboveThreshold = thresholdHeight > currentMaxHeight;
          const differenceInHeight = seenHeight - currentMaxHeight;
          const needToDecreaseNumberOfRowsSeen = differenceInHeight > (this.increaseWindowHeight * belowThreshold);
          let maxAmountToAdd = 0;
          if (!hasMetMinimum) {
              startingRowLength = 0;
              maxAmountToAdd = minimumDataLength;
          } else if (needToDecreaseNumberOfRowsSeen) {
              // decrease it by 1 increase in Windowed Height
              const decreaseAmount = Math.ceil(this.increaseWindowHeight / this.rh);
              const startSplice = startingRowLength - decreaseAmount;
              const canDecrease = startSplice > minimumDataLength;
              if (canDecrease) {
                  this.rows = this.rows.splice(0, startSplice);
              }
              return;
          } else if (isAboveThreshold && !showingAllData) {
              const amountToAdd = Math.ceil(this.increaseWindowHeight / this.rh);
              maxAmountToAdd = startingRowLength + amountToAdd;
          }
          for (let i = startingRowLength; i < maxRowLength && i < maxAmountToAdd; i++) {
              this.rows.push(Object.assign({}, this.displayData[i], {
                  __index: i
              }));
          }
      },

      getRenderRows () {
          const list = [];
          const from = Math.floor(this.scrollTop / this.rh); 
          const to = Math.ceil((this.scrollTop + this.tbodyHeight) / this.rh);
          for (let i = from; i < to; i++) {
              if (typeof this.displayData[i] !== 'undefined') {
                  list.push(Object.assign({}, this.displayData[i], {
                      __index: i
                  }));
              }
          }

          this.contentMarginTop = from * this.rh;
          this.from = from;
          this.to = to;
          return list;
      }
  },

  created () {
      this.__sort = Object.assign({}, this.sort, {
          order: this.sort.order || 'ascending',
          type: this.sort.type || String
      });
      if (this.height !== 'auto' && !this.isValidNumber(this.height)) {
          this.bodyHeight = parseInt(this.height, 10) > this.VOEWPORT_MIN_HEIGHT ? parseInt(this.height, 10) : this.VOEWPORT_MIN_HEIGHT;
      }
  },

  mounted () {
      if (!Bus._Vue) {
          throw new Error('[v2-table]: Must be call Vue.use(v2-table) before used');
      }
      if (this.hoverOverlayComponent && this.bottomOverlayComponent) {
          throw new Error('Shouldnt have both the hoverOverlayComponent' +
            ' and the bottomOverlayComponent assign a value, only choose one,  or make it happen')
      }
  },

  beforeDestroy () {
      this.scrollbar && this.scrollbar.destroy();
      if (this.container) {
          this.container.removeEventListener('bs-update-scroll-value',
          this.updateHeaderWrapScrollLeft, false);                
      }
      window.removeEventListener('resize', this.computeBodyStyle);
  }
}

export default tableMixin
