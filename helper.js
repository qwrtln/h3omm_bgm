const FACTION_COLORS = {
    'castle': '#73B7EB',
    'rampart': '#228B22',
    'tower': '#909090',
    'inferno': '#B22222',
    'dungeon': '#9370C5',
    'necropolis': '#666666',
    'fortress': '#556B2F',
    'stronghold': '#A67C52',
    'conflux': '#C158C1',
    'cove': '#20B2AA',
    'factory': '#fbff04ff',
    'neutral': '#333333' // Default
};

// Cleaned up list for easier logic
const TERRAIN_NAMES = [
    'dirt', 'grass', 'lava', 'rough',
    'sand', 'snow', 'swamp', 'underground',
    'water', 'wasteland',
];

const ASSET_QUEUE = [
    // 1. Audio (Music & SFX)
    'assets/main.mp3',
    'assets/good.mp3', 'assets/evil.mp3', 'assets/neutral.mp3', 'assets/secret.mp3',
    'assets/castle.mp3', 'assets/rampart.mp3', 'assets/tower.mp3',
    'assets/inferno.mp3', 'assets/dungeon.mp3', 'assets/necropolis.mp3',
    'assets/fortress.mp3', 'assets/stronghold.mp3',
    'assets/conflux.mp3', 'assets/cove.mp3', 'assets/factory.mp3',
    'assets/battle1.mp3', 'assets/battle2.mp3', 'assets/battle3.mp3', 'assets/battle4.mp3',
    'assets/battle5.mp3', 'assets/battle6.mp3', 'assets/battle7.mp3', 'assets/battle8.mp3',
    'assets/combat1.mp3', 'assets/combat2.mp3', 'assets/combat3.mp3', 'assets/combat4.mp3',
    'assets/ai1.mp3', 'assets/ai2.mp3', 'assets/ai3.mp3',
    'assets/gold.avif', 'assets/valuable.avif',
    'assets/artifact.mp3',
    'assets/newday.mp3', 'assets/newweek.mp3', 'assets/newmonth.mp3',
    'assets/win_battle.mp3', 
    'assets/experience.mp3', 'assets/lose.mp3', 'assets/retreat.mp3', 'assets/surrender.mp3',
    'assets/win_game.mp3', 'assets/ultimatelose.mp3',

    // Treasure
    `assets/treasure1.mp3`, `assets/treasure2.mp3`, `assets/treasure3.mp3`,
    `assets/treasure4.mp3`, `assets/treasure5.mp3`, `assets/treasure6.mp3`,
    `assets/treasure7.mp3`, `assets/gold.mp3`,

    // Terrain
    `assets/dirt.mp3`, `assets/grass.mp3`, `assets/lava.mp3`,
    `assets/rough.mp3`, `assets/sand.mp3`, `assets/snow.mp3`,
    `assets/swamp.mp3`, `assets/underground.mp3`, `assets/water.mp3`,
    `assets/wasteland.mp3`,

    // 2. Images 
    'assets/good.avif', 'assets/evil.avif', 'assets/neutral.avif', 'assets/secret.avif',
    'assets/castle.avif', 'assets/rampart.avif', 'assets/tower.avif',
    'assets/inferno.avif', 'assets/dungeon.avif', 'assets/necropolis.avif',
    'assets/fortress.avif', 'assets/stronghold.avif',
    'assets/conflux.avif', 'assets/cove.avif', 'assets/factory.avif',
    'assets/newday.avif', 'assets/newtime.avif','./assets/tile.avif',
    'assets/start.avif', 'assets/resource.avif', 'assets/artifact.avif', 
    'assets/end_turn.avif', 'assets/rules.avif', 'assets/win_game.avif',
    'assets/victory.avif', 'assets/retreat.avif', 'assets/lose.avif', 'assets/eliminated.avif', 'assets/surrender.avif',
    // Terrains
    'assets/dirt.avif', 'assets/grass.avif', 'assets/lava.avif', 'assets/rough.avif',
    'assets/sand.avif', 'assets/snow.avif', 'assets/swamp.avif', 'assets/underground.avif',
    'assets/water.avif', 'assets/wasteland.avif'
];

const LANG_FLAGS = {
    'en': '🇬🇧', 
    'cs': '🇨🇿', 
    'de': '🇩🇪', 
    'es': '🇪🇸',
    'fr': '🇫🇷', 
    'he': '🇮🇱', 
    'pl': '🇵🇱', 
    'ru': '🇷🇺', 
    'ua': '🇺🇦'
};

const Localization = {
    lang: 'en', // Default

    init() {
        // 1. Check LocalStorage
        const storedLang = localStorage.getItem('h3_lang');
        
        if (storedLang && TRANSLATIONS[storedLang]) {
            this.lang = storedLang;
        } else {
            // 2. Fallback to Browser Detection
            const userLang = navigator.language || navigator.userLanguage; 
            const shortLang = userLang.split('-')[0];
            if (TRANSLATIONS[shortLang]) {
                this.lang = shortLang;
            } else {
                this.lang = 'en';
            }
        }
        
        this.updateFlagUI();
        this.renderLanguageMenu();
        this.localizePage();
    },

    setLang(newLang) {
        if (TRANSLATIONS[newLang]) {
            this.lang = newLang;
            localStorage.setItem('h3_lang', newLang);
            this.updateFlagUI();
            this.localizePage();
            
            // --- DYNAMIC TEXT UPDATE ---
            // Fix: Immediately refresh content that depends on game state
            if (typeof Game !== 'undefined' && Game.state.players.length > 0) {
                const player = Game.state.players[Game.state.currentPlayerIndex];
                if (player) {
                    // 1. Update Overworld Title (e.g. "Player 1's Turn")
                    const titleEl = document.getElementById('overworld-title');
                    if (titleEl) {
                        titleEl.innerText = this.get('turn_title', player.name);
                    }

                    // 2. Update Faction Subtitle (e.g. "Castle")
                    const factionEl = document.getElementById('overworld-faction-subtitle');
                    if (factionEl) {
                        factionEl.innerText = this.get(`faction_${player.faction}`);
                    }

                    // 3. Update Theme Selector Label if visible (e.g. "Castle (Town)")
                    const themeLabel = document.getElementById('theme-faction-label');
                    if (themeLabel) {
                        const factionName = this.get(`faction_${player.faction}`);
                        const townLabel = this.get('btn_town');
                        themeLabel.innerText = `${factionName} (${townLabel})`;
                    }
                }
            }

            // Stats Update (if needed)
            if (document.getElementById('screen-stats').style.display !== 'none') {
                Game.showStats(Game.state.statsViewIndex);
            }
            
            // Close submenu if open
            const submenu = document.getElementById('lang-submenu');
            if (submenu) submenu.style.display = 'none';
        }
    },

    updateFlagUI() {
        const flagIcon = LANG_FLAGS[this.lang] || '🌐';
        const btn = document.getElementById('current-lang-icon');
        if (btn) btn.innerText = flagIcon;
    },

    renderLanguageMenu() {
        const submenu = document.getElementById('lang-submenu');
        if (!submenu) return;
        
        submenu.innerHTML = ''; // Clear current
        
        Object.keys(TRANSLATIONS).forEach(key => {
            const flag = LANG_FLAGS[key] || key.toUpperCase();
            const div = document.createElement('div');
            div.className = 'lang-option';
            div.innerText = flag;
            div.onclick = () => this.setLang(key);
            submenu.appendChild(div);
        });
    },

    // Get a string by key, optionally replacing placeholders {0}, {1}, etc.
    get(key, ...args) {
        let str = (TRANSLATIONS[this.lang] && TRANSLATIONS[this.lang][key]) 
                  ? TRANSLATIONS[this.lang][key] 
                  : (TRANSLATIONS['en'][key] || key);

        args.forEach((arg, index) => {
            str = str.replace(`{${index}}`, arg);
        });
        return str;
    },

    // Update all HTML elements with data-i18n attribute
    localizePage() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.get(key);
            if (translation) {
                el.innerHTML = translation;
            }
        });
    }
};

const Game = {
    state: {
        currentScreen: 'screen-start',
        players: [], 
        currentPlayerIndex: 0,
        round: 1,
        selectedTheme: null,
        playerCount: 3,
        lastAiIdx: -1,
        lastBattleIdx: -1,
        lastCombatIdx: -1,
        lastTreasureIdx: -1,
        musicTimer: null,
        currentOverworldName: null, // Holds 'castle', 'dirt', 'lava', etc.
        trackPositions: {},
        pendingGameOver: null,
        tempPlayerName: "",
        isAutoplay: true,
        lastTerrain: null,
        statsViewIndex: 0, // Which player stats are we looking at

        // --- STATS SYSTEM STATE ---
        timerMode: 'setup', // 'setup', 'overworld', 'battle', 'rules', 'paused', 'ended'
        lastTick: 0,
        stats: {
            appLoadedAt: 0,
            setupTime: 0,
            gameStartTime: 0,
            gameEndTime: 0,
            totalRulesTime: 0
        }
    },

    audio: {
        ch1: new Audio(),
        ch2: new Audio(),
        activeChannel: 'ch1',
        sfx: new Audio(),
        currentBgUrl: null,
        fadeInterval: null,
        masterVolume: 1.0,
        isMuted: false
    },

    // --- AUDIO ENGINE ---
    playBg(url, fade = true, loop = true) {
        const fullUrl = url.includes('/') ? url : `assets/${url}`;
        if (this.audio.currentBgUrl === fullUrl && !this.state.isAutoplay) return;

        if (this.state.musicTimer) {
            clearTimeout(this.state.musicTimer);
            this.state.musicTimer = null;
        }

        if (this.audio.currentBgUrl) {
            const currentActiveChannel = this.audio[this.audio.activeChannel];
            this.state.trackPositions[this.audio.currentBgUrl] = currentActiveChannel.currentTime;
        }

        if (this.audio.fadeInterval) {
            clearInterval(this.audio.fadeInterval);
            this.audio.fadeInterval = null;
        }

        const outgoing = this.audio[this.audio.activeChannel];
        const nextChannelName = (this.audio.activeChannel === 'ch1') ? 'ch2' : 'ch1';
        const incoming = this.audio[nextChannelName];

        incoming.src = fullUrl;
        const savedTime = this.state.trackPositions[fullUrl] || 0;
        incoming.currentTime = savedTime;
        incoming.loop = loop;
        incoming.volume = 0;
        incoming.muted = this.audio.isMuted;
        this.audio.currentBgUrl = fullUrl;
        this.audio.activeChannel = nextChannelName;

        const playPromise = incoming.play();
        if (playPromise) playPromise.catch(e => console.error("Audio Play Err:", e));

        if (!fade) {
            incoming.volume = this.audio.masterVolume;
            outgoing.pause();
            outgoing.volume = 0;
        } else {
            this.audio.fadeInterval = setInterval(() => {
                const step = 0.05;
                let isDone = true;
                const targetVol = this.audio.masterVolume;

                if (incoming.volume < targetVol) {
                    incoming.volume = Math.min(targetVol, incoming.volume + step);
                    isDone = false;
                } else if (incoming.volume > targetVol) {
                    incoming.volume = targetVol; // Clamp if user lowered slider mid-fade
                }

                if (outgoing.volume > 0) {
                    outgoing.volume = Math.max(0, outgoing.volume - step);
                    isDone = false;
                }
                
                if (isDone) {
                    clearInterval(this.audio.fadeInterval);
                    this.audio.fadeInterval = null;
                    outgoing.pause();
                }
            }, 50);
        }
    },

    stopBg(hardStop = false) {
        if (this.state.musicTimer) {
            clearTimeout(this.state.musicTimer);
            this.state.musicTimer = null;
        }

        if (this.audio.fadeInterval) {
            clearInterval(this.audio.fadeInterval);
            this.audio.fadeInterval = null;
        }

        if (this.audio.currentBgUrl) {
            this.state.trackPositions[this.audio.currentBgUrl] = this.audio[this.audio.activeChannel].currentTime;
        }

        this.audio.currentBgUrl = null;
        const c1 = this.audio.ch1;
        const c2 = this.audio.ch2;

        if (hardStop) {
            c1.pause();
            c2.pause();
            c1.volume = 0;
            c2.volume = 0;
            return;
        }

        this.audio.fadeInterval = setInterval(() => {
            let activeVol = false;
            if (c1.volume > 0) {
                c1.volume = Math.max(0, c1.volume - 0.1);
                activeVol = true;
            }
            if (c2.volume > 0) {
                c2.volume = Math.max(0, c2.volume - 0.1);
                activeVol = true;
            }
            if (!activeVol) {
                clearInterval(this.audio.fadeInterval);
                this.audio.fadeInterval = null;
                c1.pause();
                c2.pause();
            }
        }, 50);
    },

    resumeBg() {
        const active = this.audio[this.audio.activeChannel];
        if (this.audio.currentBgUrl && active.paused) {
            active.volume = this.audio.masterVolume;
            active.play().catch(e => console.log("Resume err", e));
        }
    },

    playSfx(filename, onComplete = null) {
        this.audio.sfx.pause();
        this.audio.sfx.onended = null;
        this.audio.sfx.onerror = null;

        this.audio.sfx.src = `assets/${filename}`;
        this.audio.sfx.loop = false;
        this.audio.sfx.volume = this.audio.masterVolume;
        this.audio.sfx.muted = this.audio.isMuted;
        if (onComplete) {
            const handleDone = () => {
                this.audio.sfx.onended = null;
                this.audio.sfx.onerror = null;
                onComplete();
            };
            this.audio.sfx.onended = handleDone;
            this.audio.sfx.onerror = handleDone;
        }

        this.audio.sfx.play().catch(e => {
            if(onComplete) onComplete();
        });
    },

    setVolume(val) {
        const volume = parseFloat(val);
        this.audio.masterVolume = volume;
        this.audio.sfx.volume = volume;
        if (!this.audio.fadeInterval) {
            this.audio.ch1.volume = volume;
            this.audio.ch2.volume = volume;
        }
    },

    toggleMute() {
        this.audio.isMuted = !this.audio.isMuted;
        this.audio.ch1.muted = this.audio.isMuted;
        this.audio.ch2.muted = this.audio.isMuted;
        this.audio.sfx.muted = this.audio.isMuted;
        document.getElementById('mute-btn').innerText = this.audio.isMuted ? '🔇' : '🔊';
        document.getElementById('mute-btn').classList.toggle('is-muted', this.audio.isMuted);
    },

    initPreloader() {
        let qIndex = 0;
        const loadNext = () => {
            if (qIndex >= ASSET_QUEUE.length) return;
            const url = ASSET_QUEUE[qIndex];
            qIndex++;
            fetch(url).then(() => loadNext()).catch(() => loadNext());
        };
        loadNext();
    },

    // --- TIMER / STATS LOGIC ---

    commitTime() {
        if (!this.state.lastTick) return;
        const now = Date.now();
        const delta = now - this.state.lastTick;
        this.state.lastTick = now;

        if (delta <= 0) return;

        const mode = this.state.timerMode;
        
        if (mode === 'setup') {
            this.state.stats.setupTime += delta;
        } else if (mode === 'rules') {
            this.state.stats.totalRulesTime += delta;
        } else {
            // Player related timers
            const player = this.state.players[this.state.currentPlayerIndex];
            if (!player) return;

            if (mode === 'overworld') {
                player.stats.currentTurnElapsed += delta;
            } else if (mode === 'battle') {
                player.stats.totalBattleTime += delta;
            }
        }
    },

    setTimerMode(mode) {
        // Commit time for previous mode
        this.commitTime();
        // Set new mode
        this.state.timerMode = mode;
        this.state.lastTick = Date.now();
    },

    pushTurnStats() {
        const player = this.state.players[this.state.currentPlayerIndex];
        if (player) {
            player.stats.turnHistory.push(player.stats.currentTurnElapsed);
            player.stats.currentTurnElapsed = 0;
        }
    },

    // --- GAME LOGIC ---

    init() {
        this.state.lastTick = Date.now();
        this.state.stats.appLoadedAt = Date.now();
        this.state.timerMode = 'setup';

        document.getElementById('click-overlay').style.display = 'none';
        this.playBg('assets/main.mp3');
        this.showScreen('screen-start');
        this.updateFactionColor('neutral');
        this.initPreloader(); 

        this.audio.ch1.onended = () => this.handleAudioEnd();
        this.audio.ch2.onended = () => this.handleAudioEnd();
    },

    toggleOptionsMenu() {
        const menu = document.getElementById('options-menu');
        const isMobile = window.innerWidth <= 1024;
        
        if (isMobile) {
            if (menu.style.display === 'flex') {
                menu.style.display = 'none';
                // Close language submenu when closing main menu
                document.getElementById('lang-submenu').style.display = 'none';
            } else {
                menu.style.display = 'flex';
            }
        }
    },

    toggleLanguageMenu() {
        const submenu = document.getElementById('lang-submenu');
        const isHidden = submenu.style.display === 'none' || submenu.style.display === '';
        submenu.style.display = isHidden ? 'grid' : 'none';
    },

    toggleAutoplay() {
        this.state.isAutoplay = !this.state.isAutoplay;
        const btn = document.getElementById('autoplay-toggle');
        
        if (this.state.isAutoplay) {
            btn.classList.add('active');
            if (this.state.currentScreen === 'screen-overworld') {
                const active = this.audio[this.audio.activeChannel];
                if (active && active.loop) {
                   this.playBg(this.getCurrentOverworldMusic(), true, false); 
                }
            }
        } else {
            btn.classList.remove('active');
            if (this.state.currentScreen === 'screen-overworld') {
                const active = this.audio[this.audio.activeChannel];
                if (active) active.loop = true;
            }
        }
    },

    handleAudioEnd() {
        if (!this.state.isAutoplay) return;
        if (this.state.currentScreen !== 'screen-overworld') return;

        // Logic: Town -> Random Terrain -> Town -> Different Random Terrain
        const player = this.state.players[this.state.currentPlayerIndex];
        const faction = player.faction;
        
        let nextTheme = '';

        if (this.state.currentOverworldName === faction) {
            let nextTerrain;
            do {
                const randIndex = Math.floor(Math.random() * TERRAIN_NAMES.length);
                nextTerrain = TERRAIN_NAMES[randIndex];
            } while (nextTerrain === this.state.lastTerrain && TERRAIN_NAMES.length > 1);
            
            this.state.lastTerrain = nextTerrain;
            nextTheme = nextTerrain;
        } else {
            nextTheme = faction;
        }

        this.state.currentOverworldName = nextTheme;
        this.updateThemeButtonUI();
        const nextUrl = `assets/${nextTheme}.mp3`;
        this.state.trackPositions[nextUrl] = 0;

        this.playBg(nextUrl, true, false); 
    },

    updateFactionColor(faction) {
        const color = FACTION_COLORS[faction] || FACTION_COLORS['neutral'];
        document.documentElement.style.setProperty('--faction-color', color);
    },

    selectTheme(theme) {
        this.state.selectedTheme = theme;
        this.playBg(`assets/${theme}.mp3`);
        this.showScreen('screen-players');
    },

    confirmPlayerCount(count) {
        this.state.playerCount = count;
        this.state.players = [];
        this.startFactionSelection(0);
    },

    startFactionSelection(playerIndex) {
        if (playerIndex >= this.state.playerCount) {
            this.showPreGame();
            return;
        }
        
        const defaultName = Localization.get('default_player_name', playerIndex + 1);

        this.state.tempPlayerName = defaultName;
        document.getElementById('faction-player-title').innerText = defaultName;
        
        this.showScreen('screen-factions');
        
        const takenFactions = this.state.players.map(p => p.faction);
        
        const buttons = document.querySelectorAll('.faction-btn');
        buttons.forEach(btn => {
            const faction = btn.dataset.faction;
            if (takenFactions.includes(faction)) {
                btn.classList.add('disabled');
                btn.onclick = null;
            } else {
                btn.classList.remove('disabled');
                btn.onclick = () => {
                    this.state.players.push({ 
                        id: playerIndex, 
                        faction: faction, 
                        name: this.state.tempPlayerName,
                        eliminated: false,
                        // New Stats Struct
                        stats: {
                            turnHistory: [],
                            currentTurnElapsed: 0,
                            totalBattleTime: 0,
                            combat: { wins: 0, losses: 0, retreats: 0, surrenders: 0 },
                            loot: { gold: 0, valuable: 0, artifact: 0 }
                        }
                    });
                    this.startFactionSelection(playerIndex + 1);
                };
            }
        });
    },

    editName() {
        const newName = prompt("Enter Player Name:", this.state.tempPlayerName);
        if (newName && newName.trim() !== "") {
            this.state.tempPlayerName = newName.trim();
            document.getElementById('faction-player-title').innerText = this.state.tempPlayerName;
        }
    },

    showPreGame() {
        this.showScreen('screen-pregame');
        this.updateFactionColor('neutral');
    },

    startGame() {
        this.commitTime(); // Commit setup time
        this.state.stats.gameStartTime = Date.now();
        this.state.round = 1;
        this.state.currentPlayerIndex = 0;
        this.startTurn(false); 
    },

    startTurn(isTransition = true, musicDelay = 0) {
        if (this.state.musicTimer) {
            clearTimeout(this.state.musicTimer);
            this.state.musicTimer = null;
        }
        
        // Timer Logic
        this.setTimerMode('overworld');

        const player = this.state.players[this.state.currentPlayerIndex];
        
        if (player.eliminated) {
            this.endTurn();
            return;
        }

        this.state.trackPositions = {};
        this.state.currentOverworldName = player.faction;
        
        document.getElementById('overworld-title').innerText = Localization.get('turn_title', player.name);
        
        const factionKey = `faction_${player.faction}`;
        document.getElementById('overworld-faction-subtitle').innerText = Localization.get(factionKey);

        this.updateFactionColor(player.faction);
        this.updateThemeButtonUI();
        
        this.showScreen('screen-overworld');
        
        const overworldMusic = `assets/${this.state.currentOverworldName}.mp3`;
        const shouldLoop = !this.state.isAutoplay;

        if (this.state.isAutoplay) {
             this.state.trackPositions[overworldMusic] = 0;
        }

        if (!isTransition) {
            this.playBg(overworldMusic, true, shouldLoop);
        } else {
            setTimeout(() => {
                if(this.state.currentScreen === 'screen-overworld') {
                    this.playBg(overworldMusic, true, shouldLoop);
                }
            }, musicDelay);
        }
    },

    openThemeSelector() {
        const player = this.state.players[this.state.currentPlayerIndex];
        const faction = player.faction;

        const factionBtn = document.getElementById('theme-faction-btn');
        const factionLabel = document.getElementById('theme-faction-label');
        
        const factionName = Localization.get(`faction_${faction}`);
        const townLabel = Localization.get('btn_town');
        factionLabel.innerText = `${factionName} (${townLabel})`;
        
        factionBtn.style.backgroundImage = `url('assets/${faction}.avif')`;
        
        factionBtn.onclick = () => {
            this.applyThemeSelection(faction);
        };
        this.showScreen('screen-theme-select');
    },

    applyThemeSelection(themeName) {
        this.state.currentOverworldName = themeName;
        this.updateThemeButtonUI();
        
        const shouldLoop = !this.state.isAutoplay;
        const url = `assets/${themeName}.mp3`;
        
        if (this.state.isAutoplay) {
             this.state.trackPositions[url] = 0;
        }

        this.playBg(url, true, shouldLoop);
        this.showScreen('screen-overworld');
    },

    updateThemeButtonUI() {
        const btn = document.getElementById('btn-theme-toggle');
        const currentName = this.state.currentOverworldName;
        btn.style.backgroundImage = `url('assets/${currentName}.avif')`;
    },

    getCurrentOverworldMusic() {
        return `assets/${this.state.currentOverworldName}.mp3`;
    },

    endTurn() {
        // Commit turn time
        this.commitTime();
        this.pushTurnStats(); // Save duration to array

        let nextIndex = this.state.currentPlayerIndex;
        let loopCount = 0;
        let found = false;
        let nextRound = this.state.round;
        let isNewRound = false;

        while(loopCount < this.state.players.length) {
            nextIndex++;
            if (nextIndex >= this.state.players.length) {
                nextIndex = 0;
                isNewRound = true;
            }

            if (!this.state.players[nextIndex].eliminated) {
                found = true;
                break;
            }
            loopCount++;
        }

        if (!found) {
            this.finishGameSequence('assets/lose.avif', 'Defeat', 'assets/ultimatelose.mp3', false);
            return;
        }
        
        if (isNewRound) {
            nextRound++;
        }

         let sfxToPlay = 'newday.mp3';
        let overlayText = Localization.get('event_new_day');
        let image = "url('assets/newday.avif')";

        if (isNewRound) {
            if (nextRound % 2 === 0) {
                sfxToPlay = 'newmonth.mp3';
                overlayText = Localization.get('event_astrologers');
            } else {
                sfxToPlay = 'newweek.mp3';
                overlayText = Localization.get('event_resource_round');
            }
            image = "url('assets/newtime.avif')";
        }

        this.stopBg(true);

        const ol = document.getElementById('event-overlay');
        ol.style.backgroundImage = image;
        document.getElementById('event-text').innerHTML = overlayText;
        ol.style.display = 'flex';
        this.playSfx(sfxToPlay, () => {
            document.getElementById('event-overlay').style.display = 'none';
            this.state.currentPlayerIndex = nextIndex;
            this.state.round = nextRound;
            this.startTurn(true, 0);
        });
    },

    handleResource() {
        document.getElementById('resource-popup').style.display = 'flex';
    },

    handleResourceChoice(type) {
        document.getElementById('resource-popup').style.display = 'none';

        // Stats Update
        const player = this.state.players[this.state.currentPlayerIndex];
        if (player) {
            if (type === 'gold') player.stats.loot.gold++;
            if (type === 'valuable') player.stats.loot.valuable++;
            if (type === 'artifact') player.stats.loot.artifact++;
        }

        this.audio.ch1.pause();
        this.audio.ch2.pause();

        if (type === 'gold') {
            this.playSfx('gold.mp3', () => this.resumeBg());
        } else if (type === 'valuable') {
            let introNum;
            do {
                introNum = Math.floor(Math.random() * 7) + 1;
            } while (introNum === this.state.lastTreasureIdx);
            
            this.state.lastTreasureIdx = introNum;
            this.playSfx(`treasure${introNum}.mp3`, () => this.resumeBg());
        } else if (type === 'artifact') {
            this.playSfx('artifact.mp3', () => this.resumeBg());
        }
    },

    askEliminate() {
        const player = this.state.players[this.state.currentPlayerIndex];
        this.state.pendingGameOver = 'eliminate';
        document.getElementById('confirm-msg').innerText = Localization.get('msg_eliminate_confirm', player.name);
        document.getElementById('confirm-overlay').style.display = 'flex';
    },

    startCombat() {
        this.stopBg();
        this.setTimerMode('battle'); // Timer Switch

        document.getElementById('combat-title').innerText = Localization.get('combat_title', this.state.players[this.state.currentPlayerIndex].name);

        let introNum;
        do {
            introNum = Math.floor(Math.random() * 8) + 1;
        } while (introNum === this.state.lastBattleIdx && introNum !== 0);
        this.state.lastBattleIdx = introNum;
        
        let combatNum;
        do {
            combatNum = Math.floor(Math.random() * 4) + 1;
        } while (combatNum === this.state.lastCombatIdx);
        this.state.lastCombatIdx = combatNum;

        const introFile = `battle${introNum}.mp3`;
        const combatFile = `assets/combat${combatNum}.mp3`;

        this.showScreen('screen-combat');

        this.playSfx(introFile, () => {
            this.playBg(combatFile, false); 
        });
    },

    combatVictory() {
        this.state.players[this.state.currentPlayerIndex].stats.combat.wins++;
        this.stopBg();
        this.showCombatOverlay(Localization.get('msg_victory'), "assets/victory.avif");
        this.playSfx('win_battle.mp3', () => this.returnToOverworld());
    },

    combatRetreat() {
        this.state.players[this.state.currentPlayerIndex].stats.combat.retreats++;
        this.stopBg();
        this.showCombatOverlay(Localization.get('msg_retreat'), "assets/retreat.avif");
        this.playSfx('retreat.mp3', () => this.returnToOverworld());
    },

    combatSurrender() {
        this.state.players[this.state.currentPlayerIndex].stats.combat.surrenders++;
        this.stopBg();
        this.showCombatOverlay(Localization.get('msg_surrender'), "assets/surrender.avif");
        this.playSfx('surrender.mp3', () => this.returnToOverworld());
    },

    combatLose() {
        this.state.players[this.state.currentPlayerIndex].stats.combat.losses++;
        this.stopBg();
        this.showCombatOverlay(Localization.get('msg_defeat'), "assets/eliminated.avif");
        this.playSfx('lose.mp3', () => this.returnToOverworld());
    },

    showCombatOverlay(text, bgImageUrl) {
        document.getElementById('combat-title').innerText = text;
        const overlay = document.getElementById('combat-event-overlay');
        overlay.style.backgroundImage = `url('${bgImageUrl}')`;
        overlay.style.display = 'flex';
        document.getElementById('combat-event-text').innerText = text;
    },

    hideCombatOverlay() {
        document.getElementById('combat-event-overlay').style.display = 'none';
    },

    returnToOverworld() {
        this.setTimerMode('overworld'); // Timer Switch back
        this.state.trackPositions = {};
        this.audio.sfx.pause();
        this.audio.sfx.onended = null;
        this.hideCombatOverlay();
        this.showScreen('screen-overworld');
        
        const shouldLoop = !this.state.isAutoplay;
        this.playBg(this.getCurrentOverworldMusic(), true, shouldLoop);
    },

    showRules(fromScreen) {
        this.state.previousScreen = fromScreen;
        this.state.previousMusic = this.audio.currentBgUrl;
        this.state.previousTimerMode = this.state.timerMode;
        
        this.setTimerMode('rules'); // Switch to global rules timer

        let introNum;
        do {
            introNum = Math.floor(Math.random() * 3) + 1;
        } while (introNum === this.state.lastAiIdx && introNum !== 0);
        this.state.lastAiIdx = introNum;
        let aiFile = `assets/ai${introNum}.mp3`;

        this.playBg(aiFile);
        this.showScreen('screen-rules');
    },

    exitRules() {
        this.setTimerMode(this.state.previousTimerMode); // Restore previous timer mode
        this.showScreen(this.state.previousScreen);
        if (this.state.currentScreen === 'screen-overworld') {
            const shouldLoop = !this.state.isAutoplay;
            this.playBg(this.getCurrentOverworldMusic(), true, shouldLoop);
        } else if (this.state.previousMusic) {
            this.playBg(this.state.previousMusic);
        }
    },

    winGame() {
        this.state.pendingGameOver = 'win';
        document.getElementById('confirm-msg').innerText = Localization.get('msg_win_confirm');
        document.getElementById('confirm-overlay').style.display = 'flex';
    },

    loseGame() {
        this.state.pendingGameOver = 'lose';
        document.getElementById('confirm-msg').innerText = Localization.get('msg_lose_confirm');
        document.getElementById('confirm-overlay').style.display = 'flex';
    },

    confirmAction(isConfirmed) {
        const action = this.state.pendingGameOver;
        document.getElementById('confirm-overlay').style.display = 'none';
        this.state.pendingGameOver = null;

        if (isConfirmed) {
            if (action === 'win') {
                const playerName = this.state.players[this.state.currentPlayerIndex].name;
                // Set stats view to winner
                this.state.statsViewIndex = this.state.currentPlayerIndex;
                this.finishGameSequence('assets/win_game.avif', Localization.get('msg_victory_title', playerName), 'assets/win_game.mp3', true);
            } else if (action === 'lose') {
                this.state.statsViewIndex = 0; // Default view
                this.finishGameSequence('assets/lose.avif', Localization.get('msg_defeat'), 'assets/ultimatelose.mp3', false);
            } else if (action === 'eliminate') {
                const player = this.state.players[this.state.currentPlayerIndex];
                player.eliminated = true;
                const activePlayers = this.state.players.filter(p => !p.eliminated);
                if (activePlayers.length === 0) {
                    this.state.statsViewIndex = this.state.currentPlayerIndex;
                    this.finishGameSequence('assets/lose.avif', Localization.get('msg_defeat'), 'assets/ultimatelose.mp3', false);
                } else {
                    this.endTurn();
                }
            }
        }
    },

    finishGameSequence(imgUrl, titleText, audioUrl, loop) {
        this.commitTime(); // Final time commit
        this.state.stats.gameEndTime = Date.now();
        this.state.timerMode = 'ended';

        if (this.audio.fadeInterval) clearInterval(this.audio.fadeInterval);
        this.audio.ch1.pause();
        this.audio.ch2.pause();
        this.audio.ch1.volume = 0; 
        this.audio.ch2.volume = 0;
        
        this.updateFactionColor('neutral');

        document.getElementById('endgame-title').innerText = titleText;
        
        const winBtn = document.getElementById('win-theme-btn');
        winBtn.style.backgroundImage = `url('${imgUrl}')`;

        this.showScreen('screen-win');

        if (loop) {
            const active = this.audio.ch1;
            this.audio.activeChannel = 'ch1';
            active.src = audioUrl;
            active.loop = true;
            active.volume = this.audio.masterVolume;
            active.play().catch(e => console.log("Win play err", e));
            this.audio.currentBgUrl = audioUrl;
        } else {
            this.playSfx(audioUrl.replace('assets/', ''));
        }
    },

    // --- STATISTICS SCREEN LOGIC ---
    
    // Format ms to "Xm Ys"
    fmtTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return Localization.get('time_fmt_m_s', mins, secs);
    },

    showStats(playerIdx) {
        // Validation
        if (playerIdx < 0) playerIdx = this.state.players.length - 1;
        if (playerIdx >= this.state.players.length) playerIdx = 0;
        this.state.statsViewIndex = playerIdx;

        const player = this.state.players[playerIdx];

        // 1. Set Background & Header
        this.updateFactionColor(player.faction);
        
        // 2. Global Stats
        const setupT = this.state.stats.setupTime;
        const totalGameT = (this.state.stats.gameEndTime || Date.now()) - this.state.stats.gameStartTime;
        const rulesT = this.state.stats.totalRulesTime;

        document.getElementById('stat-setup').innerText = this.fmtTime(setupT);
        document.getElementById('stat-game-total').innerText = this.fmtTime(totalGameT);
        document.getElementById('stat-rules').innerText = this.fmtTime(rulesT);

        // 3. Player Card
        document.getElementById('stat-p-name').innerText = player.name;
        document.getElementById('stat-p-faction').innerText = Localization.get(`faction_${player.faction}`);
        const pImg = document.getElementById('stat-p-img');
        pImg.style.backgroundImage = `url('assets/${player.faction}.avif')`;

        // Player Time Calcs
        let totalTurnTime = 0;
        let fastestTurn = Infinity;
        let slowestTurn = 0;
        
        // Include current partial turn if game not over?
        // Usually turnHistory holds completed turns. 
        const turns = player.stats.turnHistory;
        turns.forEach(t => {
            totalTurnTime += t;
            if (t < fastestTurn) fastestTurn = t;
            if (t > slowestTurn) slowestTurn = t;
        });

        const avgTurn = turns.length > 0 ? (totalTurnTime / turns.length) : 0;
        
        document.getElementById('stat-avg-turn').innerText = this.fmtTime(avgTurn);
        document.getElementById('stat-battle-total').innerText = this.fmtTime(player.stats.totalBattleTime);
        
        // Highlights
        document.getElementById('stat-fast-turn').innerText = fastestTurn === Infinity ? "-" : this.fmtTime(fastestTurn);
        document.getElementById('stat-slow-turn').innerText = slowestTurn === 0 ? "-" : this.fmtTime(slowestTurn);

        // Counters
        const c = player.stats.combat;
        const l = player.stats.loot;
        document.getElementById('stat-combat-rec').innerText = `${c.wins} / ${c.losses} / ${c.retreats} / ${c.surrenders}`;
        document.getElementById('stat-loot-rec').innerText = `${l.gold} / ${l.valuable} / ${l.artifact}`;

        this.showScreen('screen-stats');
    },

    cycleStatsPlayer(direction) {
        this.showStats(this.state.statsViewIndex + direction);
    },

    exportStats() {
        const now = new Date();
        const data = {
            exportDate: now.toLocaleDateString(),
            exportTime: now.toLocaleTimeString(),
            rawTimestamp: now.toISOString(),
            global: {
                setupTimeMs: this.state.stats.setupTime,
                totalGameTimeMs: (this.state.stats.gameEndTime || Date.now()) - this.state.stats.gameStartTime,
                rulesTimeMs: this.state.stats.totalRulesTime
            },
            players: this.state.players.map(p => ({
                name: p.name,
                faction: p.faction,
                eliminated: p.eliminated,
                stats: p.stats
            }))
        };

        const jsonStr = JSON.stringify(data, null, 2);
        const fileName = `${now.toISOString().split('T')[0]}_${now.getHours()}-${now.getMinutes()}_h3data.json`;

        // Check if we are on mobile with share capabilities
        if (navigator.share && navigator.canShare) {
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const file = new File([blob], fileName, { type: 'application/json' });

            if (navigator.canShare({ files: [file] })) {
                navigator.share({
                    files: [file],
                    title: 'HoMM3 Statistics',
                }).catch(() => this.downloadDesktop(jsonStr, fileName));
                return;
            }
        }

        // Default Desktop / Fallback Download
        this.downloadDesktop(jsonStr, fileName);
    },

    downloadDesktop(content, fileName) {
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    },

    resetGame() {
        this.state.players = [];
        this.state.currentPlayerIndex = 0;
        this.state.round = 1;
        this.state.selectedTheme = null;
        this.state.playerCount = 3;
        
        // Reset Stats State
        this.state.stats = {
            appLoadedAt: Date.now(),
            setupTime: 0,
            gameStartTime: 0,
            gameEndTime: 0,
            totalRulesTime: 0
        };
        this.state.lastTick = Date.now();
        this.state.timerMode = 'setup';

        document.querySelectorAll('.faction-btn').forEach(btn => btn.classList.remove('disabled'));
        
        this.stopBg(true); 
        this.audio.sfx.pause();
        this.audio.sfx.currentTime = 0;
        this.audio.sfx.onended = null;
        this.audio.sfx.onerror = null;
        this.audio.currentBgUrl = null;
        this.state.trackPositions = {};

        // Close options if open on mobile
        document.getElementById('options-menu').style.display = ''; 
        // Close language menu if open
        const langMenu = document.getElementById('lang-submenu');
        if(langMenu) langMenu.style.display = 'none';

        setTimeout(() => this.init(), 100);
    },

    showScreen(id) {
        document.querySelectorAll('.screen').forEach(el => el.style.display = 'none');
        document.getElementById(id).style.display = 'flex';
        this.state.currentScreen = id;
    }
};

window.addEventListener('DOMContentLoaded', () => {
    Localization.init();
});

window.Game = Game;
