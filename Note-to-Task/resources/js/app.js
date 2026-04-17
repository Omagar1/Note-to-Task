import './bootstrap';
import Alpine from 'alpinejs';
import noteComponents from './scripts/noteScripts';
import './scripts/savingElement';
import noteEditor from './scripts/notesEditor';
import taskActions from './scripts/taskActions';



window.Alpine = Alpine

Alpine.data('noteComponents', noteComponents)
Alpine.data('noteEditor', noteEditor)
Alpine.data('taskActions', taskActions)


Alpine.start()