import React, { useState } from 'react';

function AddressForm({ addresses, onAddAddress, onRemoveAddress }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onAddAddress(input.trim());
      setInput('');
    }
  };

  return (
    <div>
      <form className="address-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Entrez une adresse..."
        />
        <button type="submit">Ajouter</button>
      </form>

      {addresses.length > 0 && (
        <div className="address-list">
          <h3>Adresses ({addresses.length})</h3>
          {addresses.map((address, index) => (
            <div key={index} className="address-item">
              <span className="number">{index + 1}</span>
              <span className="text">{address}</span>
              <button
                className="delete"
                onClick={() => onRemoveAddress(index)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AddressForm;
