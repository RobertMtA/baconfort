// Script para verificar y agregar suscriptores de prueba
console.log('🔍 Verificando suscriptores en la base de datos...\n');

async function checkAndCreateSubscribers() {
    try {
        console.log('1️⃣ Intentando obtener suscriptores...');
        
        // Probar diferentes endpoints
        const endpoints = [
            'http://localhost:5004/api/subscribers',
            'http://localhost:5004/api/subscribers/all'
        ];

        let subscribersData = null;
        
        for (const endpoint of endpoints) {
            try {
                console.log(`🔗 Probando endpoint: ${endpoint}`);
                const response = await fetch(endpoint);
                const data = await response.json();
                
                console.log(`📊 Status: ${response.status}, Data:`, data);
                
                if (response.ok && data.success) {
                    subscribersData = data;
                    break;
                }
            } catch (error) {
                console.log(`❌ Error con ${endpoint}:`, error.message);
            }
        }

        if (!subscribersData || !subscribersData.data) {
            console.log('⚠️ No se pudieron obtener suscriptores, intentando crear algunos de prueba...');
            
            // Crear suscriptores de prueba
            const testEmails = [
                'test1@example.com',
                'test2@example.com', 
                'baconfort.centro@gmail.com' // Email del sistema
            ];

            console.log('\n2️⃣ Creando suscriptores de prueba...');
            
            for (const email of testEmails) {
                try {
                    const subscribeResponse = await fetch('http://localhost:5004/api/subscribers/subscribe', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ email })
                    });

                    const subscribeData = await subscribeResponse.json();
                    console.log(`📧 Suscribir ${email}:`, subscribeData.success ? 'ÉXITO' : subscribeData.error);
                    
                } catch (error) {
                    console.log(`❌ Error suscribiendo ${email}:`, error.message);
                }
            }

            // Verificar de nuevo después de crear suscriptores
            console.log('\n3️⃣ Verificando suscriptores después de crear...');
            
            try {
                const checkResponse = await fetch('http://localhost:5004/api/subscribers');
                const checkData = await checkResponse.json();
                
                if (checkData.success && checkData.data) {
                    console.log(`✅ Ahora hay ${checkData.data.length} suscriptores:`);
                    checkData.data.forEach((sub, index) => {
                        console.log(`   ${index + 1}. ${sub.email} (${sub.active ? 'Activo' : 'Inactivo'})`);
                    });
                } else {
                    console.log('⚠️ Aún no hay suscriptores disponibles');
                }
            } catch (error) {
                console.log('❌ Error verificando suscriptores:', error.message);
            }

        } else {
            console.log(`✅ Se encontraron ${subscribersData.data.length} suscriptores:`);
            subscribersData.data.forEach((sub, index) => {
                console.log(`   ${index + 1}. ${sub.email} (${sub.active ? 'Activo' : 'Inactivo'})`);
            });
        }

    } catch (error) {
        console.error('❌ Error general:', error.message);
    }
}

checkAndCreateSubscribers();
