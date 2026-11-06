import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Mail, RefreshCw, AlertCircle, CheckCircle2, LogOut, Loader2, ArrowRight } from 'lucide-react';

/**
 * Unclosable, 6-character alphanumeric email verification modal.
 * Features:
 * - 6 individual square input boxes (quadradinhos)
 * - Alphanumeric support (letters & numbers mixed, auto uppercase)
 * - Full paste support (auto-distributes 6 characters into the boxes)
 * - 30-minute security countdown timer
 * - Resend code with cooldown
 * - Unclosable (no close button, backdrop click disabled, ESC disabled)
 */
export default function EmailVerificationModal({
  isOpen,
  currentUser,
  onVerified,
  onLogout,
  API_BASE_URL,
  showNotification
}) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [devPreviewCode, setDevPreviewCode] = useState(null);

  // 30 minutes countdown timer (1800 seconds)
  const [secondsLeft, setSecondsLeft] = useState(30 * 60);
  const [canResendIn, setCanResendIn] = useState(0);

  const inputRefs = useRef([]);

  // Send verification code on modal open
  useEffect(() => {
    if (isOpen && currentUser && !currentUser.isVerified && currentUser.role !== 'admin') {
      sendVerificationCode();
      setSecondsLeft(30 * 60);
    }
  }, [isOpen, currentUser?.id]);

  // 30-minute countdown timer
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  // Resend cooldown timer
  useEffect(() => {
    if (canResendIn <= 0) return;
    const resendTimer = setInterval(() => {
      setCanResendIn((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(resendTimer);
  }, [canResendIn]);

  // Focus first input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen || !currentUser || currentUser.isVerified || currentUser.role === 'admin') {
    return null;
  }

  const sendVerificationCode = async () => {
    if (!currentUser?.token) return;
    setSendingCode(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-verification-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        }
      });

      const data = await res.json();
      if (res.ok) {
        setCodeSent(true);
        setCanResendIn(45); // 45 seconds cooldown before next resend
        setSecondsLeft(30 * 60);
        if (data.devCode) {
          setDevPreviewCode(data.devCode);
        }
        if (showNotification) {
          showNotification('Código de verificação enviado para seu e-mail!', 'success');
        }
      } else {
        if (data.alreadyVerified) {
          if (onVerified) onVerified({ ...currentUser, isVerified: true });
        } else {
          setErrorMsg(data.error || 'Erro ao enviar código para o e-mail.');
        }
      }
    } catch (err) {
      setErrorMsg('Não foi possível conectar ao servidor para enviar o código.');
    } finally {
      setSendingCode(false);
    }
  };

  const handleInputChange = (index, value) => {
    // Only accept alphanumeric characters (letters and numbers)
    const clean = value.replace(/[^0-9a-zA-Z]/g, '').toUpperCase();
    if (!clean) {
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
      return;
    }

    // Take the last entered character if multiple
    const char = clean.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setErrorMsg(null);

    // Auto-advance to next input box
    if (index < 5 && char) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 filled
    const fullCode = newDigits.join('');
    if (fullCode.length === 6 && !newDigits.includes('')) {
      submitCode(fullCode);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Move back to previous box on backspace if current is empty
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    if (!pastedData) return;

    // Filter alphanumeric characters, uppercase, and max 6 chars
    const clean = pastedData.replace(/[^0-9a-zA-Z]/g, '').toUpperCase().slice(0, 6);
    if (!clean) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = clean[i] || '';
    }
    setDigits(newDigits);
    setErrorMsg(null);

    // Focus last filled box or next empty box
    const focusIdx = Math.min(clean.length, 5);
    inputRefs.current[focusIdx]?.focus();

    // Auto submit if all 6 digits pasted
    if (clean.length === 6) {
      submitCode(clean);
    }
  };

  const submitCode = async (codeToSubmit = null) => {
    const code = (codeToSubmit || digits.join('')).trim().toUpperCase();
    if (code.length !== 6) {
      setErrorMsg('Digite os 6 dígitos alfanuméricos do código.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-email-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.token}`
        },
        body: JSON.stringify({ code })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('E-mail verificado com sucesso! Liberando acesso...');
        const updatedUser = {
          ...currentUser,
          isVerified: true,
          is_verified: true
        };
        if (showNotification) {
          showNotification('E-mail verificado com sucesso!', 'success');
        }
        setTimeout(() => {
          if (onVerified) onVerified(updatedUser);
        }, 600);
      } else {
        setErrorMsg(data.error || 'Código inválido ou expirado. Tente novamente.');
      }
    } catch (err) {
      setErrorMsg('Falha ao validar o código. Verifique sua conexão com a internet.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
      style={{ touchAction: 'none' }}
      onKeyDown={(e) => {
        // Strictly prevent closing via Escape
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <div 
        className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold Security Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-7 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-inner">
              <ShieldCheck className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/25 mb-1.5">
                Validação de Segurança
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Confirmação de E-mail
              </h2>
              <p className="text-xs text-slate-300 mt-1.5 max-w-xs sm:max-w-sm mx-auto leading-relaxed">
                Para liberar suas compras, cotações e consultas de preços, informe o código de 6 dígitos enviado para seu e-mail.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Email Recipient Card */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-slate-500">Enviado para o endereço:</p>
              <p className="font-extrabold text-slate-900 truncate">{currentUser.email}</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 shrink-0">
              Athena ID
            </span>
          </div>

          {/* Dev Test Code Helper (shown only when SMTP is in log mode) */}
          {devPreviewCode && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
              <span className="font-medium">Código para teste local:</span>
              <span className="font-mono font-black text-sm bg-white px-2 py-0.5 rounded border border-amber-300 tracking-widest text-amber-800">
                {devPreviewCode}
              </span>
            </div>
          )}

          {/* 6 Individual Square Inputs (Quadradinhos) */}
          <div className="space-y-2">
            <label className="block text-center text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Digite ou cole o código alfanumérico (6 dígitos)
            </label>
            
            <div 
              className="flex items-center justify-center gap-2 sm:gap-3 pt-2"
              onPaste={handlePaste}
            >
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  disabled={loading}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onFocus={(e) => e.target.select()}
                  className={`w-11 h-14 sm:w-13 sm:h-16 text-center text-xl sm:text-2xl font-black font-mono rounded-2xl border-2 transition-all shadow-xs outline-none uppercase ${
                    digit 
                      ? 'border-amber-500 bg-amber-50/40 text-slate-900 ring-2 ring-amber-500/20' 
                      : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                  }`}
                  placeholder="•"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck="false"
                />
              ))}
            </div>
            <p className="text-center text-[11px] text-slate-400">
              Dica: Você pode copiar o código completo do e-mail e colar diretamente em qualquer quadradinho.
            </p>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span className="font-semibold leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-extrabold leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="button"
            onClick={() => submitCode()}
            disabled={loading || digits.join('').length !== 6}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99] text-slate-950 font-black text-sm py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer border border-amber-400"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Validando Código...</span>
              </>
            ) : (
              <>
                <span>Confirmar Código de Segurança</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Timer & Resend Controls */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
              <span>Validade do código:</span>
              <span className={`font-mono font-black ${secondsLeft < 300 ? 'text-rose-600' : 'text-slate-800'}`}>
                {formatTime(secondsLeft)}
              </span>
            </div>

            <button
              type="button"
              onClick={sendVerificationCode}
              disabled={canResendIn > 0 || sendingCode}
              className="text-amber-800 hover:text-amber-900 font-extrabold flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${sendingCode ? 'animate-spin' : ''}`} />
              <span>
                {canResendIn > 0 ? `Reenviar código em ${canResendIn}s` : 'Reenviar novo código'}
              </span>
            </button>
          </div>

          {/* Escape Hatch: Logout if user entered wrong email */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                if (onLogout) onLogout('Você cancelou a verificação e saiu da sua conta.');
              }}
              className="text-slate-400 hover:text-red-600 text-[11px] font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Entrou com o e-mail errado? Sair da conta</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
