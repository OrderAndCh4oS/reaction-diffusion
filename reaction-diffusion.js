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

function initGridCellRand(x, y) {
    return {a: 1, b: Math.random() > 0.5 ? 1 : 0};
}

let grid = [...Array(gridWidth)].map(
    (_, x) => [...Array(gridHeight)].map((_, y) => initGridCellBox(x, y)));

const diffusionRateA = 1;
const diffusionRateB = 0.5;
const feedRate = 0.0545;
const killRate = 0.062;
const deltaTime = 1;

const laplacianMatrix = [
    [0.05, 0.2, 0.05],
    [0.2, -1, 0.2],
    [0.05, 0.2, 0.05],
];

function round(value, precision) {
    const multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

function diffusion(key, area, laplacianMatrix) {
    // If laplacianSum does not equal zero divide sum by it.
    // const laplacianSum = laplacianMatrix.flat(1).reduce((a, b) => round(a + b, 2), 0);
    let sum = 0;
    for(let x = 0; x < area.length; x++) {
        for(let y = 0; y < area[x].length; y++) {
            sum = sum + area[x][y][key] * laplacianMatrix[x][y];
        }
    }

    return sum;
}

function updateA(a, b, aDiffusion) {
    return a + ((diffusionRateA * aDiffusion) - (a * b * b) + (feedRate * (1 - a))) * deltaTime;
}

function updateB(a, b, bDiffusion) {
    return b + (((diffusionRateB * bDiffusion) + (a * b * b)) - ((killRate + feedRate) * b)) * deltaTime;
}

function copyGrid(grid) {
    const length = grid.length;
    const newGrid = Array(length);
    for(let i = 0; i < length; i++) {
        newGrid[i] = grid[i].slice(0);
    }
    return newGrid;
}

function update(grid) {
    const newGrid = copyGrid(grid);
    for(let x = 0; x < grid.length; x++) {
        for(let y = 0; y < grid[x].length; y++) {
            const top = x > 0 ? x - 1 : grid.length - 1;
            const bottom = x < grid.length - 1 ? x + 1 : 0;
            const left = y > 0 ? y - 1 : grid[x].length - 1;
            const right = y < grid[x].length - 1 ? y + 1 : 0;

            const area = [
                [grid[top][left], grid[top][y], grid[top][right]],
                [grid[x][left], grid[x][y], grid[x][right]],
                [grid[bottom][left], grid[bottom][y], grid[bottom][right]],
            ];

            const aDiffusion = diffusion('a', area, laplacianMatrix);
            const bDiffusion = diffusion('b', area, laplacianMatrix);

            const a = updateA(grid[x][y].a, grid[x][y].b, aDiffusion);
            const b = updateB(grid[x][y].a, grid[x][y].b, bDiffusion);
            if(isNaN(a)) throw new Error('A is NaN');
            if(isNaN(b)) throw new Error('B is NaN');
            newGrid[x][y].a = a;
            newGrid[x][y].b = b;
        }
    }

    return newGrid;
}

function draw() {
    for(let i = 0; i < 10000; i++) {
        console.log(`iteration: ${i}`);
        update(grid);
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    for(let x = 1; x < grid.length - 1; x++) {
        for(let y = 1; y < grid[x].length - 1; y++) {
            if(grid[x][y].a > 1 || grid[x][y].a < 0) throw new Error('A is out of range');
            if(grid[x][y].b > 1 || grid[x][y].b < 0) throw new Error('B is out of range');
            context.fillStyle = `rgb(0, ${grid[x][y].a * 255}, ${(1 - grid[x][y].b) * 255})`;
            context.fillRect(x, y, 1, 1);
        }
    }
}

draw();
