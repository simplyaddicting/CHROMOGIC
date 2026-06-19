// =====================================
// CHROMOGIC
// achievements.js
// =====================================

// ===== SECTION 1 =====
// ACHIEVEMENT MANAGER
// =====================================

const AchievementManager = (() => {

    // ===== SECTION 2 =====
    // TOAST QUEUE
    // =====================================

    const toastQueue = [];
    let toastActive = false;

    // ===== SECTION 3 =====
    // SHOW TOAST
    // =====================================

    function showToast(achievement) {

        toastQueue.push(achievement);

        if (!toastActive) {
            processToastQueue();
        }
    }

    function processToastQueue() {

        if (toastQueue.length === 0) {
            toastActive = false;
            return;
        }

        toastActive = true;

        const achievement =
            toastQueue.shift();

        const toast =
            document.getElementById(
                "achievementToast"
            );

        const rewardEl =
            toast.querySelector(
                ".toast-reward"
            );

        const titleEl =
            toast.querySelector(
                ".toast-title"
            );

        const descEl =
            toast.querySelector(
                ".toast-desc"
            );

        rewardEl.textContent =
            achievement.reward === "crown"
                ? "👑"
                : "⭐";

        titleEl.textContent =
            achievement.title;

        descEl.textContent =
            achievement.description;

        toast.classList.remove("hidden");
        toast.classList.add("visible");

        AudioSystem.playSfx(
            "sfx_achievement"
        );

        setTimeout(function() {

            toast.classList.remove(
                "visible"
            );

            toast.classList.add("hidden");

            setTimeout(function() {

                processToastQueue();

            }, 400);

        }, 3000);
    }

function renderPersonalBests() {
    const pbCampaign = document.getElementById("pbCampaign");
    const pbMarathon = document.getElementById("pbMarathon");

    if (pbCampaign) {
        pbCampaign.innerHTML = "";
        const bests = StorageManager.getCampaignBests();
        const difficulties = ["easy", "medium", "hard", "expert"];
        difficulties.forEach(function(diff) {
            const b = bests[diff];
            const card = document.createElement("div");
            card.className = "pb-card";
            if (b) {
                const avgSec = Math.round(b.avgTime);
                card.innerHTML =
                    "<div class=\"pb-card-title\">" + diff.charAt(0).toUpperCase() + diff.slice(1) + "</div>" +
                    "<div class=\"pb-card-row\">Solved: <strong>" + b.solved + "/" + b.puzzleCount + "</strong></div>" +
                    "<div class=\"pb-card-row\">Mistakes: <strong>" + b.mistakes + "</strong></div>" +
                    "<div class=\"pb-card-row\">Total: <strong>" + HUDManager.formatTime(b.totalTime) + "</strong></div>" +
                    "<div class=\"pb-card-row\">Avg/puzzle: <strong>" + HUDManager.formatTime(avgSec) + "</strong></div>";
            } else {
                card.innerHTML =
                    "<div class=\"pb-card-title\">" + diff.charAt(0).toUpperCase() + diff.slice(1) + "</div>" +
                    "<div class=\"pb-card-empty\">No games yet</div>";
            }
            pbCampaign.appendChild(card);
        });
    }

    if (pbMarathon) {
        pbMarathon.innerHTML = "";
        const mDiffs = ["easy", "medium", "hard"];
        mDiffs.forEach(function(diff) {
            const best = StorageManager.getMarathonBest(diff);
            const bestStreak = StorageManager.getMarathonBestStreak(diff);
            const card = document.createElement("div");
            card.className = "pb-card";
            card.innerHTML =
                "<div class=\"pb-card-title\">" + diff.charAt(0).toUpperCase() + diff.slice(1) + "</div>" +
                (best > 0
                    ? "<div class=\"pb-card-row\">Puzzles reached: <strong>" + best + "</strong></div>" +
                      "<div class=\"pb-card-row\">Longest streak: <strong>" + bestStreak + "</strong></div>"
                    : "<div class=\"pb-card-empty\">No games yet</div>"
                );
            pbMarathon.appendChild(card);
        });
    }
}
    // ===== SECTION 4 =====
    // TRY UNLOCK
    // =====================================

    function tryUnlock(id) {

        const already =
            StorageManager
                .isAchievementUnlocked(id);

        if (already) {
            return false;
        }

        const unlocked =
            StorageManager
                .unlockAchievement(id);

        if (!unlocked) {
            return false;
        }

        const achievement =
            ACHIEVEMENTS.find(
                function(a) {
                    return a.id === id;
                }
            );

        if (achievement) {
            showToast(achievement);
        }

        // Check if all others are unlocked
        // to award chromogic_master
        checkMaster();

        return true;
    }

    // ===== SECTION 5 =====
    // CHECK MASTER ACHIEVEMENT
    // =====================================

    function checkMaster() {

        const unlocked =
            StorageManager
                .getUnlockedAchievements();

        const allOthers =
            ACHIEVEMENTS.filter(
                function(a) {
                    return a.id !==
                        "chromogic_master";
                }
            );

        const allDone =
            allOthers.every(
                function(a) {
                    return unlocked
                        .includes(a.id);
                }
            );

        if (allDone) {
            tryUnlock("chromogic_master");
        }
    }

    // ===== SECTION 6 =====
    // EVALUATE AFTER PUZZLE
    // Call this after every puzzle solved.
    // =====================================

    function evaluateAfterPuzzle(
        timeSeconds,
        mistakes,
        skipped
    ) {

        const stats =
            StorageManager.getStats();

        // First puzzle ever
        if (
            stats.totalPuzzlesSolved === 1
        ) {
            tryUnlock("first_step");
        }

        // Puzzle count milestones
        if (stats.totalPuzzlesSolved >= 10) {
            tryUnlock("just_warming_up");
        }

        if (stats.totalPuzzlesSolved >= 50) {
            tryUnlock("getting_there");
        }

        if (stats.totalPuzzlesSolved >= 100) {
            tryUnlock("centurion");
        }

        if (stats.totalPuzzlesSolved >= 500) {
            tryUnlock("addicted");
        }

        if (
            stats.totalPuzzlesSolved >= 1000
        ) {
            tryUnlock("no_life");
        }

        if (!skipped && timeSeconds !== null) {

            // Speed achievements
            if (timeSeconds < 30) {
                tryUnlock("speed_solver");
            }

            if (timeSeconds < 15) {
                tryUnlock("blink");
            }

            if (timeSeconds < 10) {
                tryUnlock("no_look");
            }
        }

        // Flawless puzzle
        if (mistakes === 0 && !skipped) {
            tryUnlock("flawless_puzzle");
        }

        // Butterfly fingers
        if (mistakes >= 10) {
            tryUnlock("butterfly");
        }

        // Skip tracking
        if (skipped) {
            evaluateSkipCount();
        }

        // Time of day secrets
        evaluateTimeOfDay();
    }

    // ===== SECTION 7 =====
    // EVALUATE AFTER CAMPAIGN
    // Call this when a campaign finishes.
    // =====================================

    function evaluateAfterCampaign(result) {

        const fullyCompleted =
            result.solved ===
            result.puzzleCount;

        if (fullyCompleted) {
            tryUnlock("chromogic_novice");
        }

        // Grid size
        if (fullyCompleted) {

            if (result.gridSize === 4) {
                tryUnlock("grid_baby");
                tryUnlock("tutorial_done");
            }

            if (result.gridSize === 6) {
                tryUnlock("hexagonist");
            }

            if (result.gridSize === 8) {
                tryUnlock("full_board");
            }
        }

        // Difficulty
        if (fullyCompleted) {

            if (result.difficulty === "easy") {

                tryUnlock("easy_rider");

                if (result.mistakes === 0) {
                    tryUnlock("no_pressure");
                }

                if (
                    result.gridSize === 4 &&
                    result.mistakes === 0
                ) {
                    tryUnlock("square_hole");
                }
            }

            if (
                result.difficulty === "medium"
            ) {

                tryUnlock("color_theorist");

                if (result.mistakes === 0) {
                    tryUnlock("steady_hand");
                }

                if (
                    result.gridSize === 6 &&
                    result.mistakes === 0
                ) {
                    tryUnlock("ah_so_that");
                }
            }

            if (result.difficulty === "hard") {

                tryUnlock("hard_boiled");
                tryUnlock("getting_serious");

                if (result.mistakes === 0) {
                    tryUnlock("flawless_hard");
                }
            }

            if (
                result.difficulty === "expert"
            ) {

                tryUnlock("expert_mind");
                tryUnlock("masochist");

                if (result.mistakes === 0) {
                    tryUnlock("perfectionist");
                    tryUnlock("howww");
                }

                if (
                    result.gridSize === 8 &&
                    result.mistakes === 0
                ) {
                    tryUnlock("howww");
                }
            }
        }

        // Flawless full campaign
        if (
            fullyCompleted &&
            result.mistakes === 0
        ) {
            tryUnlock("flawless_match");
        }

        // Speedrun — 12 puzzles under 10 min
        if (
            fullyCompleted &&
            result.puzzleCount === 12 &&
            result.totalTime < 600
        ) {
            tryUnlock("speedrun");
        }

        // Mistake achievements
        if (result.mistakes >= 50) {
            tryUnlock("trust_nobody");
        }

        // Streak achievement
        evaluateStreak(result.bestStreak);
    }

    // ===== SECTION 8 =====
    // EVALUATE AFTER MARATHON
    // Call this when marathon ends.
    // =====================================

function evaluateAfterMarathon(
        puzzlesSurvived
    ) {

        evaluateMarathonCount(
            puzzlesSurvived
        );
    }

    // ===== SECTION 9 =====
    // RENDER ACHIEVEMENTS SCREEN
    // =====================================

    function renderScreen() {

        const list =
            document.getElementById(
                "achievementsList"
            );

        const achStars =
            document.getElementById(
                "achStars"
            );

        const achCrowns =
            document.getElementById(
                "achCrowns"
            );

        const achUnlocked =
            document.getElementById(
                "achUnlocked"
            );

        const achTotal =
            document.getElementById(
                "achTotal"
            );

        if (!list) {
            return;
        }

        const unlocked =
            StorageManager
                .getUnlockedAchievements();

        const stats =
            StorageManager.getStats();

        if (achStars) {
            achStars.textContent =
                stats.totalStars;
        }

        if (achCrowns) {
            achCrowns.textContent =
                stats.totalCrowns;
        }

        if (achUnlocked) {
            achUnlocked.textContent =
                unlocked.length;
        }

        if (achTotal) {
            achTotal.textContent =
                ACHIEVEMENTS.length;
        }

        renderPersonalBests();

        list.innerHTML = "";

        ACHIEVEMENTS.forEach(
            function(achievement) {

                const isUnlocked =
                    unlocked.includes(
                        achievement.id
                    );

                const card =
                    document
                        .createElement("div");

                card.className =
                    "achievement-card " +
                    (
                        isUnlocked
                            ? "unlocked"
                            : "locked"
                    );

                const rewardIcon =
                    achievement.reward ===
                    "crown"
                        ? "👑"
                        : "⭐";

                card.innerHTML =
                    "<div class=\"achievement-reward\">" +
                    (isUnlocked ? rewardIcon : "🔒") +
                    "</div>" +
                    "<div class=\"achievement-info\">" +
                    "<div class=\"achievement-title\">" +
                    achievement.title +
                    "</div>" +
                    "<div class=\"achievement-desc\">" +
                    achievement.description +
                    "</div>" +
                    "</div>";

                list.appendChild(card);
            }
        );
    }

    // ===== SECTION 10 =====
    // RENDER NEWLY UNLOCKED
    // Shows unlocked achievements at the
    // bottom of results screens.
    // =====================================

    function renderNewlyUnlocked(
        containerId,
        ids
    ) {

        const container =
            document.getElementById(
                containerId
            );

        if (!container) {
            return;
        }

        container.innerHTML = "";

        if (
            !ids ||
            ids.length === 0
        ) {
            return;
        }

        ids.forEach(function(id) {

            const achievement =
                ACHIEVEMENTS.find(
                    function(a) {
                        return a.id === id;
                    }
                );

            if (!achievement) {
                return;
            }

            const item =
                document
                    .createElement("div");

            item.className =
                "unlocked-achievement-item";

            const rewardIcon =
                achievement.reward ===
                "crown"
                    ? "👑"
                    : "⭐";

            item.innerHTML =
                "<span>" +
                rewardIcon +
                "</span>" +
                "<span><strong>" +
                achievement.title +
                "</strong> — " +
                achievement.description +
                "</span>";

            container.appendChild(item);
        });
    }

    // ===== SECTION 11 =====
    // SKIP COUNTER
    // =====================================

    function evaluateSkipCount() {

        const save = StorageManager.getSave();

        if (!save.totalSkips) {
            return;
        }

        if (save.totalSkips >= 10) {
            tryUnlock("skipper");
        }

        if (save.totalSkips >= 50) {
            tryUnlock("big_skipper");
        }
    }

    // ===== SECTION 12 =====
    // TIME OF DAY
    // =====================================

    function evaluateTimeOfDay() {

        const hour =
            new Date().getHours();

        if (hour >= 0 && hour < 4) {
            tryUnlock("night_owl");
        }

        if (hour >= 5 && hour < 7) {
            tryUnlock("early_bird");
        }
    }

    // ===== SECTION 13 =====
    // STREAK ACHIEVEMENTS
    // Call this whenever streak updates.
    // =====================================

    function evaluateStreak(streak) {

        if (streak >= 5) {
            tryUnlock("on_fire");
        }

        if (streak >= 10) {
            tryUnlock("unstoppable");
        }

        if (streak >= 20) {
            tryUnlock("ascended");
        }
    }

    // ===== SECTION 14 =====
    // MARATHON PUZZLE COUNT
    // =====================================

    function evaluateMarathonCount(
        solved
    ) {

        if (solved >= 10) {
            tryUnlock("marathon_starter");
        }

        if (solved >= 25) {
            tryUnlock("marathon_runner");
        }

        if (solved >= 50) {
            tryUnlock("marathon_legend");
        }

        if (solved >= 100) {
            tryUnlock("marathon_usain");
        }

        if (solved >= 200) {
            tryUnlock("marathon_jetpack");
        }

        if (solved >= 500) {
            tryUnlock("marathon_void");
        }
    }
    // ===== SECTION 11 =====
    // PUBLIC API
    // =====================================

    return {
        tryUnlock,
        evaluateAfterPuzzle,
        evaluateAfterCampaign,
        evaluateAfterMarathon,
        evaluateStreak,
        renderScreen,
        renderNewlyUnlocked,
        renderPersonalBests
    };

})();

window.AchievementManager = AchievementManager;