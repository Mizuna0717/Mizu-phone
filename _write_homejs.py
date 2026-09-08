content = open('_homejs_content.txt', 'r', encoding='utf-8').read()
with open('js/home.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('written', len(content), 'chars')