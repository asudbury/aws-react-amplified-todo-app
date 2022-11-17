import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import Button from '@mui/material/Button';
import { useEffect, useState } from 'react';

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Amplify } from 'aws-amplify';

import { deleteTodo } from './graphql/mutations';

import {
  DeleteTodoMutation,
  ListTodosQuery,
  OnCreateTodoSubscription,
} from './API';
import { listTodos } from './graphql/queries';
import Todo, {
  mapListTodosQuery,
  mapOnCreateTodoSubscription,
} from './models/todo';

import awsExports from './aws-exports';
import CreateTodo from './components/create-todo';
import callGraphQL, { subscribeGraphQL } from './models/graphql-api';

import {
  AppBar,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
} from '@mui/material';
import { onCreateTodo } from './graphql/subscriptions';

Amplify.configure(awsExports);

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    async function getData() {
      try {
        const todoData = await callGraphQL<ListTodosQuery>(listTodos);
        const todos = mapListTodosQuery(todoData);
        setTodos(todos);
      } catch (error) {
        console.error('Error fetching todos', error);
      }
    }
    getData();
  }, []);

  const onCreateTodoHandler = (
    createTodoSubscription: OnCreateTodoSubscription
  ) => {
    const todo = mapOnCreateTodoSubscription(createTodoSubscription);
    setTodos([...todos, todo]);
  };

  const OnDeleteTodoHandler = async (todo: Todo) => {
    try {
      const id = todo.id;

      await callGraphQL<DeleteTodoMutation>(deleteTodo, {
        input: { id },
      });

      setTodos([...todos.filter((t) => t.id !== todo.id)]);
    } catch (error) {
      console.error('Error deleting todo', error);
    }
  };

  useEffect(() => {
    const subscription = subscribeGraphQL<OnCreateTodoSubscription>(
      onCreateTodo,
      onCreateTodoHandler
    );

    return () => subscription.unsubscribe();
  }, [todos]);

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main>
          <AppBar color='primary' position='static'>
            <Toolbar>
              <Typography variant='h6' align='left' sx={{ flexGrow: 1 }}>
                AWS React Amplify Todo App
              </Typography>
              <Typography variant='h6' align='left' sx={{ flexGrow: 1 }}>
                Welcome {user ? user?.username : ''}
              </Typography>

              <Button type='submit' variant='contained' onClick={signOut}>
                Sign out
              </Button>
            </Toolbar>
          </AppBar>

          <br />

          <CreateTodo />

          {todos.length > 0 && (
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 850 }} aria-label='todos table'>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {todos?.map((t) => (
                    <TableRow
                      key={t.name}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component='th' scope='row'>
                        {t.name}
                      </TableCell>
                      <TableCell>{t.description}</TableCell>
                      <TableCell align='right'>
                        <IconButton
                          aria-label='Delete Todo'
                          onClick={() => OnDeleteTodoHandler(t)}
                        >
                          <DeleteOutlined color='primary' />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </main>
      )}
    </Authenticator>
  );
}

export default App;
