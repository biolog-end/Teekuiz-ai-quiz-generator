document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Элементы ---
    const generatorScreen = document.getElementById('generator-screen');
    const startScreen = document.getElementById('start-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const resultScreen = document.getElementById('result-screen');

    const promptInput = document.getElementById('prompt-input');
    const generateBtn = document.getElementById('generate-btn');
    const importBtn = document.getElementById('import-btn');
    const fileInput = document.getElementById('file-input');
    const statusText = document.getElementById('status-text');

    const startTitle = document.getElementById('start-title');
    const startDescription = document.getElementById('start-description');
    const startBtn = document.getElementById('start-btn');

    const quizProgress = document.getElementById('quiz-progress');
    const questionText = document.getElementById('question-text');
    const answersForm = document.getElementById('answers-form');
    const nextQuestionBtn = document.getElementById('next-question-btn');

    const resultAsciiArt = document.getElementById('result-ascii-art');
    const resultTitle = document.getElementById('result-title');
    const resultDescription = document.getElementById('result-description');
    const restartBtn = document.getElementById('restart-btn');
    const saveBtn = document.getElementById('save-btn');
    const prevQuestionBtn = document.getElementById('prev-question-btn');

    const raritySection = document.getElementById('rarity-section');
    const raritySeparator = document.getElementById('rarity-separator');
    const rarityChart = document.getElementById('rarity-chart');
    const quizProgressBar = document.getElementById('quiz-progress-bar');

    const settingsBtn = document.getElementById('settings-btn');
    const settingsMenu = document.getElementById('settings-menu');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const soundToggle = document.getElementById('sound-toggle');
    const languageSelect = document.getElementById('language-select');

    // --- Состояние приложения ---
    let quizData = null;
    let currentQuestionIndex = 0;
    let scores = {};
    let userAnswersHistory = []; 
    const API_URL = '/api/generate';

    // --- Обработчики событий ---
    prevQuestionBtn.addEventListener('click', handlePreviousQuestion);
    generateBtn.addEventListener('click', handleGenerate);
    importBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleImport);
    startBtn.addEventListener('click', beginQuiz);
    nextQuestionBtn.addEventListener('click', handleNextQuestion);
    restartBtn.addEventListener('click', showGeneratorScreen);
    saveBtn.addEventListener('click', handleExport);

    settingsBtn.addEventListener('click', () => {
        Sound.navigate();
        settingsMenu.classList.remove('hidden');
    });

    closeSettingsBtn.addEventListener('click', () => {
        Sound.navigate();
        settingsMenu.classList.add('hidden');
    });

    settingsMenu.addEventListener('click', (event) => {
        if (event.target === settingsMenu) {
            Sound.navigate();
            settingsMenu.classList.add('hidden');
        }
    });

    soundToggle.addEventListener('change', () => {
        Sound.toggleMute(!soundToggle.checked);
        localStorage.setItem('soundMuted', !soundToggle.checked);
        Sound.select(); 
    });

    languageSelect.addEventListener('change', (e) => {
        setLanguage(e.target.value);
    });

    
    window.updateDynamicTexts = () => {
        handleAnimatedPlaceholder(true); 
        
        const currentStatus = statusText.dataset.statusKey;
        if (currentStatus) {
            const message = t(currentStatus);
            const type = statusText.className;
            
            if (currentStatus === 'generating') {
                showLoading(true);
            } else {
                showStatus(message, type, false);
            }
        }
    };
    
    function loadSettings() {
        const isSoundMuted = localStorage.getItem('soundMuted') === 'true';
        soundToggle.checked = !isSoundMuted;
        Sound.toggleMute(isSoundMuted);
        
        const savedLanguage = localStorage.getItem('language') || 'ru';
        languageSelect.value = savedLanguage;
        
    }
    
    loadSettings();

    function handleAnimatedPlaceholder(forceRestart = false) {
        if (handleAnimatedPlaceholder.timeoutId && !forceRestart) return;
        if (handleAnimatedPlaceholder.timeoutId && forceRestart) {
            clearTimeout(handleAnimatedPlaceholder.timeoutId);
            if (handleAnimatedPlaceholder.cursorIntervalId) {
                clearInterval(handleAnimatedPlaceholder.cursorIntervalId);
            }
        }
        
        const phrases = [
            t("placeholder1"), t("placeholder2"), t("placeholder3"),
            t("placeholder4"), t("placeholder5"), t("placeholder6"),
            t("placeholder7"), t("placeholder8"), t("placeholder9"),
            t("placeholder10"), t("placeholder11")
        ];

        let phraseIndex = Math.floor(Math.random() * phrases.length);
        let charIndex = 0;
        let isDeleting = false;
        let isCursorVisible = true;
        let typingTimeout;

        handleAnimatedPlaceholder.cursorIntervalId = setInterval(() => {
            isCursorVisible = !isCursorVisible;
        }, 500);

        function type() {
            if (promptInput.value.length > 0) {
                promptInput.placeholder = '>';
                clearTimeout(handleAnimatedPlaceholder.timeoutId);
                handleAnimatedPlaceholder.timeoutId = null;
                return;
            }

            const currentPhrase = phrases[phraseIndex];
            let baseText = isDeleting 
                ? currentPhrase.substring(0, charIndex--)
                : currentPhrase.substring(0, charIndex++);

            promptInput.placeholder = `> ${baseText}${isCursorVisible ? '|' : ''}`;
            
            if (!isDeleting && charIndex === currentPhrase.length + 1) {
                isDeleting = true;
                typingTimeout = 1000; 
            } else if (isDeleting && charIndex === -1) {
                isDeleting = false;
                
                let nextPhraseIndex;
                do {
                    nextPhraseIndex = Math.floor(Math.random() * phrases.length);
                } while (nextPhraseIndex === phraseIndex);
                phraseIndex = nextPhraseIndex;

                typingTimeout = 500;
            } else {
                typingTimeout = isDeleting ? 60 : 120;
            }
            
            handleAnimatedPlaceholder.timeoutId = setTimeout(type, typingTimeout);
        }
        
        promptInput.addEventListener('input', () => {
            if (promptInput.value.length === 0 && !handleAnimatedPlaceholder.timeoutId) {
                setTimeout(type, 1000);
            }
        });

        type();
    }

    handleAnimatedPlaceholder();
    
    // --- Функции-помощники для цвета ---
    const isColorDark = (hexColor) => {
        if (!hexColor || !/^#([A-Fa-f0-9]{3}){1,2}$/.test(hexColor)) return false;
        let c = hexColor.substring(1).split('');
        if (c.length === 3) { c = [c[0], c[0], c[1], c[1], c[2], c[2]]; }
        c = '0x' + c.join('');
        const r = (c >> 16) & 255;
        const g = (c >> 8) & 255;
        const b = c & 255;
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness < 128;
    };

    const adjustColor = (hexColor, amount) => {
        if (!hexColor) return null;
        return '#' + hexColor.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
    };
    
    // --- Основная логика ---
    async function handleGenerate() {
        Sound.init();
        const prompt = promptInput.value.trim();
        if (!prompt) {
            showStatus(`${t('errorPrefix')}${t('enterTopic')}`, 'error', 'enterTopic');
            return;
        }
        showLoading();
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, lang: currentLanguage }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }
            const data = await response.json();
            quizData = data;
            showSuccessAndStart();
        } catch (error) {
            console.error('Ошибка при генерации:', error);
            showStatus(`${t('errorPrefix')}${error.message}`, 'error');
        }
    }

    function handleImport(event) {
        Sound.init();
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (!data.title || !data.questions || !data.results) throw new Error(t('invalidJsonStructure'));
                quizData = data;
                showStartScreen();
            } catch (error) {
                
                showStatus(`${t('errorPrefix')}${error.message}`, 'error');
            }
        };
        reader.readAsText(file);
        fileInput.value = '';
    }

    function handleExport() {
        if (!quizData) return;
        
        const safeTitle = quizData.title.replace(/\s+/g, '_').replace(/[?!,.\\/:*?"<>|]/g, '');
        const filename = `quiz_${safeTitle || 'untitled'}.json`;
        const jsonStr = JSON.stringify(quizData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    function showSuccessAndStart() {
        hideLoading();
        Sound.success();
        showStatus(t('generatedSuccess'), 'success', 'generatedSuccess');
        setTimeout(() => {
            statusText.textContent = '';
            statusText.removeAttribute('data-status-key');
            showStartScreen();
        }, 1200);
    }

    function showStartScreen() {
        currentQuestionIndex = 0;
        scores = quizData.results.reduce((acc, result) => ({ ...acc, [result.id]: 0 }), {});
        userAnswersHistory = [];

        // Применяем эффект
        scrambleReveal(startTitle, quizData.title);
        scrambleReveal(startDescription, quizData.description);
        
        generatorScreen.classList.add('hidden');
        resultScreen.classList.add('hidden');
        quizScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
    }

    function beginQuiz() {
        Sound.navigate();
        startScreen.classList.add('hidden');
        quizScreen.classList.remove('hidden');
        startTitle.textContent = quizData.title; 
        startDescription.textContent = quizData.description;
        displayQuestion();
    }


    function displayQuestion() {
        const question = quizData.questions[currentQuestionIndex];
        updateTheme(question.background_color);
        
        prevQuestionBtn.style.visibility = currentQuestionIndex > 0 ? 'visible' : 'hidden';

        quizProgress.textContent = `${currentQuestionIndex + 1} / ${quizData.questions.length}`;
        
        animateProgressBar(quizProgressBar, currentQuestionIndex + 1, quizData.questions.length);

        scrambleReveal(questionText, `> ${question.question_text}`);
        
        answersForm.innerHTML = '';
        const inputType = question.type === 'single_choice' ? 'radio' : 'checkbox';
        const previousAnswers = userAnswersHistory[currentQuestionIndex] || [];

        question.answers.forEach((answer, index) => {
            const answerId = `q${currentQuestionIndex}-a${index}`;
            const option = document.createElement('div');
            option.className = 'answer-option';
            option.addEventListener('click', () => Sound.select());
            const input = document.createElement('input');
            input.type = inputType;
            input.id = answerId;
            input.name = `question-${currentQuestionIndex}`;
            input.dataset.scores = JSON.stringify(answer.scores);
            const label = document.createElement('label');
            label.htmlFor = answerId;
            label.textContent = answer.text;

            if (previousAnswers.includes(index)) {
                input.checked = true;
            }

            option.appendChild(input);
            option.appendChild(label);
            answersForm.appendChild(option);
        });
    }
    
    function handleNextQuestion() {
        Sound.navigate();
        const selectedInputs = Array.from(answersForm.querySelectorAll('input:checked'));
        if (selectedInputs.length === 0) {
            answersForm.classList.add('shake');
            setTimeout(() => answersForm.classList.remove('shake'), 500);
            return;
        }

        const selectedAnswerIndexes = selectedInputs.map(input => {
            const label = answersForm.querySelector(`label[for="${input.id}"]`);
            const answerText = label.textContent;
            return quizData.questions[currentQuestionIndex].answers.findIndex(a => a.text === answerText);
        });
        userAnswersHistory[currentQuestionIndex] = selectedAnswerIndexes;

        scores = quizData.results.reduce((acc, result) => ({ ...acc, [result.id]: 0 }), {});
        userAnswersHistory.forEach((answerIndexes, qIndex) => {
            if (answerIndexes) {
                answerIndexes.forEach(ansIndex => {
                    const answerScores = quizData.questions[qIndex].answers[ansIndex].scores;
                     for (const resultId in answerScores) {
                        if (resultId in scores) scores[resultId] += answerScores[resultId];
                    }
                });
            }
        });

        currentQuestionIndex++;
        if (currentQuestionIndex < quizData.questions.length) {
            displayQuestion();
        } else {
            showResult();
        }
    }

    function scrambleReveal(element, final_text) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!<>-_\\/[]{}—=+*^?#';
        const DURATION = 700;

        
        let scrambledMask = '';
        for (let i = 0; i < final_text.length; i++) {
           
            if (final_text[i] === ' ') {
                scrambledMask += ' ';
            } else {
                scrambledMask += chars[Math.floor(Math.random() * chars.length)];
            }
        }

        const indices = Array.from({ length: final_text.length }, (_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }

        let startTime = null;

        function animate(currentTime) {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / DURATION, 1);
            
            const revealCount = Math.floor(progress * final_text.length);
            const revealedIndices = new Set(indices.slice(0, revealCount));

            let new_text = '';
            for (let i = 0; i < final_text.length; i++) {
                if (revealedIndices.has(i)) {
                    new_text += final_text[i];
                } else {
                    new_text += scrambledMask[i];
                }
            }
            element.textContent = new_text;

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                element.textContent = final_text;
            }
        }
        
        if (element.animationFrameId) {
            cancelAnimationFrame(element.animationFrameId);
        }
        
        element.animationFrameId = requestAnimationFrame(animate);
    }

    function handlePreviousQuestion() {
        Sound.navigate();
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            displayQuestion();
        }
    }
    
    function hideLoading() {
        clearInterval(showLoading.interval); // Очищаем интервал
        generateBtn.disabled = false;
        importBtn.disabled = false;
    }
    
    function showGeneratorScreen() {
        
        if (showLoading.interval) {
            clearInterval(showLoading.interval); 
        }
        statusText.textContent = ''; 
        statusText.className = ''; 
        quizScreen.classList.add('hidden');
        resultScreen.classList.add('hidden');
        startScreen.classList.add('hidden');
        generatorScreen.classList.remove('hidden');
        promptInput.value = '';
        raritySection.classList.add('hidden');
    }

    function showResult() {
        const finalResultId = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
        const result = quizData.results.find(r => r.id === finalResultId);

        resultAsciiArt.textContent = result.ascii_art || '(ascii art not found)';
        resultTitle.textContent = result.title;
        resultDescription.textContent = result.description;
        
        const rarityData = calculateRarityMonteCarlo(quizData);
        displayRarityChart(rarityData, finalResultId);
        raritySection.classList.remove('hidden');

        quizScreen.classList.add('hidden');
        resultScreen.classList.remove('hidden');
    }

    function calculateRarityMonteCarlo(quizData) {
        const SIMULATION_COUNT = 10000; 
        const resultIds = quizData.results.map(r => r.id);
        const winCounts = resultIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), {});

        for (let i = 0; i < SIMULATION_COUNT; i++) {
            const currentScores = resultIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), {});

            quizData.questions.forEach(question => {
                const answers = question.answers;
                if (question.type === 'single_choice') {
                    const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
                    for (const id in randomAnswer.scores) {
                        currentScores[id] += randomAnswer.scores[id];
                    }
                } else if (question.type === 'multiple_choice') {
                    let pickedCount = 0;
                    const availableAnswers = [...answers];
                    
                    const firstPickIndex = Math.floor(Math.random() * availableAnswers.length);
                    const [firstAnswer] = availableAnswers.splice(firstPickIndex, 1);
                     for (const id in firstAnswer.scores) {
                        currentScores[id] += firstAnswer.scores[id];
                    }
                    pickedCount++;

                    availableAnswers.forEach(answer => {
                        const threshold = (pickedCount / answers.length) >= 0.5 ? 0.25 : 0.5;
                        if (Math.random() < threshold) {
                            for (const id in answer.scores) {
                                currentScores[id] += answer.scores[id];
                            }
                            pickedCount++;
                        }
                    });
                }
            });

            // Определяем победителя
            let maxScore = -Infinity;
            let winners = [];
            for (const id in currentScores) {
                if (currentScores[id] > maxScore) {
                    maxScore = currentScores[id];
                    winners = [id];
                } else if (currentScores[id] === maxScore) {
                    winners.push(id);
                }
            }

            // Разрешаем ничью случайным выбором и засчитываем победу
            const finalWinner = winners[Math.floor(Math.random() * winners.length)];
            if (finalWinner) {
                winCounts[finalWinner]++;
            }
        }

        const rarityData = quizData.results.map(result => {
            const percentage = (winCounts[result.id] / SIMULATION_COUNT) * 100;
            return {
                ...result,
                percentage: percentage.toFixed(1)
            };
        });
        
        return rarityData.sort((a, b) => b.percentage - a.percentage);
    }
    
   function displayRarityChart(rarityData, winnerId) {
        const separators = [t('raritySeparator1'), t('raritySeparator2'), t('raritySeparator3'), t('raritySeparator4')];
        raritySeparator.textContent = separators[Math.floor(Math.random() * separators.length)];
        
        rarityChart.innerHTML = '';
        
        rarityData.forEach(result => {
            const row = document.createElement('div');
            row.className = 'rarity-row';
            if (result.id === winnerId) {
                row.classList.add('highlighted-result');
            }

            const barSpan = document.createElement('span');
            barSpan.className = 'rarity-bar';
            
            animateRarityBar(barSpan, parseFloat(result.percentage));

            row.innerHTML = `
                <div class="rarity-info">
                    <pre>${result.ascii_art || ''}</pre>
                    <p>[ ${result.title} ]</p>
                </div>
                <div class="rarity-bar-container">
                    <!-- Контейнер для бара, который будет заполнен JS -->
                </div>
            `;
            // Вставляем созданный span в контейнер
            row.querySelector('.rarity-bar-container').appendChild(barSpan);
            // Добавляем проценты после
            const percentageSpan = document.createElement('span');
            percentageSpan.className = 'rarity-percentage';
            percentageSpan.textContent = `${result.percentage}%`;
            row.querySelector('.rarity-bar-container').appendChild(percentageSpan);

            rarityChart.appendChild(row);
        });
    }

    function animateProgressBar(element, current, total) {
        const BAR_WIDTH = 50;
        const targetFilledCount = Math.round((current / total) * BAR_WIDTH);

        if (element.animationInterval) clearInterval(element.animationInterval);
        
        let currentFilledCount;
        const currentBar = element.textContent;
        const prevFilled = (currentBar.match(/█/g) || []).length;
        currentFilledCount = prevFilled;

        element.animationInterval = setInterval(() => {
            // Движемся к цели
            if (currentFilledCount < targetFilledCount) {
                currentFilledCount++;
            } else if (currentFilledCount > targetFilledCount) {
                currentFilledCount--;
            } else {
                clearInterval(element.animationInterval);
                return;
            }

            const emptyCount = BAR_WIDTH - currentFilledCount;
            element.textContent = `[${'█'.repeat(currentFilledCount)}${'░'.repeat(emptyCount)}]`;
        }, 25); 
    }

    function animateRarityBar(element, targetPercentage) {
        const BAR_LENGTH = 20;
        const targetFilledCount = Math.round((targetPercentage / 100) * BAR_LENGTH);
        let currentFill = 0;

        const interval = setInterval(() => {
            if (currentFill >= targetFilledCount) {
                clearInterval(interval);
                return;
            }
            currentFill++;
            
            let bar = '█'.repeat(Math.round(currentFill * 0.7));
            bar += '▓'.repeat(Math.round(currentFill * 0.3));
            bar += '░'.repeat(BAR_LENGTH - currentFill);
            if (bar.length > BAR_LENGTH) bar = bar.substring(0, BAR_LENGTH);
            if (bar.length < BAR_LENGTH) bar += '░'.repeat(BAR_LENGTH - bar.length);

            element.textContent = bar;
        }, 100); // Скорость анимации
    }
    
    function updateTheme(hexColor) {
        const root = document.documentElement.style;
        if (hexColor) {
            const isDark = isColorDark(hexColor);
            root.setProperty('--bg-color', hexColor);
            root.setProperty('--text-color', isDark ? '#ffffff' : '#000000');
            const hoverAmount = isDark ? -40 : 40; 
            const hoverColor = adjustColor(hexColor, hoverAmount);
            root.setProperty('--button-bg-color', 'transparent');
            root.setProperty('--button-hover-bg-color', hoverColor);
        } else {
            root.setProperty('--bg-color', 'var(--default-bg-color)');
            root.setProperty('--text-color', 'var(--default-text-color)');
            root.setProperty('--button-hover-bg-color', 'rgba(0, 0, 0, 0.05)');
        }
    }
    
    // --- Управление статусами ---
    function showStatus(message, type, key = null) {
        statusText.textContent = message;
        statusText.className = type;
        if (key) {
            statusText.dataset.statusKey = key;
        } else {
            statusText.removeAttribute('data-status-key');
        }
    }

    function showLoading(isUpdate = false) {
        if (!isUpdate) {
            if (showLoading.interval) clearInterval(showLoading.interval); 
            generateBtn.disabled = true;
            importBtn.disabled = true;
        }
        
        let dots = '.';
        statusText.className = 'loading';
        const baseText = t('generating');
        statusText.textContent = `${baseText}${dots}`;
        statusText.dataset.statusKey = 'generating';

        showLoading.interval = setInterval(() => {
            dots = dots.length < 3 ? dots + '.' : '.';
            statusText.textContent = `${baseText}${dots}`;
        }, 500);
    }

    function hideLoading() {
        if (showLoading.interval) {
            clearInterval(showLoading.interval);
            showLoading.interval = null;
        }
        generateBtn.disabled = false;
        importBtn.disabled = false;
    }
});