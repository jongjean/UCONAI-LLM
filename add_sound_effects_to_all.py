#!/usr/bin/env python3
"""
모든 HTML 파일에 sound-effects.js 스크립트를 추가하는 스크립트
"""

import os
import re
from pathlib import Path

def add_sound_effects_script(file_path, relative_path='../../'):
    """HTML 파일에 sound-effects.js 스크립트 추가"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 이미 sound-effects.js가 있는지 확인
        if 'sound-effects.js' in content:
            print(f'⏭️  이미 추가됨: {file_path}')
            return False
        
        # main.js 스크립트 태그 찾기
        main_js_pattern = r'<script src="([\.\/]*js/main\.js)"></script>'
        match = re.search(main_js_pattern, content)
        
        if not match:
            print(f'⚠️  main.js를 찾을 수 없음: {file_path}')
            return False
        
        # main.js 경로 추출
        main_js_path = match.group(1)
        sound_js_path = main_js_path.replace('main.js', 'sound-effects.js')
        
        # main.js 앞에 sound-effects.js 추가
        old_string = f'<script src="{main_js_path}"></script>'
        new_string = f'<script src="{sound_js_path}"></script>\n<script src="{main_js_path}"></script>'
        
        new_content = content.replace(old_string, new_string, 1)
        
        if new_content == content:
            print(f'⚠️  변경되지 않음: {file_path}')
            return False
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f'✅ 업데이트 완료: {file_path}')
        return True
        
    except Exception as e:
        print(f'❌ 오류 발생 ({file_path}): {e}')
        return False

def main():
    """모든 HTML 파일 업데이트"""
    root_dir = Path('.')
    html_files = list(root_dir.rglob('*.html'))
    
    # 제외할 파일들
    exclude_patterns = [
        'sidebar-demo.html',
        'menu-test.html',
        'test-menu.html',
        'DROPDOWN_MENU_TEMPLATE.html'
    ]
    
    updated_count = 0
    skipped_count = 0
    error_count = 0
    
    print('🔊 모든 HTML 파일에 sound-effects.js 추가 중...\n')
    
    for html_file in html_files:
        # 제외 패턴 확인
        if any(pattern in str(html_file) for pattern in exclude_patterns):
            print(f'⏭️  제외됨: {html_file}')
            skipped_count += 1
            continue
        
        result = add_sound_effects_script(html_file)
        if result:
            updated_count += 1
        elif 'sound-effects.js' in open(html_file, 'r', encoding='utf-8').read():
            skipped_count += 1
        else:
            error_count += 1
    
    print(f'\n' + '='*60)
    print(f'📊 작업 완료 통계')
    print(f'='*60)
    print(f'✅ 업데이트 완료: {updated_count}개')
    print(f'⏭️  건너뜀 (이미 추가됨): {skipped_count}개')
    print(f'❌ 오류: {error_count}개')
    print(f'📁 전체 파일: {len(html_files)}개')
    print(f'='*60)

if __name__ == '__main__':
    main()
