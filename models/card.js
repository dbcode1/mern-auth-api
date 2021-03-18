const mongoose = require('mongoose');
 
const CardSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            required: true,
            max: 32
        },
        img: {
          type: String
        },
        date: {
          type: String
        },
        name: { 
          type: String
        },
        userId: {
          type: String,
        }
     
    },
    { timestamps: true }
);
 

module.exports = mongoose.model('card', CardSchema);  
