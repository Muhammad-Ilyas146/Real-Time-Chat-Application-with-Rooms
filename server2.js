//-----importing the Packages-----
const express = require("express");
const path =require('path');  
const http =require('http'); // this is used by express under the hood to create server using createServer(); but we will using it directly in order to use socket.io
const socketio =require('socket.io');

// --------- CONSTANTS------
const PORT = 3000 || process.env.PORT;




// creating app object
const app = express();
const server = http.createServer(app); // creating server
const io = socketio(server);
// setting static folder to acess html/css etc files

app.use(express.static(path.join(__dirname,"public")));

// Run when Client connects 
io.on("connection",socket =>{
   
    // Sending a Welcome message to the Current  user 
    socket.emit('message',"Welcome to LazyChat"); // this to send res to single client 
    
    // Broadcast when a user connects 
    // socket.broadcast.emit('message', 'A User has Joined the Chat');     // this will notify all except the one is connecting

    // io.emit();  // this will notify or send something to all

    // Broadcast when a user/Client connects 
    socket.broadcast.emit('message', 'A User has Joined the Chat');    

    // Broadcast when a user/Client disconnects
    socket.on("disconnect", ()=>{
        // let everyone know that someone disconnected
        io.emit('message','Some one Left the Chat / Disconnectd');
    }) ;



});

// // running server
// app.listen(PORT, ()=>{
//     console.log(`ChatMate Server Running on PORT : ${PORT}`)
// });

// now we will use the created server intead of app

server.listen(PORT, ()=>{
    console.log(`ChatMate Server Running on PORT : ${PORT}`)
});

