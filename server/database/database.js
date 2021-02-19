const mongoose = require('mongoose');
const config = require('../../config');

const connect = async() => {
    try{
        const con = await mongoose.connect(config.MONGO_URl, {
            useNewUrlParser: true,
            useUnifiedTopology:true,
            useFindAndModify: false,
            useCreateIndex: true,
            new: true
        });
        console.log(`MongoDB Connected: ${con.connection.host}`);
    } catch(err){
        console.log(err);
        process.exit(1);
    }
};

module.exports = connect;