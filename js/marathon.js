// =====================================
// CHROMOGIC
// marathon.js
// =====================================

// ===== SECTION 1 =====
// MARATHON STATE
// =====================================

const MarathonManager = (() => {

    let marathon = null;
    let countdownInterval = null;
    let countdownRemaining = 0;
    let countdownPaused = false;

    // ===== SECTION 2 =====
    // START MARATHON
    // =====================================

    function start(difficulty) {

        const config =
            MARATHON_CONFIG[difficulty];

        marathon = {
            difficulty:      difficulty,
            config:          config,
            currentIndex:    1,
            solved:          0,
            mistakes:        0,
            streak:          0,
            bestStreak:      0,
            sequencePos:     0,
            sequenceCount:   0,
            newAchievements: [],
            lowTimePinged:   false,

            // For "The DJ": tracks which
            // gridSize+mode combos have fired
            // in this run. Need all 3 grids
            // to have seen both soft+intense.
            djModes: {
                4: new Set(),
                6: new Set(),
                8: new Set()
            },

            // For "I'm Still Standing":
            // count puzzles solved while
            // timer was under 30s
            lowTimeSolves: 0,

            // For "Comeback Kid":
            // track whether streak hit 0 then 5
            hadStreakBreak: false,

            // For "Against The Clock":
            // checked per-puzzle solve
            againstClockDone: false
        };

        countdownRemaining =
            config.startTime;

        countdownPaused = false;

        AudioSystem.playPlaylist(
            "easy",
            "soft"
        );

        // Record this difficulty for
        // "Marathon Tourist" achievement
        StorageManager
            .recordMarathonDifficultyPlayed(
                difficulty
            );

        const played =
            StorageManager
                .getMarathonDifficultiesPlayed();

        if (
            played.includes("easy") &&
            played.includes("medium") &&
            played.includes("hard")
        ) {
            AchievementManager
                .tryUnlock("marathon_tourist");
        }

        marathon.lastGridSize = 4;

        // Record soft mode for grid 4
        // (DJ tracking)
        marathon.djModes[4].add("soft");
        GameCore.clearPuzzleLog();

        loadPuzzle();
    }

    // ===== SECTION 3 =====
    // RESOLVE CURRENT GRID CONFIG
    // Walks the sequence to find what
    // gridSize and difficulty to use
    // for the current puzzle index.
    // =====================================

    function resolveCurrentConfig() {

        const seq =
            marathon.config.sequence;

        let puzzlesSeen = 0;

        for (
            let i = 0;
            i < seq.length;
            i++
        ) {

            const step = seq[i];

            // count: -1 means infinite
            if (step.count === -1) {

                return {
                    gridSize:   step.gridSize,
                    difficulty: step.difficulty
                };
            }

            puzzlesSeen += step.count;

            if (
                marathon.currentIndex <=
                puzzlesSeen
            ) {

                return {
                    gridSize:   step.gridSize,
                    difficulty: step.difficulty
                };
            }
        }

        // Past all steps — use last step
        const last = seq[seq.length - 1];

        return {
            gridSize:   last.gridSize,
            difficulty: last.difficulty
        };
    }

    // ===== SECTION 4 =====
    // LOAD PUZZLE
    // =====================================

    function loadPuzzle() {

        const puzzleConfig =
            resolveCurrentConfig();
        
        // Switch music when grid size changes
        const previousConfig =
            marathon.lastGridSize !== undefined
                ? marathon.lastGridSize
                : null;

        if (
            previousConfig === null ||
            puzzleConfig.gridSize !==
            previousConfig
        ) {

            const musicDifficulty =
                puzzleConfig.gridSize === 4
                    ? "easy"
                    : puzzleConfig.gridSize === 6
                        ? "hard"
                        : "expert";

            const currentMode =
                marathon.streak >= 3
                    ? "intense"
                    : "soft";

            AudioSystem.playPlaylist(
                musicDifficulty,
                currentMode
            );

            // DJ tracking: record this
            // gridSize+mode combo
            if (marathon) {
                const gs =
                    puzzleConfig.gridSize;
                marathon.djModes[gs]
                    .add(currentMode);
            }

            // Add time when grid size increases
        if (
            previousConfig !== null &&
            puzzleConfig.gridSize >
            previousConfig
        ) {

            if (
                previousConfig === 4 &&
                puzzleConfig.gridSize === 6
            ) {

                countdownRemaining += 120;

                HUDManager.updateCountdown(
                    countdownRemaining
                );
            }

            if (
                previousConfig === 6 &&
                puzzleConfig.gridSize === 8
            ) {

                countdownRemaining += 240;

                HUDManager.updateCountdown(
                    countdownRemaining
                );
            }
        }

            marathon.lastGridSize =
                puzzleConfig.gridSize;
        }

        const diffConfig =
            DIFFICULTY_CONFIGS[
                puzzleConfig.difficulty
            ];
        if (countdownRemaining >30) {
            marathon.lowTimePinged = false;
        }

        GameCore.initPuzzle({
            mode:          "marathon",
            gridSize:      puzzleConfig.gridSize,
            difficulty:    puzzleConfig.difficulty,
            totalPuzzles:  -1,
            currentPuzzle: marathon.currentIndex,
            modeLabel:     "Marathon",
            mistakes:      0,
            solved:        marathon.solved,
            streak:        marathon.streak,
            onTimerTick:   null,
            pauseCountdown:   pauseCountdown,
            resumeCountdown:  resumeCountdown
        });

        ScreenManager.showScreen(
            "gameScreen"
        );

        SettingsManager.applyIntensity(
            diffConfig.intensity
        );

        GameCore.loadPuzzle({
            gridSize:   puzzleConfig.gridSize,
            difficulty: puzzleConfig.difficulty
        });

        bindControls();

        startCountdown();
    }

    // ===== SECTION 5 =====
    // BIND CONTROLS
    // =====================================

    function bindControls() {

        const submitBtn =
            document.getElementById(
                "submitBtn"
            );

        const skipBtn =
            document.getElementById(
                "skipBtn"
            );

        if (submitBtn) {

            const newSubmit =
                submitBtn.cloneNode(true);

            submitBtn.parentNode
                .replaceChild(
                    newSubmit,
                    submitBtn
                );

            newSubmit.addEventListener(
                "click",
                function() {

                    GameCore.checkSolution(
                        onPuzzleSolved
                    );
                }
            );
        }

        if (skipBtn) {

            const newSkip =
                skipBtn.cloneNode(true);

            skipBtn.parentNode
                .replaceChild(
                    newSkip,
                    skipBtn
                );

            newSkip.addEventListener(
                "click",
                function() {

                    GameCore.skipPuzzle(
                        onPuzzleSkipped
                    );
                }
            );
        }
    }

    // ===== SECTION 6 =====
    // COUNTDOWN TIMER
    // =====================================

    function startCountdown() {

        stopCountdown();

        countdownPaused = false;

        HUDManager.updateCountdown(
            countdownRemaining
        );

        countdownInterval = setInterval(
            function() {

                if (countdownPaused) {
                    return;
                }

                countdownRemaining -= 0.25;

                if (
                    countdownRemaining <= 0
                ) {

                    countdownRemaining = 0;

                    HUDManager.updateCountdown(
                        0
                    );

                    stopCountdown();

                    gameOver();

                    return;
                }

                HUDManager.updateCountdown(
                    countdownRemaining
                );

                // Low time warning
                if (
                    countdownRemaining <= 30 &&
                    !marathon.lowTimePinged
                ) {
                    marathon.lowTimePinged = true;
AudioSystem.playSfx("low_time");
document.body.classList.add("low-time");

                }

                // Return to normal above 30s
                // (after time bonus from solving)
                if (
                    countdownRemaining > 30 &&
                    marathon.lowTimePinged
                ) {
                    marathon.lowTimePinged = false;
document.body.classList.remove("low-time");

                }
            },
            250
        );
    }

    function stopCountdown() {

        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
    }

    function pauseCountdown() {
        countdownPaused = true;
    }

    function resumeCountdown() {
        countdownPaused = false;
    }

    // ===== SECTION 7 =====
    // ON PUZZLE SOLVED
    // =====================================

    function onPuzzleSolved(result) {

        GameCore.logPuzzleResult(
            marathon.currentIndex,
            result.time,
            false
        );

        marathon.solved++;
        marathon.mistakes +=
            result.mistakes;

        // "I'm Still Standing": solved while
        // timer was under 30s
        if (countdownRemaining <= 30) {
            marathon.lowTimeSolves++;
            if (marathon.lowTimeSolves >= 3) {
                AchievementManager
                    .tryUnlock(
                        "im_still_standing"
                    );
            }
        }

        // "Against The Clock": solved with
        // 5s or less on the clock
        if (
            countdownRemaining <= 5 &&
            !marathon.againstClockDone
        ) {
            marathon.againstClockDone = true;
            AchievementManager
                .tryUnlock("against_the_clock");
        }

        // Pause countdown while result shows
        pauseCountdown();

        // Add time bonus
        const puzzleConfig =
            resolveCurrentConfig();
        const bonusTable =
            marathon.config.timeBonusByGrid;
        const bonus = bonusTable
            ? (bonusTable[puzzleConfig.gridSize]
               || marathon.config.timeBonus)
            : marathon.config.timeBonus;
        countdownRemaining += bonus;

        if (result.flawless) {

            marathon.streak++;

            if (
                STREAK_MILESTONES.includes(
                    marathon.streak
                )
            ) {
                AudioSystem.setIntense();

                // DJ tracking: record intense
                // for current grid size
                const gs =
                    puzzleConfig.gridSize;
                marathon.djModes[gs]
                    .add("intense");

                // Check The DJ: all 3 grids
                // must have both modes
                const allGridsDJ =
                    [4, 6, 8].every(function(g) {
                        return marathon
                            .djModes[g]
                            .has("soft") &&
                            marathon
                            .djModes[g]
                            .has("intense");
                    });
                if (allGridsDJ) {
                    AchievementManager
                        .tryUnlock("the_dj");
                }
            }

            AchievementManager.evaluateStreak(
                marathon.streak
            );

            // "Comeback Kid": recovered to
            // streak 5 after a break
            if (
                marathon.streak >= 5 &&
                marathon.hadStreakBreak
            ) {
                AchievementManager
                    .tryUnlock("comeback_kid");
            }

        } else {

            if (marathon.streak > 0) {
                marathon.hadStreakBreak = true;
            }
            marathon.streak = 0;
            AudioSystem.setSoft();

            // DJ tracking: record soft for
            // current grid size on reset
            const gs = puzzleConfig.gridSize;
            marathon.djModes[gs].add("soft");
        }

        if (
            marathon.streak >
            marathon.bestStreak
        ) {
            marathon.bestStreak =
                marathon.streak;
        }

        PuzzleResultUI.show({
            flawless: result.flawless,
            time:     result.time,
            mistakes: result.mistakes,
            onNext:   function() {

                // Resume countdown
                // when player clicks Next
                resumeCountdown();

                onNextPuzzle();
            }
        });
    }

    // ===== SECTION 8 =====
    // ON PUZZLE SKIPPED
    // =====================================

    function onPuzzleSkipped() {
        StorageManager.recordSkip();
        AchievementManager.evaluateSkipCount();
        GameCore.logPuzzleResult(
            marathon.currentIndex,
            null,
            true
        )
        marathon.streak = 0;

        // Lose time on skip
        countdownRemaining -=
            marathon.config.timePenalty;

        if (countdownRemaining <= 0) {

            countdownRemaining = 0;

            stopCountdown();

            gameOver();

            return;
        }

        onNextPuzzle();
    }

    // ===== SECTION 9 =====
    // ON NEXT PUZZLE
    // =====================================

    function onNextPuzzle() {

        marathon.currentIndex++;

        loadPuzzle();
    }

    // ===== SECTION 10 =====
    // GAME OVER
    // =====================================

    function gameOver() {

        GameCore.stopTimer();

        stopCountdown();

        document.body.classList
            .remove("low-time");

        marathon.lowTimePinged = false;

        AudioSystem.playSfx(
            "sfx_gameover"
        );

        const difficulty =
            marathon.difficulty;

        const solved =
            marathon.solved;

        const previousBest =
            StorageManager.getMarathonBest(
                difficulty
            );

        StorageManager.recordMarathonResult(
            difficulty,
            solved,
            marathon.bestStreak
        );

        const newBest =
            StorageManager.getMarathonBest(
                difficulty
            );

        const isNewBest =
            newBest > previousBest;

        // Track new achievements
        const beforeUnlocked =
            StorageManager
                .getUnlockedAchievements()
                .slice();

        AchievementManager
            .evaluateAfterMarathon(solved);

        const afterUnlocked =
            StorageManager
                .getUnlockedAchievements();

        const newAchievements =
            afterUnlocked.filter(
                function(id) {
                    return !beforeUnlocked
                        .includes(id);
                }
            );

        MenuUI.updateStats();

        MarathonOverUI.show(
            {
                solved:       solved,
                mistakes:     marathon.mistakes,
                bestStreak:   marathon.bestStreak,
                personalBest: newBest,
                isNewBest:    isNewBest
            },
            newAchievements
        );

        SettingsManager.applyIntensity(0);
    }

    // ===== SECTION 11 =====
    // PUBLIC API
    // =====================================

    return {
        start
    };

})();

window.MarathonManager = MarathonManager;