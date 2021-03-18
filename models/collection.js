const mongoose = require('mongoose');
const CardSchema = require('./card').schema;
const CollectionsSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            max: 32
        },
        userId: {
          type: String,
        } ,
         cards : [CardSchema]
    },
    { timestamps: true }
);
 

module.exports = mongoose.model('collection', CollectionsSchema);  
