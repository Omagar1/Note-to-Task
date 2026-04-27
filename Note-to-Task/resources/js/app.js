import './bootstrap';
import Alpine from 'alpinejs';
import noteComponents from './scripts/noteScripts';
import './scripts/savingElement';
import noteEditor from './scripts/notesEditor';
import taskActions from './scripts/taskActions';
import keywordComponents from './scripts/keywordScripts';
import keywordCreation from './scripts/keywordCreation';



window.Alpine = Alpine

Alpine.data('noteComponents', noteComponents);
Alpine.data('noteEditor', noteEditor);
Alpine.data('taskActions', taskActions);
Alpine.data('keywordComponents', keywordComponents);
Alpine.data('keywordCreation', keywordCreation);


Alpine.start()