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
            // getting tag behind keyword "task:" and see if it has an id

            // find tag
            let prevCharIndex = indexesOfKeyword[indexesOfKeyword.length - 1];
            let preTagChars = [];
            while ( noteContent[prevCharIndex] !== '<' && prevCharIndex > 0 ){
                preTagChars.unshift(noteContent[prevCharIndex]);
                prevCharIndex--;
            }
            // get id from tag
            let preTagString = preTagChars.join('');
            console.log("preTagString: ", preTagString); // test
            let idMatch = preTagString.match(/id="taskRef(\d+)"/);
            console.log("idMatch: ", idMatch); // test
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
            this.$store.savingElement.show();

            let noteContent = noteData["noteEditor"].getContent();
            
            // store in db 
            let newId = null; // to hold the new id from the db after creation
            try {
                
                const response = await fetch(this.routes.create, {
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
                console.log("Status:", response.status); // test
                console.log("Response from server: ", data); // test
                newId = data.id;
                console.log("New task created with id: ", newId); // test 
                console.log(data.message);
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
            let taskStartIndex = noteData["indexesOfKeyword"][noteData["indexesOfKeyword"].length - 1]; // to get the start place to put a new tag
            let taskEndIndex = noteContent.indexOf('<', taskStartIndex); // to get the start place to put a new tag
            let newNoteContent = noteContent.substring(0, taskStartIndex) + `<span class="task" id="taskRef${newId}">` + noteContent.substring(taskStartIndex, taskEndIndex) + `</span>` + noteContent.substring(taskEndIndex);
            noteData["noteEditor"].setContent(newNoteContent);

            // restore cursor position
            const newTask = noteData["noteEditor"].dom.get(`taskRef${newId}`); // element inside editor
            noteData["noteEditor"].selection.select(newTask, true);
            noteData["noteEditor"].selection.collapse(false); // move to end

        },

        detectTask(noteData){ // logic for when a task is detected in the note editor
            console.log("task Detected with data:", noteData )
            let noteContent = noteData["noteEditor"].getContent();
            let taskData = this.getTaskData(noteContent, noteData["indexesOfKeyword"])
            if (taskData["id"]){
                console.log("Task already exists with id: ", taskData["id"])
                // updateTask(taskData, noteData)
            }else{
                this.createTask(taskData, noteData)
            }
        }

    }

} 

