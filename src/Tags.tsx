import React, { useEffect, useState } from 'react';
import Select from 'react-select';

interface Tag {
  id: number;
  nome: string;
}

interface TagsProps {
  onTagsChange: (tags: Tag[]) => void;
}

const Tags: React.FC<TagsProps> = ({ onTagsChange }) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]); // Array de objetos no formato { value, label }

  useEffect(() => {
    async function fetchTags() {
      const response = await fetch('http://127.0.0.1:5000/tags');
      const data = await response.json();
      setTags(data);
    }
    fetchTags();
  }, []); // Apenas executa uma vez após a montagem do componente

  // Transformar as tags para o formato que o react-select espera
  const tagOptions = tags.map(tag => ({
    value: tag.id,
    label: tag.nome,
  }));

  // Função que lida com a mudança de tags
  const handleTagChange = (selectedOptions: Tag[]) => {
    setSelectedTags(selectedOptions || []); // Atualiza o estado com as tags selecionadas
    onTagsChange(selectedOptions.map(option => ({
      id: option.value, 
      nome: option.label
    })) || []); // Converte as opções selecionadas para o formato { id, nome }
  };

  return (
    <div>
      <Select
        isMulti
        name="tags"
        options={tagOptions}
        value={selectedTags}
        onChange={handleTagChange} // Chama a função para atualizar as tags
        getOptionLabel={(e) => e.label}
        getOptionValue={(e) => e.value.toString()}
        closeMenuOnSelect={false}
      />
    </div>
  );
};

export default Tags;
