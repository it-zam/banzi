import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import reducers from './reducers';

import './resources/scsses/index.scss';
import Layout from './components/Layout';

const store = createStore(reducers, applyMiddleware(thunk));

const rootElement = window.document.getElementById('app');

ReactDOM.render(
  <Provider store={store}>
    <Layout />
  </Provider>,
  rootElement
);
