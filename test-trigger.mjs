import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

let supabaseUrl;
let supabaseKey;

try {
  const envText = fs.readFileSync('.env.local', 'utf8');
  for (const line of envText.split('\n')) {
    if (line.trim().startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim();
    }
    if (line.trim().startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.split('=')[1].trim();
    }
  }
} catch (e) {
  console.error("No se pudo leer .env.local");
  process.exit(1);
}

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan credenciales.");
  process.exit(1);
}

console.log("Supabase URL:", supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTrigger() {
  const timestamp = Date.now();
  const adminEmail = `admin-test-${timestamp}@example.com`;
  const residentEmail = `resident-test-${timestamp}@example.com`;
  const password = 'securepassword123';

  console.log("1. Creando usuario Admin...");
  const { data: adminAuth, error: adminAuthErr } = await supabase.auth.signUp({
    email: adminEmail,
    password: password,
    options: {
      data: {
        role: 'admin',
        full_name: 'Admin Test Trigger'
      }
    }
  });

  if (adminAuthErr) {
    console.error("Error al registrar admin:", adminAuthErr);
    return;
  }
  const adminUser = adminAuth.user;
  console.log("Admin creado:", adminUser.id);

  console.log("Iniciando sesión como Admin...");
  const { data: adminSession, error: adminLoginErr } = await supabase.auth.signInWithPassword({
    email: adminEmail,
    password: password
  });
  if (adminLoginErr) {
    console.error("Error al loguear admin:", adminLoginErr);
    return;
  }
  console.log("Admin logueado exitosamente.");

  // Insert condominium
  console.log("2. Insertando condominio...");
  const { data: condoData, error: condoErr } = await supabase
    .from('condominiums')
    .insert({
      name: `Condominio Test ${timestamp}`,
      nit: `NIT-${timestamp}`,
      address: 'Calle Falsa 123',
      created_by: adminUser.id
    })
    .select()
    .single();

  if (condoErr) {
    console.error("Error al insertar condominio:", condoErr);
    return;
  }
  console.log("Condominio insertado:", condoData.id);

  // Insert block
  console.log("3. Insertando bloque...");
  const { data: blockData, error: blockErr } = await supabase
    .from('blocks')
    .insert({
      condominium_id: condoData.id,
      name: 'Torre A'
    })
    .select()
    .single();

  if (blockErr) {
    console.error("Error al insertar bloque:", blockErr);
    return;
  }
  console.log("Bloque insertado:", blockData.id);

  // Insert unit
  console.log("4. Insertando unidad...");
  const { data: unitData, error: unitErr } = await supabase
    .from('units')
    .insert({
      block_id: blockData.id,
      unit_number: '101',
      floor: 1,
      coefficient: 0.05
    })
    .select()
    .single();

  if (unitErr) {
    console.error("Error al insertar unidad:", unitErr);
    return;
  }
  console.log("Unidad insertada:", unitData.id, "owner_id inicial:", unitData.owner_id);

  // Now we sign up a resident
  console.log("5. Creando usuario Residente...");
  const { data: residentAuth, error: residentAuthErr } = await supabase.auth.signUp({
    email: residentEmail,
    password: password,
    options: {
      data: {
        role: 'resident',
        full_name: 'Residente Test Trigger'
      }
    }
  });

  if (residentAuthErr) {
    console.error("Error al registrar residente:", residentAuthErr);
    return;
  }
  const residentUser = residentAuth.user;
  console.log("Residente creado:", residentUser.id);

  // Log in as resident to act on their behalf
  console.log("Iniciando sesión como Residente...");
  const { data: resSession, error: resLoginErr } = await supabase.auth.signInWithPassword({
    email: residentEmail,
    password: password
  });
  if (resLoginErr) {
    console.error("Error al loguear residente:", resLoginErr);
    return;
  }
  console.log("Residente logueado exitosamente.");

  // Link resident to unit: update profile.condominium_id and profile.unit_id
  console.log("6. Vinculando residente al condominio y unidad...");
  const { error: profileErr } = await supabase
    .from('profiles')
    .update({
      condominium_id: condoData.id,
      unit_id: unitData.id
    })
    .eq('id', residentUser.id);

  if (profileErr) {
    console.error("Error al actualizar perfil:", profileErr);
    return;
  }
  console.log("Perfil actualizado.");

  // Now, let's fetch the unit from the database and check if owner_id was set to residentUser.id
  console.log("7. Verificando si owner_id se actualizó en units...");
  const { data: updatedUnit, error: checkErr } = await supabase
    .from('units')
    .select('id, owner_id')
    .eq('id', unitData.id)
    .single();

  if (checkErr) {
    console.error("Error al consultar unidad:", checkErr);
  } else {
    console.log("Unidad después de vinculación:");
    console.log("  ID Unidad:", updatedUnit.id);
    console.log("  Owner ID (Unidad):", updatedUnit.owner_id);
    console.log("  Resident ID (Perfil):", residentUser.id);
    if (updatedUnit.owner_id === residentUser.id) {
      console.log("🎉 ¡ÉXITO! El trigger funcionó correctamente y actualizó owner_id automáticamente.");
    } else {
      console.log("❌ FALLÓ: El owner_id no coincide con el resident id. Es posible que el trigger no esté aplicado o falle.");
    }
  }

  // Cleanup: log back in as admin to delete the condominium (which cascades blocks/units)
  console.log("8. Iniciando sesión como Admin para limpieza...");
  await supabase.auth.signInWithPassword({
    email: adminEmail,
    password: password
  });
  console.log("Eliminando condominio de prueba...");
  const { error: deleteErr } = await supabase
    .from('condominiums')
    .delete()
    .eq('id', condoData.id);
  if (deleteErr) {
    console.error("Error al limpiar condominio:", deleteErr);
  } else {
    console.log("Limpieza completada.");
  }
}

testTrigger();
