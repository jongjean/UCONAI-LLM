# 🔍 이미지 편집 문제 진단 리포트

**문제**: 포스팅툴에서 이미지 편집 → 저장 → 메인 페이지에서 반영 안됨

---

## 📊 현재 코드 흐름 분석

### **1단계: 포스팅툴 - 편집 저장 (`js/image-editor.js`)**

```javascript
function saveImageEdits() {
    const slide = currentSlides.find(s => s.id === editorState.slideId);
    
    if (slide) {
        // ✅ 이미지 변형 저장
        slide.imageTransform = {
            zoom: editorState.zoom,           // 예: 120
            positionX: editorState.positionX, // 예: 50
            positionY: editorState.positionY  // 예: -30
        };
        
        // ✅ 마스크 투명도 저장
        slide.maskOpacity = editorState.maskOpacity; // 예: 60
        
        // ✅ localStorage 저장
        localStorage.setItem('esg_hero_slides', JSON.stringify(currentSlides));
        
        // ✅ 포스팅툴 UI 업데이트
        renderSlides();
        
        console.log('✅ 이미지 편집 저장:', {
            transform: slide.imageTransform,
            maskOpacity: slide.maskOpacity
        });
    }
    
    closeImageEditor();
}
```

**✅ 이 부분은 정상 작동 예상**

---

### **2단계: 메인 페이지 - 슬라이드 로드 (`js/main.js`)**

```javascript
slidesData.forEach((slide, index) => {
    if (slide.image) {
        const maskOpacity = (slide.maskOpacity !== undefined) 
            ? slide.maskOpacity / 100 
            : 0.4;
        
        // ⚠️ 문제 지점: imageTransform 적용
        if (slide.imageTransform) {
            const transform = slide.imageTransform;
            const scale = transform.zoom / 100;
            
            // 🔥 핵심: backgroundSize와 backgroundPosition으로 변환
            slideElement.style.backgroundSize = `${scale * 100}%`;
            slideElement.style.backgroundPosition = 
                `${50 + (transform.positionX / 8)}% ${50 + (transform.positionY / 4.5)}%`;
        }
    }
});
```

---

## 🚨 문제점 분석

### **문제 1: Transform 좌표계 vs Background 좌표계 불일치**

| 속성 | 편집기 (`image-editor.js`) | 메인 페이지 (`main.js`) |
|------|---------------------------|-------------------------|
| **확대/축소** | `transform: scale(1.2)` | `background-size: 120%` ✅ |
| **X 이동** | `translate(50px, ...)` | `background-position-x: 56.25%` ⚠️ |
| **Y 이동** | `translate(..., -30px)` | `background-position-y: 43.33%` ⚠️ |

**문제**:
- 편집기에서는 **픽셀 단위** (`50px`, `-30px`)
- 메인 페이지에서는 **퍼센트 변환** (`positionX / 8`, `positionY / 4.5`)
- **변환 공식이 임의적**이고 정확하지 않음!

---

### **문제 2: 편집 모달 크기 vs 메인 페이지 크기 차이**

```
편집 모달:      800px x 450px (추정)
메인 페이지:    100vw x 100vh (전체 화면)
```

**결과**:
- 편집기에서 "50px 오른쪽"은 메인에서 "X%"로 변환
- 화면 크기가 다르면 비율이 맞지 않음!

---

### **문제 3: 마스크 투명도는 반영될 가능성 높음**

```javascript
const maskOpacity = (slide.maskOpacity !== undefined) 
    ? slide.maskOpacity / 100 
    : 0.4;

slideElement.style.backgroundImage = 
    `linear-gradient(rgba(0, 0, 0, ${maskOpacity}), ...), url('...')`;
```

**✅ 이 부분은 단순 치환이므로 정상 작동 예상**

---

## 🧪 진단 테스트 (코드 작업 전 필수!)

### **테스트 1: localStorage 확인**

**메인 페이지에서 F12 → Console:**

```javascript
const data = JSON.parse(localStorage.getItem('esg_hero_slides'));
console.log('=== localStorage 데이터 ===');
data.forEach((slide, i) => {
    console.log(`\n[슬라이드 ${i}]`);
    console.log('제목:', slide.title);
    console.log('imageTransform:', slide.imageTransform);
    console.log('maskOpacity:', slide.maskOpacity);
});
```

**기대 결과:**
```
[슬라이드 0]
제목: 한국ESG학회
imageTransform: { zoom: 120, positionX: 50, positionY: -30 }
maskOpacity: 60
```

**❌ 만약 `imageTransform: undefined`라면:**
→ 포스팅툴에서 저장이 안 된 것! (1단계 문제)

**✅ 만약 데이터가 있다면:**
→ 저장은 되는데 메인 페이지 적용이 안 되는 것! (2단계 문제)

---

### **테스트 2: 메인 페이지 적용 확인**

**메인 페이지에서 F12 → Console:**

```javascript
const slides = document.querySelectorAll('.slide');
console.log('=== 메인 페이지 슬라이드 스타일 ===');
slides.forEach((slide, i) => {
    const style = window.getComputedStyle(slide);
    console.log(`\n[슬라이드 ${i}]`);
    console.log('backgroundSize:', style.backgroundSize);
    console.log('backgroundPosition:', style.backgroundPosition);
    console.log('backgroundImage:', style.backgroundImage.substring(0, 150) + '...');
});
```

**기대 결과:**
```
[슬라이드 0]
backgroundSize: 120% 120%  ← zoom: 120 적용됨
backgroundPosition: 56.25% 43.33%  ← position 적용됨
backgroundImage: linear-gradient(rgba(0, 0, 0, 0.6), ...), url(...)  ← mask 60% 적용됨
```

**❌ 만약 `backgroundSize: cover`라면:**
→ `slide.imageTransform`이 읽히지 않음!

---

### **테스트 3: Console 로그 확인**

**메인 페이지 로드 시 Console:**

```
기대:
✅ [0] "한국ESG학회" (마스크: 60%)
    이미지: https://images.unsplash.com/...
    imageTransform: { zoom: 120, positionX: 50, positionY: -30 }
```

**만약 로그에 `imageTransform` 정보가 없다면:**
→ main.js가 데이터를 못 읽는 것!

---

## 🎯 예상 솔루션 (진단 후 결정)

### **솔루션 A: localStorage 저장 안됨**
→ `saveImageEdits()`에서 `currentSlides` 참조 오류

### **솔루션 B: 좌표 변환 공식 문제**
→ `positionX / 8`, `positionY / 4.5` 공식 수정 필요

### **솔루션 C: 캐시 문제**
→ main.js가 구버전으로 로드됨

### **솔루션 D: imageTransform 조건 누락**
→ `if (slide.imageTransform)` 블록이 실행 안됨

---

## 📋 진단 체크리스트

**아래 3가지 테스트를 실행하고 결과를 보고해주세요:**

### ✅ **체크 1: 포스팅툴에서 편집 후 저장**
1. 포스팅툴 → 이미지 편집
2. 확대 120%, 오른쪽으로 이동
3. 마스크 60%
4. "적용" 클릭
5. **F12 → Console 로그 확인**
   - "✅ 이미지 편집 저장:" 메시지 있는지?
   - `transform`, `maskOpacity` 값이 보이는지?

### ✅ **체크 2: localStorage 확인**
1. **메인 페이지**에서 F12 → Console
2. 위의 **테스트 1 스크립트** 실행
3. `imageTransform`과 `maskOpacity` 값 보고

### ✅ **체크 3: 메인 페이지 스타일 확인**
1. 메인 페이지에서 F12 → Console
2. 위의 **테스트 2 스크립트** 실행
3. `backgroundSize`, `backgroundPosition` 값 보고

---

## 🚀 다음 단계

위 3가지 테스트 결과를 알려주시면:

1. **정확한 문제 지점** 파악
2. **최소한의 수정**으로 해결
3. **검증 방법** 제시

**코드 작업은 진단 완료 후 시작하겠습니다!** 🎯
