//models
const Item = require("../models/item.schema")

require('dotenv').config() 
const mapboxGeocoder = require("@mapbox/mapbox-sdk/services/geocoding")
const geocoder  = mapboxGeocoder({accessToken: process.env.MAPBOX_TOKEN})

module.exports.new = async (req, res) =>{
  try{
      const newItem = new Item(req.body);
      newItem.seller = req.id
      newItem.images = req.files.map(f => ({url: f.path, filename: f.filename}));
      const thumbnailImage = req.files[0];
      thumbnailImage.path = thumbnailImage.path.replace("upload/","upload/w_200,h_200,c_fit/")
      newItem.thumbnail = {url: thumbnailImage.path, filename: thumbnailImage.filename};
      const {adress,country, state, city} = req.body
      const geoData =  await geocoder.forwardGeocode({
        query: `${country}, ${state}, ${city}, ${adress}`,
        limit: 1
      }).send()
      newItem.geometry = geoData.body.features[0].geometry
       
      await newItem.save();
      res.status(200).json({
        success: true,
        data: newItem.toJSON()
      })
  }  catch (e){
    res.status(500).json({
      success: false,
      error: e.message,
    })
  }  
}

module.exports.all = async (req, res) =>{
  try {
    const dbResponse = await Item.find().populate("seller")
    dbResponse.forEach((item)=> {
      item.seller.password = undefined
      item.seller.activated = undefined
    })
    res.status(200).json({
      success: true,
      data: dbResponse
    })
  } catch (e) {
    res.status(500).json({
      success: false,
      error: e.message
    })
  }
}

module.exports.search = async (req, res) =>{
  try {
    const dbResponse = await Item.find({$text: {$search: req.params.query }}).populate("seller")
    dbResponse.forEach((item)=> {
      item.seller.password = undefined
      item.seller.activated = undefined
    })
    res.status(200).json({
      success: true,
      data: dbResponse
    })
  } catch (e) {
    res.status(500).json({
      success: false,
      error: e.message
    })
  }
}

module.exports.show = async (req, res) =>{
  try {
    const dbResponse = await Item.findById(req.params.id).populate("seller")
    dbResponse.seller.password = undefined
    dbResponse.seller.activated = undefined
    res.status(200).json({
      success: true,
      data: dbResponse
    })
  } catch (e) {
    res.status(500).json({
      success: false,
      error: e.message
    })
  }
}

module.exports.filter = async (req, res) =>{
  try {
    const dbResponse = await Item.find({[req.params.typeOfQuery] : req.params.query }).populate("seller")
    dbResponse.forEach((item)=> {
      item.seller.password = undefined
      item.seller.activated = undefined
    })
    res.status(200).json({
      success: true,
      data: dbResponse
    })
  } catch (e) {
    res.status(500).json({
      success: false,
      error: e.message
    })
  }
}

module.exports.delete = async (req, res) =>{
  try{
    const itemTodelete = await Item.findById(req.body._id).populate("seller")
    if (itemTodelete.seller._id.toString() === req.id){
      await Item.findByIdAndDelete(req.body._id)
      res.status(200).json({
        success: true
      })
    }
  } catch (e) {
    res.status(500).json({
      success: false,
      error: e.message
    })
  }
}