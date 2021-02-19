const path = require('path');
const fs = require('fs');
const logUpdate = require('log-update');
const { Worker } = require("worker_threads");
var ObjectId = require('mongodb').ObjectID;

const uploadModel = require('../model/schema');

exports.home = async (req, res) => {
    const all_files = await uploadModel.find();
    res.render('main', {files_arr: all_files});
};

exports.upload = async (req, res, next) => {
    const files = JSON.parse(JSON.stringify(req.files))['audio-file'];
    const language = JSON.parse(JSON.stringify(req.body))['language-type'];
    //console.log(files, language);
    
    if(!files){
        const error = new Error("Please Choose Files");
        error.httpStatusCode = 400;
        return next(error);
    }

    var l = files.length;
    for(var i = 0; i < l; i++){
        files[i]['language'] = language;
        files[i]['id'] = new ObjectId();
        var filename = files[i].filename;
        var extension = path.extname(filename);
        files[i]['new_filename'] = path.basename(filename,extension);
        files[i]['output_filename'] = 'public/output/' + files[i]['new_filename'] + '.json';
        files[i]['download_path'] = path.join('output', files[i]['new_filename'] + '.json');
        files[i]['status'] = "Processing...";
        
        var obj = {'data': []};
        var json = JSON.stringify(obj);
        //console.log(__dirname);
        fs.writeFile(path.join(__dirname + '../../../' + files[i]['output_filename']), json, 'utf8', function(err){
            if(err){
                console.log(err);
            };
        });
    }
    let names = [...Array(l)].fill(0);
    for (let i = 0; i < l; i++) {
        let original = files[i]['filename'];
        let output = files[i]['output_filename'];
        let language = files[i]['language'];

        const port = new Worker(require.resolve('../../worker.js'), {
            workerData: {original, output, language, i}
        });
        const thread_Id = port.threadId;
        
        port.on("message", (data) => handleMessage(data, i));
        port.on("error", (e) => console.log(e));
        port.on("exit", (exitCode) => exit_worker(thread_Id,exitCode));
    }
    
    function exit_worker(thread_Id, exitCode){
        console.log(`Worker ${thread_Id} has stopped with code ${exitCode}`);
        files[thread_Id-1]['status'] = "Completed...";
        uploadModel.findByIdAndUpdate(files[thread_Id-1].id, 
            { job_status: "Completed" }, 
            function (err, docs) { 
                if (err){ 
                    console.log(err) 
                }
            }
        );
    }
    
    function handleMessage(_, i) {
        names[i]++;
        logUpdate(names.map((status, i) => `Thread ${i}: ${status}  ${_}`).join("\n"));
    }
    //return res.sendFile(path.join(__dirname+'/public/index.hbs'));
    //return res.json(req.files);
    //res.render("main.hbs");
    //console.log(path.join(__dirname, '../../../output/'));

    let filesArray = files.map((src, index) => {
        let files_data = {
            filename: files[index].filename,
            contentType: files[index].mimetype,
            output_filename: files[index].output_filename,
            language: files[index].language,
            _id: files[index].id,
            originalname: files[index].originalname,
            download_link: files[index].download_path,
            job_status: files[index].status
        }

        let newUpload = new uploadModel(files_data);

        return newUpload
            .save()
            .then(() => {
                return {msg: `${files[index].originalname} file uploaded successful...`}
            })
            .catch(error => {
                if(error){
                    if(error.name === 'MongoError' && error.code === 11000){
                        return Promise.reject({ error: `Duplicate ${files[index].originalname}. File already Exist.`});
                    }
                    return Promise.reject({error: error.message || `Cannot Upload ${files[index].originalname} something missing!`});
                }
            })
    });
    Promise.all(filesArray)
        .then(msg => {
            //res.json(msg);
            res.redirect('/');
        })
        .catch(err => {
            res.json(err);
        })
    //res.json(files);
};

exports.data = async (req, res) => {
    const id = req.params.id;
    try{
        const files = await uploadModel.findById(id);
        //var selection = {_id, filename, language, job_status};
        res.send(files);
    } catch(err){
        console.log(err.msg);
    }
    //console.log(req.params.id);
};

