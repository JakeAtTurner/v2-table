<template>
    <!--
        SLOTS:
            tableHeader - this is a component that is above the table headers.
            empty - when the data is empty.
            loading - when the user will be waiting for the component to be loaded.

        COMPONENTS:
            hoverOverlayComponent - this is the Hover Overlay Componet that appears when you hover over a row.
    -->
    <div class="v2-table-container" ref="tableArea">
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
                                    <table-header :columns="columns" :sort="__sort" ref="headers"></table-header>
                                </div>
                            </div>

                            <template v-if="isLoading">
                                <slot name="loading"></slot>
                            </template>
                            <!-- body -->
                            <div v-if="!isLoading" class="v2-table__body-wrapper" ref="body" :style="bodyStyle">
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
                                                :key="rowKey ? row[rowKey] : index"
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
    import TableHeader from '../common/table-header.js';
    import TableColGroup from '../common/table-col-group.vue';
    import TableRow from '../common/table-row.vue';
    import EmptyIcon from '../common/empty-icon.vue';
    import TableFooter from '../common/table-footer.vue';
    import CheckboxList from '../common/checkbox-list.vue';
    import TableMixin from '../mixins/TableMixin'

    export default {
        name: 'v2-table',
        components: {
            TableHeader,
            TableRow,
            EmptyIcon,
            TableColGroup,
            TableFooter,
            CheckboxList
        },
        mixins: [TableMixin],
        mounted () {
            this.containerWith = this.$el.clientWidth;
            this.filter();
            this.handleScrollingAndAdjustments();
            this.setColumns();
        },
        computed: {
          rowClassName () {
            return ['v2-table__row']
          }
        },
        methods: {
            setColumns () {
                const columnComponents = this.columnSlots;
                const currentLabels = this.columns.map(c => c.label);
                const newLabels = columnComponents.map(c => c.label);
                let render = false;
                const fff = (setOf) => {
                    const l = [];
                    for (const f of setOf) {
                        l.push(f);
                    }
                    return l;
                };
                if (currentLabels.length === newLabels.length) {
                    for (const i in currentLabels) {
                        if (currentLabels[i] !== newLabels[i]) {
                            render = true;
                        }
                    }
                } else {
                    render = true;
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
