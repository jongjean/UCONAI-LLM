# 로그인/회원가입 텍스트 링크로 변경 - 2025-12-27

## 🎯 수정 내용

회원가입/로그인을 **버튼 스타일 제거하고 순수 텍스트 링크로 변경**

## ✅ 주요 변경

### 이전 (버튼 스타일 ❌)
```
┌─────────────────────────────────┐
│ [회원가입] | [로그인]  배경 있음 │
└─────────────────────────────────┘
```
- 흰색 배경
- 그림자
- 패딩
- 메뉴를 덮음

### 수정 후 (텍스트 링크 ✅)
```
회원가입 | 로그인
```
- 배경 없음
- 그림자 없음
- 패딩 없음
- 깔끔한 텍스트만

## 📱 화면 예시

### 로그인 전
```
                                    회원가입 | 로그인
┌───────────────────────────────────────────────────┐
│ 한국ESG학회    [메뉴들...]                         │
└───────────────────────────────────────────────────┘
```

### 로그인 후
```
                            👤홍길동님 | 마이페이지 | 로그아웃
┌───────────────────────────────────────────────────┐
│ 한국ESG학회    [메뉴들...]                         │
└───────────────────────────────────────────────────┘
```

## 🎨 CSS 변경

### 고정 위치 컨테이너
```css
.user-status-fixed {
    position: fixed;
    top: 10px;                    /* 상단 여백 */
    right: 20px;                  /* 우측 여백 */
    z-index: 1001;
    padding: 0;                   /* 패딩 제거 */
    background: transparent;      /* 배경 제거 */
    /* box-shadow 제거 */
}
```

### 텍스트 링크 스타일
```css
.status-link {
    font-size: 0.85rem;
    color: var(--text-dark);
    font-weight: 400;             /* 500 → 400 */
    text-decoration: none;
}

.status-link:hover {
    color: var(--primary-green);
    text-decoration: underline;   /* 호버 시 밑줄 */
}
```

### 로그인 후 스타일
```css
.user-info {
    padding: 0;                   /* 패딩 제거 */
    background: transparent;      /* 배경 제거 */
    border-radius: 0;             /* 둥근 모서리 제거 */
}

.status-btn {
    padding: 0;                   /* 패딩 제거 */
    border: none;                 /* 테두리 제거 */
    background: transparent;      /* 배경 제거 */
}

.status-btn:hover {
    text-decoration: underline;   /* 호버 시 밑줄만 */
}
```

## 📦 HTML 구조

### 로그인 후
```html
<div class="user-status-logged-in">
    <span class="user-info">
        <i class="fas fa-user-circle"></i>
        <span class="user-name">홍길동</span>님
    </span>
    <span class="status-divider">|</span>
    <a href="..." class="status-btn">마이페이지</a>
    <span class="status-divider">|</span>
    <button class="status-btn logout-btn">로그아웃</button>
</div>
```

## 🔧 주요 제거 항목

| 제거된 항목 | 이전 값 |
|------------|---------|
| background | rgba(255,255,255,0.98) |
| box-shadow | 0 2px 8px rgba(...) |
| border-radius | 8px |
| padding (컨테이너) | 10px 20px |
| padding (링크) | 6px 14px |
| border | 1px solid |

## 📂 수정 파일

1. ✅ **css/style.css** - 버튼 스타일 제거, 텍스트 링크로 변경
2. ✅ **index.html** - 로그인 후 구조에 구분선(|) 추가

## 💡 디자인 특징

- ✅ **최소주의**: 배경, 테두리, 그림자 모두 제거
- ✅ **깔끔함**: 순수 텍스트 링크
- ✅ **명확함**: 호버 시 색상 변경 + 밑줄
- ✅ **일관성**: 구분선(|)으로 항목 구분
- ✅ **비침투적**: 메뉴를 덮지 않음

## 🚀 배포

**Publish 탭**에서 다운로드!

---

**작성일**: 2025-12-27  
**상태**: ✅ 완료 - 순수 텍스트 링크로 변경!
