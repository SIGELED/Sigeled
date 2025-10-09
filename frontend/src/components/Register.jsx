import { useState } from "react";
import { useNavigate, Link} from "react-router-dom";
import { authService, identificationService, personaService } from "../services/api";
import { BiSolidError } from "react-icons/bi";
import logo from "../assets/svg/logoLetras.svg";

const Register = () => {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    email: "",
    password: "",
    confirmarPassword: "",
    nombre: "",
    apellido: "",
    fecha_nacimiento: "",
    sexo: "",
    telefono: "",
    dni: "",
    cuil: "",
    id_usuario:null,
    id_persona: null,
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setUserData({ ...userData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
      
      try {
        if(step === 1){
          if(userData.password !== userData.confirmarPassword){
            setError("Las contraseñas no coinciden");
            return;
          }

          const { confirmarPassword, nombre, apellido, fecha_nacimiento, sexo, telefono, dni, cuil, id_persona, ...userRegister } = userData;
          const res = await authService.register(userRegister);

          if(res.data.token){
            localStorage.setItem("token", res.data.token);
          }

          setUserData({...userData, id_usuario: res.data.user.id})
          setStep(2);
        }

        else if(step === 2) {
          const personaData = {
            nombre: userData.nombre,
            apellido: userData.apellido,
            fecha_nacimiento: userData.fecha_nacimiento,
            sexo: userData.sexo,
            telefono: userData.telefono,
            id_usuario: userData.id_usuario,
          };

          const res = await personaService.createPersona(personaData);
          setUserData({...userData, id_persona: res.data.persona.id_persona});
          console.log(res.data);
          setStep(3);
        }

        else if (step === 3){
          if(!userData.id_persona){
            setError("Error interno: falta el ID de la persona");
            return;
          }
          
          const identificationData = {
            dni: userData.dni,
            cuil: userData.cuil
          };

          await identificationService.createIdentificacion(userData.id_persona, identificationData);
          navigate("/revision");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error en el registro");
      }
    };

  const renderStep = () =>{
    switch(step) {
      case 1:
        return(
          <>
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
          </>
        );

        case 2:
          return(
            <>
              <input 
                type="text"
                name="nombre"
                placeholder="Nombre"
                value={userData.nombre}
                onChange={handleChange}
                className="w-full h-14 px-5 bg-[#0E1F30] text-white placeholder-white/50 rounded-xl text-2xl leading-none outline-none focus:ring-2 focus:ring-[#19F124]/60"
                required
              />
              <input 
                type="text"
                name="apellido"
                placeholder="Apellido"
                value={userData.apellido}
                onChange={handleChange}
                className="w-full h-14 px-5 bg-[#0E1F30] text-white placeholder-white/50 rounded-xl text-2xl leading-none outline-none focus:ring-2 focus:ring-[#19F124]/60"
                required
              />
              <input 
                type="date"
                name="fecha_nacimiento"
                value={userData.fecha_nacimiento}
                onChange={handleChange}
                className="w-full h-14 px-5 bg-[#0E1F30] text-white placeholder-white/50 rounded-xl text-2xl leading-none outline-none focus:ring-2 focus:ring-[#19F124]/60"
                required
              />
              <select name="sexo" value={userData.sexo} onChange={handleChange} className="w-full h-14 px-5 bg-[#0E1F30] text-white placeholder-white/50 rounded-xl text-2xl leading-none outline-none focus:ring-2 focus:ring-[#19F124]/60" required>
                <option value="">Seleccionar sexo</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
              <input 
                type="text"
                name="telefono"
                value={userData.telefono}
                onChange={handleChange}
                placeholder="Teléfono"
                className="w-full h-14 px-5 bg-[#0E1F30] text-white placeholder-white/50 rounded-xl text-2xl leading-none outline-none focus:ring-2 focus:ring-[#19F124]/60"
                required
              />
            </>
          );

          case 3:
            return (
              <>
                <input 
                  type="text" 
                  name="dni"
                  placeholder="DNI"
                  value={userData.dni}
                  onChange={handleChange}
                  className="w-full h-14 px-5 bg-[#0E1F30] text-white placeholder-white/50 rounded-xl text-2xl leading-none outline-none focus:ring-2 focus:ring-[#19F124]/60"
                  required
                />
                <input 
                  type="text" 
                  name="cuil"
                  placeholder="CUIL"
                  value={userData.cuil}
                  onChange={handleChange}
                  className="w-full h-14 px-5 bg-[#0E1F30] text-white placeholder-white/50 rounded-xl text-2xl leading-none outline-none focus:ring-2 focus:ring-[#19F124]/60"
                  required
                />
              </>
            );
            default:
              return null;
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#030C14]">
      <div className="grid w-full min-h-screen grid-cols-1 md:grid-cols-2">
        {/* Columna izquierda*/}
        <div className="bg-[#0C1A27] rounded-2xl m-5 md:m-5 flex items-center justify-center">
          <img src={logo} alt="SIGELED" className="max-h-[70vh] w-auto" />
        </div>

        {/* Columna derecha*/}
        <div className="flex flex-col justify-center p-8 pl-20 pr-20">
        <div className="w-full bg-[#0E1F30] h-4 rounded-xl">
          <div
          className="h-4 bg-[#19F124] rounded-xl transition-all duration-300"
          style={{width:`${(step/3) * 100}%`}}
          />
        </div>
        
          <h1 className="text-5xl md:text-6xl font-semibold text-start text-[#19F124] mb-8">
            Registro de Usuario
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {renderStep()}

            {error && (
              <div className="p-3 mb-6 text-[1.7rem] text-[#0a0000] font-[600] rounded-xl bg-[#f48383] flex flex-row items-center">
                <BiSolidError className="w-9 h-9 mr-2 text-[#0a0000] font-black"/>
                {error}
              </div>
              )}

              <button
              type="submit"
              className="w-full h-16 rounded-full text-4xl font-black leading-none bg-transparent text-[#19F124] border-[3px] border-[#19F124] hover:bg-[#19F124] hover:text-[#020c14] cursor-pointer transition-colors mt-2"
              >
                {step < 3 ? "Siguiente" : "Finalizar"}
              </button>

            <div className="flex justify-between mt-4">
              {step > 1 && (
                <button type="button" onClick={() => setStep(step-1)} className="text-lg text-white underline">
                  Atrás
                </button>
              )}
              <span className="text-xl text-white/80">
                ¿Ya tienes una una cuenta?{" "}
                <Link to="/login" className="text-[#19F124] font-semibold hover:underline">
                  Iniciar Sesión
                </Link>
              </span>
            </div>
          </form>
          </div>
        </div>
      </div>
  );
};


export default Register;
