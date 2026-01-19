import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";

import Login from "./pages/Login";
import Sobre from "./pages/Sobre";
import Registro from "./pages/Registro";
import RegistroJogadores from "./pages/RegistroJogadores";
import RegistroClube from "./pages/RegistroClube";
import RegistroCompeticoes from "./pages/RegistroCompeticoes";
import Inicio from "./pages/Inicio";
import Elenco from "./pages/Elenco";
import Adversario from "./pages/Adversario";
import TempoReal from "./pages/TempoReal";
import Clube from "./pages/Clube";
import CriarPartida from "./pages/CriarPartida";
import ListarJogadores from "./pages/ListarJogadores";

import "./index.css"

function Admin() {
  return <h1>Área do Administrador</h1>;
}

function Treinador() {
  return <h1>Área do Treinador</h1>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/sobre" element={<Sobre />} />

        <Route element={<AppLayout />}>
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/elenco" element={<Elenco />} />
          <Route path="/adversario" element={<Adversario />} />
          <Route path="/tempo-real" element={<TempoReal />} />
          <Route path="/clube" element={<Clube />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/registro/jogadores" element={<RegistroJogadores />} />
          <Route path="/registro/clube" element={<RegistroClube />} />
          <Route path="/registro/competicoes" element={<RegistroCompeticoes />} />
          <Route path="/listar-jogadores" element={<ListarJogadores />} />
          <Route path="/registro/partidas" element={<CriarPartida />} />
        </Route>

        <Route path="/admin" element={<Admin />} />
        <Route path="/treinador" element={<Treinador />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}