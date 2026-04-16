export default function taskActions(){
    return {

        noteID: null,
        routes: null,
        tasks: null,
        csrfToken: null,
        keyword: "task:",

        tempID: 1, 

        init(noteID, routes, tasks){
            this.noteID = noteID;
            this.routes = routes;
            //this.tasks = [{title: "test", id: "test"}]
            this.tasks = tasks ? tasks : [] ;
            this.csrfToken = document.querySelector('meta[name="csrf-token"]').content;

            console.log("tasks: ", this.tasks)
        },

        getTaskData(noteContent, indexesOfKeyword){ // gets data for task
       
            console.log("Indexes: ", indexesOfKeyword);// test
            console.log("Current content: ", noteContent);// test

            // getting title
            let taskTitleStartIndex = indexesOfKeyword[indexesOfKeyword.length - 1] + this.keyword.length; 
            let taskTitleEndIndex = noteContent.indexOf('<', taskTitleStartIndex);
            let taskTitle = noteContent.substring(taskTitleStartIndex, taskTitleEndIndex).trim();


            console.log("Task title:", taskTitle);

            // see if task has an id i.e. its in the db already


            // not getting extraInfo or deadline as these are done by their own Actions class

            return {title: taskTitle}
        },

        createTask(taskData, noteContent){ // makes task in db and then on front end

            // store in db 
            let newId = this.tempID++ // test for now will be from DB when that bit done
            
            // show on front end
            taskData["id"] = newId;
            console.log("this.tasks: ", this.tasks)
            this.tasks.push(taskData);
            // set id in note editor

        },

        detectTask(noteData){ // logic for when a task is detected in the note editor
            console.log("task Detected with data:", noteData )
            let taskData = this.getTaskData(noteData["noteContent"], noteData["indexesOfKeyword"])
            this.createTask(taskData, noteData["noteContent"] )
        }

    }

} 

