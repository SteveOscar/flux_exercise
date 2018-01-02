import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import logo from './logo.svg';
import { config } from './config'
import './App.css';

class App extends Component {
  render() {
    const sdk = new window.FluxSdk(config.flux_client_id, { redirectUri: config.url, fluxUrl: config.flux_url })
    const helpers = new window.FluxHelpers(sdk)

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <Button>Click Me</Button>
      </div>
    );
  }
}

export default App;
