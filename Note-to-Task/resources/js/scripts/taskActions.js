import {helperScripts} from './helperScripts';
import * as chrono from 'chrono-node';
import { format } from 'date-fns';

export const taskActions = {
    noteID: null,
    routes: null,
    tasks: null,
    taskCreationQueue: [], // to hold task creations that are triggered while a task creation is already in progress

    csrfToken: null,
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
        console.log("keywordInTitle: ", keywordInTitle); // test
        console.log("taskTitleEndIndex:", taskTitleEndIndex); // test
        if(keywordInTitle){
            taskTitleEndIndex = noteData["newContentText"].indexOf(keywordInTitle.trigger_word, taskTitleStartIndex);
        }
        console.log("taskTitleStartIndex:", taskTitleStartIndex); // test
        console.log("taskTitleEndIndex:", taskTitleEndIndex); // test
        console.log("keywordInTitle:", keywordInTitle); // test

        let taskTitle = noteData["newContentText"].substring(taskTitleStartIndex, taskTitleEndIndex).trim();
        
        taskTitle = taskTitle.replace(/&nbsp;/g, ' '); 
        taskTitle = taskTitle.replace(/<br>/g, ' '); 
        taskTitle = taskTitle.trim(); 
        
        if(taskTitle === "" || taskTitle === "&nbsp;" || taskTitle === " "){ // if there is no title after the keyword, give it a default title
            taskTitle = "New Task";
        }
        
        console.log("Task title:", taskTitle);// test 
        
        // seeing if task is a sub task by looking for a parent task tag before it and seeing if it has an id
        let parentTaskId = null; 
        try {
        
        const currentSpan = noteData["noteEditor"].dom.getParent(noteData["noteEditor"].selection.getNode(), 'span') 
        const parentSpanTag =  noteData["noteEditor"].dom.getParent(currentSpan.parentNode, 'span') ? noteData["noteEditor"].dom.getParent(currentSpan.parentNode, 'span') : currentSpan; // the parent is the tag we are in so to get the true parent we do it twice
        console.log("currentSpan: ", currentSpan); // test
        console.log("parentSpanTag: ", parentSpanTag); // test
        // console.log("parentSpanTag.id: ", parentSpanTag.id); // test

        
        if(parentSpanTag){
            let keywordRefRegex = new RegExp("taskRef(\\d+)"); 
            // get the id of the parent task if there is a match
            let match = parentSpanTag.id.match(keywordRefRegex);
            
            console.log("match: ", match); // test

            parentTaskId = match ? parseInt(match[1]) : null; // if there is a match, get the id, otherwise set to null
        }

        } catch{
            parentTaskId = null; 
        }
        // not getting extraInfo or event as these are done by their own Actions class

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
        Alpine.store('savingElement').show();

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
            Alpine.store('savingElement').hide();
            return newId;
        } catch (error) {
            console.error('Error saving task:', error);
            Alpine.store('savingElement').hide();

            // show error notification here once made
            return null;
        }
    },

    createTaskOnFrontend(taskData, noteData, newId){ // to create task on frontend after getting id from db
        // get data prepped:
        taskData["id"] = newId;
        let editor =  noteData["noteEditor"]
        let noteContent = noteData["noteEditor"].getContent();
        let indexesOfKeyword = helperScripts.getIndicesOf(noteData["triggerWord"], noteContent, false);
        let taskStartIndex = indexesOfKeyword[indexesOfKeyword.length - 1] // to get the start place to put a new tag
        let taskEndIndex = noteContent.indexOf('<', taskStartIndex); // to get the start place to put a new tag
        // note there is no keyword exclusion as any keywords are assumed should be part of the task
        let innerHTMLStr = noteContent.substring(taskStartIndex, taskEndIndex);
        console.log("innerHTMLStr: ", innerHTMLStr)

        if (taskData.sub_task_of_task_id){ // for sub tasks
             //for task list
            
            let parentTaskIndex = this.tasks.findIndex(task => task.id == taskData.sub_task_of_task_id);
            console.log("parentTaskIndex: ", parentTaskIndex);
            console.log("parentTask: ", this.tasks[parentTaskIndex]);
            if(this.tasks[parentTaskIndex].sub_tasks){
                this.tasks[parentTaskIndex].sub_tasks.push(taskData);
            } else{
                this.tasks[parentTaskIndex].sub_tasks = [taskData];
            }

            // for editor
            let idStr = "taskRef" + newId;
            let parentIdStr = "taskRef" +taskData.sub_task_of_task_id;

            const parentTaskTag =  editor.dom.get(parentIdStr);
            console.log("parentTaskTag: ", parentTaskTag); // test
            const newTag = editor.dom.create('span', { class: "sub-task",  id: idStr }, innerHTMLStr );
            console.log("newTag: ", newTag); // test
            // replacing with the newTag
            const parentTaskHTML = parentTaskTag.innerHTML;
            const updatedTaskHTML = parentTaskHTML.replace(innerHTMLStr, newTag.outerHTML); 
            editor.dom.setHTML(parentTaskTag, updatedTaskHTML); 
            
            
            

            // move cursor to end of element 
            editor.selection.select(newTag, true);
            editor.selection.collapse(false); 

        

        } else{ // for main tasks

            // for task list 
            this.tasks.push(taskData);

            // for editor
            let idStr = "taskRef" + newId;

            const oldPTag =  editor.dom.getParent(editor.selection.getNode(), 'p');
            console.log("oldPTag: ", oldPTag); // test
            const newTag = editor.dom.create('span', { class: "task",  id: idStr }, innerHTMLStr );
            console.log("newTag: ", newTag); // test
            editor.dom.replace(newTag, oldPTag); 

            // move cursor to end of element 
            editor.selection.select(newTag, true);
            editor.selection.collapse(false); 

        }



        console.log("Task created with id: ", newId); // test
        this.creatingTask = false;

        document.dispatchEvent(new CustomEvent('task-created', { detail: { taskId: newId, noteId: this.noteID } })); // to notify other components that a task was created so they can update if needed
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
        // clearTimeout(Alpine.store('savingElement').timeout);
        // Alpine.store('savingElement').timeout = setTimeout(() => {
        //     this.updateTaskInDB(noteData);
        // }, 2000);
        this.updateTaskInDB(noteData);
        this.updateTaskOnFrontend(noteData);

    },

    updateTaskOnFrontend(noteData){ 
        let taskData = this.getTaskData(noteData);
        // update on front end
        if(taskData.sub_task_of_task_id){
            let taskIndex = this.tasks.findIndex(task => task.id == taskData.sub_task_of_task_id);
            if (taskIndex !== -1) {
                let subTaskIndex = this.tasks[taskIndex].sub_tasks.findIndex(subTask => subTask.id == taskData.id);

                this.tasks[taskIndex].sub_tasks[subTaskIndex].title = taskData.title;

            }else{
                console.log("Task not found in frontend data with id: ", taskData.id); // test
            }

        }else{
            let taskIndex = this.tasks.findIndex(task => task.id == taskData.id);
            if (taskIndex !== -1) {
                this.tasks[taskIndex].title = taskData.title;
            }else{
                console.log("Task not found in frontend data with id: ", taskData.id); // test
            }
        }
    },
    async updateTaskInDB(noteData){ 
        let taskData = this.getTaskData(noteData);
        Alpine.store('savingElement').show();

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
            Alpine.store('savingElement').hide();

            //this.lastSavedContent = content;
            
        } catch (error) {
            console.error('Error updating task:', error);
            Alpine.store('savingElement').hide();
            // show error notification here once made
        }

        Alpine.store('savingElement').hide();
    },

    scheduleTaskDeletion(noteData){ // to prevent multiple updates when the user is typing and making multiple changes to the task in a short amount of time
        console.log('Scheduling deletion');
        clearTimeout(Alpine.store('savingElement').timeout);
        // Alpine.store('savingElement').timeout = setTimeout(() => {
        //     
        // }, 100);
        this.deleteTaskInDB(noteData);
        this.deleteTaskOnFrontend(noteData);

    },

    deleteTaskOnFrontend(noteData){ 
        let taskData = this.getTaskData(noteData);
        // update on front end
        if(taskData.sub_task_of_task_id){
            let taskIndex = this.tasks.findIndex(task => task.id == taskData.sub_task_of_task_id);
            if (taskIndex !== -1) {
                let subTaskIndex = this.tasks[taskIndex].sub_tasks.findIndex(subTask => subTask.id == taskData.id);

                this.tasks[taskIndex].sub_tasks.splice(subTaskIndex, 1);

            }else{
                console.log("Task not found in frontend data with id: ", taskData.id); // test
            }

        }else{
            let taskIndex = this.tasks.findIndex(task => task.id == taskData.id);
            if (taskIndex !== -1) {
                this.tasks.splice(taskIndex, 1);
            }else{
                console.log("Task not found in frontend data with id: ", taskData.id); // test
            }
        }

    },
    async deleteTaskInDB(noteData){ 
        Alpine.store('savingElement').show();

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
            Alpine.store('savingElement').hide();

            //this.lastSavedContent = content;
            console.log("Task deleted with id: ", noteData["id"]); // test
            
        } catch (error) {
            console.error('Error deleting task:', error);
            Alpine.store('savingElement').hide();
            // show error notification here once made
        }

        Alpine.store('savingElement').hide();
    },

    scheduleTaskComplete(taskId, parentTaskID=null){
        // setting timeout so DB is not pinged repeatedly 
        setTimeout(()=>{ 
            this.toggleTaskComplete(taskId, parentTaskID)
        }, 2000); 
    },

    async toggleTaskComplete(taskId, parentTaskID){
        
            console.log("toggleTaskComplete for task: ", taskId);

            Alpine.store('savingElement').show();
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

            
            Alpine.store('savingElement').hide();

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
            Alpine.store('savingElement').hide();
            // show error notification here once made
        }
    },
} 

