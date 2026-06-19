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
// RULES DEMO BUILDER
// =====================================

function buildRulesDemo() {

    const demo =
        document.getElementById(
            "rulesDemo"
        );

    if (!demo) {
        return;
    }

    // A small 4x4 solved example
    // 0=cobalt 1=sky 2=yellow 3=orange
    const example = [
        [0, 1, 2, 3],
        [2, 3, 0, 1],
        [1, 0, 3, 2],
        [3, 2, 1, 0]
    ];

    // Clue cells to reveal (row, col)
    const clues = [
        { row: 0, col: 0, number: 0 },
        { row: 0, col: 3, number: 0 },
        { row: 1, col: 1, number: 0 },
        { row: 2, col: 2, number: 0 },
        { row: 3, col: 0, number: 0 }
    ];

    demo.style.gridTemplateColumns =
        "repeat(4, 52px)";
    demo.style.gridTemplateRows =
        "repeat(4, 52px)";

    demo.innerHTML = "";

    for (let row = 0; row < 4; row++) {

        for (let col = 0; col < 4; col++) {

            const cell =
                document.createElement(
                    "div"
                );

            cell.className =
                "rules-demo-cell";

            const clue = clues.find(
                function(c) {
                    return c.row === row &&
                           c.col === col;
                }
            );

            if (clue) {

                cell.classList.add(
                    "color-" +
                    example[row][col]
                );

                cell.style.outline =
                    "2px solid var(--cell-clue-outline)";

                cell.style.outlineOffset =
                    "-2px";

                cell.textContent =
                    clue.number;

            } else {

                cell.style.background =
                    "var(--cell-empty)";
            }

            demo.appendChild(cell);
        }
    }
}

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

        buildRulesDemo();

        ScreenManager.showScreen(
            "rulesScreen"
        );
    });

    bind("btnSettings", function() {

        SettingsManager.syncUI();

        ScreenManager.showScreen(
            "settingsScreen"
        );
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

    bind("rulesBackBtn", function() {
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

        SettingsManager.syncUI();

        ScreenManager.showScreen(
            "settingsScreen"
        );
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

                            ScreenManager
                                .showScreen(
                                    "menuScreen"
                                );

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