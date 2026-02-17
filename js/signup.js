/**
 * 한국ESG학회 - 회원가입 시스템
 * signup.js
 * Version: 2026-02-14 (페이지 기반으로 전환)
 */

var API_BASE_URL = window.API_BASE_URL || '/esg/api';
window.API_BASE_URL = API_BASE_URL;

// 이메일 중복 확인 상태
let emailChecked = false;
let emailAvailable = false;

/**
 * 이메일 중복 확인
 */
async function checkEmailDuplicate() {
    const emailInput = document.getElementById('signupEmail');
    const email = emailInput.value.trim();
    const resultSpan = document.getElementById('emailCheckResult');

    if (!email) {
        resultSpan.textContent = '이메일을 입력해주세요.';
        resultSpan.style.color = '#e74c3c';
        emailChecked = false;
        emailAvailable = false;
        return;
    }

    if (!validateEmail(email)) {
        resultSpan.textContent = '올바른 이메일 형식이 아닙니다.';
        resultSpan.style.color = '#e74c3c';
        emailChecked = false;
        emailAvailable = false;
        return;
    }

    try {
        resultSpan.textContent = '확인 중...';
        resultSpan.style.color = '#64748b';

        const response = await fetch(`${API_BASE_URL}/auth/check-email/${encodeURIComponent(email)}`);
        const data = await response.json();

        if (response.ok && data.available) {
            resultSpan.textContent = '✓ 사용 가능한 이메일입니다.';
            resultSpan.style.color = '#27ae60';
            emailChecked = true;
            emailAvailable = true;
        } else {
            resultSpan.textContent = '이미 사용 중인 이메일입니다.';
            resultSpan.style.color = '#e74c3c';
            emailChecked = true;
            emailAvailable = false;
        }
    } catch (error) {
        console.error('이메일 중복 확인 실패:', error);
        resultSpan.textContent = '이메일 확인 중 오류가 발생했습니다.';
        resultSpan.style.color = '#e74c3c';
        emailChecked = false;
        emailAvailable = false;
    }
}

/**
 * 비밀번호 가시성 토글
 */
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling?.querySelector('i');

    if (input.type === 'password') {
        input.type = 'text';
        if (icon) icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        if (icon) icon.className = 'fas fa-eye';
    }
}

/**
 * 이메일 형식 검증
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// 페이지 로드 시 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', function () {
    // 폼은 signup.html에서 직접 연결되므로 여기서는 생략

    // 비밀번호 강도 체크
    const passwordInput = document.getElementById('signupPassword');
    if (passwordInput && typeof checkPasswordStrength === 'function') {
        passwordInput.addEventListener('input', function () {
            const result = checkPasswordStrength(this.value);
            const strengthBar = document.getElementById('passwordStrengthBar');
            const strengthText = document.getElementById('passwordStrengthText');

            if (strengthBar) {
                strengthBar.className = 'password-strength-bar';
                if (result.strength === 1) strengthBar.classList.add('weak');
                else if (result.strength === 2) strengthBar.classList.add('medium');
                else if (result.strength >= 3) strengthBar.classList.add('strong');
            }

            if (strengthText) {
                strengthText.textContent = result.text;
                strengthText.style.color = result.color;
            }
        });
    }

    // 이메일 입력 변경 시 중복 확인 초기화
    const emailInput = document.getElementById('signupEmail');
    if (emailInput) {
        emailInput.addEventListener('input', function () {
            emailChecked = false;
            emailAvailable = false;
            const resultSpan = document.getElementById('emailCheckResult');
            if (resultSpan) resultSpan.textContent = '';
        });
    }
});

/**
 * 회원가입 처리
 */
async function handleSignup(e) {
    if (e) e.preventDefault();

    const submitBtn = document.querySelector('.signup-submit-btn');
    const originalText = submitBtn ? submitBtn.innerHTML : '가입하기';

    try {
        console.log('회원가입 시도...');

        // 필수 요소 체크
        const emailEl = document.getElementById('signupEmail');
        const passwordEl = document.getElementById('signupPassword');
        const passwordConfirmEl = document.getElementById('signupPasswordConfirm');
        const nameEl = document.getElementById('signupName');
        const memberTypeEl = document.getElementById('signupMemberType');
        const mobileEl = document.getElementById('signupMobile');
        const affiliationEl = document.getElementById('signupAffiliation');

        if (!emailEl || !passwordEl || !passwordConfirmEl || !nameEl || !memberTypeEl || !mobileEl || !affiliationEl) {
            console.error('필수 폼 요소가 누락되었습니다.');
            return;
        }

        const email = emailEl.value.trim();
        const password = passwordEl.value;
        const passwordConfirm = passwordConfirmEl.value;
        const name = nameEl.value.trim();
        const member_type = memberTypeEl.value;
        const mobile = mobileEl.value.trim();
        const affiliation = affiliationEl.value.trim();

        // 선택 값 수집 (안전하게)
        const getValue = (id) => document.getElementById(id)?.value?.trim() || '';

        const name_en = getValue('signupNameEn');
        const phone = getValue('signupPhone');
        const affiliation_en = getValue('signupAffiliationEn');
        const department = getValue('signupDepartment');
        const position = getValue('signupPosition');
        const education_level = getValue('signupEducation');
        const major_field = getValue('signupMajor');
        const research_interests = getValue('signupResearch');
        const postal_code = getValue('signupPostal');
        const address = getValue('signupAddress');
        const address_detail = getValue('signupAddressDetail');

        // 유효성 검증
        if (!emailChecked || !emailAvailable) {
            alert('이메일 중복 확인을 먼저 해주세요.');
            return;
        }

        if (password.length < 8) {
            alert('비밀번호는 8자 이상이어야 합니다.');
            return false;
        }

        if (password !== passwordConfirm) {
            alert('비밀번호가 일치하지 않습니다.');
            return false;
        }

        // 로딩 표시
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 가입 처리 중...';
            submitBtn.disabled = true;
        }

        const signupData = {
            email, password, name, name_en,
            mobile, phone,
            affiliation, affiliation_en, department, position,
            education_level, major_field, research_interests,
            member_type,
            postal_code, address, address_detail
        };

        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(signupData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            alert('회원가입이 완료되었습니다!\n승인 후 로그인해주시기 바랍니다.');
            window.location.href = 'login.html';
        } else {
            throw new Error(result.error || '회원가입에 실패했습니다.');
        }
    } catch (error) {
        console.error('회원가입 오류:', error);
        alert(error.message);
    } finally {
        if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
}
