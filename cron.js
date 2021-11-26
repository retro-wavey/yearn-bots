const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const susd_buffer = require('./susd_buffer.js');
const snx_buffer = require('./snx_buffer.js');
const makerv2 = require('./makerv2.js');
const axios = require('axios');
const commaNumber = require('comma-number');
require('dotenv').config();
let strategyData = JSON.parse(fs.readFileSync(path.normalize(path.dirname(require.main.filename)+'/config.json')));

let token = process.env.TELEGRAM_BOT_KEY;
let devChatId = process.env.TELEGRAM_DEV_MONITORING_CHAT_ID;
let susdChatId = process.env.TELEGRAM_SUSD_CHAT_ID;
let ySupportChatId = process.env.TELEGRAM_YSUPPORT_CHAT_ID;
let maker_chat = process.env.TELEGRAM_CHAT_ID_MAKER;
let env = process.env.ENVIRONMENT;

let balanceSusd;
let balanceSnx;

let firstRunSusd = false;
let firstRunSnx = false;

cron.schedule("* * * * *", async () => {
    console.log("---"+new Date()+"---");
    for(let i=0; i < strategyData.length; i++){
        s = strategyData[i];
        if(s.type.toLowerCase() == "maker"){
            await handleMaker(s);
        }
        
    }

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

async function handleMaker(data) {
    values = await makerv2(data);
    console.log(values);
    message = "";
    let chatId = maker_chat;
    for(let i=0;i<strategyData.length;i++){
        if(values.strategy.address == strategyData[i].address){
            chatId = strategyData[i].chat_id;
            break;
        }
    }
    if(values.trigger){
        // determine if bad
        if(values.isBad){
            message = "🚨 Position is unhealthy, tend needed asap.";
            if(values.strategy.lastTimeTrue == 0){
                // values.strategy.lastTimeTrue = Date.now();
                for(let i=0;i<strategyData.length;i++){
                    if(values.strategy.address == strategyData[i].address){
                        strategyData[i].lastTimeTrue = Date.now();
                        break;
                    }
                }
                
            }
        }
        else{
            if(values.strategy.lastTimeTrue == 0){
                message = "⚠ Tend trigger is true, but position is healthy.";
                console.log(strategyData)
                for(let i=0;i<strategyData.length;i++){
                    if(values.strategy.address == strategyData[i].address){
                        strategyData[i].lastTimeTrue = Date.now();
                        break;
                    }
                }
            }
        }
    }
    else{
        if(values.strategy.lastTimeTrue > 0){
            secondsTaken = Math.floor((Date.now() - values.strategy.lastTimeTrue)/1000);
            message = `✅ Tend successful. Took keepers roughly ${(secondsTaken/60).toFixed(0)} minute(s).`;
        }
        for(let i=0;i<strategyData.length;i++){
            if(values.strategy.address == strategyData[i].address){
                strategyData[i].lastTimeTrue = 0;
                break;
            }
        }
    }
    if(message!=""){
        if(env=="PROD"){
            let maker_token = process.env.TELEGRAM_BOT_KEY_MAKER;
            header = values.strategy.description+" "+values.strategy.address+"";
            message = encodeURIComponent(message)+"\n\n";
            message = message + header;
            let url = `https://api.telegram.org/${maker_token}/sendMessage?chat_id=${chatId}&text=${message}&parse_mode=HTML&disable_web_page_preview=True`
            try{
                let resp = await axios.post(url);
                console.log(message)
            }
            catch(err){
                console.log("Error sending message to telgeram.");
                console.log(err);
            }
        }
        else{
            console.log(message);
        }
    }
}