class BlogGenerator {
    constructor() {
        this.posts = [];
        this.init();
    }

    async init() {
        await this.loadPosts();
        this.renderIndex();
        this.renderArchive();
    }

    async loadPosts() {
        const postsResponse = await fetch('./posts/');
        const postsHtml = await postsResponse.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(postsHtml, 'text/html');
        const links = doc.querySelectorAll('a[href$=".html"]');
        // console.log('Found links:', links.length);
        
        for (const link of links) {
            const href = link.getAttribute('href');
            // console.log('Processing href:', href);
            if (href !== '../') {
                const cleanHref = href.replace(/^\/posts\//, '');
                await this.loadPost(cleanHref);
            }
        }
        
        this.posts.sort((a, b) => {
            if (!a.date && !b.date) return 0;
            if (!a.date) return 1;
            if (!b.date) return -1;
            return new Date(b.date) - new Date(a.date);
        });
    }

    async loadPost(filename) {
        try {
            const url = `./posts/${filename}`;
            // console.log('Fetching post from:', url);
            const response = await fetch(url);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const title = doc.querySelector('meta[name="title"]')?.content || doc.querySelector('title')?.textContent || filename.replace('.html', '');
            const keywords = doc.querySelector('meta[name="keywords"]')?.content || 'blog';
            const preview = doc.querySelector('meta[name="preview"]')?.content || doc.querySelector('p')?.textContent?.slice(0, 150) || 'No preview available';
            const date = doc.querySelector('meta[name="date"]')?.content || doc.querySelector('p')?.textContent?.match(/\d{4}-\d{2}-\d{2}/)?.[0] || '2022-08-02';
            // console.log('Post data:', { title, keywords, preview, date });
            this.posts.push({filename, title, keywords, preview, date, url: url });
        } catch (error) {
            console.error(`Error:`, error);
        }
    }

    renderIndex() {
        const indexContainer = document.getElementById('blog-posts');
        if (!indexContainer) return;
        const latestPosts = this.posts.slice(0, 3);
        indexContainer.style.marginTop = '20px';
        indexContainer.innerHTML = `
            <div class="pin-grid">
                ${latestPosts.map(post => `<div class="pin-grid-item">${this.createPostCard(post)}</div>`).join('')}
            </div>
        `;
    }

    renderArchive() {
        const archiveContainer = document.getElementById('archive-posts');
        if (!archiveContainer) return;
        archiveContainer.style.marginTop = '20px';
        archiveContainer.innerHTML = `
            <div class="pin-grid">
                ${this.posts.map(post => `<div class="pin-grid-item">${this.createPostCard(post)}</div>`).join('')}
            </div>
        `;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    filterByKeyword(keyword) {
        return this.posts.filter(post => 
            post.keywords.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    createPostCard(post) {
        const previewLength = Math.floor(Math.random() * 100) + 80;
        const truncatedPreview = post.preview.length > previewLength 
            ? post.preview.slice(0, previewLength) + '...'
            : post.preview;
        
        return `
            <a href="${post.url}" class="post-card-link">
                <article class="post-card terminal-card">
                    <div class="terminal-content">
                        <div class="post-header">
                            <h2 class="post-title">
                                ${post.title}
                            </h2>
                            <div class="post-meta">
                                <span class="meta-date">${this.formatDate(post.date)}</span>
                                <span class="meta-separator">•</span>
                                <span class="meta-keywords">${post.keywords}</span>
                            </div>
                        </div>
                        <div class="post-preview">
                            <p>${truncatedPreview}</p>
                        </div>
                        <div class="post-actions">
                            <span class="terminal-prompt">$</span> Read more
                        </div>
                    </div>
                </article>
            </a>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BlogGenerator();
});
