import React from 'react';

interface DeletarLivroProps {
    id: number;
}

const DeletarLivro: React.FC<DeletarLivroProps> = ({ id }) => {
    const handleDelete = async (id: number) => {
        try {
            const response = await fetch(`http://localhost:5000/deletar_livro/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('Livro deletado com sucesso!');
            } else {
                alert('Erro ao deletar o livro.');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao deletar o livro.');
        }
    };

    return (
        <div>
            <button onClick={() => handleDelete(id)}>Deletar Livro</button>
        </div>
    );
};

export default DeletarLivro;
