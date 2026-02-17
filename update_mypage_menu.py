#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
모든 HTML 페이지의 마이페이지 메뉴에 회원가입/로그인/로그아웃 기능 추가 스크립트
"""

import os
import re
from pathlib import Path

def get_relative_path(file_path):
    """파일 경로에서 상대 경로 계산"""
    depth = len(Path(file_path).parts) - 1
    return '../' * depth

def update_mypage_menu(file_path):
    """HTML 파일의 마이페이지 메뉴 업데이트"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 이미 업데이트된 파일인지 확인
        if 'auth-only logged-out' in content or 'auth-only logged-in' in content:
            print(f"⏭️  이미 업데이트됨: {file_path}")
            return False
        
        # 마이페이지 메뉴 찾기
        mypage_pattern = r'<li class="nav-item has-dropdown">\s*<a href="#" class="nav-link"><i class="fas fa-user-circle"></i> 마이페이지</a>\s*<ul class="dropdown-menu">.*?</ul>\s*</li>'
        
        mypage_match = re.search(mypage_pattern, content, re.DOTALL)
        if not mypage_match:
            print(f"⚠️  마이페이지 메뉴를 찾을 수 없음: {file_path}")
            return False
        
        # 상대 경로 계산
        prefix = get_relative_path(file_path)
        
        # 새로운 마이페이지 메뉴 HTML
        new_mypage_menu = f'''<li class="nav-item has-dropdown">
                            <a href="#" class="nav-link"><i class="fas fa-user-circle"></i> 마이페이지</a>
                            <ul class="dropdown-menu">
                                <!-- 로그인 전 메뉴 -->
                                <li class="auth-only logged-out"><a href="{prefix}pages/auth/signup.html"><i class="fas fa-user-plus"></i> 회원가입</a></li>
                                <li class="auth-only logged-out"><a href="{prefix}pages/auth/login.html"><i class="fas fa-sign-in-alt"></i> 로그인</a></li>
                                <li class="auth-only logged-out dropdown-divider"></li>
                                
                                <!-- 로그인 후 메뉴 -->
                                <li class="auth-only logged-in"><a href="{prefix}pages/mypage/profile.html"><i class="fas fa-user-edit"></i> 회원정보 관리</a></li>
                                <li class="auth-only logged-in"><a href="{prefix}pages/mypage/payment.html"><i class="fas fa-credit-card"></i> 회비 납부</a></li>
                                <li class="auth-only logged-in"><a href="{prefix}pages/mypage/history.html"><i class="fas fa-history"></i> 납부 내역</a></li>
                                <li class="auth-only logged-in"><a href="{prefix}pages/mypage/paper.html"><i class="fas fa-file-alt"></i> 논문 투고 현황</a></li>
                                <li class="auth-only logged-in"><a href="{prefix}pages/mypage/event.html"><i class="fas fa-calendar-check"></i> 행사·세미나 신청 내역</a></li>
                                <li class="auth-only logged-in"><a href="{prefix}pages/mypage/certificate.html"><i class="fas fa-certificate"></i> 회원증·증명서</a></li>
                                <li class="auth-only logged-in dropdown-divider"></li>
                                <li class="auth-only logged-in"><a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> 로그아웃</a></li>
                            </ul>
                        </li>'''
        
        # 메뉴 교체
        new_content = content.replace(mypage_match.group(0), new_mypage_menu)
        
        # auth-manager.js 스크립트 추가 (없는 경우)
        if 'auth-manager.js' not in new_content:
            # </body> 태그 앞에 스크립트 추가
            script_tag = f'    <script src="{prefix}js/auth-manager.js"></script>\n</body>'
            new_content = re.sub(r'</body>', script_tag, new_content, count=1)
        
        # 파일 저장
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"✅ 마이페이지 메뉴 업데이트 완료: {file_path}")
        return True
        
    except Exception as e:
        print(f"❌ 오류 발생 ({file_path}): {e}")
        return False

def main():
    """메인 실행 함수"""
    print("=" * 70)
    print("마이페이지 메뉴 업데이트 작업 시작")
    print("=" * 70)
    
    # 모든 HTML 파일 찾기
    html_files = []
    
    # pages 디렉토리의 모든 HTML 파일
    pages_dir = Path('pages')
    if pages_dir.exists():
        html_files.extend(pages_dir.rglob('*.html'))
    
    # auth 페이지는 제외
    html_files = [f for f in html_files if 'auth' not in str(f)]
    
    success_count = 0
    skip_count = 0
    fail_count = 0
    
    for html_file in sorted(html_files):
        result = update_mypage_menu(str(html_file))
        if result is True:
            success_count += 1
        elif result is False:
            # 이미 업데이트된 파일인지 확인
            with open(str(html_file), 'r', encoding='utf-8') as f:
                if 'auth-only' in f.read():
                    skip_count += 1
                else:
                    fail_count += 1
    
    print("\n" + "=" * 70)
    print("작업 완료 통계")
    print("=" * 70)
    print(f"✅ 성공: {success_count}개")
    print(f"⏭️  건너뜀: {skip_count}개")
    print(f"❌ 실패: {fail_count}개")
    print(f"📊 전체: {len(html_files)}개")
    print("=" * 70)

if __name__ == '__main__':
    main()
