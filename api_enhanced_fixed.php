<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    $pdo = new PDO(
        "mysql:host=localhost;dbname=u883018350_prescribers_pd", 
        "u883018350_admin", 
        "Gh0stredux2025!!!"
    );

    $drug = $_GET['drug'] ?? '';
    $zip = $_GET['zip'] ?? '';
    $radius = (int)($_GET['radius'] ?? 20);
    $limit = (int)($_GET['limit'] ?? 50);
    $drug_class = $_GET['drug_class'] ?? '';
    $therapeutic_class = $_GET['therapeutic_class'] ?? '';

    if (empty($zip)) {
        echo json_encode(['error' => 'ZIP code required']);
        exit;
    }

    // Get ZIP coordinates
    $zip_stmt = $pdo->prepare("SELECT latitude, longitude, official_usps_city_name, official_usps_state_code FROM us_zipcodes WHERE zip_code = ?");
    $zip_stmt->execute([$zip]);
    $search_zip = $zip_stmt->fetch();

    if (!$search_zip) {
        echo json_encode(['error' => 'ZIP code not found']);
        exit;
    }

    // Build WHERE clause
    $where_conditions = [];
    $params = [$search_zip['latitude'], $search_zip['longitude'], $search_zip['latitude']];

    if (!empty($drug)) {
        $where_conditions[] = "(UPPER(d.generic_name) LIKE UPPER(?) OR UPPER(d.brand_name) LIKE UPPER(?))";
        $drug_pattern = "%$drug%";
        $params[] = $drug_pattern;
        $params[] = $drug_pattern;
    }

    if (!empty($drug_class)) {
        $where_conditions[] = "d.drug_class = ?";
        $params[] = $drug_class;
    }

    if (!empty($therapeutic_class)) {
        $where_conditions[] = "d.therapeutic_class = ?";
        $params[] = $therapeutic_class;
    }

    if (empty($where_conditions)) {
        echo json_encode(['error' => 'Must specify drug name, drug class, or therapeutic class']);
        exit;
    }

    $where_clause = implode(' AND ', $where_conditions);

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
            d.therapeutic_class,
            d.drug_family,
            COALESCE(d.controlled_substance, 0) as controlled_substance,
            d.controlled_schedule,
            d.route_of_administration,
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
        WHERE $where_clause
          AND na.provider_business_practice_location_address_postal_code IS NOT NULL
          AND LENGTH(na.provider_business_practice_location_address_postal_code) >= 5
        HAVING distance_miles <= ?
        ORDER BY distance_miles, np.total_claim_count DESC
        LIMIT $limit
    ";

    $params[] = $radius;
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $response = [
        'search_location' => [
            'zip' => $zip,
            'city' => $search_zip['official_usps_city_name'],
            'state' => $search_zip['official_usps_state_code']
        ],
        'search_params' => [
            'drug' => $drug,
            'drug_class' => $drug_class,
            'therapeutic_class' => $therapeutic_class,
            'radius_miles' => $radius
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
                    'drug_class' => $row['drug_class'],
                    'therapeutic_class' => $row['therapeutic_class'],
                    'drug_family' => $row['drug_family'],
                    'controlled_substance' => (bool)$row['controlled_substance'],
                    'controlled_schedule' => $row['controlled_schedule'],
                    'route_of_administration' => $row['route_of_administration']
                ],
                'total_claims' => (int)$row['total_claim_count'],
                'distance_miles' => round($row['distance_miles'], 1)
            ];
        }, $results)
    ];

    echo json_encode($response, JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
