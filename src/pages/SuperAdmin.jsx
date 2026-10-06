import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/common/Icon';
import Drawer from '../gestor/Drawer';
import { lerGestor, salvarGestor } from '../gestor/model';
import {
  alterarAcesso,
  CONTA_DEMO_ID,
  lerAdmin,
  salvarAdmin,
  validarConta,
} from '../superadmin/model';
import '../styles/superadmin.css';

export default function SuperAdmin() {
  const [dados, setDados] = useState(lerAdmin);
  const [busca, setBusca] = useState('');
  const [status, setStatus] = useState('todos');
  const [editor, setEditor] = useState(null);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  useEffect(() => {
    const sincronizar = () => setDados(lerAdmin());
    window.addEventListener('storage', sincronizar);
    window.addEventListener('quadrafacil-admin', sincronizar);
    return () => {
      window.removeEventListener('storage', sincronizar);
      window.removeEventListener('quadrafacil-admin', sincronizar);
    };
  }, []);
  const gestorDemo = lerGestor();
  const contas = dados.contas.map((c) =>
    c.id === CONTA_DEMO_ID
      ? {
          ...c,
          estabelecimento: gestorDemo?.estabelecimento.nome || c.estabelecimento,
          quadras: gestorDemo?.quadras.length ?? c.quadras,
        }
      : c
  );
  const filtradas = contas.filter(
    (c) =>
      (status === 'todos' || c.status === status) &&
      `${c.nome} ${c.email} ${c.estabelecimento}`.toLowerCase().includes(busca.toLowerCase())
  );
  function abrir(modo, conta) {
    setErro('');
    setAviso('');
    setEditor({ modo, conta });
  }
  function salvar(form, motivo) {
    const atual = lerAdmin();
    const conta = editor.conta;
    const modo = editor.modo;
    const registro = {
      id: crypto.randomUUID(),
      data: new Date().toISOString(),
      nome: form?.nome || conta.nome,
      acao:
        modo === 'revogar'
          ? 'Acesso revogado'
          : modo === 'reativar'
            ? 'Acesso reativado'
            : conta
              ? 'Cadastro e limite atualizados'
              : 'Conta criada pela equipe',
    };
    try {
      let proximo;
      if (modo === 'revogar' || modo === 'reativar')
        proximo = alterarAcesso(
          atual,
          conta.id,
          modo === 'revogar' ? 'revogada' : 'ativa',
          motivo || '',
          registro
        );
      else {
        const validacao = validarConta(form, atual.contas, conta?.id);
        if (validacao) {
          setErro(validacao);
          return;
        }
        const novo = {
          ...conta,
          ...form,
          nome: form.nome.trim(),
          email: form.email.trim().toLowerCase(),
          estabelecimento: form.estabelecimento.trim(),
          limite: Number(form.limite),
          id: conta?.id || crypto.randomUUID(),
          quadras: conta?.quadras || 0,
          status: conta?.status || 'ativa',
        };
        proximo = {
          ...atual,
          contas: conta
            ? atual.contas.map((c) => (c.id === conta.id ? novo : c))
            : [...atual.contas, novo],
          historico: [registro, ...atual.historico].slice(0, 20),
        };
      }
      if (modo === 'cadastro' && conta?.id === CONTA_DEMO_ID && gestorDemo)
        salvarGestor({
          ...gestorDemo,
          estabelecimento: { ...gestorDemo.estabelecimento, nome: form.estabelecimento.trim() },
        });
      salvarAdmin(proximo);
      setDados(proximo);
      setEditor(null);
      setErro('');
      setAviso(`${registro.acao}. Alteração simulada salva neste navegador.`);
    } catch (e) {
      setErro(e.message || 'Não foi possível salvar a simulação.');
    }
  }
  return (
    <div className="admin-page container">
      <div className="admin-heading">
        <div>
          <span className="sobretitulo">ÁREA INTERNA · EQUIPE QUADRAFÁCIL</span>
          <h1>Quem cuida das quadras.</h1>
          <p>Contas criadas pela equipe. Cada gestor, com o acesso certo.</p>
        </div>
        <button className="admin-primary" onClick={() => abrir('cadastro')}>
          <Icon name="mais" size={18} /> Criar gestor
        </button>
      </div>
      <div className="admin-notice">
        <Icon name="escudo" />
        <div>
          <strong>Controle interno · demonstração</strong>
          <p>
            Não existe cadastro público de gestores. Aqui simulamos criação, limites e revogação;
            sem login, envio de convite ou proteção real de acesso.
          </p>
        </div>
      </div>
      <div className="admin-stats">
        {[
          ['Gestores cadastrados', contas.length, 'pessoas'],
          ['Contas ativas', contas.filter((c) => c.status === 'ativa').length, 'check'],
          ['Acessos revogados', contas.filter((c) => c.status === 'revogada').length, 'escudo'],
        ].map(([label, numero, icone]) => (
          <div key={label}>
            <span>
              {label}
              <Icon name={icone} size={19} />
            </span>
            <strong>{String(numero).padStart(2, '0')}</strong>
          </div>
        ))}
      </div>
      {aviso && (
        <p className="admin-success" role="status">
          {aviso}
        </p>
      )}
      {erro && !editor && (
        <p className="mensagem-erro" role="alert">
          {erro}
        </p>
      )}
      <section className="admin-card">
        <div className="admin-card-heading">
          <div>
            <h2>Gestores e estabelecimentos</h2>
            <p>Uma conta por responsável, com limite de quadras definido por nós.</p>
          </div>
          <small>Dados fictícios</small>
        </div>
        <div className="admin-filters">
          <label>
            <Icon name="busca" size={18} />
            <input
              aria-label="Buscar gestores"
              placeholder="Nome, e-mail ou estabelecimento"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </label>
          <select
            aria-label="Situação do acesso"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="todos">Todos os acessos</option>
            <option value="ativa">Ativos</option>
            <option value="revogada">Revogados</option>
          </select>
        </div>
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Gestor</th>
                <th>Estabelecimento</th>
                <th>Quadras / limite</th>
                <th>Acesso</th>
                <th>
                  <span className="visually-hidden">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="admin-person">
                      <span>
                        {c.nome
                          .split(' ')
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </span>
                      <div>
                        <strong>{c.nome}</strong>
                        <small>{c.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong>{c.estabelecimento}</strong>
                    {c.id === CONTA_DEMO_ID && <Link to="/gestor">Ver painel de exemplo ↗</Link>}
                  </td>
                  <td>
                    <strong>
                      {c.quadras} <span className="admin-muted">/ {c.limite}</span>
                    </strong>
                    <small>
                      {c.quadras >= c.limite
                        ? 'Limite atingido'
                        : `${c.limite - c.quadras} disponível(is)`}
                    </small>
                  </td>
                  <td>
                    <span className={`admin-status ${c.status}`}>
                      {c.status === 'ativa' ? 'Ativo' : 'Revogado'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button
                        aria-label={`Editar gestor ${c.nome}`}
                        onClick={() => abrir('cadastro', c)}
                      >
                        Editar
                      </button>
                      <button
                        className={c.status === 'ativa' ? 'admin-danger-text' : ''}
                        aria-label={`${c.status === 'ativa' ? 'Revogar' : 'Reativar'} acesso de ${c.nome}`}
                        onClick={() => abrir(c.status === 'ativa' ? 'revogar' : 'reativar', c)}
                      >
                        {c.status === 'ativa' ? 'Revogar' : 'Reativar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtradas.length && (
          <div className="admin-empty">
            Nenhum gestor encontrado. Ajuste a busca ou crie uma conta.
          </div>
        )}
      </section>
      <section className="admin-card admin-history">
        <h2>Últimas ações da equipe</h2>
        {dados.historico.length ? (
          <ul>
            {dados.historico.slice(0, 5).map((r) => (
              <li key={r.id}>
                <Icon name="check" size={16} />
                <span>
                  <strong>{r.acao}</strong> · {r.nome}
                </span>
                <time dateTime={r.data}>{new Date(r.data).toLocaleString('pt-BR')}</time>
              </li>
            ))}
          </ul>
        ) : (
          <p>
            Criações e alterações aparecerão aqui. Nenhuma ação registrada nesta simulação ainda.
          </p>
        )}
      </section>
      {editor && (
        <EditorAdmin
          key={`${editor.modo}-${editor.conta?.id || 'novo'}`}
          editor={editor}
          erro={erro}
          onClose={() => {
            setEditor(null);
            setErro('');
          }}
          onSave={salvar}
        />
      )}
    </div>
  );
}

function EditorAdmin({ editor, erro, onClose, onSave }) {
  const { modo, conta } = editor;
  const [form, setForm] = useState({
    nome: '',
    email: '',
    estabelecimento: '',
    limite: 1,
    ...conta,
  });
  const [motivo, setMotivo] = useState('');
  const mudar = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const acesso = modo !== 'cadastro';
  return (
    <Drawer
      titulo={
        modo === 'revogar'
          ? 'Revogar acesso'
          : modo === 'reativar'
            ? 'Reativar acesso'
            : conta
              ? 'Editar gestor'
              : 'Criar conta de gestor'
      }
      subtitulo="Controle interno · operação simulada"
      onClose={onClose}
    >
      <form
        className="g-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(form, motivo);
        }}
      >
        {acesso ? (
          <>
            <div className="admin-account-summary">
              <strong>{conta.nome}</strong>
              <span>{conta.estabelecimento}</span>
              <small>{conta.email}</small>
            </div>
            <p className="admin-explanation">
              {modo === 'revogar'
                ? 'O gestor perderá acesso ao painel nesta demonstração. As quadras e reservas serão preservadas; revogar não exclui dados nem cancela reservas.'
                : 'O acesso será liberado novamente, mantendo o cadastro e o limite de quadras.'}
            </p>
            {modo === 'revogar' ? (
              <label className="g-field">
                Motivo da revogação
                <textarea
                  required
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ex.: solicitação do responsável"
                />
              </label>
            ) : (
              conta.motivo && <div className="g-info-banner">Motivo anterior: {conta.motivo}</div>
            )}
          </>
        ) : (
          <>
            <label className="g-field">
              Nome do responsável
              <input
                required
                minLength={3}
                value={form.nome}
                onChange={(e) => mudar('nome', e.target.value)}
                autoComplete="off"
              />
            </label>
            <label className="g-field">
              E-mail do gestor
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => mudar('email', e.target.value)}
                autoComplete="off"
              />
            </label>
            <label className="g-field">
              Estabelecimento
              <input
                required
                value={form.estabelecimento}
                onChange={(e) => mudar('estabelecimento', e.target.value)}
              />
            </label>
            <label className="g-field">
              Limite de quadras
              <input
                required
                type="number"
                min={1}
                max={50}
                step={1}
                value={form.limite}
                onChange={(e) => mudar('limite', e.target.value)}
              />
            </label>
            <p className="admin-explanation">
              A conta é criada pela equipe, não pelo gestor. Nenhuma senha ou convite será enviado.
              Reduzir o limite não apaga quadras existentes: impede novos cadastros até ficar abaixo
              do limite.
            </p>
          </>
        )}
        {erro && (
          <p className="mensagem-erro" role="alert">
            {erro}
          </p>
        )}
        <button
          className={`admin-primary ${modo === 'revogar' ? 'admin-danger' : ''}`}
          type="submit"
        >
          {modo === 'revogar'
            ? 'Confirmar revogação simulada'
            : modo === 'reativar'
              ? 'Reativar conta'
              : conta
                ? 'Salvar alterações'
                : 'Criar conta simulada'}
        </button>
        <button className="admin-secondary" type="button" onClick={onClose}>
          Cancelar
        </button>
      </form>
    </Drawer>
  );
}
