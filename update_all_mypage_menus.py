#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
모든 페이지의 마이페이지 드롭다운 메뉴 일괄 업데이트
회원가입/로그인/로그아웃 메뉴 추가
"""

import os
import re
from pathlib import Path

# 새로운 마이페이지 드롭다운 메뉴 (상대 경로 버전)
NEW_MYPAGE_MENU = '''                        <li class="nav-item has-dropdown">
                            <a href="#" class="nav-link"><i class="fas fa-user-circle"></i> 마이페이지</a>
                            <ul class="dropdown-menu">
                                <!-- 로그인 전 메뉴 -->
                                <li class="auth-only logged-out"><a href="{auth_path}auth/signup.html"><i class="fas fa-user-plus"></i> 회원가입</a></li>
                                <li class="auth-only logged-out"><a href="{auth_path}auth/login.html"><i class="fas fa-sign-in-alt"></i> 로그인</a></li>
                                <li class="auth-only logged-out dropdown-divider"></li>
                                
                                <!-- 로그인 후 메뉴 -->
                                <li class="auth-only logged-in"><a href="{mypage_path}mypage/profile.html"><i class="fas fa-user-edit"></i> 회원정보 관리</a></li>
                                <li class="auth-only logged-in"><a href="{mypage_path}mypage/payment.html"><i class="fas fa-credit-card"></i> 회비 납부</a></li>
                                <li class="auth-only logged-in"><a href="{mypage_path}mypage/history.html"><i class="fas fa-history"></i> 납부 내역</a></li>
                                <li class="auth-only logged-in"><a href="{mypage_path}mypage/paper.html"><i class="fas fa-file-alt"></i> 논문 투고 현황</a></li>
                                <li class="auth-only logged-in"><a href="{mypage_path}mypage/event.html"><i class="fas fa-calendar-check"></i> 행사·세미나 신청 내역</a></li>
                                <li class="auth-only logged-in"><a href="{mypage_path}mypage/certificate.html"><i class="fas fa-certificate"></i> 회원증·증명서</a></li>
                                <li class="auth-only logged-in dropdown-divider"></li>
                                <li class="auth-only logged-in"><a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> 로그아웃</a></li>
                            </ul>
                        </li>'''

# index.html용 (루트)
NEW_MYPAGE_MENU_ROOT = '''                        <li class="nav-item has-dropdown">
                            <a href="#" class="nav-link"><i class="fas fa-user-circle"></i> 마이페이지</a>
                            <ul class="dropdown-menu">
                                <!-- 로그인 전 메뉴 -->
                                <li class="auth-only logged-out"><a href="pages/auth/signup.html"><i class="fas fa-user-plus"></i> 회원가입</a></li>
                                <li class="auth-only logged-out"><a href="pages/auth/login.html"><i class="fas fa-sign-in-alt"></i> 로그인</a></li>
                                <li class="auth-only logged-out dropdown-divider"></li>
                                
                                <!-- 로그인 후 메뉴 -->
                                <li class="auth-only logged-in"><a href="pages/mypage/profile.html"><i class="fas fa-user-edit"></i> 회원정보 관리</a></li>
                                <li class="auth-only logged-in"><a href="pages/mypage/payment.html"><i class="fas fa-credit-card"></i> 회비 납부</a></li>
                                <li class="auth-only logged-in"><a href="pages/mypage/history.html"><i class="fas fa-history"></i> 납부 내역</a></li>
                                <li class="auth-only logged-in"><a href="pages/mypage/paper.html"><i class="fas fa-file-alt"></i> 논문 투고 현황</a></li>
                                <li class="auth-only logged-in"><a href="pages/mypage/event.html"><i class="fas fa-calendar-check"></i> 행사·세미나 신청 내역</a></li>
                                <li class="auth-only logged-in"><a href="pages/mypage/certificate.html"><i class="fas fa-certificate"></i> 회원증·증명서</a></li>
                                <li class="auth-only logged-in dropdown-divider"></li>
                                <li class="auth-only logged-in"><a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> 로그아웃</a></li>
                            </ul>
                        </li>'''

def get_relative_path(file_path):
    """파일 경로에 따라 상대 경로 계산"""
    if file_path == 'index.html':
        return 'pages/', 'pages/'
    
    # pages/ 하위의 깊이 계산
    parts = Path(file_path).parts
    if 'pages' in parts:
        depth = len(parts) - 2  # pages/ 이후의 깊이
        prefix = '../' * depth
        return prefix, prefix
    
    return '../', '../'

def update_mypage_menu(file_path):
    """마이페이지 메뉴 업데이트"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 이미 업데이트된 경우 스킵
        if 'auth/signup.html' in content and '회원가입</a></li>' in content:
            return False, "이미 업데이트됨"
        
        # 마이페이지 메뉴가 없으면 스킵
        if '마이페이지</a>' not in content:
            return False, "마이페이지 메뉴 없음"
        
        # 파일 경로에 따라 새 메뉴 선택
        if file_path == 'index.html':
            new_menu = NEW_MYPAGE_MENU_ROOT
        else:
            auth_path, mypage_path = get_relative_path(file_path)
            new_menu = NEW_MYPAGE_MENU.format(auth_path=auth_path, mypage_path=mypage_path)
        
        # 기존 마이페이지 드롭다운 메뉴 패턴 (여러 변형 지원)
        patterns = [
            # 패턴 1: 아이콘 있는 전체 메뉴
            r'<li class="nav-item has-dropdown">\s*<a href="#" class="nav-link"><i class="fas fa-user-circle"></i> 마이페이지</a>\s*<ul class="dropdown-menu">.*?</ul>\s*</li>',
            # 패턴 2: 아이콘 없는 전체 메뉴  
            r'<li class="nav-item has-dropdown">\s*<a href="#" class="nav-link">마이페이지</a>\s*<ul class="dropdown-menu">.*?</ul>\s*</li>',
            # 패턴 3: 다른 형식
            r'<li class="nav-item has-dropdown">\s*<a[^>]*>.*?마이페이지.*?</a>\s*<ul class="dropdown-menu">.*?</ul>\s*</li>'
        ]
        
        updated = False
        for pattern in patterns:
            if re.search(pattern, content, re.DOTALL):
                new_content = re.sub(pattern, new_menu, content, flags=re.DOTALL)
                if new_content != content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    updated = True
                    break
        
        if updated:
            return True, "업데이트 완료"
        else:
            return False, "패턴 매칭 실패"
            
    except Exception as e:
        return False, f"오류: {str(e)}"

def main():
    """메인 함수"""
    print("=" * 80)
    print("마이페이지 드롭다운 메뉴 일괄 업데이트")
    print("회원가입/로그인/로그아웃 메뉴 추가")
    print("=" * 80 + "\n")
    
    updated_files = []
    skipped_files = []
    error_files = []
    
    # index.html 업데이트
    print("📄 index.html 확인...")
    success, message = update_mypage_menu('index.html')
    if success:
        updated_files.append('index.html')
        print("   ✓ 업데이트 완료")
    else:
        skipped_files.append(('index.html', message))
        print(f"   - {message}")
    
    # pages 디렉토리 하위 모든 HTML 파일 업데이트
    print("\n📁 pages/ 디렉토리 탐색...")
    for root, dirs, files in os.walk('pages'):
        for file in files:
            if file.endswith('.html'):
                file_path = os.path.join(root, file)
                success, message = update_mypage_menu(file_path)
                
                if success:
                    updated_files.append(file_path)
                    print(f"   ✓ {file_path}")
                elif "오류" in message:
                    error_files.append((file_path, message))
                    print(f"   ✗ {file_path} - {message}")
                else:
                    skipped_files.append((file_path, message))
    
    # 결과 출력
    print("\n" + "=" * 80)
    print("📊 업데이트 결과")
    print("=" * 80)
    print(f"✅ 업데이트 완료: {len(updated_files)}개 파일")
    print(f"⏭️  건너뜀: {len(skipped_files)}개 파일")
    print(f"❌ 오류: {len(error_files)}개 파일")
    
    if updated_files:
        print("\n✅ 업데이트된 파일:")
        for file in updated_files:
            print(f"   • {file}")
    
    if error_files:
        print("\n❌ 오류 발생 파일:")
        for file, msg in error_files:
            print(f"   • {file}: {msg}")
    
    print("\n" + "=" * 80)
    print("✨ 추가된 메뉴 항목:")
    print("   로그인 전: 회원가입, 로그인")
    print("   로그인 후: 기존 메뉴 + 로그아웃")
    print("=" * 80)

if __name__ == "__main__":
    main()
