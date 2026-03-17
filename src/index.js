import { PersonController } from './controller/PersonController.js';
import { BookController } from './controller/BookController.js';
import { ModelController } from './controller/ModelTrainingController.js';
import { TFVisorController } from './controller/TFVisorController.js';
import { TFVisorView } from './view/TFVisorView.js';
import { PersonService } from './service/PersonService.js';
import { BookService } from './service/BookService.js';
import { PersonView } from './view/PersonView.js';
import { BookView } from './view/BookView.js';
import { ModelView } from './view/ModelTrainingView.js';
import Events from './events/events.js';
import { WorkerController } from './controller/WorkerController.js';

// Create shared services
const personService = new PersonService();
const bookService = new BookService();

// Create views
const personView = new PersonView();
const bookView = new BookView();
const modelView = new ModelView();
const tfVisorView = new TFVisorView();
const mlWorker = new Worker('/src/workers/modelTrainingWorker.js', { type: 'module' });

// Set up worker message handler
const w = WorkerController.init({
    worker: mlWorker,
    events: Events
});

const People = await personService.getDefaultPeople();
w.triggerTrain(People);

ModelController.init({
    modelView,
    personService,
    events: Events,
});

TFVisorController.init({
    tfVisorView,
    events: Events,
});

BookController.init({
    bookView,
    personService,
    bookService,
    events: Events,
});

const personController = PersonController.init({
    personView,
    personService,
    bookService,
    events: Events,
});

personController.renderPeople({
    "Id": 1000,
    "Nome": "José Nelson Cultri",
    "Idade": 33,
    "Sexo": "M",
    "DataCadastro": new Date().getTime(),
    "readings": []
});