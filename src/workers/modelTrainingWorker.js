import 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js';
import { workerEvents } from '../events/constants.js';

let _globalCtx = {};
let _model = null;

const handlers = {
    [workerEvents.trainModel]: trainModel,
    [workerEvents.recommend]: recommend,
};

self.onmessage = e => {
    const { action, ...data } = e.data;
    if (handlers[action]) handlers[action](data);
};

/*
Exemplos de chamadas para atualizar a tela:
    postMessage({ type: workerEvents.progressUpdate, progress: { progress: 100 } });

    postMessage({ type: workerEvents.trainingComplete });
    
    postMessage({
        type: workerEvents.recommend,
        user,
        recommendations: sortedItems
    })
*/