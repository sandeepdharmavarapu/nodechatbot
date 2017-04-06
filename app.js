// Example 4: implements app actions.
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
//var prompt = require('prompt-sync')();
var ConversationV1 = require('watson-developer-cloud/conversation/v1');


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// Set up Conversation service.
var conversation = new ConversationV1({
  username: 'xxxxxxxxxxxxxxxxxxx', // replace with username from service key
  password: 'yyyyyyyyyyyy', // replace with password from service key
  path: { workspace_id: 'zzzzzzzzzzzzzzz' }, // replace with workspace ID
  version_date: '2017-02-16'
});

// Start conversation with empty message.
io.on("connection", function(socket) {

    conversation.message({}, function processResponse(err, response) {
  if (err) {
    console.error("error: " + err); // something went wrong
    return;
  }
  console.log("2")

  var endConversation = false;
  console.log("working fine until 1");
  
  //io.on("connection", function(socket){
  // Check for action flags.
  if (response.output.action === 'display_time') {
    // User asked what time it is, so we output the local system time
    socket.emit("chat message", new Date().toLocaleTimeString());
    //console.log('The current time is ' + new Date().toLocaleTimeString());
  } else if (response.output.action === 'end_conversation') {
    // User said goodbye, so we're done.
    //console.log(response.output.text[0]);
    socket.emit("chat message", response.output.text[0]);
    endConversation = true;
  } else {
    // Display the output from dialog, if any.
    if (response.output.text.length != 0) {
      socket.emit("chat message", response.output.text[0]);
       // console.log(response.output.text[0]);
    }
  }

  // If we're not done, prompt for the next round of input.
  if (!endConversation) {
      socket.removeAllListeners()
      socket.on("chat message", function(msg){
        io.emit("chat message", msg);

      //})
    //})
    //var newMessageFromUser = prompt('>> ');
    conversation.message({
      input: { text: msg },
      // Send back the context to maintain state.
      context : response.context,
    }, processResponse)
  })
  }     
}
)
})

http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000');
});