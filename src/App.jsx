import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import AppRouter from '@/routes/AppRouter'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRouter />
        <Toaster position="top-right" />
      </CartProvider>
    </AuthProvider>
  )
}

export default App
