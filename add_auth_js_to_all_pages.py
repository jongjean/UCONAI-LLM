#!/usr/bin/env python3
"""
모든 서브페이지에 auth.js 추가
"""
import os
import re

def add_auth_js_to_file(file_path):
    """HTML 파일에 auth.js 스크립트 태그 추가"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 이미 auth.js가 있는지 확인
        if 'auth.js' in content:
            return False, 'already exists'
        
        # main.js를 찾아서 그 앞에 auth.js 추가
        # 패턴 1: <script src="../../js/main.js"></script>
        pattern1 = r'(<script src="\.\.\/\.\.\/js\/main\.js"><\/script>)'
        if re.search(pattern1, content):
            replacement = '<script src="../../js/auth.js"></script>\n    \\1'
            new_content = re.sub(pattern1, replacement, content)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True, 'pattern1'
        
        # 패턴 2: <script src="../js/main.js"></script> (1단계 상위)
        pattern2 = r'(<script src="\.\.\/js\/main\.js"><\/script>)'
        if re.search(pattern2, content):
            replacement = '<script src="../js/auth.js"></script>\n    \\1'
            new_content = re.sub(pattern2, replacement, content)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True, 'pattern2'
        
        # 패턴 3: <script src="js/main.js"></script> (같은 레벨)
        pattern3 = r'(<script src="js\/main\.js"><\/script>)'
        if re.search(pattern3, content):
            replacement = '<script src="js/auth.js"></script>\n    \\1'
            new_content = re.sub(pattern3, replacement, content)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True, 'pattern3'
        
        return False, 'no main.js found'
        
    except Exception as e:
        return False, f'error: {str(e)}'

def main():
    """모든 HTML 파일 처리"""
    success_count = 0
    skip_count = 0
    fail_count = 0
    
    print("🔄 서브페이지에 auth.js 추가 중...")
    print("-" * 60)
    
    # pages 폴더의 모든 HTML 파일 찾기
    for root, dirs, files in os.walk('pages'):
        for file in files:
            if file.endswith('.html'):
                file_path = os.path.join(root, file)
                success, reason = add_auth_js_to_file(file_path)
                
                if success:
                    print(f"✅ {file_path} ({reason})")
                    success_count += 1
                elif reason == 'already exists':
                    skip_count += 1
                else:
                    print(f"⏭️  {file_path} ({reason})")
                    fail_count += 1
    
    print("-" * 60)
    print(f"📊 결과:")
    print(f"  ✅ 성공: {success_count}개")
    print(f"  ⏭️  건너뜀: {skip_count}개 (이미 존재)")
    print(f"  ❌ 실패: {fail_count}개")
    print(f"  📁 총: {success_count + skip_count + fail_count}개")
    print()
    print("✨ 완료!")

if __name__ == '__main__':
    main()
