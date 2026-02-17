#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
마이페이지 드롭다운 메뉴 일괄 업데이트 스크립트
모든 서브페이지에 로그인/로그아웃 메뉴를 추가합니다.
"""

import os
import re

# 업데이트할 마이페이지 메뉴 (회원가입/로그인 포함)
NEW_MYPAGE_MENU = '''                        <li class="nav-item has-dropdown">
                            <a href="#" class="nav-link">마이페이지</a>
                            <ul class="dropdown-menu">
                                <!-- 로그인 전 메뉴 -->
                                <li class="auth-only logged-out"><a href="../auth/signup.html"><i class="fas fa-user-plus"></i> 회원가입</a></li>
                                <li class="auth-only logged-out"><a href="../auth/login.html"><i class="fas fa-sign-in-alt"></i> 로그인</a></li>
                                <li class="auth-only logged-out dropdown-divider"></li>
                                
                                <!-- 로그인 후 메뉴 -->
                                <li class="auth-only logged-in"><a href="../mypage/profile.html"><i class="fas fa-user-edit"></i> 회원정보 관리</a></li>
                                <li class="auth-only logged-in"><a href="../mypage/payment.html"><i class="fas fa-credit-card"></i> 회비 납부</a></li>
                                <li class="auth-only logged-in"><a href="../mypage/history.html"><i class="fas fa-history"></i> 납부 내역</a></li>
                                <li class="auth-only logged-in"><a href="../mypage/paper.html"><i class="fas fa-file-alt"></i> 논문 투고 현황</a></li>
                                <li class="auth-only logged-in"><a href="../mypage/event.html"><i class="fas fa-calendar-check"></i> 행사·세미나 신청 내역</a></li>
                                <li class="auth-only logged-in"><a href="../mypage/certificate.html"><i class="fas fa-certificate"></i> 회원증·증명서</a></li>
                                <li class="auth-only logged-in dropdown-divider"></li>
                                <li class="auth-only logged-in"><a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> 로그아웃</a></li>
                            </ul>
                        </li>'''

def update_file(file_path):
    """파일의 마이페이지 메뉴 업데이트"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 이미 업데이트된 파일인지 확인
        if '회원가입</a></li>' in content and 'auth/signup.html' in content:
            return False, "이미 업데이트됨"
        
        # 마이페이지 메뉴가 없으면 건너뛰기
        if '마이페이지</a>' not in content:
            return False, "마이페이지 메뉴 없음"
        
        # 기존 마이페이지 메뉴 패턴 (로그인 메뉴 없는 버전)
        old_pattern = re.compile(
            r'<li class="nav-item has-dropdown">\s*'
            r'<a href="#" class="nav-link">마이페이지</a>\s*'
            r'<ul class="dropdown-menu">\s*'
            r'<li><a href="../mypage/profile\.html">회원정보 관리</a></li>\s*'
            r'<li><a href="../mypage/payment\.html">회비 납부</a></li>\s*'
            r'<li><a href="../mypage/history\.html">납부 내역</a></li>\s*'
            r'<li><a href="../mypage/paper\.html">논문 투고 현황</a></li>\s*'
            r'<li><a href="../mypage/event\.html">행사·세미나 신청 내역</a></li>\s*'
            r'<li><a href="../mypage/certificate\.html">회원증·증명서</a></li>\s*'
            r'</ul>\s*'
            r'</li>',
            re.DOTALL
        )
        
        # 메뉴 교체
        new_content = old_pattern.sub(NEW_MYPAGE_MENU, content)
        
        # 변경사항이 있으면 저장
        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True, "업데이트 완료"
        
        return False, "변경사항 없음"
        
    except Exception as e:
        return False, f"오류: {str(e)}"

def main():
    """메인 함수"""
    print("=" * 80)
    print("마이페이지 드롭다운 메뉴 일괄 업데이트")
    print("=" * 80)
    
    pages_dir = "pages"
    updated_files = []
    skipped_files = []
    error_files = []
    
    # 모든 HTML 파일 탐색
    for root, dirs, files in os.walk(pages_dir):
        for file in files:
            if file.endswith('.html'):
                file_path = os.path.join(root, file)
                success, message = update_file(file_path)
                
                if success:
                    updated_files.append(file_path)
                    print(f"✓ {file_path}")
                elif "오류" in message:
                    error_files.append((file_path, message))
                    print(f"✗ {file_path} - {message}")
                else:
                    skipped_files.append((file_path, message))
    
    # 결과 출력
    print("\n" + "=" * 80)
    print("업데이트 결과")
    print("=" * 80)
    print(f"✓ 업데이트 완료: {len(updated_files)}개 파일")
    print(f"- 건너뜀: {len(skipped_files)}개 파일")
    print(f"✗ 오류: {len(error_files)}개 파일")
    
    if updated_files:
        print("\n[업데이트된 파일]")
        for file in updated_files:
            print(f"  - {file}")
    
    if error_files:
        print("\n[오류 파일]")
        for file, msg in error_files:
            print(f"  - {file}: {msg}")
    
    print("\n" + "=" * 80)
    print("마이페이지 메뉴 업데이트 완료!")
    print("=" * 80)

if __name__ == "__main__":
    main()
