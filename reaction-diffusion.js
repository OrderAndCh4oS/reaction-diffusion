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
    if((x >= 45 * 2.5 && x <= 55 * 2.5) && (y >= 45 * 2.5 && y <= 55 * 2.5)) return {a: 0, b: 1};
    return {a: 1, b: 0};
}

function initGridCellRand(x, y) {
    return {a: 1, b: Math.random() > 0.5 ? 1 : 0};
}

let grid = [...Array(gridWidth)].map(
    (_, x) => [...Array(gridHeight)].map((_, y) => initGridCellBox(x, y)));

const diffusionRateA = 1;
const diffusionRateB = 0.5;
const feedRate = 0.0367;
const killRate = 0.0649;
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
    // const laplacianSum = laplacianMatrix.flat(1).reduce((a, b) => round(a + b, 2), 0);
    let sum = 0;
    for(let x = 0; x < area.length; x++) {
        for(let y = 0; y < area[x].length; y++) {
            sum = sum + area[x][y][key] * laplacianMatrix[x][y];
        }
    }

    return sum;
}

// // Guess at the need to spread the values out around the current cell
// function applyDiffusion(key, value, x, y, grid, laplacianMatrix) {
//     const top = x > 0 ? x - 1 : grid.length - 1;
//     const bottom = x < grid.length - 1 ? x + 1 : 0;
//     const left = y > 0 ? y - 1 : grid[x].length - 1;
//     const right = y < grid[x].length - 1 ? y + 1 : 0;
//     grid[top][left][key] = value * laplacianMatrix[0][0];
//     grid[x][left][key] = value * laplacianMatrix[1][0];
//     grid[bottom][left][key] = value * laplacianMatrix[2][0];
//     grid[top][y][key] = value * laplacianMatrix[0][1];
//     grid[bottom][y][key] = value * laplacianMatrix[2][1];
//     grid[top][right][key] = value * laplacianMatrix[0][2];
//     grid[x][right][key] = value * laplacianMatrix[1][2];
//     grid[bottom][right][key] = value * laplacianMatrix[2][2];
//     // grid[x][y][key] = grid[x][y][key] * laplacianMatrix[1][1];
// }

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

function makePattern(grid, width, height) {
    const pattern = [...Array(width)].map((_, x) => [...Array(height)].map((_, y) => ' '));
    for(let x = 0; x < grid.length; x++) {
        for(let y = 0; y < grid[x].length; y++) {
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
            // if(isNaN(a)) throw new Error('A is NaN');
            // if(isNaN(b)) throw new Error('B is NaN');
            newGrid[x][y].a = a;
            newGrid[x][y].b = b;
            // applyDiffusion('a', grid[x][y].a, x, y, newGrid, laplacianMatrix);
            // applyDiffusion('b', grid[x][y].b, x, y, newGrid, laplacianMatrix);
        }
    }

    return newGrid;
}

let i = 0;

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for(let x = 1; x < grid.length - 1; x++) {
        for(let y = 1; y < grid[x].length - 1; y++) {
            // if(grid[x][y].a > 1 || grid[x][y].a < 0) throw new Error('A is out of range');
            // if(grid[x][y].b > 1 || grid[x][y].b < 0) throw new Error('B is out of range');
            context.fillStyle = grid[x][y].a > grid[x][y].b ? 'white' : 'black';
            context.fillRect(x, y, 1, 1);
        }
    }
    update(grid);
    i++;
    console.log(i);
    setTimeout(draw, 100);
}

draw();
