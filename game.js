(function() {
    let canvas, ctx, animationId;
    let plates = [];
    let bubbles = []; 
    let accumulatedLbs = 0; 
    let totalLbs = 0;
    let bgMusic;
    
    let startTime;
    let gameFinished = false;
    let currentRound = 1; 
    let isPaused = false; 
    let showMenu = false; 
    let motivationText = "";
    let isInitialized = false; 

    let pewPool = [];
    const PEW_POOL_SIZE = 10; 
    let currentPewIndex = 0;

    const SAVE_KEY = "BaoLuoi_GymGame_Save_V2";
    const USED_QUOTES_KEY = "BaoLuoi_UsedQuotes";

    const POLES = [
        { weight: 10, color: '#ef4444', stack: [] },
        { weight: 25, color: '#15803d', stack: [] },
        { weight: 35, color: '#eab308', stack: [] },
        { weight: 45, color: '#1d4ed8', stack: [] }
    ];

    const POLE_SPACING = 75; 
    const GRAVITY = 0.07; 
    const WATER_FRICTION = 0.97; 
    const BASE_Y = 400;
    const MAX_LIMIT = 40;   
    const DISPLAY_THICKNESS = 6.1; 

    const WEIGHT_TYPES = [
        { lbs: 45, color: '#1d4ed8', radius: 22, h: 10 },
        { lbs: 35, color: '#eab308', radius: 19, h: 9 },
        { lbs: 25, color: '#15803d', radius: 16, h: 8 },
        { lbs: 10, color: '#ef4444', radius: 12, h: 7 }
    ];

    let isRefilling = { 10: false, 25: false, 35: false, 45: false };
    let totalCreated = { 10: 5, 25: 5, 35: 5, 45: 5 };

    const MOTIVATIONS = window.MOTIVATION_DATA || ["KEEP PUSHING!", "NO PAIN NO GAIN", "GYM FUEL TORONTO", "BEAST MODE ON"];
    let usedQuotes = JSON.parse(localStorage.getItem(USED_QUOTES_KEY)) || [];

    function wrapText(context, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            let metrics = context.measureText(testLine);
            let testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                context.fillText(line, x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        context.fillText(line, x, currentY);
    }

    function getUniqueMotivation() {
        let availableQuotes = MOTIVATIONS.filter(q => !usedQuotes.includes(q));
        if (availableQuotes.length === 0) {
            usedQuotes = []; 
            availableQuotes = MOTIVATIONS;
        }
        const randomIndex = Math.floor(Math.random() * availableQuotes.length);
        const selectedQuote = availableQuotes[randomIndex];
        usedQuotes.push(selectedQuote);
        localStorage.setItem(USED_QUOTES_KEY, JSON.stringify(usedQuotes));
        return selectedQuote;
    }

    function saveGame() {
        const poleData = POLES.map(p => ({ weight: p.weight, count: p.stack.length }));
        const data = {
            accumulatedLbs, currentRound, startTime, poleData,
            lastPlayed: Date.now()
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    }

    setInterval(() => { if (isInitialized && !showMenu) saveGame(); }, 180000); 

    function getSavedData() {
        const saved = localStorage.getItem(SAVE_KEY);
        return saved ? JSON.parse(saved) : null;
    }

    function createBubble(x, y, isBig = false) {
        return {
            x: x, y: y,
            radius: isBig ? Math.random() * 5 + 4 : Math.random() * 3 + 1,
            speed: Math.random() * 2 + 1,
            sway: Math.random() * 0.05,
            offset: Math.random() * Math.PI * 2
        };
    }

    function initAudio() {
        if (!bgMusic) {
            bgMusic = new Audio('Toronto.mp3'); 
            bgMusic.loop = true;
            bgMusic.volume = 0.4;
        }
        if (pewPool.length === 0) {
            for (let i = 0; i < PEW_POOL_SIZE; i++) {
                let p = new Audio('pew.mp3');
                p.volume = 0.2;
                pewPool.push(p);
            }
        }
    }

    function playPewSpam() {
        if (pewPool.length > 0) {
            let sfx = pewPool[currentPewIndex];
            sfx.currentTime = 0;
            sfx.play().catch(e => {});
            currentPewIndex = (currentPewIndex + 1) % PEW_POOL_SIZE;
        }
    }

    function formatTime(ms) {
        let totalSeconds = Math.floor(ms / 1000);
        let m = Math.floor(totalSeconds / 60);
        let s = totalSeconds % 60;
        return (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
    }

    function renderStartMenu() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(11, 15, 26, 0.9)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const menuW = 260, menuH = 200;
        const menuX = (canvas.width - menuW) / 2;
        const menuY = (canvas.height - menuH) / 2;
        ctx.fillStyle = '#1e293b'; ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 3;
        if(ctx.roundRect) { ctx.beginPath(); ctx.roundRect(menuX, menuY, menuW, menuH, 20); ctx.fill(); ctx.stroke(); }
        else { ctx.fillRect(menuX, menuY, menuW, menuH); }
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText("CONTINUE TRAINING?", canvas.width/2, menuY + 45);
        const btnW = 180, btnH = 45, btnX = (canvas.width - btnW) / 2;
        ctx.fillStyle = '#15803d';
        if(ctx.roundRect) { ctx.beginPath(); ctx.roundRect(btnX, menuY + 75, btnW, btnH, 10); ctx.fill(); }
        ctx.fillStyle = 'white'; ctx.font = 'bold 16px Arial';
        ctx.fillText("RESUME", canvas.width/2, menuY + 103);
        ctx.fillStyle = '#ef4444';
        if(ctx.roundRect) { ctx.beginPath(); ctx.roundRect(btnX, menuY + 135, btnW, btnH, 10); ctx.fill(); }
        ctx.fillStyle = 'white'; ctx.fillText("RESTART", canvas.width/2, menuY + 163);
        canvas.onclick = (e) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
            const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
            if (mouseX > btnX && mouseX < btnX+btnW && mouseY > menuY+75 && mouseY < menuY+75+btnH) {
                const data = getSavedData();
                accumulatedLbs = data.accumulatedLbs || 0;
                currentRound = data.currentRound || 1;
                startTime = data.startTime || Date.now();
                canvas.onclick = null; startGameLogic(data.poleData); 
            } else if (mouseX > btnX && mouseX < btnX+btnW && mouseY > menuY+135 && mouseY < menuY+135+btnH) {
                localStorage.removeItem(SAVE_KEY); localStorage.removeItem(USED_QUOTES_KEY);
                usedQuotes = []; accumulatedLbs = 0; currentRound = 1; startTime = Date.now();
                canvas.onclick = null; startGameLogic();
            }
        };
    }

    function startNextRound() {
        if (isPaused) return;
        isPaused = true;
        motivationText = getUniqueMotivation();
        accumulatedLbs += plates.reduce((sum, p) => p.onPole ? sum + p.weight : sum, 0);
        POLES.forEach(p => p.stack = []);
        plates = []; 
        totalCreated = { 10: 0, 25: 0, 35: 0, 45: 0 }; 
        saveGame(); 
        setTimeout(() => {
            isPaused = false;
            currentRound++;
            WEIGHT_TYPES.forEach(t => totalCreated[t.lbs] = 5);
            spawnInitialPlates();
        }, 10000);
    }

    function spawnInitialPlates() {
        WEIGHT_TYPES.forEach(type => {
            for (let i = 0; i < 5; i++) {
                plates.push({
                    x: 50 + Math.random() * (canvas.width - 100),
                    y: canvas.height - 100 - (Math.random() * 150), 
                    vx: (Math.random() - 0.5) * 2, vy: 0,
                    weight: type.lbs, radius: type.radius, h: type.h,
                    angle: Math.random() * Math.PI, color: type.color, onPole: false, stackIndex: -1
                });
            }
        });
    }

    window.initGame = function() {
        setTimeout(() => {
            canvas = document.getElementById('waterGameCanvas');
            if (!canvas) return;
            ctx = canvas.getContext('2d');
            initAudio();
            if (isInitialized) { if (bgMusic && bgMusic.paused) bgMusic.play(); gameLoop(); return; }
            const savedData = getSavedData();
            if (savedData && (savedData.accumulatedLbs > 0 || savedData.currentRound > 1 || (savedData.poleData && savedData.poleData.some(d => d.count > 0)))) {
                showMenu = true; renderStartMenu();
            } else { startGameLogic(); }
        }, 150);
    };

    function startGameLogic(savedPoleData = null) {
        showMenu = false; isInitialized = true;
        if(!startTime) startTime = Date.now(); 
        gameFinished = false;
        const totalPolesWidth = (POLES.length - 1) * POLE_SPACING;
        const startX = (canvas.width - totalPolesWidth) / 2;
        plates = []; 
        POLES.forEach((p, i) => {
            p.x = startX + (i * POLE_SPACING); p.stack = [];
            if (savedPoleData) {
                const savedInfo = savedPoleData.find(d => d.weight === p.weight);
                if (savedInfo) {
                    const type = WEIGHT_TYPES.find(t => t.lbs === p.weight);
                    for (let j = 0; j < savedInfo.count; j++) {
                        let newPlate = {
                            x: p.x, y: BASE_Y - (j * DISPLAY_THICKNESS),
                            vx: 0, vy: 0, weight: type.lbs, radius: type.radius, h: type.h,
                            angle: 0, color: type.color, onPole: true, stackIndex: j
                        };
                        plates.push(newPlate); p.stack.push(newPlate);
                    }
                }
            }
        });
        bubbles = []; isRefilling = { 10: false, 25: false, 35: false, 45: false };
        totalCreated = { 10: 5, 25: 5, 35: 5, 45: 5 };
        POLES.forEach(p => { totalCreated[p.weight] = Math.max(5, p.stack.length); });
        if (!savedPoleData) spawnInitialPlates();
        if (animationId) cancelAnimationFrame(animationId);
        gameLoop();
    }

    function gameLoop() {
        if (!ctx || showMenu) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (Math.random() < 0.05) bubbles.push(createBubble(Math.random() * canvas.width, canvas.height + 10));
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        for (let i = bubbles.length - 1; i >= 0; i--) {
            let b = bubbles[i]; b.y -= b.speed; b.x += Math.sin(b.y * b.sway + b.offset) * 0.5;
            ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2); ctx.stroke();
            if (b.y < -10) bubbles.splice(i, 1);
        }

        if (!isPaused) {
            WEIGHT_TYPES.forEach(type => {
                const freePlatesCount = plates.filter(p => p.weight === type.lbs && !p.onPole).length;
                if (freePlatesCount === 0 && !isRefilling[type.lbs] && totalCreated[type.lbs] < MAX_LIMIT) {
                    isRefilling[type.lbs] = true; 
                    for(let i = 0; i < 5; i++) {
                        setTimeout(() => {
                            if (isPaused || totalCreated[type.lbs] >= MAX_LIMIT) return;
                            plates.push({
                                x: 50 + Math.random() * (canvas.width - 100), y: canvas.height + 50, 
                                vx: (Math.random() - 0.5) * 2, vy: -4 - Math.random() * 2, 
                                weight: type.lbs, radius: type.radius, h: type.h,
                                angle: 0, color: type.color, onPole: false, stackIndex: -1
                            });
                            totalCreated[type.lbs]++; 
                            if (i === 4) setTimeout(() => { isRefilling[type.lbs] = false; }, 1000);
                        }, i * 300); 
                    }
                }
            });
        }

        POLES.forEach(pole => {
            ctx.fillStyle = '#4b5563'; ctx.fillRect(pole.x - 3, 150, 6, 250); 
            ctx.fillStyle = '#1f2937'; ctx.fillRect(pole.x - 25, 400, 50, 8);
            ctx.fillStyle = pole.color; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center';
            ctx.fillText(pole.weight, pole.x, 425);
        });

        totalLbs = accumulatedLbs + plates.reduce((sum, p) => p.onPole ? sum + p.weight : sum, 0); 
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 28px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(`${totalLbs} LBS`, canvas.width / 2, 60);
        ctx.font = '18px monospace'; ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(`TIME: ${formatTime(Date.now() - startTime)} | ROUND ${currentRound}`, canvas.width / 2, 85);

        const flyingPlates = plates.filter(p => !p.onPole);
        const stashedPlates = plates.filter(p => p.onPole).sort((a, b) => a.stackIndex - b.stackIndex);
        const renderOrder = [...flyingPlates, ...stashedPlates];

        renderOrder.forEach(p => {
            if (!isPaused) {
                p.vy += GRAVITY; p.vy *= WATER_FRICTION;
                if (!p.onPole) {
                    p.vx *= 0.98; p.x += p.vx; p.y += p.vy; p.angle += p.vx * 0.05;
                    if (p.x < p.radius) { p.x = p.radius; p.vx *= -0.7; }
                    else if (p.x > canvas.width - p.radius) { p.x = canvas.width - p.radius; p.vx *= -0.7; }
                    if (p.y < p.radius) { if (p.y > -100) { p.y = p.radius; p.vy *= -0.5; } } 
                    else if (p.y > canvas.height - 25) { p.y = canvas.height - 25; p.vy *= -0.6; p.vx += (Math.random() - 0.5) * 0.5; }
                    POLES.forEach(pole => {
                        if (Math.abs(p.x - pole.x) < 12 && p.y > 140 && p.y < 170 && p.vy > 0 && p.weight === pole.weight && pole.stack.length < MAX_LIMIT) {
                            p.onPole = true; p.x = pole.x; p.vx = 0; p.angle = 0;
                            pole.stack.push(p); pole.stack.forEach((item, idx) => item.stackIndex = idx);
                        }
                    });
                } else {
                    p.y += p.vy;
                    const currentPole = POLES.find(pole => pole.weight === p.weight);
                    const idxInStack = currentPole.stack.indexOf(p);
                    const targetY = BASE_Y - (idxInStack * DISPLAY_THICKNESS);
                    if (p.y > targetY) { p.y = targetY; p.vy = 0; }
                    if (p.y < 145) {
                        p.onPole = false; p.vx = (Math.random() - 0.5) * 4;
                        currentPole.stack.splice(idxInStack, 1);
                        currentPole.stack.forEach((item, idx) => item.stackIndex = idx);
                    }
                }
            }
            ctx.save();
            ctx.translate(p.x, p.y);
            if (!p.onPole) ctx.rotate(p.angle); else ctx.scale(1, 0.4);
            ctx.beginPath(); ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.8)';
            ctx.lineWidth = 1.5; ctx.stroke();
            ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fillStyle = '#0b0f1a'; ctx.fill();
            if (p.onPole) ctx.scale(1, 2.5);
            ctx.rotate(p.onPole ? 0 : -p.angle);
            ctx.fillStyle = 'white'; ctx.font = `bold ${p.radius * 0.7}px Arial`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(p.weight, 0, 0); 
            ctx.restore();
        });

        if (isPaused) {
            ctx.fillStyle = 'rgba(11, 15, 26, 0.95)'; ctx.fillRect(0, 120, canvas.width, 350); 
            ctx.fillStyle = '#eab308'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center';
            ctx.fillText(`ROUND ${currentRound} COMPLETE!`, canvas.width / 2, 200);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'italic 18px Arial';
            wrapText(ctx, `"${motivationText}"`, canvas.width / 2, 260, 280, 25);
            ctx.font = '14px Arial'; ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.fillText("Next Round starts in 10s...", canvas.width / 2, 420);
        }

        animationId = requestAnimationFrame(gameLoop);
    }

    window.pushWater = function(side) {
        if (isPaused || showMenu) return; 
        if (bgMusic && bgMusic.paused) bgMusic.play();
        playPewSpam();
        const splashX = side === 'left' ? 40 : canvas.width - 40;
        for(let i=0; i<10; i++) bubbles.push(createBubble(splashX + (Math.random()-0.5)*60, canvas.height, true));
        plates.forEach(p => {
            const dist = side === 'left' ? p.x : canvas.width - p.x;
            if (dist < 230) {
                let baseForce = p.y > canvas.height * 0.7 ? 60 : (p.y > canvas.height * 0.35 ? 30 : 20);
                let dampingModifier = p.weight === 10 ? 0.6 : (p.weight === 25 ? 0.8 : (p.weight === 35 ? 0.85 : 0.9));
                const finalBaseForce = baseForce * dampingModifier;
                if (p.onPole) {
                    const currentPole = POLES.find(pole => pole.weight === p.weight);
                    const resistance = 1 + ((currentPole.stack.length - 1 - currentPole.stack.indexOf(p)) * 0.6); 
                    p.vy += ((-finalBaseForce / Math.sqrt(p.weight)) / resistance) * 0.45; 
                } else {
                    const force = (finalBaseForce / Math.sqrt(p.weight));
                    p.vy += -force * (Math.random() * 0.5 + 1);
                    p.vx += (side === 'left' ? 1.0 : -1.0) * (force * 0.2);
                }
            }
        });
    };

    window.stopGame = function() { if (bgMusic) bgMusic.pause(); cancelAnimationFrame(animationId); };

    // --- LOGIC BÀN PHÍM CÓ HIỆU ỨNG THỊ GIÁC ---
    window.addEventListener('keydown', (e) => {
        if (isPaused || showMenu) return;
        const key = e.key.toLowerCase();
        let side = null;

        if (key === 'a' || e.key === 'ArrowLeft') side = 'left';
        if (key === 'd' || e.key === 'ArrowRight') side = 'right';
        if (key === 'k') startNextRound();

        if (side) {
            window.pushWater(side);
            // Tạo hiệu ứng active cho nút
            const btn = document.querySelector(side === 'left' ? '.left-arm' : '.right-arm');
            if (btn) {
                btn.classList.add('keyboard-active');
                // Gỡ class sau 100ms để tạo hiệu ứng nháy
                setTimeout(() => btn.classList.remove('keyboard-active'), 100);
            }
        }
    });
})();