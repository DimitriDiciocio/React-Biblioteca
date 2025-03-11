import React from 'react';

const DeletarLivro: React.FC = () => {
    const handleDelete = async (id: number) => {
        try {
            const response = await fetch(`localhost:5000/deletar_livro/${id}`, {
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
            <h1>Deletar Livro</h1>
            <button onClick={() => handleDelete(1)}>Deletar Livro com ID 1</button>
        </div>
    );
};

export default DeletarLivro;