#!/bin/zsh
cd "$(dirname "$0")"
echo "한국 아마추어 카누 클럽: http://localhost:5174"
python3 -m http.server 5174
