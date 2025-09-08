// Script pour la page de modification d'avatar
document.addEventListener('DOMContentLoaded', function () {
    let selectedIcon = 'x-circle-fill.svg'; // Icône actuelle par défaut

    // Éléments DOM
    const iconOptions = document.querySelectorAll('.icon-option');
    const avatarPreview = document.querySelector('.avatar-preview img');
    const saveButton = document.getElementById('saveAvatar');

    // Initialiser la sélection actuelle
    function initCurrentSelection() {
        const currentOption = document.querySelector(`[data-icon="${selectedIcon}"]`);
        if (currentOption) {
            currentOption.classList.add('selected');
        }
    }

    // Gérer la sélection d'icônes
    iconOptions.forEach(option => {
        option.addEventListener('click', function () {
            // Retirer la sélection précédente
            iconOptions.forEach(opt => opt.classList.remove('selected'));

            // Ajouter la sélection à l'option cliquée
            this.classList.add('selected');

            // Mettre à jour l'icône sélectionnée
            selectedIcon = this.getAttribute('data-icon');

            // Mettre à jour l'aperçu
            avatarPreview.src = `icons/${selectedIcon}`;

            // Animation de sélection
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });

        // Effet hover
        option.addEventListener('mouseenter', function () {
            if (!this.classList.contains('selected')) {
                this.style.transform = 'scale(1.05)';
            }
        });

        option.addEventListener('mouseleave', function () {
            if (!this.classList.contains('selected')) {
                this.style.transform = 'scale(1)';
            }
        });
    });

    // Gérer la sauvegarde
    saveButton.addEventListener('click', function () {
        // Sauvegarder dans le localStorage
        localStorage.setItem('userAvatar', selectedIcon);

        // Animation de succès
        this.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
        this.innerHTML = '<img src="icons/check-circle-fill.svg" alt="Sauvegardé" />Sauvegardé !';

        // Retourner à la page principale après 1 seconde
        setTimeout(() => {
            PageTransitions.goToPage('index.html');
        }, 1000);
    });

    // Initialiser
    initCurrentSelection();
});

// Styles CSS pour la page de modification d'avatar
const avatarModifierStyles = `
/* Styles pour la page de modification d'avatar */
.back-button-container {
    max-width: 800px;
    margin: 0 auto 20px auto;
    padding: 0 20px;
}

.back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--btn-uniform-bg);
    color: white;
    padding: 12px 20px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: var(--transition-smooth);
}

.back-btn:hover {
    background: var(--btn-uniform-hover-bg);
    transform: translateY(-2px) scale(1.02);
}

.back-btn img {
    width: 20px;
    height: 20px;
    filter: brightness(0) invert(1);
}

.page-title-container {
    max-width: 800px;
    margin: 0 auto 40px auto;
    padding: 0 20px;
    text-align: center;
}

.page-title {
    font-size: 2.5em;
    font-weight: bold;
    color: #ffd700;
    text-transform: uppercase;
    letter-spacing: 2px;
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
    font-family: "ArialCustom", Arial, sans-serif;
}

.avatar-modifier-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    flex-direction: column;
    gap: 40px;
}

.section-title {
    font-size: 1.5em;
    font-weight: bold;
    color: white;
    margin-bottom: 20px;
    text-align: center;
    font-family: "ArialCustom", Arial, sans-serif;
}

.current-avatar-section {
    background: linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 50%, #2a2a2a 100%);
    border-radius: var(--border-radius);
    padding: 30px;
    border: 2px solid rgba(255, 215, 0, 0.3);
    box-shadow: var(--shadow-main);
}

.current-avatar-display {
    display: flex;
    justify-content: center;
}

.avatar-preview {
    width: 200px;
    height: 200px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%);
    border-radius: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
    transition: var(--transition-smooth);
}

.avatar-preview img {
    width: 100px;
    height: 100px;
    filter: brightness(0) invert(1);
}

.icon-selection-section {
    background: linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 50%, #2a2a2a 100%);
    border-radius: var(--border-radius);
    padding: 30px;
    border: 2px solid rgba(255, 215, 0, 0.3);
    box-shadow: var(--shadow-main);
}

.icon-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 20px;
    justify-items: center;
}

.icon-option {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%);
    border-radius: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: var(--transition-smooth);
    border: 3px solid transparent;
    position: relative;
    overflow: hidden;
}

.icon-option::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
}

.icon-option:hover::before {
    left: 100%;
}

.icon-option:hover {
    transform: scale(1.05);
    border-color: rgba(255, 215, 0, 0.5);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.icon-option.selected {
    border-color: #ffd700;
    box-shadow: 0 0 25px rgba(255, 215, 0, 0.6);
    transform: scale(1.1);
}

.icon-option img {
    width: 40px;
    height: 40px;
    filter: brightness(0) invert(1);
    transition: var(--transition-smooth);
}

.action-buttons {
    display: flex;
    justify-content: center;
    gap: 20px;
    padding: 20px 0;
}

.save-btn, .cancel-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 15px 30px;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    transition: var(--transition-smooth);
}

.save-btn {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    color: white;
}

.save-btn:hover {
    background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

.cancel-btn {
    background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
    color: white;
}

.cancel-btn:hover {
    background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
}

.save-btn img, .cancel-btn img {
    width: 24px;
    height: 24px;
    filter: brightness(0) invert(1);
}

/* Responsive */
@media (max-width: 768px) {
    .page-title {
        font-size: 2em;
    }
    
    .avatar-preview {
        width: 150px;
        height: 150px;
    }
    
    .avatar-preview img {
        width: 75px;
        height: 75px;
    }
    
    .icon-grid {
        grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
        gap: 15px;
    }
    
    .icon-option {
        width: 70px;
        height: 70px;
    }
    
    .icon-option img {
        width: 35px;
        height: 35px;
    }
    
    .action-buttons {
        flex-direction: column;
        align-items: center;
    }
    
    .save-btn, .cancel-btn {
        width: 100%;
        max-width: 300px;
        justify-content: center;
    }
}

@media (max-width: 480px) {
    .page-title {
        font-size: 1.5em;
    }
    
    .current-avatar-section, .icon-selection-section {
        padding: 20px;
    }
    
    .avatar-preview {
        width: 120px;
        height: 120px;
    }
    
    .avatar-preview img {
        width: 60px;
        height: 60px;
    }
    
    .icon-option {
        width: 60px;
        height: 60px;
    }
    
    .icon-option img {
        width: 30px;
        height: 30px;
    }
}
`;

// Ajouter les styles à la page
const styleSheet = document.createElement('style');
styleSheet.textContent = avatarModifierStyles;
document.head.appendChild(styleSheet);
