import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

interface DeletarLivroProps {
    id_livro: number;
}

const DeletarLivro: React.FC<DeletarLivroProps> = ({ id_livro }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        const confirmacao = await Swal.fire({
            title: 'Tem certeza?',
            text: 'Essa ação não pode ser desfeita!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, deletar!',
            cancelButtonText: 'Cancelar'
        });

        if (!confirmacao.isConfirmed) return;

        setLoading(true);
        
        try {
            const response = await fetch('http://localhost:5000/excluir_livro', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ id_livro }), 
            });

            if (response.ok) {
                await Swal.fire('Deletado!', 'O livro foi removido com sucesso.', 'success');
                navigate('/');
            } else {
                await Swal.fire('Erro!', 'Não foi possível excluir o livro.', 'error');
            }
        } catch (error) {
            console.error('Erro:', error);
            await Swal.fire('Erro!', 'Ocorreu um erro ao tentar excluir o livro.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button onClick={handleDelete} disabled={loading}>
                {loading ? 'Excluindo...' : 'Deletar Livro'}
            </button>
        </div>
    );
};

export default DeletarLivro;
