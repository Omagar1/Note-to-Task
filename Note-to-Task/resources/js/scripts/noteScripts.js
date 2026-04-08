
export default function noteComponents(note, ){
    return {
        // attributes:
        editing: false,
        id: note.id,
        title: note.title,
        currentTitle: note.title,
        content: note.content,
        justSaved: false,
        // methods:
        async updateTitle(route, csrfToken) {
            console.log(this.$store.savingElement);
            // start saving notification here once made
            console.log('Attempting to save title:', this.title); // debug log to verify title value
            this.$store.savingElement.show();
            
            if (this.justSaved) {
                console.log('Title not saved - already just saved'); // debug log to verify that the justSaved flag is working
                return; // prevent multiple saves if already just saved
            }
            else if (this.title === this.currentTitle ) {
                this.editing = false; // no change so no need to save
                console.log('Title not saved - no change'); // debug log to verify no change
                return;
            } 
            else {
                this.editing = false;
                this.justSaved = true; // set flag to prevent immediate subsequent saves

                try {
                    const response = await fetch(route, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrfToken
                        },
                        body: JSON.stringify({ title: this.title,
                            id: this.id
                        })
                    });

                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }

                    const data = await response.json();
                    console.log(data.message);
                    this.$store.savingElement.hide();
                } catch (error) {
                    console.error('Error updating title:', error);
                    // show error notification here once made
                    this.$store.savingElement.hide();
                }
            }
        }
    }
}