document.addEventListener("DOMContentLoaded", function () {
    const socket = io();

    //sets up Paper.js with the canvas element
    const canvasElement = document.getElementById('drawingCanvas');
    paper.setup(canvasElement);

    //list of predefined colors
    const colors = [
        { name: "Red", hex: "#FF0000" },
        { name: "Green", hex: "#00FF00" },
        { name: "Blue", hex: "#0000FF" },
        { name: "Yellow", hex: "#FFFF00" },
        { name: "Orange", hex: "#FFA500" },
        { name: "Teal", hex: "#008080" },
        { name: "Purple", hex: "#800080" },
        { name: "Pink", hex: "#FFC0CB" },
        { name: "Brown", hex: "#A52A2A" },
        { name: "Grey", hex: "#808080" },
        { name: "Lime", hex: "#00FF00" },
        { name: "Cyan", hex: "#00FFFF" },
        { name: "Magenta", hex: "#FF00FF" },
        { name: "Gold", hex: "#FFD700" },
        { name: "Salmon", hex: "#FA8072" },
        { name: "Navy", hex: "#000080" },
        { name: "Indigo", hex: "#4B0082" },
        { name: "Violet", hex: "#EE82EE" },
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
    let lastPoint; //to keep track of the last point for drawing

    socket.on("assignColor", (color) => {
        userColor = color; // Set the user's color
        const colorBlockDisplay = document.getElementById('userColorBlock');
        const colorNameDisplay = document.getElementById('userColorName');
        colorBlockDisplay.style.backgroundColor = userColor;
        colorNameDisplay.textContent = userColor; //displays color name
    });

    //event listener for mousedown (start drawing)
    canvasElement.addEventListener("mousedown", (event) => {
        isDrawing = true;
        const point = new paper.Point(event.offsetX, event.offsetY);
        path = new paper.Path();
        path.strokeColor = userColor.hex;
        path.add(point);
        lastPoint = point; //initializes the last point

        //sends drawing data to the server
        socket.emit("draw", {
            color: userColor.hex,
            from: { x: point.x, y: point.y },
            to: { x: point.x, y: point.y } //uses the initial point for `to`
        });
    });

    //event listener for mousemove (drawing)
    canvasElement.addEventListener("mousemove", (event) => {
        if (!isDrawing) return;

        const point = new paper.Point(event.offsetX, event.offsetY);
        path.add(point);
        path.strokeWidth = 2;

        //sends drawing data to the server
        socket.emit("draw", {
            color: userColor.hex,
            from: { x: lastPoint.x, y: lastPoint.y }, //previous point
            to: { x: point.x, y: point.y } //current point
        });
        lastPoint = point; //updates the last point
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
        socket.emit("clearCanvas"); //notifies all users
    });

    //listen for canvas clearing from the server
    socket.on("clearCanvas", () => {
        paper.project.activeLayer.removeChildren(); //clears all drawings
        paper.view.draw();
    });
});
