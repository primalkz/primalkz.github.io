document.addEventListener('DOMContentLoaded', function() {
    const loader = document.createElement('div');
    loader.id = 'terminal-loader';
    loader.innerHTML = `
        <div class="terminal-loader-content">
            <div class="terminal-loader-frame">
                <div class="terminal-loader-bar">
                    <span class="terminal-loader-block">████████████████</span>
                </div>
            </div>
        </div>
    `;
    
    document.body.prepend(loader);
    
    setTimeout(() => {
        loader.classList.add('fade-out');
        setTimeout(() => {
            loader.remove();
        }, 200);
    }, 300);
});
