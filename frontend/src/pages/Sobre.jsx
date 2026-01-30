import { ArrowLeft, BarChart3, BrainCircuit, Target, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoImg from "../assets/logo-protactic.png";

export default function Sobre() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 relative overflow-x-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-green-500/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -z-10" />
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center relative mb-12">
        <button 
          onClick={() => navigate("/")}
          className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Voltar</span>
        </button>
        
        <img src={logoImg} alt="ProTactic Logo" className="w-48 h-auto" />
      </div>

      <div className="max-w-4xl mx-auto space-y-6 pb-10">

        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-8 shadow-lg">
          <h2 className="text-xl font-semibold text-green-500 mb-4">QUEM SOMOS</h2>
          <p className="text-slate-300 leading-relaxed text-sm md:text-base">
            Somos estudantes de Ciência da Computação apaixonados por esporte e movidos por
            inovação. Aplicamos tecnologia, estatística e inteligência artificial para gerar insights que
            elevam o desempenho, a estratégia e a tomada de decisão no futebol. Nosso propósito é
            usar ciência para entender o jogo e transformar a forma como ele é jogado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-8 shadow-lg">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="text-green-500 w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-3">DADOS ESTRATÉGICOS</h3>
            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
              Utilizamos dados estratégicos em tempo real para aumentar a performance do clube. Cada
              estatística é transformada em vantagem competitiva, permitindo decisões mais precisas
              e fundamentadas durante partidas e treinamentos.
            </p>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-8 shadow-lg">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
              <BrainCircuit className="text-green-500 w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-3">INTELIGÊNCIA ARTIFICIAL</h3>
            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
              Incrementamos Inteligência Artificial para extrair insights em tempo recorde. Nossos
              algoritmos processam milhares de dados para identificar padrões, tendências e
              oportunidades que o olho humano não consegue perceber.
            </p>
          </div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-10 shadow-lg text-center relative overflow-hidden">
            <div className="flex justify-center mb-4">
                 <Target className="text-green-500 w-8 h-8 opacity-80" />
            </div>
            
            <p className="text-white italic text-lg font-medium relative z-10">
            "Vencer começa ao enxergarmos o que ninguém vê. Transformar
            dados em insights e decisões faz com que o treinador ganhe
            visão e o time ganhe campeonatos."
            </p>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-8 shadow-lg text-center flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2 text-white font-semibold">
                <Zap className="text-green-500 w-5 h-5" />
                <span>CONHEÇA MAIS</span>
            </div>
            
            <p className="text-slate-400 text-xs mb-6">
                Escaneie o QR Code para acessar nosso site oficial e conhecer todos os nossos recursos.
            </p>

            <div className="bg-white p-2 rounded-lg">
                <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data==https://sites.google.com/cesar.school/si-protactic/home" 
                    alt="QR Code" 
                    className="w-32 h-32"
                />
            </div>
        </div>
      </div>

      <footer className="text-center text-[10px] text-slate-600 mt-12">
        © 2025 ProTactic. Todos os direitos reservados.
      </footer>
    </div>
  );
}