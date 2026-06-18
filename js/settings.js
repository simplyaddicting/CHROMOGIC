// =====================================
// CHROMOGIC
// settings.js
// =====================================

// ===== SECTION 1 =====
// SETTINGS STATE
// =====================================

const SettingsManager = (() => {

    let current = {
        theme:        "dark",
        colorblind:   false,
        musicVolume:  0.7,
        sfxVolume:    0.8
    };

    // ===== SECTION 2 =====
    // LOAD FROM SAVE
    // =====================================

    function load(savedSettings) {

        if (!savedSettings) {
            return;
        }

        current = {
            ...current,
            ...savedSettings
        };

        apply();
    }

    // ===== SECTION 3 =====
    // APPLY ALL SETTINGS
    // =====================================

    function apply() {

        applyTheme(current.theme);

        applyColorblind(
            current.colorblind
        );

        AudioSystem
            .setMusicVolume(
                current.musicVolume
            );

        AudioSystem
            .setSfxVolume(
                current.sfxVolume
            );

        syncUI();
    }

    // ===== SECTION 4 =====
    // THEME
    // =====================================

    function applyTheme(theme) {

        document.body.classList
            .remove(
                "theme-dark",
                "theme-light"
            );

        document.body.classList
            .add(
                `theme-${theme}`
            );

        current.theme = theme;
    }

    // ===== SECTION 5 =====
    // INTENSITY
    // Sets CSS --intensity variable so the
    // UI darkens as puzzle difficulty rises.
    // Call this whenever puzzle changes.
    // intensity: 0.0 (easy) to 1.0 (expert)
    // =====================================

    function applyIntensity(intensity) {

        document.documentElement
            .style.setProperty(
                "--intensity",
                intensity
            );
    }

    // ===== SECTION 6 =====
    // COLORBLIND MODE
    // Swaps CSS color variables to the
    // colorblind-safe palette.
    // (Both palettes use the same hex values
    //  in this game, but the hook is here
    //  for future palette swaps.)
    // =====================================

    function applyColorblind(enabled) {

        current.colorblind = enabled;

        const palette =
            enabled
                ? COLORBLIND_PALETTE
                : COLOR_PALETTE;

        const root =
            document.documentElement;

        Object.keys(palette).forEach(
            id => {
                root.style.setProperty(
                    `--color-${id}`,
                    palette[id].hex
                );
            }
        );
    }

    // ===== SECTION 7 =====
    // SYNC SETTINGS UI
    // =====================================

    function syncUI() {

        const themeDark =
            document.getElementById(
                "themeDark"
            );

        const themeLight =
            document.getElementById(
                "themeLight"
            );

        const colorblindToggle =
            document.getElementById(
                "colorblindToggle"
            );

        const colorblindLabel =
            document.getElementById(
                "colorblindLabel"
            );

        const musicSlider =
            document.getElementById(
                "musicVolume"
            );

        const sfxSlider =
            document.getElementById(
                "sfxVolume"
            );

        if (themeDark && themeLight) {

            themeDark.classList
                .toggle(
                    "active",
                    current.theme === "dark"
                );

            themeLight.classList
                .toggle(
                    "active",
                    current.theme === "light"
                );
        }

        if (colorblindToggle) {

            colorblindToggle.checked =
                current.colorblind;
        }

        if (colorblindLabel) {

            colorblindLabel.textContent =
                current.colorblind
                    ? "On"
                    : "Off";
        }

        if (musicSlider) {
            musicSlider.value =
                current.musicVolume;
        }

        if (sfxSlider) {
            sfxSlider.value =
                current.sfxVolume;
        }
    }

    // ===== SECTION 8 =====
    // GETTERS
    // =====================================

    function get() {
        return { ...current };
    }

    function getTheme() {
        return current.theme;
    }

    function isColorblind() {
        return current.colorblind;
    }

    // ===== SECTION 9 =====
    // SETTERS
    // =====================================

    function setTheme(theme) {
        AchievementManager.tryUnlock(
            "settings_touched"
        );
        applyTheme(theme);

        StorageManager.updateSettings(
            current
        );
    }

    function setColorblind(enabled) {
        AchievementManager.tryUnlock(
            "colorblind_mode"
        );
        applyColorblind(enabled);

        StorageManager.updateSettings(
            current
        );
    }

    function setMusicVolume(val) {
        AchievementManager.tryUnlock(
            "settings_touched"
        );
        current.musicVolume = val;

        AudioSystem.setMusicVolume(val);

        StorageManager.updateSettings(
            current
        );
    }

    function setSfxVolume(val) {
        AchievementManager.tryUnlock(
            "settings_touched"
        );
        current.sfxVolume = val;

        AudioSystem.setSfxVolume(val);

        StorageManager.updateSettings(
            current
        );
    }

    // ===== SECTION 10 =====
    // BIND SETTINGS SCREEN EVENTS
    // =====================================

    function bindEvents() {

        const themeDark =
            document.getElementById(
                "themeDark"
            );

        const themeLight =
            document.getElementById(
                "themeLight"
            );

        const colorblindToggle =
            document.getElementById(
                "colorblindToggle"
            );

        const colorblindLabel =
            document.getElementById(
                "colorblindLabel"
            );

        const musicSlider =
            document.getElementById(
                "musicVolume"
            );

        const sfxSlider =
            document.getElementById(
                "sfxVolume"
            );

        const resetBtn =
            document.getElementById(
                "resetSaveBtn"
            );

        const backBtn =
            document.getElementById(
                "settingsBackBtn"
            );

        if (themeDark) {

            themeDark.addEventListener(
                "click",
                () => {

                    setTheme("dark");

                    syncUI();
                }
            );
        }

        if (themeLight) {

            themeLight.addEventListener(
                "click",
                () => {

                    setTheme("light");

                    syncUI();
                }
            );
        }

        if (colorblindToggle) {

            colorblindToggle
                .addEventListener(
                    "change",
                    () => {

                        setColorblind(
                            colorblindToggle
                                .checked
                        );

                        if (colorblindLabel) {

                            colorblindLabel
                                .textContent =
                                colorblindToggle
                                    .checked
                                    ? "On"
                                    : "Off";
                        }
                    }
                );
        }

        if (musicSlider) {

            musicSlider.addEventListener(
                "input",
                () => {

                    setMusicVolume(
                        Number(
                            musicSlider.value
                        )
                    );
                }
            );
        }

        if (sfxSlider) {

            sfxSlider.addEventListener(
                "input",
                () => {

                    setSfxVolume(
                        Number(
                            sfxSlider.value
                        )
                    );
                }
            );
        }

        if (resetBtn) {

            resetBtn.addEventListener(
                "click",
                () => {

                    const confirmed =
                        confirm(
                            "Reset all save data? This cannot be undone."
                        );

                    if (confirmed) {

                        StorageManager
                            .reset();

                        location.reload();
                    }
                }
            );
        }

        if (backBtn) {

            backBtn.addEventListener(
                "click",
                function() {

                    ScreenManager
                        .showScreen(
                            "menuScreen"
                        );
                }
            );
        }
    }

    // ===== SECTION 11 =====
    // PUBLIC API
    // =====================================

    return {
        load,
        apply,
        applyIntensity,
        get,
        getTheme,
        isColorblind,
        setTheme,
        setColorblind,
        setMusicVolume,
        setSfxVolume,
        bindEvents,
        syncUI
    };

})();

window.SettingsManager = SettingsManager;