const cron = require('node-cron');
const moment = require('moment');
const susd_buffer = require('./susd_buffer.js');
const snx_buffer = require('./snx_buffer.js');
const axios = require('axios');
const commaNumber = require('comma-number');
require('dotenv').config();


let token = process.env.TELEGRAM_BOT_KEY;
let devChatId = process.env.TELEGRAM_DEV_MONITORING_CHAT_ID;
let susdChatId = process.env.TELEGRAM_SUSD_CHAT_ID;
let ySupportChatId = process.env.TELEGRAM_YSUPPORT_CHAT_ID;

let balanceSusd;
let balanceSnx;

let firstRunSusd = true;
let firstRunSnx = true;


console.log("---"+new Date()+"---");
susd_buffer().then(bal=>{
    //if(bal != balanceSusd){
    if(bal != balanceSusd && !firstRunSusd){
        diff = bal - balanceSusd;
        balanceSusd = bal;
        message = "yvSUSD balance: $"+commaNumber((balanceSusd).toFixed(2))+"\n\n";
        message += "Change: $"+commaNumber(diff.toFixed(2))+"\n\n";
        message += "https://etherscan.io/address/0xa5cA62D95D24A4a350983D5B8ac4EB8638887396";
        console.log(message)
    }
    else{
        balanceSusd = bal;
    }
    firstRunSusd = false;
});
snx_buffer().then(bal=>{
    if(bal != balanceSnx && !firstRunSnx){
        console.log("SNX RETURN")
        diff = bal - balanceSnx;
        balanceSnx = bal;
        message = "yvSNX balance: "+commaNumber((balanceSnx).toFixed(2))+" SNX\n\n";
        message += "Change: "+commaNumber(diff.toFixed(2))+" SNX\n\n";
        message += "https://etherscan.io/address/0xF29AE508698bDeF169B89834F76704C3B205aedf";
        console.log(message)
    }
    else{
        balanceSnx = bal;
    }
    firstRunSnx = false;
});