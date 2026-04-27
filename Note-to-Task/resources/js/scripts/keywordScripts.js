
export default function keywordComponents(keyword, routes){
    return {
        // attributes:
        id: keyword.id,
        justSaved: false,
        deleted: false, // used for front end deletion of note after delete request is made - set to true to hide note from dashboard list without needing to refresh page
        // triggerWord stuff
        triggerWord: keyword.trigger_word,
        currentTriggerWord: keyword.trigger_word, // to track the last saved title for change detection
        editingTriggerWord: false,

        // action stuff
        actionId: keyword.action_id,
        actionName: keyword.action_data.name,
        currentActionId: keyword.action_id, // to track the last saved title for change detection
        editingAction: false,

        errors: null,

        csrfToken: document.querySelector('meta[name="csrf-token"]').content,
        routes: routes,
        
        // methods:
        async updateTriggerWord() {
    
            this.$store.savingElement.show();
            
            if (this.justSaved) {
                this.editingTriggerWord = false; 
                this.$store.savingElement.hide(); 
                console.log(' not saved - already just saved'); // debug log to verify that the justSaved flag is working
                return; // prevent multiple saves if already just saved
            }
            else if (this.triggerWord === this.currentTriggerWord ) {
                this.errors = null;
                this.editingTriggerWord = false; // no change so no need to save
                this.$store.savingElement.hide(); 
                console.log('not saved - no change'); // debug log to verify no change
                return;
            } 
            else {
                
                this.justSaved = true; // set flag to prevent immediate subsequent saves
                console.log("this.triggerWord", this.triggerWord); // test 
                console.log("this.id", this.id);

                try {
                    const response = await fetch(routes.update, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json' ,
                            'X-CSRF-TOKEN': this.csrfToken
                        },
                        body: JSON.stringify({ trigger_word: this.triggerWord, id: this.id })
                    });

                    const data = await response.json();
                    console.log(data.message);
                    console.log(data.id);
                    console.log(data.dd);
                    if (!response.ok) {
                        console.log("Validation errors:", data);
                        this.errors = data.errors
                    }else{
                        console.log("response:", response.url)
                        console.log(data.message);
                        this.editingTriggerWord = false;
                        this.errors = null;
                        this.currentTriggerWord = this.triggerWord;
                    }
                    
                    this.$store.savingElement.hide();
                } catch (error) {
                    console.error('Error updating trigger word:', error);
                    // show error notification here once made
                    this.$store.savingElement.hide();
                }
            }
        },

        async updateAction() {
            console.log("this.actionId", this.actionId); // test 
            console.log("this.id", this.id);

    
            this.$store.savingElement.show();
            
            if (this.justSaved) {
                this.editingAction = false; 
                this.$store.savingElement.hide(); 
                console.log(' not saved - already just saved'); // debug log to verify that the justSaved flag is working
                return; // prevent multiple saves if already just saved
            }
            else if (this.actionId === this.currentActionId ) {// no change so no need to save
                this.errors = null;
                this.editingAction = false; 
                this.$store.savingElement.hide(); 
                console.log('not saved - no change'); // debug log to verify no change
                return;
            } 
            else {
                this.justSaved = true;
                
                try {
                    const response = await fetch(routes.update, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json' ,
                            'X-CSRF-TOKEN': this.csrfToken
                        },
                        body: JSON.stringify({ action_id: parseInt(this.actionId), id: this.id })
                    });

                    const data = await response.json();
                    // tests
                    console.log(data.debugDict);
                    console.log(data.message);

                    if (!response.ok) {
                        console.log("Validation errors:", data);
                        this.errors = data.errors
                    }else{
                        console.log("response:", response.url)
                        console.log(data.message);
                        this.editingTriggerWord = false;
                        this.errors = null;
                        this.currentActionId = this.actionId;
                    }
                    //console.log("response:", response.url)
                    
                    console.log(data.message);
                    this.$store.savingElement.hide();


                } catch (error) {
                    console.error('Error updating actionID word:', error);
                    // show error notification here once made
                    this.$store.savingElement.hide();
                }
            }
        },

        async deleteKeyword() {
    
            if (confirm('Are you sure you want to delete this keyword? This action cannot be undone.')) {

                this.deleted = true; // set flag to hide note from dashboard list
                try {
                    const response = await fetch(routes.delete, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json', 
                            'X-CSRF-TOKEN': this.csrfToken
                        },
                        body: JSON.stringify({ id: this.id })
                    })
                    
                    const data = await response.json();
                    console.log(data.message);
                    if (!response.ok) {
                        console.log("Validation errors:", data);
                        this.errors = data.errors
                        this.errors = null;
                    }
                    
                } catch(error) {
                    console.error('Error deleting keyword:', error);
                    // show error notification here once made
                }
            }
        },

    };
}

