// =====================================
// CHROMOGIC
// audio.js
// =====================================

// ===== SECTION 1 =====
// AUDIO SYSTEM
// =====================================

const AudioSystem = (() => {

    let musicVolume = 0.7;
    let sfxVolume = 0.8;

    let currentMusic = null;
    let currentMusicKey = null;
    let isMusicPaused = false;

    function showNowPlaying(path) {
    const el = document.getElementById("nowPlaying");
    if (!el) return;
    // Extract filename without extension
    const parts = path.split("/");
    const filename = parts[parts.length - 1].replace(/\.[^/.]+$/, "");
    el.textContent = "♪ " + filename;
    el.classList.remove("hidden");
}
    // ===== SECTION 2 =====
    // PLAYLIST STATE
    // Each difficulty has a soft and
    // intense playlist. We track which
    // track is playing and switch when
    // streak changes.
    // =====================================

    let currentDifficulty = "easy";
    let currentMode = "soft";
    let currentPlaylist = [];
    let currentTrackIndex = 0;
    let playlistActive = false;

    // ===== SECTION 3 =====
    // PLAYLISTS
    // To add more songs, just push more
    // paths into the arrays below.
    // =====================================

    const PLAYLISTS = {

        menu: [
            "audio/music/menu/Title 2.mp3"
        ],

        about: [
            "audio/music/menu/about/Midnight Coffee & Velvet Smoke.mp3"
        ],

        easy: {
            soft: [
                "audio/music/easy/soft/At The End Of All Things.mp3",
                "audio/music/easy/soft/Soft Loop.mp3",
                "audio/music/easy/soft/The Quiet Between Notes 1.mp3",
                "audio/music/easy/soft/The Quiet Between Notes 2.mp3",
                "audio/music/easy/soft/The Quiet Between Notes 3.mp3",
                "audio/music/easy/soft/The Quiet Between Notes 4.mp3", 
                "audio/music/easy/soft/The Quiet Between Notes 5.mp3", 
                "audio/music/easy/soft/Whispers of the Heart 1.mp3", 
                "audio/music/easy/soft/Whispers of the Heart 2.mp3", 
                "audio/music/easy/soft/Whispers of the Heart 3.mp3", 
                "audio/music/easy/soft/Whispers of the Heart 4.mp3"
            ],
            intense: [
                "audio/music/easy/intense/Falling Tension.mp3",
                "audio/music/easy/intense/Glass Staircase.mp3",
                "audio/music/easy/intense/Showdown 1.mp3",
                "audio/music/easy/intense/Showdown 2.mp3",
                "audio/music/easy/intense/Winter Waltz.mp3",
                "audio/music/easy/intense/The Duel of Shadows 1.mp3",
                "audio/music/easy/intense/The Duel of Shadows 2.mp3",
                "audio/music/easy/intense/The Duel of Shadows 3.mp3",
                "audio/music/easy/intense/The Duel of Shadows 4.mp3",
                "audio/music/easy/intense/The Duel of Shadows 5.mp3",
                "audio/music/easy/intense/The Duel of Shadows 6.mp3",
            ]
        },

        medium: {
            soft: [
                "audio/music/medium/soft/Felt Wind Chimes.mp3",
                "audio/music/medium/soft/Snowfall Serenade 1.mp3",
                "audio/music/medium/soft/Snowfall Serenade 2.mp3",
                "audio/music/medium/soft/Snowfall Serenade 3.mp3",
                "audio/music/medium/soft/Snowfall Serenade 4.mp3",
                "audio/music/medium/soft/Whispered Breeze 1.mp3",
                "audio/music/medium/soft/Whispered Breeze 2.mp3",
                "audio/music/medium/soft/Whispered Breeze 3.mp3",
                "audio/music/medium/soft/Whispered Breeze 4.mp3"
            ],
            intense: [
                "audio/music/medium/intense/Pressure Reeds 1.mp3",
                "audio/music/medium/intense/Pressure Reeds 2.mp3",
                "audio/music/medium/intense/The Wind Is Always Behind 1.mp3",
                "audio/music/medium/intense/The Wind Is Always Behind 2.mp3",
                "audio/music/medium/intense/The Wind Is Always Behind 3.mp3",
                "audio/music/medium/intense/The Wind Is Always Behind 4.mp3",
                "audio/music/medium/intense/The Duel of the Winds 1.mp3",
                "audio/music/medium/intense/The Duel of the Winds 2.mp3",
                "audio/music/medium/intense/The Duel of the Winds 3.mp3",
                "audio/music/medium/intense/The Duel of the Winds 4.mp3",
                "audio/music/medium/intense/The Duel of the Winds 5.mp3",
                "audio/music/medium/intense/The Duel of the Winds 6.mp3"
            ]
        },

        hard: {
            soft: [
                "audio/music/hard/soft/Brass & Velvet 1.mp3",
                "audio/music/hard/soft/Brass & Velvet 2.mp3",
                "audio/music/hard/soft/Brass & Velvet 3.mp3",
                "audio/music/hard/soft/Brass & Velvet 4.mp3",
                "audio/music/hard/soft/Golden Echoes 1.mp3",
                "audio/music/hard/soft/Golden Echoes 2.mp3",
                "audio/music/hard/soft/Golden Echoes 3.mp3", 
                "audio/music/hard/soft/Golden Echoes 4.mp3"
            ],
            intense: [
                "audio/music/hard/intense/The Last Stand 1.mp3",
                "audio/music/hard/intense/The Last Stand 2.mp3",
                "audio/music/hard/intense/The Last Stand 3.mp3",
                "audio/music/hard/intense/The Last Stand 4.mp3",
                "audio/music/hard/intense/Brass vs 1.mp3",
                "audio/music/hard/intense/Brass vs 2.mp3",
                "audio/music/hard/intense/Brass vs 3.mp3",
                "audio/music/hard/intense/Brass vs 4.mp3"
            ]
        },

        expert: {
            soft: [
                "audio/music/expert/soft/Gated Clamps 1.mp3",
                "audio/music/expert/soft/Gated Clamps 2.mp3",
                "audio/music/expert/soft/The Quiet Machine 1.mp3",
                "audio/music/expert/soft/The Quiet Machine 2.mp3",
                "audio/music/expert/soft/Glitching Out 1.mp3",
                "audio/music/expert/soft/Glitching Out 2.mp3",
                "audio/music/expert/soft/Glitching Out 3.mp3",
                "audio/music/expert/soft/Glitching Out 4.mp3"
            ],
            intense: [
                "audio/music/expert/intense/Rust & Resistance 1.mp3",
                "audio/music/expert/intense/Rust & Resistance 2.mp3",
                "audio/music/expert/intense/Rust & Resistance 3.mp3",
                "audio/music/expert/intense/Rust & Resistance 4.mp3",
                "audio/music/expert/intense/Circuit Warfare 1.mp3",
                "audio/music/expert/intense/Circuit Warfare 2.mp3",
                "audio/music/expert/intense/Circuit Warfare 3.mp3",
                "audio/music/expert/intense/Circuit Warfare 4.mp3",
                "audio/music/expert/intense/Circuit Warfare 5.mp3",
                "audio/music/expert/intense/Circuit Warfare 6.mp3"
            ]
        }
    };

    // ===== SECTION 4 =====
    // SFX REGISTRY
    // To add more sfx, register them here.
    // =====================================

    const SFX = {
        menu_hover:  "audio/sfx/menu/glide/freesound_community-menu-selection-102220.mp3",
        menu_select: "audio/sfx/menu/select/universfield-button-124476.mp3",
        click:       "audio/sfx/menu/change-colors/change-colors.mp3",

        complete_easy_normal:   "audio/sfx/complete/easy/normal.mp3",
        complete_easy_streak:   "audio/sfx/complete/easy/streak.mp3",
        complete_medium_normal: "audio/sfx/complete/medium/normal.mp3",
        complete_medium_streak: "audio/sfx/complete/medium/streak.mp3",
        complete_hard_normal:   "audio/sfx/complete/hard/normal.mp3",
        complete_hard_streak:   "audio/sfx/complete/hard/streak.mp3",
        complete_expert_normal: "audio/sfx/complete/expert/normal.mp3",
        complete_expert_streak: "audio/sfx/complete/expert/streak.mp3",
        low_time: "audio/sfx/menu/low/low.mp3"
    };

    // ===== SECTION 5 =====
    // SFX PLAYER
    // =====================================

    function playSfx(key) {

        const path = SFX[key];

        if (!path) {
            return;
        }

        const audio = new Audio(path);

        audio.volume = sfxVolume;

        audio.play().catch(function() {});
    }

    // ===== SECTION 6 =====
    // PLAY COMPLETE SFX
    // Picks the right ping based on
    // difficulty and whether it's a streak.
    // =====================================

    function playCompleteSfx(
        difficulty,
        isStreak
    ) {

        const mode =
            isStreak ? "streak" : "normal";

        const key =
            "complete_" +
            difficulty +
            "_" +
            mode;

        playSfx(key);
    }

    // ===== SECTION 7 =====
    // SIMPLE MUSIC PLAYER
    // For menu and about screens —
    // single track, looping.
    // =====================================

    function playSimpleMusic(key) {

        stopAll();

        const paths = PLAYLISTS[key];

        if (!paths || paths.length === 0) {
            return;
        }

        playlistActive = false;

        currentMusicKey = key;

        const path = paths[0];

        currentMusic = new Audio(path);
        showNowPlaying(path);
        currentMusic.loop = true;
        currentMusic.volume = musicVolume;
        currentMusic.preload = "auto";

        // Fallback: if loop fails, restart manually
        currentMusic.addEventListener(
            "ended",
            function() {

                if (
                    currentMusicKey === key &&
                    !playlistActive
                ) {

                    currentMusic.currentTime
                        = 0;

                    currentMusic
                        .play()
                        .catch(function() {});
                }
            }
        );

        currentMusic.play().catch(
            function() {}
        );
    }

    // ===== SECTION 8 =====
    // PLAYLIST PLAYER
    // For gameplay — shuffles the playlist
    // and plays tracks in sequence.
    // When a track ends, moves to next.
    // =====================================

    function playPlaylist(
        difficulty,
        mode
    ) {

        stopAll();

        const list =
            PLAYLISTS[difficulty] &&
            PLAYLISTS[difficulty][mode];

        if (!list || list.length === 0) {
            return;
        }

        // Track heard playlists for
        // "The Remix" achievement
        if (
            typeof StorageManager !== "undefined" &&
            typeof AchievementManager !== "undefined"
        ) {
            const heard =
                StorageManager
                    .recordHeardPlaylist(
                        difficulty,
                        mode
                    );

            // All gameplay combos:
            // easy/hard/expert × soft/intense
            const allCombos = [
                "easy_soft",   "easy_intense",
                "hard_soft",   "hard_intense",
                "expert_soft", "expert_intense"
            ];

            const allHeard =
                allCombos.every(function(k) {
                    return heard.includes(k);
                });

            if (allHeard) {
                AchievementManager
                    .tryUnlock("the_remix");
            }
        }

        currentDifficulty = difficulty;
        currentMode = mode;
        currentPlaylist = shuffleArray(
            list.slice()
        );
        currentTrackIndex = Math.floor(Math.random() * currentPlaylist.length);
        playlistActive = true;
        currentMusicKey =
            difficulty + "_" + mode;

        playCurrentTrack();
    }

    function playCurrentTrack() {

        if (!playlistActive) {
            return;
        }

        if (
            currentTrackIndex >=
            currentPlaylist.length
        ) {

            // Reshuffle and loop
            currentPlaylist = shuffleArray(
                currentPlaylist.slice()
            );

            currentTrackIndex = 0;
        }

        const path =
            currentPlaylist[
                currentTrackIndex
            ];
        currentMusic = new Audio(path);
        showNowPlaying(path);
        currentMusic.volume = musicVolume;
        isMusicPaused = false;

        currentMusic.addEventListener(
            "ended",
            function() {

                currentTrackIndex++;
                playCurrentTrack();
            }
        );

        currentMusic.play().catch(
            function() {}
        );
    }

    // ===== SECTION 9 =====
    // SWITCH MODE
    // Call this when streak starts/ends
    // to swap between soft and intense.
    // Crossfades smoothly.
    // =====================================

    function switchMode(mode) {

        if (
            !playlistActive ||
            currentMode === mode
        ) {
            return;
        }

        currentMode = mode;

        // Track heard playlists for
        // "The Remix" achievement
        if (
            typeof StorageManager !== "undefined" &&
            typeof AchievementManager !== "undefined"
        ) {
            const heard =
                StorageManager
                    .recordHeardPlaylist(
                        currentDifficulty,
                        mode
                    );

            const allCombos = [
                "easy_soft",   "easy_intense",
                "hard_soft",   "hard_intense",
                "expert_soft", "expert_intense"
            ];

            const allHeard =
                allCombos.every(function(k) {
                    return heard.includes(k);
                });

            if (allHeard) {
                AchievementManager
                    .tryUnlock("the_remix");
            }
        }

        const list =
            PLAYLISTS[currentDifficulty] &&
            PLAYLISTS[currentDifficulty][mode];

        if (!list || list.length === 0) {
            return;
        }

        // Fade out current track
        fadeOut(currentMusic, 800, function() {

    // Abort if stopAll() was called during the fade
    if (!playlistActive) return;

    // Abort if difficulty/mode changed again during the fade
    if (currentMode !== mode) return;

    currentPlaylist = shuffleArray(list.slice());
    currentTrackIndex = 0;
    currentMusicKey = currentDifficulty + "_" + mode;

    playCurrentTrack();
    fadeIn(currentMusic, 800);
});
    }

    function setIntense() {
        switchMode("intense");
    }

    function setSoft() {
        switchMode("soft");
    }

    // ===== SECTION 10 =====
    // FADE HELPERS
    // =====================================

    function fadeOut(audio, duration, onDone) {

        if (!audio) {
            if (typeof onDone === "function") {
                onDone();
            }
            return;
        }

        const steps = 20;
        const stepTime = duration / steps;
        const startVol = audio.volume;
        let step = 0;

        const interval = setInterval(
            function() {

                step++;

                audio.volume = Math.max(
                    0,
                    startVol * (1 - step / steps)
                );

                if (step >= steps) {

                    clearInterval(interval);
                    audio.pause();
                    audio.currentTime = 0;

                    if (
                        typeof onDone ===
                        "function"
                    ) {
                        onDone();
                    }
                }
            },
            stepTime
        );
    }

    function fadeIn(audio, duration) {

        if (!audio) {
            return;
        }

        audio.volume = 0;

        const steps = 20;
        const stepTime = duration / steps;
        let step = 0;

        const interval = setInterval(
            function() {

                step++;

                audio.volume = Math.min(
                    musicVolume,
                    musicVolume * (step / steps)
                );

                if (step >= steps) {
                    clearInterval(interval);
                }
            },
            stepTime
        );
    }

    // ===== SECTION 11 =====
    // STOP ALL
    // =====================================

    function stopAll() {

        playlistActive = false;

        if (currentMusic) {
            currentMusic.pause();
            currentMusic = null;
        }

        currentMusicKey = null;
        isMusicPaused = false;
    }

    // ===== SECTION 12 =====
    // PAUSE / RESUME
    // =====================================

    function pauseMusic() {

        if (
            currentMusic &&
            !currentMusic.paused
        ) {
            currentMusic.pause();
            isMusicPaused = true;
        }
    }

    function resumeMusic() {

        if (
            currentMusic &&
            isMusicPaused
        ) {
            currentMusic
                .play()
                .catch(function() {});

            isMusicPaused = false;
        }
    }

    // ===== SECTION 13 =====
    // VOLUME CONTROL
    // =====================================

    function setMusicVolume(val) {

        musicVolume =
            Math.max(0, Math.min(1, val));

        if (currentMusic) {
            currentMusic.volume =
                musicVolume;
        }

        // Check Silence Is Golden
        if (
            musicVolume === 0 &&
            sfxVolume === 0 &&
            typeof AchievementManager !==
                "undefined"
        ) {
            AchievementManager
                .tryUnlock("silence_is_golden");
        }
    }

    function setSfxVolume(val) {

        sfxVolume =
            Math.max(0, Math.min(1, val));

        // Check Silence Is Golden
        if (
            musicVolume === 0 &&
            sfxVolume === 0 &&
            typeof AchievementManager !==
                "undefined"
        ) {
            AchievementManager
                .tryUnlock("silence_is_golden");
        }
    }

    function getMusicVolume() {
        return musicVolume;
    }

    function getSfxVolume() {
        return sfxVolume;
    }

    // ===== SECTION 14 =====
    // SHUFFLE HELPER
    // =====================================

    function shuffleArray(arr) {

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

    // ===== SECTION 15 =====
    // LEGACY STUBS
    // Keep these so existing calls to
    // playMusic("music_menu") don't crash.
    // =====================================

    function playMusic(key) {

        if (key === "music_menu") {
            playSimpleMusic("menu");
            return;
        }

        if (key === "music_about") {
            playSimpleMusic("about");
            return;
        }

        if (key === "music_campaign") {
            return;
        }

        if (key === "music_marathon") {
            return;
        }
    }

    function stopMusic() {
        stopAll();
    }

    // ===== SECTION 16 =====
    // PUBLIC API
    // =====================================

    return {
        playSfx,
        playCompleteSfx,
        playSimpleMusic,
        playPlaylist,
        setIntense,
        setSoft,
        stopAll,
        pauseMusic,
        resumeMusic,
        setMusicVolume,
        setSfxVolume,
        getMusicVolume,
        getSfxVolume,
        playMusic,
        stopMusic
    };

})();

window.AudioSystem = AudioSystem;