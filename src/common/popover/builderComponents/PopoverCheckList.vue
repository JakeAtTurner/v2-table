<template>
  <popover-box class="list-popover" ref="popover" :parent="parent" :direction="direction">
    <template v-for="option in list">
      <div class="list-popover__option"
        :key="option.name"
        :style="optionStyle"
        :id="`popover-box-option-${option.name}`"
      >
        <span class="check-list-popover-option">
          {{ option.name }}
        </span>
        <input type='checkbox' @click="selectOption(option.value)"
          :checked="selectedOptions.filter(o => o === option.value).length > 0"
        />
      </div>
    </template>
  </popover-box>

</template>

<script>

import PopoverBox from './PopoverBox.vue'
import popoverContainerMixin from './popoverContainerMixin'

export default {
  components: {
    PopoverBox
  },
  mixins: [popoverContainerMixin],
  props: {
    list: {
      type: Array,
      required: true
    },
    currentValue: null,
    align: {
      type: String,
      default: 'left'
    },
    selectedOptions: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    optionStyle () {
      return {
        'text-align': this.align
      }
    }
  },
  methods: {
    selectOption (value) {
      this.$emit('select', value)
    }
  }
}

</script>

<style lang="scss">

.list-popover {

  &__option {
    width: 100%;
    min-width: 100px;
    padding-top: 6px;
    padding-bottom: 6px;
    cursor: pointer;
    text-align: center;

    &:hover {
      color: color(yellow);
    }

    &.is-selected {
      color: grey;
    }
  }
}

.check-list-popover-option {
  padding-right: 10px;
}

</style>
