const cron = require('node-cron');
const moment = require('moment');
const susd_buffer = require('./susd_buffer.js');
const snx_buffer = require('./snx_buffer.js');
const makerv2 = require('./makerv2.js');
const axios = require('axios');
const commaNumber = require('comma-number');
require('dotenv').config();


let token = process.env.TELEGRAM_BOT_KEY;
let devChatId = process.env.TELEGRAM_DEV_MONITORING_CHAT_ID;
let susdChatId = process.env.TELEGRAM_SUSD_CHAT_ID;
let ySupportChatId = process.env.TELEGRAM_YSUPPORT_CHAT_ID;
let env = process.env.ENVIRONMENT;

let balanceSusd;
let balanceSnx;

let firstRunSusd = false;
let firstRunSnx = false;

let lastTimeTrue = 0;

let recurring_job = cron.schedule("* * * * *", () => {
    console.log("---"+new Date()+"---");
    console.log("LAST TIME TRUE", lastTimeTrue);
    
    makerv2().then(values=>{
        message = "";
        console.log(values)
        if(values.trigger){
            // determine if bad
            if(values.isBad){
                message = "🚨 Position is unhealthy, tend needed asap.";
                console.log(message)
                if(lastTimeTrue == 0){
                    lastTimeTrue = Date.now();
                }
            }
            else{
                if(lastTimeTrue == 0){
                    message = "⚠ Tend trigger is true, but position is healthy.";
                    lastTimeTrue = Date.now();
                    console.log(message);
                }
            }
        }
        else{
            if(lastTimeTrue > 0){
                secondsTaken = Math.floor((Date.now() - lastTimeTrue)/1000);
                message = `✅ Tend successful. Took keepers roughly ${(secondsTaken/60).toFixed(2)} minute(s).`;
                console.log(message);
            }
            lastTimeTrue = 0;
        }
        if(message!=""){
            if(env!="PROD"){
                let maker_token = process.env.TELEGRAM_BOT_KEY_MAKER;
                let maker_chat = process.env.TELEGRAM_CHAT_ID_MAKER;
                message = encodeURIComponent(message);
                let url = `https://api.telegram.org/${maker_token}/sendMessage?chat_id=${maker_chat}&text=${message}&parse_mode=HTML&disable_web_page_preview=True`
                axios.post(url).then(r=>{
                    console.log("Maker message sent");
                }).catch(err => console.log(err))
            }
        }
    });
    
    susd_buffer().then(bal=>{
        //if(bal != balanceSusd){
        if(bal != balanceSusd && !firstRunSusd){
            if(balanceSusd == undefined){
                balanceSusd = 0;
            }
            diff = bal - balanceSusd;
            balanceSusd = bal;
            message = "yvSUSD balance: $"+commaNumber((balanceSusd).toFixed(2))+"\n\n";
            message += "Change: $"+commaNumber(diff.toFixed(2))+"\n\n";
            message += "https://etherscan.io/address/0xa5cA62D95D24A4a350983D5B8ac4EB8638887396";
            console.log(message)

            // send to yvSUSD TG group
            let url = `https://api.telegram.org/${token}/sendMessage?chat_id=${susdChatId}&text=${message}&parse_mode=HTML&disable_web_page_preview=True`
            if(env=="PROD"){
                axios.post(url).then(r=>{
                    console.log("SUSD group message sent");
                    console.log(balanceSusd)
                    console.log("---")
                }).catch(err => console.log(err))
            }

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
        if(bal != balanceSnx && !firstRunSnx){
            if(balanceSnx == undefined){
                balanceSnx = 0;
            }
            diff = bal - balanceSnx;
            balanceSnx = bal;
            message = "yvSNX balance: "+commaNumber((balanceSnx).toFixed(2))+" SNX\n\n";
            message += "Change: "+commaNumber(diff.toFixed(2))+" SNX\n\n";
            message += "https://etherscan.io/address/0xF29AE508698bDeF169B89834F76704C3B205aedf";
            console.log(message)

            // send to yvSUSD TG group
            let url = `https://api.telegram.org/${token}/sendMessage?chat_id=${susdChatId}&text=${message}&parse_mode=HTML&disable_web_page_preview=True`
            if(env=="PROD"){
                axios.post(url).then(r=>{
                    console.log("SNX group message sent");
                    console.log(balanceSnx)
                    console.log("---")
                }).catch(err => console.log(err))
            }
        }
        else{
            balanceSnx = bal;
        }
        firstRunSnx = false;
    });
})