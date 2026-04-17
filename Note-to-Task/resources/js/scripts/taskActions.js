import {helperScripts} from './helperScripts';

export default function taskActions(){
    return {

        noteID: null,
        routes: null,
        tasks: null,
        csrfToken: null,
        keyword: "task:",
        creatingTask: false, // to prevent multiple creations of the same task when the keyword is detected multiple times in a row as the user types

        init(noteID, routes, tasks){
            this.noteID = noteID;
            this.routes = routes;
            //this.tasks = [{title: "test", id: "test"}]
            this.tasks = tasks ? tasks : [] ;
            this.csrfToken = document.querySelector('meta[name="csrf-token"]').content;

            console.log("tasks: ", this.tasks)
        },

        
        getTaskData(noteData){ // gets data for task
            let noteContent = noteData["noteEditor"].getContent();
            let indexesOfKeyword = helperScripts.getIndicesOf(this.keyword, noteContent, false);

            //console.log("Indexes: ", indexesOfKeyword);// test
            //console.log("Current content: ", noteContent);// test

            // getting title
            console.log("indexesOfKeyword: ", indexesOfKeyword);
            let taskTitleStartIndex = indexesOfKeyword[indexesOfKeyword.length - 1] + this.keyword.length; 
            let taskTitleEndIndex = noteContent.indexOf('<', taskTitleStartIndex);
            let taskTitle = noteContent.substring(taskTitleStartIndex, taskTitleEndIndex).trim();
            
            if(taskTitle === "" || taskTitle === "&nbsp;"){ // if there is no title after the keyword, give it a default title
                taskTitle = "New Task";
            }

            console.log("Task title:", taskTitle);// test 

            // see if task has an id i.e. its in the db already
            // getting tag behind keyword "task:" and see if it has an id

            // find tag
            let prevTagString = helperScripts.getPrevTag(noteContent, indexesOfKeyword);

            // get id from tag
            console.log("prevTagString: ", prevTagString); // test
            let idMatch = prevTagString.match(/id="taskRef(\d+)"/);
            //console.log("idMatch: ", idMatch); // test
            if(idMatch){
                let taskId = idMatch[1];
                console.log("Task id: ", taskId);
                return {id: taskId, title: taskTitle}
            }
            // seeing if task is a sub task by looking for a parent task tag before it and seeing if it has an id
                // jk not yet 

            // not getting extraInfo or deadline as these are done by their own Actions class

            return {title: taskTitle, made_from_note_id: this.noteID}
        },

        async createTask(taskData, noteData){ // makes task in db and then on front end

            this.creatingTask = true;
            this.$store.savingElement.show();

            let noteContent = noteData["noteEditor"].getContent();
            let indexesOfKeyword = helperScripts.getIndicesOf(this.keyword, noteContent, false);
            
            // store in db 
            let newId = null; // to hold the new id from the db after creation
            try {
                console.log("Sending task data to server: ", taskData); // test
                const response = await fetch(this.routes.create, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': this.csrfToken
                    },
                    body: JSON.stringify(taskData)
                });

                const data = await response.json();

                if (!response.ok) {
                    console.log("Validation errors:", data);
                    throw new Error("Validation failed");
                }

                //console.log("Status:", response.status);
                
                
                //console.log("Response from server: ", data); // test
                newId = data.id;
                //console.log("New task created with id: ", newId); // test 
                //console.log(data.message);
                this.$store.savingElement.hide();
            } catch (error) {
                console.error('Error saving task:', error);
                this.$store.savingElement.hide();
                // show error notification here once made
            }
            
            // show on front end
            taskData["id"] = newId;
            console.log("this.tasks: ", this.tasks)
            this.tasks.push(taskData);
            // set id in note editor
            //const cursorPos = noteData["noteEditor"].selection.getBookmark(); // to save the cursor position so we can put it back after changing the content and losing the cursor position
            let taskStartIndex = indexesOfKeyword[indexesOfKeyword.length - 1] // to get the start place to put a new tag
            let taskEndIndex = noteContent.indexOf('<', taskStartIndex); // to get the start place to put a new tag
            let newNoteContent = noteContent.substring(0, taskStartIndex) + `<span class="task" id="taskRef${newId}">` + noteContent.substring(taskStartIndex, taskEndIndex) + `</span>` + noteContent.substring(taskEndIndex);
            noteData["noteEditor"].setContent(newNoteContent);

            // restore cursor position
            const newTask = noteData["noteEditor"].dom.get(`taskRef${newId}`); // element inside editor
            noteData["noteEditor"].selection.select(newTask, true);
            noteData["noteEditor"].selection.collapse(false); // move to end

            console.log("Task created with id: ", newId); // test
            this.creatingTask = false;

        },

        updateTask(taskData, noteData){ // updates task in db and then on front end

        },

        detectTask(noteData){ // logic for when a task is detected in the note editor
            console.log("task Detected with data:", noteData ); // test
            
            let taskData = this.getTaskData(noteData)
            if (taskData["id"]){
                console.log("Task already exists with id: ", taskData["id"])
                this.updateTask(taskData, noteData)
            }else if (!this.creatingTask){ // to prevent multiple creations 
                this.createTask(taskData, noteData)
            }
        }

    }

} 

