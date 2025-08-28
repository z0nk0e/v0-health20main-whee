<?php
echo "🔍 Debugging Enhanced API...\n\n";

// Test if the enhanced API file exists and works
if (!file_exists('api_enhanced.php')) {
    echo "❌ api_enhanced.php doesn't exist\n";
    echo "Let's create it...\n";
} else {
    echo "✅ api_enhanced.php exists\n";
}

// Test database connection and basic query
try {
    $pdo = new PDO(
        "mysql:host=localhost;dbname=u883018350_prescribers_pd", 
        "u883018350_admin", 
        "Gh0stredux2025!!!"
    );
    
    echo "✅ Database connection successful\n";
    
    // Test basic drug search
    echo "\n🧪 Testing basic metformin search...\n";
    
    $zip_stmt = $pdo->prepare("SELECT latitude, longitude FROM us_zipcodes WHERE zip_code = ?");
    $zip_stmt->execute(['19033']);
    $search_zip = $zip_stmt->fetch();
    
    if (!$search_zip) {
        echo "❌ ZIP 19033 not found\n";
        exit;
    }
    
    echo "📍 ZIP found: {$search_zip['latitude']}, {$search_zip['longitude']}\n";
    
    // Test enhanced query with new classifications
    $sql = "
        SELECT COUNT(DISTINCT np.npi) as prescriber_count
        FROM npi_prescriptions np
        JOIN drugs d ON np.drug_id = d.id
        JOIN npi_addresses na ON np.npi = na.npi
        JOIN us_zipcodes uz ON LEFT(na.provider_business_practice_location_address_postal_code, 5) = uz.zip_code
        WHERE (UPPER(d.generic_name) LIKE '%METFORMIN%' OR UPPER(d.brand_name) LIKE '%METFORMIN%')
          AND na.provider_business_practice_location_address_postal_code IS NOT NULL
          AND LENGTH(na.provider_business_practice_location_address_postal_code) >= 5
          AND (
            3959 * acos(
                cos(radians(?)) * 
                cos(radians(uz.latitude)) * 
                cos(radians(uz.longitude) - radians(?)) + 
                sin(radians(?)) * 
                sin(radians(uz.latitude))
            )
          ) <= 20
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$search_zip['latitude'], $search_zip['longitude'], $search_zip['latitude']]);
    $count = $stmt->fetchColumn();
    
    echo "📊 Metformin prescribers within 20 miles: $count\n";
    
    // Test cardiovascular class search
    echo "\n🧪 Testing cardiovascular class search...\n";
    
    $cardio_sql = "
        SELECT COUNT(DISTINCT np.npi) as prescriber_count
        FROM npi_prescriptions np
        JOIN drugs d ON np.drug_id = d.id
        JOIN npi_addresses na ON np.npi = na.npi
        JOIN us_zipcodes uz ON LEFT(na.provider_business_practice_location_address_postal_code, 5) = uz.zip_code
        WHERE d.drug_class = 'Cardiovascular'
          AND na.provider_business_practice_location_address_postal_code IS NOT NULL
          AND LENGTH(na.provider_business_practice_location_address_postal_code) >= 5
          AND (
            3959 * acos(
                cos(radians(?)) * 
                cos(radians(uz.latitude)) * 
                cos(radians(uz.longitude) - radians(?)) + 
                sin(radians(?)) * 
                sin(radians(uz.latitude))
            )
          ) <= 20
    ";
    
    $cardio_stmt = $pdo->prepare($cardio_sql);
    $cardio_stmt->execute([$search_zip['latitude'], $search_zip['longitude'], $search_zip['latitude']]);
    $cardio_count = $cardio_stmt->fetchColumn();
    
    echo "📊 Cardiovascular prescribers within 20 miles: $cardio_count\n";
    
    // Show sample drug classifications
    echo "\n📋 Sample drug classifications:\n";
    $samples = $pdo->query("
        SELECT drug_class, therapeutic_class, brand_name, COUNT(*) as prescriber_count
        FROM drugs d
        JOIN npi_prescriptions np ON d.id = np.drug_id
        WHERE drug_class != 'Other'
        GROUP BY d.id
        ORDER BY prescriber_count DESC
        LIMIT 10
    ")->fetchAll();
    
    foreach ($samples as $sample) {
        echo "  {$sample['brand_name']}: {$sample['drug_class']} > {$sample['therapeutic_class']} ({$sample['prescriber_count']} prescribers)\n";
    }
    
} catch (Exception $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
}
?>
