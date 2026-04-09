import { ArrowLeft, BarChart3, BrainCircuit, Target, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoImg from "../../icon/logo-protactic.png";

export default function Sobre() {
  const navigate = useNavigate();

  return (
    <div className="text-pt-text p-6 relative">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-pt-primary/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-pt-primary/5 rounded-full blur-[100px] -z-10" />
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center relative mb-12 pt-8">
        <button 
          onClick={() => navigate("/")}
          className="absolute left-0 top-1/2 -translate-y-1/2 text-pt-text-muted hover:text-pt-primary transition-all flex items-center gap-2 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline font-bold uppercase text-[10px] tracking-widest">Voltar</span>
        </button>
        
        <img src={logoImg} alt="ProTactic Logo" className="w-56 h-auto" />
      </div>

      <div className="max-w-4xl mx-auto space-y-6 pb-10">

        <div className="bg-pt-surface border border-pt-white/5 rounded-3xl p-10 shadow-2xl shadow-black/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pt-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
          <h2 className="text-sm font-black text-pt-primary mb-4 uppercase tracking-[0.2em]">NOSSA VISÃO</h2>
          <p className="text-pt-text-muted leading-relaxed font-medium text-base md:text-lg">
            Somos uma equipe de Ciência da Computação apaixonada por esporte e movida pela
            inovação radical. Aplicamos tecnologia de ponta, estatística avançada e 
            Inteligência Artificial para gerar insights que elevam o desempenho, a estratégia e 
            a tomada de decisão no futebol de elite. Nosso propósito é decodificar a complexidade 
            do jogo e transformar dados em vitória.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-pt-surface border border-pt-white/5 rounded-3xl p-8 shadow-2xl shadow-black/40 hover:border-pt-primary/30 transition-all group">
            <div className="w-12 h-12 bg-pt-primary/10 rounded-2xl flex items-center justify-center mb-6 ring-2 ring-pt-primary/20">
              <BarChart3 className="text-pt-primary w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-pt-text mb-3 tracking-tight">PERFORMANCE DATA</h3>
            <p className="text-pt-text-muted text-xs md:text-sm leading-relaxed font-semibold">
              Transformamos cada variável do jogo em vantagem competitiva real. 
              Nossa análise de performance processa dados em tempo real para permitir 
              decisões cirúrgicas, seja no calor da partida ou no planejamento semanal.
            </p>
          </div>

          <div className="bg-pt-surface border border-pt-white/5 rounded-3xl p-8 shadow-2xl shadow-black/40 hover:border-pt-primary/30 transition-all group">
            <div className="w-12 h-12 bg-pt-primary/10 rounded-2xl flex items-center justify-center mb-6 ring-2 ring-pt-primary/20">
              <BrainCircuit className="text-pt-primary w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-pt-text mb-3 tracking-tight">IA TÁTICA AVANÇADA</h3>
            <p className="text-pt-text-muted text-xs md:text-sm leading-relaxed font-semibold">
              Implementamos algoritmos de Deep Learning para identificar padrões táticos 
              invisíveis ao olho humano. Nossa IA detecta tendências e oportunidades, 
              entregando o futuro da estratégia esportiva em segundos.
            </p>
          </div>
        </div>

        <div className="bg-pt-primary/5 border border-pt-primary/20 rounded-3xl p-10 shadow-2xl shadow-black/40 text-center relative overflow-hidden group">
            <div className="flex justify-center mb-6">
                 <Target className="text-pt-primary w-10 h-10 animate-pulse" />
            </div>
            
            <p className="text-pt-text italic text-lg md:text-xl font-black relative z-10 tracking-tight leading-snug">
            "Vencer começa ao enxergarmos o que ninguém vê. <br className="hidden md:block" />
            Transformar dados em insights faz o treinador ganhar <br className="hidden md:block" />
            visão e o time conquistar campeonatos."
            </p>
        </div>

        <div className="bg-pt-surface border border-pt-white/5 rounded-3xl p-8 shadow-2xl shadow-black/40 text-center flex flex-col items-center group">
            <div className="flex items-center gap-2 mb-2 text-pt-text font-black uppercase tracking-widest text-xs">
                <Zap className="text-pt-primary w-5 h-5 fill-pt-primary/20" />
                <span>EXPANDA SUA VISÃO</span>
            </div>
            
            <p className="text-pt-text-muted text-xs mb-8 font-semibold">
                Acesse nossa plataforma oficial para explorar recursos exclusivos de análise tática.
            </p>

            <div className="bg-pt-white p-4 rounded-3xl shadow-2xl shadow-pt-primary/10 ring-4 ring-pt-primary/5">
                <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data==https://sites.google.com/cesar.school/si-protactic/home" 
                    alt="QR Code" 
                    className="w-32 h-32 opacity-90"
                />
            </div>
        </div>
      </div>

      <footer className="text-center text-[10px] text-pt-text-muted/40 mt-12 mb-8 font-black uppercase tracking-[0.3em]">
        © 2025 ProTactic. Tech for the Win.
      </footer>
    </div>
  );
}