import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already logged in, skip to home
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) navigate('/');
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError('구글 로그인에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* App Logo/Icon */}
        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-200 mb-8 animate-bounce-slow">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>

        <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">DecisionStock</h1>
        <p className="text-slate-500 text-center mb-12 font-medium leading-relaxed">
          감정에 휘둘리지 않는 투자의 시작,<br/>
          당신의 투자 심리를 기록하고 복기하세요.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold w-full mb-6 border border-red-100 flex items-center gap-2">
            <span>🚨</span> {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 hover:border-slate-200 py-4 px-6 rounded-2xl font-bold text-slate-700 transition-all active:scale-[0.98] shadow-sm hover:shadow-md mb-4"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          {loading ? '로그인 중...' : 'Google 계정으로 시작하기'}
        </button>

        <p className="text-[10px] text-slate-400 text-center mt-8">
          로그인 시 DecisionStock의 서비스 이용약관 및<br/>
          개인정보 처리방침에 동의하게 됩니다.
        </p>
      </div>

      {/* Background Decoration */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-50 rounded-full -z-10 blur-3xl opacity-50"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-50 rounded-full -z-10 blur-3xl opacity-50"></div>
    </div>
  );
}
