const fs = require('fs');
const language = require('@google-cloud/language');

// Creates a client
const client = new language.LanguageServiceClient({
    keyFilename: 'tekolutionsaiapps-706ef73a24d3.json'
});

async function SentimentAnalysis(setiment_text, output_fn) {
    const text = setiment_text;

    const document = {
        content: text,
        type: 'PLAIN_TEXT',
    };

    console.log('Starting sentiment analysis...');
    const [result] = await client.analyzeSentiment({document});
    const sentiment = result.documentSentiment;

    // console.log(`  Score: ${sentiment.score}`);
    // console.log(`  Magnitude: ${sentiment.magnitude}`);
    var result_d3 = {};
    result_d3["Score"] = sentiment.score;
    result_d3["Magnitude"] = sentiment.magnitude;

    fs.readFile(output_fn, 'utf8', function(err, data){
        if (err){
            console.log(err);
        } else {
        var obj = JSON.parse(data);
        obj.data.push(result_d3); //add some data
        var json = JSON.stringify(obj); //convert it back to json
        fs.writeFile(output_fn, json, function(err){
            if (err) throw err;
        }); 
    }});
    console.log("Process Completed...");
}
module.exports = { SentimentAnalysis };