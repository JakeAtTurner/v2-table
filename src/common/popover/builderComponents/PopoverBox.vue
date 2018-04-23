<template>
  <div class="popover-box" :class="selectorClass" :style="position">

    <div class="popover-box__triangle" :class="triangleClass" v-if="triangleFirst" :style="offset"></div>

      <div class="popover-box__content">
        <slot></slot>
      </div>

    <div class="popover-box__triangle" :class="triangleClass" v-if="!triangleFirst" :style="offset"></div>

  </div>

</template>

<script>

import debounce from 'lodash.debounce'

const EDGE_DISTANCE = 10
const PROP_MAP = {
  top: {
    selectorClass: 'popover-box--selector-top',
    triangleClass: 'popover-box--triangle-down'
  },
  bottom: {
    selectorClass: 'popover-box--selector-bottom',
    triangleClass: 'popover-box--triangle-up'
  },
  left: {
    selectorClass: 'popover-box--selector-left',
    triangleClass: 'popover-box--triangle-right'
  },
  right: {
    selectorClass: 'popover-box--selector-right',
    triangleClass: 'popover-box--triangle-left'
  }
}

export default {
  props: {
    direction: {
      type: String,
      default: 'top'
    },
    parent: {
      type: HTMLElement | SVGElement | SVGUseElement
    }
  },
  data () {
    return {
      position: {
        top: '0px',
        left: '0px'
      },
      offset: {
        top: '0px',
        left: '0px'
      }
    }
  },
  computed: {
    selectorClass () {
      return PROP_MAP[this.direction].selectorClass
    },
    triangleFirst () {
      return ['bottom', 'right'].indexOf(this.direction) > -1
    },
    triangleClass () {
      return PROP_MAP[this.direction].triangleClass
    }
  },
  methods: {
    computePosition (parent, direction) {
      const parentPos = parent.getBoundingClientRect()

      const scrollX = window.pageXOffset
      const scrollY = window.pageYOffset

      const positionMap = {
        left: {
          top: (scrollY + parentPos.top + parentPos.height / 2) - (this.$el.clientHeight / 2),
          left: (scrollX + parentPos.left) - this.$el.clientWidth
        },
        right: {
          top: (scrollY + parentPos.top + parentPos.height / 2) - (this.$el.clientHeight / 2),
          left: (scrollX + parentPos.left + parentPos.width)
        },
        bottom: {
          top: (scrollY + parentPos.top + parentPos.height),
          left: (scrollX + parentPos.left + parentPos.width / 2) - (this.$el.clientWidth / 2)
        },
        top: {
          top: (scrollY + parentPos.top) - this.$el.clientHeight,
          left: (scrollX + parentPos.left + parentPos.width / 2) - (this.$el.clientWidth / 2)
        }
      }

      const position = positionMap[direction]

      return {
        top: Math.round(position.top),
        left: Math.round(position.left)
      }
    },
    computeOffset (position, direction) {
      let offset

      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight

      if (direction === 'top' || direction === 'bottom') {
        const selfLeft = position.left
        const selfRight = position.left + this.$el.clientWidth

        const relLeft = selfLeft >= EDGE_DISTANCE ? 0 : EDGE_DISTANCE - selfLeft
        const relRight = windowWidth - selfRight >= EDGE_DISTANCE ? 0 : selfRight + EDGE_DISTANCE - windowWidth

        offset = {
          top: 0,
          left: (relLeft > 0 ? relLeft : -1 * relRight)
        }
      } else if (direction === 'left' || direction === 'right') {
        const selfTop = position.top
        const selfBottom = position.top + this.$el.clientHeight

        const relTop = selfTop >= EDGE_DISTANCE ? 0 : EDGE_DISTANCE - selfTop
        const relBottom = windowHeight - selfBottom >= EDGE_DISTANCE ? 0 : windowHeight - selfBottom + EDGE_DISTANCE

        offset = {
          top: (relTop > 0 ? relTop : -1 * relBottom),
          left: 0
        }
      }

      return {
        top: Math.round(offset.top),
        left: Math.round(offset.left)
      }
    },
    reposition () {
      const position = this.computePosition(this.parent, this.direction)
      const offset = this.computeOffset(position, this.direction)

      this.position = {
        top: (position.top + offset.top) + 'px',
        left: (position.left + offset.left) + 'px'
      }
      this.offset = {
        top: -1 * offset.top + 'px',
        left: -1 * offset.left + 'px'
      }
      this.$emit('reposition')
    }
  },
  mounted () {
    this.reposition()
    window.addEventListener('resize', debounce(this.reposition, 15))
    this.$el.classList.add('popover-box--fade-in')
  },
  beforeDestroy () {
    window.removeEventListener('resize', debounce(this.reposition, 15))
    this.$el.classList.remove('popover-box--fade-out')
  }
}

</script>

<style lang="scss">

.popover-box {
  position: absolute;
  z-index: $z-zeus;
  transition: opacity .12s $global-easing;
  backface-visibility: hidden;
  color: white;
  opacity: 0;
  text-align: left;
  overflow: hidden;

  &--fade-in {
    opacity: 1;
    transition: opacity .12s $global-easing;
  }

  &--fade-out {
    opacity: 0;
    transition: opacity .12s $global-easing;
  }

  &__content {
    max-height: rem(200);
    overflow-y: auto;
    padding: rem(15);
    background: black;
    border-radius: rem(6);
  }

  &__content::-webkit-scrollbar {
    background: black;
    width: rem(6);
    border-radius: 0 rem(6) rem(6) 0;
  }

  &__content::-webkit-scrollbar-thumb {
    background-color: color(grays, light);
    border-radius: rem(6);
  }

  &__triangle {
    position: relative;
  }

  &--selector-top {
  }

  &--triangle-down {
    width: 0;
    height: 0;
    border-style: solid;
    margin: auto;
    border-width: rem(7) rem(7) 0 rem(7);
    border-color: black transparent transparent transparent;
    line-height: 0;
  }

  &--selector-bottom {
  }

  &--triangle-up {
    width: 0;
    height: 0;
    border-style: solid;
    margin: auto;
    border-width: 0 rem(7) rem(7) rem(7);
    border-color: transparent transparent black transparent;
    line-height: 0;
  }

  &--selector-left {
    display: flex;
    align-items: center;
  }

  &--triangle-right {
    width: 0;
    height: 0;
    border-style: solid;
    border-width: rem(7) 0 rem(7) rem(7);
    border-color: transparent transparent transparent black;
    line-height: 0;
  }

  &--selector-right {
    display: flex;
    align-items: center;
  }

  &--triangle-left {
    width: 0;
    height: 0;
    border-style: solid;
    border-width: rem(7) rem(7) rem(7) 0;
    border-color: transparent black transparent transparent;
    line-height: 0;
  }

}

</style>
