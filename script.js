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

// ========== GESTION DES ONGLETS ========== 
document.addEventListener('DOMContentLoaded', function () {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const dynamicCard = document.getElementById('dynamicUserCard');

    // Données d'exemple pour chaque onglet (à remplacer par les vraies données du backend plus tard)
    const tabData = {
        global: {
            rank: "#1",
            username: "Joueur Global",
            plan: "Elite",
            status: "en ligne",
            points: "Pts 492 387",
            avatar: "icons/app.svg"
        },
        moi: {
            rank: "#1",
            username: "Mon Profil",
            plan: "Elite",
            status: "en ligne",
            points: "Pts 492 387",
            avatar: "icons/app.svg"
        },
        amis: {
            rank: "#3",
            username: "Meilleur Ami",
            plan: "Pro",
            status: "hors ligne",
            points: "Pts 387 291",
            avatar: "icons/app.svg"
        }
    };

    // Fonction pour mettre à jour la card dynamique
    function updateDynamicCard(tabName) {
        const data = tabData[tabName];
        if (data && dynamicCard) {
            // Mise à jour des données de la card
            dynamicCard.setAttribute('data-user-rank', data.rank.replace('#', ''));

            const rankBadge = dynamicCard.querySelector('.rank-badge');
            const username = dynamicCard.querySelector('.username');
            const planBadge = dynamicCard.querySelector('.plan-badge');
            const statusText = dynamicCard.querySelector('.status-text');
            const points = dynamicCard.querySelector('.meta.points');
            const avatar = dynamicCard.querySelector('.card-avatar img');

            if (rankBadge) rankBadge.textContent = data.rank;
            if (username) username.textContent = data.username;
            if (planBadge) planBadge.textContent = data.plan;
            if (statusText) statusText.textContent = data.status;
            if (points) points.textContent = data.points;
            if (avatar) avatar.src = data.avatar;

            // Animation de mise à jour
            dynamicCard.style.opacity = '0.7';
            dynamicCard.style.transform = 'translateY(-10px)';

            setTimeout(() => {
                dynamicCard.style.opacity = '1';
                dynamicCard.style.transform = 'translateY(0)';
            }, 200);
        }
    }

    // Gestion des clics sur les onglets
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();

            // Retirer la classe active de tous les boutons
            tabButtons.forEach(btn => btn.classList.remove('active'));

            // Ajouter la classe active au bouton cliqué
            button.classList.add('active');

            // Récupérer le nom de l'onglet
            const tabName = button.getAttribute('data-tab');

            // Mettre à jour la card dynamique
            updateDynamicCard(tabName);

            // Animation de feedback du bouton
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = '';
            }, 100);

            console.log(`Onglet ${tabName} activé`);
        });
    });

    // Initialiser avec l'onglet actif au chargement de la page
    const activeTab = document.querySelector('.tab-btn.active');
    if (activeTab) {
        const initialTab = activeTab.getAttribute('data-tab') || 'global';
        updateDynamicCard(initialTab);
    }
});
