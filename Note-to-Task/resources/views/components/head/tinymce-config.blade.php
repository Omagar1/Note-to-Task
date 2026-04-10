
<script src="https://cdn.tiny.cloud/1/14j8ss91m6jd22s67dbw62q2ae5567ll89u6kvjdvf7j7otu/tinymce/8/tinymce.min.js" referrerpolicy="origin" crossorigin="anonymous"></script>
<script>
    tinymce.init({
        selector: 'textarea#myeditorinstance', // Replace this CSS selector to match the placeholder element for TinyMCE
        plugins: 'code table lists',
        toolbar: 'undo redo | blocks | bold italic | alignleft aligncenter alignright | indent outdent | bullist numlist | code | table',

        setup(editor){
            editor.on('change keyup', () => {
                const content = editor.getContent();
                console.log(content);
                //alpineData.items[index].text = content;
            });
        }
    });
</script>
