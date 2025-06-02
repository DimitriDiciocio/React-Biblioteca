import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';

const RedefinirSenha = () => {
  const [senha_nova, setSenhaNova] = useState('');
  const [senha_confirm, setSenhaConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id_usuario } = useParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/reset_senha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('reset_token')}`
        },
        body: JSON.stringify({ 
          senha_nova,
          senha_confirm,
          id_usuario: parseInt(id_usuario as string)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      localStorage.removeItem('reset_token');
      localStorage.removeItem('email_recuperacao'); // Remove o email do localStorage
      alert('Senha redefinida com sucesso!');
      navigate('/login');

    } catch (err) {
      setError('Erro ao redefinir senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="background-blue vh86" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div className="white-container">
          <h2 className="montserrat-alternates title-blue">
            Redefinir Senha
          </h2>

          <form onSubmit={handleSubmit}>
            <input
              type="password"
              value={senha_nova}
              onChange={(e) => setSenhaNova(e.target.value)}
              placeholder="Nova senha"
              required
              className="form-input montserrat-alternates"
            />
            <input
              type="password"
              value={senha_confirm}
              onChange={(e) => setSenhaConfirm(e.target.value)}
              placeholder="Confirmar nova senha"
              required
              className="form-input montserrat-alternates"
            />

            {error && (
              <p className="error-message montserrat-alternates">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="submit-button montserrat-alternates"
            >
              {loading ? 'Redefinindo...' : 'Redefinir Senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RedefinirSenha;
