import React, { useState } from 'react';
import styled from 'styled-components';
import { FaEdit, FaTrash, FaCheck, FaTimes, FaPlus } from 'react-icons/fa';

const FactsContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const FactItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  background-color: ${props => props.isEditing ? '#f8f9fa' : 'transparent'};
  border-radius: 4px;
  padding: ${props => props.isEditing ? '0.5rem' : '0.25rem 0'};
`;

const FactText = styled.div`
  flex: 1;
  color: #2c3e50;
  line-height: 1.5;
`;

const FactInput = styled.input`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const FactActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-left: 1rem;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  color: #7f8c8d;
  
  &:hover {
    background-color: #f8f9fa;
    color: #2c3e50;
  }
  
  &.edit:hover {
    color: #3498db;
  }
  
  &.delete:hover {
    color: #e74c3c;
  }
  
  &.save {
    color: #27ae60;
  }
  
  &.cancel {
    color: #e74c3c;
  }
`;

const AddFactContainer = styled.div`
  display: flex;
  margin-top: 1rem;
`;

const AddFactInput = styled.input`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.875rem;
`;

const AddFactButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  margin-left: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  
  &:hover {
    background-color: #1a252f;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 1rem;
  color: #7f8c8d;
  border: 1px dashed #ddd;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const EditableFacts = ({ facts, setFacts, factType }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [newFact, setNewFact] = useState('');
  
  const handleEdit = (index, value) => {
    setEditingIndex(index);
    setEditingValue(value);
  };
  
  const handleSave = (index) => {
    const updatedFacts = [...facts];
    updatedFacts[index] = editingValue;
    setFacts(updatedFacts);
    setEditingIndex(null);
    setEditingValue('');
  };
  
  const handleCancel = () => {
    setEditingIndex(null);
    setEditingValue('');
  };
  
  const handleDelete = (index) => {
    const updatedFacts = facts.filter((_, i) => i !== index);
    setFacts(updatedFacts);
  };
  
  const handleAdd = () => {
    if (newFact.trim()) {
      setFacts([...facts, newFact]);
      setNewFact('');
    }
  };
  
  const handleKeyPress = (e, index) => {
    if (e.key === 'Enter') {
      if (editingIndex !== null) {
        handleSave(index);
      } else if (newFact.trim()) {
        handleAdd();
      }
    }
  };
  
  return (
    <FactsContainer>
      {facts && facts.length > 0 ? (
        facts.map((fact, index) => (
          <FactItem key={index} isEditing={editingIndex === index}>
            {editingIndex === index ? (
              <FactInput
                type="text"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                autoFocus
              />
            ) : (
              <FactText>{fact}</FactText>
            )}
            
            <FactActions>
              {editingIndex === index ? (
                <>
                  <IconButton 
                    className="save" 
                    onClick={() => handleSave(index)}
                    title="Save"
                  >
                    <FaCheck size={16} />
                  </IconButton>
                  <IconButton 
                    className="cancel" 
                    onClick={handleCancel}
                    title="Cancel"
                  >
                    <FaTimes size={16} />
                  </IconButton>
                </>
              ) : (
                <>
                  <IconButton 
                    className="edit" 
                    onClick={() => handleEdit(index, fact)}
                    title="Edit"
                  >
                    <FaEdit size={16} />
                  </IconButton>
                  <IconButton 
                    className="delete" 
                    onClick={() => handleDelete(index)}
                    title="Delete"
                  >
                    <FaTrash size={16} />
                  </IconButton>
                </>
              )}
            </FactActions>
          </FactItem>
        ))
      ) : (
        <EmptyState>No {factType} facts identified. Add some below.</EmptyState>
      )}
      
      <AddFactContainer>
        <AddFactInput
          type="text"
          placeholder={`Add new ${factType} fact...`}
          value={newFact}
          onChange={(e) => setNewFact(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <AddFactButton onClick={handleAdd}>
          <FaPlus size={12} />
          Add
        </AddFactButton>
      </AddFactContainer>
    </FactsContainer>
  );
};

export default EditableFacts;