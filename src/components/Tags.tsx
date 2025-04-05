import React, { useEffect, useState } from 'react';
import Select from 'react-select';

interface Tag {
  id: number;
  nome: string;
}

interface TagsProps {
  onTagsChange: (tags: Tag[]) => void;
  selectedTags: Tag[];
}

const Tags: React.FC<TagsProps> = ({ onTagsChange, selectedTags }) => {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
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

  const tagOptions = tags.map((tag) => ({
    value: tag.id,
    label: tag.nome,
  }));

  const handleTagChange = (selectedOptions: any) => {
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
      borderRadius: '8px',
      border: '2px solid hsl(236, 92%, 66%)',
      outline: 'none',
      transition: '200ms ease-in',
      paddingLeft: '1rem',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(69, 98, 214, 0.5)' : 'none',
      "&:hover": {
        border: "2px solid hsl(236, 92%, 26%)",
      }
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
