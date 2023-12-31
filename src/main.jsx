import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import StarRating from './StarRating.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    {/* <StarRating maxRange={5} color={'blue'} size={32}/>
    <StarRating maxRange={10} color='red' size={48}/> */}
  </React.StrictMode>,
)
