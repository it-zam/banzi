import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './resources/scsses/index.scss';

import Layout from './components/Layout';

const rootElement = window.document.getElementById('app');

ReactDOM.render(<Layout />, rootElement);
