import CheckBox from './checkbox.vue';
import PopoverFactory from '../common/popover';

export default {
    name: 'table-header',
    props: {
        columns: {
            type: Array,
            default: () => []
        },

        sort: {}
    },
    data () {
        return {
            __filterSection: false
        };
    },
    inject: ['table'],
    components: {
        CheckBox
    },
    methods: {
        getColumnClass (col) {
            const cls = ['v2-table__cell', 'v2-table__column-cell'];
            if (col.sortable && col.type) {
                cls.push('sortable');
            }
            if (this.sort.prop === col.prop) {
                const order = this.sort.order || 'ascending';
                cls.push(order);
            }
            col.align === 'left' && cls.push('text-left');
            col.align === 'right' && cls.push('text-right');

            return cls.join(' ');
        },
        getColStyle (col) {
            const style = {};
            
            style.width = !isNaN(parseInt(col.width)) ? '90px' : `${parseInt(col.width, 10)}px`;
            style.height = !isNaN(parseInt(this.table.colHeight, 10)) ? '40px' : `${parseInt(this.table.colHeight, 10)}px`;

            // style.textAlign = ['left', 'center', 'right'].indexOf(col.align) > -1 ? col.align : 'center';
            
            return style;
        },
        getFilters () {
            return this.columns.filter(col => col.__filter).map(col => col.__filter);
        },
        changeSortRule (col) {
            if (col.sortable && col.type) {
                this.table.sortChange(col);
            }
        },
        filterRule (e, col) {
            e.stopPropagation();
            // TODO need to insert a new type of popover here, based off the type of the column
            // it will have to be like the original style of the popovers
            if (col.filterable) {
                col.__filterSection = !col.__filterSection;
                if (col.filterable.type === 'checklist') {
                    let filter = col.__filter;
                    if (!filter) {
                        filter = {
                            type: 'options',
                            field: col.prop,
                            values: {}
                        };
                        col.__filter = filter;
                    }
                    const popover = PopoverFactory.createCheckList({
                        direction: 'right',
                        list: col.filterable.options,
                        selectedOptions: Object.keys(col.__filter.values),
                        parent: e.currentTarget,
                        colorTheme: 'black'
                    });
                    popover.$on('select', (value) => {
                        // TODO need to think about the ways a filter should be created
                        // need to have the correct way a DataStructure could be created here
                        if (filter.values[value]) {
                            delete filter.values[value];
                        } else {
                            filter.values[value] = true;
                        }
                        this.table.filter();
                    });
                }
            };
        }
    },

    render (h) {
        return (
            <div class='v2-table__table-thead'>
                <div class='v2-table__header-row'>
                    {/* Have to add in the hover Over Header here as well. this aligns the Headers correctly */}
                    <div key='hoverOverColumnHeader' class='v2-table__cell v2-table__column-cell' style={ { width: '0px' } } ></div>
                    {
                        this.columns.map((column, index) => {
                            return (
                                <div key={index}
                                    onClick={() => this.changeSortRule(column)} 
                                    class={this.getColumnClass(column) } 
                                    style={this.getColStyle(column)}
                                >
                                    {
                                        typeof column.renderHeader === 'function' 
                                            ? column.renderHeader.call(this._renderProxy, h, { column, index })
                                            : column.label
                                    }
                                    {
                                        column.sortable && column.type 
                                            ? <span class='v2-table__caret-wrapper'>
                                                <i class='v2-table__sort-caret ascending-caret'></i>
                                                <i class='v2-table__sort-caret descending-caret'></i>
                                            </span>
                                            : ''  
                                    }
                                    {
                                        column.filterable
                                            ? <span onClick={(e) => this.filterRule(e, column)}>
                                                <svg aria-hidden='true' data-prefix='fas' data-icon='filter' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512' class='filter-svg'>
                                                    <path fill='currentColor' d='M487.976 0H24.028C2.71 0-8.047 25.866 7.058 40.971L192 225.941V432c0 7.831 3.821 15.17 10.237 19.662l80 55.98C298.02 518.69 320 507.493 320 487.98V225.941l184.947-184.97C520.021 25.896 509.338 0 487.976 0z'>
                                                    </path>
                                                </svg>
                                            </span>
                                            : ''
                                    }
                                    {/* {
                                        DEPRECATED....  not sure what they were doing here and why we need this...
                                        column.type === 'selection'
                                            ? <check-box cur-row-index={-1}></check-box>
                                            : ''
                                    } */}
                                </div>
                            );
                        })
                    }
                </div>
            </div>
        );
    }
};
