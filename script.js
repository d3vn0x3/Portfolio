document.addEventListener('DOMContentLoaded', () => {
    const GITHUB_USER = 'd3vn0x3';
    const DISCORD_ID = '1321656593795780680';

    // 1. FETCH GITHUB STATS
    async function fetchGitHub() {
        try {
            const res = await fetch(`https://api.github.com/users/${GITHUB_USER}`);
            const data = await res.json();
            document.getElementById('repo-count').innerText = data.public_repos || '0';
            document.getElementById('followers-count').innerText = data.followers || '0';
        } catch (e) { console.error("GitHub API Error"); }
    }

    // 2. LANYARD DISCORD STATUS
    async function updateStatus() {
        try {
            const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
            const { data } = await res.json();
            const dot = document.getElementById('discord-status');
            const activity = document.getElementById('activity-info');
            
            dot.className = `status-dot ${data.discord_status}`;
            
            if (data.activities.length > 0) {
                const act = data.activities[0];
                activity.innerHTML = `<i class="fas fa-gamepad"></i> ${act.name}${act.details ? ': ' + act.details : ''}`;
                activity.style.opacity = '1';
            } else {
                activity.style.opacity = '0';
            }
        } catch (e) { }
    }

    // 3. CANVAS BACKGROUND
    const canvas = document.getElementById('starsCanvas');
    const ctx = canvas.getContext('2d');
    let stars = [];

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    resize();

    class Star {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.z = Math.random() * canvas.width;
        }
        update() {
            this.z -= 0.5;
            if (this.z <= 0) this.z = canvas.width;
        }
        draw() {
            let sx = (this.x - canvas.width/2) * (canvas.width/this.z) + canvas.width/2;
            let sy = (this.y - canvas.height/2) * (canvas.width/this.z) + canvas.height/2;
            let size = (1 - this.z/canvas.width) * 3;
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(sx, sy, size, 0, Math.PI*2);
            ctx.fill();
        }
    }
    for(let i=0; i<400; i++) stars.push(new Star());

    function animate() {
        ctx.fillStyle = "black";
        ctx.fillRect(0,0, canvas.width, canvas.height);
        stars.forEach(s => { s.update(); s.draw(); });
        requestAnimationFrame(animate);
    }

    // 4. SCROLL REVEAL & TILT
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('js-scroll-active');
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.js-scroll-hidden').forEach(el => observer.observe(el));

    document.querySelectorAll('.card, .profile-header').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        
        // Calculamos la posición del ratón de -1 a 1
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;

        // VALORES EXAGERADOS:
        // rotateX: hasta 25 grados
        // rotateY: hasta 25 grados
        // scale: 1.08 (8% más grande)
        card.style.transform = `
            perspective(1000px) 
            rotateX(${-y * 50}deg) 
            rotateY(${x * 50}deg) 
            translateY(-15px) 
            scale(1.08)
        `;

        // Efecto de brillo dinámico que sigue al ratón
        const brightX = (e.clientX - r.left);
        const brightY = (e.clientY - r.top);
        card.style.background = `radial-gradient(circle at ${brightX}px ${brightY}px, rgba(0, 210, 255, 0.25) 0%, rgba(10, 10, 12, 0.9) 70%)`;
    });

    card.addEventListener('mouseleave', () => {
        // Regreso suave a la posición original
        card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)`;
        card.style.background = `rgba(10, 10, 12, 0.9)`;
    });
});

    fetchGitHub();
    updateStatus();
    animate();
    setInterval(updateStatus, 10000);
});