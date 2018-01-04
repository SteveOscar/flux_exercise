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
      projectCells: null,
      selectedCell: null,
      selectedProject: null
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
    this.setState({ projects: projects.entities })
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

  getDataTable(project) {
    let { dataTables } = this.state
    if (!(project.id in dataTables)) {
      var dt = helpers.getUser().getDataTable(project.id)
      dataTables[project.id] = { table: dt, handlers: {}, websocketOpen: false }
      this.setState({ dataTables })
    }
    return dataTables[project.id]
  }

  getCells(project) {
    return this.getDataTable(project).table.listCells()
  }

  fetchCells(projects) {
    if(!projects) { return }
    // get the project's cells (keys) from flux (returns a promise)
    const selectedProject = projects.entities[0]
    this.getCells(selectedProject).then((data) => this.setState({ projectCells: data.entities }))
  }


  getCell(project, cell) {
    return this.getDataTable(project).table.getCell(cell.id)
  }

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
    const { projects, projectCells, selectedCell, selectedProject } = this.state
    if(!this.refs.view || !projectCells || !selectedCell || !selectedProject) { return }
    if(!selectedCell) { return null }
    const viewport = new window.FluxViewport(this.refs.view)
    viewport.setupDefaultLighting()
    viewport.setClearColor(0xffffff)
    if(selectedCell.value === 'clear_data') {
      viewport.setGeometryEntity(null)
      this.setState({ selectedCell: null })
    } else {
      const cell = projectCells.find((cell) => cell.id === selectedCell.value)
      const project = projects.find((project) => project.id === selectedProject.value)
      this.getValue(project, cell).then((data) => {
        if(!data) { return null }
        let known = window.FluxViewport.isKnownGeom(data.value)
        if(data && known) { viewport.setGeometryEntity(data.value) }
      })
    }
  }

  renderCellDropDown() {
    const { projectCells, selectedCell, selectedProject } = this.state
    if(!projectCells || !selectedProject) { return }
    const options = projectCells.map((cell) => {
      return { value: cell.id, label: cell.label }
    })
    if(selectedCell) { options.push({ value: 'clear_data', label: '*reset*'  }) }
    return (
      <Dropdown value={selectedCell ? selectedCell.label : null} options={options} onChange={this.updateSelectedCell.bind(this)} placeholder="Cell?" />
    )
  }

  // Could refactor these two dropdown functions into one
  renderProjectDropDown() {
    const { projects, selectedProject } = this.state
    if(!projects) { return }
    const options = projects.map((project) => {
      return { value: project.id, label: project.name }
    })
    if(selectedProject) { options.push({ value: 'clear_data', label: '*reset*'  }) }
    return (
      <Dropdown className='Dropdown' value={selectedProject ? selectedProject.label : null} options={options} onChange={this.updateSelectedProject.bind(this)} placeholder="Project?" />
    )
  }

  updateSelectedCell(selection) {
    this.setState({selectedCell: selection})
  }

  updateSelectedProject(selection) {
    this.setState({selectedProject: selection})
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Flux Exercise</h1>
          <div className="Spacer" />
          {this.renderCellDropDown()}
          {this.renderLoginLogout()}
          {this.renderProjectDropDown()}
        </header>
        <div className="App-body" ref='carl1'>
          {this.renderBody()}
        </div>
      </div>
    )
  }
}

export default App
