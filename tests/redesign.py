import re
import os
import csv
import io
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

BASE=os.environ.get('DISCRETELAB_TEST_URL','http://127.0.0.1:5180')
LABS=[('tasks','Task planner'),('courses','Course eligibility'),('home','Smart home'),('scholarship','Scholarship'),('fault','Fault detection')]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    context=browser.new_context(viewport={'width':1440,'height':1050},permissions=['clipboard-read','clipboard-write'])
    page=context.new_page()
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('console',lambda message:errors.append(message.text) if message.type in ['error','warning'] else None)
    page.goto(BASE)
    page.wait_for_load_state('networkidle')
    expect(page.locator('html')).to_have_attribute('data-theme','dark')
    expect(page.get_by_role('heading',name='DiscreteLab.',exact=True)).to_be_visible()
    page.get_by_role('button',name='b = 0',exact=True).click()
    expect(page.get_by_role('button',name='b = 1',exact=True)).to_have_attribute('aria-pressed','true')
    page.screenshot(path='tests/overview-dark.png',full_page=True)
    page.get_by_role('link',name='Task planner',exact=True).click()
    expect(page.get_by_role('heading',name='Task dependency analysis')).to_be_focused()
    page.get_by_role('button',name='Gantt chart',exact=True).click()
    expect(page.locator('.gantt-bar')).to_have_count(5)
    page.locator('.gantt-bar').nth(1).click()
    expect(page.get_by_label('Name',exact=True)).to_have_value('Build backend')
    page.get_by_label('Duration (units)').fill('3')
    expect(page.locator('.stats')).to_contain_text('6')
    page.get_by_label('Duration (units)').blur()
    page.keyboard.press('Control+z')
    expect(page.get_by_label('Duration (units)')).to_have_value('1')
    page.keyboard.press('Control+y')
    expect(page.get_by_label('Duration (units)')).to_have_value('3')
    page.keyboard.press('2')
    expect(page).to_have_url(BASE+'/courses')
    expect(page.locator('.semester-edge')).not_to_have_count(0)
    page.go_back()
    expect(page).to_have_url(BASE+'/tasks')
    page.go_forward()
    expect(page).to_have_url(BASE+'/courses')
    page.get_by_role('button',name='Keyboard shortcuts',exact=True).click()
    expect(page.get_by_role('dialog')).to_be_visible()
    page.keyboard.press('Escape')
    expect(page.get_by_role('dialog')).not_to_be_visible()
    print('PASS landing lattice, routing, focus, back/forward, Gantt, timeline, keyboard undo/redo')
    page.goto(BASE+'/scholarship')
    page.wait_for_load_state('networkidle')
    expect(page.locator('.katex')).not_to_have_count(0)
    expect(page.locator('.kmap-grid>button')).to_have_count(16)
    before=page.get_by_label('CGPA',exact=True).input_value()
    page.locator('.kmap-grid>button').last.click()
    expect(page.get_by_label('CGPA',exact=True)).to_have_value(before)
    page.get_by_label('CGPA',exact=True).fill('9.1')
    page.locator('.export-controls summary').click()
    page.get_by_role('button',name='Copy scenario link',exact=True).click()
    expect(page.locator('.export-controls [role=status]')).to_contain_text('Share link copied')
    shared=page.evaluate('navigator.clipboard.readText()')
    assert '?scenario=' in shared
    other=context.new_page()
    other.goto(shared)
    expect(other.get_by_label('CGPA',exact=True)).to_have_value('9.1')
    other.close()
    page.goto(BASE+'/home')
    page.wait_for_load_state('networkidle')
    expect(page.locator('.wire.active')).not_to_have_count(0)
    expect(page.locator('.signal-dot')).not_to_have_count(0)
    page.get_by_text('Explore truth table (8 combinations)',exact=True).click()
    page.locator('.export-controls summary').click()
    for name,extension in [('Tables as CSV','csv'),('Diagram as SVG','svg'),('Diagram as PNG','png'),('Analysis as PDF','pdf')]:
        with page.expect_download(timeout=30000) as download_info:
            page.get_by_role('button',name=name,exact=True).click()
        download=download_info.value
        data=Path(download.path()).read_bytes()
        assert len(data)>100,(name,len(data))
        if extension=='csv':
            rows=list(csv.reader(io.StringIO(data.decode('utf-8-sig'))))
            assert len(rows)==9 and all(len(row)==4 for row in rows),rows
        elif extension=='svg': assert b'<svg' in data
        elif extension=='png': assert data[:8]==b'\x89PNG\r\n\x1a\n'
        elif extension=='pdf': assert data[:4]==b'%PDF'
        print('PASS export',extension,len(data),'bytes')
    print('PASS KaTeX, K-map inspection, share-link restoration, four real export formats')
    for theme in ['dark','light']:
        for width in [1440,390]:
            page.set_viewport_size({'width':width,'height':900})
            for route,label in [('','Overview')]+LABS:
                page.goto(BASE+'/'+route)
                page.wait_for_load_state('networkidle')
                actual=page.locator('html').get_attribute('data-theme')
                if actual!=theme:
                    page.get_by_role('button',name='Switch to '+theme+' mode',exact=True).click()
                expect(page.locator('html')).to_have_attribute('data-theme',theme)
                expect(page.locator('h1')).to_be_visible()
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'),(theme,width,route,'horizontal overflow')
                page.screenshot(path=f'tests/{theme}-{width}-{route or "overview"}.png',full_page=True)
            print('PASS theme/viewport matrix',theme,width)
    page.goto(BASE+'/missing-lab')
    expect(page.get_by_role('heading',name='This laboratory isn’t on the map.')).to_be_visible()
    page.goto(BASE+'/home?scenario=invalid!')
    expect(page.get_by_role('alert')).to_contain_text('not applied')
    expect(page.get_by_role('heading',name='Smart home automation')).to_be_visible()
    page.emulate_media(reduced_motion='reduce')
    expect(page.locator('.signal-dot')).to_have_count(0)
    page.set_viewport_size({'width':1440,'height':900})
    page.emulate_media(color_scheme='dark')
    page.get_by_role('button',name='Use system theme',exact=True).click()
    expect(page.locator('html')).to_have_attribute('data-theme','dark')
    page.emulate_media(color_scheme='light')
    expect(page.locator('html')).to_have_attribute('data-theme','light')
    assert not errors,errors
    print('PASS 404, invalid shared URLs, reduced motion, no console warnings/errors')
    isolated=context.new_page()
    isolated.route(re.compile(r'/src/modules/smart-home/SmartHome\.tsx(?:\?.*)?$|/assets/SmartHome-[^/]+\.js$'),lambda route:route.fulfill(status=200,content_type='application/javascript',body='export default function BrokenLab(){throw new Error("Controlled boundary test")}'))
    isolated.goto(BASE+'/home')
    expect(isolated.get_by_role('heading',name='This lab needs a restart')).to_be_visible()
    isolated.get_by_role('link',name='Task planner',exact=True).click()
    expect(isolated.get_by_role('heading',name='Task dependency analysis')).to_be_visible()
    isolated.close()
    print('PASS isolated module crash recovery and continued navigation')
    browser.close()
