import { combineReducers } from 'redux'
import todos from './todos'
import example from './example'
import visibilityFilter from './visibilityFilter'

const rootReducer = combineReducers({
  todos,
  visibilityFilter,
  example
})

export default rootReducer