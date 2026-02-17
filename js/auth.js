/**
 * 한국ESG학회 - 인증 시스템 (페이지 기반)
 * auth.js
 * Version: 2026-02-14 (Robust Version)
 */

var API_BASE_URL = window.API_BASE_URL || '/esg/api';
window.API_BASE_URL = API_BASE_URL;

// ==================================================
// Auth Helper Object
// ==================================================
if (typeof Auth === 'undefined') {
    var Auth = {
        get User() {
            const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
            if (!userStr) return null;
            try {
                return JSON.parse(userStr);
            } catch (e) {
                return null;
            }
        },

        getCurrentUser() {
            return this.getUser();
        },

        getUser() {
            return this.User;
        },

        isLoggedIn() {
            return !!this.getUser();
        },

        isAdmin() {
            const user = this.getUser();
            if (!user) return false;
            return user.role === 'admin' || user.role === 'super_admin';
        },

        getToken() {
            return localStorage.getItem('esg_token') || sessionStorage.getItem('esg_token');
        },

        setUser(userData, token, remember = false) {
            const storage = remember ? localStorage : sessionStorage;
            storage.setItem('user', JSON.stringify(userData));
            storage.setItem('esg_token', token);
        },

        clearUser() {
            localStorage.removeItem('user');
            localStorage.removeItem('esg_token');
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('esg_token');
        }
    };
    window.Auth = Auth;
}

// ==================================================
// 인증 UI 관리 (리다이렉션 기반)
// ==================================================
if (typeof ESGAuthManager === 'undefined') {
    var ESGAuthManager = class {
        constructor() {
            this.init();
        }

        init() {
            this.loginBtns = document.querySelectorAll('#loginBtn, #topLoginBtn, .login-trigger');
            this.logoutBtn = document.getElementById('logoutBtn');
            this.signupBtns = document.querySelectorAll('.signup-trigger, .register-link');

            this.updateUI();
            this.attachEventListeners();
        }

        attachEventListeners() {
            // 로그인 버튼들
            this.loginBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = '/esg/pages/auth/login.html';
                });
            });

            // 회원가입 버튼들
            this.signupBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = '/esg/pages/auth/signup.html';
                });
            });

            // 로그아웃 버튼 (정적 버튼) - updateUI에서 통합 처리하므로 중복 방지 위해 주석 처리
            /*
            if (this.logoutBtn) {
                this.logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleLogout();
                });
            }
            */
        }

        updateUI() {
            const user = Auth.getUser();
            const isLoggedIn = !!user;

            console.log('🔄 UI 업데이트 (로그인 상태:', isLoggedIn, ')');

            // 1. 모든 드롭다운 메뉴 처리 (마이페이지 외에도 적용 가능하도록)
            const dropdowns = document.querySelectorAll('.dropdown-menu');
            dropdowns.forEach(dropdown => {
                // 로그인이 필요한 메뉴 필터링
                const items = dropdown.querySelectorAll('li');
                items.forEach(item => {
                    const link = item.querySelector('a');
                    if (!link) return;

                    const text = link.textContent.trim();
                    const href = link.getAttribute('href') || '';

                    // 게스트 전용 (회원가입, 로그인 등)
                    const isGuestItem = text.includes('회원가입') || text.includes('로그인') || href.includes('signup.html') || href.includes('login.html');

                    // 사용자 전용 (마이페이지 하위 메뉴들, 로그아웃 등)
                    const isUserItem = text.includes('로그아웃') || href.includes('profile.html') || href.includes('payment.html') ||
                        href.includes('history.html') || href.includes('paper.html') || href.includes('event.html') ||
                        href.includes('certificate.html');

                    if (isLoggedIn) {
                        if (isGuestItem) item.style.display = 'none';
                        else if (isUserItem) item.style.display = 'block';
                    } else {
                        if (isGuestItem) item.style.display = 'block';

                        // 비로그인 상태에서 보호된 메뉴 표시 및 클릭 시 리다이렉트 (로그아웃 제외)
                        if (isUserItem && !text.includes('로그아웃')) {
                            item.style.display = 'block';
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
                        } else if (text.includes('로그아웃')) {
                            item.style.display = 'none'; // 로그아웃 상태면 로그아웃 버튼은 숨김
                        }
                    }

                    // 로그아웃 버튼 스타일 강조
                    if (text.includes('로그아웃')) {
                        link.style.color = '#e74c3c';
                        link.style.fontWeight = '600';
                        // 이벤트 리스너 재연결 (동적으로 생성될 수 있으므로)
                        link.onclick = (e) => {
                            e.preventDefault();
                            this.handleLogout();
                        };
                    }
                });

                // 로그아웃 버튼이 아예 없는 경우 (마이페이지 드롭다운 한정)
                const navItem = dropdown.closest('.nav-item');
                const navLink = navItem ? navItem.querySelector('.nav-link') : null;
                const isMyPage = navLink && (navLink.textContent.includes('마이페이지') || navLink.querySelector('.fa-user-circle'));

                if (isMyPage && isLoggedIn) {
                    const hasLogout = Array.from(dropdown.querySelectorAll('li')).some(li => li.textContent.includes('로그아웃'));
                    if (!hasLogout) {
                        const logoutLi = document.createElement('li');
                        logoutLi.innerHTML = `<a href="#" style="color: #e74c3c !important; font-weight: 600;"><i class="fas fa-sign-out-alt"></i> 로그아웃</a>`;
                        logoutLi.querySelector('a').onclick = (e) => {
                            e.preventDefault();
                            this.handleLogout();
                        };
                        dropdown.appendChild(logoutLi);
                    }
                }
            });

            // 2. 상단 고정 상태 바 처리
            const statusBar = document.querySelector('.user-status-fixed');
            if (statusBar) {
                if (isLoggedIn) {
                    statusBar.style.display = 'flex';
                    statusBar.innerHTML = `
                        <span style="color: #27ae60; font-weight: 600;">
                            <i class="fas fa-user-circle"></i> ${user.name}님 (로그인 중)
                        </span>
                        <span class="status-divider">|</span>
                        <a href="/esg/pages/mypage/profile.html" class="status-link">
                            <i class="fas fa-user-cog"></i> 마이페이지
                        </a>
                        <span class="status-divider">|</span>
                        <a href="#" class="status-link logout-btn-fixed" style="color: #e74c3c; font-weight: 600;" onclick="handleESGLogout(event)">
                            <i class="fas fa-sign-out-alt"></i> 로그아웃
                        </a>
                    `;

                    // 로그아웃 버튼 이벤트 바인딩 (onclick 속성으로 대체됨)
                    /*
                    const logoutBtnFixed = statusBar.querySelector('.logout-btn-fixed');
                    if (logoutBtnFixed) {
                        logoutBtnFixed.onclick = (e) => {
                            e.preventDefault();
                            this.handleLogout();
                        };
                    }
                    */
                } else {
                    statusBar.style.display = 'none';
                }
            }
        }

        handleLogout() {
            if (typeof window.handleESGLogout === 'function') {
                window.handleESGLogout();
            } else {
                if (!confirm('로그아웃 하시겠습니까?')) return;
                Auth.clearUser();
                alert('로그아웃 되었습니다.');
                window.location.href = '/esg/index.html';
            }
        }

        showNotification(title, message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `auth-notification auth-notification-${type} show`;
            notification.innerHTML = `<strong>${title}</strong><br>${message}`;
            document.body.appendChild(notification);
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
    };
    window.ESGAuthManager = ESGAuthManager;
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    if (!window.esgAuth) {
        window.esgAuth = new ESGAuthManager();
    }
});

// 기존 호환성 유지용 더미 함수들 (Global)
function openLoginModal() { window.location.href = '/esg/pages/auth/login.html'; }
function openSignupModal() { window.location.href = '/esg/pages/auth/signup.html'; }
function switchToSignup() { window.location.href = '/esg/pages/auth/signup.html'; }
function switchToLogin() { window.location.href = '/esg/pages/auth/login.html'; }
