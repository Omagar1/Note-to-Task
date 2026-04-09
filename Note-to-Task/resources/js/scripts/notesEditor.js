export default function noteEditor({ initialContent, noteId, route, csrfToken} ) {
    return {
        quill: null,
        saveTimeout: null,
        lastSavedContent: null,
        currentContent: null, // used for keyword detection - updated faster than lastSavedContent to allow for more responsive keyword detection without triggering saves
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
                    readOnly: false
                });
                

                if (this.initialContent) {
                    console.log('Loading initial content:', this.initialContent); // test log to verify content is being loaded
                    this.quill.setContents(JSON.parse(this.initialContent));
                    this.lastSavedContent = this.initialContent;
                    this.currentContent = this.initialContent;
                }

                this.quill.on('text-change', (delta, oldDelta, source) => {
                    this.currentContent = JSON.stringify(this.quill.getContents());
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

        normalizeDelta(delta) {
            const ops = [...delta.ops];

            // Remove leading empty ops
            while (ops.length && ops[0].insert.trim() === '') ops.shift();

            // Ensure last op ends with newline
            let lastOp = ops[ops.length - 1];
            if (!lastOp.insert.endsWith('\n')) {
                ops.push({ insert: '\n' });
            }

            return { ops };
        },

        async save() {
            this.$store.savingElement.show();
            const content = JSON.stringify(this.normalizeDelta(this.quill.getContents()));

            if (content === this.lastSavedContent) {
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

                this.lastSavedContent = content;
                
            } catch (error) {
                console.error('Error saving note:', error);
                // show error notification here once made
            }
            this.$store.savingElement.hide();
        }
        
    }
}