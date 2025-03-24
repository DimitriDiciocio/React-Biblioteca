import React, { useEffect, useState } from 'react';
import Select from 'react-select';

interface Tag {
  id: number;
  nome: string;
}

interface TagsProps {
  onTagsChange: (tags: Tag[]) => void;
  selectedTags: Tag[]; // Recebe as tags selecionadas como prop
}

const Tags: React.FC<TagsProps> = ({ onTagsChange, selectedTags }) => {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    // Função para buscar as tags no backend
    async function fetchTags() {
      try {
        const response = await fetch("http://127.0.0.1:5000/tags");
        const data = await response.json();
        setTags(data);
      } catch (error) {
        console.error("Erro ao carregar as tags:", error);
      }
    }

    fetchTags();
  }, []);

  // Transformando as tags para o formato que o react-select espera
  const tagOptions = tags.map((tag) => ({
    value: tag.id,
    label: tag.nome,
  }));

  // Função que lida com a mudança das tags selecionadas
  const handleTagChange = (selectedOptions: any) => {
    // Atualizando o estado local com as tags selecionadas
    const updatedTags = selectedOptions || [];
    onTagsChange(
      updatedTags.map((option: any) => ({
        id: option.value,
        nome: option.label,
      })) || []
    );
  };

  const customStyles = {
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: 'transparent',  // Fundo transparente
      width: '470px',  // Largura de 470px
      border: '3px solid #4562D6',  // Borda azul inicial
      padding: '7px 25px',  // Ajuste de padding
      borderRadius: '50px',  // Bordas arredondadas
      fontSize: '16px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: state.isFocused || state.isHovered ? '#4562D6' : '#ccc',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(69, 98, 214, 0.5)' : 'none',
      transition: 'border 0.3s ease-in-out',
      borderWidth: state.isHovered ? '5px' : '3px',
    }),

    option: (base: any, state: any) => ({
      ...base,
      color: 'black',
      padding: '10px',
      backgroundColor: state.isFocused ? '#7979791a' : 'transparent',
      border: state.isFocused ? '3px solid #4562D6' : 'none',
      '&:hover': {
        backgroundColor: '#7979791a',
        border: '3px solid #4562D6',
      },
    }),
  };

  return (
    <Select
      isMulti
      name="tags"
      options={tagOptions}
      value={selectedTags.map(tag => ({ value: tag.id, label: tag.nome }))}
      onChange={handleTagChange}
      getOptionLabel={(e) => e.label}
      getOptionValue={(e) => e.value.toString()}
      closeMenuOnSelect={false}
      styles={customStyles}
    />
  );
};

export default Tags;