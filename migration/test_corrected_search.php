<?php
$pdo = new PDO(
    "mysql:host=localhost;dbname=u883018350_prescribers_pd", 
    "u883018350_admin", 
    "Gh0stredux2025!!!"
);

function quickSearch($pdo, $drug_name, $zip_code, $radius_miles = 20) {
    $zip_stmt = $pdo->prepare("SELECT latitude, longitude FROM us_zipcodes WHERE zip_code = ?");
    $zip_stmt->execute([$zip_code]);
    $search_zip = $zip_stmt->fetch();
    
    if (!$search_zip) return ['error' => "ZIP not found"];
    
    $sql = "
        SELECT COUNT(*) as count
        FROM npi_prescriptions np
        JOIN npi_addresses na ON np.npi = na.npi
        JOIN us_zipcodes uz ON LEFT(na.provider_business_practice_location_address_postal_code, 5) = uz.zip_code
        WHERE (UPPER(np.drug_name) LIKE UPPER(?) OR UPPER(np.generic_name) LIKE UPPER(?))
          AND na.provider_business_practice_location_address_postal_code IS NOT NULL
          AND LENGTH(na.provider_business_practice_location_address_postal_code) >= 5
          AND na.provider_business_practice_location_address_postal_code NOT LIKE '00%'
          AND (
            3959 * acos(
                cos(radians(?)) * 
                cos(radians(uz.latitude)) * 
                cos(radians(uz.longitude) - radians(?)) + 
                sin(radians(?)) * 
                sin(radians(uz.latitude))
            )
          ) <= ?
    ";
    
    $drug_pattern = "%$drug_name%";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $drug_pattern, $drug_pattern,
        $search_zip['latitude'], $search_zip['longitude'], $search_zip['latitude'],
        $radius_miles
    ]);
    
    return $stmt->fetchColumn();
}

echo "🧪 Testing searches near ZIP 19033 (Folsom, PA):\n\n";

// Test various drug name patterns
$test_drugs = [
    'alprazolam' => 'alprazolam',
    'lisinopril' => 'lisinopril', 
    'metformin' => 'metformin',
    'atorvastatin' => 'atorvastatin',
    'hydrocodone' => 'hydrocodone',
    'amoxicillin' => 'amoxicillin',
    'amlodipine' => 'amlodipine'
];

foreach ($test_drugs as $search_term => $description) {
    $count = quickSearch($pdo, $search_term, '19033', 20);
    echo sprintf("  %-15s: %s prescribers within 20 miles\n", $description, $count);
}

echo "\n🎯 Full search results for popular drugs:\n\n";

// Test full search for a couple
$popular_drugs = ['lisinopril', 'metformin', 'atorvastatin'];

foreach ($popular_drugs as $drug) {
    echo "=== $drug near 19033 ===\n";
    
    $sql = "
        SELECT DISTINCT
            nd.provider_first_name,
            nd.provider_last_name_legal_name,
            na.provider_business_practice_location_address_city_name,
            na.provider_business_practice_location_address_state_name,
            np.drug_name,
            np.total_claim_count,
            (
                3959 * acos(
                    cos(radians(39.89093)) * 
                    cos(radians(uz.latitude)) * 
                    cos(radians(uz.longitude) - radians(-75.32837)) + 
                    sin(radians(39.89093)) * 
                    sin(radians(uz.latitude))
                )
            ) as distance_miles
        FROM npi_prescriptions np
        JOIN npi_details nd ON np.npi = nd.npi
        JOIN npi_addresses na ON np.npi = na.npi
        JOIN us_zipcodes uz ON LEFT(na.provider_business_practice_location_address_postal_code, 5) = uz.zip_code
        WHERE (UPPER(np.drug_name) LIKE UPPER(?) OR UPPER(np.generic_name) LIKE UPPER(?))
          AND na.provider_business_practice_location_address_postal_code IS NOT NULL
          AND LENGTH(na.provider_business_practice_location_address_postal_code) >= 5
          AND na.provider_business_practice_location_address_postal_code NOT LIKE '00%'
        HAVING distance_miles <= 20
        ORDER BY distance_miles, np.total_claim_count DESC
        LIMIT 3
    ";
    
    $drug_pattern = "%$drug%";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$drug_pattern, $drug_pattern]);
    $results = $stmt->fetchAll();
    
    foreach ($results as $result) {
        echo "  Dr. {$result['provider_first_name']} {$result['provider_last_name_legal_name']}\n";
        echo "  {$result['provider_business_practice_location_address_city_name']}, {$result['provider_business_practice_location_address_state_name']}\n";
        echo "  Drug: {$result['drug_name']} | Claims: {$result['total_claim_count']} | Distance: " . round($result['distance_miles'], 1) . " miles\n\n";
    }
}
?>
