export const helperScripts = {

    getPrevTag(noteContent, startIndex){ // gets the tag before the keyword to see if it has an id for the task
        //console.log("noteContent: ", noteContent); // test
        //console.log("startIndex: ", startIndex); // test
        let prevCharIndex = startIndex - 1; // to get the index of the character before the keyword
        //console.log("prevCharIndex: ", prevCharIndex); // test
        let prevTagChars = [];
        while ( noteContent[prevCharIndex] !== '<' && prevCharIndex > 0 ){
            prevTagChars.unshift(noteContent[prevCharIndex]);
            prevCharIndex--;
        }
        prevTagChars.unshift(noteContent[prevCharIndex]); // to include the < of the tag
        //console.log("prevTagChars: ", prevTagChars); // test
        return prevTagChars.join('');
    },

    getPrevTagIndex(noteContent, startIndex){ // gets the tag before the keyword to see if it has an id for the task
        let prevCharIndex = startIndex - 1; // to get the index of the character before the keyword
        while ( noteContent[prevCharIndex] !== '<' && prevCharIndex > 0 ){
            prevCharIndex--;
        }
        return prevCharIndex;
    },

    getNextTag(noteContent, startIndex){ // gets the tag after the keyword to see if it has an id for the task
        let nextCharIndex = startIndex + 1; // to get the index of the character after the keyword
        //console.log("nextCharIndex: ", nextCharIndex); // test
        let nextTagChars = [];
        while ( noteContent[nextCharIndex] !== '>' && nextCharIndex < noteContent.length ){
            nextTagChars.push(noteContent[nextCharIndex]);
            nextCharIndex++;
        }
        nextTagChars.push(noteContent[nextCharIndex]); // to include the > of the tag
        //console.log("nextTagChars: ", nextTagChars); // test
        return nextTagChars.join('');
    },

    getNextTagIndex(noteContent, startIndex){ // gets the tag after the keyword to see if it has an id for the task
        let nextCharIndex = startIndex + 1 ; // to get the index of the character after the keyword
        while ( noteContent[nextCharIndex] !== '>' && nextCharIndex < noteContent.length ){
            nextCharIndex++;
        }
        nextCharIndex++; // to include the > of the tag
        return nextCharIndex;
    },
    
    getDelta(newContent, oldContent){

        let deltaLength = newContent.length - oldContent.length;

        if (deltaLength < 0){ // if text was deleted, we want to compare the old content to the new content to get the delta
            let temp = newContent;
            newContent = oldContent;
            oldContent = temp;
        }
        let startIndex = 0;
        let endIndex = newContent.length - 1;

        // console.log("Delta length: ", deltaLength); // test
        // console.log("startIndex: ", startIndex); // test
        // console.log("endIndex: ", endIndex); // test

        // console.log("New content: ", newContent); // test
        // console.log("Old content: ", oldContent); // test
        

        while (newContent[startIndex] === oldContent[startIndex] && startIndex < oldContent.length){
            startIndex++;
        }
        
        
        while (newContent[endIndex] === oldContent[endIndex] && endIndex > startIndex){
            endIndex--;
        }
        
        endIndex++; // to get the index after the last changed character
        let deltaText = newContent.substring(startIndex, endIndex);
    
        //console.log("Delta: ", deltaText); // test
        endIndex = Math.max(endIndex, 0); // to prevent issues when deleting at the end of the content
        return {text: deltaText, startIndex: startIndex, endIndex: endIndex, deltaLength: deltaLength};
    },

    getIndicesOf(searchStr, str, caseSensitive) { // from https://stackoverflow.com/questions/3410464/how-to-find-indices-of-all-occurrences-of-one-string-in-another-in-javascript
        var searchStrLen = searchStr.length;
        if (searchStrLen == 0) {
            return [];
        }
        var startIndex = 0, index, indices = [];
        if (!caseSensitive) {
            str = str.toLowerCase();
            searchStr = searchStr.toLowerCase();
        }
        while ((index = str.indexOf(searchStr, startIndex)) > -1) {
            indices.push(index);
            startIndex = index + searchStrLen;
        }
        return indices;
    },

}