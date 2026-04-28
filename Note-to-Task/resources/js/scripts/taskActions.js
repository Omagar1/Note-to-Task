import {helperScripts} from './helperScripts';
import * as chrono from 'chrono-node';
import { format } from 'date-fns';

export default function taskActions(){
    return {

        noteID: null,
        routes: null,
        tasks: null,
        taskCreationQueue: [], // to hold task creations that are triggered while a task creation is already in progress
        deadlineCreationQueue: [], // ditto as above
        csrfToken: null,
        keyword: "task:",
        creatingTask: false, // to prevent multiple creations of the same task when the keyword is detected multiple times in a row as the user types
        helperScripts: helperScripts,
        keywords: null, // will be loaded in from DB in init()

        async init(noteID, routes, tasks, keywords){
            this.noteID = noteID;
            this.routes = routes;
            //this.tasks = [{title: "test", id: "test"}]
            this.tasks = tasks ? tasks : [] ;
            this.csrfToken = document.querySelector('meta[name="csrf-token"]').content;
            this.keywords = keywords;

            console.log("tasks: ", this.tasks);
            
        },

        //  --- task Stuff --- 
        highlightTask(taskId){
            document.dispatchEvent(new CustomEvent('highlight-task', { detail: { taskId: taskId } })); // to notify note editor to highlight the task reference in the note when hovering over the task card
        },
        
        unhighlightTask(taskId){
            document.dispatchEvent(new CustomEvent('unhighlight-task', { detail: { taskId: taskId } })); // to notify note editor to unhighlight the task reference in the note when not hovering over the task card anymore
        },

        
        getTaskData(noteData){ // gets data for task
            
            let taskId = noteData["id"] ? parseInt(noteData["id"]) : null; 

            let indexOfKeyword = noteData["newContentText"].indexOf(noteData["triggerWord"]);

            //console.log("Indexes: ", indexesOfKeyword);// test
            //console.log("Current content: ", noteContent);// test

            // getting title
            console.log("this.keywords: ", this.keywords);//test
            console.log("indexOfKeyword: ", indexOfKeyword);
            let taskTitleStartIndex = indexOfKeyword + noteData["triggerWord"].length; 
            let taskTitleEndIndex = noteData["newContentText"].indexOf('<', taskTitleStartIndex);
            let keywordInTitle = this.keywords.find(keyword =>noteData["newContentText"].includes(keyword.trigger_word, taskTitleStartIndex))
            if(keywordInTitle){
                taskTitleEndIndex = noteData["newContentText"].indexOf(keywordInTitle, taskTitleStartIndex);
            }
            console.log("taskTitleEndIndex:", taskTitleEndIndex); // test
            console.log("keywordInTitle:", keywordInTitle); // test

            let taskTitle = noteData["newContentText"].substring(taskTitleStartIndex, taskTitleEndIndex).trim();
            
            if(taskTitle === "" || taskTitle === "&nbsp;"){ // if there is no title after the keyword, give it a default title
                taskTitle = "New Task";
            }

            taskTitle = taskTitle.replace(/&nbsp;/g, ' '); 
            taskTitle = taskTitle.replace(/<br>/g, ' '); 
            taskTitle = taskTitle.trim(); 
            console.log("Task title:", taskTitle);// test 
            
            // seeing if task is a sub task by looking for a parent task tag before it and seeing if it has an id
            const parentSpanTag = noteData["noteEditor"].dom.getParent(noteData["noteEditor"].selection.getNode(), 'span')
            
            //console.log("parentSpanTag: ", parentSpanTag); // test
            //console.log("parentSpanTag.id: ", parentSpanTag.id); // test

            let parentTaskId = null
            if(parentSpanTag){
                let keywordRefRegex = new RegExp(noteData["actionName"] + "Ref(\\d+)"); 
            let match = parentSpanTag.id.match(keywordRefRegex);
            
            console.log("match: ", match); // test

            let parentTaskId = match ? parseInt(match[1]) : null; // if there is a match, get the id, otherwise set to null
            }
            // not getting extraInfo or deadline as these are done by their own Actions class

            return {id: taskId, title: taskTitle, sub_task_of_task_id: parentTaskId, made_from_note_id: this.noteID}
        },

        async scheduleTaskCreation(taskData, noteData){ 
            let newID = await this.createTaskInDB(taskData, noteData);
            if (newID){
                this.createTaskOnFrontend(taskData, noteData, newID);
            }

        },

        async createTaskInDB(taskData, noteData){ // makes task in db and returns the new id 
            console.log("Creating task with data: ", taskData); // test
            this.creatingTask = true;
            this.$store.savingElement.show();

            let noteContent = noteData["noteEditor"].getContent();
            let indexesOfKeyword = helperScripts.getIndicesOf(noteData["triggerWord"], noteContent, false);
            
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
                console.log("return data: ", data ),
                
                //console.log("Response from server: ", data); // test
                newId = data.id;
                //console.log("New task created with id: ", newId); // test 
                //console.log(data.message);
                this.$store.savingElement.hide();
                return newId;
            } catch (error) {
                console.error('Error saving task:', error);
                this.$store.savingElement.hide();

                // show error notification here once made
                return null;
            }
        },

        createTaskOnFrontend(taskData, noteData, newId){ // to create task on frontend after getting id from db
            taskData["id"] = newId;
            console.log("this.tasks: ", this.tasks)

            let noteContent = noteData["noteEditor"].getContent();
            let indexesOfKeyword = helperScripts.getIndicesOf(noteData["triggerWord"], noteContent, false);

            // set id in note editor
            //const cursorPos = noteData["noteEditor"].selection.getBookmark(); // to save the cursor position so we can put it back after changing the content and losing the cursor position
            let taskStartIndex = indexesOfKeyword[indexesOfKeyword.length - 1] // to get the start place to put a new tag
            let taskEndIndex = noteContent.indexOf('<', taskStartIndex); // to get the start place to put a new tag

            let newNoteContent = "";

            if (taskData.sub_task_of_task_id){ // sub task
                // for task list
                let parentTaskIndex = this.tasks.findIndex(task => task.id == taskData.sub_task_of_task_id);
                console.log("parentTaskIndex: ", parentTaskIndex);
                console.log("parentTask: ", this.tasks[parentTaskIndex]);
                if(this.tasks[parentTaskIndex].sub_tasks){
                    this.tasks[parentTaskIndex].sub_tasks.push(taskData);
                } else{
                    this.tasks[parentTaskIndex].sub_tasks = [taskData];
                }
                

                // for note editor
                newNoteContent = noteContent.substring(0, taskStartIndex) + `<span class="sub-task" id="taskRef${newId}">` + noteContent.substring(taskStartIndex, taskEndIndex) + `</span>` + noteContent.substring(taskEndIndex)  
            }else{ // main task
                // for task list 
                this.tasks.push(taskData);
                // for note editor 
                newNoteContent = noteContent.substring(0, taskStartIndex) + `<span class="task" id="taskRef${newId}">` + noteContent.substring(taskStartIndex, taskEndIndex) + `</span>` + noteContent.substring(taskEndIndex)   
            }
            

            noteData["noteEditor"].setContent(newNoteContent);

            // restore cursor position
            const newTask = noteData["noteEditor"].dom.get(`taskRef${newId}`); // element inside editor
            noteData["noteEditor"].selection.select(newTask, true);
            noteData["noteEditor"].selection.collapse(false); // move to end
            if (taskData.sub_task_of_task_id){ // not a sub task)
                //noteData["noteEditor"].execCommand('InsertLineBreak');
            }else{
                noteData["noteEditor"].execCommand('InsertLineBreak');
            }
            console.log("Task created with id: ", newId); // test
            this.creatingTask = false;

            document.dispatchEvent(new CustomEvent('task-created', { detail: { taskId: newId, noteId: this.noteID } })); // to notify other components that a task was created so they can update if needed
            this.processDeadlineCreationQueue();
            this.processTaskCreationQueue();
        },


        processTaskCreationQueue(){ // to process any task creations that were triggered while a task creation was already in progress
            if (this.taskCreationQueue.length > 0){
                let nextTaskData = this.taskCreationQueue.shift();
                // creating the task as normal
                let taskData = this.getTaskData(nextTaskData);
                this.scheduleTaskCreation(taskData, nextTaskData);
            }
        },
        scheduleTaskUpdate(noteData){ // to prevent multiple updates when the user is typing and making multiple changes to the task in a short amount of time
            console.log('Scheduling update');
            // clearTimeout(this.$store.savingElement.timeout);
            // this.$store.savingElement.timeout = setTimeout(() => {
            //     this.updateTaskInDB(noteData);
            // }, 2000);
            this.updateTaskInDB(noteData);
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
            console.log('Scheduling deletion');
            clearTimeout(this.$store.savingElement.timeout);
            // this.$store.savingElement.timeout = setTimeout(() => {
            //     
            // }, 100);
            this.deleteTaskInDB(noteData);
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
                    body: JSON.stringify({ id: parseInt(noteData["id"]) })
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                console.log(data.message);
                this.$store.savingElement.hide();

                //this.lastSavedContent = content;
                console.log("Task deleted with id: ", noteData["id"]); // test
                
            } catch (error) {
                console.error('Error deleting task:', error);
                this.$store.savingElement.hide();
                // show error notification here once made
            }

            this.$store.savingElement.hide();
        },

        scheduleTaskComplete(taskId, parentTaskID=null){
            // setting timeout so DB is not pinged repeatedly 
            setTimeout(()=>{ 
                this.toggleTaskComplete(taskId, parentTaskID)
            }, 2000); 
        },

        async toggleTaskComplete(taskId, parentTaskID){
            
                console.log("toggleTaskComplete for task: ", taskId);

                this.$store.savingElement.show();
                try {
                //console.log(this.route)
                const response = await fetch(this.routes.toggleComplete, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': this.csrfToken
                    },
                    body: JSON.stringify({ id: taskId })
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                
                this.$store.savingElement.hide();

                //this.lastSavedContent = content;
                console.log("Task completed toggled for task: ", taskId); // test

                // updating front end
                if(parentTaskID){
                    //console.log("parentTaskID: ", parentTaskID); // test 
                    let parentTaskIndex = this.tasks.findIndex(task => task.id == parentTaskID);
                    // console.log("parentTaskIndex: ", parentTaskIndex); // test
                    // console.log("parentTask: ", this.tasks[parentTaskIndex]); // test 
                    // console.log("parentTask.sub_tasks: ", this.tasks[parentTaskIndex].sub_tasks); // test 
                    let taskIndex = this.tasks[parentTaskIndex].sub_tasks.findIndex(task =>task.id ==taskId);
                    //console.log("before: ", this.tasks[parentTaskIndex].sub_tasks[taskIndex].completed_at); // test 
                    this.tasks[parentTaskIndex].sub_tasks[taskIndex].completed_at = (this.tasks[parentTaskIndex].sub_tasks[taskIndex].completed_at)? null : Date.now();
                    //console.log("after: ", this.tasks[parentTaskIndex].sub_tasks[taskIndex].completed_at); // test   

                }else{
                    let taskIndex = this.tasks.findIndex(task => task.id == taskId);
                    this.tasks[taskIndex].completed_at = (this.tasks[taskIndex].completed_at )? null :  Date.now()
                }
                
                
            } catch (error) {
                console.error('Error changing completed_at :', error);
                this.$store.savingElement.hide();
                // show error notification here once made
            }
        },
        //  --- Deadline Stuff ---
        getDeadlineData(noteData){

            let taskId = noteData["id"] ? parseInt(noteData["id"]) : null; 

            let indexOfKeyword = noteData["newContentText"].indexOf(noteData["triggerWord"]);

            //console.log("Indexes: ", indexesOfKeyword);// test
            //console.log("Current content: ", noteContent);// test

            // getting title
            console.log("indexOfKeyword: ", indexOfKeyword);
            let deadlineStartIndex = indexOfKeyword + noteData["triggerWord"].length; 
            let deadlineEndIndex = noteData["newContentText"].indexOf('<', deadlineStartIndex);
            let deadlineDate = noteData["newContentText"].substring(deadlineStartIndex, deadlineEndIndex).trim();
            
            

            deadlineDate = deadlineDate.replace(/&nbsp;/g, ' '); 
            deadlineDate = deadlineDate.replace(/<br>/g, ' '); 
            deadlineDate = deadlineDate.trim(); 
            console.log("deadline date: ", deadlineDate);// test 

            let formattedDate = chrono.en.GB.parseDate(deadlineDate);
            console.log("formattedDate: ", formattedDate);


            
            if(!taskId){// if taskId is null it means it is a new deadline so need to check for tasks tag
                const parentSpanTag = noteData["noteEditor"].dom.getParent(noteData["noteEditor"].selection.getNode(), 'span')
                
                //console.log("parentSpanTag: ", parentSpanTag); // test
                //console.log("parentSpanTag.id: ", parentSpanTag.id); // test

                
                if(parentSpanTag){
                    let keywordRefRegex = new RegExp("taskRef(\\d+)"); 
                // get the id of the parent task if there is a match
                let match = parentSpanTag.id.match(keywordRefRegex);
                
                console.log("match: ", match); // test

                taskId = match ? parseInt(match[1]) : null; // if there is a match, get the id, otherwise set to null
                }
            }
            // checking to see if task already has a deadline
            // let taskIndex = this.tasks.findIndex(task => task.id == taskId);
            // if(taskIndex != -1){ 
            //     console.log("taskIndex: ", taskIndex); // test
            //     console.log("this.tasks[taskIndex]: ", this.tasks[taskIndex]); // test
            //     if (this.tasks[taskIndex].deadline != null ){
            //         return {error: "task already has a deadline!"}
            //     }
            // }    

            return {taskId: taskId, rawDateTime: deadlineDate, formattedDateTime: formattedDate}

        },

        scheduleDeadlineCreation(deadlineData, noteData){
            this.setDeadlineInDB(deadlineData);
            this.createDeadlineOnFrontend(deadlineData, noteData);
        },

        async setDeadlineInDB(deadlineData){
            this.$store.savingElement.show();

            let dateToDB = null
            if (!deadlineData.deleting){
                console.log("deadlineData.formattedDateTime: ", deadlineData.formattedDateTime)
                dateToDB = format(deadlineData.formattedDateTime, 'yyyy-MM-dd HH:mm:ss')// get the date in the format for DB
            }
            

            try {
                //console.log(this.route)
                const response = await fetch(this.routes.update, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': this.csrfToken
                    },
                    body: JSON.stringify({id: deadlineData.taskId, deadline: dateToDB}) 
                });

                console.log(response); // test 
                const data = await response.json();
                console.log(data.message);
                console.log(data.error);
                console.log(data.deadline);

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                
                

                this.$store.savingElement.hide();

                
                
            } catch (error) {
                console.error('Error setting deadline:', error);
                this.$store.savingElement.hide();
                // show error notification here once made
            }

            this.$store.savingElement.hide();
        },

        createDeadlineOnFrontend(deadlineData, noteData){
            console.log("received deadline data: ", deadlineData); /// test

            let noteContent = noteData["noteEditor"].getContent();
            let indexesOfKeyword = helperScripts.getIndicesOf(noteData["triggerWord"], noteContent, false);

            // set id in note editor
            //const cursorPos = noteData["noteEditor"].selection.getBookmark(); // to save the cursor position so we can put it back after changing the content and losing the cursor position
            let deadlineStartIndex = indexesOfKeyword[indexesOfKeyword.length - 1] // to get the start place to put a new tag
            let deadlineEndIndex = noteContent.indexOf('<', deadlineStartIndex); // to get the start place to put a new tag

            

            
            // for task card

            let taskIndex = this.tasks.findIndex(task => task.id == deadlineData["taskId"]);
            console.log("deadlineData[taskId]: ", deadlineData["taskId"]); // test
            console.log("taskIndex: ", taskIndex); // test
            console.log("this.tasks[taskIndex]: ", this.tasks[taskIndex]); // test
            this.tasks[taskIndex].deadline = format(deadlineData["formattedDateTime"], "yyyy-MM-dd'T'HH:mm" );
            

            // for note editor 
            let newNoteContent = noteContent.substring(0, deadlineStartIndex) + `<span class="deadline" id="deadlineRef${deadlineData["taskId"]}">` + noteContent.substring(deadlineStartIndex, deadlineEndIndex) + `</span> &nbsp;` +  noteContent.substring(deadlineEndIndex)   
            noteData["noteEditor"].setContent(newNoteContent);

            // restore cursor position
            const newDeadline = noteData["noteEditor"].dom.get(`deadlineRef${deadlineData["taskId"]}`); // element inside editor
            noteData["noteEditor"].selection.select(newDeadline, true);
            noteData["noteEditor"].selection.collapse(false); // move to end

            console.log("deadline created for task: ", deadlineData["taskId"]); // test
            //this.creatingDeadline = false;

            document.dispatchEvent(new CustomEvent('deadline-created', { detail: { taskId: deadlineData["taskId"], noteId: this.noteID } })); // to notify other components that a task was created so they can update if needed
            //this.processDeadlineCreationQueue();
            console.log("tasks:", this.tasks);

        },

        scheduleDeadlineUpdate(deadlineData){
            this.setDeadlineInDB(deadlineData);
            this.updateDeadlineOnFrontend(deadlineData);
        },


        updateDeadlineOnFrontend(deadlineData){
            let taskIndex = this.tasks.findIndex(task => task.id == deadlineData["taskId"]);
            // console.log("deadlineData[taskId]: ", deadlineData["taskId"]); // test
            // console.log("taskIndex: ", taskIndex); // test
            // console.log("this.tasks[taskIndex]: ", this.tasks[taskIndex]); // test
            this.tasks[taskIndex].deadline = format(deadlineData["formattedDateTime"], "yyyy-MM-dd'T'HH:mm" );
        },

        scheduleDeadlineDeletion(taskId){
            this.setDeadlineInDB({taskId: taskId, deleting: true });
            this.deleteDeadlineOnFrontend(taskId);
        },


        deleteDeadlineOnFrontend(taskId){
            console.log("deleting deadline of task with Id: ", taskId); // test
            let taskIndex = this.tasks.findIndex(task => task.id == taskId);
            console.log("taskIndex: ", taskIndex); // test
            if(taskIndex >= 0 ){ // if not task in task then task has already been deleted 
                console.log("taskIndex: ", taskIndex); // test
                console.log("this.tasks[taskIndex]: ", this.tasks[taskIndex]); // test
                this.tasks[taskIndex].deadline = null;
            }
            
        },

        updateDeadlineFromTaskCard(taskId){
            console.log("update updateDeadlineFromTaskCard fired with id:", taskId); // test
            //console.log("tasks: ", this.tasks); // test
            
            setTimeout( ()=>{
                let taskIndex = this.tasks.findIndex(task => task.id == taskId);
                let newDeadlineStr = this.tasks[taskIndex].deadline;
                let newDeadlineDate = chrono.en.GB.parseDate(newDeadlineStr);
                let formattedDeadlineStr = format(newDeadlineDate, "h:mm a dd/MM/yyyy")
                console.log("newDeadlineDate: ", newDeadlineDate); 
                //this.tasks[taskIndex].deadline = newDeadlineDate; // this is normally a date object but input tag writes over this as a str so rewriting as date
                this.setDeadlineInDB({taskId: taskId, formattedDateTime: newDeadlineDate});
                document.dispatchEvent(new CustomEvent('deadline-updated', { detail: { taskId:taskId , deadline: formattedDeadlineStr } })); // so the note editor can be updated
            }, 1000)
            
        },

        processDeadlineCreationQueue(){ // to process any task creations that were triggered while a task creation was already in progress
            if (this.deadlineCreationQueue.length > 0){
                let nextNoteData = this.deadlineCreationQueue.shift();
                // creating the task as normal
                let deadlineData = this.getDeadlineData(nextNoteData);
                this.scheduleDeadlineCreation(deadlineData, nextNoteData);
            }
        },

        
        // --- detector stuff --- 
        detectTask(noteData){ // logic for when a task is detected in the note editor
            console.log("task Detected with data:", noteData ); // test
            if (noteData["operation"] == "delete"){ 
                this.scheduleTaskDeletion(noteData);
            } else if (noteData["operation"] == "update"){
                this.scheduleTaskUpdate(noteData);
            } else if (noteData["operation"] == "create" && !this.creatingTask){ // to prevent multiple creations 
                let taskData = this.getTaskData(noteData);
                this.scheduleTaskCreation(taskData, noteData);
            } else if (noteData["operation"] == "create" && this.creatingTask){
                console.log("Already creating task, adding task creation to queue"); // test
                this.taskCreationQueue.push(noteData);
            }
        },

        async detectDeadline(noteData){ // logic for when a task is detected in the note editor
            console.log("Deadline Detected with data:", noteData ); // test
            if (noteData["operation"] == "delete"){ 
                this.scheduleDeadlineDeletion(noteData["id"]);
            } else if (noteData["operation"] == "update"){
                let deadlineData = this.getDeadlineData(noteData);
                console.log("deadlineData:" , deadlineData); // test 
                this.scheduleDeadlineUpdate(deadlineData);
            } else if (noteData["operation"] == "create" && !this.creatingTask){ // to prevent multiple creations 
                let deadlineData = this.getDeadlineData(noteData);
                if(deadlineData.error == null && deadlineData.taskId !=null && deadlineData.formattedDateTime != null){
                    this.scheduleDeadlineCreation(deadlineData, noteData);
                } else if (deadlineData.error == null && deadlineData.taskId !=null && deadlineData.formattedDateTime == null){
                    this.createDeadlineOnFrontend(deadlineData, noteData); // create on front end and then when updated will be added to db as update and create are the same thing for deadlines 
                
                }else if (deadlineData.error == null && deadlineData.taskId == null && deadlineData.formattedDateTime != null) {
                    let taskData = {id: null, title: "New Task with Deadline ", sub_task_of_task_id: null, made_from_note_id: this.noteID}
                    
                    if(!this.creatingTask){
                        console.log("deadline has no task so creating one for it");
                        let newID = await this.createTaskInDB(taskData, noteData);
                        console.log("task created with ID: ",newID ); // test 

                        this.createTaskOnFrontend(taskData, noteData, newID); 

                        deadlineData.taskId = newID;

                        this.scheduleDeadlineCreation(deadlineData, noteData);
                    } // ideally would have a  else running this.deadlineCreationQueue.push(noteData); but i cant get newID from that just yet so :(
                    
                } else if (deadlineData.error == null && deadlineData.taskId == null && deadlineData.formattedDateTime == null){
                    let taskData = {id: null, title: "New Task with Deadline ", sub_task_of_task_id: null, made_from_note_id: this.noteID}

                    if(!this.creatingTask){
                        console.log("deadline has no task so creating one for it");
                        let newID = await this.createTaskInDB(taskData, noteData);
                        console.log("task created with ID: ",newID ); // test 

                        this.createTaskOnFrontend(taskData, noteData, newID); 

                        deadlineData["taskId"] = newID;
                        console.log("setting taskId to: ",deadlineData["taskId"] ); // test 

                        this.createDeadlineOnFrontend(deadlineData, noteData); // create on front end and then when updated will be added to db as update and create are the same thing for deadlines 
                    } // ideally would have a  else running this.deadlineCreationQueue.push(noteData); but i cant get newID from that just yet so :(
                }
                else{
                    console.log(deadlineData.error);
                }
                
            } else if (noteData["operation"] == "create" && this.creatingTask){ // to allow time for task to get id and span tag inserted
                console.log("task being created waiting till that completes"); // test
                this.deadlineCreationQueue.push(noteData);
            }
        }

    }
} 

