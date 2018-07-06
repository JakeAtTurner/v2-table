import CheckBox from './checkbox.vue';

/**
 * So now we need a algorithm to 
 *  1. create the minimum widths of the table
 *  2. create the widths for the table
 *  3. create the widths for the sections, and besect them to re adjust the widths
 */


export default {
    functional: true,

    props: ['column', 'row', 'rowIndex'],

    render (createElement, context) {
        const { props } = context;
        const { row, column, rowIndex } = props;

        const data = {
            class: {
                'v2-table__cell': true,
                'v2-table__row-cell': true,
                'text-left': column.align === 'left',
                'text-right': column.align === 'right'
            },
            style: {
                width: (column.headerWidth || column.width) + 'px'
            }
        };
        
        if (column.type === 'selection') {
            return createElement('div', data, [createElement(CheckBox, {
                props: {
                    curRowIndex: rowIndex,
                    curRow: row
                }
            })]);
        } else if (column.$scopedSlots && column.$scopedSlots.default) {
            return createElement('div', data, column.$scopedSlots.default(row));
        } else {
            data.domProps = {};
            data.domProps.innerHTML = typeof row[column.prop] !== 'undefined' ? row[column.prop] : '';
            return createElement('div', data);
        }
    }
};
