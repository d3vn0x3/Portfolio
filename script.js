document.addEventListener('DOMContentLoaded', () => {
    // 1. --- CONFIGURACIÓN LANYARD (DISCORD STATUS) ---
    const DISCORD_USER_ID = '1321656593795780680';
    const discordStatusDot = document.getElementById('discord-status');
    const activityInfo = document.getElementById('activity-info');

    async function updateDiscordStatus() {
        try {
            const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
            const { data } = await response.json();

            if (!data) {
                discordStatusDot.className = 'status-dot offline';
                activityInfo.style.opacity = '0';
                return;
            }

            discordStatusDot.className = `status-dot ${data.discord_status}`;

            if (data.activities && data.activities.length > 0) {
                const mainActivity = data.activities[0];
                if (mainActivity.name === "Spotify") {
                    activityInfo.innerHTML = `<i class="fab fa-spotify"></i> Listening to: ${mainActivity.details}`;
                    activityInfo.style.opacity = '1';
                } else {
                    activityInfo.innerHTML = `<i class="fas fa-gamepad"></i> Playing: ${mainActivity.name}`;
                    activityInfo.style.opacity = '1';
                }
            } else {
                activityInfo.style.opacity = '0';
            }
        } catch (e) {
            discordStatusDot.className = 'status-dot offline';
        }
    }

    updateDiscordStatus();
    setInterval(updateDiscordStatus, 10000);

    // 2. --- FONDO DE ESTRELLAS ANIMADO (CANVAS) ---
    const canvas = document.getElementById('starsCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];

    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.init();
        }
        init() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x > canvas.width || this.x < 0 || this.y > canvas.height || this.y < 0) this.init();
        }
        draw() {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    for (let i = 0; i < 100; i++) particles.push(new Particle());

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }
    animate();

    // 3. --- SCROLL REVEAL (AQUÍ ESTABA EL FALLO) ---
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('js-scroll-active');
            } else {
                // Quitamos la clase para que se oculte al subir (más abuso de JS)
                entry.target.classList.remove('js-scroll-active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.js-scroll-hidden').forEach(el => observer.observe(el));

    // 4. --- EFECTO TILT 3D (INTERACTIVIDAD EXTRA) ---
    document.querySelectorAll('.card, .profile-header').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)`;
        });
    });
});