<?php
$pdo = new PDO(
    "mysql:host=localhost;dbname=u883018350_prescribers_pd", 
    "u883018350_admin", 
    "Gh0stredux2025!!!"
);

function searchPrescribers($pdo, $drug_name, $zip_code, $radius_miles = 20) {
    // Get search ZIP coordinates
    $zip_stmt = $pdo->prepare("SELECT latitude, longitude, official_usps_city_name, official_usps_state_code FROM us_zipcodes WHERE zip_code = ?");
    $zip_stmt->execute([$zip_code]);
    $search_zip = $zip_stmt->fetch();
    
    if (!$search_zip) {
        return ['error' => "ZIP code $zip_code not found"];
    }
    
    echo "🔍 Searching from: {$search_zip['official_usps_city_name']}, {$search_zip['official_usps_state_code']} $zip_code\n";
    echo "   Coordinates: ({$search_zip['latitude']}, {$search_zip['longitude']})\n";
    echo "   Drug: $drug_name, Radius: $radius_miles miles\n\n";
    
    // Search using practice location ZIP codes (take first 5 digits)
    $sql = "
        SELECT DISTINCT
            nd.npi,
            nd.provider_first_name,
            nd.provider_last_name_legal_name,
            nd.healthcare_provider_taxonomy_1_classification,
            na.provider_first_line_business_practice_location_address,
            na.provider_business_practice_location_address_city_name,
            na.provider_business_practice_location_address_state_name,
            na.provider_business_practice_location_address_postal_code,
            np.drug_name,
            np.total_claim_count,
            (
                3959 * acos(
                    cos(radians(?)) * 
                    cos(radians(uz.latitude)) * 
                    cos(radians(uz.longitude) - radians(?)) + 
                    sin(radians(?)) * 
                    sin(radians(uz.latitude))
                )
            ) as distance_miles
        FROM npi_prescriptions np
        JOIN npi_details nd ON np.npi = nd.npi
        JOIN npi_addresses na ON np.npi = na.npi
        JOIN us_zipcodes uz ON LEFT(na.provider_business_practice_location_address_postal_code, 5) = uz.zip_code
        WHERE UPPER(np.drug_name) = UPPER(?)
          AND na.provider_business_practice_location_address_postal_code IS NOT NULL
          AND LENGTH(na.provider_business_practice_location_address_postal_code) >= 5
          AND na.provider_business_practice_location_address_postal_code NOT LIKE '00%'
        HAVING distance_miles <= ?
        ORDER BY distance_miles, np.total_claim_count DESC
        LIMIT 20
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $search_zip['latitude'],
        $search_zip['longitude'], 
        $search_zip['latitude'],
        $drug_name,
        $radius_miles
    ]);
    
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Data quality check first
echo "📊 Data Quality Check:\n";

$total_addresses = $pdo->query("SELECT COUNT(*) FROM npi_addresses")->fetchColumn();
echo "Total addresses: " . number_format($total_addresses) . "\n";

$valid_us_zips = $pdo->query("
    SELECT COUNT(*) FROM npi_addresses na
    JOIN us_zipcodes uz ON LEFT(na.provider_business_practice_location_address_postal_code, 5) = uz.zip_code
    WHERE na.provider_business_practice_location_address_postal_code IS NOT NULL
    AND LENGTH(na.provider_business_practice_location_address_postal_code) >= 5
    AND na.provider_business_practice_location_address_postal_code NOT LIKE '00%'
")->fetchColumn();

echo "Addresses with valid US ZIP codes: " . number_format($valid_us_zips) . "\n";

$alprazolam_prescribers = $pdo->query("
    SELECT COUNT(DISTINCT np.npi) FROM npi_prescriptions np
    JOIN npi_addresses na ON np.npi = na.npi
    JOIN us_zipcodes uz ON LEFT(na.provider_business_practice_location_address_postal_code, 5) = uz.zip_code
    WHERE UPPER(np.drug_name) = 'ALPRAZOLAM'
    AND na.provider_business_practice_location_address_postal_code IS NOT NULL
    AND LENGTH(na.provider_business_practice_location_address_postal_code) >= 5
    AND na.provider_business_practice_location_address_postal_code NOT LIKE '00%'
")->fetchColumn();

echo "Alprazolam prescribers with valid addresses: " . number_format($alprazolam_prescribers) . "\n\n";

// Test search
echo "🔍 Testing search for 'alprazolam' near ZIP 19033:\n";
$results = searchPrescribers($pdo, 'alprazolam', '19033', 50);

if (isset($results['error'])) {
    echo "❌ Error: " . $results['error'] . "\n";
} else {
    echo "✅ Found " . count($results) . " prescribers within 50 miles:\n\n";
    
    foreach ($results as $i => $result) {
        echo ($i + 1) . ". Dr. {$result['provider_first_name']} {$result['provider_last_name_legal_name']}\n";
        echo "   {$result['provider_first_line_business_practice_location_address']}\n";
        echo "   {$result['provider_business_practice_location_address_city_name']}, {$result['provider_business_practice_location_address_state_name']} {$result['provider_business_practice_location_address_postal_code']}\n";
        echo "   Distance: " . round($result['distance_miles'], 1) . " miles\n";
        echo "   Claims: {$result['total_claim_count']}\n";
        if ($result['healthcare_provider_taxonomy_1_classification']) {
            echo "   Specialty: " . substr($result['healthcare_provider_taxonomy_1_classification'], 0, 50) . "\n";
        }
        echo "\n";
    }
}

// Test a few other common drugs
echo "\n🧪 Testing other common drugs:\n";
$test_drugs = ['lisinopril', 'metformin', 'atorvastatin'];
foreach ($test_drugs as $drug) {
    $results = searchPrescribers($pdo, $drug, '19033', 20);
    if (!isset($results['error'])) {
        echo "  $drug: " . count($results) . " prescribers within 20 miles\n";
    }
}
?>
