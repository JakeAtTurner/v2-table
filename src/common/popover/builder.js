import Vue from 'vue';
import E from './builderComponents/events';
import ListPopover from './builderComponents/ListPopover.vue';
import CheckList from './builderComponents/PopoverCheckList.vue';
import _ from 'lodash';

class Builder {
    constructor () {
        this.__popover = null;
        this.__events = [];
    }

    makeListPopover () {
        this.__popover = ListPopover;
        return this;
    }

    makeCheckList () {
        this.__popover = CheckList;
        return this;
    }

    addDefaultEvent () {
        this.addHandleScroll();
        this.addDismissOnOffClick();
        this.addDismiss();
        return this;
    }

    addHandleScroll () {
        this.__events.push(E.handleScroll);
        return this;
    }

    addHoverOver (el, areaIncludeHoverOver) {
        this.__events.push(E.hoverOver(el, areaIncludeHoverOver));
        return this;
    }

    addDismiss () {
        this.__events.push(E.dismiss);
        return this;
    }

    addDismissOnOffClick () {
        this.__events.push(E.dismissOnOffClick);
        return this;
    }

    addDismissOnClickTimer (miliseconds) {
        this.__events.push(E.dismissOnClickTimer(miliseconds));
        return this;
    }

    // need to add in the events
    // the events will be used to create the info
    get (data) {
        const el = document.createElement('div');
        el.style.overflow = 'hidden';
        document.body.appendChild(el);
        // this is how to add the mixins
        const cloned = _.cloneDeep(this.__popover);
        this.__popover.mixins.push.apply(cloned.mixins, this.__events);
        const Popover = Vue.extend(cloned);
        const popoverBox = new Popover({
            el: el,
            propsData: data
        });
        return popoverBox;
    }
}

export default Builder;
