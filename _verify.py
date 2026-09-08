with open('screens/home.html', 'r', encoding='utf-8') as f:
    h = f.read()
print('collectWidget:', 'collectWidget' in h)
print('weather-widget:', 'weather-widget' in h)
print('cw2-top:', 'cw2-top' in h)
print('cwTitle:', 'cwTitle' in h)

with open('css/home.css', 'r', encoding='utf-8') as f:
    c = f.read()
print('collect-widget css:', 'collect-widget' in c)
print('cw2-circle:', 'cw2-circle' in c)
print('weather-widget css:', 'weather-widget' in c)

with open('js/home.js', 'r', encoding='utf-8') as f:
    j = f.read()
print('renderCollectWidget js:', 'renderCollectWidget' in j)
print('editCollectImage js:', 'editCollectImage' in j)
print('length:', len(j))