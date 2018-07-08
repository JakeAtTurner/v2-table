<template>
        <div
            role="row"
            id="roleIndex"
            ref="rowIndex"
            :class="{
                [getRowClass()]: true,
                'v2-table-row': true
            }"
            @mouseenter="handleRowHover"
            @mouseleave="handleRowLeave">
            <template v-if="isHoveredAndHasHovered">
                <row-hovered-section :nameStyle="overlayNameStyle" :overlayStyle="overlayStyle" >
                    <component v-bind:is="hoverOverlayComponent" :row="row"/>
                </row-hovered-section>
            </template>
            <template v-if="displayBotttomOverlay">
                <row-bottom-overlay-section
                    :heightOfRow="rowHeight"
                    :lengthOfNonCoveredArea="nameColumWidth"
                    :totalWidth="sectionalOverlayWidth"
                    >
                    <component
                        v-bind:is="bottomOverlayComponent"
                        :row="row"/>
                </row-bottom-overlay-section>
            </template>
            <!--Needed for the 1 col-span that is used to cover this area.-->
            <template v-else>
                <div></div>
            </template>
            <template
                v-if='section'
                v-for="(columns, rowColumnIndex) in rowColumns"
            >
                <table-cell
                    v-for="(column,index) in columns"
                    apartOfSection
                    :isFirst="index === 0"
                    :isLast="index === (columns.length - 1)"
                    :isSeperator="rowColumnIndex % 2 === 1"
                    :bottomOverlayAffectedArea="rowColumnIndex === 0 && displayBotttomOverlay"
                    :row="row"
                    :column="column"
                    :rowIndex="rowIndex"
                    :key="(rowColumnIndex * 100) + rowIndex">
                </table-cell>
            </template>
            <template v-else>
                <table-cell
                    v-for="(column,index) in columns"
                    :row="row"
                    :column="column"
                    :rowIndex="rowIndex"
                    :key="index">
                </table-cell>
            </template>
        </div>
</template>

<script>
    import TableCell from './table-cell';
    import RowHoveredSection from './table-row-hovered-section.vue';
    import RowBottomOverlaySection from './row-bottom-overlay-section.vue';

    export default {
        props: {
            columns: {
                type: Array,
                default: () => []
            },
            row: {
                type: Object,
                default: () => {}
            },
            section: {
                type: Boolean,
                default: false
            },
            rowIndex: [String, Number],
            hoverOverlayComponent: String,
            bottomOverlayComponent: String,
            displayBotttomOverlay: {
                type: Boolean,
                default: false
            }
        },
        inject: ['table'],
        data () {
            return {
                rowHeight: 100,
                nameColumWidth: 0,
                overlayWidth: 0,
                sectionalOverlayWidth: 0,
                isHovered: false
            };
        },
        methods: {
            getRowClass () {
                // TODO consolidate this to a css selector style instead
                // TODO add stuff here
                const cls = ['v2-table__row'];
                if (this.table.stripe && (this.rowIndex + 1) % 2 === 0) {
                    cls.push('v2-table__row-striped');
                }
                if (this.section) {
                    cls.push('v2-table-row__section-row');
                    // TODO move this to the cell position
                    // if (!this.section.seperate) {
                    //     cls.push('v2-table-row__section-row__one-block');
                    // }
                }
                if (typeof this.table.rowClassName !== 'undefined') {
                    const customRowClass = typeof this.table.rowClassName === 'function' ? this.table.rowClassName({ row: this.row, rowIndex: this.rowIndex }) : this.table.rowClassName;
                    cls.push(typeof customRowClass === 'string' ? customRowClass : '');
                }
                return cls.join(' ');
            },

            getRowStyle () {
                const style = {};

                if (!isNaN(parseInt(this.table.rowHeight, 10))) {
                    style.height = parseInt(this.table.rowHeight, 10) + 'px';
                }
                return style;
            },

            handleRowHover (e) {
                this.isHovered = true;
            },

            handleRowLeave () {
                this.isHovered = false;
            },
            resize () {
                // TODO what is calling this??  it shouldn't
                // TODO This should only be calcualted one, please put this in the table component,
                // TODO or its mixins because calculating this 1000 times is going to make the system slower....
                // Yeah it should not, this is causing a lot of overhead
                setTimeout(() => {
                    this.rowHeight = this.$el.clientHeight;
                    const columns = this.$el.getElementsByClassName('v2-table__cell');
                    this.sectionalOverlayWidth = null;
                    if (columns.length > 0) {
                        this.nameColumWidth = columns[0].clientWidth;
                        let totalOverlayWidth = 0;
                        for (let i = 1; i < columns.length; i++) {
                            const columnWidth = columns[i].clientWidth;
                            if (columnWidth > 1 && columnWidth < 15 && !this.sectionalOverlayWidth) {
                                this.sectionalOverlayWidth = totalOverlayWidth;
                            }
                            totalOverlayWidth += columnWidth;
                        }
                        this.overlayWidth = totalOverlayWidth;
                        if (!this.sectionalOverlayWidth) {
                            this.sectionalOverlayWidth = totalOverlayWidth;
                        }
                    }
                }, 10);
            }
        },
        computed: {
            overlayNameStyle () {
                const width = this.nameColumWidth;
                return { 
                    width: `${width}px !important`, 
                    float: 'left',
                    height: this.rowHeight + 'px'
                };
            },
            overlayStyle () {
                return {
                    height: this.rowHeight + 'px',
                    width: this.overlayWidth + 'px'
                };
            },
            isHoveredAndHasHovered () {
                return this.hoverOverlayComponent && this.isHovered;
            },
            rowColumns () {
                const rowColumns = [];
                rowColumns.push([]);
                let currentSection = 0;
                for (let i = 0; i < this.columns.length; i++) {
                    let col = this.columns[i];
                    if (col.seperator) {
                        rowColumns.push([]);
                        currentSection++;
                        rowColumns[currentSection].push(col)
                        rowColumns.push([]);
                        currentSection++;
                    } else {
                        rowColumns[currentSection].push(col);
                    }
                }
                return rowColumns;
            }
        },
        mounted () {
            this.resize();
            window.addEventListener('resize', this.resize);
        },
        destroyed () {
            window.removeEventListener('resize', this.resize);
        },
        components: {
            TableCell,
            RowHoveredSection,
            RowBottomOverlaySection
        }
    };
</script>

<style lang='scss'>
.v2-table-row {
    &__section-row {
        // display: inline-block !important;
        display: table-row;

        &__one-block {
            border: 1px solid #ccc!important;
            border-radius: 16px;
        }
    }
}

</style>
