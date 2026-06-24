'use client';

import { useState, useTransition, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { login, signup } from './actions';
import { Building2, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function LoginFormContent() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const messageParam = searchParams.get('message');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [currentAction, setCurrentAction] = useState<'login' | 'signup-resident' | 'signup-admin' | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // Derive error message from local validation or URL params (translating known Supabase error messages)
  const getErrorMessage = () => {
    if (localError) return localError;
    if (!errorParam) return null;

    if (messageParam) {
      if (messageParam.includes('Signup requires a valid email')) {
        return 'El registro requiere un correo electrónico válido.';
      }
      if (messageParam.includes('Password should be at least 6 characters')) {
        return 'La contraseña debe tener al menos 6 caracteres.';
      }
      if (messageParam.includes('User already registered') || messageParam.includes('already exists')) {
        return 'El correo ya está registrado. Intenta iniciar sesión.';
      }
      if (messageParam.includes('Invalid login credentials')) {
        return 'Correo o contraseña incorrectos. Intenta nuevamente.';
      }
      return messageParam;
    }

    if (errorParam === 'InvalidCredentials') {
      return 'Correo o contraseña incorrectos. Intenta nuevamente.';
    }
    if (errorParam === 'SignupFailed') {
      return 'No se pudo crear la cuenta. El correo ya puede estar registrado o la contraseña es muy corta.';
    }
    return null;
  };

  const errorMsg = getErrorMessage();

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);
    if (!email) {
      setLocalError('Por favor, ingresa tu correo electrónico.');
      return;
    }
    if (!password) {
      setLocalError('Por favor, ingresa tu contraseña.');
      return;
    }
    setCurrentAction('login');
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    startTransition(() => {
      login(formData);
    });
  };

  const handleSignupResident = (e: React.MouseEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!email) {
      setLocalError('Por favor, ingresa tu correo electrónico para crear la cuenta de residente.');
      return;
    }
    if (!password) {
      setLocalError('Por favor, ingresa una contraseña.');
      return;
    }
    if (password.length < 6) {
      setLocalError('La contraseña para registrarte debe tener al menos 6 caracteres.');
      return;
    }
    setCurrentAction('signup-resident');
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    startTransition(() => {
      signup('RESIDENT', formData);
    });
  };

  const handleSignupAdmin = (e: React.MouseEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!email) {
      setLocalError('Por favor, ingresa tu correo electrónico para crear la cuenta de administrador.');
      return;
    }
    if (!password) {
      setLocalError('Por favor, ingresa una contraseña.');
      return;
    }
    if (password.length < 6) {
      setLocalError('La contraseña para registrarte debe tener al menos 6 caracteres.');
      return;
    }
    setCurrentAction('signup-admin');
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    startTransition(() => {
      signup('ADMIN', formData);
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-[#FDFCFB] text-[#1A1A1A] font-sans selection:bg-[#F5F2ED] antialiased">

      <Link href="/" className="absolute top-6 left-6 text-[#1A1A1A] hover:bg-[#F5F2ED] border border-[#E5E1DA] p-2 transition bg-white flex items-center text-[10px] font-bold tracking-widest uppercase">
        <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
        Volver
      </Link>

      <div className="w-full max-w-md relative z-10 bg-white border border-[#E5E1DA] p-8 md:p-10 shadow-none rounded-none">
        
        {/* Logo & brand */}
        <div className="text-center mb-10 border-b border-[#E5E1DA] pb-6">
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center space-x-1.5 bg-[#F5F2ED] text-[#8C857B] px-3 py-1 text-[9px] font-bold tracking-widest uppercase border border-[#E5E1DA]/50">
              <Building2 className="w-3.5 h-3.5" />
              <span>Acceso de Seguridad</span>
            </div>
          </div>
          
          <h1 className="text-3xl font-serif italic text-[#1A1A1A] tracking-tight">ResidenSmart</h1>
          <p className="text-[10px] font-bold tracking-[0.2em] text-[#8C857B] uppercase mt-2">
            Portal
          </p>
        </div>

        {/* Form Container */}
        <div>
          <h2 className="text-lg font-bold text-[#1A1A1A] mb-2 font-serif italic">Bienvenido</h2>
          <p className="text-xs mb-6 text-[#8C857B]">
            Ingresa tus credenciales para acceder a tu panel de control.
          </p>

          {/* Error banner */}
          {errorMsg && (
            <div className="flex items-start gap-3 border border-rose-200 bg-rose-50 px-4 py-3 mb-6 text-xs text-rose-700 font-medium">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} id="login-form" method="POST">
            {/* Email */}
            <div className="mb-5">
              <label htmlFor="email" className="block text-[10px] font-bold mb-1.5 text-[#1A1A1A] tracking-widest uppercase">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C857B]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-none text-sm text-[#1A1A1A] placeholder-[#8C857B]/50 outline-none transition-all bg-[#FDFCFB] border border-[#E5E1DA] focus:border-[#1A1A1A]"
                  placeholder="tucorreo@ejemplo.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-8">
              <label htmlFor="password" className="block text-[10px] font-bold mb-1.5 text-[#1A1A1A] tracking-widest uppercase">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C857B]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-none text-sm text-[#1A1A1A] placeholder-[#8C857B]/50 outline-none transition-all bg-[#FDFCFB] border border-[#E5E1DA] focus:border-[#1A1A1A]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors text-[#8C857B] hover:text-[#1A1A1A]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Main login button */}
            <button
              type="submit"
              form="login-form"
              disabled={isPending}
              className="w-full py-3.5 text-[10px] font-bold tracking-widest uppercase text-white transition-all duration-200 flex items-center justify-center gap-2 mb-6 rounded-none cursor-pointer"
              style={{ background: isPending && currentAction === 'login' ? '#8C857B' : '#1A1A1A', opacity: isPending && currentAction !== 'login' ? 0.7 : 1 }}
            >
              {isPending && currentAction === 'login' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[#E5E1DA]" />
            <span className="text-[9px] uppercase tracking-widest font-bold text-[#8C857B]">o crear cuenta de prueba</span>
            <div className="flex-1 h-px bg-[#E5E1DA]" />
          </div>

          {/* Create account buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isPending}
              onClick={handleSignupResident}
              className="w-full py-3 rounded-none text-[9px] font-bold tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-1.5 bg-[#F5F2ED] border border-[#E5E1DA] text-[#1A1A1A] hover:bg-white"
            >
              {isPending && currentAction === 'signup-resident' ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : null}
              <span>Nuevo Residente</span>
            </button>

            <button
              type="button"
              disabled={isPending}
              onClick={handleSignupAdmin}
              className="w-full py-3 rounded-none text-[9px] font-bold tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-1.5 bg-[#F5F2ED] border border-[#E5E1DA] text-[#1A1A1A] hover:bg-white"
            >
              {isPending && currentAction === 'signup-admin' ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : null}
              <span>Nuevo Admin</span>
            </button>
          </div>
        </div>
      </div>
      
      <p className="absolute bottom-6 text-center text-[9px] tracking-widest uppercase font-bold text-[#8C857B]">
        © {new Date().getFullYear()} ResidenSmart
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB] text-[#1A1A1A]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#8C857B]" />
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#8C857B]">Cargando Portal...</span>
        </div>
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
