import 'beautify-scrollbar/dist/index.css';
import './style/index.less';

import Table from './components/table/table.vue';
import SectionTable from './components/sectionTable/sectionTable'
import Section from './components/sectionTable/section'
import TableColumn from './components/common/table-column.vue';

import Bus from './bus.js';

function install (Vue) {
    Vue.component(Table.name, Table);
    Vue.component(SectionTable.name, SectionTable);
    Vue.component(Section.name, Section);
    Vue.component(TableColumn.name, TableColumn);
    Bus.saveVueRef(Vue);
};

const V2Table = {
    install
};

export default V2Table;

export { Table, TableColumn, SectionTable };

if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(V2Table);
}
