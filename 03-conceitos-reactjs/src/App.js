import React, { useState, useEffect } from "react";

import api from './services/api'

import "./styles.css";

function App() {
  const [respositories, setRepositories] = useState([])

  useEffect(() => {
    api.get('repositories').then(response => setRepositories(response.data))
  }, [])

  async function handleAddRepository() {
    const response = await api.post('repositories', {
      title: `Novo repositório ${Date.now()}`,
      url: 'https://github.com/AlexSRH/gostack-challenge-02',
      techs: ['Node.Js', 'ReactJs']
    })

    const repository = response.data

    setRepositories([...respositories, repository])
  }

  async function handleRemoveRepository(id) {
    const response = await api.delete(`repositories/${id}`)

    if (response.status === 204) {
      const newRepositories = respositories.filter(repository => {
        return repository.id !== id
      })

      setRepositories(newRepositories)
    }
  }

  return (
    <div>
      <ul data-testid="repository-list">
        {
          respositories.map(repository => (
            <li key={repository.id}>
              {repository.title}

              <button onClick={() => handleRemoveRepository(repository.id)}>
                Remover
              </button>
            </li>
          ))
        }
      </ul>

      <button onClick={handleAddRepository}>Adicionar</button>
    </div>
  );
}

export default App;
