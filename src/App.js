import React, { Component } from 'react'
import { helpers } from './helpers'
import Dropdown from 'react-dropdown'
import './App.css'
import flux from './flux.png';

const initialStateObj = {
  isLoggedIn: false,
  selectedCell: null,
  selectedProject: null,
  userProjects: null,
  dataTables: {}
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = initialStateObj
  }

  componentWillMount() {
    helpers.storeFluxUser()
      .then(() => helpers.isLoggedIn().then((res) => {
        this.setState({ isLoggedIn: res })
      })
    )
  }

  componentDidUpdate() {
    const { userProjects, isLoggedIn } = this.state
    if(isLoggedIn) {
      this.initViewport()
      if(!userProjects) { this.setProjects() }
    }
  }

  async setProjects() {
    const user = await helpers.getUser()
    const userProjects = await user.listProjects()
    this.setState({ userProjects: userProjects.entities })
  }

  loginUser() {
    helpers.redirectToFluxLogin()
  }

  logoutUser() {
    helpers.logout()
    this.setState(initialStateObj)
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

  fetchCells(selection) {
    const { userProjects } = this.state
    const selectedProject = userProjects.find((project) => project.id === selection.value)
    this.getCells(selectedProject).then((data) => this.setState({ projectCells: data.entities }))
  }


  getCell(project, cell) {
    return this.getDataTable(project).table.getCell(cell.id)
  }

  getValue(project, cell) {
    return this.getCell(project, cell).fetch()
  }

  initViewport() {
    const { selectedCell, selectedProject } = this.state
    if(!this.refs.view || !selectedCell || !selectedProject) { return }
    const viewport = new window.FluxViewport(this.refs.view)
    viewport.setupDefaultLighting()
    viewport.setClearColor(0xffffff)
    this.renderData(viewport)
  }

  updateSelectedCell(selection) {
    this.setState({selectedCell: selection})
  }

  updateSelectedProject(selection) {
    this.setState({selectedProject: selection})
    this.fetchCells(selection)
  }

  renderData(viewport) {
    const { userProjects, projectCells, selectedCell, selectedProject } = this.state
    if(selectedCell.value === 'clear_data') {
      viewport.setGeometryEntity(null)
      this.setState({ selectedCell: null })
    } else {
      const cell = projectCells.find((cell) => cell.id === selectedCell.value)
      const project = userProjects.find((project) => project.id === selectedProject.value)
      this.getValue(project, cell).then((data) => {
        if(!data) { return null }
        if(window.FluxViewport.isKnownGeom(data.value)) { viewport.setGeometryEntity(data.value) }
      })
    }
  }

  renderCellDropDown() {
    const { projectCells, selectedCell, selectedProject } = this.state
    if(!projectCells || !selectedProject) { return (<Dropdown className='Dim' disabled placeholder="select cell" />) }
    let options = projectCells.map((cell) => { return { value: cell.id, label: cell.label } })
    if(selectedCell) { options.push({ value: 'clear_data', label: '*reset*'  }) }
    return (
      <Dropdown
        value={selectedCell ? selectedCell.label : null}
        options={options}
        onChange={this.updateSelectedCell.bind(this)}
        placeholder="select cell"
      />
    )
  }

  renderProjectDropDown() {
    const { userProjects, selectedProject } = this.state
    if(!userProjects) { return (<Dropdown className='Dim' disabled placeholder="select project" />) }
    const options = userProjects.map((project) => { return { value: project.id, label: project.name } })
    return (
      <Dropdown
        value={selectedProject ? selectedProject.label : null}
        options={options}
        onChange={this.updateSelectedProject.bind(this)}
        placeholder="select project"
      />
    )
  }

  renderLoginLogout() {
    const { isLoggedIn } = this.state
    if(isLoggedIn) {
      return (
        <div className="Login-button" onClick={() => this.logoutUser()}>Logout</div>
      )
    } else {
      // make sure user is actually logged out
      helpers.logout()
      return (
        <div className="Login-button" onClick={() => this.loginUser()}>Login</div>
      )
    }
  }

  renderBody() {
    const { isLoggedIn, selectedCell } = this.state
    if(isLoggedIn && selectedCell) {
      return (<div className="Content" ref='view' />)
    } else {
      return (<img src={flux} className="App-logo" alt="logo" />)
    }
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Flux Exercise</h1>
          {this.renderLoginLogout()}
          <div className="Dropdown-container">
            {this.renderProjectDropDown()}
            {this.renderCellDropDown()}
          </div>
          <div className="Spacer" />
        </header>
        <div className="App-body" ref='carl1'>
          {this.renderBody()}
        </div>
      </div>
    )
  }
}

export default App
