import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const EsqueciSenha = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/esqueci_senha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Erro ao solicitar recuperação de senha');
        return;
      }

      localStorage.setItem('email_recuperacao', email.toLowerCase()); // Salva o email no localStorage
      setSuccess('Email de recuperação enviado! Redirecionando...');
      setTimeout(() => {
        navigate(`/verificar-codigo/${data.id_usuario[0]}`);
      }, 2000);
    } catch (err) {
      setError('Erro ao conectar com o servidor');
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
            Esqueci Minha Senha
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu e-mail"
                required
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
                opacity: loading ? 0.7 : 1,
                marginBottom: '1rem'
              }}
              className="montserrat-alternates"
            >
              {loading ? 'Enviando...' : 'Enviar'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <Link 
                to="/login" 
                className="montserrat-alternates"
                style={{
                  color: '#2473D9',
                  textDecoration: 'none',
                  fontSize: '0.9rem'
                }}
              >
                Voltar para o login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EsqueciSenha;