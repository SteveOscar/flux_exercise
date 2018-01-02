import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import logo from './logo.svg'
import { helpers } from './helpers'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoggedIn: false
    }
  }

  componentDidMount() {
    helpers.storeFluxUser()
      .then(() => helpers.isLoggedIn().then((res) => {
        console.log('logged in (mount)? ', res)
        this.setState({ isLoggedIn: res })
      })
    )
  }

  loginUser() {
    helpers.redirectToFluxLogin()
  }

  logoutUser() {
    helpers.logout()
    this.setState({ isLoggedIn: false })
  }

  renderLoginLogout() {
    const { isLoggedIn } = this.state
    if(isLoggedIn) {
      return (
        <Button onClick={() => this.logoutUser()}>Logout</Button>
      )
    } else {
      return (
        <Button onClick={() => this.loginUser()}>Login</Button>
      )
    }
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        {this.renderLoginLogout()}
      </div>
    )
  }
}

export default App
