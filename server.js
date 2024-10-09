const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

//serves static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

const colors = [
    "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FFA500",
    "#008080", "#800080", "#FFC0CB", "#A52A2A", "#808080",
    "#00FFFF", "#FF00FF", "#FFD700", "#FA8072", "#000080",
    "#4B0082", "#EE82EE",
];

let usedColors = new Set(); //tracks assigned colors

//handles user connection
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    //assigns a unique color to the user
    let userColor;
    for (const color of colors) {
        if (!usedColors.has(color)) {
            usedColors.add(color);
            userColor = color;
            break;
        }
    }

    //handles case when all colors are used
    if (!userColor) {
        //assigns a random color if all predefined colors are used
        userColor = colors[Math.floor(Math.random() * colors.length)];
        console.log("All predefined colors used. Assigning random color:", userColor);
    }

    //sends the assigned color to the connected user
    socket.emit("assignColor", userColor);

    //notifies all users about the new user and their color
    socket.broadcast.emit("userJoined", { color: userColor });

    //listens for drawing data from the client
    socket.on("draw", (data) => {
        //broadcasts drawing data to all other users
        socket.broadcast.emit("draw", data);
    });

    //handles canvas clear event
    socket.on("clearCanvas", () => {
        socket.broadcast.emit("clearCanvas");
    });

    //handles user disconnect
    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
        //removes the user's color from used colors when they disconnect
        if (userColor) {
            usedColors.delete(userColor);
        }
    });
});

//uses port that Heroku provides, or defaults to 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:3000`);
});