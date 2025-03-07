import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fetchZones() {
  try {
    const response = await fetch('https://api.waktusolat.app/locations');
    if (!response.ok) {
      throw new Error('Failed to fetch zones');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching zones:', error);
    return null;
  }
}

async function updateZones() {
  const zones = await fetchZones();
  if (!zones) return;

  // Clear existing data
  const { error: deleteError } = await supabase
    .from('jakim_zones')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

  if (deleteError) {
    console.error('Error deleting existing zones:', deleteError);
    return;
  }

  // Insert new data
  const { error: insertError } = await supabase
    .from('jakim_zones')
    .insert(
      zones.map((zone: any) => ({
        negeri: zone.negeri,
        daerah: zone.daerah,
        code: zone.code,
      }))
    );

  if (insertError) {
    console.error('Error inserting zones:', insertError);
    return;
  }

  console.log('Successfully updated JAKIM zones');
}

updateZones(); 