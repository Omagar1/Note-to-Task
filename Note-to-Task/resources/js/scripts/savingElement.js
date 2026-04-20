import Alpine from 'alpinejs'

Alpine.store('savingElement', {
    isShown: false,
    timeout: null,

    show() {
        this.isShown = true;
        setTimeout(() => {
            this.isShown = false;
        }, 10000);
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