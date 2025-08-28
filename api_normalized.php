<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');

$pdo = new PDO(
    "mysql:host=localhost;dbname=u883018350_prescribers_pd", 
    "u883018350_admin", 
    "Gh0stredux2025!!!"
);

function searchPrescribersNormalized($pdo, $drug_name, $zip_code, $radius_miles = 20, $limit = 50) {
    if (empty($drug_name) || empty($zip_code)) {
        return ['error' => 'Drug name and ZIP code are required'];
    }
    
    if (!preg_match('/^\d{5}$/', $zip_code)) {
        return ['error' => 'Invalid ZIP code format'];
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
    
    // Lightning-fast normalized search
    $sql = "
        SELECT DISTINCT
            nd.npi,
            nd.provider_first_name,
            nd.provider_last_name_legal_name,
            s.specialty_name,
            s.specialty_group,
            na.provider_first_line_business_practice_location_address,
            na.provider_business_practice_location_address_city_name,
            na.provider_business_practice_location_address_state_name,
            na.provider_business_practice_location_address_postal_code,
            d.brand_name,
            d.generic_name,
            d.drug_class,
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
        JOIN drugs d ON np.drug_id = d.id
        JOIN npi_details nd ON np.npi = nd.npi
        JOIN npi_addresses na ON np.npi = na.npi
        JOIN us_zipcodes uz ON LEFT(na.provider_business_practice_location_address_postal_code, 5) = uz.zip_code
        LEFT JOIN specialties s ON nd.specialty_id = s.id
        WHERE (UPPER(d.generic_name) LIKE UPPER(?) 
               OR UPPER(d.brand_name) LIKE UPPER(?))
          AND na.provider_business_practice_location_address_postal_code IS NOT NULL
          AND LENGTH(na.provider_business_practice_location_address_postal_code) >= 5
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
            'coordinates' => [$search_zip['latitude'], $search_zip['longitude']]
        ],
        'search_params' => [
            'drug' => $drug_name,
            'radius_miles' => $radius_miles
        ],
        'results_count' => count($results),
        'prescribers' => array_map(function($row) {
            return [
                'npi' => $row['npi'],
                'name' => trim($row['provider_first_name'] . ' ' . $row['provider_last_name_legal_name']),
                'specialty' => $row['specialty_name'],
                'specialty_group' => $row['specialty_group'],
                'address' => [
                    'street' => $row['provider_first_line_business_practice_location_address'],
                    'city' => $row['provider_business_practice_location_address_city_name'],
                    'state' => $row['provider_business_practice_location_address_state_name'],
                    'zip' => $row['provider_business_practice_location_address_postal_code']
                ],
                'drug' => [
                    'brand_name' => $row['brand_name'],
                    'generic_name' => $row['generic_name'],
                    'drug_class' => $row['drug_class']
                ],
                'total_claims' => (int)$row['total_claim_count'],
                'distance_miles' => round($row['distance_miles'], 1)
            ];
        }, $results)
    ];
}

// Handle request
$drug = $_GET['drug'] ?? $_POST['drug'] ?? '';
$zip = $_GET['zip'] ?? $_POST['zip'] ?? '';
$radius = (int)($_GET['radius'] ?? $_POST['radius'] ?? 20);
$limit = (int)($_GET['limit'] ?? $_POST['limit'] ?? 50);

$result = searchPrescribersNormalized($pdo, $drug, $zip, $radius, $limit);
echo json_encode($result, JSON_PRETTY_PRINT);
?>
