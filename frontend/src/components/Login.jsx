import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/svg/logoLetras.svg";
import { BiSolidError } from "react-icons/bi";

export default function Login() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setCredentials({ ...credentials, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await authService.login(credentials);
      login(data.user, data.token);
      navigate("/dashboard");
    } catch (err) {
      if(err.response?.status === 403){
        navigate("/revision");
      }else{
        setError(err.response?.data?.message || "Error al iniciar sesión");
      }
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#030C14]">
      <div className="grid w-full min-h-screen grid-cols-1 md:grid-cols-2">
        <div className="bg-[#0C1A27] rounded-2xl m-5 md:m-5 flex items-center justify-center">
          <img src={logo} alt="SIGELED" className="max-h-[70vh] w-auto" />
        </div>

        <div className="flex flex-col justify-center p-8 md:p-20">
          <h1 className="text-[#19F124] text-start font-semibold text-5xl md:text-6xl mb-8">
            Iniciar Sesión
          </h1>


          <form onSubmit={handleSubmit} className="space-y-5">
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              autoComplete="email"
              value={credentials.email}
              onChange={handleChange}
              required
              className="w-full h-14 px-5 rounded-xl bg-[#0E1F30] text-white placeholder-white/50 text-2xl leading-none outline-none focus:ring-2 focus:ring-[#19F124]/60"
            />

            <label htmlFor="password" className="sr-only">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={credentials.password}
              onChange={handleChange}
              required
              className="w-full h-14 px-5 rounded-xl bg-[#0E1F30] text-white placeholder-white/50 text-2xl leading-none outline-none focus:ring-2 focus:ring-[#19F124]/60"
            />

            <div className="flex items-center justify-between">
              <span className="text-xl text-white/80">
                ¿No tienes una cuenta?{" "}
                <Link to="/register" className="text-[#19F124] font-semibold hover:underline">
                  Registrarse
                </Link>
              </span>
            </div>

            <button
              type="submit"
              className="w-full h-16 rounded-full text-4xl font-black leading-none bg-transparent mt-2 text-[#19F124] border-[3px] border-[#19F124] hover:bg-[#19F124] hover:text-[#020c14] cursor-pointer transition-colors"
            >
              Ingresar
            </button>

            {error && (
            <div className="p-3 mb-6 text-[1.7rem] text-[#0a0000] font-[600] rounded-xl bg-[#f48383] flex flex-row items-center">
              <BiSolidError className="w-9 h-9 mr-2 text-[#0a0000] font-black"/>
              {error}
            </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
