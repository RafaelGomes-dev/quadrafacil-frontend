import axios from 'axios';

/**
 * Instância axios compartilhada por todos os services do app.
 *
 * O enunciado da disciplina usa o prefixo REACT_APP_ (padrão do Create
 * React App), mas este projeto usa Vite, cujo prefixo obrigatório para
 * variáveis expostas ao navegador é VITE_ — por isso a variável se chama
 * VITE_API_URL (ver .env / .env.example e o README).
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

export default api;
