<template>
    <!--
        SLOTS:
            tableHeader - this is a component that is above the table headers.
            empty - when the data is empty.
            loading - when the user will be waiting for the component to be loaded.

        COMPONENTS:
            hoverOverlayComponent - this is the Hover Overlay Componet that appears when you hover over a row.
    -->
    <div class="v2-table-container">
        <!-- TODO need to complete the classes and styleing -->
        <div class="v2-table__header-dashboard">
            <slot name='tableHeader'></slot>
        </div>
        <template v-if="isEmpty">
            <!-- Empty data -->
            <template v-if="isEmpty">
                <slot name="empty">
                    <div class="v2-table__empty-default">
                        <empty-icon></empty-icon>
                        <span class="v2-table__empty-text" v-text="emptyText"></span>
                    </div>
                </slot>
            </template>
        </template>
        <template v-else>
            <div>
                <div :class="[
                    'v2-table',
                    {
                        'v2-table__striped': stripe
                    }
                ]" ref="table">
                    
                    <div class="v2-table__table-wrapper">
                        <div class="v2-table__table-container" ref="container">
                            <!-- 解耦 checkbox 和 table 在DOM结构上的耦合-->
                            <!-- <checkboxList v-if="selectionColumn" 
                                :column="selectionColumn" 
                                :left="scrollLeft"
                                :top="scrollTop">
                            </checkboxList> -->
                            <!-- header -->
                            <div class="v2-table__header-wrapper" ref="header" :style="{width: isContainerScroll ? contentWidth + 'px' : '100%'}">
                                <div :class="[
                                    'v2-table__header',
                                    {
                                        'v2-table__border': border,
                                        'v2-table__header-border': border
                                    }
                                ]" 
                                :style="{width: !isContainerScroll ? contentWidth + 'px' : '100%'}">
                                    <table-col-group :columns="columns"></table-col-group>
                                    <table-header :columns="columns" :sort="sort" ref="headers"></table-header>
                                </div>
                            </div>

                            <!-- body -->
                            <div class="v2-table__body-wrapper" ref="body" :style="{width: isContainerScroll ? contentWidth + 'px' : '100%', height: bodyHeight > VOEWPORT_MIN_HEIGHT ? bodyHeight + 'px' : 'auto'}">
                                <div :class="[
                                    'v2-table__body',
                                    {
                                        'v2-table__border': border,
                                        'v2-table__body-border': border
                                    }
                                ]" 
                                ref="content" 
                                :style="{width: !isContainerScroll ? contentWidth + 'px' : '100%', marginTop: contentMarginTop + 'px'}">
                                    <table-col-group :columns="columns" v-if="displayData && displayData.length > 0"></table-col-group>
                                    <div class="v2-table__table-tbody" v-if="displayData && displayData.length > 0">
                                            <table-row 
                                                v-for="(row, index) in rows"
                                                :key="index" 
                                                :row="row"
                                                :rowIndex="index"
                                                :columns="columns"
                                                :hoverOverlayComponent="hoverOverlayComponent">
                                            </table-row>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- footer -->
                            <div class="v2-table__footer-wrapper" ref="footer" :style="{width: isContainerScroll ? contentWidth + 'px' : '100%'}">
                                <table-footer type="normal" :cols="columns" v-if="showSummary" v-show="displayData && displayData.length > 0"></table-footer>
                            </div>

                            <!-- Table loading -->
                            <div class="v2-table__data-loading" v-if="loading">
                                <slot name="loading">
                                    <div class="v2-table__loading-spinner">
                                        <svg viewBox="25 25 50 50" class="circular"><circle cx="50" cy="50" r="20" fill="none" class="path"></circle></svg>
                                    </div>
                                </slot>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
        <!-- Have to keep this in to have the rows show up -->
        <div v-show="false">
            <slot></slot>
        </div>
    </div>
</template>

<script>
    import BeautifyScrollbar from 'beautify-scrollbar';
    import findIndex from 'lodash.findindex';
    import Bus from '../bus.js';
    import {applyFilters} from '../common/filtering'

    import TableHeader from './table-header.js';
    import TableColGroup from './table-col-group.vue';
    import TableRow from './table-row.vue';
    import EmptyIcon from './empty-icon.vue';
    import TableFooter from './table-footer.vue';
    import CheckboxList from './checkbox-list.vue';
    import {createSortFunction} from '../common/sorting'

    export default {
        name: 'v2-table',
        props: {
            data: {
                type: Array,
                default: () => [],
                required: true
            },
            defaultSort: {
                type: Object,
                default: () => {
                    return {
                        prop: '',
                        order: 'ascending' // ['ascending', 'descending']
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
            windowData: {
                type: Boolean,
                default: false
            },
            externalFiltering: Function
        },

        provide () {
            return {
                table: this
            };
        },

        data () {
            const ch = Number.parseInt(this.height, 10);
            const rh = Number.parseInt(this.rowHeight, 10);

            let voewportMin = 100;

            return {
                rows: [],   // TODO change the name to displayed rows
                columns: [],
                leftColumns: [],
                rightColumns: [],
                selectionColumn: null,

                displayData: [],
                __sortingFunc: (d) => d,
                // row select status
                selectedIndex: [],
                isAll: false,
                isIndeterminate: false,

                containerWith: 0,
                sort: {
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
                increaseWindowHeight: 3000, /**[NUMBER] this is the height that the windowed data increases and decreases by*/

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
                scrollLeft: 0
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
                let booleanValue = this.lazyLoad && !this.shownPagination && this.bodyHeight > this.VOEWPORT_MIN_HEIGHT;
                return booleanValue
            },
            tbodyHeight () {
                return Math.ceil(this.bodyHeight / this.rh) * this.rh;
            },
            heightOfAllData () {
                return Math.ceil(this.displayData.length * this.rh);
            },
            heightOfScrollingArea () {
                return this.isMetLazyLoad || this.windowData ? this.heightOfAllData : this.$refs.content.scrollHeight
            }
        },
        beforeUpdate () {
            const fun = () => {
                const timeout = () => setTimeout()
                const columnComponents = this.$slots.default
                    .filter(c => c.tag && c.tag.indexOf('v2-table-column') !== -1 && c.componentInstance)
                    .map(column => column.componentInstance);
                if (columnComponents.length > 0) {
                    const tags = this.$slots.default.map(c => c.tag)
                    this.setColumns(columnComponents)
                } else {
                    setTimeout(fun, 50)
                }
            }
            fun()
        },
        watch: {
            data: {
                deep: true,
                immediate: true,
                handler (val) {
                    this.displayData = val
                }
            },
            displayData (val) {
                this.initRows()
                // TODO implement for the scrollbar update...
                // if (this.isMetLazyLoad) {
                //     this.initRenderRows();
                //     if (this.scrollbar) {
                //         this.updateScrollbar();
                //     }
                // } else {
                //     this.rows = [].concat(val);
                // }

                // if (this.updatedSelection && this.selectedIndex.length > 0) {
                //     this.emitSelectChange();
                //     return;
                // } 

                if (this.selectedIndex.length > 0) {
                    // reset selection status.
                    this.resetSelection();
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
                this.adjustRows()
            },
            '$slots' () {
                console.log('CHANGED SLOTS');
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

                if (this.sort.prop === prop) {
                    order = this.sort.order === 'descending' ? 'ascending' : 'descending';
                }
                this.sort = Object.assign({}, {
                    prop: prop,
                    order: order
                });
            },
            filter () {
                let data = this.data
                let filters = this.$refs.headers.getFilters()
                data = applyFilters(filters, data)
                if (this.externalFiltering) {
                    data = this.externalFiltering(data)
                }
                this.displayData = data
                this.sortDisplayData()
            },
            resetDataOrder (prop, order, type) {
                this.__sortingFunc = createSortFunction(prop, order, type)
                this.sortDisplayData()
            },
            sortDisplayData () {
                this.displayData = [].concat(this.displayData.sort(this.__sortingFunc))
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

            emitSelectChange () {
                const rows = [];
                // if (this.uniqueField) {
                //     this.selectedIndex.forEach(item => {
                //         const r = this.displayData.filter(d => d[this.uniqueField] === item);
                //         rows = [].concat(...rows, ...r);
                //     });
                // } else {
                    
                // }
                // row-index
                this.selectedIndex.forEach(item => {
                    rows.push(this.displayData[item]);
                });

                this.$emit('select-change', rows);
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
                        this.setRenderedRowsBasedOffWindow()
                    }
                    else {
                        this.rows = [].concat(this.displayData);
                    }
                }
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
                this.getWindowedRenderedRows()
            },

            getWindowedRenderedRows () {
                // TODO not sure if rh is up to date, need to make sure if it is the value of the actual height
                debugger;
                let startingRowLength = this.rows.length;
                const maxRowLength = this.displayData.length;
                const showingAllData = startingRowLength === maxRowLength;
                if (showingAllData) {
                    return
                }
                let thresholdMark = 0.2;
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
                    let decreaseAmount = Math.ceil(this.increaseWindowHeight / this.rh);
                    let startSplice = startingRowLength - decreaseAmount;
                    let canDecrease = startSplice > minimumDataLength;
                    if (canDecrease) {
                        this.rows = this.rows.splice(0, startSplice)
                    }
                    return 
                } else if (isAboveThreshold && !showingAllData) {
                    let amountToAdd = Math.ceil(this.increaseWindowHeight / this.rh);
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
            },
            setColumns (columnComponents) {
                const currentLabels = new Set(this.columns.map(c => c.label))
                const newLabels = new Set(columnComponents.map(c => c.label))
                let render = false
                if (currentLabels.size === newLabels.size) {
                    currentLabels.forEach(function(value) {
                        newLabels.delete(value)
                    });
                    render = newLabels.size > 0
                } else {
                    render = true
                }
                if (render) {
                    const selectionColumnComponents = this.getColumnComponentsByType(columnComponents, 'selection');
                    const normalColumnComponents = this.getColumnComponentsByType(columnComponents, 'normal');
                    const fixedLeftColumnComponents = this.getColumnComponentsByType(columnComponents, 'left');
                    const fixedRightColumnComponents = this.getColumnComponentsByType(columnComponents, 'right');

                    this.columns = [].concat(selectionColumnComponents, fixedLeftColumnComponents, normalColumnComponents, fixedRightColumnComponents);
                    this.leftColumns = fixedLeftColumnComponents.length > 0 ? [].concat(fixedLeftColumnComponents) : [].concat(fixedLeftColumnComponents);
                    this.rightColumns = [].concat(fixedRightColumnComponents);
                }
            }
        },

        created () {
            this.sort = Object.assign({}, this.defaultSort, {
                order: this.defaultSort.order || 'ascending'
            });
            if (this.height !== 'auto' && !this.isValidNumber(this.height)) {
                this.bodyHeight = parseInt(this.height, 10) > this.VOEWPORT_MIN_HEIGHT ? parseInt(this.height, 10) : this.VOEWPORT_MIN_HEIGHT;
            }
        },

        mounted () {
            if (!Bus._Vue) {
                throw new Error('[v2-table]: Must be call Vue.use(v2-table) before used');
            }

            this.containerWith = this.$el.clientWidth;
            const columnComponents = this.$slots.default
                .filter(column => column.componentInstance && column.componentInstance.$options.name === 'v2-table-column')
                .map(column => column.componentInstance);
            this.setColumns(columnComponents)

            this.initRows()

            // Whether scroll event binding table-container element or table-body element
            if (this.leftColumns.length || this.rightColumns.length || this.bodyHeight > this.VOEWPORT_MIN_HEIGHT) {
                this.isContainerScroll = false;
            }

            if (this.total > 0 && this.shownPagination) {
                this.computedTotalPage();
            }

            this.$nextTick(() => {
                let fun = () => {
                    this.container = this.isContainerScroll ? this.$refs.container : this.$refs.body;
                    this.scrollbar = new BeautifyScrollbar(this.container, {
                        contentWidth: this.$refs.content.scrollWidth,
                        contentHeight: this.heightOfScrollingArea
                    });
                    this.container.addEventListener('bs-update-scroll-value', this.updateHeaderWrapScrollLeft, false);
                }
                let done = false
                let genFunc = () => {
                    if (!done) {
                        if (this.$refs.container && this.$refs.body) {
                            fun()
                            done = true
                        } else {
                            setTimeout(genFunc, 250)
                        }
                    }
                }
                genFunc()
            });
        },

        components: {
            TableHeader,
            TableRow,
            EmptyIcon,
            TableColGroup,
            TableFooter,
            CheckboxList
        },

        beforeDestroy () {
            this.scrollbar && this.scrollbar.destroy();
            if (this.container) {
                this.container.removeEventListener('bs-update-scroll-value',
                this.updateHeaderWrapScrollLeft, false);                
            }
        }
    };
</script>

<style>
.filter-svg {
    font-size: 1.2em;
    overflow: visible;
    width: 1em;
    display: inline-block;
    height: 1em;
    vertical-align: -.125em;
    margin-left: 10px!important;
}
</style>
