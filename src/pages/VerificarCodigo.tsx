import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';

const VerificarCodigo = () => {
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id_usuario } = useParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/verificar_codigo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          codigo: parseInt(codigo),
          id_usuario: parseInt(id_usuario as string)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Código inválido');
        return;
      }

      // Store the token in localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
        navigate(`/recuperar-senha/${id_usuario}`);
      } else {
        setError('Token não recebido do servidor');
      }

    } catch (err) {
      setError('Erro ao verificar código');
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
            Verificar Código
          </h2>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Digite o código recebido"
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
              {loading ? 'Verificando...' : 'Verificar Código'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerificarCodigo;
