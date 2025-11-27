/**
 * Decodifica un JWT sin verificar la firma (solo para leer el payload)
 */
export const decodeJWT = (token) => {
  try {
    if (!token) return null;
    
    // Remover 'Bearer ' si existe
    const cleanToken = token.replace('Bearer ', '');
    
    // JWT tiene 3 partes separadas por punto: header.payload.signature
    const parts = cleanToken.split('.');
    if (parts.length !== 3) {
      console.warn('[JWT] Token inválido, no tiene 3 partes');
      return null;
    }
    
    // Decodificar el payload (segunda parte)
    const payload = parts[1];
    
    // Base64 decode (compatible con React Native)
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    
    return JSON.parse(decoded);
  } catch (error) {
    console.error('[JWT] Error al decodificar token:', error);
    return null;
  }
};

/**
 * Verifica si un token JWT ha expirado
 * @param {string} token - El token JWT
 * @returns {boolean} true si expiró, false si aún es válido
 */
export const isTokenExpired = (token) => {
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) {
      console.warn('[JWT] Token sin fecha de expiración');
      return true;
    }
    
    // exp está en segundos, Date.now() en milisegundos
    const now = Date.now() / 1000;
    const isExpired = decoded.exp < now;
    
    if (isExpired) {
      console.warn('[JWT] Token expirado', {
        exp: new Date(decoded.exp * 1000).toISOString(),
        now: new Date(now * 1000).toISOString()
      });
    }
    
    return isExpired;
  } catch (error) {
    console.error('[JWT] Error al verificar expiración:', error);
    return true;
  }
};

/**
 * Obtiene el tiempo restante antes de que expire el token (en segundos)
 * @param {string} token - El token JWT
 * @returns {number} Segundos hasta expiración, o 0 si ya expiró
 */
export const getTimeUntilExpiry = (token) => {
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return 0;
    
    const now = Date.now() / 1000;
    const timeRemaining = decoded.exp - now;
    
    return Math.max(0, Math.floor(timeRemaining));
  } catch (error) {
    console.error('[JWT] Error al calcular tiempo de expiración:', error);
    return 0;
  }
};

/**
 * Verifica si el token expirará pronto (en los próximos 5 minutos)
 * @param {string} token - El token JWT
 * @returns {boolean} true si expirará en menos de 5 minutos
 */
export const isTokenExpiringSoon = (token) => {
  const timeRemaining = getTimeUntilExpiry(token);
  const FIVE_MINUTES = 5 * 60; // 5 minutos en segundos
  
  return timeRemaining > 0 && timeRemaining < FIVE_MINUTES;
};
