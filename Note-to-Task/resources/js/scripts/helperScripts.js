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

        let newContentArray = newContent.split('\n');
        let oldContentArray = oldContent.split('\n');
        let result = {linesChanged: 0, lines: [] };
        let linesConcurrentLength = 0 
        
        for (let i = 0; i < Math.min(newContentArray.length, oldContentArray.length); i++) {
            if (newContentArray[i] !== oldContentArray[i]){ 
                result.linesChanged++;
                let deltaLength = newContentArray[i].length - oldContentArray[i].length;

                if (deltaLength < 0){ // if text was deleted, we want to compare the old content to the new content to get the delta
                    let temp = newContentArray[i];
                    newContentArray[i] = oldContentArray[i];
                    oldContentArray[i] = temp;
                }
                let startIndex = 0; 
                let endIndex = newContentArray[i].length - 1;

                // console.log("Delta length: ", deltaLength); // test
                // console.log("startIndex: ", startIndex); // test
                // console.log("endIndex: ", endIndex); // test

                // console.log("New content: ", newContent); // test
                // console.log("Old content: ", oldContent); // test
                

                while (newContentArray[i][startIndex] === oldContentArray[i][startIndex] && startIndex < oldContentArray[i].length){
                    startIndex++;
                }
                
                
                while (newContentArray[i][endIndex] === oldContentArray[i][endIndex] && endIndex > startIndex){
                    endIndex--;
                }
                
                endIndex++; // to get the index after the last changed character
                let deltaText = newContentArray[i].substring(startIndex, endIndex);

                // adjusting start and end index to be the indices of the delta text in the new content for easier keyword checking later
                //console.log("Lines concurrent length: ", linesConcurrentLength); // test
                startIndex += linesConcurrentLength;
                endIndex += linesConcurrentLength;

                //console.log("Delta: ", deltaText); // test
                endIndex = Math.max(endIndex, 0); // to prevent issues when deleting at the end of the content
                result.lines.push({lineIndex: i, deltaText: deltaText, startIndex: startIndex, endIndex: endIndex, deltaLength: deltaLength});
            }
            linesConcurrentLength += Math.max(newContentArray[i].length, oldContentArray[i].length) + 1; // +1 for the newline character that was removed in the split
        }
        if (newContentArray.length > oldContentArray.length){ // if lines were added, we want to include that in the delta
            for (let i = oldContentArray.length; i < newContentArray.length; i++) {
                result.linesChanged++;
                result.lines.push({lineIndex: i, deltaText: newContentArray[i], startIndex: linesConcurrentLength, endIndex: newContentArray[i].length + linesConcurrentLength, deltaLength: newContentArray[i].length});
                linesConcurrentLength += newContentArray[i].length + 1; // +1 for the newline character that was removed in the split
            }
        } else if (newContentArray.length < oldContentArray.length){ // if lines were deleted, we want to include that in the delta
            for (let i = newContentArray.length; i < oldContentArray.length; i++) {
                result.linesChanged++;
                result.lines.push({lineIndex: i, deltaText: oldContentArray[i], startIndex: linesConcurrentLength, endIndex: oldContentArray[i].length + linesConcurrentLength, deltaLength: -oldContentArray[i].length});
                linesConcurrentLength += oldContentArray[i].length + 1; // +1 for the newline character that was removed in the split
            }
        }

        return result;

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

    diffForHumans(date) {
        const diff = (Date.now() - new Date(date)) / 1000

        if (diff < 60) return `${Math.floor(diff)} seconds ago`
        if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
        return `${Math.floor(diff / 86400)} days ago`
    }

}