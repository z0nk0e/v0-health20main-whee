<?php
$pdo = new PDO(
    "mysql:host=localhost;dbname=u883018350_prescribers_pd", 
    "u883018350_admin", 
    "Gh0stredux2025!!!"
);

echo "🔧 Creating npi_addresses table...\n";

// Create the correct npi_addresses table
$sql = "
CREATE TABLE IF NOT EXISTS npi_addresses (
    npi BIGINT PRIMARY KEY,
    provider_first_line_business_mailing_address TEXT,
    provider_second_line_business_mailing_address TEXT,
    provider_business_mailing_address_city_name TEXT,
    provider_business_mailing_address_postal_code VARCHAR(10),
    provider_business_mailing_address_state_name VARCHAR(50),
    provider_business_mailing_address_telephone_number VARCHAR(20),
    provider_first_line_business_practice_location_address TEXT,
    provider_second_line_business_practice_location_address TEXT,
    provider_business_practice_location_address_postal_code VARCHAR(10),
    provider_business_practice_location_address_city_name TEXT,
    provider_business_practice_location_address_state_name VARCHAR(50),
    provider_business_practice_location_address_telephone_number VARCHAR(20),
    authorized_official_last_name TEXT,
    authorized_official_telephone_number VARCHAR(20),
    INDEX idx_practice_zip (provider_business_practice_location_address_postal_code),
    INDEX idx_mailing_zip (provider_business_mailing_address_postal_code)
)";

$pdo->exec($sql);
echo "✅ npi_addresses table created\n";

echo "📊 Processing npi_addresses data...\n";

$sql_file = 'rx_backup_processed.sql';
$handle = fopen($sql_file, 'r');
$in_copy_mode = false;
$row_count = 0;

while (($line = fgets($handle)) !== false) {
    $line = trim($line);
    
    // Look specifically for npi_addresses (not npi_addresses_usps)
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
        if (count($parts) >= 15) {
            
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
                 provider_business_practice_location_address_telephone_number,
                 authorized_official_last_name,
                 authorized_official_telephone_number)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ";
            
            $stmt = $pdo->prepare($insert_sql);
            $stmt->execute([
                $parts[0] !== '\\N' ? intval($parts[0]) : null,  // npi
                $parts[1] !== '\\N' ? $parts[1] : null,          // mailing address 1
                $parts[2] !== '\\N' ? $parts[2] : null,          // mailing address 2
                $parts[3] !== '\\N' ? $parts[3] : null,          // mailing city
                $parts[4] !== '\\N' ? $parts[4] : null,          // mailing zip
                $parts[5] !== '\\N' ? $parts[5] : null,          // mailing state
                $parts[6] !== '\\N' ? $parts[6] : null,          // mailing phone
                $parts[7] !== '\\N' ? $parts[7] : null,          // practice address 1
                $parts[8] !== '\\N' ? $parts[8] : null,          // practice address 2
                $parts[9] !== '\\N' ? $parts[9] : null,          // practice zip
                $parts[10] !== '\\N' ? $parts[10] : null,        // practice city
                $parts[11] !== '\\N' ? $parts[11] : null,        // practice state
                $parts[12] !== '\\N' ? $parts[12] : null,        // practice phone
                $parts[13] !== '\\N' ? $parts[13] : null,        // authorized official
                $parts[14] !== '\\N' ? $parts[14] : null         // official phone
            ]);
            
            $row_count++;
            if ($row_count % 10000 == 0) {
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
?>
