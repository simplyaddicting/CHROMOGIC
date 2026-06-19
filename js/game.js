// =====================================
// CHROMOGIC
// game.js
// =====================================

// ===== SECTION 1 =====
// GAME STATE
// =====================================

const GameCore = (() => {

    let state = null;
    let timerInterval = null;
    let puzzleStartTime = 0;
    let elapsedBeforePause = 0;
    let paused = false;

    // ===== SECTION 2 =====
    // STATE GETTERS
    // =====================================

    function getState() {
        return state;
    }

    function isPaused() {
        return paused;
    }

    // ===== SECTION 3 =====
    // TIMER
    // =====================================

    function startTimer() {

        stopTimer();

        puzzleStartTime = Date.now();
        elapsedBeforePause = 0;
        paused = false;

        timerInterval = setInterval(
            function() {

                if (paused) {
                    return;
                }

                const elapsed =
                    elapsedBeforePause +
                    (
                        Date.now() -
                        puzzleStartTime
                    ) / 1000;

                HUDManager.updateTimer(
                    elapsed
                );

                if (
                    state &&
                    typeof state
                        .onTimerTick ===
                    "function"
                ) {
                    state.onTimerTick(
                        elapsed
                    );
                }
            },
            250
        );
    }

    function stopTimer() {

        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    function getPuzzleTime() {

        if (paused) {
            return elapsedBeforePause;
        }

        return Number(
            (
                elapsedBeforePause +
                (
                    Date.now() -
                    puzzleStartTime
                ) / 1000
            ).toFixed(2)
        );
    }

    function resetTimer() {

        stopTimer();
        elapsedBeforePause = 0;
        puzzleStartTime = Date.now();
    }

    // ===== SECTION 4 =====
    // PAUSE / RESUME / QUIT
    // =====================================

    function pause() {

        if (!state || paused) {
            return;
        }

        paused = true;

        elapsedBeforePause +=
            (
                Date.now() -
                puzzleStartTime
            ) / 1000;

        if (
            state.mode === "marathon" &&
            typeof state
                .pauseCountdown ===
            "function"
        ) {
            state.pauseCountdown();
        }

        AudioSystem.pauseMusic();

        ScreenManager.showOverlay(
            "pauseScreen"
        );
    }

    function resume() {

        if (!state || !paused) {
            return;
        }

        paused = false;

        puzzleStartTime = Date.now();

        if (
            state.mode === "marathon" &&
            typeof state
                .resumeCountdown ===
            "function"
        ) {
            state.resumeCountdown();
        }

        AudioSystem.resumeMusic();

        ScreenManager.hideOverlay(
            "pauseScreen"
        );
    }

    function quit() {

        stopTimer();

        state = null;
        paused = false;
        elapsedBeforePause = 0;

        document.body.classList
            .remove("low-time");

        ScreenManager.hideOverlay(
            "pauseScreen"
        );

        ScreenManager.showScreen(
            "menuScreen"
        );

        MenuUI.updateStats();

        AudioSystem.playMusic(
            "music_menu"
        );
    }

    // ===== SECTION 5 =====
    // INIT PUZZLE STATE
    // =====================================

    function initPuzzle(options) {

        // options: {
        //   mode, gridSize, difficulty,
        //   totalPuzzles, currentPuzzle,
        //   modeLabel, mistakes, solved,
        //   streak, onTimerTick,
        //   pauseCountdown,
        //   resumeCountdown
        // }

        state = {
            mode:
                options.mode,
            gridSize:
                options.gridSize,
            difficulty:
                options.difficulty,
            totalPuzzles:
                options.totalPuzzles,
            currentPuzzle:
                options.currentPuzzle,
            modeLabel:
                options.modeLabel || "",
            mistakes:
                options.mistakes || 0,
            solved:
                options.solved || 0,
            streak:
                options.streak || 0,
            currentGeneratedPuzzle:
                null,
            currentPlayerBoard:
                null,
            onTimerTick:
                options.onTimerTick ||
                null,
            pauseCountdown:
                options.pauseCountdown ||
                null,
            resumeCountdown:
                options.resumeCountdown ||
                null
        };
    }

    // ===== SECTION 6 =====
    // LOAD PUZZLE
    // =====================================

    function loadPuzzle(puzzleOptions) {

        // puzzleOptions: {
        //   gridSize, difficulty
        // }

        const gridSize =
            puzzleOptions.gridSize;

        const diffConfig =
            DIFFICULTY_CONFIGS[
                puzzleOptions.difficulty
            ];

        const generated =
            PuzzleGenerator
                .generateCompetitivePuzzle(
                    gridSize,
                    diffConfig
                );

        state.currentGeneratedPuzzle =
            generated;

        state.currentPlayerBoard =
            generated.playerBoard.map(
                function(row) {
                    return row.slice();
                }
            );

        BoardRenderer.render(
            generated,
            state.currentPlayerBoard,
            gridSize
        );

        HUDManager.update(state);

        SettingsManager.applyIntensity(
            diffConfig.intensity
        );

        resetTimer();
        startTimer();
    }

    // ===== SECTION 7 =====
    // CELL CLICK
    // =====================================

    function handleCellClick(row, col) {

        if (!state || paused) {
            return;
        }

        const puzzle =
            state.currentGeneratedPuzzle;

        if (!puzzle) {
            return;
        }

        const puzzleCell =
            puzzle.puzzle[row][col];

        if (puzzleCell) {
            return;
        }

        const board =
            state.currentPlayerBoard;

        const current =
            board[row][col];

        const gridConfig =
            GRID_CONFIGS[state.gridSize];

        const colorCount =
            gridConfig.colors;

        const next =
            nextColor(current, colorCount);

        board[row][col] = next;

        BoardRenderer.updateCell(
            row, col, next
        );

        AudioSystem.playSfx("click");
    }

    function nextColor(current, colorCount) {

        if (current === null) {
            return 0;
        }

        if (current + 1 < colorCount) {
            return current + 1;
        }

        return null;
    }

function getCompleteDifficulty(state) {
    if (state.mode === "marathon") {
        if (state.gridSize === 4) return "easy";
        if (state.gridSize === 6) return "hard";
        return "expert";
    }
    return state.difficulty;
}

    // ===== SECTION 8 =====
    // CHECK SOLUTION
    // =====================================

    function checkSolution(onCorrect) {

        if (!state || paused) {
            return;
        }

        const puzzle =
            state.currentGeneratedPuzzle;

        const board =
            state.currentPlayerBoard;

        const gridSize = state.gridSize;

        const wrongCells = [];

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
                    puzzle.puzzle[row][col]
                ) {
                    continue;
                }

                if (
                    board[row][col] !==
                    puzzle.solution[row][col]
                ) {

                    wrongCells.push({
                        row,
                        col
                    });
                }
            }
        }

        if (wrongCells.length > 0) {

            state.mistakes +=
                wrongCells.length;

            StorageManager.recordMistakes(
                wrongCells.length
            );

            HUDManager.update(state);

            BoardRenderer.markWrongCells(
                wrongCells
            );

            AudioSystem.playSfx(
                "sfx_wrong"
            );

            return;
        }

        // Correct
        const time = getPuzzleTime();

        stopTimer();

        StorageManager.recordPuzzleSolved(
            time
        );

        const puzzleMistakes =
            state.mistakes;

        const flawless =
            puzzleMistakes === 0;

        if (flawless) {

            state.streak++;

            AudioSystem.playCompleteSfx(
                getCompleteDifficulty(state),
                true
            );

        } else {

            if (state.streak > 0) {
                showStreakLostBanner();
            }

            state.streak = 0;

            AudioSystem.playCompleteSfx(
                getCompleteDifficulty(state),
                false
            );
        }

        // Check streak milestones
        if (
            STREAK_MILESTONES.includes(
                state.streak
            )
        ) {

            StreakBanner.show(
                state.streak
            );
        }

        AchievementManager
            .evaluateAfterPuzzle(
                time,
                puzzleMistakes
            );

        state.solved++;

        HUDManager.update(state);

        if (
            typeof onCorrect === "function"
        ) {
            onCorrect({
                time,
                flawless,
                mistakes: puzzleMistakes
            });
        }
    }

    // ===== SECTION 9 =====
    // SKIP
    // =====================================

    function skipPuzzle(onSkip) {

        if (!state || paused) {
            return;
        }

        stopTimer();

        state.streak = 0;

        HUDManager.update(state);

        if (
            typeof onSkip === "function"
        ) {
            onSkip();
        }
    }

    // ===== SECTION 10 =====
    // BOARD EVENT BINDING
    // =====================================

    function bindBoardEvents() {

        document.addEventListener(
            "click",
            function(e) {

                const cell =
                    e.target.closest(
                        ".cell"
                    );

                if (!cell) {
                    return;
                }

                if (
                    cell.dataset.locked ===
                    "true"
                ) {
                    return;
                }

                const row =
                    Number(
                        cell.dataset.row
                    );

                const col =
                    Number(
                        cell.dataset.col
                    );

                handleCellClick(row, col);
            }
        );
        document.addEventListener(
    "contextmenu",
    function(e) {

        const cell =
            e.target.closest(".cell");

        if (!cell) {
            return;
        }

        e.preventDefault();

        if (
            cell.dataset.locked === "true"
        ) {
            return;
        }

        if (!GameCore.getState()) {
            return;
        }

        const row =
            Number(cell.dataset.row);

        const col =
            Number(cell.dataset.col);

        const state = GameCore.getState();

        if (
            state.currentPlayerBoard
                [row][col] === null
        ) {
            return;
        }

        state.currentPlayerBoard
            [row][col] = null;

        BoardRenderer.updateCell(
            row, col, null
        );
        AchievementManager.tryUnlock(
            "right_clicker"
        );
        AudioSystem.playSfx("sfx_click");
    }
);
    }

// ===== SECTION 12 =====
    // PUZZLE LOG
    // =====================================

    function logPuzzleResult(
        puzzleIndex,
        time,
        skipped
    ) {

        const body =
            document.getElementById(
                "puzzleLogBody"
            );

        if (!body) {
            return;
        }

        const state = getState();

        const tr =
            document.createElement("tr");

        tr.innerHTML =
            "<td>" +
            puzzleIndex +
            "</td>" +
            "<td>" +
            (
                skipped
                    ? "Skipped"
                    : HUDManager.formatTime(
                        time
                    )
            ) +
            "</td>" +
            "<td>" +
            (
                skipped
                    ? "—"
                    : (state
                        ? state.mistakes
                        : 0)
            ) +
            "</td>";

        body.appendChild(tr);
    }

    function clearPuzzleLog() {

        const body =
            document.getElementById(
                "puzzleLogBody"
            );

        if (body) {
            body.innerHTML = "";
        }
    }

    function bindLogToggle() {

        const toggle =
            document.getElementById(
                "puzzleLogToggle"
            );

        const dropdown =
            document.getElementById(
                "puzzleLogDropdown"
            );

        if (!toggle || !dropdown) {
            return;
        }

        toggle.addEventListener(
            "click",
            function(e) {

                e.stopPropagation();

                dropdown.classList.toggle(
                    "open"
                );
            }
        );

        document.addEventListener(
            "click",
            function() {

                if (dropdown) {
                    dropdown.classList
                        .remove("open");
                }
            }
        );
    }


    function showStreakLostBanner() {
    StreakLostBanner.show();
}

    // ===== SECTION 11 =====
    // PUBLIC API
    // =====================================

    return {
        getState,
        isPaused,
        initPuzzle,
        loadPuzzle,
        checkSolution,
        skipPuzzle,
        startTimer,
        stopTimer,
        resetTimer,
        getPuzzleTime,
        pause,
        resume,
        quit,
        bindBoardEvents,
        logPuzzleResult,
        clearPuzzleLog,
        bindLogToggle,
    };

})();

window.GameCore = GameCore;

// ===== SECTION 12 =====
// BIND BOARD ON DOM READY
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    function() {
        GameCore.bindBoardEvents();
        GameCore.bindLogToggle();
    }
);