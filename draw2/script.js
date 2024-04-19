document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth * 0.8;
    canvas.height = canvas.width * 0.75;

    let shapes = [];
    let selectedShape = null;
    let isDragging = false;
    let startX, startY;
    let resizingHandle = null;

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    document.getElementById("rectangle").addEventListener("click", function() {
        shapes.push(new Rectangle(100, 100, 100, 50, "#ff0000"));
        drawShapes();
    });

    document.getElementById("circle").addEventListener("click", function() {
        shapes.push(new Circle(200, 200, 50, "#00ff00"));
        drawShapes();
    });

    document.getElementById("copy").addEventListener("click", function() {
        if (selectedShape) {
            const copiedShape = selectedShape.copy();
            shapes.push(copiedShape);
            drawShapes();
        }
    });

    document.getElementById("save").addEventListener("click", function() {
        const originalSelectedShape = selectedShape;
        selectedShape = null;
        drawShapes();

        const dataUrl = canvas.toDataURL();
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = "drawing.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        selectedShape = originalSelectedShape;
        drawShapes();
    });

    function drawShapes() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        shapes.forEach(shape => {
            shape.draw(ctx);
        });
        if (selectedShape) {
            selectedShape.drawResizeHandles(ctx);
        }
    }

    function handleMouseDown(event) {
        const mouseX = event.clientX - canvas.getBoundingClientRect().left;
        const mouseY = event.clientY - canvas.getBoundingClientRect().top;

        for (let i = shapes.length - 1; i >= 0; i--) {
            const handle = shapes[i].getResizeHandle(mouseX, mouseY);
            if (handle) {
                selectedShape = shapes[i];
                resizingHandle = handle;
                return;
            }
            if (shapes[i].isPointInside(mouseX, mouseY)) {
                selectedShape = shapes[i];
                isDragging = true;
                startX = mouseX;
                startY = mouseY;
                return;
            }
        }
    }

    function handleMouseMove(event) {
        const mouseX = event.clientX - canvas.getBoundingClientRect().left;
        const mouseY = event.clientY - canvas.getBoundingClientRect().top;

        if (isDragging && selectedShape) {
            const dx = mouseX - startX;
            const dy = mouseY - startY;
            selectedShape.move(dx, dy);
            startX = mouseX;
            startY = mouseY;
            drawShapes();
        } else if (resizingHandle && selectedShape) {
            selectedShape.resize(resizingHandle, mouseX, mouseY);
            drawShapes();
        }
    }

    function handleMouseUp() {
        isDragging = false;
        resizingHandle = null;
    }

    class Shape {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
        }

        draw(ctx) {
            // To be implemented by subclasses
        }

        isPointInside(x, y) {
            // To be implemented by subclasses
        }

        move(dx, dy) {
            // To be implemented by subclasses
        }

        resize(handle, mouseX, mouseY) {
            // To be implemented by subclasses
        }

        copy() {
            // Create a new instance of the same shape type
            const copiedShape = new this.constructor(this.x, this.y, this.color);
            
            // Copy additional properties specific to the shape type
            if (this instanceof Rectangle) {
                copiedShape.width = this.width;
                copiedShape.height = this.height;
            } else if (this instanceof Circle) {
                copiedShape.radius = this.radius;
            }
            
            return copiedShape;
        }

        drawResizeHandles(ctx) {
            // To be implemented by subclasses
        }
    }

    class Rectangle extends Shape {
        constructor(x, y, width, height, color) {
            super(x, y, color);
            this.width = width;
            this.height = height;
        }

        draw(ctx) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        isPointInside(x, y) {
            return (
                x >= this.x &&
                x <= this.x + this.width &&
                y >= this.y &&
                y <= this.y + this.height
            );
        }

        move(dx, dy) {
            this.x += dx;
            this.y += dy;
        }

        resize(handle, mouseX, mouseY) {
            switch (handle) {
                case "topLeft":
                    this.width += this.x - mouseX;
                    this.height += this.y - mouseY;
                    this.x = mouseX;
                    this.y = mouseY;
                    break;
                case "topRight":
                    this.width = mouseX - this.x;
                    this.height += this.y - mouseY;
                    this.y = mouseY;
                    break;
                case "bottomLeft":
                    this.width += this.x - mouseX;
                    this.height = mouseY - this.y;
                    this.x = mouseX;
                    break;
                case "bottomRight":
                    this.width = mouseX - this.x;
                    this.height = mouseY - this.y;
                    break;
            }
        }

        getResizeHandle(x, y) {
            const threshold = 5;
            if (Math.abs(x - this.x) < threshold && Math.abs(y - this.y) < threshold) {
                return "topLeft";
            } else if (Math.abs(x - (this.x + this.width)) < threshold && Math.abs(y - this.y) < threshold) {
                return "topRight";
            } else if (Math.abs(x - this.x) < threshold && Math.abs(y - (this.y + this.height)) < threshold) {
                return "bottomLeft";
            } else if (Math.abs(x - (this.x + this.width)) < threshold && Math.abs(y - (this.y + this.height)) < threshold) {
                return "bottomRight";
            }
            return null;
        }
    }

    class Circle extends Shape {
        constructor(x, y, radius, color) {
            super(x, y, color);
            this.radius = radius;
        }

        draw(ctx) {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
            ctx.fill();
        }

        isPointInside(x, y) {
            const dx = x - this.x;
            const dy = y - this.y;
            return dx * dx + dy * dy <= this.radius * this.radius;
        }

        move(dx, dy) {
            this.x += dx;
            this.y += dy;
        }

        resize(handle, mouseX, mouseY) {
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            switch (handle) {
                case "top":
                case "bottom":
                    this.radius = Math.abs(dy / 2);
                    break;
                case "left":
                case "right":
                    this.radius = Math.abs(dx / 2);
                    break;
            }
        }

        getResizeHandle(x, y) {
            const dx = x - this.x;
            const dy = y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (Math.abs(distance - this.radius) < 5) {
                return "border";
            }
            return null;
        }
    }
});
