// Avatar 3D Manager avec Three.js
class Avatar3DManager {
    constructor(canvasId = 'avatar3d-canvas') {
        this.canvasId = canvasId;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.currentModel = null;
        this.mixer = null;
        this.clock = new THREE.Clock();
        this.animations = {};
        this.currentAnimation = null;
        this.modelsConfig = null;

        // Configuration par défaut étendue
        this.config = {
            faceType: 'male',
            skinColor: '#FFDBAC',
            hairStyle: 'short',
            hairColor: 'brown',
            eyeColor: 'brown',
            expression: 'neutral',
            // Morphologie faciale
            noseSize: 50,
            eyeSize: 50,
            mouthSize: 50,
            jawWidth: 50,
            cheekSize: 50,
            foreheadHeight: 50,
            earSize: 50,
            chinSize: 50,
            // Nouvelles options pour les tenues
            outfitStyle: 'casual',
            topColor: '#4A90E2',
            bottomColor: '#2C3E50',
            shoesColor: '#8B4513',
            // Accessoires
            hat: 'none',
            glasses: 'none',
            jewelry: 'none',
            // Pose
            pose: 'idle'
        };

        this.loadModelsConfig().then(() => {
            this.init();
        });
    }

    async loadModelsConfig() {
        try {
            const response = await fetch('models-config.json');
            this.modelsConfig = await response.json();
            console.log('Configuration des avatars chargée:', this.modelsConfig);
        } catch (error) {
            console.error('Erreur lors du chargement de la configuration:', error);
            // Configuration par défaut en cas d'erreur
            this.modelsConfig = {
                avatarCustomization: {
                    baseModels: {
                        male: {
                            url: "https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb",
                            scale: [1, 1, 1],
                            position: [0, -1.8, 0]
                        },
                        female: {
                            url: "https://threejs.org/examples/models/gltf/Soldier.glb",
                            scale: [1, 1, 1],
                            position: [0, -1.8, 0]
                        }
                    }
                }
            };
        }
    }

    // Charger un modèle GLTF complet
    async loadFullAvatarModel(faceType) {
        const loader = new THREE.GLTFLoader();

        this.showLoading();

        try {
            const modelConfig = this.modelsConfig.avatarCustomization.baseModels[faceType];
            console.log('Chargement du modèle:', modelConfig.url);

            const gltf = await new Promise((resolve, reject) => {
                loader.load(
                    modelConfig.url,
                    resolve,
                    (progress) => {
                        console.log('Progression:', (progress.loaded / progress.total * 100) + '%');
                    },
                    reject
                );
            });

            // Supprimer l'ancien modèle
            if (this.currentModel) {
                this.scene.remove(this.currentModel);
            }

            // Configurer le nouveau modèle
            this.currentModel = gltf.scene;
            this.currentModel.scale.set(...modelConfig.scale);
            this.currentModel.position.set(...modelConfig.position);

            // Appliquer les ombres
            this.currentModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            // Configurer les animations si disponibles
            if (gltf.animations && gltf.animations.length > 0) {
                this.mixer = new THREE.AnimationMixer(this.currentModel);
                gltf.animations.forEach((clip) => {
                    this.animations[clip.name] = this.mixer.clipAction(clip);
                });

                // Jouer l'animation par défaut
                this.playAnimation(this.config.pose);
            }

            this.scene.add(this.currentModel);
            this.hideLoading();

            // Appliquer la personnalisation actuelle
            this.updateAvatarAppearance();

            console.log('Modèle GLTF chargé avec succès');

        } catch (error) {
            console.error('Erreur lors du chargement du modèle GLTF:', error);

            // Fallback vers le modèle de base si disponible
            if (modelConfig.fallback) {
                try {
                    console.log('Tentative de fallback vers:', modelConfig.fallback);
                    const fallbackGltf = await new Promise((resolve, reject) => {
                        loader.load(modelConfig.fallback, resolve, undefined, reject);
                    });

                    this.currentModel = fallbackGltf.scene;
                    this.currentModel.scale.set(...modelConfig.scale);
                    this.currentModel.position.set(...modelConfig.position);
                    this.scene.add(this.currentModel);

                } catch (fallbackError) {
                    console.error('Erreur du fallback, création du modèle par défaut:', fallbackError);
                    this.createDefaultModel();
                }
            } else {
                this.createDefaultModel();
            }

            this.hideLoading();
        }
    }

    init() {
        console.log('Initialisation de l\'éditeur d\'avatar 3D...');
        this.setupScene();
        this.setupLighting();
        this.setupControls();
        this.setupEventListeners();

        // Toujours créer le modèle par défaut pour commencer
        console.log('Création du modèle par défaut...');
        this.createDefaultModel();

        this.animate();
        console.log('Avatar 3D initialisé avec succès');

        // Essayer de charger le modèle en ligne plus tard si disponible
        setTimeout(() => {
            if (this.modelsConfig && this.modelsConfig.faceCustomization && this.modelsConfig.faceCustomization.baseModels[this.config.faceType]) {
                console.log('Tentative de chargement du modèle en ligne...');
                this.updateFaceModel();
            }
        }, 1000);
    }

    setupScene() {
        const canvas = document.getElementById(this.canvasId);
        const container = canvas.parentElement;

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a1f3d);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 1, 3);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1;

        // Responsive
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLighting() {
        // Lumière ambiante
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Lumière directionnelle principale
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        this.scene.add(directionalLight);

        // Lumière de remplissage
        const fillLight = new THREE.DirectionalLight(0x404040, 0.5);
        fillLight.position.set(-5, 0, -5);
        this.scene.add(fillLight);

        // Lumière rim
        const rimLight = new THREE.DirectionalLight(0xffd700, 0.3);
        rimLight.position.set(0, 5, -5);
        this.scene.add(rimLight);
    }

    setupControls() {
        // Vérifier si OrbitControls est disponible
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        } else {
            console.warn('OrbitControls non disponible, utilisation des contrôles basiques');
            // Contrôles basiques sans OrbitControls
            this.setupBasicControls();
            return;
        }

        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 10;
        this.controls.maxPolarAngle = Math.PI / 1.5;
        this.controls.target.set(0, 1, 0);
    }

    setupBasicControls() {
        // Contrôles de base avec la souris
        let isMouseDown = false;
        let previousMousePosition = { x: 0, y: 0 };

        this.renderer.domElement.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        this.renderer.domElement.addEventListener('mouseup', () => {
            isMouseDown = false;
        });

        this.renderer.domElement.addEventListener('mousemove', (e) => {
            if (!isMouseDown) return;

            const deltaMove = {
                x: e.clientX - previousMousePosition.x,
                y: e.clientY - previousMousePosition.y
            };

            // Rotation autour du modèle
            const rotationSpeed = 0.005;
            this.camera.position.x = Math.cos(deltaMove.x * rotationSpeed) * 5;
            this.camera.position.z = Math.sin(deltaMove.x * rotationSpeed) * 5;
            this.camera.lookAt(0, 1, 0);

            previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        // Zoom avec la molette
        this.renderer.domElement.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomSpeed = 0.1;
            const distance = this.camera.position.length();
            const newDistance = Math.max(1, Math.min(10, distance + e.deltaY * zoomSpeed * 0.01));

            this.camera.position.normalize().multiplyScalar(newDistance);
        });
    }

    createDefaultModel() {
        // Supprimer l'ancien modèle s'il existe
        if (this.currentModel) {
            this.scene.remove(this.currentModel);
        }

        // Créer un groupe pour contenir tous les éléments de l'avatar
        this.currentModel = new THREE.Group();

        const skinColor = this.getSkinColor();
        const clothingColor = this.getClothingColor();

        // === TÊTE ===
        const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        headGeometry.scale(1, 1.2, 0.9); // Forme plus réaliste
        const headMaterial = new THREE.MeshPhongMaterial({ color: skinColor, shininess: 15 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 1.8, 0);
        head.castShadow = true;
        head.name = 'head';
        this.currentModel.add(head);

        // === COU ===
        const neckGeometry = new THREE.CylinderGeometry(0.15, 0.18, 0.3, 12);
        const neckMaterial = new THREE.MeshPhongMaterial({ color: skinColor });
        const neck = new THREE.Mesh(neckGeometry, neckMaterial);
        neck.position.set(0, 1.45, 0);
        neck.castShadow = true;
        this.currentModel.add(neck);

        // === TORSE ===
        const torsoGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.4);
        const torsoMaterial = new THREE.MeshPhongMaterial({ color: clothingColor });
        const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
        torso.position.set(0, 0.7, 0);
        torso.castShadow = true;
        torso.name = 'torso';
        this.currentModel.add(torso);

        // === BRAS GAUCHE ===
        // Épaule
        const shoulderGeometry = new THREE.SphereGeometry(0.15, 12, 12);
        const shoulderMaterial = new THREE.MeshPhongMaterial({ color: skinColor });
        const leftShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
        leftShoulder.position.set(-0.5, 1.2, 0);
        leftShoulder.castShadow = true;
        this.currentModel.add(leftShoulder);

        // Bras
        const armGeometry = new THREE.CylinderGeometry(0.08, 0.1, 0.6, 8);
        const armMaterial = new THREE.MeshPhongMaterial({ color: skinColor });
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.6, 0.8, 0);
        leftArm.castShadow = true;
        this.currentModel.add(leftArm);

        // Main
        const handGeometry = new THREE.SphereGeometry(0.08, 10, 10);
        const handMaterial = new THREE.MeshPhongMaterial({ color: skinColor });
        const leftHand = new THREE.Mesh(handGeometry, handMaterial);
        leftHand.position.set(-0.6, 0.4, 0);
        leftHand.castShadow = true;
        this.currentModel.add(leftHand);

        // === BRAS DROIT ===
        const rightShoulder = leftShoulder.clone();
        rightShoulder.position.set(0.5, 1.2, 0);
        this.currentModel.add(rightShoulder);

        const rightArm = leftArm.clone();
        rightArm.position.set(0.6, 0.8, 0);
        this.currentModel.add(rightArm);

        const rightHand = leftHand.clone();
        rightHand.position.set(0.6, 0.4, 0);
        this.currentModel.add(rightHand);

        // === JAMBES ===
        // Hanche
        const hipGeometry = new THREE.BoxGeometry(0.7, 0.3, 0.35);
        const hipMaterial = new THREE.MeshPhongMaterial({ color: clothingColor.clone().multiplyScalar(0.8) });
        const hip = new THREE.Mesh(hipGeometry, hipMaterial);
        hip.position.set(0, -0.05, 0);
        hip.castShadow = true;
        this.currentModel.add(hip);

        // Jambe gauche
        const legGeometry = new THREE.CylinderGeometry(0.1, 0.12, 0.8, 8);
        const legMaterial = new THREE.MeshPhongMaterial({ color: clothingColor.clone().multiplyScalar(0.9) });
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.2, -0.6, 0);
        leftLeg.castShadow = true;
        this.currentModel.add(leftLeg);

        // Jambe droite
        const rightLeg = leftLeg.clone();
        rightLeg.position.set(0.2, -0.6, 0);
        this.currentModel.add(rightLeg);

        // Pieds
        const footGeometry = new THREE.BoxGeometry(0.15, 0.08, 0.3);
        const footMaterial = new THREE.MeshPhongMaterial({ color: 0x2a2a2a });
        const leftFoot = new THREE.Mesh(footGeometry, footMaterial);
        leftFoot.position.set(-0.2, -1.05, 0.1);
        leftFoot.castShadow = true;
        this.currentModel.add(leftFoot);

        const rightFoot = leftFoot.clone();
        rightFoot.position.set(0.2, -1.05, 0.1);
        this.currentModel.add(rightFoot);

        // === DÉTAILS DU VISAGE ===
        this.createSimpleFaceFeatures();

        // Cheveux (optionnel)
        if (this.config.hairStyle !== 'bald') {
            this.createSimpleHair();
        }

        // Positionner le modèle complet
        this.currentModel.position.set(0, 1, 0);
        this.currentModel.scale.set(1, 1, 1);

        this.scene.add(this.currentModel);
        this.hideLoading();

        console.log('Avatar 3D complet créé avec succès');
    }

    // Créer des traits de visage simplifiés
    createSimpleFaceFeatures() {
        const head = this.currentModel.getObjectByName('head');
        if (!head) return;

        // Yeux
        const eyeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });

        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.12, 1.85, 0.35);
        this.currentModel.add(leftEye);

        const rightEye = leftEye.clone();
        rightEye.position.set(0.12, 1.85, 0.35);
        this.currentModel.add(rightEye);

        // Nez
        const noseGeometry = new THREE.ConeGeometry(0.03, 0.1, 6);
        const noseMaterial = new THREE.MeshPhongMaterial({ color: this.getSkinColor() });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, 1.75, 0.38);
        nose.rotation.x = Math.PI;
        this.currentModel.add(nose);

        // Bouche
        const mouthGeometry = new THREE.SphereGeometry(0.04, 8, 8);
        const mouthMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0, 1.65, 0.35);
        mouth.scale.set(1.5, 0.5, 0.8);
        this.currentModel.add(mouth);
    }

    // Créer des cheveux simplifiés
    createSimpleHair() {
        const hairGeometry = new THREE.SphereGeometry(0.42, 12, 12, 0, Math.PI * 2, 0, Math.PI / 1.5);
        const hairColor = this.getHairColor();
        const hairMaterial = new THREE.MeshPhongMaterial({ color: hairColor });
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.set(0, 2, 0);
        hair.castShadow = true;
        hair.name = 'hair';
        this.currentModel.add(hair);
    }

    // Obtenir la couleur des vêtements
    getClothingColor() {
        const clothingColors = {
            'casual': 0x4a90e2,
            'formal': 0x2c3e50,
            'sport': 0xe74c3c,
            'fantasy': 0x9b59b6
        };
        return new THREE.Color(clothingColors[this.config.outfit] || clothingColors.casual);
    }

    // Obtenir la couleur des cheveux selon le style
    getHairColor() {
        const hairColors = {
            'brown': 0x8B4513,
            'black': 0x2F2F2F,
            'blonde': 0xFFD700,
            'red': 0xB22222,
            'gray': 0x808080,
            'white': 0xF5F5F5
        };
        return hairColors[this.config.hairStyle] || hairColors.brown;
    }

    // Obtenir la couleur de peau
    getSkinColor() {
        return new THREE.Color(this.config.skinColor || '#FFDBAC');
    }

    // Obtenir la couleur des yeux
    getEyeColor() {
        const eyeColors = {
            'brown': 0x8B4513,
            'blue': 0x4169E1,
            'green': 0x228B22,
            'hazel': 0xCD853F,
            'gray': 0x696969
        };
        return eyeColors[this.config.eyeColor] || eyeColors.brown;
        leftEyebrow.position.set(-0.25, 0.35, 0.85);
        leftEyebrow.rotation.z = Math.PI / 2;
        leftEyebrow.rotation.y = -0.2;
        leftEyebrow.name = 'leftEyebrow';

        // Sourcil droit
        const rightEyebrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
        rightEyebrow.position.set(0.25, 0.35, 0.85);
        rightEyebrow.rotation.z = Math.PI / 2;
        rightEyebrow.rotation.y = 0.2;
        rightEyebrow.name = 'rightEyebrow';

        this.currentModel.add(leftEyebrow, rightEyebrow);
    }

    // Créer des yeux pour le modèle par défaut
    createEyes() {
        const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 6);
        const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        const pupilGeometry = new THREE.SphereGeometry(0.04, 6, 4);
        const pupilMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });

        // Œil gauche
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.25, 0.2, 0.45);
        const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        leftPupil.position.set(-0.25, 0.2, 0.5);

        // Œil droit
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.25, 0.2, 0.45);
        const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        rightPupil.position.set(0.25, 0.2, 0.5);

        this.currentModel.add(leftEye, leftPupil, rightEye, rightPupil);
    }

    // Créer un nez pour le modèle par défaut
    createNose() {
        const noseGeometry = new THREE.ConeGeometry(0.05, 0.15, 6);
        const skinColor = this.getSkinColor();
        const noseMaterial = new THREE.MeshPhongMaterial({ color: skinColor });

        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, 0, 0.5);
        nose.rotation.x = Math.PI / 2;
        nose.name = 'nose';

        this.currentModel.add(nose);
    }

    // Créer une bouche pour le modèle par défaut
    createMouth() {
        const mouthGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.02, 8);
        const mouthMaterial = new THREE.MeshPhongMaterial({ color: 0x8B0000 });

        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0, -0.3, 0.45);
        mouth.rotation.x = Math.PI / 2;
        mouth.name = 'mouth';

        this.currentModel.add(mouth);
    }

    // Créer des cheveux pour le modèle par défaut
    createHair() {
        const hairGeometry = new THREE.SphereGeometry(0.7, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const hairColor = this.getHairColor();
        const hairMaterial = new THREE.MeshPhongMaterial({ color: hairColor });

        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.set(0, 0.5, 0);
        hair.name = 'hair';

        this.currentModel.add(hair);
    }

    // Obtenir la couleur des cheveux selon le style
    getHairColor() {
        const hairColors = {
            'brown': 0x8B4513,
            'black': 0x2F2F2F,
            'blonde': 0xFFD700,
            'red': 0xB22222,
            'gray': 0x808080
        };
        return hairColors[this.config.hairStyle] || hairColors.brown;
    }

    // Obtenir la couleur de peau
    getSkinColor() {
        return new THREE.Color(this.config.skinColor || '#FFDBAC');
    }

    addModelDetails() {
        if (!this.currentModel) return;

        // Tête
        const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const headMaterial = new THREE.MeshPhongMaterial({
            color: new THREE.Color(this.config.bodyColor)
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.2;
        head.castShadow = true;
        this.currentModel.add(head);

        // Yeux
        const eyeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });

        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.1, 1.25, 0.25);
        this.currentModel.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.1, 1.25, 0.25);
        this.currentModel.add(rightEye);

        // Pupilles
        const pupilGeometry = new THREE.SphereGeometry(0.02, 8, 8);
        const pupilMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });

        const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        leftPupil.position.set(-0.1, 1.25, 0.27);
        this.currentModel.add(leftPupil);

        const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        rightPupil.position.set(0.1, 1.25, 0.27);
        this.currentModel.add(rightPupil);

        // Accents
        const accentGeometry = new THREE.TorusGeometry(0.6, 0.1, 8, 16);
        const accentMaterial = new THREE.MeshPhongMaterial({
            color: new THREE.Color(this.config.accentColor),
            transparent: true,
            opacity: 0.8
        });
        const accent = new THREE.Mesh(accentGeometry, accentMaterial);
        accent.position.y = 0.5;
        accent.rotation.x = Math.PI / 2;
        this.currentModel.add(accent);
    }

    startIdleAnimation() {
        // Animation d'inactivité simple
        this.currentAnimation = 'idle';
        this.animateIdle();
    }

    animateIdle() {
        if (this.currentModel && this.currentAnimation === 'idle') {
            const time = this.clock.getElapsedTime();
            this.currentModel.rotation.y = Math.sin(time * 0.5) * 0.1;
            this.currentModel.position.y = 0.75 + Math.sin(time * 2) * 0.05;
        }
    }

    animateWave() {
        if (this.currentModel) {
            const time = this.clock.getElapsedTime();
            this.currentModel.rotation.z = Math.sin(time * 4) * 0.3;
        }
    }

    animateSpin() {
        if (this.currentModel) {
            const time = this.clock.getElapsedTime();
            this.currentModel.rotation.y = time * 2;
        }
    }

    setupEventListeners() {
        // Contrôles du type de visage
        document.querySelectorAll('.face-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setActiveButton(e.target, 'face-btn');
                this.changeFaceType(e.target.dataset.face);
            });
        });

        // Contrôles de couleur de peau
        document.querySelectorAll('[data-skin]').forEach(option => {
            option.addEventListener('click', (e) => {
                this.setActiveColorOption(e.target, 'skin-color-palette');
                this.changeSkinColor(e.target.dataset.skin);
            });
        });

        // Contrôles de coiffure (liste déroulante)
        const hairSelect = document.querySelector('.hair-select');
        if (hairSelect) {
            hairSelect.addEventListener('change', (e) => {
                this.changeHairStyle(e.target.value);
            });
        }

        // Contrôles de couleur de cheveux
        document.querySelectorAll('[data-hair-color]').forEach(option => {
            option.addEventListener('click', (e) => {
                this.setActiveColorOption(e.target, 'hair-color-palette');
                this.changeHairColor(e.target.dataset.hairColor);
            });
        });

        // Contrôles de couleur des yeux
        document.querySelectorAll('[data-eye-color]').forEach(option => {
            option.addEventListener('click', (e) => {
                this.setActiveColorOption(e.target, 'eye-color-palette');
                this.changeEyeColor(e.target.dataset.eyeColor);
            });
        });

        // Contrôles d'expression
        document.querySelectorAll('.expr-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setActiveButton(e.target, 'expr-btn');
                this.changeExpression(e.target.dataset.expression);
            });
        });

        // Contrôles de morphologie
        document.querySelectorAll('.morph-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const morphType = e.target.dataset.morph;
                const value = parseInt(e.target.value);
                this.changeMorphology(morphType, value);

                // Mettre à jour l'affichage de la valeur
                const valueDisplay = e.target.parentElement.querySelector('.slider-value');
                if (valueDisplay) {
                    valueDisplay.textContent = value + '%';
                }
            });
        });

        // Contrôles de tenues
        const outfitSelect = document.querySelector('.outfit-select');
        if (outfitSelect) {
            outfitSelect.addEventListener('change', (e) => {
                this.changeOutfitStyle(e.target.value);
            });
        }

        // Contrôles des couleurs de vêtements
        const topColorInput = document.getElementById('top-color');
        const bottomColorInput = document.getElementById('bottom-color');
        const shoesColorInput = document.getElementById('shoes-color');

        if (topColorInput) {
            topColorInput.addEventListener('change', (e) => {
                this.changeClothingColor('top', e.target.value);
            });
        }

        if (bottomColorInput) {
            bottomColorInput.addEventListener('change', (e) => {
                this.changeClothingColor('bottom', e.target.value);
            });
        }

        if (shoesColorInput) {
            shoesColorInput.addEventListener('change', (e) => {
                this.changeClothingColor('shoes', e.target.value);
            });
        }

        // Contrôles des accessoires
        document.querySelectorAll('.accessory-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const accessoryType = e.target.dataset.accessory;
                const value = e.target.value;
                this.changeAccessory(accessoryType, value);
            });
        });

        // Contrôles des poses
        document.querySelectorAll('.pose-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setActiveButton(e.target, 'pose-btn');
                this.changePose(e.target.dataset.pose);
            });
        });
    }

    updateModel() {
        console.log('Changement de modèle:', this.config.model);

        if (!this.modelsConfig || !this.modelsConfig.models[this.config.model]) {
            console.error('Modèle non trouvé:', this.config.model);
            return;
        }

        const modelInfo = this.modelsConfig.models[this.config.model];

        // Afficher le loading
        this.showLoading();

        if (modelInfo.type === 'procedural' || this.config.model === 'default') {
            // Recréer le modèle par défaut
            if (this.currentModel) {
                this.scene.remove(this.currentModel);
            }
            this.createDefaultModel();
        } else if (modelInfo.type === 'gltf' && modelInfo.path) {
            // Charger le modèle GLTF
            this.loadGLTFModel(modelInfo.path);
        }
    }

    updateColors() {
        if (this.currentModel) {
            // Mettre à jour la couleur du corps principal
            this.currentModel.material.color = new THREE.Color(this.config.bodyColor);

            // Mettre à jour les accents
            this.currentModel.children.forEach(child => {
                if (child.material && child.geometry instanceof THREE.TorusGeometry) {
                    child.material.color = new THREE.Color(this.config.accentColor);
                }
                if (child.material && child.geometry instanceof THREE.SphereGeometry && child.position.y > 1) {
                    child.material.color = new THREE.Color(this.config.bodyColor);
                }
            });
        }
    }

    playAnimation(animationType) {
        this.currentAnimation = animationType;
        console.log('Animation:', animationType);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const deltaTime = this.clock.getDelta();

        // Animations basées sur le type actuel
        switch (this.currentAnimation) {
            case 'idle':
                this.animateIdle();
                break;
            case 'wave':
                this.animateWave();
                break;
            case 'spin':
                this.animateSpin();
                break;
        }

        if (this.mixer) {
            this.mixer.update(deltaTime);
        }

        if (this.controls) {
            this.controls.update();
        }

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        const container = this.renderer.domElement.parentElement;
        const width = container.clientWidth;
        const height = container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    saveConfiguration() {
        localStorage.setItem('avatar3d-config', JSON.stringify(this.config));
        console.log('Configuration sauvegardée:', this.config);

        // Sauvegarder aussi pour l'avatar du header (capture d'écran)
        this.captureAvatar();
    }

    captureAvatar() {
        // Capturer l'avatar comme image pour l'utiliser dans le header
        const canvas = this.renderer.domElement;
        const dataURL = canvas.toDataURL('image/png');
        localStorage.setItem('selectedAvatar', dataURL);
    }

    resetToDefault() {
        this.config = {
            model: 'default',
            bodyColor: '#667eea',
            accentColor: '#764ba2',
            animation: 'idle'
        };

        // Réinitialiser l'interface
        document.getElementById('body-color').value = this.config.bodyColor;
        document.getElementById('accent-color').value = this.config.accentColor;
        document.querySelectorAll('.model-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.model === 'default');
        });

        this.updateColors();
        this.currentAnimation = 'idle';
    }

    loadGLTFModel(url) {
        // Vérifier si GLTFLoader est disponible
        if (typeof THREE.GLTFLoader === 'undefined') {
            console.warn('GLTFLoader non disponible, utilisation du modèle par défaut');
            this.createDefaultModel();
            return;
        }

        const loader = new THREE.GLTFLoader();

        loader.load(
            url,
            (gltf) => {
                // Supprimer l'ancien modèle
                if (this.currentModel) {
                    this.scene.remove(this.currentModel);
                }

                this.currentModel = gltf.scene;
                this.currentModel.scale.set(1, 1, 1);
                this.currentModel.position.set(0, 0, 0);

                // Activer les ombres
                this.currentModel.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                this.scene.add(this.currentModel);

                // Setup animations si disponibles
                if (gltf.animations && gltf.animations.length > 0) {
                    this.mixer = new THREE.AnimationMixer(this.currentModel);
                    gltf.animations.forEach((clip) => {
                        this.animations[clip.name] = this.mixer.clipAction(clip);
                    });
                }

                this.hideLoading();
            },
            (progress) => {
                console.log('Chargement:', (progress.loaded / progress.total * 100) + '%');
            },
            (error) => {
                console.error('Erreur de chargement:', error);
                this.hideLoading();
            }
        );
    }

    loadFaceModel(url) {
        // Vérifier si GLTFLoader est disponible
        if (typeof THREE.GLTFLoader === 'undefined') {
            console.warn('GLTFLoader non disponible, utilisation du modèle par défaut');
            this.createDefaultModel();
            return;
        }

        const loader = new THREE.GLTFLoader();

        // Ajouter un gestionnaire de CORS pour les modèles externes
        loader.setCrossOrigin('anonymous');

        console.log('Chargement du modèle de visage depuis:', url);

        loader.load(
            url,
            (gltf) => {
                // Supprimer l'ancien modèle
                if (this.currentModel) {
                    this.scene.remove(this.currentModel);
                    if (this.mixer) {
                        this.mixer.stopAllAction();
                        this.mixer = null;
                    }
                }

                this.currentModel = gltf.scene;

                // Ajuster la taille et position du modèle
                const box = new THREE.Box3().setFromObject(this.currentModel);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());

                // Centrer le modèle
                this.currentModel.position.sub(center);

                // Ajuster l'échelle pour que le modèle soit visible
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 2 / maxDim; // Échelle pour que le modèle fasse environ 2 unités
                this.currentModel.scale.setScalar(scale);

                // Positionner le modèle à l'origine
                this.currentModel.position.y = -size.y * scale / 2;

                // Activer les ombres et configurer les matériaux
                this.currentModel.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;

                        // Appliquer la couleur de peau si c'est un matériau de peau
                        if (child.material && (child.material.name?.includes('skin') || child.material.name?.includes('face'))) {
                            this.updateSkinColor();
                        }
                    }
                });

                this.scene.add(this.currentModel);

                // Configuration des animations si disponibles
                if (gltf.animations && gltf.animations.length > 0) {
                    this.mixer = new THREE.AnimationMixer(this.currentModel);
                    this.animations = {};

                    gltf.animations.forEach((clip) => {
                        const action = this.mixer.clipAction(clip);
                        this.animations[clip.name] = action;

                        // Jouer l'animation idle par défaut si elle existe
                        if (clip.name.toLowerCase().includes('idle') || clip.name.toLowerCase().includes('breathing')) {
                            action.play();
                        }
                    });
                }

                console.log('Modèle de visage chargé avec succès');
                this.hideLoading();
            },
            (progress) => {
                const percent = progress.total > 0 ? (progress.loaded / progress.total * 100) : 0;
                console.log('Progression du chargement:', Math.round(percent) + '%');
            },
            (error) => {
                console.error('Erreur lors du chargement du modèle de visage:', error);
                this.hideLoading();

                // Fallback vers le modèle par défaut en cas d'erreur
                this.createDefaultModel();
            }
        );
    }

    showLoading() {
        document.getElementById('loading-overlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loading-overlay').style.display = 'none';
    }
    // Méthodes de gestion des contrôles de visage
    setActiveButton(activeBtn, className) {
        document.querySelectorAll(`.${className}`).forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    setActiveColorOption(activeOption, parentClass) {
        const parent = activeOption.closest(`.${parentClass}`);
        if (parent) {
            parent.querySelectorAll('.color-option').forEach(option => {
                option.classList.remove('active');
            });
            activeOption.classList.add('active');
        }
    }

    changeFaceType(faceType) {
        console.log('Changement de type de visage:', faceType);
        this.config.faceType = faceType;
        this.updateFaceModel();
    }

    changeSkinColor(skinColor) {
        console.log('Changement de couleur de peau:', skinColor);
        this.config.skinColor = skinColor;
        this.updateSkinColor();
    }

    changeHairStyle(hairStyle) {
        console.log('Changement de coiffure:', hairStyle);
        this.config.hairStyle = hairStyle;
        this.updateHairStyle();
    }

    changeHairColor(hairColor) {
        console.log('Changement de couleur de cheveux:', hairColor);
        this.config.hairColor = hairColor;
        this.updateHairColor();
    }

    changeEyeColor(eyeColor) {
        console.log('Changement de couleur des yeux:', eyeColor);
        this.config.eyeColor = eyeColor;
        this.updateEyeColor();
    }

    changeExpression(expression) {
        console.log('Changement d\'expression:', expression);
        this.config.expression = expression;
        this.updateExpression();
    }

    changeMorphology(morphType, value) {
        console.log(`Changement de morphologie ${morphType}:`, value);
        this.config[morphType] = value;
        this.updateMorphology(morphType, value);
    }

    // Mettre à jour la morphologie du modèle
    updateMorphology(morphType, value) {
        if (!this.currentModel) return;

        const scaleFactor = value / 3; // Normaliser les valeurs (0-5 vers 0-1.67)

        switch (morphType) {
            case 'noseSize':
                const nose = this.currentModel.getObjectByName('nose');
                if (nose) {
                    const baseScale = 1;
                    nose.scale.set(baseScale + scaleFactor * 0.5, baseScale + scaleFactor * 0.5, baseScale + scaleFactor * 0.3);
                }
                break;

            case 'eyeSize':
                // Rechercher tous les objets liés aux yeux
                this.currentModel.traverse((child) => {
                    if (child.name && (child.name.includes('Eye') || child.name.includes('eye') || child.name.includes('Pupil'))) {
                        const eyeScale = 1 + scaleFactor * 0.3;
                        child.scale.set(eyeScale, eyeScale, eyeScale);
                    }
                });
                break;

            case 'mouthSize':
                const mouth = this.currentModel.getObjectByName('mouth');
                const upperLip = this.currentModel.getObjectByName('upperLip');
                const lowerLip = this.currentModel.getObjectByName('lowerLip');

                const mouthScale = 1 + scaleFactor * 0.4;
                if (mouth) mouth.scale.set(mouthScale, mouthScale, mouthScale);
                if (upperLip) upperLip.scale.set(mouthScale, mouthScale, mouthScale);
                if (lowerLip) lowerLip.scale.set(mouthScale, mouthScale, mouthScale);
                break;

            case 'earSize':
                const leftEar = this.currentModel.getObjectByName('leftEar');
                const rightEar = this.currentModel.getObjectByName('rightEar');

                const earScale = 1 + scaleFactor * 0.5;
                if (leftEar) leftEar.scale.set(earScale, earScale, earScale);
                if (rightEar) rightEar.scale.set(earScale, earScale, earScale);
                break;

            case 'faceWidth':
                const head = this.currentModel.getObjectByName('head');
                if (head) {
                    const widthScale = 1 + scaleFactor * 0.3;
                    head.scale.set(widthScale, head.scale.y, head.scale.z);
                }
                break;
        }
    }

    // Changer le style de tenue
    changeOutfitStyle(style) {
        this.config.outfitStyle = style;
        console.log('Changement de style de tenue:', style);

        // Appliquer les couleurs prédéfinies du style
        if (this.modelsConfig && this.modelsConfig.avatarCustomization.outfits) {
            const outfits = this.modelsConfig.avatarCustomization.outfits[this.config.faceType];
            if (outfits && outfits[style]) {
                const outfit = outfits[style];
                this.config.topColor = outfit.shirt || outfit.top || '#4A90E2';
                this.config.bottomColor = outfit.pants || outfit.bottom || '#2C3E50';
                this.config.shoesColor = outfit.shoes || '#8B4513';

                // Mettre à jour les contrôles UI
                const topColorInput = document.getElementById('top-color');
                const bottomColorInput = document.getElementById('bottom-color');
                const shoesColorInput = document.getElementById('shoes-color');

                if (topColorInput) topColorInput.value = this.config.topColor;
                if (bottomColorInput) bottomColorInput.value = this.config.bottomColor;
                if (shoesColorInput) shoesColorInput.value = this.config.shoesColor;
            }
        }

        this.updateClothingColors();
    }

    // Changer la couleur d'un vêtement
    changeClothingColor(type, color) {
        switch (type) {
            case 'top':
                this.config.topColor = color;
                break;
            case 'bottom':
                this.config.bottomColor = color;
                break;
            case 'shoes':
                this.config.shoesColor = color;
                break;
        }

        console.log(`Changement de couleur ${type}:`, color);
        this.updateClothingColors();
    }

    // Mettre à jour les couleurs des vêtements sur le modèle
    updateClothingColors() {
        if (!this.currentModel) return;

        const clothingColor = this.getClothingColor();

        // Mettre à jour les vêtements dans le modèle procédural
        this.currentModel.traverse((child) => {
            if (child.isMesh && child.material && (
                child.name === 'torso' ||
                child.name === 'leftLeg' ||
                child.name === 'rightLeg' ||
                child.name === 'hip' ||
                child.name === 'leftFoot' ||
                child.name === 'rightFoot')) {

                // Cloner le matériau pour éviter d'affecter d'autres objets
                if (!child.material.isCloned) {
                    child.material = child.material.clone();
                    child.material.isCloned = true;
                }

                // Appliquer différentes nuances selon le type de vêtement
                if (child.name === 'torso') {
                    child.material.color.copy(clothingColor);
                } else if (child.name.includes('leg') || child.name === 'hip') {
                    child.material.color.copy(clothingColor.clone().multiplyScalar(0.8));
                } else if (child.name.includes('foot')) {
                    child.material.color.set(0x2a2a2a); // Chaussures noires
                }

                child.material.needsUpdate = true;
            }
        });

        console.log('Couleurs des vêtements mises à jour');
    }

    // Changer un accessoire
    changeAccessory(type, value) {
        this.config[type] = value;
        console.log(`Changement d'accessoire ${type}:`, value);
        this.updateAccessories();
    }

    // Mettre à jour les accessoires sur le modèle
    updateAccessories() {
        if (!this.currentModel) return;

        // TODO: Implémenter l'ajout/suppression d'accessoires
        // Cela nécessiterait des modèles 3D d'accessoires séparés
        console.log('Mise à jour des accessoires:', {
            hat: this.config.hat,
            glasses: this.config.glasses,
            jewelry: this.config.jewelry
        });
    }

    // Changer la pose
    changePose(pose) {
        this.config.pose = pose;
        console.log('Changement de pose:', pose);
        this.playAnimation(pose);
    }

    // Jouer une animation/pose
    playAnimation(animationName) {
        if (!this.mixer || !this.animations[animationName]) {
            console.log('Animation non disponible:', animationName);
            return;
        }

        // Arrêter toutes les animations en cours
        Object.values(this.animations).forEach(action => {
            action.stop();
        });

        // Jouer la nouvelle animation
        const action = this.animations[animationName];
        action.reset().play();

        console.log('Animation en cours:', animationName);
    }

    // Méthodes de mise à jour du modèle 3D
    updateFaceModel() {
        if (!this.modelsConfig || !this.modelsConfig.avatarCustomization) {
            console.error('Configuration des avatars non disponible');
            return;
        }

        const faceType = this.config.faceType;
        console.log('Mise à jour du modèle pour le type:', faceType);

        // Charger le modèle complet
        this.loadFullAvatarModel(faceType);
    }

    // Mettre à jour l'apparence complète de l'avatar
    updateAvatarAppearance() {
        if (!this.currentModel) return;

        console.log('Mise à jour de l\'apparence de l\'avatar');

        // Appliquer toutes les personnalisations
        this.updateSkinColor();
        this.updateHairColor();
        this.updateEyeColor();
        this.updateClothingColors();
        this.updateAccessories();

        // Appliquer la morphologie si c'est un modèle procédural
        if (this.currentModel.userData && this.currentModel.userData.isProcedural) {
            Object.keys(this.config).forEach(key => {
                if (key.includes('Size') || key.includes('Width') || key.includes('Height')) {
                    this.updateMorphology(key, this.config[key]);
                }
            });
        }
    }

    updateSkinColor() {
        if (!this.currentModel) return;

        const newSkinColor = new THREE.Color(this.config.skinColor);

        // Mettre à jour tous les éléments de peau dans le modèle procédural
        this.currentModel.traverse((child) => {
            if (child.isMesh && child.material && (
                child.name === 'head' ||
                child.name === 'neck' ||
                child.name === 'leftShoulder' ||
                child.name === 'rightShoulder' ||
                child.name === 'leftArm' ||
                child.name === 'rightArm' ||
                child.name === 'leftHand' ||
                child.name === 'rightHand')) {

                // Cloner le matériau pour éviter d'affecter d'autres objets
                if (!child.material.isCloned) {
                    child.material = child.material.clone();
                    child.material.isCloned = true;
                }

                child.material.color.copy(newSkinColor);
                child.material.needsUpdate = true;
            }
        });

        console.log('Couleur de peau mise à jour:', this.config.skinColor);
    }

    updateHairStyle() {
        if (!this.currentModel) return;

        // Supprimer les cheveux existants
        const existingHair = this.currentModel.getObjectByName('hair');
        if (existingHair) {
            this.currentModel.remove(existingHair);
        }

        // Créer de nouveaux cheveux si nécessaire
        if (this.config.hairStyle !== 'bald') {
            this.createSimpleHair();
        }

        console.log('Style de cheveux mis à jour:', this.config.hairStyle);
    }

    updateHairColor() {
        if (!this.currentModel) return;

        const newHairColor = this.getHairColor();
        const hair = this.currentModel.getObjectByName('hair');

        if (hair && hair.material) {
            hair.material.color.setHex(newHairColor);
            hair.material.needsUpdate = true;
        }

        console.log('Couleur de cheveux mise à jour:', this.config.hairColor);
    }

    updateEyeColor() {
        if (this.currentModel) {
            const colors = {
                brown: '#8b4513',
                blue: '#4169e1',
                green: '#228b22',
                hazel: '#cd853f',
                gray: '#708090',
                violet: '#8a2be2',
                red: '#dc143c'
            };

            const color = colors[this.config.eyeColor] || colors.brown;
            this.currentModel.traverse(child => {
                if (child.isMesh && child.name.includes('eye') || child.material?.name === 'eyes') {
                    child.material.color = new THREE.Color(color);
                }
            });
        }
    }

    updateExpression() {
        // À implémenter : utiliser des morph targets pour les expressions
        console.log('Mise à jour de l\'expression faciale');
    }

    updateMorphology(morphType, value) {
        if (this.currentModel) {
            const normalizedValue = value / 100; // Convertir en valeur 0-1

            // Appliquer les modifications selon le type de morphologie
            switch (morphType) {
                case 'noseSize':
                    this.applyNoseMorph(normalizedValue);
                    break;
                case 'eyeSize':
                    this.applyEyeMorph(normalizedValue);
                    break;
                case 'mouthSize':
                    this.applyMouthMorph(normalizedValue);
                    break;
                case 'jawWidth':
                    this.applyJawMorph(normalizedValue);
                    break;
                case 'cheekSize':
                    this.applyCheekMorph(normalizedValue);
                    break;
                case 'foreheadHeight':
                    this.applyForeheadMorph(normalizedValue);
                    break;
                case 'earSize':
                    this.applyEarMorph(normalizedValue);
                    break;
                case 'chinSize':
                    this.applyChinMorph(normalizedValue);
                    break;
            }
        }
    }

    // Méthodes spécialisées pour chaque type de morphologie
    applyNoseMorph(value) {
        const nose = this.currentModel.getObjectByName('nose');
        if (nose) {
            const scale = 0.5 + value * 1.5; // 0.5 à 2.0
            nose.scale.set(scale, scale, scale);
            console.log('Morphologie nez appliquée:', scale);
        }
    }

    applyEyeMorph(value) {
        this.currentModel.children.forEach(child => {
            if (child.material && child.material.color) {
                const color = child.material.color.getHex();
                if (color === 0xffffff || color === 0x000000) {
                    // C'est probablement un œil ou une pupille
                    const scale = 0.6 + value * 0.8; // 0.6 à 1.4
                    child.scale.set(scale, scale, scale);
                }
            }
        });
        console.log('Morphologie yeux appliquée:', value);
    }

    applyMouthMorph(value) {
        const mouth = this.currentModel.getObjectByName('mouth');
        if (mouth) {
            const scaleX = 0.5 + value * 1.0; // 0.5 à 1.5
            const scaleY = 0.8 + value * 0.4; // 0.8 à 1.2
            mouth.scale.set(scaleX, scaleY, mouth.scale.z);
            console.log('Morphologie bouche appliquée:', scaleX, scaleY);
        }
    }

    applyJawMorph(value) {
        const head = this.currentModel.getObjectByName('head');
        if (head) {
            const scaleX = 0.8 + value * 0.4; // 0.8 à 1.2
            const originalScale = head.userData.originalScale || { x: 1, y: 1, z: 1 };
            head.scale.x = originalScale.x * scaleX;
            console.log('Morphologie mâchoire appliquée:', scaleX);
        }
    }

    applyCheekMorph(value) {
        // Pour les joues, on peut modifier la forme de la tête
        const head = this.currentModel.getObjectByName('head');
        if (head) {
            const scaleZ = 0.8 + value * 0.4; // 0.8 à 1.2
            const originalScale = head.userData.originalScale || { x: 1, y: 1, z: 1 };
            head.scale.z = originalScale.z * scaleZ;
            console.log('Morphologie joues appliquée:', scaleZ);
        }
    }

    applyForeheadMorph(value) {
        const head = this.currentModel.getObjectByName('head');
        if (head) {
            const scaleY = 0.8 + value * 0.4; // 0.8 à 1.2
            const originalScale = head.userData.originalScale || { x: 1, y: 1, z: 1 };
            head.scale.y = originalScale.y * scaleY;

            // Ajuster la position des yeux en conséquence
            this.currentModel.children.forEach(child => {
                if (child.material && child.material.color && child.material.color.getHex() === 0xffffff) {
                    child.position.y = 0.2 + (value - 0.5) * 0.2;
                }
            });
            console.log('Morphologie front appliquée:', scaleY);
        }
    }

    applyEarMorph(value) {
        // Les oreilles ne sont pas dans le modèle par défaut, mais on peut log
        console.log('Morphologie oreilles (non implémentée pour le modèle par défaut):', value);
    }

    applyChinMorph(value) {
        const head = this.currentModel.getObjectByName('head');
        if (head) {
            // Modifier légèrement la forme du bas de la tête
            const positionY = -0.1 + (value - 0.5) * 0.2;
            head.position.y = positionY;
            console.log('Morphologie menton appliquée:', positionY);
        }
    }

    // Fonction de randomisation
    randomizeConfiguration() {
        const faceTypes = ['male', 'female'];
        const skinColors = ['skin1', 'skin2', 'skin3', 'skin4', 'skin5', 'skin6', 'skin7'];
        const hairStyles = ['short', 'medium', 'long', 'curly', 'spiky', 'wavy', 'straight', 'buzz', 'mohawk', 'bald'];
        const hairColors = ['brown', 'blonde', 'black', 'red', 'white'];
        const eyeColors = ['brown', 'blue', 'green', 'hazel', 'gray'];
        const expressions = ['neutral', 'happy', 'sad', 'angry', 'surprised', 'wink'];

        // Sélections aléatoires
        const randomFace = faceTypes[Math.floor(Math.random() * faceTypes.length)];
        const randomSkin = skinColors[Math.floor(Math.random() * skinColors.length)];
        const randomHair = hairStyles[Math.floor(Math.random() * hairStyles.length)];
        const randomHairColor = hairColors[Math.floor(Math.random() * hairColors.length)];
        const randomEyes = eyeColors[Math.floor(Math.random() * eyeColors.length)];
        const randomExpression = expressions[Math.floor(Math.random() * expressions.length)];

        // Valeurs aléatoires pour la morphologie (entre 20 et 80 pour éviter les extrêmes)
        const morphologyParams = ['noseSize', 'eyeSize', 'mouthSize', 'jawWidth', 'cheekSize', 'foreheadHeight', 'earSize', 'chinSize'];

        // Appliquer les sélections aléatoires
        this.changeFaceType(randomFace);
        this.changeSkinColor(randomSkin);
        this.changeHairStyle(randomHair);
        this.changeHairColor(randomHairColor);
        this.changeEyeColor(randomEyes);
        this.changeExpression(randomExpression);

        // Appliquer les valeurs de morphologie aléatoires
        morphologyParams.forEach(param => {
            const randomValue = Math.floor(Math.random() * 60) + 20; // Entre 20 et 80
            this.changeMorphology(param, randomValue);
        });

        // Mettre à jour l'interface utilisateur
        this.updateUIFromConfig();
    }

    updateUIFromConfig() {
        // Mettre à jour les boutons actifs selon la configuration
        document.querySelectorAll(`[data-face="${this.config.faceType}"]`).forEach(btn => {
            this.setActiveButton(btn, 'face-btn');
        });

        document.querySelectorAll(`[data-skin="${this.config.skinColor}"]`).forEach(option => {
            this.setActiveColorOption(option, 'skin-color-palette');
        });

        // Mettre à jour la liste déroulante de coiffures
        const hairSelect = document.querySelector('.hair-select');
        if (hairSelect) {
            hairSelect.value = this.config.hairStyle;
        }

        document.querySelectorAll(`[data-hair-color="${this.config.hairColor}"]`).forEach(option => {
            this.setActiveColorOption(option, 'hair-color-palette');
        });

        document.querySelectorAll(`[data-eye-color="${this.config.eyeColor}"]`).forEach(option => {
            this.setActiveColorOption(option, 'eye-color-palette');
        });

        document.querySelectorAll(`[data-expression="${this.config.expression}"]`).forEach(btn => {
            this.setActiveButton(btn, 'expr-btn');
        });

        // Mettre à jour les barres de morphologie
        const morphologyParams = ['noseSize', 'eyeSize', 'mouthSize', 'jawWidth', 'cheekSize', 'foreheadHeight', 'earSize', 'chinSize'];
        morphologyParams.forEach(param => {
            const slider = document.querySelector(`[data-morph="${param}"]`);
            const valueDisplay = document.querySelector(`#${param.replace(/([A-Z])/g, '-$1').toLowerCase()} + .slider-value`);

            if (slider) {
                slider.value = this.config[param] || 50;
                if (valueDisplay) {
                    valueDisplay.textContent = (this.config[param] || 50) + '%';
                }
            }
        });
    }
}

// Initialiser l'avatar 3D au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    window.Avatar3D = new Avatar3DManager();
});
