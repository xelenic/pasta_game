/*
 * Milan Pasta – Slice the Ingredients
 * Game loop, input, the timed round, scoring and screen flow.
 */
(function () {
    'use strict';

    const Art = window.PastaArt;
    const Sfx = window.PastaSfx;

    const TAU = Math.PI * 2;

    const SLICEABLE = ['tomato', 'yellowPepper', 'greenPepper', 'mushroom', 'onion', 'broccoli'];

    const MAX_HEARTS = 3;
    const POINTS_FRESH = 10;
    const POINTS_ROTTEN = -30;
    const POINTS_BONUS = 50;
    const BONUS_SECONDS = 5;
    const LIFE_BONUS = 50;
    const COMBO_WINDOW = 0.42;
    const STORE_KEY = 'milan-slice-progress';

    /**
     * The difficulties an admin can pick. Each one ramps from its `start` pace to its `end`
     * pace over the round; `speed` scales how fast ingredients fly.
     */
    const DIFFICULTIES = {
        easy: {
            speed: 0.9,
            start: { rotten: 0.06, gap: 1.6, waveMin: 1, waveMax: 2 },
            end: { rotten: 0.16, gap: 1.05, waveMin: 1, waveMax: 3 },
        },
        normal: {
            speed: 1,
            start: { rotten: 0.1, gap: 1.4, waveMin: 1, waveMax: 2 },
            end: { rotten: 0.28, gap: 0.75, waveMin: 2, waveMax: 4 },
        },
        hard: {
            speed: 1.12,
            start: { rotten: 0.16, gap: 1.1, waveMin: 1, waveMax: 3 },
            end: { rotten: 0.36, gap: 0.55, waveMin: 2, waveMax: 5 },
        },
    };

    /* Settings saved on the admin page arrive as data attributes on #app. */
    const settings = document.getElementById('app').dataset;
    const GAME_SECONDS = Math.max(1, parseInt(settings.gameSeconds, 10) || 60);
    const PACE = DIFFICULTIES[settings.difficulty] || DIFFICULTIES.normal;

    /* ------------------------------------------------------------------ */
    /* Helpers                                                             */
    /* ------------------------------------------------------------------ */

    const $ = (selector) => document.querySelector(selector);
    const rand = (min, max) => min + Math.random() * (max - min);
    const randInt = (min, max) => Math.floor(rand(min, max + 1));
    const pick = (list) => list[Math.floor(Math.random() * list.length)];
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const now = () => performance.now() / 1000;

    function segmentDistanceSq(px, py, ax, ay, bx, by) {
        const vx = bx - ax;
        const vy = by - ay;
        const lengthSq = vx * vx + vy * vy;
        const t = lengthSq ? clamp(((px - ax) * vx + (py - ay) * vy) / lengthSq, 0, 1) : 0;
        const dx = ax + t * vx - px;
        const dy = ay + t * vy - py;
        return dx * dx + dy * dy;
    }

    function lerpAngle(from, to, amount) {
        let delta = (to - from) % TAU;
        if (delta > Math.PI) {
            delta -= TAU;
        }
        if (delta < -Math.PI) {
            delta += TAU;
        }
        return from + delta * amount;
    }

    function formatTime(seconds) {
        const whole = Math.max(0, Math.ceil(seconds));
        return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
    }

    function restartAnimation(node, className) {
        node.classList.remove(className);
        void node.offsetWidth;
        node.classList.add(className);
    }

    function vibrate(ms) {
        try {
            if (navigator.vibrate) {
                navigator.vibrate(ms);
            }
        } catch (error) {
            // Vibration is optional.
        }
    }

    /** The round gets harder as it goes: faster throws, bigger waves and more rotten veges. */
    function difficulty(elapsed) {
        const t = clamp(elapsed / GAME_SECONDS, 0, 1);
        const { start, end } = PACE;
        const mix = (from, to) => from + (to - from) * t;
        return {
            rottenChance: mix(start.rotten, end.rotten),
            waveGap: mix(start.gap, end.gap),
            waveMin: Math.round(mix(start.waveMin, end.waveMin)),
            waveMax: Math.round(mix(start.waveMax, end.waveMax)),
        };
    }

    /* ------------------------------------------------------------------ */
    /* Persistent best score                                               */
    /* ------------------------------------------------------------------ */

    function loadStore() {
        const fallback = { best: 0 };
        try {
            return Object.assign(fallback, JSON.parse(localStorage.getItem(STORE_KEY)) || {});
        } catch (error) {
            return fallback;
        }
    }

    const store = loadStore();

    function saveStore() {
        try {
            localStorage.setItem(STORE_KEY, JSON.stringify(store));
        } catch (error) {
            // Storage may be blocked; the best score just won't persist.
        }
    }

    function recordScore() {
        store.best = Math.max(store.best, state.score);
        saveStore();
    }

    /* ------------------------------------------------------------------ */
    /* DOM                                                                 */
    /* ------------------------------------------------------------------ */

    const app = $('#app');
    const bgCanvas = $('#bg');
    const canvas = $('#game');
    const ctx = canvas.getContext('2d');
    const bgCtx = bgCanvas.getContext('2d');

    const el = {
        hud: $('#hud'),
        score: $('#score'),
        scorePill: $('.score-pill'),
        hearts: Array.from(document.querySelectorAll('#hearts .heart')),
        timer: $('#timer'),
        timerText: $('#timer-text'),
        combo: $('#combo'),
        comboX: $('#combo-x'),
        banner: $('#banner'),
        hurt: $('#hurt'),
        homeBest: $('#home-best'),
        completeStars: Array.from(document.querySelectorAll('#complete-stars .star')),
        completeScore: $('#complete-score'),
        completeBonus: $('#complete-bonus'),
        overStars: Array.from(document.querySelectorAll('#over-stars .star')),
        overScore: $('#over-score'),
        overReason: $('#over-reason'),
        overBest: $('#over-best'),
        screens: {
            home: $('#screen-home'),
            howto: $('#screen-howto'),
            pause: $('#screen-pause'),
            complete: $('#screen-complete'),
            over: $('#screen-over'),
        },
    };

    const IMG = {};

    function buildImages() {
        const sprites = [
            ['tomato', 'whole', false],
            ['tomato', 'cut', false],
            ['yellowPepper', 'whole', false],
            ['yellowPepper', 'cut', false],
            ['greenPepper', 'whole', false],
            ['redPepper', 'whole', false],
            ['mushroom', 'whole', false],
            ['mushroom', 'cut', false],
            ['onion', 'whole', false],
            ['broccoli', 'whole', false],
            ['pasta', 'whole', false],
            ['leaf', 'whole', false],
            ['tomato', 'whole', true],
            ['mushroom', 'whole', true],
            ['broccoli', 'whole', true],
        ];
        sprites.forEach(([type, variant, rotten]) => {
            const name = `${rotten ? 'rotten-' : ''}${type}${variant === 'cut' ? '-cut' : ''}`;
            IMG[name] = Art.spriteURL(type, variant, rotten, 220);
        });

        document.querySelectorAll('img[data-sprite]').forEach((img) => {
            img.src = IMG[img.dataset.sprite] || '';
            img.draggable = false;
        });
    }

    function buildLogos() {
        const template = $('#tpl-logo');
        document.querySelectorAll('[data-logo]').forEach((node) => {
            node.appendChild(template.content.cloneNode(true));
        });
    }

    /* ------------------------------------------------------------------ */
    /* State                                                               */
    /* ------------------------------------------------------------------ */

    let usingKeyboard = false;
    let W = 0;
    let H = 0;
    let U = 4;
    let dpr = 1;
    let itemRadius = 40;

    const state = {
        screen: 'home',
        phase: 'idle', // idle | countdown | playing | paused | ending
        runId: 0,
        score: 0,
        hearts: MAX_HEARTS,
        timeLeft: GAME_SECONDS,
        elapsed: 0,
        lastSecond: 0,
        gravity: 0,
        spawnTimer: 0,
        queue: [],
        items: [],
        halves: [],
        particles: [],
        splats: [],
        flashes: [],
        texts: [],
        combo: 0,
        lastSliceAt: 0,
        comboX: 0,
        comboY: 0,
        comboHideAt: 0,
        shake: 0,
        clock: 0,
        lastSwoosh: 0,
    };

    const pointer = {
        down: false,
        visible: false,
        isMouse: false,
        x: 0,
        y: 0,
        angle: Math.PI * 0.9,
        upAt: 0,
        trail: [],
    };

    /* ------------------------------------------------------------------ */
    /* Layout                                                              */
    /* ------------------------------------------------------------------ */

    function resize() {
        const rect = app.getBoundingClientRect();
        W = app.clientWidth || rect.width;
        H = app.clientHeight || rect.height;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        [canvas, bgCanvas].forEach((node) => {
            node.width = Math.round(W * dpr);
            node.height = Math.round(H * dpr);
        });
        U = Math.min(W, H * 0.5625) / 100;
        itemRadius = clamp(U * 10, 26, 62);
        // Gravity grows with the square of the speed so faster rounds keep the same arcs.
        state.gravity = H * 1.15 * PACE.speed * PACE.speed;
        bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        Art.drawKitchen(bgCtx, W, H, U);
    }

    /* ------------------------------------------------------------------ */
    /* Screens and HUD                                                     */
    /* ------------------------------------------------------------------ */

    function showScreen(name) {
        state.screen = name;
        Object.entries(el.screens).forEach(([key, node]) => {
            const active = key === name;
            node.classList.toggle('active', active);
            node.inert = !active;
        });
        el.hud.classList.toggle('show', name === 'game' || name === 'pause');
        if (name !== 'game') {
            pointer.down = false;
            pointer.trail = [];
        }
        const firstButton = el.screens[name] && el.screens[name].querySelector('.btn');
        if (firstButton && usingKeyboard) {
            firstButton.focus({ preventScroll: true });
        }
    }

    function renderScore(bump) {
        el.score.textContent = state.score;
        if (bump) {
            restartAnimation(el.scorePill, 'bump');
        }
    }

    function renderHearts(hitIndex) {
        el.hearts.forEach((heart, index) => {
            heart.classList.toggle('lost', index >= state.hearts);
            heart.classList.remove('hit');
        });
        if (hitIndex !== undefined && el.hearts[hitIndex]) {
            restartAnimation(el.hearts[hitIndex], 'hit');
        }
    }

    function renderTimer() {
        el.timerText.textContent = formatTime(state.timeLeft);
        el.timer.classList.toggle('low', state.phase === 'playing' && state.timeLeft <= 10);
    }

    function showCombo(count) {
        el.comboX.textContent = `x${count}`;
        el.combo.classList.add('show');
        restartAnimation(el.combo, 'pop');
        state.comboHideAt = 0;
    }

    function showBanner(text, variant, hold) {
        el.banner.className = `banner ${variant || ''}`;
        el.banner.innerHTML = '';
        const outer = document.createElement('span');
        outer.className = 'outlined';
        outer.dataset.text = text;
        outer.style.whiteSpace = 'pre-line';
        const inner = document.createElement('span');
        inner.textContent = text;
        outer.appendChild(inner);
        el.banner.appendChild(outer);
        restartAnimation(el.banner, hold ? 'hold' : 'play');
    }

    function clearBanner() {
        el.banner.className = 'banner';
        el.banner.innerHTML = '';
    }

    function hurtFlash() {
        restartAnimation(el.hurt, 'on');
    }

    function syncMute() {
        document.querySelectorAll('[data-action="mute"]').forEach((button) => {
            button.classList.toggle('muted', Sfx.isMuted());
            button.setAttribute('aria-pressed', String(Sfx.isMuted()));
        });
    }

    function renderHomeBest() {
        el.homeBest.hidden = store.best <= 0;
        el.homeBest.textContent = `Best score ${store.best}`;
    }

    function setStars(nodes, count, animate) {
        nodes.forEach((star, index) => {
            star.classList.remove('on');
            star.style.animationDelay = '';
            if (index < count) {
                if (animate) {
                    star.style.animationDelay = `${0.25 + index * 0.25}s`;
                }
                void star.getBoundingClientRect();
                star.classList.add('on');
            }
        });
    }

    function countUp(node, from, to, duration) {
        const start = performance.now();
        const step = (time) => {
            const t = clamp((time - start) / (duration * 1000), 0, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            node.textContent = Math.round(from + (to - from) * eased);
            if (t < 1) {
                requestAnimationFrame(step);
            }
        };
        requestAnimationFrame(step);
    }

    /** Runs fn after ms unless the game was restarted or left in the meantime. */
    function later(ms, fn) {
        const run = state.runId;
        setTimeout(() => {
            if (state.runId === run) {
                fn();
            }
        }, ms);
    }

    /* ------------------------------------------------------------------ */
    /* Flow                                                                */
    /* ------------------------------------------------------------------ */

    function resetField() {
        state.queue = [];
        state.items = [];
        state.halves = [];
        state.particles = [];
        state.splats = [];
        state.flashes = [];
        state.texts = [];
        state.combo = 0;
        state.shake = 0;
        el.combo.classList.remove('show');
    }

    function goHome() {
        state.runId += 1;
        state.phase = 'idle';
        resetField();
        clearBanner();
        renderHomeBest();
        showScreen('home');
    }

    function startGame() {
        state.runId += 1;
        state.phase = 'countdown';
        state.score = 0;
        state.hearts = MAX_HEARTS;
        state.timeLeft = GAME_SECONDS;
        state.elapsed = 0;
        state.lastSecond = GAME_SECONDS;
        state.spawnTimer = 0.4;
        resetField();
        clearBanner();
        renderHearts();
        renderScore(false);
        renderTimer();
        el.hud.classList.add('locked');
        showScreen('game');
        countdown(3);
    }

    function countdown(count) {
        if (count > 0) {
            showBanner(String(count), 'count', false);
            Sfx.tick();
            later(700, () => countdown(count - 1));
            return;
        }
        showBanner('SLICE!', '', false);
        Sfx.go();
        state.phase = 'playing';
        el.hud.classList.remove('locked');
    }

    function pauseGame() {
        if (state.phase !== 'playing') {
            return;
        }
        state.phase = 'paused';
        showScreen('pause');
    }

    function resumeGame() {
        if (state.phase !== 'paused') {
            return;
        }
        state.phase = 'playing';
        showScreen('game');
    }

    /** The timer ran out with at least one life left: the player wins a bonus for every life kept. */
    function winGame() {
        if (state.phase !== 'playing') {
            return;
        }
        closeCombo();
        state.phase = 'ending';
        el.hud.classList.add('locked');
        const slicePoints = state.score;
        const lifeBonus = state.hearts * LIFE_BONUS;
        state.score += lifeBonus;
        recordScore();
        renderScore(true);
        showBanner("TIME'S\nUP!", '', true);
        Sfx.win();

        later(1600, () => {
            clearBanner();
            el.completeBonus.textContent = `Slicing ${slicePoints}  •  Lives ${state.hearts} × ${LIFE_BONUS} = +${lifeBonus}`;
            el.completeScore.textContent = '0';
            showScreen('complete');
            setStars(el.completeStars, state.hearts, true);
            countUp(el.completeScore, 0, state.score, 1.1);
        });
    }

    /** All lives are gone before the timer ran out. */
    function loseGame() {
        if (state.phase !== 'playing') {
            return;
        }
        closeCombo();
        state.phase = 'ending';
        el.hud.classList.add('locked');
        recordScore();
        showBanner('OUT OF\nLIVES!', 'lose', true);
        Sfx.lose();

        later(1600, () => {
            clearBanner();
            el.overReason.textContent = `All ${MAX_HEARTS} lives lost with ${formatTime(state.timeLeft)} still on the clock.`;
            el.overScore.textContent = '0';
            el.overBest.textContent = `Best score ${store.best}`;
            showScreen('over');
            setStars(el.overStars, 0, true);
            countUp(el.overScore, 0, state.score, 0.9);
        });
    }

    /* ------------------------------------------------------------------ */
    /* Spawning                                                            */
    /* ------------------------------------------------------------------ */

    function chooseIngredient() {
        const hasBonus = state.items.some((item) => item.type === 'goldenPenne');
        if (!hasBonus && Math.random() < 0.035) {
            return { type: 'goldenPenne', rotten: false };
        }
        return { type: pick(SLICEABLE), rotten: Math.random() < difficulty(state.elapsed).rottenChance };
    }

    function queueWave() {
        const { waveMin, waveMax } = difficulty(state.elapsed);
        const count = randInt(waveMin, waveMax);
        for (let i = 0; i < count; i++) {
            state.queue.push({ ...chooseIngredient(), delay: i * rand(0.08, 0.22) });
        }
    }

    function launch({ type, rotten }) {
        const g = state.gravity;
        const r = itemRadius * (type === 'goldenPenne' ? 0.9 : pick([0.92, 1, 1.08]));
        const x = rand(W * 0.15, W * 0.85);
        const y = H + r * 1.3;
        const peak = rand(H * 0.16, H * 0.45);
        const vy = -Math.sqrt(2 * g * (y - peak));
        const flightTime = (-vy / g) * 2;
        const vx = (rand(W * 0.12, W * 0.88) - x) / flightTime;
        state.items.push({
            type,
            rotten,
            x,
            y,
            vx,
            vy,
            r,
            rot: rand(0, TAU),
            vr: rand(-2.4, 2.4),
            seed: rand(0, 100),
            dead: false,
        });
        Sfx.toss();
    }

    /* ------------------------------------------------------------------ */
    /* Slicing                                                             */
    /* ------------------------------------------------------------------ */

    function addScore(delta, x, y, color, prefix, size) {
        state.score = Math.max(0, state.score + delta);
        const sign = delta > 0 ? '+' : '';
        addText(`${prefix || ''}${sign}${delta}`, x, y, color, size || U * 6);
        renderScore(true);
    }

    function addText(text, x, y, color, size) {
        state.texts.push({ text, x, y, color, size, age: 0, life: 0.95, vy: -U * 12 });
    }

    function spawnJuice(item, angle) {
        const colors = Art.JUICE[item.rotten ? 'rotten' : item.type];
        const nx = -Math.sin(angle);
        const ny = Math.cos(angle);
        for (let i = 0; i < 22; i++) {
            const side = i % 2 ? 1 : -1;
            const spread = rand(-0.9, 0.9);
            const speed = rand(U * 18, U * 65);
            const dirX = nx * side + Math.cos(angle) * spread;
            const dirY = ny * side + Math.sin(angle) * spread;
            const length = Math.hypot(dirX, dirY) || 1;
            state.particles.push({
                x: item.x,
                y: item.y,
                vx: (dirX / length) * speed + item.vx * 0.3,
                vy: (dirY / length) * speed - U * 10,
                size: rand(U * 0.5, U * 1.5),
                color: pick(colors),
                life: rand(0.45, 0.9),
                max: 0.9,
            });
        }
        const blobs = [];
        for (let i = 0; i < 7; i++) {
            blobs.push({ dx: rand(-1, 1) * item.r * 0.9, dy: rand(-1, 1) * item.r * 0.7, r: rand(U * 1.2, U * 4.2) });
        }
        state.splats.push({ x: item.x, y: item.y, blobs, color: colors[0], life: 1.3, max: 1.3 });
    }

    function spawnHalves(item, angle) {
        const nx = -Math.sin(angle);
        const ny = Math.cos(angle);
        const separation = U * 22;
        const variant = item.type === 'goldenPenne' ? 'whole' : 'cut';
        [1, -1].forEach((side) => {
            state.halves.push({
                type: item.type,
                rotten: item.rotten,
                variant,
                r: item.r,
                x: item.x + nx * side * 2,
                y: item.y + ny * side * 2,
                vx: item.vx * 0.6 + nx * side * separation + Math.cos(angle) * U * 8,
                vy: Math.min(item.vy, 0) * 0.35 + ny * side * separation - U * 8,
                rot: item.rot,
                vr: item.vr + side * rand(2, 5),
                localCut: angle - item.rot,
                side,
            });
        });
    }

    function closeCombo() {
        const count = state.combo;
        state.combo = 0;
        state.comboHideAt = now() + 0.7;
        if (count >= 3) {
            const bonus = count * 10;
            addScore(bonus, clamp(state.comboX, U * 25, W - U * 25), state.comboY - U * 9, '#ffe13a', `COMBO x${count}  `, U * 7.5);
            Sfx.combo(count);
        }
    }

    function sliceItem(item, angle) {
        item.dead = true;
        spawnHalves(item, angle);
        spawnJuice(item, angle);
        state.flashes.push({ x: item.x, y: item.y, angle, length: item.r * 2.8, life: 0.16, max: 0.16 });

        if (item.rotten) {
            Sfx.squish();
            vibrate(140);
            state.combo = 0;
            state.comboHideAt = now();
            addScore(POINTS_ROTTEN, item.x, item.y, '#ff6a5a', 'Rotten! ', U * 6.4);
            state.hearts -= 1;
            renderHearts(state.hearts);
            hurtFlash();
            state.shake = 0.35;
            if (state.hearts <= 0) {
                loseGame();
            }
            return;
        }

        const t = now();
        state.combo = t - state.lastSliceAt <= COMBO_WINDOW ? state.combo + 1 : 1;
        state.lastSliceAt = t;
        state.comboX = item.x;
        state.comboY = item.y;
        if (state.combo >= 2) {
            showCombo(state.combo);
        }

        if (item.type === 'goldenPenne') {
            Sfx.bonus();
            vibrate(30);
            addScore(POINTS_BONUS, item.x, item.y, '#fff27a', '', U * 7);
            addText(`+${BONUS_SECONDS}s`, item.x, item.y + U * 8, '#9cff9c', U * 6);
            state.timeLeft += BONUS_SECONDS;
            renderTimer();
            return;
        }

        Sfx.slice();
        addScore(POINTS_FRESH, item.x, item.y, '#ffffff');
    }

    /* ------------------------------------------------------------------ */
    /* Input                                                               */
    /* ------------------------------------------------------------------ */

    function localPoint(event) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: ((event.clientX - rect.left) / rect.width) * W,
            y: ((event.clientY - rect.top) / rect.height) * H,
        };
    }

    function movePointer(x, y) {
        const ax = pointer.x;
        const ay = pointer.y;
        const dx = x - ax;
        const dy = y - ay;
        const distance = Math.hypot(dx, dy);
        pointer.x = x;
        pointer.y = y;
        if (distance > 0.5) {
            pointer.angle = lerpAngle(pointer.angle, Math.atan2(dy, dx), clamp(distance / (U * 4), 0.05, 0.6));
        }
        if (!pointer.down) {
            return;
        }
        pointer.trail.push({ x, y, t: now() });
        if (state.phase !== 'playing' || distance < 0.5) {
            return;
        }
        const t = now();
        if (distance > U * 2.5 && t - state.lastSwoosh > 0.22) {
            state.lastSwoosh = t;
            Sfx.swoosh();
        }
        const angle = Math.atan2(dy, dx);
        for (const item of state.items) {
            if (state.phase !== 'playing') {
                break;
            }
            if (!item.dead && segmentDistanceSq(item.x, item.y, ax, ay, x, y) <= item.r * item.r * 0.85) {
                sliceItem(item, angle);
            }
        }
    }

    canvas.addEventListener('pointerdown', (event) => {
        Sfx.unlock();
        event.preventDefault();
        const point = localPoint(event);
        pointer.down = true;
        pointer.visible = true;
        pointer.isMouse = event.pointerType === 'mouse';
        pointer.x = point.x;
        pointer.y = point.y;
        pointer.trail = [{ x: point.x, y: point.y, t: now() }];
        if (canvas.setPointerCapture) {
            try {
                canvas.setPointerCapture(event.pointerId);
            } catch (error) {
                // Capture is a nicety; slicing still works without it.
            }
        }
    });

    canvas.addEventListener('pointermove', (event) => {
        pointer.visible = true;
        pointer.isMouse = event.pointerType === 'mouse';
        const events = event.getCoalescedEvents ? event.getCoalescedEvents() : [];
        (events.length ? events : [event]).forEach((sample) => {
            const point = localPoint(sample);
            movePointer(point.x, point.y);
        });
    });

    ['pointerup', 'pointercancel'].forEach((type) => {
        canvas.addEventListener(type, () => {
            pointer.down = false;
            pointer.upAt = now();
        });
    });

    canvas.addEventListener('pointerleave', (event) => {
        if (event.pointerType === 'mouse') {
            pointer.visible = false;
        }
    });

    canvas.addEventListener('contextmenu', (event) => event.preventDefault());

    const actions = {
        play: () => showScreen('howto'),
        start: startGame,
        restart: startGame,
        replay: startGame,
        pause: pauseGame,
        resume: resumeGame,
        home: goHome,
        mute: () => {
            Sfx.setMuted(!Sfx.isMuted());
            syncMute();
        },
    };

    document.addEventListener('click', (event) => {
        const button = event.target.closest('[data-action]');
        if (!button || !actions[button.dataset.action]) {
            return;
        }
        Sfx.unlock();
        Sfx.click();
        actions[button.dataset.action]();
    });

    document.addEventListener('pointerdown', () => {
        usingKeyboard = false;
    }, true);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Tab' || event.key === 'Enter' || event.key === ' ') {
            usingKeyboard = true;
        }
        if (event.key === 'Escape' || event.key === 'p' || event.key === 'P') {
            if (state.phase === 'playing') {
                pauseGame();
            } else if (state.phase === 'paused') {
                resumeGame();
            }
        }
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            pauseGame();
        }
    });

    window.addEventListener('blur', pauseGame);

    /* ------------------------------------------------------------------ */
    /* Update                                                              */
    /* ------------------------------------------------------------------ */

    function update(dt) {
        const t = now();
        state.clock += dt;

        if (state.phase === 'playing') {
            state.timeLeft -= dt;
            state.elapsed += dt;
            const second = Math.ceil(state.timeLeft);
            if (second !== state.lastSecond) {
                state.lastSecond = second;
                renderTimer();
                if (second <= 5 && second > 0) {
                    Sfx.tick();
                }
            }
            if (state.timeLeft <= 0) {
                state.timeLeft = 0;
                renderTimer();
                winGame();
            }

            state.spawnTimer -= dt;
            if (state.spawnTimer <= 0) {
                queueWave();
                state.spawnTimer = difficulty(state.elapsed).waveGap * rand(0.85, 1.2);
            }
            for (let i = state.queue.length - 1; i >= 0; i--) {
                state.queue[i].delay -= dt;
                if (state.queue[i].delay <= 0) {
                    launch(state.queue[i]);
                    state.queue.splice(i, 1);
                }
            }
        }

        if (state.combo > 0 && t - state.lastSliceAt > COMBO_WINDOW) {
            closeCombo();
        }
        if (state.comboHideAt && t > state.comboHideAt) {
            state.comboHideAt = 0;
            el.combo.classList.remove('show');
        }

        const g = state.gravity;
        state.items = state.items.filter((item) => {
            if (item.dead) {
                return false;
            }
            item.vy += g * dt;
            item.x += item.vx * dt;
            item.y += item.vy * dt;
            item.rot += item.vr * dt;
            return !(item.vy > 0 && item.y > H + item.r * 1.5);
        });

        state.halves = state.halves.filter((half) => {
            half.vy += g * dt;
            half.x += half.vx * dt;
            half.y += half.vy * dt;
            half.rot += half.vr * dt;
            return half.y < H + half.r * 2;
        });

        state.particles = state.particles.filter((particle) => {
            particle.vy += g * 0.6 * dt;
            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;
            particle.life -= dt;
            return particle.life > 0;
        });

        [state.splats, state.flashes].forEach((list) => {
            list.forEach((entry) => {
                entry.life -= dt;
            });
        });
        state.splats = state.splats.filter((splat) => splat.life > 0);
        state.flashes = state.flashes.filter((flash) => flash.life > 0);

        state.texts = state.texts.filter((text) => {
            text.age += dt;
            text.y += text.vy * dt;
            text.vy *= 0.96;
            return text.age < text.life;
        });

        state.shake = Math.max(0, state.shake - dt);
        pointer.trail = pointer.trail.filter((point) => t - point.t < 0.11).slice(-16);
    }

    /* ------------------------------------------------------------------ */
    /* Render                                                              */
    /* ------------------------------------------------------------------ */

    function drawSprite(sprite) {
        ctx.drawImage(sprite.canvas, -sprite.size / 2, -sprite.size / 2, sprite.size, sprite.size);
    }

    function drawRottenExtras(item) {
        const t = state.clock;
        ctx.save();
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(170, 215, 60, 0.6)';
        ctx.lineWidth = U * 0.6;
        for (let k = -1; k <= 1; k++) {
            const x0 = item.x + k * item.r * 0.4;
            ctx.beginPath();
            for (let s = 0; s <= 8; s++) {
                const y = item.y - item.r * 0.95 - s * U * 0.9;
                const x = x0 + Math.sin(s * 0.9 + t * 7 + k) * U * 1.1;
                if (s === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
        }

        const fx = item.x + Math.cos(t * 6 + item.seed) * item.r * 1.1;
        const fy = item.y - item.r * 0.5 + Math.sin(t * 9.5 + item.seed) * item.r * 0.5;
        const flap = U * (0.3 + 0.35 * Math.abs(Math.sin(t * 60)));
        ctx.fillStyle = 'rgba(225, 240, 255, 0.8)';
        ctx.beginPath();
        ctx.ellipse(fx - U * 0.5, fy - U * 0.7, U * 0.75, flap, -0.5, 0, TAU);
        ctx.ellipse(fx + U * 0.5, fy - U * 0.7, U * 0.75, flap, 0.5, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#121212';
        ctx.beginPath();
        ctx.ellipse(fx, fy, U * 0.8, U * 0.6, 0, 0, TAU);
        ctx.fill();
        ctx.restore();
    }

    function drawTrail() {
        const points = pointer.trail;
        if (points.length < 2) {
            return;
        }
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        const passes = [
            { width: U * 3.4, color: 'rgba(255, 214, 64, 0.25)' },
            { width: U * 1.7, color: 'rgba(255, 246, 200, 0.8)' },
            { width: U * 0.7, color: '#ffffff' },
        ];
        passes.forEach((pass) => {
            ctx.strokeStyle = pass.color;
            for (let i = 1; i < points.length; i++) {
                ctx.lineWidth = pass.width * (i / (points.length - 1));
                ctx.beginPath();
                ctx.moveTo(points[i - 1].x, points[i - 1].y);
                ctx.lineTo(points[i].x, points[i].y);
                ctx.stroke();
            }
        });
        ctx.restore();
    }

    function drawKnife() {
        if (!pointer.visible) {
            return;
        }
        let alpha = 1;
        if (!pointer.down && !pointer.isMouse) {
            alpha = clamp(1 - (now() - pointer.upAt) * 5, 0, 1);
        }
        if (alpha <= 0) {
            return;
        }
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(pointer.x, pointer.y);
        ctx.rotate(pointer.angle);
        if (Math.cos(pointer.angle) < 0) {
            ctx.scale(1, -1);
        }
        ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        ctx.shadowBlur = U * 1.5;
        ctx.shadowOffsetY = U * 0.8;
        Art.drawKnife(ctx, U);
        ctx.restore();
    }

    function render() {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        if (state.screen !== 'game' && state.screen !== 'pause') {
            return;
        }

        ctx.save();
        if (state.shake > 0) {
            const magnitude = state.shake * U * 2.4;
            ctx.translate(rand(-magnitude, magnitude), rand(-magnitude, magnitude));
        }

        state.splats.forEach((splat) => {
            ctx.globalAlpha = 0.45 * (splat.life / splat.max);
            ctx.fillStyle = splat.color;
            splat.blobs.forEach((blob) => {
                ctx.beginPath();
                ctx.arc(splat.x + blob.dx, splat.y + blob.dy, blob.r, 0, TAU);
                ctx.fill();
            });
        });
        ctx.globalAlpha = 1;

        state.items.forEach((item) => {
            ctx.save();
            ctx.translate(item.x, item.y);
            ctx.rotate(item.rot);
            drawSprite(Art.sprite(item.type, 'whole', item.rotten, item.r, dpr));
            ctx.restore();
            if (item.rotten) {
                drawRottenExtras(item);
            }
        });

        state.halves.forEach((half) => {
            const sprite = Art.sprite(half.type, half.variant, half.rotten, half.r, dpr);
            const big = sprite.size;
            ctx.save();
            ctx.translate(half.x, half.y);
            ctx.rotate(half.rot + half.localCut);
            ctx.beginPath();
            ctx.rect(-big, half.side > 0 ? 0 : -big, big * 2, big);
            ctx.clip();
            ctx.rotate(-half.localCut);
            drawSprite(sprite);
            ctx.restore();
        });

        state.particles.forEach((particle) => {
            ctx.globalAlpha = clamp(particle.life / particle.max, 0, 1);
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, TAU);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        state.flashes.forEach((flash) => {
            const k = flash.life / flash.max;
            const dx = Math.cos(flash.angle) * flash.length * 0.5;
            const dy = Math.sin(flash.angle) * flash.length * 0.5;
            const gradient = ctx.createLinearGradient(flash.x - dx, flash.y - dy, flash.x + dx, flash.y + dy);
            gradient.addColorStop(0, 'rgba(255, 255, 220, 0)');
            gradient.addColorStop(0.5, `rgba(255, 255, 240, ${k})`);
            gradient.addColorStop(1, 'rgba(255, 255, 220, 0)');
            ctx.strokeStyle = gradient;
            ctx.lineWidth = U * 1.6 * k;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(flash.x - dx, flash.y - dy);
            ctx.lineTo(flash.x + dx, flash.y + dy);
            ctx.stroke();
        });
        ctx.restore();

        drawTrail();
        drawKnife();

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineJoin = 'round';
        state.texts.forEach((text) => {
            const pop = text.age < 0.12 ? 1 + (0.12 - text.age) * 3 : 1;
            const size = text.size * pop;
            ctx.globalAlpha = clamp((text.life - text.age) / 0.3, 0, 1);
            ctx.font = `${size}px "Lilita One", "Arial Black", sans-serif`;
            ctx.lineWidth = size * 0.2;
            ctx.strokeStyle = 'rgba(30, 20, 0, 0.85)';
            ctx.strokeText(text.text, text.x, text.y);
            ctx.fillStyle = text.color;
            ctx.fillText(text.text, text.x, text.y);
        });
        ctx.globalAlpha = 1;
    }

    /* ------------------------------------------------------------------ */
    /* Boot                                                                */
    /* ------------------------------------------------------------------ */

    let lastFrame = performance.now();

    function frame(time) {
        const dt = Math.min((time - lastFrame) / 1000, 1 / 30);
        lastFrame = time;
        if (state.phase !== 'paused') {
            update(dt);
        }
        render();
        requestAnimationFrame(frame);
    }

    buildLogos();
    buildImages();
    syncMute();
    renderHomeBest();
    renderTimer();
    resize();
    showScreen('home');

    window.addEventListener('resize', resize);
    if (window.ResizeObserver) {
        new ResizeObserver(resize).observe(app);
    }

    requestAnimationFrame(frame);
})();
