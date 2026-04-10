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
            
            
                if (this.quill) {
                    return;
                }
                // this.quill = new Quill(this.$refs.editor, {
                //     theme: 'snow'
                // })

                // this.quill.setText("test\n")
                
                console.log('Before Quill:', this.$refs.editor.innerHTML);
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

                    let normalizeInitialContent = this.normalizeDelta(JSON.parse(this.initialContent));
                    console.log('Normalized initial content:', normalizeInitialContent); // test log to verify normalization of initial content

                    
                    this.quill.setContents(normalizeInitialContent);
                    this.quill.setSelection(Math.max(0, this.quill.getLength() +1 ), 0);

                    this.lastSavedContent = this.initialContent;
                    this.currentContent = this.initialContent;
                }
                console.log('After Quill init:', this.$refs.editor.innerHTML);

                this.quill.on('text-change', (delta, oldDelta, source) => {
                    //this.currentContent = JSON.stringify(this.quill.getContents());
                    console.log('Text change detected:', source); // test
                    if (source === 'user') {
                        this.scheduleSave();
                    }
                });
            
        },

        scheduleSave() {
            clearTimeout(this.saveTimeout);
            this.saveTimeout = setTimeout(() => {
                this.save();
            }, 2000);
        },

        normalizeDelta(delta) {
            console.log('Normalizing delta:', delta); // test log to verify delta is being normalized
            // case where delta is null or doesn't have ops array
            if (!delta || !Array.isArray(delta.ops)) {
                return { ops: [{ insert: '\n' }] };
            }

            const ops = [...delta.ops];// create a copy of the ops array
            let newOps = [];

            // for every \n char make new op with insert: '\n' to ensure newlines are properly represented in the delta 
            ops.forEach(op => {
                if (typeof op.insert === 'string' && op.insert.includes('\n')) {
                    const parts = op.insert.split('');
                    console.log('Splitting op with newlines:', op, 'into parts:', parts); // test log to verify splitting of ops with newlines
                    let newOp = [];
                    parts.forEach((part) => {
                        console.log('Processing part:', part); // test log to verify processing of each part
                        newOp.push(part);
                        console.log('Current newOp:', newOp); // test log to verify construction of newOp
                        if (part === '\n') {
                            console.log('Newline detected adding: ', newOp ); // test log to verify newline detection
                            newOps.push({ insert: newOp.join('') });
                            newOp = [];
                        }
                    });
                } else {
                    newOps.push(op);
                }
            });

            console.log('Normalized ops:', newOps); // test log to verify normalization

            // // Ensure last op is a newline
            // const lastOp = ops[ops.length - 1];

            // if (!lastOp || typeof lastOp.insert !== 'string' || !lastOp.insert.endsWith('\n')) {
            //     ops.push({ insert: '\n' });
            // }

            return  { ops: newOps } ;
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

                //this.lastSavedContent = content;
                
            } catch (error) {
                console.error('Error saving note:', error);
                this.$store.savingElement.hide();
                // show error notification here once made
            }
            this.$store.savingElement.hide();
        }
        
    }
}