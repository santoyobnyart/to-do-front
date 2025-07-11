import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// No es necesario importar App si no se usa directamente en las rutas
// import App from "./App"; 
import Login from "./pages/Login";
// No se usa theme directamente aquí, pero se asume que se importa en otro lugar
// import "./styles/theme"; 
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";

/* import PrivateRoute from "./components/PrivateRoutes"; */
import registerServiceWorker from "./utils/registerServiceWorker";

registerServiceWorker();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Router>
      <Routes>
        {/*
          CORRECCIÓN:
          - Se asigna la ruta "/login" explícitamente al componente Login.
          - Se mantiene la ruta raíz "/" apuntando también a Login,
            para que ambas URLs funcionen como punto de entrada.
        */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} /> 
        
        <Route path="/dashboard" element={<Dashboard />}/>
        <Route path="/register" element={<Register />} />
      
      </Routes>
    </Router>
  </React.StrictMode>
);