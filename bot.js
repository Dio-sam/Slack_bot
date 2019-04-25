const fs=require('fs');
const SlackBot=require('slackbots');
require('dotenv').config();
const bot=new SlackBot({
  token:process.env.SLACK_TOKEN,
});

function custom_sort(a, b) { 
  return new Date(a.local_date).getTime() - new Date(b.local_date).getTime();
}

//Start Handler

bot.on('start',function(){
  const params={
    'as_user': true
  }
  bot.postMessage('test',"CouCou, j'ai des événements tech pour toi.\n ",params)
});


bot.on('error',function(err){
  console.log("errrr",err);
});


bot.on('message',function(data){
  if(data.type!=='message'){
    return;
  }
  handleMessage(data.text);
});

//function send message and recupere json file
function handleMessage(message){
  if(message.includes("hello")){
    const params={
      'as_user': true
    }
    fs.readFile('events.json','utf8',function(err,data){
      if(err!==null){
          return err;
      }
      else{
        const json=JSON.parse(data);
        const events=json.events.sort(custom_sort)
        const itemEvents=events.map(event=>event.local_date+" : "+event.name);
        bot.postMessage('test',itemEvents.join("\n"),params);
      }       
    });  
  }
}

module.exports = bot;
