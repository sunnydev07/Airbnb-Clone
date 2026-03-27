const express = require('express');
const mongoose = require('mongoose');
const Listing = require('../models/listing');
const initData = require('./data');
const { init } = require('../models/review');
const app = express();
main().then(()=> console.log("Connected to DB")).catch((err)=> console.log(err));
async function main(){
    await mongoose.connect("mongodb+srv://devoppsky07:Indianfac780%40@cluster07.yfdndle.mongodb.net/?appName=Cluster07");
}
const initDB = async ()=>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj, owner:"69bfd1b6c3054e3eac3bd4ff"}));

    await Listing.insertMany(initData.data);
    console.log("data was initialised");
};
initDB();