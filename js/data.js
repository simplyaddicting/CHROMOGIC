// =====================================
// CHROMOGIC
// data.js
// =====================================

// ===== SECTION 1 =====
// GRID CONFIGURATIONS
// =====================================

const GRID_CONFIGS = {
    4: {
        size: 4,
        colors: 2,
        perRowCol: 2,
        label: "4×4"
    },
    6: {
        size: 6,
        colors: 3,
        perRowCol: 2,
        label: "6×6"
    },
    8: {
        size: 8,
        colors: 4,
        perRowCol: 2,
        label: "8×8"
    }
};

// ===== SECTION 2 =====
// DIFFICULTY CONFIGURATIONS
// =====================================

const DIFFICULTY_CONFIGS = {
    easy: {
        id: "easy",
        label: "Easy",
        removalMin: 0.40,
        removalMax: 0.50,
        intensity: 0.0
    },
    medium: {
        id: "medium",
        label: "Medium",
        removalMin: 0.55,
        removalMax: 0.65,
        intensity: 0.33
    },
    hard: {
        id: "hard",
        label: "Hard",
        removalMin: 0.68,
        removalMax: 0.76,
        intensity: 0.66
    },
    expert: {
        id: "expert",
        label: "Expert",
        removalMin: 0.78,
        removalMax: 0.88,
        intensity: 1.0
    }
};

// ===== SECTION 3 =====
// STANDARD COLOR PALETTE
// =====================================

const COLOR_PALETTE = {
    0: {
        id: 0,
        name: "red",
        hex: "#D64545",
        label: "Red"
    },
    1: {
        id: 1,
        name: "blue",
        hex: "#3487FF",
        label: "Blue"
    },
    2: {
        id: 2,
        name: "yellow",
        hex: "#EECC55",
        label: "Yellow"
    },
    3: {
        id: 3,
        name: "green",
        hex: "#3DBB60",
        label: "Green"
    }
};

// ===== SECTION 4 =====
// COLORBLIND PALETTE
// (same colors, already colorblind-safe)
// =====================================

const COLORBLIND_PALETTE = {
    0: {
        id: 0,
        name: "cobalt",
        hex: "#0044BB",
        label: "Cobalt"
    },
    1: {
        id: 1,
        name: "sky",
        hex: "#66CCFF",
        label: "Sky"
    },
    2: {
        id: 2,
        name: "yellow",
        hex: "#EECC55",
        label: "Yellow"
    },
    3: {
        id: 3,
        name: "orange",
        hex: "#EE4422",
        label: "Orange"
    }
};

// ===== SECTION 5 =====
// MARATHON CONFIGURATION
// =====================================

const MARATHON_CONFIG = {
    easy: {
        id: "easy",
        label: "Easy",
        startTime: 180,
        timeBonusByGrid: { 4: 20, 6: 30, 8: 40 },
        timePenalty: 5,
        sequence: [
            { gridSize: 4, difficulty: "easy",   count: 5  },
            { gridSize: 4, difficulty: "medium",  count: 5  },
            { gridSize: 6, difficulty: "easy",   count: 5  },
            { gridSize: 6, difficulty: "medium",  count: 5  },
            { gridSize: 8, difficulty: "easy",   count: -1 }
        ]
    },
    medium: {
        id: "medium",
        label: "Medium",
        startTime: 150,
        timeBonusByGrid: { 4: 16, 6: 24, 8: 34 },
        timePenalty: 8,
        sequence: [
            { gridSize: 4, difficulty: "medium",  count: 5  },
            { gridSize: 4, difficulty: "hard",    count: 5  },
            { gridSize: 6, difficulty: "medium",  count: 5  },
            { gridSize: 6, difficulty: "hard",    count: 5  },
            { gridSize: 8, difficulty: "medium",  count: -1 }
        ]
    },
    hard: {
        id: "hard",
        label: "Hard",
        startTime: 120,
        timeBonusByGrid: { 4: 12, 6: 20, 8: 28 },
        timePenalty: 10,
        sequence: [
            { gridSize: 4, difficulty: "hard",    count: 5  },
            { gridSize: 4, difficulty: "expert",  count: 5  },
            { gridSize: 6, difficulty: "hard",    count: 5  },
            { gridSize: 6, difficulty: "expert",  count: 5  },
            { gridSize: 8, difficulty: "hard",    count: -1 }
        ]
    }
};

// ===== SECTION 6 =====
// ACHIEVEMENTS
// =====================================

const ACHIEVEMENTS = [
    {
        id: "first_step",
        title: "First Step",
        description: "Complete your first puzzle.",
        reward: "star",
        secret: false
    },
    {
        id: "chromogic_novice",
        title: "Chromogic Novice",
        description: "Complete a Campaign on any difficulty.",
        reward: "star",
        secret: false
    },
    {
        id: "easy_rider",
        title: "Easy Rider",
        description: "Complete a Campaign on Easy.",
        reward: "star",
        secret: false
    },
    {
        id: "no_pressure",
        title: "No Pressure",
        description: "Complete an Easy Campaign with 0 mistakes.",
        reward: "star",
        secret: false
    },
    {
        id: "color_theorist",
        title: "Color Theorist",
        description: "Complete a Campaign on Medium.",
        reward: "star",
        secret: false
    },
    {
        id: "steady_hand",
        title: "Steady Hand",
        description: "Complete a Medium Campaign with 0 mistakes.",
        reward: "crown",
        secret: false
    },
    {
        id: "hard_boiled",
        title: "Hard Boiled",
        description: "Complete a Campaign on Hard.",
        reward: "crown",
        secret: false
    },
    {
        id: "flawless_hard",
        title: "Flawless Hard",
        description: "Complete a Hard Campaign with 0 mistakes.",
        reward: "crown",
        secret: false
    },
    {
        id: "expert_mind",
        title: "Expert Mind",
        description: "Complete a Campaign on Expert.",
        reward: "crown",
        secret: false
    },
    {
        id: "perfectionist",
        title: "Perfectionist",
        description: "Complete an Expert Campaign with 0 mistakes.",
        reward: "crown",
        secret: false
    },
    {
        id: "grid_baby",
        title: "Grid Baby",
        description: "Complete a 4×4 Campaign.",
        reward: "star",
        secret: false
    },
    {
        id: "hexagonist",
        title: "Hexagonist",
        description: "Complete a 6×6 Campaign.",
        reward: "star",
        secret: false
    },
    {
        id: "full_board",
        title: "Full Board",
        description: "Complete an 8×8 Campaign.",
        reward: "star",
        secret: false
    },
    {
        id: "marathon_starter",
        title: "Marathon Starter",
        description: "Reach puzzle 10 in Marathon.",
        reward: "star",
        secret: false
    },
    {
        id: "marathon_runner",
        title: "Marathon Runner",
        description: "Reach puzzle 25 in Marathon.",
        reward: "crown",
        secret: false
    },
    {
        id: "marathon_legend",
        title: "Marathon Legend",
        description: "Reach puzzle 50 in Marathon.",
        reward: "crown",
        secret: false
    },
    {
        id: "speed_solver",
        title: "Speed Solver",
        description: "Solve any puzzle in under 30 seconds.",
        reward: "star",
        secret: false
    },
    {
        id: "flawless_puzzle",
        title: "Flawless Puzzle",
        description: "Solve a puzzle with 0 mistakes.",
        reward: "star",
        secret: false
    },
    {
        id: "flawless_match",
        title: "Flawless Match",
        description: "Complete a full Campaign with 0 total mistakes.",
        reward: "crown",
        secret: false
    },
    {
        id: "chromogic_master",
        title: "Chromogic Master",
        description: "Unlock all other achievements.",
        reward: "crown",
        secret: false
    },
    // ===== MARATHON MILESTONES =====

    {
        id: "marathon_usain",
        title: "Usain Bolt",
        description: "Complete 100 puzzles in Marathon.",
        reward: "crown",
        secret: false
    },
    {
        id: "marathon_jetpack",
        title: "Jetpack",
        description: "Complete 200 puzzles in Marathon.",
        reward: "crown",
        secret: false
    },
    {
        id: "marathon_void",
        title: "Into The Void",
        description: "Complete 500 puzzles in Marathon.",
        reward: "crown",
        secret: true
    },

    // ===== GRID + DIFFICULTY COMBOS =====

    {
        id: "square_hole",
        title: "It Goes In The Square Hole",
        description: "Complete a 4×4 Easy Campaign with 0 mistakes.",
        reward: "star",
        secret: false
    },
    {
        id: "ah_so_that",
        title: "Ah, So That's How It Is",
        description: "Complete a 6×6 Medium Campaign with 0 mistakes.",
        reward: "crown",
        secret: false
    },
    {
        id: "howww",
        title: "HOW??",
        description: "Complete an 8×8 Expert Campaign with 0 mistakes.",
        reward: "crown",
        secret: false
    },
    {
        id: "tutorial_done",
        title: "I Read The Tutorial",
        description: "Complete a 4×4 Easy Campaign.",
        reward: "star",
        secret: false
    },
    {
        id: "getting_serious",
        title: "Getting Serious",
        description: "Complete a 6×6 Hard Campaign.",
        reward: "crown",
        secret: false
    },
    {
        id: "masochist",
        title: "Masochist",
        description: "Complete an 8×8 Expert Campaign.",
        reward: "crown",
        secret: false
    },

    // ===== SPEED CHALLENGES =====

    {
        id: "blink",
        title: "Blink And You'll Miss It",
        description: "Solve a puzzle in under 15 seconds.",
        reward: "crown",
        secret: false
    },
    {
        id: "no_look",
        title: "No Look",
        description: "Solve a puzzle in under 10 seconds.",
        reward: "crown",
        secret: true
    },
    {
        id: "speedrun",
        title: "Any% Speedrun",
        description: "Complete a 12-puzzle Campaign in under 10 minutes total.",
        reward: "crown",
        secret: false
    },

    // ===== MISTAKE CHALLENGES =====

    {
        id: "trust_nobody",
        title: "Trust Nobody, Not Even Yourself",
        description: "Make 50 mistakes in a single Campaign.",
        reward: "star",
        secret: true
    },
    {
        id: "oops",
        title: "Oops",
        description: "Make a mistake on puzzle 1.",
        reward: "star",
        secret: true
    },
    {
        id: "butterfly",
        title: "Butterfly Fingers",
        description: "Make 10 mistakes on a single puzzle.",
        reward: "star",
        secret: true
    },

    // ===== STREAK CHALLENGES =====

    {
        id: "on_fire",
        title: "ON FIRE",
        description: "Reach a 5-puzzle flawless streak.",
        reward: "star",
        secret: false
    },
    {
        id: "unstoppable",
        title: "Unstoppable",
        description: "Reach a 10-puzzle flawless streak.",
        reward: "crown",
        secret: false
    },
    {
        id: "ascended",
        title: "Ascended",
        description: "Reach a 20-puzzle flawless streak.",
        reward: "crown",
        secret: true
    },

    // ===== PUZZLE COUNT =====

    {
        id: "just_warming_up",
        title: "Just Warming Up",
        description: "Solve 10 puzzles total.",
        reward: "star",
        secret: false
    },
    {
        id: "getting_there",
        title: "Getting There",
        description: "Solve 50 puzzles total.",
        reward: "star",
        secret: false
    },
    {
        id: "centurion",
        title: "Centurion",
        description: "Solve 100 puzzles total.",
        reward: "crown",
        secret: false
    },
    {
        id: "addicted",
        title: "Addicted",
        description: "Solve 500 puzzles total.",
        reward: "crown",
        secret: true
    },
    {
        id: "no_life",
        title: "No Life",
        description: "Solve 1000 puzzles total.",
        reward: "crown",
        secret: true
    },

    // ===== FUNNY / SECRET =====

    {
        id: "gamer",
        title: "Gamer",
        description: "Open the game 10 times.",
        reward: "star",
        secret: true
    },
    {
        id: "colorblind_mode",
        title: "Actually Colorblind",
        description: "Turn on Colorblind Mode.",
        reward: "star",
        secret: false
    },
    {
        id: "settings_touched",
        title: "I Can Fix It",
        description: "Change a setting.",
        reward: "star",
        secret: true
    },
    {
        id: "skipper",
        title: "Not My Problem",
        description: "Skip 10 puzzles total.",
        reward: "star",
        secret: true
    },
    {
        id: "big_skipper",
        title: "Professional Skipper",
        description: "Skip 50 puzzles total.",
        reward: "star",
        secret: true
    },
    {
        id: "right_clicker",
        title: "Right Clicker",
        description: "Delete a cell using right click.",
        reward: "star",
        secret: true
    },
    {
        id: "indecisive",
        title: "Indecisive",
        description: "Cycle through all 4 colors on the same cell without committing.",
        reward: "star",
        secret: true
    },
    {
        id: "marathon_no_skip",
        title: "No Ragrets",
        description: "Complete 20 Marathon puzzles in a row without skipping.",
        reward: "crown",
        secret: false
    },
    {
        id: "read_about",
        title: "Lore Hunter",
        description: "Visit the About page.",
        reward: "star",
        secret: true
    },
    {
        id: "night_owl",
        title: "Night Owl",
        description: "Play between midnight and 4 AM.",
        reward: "star",
        secret: true
    },
    {
        id: "early_bird",
        title: "Early Bird",
        description: "Play between 5 AM and 7 AM.",
        reward: "star",
        secret: true
    },

    // ===== MUSIC / MARATHON SECRETS =====

    {
        id: "the_remix",
        title: "The Remix",
        description: "Listen to tracks from every playlist in the game (all difficulties, both moods).",
        reward: "crown",
        secret: true
    },
    {
        id: "the_dj",
        title: "The DJ",
        description: "Trigger both soft and intense mode on every grid size in a single Marathon run.",
        reward: "crown",
        secret: true
    },
    {
        id: "im_still_standing",
        title: "I'm Still Standing",
        description: "Solve a puzzle 3 times while the Marathon timer is under 30 seconds.",
        reward: "crown",
        secret: true
    },
    {
        id: "silence_is_golden",
        title: "Silence Is Golden",
        description: "Set both music and SFX volume to zero.",
        reward: "star",
        secret: true
    },
    {
        id: "against_the_clock",
        title: "Against The Clock",
        description: "Solve a Marathon puzzle with 5 seconds or less remaining.",
        reward: "crown",
        secret: true
    },
    {
        id: "marathon_tourist",
        title: "Marathon Tourist",
        description: "Play all three Marathon difficulties at least once.",
        reward: "star",
        secret: false
    },
    {
        id: "comeback_kid",
        title: "Comeback Kid",
        description: "Recover from a 0-streak to a 5-streak in a single Marathon run.",
        reward: "crown",
        secret: true
    }

];

// ===== SECTION 7 =====
// STORAGE KEY
// =====================================

const STORAGE_KEY = "chromogic_save_v1";

// ===== SECTION 8 =====
// DEFAULT SAVE
// =====================================

const DEFAULT_SAVE = {

    // stats
    totalPuzzlesSolved: 0,
    totalMistakes: 0,
    fastestPuzzle: null,
    totalCrowns: 0,
    totalStars: 0,

    // campaign history
    campaignHistory: [],

    // marathon history
    marathonBest: {
        easy: 0,
        medium: 0,
        hard: 0
    },

    // achievements
    unlockedAchievements: [],

    // settings
    settings: {
        theme: "dark",
        colorblind: false,
        musicVolume: 0.7,
        sfxVolume: 0.8
    },

    marathonBestStreak: {
    easy: 0,
    medium: 0,
    hard: 0
},
campaignBests: {
    easy:   null,
    medium: null,
    hard:   null,
    expert: null
},
};

// ===== SECTION 9 =====
// STREAK MILESTONES
// =====================================

const STREAK_MILESTONES = [3, 5, 10, 15, 20];

// ===== SECTION 10 =====
// PUZZLE COUNT OPTIONS
// =====================================

const PUZZLE_COUNT_OPTIONS = [3, 6, 9, 12];