const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const size = 250;
canvas.style.width = size + 'px';
canvas.style.height = size + 'px';
const scale = window.devicePixelRatio;
canvas.width = size * scale;
canvas.height = size * scale;
context.scale(scale, scale);

const gridWidth = size;
const gridHeight = size;

function initGridCellBox(x, y) {
    if((x >= 40 * 2.5 && x <= 50 * 2.5) && (y >= 40 * 2.5 && y <= 50 * 2.5)) return {a: 0, b: 1};
    return {a: 1, b: 0};
}

let gridFrom = [...Array(gridWidth)].map((_, x) => [...Array(gridHeight)].map((_, y) => initGridCellBox(x, y)));

let gridTo = [...Array(gridWidth)].map((_, x) => [...Array(gridHeight)].map((_, y) => ({a: 1, b: 0})));

const diffusionRateA = 1;
const diffusionRateB = 0.5;
const feedRate = 0.0545;
const killRate = 0.062;
const deltaTime = 1.4;
const killPlusFeed = killRate + feedRate;

const laplacianMatrix = [
    [0.05, 0.2, 0.05],
    [0.2, -1, 0.2],
    [0.05, 0.2, 0.05],
];

function update() {
    for(let x = 0; x < gridFrom.length; x++) {
        const top = x > 0 ? x - 1 : gridFrom.length - 1;
        const bottom = x < gridFrom.length - 1 ? x + 1 : 0;
        for(let y = 0; y < gridFrom[x].length; y++) {
            const left = y > 0 ? y - 1 : gridFrom[x].length - 1;
            const right = y < gridFrom[x].length - 1 ? y + 1 : 0;

            let aDiffusion = gridFrom[top][left]['a'] * laplacianMatrix[0][0];
            aDiffusion += gridFrom[top][y]['a'] * laplacianMatrix[0][1];
            aDiffusion += gridFrom[top][right]['a'] * laplacianMatrix[0][2];
            aDiffusion += gridFrom[x][left]['a'] * laplacianMatrix[1][0];
            aDiffusion += gridFrom[x][y]['a'] * laplacianMatrix[1][1];
            aDiffusion += gridFrom[x][right]['a'] * laplacianMatrix[1][2];
            aDiffusion += gridFrom[bottom][left]['a'] * laplacianMatrix[2][0];
            aDiffusion += gridFrom[bottom][y]['a'] * laplacianMatrix[2][1];
            aDiffusion += gridFrom[bottom][right]['a'] * laplacianMatrix[2][2];

            let bDiffusion = gridFrom[top][left]['b'] * laplacianMatrix[0][0];
            bDiffusion += gridFrom[top][y]['b'] * laplacianMatrix[0][1];
            bDiffusion += gridFrom[top][right]['b'] * laplacianMatrix[0][2];
            bDiffusion += gridFrom[x][left]['b'] * laplacianMatrix[1][0];
            bDiffusion += gridFrom[x][y]['b'] * laplacianMatrix[1][1];
            bDiffusion += gridFrom[x][right]['b'] * laplacianMatrix[1][2];
            bDiffusion += gridFrom[bottom][left]['b'] * laplacianMatrix[2][0];
            bDiffusion += gridFrom[bottom][y]['b'] * laplacianMatrix[2][1];
            bDiffusion += gridFrom[bottom][right]['b'] * laplacianMatrix[2][2];

            const a = gridFrom[x][y].a;
            const b = gridFrom[x][y].b;

            gridTo[x][y].a = a + ((diffusionRateA * aDiffusion) - (a * b * b) + (feedRate * (1 - a))) * deltaTime;
            gridTo[x][y].b = b + (((diffusionRateB * bDiffusion) + (a * b * b)) - ((killPlusFeed) * b)) * deltaTime;
        }
    }
    gridFrom = [...gridTo];
}

function draw() {
    console.time('update');
    for(let i = 0; i < 1000; i++) {
        update();
    }
    console.timeEnd('update');
    context.clearRect(0, 0, canvas.width, canvas.height);
    for(let x = 1; x < gridFrom.length - 1; x++) {
        for(let y = 1; y < gridFrom[x].length - 1; y++) {
            context.fillStyle = `rgb(0, ${gridFrom[x][y].a * 255}, ${(1 - gridFrom[x][y].b) * 255})`;
            context.fillRect(x, y, 1, 1);
        }
    }
}

draw();
