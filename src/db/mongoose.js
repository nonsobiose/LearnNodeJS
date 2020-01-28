const mongoose = require("mongoose");
mongoose.connect(
    `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@947g5-nx4jt.azure.mongodb.net/${process.env.MONGODB_DB}?retryWrites=true&w=majority`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify:false
    }
);


