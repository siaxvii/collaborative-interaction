const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static("public")); //serve static files from the "public" directory

const colors = [
    "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FFA500",
    "#008080", "#800080", "#FFC0CB", "#A52A2A", "#808080",
    "#00FFFF", "#FF00FF", "#FFD700", "#FA8072", "#000080",
    "#4B0082", "#EE82EE",
];

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
