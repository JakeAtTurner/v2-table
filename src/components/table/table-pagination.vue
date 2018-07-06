<template>
    <div class="v2-table__pagination-box" v-show="total > 0">
      <div class="pagination-text-info" v-if="text" v-html="text"></div>
      <div class="v2-table__pagination" @click="changeCurPage">
          <span 
              :class="[
                  'page prev-page',
                  {
                      'disabled': curPage === 1
                  }
              ]"  
              data-page="prev"
          >
              {{prevPageText || 'Prev'}}
          </span>
          <ul>
              <li v-for="(item, index) in renderPages" 
                  :key="index" 
                  :data-page="item.page"
                  :class="[
                      'page',
                      {
                          'cur-page': curPage === item.page
                      }
                  ]"
              >
                  {{item.text}}
              </li>
          </ul>
          <span 
              :class="[
                  'page next-page',
                  {
                      'disabled': curPage === totalPage
                  }
              ]" 
              data-page="next"
          >
              {{nextPageText || 'Next'}}
          </span>
      </div>
  </div>
</template>

<script>
export default {
    props: { // use v-bind to assign the values associated here..
        text: String,
        prevPageText: String,
        nextPageText: String
    }
};
</script>

<style>

</style>
