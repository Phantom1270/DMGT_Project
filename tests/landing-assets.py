"""Capture authentic sample views; never read or alter the user's browser state."""
import io
import json
import os
import subprocess
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get('DISCRETELAB_TEST_URL', 'http://127.0.0.1:5180')
DEST = Path('public/images/landing')
DEST.mkdir(parents=True, exist_ok=True)
OUT = Path('.tmp/atlas')
OUT.mkdir(parents=True, exist_ok=True)
revision = subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip()
fixtures = [
    ('tasks-graph', 'tasks', '.flow-canvas', {'durations': [1,1,1,1,1], 'duration': 4}),
    ('tasks-gantt', 'tasks', '.gantt-chart', {'durations': [1,1,1,1,1], 'duration': 4, 'frontendSlack': 1}),
    ('courses-timeline', 'courses', '.semester-timeline', {'target': 'l', 'capacity': 3, 'completed': []}),
    ('home-circuit', 'home', '.circuit', {'brightness': 20, 'temperature': 30, 'presence': True, 'manual': False}),
    ('scholarship-policy', 'scholarship', '.circuit', {'cgpa': 8.4, 'income': 300000, 'attendance': 75, 'achievement': False, 'policy': 'balanced'}),
    ('fault-equivalence', 'fault', '.table-scroll', {'temperature': 95, 'vibration': 12, 'cooling': True, 'limits': [80,10]}),
]
manifest = {'captureRevision': revision, 'source': BASE, 'assets': []}
contact = []
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    for theme in ['dark', 'light']:
        for stem, route, selector, values in fixtures:
            context = browser.new_context(viewport={'width': 1440, 'height': 1100}, device_scale_factor=2, reduced_motion='reduce')
            context.add_init_script(f"localStorage.setItem('discretelab-theme', '{theme}')")
            page = context.new_page()
            page.goto(BASE + '/' + route)
            page.wait_for_load_state('networkidle')
            expect(page.locator('html')).to_have_attribute('data-theme', theme)
            if stem == 'tasks-gantt':
                page.get_by_role('button', name='Gantt chart', exact=True).click()
            if stem == 'fault-equivalence':
                target = page.locator('.panel').filter(has=page.get_by_role('heading', name='Exhaustive equivalence', exact=True)).locator(selector)
                expect(target.locator('tbody tr')).to_have_count(8)
            else:
                target = page.locator(selector).first
            page.add_style_tag(content='.react-flow__controls,.react-flow__minimap{visibility:hidden!important}.semester-scroll{overflow:visible!important}')
            target.scroll_into_view_if_needed()
            page.wait_for_timeout(350)
            box = target.bounding_box()
            raw = Image.open(io.BytesIO(target.screenshot(animations='disabled'))).convert('RGB')
            crop = [0, 0, raw.width, raw.height]
            if stem == 'tasks-graph':
                nodes = [node.bounding_box() for node in page.locator('.react-flow__node').all()]
                crop = [max(0, int((min(n['x'] for n in nodes)-box['x']-24)*2)),
                        max(0, int((min(n['y'] for n in nodes)-box['y']-24)*2)),
                        min(raw.width, int((max(n['x']+n['width'] for n in nodes)-box['x']+24)*2)),
                        min(raw.height, int((max(n['y']+n['height'] for n in nodes)-box['y']+24)*2))]
                raw = raw.crop(crop)
            # Preserve the full real view and its aspect ratio; no invented pixels/data.
            sizes = {}
            for width in [640, 1280]:
                image = raw.resize((width, round(raw.height*width/raw.width)), Image.Resampling.LANCZOS)
                path = DEST / f'{stem}-{theme}-{width}.webp'
                image.save(path, 'WEBP', quality=88, method=6)
                sizes[str(width)] = {'width': image.width, 'height': image.height, 'bytes': path.stat().st_size}
            manifest['assets'].append({'stem': stem, 'theme': theme, 'route': '/'+route, 'inputs': values, 'cssBounds': box, 'pixelCrop': crop, 'sizes': sizes})
            thumb = ImageOps.contain(raw, (440, 290))
            tile = Image.new('RGB', (480, 340), '#ede8df')
            tile.paste(thumb, ((480-thumb.width)//2, 35))
            ImageDraw.Draw(tile).text((15, 12), f'{theme} / {stem}', fill='#211c18')
            contact.append(tile)
            print('CAPTURE', stem, theme, sizes['1280'])
            context.close()
    browser.close()
sheet = Image.new('RGB', (1440, 1360), '#ede8df')
for i, tile in enumerate(contact):
    sheet.paste(tile, ((i % 3)*480, (i//3)*340))
sheet.save(OUT / 'asset-contact.png')
(DEST / 'manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
assert len(manifest['assets']) == 12
print('Saved 24 responsive assets and capture manifest')
