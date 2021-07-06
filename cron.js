const cron = require('node-cron');
const moment = require('moment');
const susd_buffer = require('./susd_buffer.js');
const axios = require('axios');
const commaNumber = require('comma-number');
require('dotenv').config();


let token = process.env.TELEGRAM_BOT_KEY;
let devChatId = process.env.TELEGRAM_DEV_MONITORING_CHAT_ID;
let susdChatId = process.env.TELEGRAM_SUSD_CHAT_ID;
let ySupportChatId = process.env.TELEGRAM_YSUPPORT_CHAT_ID;

let balance = 0;
let firstRun = true;

let recurring_job = cron.schedule("* * * * *", () => {
    console.log("---"+new Date()+"---");
    susd_buffer().then(bal=>{
        if(bal != balance && !firstRun){
            diff = bal - balance;
            balance = bal;
            message = "yvSUSD balance: $"+commaNumber((balance).toFixed(2))+"\n\n";
            message += "Change: $"+commaNumber(diff.toFixed(2))+"\n\n";
            message += "https://etherscan.io/address/0xa5cA62D95D24A4a350983D5B8ac4EB8638887396";
            console.log(message)

            // send to yvSUSD TG group
            let url = `https://api.telegram.org/${token}/sendMessage?chat_id=${susdChatId}&text=${message}&parse_mode=HTML&disable_web_page_preview=True`
            axios.post(url).then(r=>{
                console.log("SUSD group message sent");
                console.log(balance)
                console.log("---")
            }).catch(err => console.log(err))

            // send to ySupport
            // url = `https://api.telegram.org/${token}/sendMessage?chat_id=${ySupportChatId}&text=${message}&parse_mode=HTML&disable_web_page_preview=True`
            // axios.post(url).then(r=>{
            //     console.log("ySupport group message sent");
            //     console.log(balance)
            //     console.log("---")
            // }).catch(err => console.log(err))
        }
        else{
            balance = bal;
        }
        firstRun = false;
    });
})