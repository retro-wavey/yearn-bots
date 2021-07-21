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

let balanceSusd = 0;
let balanceSnx = 0;

let firstRunSusd = true;
let firstRunSnx = true;

let recurring_job = cron.schedule("* * * * *", () => {
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

            // send to yvSUSD TG group
            let url = `https://api.telegram.org/${token}/sendMessage?chat_id=${susdChatId}&text=${message}&parse_mode=HTML&disable_web_page_preview=True`
            axios.post(url).then(r=>{
                console.log("SUSD group message sent");
                console.log(balanceSusd)
                console.log("---")
            }).catch(err => console.log(err))

            // send to ySupport
            // url = `https://api.telegram.org/${token}/sendMessage?chat_id=${ySupportChatId}&text=${message}&parse_mode=HTML&disable_web_page_preview=True`
            // axios.post(url).then(r=>{
            //     console.log("ySupport group message sent");
            //     console.log(firstRunSusd)
            //     console.log("---")
            // }).catch(err => console.log(err))
        }
        else{
            balanceSusd = bal;
        }
        firstRunSusd = false;
    });
    snx_buffer().then(bal=>{
        //if(bal != balanceSnx){
        if(bal != balanceSnx && !firstRunSnx){
            diff = bal - balanceSnx;
            balanceSnx = bal;
            message = "yvSNX balance: "+commaNumber((balanceSnx).toFixed(2))+" SNX\n\n";
            message += "Change: "+commaNumber(diff.toFixed(2))+" SNX\n\n";
            message += "https://etherscan.io/address/0xF29AE508698bDeF169B89834F76704C3B205aedf";
            console.log(message)

            // send to yvSUSD TG group
            let url = `https://api.telegram.org/${token}/sendMessage?chat_id=${susdChatId}&text=${message}&parse_mode=HTML&disable_web_page_preview=True`
            axios.post(url).then(r=>{
                console.log("SNX group message sent");
                console.log(balanceSnx)
                console.log("---")
            }).catch(err => console.log(err))
        }
        else{
            balanceSnx = bal;
        }
        firstRunSnx = false;
    });
})