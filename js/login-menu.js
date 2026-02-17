/**
 * 한국ESG학회 - 드롭다운 로그아웃 자동 생성 스크립트
 * 모든 페이지에서 로그인/로그아웃 메뉴를 자동으로 제어
 */

(function () {
    function initLoginMenu() {
        const isLoggedIn = !!(localStorage.getItem('user') || sessionStorage.getItem('user'));

        const dropdowns = document.querySelectorAll('.dropdown-menu');

        dropdowns.forEach(dropdown => {
            // 🔥 마이페이지 드롭다운인지 확인
            const navItem = dropdown.closest('.nav-item');
            const navLink = navItem ? navItem.querySelector('.nav-link') : null;
            const isMyPage = navLink && (navLink.textContent.includes('마이페이지') || navLink.querySelector('.fa-user-circle'));

            if (!isMyPage) return; // 마이페이지가 아니면 로그아웃 버튼을 자동으로 추가하지 않음

            // 🔥 로그아웃 버튼이 없으면 자동 생성
            let hasLogout = false;
            dropdown.querySelectorAll('li').forEach(li => {
                const link = li.querySelector('a');
                if (link && (link.id === 'logoutBtn' || link.textContent.includes('로그아웃'))) {
                    hasLogout = true;
                }
            });

            if (!hasLogout) {
                const logoutLi = document.createElement('li');
                logoutLi.innerHTML = '<a href="#" id="logoutBtn" style="color: #e74c3c !important;"><i class="fas fa-sign-out-alt"></i> 로그아웃</a>';
                dropdown.appendChild(logoutLi);
            }

            // 메뉴 표시/숨김 제어
            const menuItems = dropdown.querySelectorAll('li');

            menuItems.forEach(item => {
                const link = item.querySelector('a');
                if (!link) return;

                const href = link.getAttribute('href') || '';
                const text = link.textContent.trim();
                const linkId = link.id || '';

                // 게스트 메뉴 (로그아웃 상태)
                const isGuest = href.includes('signup.html') ||
                    href.includes('login.html') ||
                    text.includes('회원가입') ||
                    text.includes('로그인') ||
                    linkId === 'loginBtn' ||
                    linkId === 'topLoginBtn';

                // 사용자 메뉴 (로그인 상태)
                const isUser = href.includes('profile.html') ||
                    href.includes('payment.html') ||
                    href.includes('history.html') ||
                    href.includes('paper.html') ||
                    href.includes('event.html') ||
                    href.includes('certificate.html') ||
                    text.includes('로그아웃') ||
                    text.includes('회원정보') ||
                    text.includes('회비') ||
                    text.includes('납부') ||
                    text.includes('논문') ||
                    text.includes('행사') ||
                    text.includes('세미나') ||
                    text.includes('회원증') ||
                    text.includes('증명서') ||
                    linkId === 'logoutBtn';

                // 로그인 상태에 따라 표시/숨김
                if (isLoggedIn) {
                    item.style.display = isGuest ? 'none' : (isUser ? 'block' : '');
                } else {
                    item.style.display = 'block'; // 비로그인 시에도 다 보여줌

                    // 로그아웃 버튼만 숨김
                    if (text.includes('로그아웃') || linkId === 'logoutBtn') {
                        item.style.display = 'none';
                    }

                    // 비로그인 시 보호된 메뉴 클릭 시 리다이렉트
                    if (isUser && !text.includes('로그아웃') && linkId !== 'logoutBtn') {
                        link.onclick = (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (window.isConfirmingLogin) return false;
                            window.isConfirmingLogin = true;

                            if (confirm('로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?')) {
                                window.isConfirmingLogin = false;
                                window.location.href = '/esg/pages/auth/login.html';
                            } else {
                                window.isConfirmingLogin = false;
                            }
                            return false;
                        };
                    }
                }
            });
        });

        // 로그아웃 버튼 클릭 이벤트
        const logoutButtons = document.querySelectorAll('#logoutBtn');
        logoutButtons.forEach(btn => {
            if (btn) {
                btn.onclick = window.handleESGLogout;
            }
        });
    }

    // 페이지 로드 시 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            setTimeout(initLoginMenu, 100);
        });
    } else {
        setTimeout(initLoginMenu, 100);
    }

    // 페이지 완전 로드 후에도 실행
    window.addEventListener('load', function () {
        setTimeout(initLoginMenu, 500);
    });
})();
