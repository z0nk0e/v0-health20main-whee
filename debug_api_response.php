<?php
echo "🔍 Debugging API responses...\n\n";

$test_drug = 'metformin';
$test_zip = '19033';

echo "Testing: $test_drug near $test_zip\n";

// Test the API directly
$pdo = new PDO(
    "mysql:host=localhost;dbname=u883018350_prescribers_pd", 
    "u883018350_admin", 
    "Gh0stredux2025!!!"
);

// Direct database test first
echo "📊 Direct database test:\n";

$direct_count = $pdo->prepare("
    SELECT COUNT(*) FROM npi_prescriptions np
    JOIN drugs d ON np.drug_id = d.id
    JOIN npi_addresses na ON np.npi = na.npi
    JOIN us_zipcodes uz ON LEFT(na.provider_business_practice_location_address_postal_code, 5) = uz.zip_code
    WHERE (UPPER(d.generic_name) LIKE UPPER(?) OR UPPER(d.brand_name) LIKE UPPER(?))
      AND na.provider_business_practice_location_address_postal_code IS NOT NULL
      AND LENGTH(na.provider_business_practice_location_address_postal_code) >= 5
      AND (
        3959 * acos(
            cos(radians(39.89093)) * 
            cos(radians(uz.latitude)) * 
            cos(radians(uz.longitude) - radians(-75.32837)) + 
            sin(radians(39.89093)) * 
            sin(radians(uz.latitude))
        )
      ) <= 20
");

$pattern = "%$test_drug%";
$direct_count->execute([$pattern, $pattern]);
$count = $direct_count->fetchColumn();

echo "  Direct count: $count prescribers\n";

// Test API file directly
echo "\n📡 Testing API file:\n";

$_GET['drug'] = $test_drug;
$_GET['zip'] = $test_zip;
$_GET['radius'] = 20;

// Capture API output
ob_start();
include 'api_normalized.php';
$api_output = ob_get_clean();

echo "  Raw API output:\n";
echo $api_output;

// Parse JSON
$data = json_decode($api_output, true);
if ($data) {
    echo "\n📊 Parsed API result:\n";
    echo "  Results count: " . ($data['results_count'] ?? 'missing') . "\n";
    echo "  Error: " . ($data['error'] ?? 'none') . "\n";
    
    if (isset($data['prescribers']) && count($data['prescribers']) > 0) {
        echo "  First result: Dr. {$data['prescribers'][0]['name']}\n";
    }
} else {
    echo "  JSON decode failed\n";
}
?>
