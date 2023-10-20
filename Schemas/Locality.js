const mongoose = require('mongoose');

const LOCALITY = new mongoose.Schema({
    country: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true,
    },
})

const localityModel = mongoose.model("LOCATIONS", LOCALITY);
module.exports = { localityModel };