import {helperScripts} from './helperScripts';
import * as chrono from 'chrono-node';
import { format } from 'date-fns';

export const eventActions = {
    noteID: null,
    routes: null,
    helperScripts: helperScripts,
    eventCreationQueue: [], // to hold task creations that are triggered while a task creation is already in progress
    keywords: null, // will be loaded in from DB in init()
    csrfToken: null,
    tasks: null, // will be a reference to the main one in taskActions

    async init(noteID, routes, tasks, keywords){
        this.noteID = noteID;
        this.routes = routes;
        this.tasks = tasks
        this.csrfToken = document.querySelector('meta[name="csrf-token"]').content;
        this.keywords = keywords;

        document.addEventListener('task-created', (e) => {
            this.processEventCreationQueue();
        }, { once: true }); 

        
    },

    // note there is no way to update the event title this is intentional as the event title is the trigger word 
    getEventData(noteData){
        let taskId = null; 
        let id = noteData["id"] ? parseInt(noteData["id"]) : null; 
        let indexOfKeyword = noteData["newContentText"].indexOf(noteData["triggerWord"]);

        //console.log("Indexes: ", indexesOfKeyword);// test
        //console.log("Current content: ", noteContent);// test

        // getting title
        console.log("indexOfKeyword: ", indexOfKeyword);
        let eventStartIndex = indexOfKeyword + noteData["triggerWord"].length; 
        let eventEndIndex = noteData["newContentText"].indexOf('<', eventStartIndex);
        let eventDate = noteData["newContentText"].substring(eventStartIndex, eventEndIndex).trim();
        
        

        eventDate = eventDate.replace(/&nbsp;/g, ' '); 
        eventDate = eventDate.replace(/<br>/g, ' '); 
        eventDate = eventDate.trim(); 
        console.log("event date: ", eventDate);// test 

        let formattedDate = chrono.en.GB.parseDate(eventDate);
        console.log("formattedDate: ", formattedDate);


        
        if(!id){// if id is null it means it is a new event so need to check for tasks tag
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
        // checking to see if task already has a event
        // let taskIndex = this.tasks.findIndex(task => task.id == taskId);
        // if(taskIndex != -1){ 
        //     console.log("taskIndex: ", taskIndex); // test
        //     console.log("this.tasks[taskIndex]: ", this.tasks[taskIndex]); // test
        //     if (this.tasks[taskIndex].event != null ){
        //         return {error: "task already has a event!"}
        //     }
        // }    

        return {id: id, taskId: taskId, title: noteData['triggerWord'], rawDateTime: eventDate, formattedDateTime: formattedDate}

    },

    async scheduleEventCreation(eventData, noteData){
        let newId = await this.createEventInDB(eventData);
        eventData["id"] = newId; 
        this.createEventOnFrontend(eventData, noteData);
    },

    async createEventInDB(eventData){
        Alpine.store('savingElement').show();

        let dateToDB = null
        if (!eventData.deleting){
            console.log("eventData.formattedDateTime: ", eventData.formattedDateTime)
            dateToDB = format(eventData.formattedDateTime, 'yyyy-MM-dd HH:mm:ss')// get the date in the format for DB
        }
        

        try {
            //console.log(this.route)
            const response = await fetch(this.routes.create, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': this.csrfToken
                },
                body: JSON.stringify({task_id: eventData.taskId, title: eventData.title, event_date_time: dateToDB}) 
            });

            console.log(response); // test 
            const data = await response.json();
            console.log(data.message);
            console.log(data.error);
            console.log(data.event);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            

            Alpine.store('savingElement').hide();

            
            return data.id; 
        } catch (error) {
            console.error('Error setting event:', error);
            Alpine.store('savingElement').hide();
            // show error notification here once made
        }

        Alpine.store('savingElement').hide();
    },

    

    createEventOnFrontend(eventData, noteData){
        console.log("received event data: ", eventData); /// test

        let noteContent = noteData["noteEditor"].getContent();
        let indexesOfKeyword = helperScripts.getIndicesOf(noteData["triggerWord"], noteContent, false);

        // set id in note editor
        //const cursorPos = noteData["noteEditor"].selection.getBookmark(); // to save the cursor position so we can put it back after changing the content and losing the cursor position
        let eventStartIndex = indexesOfKeyword[indexesOfKeyword.length - 1] // to get the start place to put a new tag
        let eventEndIndex = noteContent.indexOf('<', eventStartIndex); // to get the start place to put a new tag

        

        
        // for task card

        let taskIndex = this.tasks.findIndex(task => task.id == eventData["taskId"]);
        console.log("eventData[taskId]: ", eventData["taskId"]); // test
        console.log("taskIndex: ", taskIndex); // test
        console.log("this.tasks[taskIndex]: ", this.tasks[taskIndex]); // test
        if(this.tasks[taskIndex].events){
            this.tasks[taskIndex].events.push({id: eventData["id"], title: eventData["title"], event_date_time: format(eventData["formattedDateTime"], "yyyy-MM-dd'T'HH:mm" )});
        } else{
            this.tasks[taskIndex].events = [{id: eventData["id"], title: eventData["title"], event_date_time: format(eventData["formattedDateTime"], "yyyy-MM-dd'T'HH:mm" )}];
        }
        

        // for note editor 
        let newNoteContent = noteContent.substring(0, eventStartIndex) + `<span class="event" id="eventRef${eventData["id"]}">` + noteContent.substring(eventStartIndex, eventEndIndex) + `</span> &nbsp;` +  noteContent.substring(eventEndIndex)   
        noteData["noteEditor"].setContent(newNoteContent);

        // restore cursor position
        const newEvent = noteData["noteEditor"].dom.get(`eventRef${eventData["taskId"]}`); // element inside editor
        noteData["noteEditor"].selection.select(newEvent, true);
        noteData["noteEditor"].selection.collapse(false); // move to end

        console.log("event created for task: ", eventData["taskId"]); // test
        //this.creatingEvent = false;

        document.dispatchEvent(new CustomEvent('event-created', { detail: { taskId: eventData["taskId"], noteId: this.noteID } })); // to notify other components that a task was created so they can update if needed
        //this.processEventCreationQueue();
        console.log("tasks:", this.tasks);

    },

    scheduleEventUpdate(eventData){
        this.updateEventInDB(eventData);
        this.updateEventOnFrontend(eventData);
    },

    async updateEventInDB(eventData){
        Alpine.store('savingElement').show();

        let dateToDB = null
        if (!eventData.deleting){
            console.log("eventData.formattedDateTime: ", eventData.formattedDateTime)
            dateToDB = format(eventData.formattedDateTime, 'yyyy-MM-dd HH:mm:ss')// get the date in the format for DB
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
                body: JSON.stringify({id: eventData.id, event_date_time: dateToDB}) 
            });

            console.log(response); // test 
            const data = await response.json();
            console.log(data.message);
            console.log(data.error);
            console.log(data.event);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            

            Alpine.store('savingElement').hide();

            
            
        } catch (error) {
            console.error('Error setting event:', error);
            Alpine.store('savingElement').hide();
            // show error notification here once made
        }

        Alpine.store('savingElement').hide();
    },


    updateEventOnFrontend(eventData){
        let taskIndex = this.tasks.findIndex(task => task.id == eventData["taskId"]);
        // console.log("eventData[taskId]: ", eventData["taskId"]); // test
        // console.log("taskIndex: ", taskIndex); // test
        // console.log("this.tasks[taskIndex]: ", this.tasks[taskIndex]); // test
        let eventIndex = this.tasks[taskIndex].events.findIndex(event => event.id == eventData["id"]);
        this.tasks[taskIndex].events[eventIndex].event_date_time = format(eventData["formattedDateTime"], "yyyy-MM-dd'T'HH:mm" );
    },

    scheduleEventDeletion(noteData){
        this.deleteEventInDB(noteData);
        let eventData = this.getEventData(noteData)
        this.deleteEventOnFrontend(eventData);
    },

    async deleteEventInDB(noteData){
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
                body: JSON.stringify({id: noteData["id"],}) 
            });

            console.log(response); // test 
            const data = await response.json();
            console.log(data.message);
            console.log(data.error);
            console.log(data.event);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            Alpine.store('savingElement').hide();

        } catch (error) {
            console.error('Error setting event:', error);
            Alpine.store('savingElement').hide();
            // show error notification here once made
        }

        Alpine.store('savingElement').hide();
    },


    deleteEventOnFrontend(eventData){
        console.log("deleting event of task with Id: ", eventData["taskId"]); // test
        let taskIndex = this.tasks.findIndex(task => task.id == eventData["taskId"]);
        console.log("taskIndex: ", taskIndex); // test
        if(taskIndex >= 0 ){ // if not task in task then task has already been deleted 
            //console.log("taskIndex: ", taskIndex); // test
            //console.log("this.tasks[taskIndex]: ", this.tasks[taskIndex]); // test
            let eventIndex = this.tasks[taskIndex].events.findIndex(event => event.id == eventData["id"]);
            this.tasks[taskIndex].events[eventIndex] = null;
        }
        
    },

    updateEventFromTaskCard(taskId, eventId, eventTitle){
        console.log("updateEventFromTaskCard fired with id:", taskId); // test
        //console.log("tasks: ", this.tasks); // test
        
        setTimeout( ()=>{
            console.log(this.tasks)
            let taskIndex = this.tasks.findIndex(task => task.id == taskId);
            let eventIndex = this.tasks[taskIndex].events.findIndex(event => event.id == eventId);
            let newEventStr = this.tasks[taskIndex].events[eventIndex].event_date_time;
            console.log("newEventStr: ", newEventStr);// test
            let newEventDate = chrono.en.GB.parseDate(newEventStr);
            let formattedEventStr = format(newEventDate, "h:mm a dd/MM/yyyy")
            console.log("newEventDate: ", newEventDate); 
            //this.tasks[taskIndex].event = newEventDate; // this is normally a date object but input tag writes over this as a str so rewriting as date
            this.updateEventInDB({id: eventId, formattedDateTime: newEventDate});
            document.dispatchEvent(new CustomEvent('event-updated', { detail: {id: eventId, eventTitle: eventTitle, formattedDateTime: formattedEventStr} })); // so the note editor can be updated
        }, 1000)
        
    },

    processEventCreationQueue(){ // to process any task creations that were triggered while a task creation was already in progress
        if (this.eventCreationQueue.length > 0){
            let nextNoteData = this.eventCreationQueue.shift();
            console.log("creating next event with data: ", nextNoteData);// tets 
            // creating the event as normal
            let eventData = this.getEventData(nextNoteData);
            this.scheduleEventCreation(eventData, nextNoteData);
        }
    },


}