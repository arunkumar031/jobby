import {Component} from 'react'
import {Redirect} from 'react-router-dom'
import Cookies from 'js-cookie'

import './index.css'

class Login extends Component {
  state = {
    username: '',
    password: '',
    displayErrorMsg: false,
    errorMsg: '',
  }

  onChangeUsername = event => {
    this.setState({username: event.target.value})
  }

  onChangePassword = event => {
    this.setState({password: event.target.value})
  }

  onSubmitSucces = data => {
    const jwtToken = data.jwt_token
    Cookies.set('jwt_token', jwtToken, {expires: 30})
    const {history} = this.props
    history.replace('/')
  }

  onSubmitFailure = errorMsg => {
    this.setState({
      errorMsg,
      displayErrorMsg: true,
    })
  }

  onLogin = async event => {
    event.preventDefault()

    const {username, password} = this.state
    const userDetails = {username, password}
    const apiUrl = 'https://apis.ccbp.in/login'
    const options = {
      method: 'POST',
      body: JSON.stringify(userDetails),
    }
    const response = await fetch(apiUrl, options)
    const data = await response.json()
    console.log(data)
    if (response.ok) {
      this.onSubmitSucces(data)
    } else {
      this.onSubmitFailure(data.error_msg)
    }
  }

  render() {
    const {username, password, displayErrorMsg, errorMsg} = this.state
    const jwtToken = Cookies.get('jwt_token')
    if (jwtToken !== undefined) {
      return <Redirect to='/' />
    }

    return (
      <form onSubmit={this.onLogin}>
        <img
          src='https://assets.ccbp.in/frontend/react-js/logo-img.png'
          alt='website logo'
        />
        <div>
          <label htmlFor='username'>USERNAME</label>
          <input
            id='username'
            type='text'
            placeholder='Username'
            value={username}
            onChange={this.onChangeUsername}
          />
        </div>
        <div>
          <label htmlFor='password'>PASSWORD</label>
          <input
            id='password'
            type='password'
            placeholder='Password'
            value={password}
            onChange={this.onChangePassword}
          />
        </div>
        <button type='submit'>Login</button>
        {displayErrorMsg ? <p>{errorMsg}</p> : null}
      </form>
    )
  }
}

export default Login
