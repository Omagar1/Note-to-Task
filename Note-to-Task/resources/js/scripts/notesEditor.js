import { stringify } from "postcss";
import {helperScripts} from './helperScripts';

export default function noteEditor({ initialContent, noteId, route, csrfToken} ) {
    return {

        userTypeTimeout: null,
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
                extended_valid_elements: 'span[class|id]', // allow span tags with class and id attributes
                keep_styles: false,
                //content_css: "/resources/css/app.css",
                content_style: `
                        .task {
                        background-color: rgb(43, 127, 255);
                        color: white;
                        padding: 2px 4px;
                        border-radius: 4px;
                        font-weight: bold;
                        }
                        .task-selected {
                        background-color: rgb(255, 105, 0);
                        padding: 2px 4px;
                        border-radius: 4px;
                        font-weight: bold;
                        }
                    `,
                toolbar: 'undo redo | fontfamily fontsize | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image table | code',
                setup: (editor) => {
                    this.editor = editor;
                    this.editor.on( 'init', () => {
                        if (initialContent) editor.setContent(this.initialContent) ;
                        this.currentContent = editor.getContent();
                        this.lastSavedContent = editor.getContent();

                        // event listener
                        document.addEventListener('highlight-task', (event) => {
                            const { taskId } = event.detail;
                            // Implementation for highlighting task
                            const taskElement = this.editor.dom.get(`taskRef${taskId}`);
                            this.editor.dom.addClass(taskElement, 'task-selected');
                            document.addEventListener('unhighlight-task', (event) => {
                                this.editor.dom.removeClass(taskElement, 'task-selected');
                            }, { once: true });
                        });
                    });
                    this.editor.on('change keyup undo redo', () => {
                        console.log('Text changed');
                        clearTimeout(this.userTypeTimeout);
                        this.userTypeTimeout = setTimeout(() => { // wait for user to stop typing for 1 second before checking for keywords and saving
                            this.cleanUp(); // has to be before getting content to prevent empty span tags causing issues with keyword detection and tags
                            let newContent = this.editor.getContent();
                            let delta = helperScripts.getDelta(newContent, this.currentContent);
                            console.log("Delta: ", delta);
                            for (const line in delta.lines) {
                                console.log("Checking line: ", delta.lines[line]); // test
                                this.checkForKeywords(newContent, delta.lines[line]);
                            }
                            
                            this.currentContent = newContent;
                            this.scheduleSave();

                        }, 2000);
                        
                        //this.cleanUp();
                    });

                    // this.editor.on('arrowright', () => {
                    //     // move cursor out of tag when pressing enter inside a tag to prevent issues with keyword detection and tags
                        
                    //     while (node && node.nodeName !== 'SPAN') {
                    //         node = node.parentNode;
                    //     }
                    //     if (node && node.nodeName === 'SPAN') {
                    //         const parent = node.parentNode;
                    //         const index = this.editor.dom.nodeIndex(node);
                            

                    //         // If span is last, create a place for the cursor
                    //         if (index === parent.childNodes.length - 1) {
                    //             const space = this.editor.dom.createTextNode(' '); // non-breaking space
                    //             parent.appendChild(space);
                    //         }

                    //         this.editor.selection.setCursorLocation(parent, index + 1);
                    //     }
                    // });

                }
            });
        },

        checkForKeywords(newContent, delta) { // and trigger their actions if found
            //console.log(typeof(this.currentContent))
            console.log("Checking for keywords with delta: ", delta); // test

            let startIndex = delta.startIndex;
            let endIndex = delta.endIndex;
            //console.log("Start index: ", startIndex); // test
            //console.log("End index: ", endIndex); // test
            
            let deltaEffectArea = ""; // the part of the content that was changed to check for keywords in including tags
            let newContentText = newContent.substring(helperScripts.getPrevTagIndex(newContent, startIndex),  helperScripts.getNextTagIndex(newContent, endIndex)); // the actual text that was changed with the tags 
            // find delta effect area to check for keywords in including tags - if there is a change that is not just whitespace


            if (delta.deltaLength  >= 0 ){ 
                console.log("getPrevTagIndex: ", helperScripts.getPrevTagIndex(newContent, startIndex));
                console.log("getNextTagIndex: ", helperScripts.getNextTagIndex(newContent, endIndex));

                deltaEffectArea = newContent.substring(helperScripts.getPrevTagIndex(newContent, startIndex),  helperScripts.getNextTagIndex(newContent, endIndex)); // the part of the content that was changed to check for keywords in including tags
                //console.log("Delta effect area: ", deltaEffectArea); // test
            } else if (delta.deltaLength  < 0){

                console.log("getPrevTagIndex: ", helperScripts.getPrevTagIndex(this.currentContent, startIndex));
                console.log("getNextTagIndex: ", helperScripts.getNextTagIndex(this.currentContent, endIndex));

                deltaEffectArea = this.currentContent.substring(helperScripts.getPrevTagIndex(this.currentContent, startIndex),  helperScripts.getNextTagIndex(this.currentContent, endIndex)); // the part of the content that was changed to check for keywords in including tags
                //console.log("Delta effect area: ", deltaEffectArea); // test
            }


            for(const keyword of this.keywords){
                
                console.log("deltaEffectArea: ", deltaEffectArea); // test
            
                let dispatchName = keyword.replace(/[:)#-_]/g, "") + "-detected";
                //console.log("sent to ",dispatchName); // test

                let keywordRefRegex = new RegExp(keyword.replace(/[:)#-_]/g, "") + "Ref(\\d+)"); // escape special characters in keyword for regex
                let keywordRegex = new RegExp(keyword.replace(/[:)#-_]/g, "\\$&")); // escape special characters in keyword for regex
                console.log("keywordRefRegex: ", keywordRefRegex); // test

            
                let keywordRefInDEA = deltaEffectArea.match(keywordRefRegex);
                let keywordInDelta = delta.deltaText.match(keywordRegex);

                console.log("keywordRefInDEA: ", keywordRefInDEA); // test
                console.log("keywordInDelta: ", keywordInDelta); // test

                if (keywordInDelta && keywordRefInDEA && delta.deltaLength < 0){
                    // deleting a keyword - trigger deletion of task
        
                    let keywordId = keywordRefInDEA[0].replace(keyword.replace(/[:)#-_]/g, "") + "Ref", ''); 
                    console.log("Deleting ", keyword, " with id: ", keywordId);
                    this.$dispatch(dispatchName, {keyword: keyword, operation: "delete", id: keywordId});
                }else if (keywordRefInDEA && !keywordInDelta){
                    // updating a keyword 
                    let keywordId = keywordRefInDEA[0].replace(keyword.replace(/[:)#-_]/g, "") + "Ref", '');
                    console.log("updating ", keyword, " with id: ", keywordId);
                    this.$dispatch(dispatchName, {keyword: keyword, operation: "update", id: keywordId, noteEditor: this.editor, newContentText: newContentText});
                } else if(keywordInDelta && !keywordRefInDEA && delta.deltaLength > 0){ 
                    // creating a keyword
                    console.log("creating a new ", keyword);
                    this.$dispatch(dispatchName, {keyword: keyword, operation: "create", noteEditor: this.editor, newContentText: delta.deltaText});
                    document.addEventListener('task-created', (e) => {
                        console.log("Task created event received in note editor: ", e.detail); // test
                        this.currentContent = this.editor.getContent(); // updating current content to prevent the new span tags trigging a create, update or delete
                    }, { once: true }); 
                    
                }           
                
            }


            
        },

        scheduleSave() {
            console.log('Scheduling save');
            clearTimeout(this.$store.savingElement.timeout);
            this.$store.savingElement.timeout = setTimeout(() => {
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
        },

        cleanUp() { // removes empty span tags that can cause issues with keyword detection and tags
            const allSpans = this.editor.dom.select('span.task');
            allSpans.forEach(span => {
                if (!span.textContent || span.textContent.trim() === '') {
                    this.editor.dom.remove(span, true);
                }
                const nbsp = this.editor.getDoc().createTextNode('\u00A0'); // non-breaking space
                console.log("span.nextSibling: ", span.nextSibling)

                if(!span.nextSibling.test(/&nbsp;/)){
                    this.editor.dom.insertAfter(nbsp, span)
                }
            });
        }
        
    }
}