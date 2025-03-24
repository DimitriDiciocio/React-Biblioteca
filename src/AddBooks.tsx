import React, { useState } from 'react';
import Tags from './Tags';

interface Tag {
  id: number;
  nome: string;
}

interface AddBooksProps {
  onAddBookSubmit: (
    titulo: string,
    autor: string,
    categoria: string,
    isbn: string,
    qtd_disponivel: string,
    descricao: string,
    selectedTags: Tag[]
  ) => void;
}

const AddBooks: React.FC<AddBooksProps> = ({ onAddBookSubmit }) => {
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [categoria, setCategoria] = useState('');
  const [isbn, setIsbn] = useState('');
  const [qtd_disponivel, setQtd_disponivel] = useState('');
  const [descricao, setDescricao] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]); // Agora é um array para armazenar as tags selecionadas

  // Função para atualizar as tags selecionadas
  const handleTagsChange = (tags: Tag[]) => {
    setSelectedTags(tags); // Atualiza o estado com as tags selecionadas
  };

  // Função para enviar os dados do livro para a API
  const handleSubmit = async () => {
    const newBook = {
      titulo,
      autor,
      categoria,
      isbn,
      qtd_disponivel,
      descricao,
      selectedTags,
    };

    try {
      const response = await fetch('http://127.0.0.1:5000/adicionar_livros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBook),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Livro adicionado com sucesso!', data);
        // Após o livro ser adicionado com sucesso, chama o onAddBookSubmit para atualizar o estado
        onAddBookSubmit(titulo, autor, categoria, isbn, qtd_disponivel, descricao, selectedTags);
      } else {
        console.error('Erro ao adicionar o livro');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Digite o título do livro"
        value={titulo}
        onChange={(event) => setTitulo(event.target.value)}
      />
      <input
        type="text"
        placeholder="Digite o(a) autor(a) do livro"
        value={autor}
        onChange={(event) => setAutor(event.target.value)}
      />
      <input
        type="text"
        placeholder="Digite a categoria do livro"
        value={categoria}
        onChange={(event) => setCategoria(event.target.value)}
      />
      <input
        type="text"
        placeholder="Digite o isbn do livro"
        value={isbn}
        onChange={(event) => setIsbn(event.target.value)}
      />
      <input
        type="text"
        placeholder="Digite a quantidade de livros"
        value={qtd_disponivel}
        onChange={(event) => setQtd_disponivel(event.target.value)}
      />
      <input
        type="text"
        placeholder="Digite a sinopse do livro"
        value={descricao}
        onChange={(event) => setDescricao(event.target.value)}
      />

      <label>Tags</label>
      <Tags onTagsChange={handleTagsChange} /> {/* Passa a função para o componente Tags */}

      <button onClick={handleSubmit}>Adicionar livro</button>
    </div>
  );
};

export default AddBooks;
