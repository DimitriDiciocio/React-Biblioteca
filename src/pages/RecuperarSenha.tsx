import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';

const RecuperarSenha = () => {
  const [formData, setFormData] = useState({
    senha_nova: '',
    senha_confirm: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token');

  if (!token) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/reset_senha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          senha_nova: formData.senha_nova,
          senha_confirm: formData.senha_confirm
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || data.erro || 'Erro ao redefinir senha');
        return;
      }

      setSuccess('Senha alterada com sucesso!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);    } catch (err: unknown) {
      console.error('Erro:', err);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div>
      <Header />
      <div className="background-blue vh86" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 className="montserrat-alternates" style={{
            textAlign: 'center',
            marginBottom: '1.5rem',
            color: '#2473D9'
          }}>
            Redefinir Senha
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="password"
                name="senha_nova"
                value={formData.senha_nova}
                onChange={handleChange}
                placeholder="Nova senha"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  marginBottom: '0.5rem'
                }}
                className="montserrat-alternates"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <input
                type="password"
                name="senha_confirm"
                value={formData.senha_confirm}
                onChange={handleChange}
                placeholder="Confirme a nova senha"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  marginBottom: '0.5rem'
                }}
                className="montserrat-alternates"
              />
            </div>

            {error && (
              <p style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }} className="montserrat-alternates">
                {error}
              </p>
            )}

            {success && (
              <p style={{ color: 'green', textAlign: 'center', marginBottom: '1rem' }} className="montserrat-alternates">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#2473D9',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
              className="montserrat-alternates"
            >
              {loading ? 'Alterando...' : 'Alterar Senha'}
            </button>

            <p style={{ 
              marginTop: '1rem', 
              fontSize: '0.85rem', 
              color: '#666',
              textAlign: 'center' 
            }} className="montserrat-alternates">
              A senha deve conter pelo menos 8 caracteres, uma letra maiúscula, 
              uma letra minúscula, um número e um caractere especial.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecuperarSenha;