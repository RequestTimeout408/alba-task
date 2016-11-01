import React from 'react'
import styles from './Loader.scss'
import loaderImage from './assets/ripple.svg'

export const Loader = () => (
  <img className={styles.img} src={loaderImage} alt='loading' />
)

export default Loader
