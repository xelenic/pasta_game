/*
 * Milan Pasta – Slice the Ingredients
 * Procedural artwork: ingredients (whole, sliced and rotten), basil leaves,
 * pasta, the kitchen background and the chef's knife.
 */
(function () {
    'use strict';

    const TAU = Math.PI * 2;

    /** Small deterministic PRNG so decorative art looks the same on every load. */
    function seeded(seed) {
        let s = seed >>> 0;
        return function () {
            s = (s + 0x6d2b79f5) >>> 0;
            let t = s;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function createCanvas(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.ceil(width));
        canvas.height = Math.max(1, Math.ceil(height));
        return canvas;
    }

    function ellipse(ctx, x, y, rx, ry, rotation) {
        ctx.beginPath();
        ctx.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rotation || 0, 0, TAU);
    }

    function roundRectPath(ctx, x, y, w, h, r) {
        const rr = Math.min(r, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + rr, y);
        ctx.arcTo(x + w, y, x + w, y + h, rr);
        ctx.arcTo(x + w, y + h, x, y + h, rr);
        ctx.arcTo(x, y + h, x, y, rr);
        ctx.arcTo(x, y, x + w, y, rr);
        ctx.closePath();
    }

    function radial(ctx, x0, y0, r0, x1, y1, r1, stops) {
        const g = ctx.createRadialGradient(x0, y0, Math.max(0, r0), x1, y1, Math.max(0.01, r1));
        stops.forEach(([offset, color]) => g.addColorStop(offset, color));
        return g;
    }

    function linear(ctx, x0, y0, x1, y1, stops) {
        const g = ctx.createLinearGradient(x0, y0, x1, y1);
        stops.forEach(([offset, color]) => g.addColorStop(offset, color));
        return g;
    }

    /** Soft round glow, used for bokeh and blurred kitchen shapes. */
    function glow(ctx, x, y, r, rgb, alpha) {
        const [red, green, blue] = rgb;
        ctx.fillStyle = radial(ctx, x, y, 0, x, y, r, [
            [0, `rgba(${red},${green},${blue},${alpha})`],
            [0.55, `rgba(${red},${green},${blue},${alpha * 0.55})`],
            [1, `rgba(${red},${green},${blue},0)`],
        ]);
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }

    /* ------------------------------------------------------------------ */
    /* Tomato                                                              */
    /* ------------------------------------------------------------------ */

    function tomatoPath(ctx, R) {
        ctx.beginPath();
        for (let i = 0; i <= 72; i++) {
            const a = (i / 72) * TAU;
            const rr = R * (0.95 + 0.04 * Math.cos(a * 5 + 0.6));
            const x = Math.cos(a) * rr;
            const y = Math.sin(a) * rr * 0.9 + R * 0.05;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
    }

    function drawCalyx(ctx, x, y, s) {
        ctx.save();
        ctx.translate(x, y);
        ctx.save();
        ctx.scale(1, 0.55);
        ctx.fillStyle = linear(ctx, 0, -s, 0, s, [[0, '#86dc5f'], [1, '#1f6e27']]);
        ctx.strokeStyle = 'rgba(10, 60, 15, 0.45)';
        ctx.lineWidth = s * 0.05;
        for (let i = 0; i < 5; i++) {
            ctx.save();
            ctx.rotate((i / 5) * TAU + 0.3);
            ctx.beginPath();
            ctx.moveTo(0, -s * 0.16);
            ctx.quadraticCurveTo(s * 0.55, -s * 0.26, s, s * 0.04);
            ctx.quadraticCurveTo(s * 0.5, s * 0.18, 0, s * 0.16);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
        ctx.rotate(0.25);
        ctx.fillStyle = linear(ctx, -s * 0.1, 0, s * 0.1, 0, [[0, '#2d7a2a'], [0.5, '#6cc952'], [1, '#22622a']]);
        roundRectPath(ctx, -s * 0.09, -s * 0.5, s * 0.18, s * 0.52, s * 0.08);
        ctx.fill();
        ctx.restore();
    }

    function drawTomato(ctx, R) {
        tomatoPath(ctx, R);
        ctx.fillStyle = radial(ctx, -R * 0.35, -R * 0.3, R * 0.05, 0, R * 0.05, R * 1.05, [
            [0, '#ff9c84'],
            [0.35, '#f2442b'],
            [0.8, '#c41f12'],
            [1, '#8e0f08'],
        ]);
        ctx.fill();

        ctx.save();
        tomatoPath(ctx, R);
        ctx.clip();
        ctx.strokeStyle = 'rgba(110, 8, 4, 0.22)';
        ctx.lineWidth = R * 0.07;
        ctx.lineCap = 'round';
        [-1, 1].forEach((side) => {
            ctx.beginPath();
            ctx.moveTo(side * R * 0.12, -R * 0.62);
            ctx.quadraticCurveTo(side * R * 0.75, -R * 0.35, side * R * 0.7, R * 0.55);
            ctx.stroke();
        });
        ctx.restore();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ellipse(ctx, -R * 0.45, -R * 0.28, R * 0.2, R * 0.1, -0.8);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ellipse(ctx, -R * 0.64, -R * 0.02, R * 0.06, R * 0.04, -0.8);
        ctx.fill();

        drawCalyx(ctx, 0, -R * 0.74, R * 0.52);
    }

    function drawTomatoCut(ctx, R) {
        ellipse(ctx, 0, 0, R, R * 0.96);
        ctx.fillStyle = '#b8170d';
        ctx.fill();
        ellipse(ctx, 0, 0, R * 0.92, R * 0.88);
        ctx.fillStyle = radial(ctx, 0, 0, R * 0.1, 0, 0, R * 0.92, [
            [0, '#ff9a80'],
            [0.55, '#f5513a'],
            [1, '#e2321f'],
        ]);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 170, 140, 0.75)';
        ctx.lineWidth = R * 0.08;
        ctx.lineCap = 'round';
        for (let i = 0; i < 4; i++) {
            const a = (i / 4) * TAU;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(a) * R * 0.84, Math.sin(a) * R * 0.8);
            ctx.stroke();
        }

        for (let i = 0; i < 4; i++) {
            ctx.save();
            ctx.rotate((i / 4) * TAU + Math.PI / 4);
            ctx.translate(R * 0.5, 0);
            ellipse(ctx, 0, 0, R * 0.26, R * 0.3);
            ctx.fillStyle = radial(ctx, 0, 0, 0, 0, 0, R * 0.3, [
                [0, '#ffd27a'],
                [0.6, '#ffa36b'],
                [1, 'rgba(255, 120, 80, 0.2)'],
            ]);
            ctx.fill();
            ctx.fillStyle = '#fff1b0';
            for (let k = 0; k < 6; k++) {
                const t = (k / 6) * TAU;
                ellipse(ctx, Math.cos(t) * R * 0.15, Math.sin(t) * R * 0.18, R * 0.045, R * 0.028, t);
                ctx.fill();
            }
            ctx.restore();
        }

        ellipse(ctx, 0, 0, R * 0.2, R * 0.2);
        ctx.fillStyle = '#ffb59c';
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ellipse(ctx, -R * 0.4, -R * 0.45, R * 0.25, R * 0.1, -0.6);
        ctx.fill();
    }

    /* ------------------------------------------------------------------ */
    /* Bell peppers                                                        */
    /* ------------------------------------------------------------------ */

    const PEPPER = {
        yellow: { hi: '#fff6a8', mid: '#ffd21f', lo: '#e89400', edge: '#b86e00', flesh: '#fff3b8' },
        green: { hi: '#b8f28a', mid: '#3fae3f', lo: '#1f6e22', edge: '#145218', flesh: '#d8f5b0' },
        red: { hi: '#ffa08a', mid: '#e8301c', lo: '#a31208', edge: '#7a0c05', flesh: '#ffc4b0' },
    };

    function drawPepper(ctx, R, p) {
        const lobe = (x, y, rx, ry, light) => {
            ellipse(ctx, x, y, rx, ry);
            ctx.fillStyle = radial(
                ctx,
                x - rx * 0.35,
                y - ry * 0.4,
                rx * 0.1,
                x,
                y,
                Math.max(rx, ry) * 1.05,
                light ? [[0, p.hi], [0.45, p.mid], [1, p.lo]] : [[0, p.mid], [0.6, p.lo], [1, p.edge]],
            );
            ctx.fill();
        };

        lobe(-R * 0.45, R * 0.06, R * 0.5, R * 0.82, false);
        lobe(R * 0.45, R * 0.06, R * 0.5, R * 0.82, false);
        ellipse(ctx, 0, -R * 0.5, R * 0.78, R * 0.3);
        ctx.fillStyle = radial(ctx, -R * 0.2, -R * 0.65, R * 0.05, 0, -R * 0.5, R * 0.8, [
            [0, p.hi],
            [0.5, p.mid],
            [1, p.lo],
        ]);
        ctx.fill();
        lobe(0, R * 0.12, R * 0.5, R * 0.86, true);

        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = R * 0.09;
        ctx.beginPath();
        ctx.moveTo(-R * 0.12, -R * 0.3);
        ctx.quadraticCurveTo(-R * 0.24, R * 0.1, -R * 0.1, R * 0.55);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = R * 0.05;
        ctx.beginPath();
        ctx.moveTo(-R * 0.64, -R * 0.2);
        ctx.quadraticCurveTo(-R * 0.72, R * 0.15, -R * 0.56, R * 0.45);
        ctx.stroke();

        ellipse(ctx, 0, -R * 0.66, R * 0.3, R * 0.12);
        ctx.fillStyle = '#2f6e1f';
        ctx.fill();
        ctx.strokeStyle = linear(ctx, 0, -R * 1.05, 0, -R * 0.66, [[0, '#6fb84a'], [1, '#2a6a1c']]);
        ctx.lineWidth = R * 0.17;
        ctx.beginPath();
        ctx.moveTo(0, -R * 0.66);
        ctx.quadraticCurveTo(R * 0.02, -R * 0.95, R * 0.22, -R * 1.02);
        ctx.stroke();
        ellipse(ctx, R * 0.24, -R * 1.02, R * 0.07, R * 0.08);
        ctx.fillStyle = '#a6d97a';
        ctx.fill();
    }

    function pepperRadius(a, R) {
        return R * (0.8 + 0.16 * Math.pow(Math.abs(Math.sin(2 * a)), 0.6));
    }

    function tracePepperRing(ctx, R, inset) {
        for (let i = 0; i <= 96; i++) {
            const a = (i / 96) * TAU;
            const r = pepperRadius(a, R) - inset;
            const x = Math.cos(a) * r;
            const y = Math.sin(a) * r;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
    }

    function drawPepperCut(ctx, R, p) {
        const wall = R * 0.19;
        ctx.beginPath();
        tracePepperRing(ctx, R, 0);
        tracePepperRing(ctx, R, wall);
        ctx.fillStyle = radial(ctx, 0, 0, R * 0.5, 0, 0, R, [[0, p.flesh], [0.72, p.mid], [1, p.lo]]);
        ctx.fill('evenodd');

        ctx.beginPath();
        tracePepperRing(ctx, R, 0);
        ctx.strokeStyle = p.edge;
        ctx.lineWidth = R * 0.05;
        ctx.stroke();

        ctx.beginPath();
        tracePepperRing(ctx, R, wall);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = R * 0.03;
        ctx.stroke();

        ctx.lineCap = 'round';
        for (let k = 0; k < 4; k++) {
            const a = (k / 4) * TAU;
            const outer = pepperRadius(a, R) - wall;
            ctx.strokeStyle = p.flesh;
            ctx.lineWidth = R * 0.06;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * outer, Math.sin(a) * outer);
            ctx.lineTo(Math.cos(a) * R * 0.38, Math.sin(a) * R * 0.38);
            ctx.stroke();
            ctx.fillStyle = '#fff8dc';
            for (let s = 0; s < 3; s++) {
                const d = R * (0.36 + s * 0.06);
                const off = (s - 1) * 0.18;
                ellipse(ctx, Math.cos(a + off) * d, Math.sin(a + off) * d, R * 0.045, R * 0.03, a);
                ctx.fill();
            }
        }
    }

    /* ------------------------------------------------------------------ */
    /* Mushroom                                                            */
    /* ------------------------------------------------------------------ */

    function drawMushroom(ctx, R) {
        ellipse(ctx, 0, R * 0.08, R * 0.86, R * 0.2);
        ctx.fillStyle = linear(ctx, 0, -R * 0.1, 0, R * 0.3, [[0, '#9c7b52'], [1, '#dcc4a0']]);
        ctx.fill();
        ctx.strokeStyle = 'rgba(110, 80, 45, 0.4)';
        ctx.lineWidth = R * 0.02;
        for (let i = 1; i < 14; i++) {
            const a = (i / 14) * Math.PI;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * R * 0.3, R * 0.08 + Math.sin(a) * R * 0.07);
            ctx.lineTo(Math.cos(a) * R * 0.84, R * 0.08 + Math.sin(a) * R * 0.19);
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.moveTo(-R * 0.3, R * 0.05);
        ctx.bezierCurveTo(-R * 0.34, R * 0.45, -R * 0.38, R * 0.75, -R * 0.28, R * 0.88);
        ctx.quadraticCurveTo(0, R * 0.98, R * 0.28, R * 0.88);
        ctx.bezierCurveTo(R * 0.38, R * 0.75, R * 0.34, R * 0.45, R * 0.3, R * 0.05);
        ctx.closePath();
        ctx.fillStyle = linear(ctx, -R * 0.35, 0, R * 0.35, 0, [
            [0, '#cbb48f'],
            [0.35, '#fbf4e4'],
            [0.7, '#efe2c9'],
            [1, '#bfa47c'],
        ]);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-R * 0.95, R * 0.1);
        ctx.bezierCurveTo(-R * 0.98, -R * 0.62, -R * 0.45, -R * 0.86, 0, -R * 0.86);
        ctx.bezierCurveTo(R * 0.45, -R * 0.86, R * 0.98, -R * 0.62, R * 0.95, R * 0.1);
        ctx.quadraticCurveTo(0, -R * 0.18, -R * 0.95, R * 0.1);
        ctx.closePath();
        ctx.fillStyle = radial(ctx, -R * 0.3, -R * 0.55, R * 0.05, 0, -R * 0.2, R * 1.05, [
            [0, '#fffaf0'],
            [0.5, '#efdfc4'],
            [0.85, '#cfb089'],
            [1, '#a98457'],
        ]);
        ctx.fill();
        ctx.strokeStyle = 'rgba(120, 85, 50, 0.35)';
        ctx.lineWidth = R * 0.03;
        ctx.stroke();

        const rnd = seeded(11);
        ctx.fillStyle = 'rgba(150, 110, 70, 0.22)';
        for (let i = 0; i < 7; i++) {
            ellipse(ctx, (rnd() - 0.5) * R * 1.3, -R * 0.2 - rnd() * R * 0.5, R * 0.05, R * 0.035, rnd() * TAU);
            ctx.fill();
        }
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ellipse(ctx, -R * 0.38, -R * 0.52, R * 0.22, R * 0.09, -0.5);
        ctx.fill();
    }

    function mushroomCutPath(ctx, R) {
        ctx.beginPath();
        ctx.moveTo(-R * 0.96, R * 0.12);
        ctx.bezierCurveTo(-R * 0.98, -R * 0.6, -R * 0.45, -R * 0.86, 0, -R * 0.86);
        ctx.bezierCurveTo(R * 0.45, -R * 0.86, R * 0.98, -R * 0.6, R * 0.96, R * 0.12);
        ctx.quadraticCurveTo(R * 0.92, R * 0.26, R * 0.7, R * 0.24);
        ctx.quadraticCurveTo(R * 0.42, R * 0.2, R * 0.3, R * 0.34);
        ctx.lineTo(R * 0.28, R * 0.82);
        ctx.quadraticCurveTo(0, R * 0.96, -R * 0.28, R * 0.82);
        ctx.lineTo(-R * 0.3, R * 0.34);
        ctx.quadraticCurveTo(-R * 0.42, R * 0.2, -R * 0.7, R * 0.24);
        ctx.quadraticCurveTo(-R * 0.92, R * 0.26, -R * 0.96, R * 0.12);
        ctx.closePath();
    }

    function drawMushroomCut(ctx, R) {
        mushroomCutPath(ctx, R);
        ctx.fillStyle = radial(ctx, 0, -R * 0.1, R * 0.1, 0, 0, R, [
            [0, '#fffaf0'],
            [0.7, '#f5ecd9'],
            [1, '#e8d9bd'],
        ]);
        ctx.fill();

        ctx.save();
        mushroomCutPath(ctx, R);
        ctx.clip();
        ctx.strokeStyle = 'rgba(190, 160, 115, 0.7)';
        ctx.lineWidth = R * 0.1;
        ctx.lineCap = 'round';
        [-1, 1].forEach((side) => {
            ctx.beginPath();
            ctx.moveTo(side * R * 0.9, R * 0.18);
            ctx.quadraticCurveTo(side * R * 0.5, R * 0.08, side * R * 0.3, R * 0.28);
            ctx.stroke();
        });
        ctx.strokeStyle = 'rgba(210, 190, 150, 0.45)';
        ctx.lineWidth = R * 0.025;
        [-0.12, 0, 0.12].forEach((x) => {
            ctx.beginPath();
            ctx.moveTo(x * R, R * 0.8);
            ctx.lineTo(x * R * 1.4, -R * 0.4);
            ctx.stroke();
        });
        ctx.restore();

        mushroomCutPath(ctx, R);
        ctx.strokeStyle = '#a7845a';
        ctx.lineWidth = R * 0.06;
        ctx.stroke();
    }

    /* ------------------------------------------------------------------ */
    /* Onion                                                               */
    /* ------------------------------------------------------------------ */

    function onionPath(ctx, R) {
        ctx.beginPath();
        ctx.moveTo(0, -R);
        ctx.bezierCurveTo(R * 0.18, -R * 0.78, R * 0.95, -R * 0.62, R * 0.95, R * 0.08);
        ctx.bezierCurveTo(R * 0.95, R * 0.68, R * 0.5, R * 0.9, 0, R * 0.9);
        ctx.bezierCurveTo(-R * 0.5, R * 0.9, -R * 0.95, R * 0.68, -R * 0.95, R * 0.08);
        ctx.bezierCurveTo(-R * 0.95, -R * 0.62, -R * 0.18, -R * 0.78, 0, -R);
        ctx.closePath();
    }

    function drawOnion(ctx, R) {
        onionPath(ctx, R);
        ctx.fillStyle = radial(ctx, -R * 0.3, -R * 0.25, R * 0.05, 0, R * 0.05, R, [
            [0, '#ee93cc'],
            [0.4, '#b53d8c'],
            [0.85, '#7a1f5e'],
            [1, '#5a1444'],
        ]);
        ctx.fill();

        ctx.save();
        onionPath(ctx, R);
        ctx.clip();
        ctx.strokeStyle = 'rgba(255, 210, 240, 0.28)';
        ctx.lineWidth = R * 0.035;
        [-0.7, -0.4, -0.12, 0.18, 0.48, 0.76].forEach((k) => {
            ctx.beginPath();
            ctx.moveTo(0, -R);
            ctx.quadraticCurveTo(k * R * 1.35, -R * 0.05, k * R * 0.35, R * 0.92);
            ctx.stroke();
        });
        ctx.restore();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ellipse(ctx, -R * 0.42, -R * 0.18, R * 0.12, R * 0.26, 0.35);
        ctx.fill();

        ctx.lineCap = 'round';
        ctx.strokeStyle = '#a07a4a';
        ctx.lineWidth = R * 0.08;
        ctx.beginPath();
        ctx.moveTo(0, -R * 0.94);
        ctx.quadraticCurveTo(R * 0.08, -R * 1.1, R * 0.02, -R * 1.2);
        ctx.stroke();
        ctx.strokeStyle = '#eadbbb';
        ctx.lineWidth = R * 0.03;
        [-0.12, 0, 0.12].forEach((x) => {
            ctx.beginPath();
            ctx.moveTo(x * R * 0.4, R * 0.88);
            ctx.quadraticCurveTo(x * R, R * 0.98, x * R * 1.4, R * 1.04);
            ctx.stroke();
        });
    }

    function drawOnionCut(ctx, R) {
        ellipse(ctx, 0, 0, R, R * 0.95);
        ctx.fillStyle = '#7c1f60';
        ctx.fill();
        let r = R * 0.93;
        while (r > R * 0.1) {
            ellipse(ctx, 0, 0, r, r * 0.95);
            ctx.fillStyle = '#c4569a';
            ctx.fill();
            ellipse(ctx, 0, 0, r - R * 0.035, (r - R * 0.035) * 0.95);
            ctx.fillStyle = radial(ctx, 0, 0, 0, 0, 0, r, [[0, '#fff6fb'], [1, '#f1cfe4']]);
            ctx.fill();
            r -= R * 0.14;
        }
        ellipse(ctx, 0, 0, R * 0.08, R * 0.08);
        ctx.fillStyle = '#e9b4d5';
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ellipse(ctx, -R * 0.38, -R * 0.42, R * 0.24, R * 0.09, -0.6);
        ctx.fill();
    }

    /* ------------------------------------------------------------------ */
    /* Broccoli                                                            */
    /* ------------------------------------------------------------------ */

    const FLORETS = [
        [0, -0.62, 0.36],
        [-0.32, -0.42, 0.4],
        [0.32, -0.42, 0.4],
        [0, -0.25, 0.42],
        [-0.58, -0.05, 0.36],
        [0.58, -0.05, 0.36],
        [-0.25, -0.05, 0.38],
        [0.25, -0.05, 0.38],
    ];

    function drawFloret(ctx, x, y, r, cut) {
        ellipse(ctx, x, y, r, r * 0.92);
        ctx.fillStyle = cut
            ? radial(ctx, x, y, 0, x, y, r, [[0, '#4fae45'], [1, '#226b28']])
            : radial(ctx, x - r * 0.35, y - r * 0.4, r * 0.05, x, y, r, [
                  [0, '#8fdc6a'],
                  [0.5, '#3c9a3c'],
                  [1, '#1b5a22'],
              ]);
        ctx.fill();
        for (let k = 0; k < 7; k++) {
            const a = (k / 7) * TAU + x;
            const bx = x + Math.cos(a) * r * 0.55;
            const by = y + Math.sin(a) * r * 0.5;
            ctx.fillStyle = radial(ctx, bx - r * 0.08, by - r * 0.1, 0, bx, by, r * 0.3, [
                [0, 'rgba(180, 245, 140, 0.4)'],
                [1, 'rgba(180, 245, 140, 0)'],
            ]);
            ellipse(ctx, bx, by, r * 0.3, r * 0.3);
            ctx.fill();
        }
    }

    function broccoliStemPath(ctx, R, width) {
        ctx.beginPath();
        ctx.moveTo(-R * 0.2 * width, 0);
        ctx.quadraticCurveTo(-R * 0.18 * width, R * 0.55, -R * 0.3 * width, R * 0.92);
        ctx.quadraticCurveTo(0, R * 1.0, R * 0.3 * width, R * 0.92);
        ctx.quadraticCurveTo(R * 0.18 * width, R * 0.55, R * 0.2 * width, 0);
        ctx.closePath();
    }

    function drawBroccoli(ctx, R) {
        broccoliStemPath(ctx, R, 1);
        ctx.fillStyle = linear(ctx, -R * 0.3, 0, R * 0.3, 0, [
            [0, '#86b456'],
            [0.5, '#d4ecaa'],
            [1, '#77a548'],
        ]);
        ctx.fill();
        ctx.strokeStyle = '#a9d07a';
        ctx.lineWidth = R * 0.12;
        ctx.lineCap = 'round';
        [-1, 1].forEach((side) => {
            ctx.beginPath();
            ctx.moveTo(0, R * 0.25);
            ctx.lineTo(side * R * 0.45, R * 0.02);
            ctx.stroke();
        });
        FLORETS.forEach(([x, y, r]) => drawFloret(ctx, x * R, y * R, r * R, false));
    }

    function drawBroccoliCut(ctx, R) {
        FLORETS.forEach(([x, y, r]) => drawFloret(ctx, x * R, y * R, r * R, true));
        broccoliStemPath(ctx, R, 0.85);
        ctx.fillStyle = '#d6eda8';
        ctx.fill();
        ctx.strokeStyle = '#d6eda8';
        ctx.lineCap = 'round';
        FLORETS.forEach(([x, y]) => {
            ctx.lineWidth = R * 0.09;
            ctx.beginPath();
            ctx.moveTo(0, R * 0.2);
            ctx.quadraticCurveTo(x * R * 0.3, y * R * 0.2, x * R, y * R);
            ctx.stroke();
        });
        ctx.fillStyle = 'rgba(214, 237, 168, 0.8)';
        FLORETS.forEach(([x, y, r]) => {
            ellipse(ctx, x * R, y * R, r * R * 0.35, r * R * 0.3);
            ctx.fill();
        });
    }

    /* ------------------------------------------------------------------ */
    /* Pasta                                                               */
    /* ------------------------------------------------------------------ */

    function pennePath(ctx, L, w, s) {
        ctx.beginPath();
        ctx.moveTo(-L / 2 + s, -w / 2);
        ctx.lineTo(L / 2 + s, -w / 2);
        ctx.lineTo(L / 2 - s, w / 2);
        ctx.lineTo(-L / 2 - s, w / 2);
        ctx.closePath();
    }

    function drawPenneShape(ctx, L, w) {
        const s = w * 0.5;
        pennePath(ctx, L, w, s);
        ctx.fillStyle = linear(ctx, 0, -w / 2, 0, w / 2, [
            [0, '#fff3b0'],
            [0.35, '#ffd968'],
            [0.75, '#f0b03c'],
            [1, '#c98418'],
        ]);
        ctx.fill();

        ctx.save();
        pennePath(ctx, L, w, s);
        ctx.clip();
        ctx.strokeStyle = 'rgba(170, 100, 15, 0.32)';
        ctx.lineWidth = w * 0.05;
        for (let k = 1; k < 6; k++) {
            const y = -w / 2 + (k * w) / 6;
            ctx.beginPath();
            ctx.moveTo(-L, y);
            ctx.lineTo(L, y);
            ctx.stroke();
        }
        ctx.restore();

        ctx.save();
        ctx.translate(L / 2, 0);
        ctx.rotate(Math.atan2(w, -2 * s));
        ellipse(ctx, 0, 0, Math.hypot(2 * s, w) / 2, w * 0.22);
        ctx.fillStyle = '#c27a1a';
        ctx.fill();
        ctx.strokeStyle = '#ffe9a0';
        ctx.lineWidth = w * 0.07;
        ctx.stroke();
        ctx.restore();
    }

    function drawPastaPiece(ctx, R) {
        ctx.rotate(-0.5);
        drawPenneShape(ctx, R * 1.9, R * 0.62);
    }

    function drawSparkle(ctx, x, y, s) {
        ctx.beginPath();
        ctx.moveTo(x, y - s);
        ctx.quadraticCurveTo(x, y, x + s, y);
        ctx.quadraticCurveTo(x, y, x, y + s);
        ctx.quadraticCurveTo(x, y, x - s, y);
        ctx.quadraticCurveTo(x, y, x, y - s);
        ctx.fill();
    }

    /** Bonus item: a glowing golden Milan penne. */
    function drawGoldenPenne(ctx, R) {
        ctx.save();
        ctx.rotate(-0.5);
        ctx.shadowColor = 'rgba(255, 230, 90, 0.95)';
        ctx.shadowBlur = R * 0.45;
        pennePath(ctx, R * 1.8, R * 0.66, R * 0.33);
        ctx.fillStyle = '#ffd23a';
        ctx.fill();
        ctx.shadowBlur = 0;
        drawPenneShape(ctx, R * 1.8, R * 0.66);
        ctx.restore();
        ctx.fillStyle = '#ffffff';
        drawSparkle(ctx, -R * 0.75, -R * 0.55, R * 0.2);
        drawSparkle(ctx, R * 0.8, R * 0.35, R * 0.15);
        drawSparkle(ctx, R * 0.15, -R * 0.75, R * 0.11);
    }

    /* ------------------------------------------------------------------ */
    /* Basil leaf                                                          */
    /* ------------------------------------------------------------------ */

    function drawLeaf(ctx, R) {
        ctx.beginPath();
        ctx.moveTo(-R, 0);
        ctx.bezierCurveTo(-R * 0.45, -R * 0.78, R * 0.55, -R * 0.62, R, 0);
        ctx.bezierCurveTo(R * 0.55, R * 0.62, -R * 0.45, R * 0.78, -R, 0);
        ctx.closePath();
        ctx.fillStyle = linear(ctx, 0, -R * 0.6, 0, R * 0.6, [
            [0, '#8be05f'],
            [0.5, '#43ad3a'],
            [1, '#1f7426'],
        ]);
        ctx.fill();

        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(225, 255, 200, 0.7)';
        ctx.lineWidth = R * 0.05;
        ctx.beginPath();
        ctx.moveTo(-R, 0);
        ctx.quadraticCurveTo(0, -R * 0.08, R * 0.9, 0);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(225, 255, 200, 0.4)';
        ctx.lineWidth = R * 0.025;
        [-0.55, -0.15, 0.25].forEach((k) => {
            [-1, 1].forEach((side) => {
                ctx.beginPath();
                ctx.moveTo(k * R, -R * 0.04);
                ctx.quadraticCurveTo((k + 0.12) * R, side * R * 0.25, (k + 0.32) * R, side * R * 0.4);
                ctx.stroke();
            });
        });
        ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
        ellipse(ctx, -R * 0.1, -R * 0.25, R * 0.45, R * 0.1, -0.1);
        ctx.fill();
        ctx.strokeStyle = '#2f7d2a';
        ctx.lineWidth = R * 0.06;
        ctx.beginPath();
        ctx.moveTo(-R, 0);
        ctx.lineTo(-R * 1.18, R * 0.1);
        ctx.stroke();
    }

    /* ------------------------------------------------------------------ */
    /* Rotten overlay                                                      */
    /* ------------------------------------------------------------------ */

    function drawRot(ctx, R, seed) {
        const rnd = seeded(seed);
        ctx.save();
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = 'rgba(78, 62, 24, 0.6)';
        ctx.fillRect(-R * 2, -R * 2, R * 4, R * 4);
        for (let i = 0; i < 6; i++) {
            const a = rnd() * TAU;
            const d = rnd() * R * 0.6;
            const x = Math.cos(a) * d;
            const y = Math.sin(a) * d;
            const r = R * (0.12 + rnd() * 0.2);
            ctx.fillStyle = radial(ctx, x, y, r * 0.6, x, y, r * 1.6, [
                [0, 'rgba(170, 180, 120, 0.55)'],
                [1, 'rgba(170, 180, 120, 0)'],
            ]);
            ellipse(ctx, x, y, r * 1.6, r * 1.6);
            ctx.fill();
            ctx.fillStyle = radial(ctx, x - r * 0.2, y - r * 0.2, 0, x, y, r, [
                [0, '#16100a'],
                [0.7, '#2b1f0e'],
                [1, 'rgba(60, 45, 20, 0.6)'],
            ]);
            ellipse(ctx, x, y, r, r * 0.85, rnd() * TAU);
            ctx.fill();
            ctx.fillStyle = 'rgba(230, 235, 210, 0.55)';
            for (let k = 0; k < 5; k++) {
                const t = rnd() * TAU;
                ellipse(ctx, x + Math.cos(t) * r * 1.1, y + Math.sin(t) * r, R * 0.025, R * 0.025);
                ctx.fill();
            }
        }
        ctx.strokeStyle = 'rgba(30, 20, 8, 0.45)';
        ctx.lineWidth = R * 0.03;
        ctx.lineCap = 'round';
        for (let i = 0; i < 4; i++) {
            const x = (rnd() - 0.5) * R;
            const y = (rnd() - 0.5) * R;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.quadraticCurveTo(x + R * 0.15, y - R * 0.1, x + R * 0.3, y + R * 0.02);
            ctx.stroke();
        }
        ctx.restore();
    }

    /* ------------------------------------------------------------------ */
    /* Sprite registry                                                     */
    /* ------------------------------------------------------------------ */

    const DRAW = {
        tomato: { whole: drawTomato, cut: drawTomatoCut },
        yellowPepper: {
            whole: (ctx, R) => drawPepper(ctx, R, PEPPER.yellow),
            cut: (ctx, R) => drawPepperCut(ctx, R, PEPPER.yellow),
        },
        greenPepper: {
            whole: (ctx, R) => drawPepper(ctx, R, PEPPER.green),
            cut: (ctx, R) => drawPepperCut(ctx, R, PEPPER.green),
        },
        redPepper: {
            whole: (ctx, R) => drawPepper(ctx, R, PEPPER.red),
            cut: (ctx, R) => drawPepperCut(ctx, R, PEPPER.red),
        },
        mushroom: { whole: drawMushroom, cut: drawMushroomCut },
        onion: { whole: drawOnion, cut: drawOnionCut },
        broccoli: { whole: drawBroccoli, cut: drawBroccoliCut },
        goldenPenne: { whole: drawGoldenPenne, cut: drawGoldenPenne },
        pasta: { whole: drawPastaPiece, cut: drawPastaPiece },
        leaf: { whole: drawLeaf, cut: drawLeaf },
    };

    /** Colours sprayed when an ingredient is sliced. */
    const JUICE = {
        tomato: ['#ff3b2f', '#ff6a4d', '#ffd36b', '#d61f12'],
        yellowPepper: ['#ffd21f', '#fff08a', '#ffb400'],
        greenPepper: ['#3fae3f', '#b8f28a', '#2a8a2e'],
        redPepper: ['#e8301c', '#ff8a6a'],
        mushroom: ['#f3e6d0', '#d9c19c', '#fffaf0'],
        onion: ['#f4dff0', '#c4569a', '#ffffff'],
        broccoli: ['#4caf50', '#a5d66b', '#2e7d32'],
        goldenPenne: ['#ffe14a', '#fff6b0', '#ffc400', '#ffffff'],
        rotten: ['#4a3b16', '#6b5a24', '#2c2410', '#8a9a3a'],
    };

    const SPRITE_PAD = 2.7;
    const cache = new Map();

    function hashString(text) {
        let h = 2166136261;
        for (let i = 0; i < text.length; i++) {
            h = Math.imul(h ^ text.charCodeAt(i), 16777619);
        }
        return h >>> 0;
    }

    function paint(ctx, type, variant, rotten, R) {
        DRAW[type][variant](ctx, R);
        if (rotten) {
            drawRot(ctx, R, hashString(type + variant));
        }
    }

    /**
     * Returns a cached, pre-rendered sprite of an ingredient.
     * The sprite is drawn centred: drawImage(canvas, -size / 2, -size / 2, size, size).
     */
    function sprite(type, variant, rotten, R, scale) {
        const key = `${type}|${variant}|${rotten ? 1 : 0}|${Math.round(R * scale)}`;
        let entry = cache.get(key);
        if (!entry) {
            const size = R * SPRITE_PAD;
            const px = Math.ceil(size * scale);
            const canvas = createCanvas(px, px);
            const ctx = canvas.getContext('2d');
            ctx.translate(px / 2, px / 2);
            ctx.scale(scale, scale);
            paint(ctx, type, variant, rotten, R);
            entry = { canvas, size };
            cache.set(key, entry);
        }
        return entry;
    }

    function spriteURL(type, variant, rotten, px) {
        const canvas = createCanvas(px, px);
        const ctx = canvas.getContext('2d');
        ctx.translate(px / 2, px / 2);
        paint(ctx, type, variant, rotten, px / SPRITE_PAD);
        return canvas.toDataURL('image/png');
    }

    /* ------------------------------------------------------------------ */
    /* Kitchen background and cutting board                                */
    /* ------------------------------------------------------------------ */

    function drawBoard(ctx, W, H, U) {
        const cx = W / 2;
        const top = H - U * 13;
        const rx = W * 0.64;
        const ry = U * 6.5;
        const thick = U * 4;

        ctx.save();
        ctx.translate(cx, top + thick);
        ctx.scale(1, ry / rx);
        ctx.fillStyle = radial(ctx, 0, 0, rx * 0.6, 0, 0, rx * 1.15, [
            [0, 'rgba(0, 0, 0, 0.5)'],
            [1, 'rgba(0, 0, 0, 0)'],
        ]);
        ellipse(ctx, 0, 0, rx * 1.15, rx * 1.15);
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = linear(ctx, 0, top, 0, top + ry + thick, [[0, '#7a3f16'], [1, '#3d1d07']]);
        ellipse(ctx, cx, top + thick, rx, ry);
        ctx.fill();
        ctx.fillRect(cx - rx, top, rx * 2, thick);

        ellipse(ctx, cx, top, rx, ry);
        ctx.fillStyle = linear(ctx, cx - rx, 0, cx + rx, 0, [
            [0, '#9c5a26'],
            [0.3, '#c98546'],
            [0.55, '#d8995c'],
            [0.8, '#bf7a3c'],
            [1, '#94521f'],
        ]);
        ctx.fill();

        ctx.save();
        ellipse(ctx, cx, top, rx, ry);
        ctx.clip();
        const rnd = seeded(5);
        ctx.strokeStyle = 'rgba(90, 40, 10, 0.2)';
        ctx.lineWidth = U * 0.25;
        for (let k = 0; k < 16; k++) {
            const y = top - ry + (k + 0.5) * ((ry * 2) / 16);
            const phase = rnd() * TAU;
            ctx.beginPath();
            for (let x = cx - rx; x <= cx + rx; x += U * 2) {
                const yy = y + Math.sin(x / (U * 9) + phase) * U * 0.5;
                if (x === cx - rx) {
                    ctx.moveTo(x, yy);
                } else {
                    ctx.lineTo(x, yy);
                }
            }
            ctx.stroke();
        }
        ctx.fillStyle = radial(ctx, cx, top - ry * 0.4, 0, cx, top, rx * 0.7, [
            [0, 'rgba(255, 220, 170, 0.25)'],
            [1, 'rgba(255, 220, 170, 0)'],
        ]);
        ctx.fillRect(cx - rx, top - ry, rx * 2, ry * 2);
        ctx.restore();

        ctx.beginPath();
        ctx.ellipse(cx, top, rx - U * 0.3, ry - U * 0.2, 0, Math.PI, TAU);
        ctx.strokeStyle = 'rgba(255, 220, 170, 0.35)';
        ctx.lineWidth = U * 0.4;
        ctx.stroke();
    }

    function drawKitchen(ctx, W, H, U) {
        const rnd = seeded(7);
        ctx.fillStyle = linear(ctx, 0, 0, 0, H, [
            [0, '#0b3a1f'],
            [0.45, '#14522b'],
            [1, '#082814'],
        ]);
        ctx.fillRect(0, 0, W, H);

        glow(ctx, W * 0.78, H * 0.13, W * 0.55, [170, 230, 140], 0.22);
        glow(ctx, W * 0.18, H * 0.3, W * 0.45, [90, 170, 90], 0.18);
        glow(ctx, W * 0.5, H * 0.5, W * 0.75, [120, 200, 110], 0.14);

        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 3; col++) {
                glow(ctx, W * (0.6 + col * 0.14), H * (0.08 + row * 0.08), U * 7, [200, 245, 180], 0.08);
            }
        }

        [0.34, 0.57, 0.8].forEach((f, index) => {
            const y = H * f;
            ctx.fillStyle = 'rgba(200, 240, 170, 0.09)';
            ctx.fillRect(0, y, W, U * 1.4);
            ctx.fillStyle = linear(ctx, 0, y + U * 1.4, 0, y + U * 6, [
                [0, 'rgba(0, 0, 0, 0.22)'],
                [1, 'rgba(0, 0, 0, 0)'],
            ]);
            ctx.fillRect(0, y + U * 1.4, W, U * 4.6);
            const objects = [
                [255, 220, 130],
                [240, 90, 70],
                [245, 240, 220],
                [120, 200, 110],
                [255, 200, 90],
            ];
            for (let i = 0; i < 5; i++) {
                const x = rnd() * W;
                const r = U * (3 + rnd() * 5);
                glow(ctx, x, y - r * 0.6, r, objects[(i + index) % objects.length], 0.14 + rnd() * 0.1);
            }
        });

        const bokeh = [
            [190, 255, 150],
            [255, 230, 140],
            [120, 210, 120],
        ];
        for (let i = 0; i < 40; i++) {
            glow(ctx, rnd() * W, rnd() * H * 0.85, U * (1.5 + rnd() * 5), bokeh[i % 3], 0.06 + rnd() * 0.14);
        }

        ctx.fillStyle = radial(ctx, W / 2, H * 0.45, Math.min(W, H) * 0.3, W / 2, H * 0.45, Math.max(W, H) * 0.75, [
            [0, 'rgba(0, 15, 5, 0)'],
            [1, 'rgba(0, 15, 5, 0.65)'],
        ]);
        ctx.fillRect(0, 0, W, H);

        drawBoard(ctx, W, H, U);
    }

    /* ------------------------------------------------------------------ */
    /* Chef's knife (tip at the origin, pointing along +x, edge facing +y)  */
    /* ------------------------------------------------------------------ */

    function drawKnife(ctx, U) {
        const blade = U * 22;
        const h = U * 5;
        const handle = U * 12;

        ctx.beginPath();
        ctx.moveTo(-blade, -h * 0.55);
        ctx.lineTo(-blade * 0.28, -h * 0.55);
        ctx.quadraticCurveTo(-blade * 0.08, -h * 0.45, 0, -h * 0.05);
        ctx.quadraticCurveTo(-blade * 0.18, h * 0.42, -blade * 0.42, h * 0.45);
        ctx.lineTo(-blade, h * 0.45);
        ctx.closePath();
        ctx.fillStyle = linear(ctx, 0, -h * 0.55, 0, h * 0.45, [
            [0, '#ffffff'],
            [0.45, '#d3dae0'],
            [1, '#8b97a2'],
        ]);
        ctx.fill();
        ctx.strokeStyle = 'rgba(40, 60, 70, 0.45)';
        ctx.lineWidth = U * 0.25;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-blade, h * 0.36);
        ctx.lineTo(-blade * 0.42, h * 0.36);
        ctx.quadraticCurveTo(-blade * 0.18, h * 0.33, -U * 0.6, -h * 0.02);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.lineWidth = U * 0.35;
        ctx.stroke();

        ctx.fillStyle = linear(ctx, 0, -h * 0.6, 0, h * 0.5, [[0, '#e6ebef'], [1, '#7f8a94']]);
        roundRectPath(ctx, -blade - U * 1.4, -h * 0.6, U * 1.4, h * 1.1, U * 0.4);
        ctx.fill();

        ctx.fillStyle = linear(ctx, 0, -h * 0.4, 0, h * 0.4, [
            [0, '#3cbf5c'],
            [0.5, '#178a3a'],
            [1, '#0b5a23'],
        ]);
        roundRectPath(ctx, -blade - U * 1.4 - handle, -h * 0.42, handle, h * 0.84, h * 0.4);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        roundRectPath(ctx, -blade - U * 1.4 - handle + U, -h * 0.3, handle - U * 2, h * 0.16, h * 0.08);
        ctx.fill();
        ctx.fillStyle = '#e8eef1';
        [0.3, 0.72].forEach((f) => {
            ellipse(ctx, -blade - U * 1.4 - handle * f, 0, U * 0.6, U * 0.6);
            ctx.fill();
        });
    }

    window.PastaArt = {
        JUICE,
        sprite,
        spriteURL,
        drawKitchen,
        drawKnife,
    };
})();
