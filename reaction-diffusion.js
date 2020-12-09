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

function initGridCell(x, y) {
    // if(x === 0 || x === size - 1 || y === 0 || y === size - 1) return {a: 1, b: 1}
    return {a: 1, b: Math.random() > 0.1 ? 1 : 0};
    // if((x >= 45 && x <= 55) && (y >= 45 && y <= 55)) return {a: 1, b: 1}
    // return {a: 1, b: 0};
}

let grid = [...Array(gridWidth)].map(
    (_, x) => [...Array(gridHeight)].map((_, y) => initGridCell(x, y)));

const diffusionRateA = 1;
const diffusionRateB = 0.5;
const feedRate = 0.055;
const killRate = 0.062;
const deltaTime = 1;

const laplacianMatrix = [
    [0.05, 0.2, 0.05],
    [0.2, -1, 0.2],
    [0.05, 0.2, 0.05],
];

function diffusion(key, area, laplacianMatrix) {
    let sum = 0;
    let areaSum = 0;
    for(let x = 0; x < area.length; x++) {
        for(let y = 0; y < area[x].length; y++) {
            sum += area[x][y][key] * laplacianMatrix[x][y];
            areaSum += area[x][y][key];
        }
    }

    return sum / areaSum;
}

function updateA(a, b, aDiffusion) {
    return a + (diffusionRateA * (aDiffusion * aDiffusion) * a - a * (b * b) + feedRate * (1 - a)) * deltaTime;
}

function updateB(a, b, bDiffusion) {
    return b + (diffusionRateB * (bDiffusion * bDiffusion) * b + a * (b * b) - (killRate + feedRate) * b) * deltaTime;
}

function copyGrid(grid) {
    const length = grid.length;
    const newGrid = Array(length);
    for(let i = 0; i < length; i++) {
        newGrid[i] = grid[i].slice(0);
    }
    return newGrid;
}

function makePattern(grid, width, height) {
    const pattern = [...Array(width)].map((_, x) => [...Array(height)].map((_, y) => ' '));
    for(let x = 1; x < grid.length - 1; x++) {
        for(let y = 1; y < grid[x].length - 1; y++) {
            pattern[x][y] = grid[x][y].a <= grid[x][y].b ? 'X' : ' ';
        }
    }
    return pattern;
}

function drawPattern(pattern) {
    let str = '';
    for(const row of pattern) {
        for(const cell of row) {
            str += cell;
        }
        str += '\n';
    }
    return str;
}

function update(grid) {
    const newGrid = copyGrid(grid);
    for(let x = 1; x < grid.length - 1; x++) {
        for(let y = 1; y < grid[x].length - 1; y++) {
            const area = [
                [grid[x - 1][y - 1], grid[x - 1][y], grid[x - 1][y + 1]],
                [grid[x][y - 1], grid[x][y], grid[x][y + 1]],
                [grid[x + 1][y - 1], grid[x + 1][y], grid[x + 1][y + 1]],
            ];
            const aDiffusion = diffusion('a', area, laplacianMatrix);
            const bDiffusion = diffusion('b', area, laplacianMatrix);
            newGrid[x][y].a = updateA(grid[x][y].a, grid[x][y].b, aDiffusion);
            newGrid[x][y].b = updateB(grid[x][y].a, grid[x][y].b, bDiffusion);
        }
    }
    return newGrid;
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for(let x = 1; x < grid.length - 1; x++) {
        for(let y = 1; y < grid[x].length - 1; y++) {
            context.fillStyle = grid[x][y].a > grid[x][y].b ? 'white' : 'black';
            context.fillRect(x, y, 1, 1);
        }
    }
    grid = update(grid);
}

draw();

setInterval(draw, 600);
