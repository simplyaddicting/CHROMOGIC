// =====================================
// CHROMOGIC
// storage.js
// =====================================

// ===== SECTION 1 =====
// STORAGE MANAGER
// =====================================

const StorageManager = (() => {

    let save = null;

    // ===== SECTION 2 =====
    // LOAD
    // =====================================

    function load() {

        const raw =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (!raw) {

            save = structuredClone(
                DEFAULT_SAVE
            );

            persist();

            return save;
        }

        try {

            save = JSON.parse(raw);

            if (!save.totalSessions) {
                save.totalSessions = 0;
            }

            save.totalSessions++;

            if (save.totalSessions >= 10) {
                // Can't call tryUnlock here yet
                // so flag it for ui.js to check
                save.pendingGamer = true;
            }

            // Merge any missing keys
            // from DEFAULT_SAVE
            save = deepMerge(
                structuredClone(
                    DEFAULT_SAVE
                ),
                save
            );

            persist();

            return save;

        } catch (e) {

            console.error(
                "Save corrupted. Resetting."
            );

            save = structuredClone(
                DEFAULT_SAVE
            );

            persist();

            return save;
        }
    }

    // ===== SECTION 3 =====
    // DEEP MERGE UTILITY
    // Ensures new DEFAULT_SAVE keys are
    // added to old saves without wiping data.
    // =====================================

    function deepMerge(base, override) {

        const result = {};

        Object.keys(base).forEach(
            function(key) {
                result[key] = base[key];
            }
        );

        Object.keys(override).forEach(
            function(key) {

                const ov = override[key];
                const bv = base[key];

                if (
                    ov !== null &&
                    typeof ov === "object" &&
                    !Array.isArray(ov) &&
                    bv !== null &&
                    typeof bv === "object" &&
                    !Array.isArray(bv)
                ) {

                    result[key] =
                        deepMerge(bv, ov);

                } else {

                    result[key] = ov;
                }
            }
        );

        return result;
    }

    // ===== SECTION 4 =====
    // PERSIST
    // =====================================

    function persist() {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(save)
        );
    }

    // ===== SECTION 5 =====
    // RESET
    // =====================================

    function reset() {

        save = structuredClone(
            DEFAULT_SAVE
        );

        persist();
    }

    // ===== SECTION 6 =====
    // GETTERS
    // =====================================

    function getSave() {
        return save;
    }

    function getSettings() {
        return save.settings;
    }

    function getStats() {

        return {
            totalPuzzlesSolved:
                save.totalPuzzlesSolved,
            totalMistakes:
                save.totalMistakes,
            fastestPuzzle:
                save.fastestPuzzle,
            totalCrowns:
                save.totalCrowns,
            totalStars:
                save.totalStars
        };
    }

    function getMarathonBest(
        difficulty
    ) {

        const val =
            save.marathonBest[difficulty];

        if (
            val !== undefined &&
            val !== null
        ) {
            return val;
        }

        return 0;
    }

    function getUnlockedAchievements() {

        return save.unlockedAchievements;
    }

    function isAchievementUnlocked(id) {

        return save
            .unlockedAchievements
            .includes(id);
    }

    // ===== SECTION 7 =====
    // SETTINGS UPDATE
    // =====================================

    function updateSettings(settings) {

        Object.keys(settings).forEach(
            function(key) {
                save.settings[key] =
                    settings[key];
            }
        );

        persist();
    }

    // ===== SECTION 8 =====
    // PUZZLE STATS
    // =====================================

    function recordPuzzleSolved(
        timeSeconds
    ) {

        save.totalPuzzlesSolved++;

        if (
            save.fastestPuzzle === null ||
            timeSeconds <
                save.fastestPuzzle
        ) {

            save.fastestPuzzle =
                timeSeconds;
        }

        persist();
    }

    function recordMistakes(count) {

        save.totalMistakes += count;

        persist();
    }

    function recordSkip() {

        if (!save.totalSkips) {
            save.totalSkips = 0;
        }

        save.totalSkips++;

        persist();
    }

    // ===== SECTION 9 =====
    // CAMPAIGN HISTORY
    // =====================================

    function recordCampaignResult(result) {

        // result shape:
        // {
        //   gridSize, difficulty,
        //   puzzleCount, solved,
        //   mistakes, totalTime,
        //   bestStreak, timestamp
        // }

        save.campaignHistory.push(result);

        // Keep last 50 campaigns only
        if (
            save.campaignHistory.length > 50
        ) {

            save.campaignHistory =
                save.campaignHistory
                    .slice(-50);
        }

        persist();
    }

    // ===== SECTION 10 =====
    // MARATHON HISTORY
    // =====================================

    function recordMarathonResult(
        difficulty,
        puzzlesSurvived
    ) {

        const current =
            getMarathonBest(difficulty);

        if (puzzlesSurvived > current) {

            save.marathonBest[difficulty] =
                puzzlesSurvived;

            persist();
        }
    }

    // ===== SECTION 11 =====
    // ACHIEVEMENTS
    // =====================================

    function unlockAchievement(id) {

        if (
            save.unlockedAchievements
                .includes(id)
        ) {

            return false;
        }

        save.unlockedAchievements
            .push(id);

        // Update reward counts
        const achievement =
            ACHIEVEMENTS.find(
                function(a) {
                    return a.id === id;
                }
            );

        if (achievement) {

            if (
                achievement.reward ===
                "crown"
            ) {

                save.totalCrowns++;

            } else if (
                achievement.reward ===
                "star"
            ) {

                save.totalStars++;
            }
        }

        persist();

        return true;
    }

    // ===== SECTION 12 =====
    // PUBLIC API
    // =====================================

    return {
        load,
        reset,
        persist,
        getSave,
        getSettings,
        getStats,
        getMarathonBest,
        getUnlockedAchievements,
        isAchievementUnlocked,
        updateSettings,
        recordPuzzleSolved,
        recordMistakes,
        recordCampaignResult,
        recordMarathonResult,
        unlockAchievement,
        recordSkip
    };

})();

window.StorageManager = StorageManager;
