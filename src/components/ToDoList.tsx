import { Todo } from '../types/Todo';

interface Props {
  filteredTodos: Todo[];
  deleteTodoById: number[];
  handleToggleTodo: (todoId: number) => void;
  handleDeleteTodo: (id: number) => void;
  tempTodo: Todo | null;
}

export const ToDoList: React.FC<Props> = ({
  filteredTodos,
  deleteTodoById,
  handleToggleTodo,
  handleDeleteTodo,
  tempTodo,
}) => {
  return (
    <>
      <section className="todoapp__main" data-cy="TodoList">
        {filteredTodos.map(todo => {
          return (
            <div
              data-cy="Todo"
              className={`todo ${todo.completed ? 'completed' : ''}`}
              key={todo.id}
            >
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control*/}
              <label
                className="todo__status-label"
                htmlFor={`todo-status-${todo.id}`}
              >
                <input
                  data-cy="TodoStatus"
                  id={`todo-status-${todo.id}`}
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

      {tempTodo && (
        <div data-cy="Todo" className="todo">
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control*/}
          <label
            className="todo__status-label"
            htmlFor={`todo-status-${tempTodo.id}`}
          >
            <input
              data-cy="TodoStatus"
              id={`todo-status-${tempTodo.id}`}
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
    </>
  );
};
