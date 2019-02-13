<template>
    <div v-if="false">
        <slot></slot>
    </div>
</template>

<script>
    export default {
        name: 'v2-table-column',
        props: {
            label: String,
            prop: String,
            width: {
                type: [Number, String],
                default: 90
            },
            // CHANGED to Function...
            type: {
                type: Function,
                default: String
            },   // I think this is going to be depricated, until I can find a use case
            sortable: {
                type: Boolean,
                default: false
            },
            filterable: {
                type: Object,
                default: null
            },
            fixed: {
                type: String,
                default: '' // left/right
            }, 
            align: {
                type: String,
                default: 'center',
                validator: (val) => ['left', 'center', 'right'].indexOf(val) > -1
            },
            wrapText: {
              type: Boolean,
              default: false
            },
            renderHeader: [Function]
        },
        data: () => {
            return {
                headerWidth: null
            }
        }
    };
</script>
