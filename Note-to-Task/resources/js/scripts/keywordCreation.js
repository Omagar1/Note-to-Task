export default function keywordCreation(route, actionData){
    return{
        isCreating: false,
        newlyCreatedKeywords: [],
        newTriggerWord: "",
        newActionId: null,
        errors: null,

        csrfToken: document.querySelector('meta[name="csrf-token"]').content,
        route:route,

        actionData: actionData,

        async submitNewKeyword(){
            this.$store.savingElement.show();
            
            if (!this.isCreating) {
                this.$store.savingElement.hide(); 
                console.log(' not saved - already just saved'); // test 
                return; // prevent multiple saves if already just saved
            }
            else {
                this.isCreating = true; 
                console.log("this.newTriggerWord", this.newTriggerWord); // test 
                console.log("this.newActionId", this.newActionId); // test 

                try {
                    const response = await fetch(this.route, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json' ,
                            'X-CSRF-TOKEN': this.csrfToken
                        },
                        body: JSON.stringify({ trigger_word: this.newTriggerWord, action_id: parseInt(this.newActionId) })
                    });

                    const data = await response.json();
                    // tests 
                    console.log(data.message);
                    console.log(data.id);
                    if (!response.ok) {
                        console.log("Validation errors:", data);
                        this.errors = data.errors
                    }else{
                        // make on frontEnd
                        console.log(this.actionData);
                        console.log(this.actionData.find(action => action.id ===  parseInt(this.newActionId)))
                        this.newlyCreatedKeywords.push({
                            id: data.id, 
                            trigger_word: this.newTriggerWord, 
                            action_id: parseInt(this.newActionId), 
                            action_data:{ name: this.actionData.find(action => action.id === parseInt(this.newActionId)).name} 
                        })
                        
                        this.newTriggerWord = "";
                        this.newActionId = null;
                        this.isCreating = false;
                        this.errors = null;
                    }
                    
                
                    this.$store.savingElement.hide();
                } catch (error) {
                    console.error('Error updating trigger word:', error);
                    // show error notification here once made
                    this.$store.savingElement.hide();
                }
            }
        },

        stopMakingNewKeyword(){
            this.newTriggerWord = "";
            this.newActionId = null;
            this.isCreating = false;
            this.errors = null;
        }


        

    }
}