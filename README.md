# 보험 사이트 (정적 시안)

GitHub Pages: https://yeshm-studio.github.io/insurance-site/

| 파일 | 내용 |
|---|---|
| `index.html` | 메인 (보험료 계산기, 상담 신청) |
| `recruit.html` | FP 채용·세미나 신청 |
| `login.html` | 로그인 + 비밀번호 찾기(재설정 메일) |
| `signup.html` | 회원가입 |
| `assets/fb.js` | Firebase 공통 코드 (로그인 상태, 회원 저장, 폼 저장) |
| `assets/firebase-config.js` | **Firebase 연결값 — 이 파일만 바꾸면 다른 계정으로 옮겨짐** |
| `firestore.rules` | Firestore 보안 규칙 |

## 저장되는 곳 (Firestore)

- `users/{uid}`: 회원 (이름, 이메일, 휴대폰)
- `consults`: 메인 상담 신청
- `applies`: 채용·세미나 신청

신청서는 사이트에서 조회할 수 없고 Firebase 콘솔 → Firestore에서 확인합니다.

## 회사 계정으로 옮기는 방법

1. 회사 구글 계정으로 Firebase 프로젝트 생성
2. Authentication → 이메일/비밀번호 사용 설정
3. Firestore Database 생성 (서울 `asia-northeast3`, 프로덕션 모드) → 규칙 탭에 `firestore.rules` 붙여넣고 게시
4. Authentication → 설정 → 승인된 도메인에 실제 사이트 도메인 추가
5. 프로젝트 설정 → 웹 앱 등록 → 나온 `firebaseConfig` 값을 `assets/firebase-config.js`에 붙여넣기
6. 사이트 파일 전체를 회사 호스팅(또는 회사 GitHub)에 올리기

기존 회원·신청 데이터까지 옮겨야 하면 Firebase 콘솔의 내보내기/가져오기(또는 `firebase auth:export`)를 사용합니다.
