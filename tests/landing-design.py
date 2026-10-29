"""Proof Atlas behavior and visual acceptance checks against a running build."""
import argparse
import os
import re
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

parser = argparse.ArgumentParser()
parser.add_argument('--stage', choices=['static', 'chrome', 'motion', 'full'], default='full')
args = parser.parse_args()
BASE = os.environ.get('DISCRETELAB_TEST_URL', 'http://127.0.0.1:5182')
LABS = ['tasks', 'courses', 'home', 'scholarship', 'fault']
OUT = Path('.tmp/atlas/screens')
OUT.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1440, 'height': 900})
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(BASE)
    page.wait_for_load_state('networkidle')
    for a, b, subset in [(0, 0, '∅'), (0, 1, '{b}'), (1, 0, '{a}'), (1, 1, '{a, b}')]:
        for i, value in enumerate([a, b]):
            button = page.locator('.lattice-controls button').nth(i)
            if button.get_attribute('aria-pressed') != str(bool(value)).lower():
                button.click()
        expect(page.locator('.lattice-point.active text')).to_have_text(subset)
        expect(page.locator('.lattice-controls [aria-live]')).to_contain_text(f'a ∧ b = {a and b}')
        expect(page.locator('.lattice-controls [aria-live]')).to_contain_text(f'a ∨ b = {a or b}')
    for i in range(10):
        page.locator('.lattice-controls button').nth(i % 2).click()
    expect(page.locator('.lattice-point.active text')).to_have_text('∅')
    for lab in LABS:
        assert page.locator(f'.lab-catalog a[href="/{lab}"]').count() >= 1
    assert page.locator('h1').count() == 1
    for button in page.locator('.lattice-controls button').all():
        box = button.bounding_box()
        assert box['height'] >= 44 and box['width'] >= 44, f'Input target too small: {box}'
    print('PASS all lattice states, rapid input, semantic results, catalog routes and touch targets')

    if args.stage != 'static':
        page.set_viewport_size({'width': 390, 'height': 844})
        for label in ['Overview', 'Task planner', 'Course eligibility', 'Smart home', 'Scholarship', 'Fault detection']:
            link = page.get_by_role('navigation').get_by_role('link', name=label, exact=True)
            expect(link.locator('span').last).to_be_visible()
        expect(page.get_by_role('button', name='Use system theme', exact=True)).to_be_visible()
        page.locator('h1').focus()
        page.keyboard.press('Space')
        page.wait_for_timeout(350)
        assert page.evaluate('scrollY') > 50, 'Space must scroll the overview'
        page.keyboard.press('1')
        expect(page).to_have_url(BASE + '/tasks')
        expect(page.locator('h1')).to_be_focused()
        page.go_back()
        expect(page).to_have_url(BASE + '/')
        print('PASS named phone navigation, system theme, native Space, shortcuts and route focus')

    if args.stage == 'full':
        for theme in ['dark', 'light']:
            for width, height in [(1440, 900), (1440, 768), (768, 1024), (390, 844), (375, 812), (320, 800)]:
                page.set_viewport_size({'width': width, 'height': height})
                page.goto(BASE)
                if page.locator('html').get_attribute('data-theme') != theme:
                    page.get_by_role('button', name=f'Switch to {theme} mode', exact=True).click()
                page.wait_for_timeout(450)
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (theme, width, 'overflow')
                for image in page.locator('.atlas img').all():
                    image.scroll_into_view_if_needed()
                    expect(image).to_have_js_property('complete', True)
                    assert image.evaluate('(image) => image.naturalWidth') > 0
                    image.evaluate('(image) => image.decode()')
                    assert f'-{theme}-' in image.get_attribute('src')
                page.evaluate('scrollTo(0, 0)')
                page.wait_for_timeout(400)
                page.screenshot(path=str(OUT / f'{theme}-{width}-{height}.png'), full_page=True)
        page.set_viewport_size({'width': 320, 'height': 900})
        page.goto(BASE)
        page.add_style_tag(content='html {font-size:200%!important}')
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), '200% text overflow'
        page.screenshot(path=str(OUT/'text-zoom.png'), full_page=True)
        page.goto(BASE+'/fault')
        page.locator('h1').focus()
        page.keyboard.press('Space')
        expect(page.get_by_role('button', name='Pause simulation', exact=True)).to_be_enabled()
        page.keyboard.press('Space')
        expect(page.get_by_role('button', name='Start simulation', exact=True)).to_be_enabled()
        assert not errors, errors
        missing = browser.new_page(viewport={'width':390,'height':844})
        missing.route('**/images/landing/*', lambda route: route.abort())
        missing.goto(BASE)
        for figure in missing.locator('.atlas-figure').all():
            figure.scroll_into_view_if_needed()
            expect(figure.get_by_text('Sample view unavailable.', exact=True)).to_be_visible()
            expect(figure.locator('figcaption')).not_to_be_empty()
        for lab in LABS:
            assert missing.locator(f'.lab-catalog a[href="/{lab}"]').count() >= 1
        assert missing.evaluate('document.documentElement.scrollWidth <= innerWidth')
        missing.close()
        print('PASS two themes, six viewports, authentic plates and no runtime errors')

    if args.stage in ['motion', 'full']:
        motion_context = browser.new_context(viewport={'width':1440,'height':900})
        motion = motion_context.new_page()
        motion.goto(BASE)
        scene = motion.locator('.atlas-task-proof')
        expect(scene).to_have_attribute('data-enhanced', 'true', timeout=10000)
        top = scene.evaluate('(element)=>element.getBoundingClientRect().top+scrollY')-96
        for progress in [0,.25,.5,.75,1]:
            motion.evaluate('(y)=>scrollTo(0,y)', top+240*progress)
            motion.wait_for_timeout(150)
            assert motion.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Enhanced scene overflow'
            if progress == 1:
                assert float(motion.locator('.atlas-task-gantt').evaluate('(e)=>getComputedStyle(e).opacity')) > .99
            motion.screenshot(path=str(OUT/f'scene-{progress}.png'))
        motion.emulate_media(reduced_motion='reduce')
        expect(scene).not_to_have_attribute('data-enhanced','true')
        expect(motion.locator('.atlas-task-graph img')).to_be_visible()
        expect(motion.locator('.atlas-task-gantt img')).to_be_visible()
        motion_context.close()
        delayed = browser.new_page(viewport={'width':1440,'height':900})
        async_errors = []
        delayed.on('pageerror', lambda error: async_errors.append(str(error)))
        def delay_module(route):
            response = route.fetch()
            route.fulfill(response=response, body='await new Promise(resolve=>setTimeout(resolve,1200));\n'+response.text())
        delayed.route(re.compile(r'/assets/taskProofMotion-[^/]+\.js'), delay_module)
        delayed.goto(BASE, wait_until='domcontentloaded')
        delayed.get_by_role('link', name='Enter the laboratory', exact=True).click()
        expect(delayed.locator('h1')).to_have_text('Task dependency analysis')
        delayed.wait_for_timeout(1500)
        assert delayed.locator('.atlas-scene-enhanced').count() == 0
        assert not async_errors, async_errors
        delayed.close()
        for mode in ['reduced','blocked','short']:
            fallback = browser.new_context(viewport={'width':1440,'height':768 if mode=='short' else 900}, reduced_motion='reduce' if mode=='reduced' else 'no-preference')
            check = fallback.new_page()
            if mode == 'blocked':
                check.route(re.compile(r'/assets/taskProofMotion-[^/]+\.js'), lambda route: route.abort())
            check.goto(BASE)
            check.wait_for_load_state('networkidle')
            expect(check.locator('.atlas-task-proof')).not_to_have_attribute('data-enhanced','true')
            for selector in ['.atlas-task-graph img','.atlas-task-gantt img']:
                expect(check.locator(selector)).to_be_visible()
            fallback.close()
        print('PASS scroll progression, dynamic reduced motion, blocked chunk and short-screen fallback')
    browser.close()
