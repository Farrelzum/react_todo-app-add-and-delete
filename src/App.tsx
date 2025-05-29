/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import { deleteTodo, getTodos, postTodo, USER_ID } from './api/todos';
import { Todo } from './types/Todo';
import { Filter } from './types/Filter';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('All');
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [deleteTodoById, setDeleteTodoById] = useState<number[]>([]);
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [shouldFocusInput, setShouldFocusInput] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let newTodos = [...todos];

    switch (filter) {
      case 'All':
        break;
      case 'Active':
        newTodos = todos.filter(todo => !todo.completed);
        break;
      case 'Completed':
        newTodos = todos.filter(todo => todo.completed);
        break;
    }

    setFilteredTodos(newTodos);
  }, [filter, todos]);

  useEffect(() => {
    setErrorMessage(null);

    getTodos()
      .then(data => {
        setTodos(data);
      })
      .catch(() => {
        setErrorMessage('Unable to load todos');

        setTimeout(() => {
          setErrorMessage(null);
        }, 3000);
      });
  }, []);

  useEffect(() => {
    if (shouldFocusInput && inputRef.current) {
      inputRef.current.focus();
      setShouldFocusInput(false); // Zresetuj flagę, aby nie fokusować ponownie przy każdym renderowaniu
    }
  }, [shouldFocusInput]);

  const handleToggleTodo = (todoId: number) => {
    const updatedTodos = todos.map(todo => {
      return todo.id === todoId
        ? { ...todo, completed: !todo.completed }
        : todo;
    });

    setTodos(updatedTodos);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = inputValue.trim();

    if (trimmedTitle === '') {
      setErrorMessage('Title should not be empty');
      setTimeout(() => setErrorMessage(null), 3000);

      return;
    }

    setIsAddingTodo(true);

    const todoToSend = {
      userId: USER_ID,
      title: trimmedTitle,
      completed: false,
    };

    const temporaryTodo = {
      ...todoToSend,
      id: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTempTodo(temporaryTodo);

    postTodo(todoToSend)
      .then(newTodoFromApi => {
        setTodos(prevTodos => [...prevTodos, newTodoFromApi]);

        setInputValue('');
      })
      .catch(() => {
        setErrorMessage('Unable to add a todo');
        setTimeout(() => setErrorMessage(null), 3000);
      })
      .finally(() => {
        setTempTodo(null);
        inputRef.current?.focus();
        setIsAddingTodo(false);
        setShouldFocusInput(true);
      });
  };

  const handleDeleteTodo = (id: number) => {
    setDeleteTodoById(prevId => [...prevId, id]);

    deleteTodo(id)
      .then(() => {
        setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
      })
      .catch(() => {
        setErrorMessage('Unable to delete a todo');
        setTimeout(() => setErrorMessage(null), 3000);
      })
      .finally(() => {
        setDeleteTodoById(prevIds =>
          prevIds.filter(currentId => currentId !== id),
        );
        setShouldFocusInput(true);
      });
  };

  const handleClearCompleted = () => {
    const todosToDelete = todos.filter(todo => todo.completed);

    if (todosToDelete.length === 0) {
      return;
    }

    const idsToProcess = todosToDelete.map(todo => todo.id);

    setDeleteTodoById(prevIds => [...prevIds, ...idsToProcess]);

    const tabOfPromises = todosToDelete.map(todo => deleteTodo(todo.id));

    Promise.allSettled(tabOfPromises)
      .then(results => {
        const successfullyDeletedIds = new Set<number>();
        let hasError = false;

        results.forEach((result, index) => {
          const originalTodoId = todosToDelete[index].id;

          if (result.status === 'fulfilled') {
            successfullyDeletedIds.add(originalTodoId);
          } else {
            hasError = true;
          }
        });

        setTodos(prevTodos =>
          prevTodos.filter(todo => !successfullyDeletedIds.has(todo.id)),
        );

        if (hasError) {
          setErrorMessage('Unable to delete a todo');
          setTimeout(() => setErrorMessage(null), 3000);
        }
      })
      .finally(() => {
        setDeleteTodoById(prevIds =>
          prevIds.filter(id => !idsToProcess.includes(id)),
        );
        setShouldFocusInput(true);
      });
  };

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {/* this button should have `active` class only if all todos are completed */}
          <button
            type="button"
            className="todoapp__toggle-all active"
            data-cy="ToggleAllButton"
          />

          {/* Add a todo on form submit */}
          <form onSubmit={handleSubmit}>
            <input
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              autoFocus
              disabled={isAddingTodo}
            />
          </form>
        </header>

        {todos.length > 0 && (
          <section className="todoapp__main" data-cy="TodoList">
            {filteredTodos.map(todo => {
              return (
                <div
                  data-cy="Todo"
                  className={`todo ${todo.completed ? 'completed' : ''}`}
                  key={todo.id}
                >
                  <label className="todo__status-label">
                    <input
                      data-cy="TodoStatus"
                      type="checkbox"
                      className="todo__status"
                      checked={todo.completed}
                      onChange={() => handleToggleTodo(todo.id)}
                      disabled={deleteTodoById.includes(todo.id)}
                    />
                  </label>

                  <span data-cy="TodoTitle" className="todo__title">
                    {todo.title}
                  </span>
                  <button
                    type="button"
                    className="todo__remove"
                    data-cy="TodoDelete"
                    onClick={() => handleDeleteTodo(todo.id)}
                    disabled={deleteTodoById.includes(todo.id)}
                  >
                    ×
                  </button>

                  <div
                    data-cy="TodoLoader"
                    className={`modal overlay${deleteTodoById.includes(todo.id) ? ' is-active' : ''}`}
                  >
                    {/* eslint-disable-next-line max-len*/}
                    <div className="modal-background has-background-white-ter" />
                    <div className="loader" />
                  </div>
                </div>
              );
            })}
          </section>
        )}
        {tempTodo && (
          <div data-cy="Todo" className="todo">
            <label className="todo__status-label">
              <input
                data-cy="TodoStatus"
                type="checkbox"
                className="todo__status"
                checked={tempTodo.completed}
                disabled
              />
            </label>

            <span data-cy="TodoTitle" className="todo__title">
              {tempTodo.title}
            </span>

            <button
              type="button"
              className="todo__remove"
              data-cy="TodoDelete"
              disabled
            >
              ×
            </button>

            {/* 'is-active' class puts this modal on top of the todo */}
            <div data-cy="TodoLoader" className="modal overlay is-active">
              <div className="modal-background has-background-white-ter" />
              <div className="loader" />
            </div>
          </div>
        )}

        {todos.length > 0 && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {todos.filter(todo => !todo.completed).length} items left
            </span>

            {/* Active link should have the 'selected' class */}
            <nav className="filter" data-cy="Filter">
              <a
                href="#/"
                className={`filter__link ${filter === 'All' ? 'selected' : ''}`}
                data-cy="FilterLinkAll"
                onClick={() => setFilter('All')}
              >
                All
              </a>

              <a
                href="#/active"
                className={`filter__link ${filter === 'Active' ? 'selected' : ''}`}
                data-cy="FilterLinkActive"
                onClick={() => setFilter('Active')}
              >
                Active
              </a>

              <a
                href="#/completed"
                className={`filter__link ${filter === 'Completed' ? 'selected' : ''}`}
                data-cy="FilterLinkCompleted"
                onClick={() => setFilter('Completed')}
              >
                Completed
              </a>
            </nav>

            {/* this button should be disabled if there are no completed todos */}
            <button
              type="button"
              className="todoapp__clear-completed"
              data-cy="ClearCompletedButton"
              onClick={handleClearCompleted}
              disabled={todos.filter(todo => todo.completed).length === 0}
            >
              Clear completed
            </button>
          </footer>
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <div
        data-cy="ErrorNotification"
        className={`
        notification
        is-danger
        is-light
        has-text-weight-normal
        ${errorMessage === null ? 'hidden' : ''}
        `}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => setErrorMessage(null)}
        />
        {errorMessage}
        {/* Unable to load todos
        <br />
        Title should not be empty
        <br />
        Unable to add a todo
        <br />
        Unable to delete a todo
        <br />
        Unable to update a todo */}
      </div>
    </div>
  );
};
