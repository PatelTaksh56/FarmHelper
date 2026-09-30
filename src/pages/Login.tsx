import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';
import {
  loginWithEmail,
  registerWithEmail,
  signInWithGoogle,
  sendMobileOtp,
  setupRecaptcha,
  sendPasswordReset,
} from '../services/authService';
import { ConfirmationResult } from 'firebase/auth';

type PageTab = 'login' | 'register' | 'forgot';
type LoginMethod = 'email' | 'mobile';

export const Login: React.FC = () => {
  const { t } = useTranslation();
  const [pageTab, setPageTab] = useState<PageTab>('login');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regShowPassword, setRegShowPassword] = useState(false);

  // Login - Email form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginShowPassword, setLoginShowPassword] = useState(false);

  // Login - Mobile OTP state
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpConfirmation, setOtpConfirmation] = useState<ConfirmationResult | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  const clearMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const switchTab = (tab: PageTab) => {
    setPageTab(tab);
    clearMessages();
  };

  // Handle Email Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const name = regFullName.trim();
    if (!name || name.length < 2) {
      setErrorMessage(t('validation.nameMinLength'));
      return;
    }
    if (!regEmail || !regEmail.includes('@')) {
      setErrorMessage(t('validation.emailInvalid'));
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMessage(t('validation.passwordMinLength'));
      return;
    }

    setLoading(true);
    try {
      await registerWithEmail(regEmail, regPassword, name, regMobile || undefined);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('Email address is already registered. Please sign in instead.');
      } else {
        setErrorMessage(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Password reset state
  const [resetEmail, setResetEmail] = useState('');

  // Handle Email Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!loginEmail || !loginEmail.includes('@')) {
      setErrorMessage(t('validation.emailInvalid'));
      return;
    }
    if (!loginPassword) {
      setErrorMessage(t('validation.passwordMinLength'));
      return;
    }

    setLoading(true);
    try {
      await loginWithEmail(loginEmail, loginPassword);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setErrorMessage('Invalid email address or password.');
      } else {
        setErrorMessage(err.message || 'Sign in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Reset Email
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!resetEmail || !resetEmail.includes('@')) {
      setErrorMessage(t('validation.emailInvalid'));
      return;
    }

    setLoading(true);
    try {
      await sendPasswordReset(resetEmail);
      setSuccessMessage(`Password reset link sent to ${resetEmail}. Please check your email inbox and spam folder.`);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setErrorMessage('No account found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMessage('Invalid email address format.');
      } else {
        setErrorMessage(err.message || 'Failed to send password reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Mobile Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length < 10) {
      setErrorMessage(t('validation.mobileInvalid'));
      return;
    }

    setLoading(true);
    try {
      const verifier = setupRecaptcha('recaptcha-container');
      const confirmation = await sendMobileOtp(mobileNumber, verifier);
      setOtpConfirmation(confirmation);
      setSuccessMessage(`OTP sent to +91 ${mobileNumber}`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!otpCode || otpCode.length < 6) {
      setErrorMessage('Please enter the 6-digit OTP received.');
      return;
    }
    setLoading(true);
    try {
      if (!otpConfirmation) throw new Error('No OTP session found.');
      await otpConfirmation.confirm(otpCode);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign-in
  const handleGoogleSignIn = async () => {
    clearMessages();
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Google sign-in was cancelled or failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-surface p-4 sm:p-6 font-body">
      <div id="recaptcha-container"></div>

      {/* Main Auth Card */}
      <div className="relative w-full max-w-[500px] bg-[#FFFDF9] rounded-xl border border-pressed-sand shadow-modal-tray overflow-hidden">
        <div className="p-6 sm:p-8">
          {/* Brand Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#F0F4E8] border border-[#91A35A]/30 flex items-center justify-center text-harvest-olive mb-3 shadow-sm">
              <span className="material-symbols-outlined text-2xl">agriculture</span>
            </div>
            <h1 className="font-headline text-2xl font-bold text-charred-soil text-center leading-tight">
              {pageTab === 'login'
                ? t('auth.login')
                : pageTab === 'register'
                ? t('auth.register')
                : 'Reset Password'}
            </h1>
            <p className="text-xs text-umber-brown text-center mt-1">
              {pageTab === 'forgot'
                ? 'Enter your registered email to receive a password reset link'
                : t('auth.subtitle')}
            </p>
          </div>

          {/* Page Tabs: Login / Register */}
          {pageTab !== 'forgot' && (
            <div className="w-full bg-[#F3F0E8] p-1 rounded-xl flex items-center mb-6">
              <button
                type="button"
                onClick={() => switchTab('login')}
                className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  pageTab === 'login'
                    ? 'bg-[#FFFDF9] text-harvest-olive shadow-sm font-semibold'
                    : 'text-umber-brown hover:text-charred-soil'
                }`}
              >
                <span className="material-symbols-outlined text-base">login</span>
                <span>{t('auth.login')}</span>
              </button>
              <button
                type="button"
                onClick={() => switchTab('register')}
                className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  pageTab === 'register'
                    ? 'bg-[#FFFDF9] text-harvest-olive shadow-sm font-semibold'
                    : 'text-umber-brown hover:text-charred-soil'
                }`}
              >
                <span className="material-symbols-outlined text-base">person_add</span>
                <span>{t('auth.register')}</span>
              </button>
            </div>
          )}

          {/* Error/Success Banners */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2 animate-fadeIn">
              <span className="material-symbols-outlined text-sm text-red-600 mt-0.5">error</span>
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 bg-sprout-wash border border-sunlit-sage/40 text-harvest-olive text-xs rounded-lg flex items-center gap-2 animate-fadeIn">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* LOGIN TAB */}
          {pageTab === 'login' && (
            <div className="space-y-4">
              {/* Method Switcher: Email vs Mobile OTP */}
              <div className="flex border-b border-pressed-sand pb-3 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('email');
                    clearMessages();
                  }}
                  className={`text-xs font-semibold pb-1 cursor-pointer transition-colors ${
                    loginMethod === 'email'
                      ? 'text-harvest-olive border-b-2 border-harvest-olive font-bold'
                      : 'text-umber-brown hover:text-charred-soil'
                  }`}
                >
                  {t('auth.email')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('mobile');
                    clearMessages();
                  }}
                  className={`text-xs font-semibold pb-1 cursor-pointer transition-colors ${
                    loginMethod === 'mobile'
                      ? 'text-harvest-olive border-b-2 border-harvest-olive font-bold'
                      : 'text-umber-brown hover:text-charred-soil'
                  }`}
                >
                  {t('auth.mobileNumber')} (OTP)
                </button>
              </div>

              {/* Email Sign In Form */}
              {loginMethod === 'email' && (
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-charred-soil mb-1.5">
                      {t('auth.email')}
                    </label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder={t('auth.enterEmail')}
                      className="w-full bg-[#F6F3EC] border border-pressed-sand rounded-lg px-3.5 py-2.5 text-sm text-charred-soil focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-charred-soil">
                        {t('auth.password')}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setResetEmail(loginEmail);
                          switchTab('forgot');
                        }}
                        className="text-xs font-semibold text-harvest-olive hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={loginShowPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder={t('auth.enterPassword')}
                        className="w-full bg-[#F6F3EC] border border-pressed-sand rounded-lg px-3.5 py-2.5 text-sm text-charred-soil focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setLoginShowPassword(!loginShowPassword)}
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-umber-brown hover:text-charred-soil cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-lg">
                          {loginShowPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-md bg-harvest-olive hover:bg-harvest-olive-dark text-white text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <span>{t('auth.signinBtn')}</span>
                    )}
                  </button>
                </form>
              )}

              {/* Mobile OTP Form */}
              {loginMethod === 'mobile' && (
                <div className="space-y-4">
                  {!otpConfirmation ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-charred-soil mb-1.5">
                          {t('auth.mobileNumber')}
                        </label>
                        <div className="flex gap-2">
                          <span className="px-3 py-2.5 bg-[#EAE5D9] border border-pressed-sand rounded-lg text-sm font-semibold text-charred-soil flex items-center">
                            🇮🇳 +91
                          </span>
                          <input
                            type="tel"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                            placeholder={t('auth.enterMobile')}
                            maxLength={10}
                            className="flex-1 bg-[#F6F3EC] border border-pressed-sand rounded-lg px-3.5 py-2.5 text-sm text-charred-soil focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none"
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-md bg-harvest-olive hover:bg-harvest-olive-dark text-white text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {loading ? (
                          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                          <span>Send OTP Verification Code</span>
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-charred-soil mb-1.5">
                          Enter 6-Digit OTP Code
                        </label>
                        <input
                          type="text"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="123456"
                          maxLength={6}
                          className="w-full bg-[#F6F3EC] border border-pressed-sand rounded-lg px-3.5 py-2.5 text-center tracking-widest text-lg font-bold text-charred-soil focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none"
                          required
                          disabled={loading}
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setOtpConfirmation(null);
                            setOtpCode('');
                            clearMessages();
                          }}
                          className="px-4 py-2.5 rounded-md border border-pressed-sand text-umber-brown hover:text-charred-soil text-xs font-semibold"
                        >
                          Change Number
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 py-2.5 rounded-md bg-harvest-olive hover:bg-harvest-olive-dark text-white text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {loading ? (
                            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          ) : (
                            <span>Verify OTP & Sign In</span>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* FORGOT / RESET PASSWORD TAB */}
          {pageTab === 'forgot' && (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <p className="text-xs text-umber-brown leading-relaxed">
                Enter your registered email address below and we will send you a password reset link to create a new password.
              </p>

              <div>
                <label className="block text-xs font-semibold text-charred-soil mb-1.5">
                  {t('auth.email')} *
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder={t('auth.enterEmail')}
                  className="w-full bg-[#F6F3EC] border border-pressed-sand rounded-lg px-3.5 py-2.5 text-sm text-charred-soil focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-md bg-harvest-olive hover:bg-harvest-olive-dark text-white text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span>Send Reset Email</span>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => switchTab('login')}
                  className="text-xs font-semibold text-harvest-olive hover:underline cursor-pointer inline-flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  <span>Back to Sign In</span>
                </button>
              </div>
            </form>
          )}

          {/* REGISTER TAB */}
          {pageTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charred-soil mb-1.5">
                  {t('auth.fullName')} *
                </label>
                <input
                  type="text"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder={t('auth.enterFullName')}
                  className="w-full bg-[#F6F3EC] border border-pressed-sand rounded-lg px-3.5 py-2.5 text-sm text-charred-soil focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charred-soil mb-1.5">
                  {t('auth.email')} *
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder={t('auth.enterEmail')}
                  className="w-full bg-[#F6F3EC] border border-pressed-sand rounded-lg px-3.5 py-2.5 text-sm text-charred-soil focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charred-soil mb-1.5">
                  {t('auth.mobileNumber')} ({t('common.optional')})
                </label>
                <input
                  type="tel"
                  value={regMobile}
                  onChange={(e) => setRegMobile(e.target.value)}
                  placeholder={t('auth.enterMobile')}
                  maxLength={10}
                  className="w-full bg-[#F6F3EC] border border-pressed-sand rounded-lg px-3.5 py-2.5 text-sm text-charred-soil focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charred-soil mb-1.5">
                  {t('auth.password')} *
                </label>
                <div className="relative">
                  <input
                    type={regShowPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder={t('auth.enterPassword')}
                    className="w-full bg-[#F6F3EC] border border-pressed-sand rounded-lg px-3.5 py-2.5 text-sm text-charred-soil focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setRegShowPassword(!regShowPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-umber-brown hover:text-charred-soil cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {regShowPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-md bg-harvest-olive hover:bg-harvest-olive-dark text-white text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span>{t('auth.signupBtn')}</span>
                )}
              </button>
            </form>
          )}

          {/* Social Sign In Divider & Google Sign-in */}
          {pageTab !== 'forgot' && (
            <>
              <div className="my-5 flex items-center gap-3">
                <div className="flex-1 h-px bg-pressed-sand"></div>
                <span className="text-[11px] text-umber-brown uppercase font-semibold">Or</span>
                <div className="flex-1 h-px bg-pressed-sand"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg border border-pressed-sand bg-[#FFFDF9] hover:bg-[#FAF7F2] text-charred-soil text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-3 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.39 7.37 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.61 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>{t('auth.googleSignin')}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
