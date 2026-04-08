import Alpine from 'alpinejs'

Alpine.store('savingElement', {
    isShown: false,

    show() {
        this.isShown = true;
    },
    hide() {
        this.isShown = false;
    },
    toggle() {
        this.isShown = !this.isShown;
    }
})