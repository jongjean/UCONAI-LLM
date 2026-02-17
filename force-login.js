/**
 * 한국ESG학회 - 강제 로그인 스크립트
 * 브라우저 콘솔에서 실행하거나 북마크렛으로 사용
 */

// 방법 1: 관리자 계정으로 강제 로그인
function forceLoginAsAdmin() {
    const adminUser = {
        id: 'jongjean@naver.com',
        name: '강종진',
        role: 'super_admin',
        status: 'active',
        member_type: '공동회장',
        loginTime: new Date().toISOString()
    };
    
    // sessionStorage에 저장
    sessionStorage.setItem('user', JSON.stringify(adminUser));
    
    // 페이지 새로고침
    console.log('✅ 관리자 로그인 완료:', adminUser.name);
    location.reload();
}

// 방법 2: 커스텀 사용자로 강제 로그인
function forceLoginAs(email, name, role = 'user') {
    const userData = {
        id: email,
        name: name,
        role: role, // 'super_admin', 'admin', 'user'
        status: 'active',
        member_type: role === 'super_admin' ? '최고관리자' : role === 'admin' ? '관리자' : '일반회원',
        loginTime: new Date().toISOString()
    };
    
    sessionStorage.setItem('user', JSON.stringify(userData));
    
    console.log('✅ 강제 로그인 완료:', userData);
    location.reload();
}

// 방법 3: 로그아웃
function forceLogout() {
    sessionStorage.removeItem('user');
    localStorage.removeItem('user');
    console.log('✅ 로그아웃 완료');
    location.reload();
}

// 방법 4: 현재 로그인 상태 확인
function checkLoginStatus() {
    const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || 'null');
    
    if (user) {
        console.log('✅ 로그인 상태:', user);
        console.log('📧 이메일:', user.id);
        console.log('👤 이름:', user.name);
        console.log('🔑 권한:', user.role);
        console.log('📊 상태:', user.status);
    } else {
        console.log('❌ 로그인되지 않음');
    }
    
    return user;
}

// 콘솔에 사용법 출력
console.log(`
╔════════════════════════════════════════╗
║   한국ESG학회 - 강제 로그인 도구      ║
╚════════════════════════════════════════╝

사용 방법:

1️⃣ 관리자로 로그인:
   forceLoginAsAdmin()

2️⃣ 커스텀 사용자로 로그인:
   forceLoginAs('test@example.com', '홍길동', 'admin')
   
   권한 종류:
   - 'super_admin' (최고관리자)
   - 'admin' (관리자)
   - 'user' (일반 사용자)

3️⃣ 로그아웃:
   forceLogout()

4️⃣ 로그인 상태 확인:
   checkLoginStatus()

═══════════════════════════════════════
`);

// 자동 실행 옵션 (URL 파라미터)
if (window.location.search.includes('auto_login=admin')) {
    forceLoginAsAdmin();
}
