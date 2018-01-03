import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { helpers, box_data } from './helpers'
import './App.css'
import flux from './flux.png';

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoggedIn: false,
      projects: null
    }
  }

  componentDidUpdate() {
    const { projects } = this.state
    if(this.state.isLoggedIn) {
      this.initViewport()
      if(!projects) { this.setProjects() }
    }
  }

  componentWillMount() {
    helpers.storeFluxUser()
      .then(() => helpers.isLoggedIn().then((res) => {
        console.log('logged in (mount)? ', res)
        this.setState({ isLoggedIn: res })
      })
    )
  }

  async setProjects() {
    const user = await helpers.getUser()
    const projects = await user.listProjects()
    this.setState({ projects })
  }

  loginUser() {
    helpers.redirectToFluxLogin()
  }

  logoutUser() {
    helpers.logout()
    this.setState({ isLoggedIn: false })
  }

  getProjects() {
    return this.state.user.listProjects()
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
      console.log('RENDERING BODY')
      return (
        <div className="Content" ref='view' />
      )
    } else {
      return (
        <img src={flux} className="App-logo" alt="logo" />
      )
    }
  }

  initViewport() {
    if(!this.refs.view) { return }
    // attach the viewport to the #div view
    const viewport = new window.FluxViewport(this.refs.view)
    // set up default lighting for the viewport
    viewport.setupDefaultLighting()
    viewport.setGeometryEntity(box_data)
    viewport.setClearColor(0xffffff)
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Flux Exercise</h1>
          <div className="Spacer" />
          {this.renderLoginLogout()}
        </header>
        <div className="App-body" ref='carl1'>
          {this.renderBody()}
        </div>
      </div>
    )
  }
}

export default App
