<?php
// api_premium.php - Premium API with search functionality
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

try {
    $pdo = new PDO(
        "mysql:host=localhost;dbname=u883018350_prescribers_pd", 
        "u883018350_admin", 
        "Gh0stredux2025!!!"
    );
    
    $drug = $_GET["drug"] ?? "";
    $zip = $_GET["zip"] ?? "";
    $radius = (int)($_GET["radius"] ?? 20);
    $preview = $_GET["preview"] ?? false;
    $hash = $_GET["hash"] ?? "";

    // Check if accessing purchased report
    if ($hash) {
        $stmt = $pdo->prepare("
            SELECT results_data, access_count 
            FROM report_purchases 
            WHERE report_hash = ?
        ");
        $stmt->execute([$hash]);
        $purchase = $stmt->fetch();
        
        if ($purchase) {
            // Update access count
            $pdo->prepare("
                UPDATE report_purchases 
                SET access_count = access_count + 1 
                WHERE report_hash = ?
            ")->execute([$hash]);
            
            echo $purchase["results_data"];
            exit;
        } else {
            echo json_encode(["error" => "Invalid or expired report hash"]);
            exit;
        }
    }

    // Validate inputs
    if (empty($drug) || empty($zip)) {
        echo json_encode(["error" => "Drug and ZIP code are required"]);
        exit;
    }

    // Get ZIP coordinates
    $zip_stmt = $pdo->prepare("
        SELECT latitude, longitude, official_usps_city_name, official_usps_state_code 
        FROM us_zipcodes 
        WHERE zip_code = ?
    ");
    $zip_stmt->execute([$zip]);
    $search_zip = $zip_stmt->fetch();

    if (!$search_zip) {
        echo json_encode(["error" => "ZIP code not found"]);
        exit;
    }

    // Perform search
    $sql = "
        SELECT DISTINCT
            nd.npi,
            nd.provider_first_name,
            nd.provider_last_name_legal_name,
            s.specialty_name,
            s.specialty_group,
            na.provider_first_line_business_practice_location_address,
            na.provider_second_line_business_practice_location_address,
            na.provider_business_practice_location_address_city_name,
            na.provider_business_practice_location_address_state_name,
            na.provider_business_practice_location_address_postal_code,
            na.provider_business_practice_location_address_telephone_number,
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
        WHERE (UPPER(d.generic_name) LIKE UPPER(?) OR UPPER(d.brand_name) LIKE UPPER(?))
          AND na.provider_business_practice_location_address_postal_code IS NOT NULL
          AND LENGTH(na.provider_business_practice_location_address_postal_code) >= 5
        HAVING distance_miles <= ?
        ORDER BY distance_miles, np.total_claim_count DESC
        LIMIT 100
    ";

    $drug_pattern = "%$drug%";
    $params = [
        $search_zip["latitude"],
        $search_zip["longitude"], 
        $search_zip["latitude"],
        $drug_pattern,
        $drug_pattern,
        $radius
    ];
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format response
    $response = [
        "search_location" => [
            "zip" => $zip,
            "city" => $search_zip["official_usps_city_name"],
            "state" => $search_zip["official_usps_state_code"]
        ],
        "search_params" => [
            "drug" => $drug,
            "radius_miles" => $radius
        ],
        "results_count" => count($results),
        "prescribers" => array_map(function($row) {
            return [
                "npi" => $row["npi"],
                "provider_first_name" => $row["provider_first_name"],
                "provider_last_name" => $row["provider_last_name_legal_name"],
                "name" => trim($row["provider_first_name"] . " " . $row["provider_last_name_legal_name"]),
                "specialty" => $row["specialty_name"],
                "specialty_group" => $row["specialty_group"],
                "address" => [
                    "street" => $row["provider_first_line_business_practice_location_address"],
                    "street2" => $row["provider_second_line_business_practice_location_address"],
                    "city" => $row["provider_business_practice_location_address_city_name"],
                    "state" => $row["provider_business_practice_location_address_state_name"],
                    "zip" => $row["provider_business_practice_location_address_postal_code"],
                    "phone" => $row["provider_business_practice_location_address_telephone_number"]
                ],
                "drug" => [
                    "brand_name" => $row["brand_name"],
                    "generic_name" => $row["generic_name"],
                    "drug_class" => $row["drug_class"],
                    "therapeutic_class" => $row["therapeutic_class"],
                    "drug_family" => $row["drug_family"],
                    "controlled_substance" => (bool)$row["controlled_substance"],
                    "controlled_schedule" => $row["controlled_schedule"],
                    "route_of_administration" => $row["route_of_administration"]
                ],
                "total_claims" => (int)$row["total_claim_count"],
                "distance_miles" => round($row["distance_miles"], 1)
            ];
        }, $results)
    ];

    if ($preview) {
        // Generate session for this search
        $session_id = bin2hex(random_bytes(16));
        
        // Store in session table
        $stmt = $pdo->prepare("
            INSERT INTO search_sessions (session_id, search_params, results_preview)
            VALUES (?, ?, ?)
        ");
        $stmt->execute([
            $session_id,
            json_encode(["drug" => $drug, "zip" => $zip, "radius" => $radius]),
            json_encode($response)
        ]);
        
        // Return teaser version
        $teaser = [
            "session_id" => $session_id,
            "results_count" => count($results),
            "search_location" => $response["search_location"],
            "prescribers" => array_map(function($p) {
                return [
                    "first_name" => $p["provider_first_name"] ?? "Dr.",
                    "last_name" => isset($p["provider_last_name"]) ? 
                        substr($p["provider_last_name"], 0, 1) . "***" : "S***",
                    "address" => isset($p["address"]["street"]) ? 
                        substr($p["address"]["street"], 0, 10) . "***" : "*** Street",
                    "city" => $p["address"]["city"] ?? "City",
                    "state" => $p["address"]["state"] ?? "ST",
                    "distance_miles" => $p["distance_miles"],
                    "total_claims" => $p["total_claims"],
                    "specialty" => $p["specialty"] ?? "Healthcare Provider"
                ];
            }, array_slice($response["prescribers"], 0, 5))
        ];
        
        echo json_encode($teaser);
    } else {
        echo json_encode($response);
    }

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>