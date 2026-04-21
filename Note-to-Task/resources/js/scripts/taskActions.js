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
            
            let taskId = noteData["id"] ? noteData["id"] : null; 

            let indexOfKeyword = noteData["newContentText"].indexOf(this.keyword);

            //console.log("Indexes: ", indexesOfKeyword);// test
            //console.log("Current content: ", noteContent);// test

            // getting title
            console.log("indexOfKeyword: ", indexOfKeyword);
            let taskTitleStartIndex = indexOfKeyword + this.keyword.length; 
            let taskTitleEndIndex = noteData["newContentText"].indexOf('<', taskTitleStartIndex);
            let taskTitle = noteData["newContentText"].substring(taskTitleStartIndex, taskTitleEndIndex).trim();
            
            if(taskTitle === "" || taskTitle === "&nbsp;"){ // if there is no title after the keyword, give it a default title
                taskTitle = "New Task";
            }

            taskTitle = taskTitle.replace(/&nbsp;/g, ' '); 
            taskTitle = taskTitle.replace(/<br>/g, ' '); 
            taskTitle = taskTitle.trim(); 
            console.log("Task title:", taskTitle);// test 
            
            // seeing if task is a sub task by looking for a parent task tag before it and seeing if it has an id
                // jk not yet 

            // not getting extraInfo or deadline as these are done by their own Actions class

            return {id: taskId, title: taskTitle, made_from_note_id: this.noteID}
        },

        async createTask(taskData, noteData){ // makes task in db and then on front end
            console.log("Creating task with data: ", taskData); // test
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
            let newNoteContent = noteContent.substring(0, taskStartIndex) + `<span class="task" id="taskRef${newId}">` + noteContent.substring(taskStartIndex, taskEndIndex) + `</span> &nbsp;` + noteContent.substring(taskEndIndex) ;
            noteData["noteEditor"].setContent(newNoteContent);

            // restore cursor position
            const newTask = noteData["noteEditor"].dom.get(`taskRef${newId}`); // element inside editor
            noteData["noteEditor"].selection.select(newTask, true);
            noteData["noteEditor"].selection.collapse(false); // move to end

            console.log("Task created with id: ", newId); // test
            this.creatingTask = false;

            document.dispatchEvent(new CustomEvent('task-created', { detail: { taskId: newId, noteId: this.noteID } })); // to notify other components that a task was created so they can update if needed

        },

        scheduleTaskUpdate(noteData){ // to prevent multiple updates when the user is typing and making multiple changes to the task in a short amount of time
            console.log('Scheduling save');
            clearTimeout(this.$store.savingElement.timeout);
            this.$store.savingElement.timeout = setTimeout(() => {
                this.updateTaskInDB(noteData);
            }, 2000);
            this.updateTaskOnFrontend(noteData);

        },

        updateTaskOnFrontend(noteData){ 
            let taskData = this.getTaskData(noteData);
            // update on front end
            let taskIndex = this.tasks.findIndex(task => task.id == taskData.id);
            if (taskIndex !== -1) {
                this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...taskData };
            }else{
                console.log("Task not found in frontend data with id: ", taskData.id); // test
            }

        },
        async updateTaskInDB(noteData){ 
            let taskData = this.getTaskData(noteData);
            this.$store.savingElement.show();

            try {
                //console.log(this.route)
                const response = await fetch(this.routes.update, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': this.csrfToken
                    },
                    body: JSON.stringify(taskData)
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                console.log(data.message);
                this.$store.savingElement.hide();

                //this.lastSavedContent = content;
                
            } catch (error) {
                console.error('Error updating task:', error);
                this.$store.savingElement.hide();
                // show error notification here once made
            }

            this.$store.savingElement.hide();
        },

        scheduleTaskDeletion(noteData){ // to prevent multiple updates when the user is typing and making multiple changes to the task in a short amount of time
            console.log('Scheduling save');
            clearTimeout(this.$store.savingElement.timeout);
            this.$store.savingElement.timeout = setTimeout(() => {
                this.deleteTaskInDB(noteData);
            }, 2000);
            this.deleteTaskOnFrontend(noteData);

        },

        deleteTaskOnFrontend(noteData){ 
            // update on front end
            let taskIndex = this.tasks.findIndex(task => task.id == noteData["id"]);
            if (taskIndex !== -1) {
                this.tasks.splice(taskIndex, 1);
            }else{
                console.log("Task not found in frontend data with id: ", noteData["id"]); // test
            }

        },
        async deleteTaskInDB(noteData){ 
            this.$store.savingElement.show();

            try {
                //console.log(this.route)
                const response = await fetch(this.routes.delete, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': this.csrfToken
                    },
                    body: JSON.stringify({ id: noteData["taskId"] })
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                console.log(data.message);
                this.$store.savingElement.hide();

                //this.lastSavedContent = content;
                
            } catch (error) {
                console.error('Error deleting task:', error);
                this.$store.savingElement.hide();
                // show error notification here once made
            }

            this.$store.savingElement.hide();
        },

        

        detectTask(noteData){ // logic for when a task is detected in the note editor
            console.log("task Detected with data:", noteData ); // test
            if (noteData["operation"] == "delete"){ 
                this.scheduleTaskDeletion(noteData);
            } else if (noteData["operation"] == "update"){
                this.scheduleTaskUpdate(noteData);
            } else if (noteData["operation"] == "create" && !this.creatingTask){ // to prevent multiple creations 
                let taskData = this.getTaskData(noteData);
                this.createTask(taskData, noteData);
            }
        }
    }
} 

