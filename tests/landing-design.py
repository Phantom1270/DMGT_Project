"""Proof Atlas behavior and visual acceptance checks against a running build."""
import argparse
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

parser = argparse.ArgumentParser()
parser.add_argument('--stage', choices=['static', 'chrome', 'full'], default='full')
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
                    assert f'-{theme}-' in image.get_attribute('src')
                page.evaluate('scrollTo(0, 0)')
                page.screenshot(path=str(OUT / f'{theme}-{width}-{height}.png'), full_page=True)
        assert not errors, errors
        print('PASS two themes, six viewports, authentic plates and no runtime errors')
    browser.close()
