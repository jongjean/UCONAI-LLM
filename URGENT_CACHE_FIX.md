# 🔥 긴급 캐시 클리어 가이드

**문제**: 수정한 코드가 반영되지 않고 원상복구됨  
**원인**: 브라우저 캐시가 구버전 JS 파일을 로드

---

## ⚡ **즉시 실행 (3단계)**

### **1단계: 완전 초기화 (F12 Console)**

포스팅툴 페이지에서 F12 → Console에 복사+붙여넣기:

```javascript
console.clear();
console.log('🔥 완전 초기화 시작...');

// Service Worker 제거
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(regs => {
        regs.forEach(reg => reg.unregister());
        console.log('✅ Service Worker 제거 완료');
    });
}

// 캐시 삭제
if ('caches' in window) {
    caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
        console.log('✅ 캐시 삭제 완료');
    });
}

// localStorage 확인
console.log('📦 현재 localStorage:', localStorage.getItem('esg_hero_slides') ? '데이터 있음' : '데이터 없음');

console.log('⏳ 3초 후 새로고침...');
setTimeout(() => {
    window.location.reload(true);
}, 3000);
```

---

### **2단계: 브라우저 캐시 삭제**

1. **Ctrl + Shift + Delete** 누르기
2. **전체 기간** 선택
3. ✅ **쿠키 및 기타 사이트 데이터**
4. ✅ **캐시된 이미지 및 파일**
5. **데이터 삭제** 클릭

---

### **3단계: 강제 새로고침 (10회!)**

```
Ctrl + Shift + R (10번 연속!)
```

---

## 🔍 **파일 버전 확인**

포스팅툴 페이지에서 F12 → Console:

```javascript
console.log('=== 파일 버전 확인 ===');

// 1. posting-tool.js
const postingScript = document.querySelector('script[src*="posting-tool.js"]');
console.log('posting-tool.js:', postingScript?.src || '❌ 없음');

// 2. image-editor.js
const editorScript = document.querySelector('script[src*="image-editor.js"]');
console.log('image-editor.js:', editorScript?.src || '❌ 없음');

// 3. 함수 존재 확인
console.log('handleMaskChange 존재:', typeof handleMaskChange !== 'undefined' ? '✅' : '❌');
console.log('updateMaskOpacity 존재:', typeof updateMaskOpacity !== 'undefined' ? '✅' : '❌');

// 4. 마스크 슬라이더 확인
const maskSlider = document.getElementById('maskSlider');
console.log('maskSlider 존재:', maskSlider ? '✅' : '❌');
```

**기대 출력:**
```
posting-tool.js: https://.../js/posting-tool.js?v=20250119-MASK
image-editor.js: https://.../js/image-editor.js?v=20250119-MASK
handleMaskChange 존재: ✅
updateMaskOpacity 존재: ✅
maskSlider 존재: ✅
```

---

## 🚨 **여전히 안 되면**

### **시크릿 모드 테스트**

1. **Ctrl + Shift + N** (시크릿 모드)
2. 포스팅툴 URL 붙여넣기
3. 마스크 슬라이더 확인

**시크릿 모드에서 작동하면** → 캐시 문제 확실!

---

## 💉 **강제 슬라이더 주입 (최후의 수단)**

포스팅툴 페이지 F12 → Console:

```javascript
console.log('🔥 마스크 슬라이더 강제 주입!');

// 1. 기존 슬라이더 찾기
let maskGroup = document.querySelector('.control-group:has(#maskSlider)');

if (!maskGroup) {
    console.log('마스크 슬라이더 없음 → 생성');
    
    // 2. 줌 슬라이더 다음에 삽입
    const zoomGroup = document.querySelector('.control-group:has(#zoomSlider)');
    
    if (zoomGroup) {
        maskGroup = document.createElement('div');
        maskGroup.className = 'control-group';
        maskGroup.innerHTML = `
            <label><i class="fas fa-adjust"></i> 마스크 투명도</label>
            <input type="range" id="maskSlider" min="0" max="100" value="40" step="5">
            <span id="maskValue">40%</span>
        `;
        
        zoomGroup.parentNode.insertBefore(maskGroup, zoomGroup.nextSibling);
        
        // 3. 이벤트 연결
        const maskSlider = document.getElementById('maskSlider');
        const maskValue = document.getElementById('maskValue');
        
        maskSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            maskValue.textContent = value + '%';
            
            // 에디터 캔버스에 즉시 적용
            const editorCanvas = document.getElementById('editorCanvas');
            if (editorCanvas) {
                const opacity = value / 100;
                editorCanvas.style.background = `linear-gradient(rgba(0, 0, 0, ${opacity}), rgba(0, 0, 0, ${opacity}))`;
            }
            
            console.log('마스크 투명도 변경:', value + '%');
        });
        
        console.log('✅ 마스크 슬라이더 생성 완료!');
    } else {
        console.error('❌ 줌 슬라이더를 찾을 수 없습니다.');
    }
} else {
    console.log('✅ 마스크 슬라이더가 이미 있습니다.');
}

// 4. 편집기 열기 테스트
console.log('테스트: 첫 번째 슬라이드 편집 버튼 찾기...');
const editBtn = document.querySelector('.image-action-btn.edit');
if (editBtn) {
    console.log('✅ 편집 버튼 발견 - 클릭해서 테스트하세요!');
} else {
    console.log('⚠️ 편집 버튼 없음 - 이미지를 먼저 업로드하세요.');
}
```

---

## 🎯 **최종 확인 체크리스트**

실행 후 확인:

- [ ] Console에 "✅ 마스크 슬라이더 생성 완료!" 표시
- [ ] 편집 모달에서 "마스크 투명도" 슬라이더 보임
- [ ] 슬라이더 조정 시 실시간 미리보기 작동
- [ ] "적용" 버튼 클릭 시 포스팅툴로 돌아감
- [ ] 메인 페이지 새로고침 시 마스크 반영

---

## 📞 **결과 보고**

위 3단계 실행 후:

1. **파일 버전 확인** 스크립트 결과
2. **시크릿 모드** 테스트 결과
3. **강제 주입** 스크립트 실행 결과

를 알려주세요! 즉시 대응하겠습니다! 🚀
