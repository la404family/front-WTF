// Gestion des effets du header gaming moderne
document.addEventListener('DOMContentLoaded', function () {
    const header = document.querySelector('.header');
    const statsBtn = document.querySelector('.stats-btn');
    const notificationsBtn = document.querySelector('.notifications-btn');

    // Effet de scroll sur le header
    let lastScrollTop = 0;
    window.addEventListener('scroll', function () {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });

    // Effet de clic sur le bouton statistiques
    if (statsBtn) {
        statsBtn.addEventListener('click', function () {
            // Animation de feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 100);

            // Ici vous pouvez ajouter la logique pour ouvrir les statistiques
            console.log('Statistiques ouvertes');
        });
    }

    // Effet de clic sur le bouton notifications
    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', function () {
            // Animation de feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 100);

            // Animation du badge de notification
            const badge = this.querySelector('::after');
            if (badge) {
                // Réduire le compteur de notifications
                let currentCount = parseInt(getComputedStyle(this, '::after').content.replace(/"/g, ''));
                if (currentCount > 0) {
                    currentCount--;
                    // Note: Pour vraiment changer le contenu du ::after, il faudrait utiliser des variables CSS
                }
            }

            // Ici vous pouvez ajouter la logique pour ouvrir les notifications
            console.log('Notifications ouvertes');
        });
    }

    // Effet hover sur l'avatar
    const avatar = document.querySelector('.avatar');
    if (avatar) {
        avatar.addEventListener('mouseenter', function () {
            this.style.transform = 'scale(1.1) rotate(5deg)';
        });

        avatar.addEventListener('mouseleave', function () {
            this.style.transform = '';
        });

        // Effet de clic sur l'avatar
        avatar.addEventListener('click', function () {
            // Animation de rotation
            this.style.animation = 'none';
            setTimeout(() => {
                this.style.animation = '';
            }, 10);

            this.style.transform = 'scale(1.2) rotate(360deg)';
            setTimeout(() => {
                this.style.transform = '';
            }, 500);

            console.log('Profil du joueur ouvert');
        });
    }

    // Effet de particules flottantes (optionnel)
    function createFloatingParticle() {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: radial-gradient(circle, #ffd700, transparent);
            border-radius: 50%;
            pointer-events: none;
            z-index: 0;
            opacity: 0.7;
        `;

        const startX = Math.random() * window.innerWidth;
        const duration = 3000 + Math.random() * 2000;

        particle.style.left = startX + 'px';
        particle.style.top = '100vh';

        document.body.appendChild(particle);

        // Animation de montée
        particle.animate([
            { transform: 'translateY(0px) scale(0)', opacity: 0 },
            { transform: 'translateY(-20px) scale(1)', opacity: 0.7, offset: 0.1 },
            { transform: `translateY(-${window.innerHeight + 50}px) scale(0)`, opacity: 0 }
        ], {
            duration: duration,
            easing: 'ease-out'
        }).onfinish = () => particle.remove();
    }

    // Créer des particules de temps en temps
    setInterval(createFloatingParticle, 2000);
});

// Fonction utilitaire pour mettre à jour les points du joueur
function updatePlayerPoints(newPoints) {
    const pointsElement = document.querySelector('.player-points');
    if (pointsElement) {
        // Animation de changement de points
        pointsElement.style.transform = 'scale(1.2)';
        pointsElement.style.color = '#00ff88';

        setTimeout(() => {
            pointsElement.textContent = `${newPoints.toLocaleString()} points`;

            setTimeout(() => {
                pointsElement.style.transform = '';
                pointsElement.style.color = '';
            }, 200);
        }, 100);
    }
}

// Fonction utilitaire pour mettre à jour le nom du joueur
function updatePlayerName(newName) {
    const nameElement = document.querySelector('.player-name');
    if (nameElement) {
        nameElement.textContent = newName;
    }
}
