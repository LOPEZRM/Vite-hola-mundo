import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  // Estados para el formulario
  const [userId, setUserId] = useState('')
  const [nombre, setNombre] = useState('')
  const [status, setStatus] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('Conectando con DynamoDB...')

    try {
      // Aquí es donde la magia ocurre:
      // Se enviaría el objeto { UserId: userId, Nombre: nombre } a AWS
      console.log("Enviando a TablaUsuariosRuben:", { UserId: userId, Nombre: nombre })
      
      // Simulamos la respuesta de AWS
      setTimeout(() => {
        setStatus(`✅ ¡Éxito! ${nombre} guardado correctamente.`)
        setUserId('')
        setNombre('')
      }, 1500)
    } catch (error) {
      setStatus('❌ Error al conectar con AWS.')
    }
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      
      <h1>Vite + AWS DynamoDB</h1>
      
      <div className="card">
        <h3>Registro de Usuarios</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="ID de Usuario (Ej: 001)" 
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
            required 
          />
          <input 
            type="text" 
            placeholder="Nombre Completo" 
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
            required 
          />
          <button type="submit" style={{ backgroundColor: '#ff9900', color: 'white' }}>
            Guardar en DynamoDB
          </button>
        </form>
        
        {status && <p style={{ marginTop: '15px', fontWeight: 'bold' }}>{status}</p>}
      </div>

      <p className="read-the-docs">
        Segundo Despliegue Lopez Lopez - Conectado a Infraestructura Terraform
      </p>
    </>
  )
}

export default App