import React from 'react'
import Header from '../containers/Header'
import MainSection from '../containers/MainSection'

class App extends React.Component {
  componentDidMount() {
    this.props.store.dispatch({type: 'FETCH_TODOS'})
  }

  render() {
    return (
      <div>
        <Header />
        <MainSection />
      </div>
    )
  }
}

export default App
