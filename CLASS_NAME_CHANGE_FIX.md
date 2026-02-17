# 🔧 클래스 이름 변경 - GenSpark 배포 시스템 회피

## 📊 문제 분석

**GenSpark 배포 시스템이 `auth-only` 클래스를 제거하고 있습니다.**

- 파일: `auth-only logged-in/logged-out` 존재 ✅
- 배포: `auth-only: false` ❌

---

## ✅ 해결 방법: 클래스 이름 변경

### **이전 (제거되는 클래스)**:
```html
<li class="auth-only logged-out">회원가입</li>
<li class="auth-only logged-in">로그아웃</li>
```

### **변경 후 (안전한 클래스)**:
```html
<li class="menu-guest menu-logout">회원가입</li>
<li class="menu-user menu-login">로그아웃</li>
```

---

## 🎯 변경 내용

### 1. **HTML 클래스 변경**
- `auth-only logged-out` → `menu-guest menu-logout`
- `auth-only logged-in` → `menu-user menu-login`

### 2. **CSS 선택자 변경**
```css
/* 기본: 게스트 메뉴 표시 */
.dropdown-menu .menu-guest { display: list-item !important; }
.dropdown-menu .menu-user { display: none !important; }

/* 로그인 시: 사용자 메뉴 표시 */
body.user-logged-in .dropdown-menu .menu-guest { display: none !important; }
body.user-logged-in .dropdown-menu .menu-user { display: list-item !important; }
```

### 3. **디버깅 스크립트 변경**
- `querySelector('.auth-only')` → `querySelector('.menu-guest')`
- `querySelector('.menu-user')`

---

## 📝 수정 파일

1. ✅ `pages/mypage/profile.html` - 클래스 이름 변경
2. ✅ `css/style.css` - CSS 선택자 변경
3. ✅ `includes/header.html` - 클래스 이름 변경

---

## 🚀 재배포

### **GenSpark → Publish 탭**
1. Unpublish
2. 1분 대기
3. Publish
4. 3-5분 빌드

---

## 🔍 배포 후 확인

### **Console (F12)**:
```javascript
// 성공 케이스:
3. 게스트 메뉴 개수: 2
4. 로그인 메뉴 개수: 7
5. #logoutBtn 존재: true

[1] "회원가입" | menu-guest: true, menu-user: false
[9] "로그아웃" | menu-guest: false, menu-user: true
```

---

## 💡 왜 이렇게 했나?

**GenSpark가 `auth-only`, `logged-in/out` 같은 특정 클래스를 필터링**하고 있을 가능성이 높습니다.

보안이나 최적화 목적으로 특정 패턴의 클래스를 제거하는 것으로 추정됩니다.

따라서 **일반적인 이름**으로 변경하여 회피합니다.

---

**재배포하고 Console 로그를 확인하세요!** 🚀
