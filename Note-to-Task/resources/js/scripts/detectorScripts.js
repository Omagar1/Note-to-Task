import {taskActions} from './taskActions';
import {eventActions} from './eventActions';
import {helperScripts} from './helperScripts';


export default function detectKeywords (){
    return{
        helperScripts: helperScripts,
        actionObjects:  null,
        
        init( noteID, taskRoutes, eventRoutes, tasks, keywords){ // will have labelRoutes once made
            this.actionObjects = {task: taskActions, event: eventActions}
            //console.log("taskActions: ", taskActions); 
            this.actionObjects.task.init(noteID, taskRoutes, tasks, keywords);
            this.actionObjects.event.init(noteID, eventRoutes, this.actionObjects.task.tasks , keywords);
            //actionObjects.label.init();
        },

        
        detectTask(noteData){ // logic for when a task is detected in the note editor
            console.log("task Detected with data:", noteData ); // test
            if (noteData["operation"] == "delete"){ 
                this.actionObjects.task.scheduleTaskDeletion(noteData);
            } else if (noteData["operation"] == "update"){
                this.actionObjects.task.scheduleTaskUpdate(noteData);
            } else if (noteData["operation"] == "create" && !this.actionObjects.task.creatingTask){ // to prevent multiple creations 
                let taskData = this.actionObjects.task.getTaskData(noteData);
                this.actionObjects.task.scheduleTaskCreation(taskData, noteData);
            } else if (noteData["operation"] == "create" && this.actionObjects.task.creatingTask){
                console.log("Already creating task, adding task creation to queue"); // test
                this.actionObjects.task.taskCreationQueue.push(noteData);
            }
        },

        async detectEvent(noteData){ // logic for when a event is detected in the note editor
            console.log("Event Detected with data:", noteData ); // test
            if (noteData["operation"] == "delete"){ 
                this.actionObjects.event.scheduleEventDeletion(noteData["id"]);
            } else if (noteData["operation"] == "update"){
                let eventData = this.actionObjects.event.getEventData(noteData);
                console.log("eventData:" , eventData); // test 
                this.actionObjects.event.scheduleEventUpdate(eventData);
            } else if (noteData["operation"] == "create" && !this.actionObjects.task.creatingTask){ // to prevent multiple creations 
                let eventData = this.actionObjects.event.getEventData(noteData);
                if(eventData.error == null && eventData.taskId !=null && eventData.formattedDateTime != null){
                    this.actionObjects.event.scheduleEventCreation(eventData, noteData);
                } else if (eventData.error == null && eventData.taskId !=null && eventData.formattedDateTime == null){
                    this.actionObjects.event.createEventOnFrontend(eventData, noteData); // create on front end and then when updated will be added to db as update and create are the same thing for events 
                
                }else if (eventData.error == null && eventData.taskId == null && eventData.formattedDateTime != null) {
                    let taskData = {id: null, title: "New Task with Event ", sub_task_of_task_id: null, made_from_note_id: this.noteID}
                    
                    if(!this.actionObjects.task.creatingTask){
                        console.log("event has no task so creating one for it");
                        let newID = await this.actionObjects.task.createTaskInDB(taskData, noteData);
                        console.log("task created with ID: ",newID ); // test 

                        this.actionObjects.task.createTaskOnFrontend(taskData, noteData, newID); 

                        eventData.taskId = newID;

                        this.actionObjects.event.scheduleEventCreation(eventData, noteData);
                    } // ideally would have a  else running this.eventCreationQueue.push(noteData); but i cant get newID from that just yet so :(
                    
                } else if (eventData.error == null && eventData.taskId == null && eventData.formattedDateTime == null){
                    let taskData = {id: null, title: "New Task with Event ", sub_task_of_task_id: null, made_from_note_id: this.noteID}

                    if(!this.actionObjects.task.creatingTask){
                        console.log("event has no task so creating one for it");
                        let newID = await this.actionObjects.task.createTaskInDB(taskData, noteData);
                        console.log("task created with ID: ",newID ); // test 

                        this.actionObjects.task.createTaskOnFrontend(taskData, noteData, newID); 

                        eventData["taskId"] = newID;
                        console.log("setting taskId to: ",eventData["taskId"] ); // test 

                        this.actionObjects.event.createEventOnFrontend(eventData, noteData); // create on front end and then when updated will be added to db as update and create are the same thing for events 
                    } // ideally would have a  else running this.eventCreationQueue.push(noteData); but i cant get newID from that just yet so :(
                }
                else{
                    console.log(eventData.error);
                }
                
            } else if (noteData["operation"] == "create" && this.actionObjects.task.creatingTask){ // to allow time for task to get id and span tag inserted
                console.log("task being created waiting till that completes"); // test
                this.actionObjects.event.eventCreationQueue.push(noteData);
            }
        }
    }
}