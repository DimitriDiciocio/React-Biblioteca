import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';

const VerificarCodigo = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id_usuario } = useParams();
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return; // Only allow digits
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
    if (!value && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(''));
      inputRefs[5].current?.focus();
      e.preventDefault();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const codigo = otp.join('');
    if (codigo.length < 4) {
      setError('Digite o código completo');
      setLoading(false);
      return;
    }

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

      if (data.token) {
        localStorage.setItem('reset_token', data.token);
        navigate('/recuperar-senha');
      } else {
        setError('Token não recebido do servidor');
      }

    } catch (err) {
      setError('Erro ao verificar código');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setLoading(true);

    const email = localStorage.getItem('email_recuperacao'); // Recupera o email do localStorage
    if (!email) {
      setError('Email não encontrado para reenvio do código');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/esqueci_senha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Erro ao reenviar código');
        return;
      }

      setError('');
      setSuccess('Código reenviado! Verifique seu email.');
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="montserrat-alternates-semibold">
      <Header />
      <div className="background-blue vh86" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div className="white-container montserrat-alternates-semibold">

          <form className="otp-Form montserrat-alternates-semibold" onSubmit={handleSubmit}>
            <span className="mainHeading montserrat-alternates-semibold">Verificar Código</span>
            <p className="otpSubheading montserrat-alternates-semibold">Foi enviado um código para o endereço de email informado</p>
            <div className="inputContainer montserrat-alternates-semibold" style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0' }}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  required
                  maxLength={1}
                  type="text"
                  className="otp-input montserrat-alternates-semibold"
                  id={`otp-input${idx + 1}`}
                  value={digit}
                  ref={inputRefs[idx]}
                  onChange={e => handleOtpChange(idx, e.target.value)}
                  onPaste={idx === 0 ? handleOtpPaste : undefined}
                  style={{ width: '40px', height: '40px', textAlign: 'center', fontSize: '1.5rem' }}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
              ))}
            </div>
            {error && (
              <p className="error-message montserrat-alternates montserrat-alternates-semibold">{error}</p>
            )}
            {success && (
              <p className="success-message montserrat-alternates montserrat-alternates-semibold">{success}</p>
            )}
            <button className="verifyButton submit-button montserrat-alternates montserrat-alternates-semibold" type="submit" disabled={loading}>
              {loading ? 'Verificando...' : 'Verificar Código'}
            </button>
            <p className="resendNote montserrat-alternates-semibold">
              Não recebeu o código? 
              <button 
                className="resendBtn montserrat-alternates-semibold" 
                type="button" 
                onClick={handleResendCode} 
                disabled={loading}
              >
                {loading ? 'Reenviando...' : 'Reenviar código'}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerificarCodigo;
