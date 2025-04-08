import React, { useEffect, useState } from 'react';

type Emprestimo = {
  id_emprestimo: number;
  usuario: string;
  titulo: string;
  data_retirada: string | null;
  data_devolver: string | null;
  status: string;
};

type Reserva = {
  id_reserva: number;
  usuario: string;
  titulo: string;
  data_criacao: string | null;
  data_validade: string | null;
  status: string;
};

type MovimentacoesResponse = {
  emprestimos: Record<string, Emprestimo[]>;
  reservas: Record<string, Reserva[]>;
};

// Mapeia o status para uma cor de destaque
const statusColors: Record<string, string> = {
  'PENDENTE': 'bg-yellow-100 text-yellow-800',
  'ATIVO': 'bg-blue-100 text-blue-800',
  'CANCELADO': 'bg-red-100 text-red-800',
  'DEVOLVIDO': 'bg-green-100 text-green-800',

  'EM ESPERA': 'bg-purple-100 text-purple-800',
  'CANCELADA': 'bg-red-200 text-red-900',
  'EXPIRADA': 'bg-gray-200 text-gray-800',
  'ATENDIDA': 'bg-green-200 text-green-800',
};

const Movimentacoes: React.FC = () => {
  const [data, setData] = useState<MovimentacoesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/movimentacoes', {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then(res => res.json())
      .then((json: MovimentacoesResponse) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erro ao buscar movimentações:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center mt-10">Carregando movimentações...</p>;

  return (
    <div className="p-6 space-y-10">
      <section>
        <h2 className="text-3xl font-bold text-blue-700 mb-4">📚 Empréstimos</h2>
        {Object.entries(data?.emprestimos || {}).map(([status, emprestimos]) => (
          <div key={status} className="mb-6">
            <h3 className={`text-xl font-semibold px-3 py-1 inline-block rounded ${statusColors[status] || 'bg-gray-100 text-black'}`}>
              {status}
            </h3>
            <ul className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {emprestimos.map((e) => (
                <li key={e.id_emprestimo} className="border rounded-xl p-4 shadow bg-white space-y-1">
                  <p><strong>Usuário:</strong> {e.usuario}</p>
                  <p><strong>Título:</strong> {e.titulo}</p>
                  <p><strong>Retirada:</strong> {e.data_retirada || '—'}</p>
                  <p><strong>Devolver:</strong> {e.data_devolver || '—'}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-3xl font-bold text-green-700 mb-4">📖 Reservas</h2>
        {Object.entries(data?.reservas || {}).map(([status, reservas]) => (
          <div key={status} className="mb-6">
            <h3 className={`text-xl font-semibold px-3 py-1 inline-block rounded ${statusColors[status] || 'bg-gray-100 text-black'}`}>
              {status}
            </h3>
            <ul className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reservas.map((r) => (
                <li key={r.id_reserva} className="border rounded-xl p-4 shadow bg-white space-y-1">
                  <p><strong>Usuário:</strong> {r.usuario}</p>
                  <p><strong>Título:</strong> {r.titulo}</p>
                  <p><strong>Criação:</strong> {r.data_criacao || '—'}</p>
                  <p><strong>Validade:</strong> {r.data_validade || '—'}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Movimentacoes;