[![build pass](https://api.travis-ci.org/dwqs/v2-table.svg?branch=master)](https://travis-ci.org/dwqs/v2-table?branch=master) ![npm-version](https://img.shields.io/npm/v/v2-table.svg) ![license](https://img.shields.io/npm/l/v2-table.svg)

[中文 README](https://github.com/dwqs/v2-table/blob/master/README_CN.md)
# v2-table
A simple table component based Vue 2.x.
## Installation

Install the pkg with npm:

```
// v1
npm i --save v2-table beautify-scrollbar

// v2
npm i --save v2-table
```
or yarn

```
// v1
yarn add  v2-table beautify-scrollbar

// v2
yarn add  v2-table
```

## Get Started

```
import Vue from 'vue';

// v1
import 'beautify-scrollbar/dist/index.css'; 
import 'v2-table/dist/index.css'; 
import V2Table from 'v2-table';

// v2
import 'v2-table/dist/index.css'; 
import V2Table from 'v2-table';

Vue.use(V2Table)
```

```
<template>
  <v2-table :data="list">
    <v2-table-column label="Name" prop="name"></v2-table-column>
    <v2-table-column label="Date" prop="date"></v2-table-column>
    <v2-table-column label="Address" prop="address"></v2-table-column>  
  </v2-table>  
</template>

<script>
  export default {
    data () {
      return {
        list: [{
          date: '2017-12-02',
          name: 'test1',
          address: 'Shenzhen,China'
        }, {
          date: '2017-11-02',
          name: 'test2',
          address: 'Guangzhou,China'
        }, {
          date: '2018-01-02',
          name: 'test3',
          address: 'Shaoyang,Hunan'
        }, {
          date: '2017-10-02',
          name: 'test4',
          address: 'Changsha,Hunan'
        }]
      }
    }
  }
</script>
```

More demo to visit [here](https://dwqs.github.io/v2-table).

## Available Props

### The v2-table component

|  Attribute  |  Type  |  Accepted Values  |  Default  |  Description  |
|  :--:  |  :--:  |  :--:  |  :--:  |  :--:  |
| data | Array | - | [] | table data |
| border | Boolean | - | false | whether show table border |
| stripe | Boolean | - | false | whether table is striped |
| loading | Boolean | - | false | show loading component |
| empty-text | String | - | No Data | Displayed text when data is empty. You can customize this area with `slot="empty"` |
| default-sort | Object | `order`: ascending/descending |if `prop` is set, and `order` is not set, then `order` is default to `ascending`| set the default sort column and order. property `prop` is used to set default sort column, property `order` is used to set default sort order |
| row-class-name | String/Function({row, rowIndex}) | - | - | function that returns custom class names for a row, or a string assigning class names for every row |
| pagination-info | Object | - | { text: '', pageSize: 10, nextPageText: 'Next', prevPageText: 'Prev' } | pagination info for table data |
| shown-pagination | Boolean | - | false | whether showing pagination of table data |
| total | Number | - | 0 | all data of table, it\'s needed when `shown-pagination` is true |
| height | Number/String | - | auto | table\'s height |
| row-height | Number/String | - | 40 | row\'s height |
| show-summary | Boolean | - | false | whether to display a summary row |
| sum-text | String | - | Sum | displayed text for the first column of summary row |
| summary-method | Function({ columns, data }) | - | - | custom summary method |
| lazy-load | Boolean | - | false | whether enable lazy-load |
| col-height | Number/String | - | 40 | header columns\' height |


### Table Events

|  Event Name  |  Description  |  Parameters |
|  :--:  |  :--:  |  :--: |
| sort-change | triggers when table's sorting changes | { prop, order } |
| page-change | triggers when table's page changes | currentPage |
| select-change | triggers when selection changes | rows |

### Table Methods
|  Event Name  |  Description  |  Parameters |
|  :--:  |  :--:  |  :--: |
| toggleRowSelection | used in multiple selection Table, toggle if a certain row is selected. With the second parameter, you can directly set if this row is selected | row, selected |
| updateScrollbar | update the scrollbar config for the table  | - |

### Table Slot

|  Name  |  Description  |
|  :--:  |  :--:  |
| empty| custom empty component, it's will show when data is empty |
| loading | custom loading component, it's will show when `loading` property of table is true 

### The v2-table-column component

|  Attribute  |  Type  |  Accepted Values  |  Default  |  Description  |
|  :--:  |  :--:  |  :--:  |  :--:  |  :--:  |
| label | String | - | - | column label |
| prop | String | - | - | field name |
| width | String/Number | - | - | column width |
| sortable | Boolean | true/false | false | whether column can be sorted. |
| align | String | left/center/right | center | alignment |
| fixed | String | left/right | - | fixed column to left or right |
| type | String | - | - | type of the column |
| render-header | Function(h, { column }) | - | - | render function for table header of this column |

## Development

```js
git clone git@github.com:dwqs/v2-table.git

cd v2-table

npm i 

npm run dev
```

##TODO
* need to add in information about the styling that is optional
* need to change the css selector for selecting the odd and even rows css styles. Look in table-row
* need to get rid of the 3 types of Header => Rows => footer Options,  there should only be 1 component that
  * some how manages this for the table....
* row_hover_overlay__overLayPortion
* row_hover_overlay__background
* need to see if the prop attribute of table-column is used anywhere else...
* need to see if the type attribute of table-column is used anywhere else and is useful for the application...
* filter-svg css class is in table.vue put it somewhere else
* v2-table-row__bottom-overlay-row-affect is the affect applied when the bottomo overlay is handled
* the table-bottom-overlay-section is only the first section, if the table is a section-table
* make sure that this - 40 is taken care of nicely in row-bottom-overlay-section
##CHANGEAS
* added in the overlay
* got rid of the $emit('sort-change') it is better to keep it encapsulated
* getting rid of the type prop foir the table-column
* to sort now, you must have sortable and type,  check in table-header
* repalce data with displayData,  I am using displayData because we handle filtering and sorting internally
* column type is String by default
* added in the slot tableHeader
* for the class/style changes on the tableHeader, it will be deffinied by v2-table__header-dashboard

## Thanks

* [Element UI](http://element.eleme.io/2.0/#/en-US).
* [浅谈表格组件的实现：固定表头和固定列](https://zhuanlan.zhihu.com/p/33280304)

## LICENSE
MIT
