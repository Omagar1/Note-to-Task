
export default function noteComponents(note){
    return {
        // attributes:
        id: note.id,
        justSaved: false,
        deleted: false, // used for front end deletion of note after delete request is made - set to true to hide note from dashboard list without needing to refresh page
        // title stuff
        title: note.title,
        currentTitle: note.title, // to track the last saved title for change detection
        editingTitle: false,
        
        // methods:
        async updateTitle(route, csrfToken) {
    
            this.$store.savingElement.show();
            
            if (this.justSaved) {
                this.editingTitle = false; 
                this.$store.savingElement.hide(); 
                console.log('Title not saved - already just saved'); // debug log to verify that the justSaved flag is working
                return; // prevent multiple saves if already just saved
            }
            else if (this.title === this.currentTitle ) {
                this.editingTitle = false; // no change so no need to save
                this.$store.savingElement.hide(); 
                console.log('Title not saved - no change'); // debug log to verify no change
                return;
            } 
            else {
                this.editingTitle = false;
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
        },

        async deleteNote(route, csrfToken) {
    
            if (confirm('Are you sure you want to delete this note? This action cannot be undone.')) {

                this.deleted = true; // set flag to hide note from dashboard list
                try {
                    const response = await fetch(route, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrfToken
                        },
                        body: JSON.stringify({ id: this.id })
                    })
                
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    
                } catch(error) {
                    console.error('Error deleting note:', error);
                    // show error notification here once made
                }
            }
        }
    };
}