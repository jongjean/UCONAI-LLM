# 💳 카드결제 UI 구현 가이드

## 📋 개요
마이페이지 > 회비 납부 페이지에 전문적인 카드결제 UI/UX가 구현되었습니다.  
**데모 모드**로 동작하며, 실제 결제는 백엔드 API 연동 후 가능합니다.

---

## 🎯 구현된 기능

### 1. 카드 정보 입력 폼
- ✅ **카드번호**: 4자리씩 4개 필드, 자동 포커스 이동
- ✅ **유효기간**: MM/YY 형식, 월(01-12) 검증
- ✅ **CVC/CVV**: 3자리 보안코드 (비밀번호 마스킹)
- ✅ **카드 소유자 이름**: 실시간 대문자 변환
- ✅ **카드사 선택**: 10개 주요 카드사 드롭다운
- ✅ **할부 개월**: 일시불 ~ 12개월

### 2. 실시간 카드 비주얼
입력하는 즉시 카드 모양에 반영:
- 카드번호 (•••• 마스킹)
- 유효기간 (MM/YY)
- 카드 소유자 이름 (대문자)
- 카드사 이름
- 카드 칩 디자인 효과

### 3. 입력 검증
- 카드번호 16자리 필수 (숫자만)
- 유효기간 월 범위 체크 (01-12)
- CVC 3자리 필수
- 카드 소유자 이름 필수
- 카드사 선택 필수

### 4. 결제 시뮬레이션
- 검증 통과 후 2초 로딩 애니메이션
- 결제 완료 메시지 표시
- 실제 결제는 **백엔드 API 연동 필요**

---

## 🖥️ 사용 방법

### 사용자 관점
1. **마이페이지** > **회비 납부** 접속
2. **결제 수단 선택**에서 '신용카드' 클릭
3. **카드 정보 입력**:
   - 카드번호 4자리씩 입력 (자동 다음 칸 이동)
   - 유효기간 MM/YY
   - CVC 3자리
   - 소유자 이름
   - 카드사 선택
   - 할부 개월 선택
4. **결제 진행 동의** 체크
5. **결제하기** 버튼 클릭
6. 데모 모드: 2초 후 결제 완료 메시지

---

## 🔌 백엔드 API 연동 가이드

현재는 **프론트엔드 UI만 구현**되어 있습니다.  
실제 결제 처리를 위해서는 **서버 사이드 API**가 필요합니다.

### 추천 PG사 (Payment Gateway)
1. **토스페이먼츠** (Toss Payments)
   - 공식 문서: https://docs.tosspayments.com/
   - SDK: `https://js.tosspayments.com/v1`
   - 특징: 간편한 연동, 한국형 UI

2. **아임포트** (Iamport)
   - 공식 문서: https://portone.gitbook.io/
   - SDK: `https://cdn.iamport.kr/v1/iamport.js`
   - 특징: 다양한 PG사 통합

3. **나이스페이** (NICEPAY)
   - 공식 문서: https://developer.nicepay.co.kr/
   - 특징: 대형 은행 제휴

---

## 📝 연동 구현 예시

### 1. 토스페이먼츠 연동

#### Step 1: HTML에 SDK 추가
```html
<head>
    <script src="https://js.tosspayments.com/v1"></script>
</head>
```

#### Step 2: JavaScript 결제 요청
```javascript
function processPayment() {
    // 카드 정보 검증
    if (!validateCardInfo()) {
        return;
    }

    // 결제 금액 가져오기
    const totalAmountText = document.getElementById('totalAmount').textContent;
    const totalAmount = parseInt(totalAmountText.replace(/[^0-9]/g, ''));

    // 토스페이먼츠 초기화
    const clientKey = 'YOUR_CLIENT_KEY'; // 실제 키로 변경
    const tossPayments = TossPayments(clientKey);

    // 결제 요청
    tossPayments.requestPayment('카드', {
        amount: totalAmount,
        orderId: 'ORDER_' + Date.now(),
        orderName: '한국ESG학회 회비',
        customerName: document.getElementById('cardHolder').value,
        successUrl: window.location.origin + '/payment-success.html',
        failUrl: window.location.origin + '/payment-fail.html',
    }).catch(function (error) {
        if (error.code === 'USER_CANCEL') {
            alert('결제를 취소했습니다.');
        } else {
            alert('결제 실패: ' + error.message);
        }
    });
}
```

#### Step 3: 백엔드 검증 API
```javascript
// payment-success.html에서 호출
async function verifyPayment() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    const paymentKey = urlParams.get('paymentKey');
    const amount = urlParams.get('amount');

    // 백엔드 API로 검증 요청
    const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            orderId,
            paymentKey,
            amount
        })
    });

    const result = await response.json();
    if (result.success) {
        // 결제 완료 처리
        alert('결제가 완료되었습니다!');
    } else {
        alert('결제 검증 실패');
    }
}
```

---

### 2. 아임포트 연동

#### Step 1: HTML에 SDK 추가
```html
<head>
    <script src="https://cdn.iamport.kr/v1/iamport.js"></script>
</head>
```

#### Step 2: JavaScript 결제 요청
```javascript
function processPayment() {
    // 카드 정보 검증
    if (!validateCardInfo()) {
        return;
    }

    // 아임포트 초기화
    const IMP = window.IMP;
    IMP.init('YOUR_IMP_CODE'); // 가맹점 식별코드

    // 결제 데이터
    const totalAmountText = document.getElementById('totalAmount').textContent;
    const totalAmount = parseInt(totalAmountText.replace(/[^0-9]/g, ''));

    IMP.request_pay({
        pg: 'html5_inicis', // PG사 선택
        pay_method: 'card',
        merchant_uid: 'ORDER_' + Date.now(),
        name: '한국ESG학회 회비',
        amount: totalAmount,
        buyer_email: 'buyer@example.com',
        buyer_name: document.getElementById('cardHolder').value,
        buyer_tel: '010-1234-5678',
    }, function(response) {
        if (response.success) {
            // 백엔드 검증 API 호출
            verifyPayment(response);
        } else {
            alert('결제 실패: ' + response.error_msg);
        }
    });
}
```

---

## 🛡️ 보안 고려사항

### ⚠️ 절대 하지 말아야 할 것
1. **카드 정보를 서버에 저장하지 마세요**
   - PCI-DSS 인증 위반
   - 법적 책임 발생

2. **카드번호를 로그에 남기지 마세요**
   - 보안 사고 위험
   - 개인정보 유출

3. **클라이언트에서 결제 승인하지 마세요**
   - 반드시 서버에서 검증
   - 위변조 방지

### ✅ 해야 할 것
1. **PG사 SDK 사용**
   - 카드 정보는 PG사로 직접 전송
   - 서버는 결제 토큰만 받음

2. **HTTPS 필수**
   - SSL 인증서 적용
   - 암호화 통신

3. **서버 검증 필수**
   - 결제 금액 재검증
   - 주문 정보 확인
   - 이중 결제 방지

---

## 📂 파일 구조

```
pages/mypage/
└── payment.html          # 카드결제 UI 통합 페이지
    ├── 카드 정보 입력 폼
    ├── 실시간 카드 비주얼
    ├── 결제 검증 로직
    └── 백엔드 API 연동 가이드 (주석)
```

---

## 🚀 다음 단계

### 백엔드 개발 필요
1. **결제 API 서버 구축**
   - Node.js, Python, Java 등
   - PG사 서버 API 연동

2. **데이터베이스 설계**
   - 주문 정보 저장
   - 결제 내역 관리
   - 영수증 발급

3. **웹훅(Webhook) 처리**
   - 결제 완료 알림 수신
   - 자동 영수증 발송
   - 회원 상태 업데이트

### 추가 기능 구현
1. **결제 완료 페이지**
   - `payment-success.html`
   - 영수증 표시
   - 이메일 발송

2. **결제 실패 페이지**
   - `payment-fail.html`
   - 에러 원인 표시
   - 재시도 안내

3. **결제 내역 페이지**
   - `pages/mypage/history.html` 업그레이드
   - 영수증 다운로드
   - 환불 신청

---

## 🎨 UI/UX 특징

### 카드 비주얼 디자인
- 그라디언트 배경 (보라~파랑)
- 카드 칩 효과 (금색)
- 실시간 입력 반영
- 반응형 디자인

### 사용자 경험
- 자동 포커스 이동
- 숫자만 입력 가능
- 월 범위 자동 검증
- CVC 보안 마스킹
- 할부 개월 선택

### 접근성
- 명확한 레이블
- 도움말 툴팁
- 에러 메시지
- 키보드 네비게이션

---

## 📞 문의

카드결제 기능 관련 문의:
- 이메일: kohmh@ssu.ac.kr
- 전화: 010-4263-7715

---

## 📜 라이선스

© 2025 Korean ESG Association. All rights reserved.
