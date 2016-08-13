// import initOpbeat from  '../../../src/react/opbeat-react'
import '../opbeat-e2e'


// const opbeat = initOpbeat({
//   'debug': true,
//   'logLevel': 'trace',
//   'orgId': '470d9f31bc7b4f4395143091fe752e8c',
//   'appId': '9aac8591bb'
// })

import React from 'react'
import ReactDOM from 'react-dom'

import { Router, Route, IndexRoute, Link, IndexLink, browserHistory } from 'react-router'

// function withExampleBasename(history, dirname) {
  // return useBasename(() => history)({ basename: `/${dirname}` })
// }

const ACTIVE = { color: 'red' }

const App = ({ children }) => (
  <div>
    <h1>APP!</h1>
    <ul>
      <li><Link      to="/"           activeStyle={ACTIVE}>/</Link></li>
      <li><IndexLink to="/"           activeStyle={ACTIVE}>/ IndexLink</IndexLink></li>

      <li><Link      to="/users"      activeStyle={ACTIVE}>/users</Link></li>
      <li><IndexLink to="/users"      activeStyle={ACTIVE}>/users IndexLink</IndexLink></li>

      <li><Link      to="/users/ryan" activeStyle={ACTIVE}>/users/ryan</Link></li>
      <li><Link      to={{ pathname: '/users/ryan', query: { foo: 'bar' } }}
                                      activeStyle={ACTIVE}>/users/ryan?foo=bar</Link></li>

      <li><Link      to="/about"      activeStyle={ACTIVE}>/about</Link></li>
    </ul>

    {children}
  </div>
)

const Index = () => (
  <div>
    <h2>Index!</h2>
  </div>
)

const Users = ({ children }) => (
  <div>
    <h2>Users</h2>
    {children}
  </div>
)

const UsersIndex = () => (
  <div>
    <h3>UsersIndex</h3>
  </div>
)

const User = ({ params: { id } }) => (
  <div>
    <h3>User {id}</h3>
  </div>
)

const About = () => (
  <div>
    <h2>About</h2>
  </div>
)

ReactDOM.render((
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={Index}/>
      <Route path="/about" component={About}/>
      <Route path="users" component={Users}>
        <IndexRoute component={UsersIndex}/>
        <Route path=":id" component={User}/>
      </Route>
    </Route>
  </Router>
), document.getElementById('reactMount'))