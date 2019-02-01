import { takeEvery, takeLatest, put, all, select } from "redux-saga/effects";
import axios from "axios";

function getBaseUrl() {
  return 'http://localhost:3000'
}

function* createTodo(action) {
  yield axios.post(`${getBaseUrl()}/api/todos`, {text: action.text, completed: false})
}

export function* fetchTodos() {
  let response = yield axios.get(`${getBaseUrl()}/api/todos`)
  let todos = response.data;

  yield put({ type: "TODOS_LOADED", todos });
}

export function* destroyTodo(action) {
  yield axios.delete(`${getBaseUrl()}/api/todos/${action.id}`)
}

export function* destroyAllTodos() {
  let filtered = yield select(state => state.todos.filter(todo => todo.completed))
  yield put({type: 'LOCAL_CLEAR_COMPLETED'})
  
  yield axios.post(`${getBaseUrl()}/api/todos/bulk_delete`, {ids: filtered.map(f => f.id)})
}

export function* editTodo(action) {
  yield axios.put(`${getBaseUrl()}/api/todos/${action.id}`, action.todo)
}

export function* completeAllTodos() {
  let todos = yield select(state => state.todos)
  let allAreMarked = todos.every(todo => todo.completed)
  let newTodos = todos.map((todo) => {
    return { ...todo, completed: !allAreMarked }
  })

  yield put({ type: 'BULK_EDIT_TODOS', todos: newTodos })
}

export function* bulkEditTodos(action) {
  yield axios.put(`${getBaseUrl()}/api/todos/bulk_update`, {todos: action.todos})
}

export function* rootSaga() {
  yield all([
    takeLatest("FETCH_TODOS", fetchTodos),
    takeEvery("ADD_TODO", createTodo),
    takeEvery("DELETE_TODO", destroyTodo),
    takeEvery("EDIT_TODO", editTodo),
    takeLatest("CLEAR_COMPLETED", destroyAllTodos),
    takeEvery("COMPLETE_ALL_TODOS", completeAllTodos),
    takeEvery("BULK_EDIT_TODOS", bulkEditTodos),
  ])
}