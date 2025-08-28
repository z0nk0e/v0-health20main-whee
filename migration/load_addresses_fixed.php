<?php
$pdo = new PDO(
    "mysql:host=localhost;dbname=u883018350_prescribers_pd", 
    "u883018350_admin", 
    "Gh0stredux2025!!!"
);

echo "🔧 Loading npi_addresses with correct column count...\n";

// Clear existing data first
$pdo->exec("DELETE FROM npi_addresses");
echo "🗑️ Cleared existing address data\n";

$sql_file = 'rx_backup_processed.sql';
$handle = fopen($sql_file, 'r');
$in_copy_mode = false;
$row_count = 0;

echo "📊 Processing addresses...\n";

while (($line = fgets($handle)) !== false) {
    $line = trim($line);
    
    if (strpos($line, 'COPY public.npi_addresses (') === 0) {
        $in_copy_mode = true;
        echo "📥 Found npi_addresses data...\n";
        continue;
    }
    
    if ($line === '\.' && $in_copy_mode) {
        $in_copy_mode = false;
        echo "✅ Completed npi_addresses: " . number_format($row_count) . " rows\n";
        break;
    }
    
    if ($in_copy_mode && !empty($line)) {
        $parts = explode("\t", $line);
        
        // Expect 13 columns based on our debugging
        if (count($parts) >= 13) {
            
            $insert_sql = "
                INSERT IGNORE INTO npi_addresses 
                (npi, provider_first_line_business_mailing_address, 
                 provider_second_line_business_mailing_address,
                 provider_business_mailing_address_city_name,
                 provider_business_mailing_address_postal_code,
                 provider_business_mailing_address_state_name,
                 provider_business_mailing_address_telephone_number,
                 provider_first_line_business_practice_location_address,
                 provider_second_line_business_practice_location_address,
                 provider_business_practice_location_address_postal_code,
                 provider_business_practice_location_address_city_name,
                 provider_business_practice_location_address_state_name,
                 provider_business_practice_location_address_telephone_number)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ";
            
            $stmt = $pdo->prepare($insert_sql);
            $stmt->execute([
                $parts[0] !== '\\N' && $parts[0] !== '' ? intval($parts[0]) : null,  // npi
                $parts[1] !== '\\N' && $parts[1] !== '' ? $parts[1] : null,          // mailing address 1
                $parts[2] !== '\\N' && $parts[2] !== '' ? $parts[2] : null,          // mailing address 2
                $parts[3] !== '\\N' && $parts[3] !== '' ? $parts[3] : null,          // mailing city
                $parts[4] !== '\\N' && $parts[4] !== '' ? $parts[4] : null,          // mailing zip
                $parts[5] !== '\\N' && $parts[5] !== '' ? $parts[5] : null,          // mailing state
                $parts[6] !== '\\N' && $parts[6] !== '' ? $parts[6] : null,          // mailing phone
                $parts[7] !== '\\N' && $parts[7] !== '' ? $parts[7] : null,          // practice address 1
                $parts[8] !== '\\N' && $parts[8] !== '' ? $parts[8] : null,          // practice address 2
                $parts[9] !== '\\N' && $parts[9] !== '' ? $parts[9] : null,          // practice zip
                $parts[10] !== '\\N' && $parts[10] !== '' ? $parts[10] : null,       // practice city
                $parts[11] !== '\\N' && $parts[11] !== '' ? $parts[11] : null,       // practice state
                $parts[12] !== '\\N' && $parts[12] !== '' ? $parts[12] : null        // practice phone
            ]);
            
            $row_count++;
            if ($row_count % 50000 == 0) {
                echo "  📊 " . number_format($row_count) . " rows processed...\n";
            }
        }
    }
}

fclose($handle);

// Show final counts
echo "\n📊 Final table counts:\n";
$tables = ['us_zipcodes', 'npi_prescriptions', 'npi_details', 'npi_addresses'];
foreach ($tables as $table) {
    $count = $pdo->query("SELECT COUNT(*) FROM $table")->fetchColumn();
    echo "  $table: " . number_format($count) . "\n";
}

// Test a few records
echo "\n🔍 Sample loaded data:\n";
$sample = $pdo->query("
    SELECT npi, 
           provider_business_practice_location_address_postal_code as practice_zip,
           provider_business_practice_location_address_city_name as practice_city,
           provider_business_practice_location_address_state_name as practice_state
    FROM npi_addresses 
    WHERE provider_business_practice_location_address_postal_code IS NOT NULL
    LIMIT 5
")->fetchAll();

foreach ($sample as $row) {
    echo "  NPI: {$row['npi']} - {$row['practice_city']}, {$row['practice_state']} {$row['practice_zip']}\n";
}
?>
