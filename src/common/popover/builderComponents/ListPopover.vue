<template>
  <popover-box class="list-popover" ref="popover" :parent="parent" :direction="direction">
    <div
      v-for="option in list"
      class="list-popover__option"
      :class="optionClass(option.value)"
      :style="optionStyle"
      @click="selectOption(option.value)"
      :id="`popover-box-option-${option.name}`"
    >
      {{ option.name }}
    </div>
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
    optionClass (value) {
      return this.currentValue === value ? 'is-selected' : ''
    },
    selectOption (value) {
      this.$emit('select', value)
      this.dismiss()
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

</style>
