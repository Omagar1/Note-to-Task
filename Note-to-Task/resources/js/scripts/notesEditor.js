import { stringify } from "postcss";
import {helperScripts} from './helperScripts';

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
                extended_valid_elements: 'b[class|id]', // allow b tags with class and id attributes
                toolbar: 'undo redo | fontfamily fontsize | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image table | code',
                setup: (editor) => {
                    this.editor = editor;
                    this.editor.on( 'init', () => {
                        if (initialContent) editor.setContent(this.initialContent) ;
                        this.currentContent = editor.getContent();
                        this.lastSavedContent = editor.getContent();
                    });
                    this.editor.on('change keyup undo redo', () => {
                        console.log('Text changed');
                        let newContent = this.editor.getContent();
                        let delta = helperScripts.getDelta(newContent, this.currentContent);
                        console.log("Delta: ", delta);
                        if (delta.text.trim() !== ""){ // if there is a change that is not just whitespace
                            console.log("getPrevTagIndex: ", helperScripts.getPrevTagIndex(newContent, delta.startIndex));
                            console.log("getNextTagIndex: ", helperScripts.getNextTagIndex(newContent, delta.endIndex));

                            let deltaEffectArea = newContent.substring(helperScripts.getPrevTagIndex(newContent, delta.startIndex),  helperScripts.getNextTagIndex(newContent, delta.endIndex)); // the part of the content that was changed to check for keywords in including tags
                            console.log("Delta effect area: ", deltaEffectArea);
                            this.checkForKeywords(deltaEffectArea);
                            this.currentContent = newContent;
                            this.scheduleSave();
                        }
                    });

                    this.editor.on('arrowright', () => {
                        // move cursor out of tag when pressing enter inside a tag to prevent issues with keyword detection and tags
                        
                        while (node && node.nodeName !== 'SPAN') {
                            node = node.parentNode;
                        }
                        if (node && node.nodeName === 'SPAN') {
                            const parent = node.parentNode;
                            const index = this.editor.dom.nodeIndex(node);
                            

                            // If span is last, create a place for the cursor
                            if (index === parent.childNodes.length - 1) {
                                const space = this.editor.dom.createTextNode(' '); // non-breaking space
                                parent.appendChild(space);
                            }

                            this.editor.selection.setCursorLocation(parent, index + 1);
                        }
                    });

                }
            });
        },

        checkForKeywords(checkStr) { // and trigger their actions if found
            //console.log(typeof(this.currentContent))
            for(const keyword of this.keywords){
                
                let indexesOfKeyword = helperScripts.getIndicesOf(keyword, checkStr, false);
                //console.log("Indexes: ", indexesOfKeyword);// test
                
                if(indexesOfKeyword.length > 0){
                    let dispatchName = keyword.replace(/[:)#-_]/g, "") + "-detected";
                    //console.log("sent to ",dispatchName); // test

                    // check if new keyword:
                    let isNewKeyword = true;

                    this.$dispatch(dispatchName, {noteEditor: this.editor});
                    
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