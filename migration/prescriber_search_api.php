<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

$pdo = new PDO(
    "mysql:host=localhost;dbname=u883018350_prescribers_pd", 
    "u883018350_admin", 
    "Gh0stredux2025!!!"
);

function searchPrescribers($pdo, $drug_name, $zip_code, $radius_miles = 20, $limit = 50) {
    // Validate inputs
    if (empty($drug_name) || empty($zip_code)) {
        return ['error' => 'Drug name and ZIP code are required'];
    }
    
    if (!preg_match('/^\d{5}$/', $zip_code)) {
        return ['error' => 'Invalid ZIP code format'];
    }
    
    if ($radius_miles < 1 || $radius_miles > 100) {
        return ['error' => 'Radius must be between 1 and 100 miles'];
    }
    
    // Get search ZIP coordinates
    $zip_stmt = $pdo->prepare("
        SELECT latitude, longitude, official_usps_city_name, official_usps_state_code 
        FROM us_zipcodes WHERE zip_code = ?
    ");
    $zip_stmt->execute([$zip_code]);
    $search_zip = $zip_stmt->fetch();
    
    if (!$search_zip) {
        return ['error' => "ZIP code $zip_code not found"];
    }
    
    // Search with fuzzy drug matching
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
        WHERE (UPPER(np.drug_name) LIKE UPPER(?) 
               OR UPPER(np.generic_name) LIKE UPPER(?))
          AND na.provider_business_practice_location_address_postal_code IS NOT NULL
          AND LENGTH(na.provider_business_practice_location_address_postal_code) >= 5
          AND na.provider_business_practice_location_address_postal_code NOT LIKE '00%'
        HAVING distance_miles <= ?
        ORDER BY distance_miles, np.total_claim_count DESC
        LIMIT ?
    ";
    
    $drug_pattern = "%$drug_name%";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $search_zip['latitude'],
        $search_zip['longitude'], 
        $search_zip['latitude'],
        $drug_pattern,
        $drug_pattern,
        $radius_miles,
        $limit
    ]);
    
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    return [
        'search_location' => [
            'zip' => $zip_code,
            'city' => $search_zip['official_usps_city_name'],
            'state' => $search_zip['official_usps_state_code'],
            'latitude' => $search_zip['latitude'],
            'longitude' => $search_zip['longitude']
        ],
        'search_params' => [
            'drug' => $drug_name,
            'radius_miles' => $radius_miles,
            'limit' => $limit
        ],
        'results_count' => count($results),
        'prescribers' => array_map(function($row) {
            return [
                'npi' => $row['npi'],
                'name' => trim($row['provider_first_name'] . ' ' . $row['provider_last_name_legal_name']),
                'specialty' => $row['healthcare_provider_taxonomy_1_classification'],
                'address' => [
                    'street' => $row['provider_first_line_business_practice_location_address'],
                    'city' => $row['provider_business_practice_location_address_city_name'],
                    'state' => $row['provider_business_practice_location_address_state_name'],
                    'zip' => $row['provider_business_practice_location_address_postal_code']
                ],
                'drug_prescribed' => $row['drug_name'],
                'total_claims' => (int)$row['total_claim_count'],
                'distance_miles' => round($row['distance_miles'], 1)
            ];
        }, $results)
    ];
}

// Handle API request
$drug = $_GET['drug'] ?? $_POST['drug'] ?? '';
$zip = $_GET['zip'] ?? $_POST['zip'] ?? '';
$radius = (int)($_GET['radius'] ?? $_POST['radius'] ?? 20);
$limit = (int)($_GET['limit'] ?? $_POST['limit'] ?? 50);

$result = searchPrescribers($pdo, $drug, $zip, $radius, $limit);
echo json_encode($result, JSON_PRETTY_PRINT);
?>
