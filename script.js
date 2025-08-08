class ASCIIConverter {
            constructor() {
                this.charSets = {
                    basic: '@%#*+=-:. ',
                    detailed: '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`\'. ',
                    blocks: '█▉▊▋▌▍▎▏ '
                };
                
                this.currentImage = null;
                this.asciiArt = '';
                
                this.setupEventListeners();
            }

            setupEventListeners() {
                const dragArea = document.getElementById('dragDropArea');
                const fileInput = document.getElementById('fileInput');
                const generateBtn = document.getElementById('generateBtn');
                const encryptBtn = document.getElementById('encryptBtn');
                const widthSlider = document.getElementById('widthSlider');
                const widthInput = document.getElementById('widthInput');
                const contrastSlider = document.getElementById('contrastSlider');

                // Drag & Drop
                dragArea.addEventListener('click', () => fileInput.click());
                dragArea.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    dragArea.classList.add('dragover');
                });
                dragArea.addEventListener('dragleave', () => dragArea.classList.remove('dragover'));
                dragArea.addEventListener('drop', (e) => {
                    e.preventDefault();
                    dragArea.classList.remove('dragover');
                    const files = e.dataTransfer.files;
                    if (files.length > 0) this.handleFile(files[0]);
                });

                fileInput.addEventListener('change', (e) => {
                    if (e.target.files.length > 0) this.handleFile(e.target.files[0]);
                });

                // Contrôles
                widthSlider.addEventListener('input', () => {
                    widthInput.value = widthSlider.value;
                    if (this.currentImage) this.generateASCII();
                });
                
                widthInput.addEventListener('input', () => {
                    widthSlider.value = widthInput.value;
                    if (this.currentImage) this.generateASCII();
                });

                contrastSlider.addEventListener('input', () => {
                    if (this.currentImage) this.generateASCII();
                });

                document.getElementById('charsetSelect').addEventListener('change', () => {
                    if (this.currentImage) this.generateASCII();
                });

                generateBtn.addEventListener('click', () => {
                    if (this.currentImage) this.generateASCII();
                });

                encryptBtn.addEventListener('click', () => {
                    this.startEncryption();
                });
            }

            handleFile(file) {
                if (!file.type.startsWith('image/')) {
                    alert('Veuillez sélectionner un fichier image.');
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        this.currentImage = img;
                        this.generateASCII();
                        document.getElementById('generateBtn').disabled = false;
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }

            generateASCII() {
                if (!this.currentImage) return;

                const width = parseInt(document.getElementById('widthInput').value);
                const contrast = parseFloat(document.getElementById('contrastSlider').value);
                const charset = document.getElementById('charsetSelect').value;

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                const aspectRatio = this.currentImage.height / this.currentImage.width;
                const height = Math.floor(width * aspectRatio * 0.5); // Correction aspect ratio pour caractères

                canvas.width = width;
                canvas.height = height;
                
                ctx.drawImage(this.currentImage, 0, 0, width, height);
                
                const imageData = ctx.getImageData(0, 0, width, height);
                const pixels = imageData.data;
                
                let ascii = '';
                const chars = this.charSets[charset];
                
                for (let i = 0; i < height; i++) {
                    for (let j = 0; j < width; j++) {
                        const pixelIndex = (i * width + j) * 4;
                        const r = pixels[pixelIndex];
                        const g = pixels[pixelIndex + 1];
                        const b = pixels[pixelIndex + 2];
                        
                        // Calcul de la luminosité
                        let brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                        brightness = Math.pow(brightness, 1/contrast); // Ajustement du contraste
                        
                        const charIndex = Math.floor(brightness * (chars.length - 1));
                        ascii += chars[chars.length - 1 - charIndex]; // Inverser pour bon contraste
                    }
                    ascii += '\n';
                }
                
                this.asciiArt = ascii.trim();
                document.getElementById('preview').textContent = this.asciiArt;
                document.getElementById('preview').classList.remove('hidden');
                document.getElementById('encryptBtn').disabled = false;
            }

            startEncryption() {
                if (!this.asciiArt) return;

                // Masquer la section d'upload
                document.getElementById('upload-section').style.display = 'none';
                
                // Placer l'art ASCII dans l'élément menuNormal
                document.getElementById('menuNormal').textContent = this.asciiArt;
                
                // Initialiser le système de chiffrement
                this.encryptedMessage = new EncryptedMessage();
            }
        }

        class EncryptedMessage {
            constructor() {
                this.charTable = [
                    "!", "\"", "#", "$", "%", "&", "'", "(", ")", "*", "+", ",", "-", "~",
                    ".", "/", ":", ";", "<", "=", ">", "?", "[", "\\", "]", "_", "{", "}",
                    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
                    "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
                    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
                    "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
                    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
                    "Ç", "ü", "é", "â", "ä", "à", "å", "ç", "ê", "ë", "è", "ï",
                    "î", "ì", "Ä", "Å", "É", "æ", "Æ", "ô", "ö", "ò", "û", "ù",
                    "ÿ", "Ö", "Ü", "¢", "£", "¥", "ƒ", "á", "í", "ó", "ú", "ñ",
                    "Ñ", "ª", "º", "¿", "¬", "½", "¼", "¡", "«", "»", "α", "ß",
                    "Γ", "π", "Σ", "σ", "µ", "τ", "Φ", "Θ", "Ω", "δ", "φ", "ε",
                    "±", "÷", "°", "·", "²", "¶", "⌐", "₧", "▒", "▓",
                    "│", "┤", "╡", "╢", "╖", "╕", "╣", "║", "╗", "╝", "╜", "╛",
                    "┐", "└", "┴", "┬", "├", "─", "┼", "╞", "╟", "╚", "╔", "╩",
                    "╦", "╠", "═", "╬", "╧", "╨", "╤", "╥", "╙", "╘", "╒", "╓",
                    "╫", "╪", "┘", "┌", "█", "▄", "▌", "▐", "▀"
                ];
                
                this.menuElement = null;
                this.scrollIndicator = null;
                this.originalText = '';
                this.encryptedDisplayText = '';
                this.promptText = '\n\nAppuyez sur Entrée pour révéler votre image...';
                this.isDecrypting = false;
                this.intervals = [];
                
                this.init();
            }

            init() {
                this.setup();
            }

            setup() {
                this.menuElement = document.getElementById('menu');
                this.scrollIndicator = document.getElementById('scrollIndicator');
                const menuNormalElement = document.getElementById('menuNormal');
                
                if (!this.menuElement || !menuNormalElement) {
                    console.error('Required elements not found');
                    return;
                }
                
                this.originalText = menuNormalElement.textContent.trim();
                this.setupScrollManagement();
                
                setTimeout(() => this.displayTerminal(), 500);
            }

            setupScrollManagement() {
                this.checkContentOverflow();
                
                window.addEventListener('scroll', () => this.handleScroll());
                window.addEventListener('resize', () => this.checkContentOverflow());
                document.addEventListener('keydown', (event) => this.handleKeyboardScroll(event));
            }

            checkContentOverflow() {
                const windowHeight = window.innerHeight;
                const documentHeight = document.documentElement.scrollHeight;
                
                if (documentHeight > windowHeight) {
                    document.body.classList.add('show-scroll-indicator');
                } else {
                    document.body.classList.remove('show-scroll-indicator');
                }
            }

            handleScroll() {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const windowHeight = window.innerHeight;
                const documentHeight = document.documentElement.scrollHeight;
                
                if (scrollTop + windowHeight >= documentHeight - 50) {
                    if (this.scrollIndicator) this.scrollIndicator.style.opacity = '0';
                } else {
                    if (this.scrollIndicator) this.scrollIndicator.style.opacity = '0.8';
                }
            }

            handleKeyboardScroll(event) {
                if (this.isDecrypting || event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

                const scrollAmount = 100;
                
                switch(event.key) {
                    case 'ArrowDown':
                        event.preventDefault();
                        window.scrollBy(0, scrollAmount);
                        break;
                    case 'ArrowUp':
                        event.preventDefault();
                        window.scrollBy(0, -scrollAmount);
                        break;
                    case 'PageDown':
                        event.preventDefault();
                        window.scrollBy(0, window.innerHeight * 0.8);
                        break;
                    case 'PageUp':
                        event.preventDefault();
                        window.scrollBy(0, -window.innerHeight * 0.8);
                        break;
                    case 'Home':
                        event.preventDefault();
                        window.scrollTo(0, 0);
                        break;
                    case 'End':
                        event.preventDefault();
                        window.scrollTo(0, document.documentElement.scrollHeight);
                        break;
                }
            }

            getRandomChar() {
                return this.charTable[Math.floor(Math.random() * this.charTable.length)];
            }

            encryptText(text) {
                return text.split('').map(char => {
                    if (char === ' ' || char === '\n') return char;
                    return this.getRandomChar();
                }).join('');
            }

            showMenu() {
                if (this.menuElement) {
                    this.menuElement.classList.remove('hidden');
                    this.menuElement.classList.add('visible');
                    setTimeout(() => this.checkContentOverflow(), 100);
                }
            }

            displayCharacter(menuText, currentIndex = 0, decryptedText = '') {
                if (currentIndex >= menuText.length) {
                    this.showDecryptPrompt(decryptedText);
                    return;
                }

                this.menuElement.innerHTML = decryptedText + '<span class="cursor"></span>';
                decryptedText += menuText[currentIndex];
                currentIndex++;

                if (currentIndex % 100 === 0) this.autoScrollIfNeeded();

                setTimeout(() => {
                    this.displayCharacter(menuText, currentIndex, decryptedText);
                }, 8);
            }

            autoScrollIfNeeded() {
                const windowHeight = window.innerHeight;
                const documentHeight = document.documentElement.scrollHeight;
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                if (scrollTop + windowHeight >= documentHeight - 200) {
                    window.scrollTo({
                        top: documentHeight,
                        behavior: 'smooth'
                    });
                }
            }

            showDecryptPrompt(encryptedText) {
                this.encryptedDisplayText = encryptedText;
                this.typePrompt(encryptedText, this.promptText, 0);
            }

            typePrompt(baseText, promptText, currentIndex) {
                if (currentIndex >= promptText.length) {
                    this.menuElement.innerHTML = baseText + promptText + '<span class="cursor"></span>';
                    this.setupDecryptionListener();
                    return;
                }

                const currentPrompt = promptText.substring(0, currentIndex + 1);
                this.menuElement.innerHTML = baseText + currentPrompt + '<span class="cursor"></span>';
                
                setTimeout(() => {
                    this.typePrompt(baseText, promptText, currentIndex + 1);
                }, 50);
            }

            setupDecryptionListener() {
                const handleKeyDown = (event) => {
                    if (event.key === "Enter" && !this.isDecrypting) {
                        this.isDecrypting = true;
                        this.menuElement.textContent = this.encryptedDisplayText;
                        this.randomizeText();
                        document.removeEventListener('keydown', handleKeyDown);
                    }
                };

                document.addEventListener('keydown', handleKeyDown);
            }

            randomizeText() {
                let randomizeCount = 0;
                const maxRandomizations = 80;
                
                const randomizeInterval = setInterval(() => {
                    if (randomizeCount >= maxRandomizations) {
                        clearInterval(randomizeInterval);
                        this.startDecryption();
                        return;
                    }
                    
                    this.menuElement.textContent = this.encryptText(this.originalText);
                    randomizeCount++;
                }, 15);

                this.intervals.push(randomizeInterval);

                setTimeout(() => {
                    clearInterval(randomizeInterval);
                    this.startDecryption();
                }, 1200);
            }

            startDecryption() {
                const decryptChar = () => {
                    const currentText = this.menuElement.textContent;
                    
                    if (currentText === this.originalText) {
                        this.scrollToShowCompleteContent();
                        return;
                    }

                    const mismatchedIndices = [];
                    
                    for (let i = 0; i < this.originalText.length; i++) {
                        if (currentText[i] !== this.originalText[i]) {
                            mismatchedIndices.push(i);
                        }
                    }

                    if (mismatchedIndices.length > 0) {
                        const randomIndex = mismatchedIndices[Math.floor(Math.random() * mismatchedIndices.length)];
                        const newText = currentText.substring(0, randomIndex) +
                            this.originalText[randomIndex] +
                            currentText.substring(randomIndex + 1);
                        this.menuElement.textContent = newText;
                    }

                    if (currentText !== this.originalText) {
                        setTimeout(decryptChar, 3);
                    }
                };

                decryptChar();
            }

            scrollToShowCompleteContent() {
                setTimeout(() => {
                    window.scrollTo({
                        top: document.documentElement.scrollHeight,
                        behavior: 'smooth'
                    });
                }, 500);
            }

            displayTerminal() {
                const encryptedText = this.encryptText(this.originalText);
                this.showMenu();
                this.displayCharacter(encryptedText);
            }

            destroy() {
                this.intervals.forEach(interval => clearInterval(interval));
                this.intervals = [];
            }
        }

        // Initialisation
        const asciiConverter = new ASCIIConverter();

        window.addEventListener('beforeunload', () => {
            if (window.encryptedMessage) {
                window.encryptedMessage.destroy();
            }
        });
