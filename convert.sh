#!/bin/bash
# Usage: ./convert.sh input.md "Post Title" "keywords" output.html

if [ $# -ne 4 ]; then
    echo "Usage: $0 <markdown-file> <title> <keywords> <output-file>"
    exit 1
fi

input_file="$1"
title="$2"
keywords="$3"
output_file="$4"

mod_time=$(stat -c %y "$input_file" | cut -d' ' -f1,2 | cut -d'.' -f1)
preview=$(head -n 5 "$input_file" | sed '/^#/d' | sed '/^$/d' | head -n 2 | tr '\n' ' ' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | cut -c1-150)
main_title=$(head -n 5 "$input_file" | grep "^# " | head -n 1 | sed 's/^# //')
html_content=$(tail -n +2 "$input_file" | pandoc --from markdown --to html --wrap=preserve)

cat > "$output_file" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <script src="../js/include.js"></script>
  <div include-html="../head.html"></div>

<title>$title</title>
<meta property="og:title" content="$title" />
<meta property="og:description" content="$title" />
<meta property="og:type" content="article" />
<meta property="og:url" content="/posts/${output_file}" />
<meta property="og:image" content="https://primalkz.github.io" />
<meta name="keywords" content="$keywords" />
<meta name="title" content="$title" />
<meta name="preview" content="$preview" />
<meta name="date" content="$mod_time" />

</head>
<body class="bg">
  <div class="box">
  <div include-html="../header.html"></div>
  <div class="contain">
  <div class="main-content">
  <div class="out">
  </div>
  <h1><strong>$main_title</strong></h1>
  <p style="color: #9494d3; font-size: 0.9em; margin-bottom: 15px;">Last modified: $mod_time</p>

  <article>
$html_content
</article>
</div>
<div include-html="../social.html"></div>
</div>
</div>
<div include-html="../footer.html"></div>
</body>
</html>
EOF

echo "Converted $input_file to $output_file"