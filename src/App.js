import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { helpers, box_data } from './helpers'
import Dropdown from 'react-dropdown'
import './App.css'
import flux from './flux.png';

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoggedIn: false,
      projects: null,
      dataTables: {},
      projectCells: null
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
    this.fetchCells(projects)
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

    /**
   * Get a project's data table.
   */
  getDataTable(project) {
    let { dataTables } = this.state
    if (!(project.id in dataTables)) {
      var dt = helpers.getUser().getDataTable(project.id)
      dataTables[project.id] = { table: dt, handlers: {}, websocketOpen: false }
      this.setState({ dataTables })
    }
    return dataTables[project.id]
  }

  /**
   * Get a list of the project's cells (keys).
   */
  getCells(project) {
    return this.getDataTable(project).table.listCells()
  }

  /**
 * Fetch the cells (keys) of the currently selected project from Flux.
 */
  fetchCells(projects) {
    if(!projects) { return }
    // get the project's cells (keys) from flux (returns a promise)
    const selectedProject = projects.entities[0]
    this.getCells(selectedProject).then((data) => this.setState({ projectCells: data.entities }))
  }


  // RENDER FLUX DATA
  /**
   * Get a specific project cell (key).
   */
  getCell(project, cell) {
    return this.getDataTable(project).table.getCell(cell.id)
  }

  /**
   * Get the value contained in a cell (key).
   */
  getValue(project, cell) {
    return this.getCell(project, cell).fetch()
  }


  renderBody() {
    const { isLoggedIn } = this.state
    if(isLoggedIn) {
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
    const { projects, projectCells } = this.state
    if(!this.refs.view || !projectCells) { return }
    // Could be tracking a selected project in state here insead of using 0 index.
    this.getValue(projects.entities[0], projectCells[0]).then((data) => {
      const viewport = new window.FluxViewport(this.refs.view)
      viewport.setupDefaultLighting()
      viewport.setClearColor(0xffffff)
      // if(!data) { viewport.setGeometryEntity(box_data) }
      if(!data) { return null }
      let known = window.FluxViewport.isKnownGeom(data.value[0].geometryParameters.geometry[0])
      console.log('Known Geo data? ', known)
      if(data && known) { viewport.setGeometryEntity(data.value[0].geometryParameters.geometry[0]) }
      if(data && !known) { viewport.setGeometryEntity(box_data) }
      // viewport.setGeometryEntity(box_data)
    })
  }

  renderDropDown() {
    const { projectCells } = this.state
    if(!projectCells) { return }
    const options = projectCells.map((cell) => {
      return {value: cell.id, label: cell.label}
    })
    return (
      <Dropdown options={options} onChange={() => {}} placeholder="Select a cell" />
    )
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Flux Exercise</h1>
          <div className="Spacer" />
          {this.renderDropDown()}
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
