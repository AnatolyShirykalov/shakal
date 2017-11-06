import React from 'react'
import { connect } from 'react-redux'

const mapStateToProps = rootState => {
  return {}
}

const AppComponent = props => {
  return (
    <div className="app">
    </div>
  )
}

const App = connect(mapStateToProps)(AppComponent);

export default App;

