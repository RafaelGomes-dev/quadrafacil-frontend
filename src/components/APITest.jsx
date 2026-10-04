import { useEffect, useState } from 'react';
import api from '../services/api';

/** Verifica e exibe se a API do QuadraFacil está respondendo. */
function APITest() {
  const [statusDaApi, setStatusDaApi] = useState('verificando');

  useEffect(() => {
    let cancelado = false;

    api
      .get('/health')
      .then(() => {
        if (!cancelado) setStatusDaApi('online');
      })
      .catch((erro) => {
        console.error('Falha ao consultar a API:', erro);
        if (!cancelado) setStatusDaApi('offline');
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const rotulosPorStatus = {
    verificando: 'Verificando conexão com a API...',
    online: 'API conectada e funcionando',
    offline: 'Não foi possível conectar à API',
  };

  return <p className={`status-api status-api-${statusDaApi}`}>{rotulosPorStatus[statusDaApi]}</p>;
}

export default APITest;
