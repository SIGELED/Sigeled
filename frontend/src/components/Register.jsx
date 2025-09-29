import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/svg/logoLetras.svg";

const Register = () => {
  const [userData, setUserData] = useState({
    email: "",
    password: "",
    confirmarPassword: "",
  });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setUserData({ ...userData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (userData.password !== userData.confirmarPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      const { confirmarPassword, ...dataToSubmit } = userData;
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

            <label htmlFor="password" className="sr-only">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              value={userData.password}
              onChange={handleChange}
              required
              placeholder="Contraseña"
              className="w-full h-14 px-5 bg-[#0E1F30] text-white placeholder-white/50 rounded-xl text-2xl leading-none outline-none focus:ring-2 focus:ring-[#19F124]/60"
              autoComplete="new-password"
            />

            <label htmlFor="confirmarPassword" className="sr-only">Confirmar contraseña</label>
            <input
              id="confirmarPassword"
              name="confirmarPassword"
              type="password"
              value={userData.confirmarPassword}
              onChange={handleChange}
              required
              placeholder="Confirmar contraseña"
              className="w-full h-14 px-5 bg-[#0E1F30] text-white placeholder-white/50 rounded-xl text-2xl leading-none outline-none focus:ring-2 focus:ring-[#19F124]/60"
              autoComplete="new-password"
            />

            <div className="flex items-center justify-between">
              <span className="text-xl text-white/80">
                ¿Ya tienes una una cuenta?{" "}
                <Link to="/login" className="text-[#19F124] font-semibold hover:underline">
                  Iniciar Sesión
                </Link>
              </span>
            </div>

            <button
              type="submit"
              className="w-full h-16 rounded-full text-4xl font-black leading-none bg-transparent text-[#19F124] border-[3px] border-[#19F124] hover:bg-[#19F124] hover:text-[#020c14] cursor-pointer transition-colors mt-2"
            >
              Registrarse
            </button>
          </form>

          
        </div>
      </div>
    </div>
  );
};

export default Register;
