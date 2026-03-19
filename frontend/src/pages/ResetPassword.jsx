import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Lock, Eye, EyeOff, ChevronRight, Check } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import logoImg from "../assets/logo-protactic.png";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Extrair uid e token da URL (?uid=...&token=...)
  const queryParams = new URLSearchParams(location.search);
  const uid = queryParams.get("uid");
  const token = queryParams.get("token");

  useEffect(() => {
    if (!uid || !token) {
      MySwal.fire({
        title: 'Link Inválido!',
        text: 'Este link de redefinição de senha está incompleto ou inválido.',
        icon: 'error',
        background: '#0f172a',
        color: '#e2e8f0',
        confirmButtonColor: '#ef4444',
      }).then(() => {
        navigate("/");
      });
    }
  }, [uid, token, navigate]);

  const Toast = MySwal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#0f172a',
    color: '#e2e8f0',
  });

  async function handleResetPassword(e) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      Toast.fire({
        icon: 'error',
        title: 'As senhas não coincidem.'
      });
      return;
    }

    if (newPassword.length < 8) {
        Toast.fire({
          icon: 'warning',
          title: 'A senha deve ter pelo menos 8 caracteres.'
        });
        return;
      }

    setLoading(true);

    try {
      await api.post("/password-reset-confirm/", {
        uid,
        token,
        new_password: newPassword
      });

      MySwal.fire({
        title: 'Sucesso!',
        text: 'Sua senha foi redefinida com sucesso. Agora você já pode logar com a nova senha.',
        icon: 'success',
        background: '#0f172a',
        color: '#e2e8f0',
        confirmButtonColor: '#22c55e',
      }).then(() => {
        navigate("/");
      });

    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || 'Link expirado ou inválido.';
      Toast.fire({
        icon: 'error',
        title: detail
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-green-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />

      <main className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-2xl p-8 shadow-2xl z-10">
        <div className="flex flex-col items-center mb-8">
          <img src={logoImg} alt="Logo ProTactic" className="w-48 h-auto mb-6" />
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white uppercase tracking-wider">Nova Senha</h2>
            <p className="text-slate-400 text-sm mt-2">
              Defina sua nova senha de acesso.
            </p>
          </div>
        </div>

        <form onSubmit={handleResetPassword} className="flex flex-col gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Nova Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#1e293b] border border-slate-700 rounded-lg py-3 pl-10 pr-10 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Confirmar Nova Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Repita a nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#1e293b] border border-slate-700 rounded-lg py-3 pl-10 pr-10 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-slate-900 font-bold py-3 rounded-lg mt-2 flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg shadow-green-500/20"
          >
            {loading ? "Processando..." : "Redefinir Senha"}
            {!loading && <Check className="h-5 w-5" />}
          </button>
        </form>
      </main>
    </div>
  );
}
