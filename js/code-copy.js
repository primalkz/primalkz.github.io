class CodeCopy {
    constructor() {
        this.init();
    }

    init() {
        this.addStyles();
        this.addCopyButtons();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .sourceCode { position: relative; }
            .sourceCode .copy-button {
                position: absolute; top: 8px; right: 8px; padding: 4px 8px;
                background: var(--bg-tertiary); border: 1px solid var(--border-color);
                border-radius: 4px; color: var(--text-primary); cursor: pointer;
                font-size: 12px; opacity: 0; transition: opacity 0.2s; z-index: 10;
            }
            .sourceCode:hover .copy-button { opacity: 1; }
            .sourceCode .copy-button:hover { 
                background: var(--bg-secondary); 
                border-color: var(--border-active); 
            }
            .sourceCode .copy-button.copied { 
                background: #4CAF50; 
                color: white; 
            }
        `;
        document.head.appendChild(style);
    }

    addCopyButtons() {
        const codeBlocks = document.querySelectorAll('[class="sourceCode"]');
        codeBlocks.forEach((codeBlock) => {
            if (codeBlock.querySelector('.copy-button')) return;
            const button = document.createElement('button');
            button.className = 'copy-button';
            button.title = 'Copy to clipboard';
            button.innerHTML = 'Copy';
            button.addEventListener('click', async () => {
                try {
                    const code = codeBlock.querySelector('code')?.innerText || '';
                    if (code) {
                        await navigator.clipboard.writeText(code);
                        button.textContent = 'Copied!';
                        button.classList.add('copied');
                        
                        setTimeout(() => {
                            button.textContent = 'Copy';
                            button.classList.remove('copied');
                        }, 2000);
                    }
                } catch (err) {
                    console.error('Failed to copy text: ', err);
                    button.textContent = 'Failed';
                    setTimeout(() => {
                        button.textContent = 'Copy';
                    }, 2000);
                }
            });
            codeBlock.style.position = 'relative';
            codeBlock.appendChild(button);
        });
    }
}

if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new CodeCopy();
    });
} else {
    new CodeCopy();
}
