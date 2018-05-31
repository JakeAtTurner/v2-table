<template>
        <div role="row" id="roleIndex" ref="rowIndex" :class="[
            getRowClass()
        ]" :style="getRowStyle()" @mouseenter="handleRowHover" @mouseleave="handleRowLeave">
            <template v-if="isHoveredAndHasHovered">
                <row-hovered-section :nameStyle="overlayNameStyle" :overlayStyle="overlayStyle" >
                    <component v-bind:is="hoverOverlayComponent" :row="row"/>
                </row-hovered-section>
            </template>
            <template v-else>
                <div></div>
            </template>
            <template v-for="(column, index) in columns">
                <table-cell
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

            rowIndex: [String, Number],
            hoverOverlayComponent: String
        },
        inject: ['table'],
        data () {
            return {
                rowHeight: 100,
                nameColumWidth: 0,
                overlayWidth: 0,
                isHovered: false
            };
        },
        methods: {
            getRowClass () {
                // TODO consolidate this to a css selector style instead
                const cls = ['v2-table__row'];
                if (this.table.stripe && (this.rowIndex + 1) % 2 === 0) {
                    cls.push('v2-table__row-striped');
                }

                // custom row class
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
                setTimeout(() => {
                    this.rowHeight = this.$el.clientHeight;
                    const columns = this.$el.getElementsByClassName('v2-table__cell');
                    if (columns.length > 0) {
                        this.nameColumWidth = columns[0].clientWidth;
                        let totalOverlayWidth = 0;
                        for (let i = 1; i < columns.length; i++) {
                            totalOverlayWidth += columns[i].clientWidth;
                        }
                        this.overlayWidth = totalOverlayWidth;
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
            RowHoveredSection
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

</style>
