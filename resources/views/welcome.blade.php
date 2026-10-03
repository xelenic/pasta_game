<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
    <meta name="theme-color" content="#0b3d1f">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="mobile-web-app-capable" content="yes">
    <title>Milan Pasta – Slice the Ingredients</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Fredoka:wght@500;600;700&family=Lilita+One&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('game/css/style.css') }}">
</head>
<body>
<svg class="svg-defs" aria-hidden="true" focusable="false">
    <defs>
        <linearGradient id="g-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#fff7a8"/>
            <stop offset=".45" stop-color="#ffd21a"/>
            <stop offset="1" stop-color="#f09a00"/>
        </linearGradient>
        <linearGradient id="g-heart" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#ff8080"/>
            <stop offset=".5" stop-color="#e81c2c"/>
            <stop offset="1" stop-color="#a00a18"/>
        </linearGradient>
        <linearGradient id="g-blade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#ffffff"/>
            <stop offset=".45" stop-color="#d3dae0"/>
            <stop offset="1" stop-color="#86929d"/>
        </linearGradient>
        <linearGradient id="g-handle" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#3cbf5c"/>
            <stop offset=".5" stop-color="#178a3a"/>
            <stop offset="1" stop-color="#0b5a23"/>
        </linearGradient>
    </defs>
    <symbol id="i-star" viewBox="0 0 24 24">
        <path d="M12 1.8l3.1 6.4 7 .9-5.1 4.9 1.3 7L12 17.6 5.7 21l1.3-7L1.9 9.1l7-.9z" style="fill: var(--star-fill, url(#g-gold)); stroke: var(--star-stroke, #a86400)" stroke-width="1.3" stroke-linejoin="round"/>
        <path d="M8.2 9.6l2.1-.3 1-2.1" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.1" stroke-linecap="round" style="opacity: var(--star-shine, 1)"/>
    </symbol>
    <symbol id="i-heart" viewBox="0 0 24 24">
        <path d="M12 21.2l-1.5-1.3C5.4 15.3 2 12.2 2 8.4 2 5.3 4.4 3 7.4 3c1.8 0 3.5.8 4.6 2.2C13.1 3.8 14.8 3 16.6 3 19.6 3 22 5.3 22 8.4c0 3.8-3.4 6.9-8.5 11.5z" fill="url(#g-heart)" stroke="#7a0010" stroke-width="1"/>
        <ellipse cx="7.3" cy="7.6" rx="2.4" ry="1.5" transform="rotate(-35 7.3 7.6)" fill="#fff" opacity=".7"/>
    </symbol>
    <symbol id="i-play" viewBox="0 0 24 24">
        <path d="M7 4.6v14.8a1.1 1.1 0 0 0 1.7.9l11.6-7.4a1.1 1.1 0 0 0 0-1.8L8.7 3.7A1.1 1.1 0 0 0 7 4.6z"/>
    </symbol>
    <symbol id="i-pause" viewBox="0 0 24 24">
        <rect x="5" y="4" width="5" height="16" rx="1.6"/>
        <rect x="14" y="4" width="5" height="16" rx="1.6"/>
    </symbol>
    <symbol id="i-retry" viewBox="0 0 24 24">
        <path d="M19.6 13.4A7.8 7.8 0 1 1 17.2 6" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/>
        <path d="M21 2.6v7.2h-7.2z" fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
    </symbol>
    <symbol id="i-home" viewBox="0 0 24 24">
        <path d="M12 2.8L1.8 11.6h3V20a1.2 1.2 0 0 0 1.2 1.2h4.3v-5.6h3.4v5.6H18a1.2 1.2 0 0 0 1.2-1.2v-8.4h3z"/>
    </symbol>
    <symbol id="i-check" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10.5" fill="#2fbf55" stroke="#fff" stroke-width="2"/>
        <path d="M7 12.4l3.4 3.4L17.2 9" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </symbol>
    <symbol id="i-sound" viewBox="0 0 24 24">
        <path d="M3.5 9v6h4l5.5 4.5v-15L7.5 9z"/>
        <path d="M16 8.6a4.6 4.6 0 0 1 0 6.8M18.6 5.8a8.6 8.6 0 0 1 0 12.4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
    </symbol>
    <symbol id="i-mute" viewBox="0 0 24 24">
        <path d="M3.5 9v6h4l5.5 4.5v-15L7.5 9z"/>
        <path d="M16 9.2l5 5.6M21 9.2l-5 5.6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
    </symbol>
    <symbol id="i-clock" viewBox="0 0 64 64">
        <rect x="26" y="2" width="12" height="7" rx="2.5" fill="url(#g-gold)" stroke="#a86400" stroke-width="1.6"/>
        <rect x="29.5" y="8" width="5" height="6" fill="#d99a00"/>
        <path d="M49 13l5 5" stroke="#ffd21a" stroke-width="5" stroke-linecap="round"/>
        <circle cx="32" cy="38" r="24" fill="url(#g-gold)" stroke="#a86400" stroke-width="2.4"/>
        <circle cx="32" cy="38" r="18" fill="#0f5a2a" stroke="#073a1a" stroke-width="2"/>
        <path d="M32 22v3M32 51v3M16 38h3M45 38h3" stroke="#bfe8c8" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M32 38V26" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/>
        <path d="M32 38l7 5" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>
        <circle cx="32" cy="38" r="2.8" fill="#ffd21a"/>
    </symbol>
    <symbol id="i-knife" viewBox="0 0 200 48">
        <path d="M128 8H34Q12 9 2 20q14 16 46 18h80z" fill="url(#g-blade)" stroke="#5d6b75" stroke-width="1.5"/>
        <path d="M126 34H48Q22 32 8 21" fill="none" stroke="#fff" stroke-width="2.2" stroke-opacity=".95"/>
        <rect x="126" y="5" width="9" height="36" rx="3" fill="#c3ccd3" stroke="#5d6b75" stroke-width="1.5"/>
        <rect x="134" y="9" width="62" height="28" rx="12" fill="url(#g-handle)" stroke="#0a4a1d" stroke-width="1.5"/>
        <rect x="142" y="13" width="46" height="5" rx="2.5" fill="#fff" opacity=".28"/>
        <circle cx="152" cy="23" r="3.4" fill="#eef3f5"/>
        <circle cx="178" cy="23" r="3.4" fill="#eef3f5"/>
    </symbol>
    <symbol id="i-hand" viewBox="0 0 64 64">
        <path d="M22 36V10a5 5 0 0 1 10 0v16a5 5 0 0 1 10 0v2a5 5 0 0 1 10 0v3a4.5 4.5 0 0 1 9 0v15c0 9-7 15-16 15h-8c-5 0-9-2-12-6L9 41a4.5 4.5 0 0 1 7-5.6z" fill="#fff" stroke="#1d2b22" stroke-width="2.6" stroke-linejoin="round"/>
        <path d="M32 26v8M42 28v7M52 31v6" stroke="#1d2b22" stroke-width="2.2" stroke-linecap="round"/>
    </symbol>
    <symbol id="i-ban" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="27" fill="none" stroke="#e5262a" stroke-width="6"/>
        <path d="M13 13l38 38" stroke="#e5262a" stroke-width="6" stroke-linecap="round"/>
    </symbol>
</svg>

<template id="tpl-logo">
    <img class="logo-img" src="{{ asset('game/assets/milan-logo.webp') }}" alt="Milan" width="640" height="440">
    <div class="logo-pasta">PASTA</div>
</template>

<main id="app" data-game-seconds="{{ $settings->duration_seconds }}" data-difficulty="{{ $settings->difficulty->value }}">
    <canvas id="bg" aria-hidden="true"></canvas>
    <canvas id="game" aria-label="Game area: swipe to slice the ingredients"></canvas>
    <div id="hurt" aria-hidden="true"></div>

    <!-- In-game HUD -->
    <div class="hud" id="hud">
        <div class="hud-top">
            <button class="icon-btn" type="button" data-action="pause" aria-label="Pause">
                <svg><use href="#i-pause"/></svg>
            </button>
            <div class="score-pill">
                <svg class="score-star"><use href="#i-star"/></svg>
                <span id="score">0</span>
            </div>
            <div class="hearts" id="hearts" aria-label="Lives">
                <svg class="heart"><use href="#i-heart"/></svg>
                <svg class="heart"><use href="#i-heart"/></svg>
                <svg class="heart"><use href="#i-heart"/></svg>
            </div>
        </div>
        <div class="hud-row">
            <div class="timer-pill" id="timer" aria-label="Time left">
                <svg><use href="#i-clock"/></svg>
                <span id="timer-text"></span>
            </div>
        </div>
        <div class="combo" id="combo" aria-hidden="true">
            <span class="combo-label">COMBO</span>
            <span class="combo-x" id="combo-x">x2</span>
        </div>
    </div>

    <div class="banner" id="banner" aria-live="assertive"></div>

    <!-- 1. Start -->
    <section class="screen screen-home active" id="screen-home" aria-label="Start">
        <div class="rays" aria-hidden="true"></div>
        <img class="decor" data-sprite="leaf" alt="" style="--x:4;--y:22;--w:20;--r:28deg;--d:7s">
        <img class="decor" data-sprite="tomato-cut" alt="" style="--x:72;--y:14;--w:24;--r:-16deg;--d:6s">
        <img class="decor" data-sprite="tomato" alt="" style="--x:-8;--y:30;--w:24;--r:-8deg;--d:8s">
        <img class="decor" data-sprite="leaf" alt="" style="--x:84;--y:26;--w:16;--r:-40deg;--d:6.5s">
        <img class="decor" data-sprite="yellowPepper" alt="" style="--x:-8;--y:47;--w:28;--r:12deg;--d:7.5s">
        <img class="decor" data-sprite="leaf" alt="" style="--x:84;--y:47;--w:16;--r:150deg;--d:7s">
        <img class="decor" data-sprite="mushroom" alt="" style="--x:76;--y:54;--w:26;--r:8deg;--d:6.8s">
        <img class="decor" data-sprite="pasta" alt="" style="--x:86;--y:39;--w:14;--r:70deg;--d:8s">
        <img class="decor" data-sprite="pasta" alt="" style="--x:10;--y:60;--w:14;--r:-30deg;--d:7.2s">

        <button class="icon-btn corner" type="button" data-action="mute" aria-label="Toggle sound">
            <svg class="when-on"><use href="#i-sound"/></svg>
            <svg class="when-off"><use href="#i-mute"/></svg>
        </button>

        <div class="logo" data-logo></div>

        <div class="home-title">
            <h1 class="title-slice">
                <span class="outlined" data-text="SLICE"><span>SLICE</span></span>
                <svg class="title-knife" aria-hidden="true"><use href="#i-knife"/></svg>
            </h1>
            <div class="plank"><span class="outlined" data-text="THE INGREDIENTS"><span>THE INGREDIENTS</span></span></div>
            <p class="tagline">Chop <i>•</i> Slice <i>•</i> Cook!</p>
            <p class="best" id="home-best" hidden></p>
        </div>

        <div class="home-bottom">
            <img class="home-bowl" src="{{ asset('game/assets/pasta-bowl.webp') }}" alt="" width="1100" height="674">
            <img class="decor" data-sprite="tomato" alt="" style="--x:-6;--y:66;--w:24;--r:10deg;--d:7s">
            <img class="decor" data-sprite="leaf" alt="" style="--x:30;--y:84;--w:18;--r:-20deg;--d:6s">
            <img class="decor" data-sprite="pasta" alt="" style="--x:72;--y:78;--w:22;--r:20deg;--d:7.4s">
            <div class="cta">
                <button class="btn btn-gold btn-xl" type="button" data-action="play">
                    <svg><use href="#i-play"/></svg>PLAY
                </button>
            </div>
        </div>
    </section>

    <!-- 2. How to play -->
    <section class="screen screen-howto" id="screen-howto" aria-label="How to play">
        <div class="howto-head">
            <div class="logo logo-sm" data-logo></div>
            <h2 class="brush-title"><span class="outlined" data-text="HOW TO PLAY"><span>HOW TO PLAY</span></span></h2>
            <p class="howto-sub">Slice the fresh vegetables<br>and make delicious pasta!</p>
        </div>

        <ol class="cards">
            <li class="card">
                <span class="card-num">1</span>
                <div class="card-text">
                    <h3>Tap &amp; Slice</h3>
                    <p>Tap and swipe across the screen to slice the vegetables.</p>
                </div>
                <div class="card-art art-slice" aria-hidden="true">
                    <img data-sprite="tomato" alt="" class="a-whole">
                    <img data-sprite="tomato-cut" alt="" class="a-half a-half-1">
                    <img data-sprite="tomato-cut" alt="" class="a-half a-half-2">
                    <svg class="a-knife"><use href="#i-knife"/></svg>
                    <span class="a-ring"></span>
                    <svg class="a-hand"><use href="#i-hand"/></svg>
                </div>
            </li>
            <li class="card">
                <span class="card-num">2</span>
                <div class="card-text">
                    <h3>Slice Fresh Veggies</h3>
                    <p>Every fresh vegetable earns points. Slice many in one swipe for a combo!</p>
                </div>
                <div class="card-art art-match" aria-hidden="true">
                    <div class="match-row">
                        <img data-sprite="tomato-cut" alt="">
                        <img data-sprite="yellowPepper-cut" alt="">
                        <img data-sprite="mushroom-cut" alt="">
                        <img data-sprite="broccoli" alt="">
                    </div>
                    <div class="match-line">
                        <svg><use href="#i-check"/></svg>
                        <svg><use href="#i-check"/></svg>
                        <svg><use href="#i-check"/></svg>
                    </div>
                </div>
            </li>
            <li class="card">
                <span class="card-num">3</span>
                <div class="card-text">
                    <h3>Beat the Time</h3>
                    <p>Keep slicing for {{ $settings->duration_seconds }} seconds. Every life you keep adds bonus points!</p>
                </div>
                <div class="card-art art-time" aria-hidden="true">
                    <svg class="a-clock"><use href="#i-clock"/></svg>
                    <div class="a-stars">
                        <svg><use href="#i-star"/></svg>
                        <svg><use href="#i-star"/></svg>
                        <svg><use href="#i-star"/></svg>
                    </div>
                </div>
            </li>
            <li class="card">
                <span class="card-num">4</span>
                <div class="card-text">
                    <h3>Do Not Slice Rotten Veges</h3>
                    <p>Rotten veges cost a life and reduce your score. Lose all 3 and it's game over!</p>
                </div>
                <div class="card-art art-rotten" aria-hidden="true">
                    <img data-sprite="rotten-tomato" alt="" class="r1">
                    <img data-sprite="rotten-broccoli" alt="" class="r3">
                    <img data-sprite="rotten-mushroom" alt="" class="r2">
                    <svg class="a-ban"><use href="#i-ban"/></svg>
                </div>
            </li>
        </ol>

        <div class="howto-cta">
            <button class="btn btn-gold" type="button" data-action="start">
                <svg><use href="#i-play"/></svg>LET'S PLAY
            </button>
        </div>
    </section>

    <!-- Pause menu -->
    <section class="screen screen-pause" id="screen-pause" aria-label="Paused">
        <div class="panel">
            <h2 class="panel-title"><span class="outlined" data-text="PAUSED"><span>PAUSED</span></span></h2>
            <button class="btn btn-gold" type="button" data-action="resume"><svg><use href="#i-play"/></svg>RESUME</button>
            <button class="btn btn-green" type="button" data-action="restart"><svg><use href="#i-retry"/></svg>RESTART</button>
            <button class="btn btn-green" type="button" data-action="home"><svg><use href="#i-home"/></svg>HOME</button>
            <button class="icon-btn" type="button" data-action="mute" aria-label="Toggle sound">
                <svg class="when-on"><use href="#i-sound"/></svg>
                <svg class="when-off"><use href="#i-mute"/></svg>
            </button>
        </div>
    </section>

    <!-- 3. You win (time ran out with lives left) -->
    <section class="screen screen-complete" id="screen-complete" aria-label="You win">
        <div class="rays" aria-hidden="true"></div>
        <img class="decor" data-sprite="leaf" alt="" style="--x:12;--y:17;--w:14;--r:-160deg;--d:6s">
        <img class="decor" data-sprite="leaf" alt="" style="--x:80;--y:13;--w:17;--r:-30deg;--d:7s">
        <img class="decor" data-sprite="leaf" alt="" style="--x:4;--y:37;--w:15;--r:200deg;--d:6.6s">
        <img class="decor" data-sprite="leaf" alt="" style="--x:82;--y:37;--w:16;--r:-20deg;--d:7.4s">
        <img class="decor" data-sprite="leaf" alt="" style="--x:6;--y:58;--w:16;--r:30deg;--d:6.2s">
        <img class="decor" data-sprite="leaf" alt="" style="--x:80;--y:57;--w:18;--r:-150deg;--d:7.8s">

        <div class="logo logo-sm" data-logo></div>
        <div class="result-stars" id="complete-stars">
            <svg class="star"><use href="#i-star"/></svg>
            <svg class="star"><use href="#i-star"/></svg>
            <svg class="star"><use href="#i-star"/></svg>
        </div>
        <div class="ribbon"><span>YOU WIN!</span></div>
        <div class="dish">
            <div class="dish-glow" aria-hidden="true"></div>
            <img src="{{ asset('game/assets/pasta-bowl.webp') }}" alt="A bowl of Milan penne pasta" width="1100" height="674">
        </div>
        <p class="dish-name">Your Milan pasta is ready!</p>
        <div class="score-box">
            <div class="score-label">YOUR SCORE</div>
            <div class="score-value" id="complete-score">0</div>
            <div class="score-extra" id="complete-bonus"></div>
        </div>
        <div class="result-actions">
            <button class="btn btn-gold" type="button" data-action="replay"><svg><use href="#i-retry"/></svg>PLAY AGAIN</button>
            <button class="link-btn" type="button" data-action="home">Back to home</button>
        </div>
    </section>

    <!-- 4. Game over -->
    <section class="screen screen-over" id="screen-over" aria-label="Game over">
        <img class="decor" data-sprite="leaf" alt="" style="--x:2;--y:3;--w:14;--r:40deg;--d:6s">
        <img class="decor" data-sprite="leaf" alt="" style="--x:12;--y:13;--w:10;--r:-20deg;--d:7s">
        <img class="decor" data-sprite="pasta" alt="" style="--x:84;--y:13;--w:10;--r:-40deg;--d:7.4s">
        <img class="decor" data-sprite="leaf" alt="" style="--x:3;--y:46;--w:12;--r:20deg;--d:6.4s">
        <img class="decor" data-sprite="leaf" alt="" style="--x:88;--y:51;--w:12;--r:-150deg;--d:7.2s">

        <div class="logo" data-logo></div>
        <h2 class="over-title"><span>GAME OVER</span></h2>
        <p class="over-reason" id="over-reason"></p>
        <div class="score-box">
            <div class="score-label">YOUR SCORE</div>
            <div class="score-value brushed" id="over-score">0</div>
            <div class="result-stars small" id="over-stars">
                <svg class="star"><use href="#i-star"/></svg>
                <svg class="star"><use href="#i-star"/></svg>
                <svg class="star"><use href="#i-star"/></svg>
            </div>
        </div>
        <p class="best" id="over-best"></p>
        <div class="result-actions">
            <button class="btn btn-gold" type="button" data-action="replay"><svg><use href="#i-retry"/></svg>RETRY</button>
            <button class="btn btn-green" type="button" data-action="home"><svg><use href="#i-home"/></svg>HOME</button>
        </div>
        <div class="veg-pile" aria-hidden="true">
            <img data-sprite="redPepper" alt="" style="--x:-6;--w:30;--r:-12deg;--b:-3">
            <img data-sprite="yellowPepper" alt="" style="--x:10;--w:30;--r:8deg;--b:-6">
            <img data-sprite="broccoli" alt="" style="--x:58;--w:34;--r:-6deg;--b:-1">
            <img data-sprite="pasta" alt="" style="--x:68;--w:30;--r:24deg;--b:-9">
            <img data-sprite="tomato" alt="" style="--x:24;--w:30;--r:4deg;--b:-9">
            <img data-sprite="tomato" alt="" style="--x:76;--w:22;--r:-8deg;--b:-4">
        </div>
    </section>
</main>

<script src="{{ asset('game/js/art.js') }}"></script>
<script src="{{ asset('game/js/audio.js') }}"></script>
<script src="{{ asset('game/js/game.js') }}"></script>
</body>
</html>
