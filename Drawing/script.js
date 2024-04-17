const canvas = document.querySelector("canvas"),
toolBtns = document.querySelectorAll(".tool"),
fillColor = document.querySelector("#fill-color"),
sizeSlider = document.querySelector("#size-slider"),
colorBtns = document.querySelectorAll(".colors .option"),
colorPicker = document.querySelector("#color-picker"),
clearCanvas = document.querySelector(".clear-canvas"),
saveImg = document.querySelector(".save-img"),
ctx = canvas.getContext("2d");

// global variables with default value
let prevMouseX, prevMouseY, snapshot,
isDrawing = false,
selectedTool = "brush",
brushWidth = 5,
selectedColor = "#000";

const setCanvasBackground = () => {
    // setting whole canvas background to white, so the downloaded img background will be white
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor; // setting fillstyle back to the selectedColor, it'll be the brush color
}

window.addEventListener("load", () => {
    // setting canvas width/height.. offsetwidth/height returns viewable width/height of an element
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    setCanvasBackground();
});

const drawLine = (e) => {
    ctx.beginPath(); // create a new path to draw line
    ctx.moveTo(prevMouseX, prevMouseY); // move the starting point to the previous mouse position
    ctx.lineTo(e.offsetX, e.offsetY); // draw a line from the previous mouse position to the current mouse position
    ctx.stroke(); // draw the line
}

const drawParallelogram = (e) => {
    ctx.beginPath(); // Creating a new path for drawing the parallelogram
    ctx.moveTo(prevMouseX, prevMouseY); // Move to the starting point (prevMouseX, prevMouseY)
    const offsetX = prevMouseX - e.offsetX;
    const offsetY = prevMouseY - e.offsetY;
    ctx.lineTo(e.offsetX, e.offsetY); // Draw first line from starting point to current mouse position
    ctx.lineTo(e.offsetX + offsetX, e.offsetY);// Calculate the third point using the offsets to form the parallelogram
    ctx.lineTo(prevMouseX + offsetX, prevMouseY); // Calculate the fourth point to complete the parallelogram
    ctx.closePath();
    fillColor.checked ? ctx.fill() : ctx.stroke();
}

const drawRect = (e) => {
    // if fillColor isn't checked draw a rect with border else draw rect with background
    if(!fillColor.checked) {
        // creating circle according to the mouse pointer
        return ctx.strokeRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
    }
    ctx.fillRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
}

const drawEllipse = (e) => {
    ctx.beginPath(); // creating new path to draw circle
    // getting radius for circle according to the mouse pointer
    const centerX = (prevMouseX + e.offsetX) / 2;
    const centerY = (prevMouseY + e.offsetY) / 2;
    const radiusX = Math.abs(e.offsetX - prevMouseX) / 2;
    const radiusY = Math.abs(e.offsetY - prevMouseY) / 2;
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    ctx.closePath();
    fillColor.checked ? ctx.fill() : ctx.stroke(); // if fillColor is checked fill circle else draw border circle
}

// const drawCircle = (e) => {
//     ctx.beginPath(); // creating new path to draw circle
//     // getting radius for circle according to the mouse pointer
//     let radius = Math.sqrt(Math.pow((prevMouseX - e.offsetX), 2) + Math.pow((prevMouseY - e.offsetY), 2));
//     ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI); // creating circle according to the mouse pointer
//     fillColor.checked ? ctx.fill() : ctx.stroke(); // if fillColor is checked fill circle else draw border circle
// }

const drawTriangle = (e) => {
    ctx.beginPath(); // creating new path to draw circle
    ctx.moveTo(prevMouseX, prevMouseY); // moving triangle to the mouse pointer
    ctx.lineTo(e.offsetX, e.offsetY); // creating first line according to the mouse pointer
    ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY); // creating bottom line of triangle
    ctx.closePath(); // closing path of a triangle so the third line draw automatically
    fillColor.checked ? ctx.fill() : ctx.stroke(); // if fillColor is checked fill triangle else draw border
}

const startDraw = (e) => {
    isDrawing = true;
    prevMouseX = e.offsetX; // passing current mouseX position as prevMouseX value
    prevMouseY = e.offsetY; // passing current mouseY position as prevMouseY value
    ctx.beginPath(); // creating new path to draw
    ctx.lineWidth = brushWidth; // passing brushSize as line width
    ctx.strokeStyle = selectedColor; // passing selectedColor as stroke style
    ctx.fillStyle = selectedColor; // passing selectedColor as fill style
    // copying canvas data & passing as snapshot value.. this avoids dragging the image
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

const drawing = (e) => {
    if(!isDrawing) return; // if isDrawing is false return from here
    ctx.putImageData(snapshot, 0, 0); // adding copied canvas data on to this canvas

    if(selectedTool === "brush" || selectedTool === "eraser") {
        // if selected tool is eraser then set strokeStyle to white 
        // to paint white color on to the existing canvas content else set the stroke color to selected color
        ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
        ctx.lineTo(e.offsetX, e.offsetY); // creating line according to the mouse pointer
        ctx.stroke(); // drawing/filling line with color
    } else if(selectedTool === "rectangle"){
        drawRect(e);
    } else if(selectedTool === "parallelogram"){
        drawParallelogram(e);
    } else if(selectedTool === "ellipse"){
        drawEllipse(e);
    } else if(selectedTool === "triangle"){
        drawTriangle(e);
    } else {
        drawLine(e);
    }
}

toolBtns.forEach(btn => {
    btn.addEventListener("click", () => { // adding click event to all tool option
        // removing active class from the previous option and adding on current clicked option
        document.querySelector(".options .active").classList.remove("active");
        btn.classList.add("active");
        selectedTool = btn.id;
    });
});

sizeSlider.addEventListener("change", () => brushWidth = sizeSlider.value); // passing slider value as brushSize

colorBtns.forEach(btn => {
    btn.addEventListener("click", () => { // adding click event to all color button
        // removing selected class from the previous option and adding on current clicked option
        document.querySelector(".options .selected").classList.remove("selected");
        btn.classList.add("selected");
        // passing selected btn background color as selectedColor value
        selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
    });
});

colorPicker.addEventListener("change", () => {
    // passing picked color value from color picker to last color btn background
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
});

clearCanvas.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // clearing whole canvas
    setCanvasBackground();
});

// Load the jsPDF library
const { jsPDF } = window.jspdf;

// Function to save canvas as PDF with border
saveImg.addEventListener("click", () => {
    // Create a new jsPDF document
    const doc = new jsPDF();

    // Define the border width and color
    const borderWidth = 1; // Adjust the border width as needed
    const borderColor = 'black'; // Adjust the border color as needed

    // Define the distance from the edge of the paper (margin)
    const margin = 25; // Adjust this margin value as needed

    // Convert the canvas drawing to an image
    const canvasDataUrl = canvas.toDataURL('image/jpeg');

    // Calculate the usable width and height of the page, considering margins
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const usableWidth = pageWidth - 2 * margin;
    const usableHeight = pageHeight - 2 * margin;

    // Calculate the dimensions of the image, scaled to fit within the usable area while maintaining aspect ratio
    let imgWidth = canvas.width;
    let imgHeight = canvas.height;

    // Determine the scaling factor to fit the image within the usable area
    const widthRatio = usableWidth / imgWidth;
    const heightRatio = usableHeight / imgHeight;
    const scalingFactor = Math.min(widthRatio, heightRatio);

    // Scale the image dimensions
    imgWidth *= scalingFactor;
    imgHeight *= scalingFactor;

    // Calculate the position for the image considering the margin and scaled dimensions
    const xPos = margin + (usableWidth - imgWidth) / 2; // Center the image horizontally within the usable area
    const yPos = margin + (usableHeight - imgHeight) / 2; // Center the image vertically within the usable area

    // Add a border around the image
    doc.setLineWidth(borderWidth);
    doc.setDrawColor(borderColor);
    doc.rect(margin - borderWidth / 2, margin - borderWidth / 2, usableWidth + borderWidth, usableHeight + borderWidth); // Draw the border within the margins

    // Add the canvas image to the PDF at the specified position and size
    doc.addImage(canvasDataUrl, 'JPEG', xPos, yPos, imgWidth, imgHeight);

    // Download the PDF with a current timestamp as the file name
    doc.save(`${Date.now()}.pdf`);
});


// saveImg.addEventListener("click", async () => { //working as a "Save As PDF"
//     // Import jsPDF
//     const { jsPDF } = window.jspdf;

//     // Create a jsPDF instance
//     const pdf = new jsPDF();

//     // Get the canvas data URL
//     const canvasDataURL = canvas.toDataURL();

//     // Add the canvas data URL as an image to the PDF
//     // Parameters: image URL, x, y, width, height
//     pdf.addImage(canvasDataURL, 'PNG', 0, 0, pdf.internal.pageSize.width, pdf.internal.pageSize.height);

//     // Save the PDF file
//     pdf.save(`${Date.now()}.pdf`);
// });

// saveImg.addEventListener("click", () => { // OG Save As Image
//     const link = document.createElement("a"); // creating <a> element
//     link.download = `${Date.now()}.jpg`; // passing current date as link download value
//     link.href = canvas.toDataURL(); // passing canvasData as link href value
//     link.click(); // clicking link to download image
// });

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", () => isDrawing = false);