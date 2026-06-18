// =====================================
// CHROMOGIC
// campaign.js
// =====================================

// ===== SECTION 1 =====
// CAMPAIGN STATE
// =====================================

const CampaignManager = (() => {

    let campaign = null;

    // ===== SECTION 2 =====
    // START CAMPAIGN
    // =====================================

    function start(
        gridSize,
        difficulty,
        puzzleCount
    ) {

        campaign = {
            gridSize:     gridSize,
            difficulty:   difficulty,
            puzzleCount:  puzzleCount,
            currentIndex: 1,
            solved:       0,
            mistakes:     0,
            totalTime:    0,
            streak:       0,
            bestStreak:   0,
            newAchievements: []
        };

        AudioSystem.playPlaylist(
            campaign.difficulty,
            "soft"
        );

        GameCore.clearPuzzleLog();

        SettingsManager.applyIntensity(
            DIFFICULTY_CONFIGS[difficulty]
                .intensity
        );

        loadPuzzle();
    }

    // ===== SECTION 3 =====
    // LOAD PUZZLE
    // =====================================

    function loadPuzzle() {

        GameCore.initPuzzle({
            mode:         "campaign",
            gridSize:     campaign.gridSize,
            difficulty:   campaign.difficulty,
            totalPuzzles: campaign.puzzleCount,
            currentPuzzle:campaign.currentIndex,
            modeLabel:    "Campaign",
            mistakes:     0,
            solved:       campaign.solved,
            streak:       campaign.streak
        });

        ScreenManager.showScreen(
            "gameScreen"
        );

        HUDManager.hideCountdown();

        GameCore.loadPuzzle({
            gridSize:   campaign.gridSize,
            difficulty: campaign.difficulty
        });

        bindControls();
    }

    // ===== SECTION 4 =====
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

    // ===== SECTION 5 =====
    // ON PUZZLE SOLVED
    // =====================================

    function onPuzzleSolved(result) {

        // result: { time, flawless,
        //           mistakes }

        GameCore.logPuzzleResult(
            campaign.currentIndex,
            result.time,
            false
        );
        campaign.solved++;
        campaign.totalTime +=
            result.time;
        campaign.mistakes +=
            result.mistakes;

        if (result.flawless) {

            campaign.streak++;

            if (
                STREAK_MILESTONES.includes(
                    campaign.streak
                )
            ) {
                AudioSystem.setIntense();
            }
            AchievementManager.evaluateStreak(
            campaign.streak
        );
        } else {

            campaign.streak = 0;
            AudioSystem.setSoft()
        }

        if (
            campaign.streak >
            campaign.bestStreak
        ) {
            campaign.bestStreak =
                campaign.streak;
        }

        PuzzleResultUI.show({
            flawless: result.flawless,
            time:     result.time,
            mistakes: result.mistakes,
            onNext:   onNextPuzzle
        });
    }

    // ===== SECTION 6 =====
    // ON PUZZLE SKIPPED
    // =====================================

    function onPuzzleSkipped() {
        StorageManager.recordSkip();
        GameCore.logPuzzleResult(
            campaign.currentIndex,
            null,
            true
        )

        campaign.streak = 0;

        onNextPuzzle();
    }

    // ===== SECTION 7 =====
    // ON NEXT PUZZLE
    // =====================================

    function onNextPuzzle() {

        campaign.currentIndex++;

        if (
            campaign.currentIndex >
            campaign.puzzleCount
        ) {

            finishCampaign();
            return;
        }

        loadPuzzle();
    }

    // ===== SECTION 8 =====
    // FINISH CAMPAIGN
    // =====================================

    function finishCampaign() {

        GameCore.stopTimer();

        const result = {
            gridSize:    campaign.gridSize,
            difficulty:  campaign.difficulty,
            puzzleCount: campaign.puzzleCount,
            solved:      campaign.solved,
            mistakes:    campaign.mistakes,
            totalTime:   campaign.totalTime,
            bestStreak:  campaign.bestStreak,
            timestamp:   Date.now()
        };

        StorageManager
            .recordCampaignResult(result);

        // Determine reward
        const fullyCompleted =
            campaign.solved ===
            campaign.puzzleCount;

        let reward = "none";

        if (fullyCompleted) {

            if (campaign.mistakes === 0) {
                reward = "crown";
            } else {
                reward = "star";
            }
        }

        // Track new achievements
        const beforeUnlocked =
            StorageManager
                .getUnlockedAchievements()
                .slice();

        AchievementManager
            .evaluateAfterCampaign({
                gridSize:    campaign.gridSize,
                difficulty:  campaign.difficulty,
                solved:      campaign.solved,
                puzzleCount: campaign.puzzleCount,
                mistakes:    campaign.mistakes,
                totalTime:   campaign.totalTime,
                bestStreak:  campaign.bestStreak
            });

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

        CampaignResultUI.show(
            {
                solved:      campaign.solved,
                puzzleCount: campaign.puzzleCount,
                mistakes:    campaign.mistakes,
                totalTime:   campaign.totalTime,
                bestStreak:  campaign.bestStreak,
                reward:      reward
            },
            newAchievements
        );

        SettingsManager.applyIntensity(0);
    }

    // ===== SECTION 9 =====
    // PUBLIC API
    // =====================================

    return {
        start
    };

})();

window.CampaignManager = CampaignManager;