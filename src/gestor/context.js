import { createContext, useContext } from 'react';
export const GestorContexto = createContext(null);
export const useGestor = () => useContext(GestorContexto);
