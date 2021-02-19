const speech = require('@google-cloud/speech').v1p1beta1;
const speakerDiarization = require('./speakerDiarization');
const wordTime = require('./wordTime');

const client = new speech.SpeechClient({
    keyFilename: 'tekolutionsaiapps-706ef73a24d3.json'
});

async function ProcessingBackend(filename, output_fn, language) {
    speakerDiarization.SpeakerDiarization(client, filename, output_fn, language);
    wordTime.WordTime(client, filename, output_fn, language);
}

module.exports = { ProcessingBackend };