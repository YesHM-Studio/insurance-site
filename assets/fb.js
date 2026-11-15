// Firebase 공통 모듈 — 로그인 상태, 회원 저장, 폼 저장
import { firebaseConfig } from "./firebase-config.js";

const V = "11.10.0";
export const ready = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let mods = null;
async function load() {
  if (!ready) throw new Error("NOT_CONFIGURED");
  if (mods) return mods;
  const [app, auth, fs] = await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-auth.js`),
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`),
  ]);
  const a = app.initializeApp(firebaseConfig);
  const au = auth.getAuth(a);
  au.languageCode = "ko";
  mods = { auth, fs, au, db: fs.getFirestore(a) };
  return mods;
}

/** 한국어 에러 메시지 */
export function errText(e) {
  const c = (e && e.code) || (e && e.message) || "";
  const map = {
    NOT_CONFIGURED: "아직 회원 서버(Firebase)가 연결되지 않았어요. 잠시 후 다시 시도해 주세요.",
    "auth/invalid-email": "이메일 형식을 확인해 주세요.",
    "auth/invalid-credential": "이메일 또는 비밀번호가 맞지 않아요.",
    "auth/user-not-found": "이메일 또는 비밀번호가 맞지 않아요.",
    "auth/wrong-password": "이메일 또는 비밀번호가 맞지 않아요.",
    "auth/email-already-in-use": "이미 가입된 이메일이에요. 로그인해 주세요.",
    "auth/weak-password": "비밀번호는 8자 이상으로 정해 주세요.",
    "auth/too-many-requests": "시도가 너무 많아요. 잠시 후 다시 시도해 주세요.",
    "auth/network-request-failed": "인터넷 연결을 확인해 주세요.",
    "permission-denied": "저장 권한이 없어요. 관리자에게 문의해 주세요.",
  };
  return map[c] || "문제가 생겼어요. 잠시 후 다시 시도해 주세요.";
}

export async function signUp({ name, email, password, phone }) {
  const { auth, fs, au, db } = await load();
  const cred = await auth.createUserWithEmailAndPassword(au, email, password);
  await auth.updateProfile(cred.user, { displayName: name });
  await fs.setDoc(fs.doc(db, "users", cred.user.uid), {
    name, email, phone: phone || "", createdAt: fs.serverTimestamp(),
  });
  return cred.user;
}

export async function signIn(email, password) {
  const { auth, au } = await load();
  return (await auth.signInWithEmailAndPassword(au, email, password)).user;
}

export async function signOut() {
  const { auth, au } = await load();
  await auth.signOut(au);
}

export async function resetPassword(email) {
  const { auth, au } = await load();
  await auth.sendPasswordResetEmail(au, email);
}

/** 로그인 상태 변화 구독 (설정 전이면 null로 한 번 호출) */
export async function onUser(cb) {
  if (!ready) { cb(null); return; }
  try {
    const { auth, au } = await load();
    auth.onAuthStateChanged(au, cb);
  } catch { cb(null); }
}

/** 폼 저장 — consults / applies 컬렉션에 추가 */
export async function saveForm(collection, data) {
  const { fs, au, db } = await load();
  await fs.addDoc(fs.collection(db, collection), {
    ...data,
    uid: au.currentUser ? au.currentUser.uid : null,
    page: location.pathname,
    createdAt: fs.serverTimestamp(),
  });
}

/** 상단 유틸바: 로그인 상태에 따라 링크 바꾸기 */
export function mountUtilBar(el) {
  if (!el) return;
  onUser((u) => {
    if (u) {
      el.innerHTML = "";
      const hi = document.createElement("span");
      hi.innerHTML = "<b></b>님";
      hi.querySelector("b").textContent = u.displayName || u.email;
      hi.querySelector("b").style.color = "#fff";
      const out = document.createElement("a");
      out.href = "#"; out.textContent = "로그아웃";
      out.addEventListener("click", async (e) => { e.preventDefault(); await signOut(); location.reload(); });
      el.append(hi, out);
    } else {
      el.innerHTML = '<a href="login.html">로그인</a><a href="signup.html">회원가입</a>';
    }
  });
}
