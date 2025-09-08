// Système de transitions de pages avec fondu noir
class PageTransitions {
    constructor() {
        this.init();
    }

    init() {
        // Créer l'overlay de transition
        this.createOverlay();

        // Ajouter les styles CSS pour l'overlay
        this.addStyles();

        // Gérer les liens internes
        this.handleInternalLinks();

        // Animation d'entrée au chargement de la page
        this.animatePageIn();
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'page-transition-overlay';
        document.body.appendChild(this.overlay);
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #page-transition-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: #000;
                opacity: 0;
                visibility: hidden;
                z-index: 9999;
                transition: opacity 0.5s ease-in-out, visibility 0.5s ease-in-out;
                pointer-events: none;
            }

            #page-transition-overlay.active {
                opacity: 1;
                visibility: visible;
                pointer-events: all;
            }

            body.page-transition-in {
                opacity: 0;
                transform: translateY(10px);
                transition: opacity 0.5s ease-out, transform 0.5s ease-out;
            }

            body.page-transition-complete {
                opacity: 1;
                transform: translateY(0);
            }
        `;
        document.head.appendChild(style);
    }

    handleInternalLinks() {
        // Gérer tous les liens internes
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;

            const href = link.getAttribute('href');

            // Vérifier si c'est un lien interne (pas d'http/https/mailto/tel)
            if (href &&
                !href.startsWith('http') &&
                !href.startsWith('mailto') &&
                !href.startsWith('tel') &&
                !href.startsWith('#')) {

                e.preventDefault();
                this.navigateToPage(href);
            }
        });

        // Gérer aussi les éléments cliquables avec data-href
        document.addEventListener('click', (e) => {
            const element = e.target.closest('[data-href]');
            if (element) {
                e.preventDefault();
                const href = element.getAttribute('data-href');
                this.navigateToPage(href);
            }
        });
    }

    navigateToPage(url) {
        // Attendre 0.5s après le clic avant de commencer la transition
        setTimeout(() => {
            // Activer l'overlay
            this.overlay.classList.add('active');

            // Après 0.5s de fondu, naviguer vers la nouvelle page
            setTimeout(() => {
                window.location.href = url;
            }, 500);
        }, 500);
    }

    animatePageIn() {
        // Ajouter la classe pour l'animation d'entrée
        document.body.classList.add('page-transition-in');

        // Après un court délai, commencer l'animation d'entrée
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                document.body.classList.add('page-transition-complete');
                document.body.classList.remove('page-transition-in');
            });
        });
    }

    // Méthode publique pour déclencher une transition manuellement
    static goToPage(url) {
        const instance = new PageTransitions();
        instance.navigateToPage(url);
    }
}

// Initialiser les transitions au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    new PageTransitions();
});

// Export pour utilisation manuelle si nécessaire
window.PageTransitions = PageTransitions;
