import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
BASE=os.environ.get('DISCRETELAB_TEST_URL','http://127.0.0.1:5180')
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1440,'height':1050})
    errors=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.goto(BASE+'/scholarship')
    cell=page.locator('.kmap-grid button[aria-label="A=1, B=1, C=1, D=0, output 1"]')
    cell.click()
    expect(page.get_by_label('CGPA',exact=True)).to_have_value('8.4')
    page.get_by_role('button',name='Apply combination to scenario',exact=True).click()
    expect(page.get_by_label('CGPA',exact=True)).to_have_value('8.5')
    expect(page.locator('.banner')).to_contain_text('Eligible under')
    page.get_by_label('Minimum CGPA',exact=True).fill('0')
    page.locator('.kmap-grid button').first.click()
    page.get_by_role('button',name='Apply combination to scenario',exact=True).click()
    expect(page.get_by_role('alert')).to_contain_text('cannot be represented')
    expect(page.get_by_label('CGPA',exact=True)).to_have_value('8.5')
    page.goto(BASE+'/fault')
    page.locator('.kmap-grid button[aria-label="T=1, V=0, C=1, output 1"]').click()
    page.get_by_role('button',name='Apply combination to scenario',exact=True).click()
    expect(page.get_by_label('Machine temperature (°C)',exact=True)).to_have_value('81')
    expect(page.get_by_label('Vibration (mm/s)',exact=True)).to_have_value('10')
    expect(page.locator('.banner')).to_contain_text('FAULT DETECTED')
    page.locator('.kmap-grid button').first.click()
    page.get_by_role('button',name='Apply combination to scenario',exact=True).click()
    expect(page.locator('.banner')).to_contain_text('NORMAL')
    expect(page.get_by_text('Fault cleared',exact=True)).to_be_visible()
    page.locator('.export-controls summary').click()
    with page.expect_download() as info:
        page.get_by_role('button',name='Analysis as PDF',exact=True).click()
    info.value.save_as('tests/editorial-report.pdf')
    assert Path('tests/editorial-report.pdf').read_bytes().startswith(b'%PDF')
    assert not errors,errors
    print('PASS K-map inspection/apply, impossible threshold handling, sensor transitions and editorial report download')
    browser.close()
