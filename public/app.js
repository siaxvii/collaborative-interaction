// const socket = io();
// const canvasElement = document.getElementById('drawingCanvas');
// paper.setup(canvasElement);

// let userColor = getRandomColor();
// document.getElementById('userColor').style.backgroundColor = userColor;

// let path;

// // Start drawing when the mouse is pressed
// canvasElement.addEventListener('mousedown', (event) => {
//     const point = new paper.Point(event.offsetX, event.offsetY);
//     path = new paper.Path();
//     path.strokeColor = userColor;
//     path.add(point);
    
//     canvasElement.addEventListener('mousemove', onMouseMove);
// });

// // Stop drawing when the mouse is released
// canvasElement.addEventListener('mouseup', () => {
//     canvasElement.removeEventListener('mousemove', onMouseMove);
// });

// // Drawing function for mouse move
// function onMouseMove(event) {
//     const point = new paper.Point(event.offsetX, event.offsetY);
//     path.add(point);

//     // Send draw data to other clients
//     socket.emit('draw', {
//         point: [event.offsetX, event.offsetY],  // Sending coordinates
//         color: userColor
//     });
// }

// // Handle draw event from other users
// socket.on('draw', (data) => {
//     const point = new paper.Point(data.point[0], data.point[1]);
//     const otherPath = new paper.Path();
//     otherPath.strokeColor = data.color;
//     otherPath.add(point);
// });

// // Clear button
// document.getElementById('clearBtn').addEventListener('click', () => {
//     paper.project.clear();
//     socket.emit('clear');
// });

// // Clear event from other users
// socket.on('clear', () => {
//     paper.project.clear();
// });

// // Function to generate random colors for users
// function getRandomColor() {
//     const letters = '0123456789ABCDEF';
//     let color = '#';
//     for (let i = 0; i < 6; i++) {
//         color += letters[Math.floor(Math.random() * 16)];
//     }
//     return color;
// }
document.addEventListener("DOMContentLoaded", function () {
    const socket = io();

    //sets up Paper.js with the canvas element
    const canvasElement = document.getElementById('drawingCanvas');
    paper.setup(canvasElement);

    //list of predefined colors
    const colors = [
        { name: "Red", hex: "#FF0000" },
        { name: "Green", hex: "#008000" },
        { name: "Blue", hex: "#0000FF" },
        { name: "Yellow", hex: "#FFFF00" },
        { name: "Purple", hex: "#800080" },
        { name: "Teal", hex: "#008080" },
        { name: "Orange", hex: "#FFA500" }
    ];

    //function to randomly assign a color from the list
    function getRandomColor() {
        const randomIndex = Math.floor(Math.random() * colors.length);
        return colors[randomIndex];
    }

    //assigns a random color to the user
    const userColor = getRandomColor();

    //displays the user's color
    const colorBlockDisplay = document.getElementById('userColorBlock');
    const colorNameDisplay = document.getElementById('userColorName');
    colorBlockDisplay.style.backgroundColor = userColor.hex;
    colorNameDisplay.textContent = userColor.name;

    //variables for drawing
    let isDrawing = false;
    let path;

    //event listener for mousedown (start drawing)
    canvasElement.addEventListener("mousedown", (event) => {
        isDrawing = true;
        const point = new paper.Point(event.offsetX, event.offsetY);
        path = new paper.Path();
        path.strokeColor = userColor.hex;
        path.add(point);

        //sends drawing data to the server
        socket.emit("draw", {
            color: userColor.hex,
            from: { x: event.offsetX, y: event.offsetY },
            to: { x: event.offsetX, y: event.offsetY }
        });
    });

    //event listener for mousemove (drawing)
    canvasElement.addEventListener("mousemove", (event) => {
        if (!isDrawing) return;

        const point = new paper.Point(event.offsetX, event.offsetY);
        path.add(point);

        //sends drawing data to the server
        socket.emit("draw", {
            color: userColor.hex,
            from: { x: event.offsetX, y: event.offsetY },
            to: { x: event.offsetX, y: event.offsetY }
        });
    });

    //event listener for mouseup (stop drawing)
    canvasElement.addEventListener("mouseup", () => {
        isDrawing = false;
        path.simplify();
    });

    //listens for "drawing" event from the server (other users' drawings)
    socket.on("draw", (data) => {
        const { color, from, to } = data;
        const newPath = new paper.Path();
        newPath.strokeColor = color;
        newPath.moveTo(new paper.Point(from.x, from.y));
        newPath.lineTo(new paper.Point(to.x, to.y));
        newPath.strokeWidth = 2;
        paper.view.draw(); // Update the canvas
    });

    //handles clear button click
    const clearButton = document.getElementById("clearBtn");
    clearButton.addEventListener("click", function () {
        paper.project.activeLayer.removeChildren();
        socket.emit("clearCanvas"); // Notify all users
    });

    //listen for canvas clearing from the server
    socket.on("clearCanvas", () => {
        paper.project.activeLayer.removeChildren(); // Clear all drawings
        paper.view.draw();
    });
});
