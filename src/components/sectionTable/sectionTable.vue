<template>
    <!--
        SLOTS:
            tableHeader - this is a component that is above the table headers.
            empty - when the data is empty.
            loading - when the user will be waiting for the component to be loaded.

        COMPONENTS:
            hoverOverlayComponent - this is the Hover Overlay Componet that appears when you hover over a row.
    -->
    <div class="v2-table-container v2-section-table-container" ref="tableArea">
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
                            <div class="v2-table__header-wrapper" ref="header" :style="{width: isContainerScroll ? contentWidth + 'px' : '100%'}">
                                <div :class="[
                                    'v2-table__header',
                                    {
                                        'v2-table__border': border,
                                        'v2-table__header-border': border
                                    }
                                ]" 
                                :style="{width: !isContainerScroll ? contentWidth + 'px' : '100%'}">
                                    <!-- <template v-for="(section, index) in sections">
                                        <div :key="index" class="v2-table__header__section">
                                            <table-col-group :columns="section.columns"></table-col-group>
                                            <table-header :columns="section.columns" :sort="__sort" ref="headers"></table-header>
                                        </div>
                                    </template> -->
                                    <!--TODO this div is causing the headers to be shortened -->
                                    <div class="v2-table__header__section">
                                        <table-col-group :columns="columns"></table-col-group>
                                        <table-header :columns="columns" :sort="__sort" ref="headers"></table-header>
                                    </div>
                                </div>
                            </div>

                            <!-- body -->
                            <template v-if="canRenderBody">
                                <div class="v2-table__body-wrapper" ref="body" :style="bodyStyle">
                                    <div :class="[
                                        'v2-table__body',
                                        {
                                            'v2-table__border': border,
                                            'v2-table__body-border': border
                                        }
                                    ]" 
                                    ref="content" 
                                    :style="{width: !isContainerScroll ? contentWidth + 'px' : '100%', marginTop: contentMarginTop + 'px'}">
                                        <!--
                                            for section in sections
                                                create a <table col group>
                                                create a <table row>

                                            ??? what about the hoverOverlayComponent.  I think for now we need to forget about it....


                                        -->
                                        <template v-if="displayData && displayData.length > 0">
                                          <div>
                                            <table-col-group :columns="columns"></table-col-group>
                                            <div class="v2-table__table-tbody">
                                                <template v-for="(row, rowIndex) in rows">
                                                  <div :key="rowIndex" style="display: table-row">
                                                    <table-row
                                                        :row="row"
                                                        :rowIndex="rowIndex"
                                                        :columns="columns"
                                                        :hoverOverlayComponent="hoverOverlayComponent"
                                                        section
                                                    >
                                                    </table-row>
                                                  </div>
                                                </template>
                                            </div>
                                          </div>
                                        </template>







                                        <!-- TODO Need to be able to have the same heights for the sections -->
                                        <!--TODO we need to make sure that there are not 2 table-col-groups, but just one of them-->
                                        <!-- <template v-if="displayData && displayData.length > 0">
                                          <div>
                                            <template v-for="(section, index) in sections">
                                                <table-col-group :key="index" :columns="section.columns"></table-col-group>
                                            </template>
                                            <div class="v2-table__table-tbody">
                                                <template v-for="(row, rowIndex) in rows">
                                                  <div :key="rowIndex" style="display: table-row">
                                                    <table-row
                                                        v-for="(section, sectionIndex) in sections"
                                                        :key="sectionIndex" 
                                                        :row="row"
                                                        :rowIndex="rowIndex"
                                                        :columns="section.columns"
                                                        :hoverOverlayComponent="hoverOverlayComponent"
                                                        :section="section">
                                                    </table-row>
                                                  </div>
                                                </template>
                                            </div>
                                          </div>
                                        </template> -->
                                        
                                        
                                        <!-- <template v-for="(section, index) in sections">
                                            <div :key="index">
                                                <table-col-group :columns="section.columns" v-if="displayData && displayData.length > 0"></table-col-group>
                                                <div class="v2-table__table-tbody" v-if="displayData && displayData.length > 0">
                                                        <table-row
                                                            class="v2-table__section-row"
                                                            v-for="(row, index) in rows"
                                                            :key="index" 
                                                            :row="row"
                                                            :rowIndex="index"
                                                            :columns="section.columns"
                                                            :hoverOverlayComponent="hoverOverlayComponent">
                                                        </table-row>
                                                </div>
                                            </div>
                                        </template> -->


                                    </div>
                                </div>
                            </template>
                            <!-- footer -->
                            <!-- <div class="v2-table__footer-wrapper" ref="footer" :style="{width: isContainerScroll ? contentWidth + 'px' : '100%'}">
                                <table-footer type="normal" :cols="columns" v-if="showSummary" v-show="displayData && displayData.length > 0"></table-footer>
                            </div> -->

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
/**
 * TODO
 * need to look at all the data that is calculated from the columns in the Mixin, and see how I can affect them in the sections
 * 
 */
    import TableHeader from '../common/table-header.js';
    import TableColGroup from '../common/table-col-group.vue';
    import TableRow from '../common/table-row.vue';
    import EmptyIcon from '../common/empty-icon.vue';
    import TableFooter from '../common/table-footer.vue';
    import CheckboxList from '../common/checkbox-list.vue';
    import TableMixin from '../mixins/TableMixin'
    import {flatten} from 'lodash'

    export default {
        name: 'v2-section-table',
        data: () => {
            return {
                sections: [],
                sectionWidths: [],
                canRenderBody: false
            }
        },
        components: {
            TableHeader,
            TableRow,
            EmptyIcon,
            TableColGroup,
            TableFooter,
            CheckboxList
        },
        mixins: [TableMixin],
        computed: {
            headerElements () {
              return this.$el.getElementsByClassName("v2-table__header__cell");
            },
            sectionColumns () {
              const sectionColumns = [];
              for (let i = 0; i < this.columnsFromSections.length; i++) {
                const columns = this.columnsFromSections[i];
                for (let j = 0; j < columns.length; j++) {
                  sectionColumns.push(columns[j]);
                }
              }
              return sectionColumns;
            },
            numberOfColumns () {
              return this.columns.length;
            }
        },
        mounted () {
            this.containerWith = this.$el.clientWidth;
            this.setSections();
            this.filter();
            this.handleScrollingAndAdjustments();
        },
        updated () {
            /**
             * the widths need to be assigned to the cells at the rate that the widths come in
             */
            if (this.headerElements.length !== 0 && this.numberOfColumns !== this.headerElements.length) {
                console.error('the number of Headers and the Number of Columns does not match, as a result your table could look irregular');
            }
            this.setSectionWidths();
            this.canRenderBody = true
        },
        methods: {
            setSections () {
                const columns = [];
                this.sections = this.sectionSlots;
                for (let i = 0; i < this.sections.length; i ++) {
                    const sec = this.sections[i];
                    if (i > 0) {
                        columns.push({
                            width: 10,
                            seperator: true
                        });
                    }
                    columns.push.apply(columns, sec.columns)
                }
                this.columns = columns;
            },
            setSectionWidths () {
              const sectionWidths = [];
              const headers = this.headerElements;
              if (headers.length > 0) {
                let currentHeader = 0;
                for (let i = 0; i < this.columns.length; i++) {
                    const col = this.columns[i];
                    const head = headers[i];
                    col.headerWidth = head.clientWidth;
                }
                // for (let j = 0; j < this.columnsFromSections.length; j++) {
                //   let columns = this.columnsFromSections[j];
                //   let sectionWidth = 0;
                //   for (let k = 0; k < columns.length; k++) {
                //     const col = columns[k];
                //     const head = headers[currentHeader];
                //     col.headerWidth = head.clientWidth;
                //     sectionWidth += head.clientWidth;
                //     currentHeader++;
                //   }
                //   // TODO include the included column to this
                //   sectionWidths.push(sectionWidth);
                // }
                this.sectionWidths = sectionWidths;
              } else {
                this.sectionWidths = sectionWidths;
              }
            }
        }
    };
</script>

<style lang='scss'>
.v2-section-table-container {
    .filter-svg {
        font-size: 1.2em;
        overflow: visible;
        width: 1em;
        display: inline-block;
        height: 1em;
        vertical-align: -.125em;
        margin-left: 10px!important;
    }

    .v2-table__header__section {
        display: inline-block;
    }

    .v2-table__row.v2-table-row__section-row.v2-table-row {
        margin: 10px 0px 10px 0px !important;
    }
}
</style>
