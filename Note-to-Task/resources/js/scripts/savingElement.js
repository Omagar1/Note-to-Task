import Alpine from 'alpinejs'

Alpine.store('savingElement', {
    isShown: false,

    show() {
        this.isShown = true;
    },
    hide() {
        setTimeout(() => {
            this.isShown = false;
        }, 1000);
    },
    toggle() {
        this.isShown = !this.isShown;
    }
})