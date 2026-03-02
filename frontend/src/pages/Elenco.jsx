import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Users, AlertCircle } from "lucide-react";

function calcularIdade(dataNascimento) {
  if (!dataNascimento) return null;
  const nascimento = new Date(dataNascimento);
  if (Number.isNaN(nascimento.getTime())) return null;
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade -= 1;
  }
  return idade;
}

export default function Elenco() {
  const [jogadores, setJogadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const response = await api.get("/jogadores/");
        if (!mounted) return;
        const data = response.data?.results || response.data || [];
        setJogadores(data);
      } catch (err) {
        if (!mounted) return;
        setError("Não foi possível carregar os jogadores do clube.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="max-w-6xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-wide">
          Central do Elenco
        </h1>
        <p className="text-sm text-slate-400">
          Gerencie e acompanhe seus jogadores.
        </p>
      </div>

      {loading ? (
        <div className="mt-6 text-sm text-slate-400">Carregando...</div>
      ) : error ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-red-300">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      ) : jogadores.length === 0 ? (
        <div className="mt-6 text-sm text-slate-400">
          Nenhum jogador cadastrado no seu clube.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {jogadores.map((jogador) => {
            const idade = calcularIdade(jogador.data_nascimento);
            return (
              <div
                key={jogador.id}
                className="rounded-2xl border border-slate-800 bg-[#0b1220] p-5 flex gap-4"
              >
                {jogador.foto ? (
                  <img
                    src={jogador.foto}
                    alt={jogador.nome}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-900 flex items-center justify-center">
                    <Users className="w-5 h-5 text-slate-600" />
                  </div>
                )}

                <div className="flex-1">
                  <div className="text-lg font-semibold text-slate-100">{jogador.nome}</div>
                  <div className="text-sm text-slate-400">{jogador.posicao}</div>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                    {idade !== null && <span>{idade} anos</span>}
                    {jogador.altura && <span>{jogador.altura} cm</span>}
                    {jogador.peso && <span>{jogador.peso} kg</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}