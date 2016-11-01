import React from 'react'
import { IndexLink, Link } from 'react-router'
import './Header.scss'

export const Header = () => (
  <div className='component-header text-center'>
    <h1>Most Active Languages @ Github</h1>

    <IndexLink to='/' activeClassName='route--active'>
      Home
    </IndexLink>
    {' · '}
    <Link to='/stats' activeClassName='route--active'>
      Graph
    </Link>
    {' · '}
    <Link to='/stats-list' activeClassName='route--active'>
      Raw List
    </Link>

  </div>
)

export default Header
