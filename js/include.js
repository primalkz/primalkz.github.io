(function() {
    const themeScriptPath = window.location.pathname.includes('/posts/') ? '../js/theme-changer.js' : './js/theme-changer.js';
    const themeXhr = new XMLHttpRequest();
    themeXhr.open('GET', themeScriptPath, false);
    themeXhr.send();
    if (themeXhr.status == 200) {
        const themeScript = document.createElement('script');
        themeScript.textContent = themeXhr.responseText;
        document.head.appendChild(themeScript);
    }
    
    const cssPath = window.location.pathname.includes('/posts/') ? '../css/style.css' : './css/style.css';
    const xhr = new XMLHttpRequest();
    xhr.open('GET', cssPath, false);
    xhr.send();
    
    if (xhr.status == 200) {
        const style = document.createElement('style');
        style.textContent = xhr.responseText;
        document.head.appendChild(style);
    }
    
    const loaderScriptPath = window.location.pathname.includes('/posts/') ? '../js/terminal-loader.js' : './js/terminal-loader.js';
    const loaderXhr = new XMLHttpRequest();
    loaderXhr.open('GET', loaderScriptPath, false);
    loaderXhr.send();
    if (loaderXhr.status == 200) {
        const loaderScriptTag = document.createElement('script');
        loaderScriptTag.textContent = loaderXhr.responseText;
        document.head.appendChild(loaderScriptTag);
    }
    
    const codeCopyScriptPath = window.location.pathname.includes('/posts/') ? '../js/code-copy.js' : './js/code-copy.js';
    const codeCopyScript = document.createElement('script');
    codeCopyScript.src = codeCopyScriptPath;
    document.head.appendChild(codeCopyScript);
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