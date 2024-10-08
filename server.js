const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static("public")); //serve static files from the "public" directory

let usedColors = new Set();

//handles user connection
io.on("connection", (socket) => {
    console.log("A user connected");

    //assigns a unique color to the user
    let userColor;
    for (const color of colors) {
        if (!usedColors.has(color)) {
            usedColors.add(color);
            userColor = color;
            break;
        }
    }

    socket.emit("assignColor", userColor);

    //listens for drawing data from the client
    socket.on("draw", (data) => {
        // Broadcast drawing data to all other users
        socket.broadcast.emit("draw", data);
    });

    //handles canvas clear event
    socket.on("clearCanvas", () => {
        socket.broadcast.emit("clearCanvas");
    });

    //handles user disconnect
    socket.on("disconnect", () => {
        console.log("A user disconnected");
        if (userColor) {
            usedColors.delete(userColor);
        }
    });
});

server.listen(3000, () => {
    console.log("Server is running on port 3000");
});
