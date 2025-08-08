import React from 'react';
import { useAuth } from '../context/AuthContextAPI';

function AdminDebugger() {
  const { isAdmin, getAllUsers, user } = useAuth();

  const testIsAdmin = () => {
    console.log('🔍 Test isAdmin():', isAdmin());
    console.log('🔍 Current user:', user);
    console.log('🔍 User role:', user?.role);
  };

  const testGetAllUsers = async () => {
    console.log('🔍 Testing getAllUsers...');
    try {
      const result = await getAllUsers();
      console.log('📊 Result:', result);
    } catch (error) {
      console.error('❌ Error:', error);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>🔧 Admin Debugger</h3>
      <div style={{ marginBottom: '10px' }}>
        <strong>isAdmin():</strong> {isAdmin() ? '✅ TRUE' : '❌ FALSE'}
      </div>
      <div style={{ marginBottom: '10px' }}>
        <strong>Current user:</strong> {user ? `${user.name} (${user.email})` : 'No user'}
      </div>
      <div style={{ marginBottom: '10px' }}>
        <strong>User role:</strong> {user?.role || 'No role'}
      </div>
      <button onClick={testIsAdmin} style={{ marginRight: '10px' }}>
        Test isAdmin()
      </button>
      <button onClick={testGetAllUsers}>
        Test getAllUsers()
      </button>
    </div>
  );
}

export default AdminDebugger;
