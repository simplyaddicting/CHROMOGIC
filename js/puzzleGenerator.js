// =====================================
// CHROMOGIC
// puzzleGenerator.js
// =====================================

// ===== SECTION 1 =====
// CONSTANTS
// =====================================

const COLOR_IDS = {
    cobalt: 0,
    sky:    1,
    yellow: 2,
    orange: 3
};

const COLOR_NAMES = [
    "cobalt",
    "sky",
    "yellow",
    "orange"
];

// ===== SECTION 2 =====
// RANDOM HELPERS
// =====================================

function randomInt(min, max) {

    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;
}

function shuffle(array) {

    const arr = array.slice();

    for (
        let i = arr.length - 1;
        i > 0;
        i--
    ) {

        const j = Math.floor(
            Math.random() * (i + 1)
        );

        const tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }

    return arr;
}

// ===== SECTION 3 =====
// BOARD CREATION
// =====================================

function createEmptyBoard(gridSize) {

    const board = [];

    for (
        let row = 0;
        row < gridSize;
        row++
    ) {

        const newRow = [];

        for (
            let col = 0;
            col < gridSize;
            col++
        ) {

            newRow.push(null);
        }

        board.push(newRow);
    }

    return board;
}

// ===== SECTION 4 =====
// ROW PATTERNS
// =====================================

function createRowPattern(gridSize) {

    const numColors =
        GRID_CONFIGS[gridSize].colors;

    const pattern = [];

    for (
        let color = 0;
        color < numColors;
        color++
    ) {

        pattern.push(color);
        pattern.push(color);
    }

    return shuffle(pattern);
}

// ===== SECTION 5 =====
// COLUMN VALIDATION
// =====================================

function canPlaceColor(
    board,
    row,
    col,
    color,
    gridSize
) {

    let count = 0;

    for (
        let r = 0;
        r < row;
        r++
    ) {

        if (board[r][col] === color) {
            count++;
        }
    }

    return count < 2;
}

function validateColumns(
    board,
    gridSize
) {

    const numColors =
        GRID_CONFIGS[gridSize].colors;

    for (
        let col = 0;
        col < gridSize;
        col++
    ) {

        const counts = [];

        for (
            let c = 0;
            c < numColors;
            c++
        ) {
            counts.push(0);
        }

        for (
            let row = 0;
            row < gridSize;
            row++
        ) {

            const color = board[row][col];

            if (color !== null) {
                counts[color]++;
            }
        }

        for (
            let c = 0;
            c < numColors;
            c++
        ) {

            if (counts[c] > 2) {
                return false;
            }
        }
    }

    return true;
}

// ===== SECTION 6 =====
// SOLUTION GENERATOR
// =====================================

function generateSolutionBoard(
    gridSize
) {

    let attempts = 0;

    while (attempts < 1000) {

        attempts++;

        const board =
            createEmptyBoard(gridSize);

        let success = true;

        for (
            let row = 0;
            row < gridSize;
            row++
        ) {

            let pattern =
                createRowPattern(gridSize);

            pattern = shuffle(pattern);

            for (
                let col = 0;
                col < gridSize;
                col++
            ) {

                const validChoices =
                    pattern.filter(
                        function(color) {
                            return canPlaceColor(
                                board,
                                row,
                                col,
                                color,
                                gridSize
                            );
                        }
                    );

                if (
                    validChoices.length === 0
                ) {
                    success = false;
                    break;
                }

                const chosen =
                    validChoices[
                        randomInt(
                            0,
                            validChoices.length - 1
                        )
                    ];

                board[row][col] = chosen;

                const index =
                    pattern.indexOf(chosen);

                pattern.splice(index, 1);
            }

            if (!success) {
                break;
            }
        }

        if (
            success &&
            validateColumns(board, gridSize)
        ) {
            return board;
        }
    }

    console.warn("Generator retrying...");

    return generateSolutionBoard(gridSize);
}

// ===== SECTION 7 =====
// CLUE COUNTER
// =====================================

function countMatchingNeighbors(
    board,
    row,
    col,
    gridSize
) {

    const color = board[row][col];

    let count = 0;

    const directions = [
        [-1,  0],
        [ 1,  0],
        [ 0, -1],
        [ 0,  1]
    ];

    directions.forEach(function(dir) {

        const nr = row + dir[0];
        const nc = col + dir[1];

        if (
            nr < 0 ||
            nr >= gridSize ||
            nc < 0 ||
            nc >= gridSize
        ) {
            return;
        }

        if (board[nr][nc] === color) {
            count++;
        }
    });

    return count;
}

// ===== SECTION 8 =====
// CLUE MAP CREATION
// =====================================

function generateClueMap(
    solutionBoard,
    gridSize
) {

    const clueMap = [];

    for (
        let row = 0;
        row < gridSize;
        row++
    ) {

        const clueRow = [];

        for (
            let col = 0;
            col < gridSize;
            col++
        ) {

            clueRow.push({

                color:
                    solutionBoard[row][col],

                number:
                    countMatchingNeighbors(
                        solutionBoard,
                        row,
                        col,
                        gridSize
                    )
            });
        }

        clueMap.push(clueRow);
    }

    return clueMap;
}

// ===== SECTION 9 =====
// DEEP COPY HELPERS
// =====================================

function cloneBoard(board) {

    return board.map(function(row) {

        return row.map(function(cell) {

            if (cell === null) {
                return null;
            }

            if (typeof cell === "object") {
                return JSON.parse(
                    JSON.stringify(cell)
                );
            }

            return cell;
        });
    });
}

// ===== SECTION 10 =====
// ROW / COLUMN COUNTING
// =====================================

function getRowColorCounts(
    board,
    row,
    gridSize
) {

    const numColors =
        GRID_CONFIGS[gridSize].colors;

    const counts = [];

    for (
        let c = 0;
        c < numColors;
        c++
    ) {
        counts.push(0);
    }

    for (
        let col = 0;
        col < gridSize;
        col++
    ) {

        const value = board[row][col];

        if (value === null) {
            continue;
        }

        counts[value]++;
    }

    return counts;
}

function getColumnColorCounts(
    board,
    col,
    gridSize
) {

    const numColors =
        GRID_CONFIGS[gridSize].colors;

    const counts = [];

    for (
        let c = 0;
        c < numColors;
        c++
    ) {
        counts.push(0);
    }

    for (
        let row = 0;
        row < gridSize;
        row++
    ) {

        const value = board[row][col];

        if (value === null) {
            continue;
        }

        counts[value]++;
    }

    return counts;
}

// ===== SECTION 11 =====
// PARTIAL VALIDATION
// =====================================

function partialBoardValid(
    board,
    gridSize
) {

    const numColors =
        GRID_CONFIGS[gridSize].colors;

    for (
        let row = 0;
        row < gridSize;
        row++
    ) {

        const counts =
            getRowColorCounts(
                board,
                row,
                gridSize
            );

        for (
            let color = 0;
            color < numColors;
            color++
        ) {

            if (counts[color] > 2) {
                return false;
            }
        }
    }

    for (
        let col = 0;
        col < gridSize;
        col++
    ) {

        const counts =
            getColumnColorCounts(
                board,
                col,
                gridSize
            );

        for (
            let color = 0;
            color < numColors;
            color++
        ) {

            if (counts[color] > 2) {
                return false;
            }
        }
    }

    return true;
}

// ===== SECTION 12 =====
// CLUE VALIDATION
// =====================================

function clueSatisfied(
    board,
    clues,
    row,
    col,
    gridSize
) {

    const clue  = clues[row][col];
    const color = board[row][col];

    if (color === null) {
        return true;
    }

    let count = 0;

    const dirs = [
        [-1,  0],
        [ 1,  0],
        [ 0, -1],
        [ 0,  1]
    ];

    for (
        let i = 0;
        i < dirs.length;
        i++
    ) {

        const nr = row + dirs[i][0];
        const nc = col + dirs[i][1];

        if (
            nr < 0 ||
            nr >= gridSize ||
            nc < 0 ||
            nc >= gridSize
        ) {
            continue;
        }

        if (board[nr][nc] === color) {
            count++;
        }
    }

    return count === clue.number;
}

// ===== SECTION 13 =====
// COMPLETE SOLUTION CHECK
// =====================================

function isSolvedBoard(
    board,
    clues,
    gridSize
) {

    const numColors =
        GRID_CONFIGS[gridSize].colors;

    for (
        let row = 0;
        row < gridSize;
        row++
    ) {

        const rowCounts =
            getRowColorCounts(
                board,
                row,
                gridSize
            );

        for (
            let c = 0;
            c < numColors;
            c++
        ) {

            if (rowCounts[c] !== 2) {
                return false;
            }
        }
    }

    for (
        let col = 0;
        col < gridSize;
        col++
    ) {

        const colCounts =
            getColumnColorCounts(
                board,
                col,
                gridSize
            );

        for (
            let c = 0;
            c < numColors;
            c++
        ) {

            if (colCounts[c] !== 2) {
                return false;
            }
        }
    }

    for (
        let row = 0;
        row < gridSize;
        row++
    ) {

        for (
            let col = 0;
            col < gridSize;
            col++
        ) {

            if (board[row][col] === null) {
                return false;
            }

            if (
                !clueSatisfied(
                    board,
                    clues,
                    row,
                    col,
                    gridSize
                )
            ) {
                return false;
            }
        }
    }

    return true;
}

// ===== SECTION 14 =====
// FIND EMPTY CELL
// =====================================

function findEmptyCell(
    board,
    gridSize
) {

    for (
        let row = 0;
        row < gridSize;
        row++
    ) {

        for (
            let col = 0;
            col < gridSize;
            col++
        ) {

            if (board[row][col] === null) {
                return { row: row, col: col };
            }
        }
    }

    return null;
}

// ===== SECTION 15 =====
// BACKTRACKING SOLVER
// =====================================

function solveBoard(
    board,
    clues,
    gridSize
) {

    const empty =
        findEmptyCell(board, gridSize);

    if (!empty) {

        return isSolvedBoard(
            board,
            clues,
            gridSize
        );
    }

    const numColors =
        GRID_CONFIGS[gridSize].colors;

    const colors = [];

    for (
        let c = 0;
        c < numColors;
        c++
    ) {
        colors.push(c);
    }

    const shuffled = shuffle(colors);

    for (
        let i = 0;
        i < shuffled.length;
        i++
    ) {

        const color = shuffled[i];

        board[empty.row][empty.col] =
            color;

        if (
            partialBoardValid(
                board,
                gridSize
            ) &&
            clueSatisfied(
                board,
                clues,
                empty.row,
                empty.col,
                gridSize
            )
        ) {

            if (
                solveBoard(
                    board,
                    clues,
                    gridSize
                )
            ) {
                return true;
            }
        }

        board[empty.row][empty.col] = null;
    }

    return false;
}

// ===== SECTION 16 =====
// SOLUTION COUNTER
// =====================================

function countSolutions(
    board,
    clues,
    limit,
    gridSize
) {

    limit = limit || 2;

    const numColors =
        GRID_CONFIGS[gridSize].colors;

    let solutions = 0;

    function search() {

        if (solutions >= limit) {
            return;
        }

        const empty =
            findEmptyCell(board, gridSize);

        if (!empty) {

            if (
                isSolvedBoard(
                    board,
                    clues,
                    gridSize
                )
            ) {
                solutions++;
            }

            return;
        }

        for (
            let color = 0;
            color < numColors;
            color++
        ) {

            board[empty.row][empty.col] =
                color;

            if (
                partialBoardValid(
                    board,
                    gridSize
                ) &&
                clueSatisfied(
                    board,
                    clues,
                    empty.row,
                    empty.col,
                    gridSize
                )
            ) {
                search();
            }

            board[empty.row][empty.col] =
                null;
        }
    }

    search();

    return solutions;
}

// ===== SECTION 17 =====
// UNIQUENESS TEST
// =====================================

function hasUniqueSolution(
    puzzleBoard,
    clues,
    gridSize
) {

    const testBoard = cloneBoard(puzzleBoard);

    const count = countSolutions(
        testBoard,
        clues,
        2,
        gridSize
    );

    return count === 1;
}

// ===== SECTION 18 =====
// REDUCTION SYSTEM
// =====================================

function reducePuzzle(
    solution,
    clues,
    gridSize,
    removal
) {

    const puzzle = cloneBoard(solution);

    const cells = [];

    for (
        let row = 0;
        row < gridSize;
        row++
    ) {

        for (
            let col = 0;
            col < gridSize;
            col++
        ) {

            cells.push({
                row: row,
                col: col
            });
        }
    }

    const shuffled = shuffle(cells);

    const totalCells = gridSize * gridSize;

    const minRemovals = Math.floor(
        totalCells * removal.min
    );

    const maxRemovals = Math.floor(
        totalCells * removal.max
    );

    const targetRemovals =
        minRemovals +
        Math.floor(
            Math.random() *
            (maxRemovals - minRemovals + 1)
        );

    let removed = 0;

    for (
        let i = 0;
        i < shuffled.length;
        i++
    ) {

        if (removed >= targetRemovals) {
            break;
        }

        const cell = shuffled[i];

        const backup =
            puzzle[cell.row][cell.col];

        puzzle[cell.row][cell.col] = null;

        const unique = hasUniqueSolution(
            puzzle,
            clues,
            gridSize
        );

        if (unique) {

            removed++;

        } else {

            puzzle[cell.row][cell.col] =
                backup;
        }
    }

    return puzzle;
}

// ===== SECTION 19 =====
// ADVANCED PUZZLE OBJECT
// =====================================

function generateAdvancedPuzzle(
    gridSize,
    removal
) {

    const solution =
        generateSolutionBoard(gridSize);

    const clues =
        generateClueMap(solution, gridSize);

    const rawPuzzle = reducePuzzle(
        solution,
        clues,
        gridSize,
        removal
    );

    const puzzle = [];

    for (
        let row = 0;
        row < gridSize;
        row++
    ) {

        puzzle.push([]);

        for (
            let col = 0;
            col < gridSize;
            col++
        ) {

            puzzle[row].push(null);
        }
    }

    for (
        let row = 0;
        row < gridSize;
        row++
    ) {

        for (
            let col = 0;
            col < gridSize;
            col++
        ) {

            const cell = rawPuzzle[row][col];

            if (cell !== null) {

                puzzle[row][col] = {
                    color: cell,
                    clue:  clues[row][col]
                };
            }
        }
    }

    return {
        puzzle:   puzzle,
        solution: solution,
        clues:    clues,
        gridSize: gridSize
    };
}

// ===== SECTION 20 =====
// FINAL GENERATOR
// =====================================

function generateCompetitivePuzzle(
    gridSize,
    diffConfig
) {

    const size = gridSize || 8;

    const removal = {
        min: diffConfig
            ? diffConfig.removalMin
            : 0.40,
        max: diffConfig
            ? diffConfig.removalMax
            : 0.55
    };

    let attempts = 0;

    while (attempts < 50) {

        attempts++;

        const generated =
            generateAdvancedPuzzle(
                size,
                removal
            );

        if (
            puzzleMeetsRequirements(
                generated
            )
        ) {

            generated.playerBoard =
                createPlayerBoard(
                    generated.puzzle,
                    size
                );

            return generated;
        }
    }

    console.warn(
        "Puzzle generation fallback triggered."
    );

    const generated =
        generateAdvancedPuzzle(
            size,
            removal
        );

    generated.playerBoard =
        createPlayerBoard(
            generated.puzzle,
            size
        );

    return generated;
}

// ===== SECTION 21 =====
// PLAYER BOARD CREATION
// =====================================

function createPlayerBoard(
    puzzle,
    gridSize
) {

    const board = [];

    for (
        let row = 0;
        row < gridSize;
        row++
    ) {

        const newRow = [];

        for (
            let col = 0;
            col < gridSize;
            col++
        ) {

            const cell = puzzle[row][col];

            if (cell === null) {
                newRow.push(null);
            } else {
                newRow.push(cell.color);
            }
        }

        board.push(newRow);
    }

    return board;
}

// ===== SECTION 22 =====
// POSSIBILITY CHECK
// =====================================

function getPossibleColors(
    board,
    row,
    col,
    gridSize
) {

    if (board[row][col] !== null) {
        return [board[row][col]];
    }

    const numColors =
        GRID_CONFIGS[gridSize].colors;

    const possible = [];

    for (
        let color = 0;
        color < numColors;
        color++
    ) {

        board[row][col] = color;

        if (
            partialBoardValid(
                board,
                gridSize
            )
        ) {
            possible.push(color);
        }

        board[row][col] = null;
    }

    return possible;
}

// ===== SECTION 23 =====
// REAL-TIME MOVE CHECK
// =====================================

function validateMove(
    board,
    row,
    col,
    color,
    gridSize
) {

    const oldValue = board[row][col];

    board[row][col] = color;

    const valid =
        partialBoardValid(board, gridSize);

    board[row][col] = oldValue;

    return valid;
}

// ===== SECTION 24 =====
// ROW STATUS
// =====================================

function rowComplete(
    board,
    row,
    gridSize
) {

    const numColors =
        GRID_CONFIGS[gridSize].colors;

    const counts =
        getRowColorCounts(
            board,
            row,
            gridSize
        );

    for (
        let color = 0;
        color < numColors;
        color++
    ) {

        if (counts[color] !== 2) {
            return false;
        }
    }

    return true;
}

// ===== SECTION 25 =====
// COLUMN STATUS
// =====================================

function columnComplete(
    board,
    col,
    gridSize
) {

    const numColors =
        GRID_CONFIGS[gridSize].colors;

    const counts =
        getColumnColorCounts(
            board,
            col,
            gridSize
        );

    for (
        let color = 0;
        color < numColors;
        color++
    ) {

        if (counts[color] !== 2) {
            return false;
        }
    }

    return true;
}

// ===== SECTION 26 =====
// BOARD PROGRESS
// =====================================

function calculateProgress(
    board,
    gridSize
) {

    const totalCells = gridSize * gridSize;

    let filled = 0;

    for (
        let row = 0;
        row < gridSize;
        row++
    ) {

        for (
            let col = 0;
            col < gridSize;
            col++
        ) {

            if (board[row][col] !== null) {
                filled++;
            }
        }
    }

    return Math.floor(
        (filled / totalCells) * 100
    );
}

// ===== SECTION 27 =====
// QUALITY SCORE
// =====================================

function calculatePuzzleQuality(
    puzzle,
    gridSize
) {

    const totalCells = gridSize * gridSize;

    let revealed = 0;

    for (
        let row = 0;
        row < gridSize;
        row++
    ) {

        for (
            let col = 0;
            col < gridSize;
            col++
        ) {

            if (puzzle[row][col]) {
                revealed++;
            }
        }
    }

    return totalCells - revealed;
}

// ===== SECTION 28 =====
// HINT SYSTEM
// =====================================

function findHintCell(
    board,
    gridSize
) {

    let bestCell = null;
    let bestCount = 999;

    for (
        let row = 0;
        row < gridSize;
        row++
    ) {

        for (
            let col = 0;
            col < gridSize;
            col++
        ) {

            if (board[row][col] !== null) {
                continue;
            }

            const possible =
                getPossibleColors(
                    board,
                    row,
                    col,
                    gridSize
                );

            if (
                possible.length < bestCount
            ) {

                bestCount = possible.length;

                bestCell = {
                    row:      row,
                    col:      col,
                    possible: possible
                };
            }
        }
    }

    return bestCell;
}

// ===== SECTION 29 =====
// PUZZLE ACCEPTANCE FILTER
// =====================================

function puzzleMeetsRequirements(
    generated
) {

    const gridSize = generated.gridSize;

    const totalCells = gridSize * gridSize;

    const minClues = Math.max(
        4,
        Math.floor(totalCells * 0.12)
    );

    const minHidden = Math.max(
        4,
        Math.floor(totalCells * 0.12)
    );

    const revealed =
        generated.puzzle
            .flat()
            .filter(function(c) {
                return c !== null;
            })
            .length;

    const hidden = totalCells - revealed;

    if (revealed < minClues) {
        return false;
    }

    if (hidden < minHidden) {
        return false;
    }

    // Every row must have at least 1 clue
    for (
        let row = 0;
        row < gridSize;
        row++
    ) {

        const rowRevealed =
            generated.puzzle[row]
                .filter(function(c) {
                    return c !== null;
                })
                .length;

        if (rowRevealed === 0) {
            return false;
        }
    }

    // Every column must have at least 1 clue
    for (
        let col = 0;
        col < gridSize;
        col++
    ) {

        let colRevealed = 0;

        for (
            let row = 0;
            row < gridSize;
            row++
        ) {

            if (
                generated.puzzle[row][col]
                !== null
            ) {
                colRevealed++;
            }
        }

        if (colRevealed === 0) {
            return false;
        }
    }

    return true;
}

// ===== SECTION 30 =====
// PLAYER SOLVED CHECK
// =====================================

function playerSolvedPuzzle(
    playerBoard,
    solution,
    gridSize
) {

    for (
        let row = 0;
        row < gridSize;
        row++
    ) {

        for (
            let col = 0;
            col < gridSize;
            col++
        ) {

            if (
                playerBoard[row][col] !==
                solution[row][col]
            ) {
                return false;
            }
        }
    }

    return true;
}

// ===== SECTION 31 =====
// PUZZLE ANALYTICS
// =====================================

function getPuzzleStats(generated) {

    const gridSize = generated.gridSize;

    const totalCells = gridSize * gridSize;

    const revealed =
        generated.puzzle
            .flat()
            .filter(function(c) {
                return c !== null;
            })
            .length;

    return {
        revealedCells: revealed,
        hiddenCells:   totalCells - revealed,
        gridSize:      gridSize
    };
}

// ===== SECTION 32 =====
// PUBLIC API
// =====================================

window.PuzzleGenerator = {
    generateCompetitivePuzzle,
    generateAdvancedPuzzle,
    playerSolvedPuzzle,
    validateMove,
    calculateProgress,
    getPossibleColors,
    findHintCell,
    getPuzzleStats
};
