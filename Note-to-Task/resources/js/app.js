import './bootstrap';
import Alpine from 'alpinejs'
import noteComponents from './scripts/noteScripts'
import './scripts/savingElement'

window.Alpine = Alpine

Alpine.data('noteComponents', noteComponents)

Alpine.start()