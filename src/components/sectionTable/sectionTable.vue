<template>
    <!--
        SLOTS:
            tableHeader - this is a component that is above the table headers.
            empty - when the data is empty.
            loading - when the user will be waiting for the component to be loaded.

        COMPONENTS:
            hoverOverlayComponent - this is the Hover Overlay Componet that appears when you hover over a row.
            bottomOverlayComponent - this is the overlay component that is beneath the row
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
                            <!-- TODO this is where the header section will go, the one that will show the section headers -->
                            <div>
                                <template v-for="(section,index) in sections">
                                    <div :style="section.getStyle(sectionWidths[index])">
                                        {{section.label}}
                                    </div>
                                </template>
                            </div>

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
                                    <!--
                                        TODO so an idea would be to use rolespan to lengthen the rows in the table and then make the width 
                                        - 2Xborderlength to get the circular borders
                                    -->
                                    <!-- <div class="v2-table__header__section"> -->
                                        <table-col-group :columns="columns"></table-col-group>
                                        <table-header :columns="columns" :sort="__sort" ref="headers"></table-header>
                                    <!-- </div> -->
                                </div>
                            </div>

                            <template v-if="isLoading">
                                <slot name="loading"></slot>
                            </template>
                            <!-- body -->
                            <template v-if="canRenderBody && !isLoading">
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
                                            <table-col-group :columns="columns"></table-col-group>
                                            <div class="v2-table__table-tbody">
                                                <template v-for="(row, rowIndex) in rows">
                                                    <table-row
                                                        :row="row"
                                                        :rowIndex="rowIndex"
                                                        :displayBotttomOverlay="rowIndex === selectedBottomOverlayIndex"
                                                        :columns="columns"
                                                        :hoverOverlayComponent="hoverOverlayComponent"
                                                        :bottomOverlayComponent="bottomOverlayComponent"
                                                        :overlayColumnStart="overlayColumnStart"
                                                        section
                                                    >
                                                    </table-row>
                                                </template>
                                            </div>
                                        </template>
                                    </div>
                                </div>
                            </template>
                            <!-- footer -->
                            <!-- <div class="v2-table__footer-wrapper" ref="footer" :style="{width: isContainerScroll ? contentWidth + 'px' : '100%'}">
                                <table-footer type="normal" :cols="columns" v-if="showSummary" v-show="displayData && displayData.length > 0"></table-footer>
                            </div> -->
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
                canRenderBody: false,
                sectionWidths: [],
                hasUpdatedBsectionWidths: false
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
            // TODO this should more accurately only succed if the column headers have not been inserted
            // and the headers havent while, the sections have not changed either
            if (!this.sectionWidths.length > 0) {
                this.setSectionsColumnsAndWidths();
            }
            this.canRenderBody = true;
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
            setSectionsColumnsAndWidths () {
                const headers = this.headerElements;
                if (headers.length > 0) {
                    for (let i = 0; i < this.columns.length; i++) {
                        const col = this.columns[i];
                        const head = headers[i];
                        col.headerWidth = head.clientWidth;
                    }
                    this.setSectionWidths()
                }
            },
            setSectionWidths () {
                const sectionWidths = [];
                const headers = this.headerElements;
                if (headers.length > 0) {
                    let currentHeader = 0;
                    for (let j = 0; j < this.columnsFromSections.length; j++) {
                        let columns = this.columnsFromSections[j];
                        let sectionWidth = 0;
                        if (j > 0) {
                            const head = headers[currentHeader];
                            sectionWidth += head.clientWidth;
                            currentHeader++;
                        }
                        for (let k = 0; k < columns.length; k++) {
                            const head = headers[currentHeader];
                            sectionWidth += head.clientWidth;
                            currentHeader++;
                        }
                        sectionWidths.push(sectionWidth);
                    }
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
    .v2-table__body { 
        border-collapse: separate; 
        border-spacing: 0 20px; 
        // margin-top: -10px; /* correct offset on first border spacing if desired */
    }
    .v2-table__cell__border-outline {
        border: solid 1px #000;
        border-style: solid none;
        padding: 10px;
    }
    .v2-table__cell__border-oultine__first-section {
        border-left-style: solid;
        border-top-left-radius: 10px; 
        border-bottom-left-radius: 10px;
    }

    .v2-table__cell__border-oultine__last-section {
        border-right-style: solid;
        border-bottom-right-radius: 10px; 
        border-top-right-radius: 10px; 
    }
}
</style>
