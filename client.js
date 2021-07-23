const express = require('express')
const app = express();
const port = process.env.PORT || 4000
const WebHooks = require('node-webhooks')
webHooks = new WebHooks({
    db: {"backend":['http://localhost:3000/api/v1/categories/webhook']},
    httpSuccessCodes:[200,201,202,203,204]
})

document.querySelector(button).addEventListener("click",()=>{
    webHooks.trigger("backend",{data:"TestMessage"})
})

app.listen(port,()=>{
    console.log("Server running on",port);
})

