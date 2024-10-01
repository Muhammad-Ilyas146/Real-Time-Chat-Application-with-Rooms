const express = require("express");
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');
const emoji = require('node-emoji');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Setting static folder to access HTML/CSS etc. files
app.use(express.static(path.join(__dirname, "public")));

const botName = 'ChatBuddy';

// Run when client connects 
io.on("connection", socket => {
    socket.on('JoinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        console.log('User joined:', user); // Debugging statement

        if (user) {
            // Join the user to the specified room
            socket.join(user.room);
            // console.log()

            // Welcome current user 
            socket.emit('message', formatMessage(botName, emoji.emojify("Welcome to Chat Buddy 👋")));

            // Broadcast when a user connects to that room only
            socket.broadcast.to(user.room).emit('message', formatMessage(botName, emoji.emojify(`${username} has joined the chat.`)));

            // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });

    // Listen for chatMessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        console.log('Current user:', user.username); // Debugging statement

        if (user) {
            io.to(user.room).emit('message', formatMessage(user.username, emoji.emojify(msg)));
        }
    });

    // Broadcast when a user disconnects
    socket.on("disconnect", () => {
        const user = userLeave(socket.id);
        console.log('User left:', user.username ); // Debugging statement

        if (user) {
            io.to(user.room).emit('message', formatMessage(botName, emoji.emojify(`${user.username} has left the chat.`)));

            // Send users and room info after someone leaves
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`ChatMate Server Running on PORT: ${PORT}`);
});
