import React from 'react';
import { render } from 'react-dom';

import { Provider } from 'react-redux';

import store from './store/store';

// import App from './app';

import './style/style.scss';

/// -----------------------------------------------------------------------------------------------
// app audio engine / service

// const app = new App();

/// -----------------------------------------------------------------------------------------------
// app component

function AppComponent() {
  return (
    <Provider store={ store }>
      <p>Hello world</p>
    </Provider>
  );
}

render(
  ( <AppComponent /> ),
  document.getElementById( 'app' )
);
