// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server);

// app.use(express.static('public'));

// io.on('connection', (socket) => {
//     console.log('New user connected');
    
//     // Handle draw events
//     socket.on('draw', (data) => {
//         socket.broadcast.emit('draw', data);
//     });
    
//     // Handle clear event
//     socket.on('clear', () => {
//         io.emit('clear');
//     });

//     socket.on('disconnect', () => {
//         console.log('User disconnected');
//     });
// });

// server.listen(3000, () => {
//     console.log('Server is running on port 3000');
// });
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static("public")); //serve static files from the "public" directory

//handles user connection
io.on("connection", (socket) => {
    console.log("A user connected");

    //listens for drawing data from the client
    socket.on("draw", (data) => {
        // Broadcast drawing data to all other users
        socket.broadcast.emit("draw", data);
        console.log("Received drawing data:", data);
    });

    //handles canvas clear event
    socket.on("clearCanvas", () => {
        socket.broadcast.emit("clearCanvas");
    });

    //handles user disconnect
    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

server.listen(3000, () => {
    console.log("Server is running on port 3000");
});
