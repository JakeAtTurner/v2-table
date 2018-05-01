const events = {
  dismissOnOffClick: {
    methods: {
      handleDocumentClick (e) {
        if (!this.$el.contains(e.target)) {
          this.dismiss()
        }
      }
    },
    mounted: function () {
      window.addEventListener('mousedown', this.handleDocumentClick, true)
    },
    beforeDestroy: function () {
      window.removeEventListener('mousedown', this.handleDocumentClick, true)
    }
  },
  dismissOnClickTimer: function (miliseconds) {
    let createdDate = new Date(Date.now() + miliseconds)
    return {
      methods: {
        handleDismissOnClickTimer (e) {
          let newDate = new Date()
          let passTime = newDate > createdDate
          if (passTime && !this.$el.contains(e.target)) {
            this.dismiss()
          }
        }
      },
      mounted: function () {
        window.addEventListener('mousedown', this.handleDismissOnClickTimer, true)
      },
      beforeDestroy: function () {
        window.removeEventListener('mousedown', this.handleDismissOnClickTimer, true)
      }
    }
  },
  handleScroll: {
    methods: {
      handleScroll (e) {
        if (!this.$el.contains(e.target)) {
          this.dismiss()
        }
      }
    },
    mounted: function () {
      window.addEventListener('scroll', this.handleScroll, true)
    },
    beforeDestroy: function () {
      window.removeEventListener('scroll', this.handleScroll, true)
    }
  },
  dismiss: {
    methods: {
      dismiss () {
        let timeForAnimations = 125
        if (this && this.$el) {
          // TOOD this need to happen after, the select on does...
          this.$emit('dismiss')
          this.$destroy()
          setTimeout(() => {
            if (this && this.$el) {
              this.$el.parentNode.removeChild(this.$el)
            }
          }, timeForAnimations)
        }
      }
    },
    mounted: function () {
      window.addEventListener('hashchange', this.dismiss, true)
    },
    beforeDestroy: function () {
      window.removeEventListener('hashchange', this.dismiss, true)
    }
  },
  hoverOver: function (el, areaIncludeHoverOver) {
    // defaults to true
    areaIncludeHoverOver = !(areaIncludeHoverOver === false)
    return {
      methods: {
        handleHover (e) {
          let inActivationArea = el.contains(e.target)
          let thePopover = this.$el.contains(e.target)
          let inArea = (inActivationArea || (areaIncludeHoverOver && thePopover))
          if (!inArea) {
            this.dismiss()
          }
        }
      },
      mounted: function () {
        window.addEventListener('mousemove', this.handleHover, true)
      },
      beforeDestroy: function () {
        window.removeEventListener('mousemove', this.handleHover, true)
      }
    }
  }
}

export default events
