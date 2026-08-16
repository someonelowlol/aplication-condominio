import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  try {
    const envText = fs.readFileSync('.env.local', 'utf8');
    for (const line of envText.split('\n')) {
      if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
        supabaseUrl = line.split('=')[1].trim();
      }
      if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
        supabaseKey = line.split('=')[1].trim();
      }
    }
  } catch (e) {}
}

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Faltan las credenciales de Supabase en .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log("==========================================");
  console.log("   VERIFICACIÓN DE CONEXIÓN A SUPABASE   ");
  console.log("==========================================");
  console.log("📌 Endpoint Configurado:", supabaseUrl);
  console.log("");

  const tables = ['condominiums', 'blocks', 'units', 'profiles', 'payments', 'amenities', 'bookings', 'visitor_invitations'];

  let successCount = 0;
  for (const table of tables) {
    try {
      const { error, count } = await supabase.from(table).select('*', { count: 'exact', head: true });
      if (error) {
        console.log(`❌ Tabla '${table}': ${error.message} (${error.code || 'ERR'})`);
      } else {
        console.log(`✅ Tabla '${table}': Creada y accesible (Registros actuales: ${count ?? 0})`);
        successCount++;
      }
    } catch (e) {
      console.log(`⚠️ Tabla '${table}': Fallo de red/DNS (${e.message})`);
    }
  }

  console.log("");
  if (successCount === tables.length) {
    console.log("✨ ¡Todas las tablas del esquema (db_schema.sql) existen y responden adecuadamente!");
  } else {
    console.log("ℹ️ Si estás conectando un nuevo proyecto de Supabase:");
    console.log("  1. Ejecuta el archivo 'db_schema.sql' en el SQL Editor de tu Dashboard de Supabase.");
    console.log("  2. Asegúrate de copiar las claves vivas en tu archivo '.env.local'.");
    console.log("  3. Si la base de datos no está conectada, el portal funcionará en modo Simulación/Demo Interactiva con localStorage.");
  }
}

checkDatabase();
