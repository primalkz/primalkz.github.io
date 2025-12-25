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
        indexContainer.innerHTML = latestPosts.map(post => `
            <article class="blog-preview">
                <h2><a href="${post.url}">${post.title}</a></h2>
                <p class="blog-meta">${this.formatDate(post.date)} • ${post.keywords}</p>
                <p class="blog-preview-text">${post.preview}...</p>
                <a href="${post.url}" class="read-more">Read more</a>
            </article>
        `).join('');
    }

    renderArchive() {
        const archiveContainer = document.getElementById('archive-posts');
        if (!archiveContainer) return;
        archiveContainer.innerHTML = this.posts.map(post => `
            <article class="archive-item">
                <h2><a href="${post.url}">${post.title}</a></h2>
                <p class="blog-meta">${this.formatDate(post.date)} • ${post.keywords}</p>
                <p class="blog-preview-text">${post.preview}...</p>
            </article>
        `).join('');
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
}

document.addEventListener('DOMContentLoaded', () => {
    new BlogGenerator();
});
