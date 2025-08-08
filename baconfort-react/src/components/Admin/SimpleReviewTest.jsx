import { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';

function SimpleReviewTest() {
  const [testValue, setTestValue] = useState('');
  const { data } = useAdmin();

  console.log('🧪 SIMPLE TEST: Componente renderizado');
  console.log('🧪 SIMPLE TEST: testValue:', testValue);

  return (
    <div style={{ padding: '20px', background: '#fff', margin: '20px', border: '2px solid #007bff' }}>
      <h3>🧪 Test Simple de Input</h3>
      
      <div style={{ margin: '10px 0' }}>
        <label>Input de Test:</label>
        <input
          type="text"
          value={testValue}
          onChange={(e) => {
            console.log('🧪 SIMPLE TEST: onChange disparado:', e.target.value);
            setTestValue(e.target.value);
          }}
          onFocus={() => console.log('🧪 SIMPLE TEST: onFocus')}
          onBlur={() => console.log('🧪 SIMPLE TEST: onBlur')}
          onClick={() => console.log('🧪 SIMPLE TEST: onClick')}
          placeholder="Escribe aquí para testear..."
          style={{
            padding: '10px',
            border: '2px solid #007bff',
            borderRadius: '4px',
            width: '300px'
          }}
        />
      </div>
      
      <div style={{ margin: '10px 0', fontSize: '14px', color: '#666' }}>
        Valor actual: "{testValue}" (longitud: {testValue.length})
      </div>
      
      <button
        onClick={() => {
          console.log('🧪 SIMPLE TEST: Botón clickeado');
          setTestValue(`Test ${Date.now()}`);
        }}
        style={{
          padding: '10px 20px',
          background: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Actualizar Valor
      </button>
      
      <div style={{ marginTop: '20px', fontSize: '12px' }}>
        <strong>Debug Info:</strong>
        <pre>{JSON.stringify({ testValue, dataExists: !!data }, null, 2)}</pre>
      </div>
    </div>
  );
}

export default SimpleReviewTest;
