/**
 * 마이페이지 - 프로필 관리
 * Version: 2026-02-14 (v2)
 */

var API_BASE_URL = window.API_BASE_URL || '/esg/api';
window.API_BASE_URL = API_BASE_URL;

// 페이지 로드 시 사용자 정보 로드
document.addEventListener('DOMContentLoaded', async function () {
    console.log('🔍 마이페이지 로드 시작');

    // Auth 객체 확인 (auth.js가 로드되어 있어야 함)
    if (typeof Auth === 'undefined') {
        console.error('❌ Auth 시스템이 로드되지 않았습니다.');
        return;
    }

    // 로그인 체크
    if (!Auth.isLoggedIn()) {
        console.log('🚪 로그인되어 있지 않음 - 로그인 페이지로 이동');
        alert('로그인이 필요합니다.');
        window.location.href = '../auth/login.html';
        return;
    }

    // 사용자 정보 로드 및 전역 상태 업데이트
    const user = await loadUserProfile();

    // 관리자 메뉴 표시 (실시간 데이터 기준)
    const adminActions = document.getElementById('adminActions');
    if (adminActions) {
        if (user && (user.role === 'admin' || user.role === 'super_admin')) {
            adminActions.style.display = 'block';
        } else {
            adminActions.style.display = 'none';
        }
    }
});

async function loadUserProfile() {
    try {
        const token = Auth.getToken();

        if (!token) {
            throw new Error('토큰이 없습니다.');
        }

        console.log('📡 사용자 정보 요청 중...');

        // API 호출
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('사용자 정보를 가져올 수 없습니다. (Status: ' + response.status + ')');
        }

        const data = await response.json();
        const user = data.user;

        console.log('✅ 사용자 정보 로드 성공:', user);

        // 로컬 스토리지 정보 동기화 (권한 등 최신화)
        const remember = !!localStorage.getItem('user');
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem('user', JSON.stringify(user));

        // UI 업데이트
        updateProfileUI(user);

        return user;

    } catch (error) {
        console.error('❌ 사용자 정보 로드 실패:', error);
        alert('사용자 정보를 불러올 수 없습니다.\n다시 로그인해주세요.');
        return null;
    }
}

function updateProfileUI(user) {
    // 1. 헤더 영역 업데이트
    const nameDisplay = document.getElementById('profileNameDisplay');
    const idDisplay = document.getElementById('profileIdDisplay');
    const badgesDisplay = document.getElementById('profileBadgesDisplay');

    if (nameDisplay) nameDisplay.textContent = user.name || '회원';
    if (idDisplay) idDisplay.textContent = `회원번호: ${user.user_id || user.email}`;

    // 배지 업데이트
    if (badgesDisplay) {
        badgesDisplay.innerHTML = '';

        // 회원 유형
        const memberTypeText = getMemberTypeText(user.member_type || 'general');
        badgesDisplay.innerHTML += `<span class="badge member-type">${memberTypeText}</span> `;

        // 상태
        const statusText = user.member_status === 'active' ? '활동중' : user.member_status === 'pending' ? '승인대기' : '비활성';
        badgesDisplay.innerHTML += `<span class="badge status">${statusText}</span> `;

        // 관리자 뱃지
        if (user.role === 'super_admin') {
            badgesDisplay.innerHTML += `<span class="badge grade">최고관리자</span>`;
        } else if (user.role === 'admin') {
            badgesDisplay.innerHTML += `<span class="badge grade">관리자</span>`;
        }
    }

    // 2. 가입 기간 계산
    const joinDate = user.created_at ? new Date(user.created_at) : new Date();
    const diffTime = Math.abs(new Date() - joinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffYears = Math.floor(diffDays / 365);

    const statValues = document.querySelectorAll('.stat-value');
    if (statValues.length >= 4) {
        statValues[0].textContent = diffYears > 0 ? `${diffYears}년` : `${diffDays}일`;
        statValues[1].textContent = '0편';
        statValues[2].textContent = '0회';
        statValues[3].textContent = '0%';
    }

    // 3. 폼 필드 업데이트 (ID 기반)
    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val || '';
    };

    setVal('infoUserId', user.user_id || user.email);
    if (user.created_at) {
        setVal('infoJoinDate', new Date(user.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }));
    }

    setVal('infoName', user.name);
    setVal('infoNameEn', user.name_en);
    setVal('infoEmail', user.email);
    setVal('infoMobile', user.mobile || user.phone);

    // 주소 정보
    const postalInput = document.querySelector('input[placeholder="우편번호"]');
    if (postalInput) postalInput.value = user.postal_code || '';

    const addrInput = document.querySelector('input[placeholder="기본 주소"]');
    if (addrInput) addrInput.value = user.address || '';

    const detailAddrInput = document.querySelector('input[placeholder="상세 주소"]');
    if (detailAddrInput) detailAddrInput.value = user.address_detail || '';

    // 소속 정보
    const affilInput = document.querySelector('input[placeholder="대학명 또는 기업명"]');
    if (affilInput) affilInput.value = user.affiliation || '';

    const deptInput = document.querySelector('input[placeholder="학과 또는 부서명"]');
    if (deptInput) deptInput.value = user.department || '';

    const posInput = document.querySelector('input[placeholder="예: 교수, 부장, 연구원"]');
    if (posInput) posInput.value = user.position || '';
    // 4. 비밀번호 강도 체크 이벤트 연결
    const newPasswordInput = document.getElementById('newPassword');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', checkPasswordStrength);
    }
}

function checkPasswordStrength(e) {
    const password = e.target.value;
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');

    if (!strengthBar || !strengthText) return;

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[^a-zA-Z\d]/)) strength++;

    strengthBar.className = 'password-strength-bar';
    if (strength === 0) {
        strengthText.textContent = '-';
        strengthText.style.color = '#666';
    } else if (strength <= 2) {
        strengthBar.classList.add('weak');
        strengthText.textContent = '약함';
        strengthText.style.color = '#e74c3c';
    } else if (strength === 3) {
        strengthBar.classList.add('medium');
        strengthText.textContent = '보통';
        strengthText.style.color = '#f39c12';
    } else if (strength === 4) {
        strengthBar.classList.add('strong');
        strengthText.textContent = '강함';
        strengthText.style.color = '#27ae60';
    }
}

function saveProfile() {
    // 실제 저장 로직은 추후 API 연동 필요
    if (typeof showCustomModal === 'function') {
        showCustomModal('회원정보가 성공적으로 저장되었습니다.', 'success');
    } else {
        alert('회원정보가 성공적으로 저장되었습니다.');
    }
}

function resetForm() {
    if (confirm('변경사항을 취소하시겠습니까?')) {
        location.reload();
    }
}

function getMemberTypeText(type) {
    const types = {
        'general': '정회원',
        'associate': '준회원',
        'student': '학생회원',
        'special': '특별회원',
        'corporate': '기업회원'
    };
    return types[type] || '일반회원';
}

// 전역 함수로 노출 (HTML onclick용)
window.saveProfile = saveProfile;
window.resetForm = resetForm;
