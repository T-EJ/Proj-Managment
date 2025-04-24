require('dotenv').config()
const axios = require('axios')
async function sendTemplateMessage() {
const response = await axios( {
url: 'https://graph.facebook.com/v22.0/582585518267338/messages',
method: 'post',
headers:{
'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
'Content-Type': 'application/json'
},
data: JSON.stringify({
    messaging_product: 'whatsapp',
    to: '918401858665',
    type: 'template',
    template: {
    name: 'hello_world',
    language:{
        code:'en_US'
    }
    }
})
})
console.log(response.data)
}

sendTemplateMessage()