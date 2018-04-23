/**
 * Components using this mixin must use popover-box component with a ref of 'popover'
 */
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
  mounted () {
    // add listeners to re-emit popover events
    const popover = this.$refs.popover
    popover.$on('reposition', () => this.$emit('reposition'))
  }
}
