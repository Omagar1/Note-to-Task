

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

        getIndicesOf(searchStr, str, caseSensitive) { // from https://stackoverflow.com/questions/3410464/how-to-find-indices-of-all-occurrences-of-one-string-in-another-in-javascript
            var searchStrLen = searchStr.length;
            if (searchStrLen == 0) {
                return [];
            }
            var startIndex = 0, index, indices = [];
            if (!caseSensitive) {
                str = str.toLowerCase();
                searchStr = searchStr.toLowerCase();
            }
            while ((index = str.indexOf(searchStr, startIndex)) > -1) {
                indices.push(index);
                startIndex = index + searchStrLen;
            }
            return indices;
        },

        checkForKeywords() {
            //console.log(typeof(this.currentContent))
            for(const keyword of this.keywords){
                
                let indexesOfKeyword = this.getIndicesOf(keyword, this.currentContent, false);
                
                if(indexesOfKeyword.length > 0){
                    // run keywords action function: 
                    // below is an the code for the "task:" keyword

                    console.log(keyword," triggered");
                    // get data
                    console.log("Indexes: ", indexesOfKeyword);
                    console.log("Current content: ", this.currentContent);

                    // getting title
                    let taskTitleStartIndex = indexesOfKeyword[indexesOfKeyword.length - 1] + keyword.length; 
                    let taskTitleEndIndex = this.currentContent.indexOf('<', taskTitleStartIndex);
                    let taskTitle = this.currentContent.substring(taskTitleStartIndex, taskTitleEndIndex).trim();

                    console.log("Task title:", taskTitle);

                    // store in db 

                    // show on front end
                    
                    // task format 
                    // <label for="checkboxSuccess" class="flex items-center gap-2 text-sm font-medium text-on-surface dark:text-on-surface-dark has-checked:text-on-surface-strong dark:has-checked:text-on-surface-dark-strong has-disabled:opacity-75 has-disabled:cursor-not-allowed">
                    //     <span> </span>
                    //     <span class="relative flex items-center">
                    //         <input id="checkboxSuccess" type="checkbox" class="after:content-[''] peer relative size-4 appearance-none overflow-hidden rounded-sm border border-outline bg-surface-alt before:absolute before:inset-0 checked:border-success checked:before:bg-success focus:outline-2 focus:outline-offset-2 focus:outline-outline-strong checked:focus:outline-success active:outline-offset-0 disabled:cursor-not-allowed dark:border-outline-dark dark:bg-surface-dark-alt dark:checked:border-success dark:checked:before:bg-success dark:focus:outline-outline-dark-strong dark:checked:focus:outline-success" checked />
                    //         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" stroke="currentColor" fill="none" stroke-width="4" class="pointer-events-none invisible absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 text-on-success peer-checked:visible dark:text-on-success-dark">
                    //             <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                    //         </svg>
                    //     </span>
                    // </label>
                    
                    $refs.noTaskMsg.remove()


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