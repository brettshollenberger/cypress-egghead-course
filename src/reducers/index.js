import { combineReducers } from 'redux'
import todos from './todos'
import visibilityFilter from './visibilityFilter'
import example from './example'

const rootReducer = combineReducers({
  todos,
  visibilityFilter,
  example,
})

export default rootReducer