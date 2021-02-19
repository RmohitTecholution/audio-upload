const speech = require('@google-cloud/speech').v1p1beta1;
const fs = require('fs');

async function SpeakerDiarization(client, filename, output_fn, language) {
    try{
        const fileName = 'uploads/' + filename;

        const config = {
            encoding: 'LINEAR16',
            sampleRateHertz: 44100,
            languageCode: language,
            audioChannelCount: 2,
            enableSpeakerDiarization: true,
            diarizationSpeakerCount: 2,
        };

        const audio = {
            content: fs.readFileSync(fileName).toString('base64'),
        };

        const request = {
            config: config,
            audio: audio,
        };

        console.log("Starting Speaker Diarization...");
        const rslt = await client.recognize(request);
        const [response] = rslt;
        const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');
        
        //console.log(`Transcription: ${transcription}`);
        //console.log('Start Speaker Diarization:');
        const result = response.results[response.results.length - 1];
        const wordsInfo = result.alternatives[0].words;
        //console.log(wordsInfo);

        var maxSpeakr = 0;
        var result_d1 = {};
        var i=0;
        var Spkr1 = "";
        var Spkr2 = "";
        wordsInfo.forEach(a => {
            var printing = ` word: ${a.word}, speakerTag: ${a.speakerTag}`;
            //console.log(printing);
            if(a.speakerTag == 1){
                Spkr1 = Spkr1 + a.word + " ";
                if(Spkr2.length >= 1){
                    result_d1[`${i}`] = "Speaker 2: " + Spkr2;
                    Spkr2 = "";
                    i++;
                }
            } else if(a.speakerTag == 2){
                Spkr2 = Spkr2 + a.word + " ";
                if(Spkr1.length >= 1){
                    result_d1[`${i}`] = "Speaker 1: " + Spkr1;
                    Spkr1 = "";
                    i++;
                }
            }
            if(Spkr1.length >= 1){
                result_d1[`${i}`] = "Speaker 1: " + Spkr1;
            }else if(Spkr2.length >= 1){
                result_d1[`${i}`] = "Speaker 2: " + Spkr2;
            }

            if(a.speakerTag > maxSpeakr){
                maxSpeakr = a.speakerTag;
            }
            //console.log(a);
        });
        
        //console.log(result_d1);
        fs.readFile(output_fn, 'utf8', function(err, data){
            if (err){
                console.log(err);
            } else {
                var obj = JSON.parse(data);
                obj.data.push(result_d1); //add some data
                //console.log(obj);
                var json = JSON.stringify(obj); //convert it back to json
                fs.writeFile(output_fn, json, function(err){
                    if (err) throw err;
                    //console.log('The "data to append" was appended to file!');
                }); 
            }
        });
        //console.log(`The Total No of Speaker in Audio File is: ${maxSpeakr}`);
    } catch (err) {
        console.error('ERROR:', err);
    }
}

module.exports = { SpeakerDiarization };