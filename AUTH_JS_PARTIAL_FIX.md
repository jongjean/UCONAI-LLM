# ✅ auth.js 추가 완료 - 부분 수정

## 2025-01-19 20:45 KST

---

## 🔍 문제 발견

### 증상
- 미리보기에서도 로그아웃 버튼이 안 보임
- 로그인은 되어있는데 (localStorage에 user 데이터 존재)
- 마이페이지 드롭다운에 "로그인", "회원가입" 버튼만 표시

### 원인
**서브페이지들에 `auth.js`가 로드되지 않음!**

```html
<!-- 현재 상태 (잘못됨) -->
<script src="../../js/sound-effects.js"></script>
<script src="../../js/main.js"></script>
<script src="../../js/auth-manager.js"></script>
```

**auth.js가 없어서**:
- `checkLoginStatus()` 함수 실행 안됨
- `body.user-logged-in` 클래스 추가 안됨
- CSS가 메뉴를 전환하지 못함
- 로그아웃 버튼이 계속 숨겨진 상태

---

## 🔧 수정 내용

### 1. index.html
✅ 이미 수정 완료 (이전 작업)

### 2. pages/mypage/profile.html
✅ 방금 수정 완료

#### Before
```html
<script src="../../js/modal.js"></script>
<script src="../../js/main.js"></script>
```

#### After
```html
<script src="../../js/modal.js"></script>
<script src="../../js/auth.js"></script>  ← 추가
<script src="../../js/main.js"></script>
```

### 3. pages/about/greeting-new.html
✅ 방금 수정 완료

#### Before
```html
<script src="../../js/sound-effects.js"></script>
<script src="../../js/main.js"></script>
<script src="../../js/auth-manager.js"></script>
```

#### After
```html
<script src="../../js/sound-effects.js"></script>
<script src="../../js/auth.js"></script>  ← 추가
<script src="../../js/main.js"></script>
<script src="../../js/auth-manager.js"></script>
```

---

## ⚠️ 추가 작업 필요

### 나머지 모든 서브페이지에도 auth.js 추가 필요

**영향받는 페이지들** (약 50개 이상):
```
pages/about/*.html (6개)
pages/organization/*.html (3개)
pages/member/*.html (5개)
pages/core/*.html (5개)
pages/journal/*.html (6개)
pages/policy/*.html (5개)
pages/news/*.html (7개)
pages/community/*.html (5개)
pages/materials/*.html (5개)
pages/support/*.html (4개)
pages/mypage/*.html (6개)
```

---

## 🚀 일괄 수정 방법

### 방법 1: 수동 수정 (시간 소요)
각 파일을 하나씩 열어서 `auth.js` 추가

### 방법 2: 스크립트 사용 (권장)
Python/Shell 스크립트로 일괄 수정

**필요한 스크립트**:
```python
import os
import re

def add_auth_js(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # main.js 앞에 auth.js 추가
    pattern = r'(<script src="[^"]*?js/main\.js"></script>)'
    if 'auth.js' not in content and re.search(pattern, content):
        replacement = r'<script src="../../js/auth.js"></script>\n    \1'
        content = re.sub(pattern, replacement, content)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

# 모든 HTML 파일 처리
for root, dirs, files in os.walk('pages'):
    for file in files:
        if file.endswith('.html'):
            file_path = os.path.join(root, file)
            if add_auth_js(file_path):
                print(f'✅ {file_path}')
```

---

## 🧪 테스트 방법

### 수정 전 확인
```javascript
// F12 → 콘솔
console.log('auth.js 로드:', typeof LoginModal !== 'undefined');
// 결과: false (로드 안됨)

console.log('body 클래스:', document.body.className);
// 결과: "" (user-logged-in 없음)
```

### 수정 후 확인
```javascript
// F12 → 콘솔
console.log('auth.js 로드:', typeof LoginModal !== 'undefined');
// 결과: true (로드됨)

console.log('body 클래스:', document.body.className);
// 결과: "user-logged-in" (클래스 추가됨)

// 로그인 상태 확인
const user = JSON.parse(localStorage.getItem('user') || '{}');
console.log('로그인 사용자:', user);

// 메뉴 상태 확인
const loggedIn = document.querySelectorAll('.auth-only.logged-in');
loggedIn.forEach(el => {
    console.log(el.textContent.trim(), '→', window.getComputedStyle(el).display);
});
```

---

## 📊 예상 결과

### 수정 완료 후
```
✅ profile.html: auth.js 추가
✅ greeting-new.html: auth.js 추가
✅ index.html: auth.js 이미 있음

🔄 나머지 ~50개 페이지: 추가 작업 필요
```

### 모든 페이지 수정 후
```
✅ 모든 페이지에서 로그인 상태 반영
✅ 로그아웃 버튼 정상 표시
✅ body.user-logged-in 클래스 자동 추가
✅ CSS로 메뉴 자동 전환
```

---

## 🎯 즉시 조치

### 1단계: 주요 페이지 수정 (완료)
- ✅ index.html
- ✅ pages/mypage/profile.html
- ✅ pages/about/greeting-new.html

### 2단계: 나머지 페이지 수정 (필요)
**옵션 A**: 수동으로 하나씩 수정 (시간 소요)
**옵션 B**: 스크립트로 일괄 수정 (빠름)

### 3단계: 재배포
- Unpublish → Publish
- 3-5분 빌드
- 시크릿 모드로 테스트

---

## 🚨 중요

**현재 상태**:
- index.html: ✅ 작동함
- profile.html: ✅ 수정 완료 (재배포 후 작동)
- greeting-new.html: ✅ 수정 완료 (재배포 후 작동)
- **나머지 ~47개 페이지**: ❌ 여전히 로그아웃 버튼 안 보임

**권장 조치**:
1. 주요 페이지 3개만 먼저 재배포
2. 테스트 확인
3. 나머지 페이지 일괄 수정
4. 최종 재배포

---

## 📝 다음 작업

**사용자 확인 후 결정**:

### 옵션 1: 일단 재배포 (빠름)
- 현재 수정된 3개 페이지만 먼저 확인
- 작동 확인 후 나머지 작업 진행

### 옵션 2: 모든 페이지 일괄 수정 후 재배포 (권장)
- Python 스크립트로 모든 페이지 수정
- 한 번에 완전히 해결
- 시간: 약 5분

---

**어떻게 진행할까요?**
1. 일단 현재 수정된 3개 페이지만 재배포하고 테스트?
2. 모든 페이지 일괄 수정 후 한 번에 재배포?
