<template>
        <div role="row" id="roleIndex" ref="rowIndex" :class="[
            getRowClass(),
            {
                'row-hover': isHovered
            }
        ]" :style="getRowStyle()" @mouseenter="handleRowHover" @mouseleave="handleRowLeave">
            <template v-if="isHovered">
                <div class="row_hover_overlay">
                    <div :style="overlayNameStyle" >
                    </div>
                    <!-- The row_hover_overlay__overLayPortion is the custom CSS for the background color -->
                    <div class="row_hover_overlay__overLayPortion" :style="overlayStyle">
                        <div class="table-hover-over-background row_hover_overlay__background"></div>
                        <slot name="hoverOnRow"></slot>
                    </div>
                </div>
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
            hoverRowIndex: [String, Number]
        },
        inject: ['table'],
        data () {
            return {
                rowHeight: 100,
                nameColumWidth: 0,
                overlayWidth: 0
            }
        },
        methods: {
            getRowClass () {
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
                this.table.hoverRowIndex = this.rowIndex;
            },

            handleRowLeave () {
                this.table.hoverRowIndex = -1;
            },
            resize () {
                setTimeout(() => {
                    this.rowHeight = this.$el.clientHeight
                    let columns = this.$el.getElementsByClassName('v2-table__cell')
                    if (columns.length > 0) {
                        this.nameColumWidth = columns[0].clientWidth
                        let totalOverlayWidth = 0
                        for (let i = 1; i < columns.length; i++) {
                            totalOverlayWidth += columns[i].clientWidth
                        }
                        this.overlayWidth = totalOverlayWidth
                    }
                }, 10)
            }
        },
        computed: {
            isHovered () {
                return this.table.hoverRowIndex === this.rowIndex
            },
            overlayNameStyle () {
                let width = this.nameColumWidth
                return { 
                    width: `${width}px !important`, 
                    float: 'left',
                    height: this.rowHeight + 'px'
                }
            },
            overlayStyle () {
                return {
                    height: this.rowHeight + 'px',
                    width: this.overlayWidth + 'px'
                }
            }
        },
        mounted () {
            this.resize()
            window.addEventListener('resize', this.resize)
        },
        destroyed () {
            window.removeEventListener('resize', this.resize)
        },
        components: {
            TableCell
        }
    };
</script>

<style lang='scss'>
.row_hover_overlay {
    position: absolute !important;
    z-index: 9999 !important;
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
