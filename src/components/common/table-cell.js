import CheckBox from './checkbox.vue';

/**
 * So now we need a algorithm to 
 *  1. create the minimum widths of the table
 *  2. create the widths for the table
 *  3. create the widths for the sections, and besect them to re adjust the widths
 */


export default {
    functional: true,

    props: {
        column: {
            type: Object
        },
        row: {
            type: Object
        },
        rowIndex: {
            type: Number
        },
        apartOfSection: {
            type: Boolean,
            default: false
        },
        isFirst: {
            type: Boolean,
            default: false
        },
        isLast: {
            type: Boolean,
            default: false
        },
        isSeperator: {
            type: Boolean,
            deafult: false
        },
        bottomOverlayAffectedArea: {
            type: Boolean,
            default: false
        }
    },
    render (createElement, context) {
        const { props } = context;
        const { row, column, rowIndex, apartOfSection, bottomOverlayAffectedArea } = props;

        const data = {
            class: {
                'v2-table__cell': true,
                'v2-table__row-cell': true,
                'text-left': column.align === 'left',
                'text-right': column.align === 'right',
                'v2-table-row__bottom-overlay-row-affect': bottomOverlayAffectedArea
            },
            style: {
                width: (column.headerWidth || column.width) + 'px'
            }
        };
        if (apartOfSection) {
            const {isFirst, isLast, isSeperator} = props;
            if (!isSeperator) {
                data.class['v2-table__cell__border-outline'] = true;
                if (isFirst) {
                    data.class['v2-table__cell__border-oultine__first-section'] = true;
                }
                if (isLast) {
                    data.class['v2-table__cell__border-oultine__last-section'] = true;
                }
            }
        }
        
        if (column.type === 'selection') {
            return createElement('div', data, [createElement(CheckBox, {
                props: {
                    curRowIndex: rowIndex,
                    curRow: row
                }
            })]);
        } else if (column.$scopedSlots) {
            if (column.$scopedSlots.default) {
                return createElement('div', data, column.$scopedSlots.default(row));
            } else if (column.$scopedSlots.rowIndex) {
                return createElement('div', data, column.$scopedSlots.rowIndex(rowIndex));
            }
        } else {
            data.domProps = {};
            data.domProps.innerHTML = typeof row[column.prop] !== 'undefined' ? row[column.prop] : '';
            return createElement('div', data);
        }
    }
};
