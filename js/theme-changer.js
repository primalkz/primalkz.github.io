class ThemeChanger {
    constructor() {
        // console.log('ThemeChanger initialized');
        this.themes = ['dark', 'light', 'gruvbox'];
        this.icons = {
            'dark': '<i class="fas fa-moon"></i>',
            'light': '<i class="fas fa-asterisk"></i>', 
            'gruvbox': '<i class="fas fa-sun"></i>'
        };
        this.currentThemeIndex = 0;
        this.currentTheme = this.loadTheme();
        this.currentThemeIndex = this.themes.indexOf(this.currentTheme);
        this.init();
    }

    init(){
        this.createThemeChanger();
        this.applyTheme(this.currentTheme);
        this.setupEventListeners();
    }

    createThemeChanger() {
        const themeChanger = document.createElement('div');
        themeChanger.className = 'theme-changer';
        themeChanger.id = 'theme-changer';
        themeChanger.innerHTML = this.icons[this.currentTheme];
        themeChanger.title = `Current theme: ${this.currentTheme}`;
        
        document.body.appendChild(themeChanger);
    }

    setupEventListeners() {
        const themeChanger = document.getElementById('theme-changer');
        if (themeChanger){
            themeChanger.addEventListener('click', () => {
                this.cycleTheme();
            });
        }
    }

    cycleTheme() {
        this.currentThemeIndex = (this.currentThemeIndex + 1) % this.themes.length;
        const newTheme = this.themes[this.currentThemeIndex];
        this.changeTheme(newTheme);
    }

    changeTheme(theme) {
        this.currentTheme = theme;
        this.applyTheme(theme);
        this.saveTheme(theme);
        this.updateIcon();
    }

    updateIcon() {
        const themeChanger = document.getElementById('theme-changer');
        if (themeChanger) {
            themeChanger.innerHTML = this.icons[this.currentTheme];
            themeChanger.title = `Current theme: ${this.currentTheme}`;
        }
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }

    saveTheme(theme) {
        localStorage.setItem('theme', theme);
    }

    loadTheme() {
        const saved = localStorage.getItem('theme');
        return this.themes.includes(saved) ? saved : 'dark';
    }
}

if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ThemeChanger();
    });
} else {
    new ThemeChanger();
}
