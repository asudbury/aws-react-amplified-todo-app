import React, { useState, FormEvent } from 'react';
import Button from '@mui/material/Button';
import callGraphQL from '../models/graphql-api';

import { createTodo } from '../graphql/mutations';
import { CreateTodoMutation, CreateTodoMutationVariables } from '../API';
import { Box, TextField } from '@mui/material';

import AddCircleIcon from '@mui/icons-material/AddCircle';

const CreateTodo = () => {
  const [name, setName] = useState<string>();
  const [description, setDescription] = useState<string>();

  const [invalidName, setInvalidName] = useState(false);
  const [invalidDescription, setInvalidDescription] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    setInvalidName(!name);
    setInvalidDescription(!description);

    if (!!name && !!description) {
      saveTodo(name, description);

      setName('');
      setDescription('');
    }
  };

  const saveTodo = async (name: string, description: string) => {
    try {
      await callGraphQL<CreateTodoMutation>(createTodo, {
        input: { name, description },
      } as CreateTodoMutationVariables);
    } catch (error) {
      console.error('Error creating todo', error);
    }
  };

  return (
    <Box
      component='form'
      sx={{
        '& > :not(style)': { m: 1 },
      }}
      noValidate
      autoComplete='off'
      onSubmit={handleSubmit}
    >
      <TextField
        label='Name'
        variant='outlined'
        onChange={(event) => setName(event.target.value)}
        size='small'
        error={invalidName}
        value={name}
        required={true}
      />
      <TextField
        label='Description'
        variant='outlined'
        onChange={(event) => setDescription(event.target.value)}
        size='small'
        error={invalidDescription}
        value={description}
        required={true}
      />
      <Button type='submit' variant='outlined' startIcon={<AddCircleIcon />}>
        Add Todo
      </Button>
    </Box>
  );
};

export default CreateTodo;
