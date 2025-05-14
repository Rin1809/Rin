import React from 'react'
import ReactDOM from 'react-dom/client'
// Bỏ BrowserRouter nếu App.tsx không dùng Routes nữa. Trong trường hợp web card đơn giản thì không cần.
// import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx'
import './components/styles/index.css' // Đảm bảo import đúng file này

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* <BrowserRouter>  Bỏ nếu App.tsx không dùng Routes */}
      <App />
    {/* </BrowserRouter> Bỏ nếu App.tsx không dùng Routes */}
  </React.StrictMode>,
)