const translations = {
    "ru": {
        "settings": "[ настройки ]",
        "settingsTitle": "Настройки",
        "soundEffects": "Звуковые эффекты",
        "languageLabel": "Язык",
        "close": "[ закрыть ]",
        "aiQuizGenerator": "// AI Quiz Generator",
        "generate": "[ сгенерировать ]",
        "import": "[ импортировать ]",
        "start": "[ начать ]",
        "back": "[ назад ]",
        "next": "[ далее ]",
        "restart": "[ пройти заново ]",
        "saveJson": "[ сохранить .json ]",
        "errorPrefix": "> ошибка: ",
        "enterTopic": "введите тему",
        "generating": "> генерация",
        "generatedSuccess": "> сгенерировано!",
        "invalidJsonStructure": "неверная структура .json",
        "raritySeparator1": "--%--%--",
        "raritySeparator2": "===+===+===",
        "raritySeparator3": "~~*~~*~~",
        "raritySeparator4": "..|..|..",
        "placeholder1": "какой я вид хлеба?",
        "placeholder2": "кто я из персонажей аниме Созданного в бездне?",
        "placeholder3": "какая я ошибка в коде?",
        "placeholder4": "мой тотемный напиток из 90-х...",
        "placeholder5": "какой я мем с котом?",
        "placeholder6": "какое я число?",
        "placeholder7": "Какая аномалия из космоса скрывается в моей душе?",
        "placeholder8": "Какой мой язык любви?",
        "placeholder9": "какой я заброшенный завод?",
        "placeholder10": "мой внутренний геологический период...",
        "placeholder11": "определи мой уровень экзистенциального ужаса"
    },
    "en": {
        "settings": "[ settings ]",
        "settingsTitle": "Settings",
        "soundEffects": "Sound Effects",
        "languageLabel": "Language",
        "close": "[ close ]",
        "aiQuizGenerator": "// AI Quiz Generator",
        "generate": "[ generate ]",
        "import": "[ import ]",
        "start": "[ start ]",
        "back": "[ back ]",
        "next": "[ next ]",
        "restart": "[ restart ]",
        "saveJson": "[ save .json ]",
        "errorPrefix": "> error: ",
        "enterTopic": "enter a topic",
        "generating": "> generating",
        "generatedSuccess": "> generated!",
        "invalidJsonStructure": "invalid .json structure",
        "raritySeparator1": "--%--%--",
        "raritySeparator2": "===+===+===",
        "raritySeparator3": "~~*~~*~~",
        "raritySeparator4": "..|..|..",
        "placeholder1": "what type of bread am I?",
        "placeholder2": "which Made in Abyss character am I?",
        "placeholder3": "what kind of bug in the code am I?",
        "placeholder4": "my spirit drink from the 90s is...",
        "placeholder5": "which cat meme am I?",
        "placeholder6": "what number am I?",
        "placeholder7": "What cosmic anomaly is hidden in my soul?",
        "placeholder8": "What is my love language?",
        "placeholder9": "what abandoned factory am I?",
        "placeholder10": "my inner geological period is...",
        "placeholder11": "determine my level of existential dread"
    }
};

let currentLanguage = localStorage.getItem('language') || 'ru';

function setLanguage(lang) {
    if (!translations[lang]) {
        console.error(`Language ${lang} not found.`);
        return;
    }
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });

    if (typeof window.updateDynamicTexts === 'function') {
        window.updateDynamicTexts();
    }
}

function t(key) {
    return translations[currentLanguage][key] || key;
}