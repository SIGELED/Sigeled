import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY_PREFIX = 'legajo_cache_';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 horas

export const useLegajoCache = (userId) => {
  const [cachedData, setCachedData] = useState(null);
  const [isFromCache, setIsFromCache] = useState(false);

  const cacheKey = `${CACHE_KEY_PREFIX}${userId}`;

  // Cargar datos del cache
  const loadFromCache = async () => {
    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        
        // Verificar si el cache no ha expirado
        if (age < CACHE_EXPIRY_MS) {
          console.log('[LegajoCache] Datos cargados del cache, edad:', Math.floor(age / 1000 / 60), 'minutos');
          setCachedData(data);
          setIsFromCache(true);
          return data;
        } else {
          console.log('[LegajoCache] Cache expirado, limpiando...');
          await AsyncStorage.removeItem(cacheKey);
        }
      }
    } catch (error) {
      console.error('[LegajoCache] Error al cargar cache:', error);
    }
    return null;
  };

  // Guardar datos en el cache
  const saveToCache = async (data) => {
    try {
      const cacheObject = {
        data,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheObject));
      console.log('[LegajoCache] Datos guardados en cache');
      setCachedData(data);
      setIsFromCache(false);
    } catch (error) {
      console.error('[LegajoCache] Error al guardar cache:', error);
    }
  };

  // Limpiar cache
  const clearCache = async () => {
    try {
      await AsyncStorage.removeItem(cacheKey);
      setCachedData(null);
      setIsFromCache(false);
      console.log('[LegajoCache] Cache limpiado');
    } catch (error) {
      console.error('[LegajoCache] Error al limpiar cache:', error);
    }
  };

  return {
    cachedData,
    isFromCache,
    loadFromCache,
    saveToCache,
    clearCache
  };
};
