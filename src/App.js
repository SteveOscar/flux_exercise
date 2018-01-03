import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { helpers } from './helpers'
import './App.css'
import flux from './flux.png';

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
        <Button bsClass="Login-button" onClick={() => this.logoutUser()}>Logout</Button>
      )
    } else {
      // make sure user is actually logged out
      helpers.logout()
      return (
        <Button bsClass="Login-button" onClick={() => this.loginUser()}>Login</Button>
      )
    }
  }

  renderBody() {
    const { isLoggedIn } = this.state
    if(isLoggedIn) {
      return (
        <h1>Hello User</h1>
      )
    } else {
      return (
        <img src={flux} className="App-logo" alt="logo" />
      )
    }
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Flux Exercise</h1>
          <div className="Spacer" />
          {this.renderLoginLogout()}
        </header>
        <div className="App-body">
          {this.renderBody()}
        </div>
      </div>
    )
  }
}

export default App
