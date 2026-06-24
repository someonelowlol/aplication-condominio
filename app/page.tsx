import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Building2, Sparkles, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] flex flex-col font-sans selection:bg-[#F5F2ED] antialiased">
      
      {/* HEADER */}
      <header className="border-b border-[#E5E1DA] bg-white">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-serif italic font-bold tracking-tight text-[#1A1A1A]">ResidenSmart</span>
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#8C857B] uppercase block">Condominios</span>
          </div>
          
          <Link href="/login">
            <button className="text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A] hover:bg-[#F5F2ED] border border-[#E5E1DA] px-4 py-2 transition bg-white">
              Acceder al Portal
            </button>
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="bg-white border border-[#E5E1DA] p-8 md:p-16 relative overflow-hidden shadow-none rounded-none text-[#1A1A1A] max-w-3xl w-full text-center">
          
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center space-x-1.5 bg-[#F5F2ED] text-[#8C857B] px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase border border-[#E5E1DA]/50">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Portal Inteligente de Gestión</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-serif italic leading-tight text-[#1A1A1A] font-normal mb-6">
            Bienvenido a su plataforma digital.
          </h1>
          
          <p className="text-sm md:text-base text-[#8C857B] leading-relaxed max-w-xl mx-auto mb-10">
            Tu condominio en la palma de tu mano. Gestiona pagos, reservas de áreas comunes e incidentes de forma simple y transparente.
          </p>

          <Link href="/login">
            <button className="bg-[#1A1A1A] hover:bg-black text-white text-[10px] font-bold tracking-widest uppercase px-8 py-4 transition flex items-center justify-center mx-auto rounded-none cursor-pointer">
              Ingresar al Panel
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </Link>
          
        </div>
      </main>
      
      {/* FOOTER */}
      <footer className="border-t border-[#E5E1DA] bg-white py-12 px-6 sm:px-10 text-[9px] font-bold tracking-widest uppercase text-[#8C857B] flex flex-col md:flex-row items-center justify-between gap-4">
        <div>&copy; {new Date().getFullYear()} ResidenSmart</div>
        <div>Estatus de Servicios • Operativo</div>
        <div>Diseñado por ResidenSmart Digital</div>
      </footer>
    </div>
  );
}
