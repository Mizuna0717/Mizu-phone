with open('js/home.js', 'r', encoding='utf-8', errors='replace') as f:
    js = f.read()
print('length:', len(js))
print('renderCollectWidget:', 'renderCollectWidget' in js)
print('editCollectImage:', 'editCollectImage' in js)
print('WEATHER WIDGET NEW section:', '// ========== WEATHER WIDGET (NEW) ==========' in js)
print('renderWeatherWidget:', 'renderWeatherWidget' in js)