import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Check, Shield, Award, Send } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface OnboardingProps {
  onComplete: () => void;
}

type ScreenState = 'LOGIN' | 'REGISTER' | 'PROFILE' | 'FORGOT_PASSWORD' | 'VERIFY_CODE' | 'RESET_PASSWORD';

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [screen, setScreen] = useState<ScreenState>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Profile fields (Step 3)
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [allowWhatsApp, setAllowWhatsApp] = useState(true);
  
  const [error, setError] = useState('');

  // Password Recovery States
  const [recoveryInput, setRecoveryInput] = useState('');
  const [recoveryUserEmail, setRecoveryUserEmail] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [typedCode, setTypedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Auto-masking for Brazilian phone numbers: (11) 99999-9999
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, '');
    if (input.length > 11) {
      input = input.substring(0, 11);
    }
    
    let formatted = '';
    if (input.length > 0) {
      formatted = `(${input.substring(0, 2)}`;
    }
    if (input.length > 2) {
      formatted += `) ${input.substring(2, 7)}`;
    }
    if (input.length > 7) {
      formatted += `-${input.substring(7, 11)}`;
    } else if (input.length > 2 && input.length <= 7) {
      // Keep without dash while typing
    }
    
    setPhone(formatted);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!recoveryInput.trim()) {
      setError('Por favor, informe o seu e-mail ou número de celular.');
      return;
    }

    const inputClean = recoveryInput.trim().toLowerCase();

    if (supabase) {
      try {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(inputClean, {
          redirectTo: window.location.origin,
        });

        if (resetError) {
          setError(resetError.message);
          return;
        }

        setSuccessMessage('Um e-mail de redefinição de senha foi enviado. Verifique sua caixa de entrada.');
        setScreen('LOGIN');
        return;
      } catch (err: any) {
        console.error('Erro ao redefinir senha no Supabase:', err);
        setError('Erro ao enviar e-mail de redefinição. Verifique sua conexão.');
        return;
      }
    }

    const registeredUsers = JSON.parse(localStorage.getItem('ctrlpet_registered_users') || '[]');
    const digitsClean = recoveryInput.replace(/\D/g, '');

    const user = registeredUsers.find((u: any) => {
      const uEmail = u.email ? u.email.toLowerCase().trim() : '';
      const uPhoneClean = u.phone ? u.phone.replace(/\D/g, '') : '';
      return uEmail === inputClean || (digitsClean && uPhoneClean === digitsClean);
    });

    if (!user) {
      setError('Usuário não encontrado. Verifique os dados ou cadastre-se.');
      return;
    }

    // SIMULATED SMS SENDING:
    // Generate code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setRecoveryUserEmail(user.email);
    setTypedCode('');
    setScreen('VERIFY_CODE');
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!typedCode.trim()) {
      setError('Por favor, digite o código de confirmação.');
      return;
    }

    if (typedCode.trim() !== generatedCode) {
      setError('Código inválido. Tente novamente.');
      return;
    }

    // Go to reset password
    setNewPassword('');
    setConfirmNewPassword('');
    setScreen('RESET_PASSWORD');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword || newPassword.length < 6) {
      setError('A nova senha deve conter no mínimo 6 caracteres.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('As senhas digitadas não conferem.');
      return;
    }

    // Update inside registeredUsers database
    const registeredUsers = JSON.parse(localStorage.getItem('ctrlpet_registered_users') || '[]');
    const updatedUsers = registeredUsers.map((u: any) => {
      if (u.email.toLowerCase() === recoveryUserEmail.toLowerCase()) {
        return { ...u, password: newPassword };
      }
      return u;
    });

    localStorage.setItem('ctrlpet_registered_users', JSON.stringify(updatedUsers));
    
    // Set a neat success message on the login screen
    setSuccessMessage('Senha redefinida com sucesso! Acesse sua carteira com a nova senha.');
    setEmail(recoveryUserEmail);
    setPassword('');
    setScreen('LOGIN');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Por favor, preencha o e-mail e a senha.');
      return;
    }

    if (supabase) {
      try {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) {
          setError(authError.message === 'Invalid login credentials' ? 'Usuário ou senha incorretos.' : authError.message);
          return;
        }

        if (data?.user) {
          const fullName = data.user.user_metadata?.full_name || 'Tutor';
          const phone = data.user.user_metadata?.phone || '';
          const allowWhatsApp = data.user.user_metadata?.allow_whatsapp ?? true;

          localStorage.setItem('ctrlpet_session', JSON.stringify({
            id: data.user.id,
            email: data.user.email,
            fullName,
            phone,
            allowWhatsApp,
            isLoggedIn: true
          }));
          onComplete();
          return;
        }
      } catch (err: any) {
        console.error('Erro ao fazer login no Supabase:', err);
        setError('Erro de conexão ao autenticar com o Supabase.');
        return;
      }
    }

    // Since this is a local client-side offline applet, we validate demo credentials or register dynamically.
    // If the email is already in "registered" list we login, otherwise we let them signup.
    const registeredUsers = JSON.parse(localStorage.getItem('ctrlpet_registered_users') || '[]');
    const userExists = registeredUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

    if (userExists) {
      if (userExists.password === password) {
        // Save session & complete directly since they already have a profile
        localStorage.setItem('ctrlpet_session', JSON.stringify({
          id: userExists.id || `local-user-${Date.now()}`,
          email: userExists.email,
          fullName: userExists.fullName || 'Tutor',
          phone: userExists.phone || '',
          allowWhatsApp: userExists.allowWhatsApp ?? true,
          isLoggedIn: true
        }));
        onComplete();
      } else {
        setError('Senha incorreta para este usuário cadastrado.');
      }
    } else {
      // Prompt them to register
      setError('E-mail não cadastrado. Caso seja seu primeiro acesso, clique em "Criar nova conta" logo abaixo.');
    }
  };

  const handleRegisterNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha o e-mail e a senha.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas digitadas não conferem.');
      return;
    }

    // Check if user already exists
    const registeredUsers = JSON.parse(localStorage.getItem('ctrlpet_registered_users') || '[]');
    const userExists = registeredUsers.some((u: any) => u.email.toLowerCase() === email.toLowerCase());

    if (userExists) {
      setError('Este endereço de e-mail já está sendo utilizado.');
      return;
    }

    // Go to next step: complete profile details
    setScreen('PROFILE');
  };

  const handleProfileComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Por favor, preencha o seu nome completo.');
      return;
    }

    const strippedPhone = phone.replace(/\D/g, '');
    if (strippedPhone.length < 10) {
      setError('Insira um número de telefone/WhatsApp válido com DDD.');
      return;
    }

    if (supabase) {
      try {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone,
              allow_whatsapp: allowWhatsApp,
            }
          }
        });

        if (authError) {
          setError(authError.message);
          return;
        }

        if (data?.user) {
          const isSessionActive = !!data.session;

          localStorage.setItem('ctrlpet_session', JSON.stringify({
            id: data.user.id,
            email,
            fullName,
            phone,
            allowWhatsApp,
            isLoggedIn: isSessionActive
          }));

          // Guardar cópia nos usuários registrados simulados para maior compatibilidade local
          const registeredUsers = JSON.parse(localStorage.getItem('ctrlpet_registered_users') || '[]');
          registeredUsers.push({ id: data.user.id, email, password, fullName, phone, allowWhatsApp });
          localStorage.setItem('ctrlpet_registered_users', JSON.stringify(registeredUsers));

          if (!isSessionActive) {
            setSuccessMessage('Conta criada! Por favor, verifique se recebeu um e-mail de confirmação ou acesse com seus dados.');
            setScreen('LOGIN');
          } else {
            onComplete();
          }
          return;
        }
      } catch (err: any) {
        console.error('Erro ao cadastrar no Supabase:', err);
        setError('Erro de conexão ao realizar cadastro no Supabase.');
        return;
      }
    }

    // Register user permanently in localStorage (fallback)
    const userId = `local-user-${Date.now()}`;
    const newUser = {
      id: userId,
      email,
      password,
      fullName,
      phone,
      allowWhatsApp
    };

    const registeredUsers = JSON.parse(localStorage.getItem('ctrlpet_registered_users') || '[]');
    registeredUsers.push(newUser);
    localStorage.setItem('ctrlpet_registered_users', JSON.stringify(registeredUsers));

    // Sign user in automatically
    localStorage.setItem('ctrlpet_session', JSON.stringify({
      id: userId,
      email,
      fullName,
      phone,
      allowWhatsApp,
      isLoggedIn: true
    }));

    onComplete();
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] dark:bg-slate-950 flex flex-col items-center justify-center p-4 font-sans select-none" id="onboarding-root">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden p-8 space-y-6 transition-all duration-300">
        
        {/* Brand Header with high-fidelity squircle representation of the CTRL+Pet icon */}
        <div className="text-center space-y-3 flex flex-col items-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#4040F2] to-[#2B2BC4] rounded-2xl shadow-lg shadow-[#3B3CBF]/20 flex flex-col items-center justify-center text-white border border-[#5252FF]/20">
            <div className="font-extrabold text-xl tracking-tighter leading-none font-sans flex items-center justify-center gap-0.5 select-none pt-2">
              CTRL
              <span className="text-white text-sm leading-none">🐾</span>
            </div>
            <div className="font-bold text-[10px] tracking-wide leading-none select-none mt-1 opacity-95">
              + Pet
            </div>
          </div>
          
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold font-display tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
              Ctrl<span className="text-indigo-600 font-extrabold">+</span>Pet
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-tight">
              Vacinação e cuidados na palma da mão.
            </p>
          </div>
        </div>

        {/* Dynamic screen rendering based on the refactored workflow states */}
        {screen === 'LOGIN' && (
          <div className="space-y-4">
            {/* Header info */}
            <div className="text-center py-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-full font-bold">
                Acesse sua Carteira
              </span>
            </div>

            {successMessage && (
              <p className="text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/25 p-3 rounded-xl border border-emerald-150 dark:border-emerald-900/40 text-center">
                ✨ {successMessage}
              </p>
            )}

            {/* Benefit quick tags */}
            <div className="grid grid-cols-2 gap-3 text-[11px] leading-relaxed">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-lg space-y-1">
                <span className="text-base">🔐</span>
                <p className="font-bold text-slate-800 dark:text-slate-250">Total Autonomia</p>
                <p className="text-slate-450 dark:text-slate-400 text-[10px]">Insira consultas e doses de vacinas sem barreiras.</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-lg space-y-1">
                <span className="text-base">🛡️</span>
                <p className="font-bold text-slate-800 dark:text-slate-250">Privacidade Reforçada</p>
                <p className="text-slate-450 dark:text-slate-400 text-[10px]">Zero CPF requerido. Em conformidade com a LGPD.</p>
              </div>
            </div>

            {/* Login form */}
            <form onSubmit={handleLogin} className="space-y-3.5 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-555 dark:text-slate-400">E-mail</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setSuccessMessage('');
                    }}
                    placeholder="seu-pet@provedor.com"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-555 dark:text-slate-400">Senha</label>
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setSuccessMessage('');
                      setRecoveryInput(email); // Convenience
                      setScreen('FORGOT_PASSWORD');
                    }}
                    className="text-[10px] text-indigo-600 dark:text-[#7a75ff] font-bold hover:underline cursor-pointer"
                  >
                    Esqueceu sua senha?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="login-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-slate-100"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-rose-600 font-medium bg-rose-50 dark:bg-rose-950/20 p-2.5 rounded-lg border border-rose-150 dark:border-rose-900/50">
                  {error}
                </p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#2B2BC4] hover:bg-[#1E1EB0] active:bg-indigo-900 text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-colors shadow-sm cursor-pointer"
                >
                  Entrar na Carteira
                </button>
              </div>
            </form>

            {/* Separator & Sign-up call */}
            <div className="text-center pt-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Não possui conta?{' '}
                <button
                  onClick={() => {
                    setError('');
                    setScreen('REGISTER');
                  }}
                  className="text-indigo-600 dark:text-[#7a75ff] font-bold hover:underline cursor-pointer"
                >
                  Criar nova conta
                </button>
              </span>
            </div>
          </div>
        )}

        {screen === 'REGISTER' && (
          <div className="space-y-4">
            <div className="text-center py-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-full font-bold">
                Criar Nova Conta Secura
              </span>
            </div>

            <form onSubmit={handleRegisterNext} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-505 dark:text-slate-400">Escolha o seu E-mail</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="register-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@provedor.com"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-505 dark:text-slate-400">Crie uma Senha Forte</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="register-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="mínimo 6 caracteres"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-505 dark:text-slate-400">Confirme a Senha</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-slate-100"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-rose-600 font-medium bg-rose-50 dark:bg-rose-950/20 p-2.5 rounded-lg border border-rose-150 dark:border-rose-900/50">
                  {error}
                </p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#2B2BC4] hover:bg-[#1E1EB0] active:bg-indigo-900 text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-colors shadow-sm cursor-pointer"
                >
                  Avançar para Perfil
                </button>
              </div>
            </form>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Já é cadastrado?{' '}
                <button
                  onClick={() => {
                    setError('');
                    setScreen('LOGIN');
                  }}
                  className="text-indigo-600 dark:text-[#7a75ff] font-bold hover:underline cursor-pointer"
                >
                  Entrar
                </button>
              </span>
            </div>
          </div>
        )}

        {screen === 'PROFILE' && (
          <div className="space-y-4">
            {/* Header block conforming to image standard: dynamic title, description */}
            <div className="text-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-extrabold text-[#2B2BC4] dark:text-[#7a75ff] font-sans">
                Complete seu Perfil
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 leading-normal">
                Mantenha seus dados atualizados para receber os alertas de vacinas do seu pet de forma autônoma.
              </p>
            </div>

            <form onSubmit={handleProfileComplete} className="space-y-4">
              {/* Field 1: Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-505 dark:text-slate-400 flex items-center gap-1">
                  <span>Nome do Tutor</span>
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="profile-fullname"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Field 2: E-mail (readonly if loaded) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Endereço de E-mail</label>
                <div className="relative flex items-center opacity-80">
                  <span className="absolute left-3 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="profile-email"
                    type="email"
                    disabled
                    value={email}
                    className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Field 3: Phone with WhatsApp Green classic branding */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400 flex items-center gap-1.5 justify-between">
                  <span className="flex items-center gap-1">WhatsApp <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-[emerald-600] font-mono leading-none bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-emerald-100">
                    💬 Ativo
                  </span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-green-600 dark:text-green-500">
                    {/* Classic WhatsApp indicator */}
                    <span className="font-semibold text-sm">💬</span>
                  </span>
                  <input
                    id="profile-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="(11) 99999-9999"
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 dark:text-slate-100 font-mono font-bold"
                  />
                </div>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-snug">
                  Essencial para receber notificações automatizadas das vacinas atrasadas e revacinação sem intervenção veterinária.
                </p>
              </div>

              {/* Checkbox Consent with high fidelity switch styling */}
              <label className="flex items-start gap-3 bg-indigo-50/40 dark:bg-indigo-950/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/40 cursor-pointer select-none">
                <input
                  id="profile-consent"
                  type="checkbox"
                  checked={allowWhatsApp}
                  onChange={(e) => setAllowWhatsApp(e.target.checked)}
                  className="w-4.5 h-4.5 rounded text-[#2B2BC4] focus:ring-[#2B2BC4] border-slate-300 pointer-events-auto shrink-0 mt-0.5"
                />
                <span className="text-[11px] text-slate-600 dark:text-slate-300 leading-normal">
                  Autorizo o envio de alertas e avisos importantes de cuidados via WhatsApp de acordo com a LGPD e privacidade.
                </span>
              </label>

              {error && (
                <p className="text-xs text-rose-600 font-medium bg-rose-50 dark:bg-rose-950/20 p-2.5 rounded-lg border border-rose-150 dark:border-rose-900/50">
                  {error}
                </p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#2B2BC4] hover:bg-[#1E1EB0] active:bg-indigo-900 text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Concluir Cadastro
                </button>
              </div>
            </form>
          </div>
        )}

        {screen === 'FORGOT_PASSWORD' && (
          <div className="space-y-4">
            <div className="text-center py-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-full font-bold">
                Recuperação de Senha
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 tracking-tight mt-2.5">
                Digite o e-mail ou celular cadastrado para recuperar sua conta.
              </p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-3.5 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-555 dark:text-slate-400">E-mail ou Celular</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="recovery-input"
                    type="text"
                    required
                    value={recoveryInput}
                    onChange={(e) => setRecoveryInput(e.target.value)}
                    placeholder="email@provedor.com ou (11) 99999-9999"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-slate-100"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-rose-600 font-medium bg-rose-50 dark:bg-rose-950/20 p-2.5 rounded-lg border border-rose-150 dark:border-rose-900/50">
                  {error}
                </p>
              )}

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full bg-[#2B2BC4] hover:bg-[#1E1EB0] active:bg-indigo-900 text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> Enviar Código por SMS
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setScreen('LOGIN');
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-705 text-slate-700 dark:text-slate-300 font-bold py-2 px-4 rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Voltar para o Login
                </button>
              </div>
            </form>
          </div>
        )}

        {screen === 'VERIFY_CODE' && (
          <div className="space-y-4">
            <div className="text-center py-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-green-600 bg-green-50 dark:bg-green-950/40 px-2.5 py-1 rounded-full font-bold">
                Código Enviado via SMS
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 tracking-tight mt-2.5">
                Enviamos um SMS com o código de 6 dígitos para o seu celular cadastrado.
              </p>
            </div>

            {/* Simulated SMS Alert Box so the user can easily see/copy the code */}
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl p-3.5 space-y-1.5">
              <p className="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                <span>📱</span> Simulação de SMS recebido:
              </p>
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-amber-150 dark:border-amber-900/20 shadow-sm">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Ctrl+Pet Código:</span>
                <span className="text-base font-black font-sans tracking-widest text-[#2B2BC4] dark:text-indigo-400 bg-slate-105 dark:bg-slate-800 px-2.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">{generatedCode}</span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-normal">
                Copie este código acima e informe no campo de validação abaixo para prosseguir.
              </p>
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-3.5 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-555 dark:text-slate-400">Código de Confirmação (6 dígitos)</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400">
                    <span className="text-xs">🔑</span>
                  </span>
                  <input
                    id="verify-code-input"
                    type="text"
                    required
                    maxLength={6}
                    value={typedCode}
                    onChange={(e) => setTypedCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ex: 123456"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm tracking-widest font-black focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-slate-100 placeholder:tracking-normal placeholder:font-normal"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-rose-600 font-medium bg-rose-50 dark:bg-rose-950/20 p-2.5 rounded-lg border border-rose-150 dark:border-rose-900/50">
                  {error}
                </p>
              )}

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full bg-[#2B2BC4] hover:bg-[#1E1EB0] active:bg-indigo-900 text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Validar Código
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setScreen('FORGOT_PASSWORD');
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-705 text-slate-700 dark:text-slate-300 font-bold py-2 px-4 rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Voltar
                </button>
              </div>
            </form>
          </div>
        )}

        {screen === 'RESET_PASSWORD' && (
          <div className="space-y-4">
            <div className="text-center py-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-full font-bold">
                Definir Nova Senha
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 tracking-tight mt-2.5">
                Crie uma senha de acesso forte para proteger os dados do seu pet.
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-3.5 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-505 dark:text-slate-400">Nova Senha</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="new-password"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="mínimo 6 caracteres"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-505 dark:text-slate-400">Confirmar Nova Senha</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="confirm-new-password"
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-slate-100"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-rose-600 font-medium bg-rose-50 dark:bg-rose-950/20 p-2.5 rounded-lg border border-rose-150 dark:border-rose-900/50">
                  {error}
                </p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#2B2BC4] hover:bg-[#1E1EB0] active:bg-indigo-900 text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Salvar Nova Senha
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer info & compliance notes with bypass completely excluded */}
        <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center leading-relaxed">
          Ao prosseguir, você concorda com o salvamento local dos dados de seus pets. Nenhuma informação pessoal será compartilhada clínica ou corporativamente sem consentimento.
        </p>
      </div>
    </div>
  );
}
