const { parentPort, workerData } = require("worker_threads");
const processing = require('./backend/processing');
const { original, output, language, i } = workerData;

(async () => {
    parentPort.postMessage( `worker ${i}: starting`);
    processing.ProcessingBackend(original, output, language);
})();