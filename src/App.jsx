import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [userId, setUserId] = useState('')
  const [nombre, setNombre] = useState('')
  const [status, setStatus] = useState('')

  // CAMBIA ESTO: Pega aquí la URL que te salió en la terminal (api_url)
  const AWS_API_URL = 'https://dltj87r52c.execute-api.us-east-1.amazonaws.com/usuarios'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('🚀 Enviando datos a AWS...')

    try {
      const response = await fetch(AWS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          UserId: userId,
          Nombre: nombre
        }),
      })

      if (response.ok) {
        setStatus(`✅ ¡Éxito! ${nombre} guardado en DynamoDB.`)
        setUserId('')
        setNombre('')
      } else {
        throw new Error('Error en la respuesta de la API')
      }
    } catch (error) {
      console.error(error)
      setStatus('❌ Error: No se pudo conectar con AWS.')
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
        <h3>Registro de Usuarios Real</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="ID de Usuario (Ej: 001)" 
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', color: 'black' }}
            required 
          />
          <input 
            type="text" 
            placeholder="Nombre Completo" 
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', color: 'black' }}
            required 
          />
          <button type="submit" style={{ backgroundColor: '#ff9900', color: 'white', fontWeight: 'bold' }}>
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