"""
마이페이지의 모든 alert를 커스텀 모달로 교체하는 스크립트
"""
import os
import re

# 대상 파일들
files = [
    'pages/mypage/profile.html',
    'pages/mypage/history.html',
    'pages/mypage/paper.html',
    'pages/mypage/event.html',
    'pages/mypage/certificate.html'
]

def update_file(filepath):
    """파일의 alert를 showCustomModal로 교체"""
    if not os.path.exists(filepath):
        print(f"❌ 파일을 찾을 수 없습니다: {filepath}")
        return False
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # 1. CSS 링크 추가 (</head> 바로 전에)
    if '../../css/modal.css' not in content:
        content = content.replace('</head>', '    <link rel="stylesheet" href="../../css/modal.css">\n</head>')
    
    # 2. JS 스크립트 추가 (첫 번째 <script> 태그 전에)
    if '../../js/modal.js' not in content:
        content = re.sub(
            r'(<script src="../../js/main\.js">)',
            r'<script src="../../js/modal.js"></script>\n    \1',
            content
        )
    
    # 3. alert를 showCustomModal로 교체
    # 패턴: alert('메시지'); 또는 alert("메시지");
    
    # 성공 메시지
    content = re.sub(
        r"alert\('(성공적으로|완료되었습니다|생성되었습니다|저장되었습니다|삭제되었습니다)[^']*'\);",
        lambda m: f"showCustomModal('{m.group(0)[7:-3]}', 'success');",
        content
    )
    
    content = re.sub(
        r'alert\("(성공적으로|완료되었습니다|생성되었습니다|저장되었습니다|삭제되었습니다)[^"]*"\);',
        lambda m: f'showCustomModal("{m.group(0)[7:-3]}", \'success\');',
        content
    )
    
    # 나머지 일반 alert (info)
    content = re.sub(
        r"alert\('([^']*)'\);",
        lambda m: f"showCustomModal('{m.group(1)}', 'info');",
        content
    )
    
    content = re.sub(
        r'alert\("([^"]*)"\);',
        lambda m: f'showCustomModal("{m.group(1)}", \'info\');',
        content
    )
    
    # 변경사항이 있으면 저장
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ 업데이트 완료: {filepath}")
        return True
    else:
        print(f"ℹ️  변경사항 없음: {filepath}")
        return False

def main():
    print("=" * 60)
    print("마이페이지 모달 시스템 일괄 적용")
    print("=" * 60)
    
    updated_count = 0
    for filepath in files:
        if update_file(filepath):
            updated_count += 1
        print()
    
    print("=" * 60)
    print(f"✅ 완료: {updated_count}/{len(files)}개 파일 업데이트")
    print("=" * 60)

if __name__ == '__main__':
    main()
