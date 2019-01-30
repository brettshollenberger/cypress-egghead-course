import {
  TODOS_LOADED,
  ADD_TODO,
  DELETE_TODO,
  EDIT_TODO,
  LOCAL_CLEAR_COMPLETED,
  BULK_EDIT_TODOS,
} from '../constants/ActionTypes'

const initialState = [ ]

export default function todos(state = initialState, action) {
  switch (action.type) {
    case TODOS_LOADED:
      return action.todos;

    case ADD_TODO:
      return [
        ...state,
        {
          id: state.reduce((maxId, todo) => Math.max(todo.id, maxId), -1) + 1,
          completed: false,
          text: action.text
        }
      ]

    case DELETE_TODO:
      return state.filter(todo =>
        todo.id !== action.id
      )

    case EDIT_TODO:
      return state.map(todo =>
        todo.id === action.id ?
          action.todo :
          todo
      )

    case BULK_EDIT_TODOS:
      return action.todos

    case LOCAL_CLEAR_COMPLETED:
      return state.filter(todo => todo.completed === false)

    default:
      return state
  }
}
