(function() {
    const cssPath = window.location.pathname.includes('/posts/') ? '../css/style.css' : './css/style.css';
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = cssPath;
    document.head.appendChild(link);
    
    const themeScriptPath = window.location.pathname.includes('/posts/') ? '../js/theme-changer.js' : './js/theme-changer.js';
    const themeScript = document.createElement('script');
    themeScript.src = themeScriptPath;
    document.head.appendChild(themeScript);
})();

function toggleModal() {
    const modal = document.getElementById("modal");
    if (modal.style.display == "block") {
        modal.style.display = "none";
    } else {
        modal.style.display = "block";
    }
}

function includeHTML() {
    var z, i, elmnt, file, xhttp;    
    z = document.getElementsByTagName("*");
    for (i = 0; i < z.length; i++) {
        elmnt = z[i];
        file = elmnt.getAttribute("include-html");
        if (file) {
            xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4) {
                    if (this.status == 200) {elmnt.innerHTML = this.responseText;}
                    if (this.status == 404) {elmnt.innerHTML = "Component not found.";}
                    elmnt.removeAttribute("include-html");
                    includeHTML();
                }
            }
            xhttp.open("GET", file, true);
            xhttp.send();
            return;
        }
    }
    setCurrentYear();
    setTerminalPrompt();
}

function setCurrentYear() {
    const yearElement = document.getElementById("current-year");
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

function setTerminalPrompt() {
    const promptElement = document.getElementById("terminal-prompt");
    if (promptElement) {
        const path = window.location.pathname; 
        const pathSegments = path.replace(/^\//, '').split('/');
        let displayText;
        
        if (pathSegments.length === 1) {
            displayText = pathSegments[0] || 'index.html';
        } else {
            const lastTwo = pathSegments.slice(-2);
            displayText = lastTwo.join('/');
        }
        if (displayText === '' || displayText === '/') {
            displayText = 'index.html';
        }
        promptElement.textContent = 'cat ' + displayText;
    }
}

document.addEventListener("DOMContentLoaded", function() {
    includeHTML();
});