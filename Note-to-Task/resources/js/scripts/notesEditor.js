
export default function noteEditor({ initialContent, noteId, route, csrfToken} ) {
    return {
        saveTimeout: null,
        lastSavedContent: null,
        currentContent: null, // used for keyword detection - updated faster than lastSavedContent to allow for more responsive keyword detection without triggering saves
        initialContent,
        noteId,
        csrfToken,
        route,
        keywords: ["task:"], // will be loaded in from DB 

        
        init() {
            tinymce.init({
                selector: 'textarea#note-content',
                plugins: 'lists link code',
                toolbar: 'undo redo | fontfamily fontsize | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image table | code',
                setup: (editor) => {
                    this.editor = editor;
                    editor.on( 'init', () => {
                        if (initialContent) editor.setContent(this.initialContent)
                    });
                    editor.on('change keyup undo redo', () => {
                        console.log('Text changed');
                        this.currentContent = editor.getContent();
                        this.checkForKeywords();
                        this.scheduleSave();
                    });
                }
            });
        },

        checkForKeywords() {
            //console.log(typeof(this.currentContent))
            for(const keyword of this.keywords){
                const keywordRegex = new RegExp(keyword, "di");
                let instancesOfKeyword = this.currentContent.match(keywordRegex);
                console.log(instancesOfKeyword); //test 
                if(keywordRegex.test(this.currentContent)){
                    // get the outer html of the last instance of teh keyword
                    


                    // trigger keyword's action 
                    console.log(keyword," triggered");
                }                
                
            }
        },

        scheduleSave() {
            console.log('Scheduling save');
            clearTimeout(this.saveTimeout);
            this.saveTimeout = setTimeout(() => {
                this.save();
            }, 2000);
        },

        sanitizeInput(content) {
            // sanitizes html makes sure no injection

            
            return content; // temp for now 
        },

        async save() {
            
            this.content = this.sanitizeInput(this.currentContent);
            this.$store.savingElement.show();

            if (this.currentContent === this.lastSavedContent) {
                return;
            } 

            try {
                //console.log(this.route)
                const response = await fetch(this.route, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': this.csrfToken
                    },
                    body: JSON.stringify({ content: this.currentContent, id: this.noteId })
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