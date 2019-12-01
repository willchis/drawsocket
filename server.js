
const port = process.env.PORT || 8080;

const express = require('express'), 
    app = express(),
    http = require('http'),
    socketIo = require('socket.io');

// start webserver on port 8080
const server =  http.createServer(app);
const io = socketIo.listen(server);
server.listen(port);
// add directory with our static files
app.use(express.static(__dirname + '/public'));
console.log("Server running on port:" + port);

// array of all lines drawn
let line_history = [];

// event-handler for new incoming connections
io.on('connection', (socket) => {

   // first send the history to the new client
   for (var i in line_history) {
      socket.emit('draw_line', { line: line_history[i] } );
   }

   // add handler for message type "draw_line".
   socket.on('draw_line', (data) => {
      // add received line to history 
      line_history.push(data.line);
      // send line to all clients
      io.emit('draw_line', { line: data.line });
   });
});