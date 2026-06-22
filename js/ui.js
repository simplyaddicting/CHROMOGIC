// =====================================
// CHROMOGIC
// ui.js
// =====================================

// ===== SECTION 1 =====
// SCREEN MANAGER
// =====================================

const ScreenManager = (() => {

    const screens = [
        "menuScreen",
        "campaignSetupScreen",
        "marathonSetupScreen",
        "gameScreen",
        "pauseScreen",
        "puzzleResultScreen",
        "campaignResultScreen",
        "marathonOverScreen",
        "achievementsScreen",
        "rulesScreen",
        "settingsScreen",
        "aboutScreen"
    ];

    function showScreen(id) {

        screens.forEach(function(sid) {

            const el =
                document.getElementById(
                    sid
                );

            if (!el) {
                return;
            }

            if (sid === id) {
                el.classList.add("active");
            } else {
                el.classList.remove(
                    "active"
                );
            }
        });

        // Only show background particles
        // on menu screen
        const canvas =
            document.getElementById(
                "bgCanvas"
            );

        if (canvas) {

            // Stop any running animations
            if (
                typeof canvas._stopMarathon
                === "function"
            ) {
                canvas._stopMarathon();
                canvas._stopMarathon = null;
            }

            if (
                typeof canvas._stopAbout
                === "function"
            ) {
                canvas._stopAbout();
                canvas._stopAbout = null;
            }

            canvas.style.transition =
                "opacity 0.5s ease";

            if (id === "menuScreen") {

                canvas.style.opacity = "1";
                buildMenuBackground();

            } else if (
                id === "campaignSetupScreen"
            ) {

                canvas.style.opacity = "1";
                buildCampaignBackground();

            } else if (
                id === "marathonSetupScreen"
            ) {

                canvas.style.opacity = "1";
                buildMarathonBackground();

            } else if (
                id === "aboutScreen"
            ) {

                canvas.style.opacity = "1";
                buildAboutBackground();

            } else {

                canvas.style.opacity = "0";
            }
        }
    }

    function showOverlay(id) {

        const el =
            document.getElementById(id);

        if (el) {
            el.classList.add("active");
        }
    }

    function hideOverlay(id) {

        const el =
            document.getElementById(id);

        if (el) {
            el.classList.remove("active");
        }
    }

    return {
        showScreen,
        showOverlay,
        hideOverlay
    };

})();

window.ScreenManager = ScreenManager;

// ===== SECTION 2 =====
// BOARD RENDERER
// =====================================

const BoardRenderer = (() => {

    function getBoardSize(gridSize) {

        const maxVw =
            Math.min(
                window.innerWidth * 0.80,
                800
            );

        const maxVh =
            window.innerHeight * 0.78;

        const max =
            Math.min(maxVw, maxVh);

        return Math.floor(
            max / gridSize
        ) * gridSize;
    }

    function getColorClass(colorId) {

        if (colorId === null) {
            return "";
        }

        return "color-" + colorId;
    }

    function render(
        puzzleData,
        playerBoard,
        gridSize
    ) {

        const board =
            document.getElementById(
                "board"
            );

        if (!board) {
            return;
        }

        const size =
            getBoardSize(gridSize);

        const cellSize =
            size / gridSize;

        board.style.width = size + "px";
        board.style.height = size + "px";
        board.style.gridTemplateColumns =
            "repeat(" + gridSize + ", 1fr)";
        board.style.gridTemplateRows =
            "repeat(" + gridSize + ", 1fr)";

        board.innerHTML = "";

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

                const cell =
                    document
                        .createElement(
                            "div"
                        );

                cell.className = "cell";
                cell.dataset.row = row;
                cell.dataset.col = col;

                cell.style.fontSize =
                    Math.floor(
                        cellSize * 0.45
                    ) + "px";

                const puzzleCell =
                    puzzleData
                        .puzzle[row][col];

                if (puzzleCell) {

                    // Clue cell
                    cell.classList.add(
                        "clue"
                    );

                    cell.classList.add(
                        getColorClass(
                            puzzleCell.color
                        )
                    );

                    cell.textContent =
                        puzzleCell
                            .clue
                            .number;

                    cell.dataset.locked =
                        "true";

                } else {

                    // Editable cell
                    cell.dataset.locked =
                        "false";

                    const val =
                        playerBoard[row][col];

                    if (val !== null) {

                        cell.classList.add(
                            getColorClass(val)
                        );
                    }
                }

                board.appendChild(cell);
            }
        }
    }

    function updateCell(
        row,
        col,
        colorId
    ) {

        const cell =
            document.querySelector(
                ".cell[data-row=\"" +
                row +
                "\"][data-col=\"" +
                col +
                "\"]"
            );

        if (!cell) {
            return;
        }

        cell.classList.remove(
            "color-0",
            "color-1",
            "color-2",
            "color-3",
            "wrong"
        );

        if (colorId !== null) {

            cell.classList.add(
                getColorClass(colorId)
            );
        }

        // Pop animation
        cell.classList.remove("popping");

        void cell.offsetWidth;

        cell.classList.add("popping");

        setTimeout(function() {
            cell.classList.remove(
                "popping"
            );
        }, 180);
    }

    function markWrongCells(
        wrongCells
    ) {

        wrongCells.forEach(
            function(pos) {

                const cell =
                    document.querySelector(
                        ".cell[data-row=\"" +
                        pos.row +
                        "\"][data-col=\"" +
                        pos.col +
                        "\"]"
                    );

                if (!cell) {
                    return;
                }

                cell.classList.add("wrong");

                setTimeout(function() {

                    cell.classList.remove(
                        "wrong"
                    );

                }, 3000);
            }
        );
    }

    function clearWrongMarks() {

        const cells =
            document.querySelectorAll(
                ".cell.wrong"
            );

        cells.forEach(function(cell) {
            cell.classList.remove("wrong");
        });
    }

    return {
        render,
        updateCell,
        markWrongCells,
        clearWrongMarks,
        getColorClass
    };

})();

window.BoardRenderer = BoardRenderer;

// ===== SECTION 3 =====
// HUD MANAGER
// =====================================

const HUDManager = (() => {

    function update(state) {

        const puzzleNumber =
            document.getElementById(
                "puzzleNumber"
            );

        const puzzleTotal =
            document.getElementById(
                "puzzleTotalDisplay"
            );

        const mistakes =
            document.getElementById(
                "mistakeCount"
            );

        const streak =
            document.getElementById(
                "streakCount"
            );

        const solved =
            document.getElementById(
                "solvedCount"
            );

        const modeLabel =
            document.getElementById(
                "modeLabel"
            );

        if (puzzleNumber) {
            puzzleNumber.textContent =
                state.currentPuzzle;
        }

        if (puzzleTotal) {
            puzzleTotal.textContent =
                state.totalPuzzles === -1
                    ? "∞"
                    : state.totalPuzzles;
        }

        if (mistakes) {
            mistakes.textContent =
                state.mistakes;
        }

        if (streak) {
            streak.textContent =
                state.streak;
        }

        if (solved) {
            solved.textContent =
                state.solved;
        }

        if (modeLabel) {
            modeLabel.textContent =
                state.modeLabel || "";
        }
    }

    function updateTimer(seconds) {
    const state = typeof GameCore !== "undefined" ? GameCore.getState() : null;
    const isMarathon = state && state.mode === "marathon";

    // In marathon: per-puzzle timer goes to subbar
    if (isMarathon) {
        const sub = document.getElementById("puzzleTimerSubbar");
        if (sub) sub.textContent = formatTime(seconds);
    } else {
        const el = document.getElementById("timerDisplay");
        if (el) el.textContent = formatTime(seconds);
    }
}

    function updateCountdown(seconds) {
    // Countdown is now the main topbar display in marathon
    const el = document.getElementById("countdownDisplay");
    const wrap = document.getElementById("countdownWrap");

    // Show the countdown in topbar center, hide per-puzzle timer there
    const mainTimer = document.getElementById("timerDisplay");
    if (mainTimer) mainTimer.style.display = "none";
    if (el) el.style.display = "";

    if (wrap) wrap.classList.add("visible");
    if (!el) return;

    el.textContent = formatTime(seconds);

    if (seconds <= 30) {
        el.style.color = "var(--color-3)";
    } else {
        el.style.color = "";
    }
}

    function hideCountdown() {
    // Campaign mode: hide countdown display, show per-puzzle timer
    const el = document.getElementById("countdownDisplay");
    const mainTimer = document.getElementById("timerDisplay");
    const wrap = document.getElementById("countdownWrap");

    if (el) el.style.display = "none";
    if (mainTimer) mainTimer.style.display = "";
    if (wrap) wrap.classList.remove("visible");
}

    function formatTime(seconds) {

        const m =
            Math.floor(seconds / 60);

        const s =
            Math.floor(seconds % 60);

        return (
            String(m).padStart(2, "0") +
            ":" +
            String(s).padStart(2, "0")
        );
    }

    return {
        update,
        updateTimer,
        updateCountdown,
        hideCountdown,
        formatTime
    };

})();

window.HUDManager = HUDManager;

// ===== SECTION 4 =====
// STREAK BANNER
// =====================================

const StreakBanner = (() => {

    let hideTimeout = null;

    function show(streakCount) {

        const banner =
            document.getElementById(
                "streakBanner"
            );

        if (!banner) {
            return;
        }

        banner.textContent =
            "🔥 " +
            streakCount +
            " STREAK";

        banner.classList.remove("hidden");
        banner.classList.add("visible");

        if (hideTimeout) {
            clearTimeout(hideTimeout);
        }

        hideTimeout = setTimeout(
            function() {
                hide();
            },
            2500
        );
    }

    function hide() {

        const banner =
            document.getElementById(
                "streakBanner"
            );

        if (!banner) {
            return;
        }

        banner.classList.remove("visible");
        banner.classList.add("hidden");
    }

    return { show, hide };

})();

window.StreakBanner = StreakBanner;


// ===== SECTION 4b =====
// STREAK LOST BANNER
// =====================================

const StreakLostBanner = (() => {

    let hideTimeout = null;

    function show() {

        const banner =
            document.getElementById(
                "streakBanner"
            );

        if (!banner) {
            return;
        }

        if (hideTimeout) {
            clearTimeout(hideTimeout);
        }

        banner.textContent =
            "💔 STREAK LOST";

        banner.style.background =
            "#bb3333";

        banner.style.color =
            "#ffffff";

        banner.classList.remove("hidden");
        banner.classList.add("visible");

        hideTimeout = setTimeout(
            function() {

                banner.classList
                    .remove("visible");

                banner.classList
                    .add("hidden");

                // Reset color back
                // for next streak banner
                setTimeout(function() {

                    banner.style.background
                        = "";

                    banner.style.color
                        = "";

                }, 400);

            },
            2000
        );
    }

    return { show };

})();

window.StreakLostBanner = StreakLostBanner;

// ===== SECTION 5 =====
// PUZZLE RESULT OVERLAY
// =====================================

const PuzzleResultUI = (() => {

    function show(options) {

        // options: {
        //   flawless, time, mistakes,
        //   onNext
        // }

        const badge =
            document.getElementById(
                "puzzleResultBadge"
            );

        const title =
            document.getElementById(
                "puzzleResultTitle"
            );

        const timeEl =
            document.getElementById(
                "puzzleResultTime"
            );

        const mistakesEl =
            document.getElementById(
                "puzzleResultMistakes"
            );

        const nextBtn =
            document.getElementById(
                "nextPuzzleBtn"
            );

        if (badge) {
            badge.textContent =
                options.flawless
                    ? "✨"
                    : "✅";
        }

        if (title) {
            title.textContent =
                options.flawless
                    ? "Flawless!"
                    : "Puzzle Solved";
        }

        if (timeEl) {
            timeEl.textContent =
                "Time: " +
                HUDManager.formatTime(
                    options.time
                );
        }

        if (mistakesEl) {
            mistakesEl.textContent =
                "Mistakes: " +
                options.mistakes;
        }

        if (nextBtn) {

            // Remove old listener
            const newBtn =
                nextBtn.cloneNode(true);

            nextBtn.parentNode
                .replaceChild(
                    newBtn,
                    nextBtn
                );

            newBtn.addEventListener(
                "click",
                function() {

                    ScreenManager
                        .hideOverlay(
                            "puzzleResultScreen"
                        );

                    if (
                        typeof options.onNext
                        === "function"
                    ) {
                        options.onNext();
                    }
                }
            );
        }

        ScreenManager.showOverlay(
            "puzzleResultScreen"
        );
    }

    function hide() {

        ScreenManager.hideOverlay(
            "puzzleResultScreen"
        );
    }

    return { show, hide };

})();

window.PuzzleResultUI = PuzzleResultUI;

// ===== SECTION 6 =====
// CAMPAIGN RESULT SCREEN
// =====================================

const CampaignResultUI = (() => {

    function show(summary, newAchievements) {

        // summary: {
        //   solved, puzzleCount,
        //   mistakes, totalTime,
        //   bestStreak, reward
        // }

        const badge =
            document.getElementById(
                "campaignBadge"
            );

        const crSolved =
            document.getElementById(
                "crSolved"
            );

        const crMistakes =
            document.getElementById(
                "crMistakes"
            );

        const crTime =
            document.getElementById(
                "crTime"
            );

        const crStreak =
            document.getElementById(
                "crStreak"
            );

        if (badge) {

            if (summary.reward === "crown") {
                badge.textContent = "👑";
            } else if (
                summary.reward === "star"
            ) {
                badge.textContent = "⭐";
            } else {
                badge.textContent = "🏁";
            }
        }

        if (crSolved) {
            crSolved.textContent =
                summary.solved +
                " / " +
                summary.puzzleCount;
        }

        if (crMistakes) {
            crMistakes.textContent =
                summary.mistakes;
        }

        if (crTime) {
            crTime.textContent =
                HUDManager.formatTime(
                    summary.totalTime
                );
        }

        if (crStreak) {
            crStreak.textContent =
                summary.bestStreak;
        }

        AchievementManager
            .renderNewlyUnlocked(
                "crAchievements",
                newAchievements
            );

        ScreenManager.showScreen(
            "campaignResultScreen"
        );
    }

    return { show };

})();

window.CampaignResultUI = CampaignResultUI;

// ===== SECTION 7 =====
// MARATHON OVER SCREEN
// =====================================

const MarathonOverUI = (() => {

    function show(summary, newAchievements) {

        // summary: {
        //   solved, mistakes,
        //   bestStreak, personalBest,
        //   isNewBest
        // }

        const badge =
            document.getElementById(
                "marathonBadge"
            );

        const mrSolved =
            document.getElementById(
                "mrSolved"
            );

        const mrMistakes =
            document.getElementById(
                "mrMistakes"
            );

        const mrStreak =
            document.getElementById(
                "mrStreak"
            );

        const mrBest =
            document.getElementById(
                "mrBest"
            );

        if (badge) {
            badge.textContent =
                summary.isNewBest
                    ? "🏆"
                    : "🏁";
        }

        if (mrSolved) {
            mrSolved.textContent =
                summary.solved;
        }

        if (mrMistakes) {
            mrMistakes.textContent =
                summary.mistakes;
        }

        if (mrStreak) {
            mrStreak.textContent =
                summary.bestStreak;
        }

        if (mrBest) {
            mrBest.textContent =
                summary.personalBest +
                " puzzles" +
                (
                    summary.isNewBest
                        ? " 🆕"
                        : ""
                );
        }

        AchievementManager
            .renderNewlyUnlocked(
                "mrAchievements",
                newAchievements
            );

        ScreenManager.showScreen(
            "marathonOverScreen"
        );
    }

    return { show };

})();

window.MarathonOverUI = MarathonOverUI;

// ===== SECTION 8 =====
// MENU UI
// =====================================

const MenuUI = (() => {

    function updateStats() {

        const stats =
            StorageManager.getStats();

        const menuStars =
            document.getElementById(
                "menuStars"
            );

        const menuCrowns =
            document.getElementById(
                "menuCrowns"
            );

        const menuPuzzles =
            document.getElementById(
                "menuPuzzles"
            );

        if (menuStars) {
            menuStars.textContent =
                stats.totalStars;
        }

        if (menuCrowns) {
            menuCrowns.textContent =
                stats.totalCrowns;
        }

        if (menuPuzzles) {
            menuPuzzles.textContent =
                stats.totalPuzzlesSolved;
        }
    }

    return { updateStats };

})();

window.MenuUI = MenuUI;

// ===== SECTION 9 =====
// CAMPAIGN SETUP UI
// =====================================

const CampaignSetupUI = (() => {

    const gridHints = {
        4: "2 colors · 2 per row/col",
        6: "3 colors · 2 per row/col",
        8: "4 colors · 2 per row/col"
    };

    const difficultyHints = {
        easy:   "More clues provided",
        medium: "Moderate clues",
        hard:   "Few clues provided",
        expert: "Very few clues — good luck"
    };

    function init() {

        bindOptionGroup(
            "gridSizeOptions",
            function(val) {

                AudioSystem.playSfx(
                    "menu_select"
                );

                const hint =
                    document.getElementById(
                        "gridSizeHint"
                    );

                if (hint) {
                    hint.textContent =
                        gridHints[val] || "";
                }
            }
        );

        bindOptionGroup(
            "difficultyOptions",
            function(val) {

                AudioSystem.playSfx(
                    "menu_select"
                );

                const hint =
                    document.getElementById(
                        "difficultyHint"
                    );

                if (hint) {
                    hint.textContent =
                        difficultyHints[val]
                        || "";
                }
            }
        );

        bindOptionGroup(
            "puzzleCountOptions",
            function() {
                AudioSystem.playSfx(
                    "menu_select"
                );
            }
        );

        // Hover sounds on all option buttons
        document.querySelectorAll(
            "#campaignSetupScreen .option-btn"
        ).forEach(function(btn) {

            btn.addEventListener(
                "mouseenter",
                function() {
                    AudioSystem.playSfx(
                        "menu_hover"
                    );
                }
            );
        });

        // Start button sounds
        const startBtn =
            document.getElementById(
                "startCampaignBtn"
            );

        if (startBtn) {

            startBtn.addEventListener(
                "mouseenter",
                function() {
                    AudioSystem.playSfx(
                        "menu_hover"
                    );
                }
            );

            startBtn.addEventListener(
                "click",
                function() {
                    AudioSystem.playSfx(
                        "menu_select"
                    );
                }
            );
        }
    }

    function getSelections() {

        return {
            gridSize: Number(
                getSelected(
                    "gridSizeOptions"
                )
            ),
            difficulty:
                getSelected(
                    "difficultyOptions"
                ),
            puzzleCount: Number(
                getSelected(
                    "puzzleCountOptions"
                )
            )
        };
    }

    return { init, getSelections };

})();

window.CampaignSetupUI = CampaignSetupUI;

// ===== SECTION 10 =====
// MARATHON SETUP UI
// =====================================

const MarathonSetupUI = (() => {

    const difficultyHints = {
        easy:   "Starts with 4×4, escalates over time",
        medium: "Starts harder, escalates faster",
        hard:   "Expert-level from the start"
    };

    function init() {

        bindOptionGroup(
            "marathonDifficultyOptions",
            function(val) {

                AudioSystem.playSfx(
                    "menu_select"
                );

                const hint =
                    document.getElementById(
                        "marathonDifficultyHint"
                    );

                if (hint) {
                    hint.textContent =
                        difficultyHints[val]
                        || "";
                }

                updateBestDisplay(val);
            }
        );

        // Hover sounds
        document.querySelectorAll(
            "#marathonSetupScreen .option-btn"
        ).forEach(function(btn) {

            btn.addEventListener(
                "mouseenter",
                function() {
                    AudioSystem.playSfx(
                        "menu_hover"
                    );
                }
            );
        });

        // Start button sounds
        const startBtn =
            document.getElementById(
                "startMarathonBtn"
            );

        if (startBtn) {

            startBtn.addEventListener(
                "mouseenter",
                function() {
                    AudioSystem.playSfx(
                        "menu_hover"
                    );
                }
            );

            startBtn.addEventListener(
                "click",
                function() {
                    AudioSystem.playSfx(
                        "menu_select"
                    );
                }
            );
        }
    }

    function updateBestDisplay(difficulty) {
    const el = document.getElementById("marathonBestDisplay");
    if (el) {
        const best = StorageManager.getMarathonBest(difficulty);
        el.textContent = best + " puzzles";
    }
    const streakEl = document.getElementById("marathonBestStreakDisplay");
    if (streakEl) {
        const bestStreak = StorageManager.getMarathonBestStreak(difficulty);
        streakEl.textContent = bestStreak;
    }
}

    function getSelections() {

        return {
            difficulty:
                getSelected(
                    "marathonDifficultyOptions"
                )
        };
    }

    return { init, getSelections, updateBestDisplay };

})();

window.MarathonSetupUI = MarathonSetupUI;

// ===== SECTION 11 =====
// TUTORIAL UI
// =====================================

const TutorialUI = (() => {

    // ── Tutorial step definitions ──────

    const STEPS = [

        // STEP 0 — Welcome
        {
            id: "welcome",
            render() {
                return `
                <div class="tut-step tut-welcome">
                    <div class="tut-icon">🎨</div>
                    <h2 class="tut-title">Welcome to Chromogic</h2>
                    <p class="tut-body">
                        A color-logic puzzle where every row and column
                        must be perfectly balanced. Let's walk through
                        the rules together.
                    </p>
                    <p class="tut-sub">Use the arrows below to move between steps.</p>
                </div>`;
            }
        },

        // STEP 1 — The Grid
        {
            id: "grid",
            render() {
                return `
                <div class="tut-step">
                    <h2 class="tut-title">The Grid</h2>
                    <p class="tut-body">
                        The board is a square grid — 4×4, 6×6, or 8×8.
                        Larger grids use more colors.
                    </p>
                    <div class="tut-grid-sizes">
                        <div class="tut-grid-card">
                            <div class="tut-mini-grid tut-grid-4"></div>
                            <span>4×4 · 2 colors</span>
                        </div>
                        <div class="tut-grid-card">
                            <div class="tut-mini-grid tut-grid-6"></div>
                            <span>6×6 · 3 colors</span>
                        </div>
                        <div class="tut-grid-card">
                            <div class="tut-mini-grid tut-grid-8"></div>
                            <span>8×8 · 4 colors</span>
                        </div>
                    </div>
                    <p class="tut-rule-box">
                        <strong>Core rule:</strong> every row and every column
                        must contain exactly <strong>2 of each color</strong>.
                    </p>
                </div>`;
            },
            afterRender() {
                buildMiniGrids();
            }
        },

        // STEP 2 — Clue Cells
        {
            id: "clues",
            render() {
                return `
                <div class="tut-step">
                    <h2 class="tut-title">Clue Cells</h2>
                    <p class="tut-body">
                        Some cells are pre-filled. They show a color
                        <em>and</em> a number.
                    </p>
                    <div class="tut-clue-demo" id="tutClueDemo"></div>
                    <p class="tut-body">
                        The number tells you how many of that cell's
                        <strong>orthogonal neighbors</strong>
                        (up, down, left, right) share its color
                        in the final solution.
                    </p>
                    <p class="tut-rule-box">
                        A clue of <strong>0</strong> means none of its
                        neighbors match.<br>
                        A clue of <strong>2</strong> means two of its
                        neighbors match.
                    </p>
                </div>`;
            },
            afterRender() {
                buildClueDemo();
            }
        },

        // STEP 3 — Filling Cells (interactive)
        {
            id: "filling",
            render() {
                return `
                <div class="tut-step">
                    <h2 class="tut-title">Filling Cells</h2>
                    <p class="tut-body">
                        Click any <strong>empty cell</strong> to cycle
                        through the available colors. Click again to
                        cycle to the next color, or back to empty.
                    </p>
                    <div class="tut-interact-wrap">
                        <p class="tut-interact-label">Try it — click the empty cells below:</p>
                        <div class="tut-interactive-grid" id="tutInteractGrid"></div>
                    </div>
                    <p class="tut-sub">
                        Clue cells (outlined) cannot be changed.
                    </p>
                </div>`;
            },
            afterRender() {
                buildInteractiveGrid();
            }
        },

        // STEP 4 — Checking
        {
            id: "checking",
            render() {
                return `
                <div class="tut-step">
                    <h2 class="tut-title">Checking Your Answer</h2>
                    <p class="tut-body">
                        When you think you've solved the puzzle, press
                        <strong>Check</strong>.
                    </p>
                    <div class="tut-check-demo">
                        <div class="tut-check-item">
                            <span class="tut-cell-preview correct">✓</span>
                            <span>Correct cells stay as they are.</span>
                        </div>
                        <div class="tut-check-item">
                            <span class="tut-cell-preview wrong-preview">✗</span>
                            <span>Wrong cells flash red and count as
                            <strong>one mistake each</strong>.</span>
                        </div>
                    </div>
                    <p class="tut-rule-box">
                        Mistakes affect your score. Solve with
                        <strong>zero mistakes</strong> for a
                        ✨ Flawless result and to build your streak.
                    </p>
                    <p class="tut-sub">
                        You can also <strong>Skip</strong> a puzzle —
                        but it breaks your streak.
                    </p>
                </div>`;
            }
        },

        // STEP 5 — Streaks
        {
            id: "streaks",
            render() {
                return `
                <div class="tut-step">
                    <h2 class="tut-title">Streaks & Rewards</h2>
                    <p class="tut-body">
                        Solve puzzles <strong>flawlessly</strong>
                        (zero mistakes) to build a streak 🔥.
                    </p>
                    <div class="tut-streak-demo">
                        <div class="tut-streak-row">
                            <span class="tut-streak-badge">🔥 3</span>
                            <span>Streak milestone — music intensifies</span>
                        </div>
                        <div class="tut-streak-row">
                            <span class="tut-streak-badge">🔥 5</span>
                            <span>Streak milestone — banner appears</span>
                        </div>
                        <div class="tut-streak-row">
                            <span class="tut-streak-badge">🔥 10+</span>
                            <span>Streak milestones — achievements unlock</span>
                        </div>
                    </div>
                    <div class="tut-rewards">
                        <div class="tut-reward-item">
                            <span class="tut-reward-icon">⭐</span>
                            <span>Complete a campaign</span>
                        </div>
                        <div class="tut-reward-item">
                            <span class="tut-reward-icon">👑</span>
                            <span>Complete with zero total mistakes</span>
                        </div>
                    </div>
                </div>`;
            }
        },

        // STEP 6 — Modes
        {
            id: "modes",
            render() {
                return `
                <div class="tut-step">
                    <h2 class="tut-title">Game Modes</h2>
                    <div class="tut-mode-card">
                        <div class="tut-mode-icon">🗺️</div>
                        <div>
                            <h3>Campaign</h3>
                            <p>Choose your grid size, difficulty, and
                            number of puzzles. A great way to improve
                            at your own pace.</p>
                        </div>
                    </div>
                    <div class="tut-mode-card">
                        <div class="tut-mode-icon">⏱️</div>
                        <div>
                            <h3>Marathon</h3>
                            <p>Race against a countdown timer. Solve a
                            puzzle to earn bonus time. Miss the clock
                            and it's game over. Grids get harder as
                            you go — how far can you make it?</p>
                        </div>
                    </div>
                </div>`;
            }
        },

        // STEP 7 — You're ready
        {
            id: "ready",
            render() {
                return `
                <div class="tut-step tut-ready">
                    <div class="tut-icon">🚀</div>
                    <h2 class="tut-title">You're Ready!</h2>
                    <p class="tut-body">
                        Start with a <strong>4×4 Easy Campaign</strong>
                        to get a feel for the puzzles, then work your
                        way up to Expert or Marathon.
                    </p>
                    <p class="tut-body">
                        You can revisit this tutorial any time from the
                        main menu under <strong>How to Play</strong>.
                    </p>
                    <p class="tut-sub">Good luck — and enjoy the colors! 🎨</p>
                </div>`;
            }
        }
    ];

    let currentStep = 0;
    let isFirstTime  = false;

    // ── Public: open from menu button ──

    function openFromMenu() {
        isFirstTime = false;
        _open(0);
    }

    // ── Public: auto-launch on first visit ──

    function maybeAutoLaunch() {
        if (!StorageManager.isTutorialSeen()) {
            isFirstTime = true;
            _open(0);
            return true;
        }
        return false;
    }

    // ── Internal open ──────────────────

    function _open(stepIndex) {
        currentStep = stepIndex;
        ScreenManager.showScreen("rulesScreen");
        _renderStep();
    }

    // ── Render current step ────────────

    function _renderStep() {

        const body = document.getElementById("tutorialBody");
        const progress = document.getElementById("tutorialProgress");
        const prevBtn  = document.getElementById("tutorialPrevBtn");
        const nextBtn  = document.getElementById("tutorialNextBtn");
        const doneBtn  = document.getElementById("tutorialDoneBtn");

        if (!body) return;

        const step = STEPS[currentStep];
        const total = STEPS.length;
        const isLast = currentStep === total - 1;

        // Render step HTML (with fade-in)
        body.innerHTML = step.render();
        body.classList.remove("tut-fade-in");
        void body.offsetWidth; // reflow
        body.classList.add("tut-fade-in");

        // Call post-render hook if any
        if (typeof step.afterRender === "function") {
            step.afterRender();
        }

        // Progress dots
        if (progress) {
            progress.innerHTML = "";
            for (let i = 0; i < total; i++) {
                const dot = document.createElement("span");
                dot.className = "tut-dot" + (i === currentStep ? " active" : "");
                dot.addEventListener("click", function() {
                    currentStep = i;
                    _renderStep();
                });
                progress.appendChild(dot);
            }
        }

        // Nav buttons
        if (prevBtn) prevBtn.disabled = currentStep === 0;
        if (nextBtn) nextBtn.classList.toggle("hidden", isLast);
        if (doneBtn) doneBtn.classList.toggle("hidden", !isLast);
    }

    // ── Mini grid builders (step 1) ────

    function buildMiniGrids() {

        const palette = [
            "var(--color-0)",
            "var(--color-1)",
            "var(--color-2)",
            "var(--color-3)"
        ];

        // 4×4 solved pattern (2 colors)
        const pat4 = [
            [0,1,0,1],
            [1,0,1,0],
            [0,1,0,1],
            [1,0,1,0]
        ];

        // 6×6 pattern (3 colors)
        const pat6 = [
            [0,1,2,0,1,2],
            [1,2,0,1,2,0],
            [2,0,1,2,0,1],
            [0,1,2,0,1,2],
            [1,2,0,1,2,0],
            [2,0,1,2,0,1]
        ];

        // 8×8 pattern (4 colors)
        const pat8 = [
            [0,1,2,3,0,1,2,3],
            [2,3,0,1,2,3,0,1],
            [1,0,3,2,1,0,3,2],
            [3,2,1,0,3,2,1,0],
            [0,1,2,3,0,1,2,3],
            [2,3,0,1,2,3,0,1],
            [1,0,3,2,1,0,3,2],
            [3,2,1,0,3,2,1,0]
        ];

        _fillMiniGrid("tut-grid-4", pat4, palette);
        _fillMiniGrid("tut-grid-6", pat6, palette);
        _fillMiniGrid("tut-grid-8", pat8, palette);
    }

    function _fillMiniGrid(cls, pattern, palette) {

        const el = document.querySelector("." + cls);
        if (!el) return;

        const n = pattern.length;
        el.style.gridTemplateColumns = "repeat(" + n + ", 1fr)";
        el.style.gridTemplateRows    = "repeat(" + n + ", 1fr)";
        el.innerHTML = "";

        pattern.forEach(function(row) {
            row.forEach(function(c) {
                const cell = document.createElement("div");
                cell.className = "tut-mini-cell";
                cell.style.background = palette[c];
                el.appendChild(cell);
            });
        });
    }

    // ── Clue demo (step 2) ─────────────

    function buildClueDemo() {

        const demo = document.getElementById("tutClueDemo");
        if (!demo) return;

        // 4×4 solved grid snippet — show only middle 2×4 rows
        // Focus: one clue cell with its neighbors annotated
        const grid = [
            [0, 1, 0, 1],
            [1, 0, 1, 0],
            [0, 1, 0, 1],
            [1, 0, 1, 0]
        ];

        // Clue at (1,1): color=0, its ortho neighbors in grid:
        //   up=(0,1)=1, down=(2,1)=1, left=(1,0)=1, right=(1,2)=1
        // So zero same-color neighbors → clue number = 0
        // Clue at (0,0): color=0, neighbors right=(0,1)=1, down=(1,0)=1 → 0 matches
        // Let's place a more illustrative clue: (1,0) color=1
        //   up=(0,0)=0 no, down=(2,0)=0 no, right=(1,1)=0 no → clue 0
        // Use (0,0) color=0, neighbors: right=1(no), down=1(no) → 0
        // Better: (2,2) color=0, neighbors: up=(1,2)=1(no), down=(3,2)=1(no),
        //         left=(2,1)=1(no), right=(2,3)=1(no) → 0  — boring
        // Let's use a hand-crafted 4×4 where one cell has 2 same-color neighbors
        // R0: A B A B
        // R1: A B A B   ← cell (1,0)=A, up=(0,0)=A ✓, down=(2,0)=A ✓, right=(1,1)=B ✗ → clue=2
        // R2: A B A B
        // R3: B A B A
        // But that violates the 2-per-row rule... let's just hand-code:
        const g = [
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [1, 0, 0, 1],
            [1, 0, 0, 1]
        ];
        // Cell (0,0)=0: right=(0,1)=1 no, down=(1,0)=0 yes → clue=1
        // Cell (1,1)=1: up=(0,1)=1 yes, down=(2,1)=0 no, left=(1,0)=0 no, right=(1,2)=1 yes → clue=2
        // Cell (2,3)=1: up=(1,3)=0 no, down=(3,3)=1 yes, left=(2,2)=0 no → clue=1

        const clues = [
            { row: 0, col: 0, number: 1 },
            { row: 1, col: 1, number: 2 },
            { row: 2, col: 3, number: 1 }
        ];

        demo.style.gridTemplateColumns = "repeat(4, 48px)";
        demo.style.gridTemplateRows    = "repeat(4, 48px)";
        demo.innerHTML = "";

        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                const cell = document.createElement("div");
                cell.className = "tut-demo-cell";
                const clue = clues.find(function(cl) {
                    return cl.row === r && cl.col === c;
                });
                if (clue) {
                    cell.classList.add("tut-clue-cell", "color-" + g[r][c]);
                    cell.textContent = clue.number;

                    // Build tooltip
                    const tip = document.createElement("div");
                    tip.className = "tut-clue-tip";
                    tip.textContent = clue.number +
                        " neighbor" + (clue.number !== 1 ? "s" : "") +
                        " match";
                    cell.appendChild(tip);
                } else {
                    cell.classList.add("color-" + g[r][c]);
                    cell.style.opacity = "0.45";
                }
                demo.appendChild(cell);
            }
        }
    }

    // ── Interactive grid (step 3) ──────

    const INTERACT_COLORS = 2; // 2-color demo

    function buildInteractiveGrid() {

        const wrap = document.getElementById("tutInteractGrid");
        if (!wrap) return;

        // 4×4 with 3 clue cells, rest empty
        const clueData = [
            { row: 0, col: 0, color: 0, number: 1 },
            { row: 1, col: 3, color: 1, number: 0 },
            { row: 3, col: 1, color: 0, number: 2 }
        ];

        const playerBoard = [];
        for (let r = 0; r < 4; r++) {
            playerBoard.push([null, null, null, null]);
        }

        wrap.style.gridTemplateColumns = "repeat(4, 52px)";
        wrap.style.gridTemplateRows    = "repeat(4, 52px)";
        wrap.innerHTML = "";

        function renderBoard() {
            wrap.innerHTML = "";
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    const cell = document.createElement("div");
                    cell.className = "tut-interact-cell";

                    const clue = clueData.find(function(cl) {
                        return cl.row === r && cl.col === c;
                    });

                    if (clue) {
                        cell.classList.add("tut-clue-cell", "color-" + clue.color);
                        cell.textContent = clue.number;
                    } else {
                        const val = playerBoard[r][c];
                        if (val !== null) {
                            cell.classList.add("color-" + val);
                        }
                        cell.addEventListener("click", function() {
                            const cur = playerBoard[r][c];
                            if (cur === null) {
                                playerBoard[r][c] = 0;
                            } else if (cur < INTERACT_COLORS - 1) {
                                playerBoard[r][c] = cur + 1;
                            } else {
                                playerBoard[r][c] = null;
                            }
                            renderBoard();
                        });
                    }

                    wrap.appendChild(cell);
                }
            }
        }

        renderBoard();
    }

    // ── Bind nav buttons ───────────────

    function bindEvents() {

        function bind(id, fn) {
            const el = document.getElementById(id);
            if (el) el.addEventListener("click", fn);
        }

        bind("tutorialPrevBtn", function() {
            if (currentStep > 0) {
                currentStep--;
                _renderStep();
            }
        });

        bind("tutorialNextBtn", function() {
            if (currentStep < STEPS.length - 1) {
                currentStep++;
                _renderStep();
            }
        });

        bind("tutorialDoneBtn", function() {
            StorageManager.markTutorialSeen();
            ScreenManager.showScreen("menuScreen");
        });

        bind("tutorialBackBtn", function() {
            StorageManager.markTutorialSeen();
            ScreenManager.showScreen("menuScreen");
        });
    }

    return {
        openFromMenu,
        maybeAutoLaunch,
        bindEvents
    };

})();

window.TutorialUI = TutorialUI;

// kept for backward compat (no longer used but safe to leave)
function buildRulesDemo() {}


// ===== SECTION 12 =====
// SHARED OPTION GROUP HELPER
// =====================================

function bindOptionGroup(
    containerId,
    onChange
) {

    const container =
        document.getElementById(
            containerId
        );

    if (!container) {
        return;
    }

    const buttons =
        container.querySelectorAll(
            ".option-btn"
        );

    buttons.forEach(function(btn) {

        btn.addEventListener(
            "click",
            function() {

                buttons.forEach(
                    function(b) {
                        b.classList.remove(
                            "active"
                        );
                    }
                );

                btn.classList.add("active");

                if (
                    typeof onChange ===
                    "function"
                ) {
                    onChange(btn.dataset.value);
                }
            }
        );
    });
}

function getSelected(containerId) {

    const container =
        document.getElementById(
            containerId
        );

    if (!container) {
        return null;
    }

    const active =
        container.querySelector(
            ".option-btn.active"
        );

    if (!active) {
        return null;
    }

    return active.dataset.value;
}

// ===== SECTION 13 =====
// MAIN MENU NAV BINDINGS
// =====================================

function bindMenuNav() {
document.querySelectorAll(
    ".nav-btn"
).forEach(function(btn) {

    btn.addEventListener(
        "mouseenter",
        function() {
            AudioSystem.playSfx(
                "menu_hover"
            );
        }
    );

    btn.addEventListener(
        "click",
        function() {
            AudioSystem.playSfx(
                "menu_select"
            );
        }
    );
});


    function bind(id, fn) {

        const el =
            document.getElementById(id);

        if (el) {
            el.addEventListener(
                "click", fn
            );
        }
    }

    bind("btnCampaign", function() {

        ScreenManager.showScreen(
            "campaignSetupScreen"
        );
    });

    bind("btnMarathon", function() {

        MarathonSetupUI
            .updateBestDisplay(
                getSelected(
                    "marathonDifficultyOptions"
                ) || "easy"
            );

        ScreenManager.showScreen(
            "marathonSetupScreen"
        );
    });

    bind("btnAchievements", function() {

        AchievementManager.renderScreen();

        ScreenManager.showScreen(
            "achievementsScreen"
        );
    });

    bind("btnRules", function() {

        TutorialUI.openFromMenu();
    });

    bind("btnSettings", function() {

        SettingsManager.open(false);
    });

    bind("btnAbout", function() {
        AchievementManager.tryUnlock(
        "read_about"
    );
        ScreenManager.showScreen(
            "aboutScreen"
        );

        AudioSystem.playSimpleMusic("about");
    });

    // Back buttons
    bind("campaignBackBtn", function() {
        ScreenManager.showScreen(
            "menuScreen"
        );
    });

    bind("marathonBackBtn", function() {
        ScreenManager.showScreen(
            "menuScreen"
        );
    });

    bind("achievementsBackBtn", function() {
        ScreenManager.showScreen(
            "menuScreen"
        );
    });

    bind("aboutBackBtn", function() {
        ScreenManager.showScreen(
            "menuScreen"
        );

        AudioSystem.playSimpleMusic("menu")
    });

    // Start buttons
    bind("startCampaignBtn", function() {

        const sel =
            CampaignSetupUI.getSelections();

        CampaignManager.start(
            sel.gridSize,
            sel.difficulty,
            sel.puzzleCount
        );
    });

    bind("startMarathonBtn", function() {

        const sel =
            MarathonSetupUI.getSelections();

        MarathonManager.start(
            sel.difficulty
        );
    });

    // Result screen buttons
    bind("crMenuBtn", function() {

        ScreenManager.showScreen(
            "menuScreen"
        );

        MenuUI.updateStats();

        AudioSystem.playMusic(
            "music_menu"
        );
    });

    bind("playAgainBtn", function() {

        const sel =
            CampaignSetupUI.getSelections();

        CampaignManager.start(
            sel.gridSize,
            sel.difficulty,
            sel.puzzleCount
        );
    });

    bind("mrMenuBtn", function() {

        ScreenManager.showScreen(
            "menuScreen"
        );

        MenuUI.updateStats();

        AudioSystem.playMusic(
            "music_menu"
        );
    });

    bind("mrPlayAgainBtn", function() {

        const sel =
            MarathonSetupUI.getSelections();

        MarathonManager.start(
            sel.difficulty
        );
    });

    // Pause screen
    bind("pauseBtn", function() {

        GameCore.pause();
    });

    bind("resumeBtn", function() {

        GameCore.resume();
    });

    bind("quitBtn", function() {

        GameCore.quit();
    });

    bind("pauseSettingsBtn", function() {

        SettingsManager.open(true);
    });
}


// ===== SECTION 15 =====
// MENU BACKGROUND BUILDER
// =====================================

function buildMenuBackground() {

    const canvas =
        document.getElementById(
            "bgCanvas"
        );

    if (!canvas) {
        return;
    }

    canvas.innerHTML = "";

    const colors = [
        "#D64545",
        "#3487FF",
        "#EECC55",
        "#3DBB60",
        "#0044BB",
        "#66CCFF",
        "#EECC55",
        "#EE4422"
    ];

    const numbers = ["0", "1", "2"];

    const totalCircles = 18;
    const totalNumbers = 24;

    // Create glowing circles
    for (
        let i = 0;
        i < totalCircles;
        i++
    ) {

        const el =
            document.createElement("div");

        const color =
            colors[i % colors.length];

        const size =
            randomBetween(60, 180);

        const startX =
            randomBetween(
                -10,
                window.innerWidth + 10
            );

        const startY =
            randomBetween(
                -10,
                window.innerHeight + 10
            );

        const dx =
            randomBetween(-300, 300);

        const dy =
            randomBetween(-400, -100);

        const duration =
            randomBetween(8, 20);

        const delay =
            randomBetween(-20, 0);

        const scale =
            randomBetween(0.8, 1.4);

        el.style.cssText = [
            "position: absolute",
            "border-radius: 50%",
            "width: " + size + "px",
            "height: " + size + "px",
            "background: " + color,
            "left: " + startX + "px",
            "top: " + startY + "px",
            "filter: blur(32px)",
            "opacity: 0",
            "--dx: " + dx + "px",
            "--dy: " + dy + "px",
            "--rot: " + randomBetween(-180, 180) + "deg",
            "--sc: " + scale,
            "animation: floatParticle " +
                duration +
                "s ease-in-out " +
                delay +
                "s infinite"
        ].join(";");

        canvas.appendChild(el);
    }

    // Create floating numbers
    for (
        let i = 0;
        i < totalNumbers;
        i++
    ) {

        const el =
            document.createElement("div");

        const number =
            numbers[
                Math.floor(
                    Math.random() *
                    numbers.length
                )
            ];

        const color =
            colors[
                Math.floor(
                    Math.random() *
                    colors.length
                )
            ];

        const size =
            randomBetween(24, 72);

        const startX =
            randomBetween(
                0,
                window.innerWidth
            );

        const startY =
            randomBetween(
                0,
                window.innerHeight
            );

        const dx =
            randomBetween(-200, 200);

        const dy =
            randomBetween(-300, -80);

        const duration =
            randomBetween(6, 16);

        const delay =
            randomBetween(-16, 0);

        const rot =
            randomBetween(-360, 360);

        const scale =
            randomBetween(0.7, 1.3);

        el.style.cssText = [
            "position: absolute",
            "font-family: var(--font-main)",
            "font-size: " + size + "px",
            "color: " + color,
            "left: " + startX + "px",
            "top: " + startY + "px",
            "opacity: 0",
            "text-shadow: 0 0 20px " + color,
            "user-select: none",
            "--dx: " + dx + "px",
            "--dy: " + dy + "px",
            "--rot: " + rot + "deg",
            "--sc: " + scale,
            "animation: floatParticle " +
                duration +
                "s ease-in-out " +
                delay +
                "s infinite"
        ].join(";");

        el.textContent = number;

        canvas.appendChild(el);
    }
}

function buildCampaignBackground() {

    const canvas =
        document.getElementById(
            "bgCanvas"
        );

    if (!canvas) {
        return;
    }

    canvas.innerHTML = "";

    const colors = [
        "#D64545",
        "#3487FF",
        "#EECC55",
        "#3DBB60",
        "#0044BB",
        "#66CCFF",
        "#EECC55",
        "#EE4422"
    ];

    const total = 20;

    for (
        let i = 0;
        i < total;
        i++
    ) {

        const el =
            document.createElement(
                "div"
            );

        const color =
            colors[
                Math.floor(
                    Math.random() *
                    colors.length
                )
            ];

        const size =
            randomBetween(40, 120);

        const startX =
            randomBetween(
                0,
                window.innerWidth
            );

        const duration =
            randomBetween(4, 12);

        const delay =
            randomBetween(-12, 0);

        el.style.cssText = [
            "position: absolute",
            "border-radius: 50%",
            "width: " + size + "px",
            "height: " + size + "px",
            "background: " + color,
            "left: " + startX + "px",
            "bottom: -" + size + "px",
            "filter: blur(24px)",
            "opacity: 0",
            "--dx: " + randomBetween(-80, 80) + "px",
            "--dy: -" + (window.innerHeight + size + 100) + "px",
            "--rot: " + randomBetween(-180, 180) + "deg",
            "--sc: " + randomBetween(0.8, 1.4),
            "animation: floatParticle " +
                duration +
                "s ease-in " +
                delay +
                "s infinite"
        ].join(";");

        canvas.appendChild(el);
    }
}

function buildMarathonBackground() {

    const canvas =
        document.getElementById(
            "bgCanvas"
        );

    if (!canvas) {
        return;
    }

    canvas.innerHTML = "";

    const colors = [
        "#D64545",
        "#3487FF",
        "#EECC55",
        "#3DBB60",
        "#0044BB",
        "#66CCFF",
        "#EECC55",
        "#EE4422"
    ];

    const numbers = ["0", "1", "2"];

    const W = window.innerWidth;
    const H = window.innerHeight;

    const totalChains = 12;
    const chainLength = 14;
    const spacing = 32;

    const chains = [];

    for (
        let c = 0;
        c < totalChains;
        c++
    ) {

        const color =
            colors[c % colors.length];

        const size =
            randomBetween(16, 38);

        // Each chain gets a random
        // starting angle so they scatter
        const angle =
            Math.random() * Math.PI * 2;

        const spd =
            randomBetween(2.5, 5.5);

        const speedX =
            Math.cos(angle) * spd;

        const speedY =
            Math.sin(angle) * spd;

        const startX =
            randomBetween(100, W - 100);

        const startY =
            randomBetween(100, H - 100);

        const chain = {
            color:   color,
            size:    size,
            speedX:  speedX,
            speedY:  speedY,
            history: [],
            els:     []
        };

        // Seed full history
        for (
            let h = 0;
            h < chainLength * spacing + 10;
            h++
        ) {
            chain.history.push({
                x: startX,
                y: startY
            });
        }

        // Build DOM elements for chain
        for (
            let n = 0;
            n < chainLength;
            n++
        ) {

            const el =
                document.createElement(
                    "div"
                );

            const number =
                numbers[
                    n % numbers.length
                ];

            const fade =
                Math.max(
                    0.15,
                    1 - n * 0.06
                );

            el.style.cssText = [
                "position: absolute",
                "font-family: var(--font-main)",
                "font-size: " + size + "px",
                "color: " + color,
                "opacity: " + fade,
                "text-shadow: 0 0 18px " +
                    color +
                    ", 0 0 6px " +
                    color,
                "user-select: none",
                "pointer-events: none",
                "left: " + startX + "px",
                "top:  " + startY + "px"
            ].join(";");

            el.textContent = number;

            canvas.appendChild(el);

            chain.els.push(el);
        }

        chains.push(chain);
    }

    // Also scatter loose numbers
    // that just bounce solo
    const loners = [];
    const totalLoners = 30;

    for (
        let i = 0;
        i < totalLoners;
        i++
    ) {

        const el =
            document.createElement(
                "div"
            );

        const color =
            colors[
                Math.floor(
                    Math.random() *
                    colors.length
                )
            ];

        const number =
            numbers[
                Math.floor(
                    Math.random() *
                    numbers.length
                )
            ];

        const size =
            randomBetween(12, 52);

        const angle =
            Math.random() * Math.PI * 2;

        const spd =
            randomBetween(1.5, 4.5);

        const loner = {
            el:     el,
            x:      randomBetween(0, W),
            y:      randomBetween(0, H),
            speedX: Math.cos(angle) * spd,
            speedY: Math.sin(angle) * spd
        };

        el.style.cssText = [
            "position: absolute",
            "font-family: var(--font-main)",
            "font-size: " + size + "px",
            "color: " + color,
            "opacity: " +
                randomBetween(0.4, 0.9),
            "text-shadow: 0 0 12px " +
                color,
            "user-select: none",
            "pointer-events: none"
        ].join(";");

        el.textContent = number;

        canvas.appendChild(el);

        loners.push(loner);
    }

    let animFrameId = null;

    function tickMarathon() {

        // Tick chains
        chains.forEach(function(chain) {

            const head =
                chain.history[
                    chain.history.length - 1
                ];

            let nx =
                head.x + chain.speedX;

            let ny =
                head.y + chain.speedY;

            // Bounce with slight
            // angle randomization
            if (nx <= 0 || nx >= W) {

                chain.speedX *= -1;

                // Add slight chaos
                // on bounce
                chain.speedY +=
                    randomBetween(
                        -0.5,
                        0.5
                    );

                nx =
                    head.x + chain.speedX;
            }

            if (ny <= 0 || ny >= H) {

                chain.speedY *= -1;

                chain.speedX +=
                    randomBetween(
                        -0.5,
                        0.5
                    );

                ny =
                    head.y + chain.speedY;
            }

            // Cap speed so it
            // doesn't go too fast
            chain.speedX =
                Math.max(
                    -6,
                    Math.min(6, chain.speedX)
                );

            chain.speedY =
                Math.max(
                    -6,
                    Math.min(6, chain.speedY)
                );

            chain.history.push({
                x: nx,
                y: ny
            });

            if (
                chain.history.length >
                chainLength * spacing + 20
            ) {
                chain.history.shift();
            }

            chain.els.forEach(
                function(el, i) {

                    const idx =
                        chain.history.length -
                        1 -
                        i * spacing;

                    if (idx >= 0) {

                        const pos =
                            chain.history[idx];

                        el.style.left =
                            pos.x + "px";

                        el.style.top =
                            pos.y + "px";
                    }
                }
            );
        });

        // Tick loners
        loners.forEach(function(l) {

            l.x += l.speedX;
            l.y += l.speedY;

            if (l.x <= 0 || l.x >= W) {

                l.speedX *= -1;

                l.speedY +=
                    randomBetween(-0.3, 0.3);

                l.x += l.speedX;
            }

            if (l.y <= 0 || l.y >= H) {

                l.speedY *= -1;

                l.speedX +=
                    randomBetween(-0.3, 0.3);

                l.y += l.speedY;
            }

            l.speedX =
                Math.max(
                    -5,
                    Math.min(5, l.speedX)
                );

            l.speedY =
                Math.max(
                    -5,
                    Math.min(5, l.speedY)
                );

            if (l.el) {
                l.el.style.left =
                    l.x + "px";
                l.el.style.top =
                    l.y + "px";
            }
        });

        animFrameId =
            requestAnimationFrame(
                tickMarathon
            );
    }

    tickMarathon();

    canvas._stopMarathon =
        function() {

            if (animFrameId) {
                cancelAnimationFrame(
                    animFrameId
                );
                animFrameId = null;
            }
        };
}

function buildAboutBackground() {

    const canvas =
        document.getElementById(
            "bgCanvas"
        );

    if (!canvas) {
        return;
    }

    if (
        typeof canvas._stopAbout ===
        "function"
    ) {
        canvas._stopAbout();
    }

    canvas.innerHTML = "";

    const colors = [
        "#D64545",
        "#3487FF",
        "#EECC55",
        "#3DBB60",
        "#0044BB",
        "#66CCFF",
        "#EECC55",
        "#EE4422",
        "#D64545",
        "#3DBB60",
        "#3487FF",
        "#EE4422"
    ];

    const numbers = [
        "0", "1", "2",
        "0", "1", "2",
        "0", "1", "2",
        "0", "1", "2"
    ];

    const cx = window.innerWidth  * 0.5;
    const cy = window.innerHeight * 0.5;

    const orbiters = [];

    // Multiple orbit rings
    const rings = [
        {
            count:  8,
            radius: 200,
            speed:  0.006,
            type:   "color"
        },
        {
            count:  10,
            radius: 300,
            speed:  -0.004,
            type:   "number"
        },
        {
            count:  12,
            radius: 400,
            speed:  0.003,
            type:   "color"
        },
        {
            count:  8,
            radius: 500,
            speed:  -0.002,
            type:   "number"
        }
    ];

    rings.forEach(function(ring) {

        for (
            let i = 0;
            i < ring.count;
            i++
        ) {

            const el =
                document.createElement(
                    "div"
                );

            const angle =
                (i / ring.count) *
                Math.PI * 2;

            const color =
                colors[
                    (i + ring.count) %
                    colors.length
                ];

            const speedVariance =
                ring.speed *
                randomBetween(0.8, 1.2);

            const radiusVariance =
                ring.radius +
                randomBetween(-20, 20);

            if (ring.type === "color") {

                const size =
                    randomBetween(30, 80);

                el.style.cssText = [
                    "position: absolute",
                    "border-radius: 50%",
                    "width: " + size + "px",
                    "height: " + size + "px",
                    "background: " + color,
                    "filter: blur(12px)",
                    "opacity: 0.55",
                    "pointer-events: none",
                    "transform: translate(-50%,-50%)"
                ].join(";");

            } else {

                const number =
                    numbers[
                        i % numbers.length
                    ];

                const size =
                    randomBetween(16, 40);

                el.style.cssText = [
                    "position: absolute",
                    "font-family: var(--font-main)",
                    "font-size: " + size + "px",
                    "color: " + color,
                    "opacity: 0.75",
                    "text-shadow: 0 0 16px " +
                        color,
                    "user-select: none",
                    "pointer-events: none",
                    "transform: translate(-50%,-50%)"
                ].join(";");

                el.textContent = number;
            }

            canvas.appendChild(el);

            orbiters.push({
                el:     el,
                angle:  angle,
                speed:  speedVariance,
                radius: radiusVariance,
                cx:     cx,
                cy:     cy
            });
        }
    });

    let animFrameId = null;

    function tickAbout() {

        orbiters.forEach(function(o) {

            o.angle += o.speed;

            const x =
                o.cx +
                Math.cos(o.angle) *
                o.radius;

            const y =
                o.cy +
                Math.sin(o.angle) *
                o.radius;

            if (o.el) {
                o.el.style.left = x + "px";
                o.el.style.top  = y + "px";
            }
        });

        animFrameId =
            requestAnimationFrame(
                tickAbout
            );
    }

    tickAbout();

    canvas._stopAbout = function() {

        if (animFrameId) {
            cancelAnimationFrame(
                animFrameId
            );
            animFrameId = null;
        }
    };
}

function randomBetween(min, max) {

    return Math.random() *
        (max - min) + min;
}


// ===== SECTION 14 =====
// INIT
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        StorageManager.load();
        if (
            StorageManager
                .getSave()
                .pendingGamer
        ) {
            AchievementManager
                .tryUnlock("gamer");
        }

        SettingsManager.load(
            StorageManager.getSettings()
        );

        SettingsManager.bindEvents();

        TutorialUI.bindEvents();

        CampaignSetupUI.init();

        MarathonSetupUI.init();

        bindMenuNav();

        MenuUI.updateStats();


        buildMenuBackground();

        const splash =
            document.getElementById(
                "splashScreen"
            );

        if (splash) {

            splash.addEventListener(
                "click",
                function() {

                    // Fade out splash
                    splash.classList.add(
                        "hiding"
                    );

                    setTimeout(
                        function() {

                            splash.classList
                                .remove("active");

                            splash.classList
                                .remove("hiding");

                            // Show tutorial on first visit,
                            // otherwise go straight to menu
                            if (!TutorialUI.maybeAutoLaunch()) {
                                ScreenManager
                                    .showScreen(
                                        "menuScreen"
                                    );
                            }

                            // Browser now
                            // allows audio
                            // after user click
                            AudioSystem
                                .playSimpleMusic(
                                    "menu"
                                );
                        },
                        800
                    );
                }
            );

        } else {

            // Fallback if no splash
            ScreenManager.showScreen(
                "menuScreen"
            );

            AudioSystem.playSimpleMusic(
                "menu"
            );
        }
    }
);