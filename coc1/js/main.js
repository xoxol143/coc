
document.addEventListener("DOMContentLoaded", function () {
    const gridContainer = document.getElementById("grid-container");
    const lineContainer = document.getElementById("lineContainer");
    const themeIcon = document.getElementById('theme'); // Get the theme icon by ID
    const bodyElement = document.body; // Get the body element

    let occupiedCells = [];
    let selectedButton = null;
    let isMoveMode = false;
    let areaSize = null;
    let isEarthquakeMode = false;
    let isLightningMode = false; // New variable for lightning mode
    let circle1;
    let circle2;

    const troopButtons = document.getElementById("troop-buttons").querySelectorAll('.image-button');
    const toolButtons = document.getElementById("tool-buttons").querySelectorAll('.image-button');
    const rect = gridContainer.getBoundingClientRect();
    const intersectedCells = new Set();
    
    lineContainer.style.position = 'absolute';
    lineContainer.style.top = `${rect.top}px`;
    lineContainer.style.left = `${rect.left}px`;
    lineContainer.style.width = `${rect.width}px`;
    lineContainer.style.height = `${rect.height}px`;

    function createGrid(rows, columns) {
        gridContainer.innerHTML = '';

        for (let i = 0; i < rows * columns; i++) {
            const square = document.createElement("div");
            square.classList.add("square");
            gridContainer.appendChild(square);
        }
    }

    function createPicture(event) {
        const rows = 25;
        const columns = 25;

        if (!selectedButton || selectedButton.parentElement.id === 'tool-buttons') {
            return;
        }

        const areaSize = parseInt(selectedButton.dataset.areaSize);
        const offsetX = event.clientX - gridContainer.offsetLeft;
        const offsetY = event.clientY - gridContainer.offsetTop;

        const x = Math.floor(offsetX / 30);
        const y = Math.floor(offsetY / 30);

        if (x < 0 || x + areaSize > columns || y < 0 || y + areaSize > rows) {
            return;
        }

        const parentButtonId = selectedButton.id;
        const parentButton = document.getElementById(parentButtonId);

        if (!parentButton) {
            return;
        }

        for (let i = y; i < y + areaSize; i++) {
            for (let j = x; j < x + areaSize; j++) {
                const cell = { x: j, y: i };
                if (occupiedCells.some(occupiedCell => occupiedCell.x === cell.x && occupiedCell.y === cell.y)) {
                    return;
                }
            }
        }

        const picture = document.createElement("div");
        picture.classList.add("picture");
        picture.style.top = `${y * 30}px`;
        picture.style.left = `${x * 30}px`;
        picture.setAttribute("data-parent-button-id", parentButtonId);
        picture.setAttribute("data-previous-x", `${x * 30}px`); 
        picture.setAttribute("data-previous-y", `${y * 30}px`);
        picture.setAttribute("data-area-size", areaSize);

        const image = document.createElement("img");
        image.src = selectedButton.dataset.imageSrc;
        image.alt = selectedButton.dataset.imageAlt;
        image.width = areaSize * 30;
        image.height = areaSize * 30;

        picture.appendChild(image);
        gridContainer.appendChild(picture);

        for (let i = y; i < y + areaSize; i++) {
            for (let j = x; j < x + areaSize; j++) {
                if (!checkOccupied(j, i)) {
                    occupiedCells.push({ x: j, y: i });
                }

                const squareIndex = i * columns + j;
                const square = gridContainer.querySelector(`.square:nth-child(${squareIndex + 1})`);
                if (square) {
                    square.style.backgroundColor = "rgb(255, 255, 125)";
                }
            }
        }

        picture.addEventListener('click', function () {
            if (selectedButton && selectedButton.id === 'remove-button') {
                removePicture(picture);
            }
        });

        picture.addEventListener('mousedown', startDrag);
    }

    function removePicture(picture) {
        const parent = picture.parentElement;
        const currentX = parseFloat(picture.style.left);
        const currentY = parseFloat(picture.style.top);
        const areaSize = parseInt(picture.dataset.areaSize);

        parent.removeChild(picture);

        const x = Math.floor(currentX / 30);
        const y = Math.floor(currentY / 30);

        for (let i = y; i < y + areaSize; i++) {
            for (let j = x; j < x + areaSize; j++) {
                const indexToRemove = occupiedCells.findIndex(cell => cell.x === j && cell.y === i);
                if (indexToRemove !== -1) {
                    occupiedCells.splice(indexToRemove, 1);

                    const squareIndex = i * 25 + j;
                    const square = gridContainer.querySelector(`.square:nth-child(${squareIndex + 1})`);
                    if (square) {
                        square.style.backgroundColor = "";
                    }
                }
            }
        }
    }

    function clearGrid() {
        occupiedCells = [];
        createGrid(25, 25);
    }

    function toggleMoveMode() {
        isMoveMode = !isMoveMode;
    }

function selectButton(event) {
const button = event.currentTarget;
const isSelected = button.classList.contains('selected');

document.querySelectorAll('.image-button').forEach(btn => {
    btn.classList.remove('selected');
});

if (!isSelected) {
    button.classList.add('selected');
    selectedButton = button;

    if (selectedButton.id === 'move-button') {
        isMoveMode = true;
    } else {
        isMoveMode = false;
    }

    if (selectedButton.id === 'earthquake-button') {
        isEarthquakeMode = true;
        gridContainer.addEventListener('mousemove', showEarthquakeCircle);
    } else {
        isEarthquakeMode = false;
        gridContainer.removeEventListener('mousemove', showEarthquakeCircle);
        clearEarthquakeCircle();
    }

    if (selectedButton.id === 'lightning-button') { // Check if lightning button is selected
        isLightningMode = true;
        gridContainer.addEventListener('mousemove', showLightningHighlight); // Add event listener for lightning mode
    } else {
        isLightningMode = false;
        clearLightningHighlight(); // Clear lightning highlight if another button is selected
        gridContainer.removeEventListener('mousemove', showLightningHighlight); // Remove event listener for lightning mode
    }

    if (selectedButton.id === 'Giant_Arrow') { // Check if Giant Arrow button is selected
        showGiantArrow(); // Add event listener for showing giant arrow
    } else {
        clearGiantArrow(); // Clear existing circles and lines
    }
} else {
    selectedButton = null;

    if (button.id === 'move-button') {
        isMoveMode = false;
    }

    if (button.id === 'earthquake-button') {
        isEarthquakeMode = false;
        gridContainer.removeEventListener('mousemove', showEarthquakeCircle);
        clearEarthquakeCircle();
    }

    if (button.id === 'lightning-button') {
        isLightningMode = false;
        clearLightningHighlight(); // Clear lightning highlight if the button is deselected
        gridContainer.removeEventListener('mousemove', showLightningHighlight); // Remove event listener for lightning mode
    }

    if (button.id === 'Giant_Arrow') {
        clearGiantArrow(); // Clear existing circles and lines
    }
}
}

function showGiantArrow() {
clearGiantArrow(); // Clear existing circles if any

circle1 = createCircle(-1, -1); // Top left corner
circle2 = createCircle(gridContainer.offsetWidth - 29, gridContainer.offsetHeight - 29); // Bottom right corner

gridContainer.appendChild(circle1);
gridContainer.appendChild(circle2);

// Make circles draggable
makeDraggable(circle1);
makeDraggable(circle2);

// Initial draw of the line
drawLine(circle1, circle2);
}

function createCircle(left, top) {
const circle = document.createElement('div');
circle.classList.add('giant-arrow-circle');
circle.style.width = '30px';
circle.style.height = '30px';
circle.style.borderRadius = '50%';
circle.style.position = 'absolute';
circle.style.left = `${left}px`;
circle.style.top = `${top}px`;
circle.style.backgroundColor = 'blue'; // Set your desired circle color
circle.style.cursor = 'move';
return circle;
}

function drawLine(circle1, circle2) {
const svg = document.getElementById('lineContainer');
const mainLine = document.getElementById('connectorLine'); // This is your main visible line
// Create side lines for computational purposes but make them invisible
const sideLine1 = document.getElementById('sideLine1');
const sideLine2 = document.getElementById('sideLine2');

svg.appendChild(sideLine1);
svg.appendChild(sideLine2);

// Calculate centers of the circles
const rect1 = circle1.getBoundingClientRect();
const rect2 = circle2.getBoundingClientRect();
const x1 = rect1.left + rect1.width / 2 - svg.getBoundingClientRect().left;
const y1 = rect1.top + rect1.height / 2 - svg.getBoundingClientRect().top;
const x2 = rect2.left + rect2.width / 2 - svg.getBoundingClientRect().left;
const y2 = rect2.top + rect2.height / 2 - svg.getBoundingClientRect().top;

// Set coordinates for the main line
mainLine.setAttribute('x1', x1);
mainLine.setAttribute('y1', y1);
mainLine.setAttribute('x2', x2);
mainLine.setAttribute('y2', y2);

// Set the line's width to the diameter of the circles
const diameter = rect1.width; // Assuming both circles have the same size
mainLine.setAttribute('stroke-width', diameter);

// Calculate offset for side lines based on the line width
const lineWidth = 30; // Width of your arrow line
const angle = Math.atan2(y2 - y1, x2 - x1);
const offsetX = Math.sin(angle) * lineWidth / 2;
const offsetY = Math.cos(angle) * lineWidth / 2;

// Set coordinates for side lines (tangent to the main line and invisible)
sideLine1.setAttribute('x1', x1 + offsetX);
sideLine1.setAttribute('y1', y1 - offsetY);
sideLine1.setAttribute('x2', x2 + offsetX);
sideLine1.setAttribute('y2', y2 - offsetY);
sideLine1.setAttribute('stroke-opacity', '0');

sideLine2.setAttribute('x1', x1 - offsetX);
sideLine2.setAttribute('y1', y1 + offsetY);
sideLine2.setAttribute('x2', x2 - offsetX);
sideLine2.setAttribute('y2', y2 + offsetY);
sideLine2.setAttribute('stroke-opacity', '0');

// Use the side lines for intersection checks
highlightCellsIntersectingWithLine(mainLine);
highlightCellsIntersectingWithLine(sideLine1);
highlightCellsIntersectingWithLine(sideLine2);
updateIntersectedCells();
}


function clearGiantArrow() {
// Remove circles
const existingCircles = gridContainer.querySelectorAll('.giant-arrow-circle');
existingCircles.forEach(circle => {
    gridContainer.removeChild(circle);
});

// Clear line by resetting its attributes
const line = document.getElementById('connectorLine');
if (line) {
    line.setAttribute('x1', '0');
    line.setAttribute('y1', '0');
    line.setAttribute('x2', '0');
    line.setAttribute('y2', '0');
}

const squares = document.querySelectorAll('.square');
squares.forEach(square => {
        if (square.style.backgroundColor === 'rgba(255, 0, 0, 0.75)') {
            square.style.backgroundColor = 'rgb(255, 255, 125)';
        }
});
}

function makeDraggable(element) {
element.addEventListener('mousedown', function(event) {
    event.preventDefault(); // Prevent default text selection

    // Calculate initial offsets within the element
    const initialOffsetX = event.clientX - element.getBoundingClientRect().left;
    const initialOffsetY = event.clientY - element.getBoundingClientRect().top;

    // Function to handle moving the element
const moveElement = (moveEvent) => {
const gridRect = gridContainer.getBoundingClientRect(); // Get the bounding rect of the grid container

// Calculate new positions, adjusted for the grid container's offset
let newX = moveEvent.clientX - initialOffsetX - gridRect.left + window.scrollX; // Add scrollX for horizontal scrolling
let newY = moveEvent.clientY - initialOffsetY - gridRect.top + window.scrollY; // Add scrollY for vertical scrolling

// Ensure newX and newY are within the grid boundaries
// Limit newX to be between 0 and the width of the grid minus the width of the element
newX = Math.max(-1, Math.min(newX, gridRect.width - element.offsetWidth + 1));
// Limit newY to be between 0 and the height of the grid minus the height of the element
newY = Math.max(-1, Math.min(newY, gridRect.height - element.offsetHeight + 1));

// Update the element's position
element.style.left = `${newX}px`;
element.style.top = `${newY}px`;

if (circle1 && circle2) {
    drawLine(circle1, circle2);
}
};


    // Attach move event listener
    document.addEventListener('mousemove', moveElement);

    // Function to cleanup and remove event listeners
    const stopDrag = () => {
        document.removeEventListener('mousemove', moveElement);
        document.removeEventListener('mouseup', stopDrag);
    };

    // Attach event listener for mouseup to stop the drag
    document.addEventListener('mouseup', stopDrag);
});

// Prevent the default drag-and-drop behavior
element.ondragstart = () => false;
}

function highlightCellsIntersectingWithLine(line) {
const grid = document.getElementById('grid-container');
const gridRect = grid.getBoundingClientRect();
const x1 = parseFloat(line.getAttribute('x1'));
const y1 = parseFloat(line.getAttribute('y1'));
const x2 = parseFloat(line.getAttribute('x2'));
const y2 = parseFloat(line.getAttribute('y2'));
const isVertical = (x1 === x2);

let m, b; // Slope and y-intercept of the line
if (!isVertical) {
    m = (y2 - y1) / (x2 - x1);
    b = y1 - m * x1;
}

// Check each occupied cell for intersection
occupiedCells.forEach(cell => {
    const cellIndex = cell.y * 25 + cell.x; // Assuming 25 columns
    const cellElement = document.querySelector(`#grid-container .square:nth-child(${cellIndex + 1})`);

    if (cellElement) {
        const cellRect = cellElement.getBoundingClientRect();
        const cellX = cellRect.left - gridRect.left;
        const cellY = cellRect.top - gridRect.top;

        // Calculate the cell's corner positions
        const topLeft = { x: cellX, y: cellY };
        const bottomRight = { x: cellX + 30, y: cellY + 30 }; // Assuming cell size of 30px

        let intersects = false;

        if (isVertical) {
            // Check if the vertical line's x-coordinate is within the cell's x-range
            if (x1 >= topLeft.x && x1 <= bottomRight.x) {
                // Check if any part of the vertical line's y-range intersects with the cell's y-range
                const lineTop = Math.min(y1, y2); // Line's topmost y-coordinate
                const lineBottom = Math.max(y1, y2); // Line's bottommost y-coordinate
                intersects = lineBottom >= topLeft.y && lineTop <= bottomRight.y;
            }
        } else {
            // Non-vertical line intersection checks
            intersects = checkLineIntersection(x1, y1, x2, y2, topLeft.x, topLeft.y, bottomRight.x, topLeft.y) ||
                         checkLineIntersection(x1, y1, x2, y2, bottomRight.x, topLeft.y, bottomRight.x, bottomRight.y) ||
                         checkLineIntersection(x1, y1, x2, y2, bottomRight.x, bottomRight.y, topLeft.x, bottomRight.y) ||
                         checkLineIntersection(x1, y1, x2, y2, topLeft.x, bottomRight.y, topLeft.x, topLeft.y);
        }

        if (intersects) {
            intersectedCells.add(cellIndex); // Add the cell index to the intersectedCells collection
        }
    }
});
}



// Helper function to check if two line segments intersect
function checkLineIntersection(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
// Calculate the direction of the lines
const uA = ((line2EndX - line2StartX) * (line1StartY - line2StartY) - (line2EndY - line2StartY) * (line1StartX - line2StartX)) / ((line2EndY - line2StartY) * (line1EndX - line1StartX) - (line2EndX - line2StartX) * (line1EndY - line1StartY));
const uB = ((line1EndX - line1StartX) * (line1StartY - line2StartY) - (line1EndY - line1StartY) * (line1StartX - line2StartX)) / ((line2EndY - line2StartY) * (line1EndX - line1StartX) - (line2EndX - line2StartX) * (line1EndY - line1StartY));

// If uA and uB are between 0-1, lines are colliding
return uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1;
}


// After all lines have been checked, update the cell colors
function updateIntersectedCells() {
const cells = document.querySelectorAll('#grid-container .square');

// Iterate through all occupied cells
occupiedCells.forEach(oc => {
    const index = oc.y * 25 + oc.x; // Calculate cell index based on its x and y coordinates
    const cell = cells[index];

    // If this occupied cell is not in the set of currently intersected cells, revert its color
    if (!intersectedCells.has(index)) {
        cell.style.backgroundColor = 'rgb(255, 255, 125)';
    }
});

// Iterate through all intersected cells to update their color
intersectedCells.forEach(index => {
    const cell = cells[index];
    cell.style.backgroundColor = 'rgba(255, 0, 0, 0.75)';
});

// Clear the set for future updates
intersectedCells.clear();
}

function showEarthquakeCircle(event) {
    const levelSelect = document.getElementById('earthquake-level');
    const level = parseInt(levelSelect.value);

    const levelToMultiplier = {
        1: 3.5,
        2: 3.8,
        3: 4.1,
        4: 4.4,
        5: 4.7
    };

    const multiplier = levelToMultiplier[level];
    const radius = multiplier * 30;

    const x = event.clientX - gridContainer.getBoundingClientRect().left;
    const y = event.clientY - gridContainer.getBoundingClientRect().top;

    clearEarthquakeCircle();

    const circle = document.createElement('div');
    circle.classList.add('earthquake-circle');
    circle.style.width = `${radius * 2}px`;
    circle.style.height = `${radius * 2}px`;
    circle.style.borderRadius = '50%';
    circle.style.position = 'absolute';
    circle.style.left = `${x - radius}px`;
    circle.style.top = `${y - radius}px`;
    circle.style.border = '1px solid red';
    circle.style.pointerEvents = 'none';

    gridContainer.appendChild(circle);

    // Loop through all the squares and check if they are within the radius and occupied
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => {
        const squareX = square.offsetLeft;
        const squareY = square.offsetTop;

        // Calculate the distances from each corner of the cell to the center of the circle
        const distances = [
            Math.sqrt(Math.pow(squareX - x, 2) + Math.pow(squareY - y, 2)), // Top-left corner
            Math.sqrt(Math.pow(squareX + square.offsetWidth - x, 2) + Math.pow(squareY - y, 2)), // Top-right corner
            Math.sqrt(Math.pow(squareX - x, 2) + Math.pow(squareY + square.offsetHeight - y, 2)), // Bottom-left corner
            Math.sqrt(Math.pow(squareX + square.offsetWidth - x, 2) + Math.pow(squareY + square.offsetHeight - y, 2)) // Bottom-right corner
        ];

        // Check if any distance is less than the radius
        const isInsideCircle = distances.some(distance => distance < radius);

        // If any corner is inside the circle, consider the cell to be inside the circle
        if (isInsideCircle) {
            const squareIndex = Array.from(square.parentNode.children).indexOf(square);
            const cellX = squareIndex % 25;
            const cellY = Math.floor(squareIndex / 25);
            const isOccupied = occupiedCells.some(cell => cell.x === cellX && cell.y === cellY);

            if (isOccupied) {
                square.style.backgroundColor = 'rgba(255, 0, 0, 0.75)';
            }
        }
    });
}

function clearEarthquakeCircle() {
    const existingCircle = gridContainer.querySelector('.earthquake-circle');
    if (existingCircle) {
        gridContainer.removeChild(existingCircle);

        // Loop through all the squares and reset highlighted cells
        const squares = document.querySelectorAll('.square');
        squares.forEach(square => {
            if (square.style.backgroundColor === 'rgba(255, 0, 0, 0.75)') {
                square.style.backgroundColor = 'rgb(255, 255, 125)';
            }
        });
    }
}

function showLightningHighlight(event) {
    if (!isLightningMode) return;

    const offsetX = event.clientX - gridContainer.offsetLeft;
    const offsetY = event.clientY - gridContainer.offsetTop;

    const centerX = Math.floor(offsetX / 30);
    const centerY = Math.floor(offsetY / 30);

    const startCellX = Math.max(centerX - 2, 0);
    const startCellY = Math.max(centerY - 2, 0);
    const endCellX = Math.min(centerX + 2, 24);
    const endCellY = Math.min(centerY + 2, 24);

    clearLightningHighlight(); // Clear previous lightning highlight

    for (let i = startCellY; i <= endCellY; i++) {
        for (let j = startCellX; j <= endCellX; j++) {
            if ((i === startCellY || i === endCellY) && (j === startCellX || j === endCellX)) continue; // Skip corner cells

            const index = i * 25 + j;
            const square = gridContainer.querySelector(`.square:nth-child(${index + 1})`);
            square.style.border = '3px solid blue'; // Highlight border
            if (occupiedCells.some(cell => cell.x === j && cell.y === i)) {
                square.style.backgroundColor = 'rgba(255, 0, 0, 0.75)';
                square.style.border = "";
            }
        }
    }
}


function clearLightningHighlight() {
        const squares = gridContainer.querySelectorAll('.square');
        squares.forEach(square => {
            square.style.border = "";
        if (square.style.backgroundColor === 'rgba(255, 0, 0, 0.75)') {
            square.style.backgroundColor = 'rgb(255, 255, 125)';
        }
        });
    }

    
    function startDrag(event) {
        if (!isMoveMode) return;
        event.preventDefault();

        const picture = event.currentTarget;

        const initialX = parseFloat(picture.style.left);
        const initialY = parseFloat(picture.style.top);

        const initialCellX = Math.floor(initialX / 30);
        const initialCellY = Math.floor(initialY / 30);

        let currentElement = picture;
        while (currentElement && currentElement !== document.body) {
            currentElement = currentElement.parentElement;
        }

        const parentButtonId = picture.getAttribute('data-parent-button-id');
        const parentButton = document.getElementById(parentButtonId);

        if (!parentButton) {
            return;
        }

        const areaSize = parseInt(parentButton.getAttribute('data-area-size'));

        picture.style.cursor = 'grabbing';

        removeSquareColor(initialCellX, initialCellY, areaSize, picture);

        function movePicture(event) {
            const x = event.clientX - gridContainer.getBoundingClientRect().left;
            const y = event.clientY - gridContainer.getBoundingClientRect().top;

            const areaSize = parseInt(parentButton.getAttribute('data-area-size'));

            const maxX = gridContainer.clientWidth - areaSize * 30;
            const maxY = gridContainer.clientHeight - areaSize * 30;

            const snappedX = Math.min(Math.max(Math.round(x / 30) * 30, 0), maxX);
            const snappedY = Math.min(Math.max(Math.round(y / 30) * 30, 0), maxY);

            picture.style.left = snappedX + 'px';
            picture.style.top = snappedY + 'px';
        }

        function stopDrag() {
            const finalCellX = Math.floor(parseFloat(picture.style.left) / 30);
            const finalCellY = Math.floor(parseFloat(picture.style.top) / 30);

            const isOccupied = checkOccupied(finalCellX, finalCellY, initialCellX, initialCellY, areaSize);

            if (areaSize === null) {
                return;
            }

            for (let i = initialCellY; i < initialCellY + areaSize; i++) {
                for (let j = initialCellX; j < initialCellX + areaSize; j++) {
                    const indexToRemove = occupiedCells.findIndex(cell => cell.x === j && cell.y === i);
                    if (indexToRemove !== -1) {
                        occupiedCells.splice(indexToRemove, 1);
                    }
                }
            }

            if (!checkOccupied(finalCellX, finalCellY, undefined, undefined, areaSize)) {
                setSquareColor(finalCellX, finalCellY, areaSize);

                for (let i = finalCellY; i < finalCellY + areaSize; i++) {
                    for (let j = finalCellX; j < finalCellX + areaSize; j++) {
                        occupiedCells.push({ x: j, y: i });
                    }
                }
            } else {
                for (let i = initialCellY; i < initialCellY + areaSize; i++) {
                    for (let j = initialCellX; j < initialCellX + areaSize; j++) {
                        occupiedCells.push({ x: j, y: i });
                    }
                }

                picture.style.left = `${parseFloat(picture.dataset.previousX)}px`;
                picture.style.top = `${parseFloat(picture.dataset.previousY)}px`;

                restoreColorsForPreviousArea(Math.floor(parseFloat(picture.dataset.previousX) / 30), Math.floor(parseFloat(picture.dataset.previousY) / 30), areaSize);
            }

            picture.style.cursor = 'grab';
            document.removeEventListener('mousemove', movePicture);
            document.removeEventListener('mouseup', stopDrag);
        }

        picture.dataset.previousX = picture.style.left;
        picture.dataset.previousY = picture.style.top;

        document.addEventListener('mousemove', movePicture);
        document.addEventListener('mouseup', stopDrag);
    }

    function checkOccupied(x, y, excludeX, excludeY, areaSize) {
        for (let i = y; i < y + areaSize; i++) {
            for (let j = x; j < x + areaSize; j++) {
                if (j >= excludeX && j < excludeX + areaSize && i >= excludeY && i < excludeY + areaSize) {
                    continue;
                }
                const cell = { x: j, y: i };
                if (occupiedCells.some(occupiedCell => occupiedCell.x === cell.x && occupiedCell.y === cell.y)) {
                    return true;
                }
            }
        }
        return false;
    }

    function removeSquareColor(x, y, areaSize, picture) {
        for (let i = y; i < y + areaSize; i++) {
            for (let j = x; j < x + areaSize; j++) {
                const squareIndex = i * 25 + j;
                const square = gridContainer.querySelector(`.square:nth-child(${squareIndex + 1})`);
                if (square) {
                    square.style.backgroundColor = "";
                }
            }
        }
    }

   function setSquareColor(x, y, areaSize) {
        for (let i = y; i < y + areaSize; i++) {
            for (let j = x; j < x + areaSize; j++) {
                const squareIndex = i * 25 + j;
                const square = gridContainer.querySelector(`.square:nth-child(${squareIndex + 1})`);
                if (square) {
                    square.style.backgroundColor = "rgb(255, 255, 125)";
                }
            }
        }
    }

    function restoreColorsForPreviousArea(initialX, initialY, areaSize) {
        for (let i = initialY; i < initialY + areaSize; i++) {
            for (let j = initialX; j < initialX + areaSize; j++) {
                const squareIndex = i * 25 + j;
                const square = gridContainer.querySelector(`.square:nth-child(${squareIndex + 1})`);
                if (square) {
                    square.style.backgroundColor = "rgb(255, 255, 125)";
                }
            }
        }
    }

    themeIcon.addEventListener('click', function() {
        // Check if the body has a class that indicates the background is currently grey
        if (bodyElement.classList.contains('grey-background')) {
            bodyElement.classList.remove('grey-background');
            document.body.classList.toggle('theme-toggled');
            bodyElement.style.backgroundColor = ''; // Reset to default background color
        } else {
            bodyElement.classList.add('grey-background'); // Add the grey background class
            bodyElement.style.backgroundColor = '#5d676e'; // Change background color to grey
            document.body.classList.toggle('theme-toggled');
        }
    });

    createGrid(25, 25);

    troopButtons.forEach(button => {
        button.addEventListener('click', selectButton);
    });
    toolButtons.forEach(button => {
        button.addEventListener('click', selectButton);
    });

    document.getElementById('clear-button').addEventListener('click', clearGrid);
    gridContainer.addEventListener('click', createPicture);
});