import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

class Layout extends React.PureComponent<RouteComponentProps> {
  render() {
    return <div>test</div>;
  }
}

export default withRouter(Layout);
