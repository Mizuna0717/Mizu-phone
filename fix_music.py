import re

with open('screens/home.html', 'r', encoding='utf-8') as f:
    content = f.read()

old = '''						<div class="music-widget">
							<div class="mw-cover" onclick="document.getElementById('musicCoverInput').click()">
								<img id="musicCoverImg" style="display:none">
								<button class="mw-cover-edit"><svg viewBox="0 0 10 10"><path d="M7 1l2 2M1 7V9h2L8 4 6 2 1 7z"/></svg></button>
								<input type="file" id="musicCoverInput" accept="image/*" onchange="setMusicCover(this)" style="display:none">
							</div>
							<div class="mw-info">
								<div class="mw-song" id="musicSong" onclick="editMusicInfo('song')">Song Title</div>
								<div class="mw-artist" id="musicArtist" onclick="editMusicInfo('artist')">Artist</div>
							</div>
							<div class="mw-controls">
								<svg viewBox="0 0 18 18"><path d="M13 3l-8 6 8 6V3z"/><path d="M4 3v12"/></svg>
								<svg viewBox="0 0 18 18"><rect x="3" y="3" width="4" height="12" rx="1"/><rect x="11" y="3" width="4" height="12" rx="1"/></svg>
								<svg viewBox="0 0 18 18"><path d="M5 3l8 6-8 6V3z"/><path d="M14 3v12"/></svg>
							</div>
							<div class="mw-progress"><div class="mw-progress-bar"></div><div class="mw-progress-dot"></div></div>
						</div>'''

new = '''						<div class="music-widget">
							<div class="mw-header">
								<div class="mw-header-text">
									<div class="mw-song" id="musicSong" onclick="editMusicInfo('song')">Collect,</div>
									<div class="mw-artist" id="musicArtist" onclick="editMusicInfo('artist')">My album.</div>
								</div>
								<div class="mw-next-btn">
									<svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
								</div>
							</div>
							<div class="mw-disc-area">
								<div class="mw-disc-bg"></div>
								<div class="mw-cover" onclick="document.getElementById('musicCoverInput').click()">
									<img id="musicCoverImg" style="display:none">
									<div class="mw-cover-ph" id="musicCoverPh">
										<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
									</div>
									<input type="file" id="musicCoverInput" accept="image/*" onchange="setMusicCover(this)" style="display:none">
								</div>
							</div>
						</div>'''

if old in content:
    content = content.replace(old, new)
    with open('screens/home.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print('SUCCESS: music widget replaced')
else:
    print('NOT FOUND: could not locate old music widget block')
    # Print surrounding context to debug
    idx = content.find('music-widget')
    if idx >= 0:
        print('Found music-widget at index', idx)
        print(repr(content[idx:idx+200]))