import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/svg/logoLetras.svg";

const Register = () => {
  const [userData, setUserData] = useState({
    nombre: "",
    email: "",
    contraseña: "",
    confirmarContraseña: "",
    rol: "docente",
  });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setUserData({ ...userData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (userData.contraseña !== userData.confirmarContraseña) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      const { confirmarContraseña, ...dataToSubmit } = userData;
      const response = await authService.register(dataToSubmit);
      login(response.data.user, response.data.token);
      navigate("/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Error al registrar usuario");
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#030C14]">
      <div className="grid w-full min-h-screen grid-cols-1 md:grid-cols-2">
        {/* Columna izquierda: card con logo */}
        <div className="bg-[#0C1A27] rounded-2xl m-5 md:m-5 flex items-center justify-center">
          <img src={logo} alt="SIGELED" className="max-h-[70vh] w-auto" />
        </div>

        {/* Columna derecha: formulario */}
        <div className="flex flex-col justify-center p-8 pl-20 pr-20">
          <h1 className="text-5xl md:text-6xl font-semibold text-start text-[#19F124] mb-8">
            Registro de Usuario
          </h1>

          {error && (
            <div className="p-3 mb-6 text-red-800 break-words bg-red-100 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <label htmlFor="nombre" className="sr-only">Nombre</label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              value={userData.nombre}
              onChange={handleChange}
              required
              placeholder="Nombre"
              className="w-full h-14 px-5 bg-[#0E1F30] text-white placeholder-white/50 rounded-xl text-2xl leading-none outline-none focus:ring-2 focus:ring-[#19F124]/60"
              autoComplete="name"
            />

            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={userData.email}
              onChange={handleChange}
              required
              placeholder="Email"
              className="w-full h-14 px-5 bg-[#0E1F30] text-white placeholder-white/50 rounded-xl text-2xl leading-none outline-none focus:ring-2 focus:ring-[#19F124]/60"
              autoComplete="email"
            />

            <label htmlFor="contraseña" className="sr-only">Contraseña</label>
            <input
              id="contraseña"
              name="contraseña"
              type="password"
              value={userData.contraseña}
              onChange={handleChange}
              required
              placeholder="Contraseña"
              className="w-full h-14 px-5 bg-[#0E1F30] text-white placeholder-white/50 rounded-xl text-2xl leading-none outline-none focus:ring-2 focus:ring-[#19F124]/60"
              autoComplete="new-password"
            />

            <label htmlFor="confirmarContraseña" className="sr-only">Confirmar contraseña</label>
            <input
              id="confirmarContraseña"
              name="confirmarContraseña"
              type="password"
              value={userData.confirmarContraseña}
              onChange={handleChange}
              required
              placeholder="Confirmar contraseña"
              className="w-full h-14 px-5 bg-[#0E1F30] text-white placeholder-white/50 rounded-xl text-2xl leading-none outline-none focus:ring-2 focus:ring-[#19F124]/60"
              autoComplete="new-password"
            />

            <div>
              <label htmlFor="rol" className="block mb-2 text-white">Rol</label>
              <select
                id="rol"
                name="rol"
                value={userData.rol}
                onChange={handleChange}
                className="w-full h-14 px-5 bg-[#0E1F30] text-white rounded-xl text-2xl leading-none outline-none focus:ring-2 focus:ring-[#19F124]/60"
              >
                <option className="text-white" value="docente">Docente</option>
                <option className="text-white" value="rrhh">RRHH</option>
                <option className="text-white" value="admin">Administrador</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full h-16 rounded-full text-4xl font-black leading-none bg-transparent text-[#19F124] border-[3px] border-[#19F124] hover:bg-[#19F124] hover:text-[#020c14] cursor-pointer transition-colors mt-2"
            >
              Registrarse
            </button>
          </form>

          <p className="mt-6 text-white text-center text-[1.1rem]">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="text-[#19F124] mt-2 font-black hover:underline">
              Iniciar Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
