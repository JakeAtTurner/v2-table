import Builder from './builder'

var factory = {
  createListBox (options) {
    return new Builder().makeListPopover().addHandleScroll().get(options)
  },
  createDefaultListBox (options) {
    return new Builder().makeListPopover().addDefaultEvent().get(options)
  },
  createListBoxWithHoverOver (options) {
    return new Builder().makeListPopover()
      .addHoverOver(options.hoverOver, false).addDismiss().get(options)
  },
  createCheckList (options) {
    return new Builder().makeCheckList().addDefaultEvent().get(options)
  }
}

export default factory
