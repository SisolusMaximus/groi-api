const mongoose = require("mongoose");
const { Schema } = mongoose;

const ImageSchema = new Schema({
    url: String,
    filename: String
})

const GeometrySchema = new Schema({
    type: String,
    coordinates: [],
    interpolated: Boolean,
    omitted: Boolean
})

const ItemSchema = new Schema({
    name : {
        type : Schema.Types.String,
        maxLength: 50,
        required: true
    },
    price: {
        type: Schema.Types.Number,
        min: 0,
        required: true
    },
    currency : {
        type : Schema.Types.String,
        required: true
    },
    description : {
        type : Schema.Types.String,
        required: true
    },
    condition : {
        type : Schema.Types.String,
        maxLength: 50,
        required: true
    },
    adress : {
        type : Schema.Types.String,
        required: true
    },
    city : {
        type : Schema.Types.String,
        required: true
    },
    state : {
        type : Schema.Types.String,
        required: true
    },
    country : {
        type : Schema.Types.String,
        required: true
    },
    seller: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    images : [
        ImageSchema
    ],
    thumbnail: ImageSchema,
    geometry: GeometrySchema,
    category: {
        "type": "string",
        "enum": [
            "Automotive",
            "Computers",
            "Fashion",
            "Health and beauty",
            "For kids",
            "Home and garden",
            "Household appliances",
            "Office and business",
            "Telephones and accessories",
            "Sport and fitness"
        ]         
    }
});

module.exports = mongoose.model('Item', ItemSchema);