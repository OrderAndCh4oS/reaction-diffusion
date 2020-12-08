const gridWidth = 20;
const gridHeight = 20;

function initGridCell(x, y) {
    // if((x >= 8 && x <= 12) && (y >= 8 && y <= 12)) return {a: 1, b: 1}
    return {a: 1, b: Math.random() > 0.55 ? 1 : 0};
    // return {a: 1, b: 0};
}

let grid = [...Array(gridWidth)].map((_, x) => [...Array(gridHeight)].map((_, y) => initGridCell(x, y)));

const diffusionRateA = 1;
const diffusionRateB = 0.5;
const feedRate = 0.055;
const killRate = 0.062;
const deltaTime = 1;

const laplacianMatrix = [
    [0.05, 0.2, 0.05],
    [0.2, -1, 0.2],
    [0.05, 0.2, 0.05],
]

function diffusion(key, area, laplacianMatrix) {
    let sum = 0;
    let areaSum = 0;
    for(let x = 0; x < area.length; x++) {
        for(let y = 0; y < area[x].length; y++) {
            sum += area[x][y][key] * laplacianMatrix[x][y];
            areaSum += area[x][y][key]
        }
    }

    return areaSum !== 0 ? sum / areaSum : 0;
}

function updateA(a, b, aDiffusion) {
    return a + (diffusionRateA * aDiffusion * aDiffusion * a - a * b * b + feedRate * (1 - a)) * deltaTime;
}

function updateB(a, b, bDiffusion) {
    return b + (diffusionRateB * bDiffusion * bDiffusion * b + a * b * b - (killRate + feedRate) * b) * deltaTime;
}

function copyGrid(grid) {
    const length = grid.length;
    const newGrid = Array(length);
    for (let i = 0; i < length; i++) {
        newGrid[i] = grid[i].slice(0);
    }
    return newGrid;
}

function makePattern(grid, width, height) {
    const pattern = [...Array(width)].map((_, x) => [...Array(height)].map((_, y) => ' '));
    for (let x = 1; x < grid.length - 1; x++) {
        for(let y = 1; y < grid[x].length -1; y++) {
            pattern[x][y] = grid[x][y].a <= grid[x][y].b ? 'X' : ' '
        }
    }
    return pattern;
}

function drawPattern(pattern) {
    let str = '';
    for(const row of pattern) {
        for(const cell of row) {
            str += cell
        }
        str += '\n'
    }
    return str;
}

function run(grid) {
    for (let i = 0; i < 10; i++) {
        const newGrid = copyGrid(grid);
        for(let x = 1; x < grid.length - 1; x++) {
            for(let y = 1; y < grid[x].length - 1; y++) {
                const area = [
                    [grid[x-1][y-1], grid[x-1][y], grid[x-1][y+1]],
                    [grid[x][y-1], grid[x][y], grid[x][y+1]],
                    [grid[x+1][y-1], grid[x+1][y], grid[x+1][y+1]],
                ];
                const aDiffusion = diffusion('a', area, laplacianMatrix);
                const bDiffusion = diffusion('b', area, laplacianMatrix);
                grid[x][y].a = updateA(grid[x][y].a, grid[x][y].b, aDiffusion);
                grid[x][y].b = updateB(grid[x][y].a, grid[x][y].b, bDiffusion);
            }
        }
        grid = newGrid;
    }
    console.log(drawPattern(makePattern(grid, gridWidth, gridHeight)));
}

run(grid);
