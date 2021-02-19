const speech = require('@google-cloud/speech').v1p1beta1;
const fs = require('fs');
const sentimentAnalysis = require('./sentimentAnalysis');

async function WordTime(client, filename, output_fn, language) {
    try{
        const fileName = 'uploads/' + filename;

        const config = {
            enableWordTimeOffsets: true,
            encoding: 'LINEAR16',
            sampleRateHertz: 44100,
            languageCode: language,
            audioChannelCount: 2,
        };

        const audio = {
            content: fs.readFileSync(fileName).toString('base64'),
        };
        
        const request = {
            config: config,
            audio: audio,
        };
        
        const [operation] = await client.longRunningRecognize(request);
        const [response] = await operation.promise();
        
        var result_d2 = {};
        var sentiment_text = "";
        var i=0;
        console.log("Starting Word TimeStamp processing...");
        response.results.forEach(result => {
            //console.log(`Transcription: ${result.alternatives[0].transcript}`);
            sentiment_text  = sentiment_text + result.alternatives[0].transcript + " ";
            result.alternatives[0].words.forEach(wordInfo => {
                const startSecs =
                `${wordInfo.startTime.seconds}` +
                '.' +
                wordInfo.startTime.nanos / 100000000;
                const endSecs =
                `${wordInfo.endTime.seconds}` +
                '.' +
                wordInfo.endTime.nanos / 100000000;
                var printing = `Word: ${wordInfo.word} --> ${startSecs} secs - ${endSecs} secs`;
                result_d2[`${i}`] = printing;
                i++;
                //console.log(printing);
            });
        });
        //console.log(result_d2);
        fs.readFile(output_fn, 'utf8', function(err, data){
            if (err){
                console.log(err);
            } else {
            var obj = JSON.parse(data);
            obj.data.push(result_d2); //add some data
            var json = JSON.stringify(obj); //convert it back to json
            fs.writeFile(output_fn, json, function(err){
                if (err) throw err;
                //console.log('Process Completed successful...');
            }); 
        }});
        sentimentAnalysis.SentimentAnalysis(sentiment_text, output_fn);
    } catch (err) {
        console.error('ERROR:', err);
    }
}

module.exports = { WordTime};