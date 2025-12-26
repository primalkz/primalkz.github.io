#!/bin/bash

SCRIPT_DIR="$(pwd)"
source "$SCRIPT_DIR/config.env"

TIMESTAMP_FILE="$SCRIPT_DIR/.timestamps.json"

needs_update() {
    local md_file="$1"
    
    if [ ! -f "$TIMESTAMP_FILE" ]; then
        return 0
    fi
    
    local md_mtime=$(stat -c %y "$md_file" 2>/dev/null)
    local stored_mtime=$(jq -r --arg file "$md_file" '.[$file] // "null"' "$TIMESTAMP_FILE" 2>/dev/null)
    [ "$md_mtime" != "$stored_mtime" ]
}

update_timestamp() {
    local md_file="$1"
    local md_mtime=$(stat -c %y "$md_file" 2>/dev/null)
    
    if [ ! -f "$TIMESTAMP_FILE" ]; then
        echo "{}" > "$TIMESTAMP_FILE"
    fi
    
    jq --arg file "$md_file" --arg time "$md_mtime" '.[$file] = $time' "$TIMESTAMP_FILE" > "${TIMESTAMP_FILE}.tmp" && mv "${TIMESTAMP_FILE}.tmp" "$TIMESTAMP_FILE"
}

update_index() {
    local md_file="md/index.md"
    local html_file="index.html"
    
    if ! needs_update "$md_file"; then
        echo "Index page is up to date"
        return 0
    fi
    
    if [ ! -f "$md_file" ]; then
        echo "Warning: $md_file not found, skipping index update"
        return 1
    fi
    echo "Updating index page..."
    
    local intro_content
    if command -v pandoc >/dev/null 2>&1; then
        intro_content=$(pandoc --from markdown --to html --wrap=preserve "$md_file" 2>/dev/null)
    else
        intro_content=$(sed 's/$/<br>/' "$md_file" | sed 's/^#\+ \(.*\)/<h\1>\1<\/h\1>/' | sed 's/\*\*\([^*]*\)\*\*/<strong>\1<\/strong>/g' | sed 's/\*([^*]*)\*/<em>\1<\/em>/g')
    fi
    
    if [ -z "$intro_content" ]; then
        intro_content="<p>$DESCRIPTION</p>"
    fi
    
    local temp_file=$(mktemp)
    
    cat > "$temp_file" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <script src="./js/include.js"></script>
  <div include-html="./head.html"></div>
  <title>Home - $NAME</title>
</head>
<body class="bg">
  <div class="box">
  <div include-html="./header.html"></div>
  <div class="contain">
  <div class="main-content">
  <div class="out">
  <br>
	$intro_content
  </div>
  <hr>
  <h1><strong>POSTS</strong></h1>

  <div id="blog-posts">
  </div>
  <script src="./js/blog-generator.js"></script>
</div>
<div include-html="./social.html"></div>
</div>
</div>
<div include-html="./footer.html"></div>
</body>
</html>
EOF
    mv "$temp_file" "$html_file"
    update_timestamp "$md_file"
    echo "Index page updated successfully"
}

update_about() {
    local md_file="md/about.md"
    local html_file="about.html"
    
    if ! needs_update "$md_file"; then
        echo "About page is up to date"
        return 0
    fi
    if [ ! -f "$md_file" ]; then
        echo "Warning: $md_file not found, skipping about update"
        return 1
    fi
    echo "Updating about page..."
    
    local about_content
    if command -v pandoc >/dev/null 2>&1; then
        about_content=$(pandoc --from markdown --to html --wrap=preserve "$md_file" 2>/dev/null)
    else
        about_content=$(sed 's/$/<br>/' "$md_file" | sed 's/^#\+ \(.*\)/<h\1>\1<\/h\1>/' | sed 's/\*\*\([^*]*\)\*\*/<strong>\1<\/strong>/g' | sed 's/\*([^*]*)\*/<em>\1<\/em>/g')
    fi
    
    if [ -z "$about_content" ]; then
        echo "Warning: Failed to convert $md_file, using default content"
        return 1
    fi
    local temp_file=$(mktemp)
    
    cat > "$temp_file" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <script src="./js/include.js"></script>
  <div include-html="./head.html"></div>
  <title>About - $NAME</title>
</head>
<body class="bg">
  <div class="box">
  <div include-html="./header.html"></div>
  <div class="contain">
  <div class="main-content">
  <h1><strong>ABOUT ME</strong></h1>
  
  <article>
$about_content
</article>
</div>
<div include-html="./social.html"></div>
</div>
</div>
<div include-html="./footer.html"></div>
</body>
</html>
EOF
    
    mv "$temp_file" "$html_file"
    update_timestamp "$md_file"
    echo "About page updated successfully"
}

update_social() {
    local social_file="social.html"
    
    if [ ! -f "$social_file" ]; then
        echo "Warning: $social_file not found, skipping social links update"
        return 1
    fi
    echo "Updating social links..."
    
    local temp_file=$(mktemp)
    
    cat > "$temp_file" << EOF
<div class="social-sidebar">
<div class="social">
  <img src="/img/click.gif" alt="Click gif" style="width: 5vw; height: auto; margin-bottom: 10px; display: block; margin-left: 5px; margin-right: auto;" class="desktop-gif">
  <a href="$GITHUB" target="_blank"><i class="fab fa-github"></i></a>
  <a href="$INSTAGRAM" target="_blank"><i class="fab fa-instagram"></i></a>
  <a href="$YOUTUBE_MAIN" target="_blank"><i class="fab fa-youtube"></i></a>
  <a href="https://t.me/deadguy64" target="_blank"><i class="fab fa-telegram"></i></a>
  <a href="./key.html"><i class="fas fa-key"></i></a>
  <a href="mailto:$EMAIL"><i class="fas fa-envelope"></i></a>
</div>
</div>
EOF
    
    mv "$temp_file" "$social_file"
    update_timestamp "$social_file"
    echo "Social links updated successfully"
}

update_posts() {
    local posts_dir="md/posts"
    local output_dir="posts"
    
    if [ ! -d "$posts_dir" ]; then
        echo "Warning: $posts_dir directory not found, skipping posts update"
        return 1
    fi
    echo "Checking posts for updates..."
    mkdir -p "$output_dir"
    
    for md_file in "$posts_dir"/*.md; do
        [ -f "$md_file" ] || continue
        
        local basename=$(basename "$md_file" .md)
        local html_file="$output_dir/$basename.html"
        
        if ! needs_update "$md_file"; then
            echo "Post $basename is up to date"
            continue
        fi
        
        echo "Updating post: $basename"
        
        local title=$(grep -m 1 'title:' "$md_file" | sed 's/.*title: *"\(.*\)".*/\1/' | sed 's/^ *"//;s/" *$//')
        if [ -z "$title" ]; then
            title=$(head -n 10 "$md_file" | grep "^# " | head -n 1 | sed 's/^# //')
        fi
        if [ -z "$title" ]; then
            title=$(echo "$basename" | sed 's/_/ /g')
        fi
        
        local keywords=$(grep -m 1 'keywords:' "$md_file" | sed 's/.*keywords: *\[\(.*\)\].*/\1/' | sed 's/"//g; s/, /, /g')
        if [ -z "$keywords" ]; then
            keywords="blog, $basename"
        fi
        
        if ./convert.sh "$md_file" "$title" "$keywords" "$html_file"; then
            echo "Successfully updated post: $basename"
            update_timestamp "$md_file"
        else
            echo "Error updating post: $basename"
        fi
    done
}

update_posts_index() {
    local posts_dir="posts"
    local index_file="$posts_dir/index.html"
    
    echo "Updating posts index..."
    
    {
        echo '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog Posts</title>
</head>
<body>
    <ul>'
        
        for html_file in "$posts_dir"/*.html; do
            [ -f "$html_file" ] || continue
            local basename=$(basename "$html_file" .html)
            [ "$basename" = "index" ] || echo "        <li><a href=\"$basename.html\">$basename.html</a></li>"
        done
        
        echo '    </ul>
</body>
</html>'
    } > "$index_file"
    
    echo "Posts index updated successfully"
}

update_footer() {
    local footer_file="footer.html"
    if [ ! -f "$footer_file" ]; then
        echo "Warning: $footer_file not found, skipping footer update"
        return 1
    fi
    echo "Updating footer..."
    local temp_file=$(mktemp)
    cat > "$temp_file" << EOF
<footer>
  <div class="last">		
    <p><i class="fa fa-copyright fa-flip-horizontal"></i> <span id="current-year">2022</span> $NAME <3</p>
  </div>
</footer>
EOF
    mv "$temp_file" "$footer_file"
    update_timestamp "$footer_file"
    echo "Footer updated successfully"
}

echo "Starting site update..."
echo "Using configuration: NAME=$NAME"

update_index
update_about
update_posts
update_posts_index
update_social
update_footer

echo "Site update complete!"
