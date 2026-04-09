export default function noteEditor({ initialContent, noteId, route, csrfToken} ) {
    return {
        quill: null,
        saveTimeout: null,
        lastSaved: null,
        initialContent,
        noteId,
        csrfToken,
        route,

        init() {
            
            this.$nextTick(() => {
                if (this.quill) {
                    return;
                }
                // this.quill = new Quill(this.$refs.editor, {
                //     theme: 'snow'
                // })

                // this.quill.setText("test\n")
                

                this.quill = new Quill(this.$refs.editor, {
                    modules: {
                        toolbar: [
                        [{ header: [1, 2, false] }],
                        ['bold', 'italic', 'underline'],
                        ['image', 'code-block'],
                        ],

                        history: {
                            delay: 2000,
                            maxStack: 100,
                            userOnly: true
                        }
                    },
                    placeholder: 'Compose an epic... or just a shopping list perhaps?',
                    theme: 'snow', 
                });
                

                if (this.initialContent) {
                    console.log('Loading initial content:', this.initialContent); // test log to verify content is being loaded
                    this.quill.setContents(JSON.parse(this.initialContent));
                    this.lastSaved = this.initialContent;
                }

                this.quill.on('text-change', (delta, oldDelta, source) => {
                    //console.log('Text change detected:', source); // test
                    if (source === 'user') {
                        this.scheduleSave();
                    }
                });
            });
        },

        scheduleSave() {
            clearTimeout(this.saveTimeout);
            this.saveTimeout = setTimeout(() => {
                this.save();
            }, 2000);
        },

        async save() {
            this.$store.savingElement.show();
            const content = JSON.stringify(this.quill.getContents());

            if (content === this.lastSaved) {
                return;
            } 

            try {
                const response = await fetch(this.route, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': this.csrfToken
                    },
                    body: JSON.stringify({ content: content, id: this.noteId })
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                console.log(data.message);
                this.$store.savingElement.hide();

                this.lastSaved = content;
                
            } catch (error) {
                console.error('Error saving note:', error);
                // show error notification here once made
            }
            this.$store.savingElement.hide();
        }
        
    }
}