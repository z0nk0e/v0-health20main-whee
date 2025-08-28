<?php
echo "🔧 Fixing API Files and Database Setup\n\n";

// Database connection
$pdo = new PDO(
    "mysql:host=localhost;dbname=u883018350_prescribers_pd", 
    "u883018350_admin", 
    "Gh0stredux2025!!!"
);

// Step 1: Create database tables for premium features
echo "📊 Creating premium feature tables...\n";

$tables = [
    "CREATE TABLE IF NOT EXISTS report_purchases (
        report_hash VARCHAR(64) PRIMARY KEY,
        search_params JSON,
        results_data LONGTEXT,
        user_email VARCHAR(255),
        purchase_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        stripe_payment_id VARCHAR(255),
        access_count INT DEFAULT 0,
        amount_paid DECIMAL(10,2),
        zip_searched VARCHAR(5),
        drug_searched VARCHAR(255),
        results_count INT,
        INDEX idx_email (user_email),
        INDEX idx_timestamp (purchase_timestamp)
    )",
    
    "CREATE TABLE IF NOT EXISTS search_sessions (
        session_id VARCHAR(32) PRIMARY KEY,
        search_params JSON,
        results_preview JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        converted BOOLEAN DEFAULT FALSE,
        INDEX idx_created (created_at)
    )",
    
    "CREATE TABLE IF NOT EXISTS pricing_config (
        id INT PRIMARY KEY,
        base_price DECIMAL(10,2) DEFAULT 9.99,
        bundle_price DECIMAL(10,2) DEFAULT 24.99,
        active BOOLEAN DEFAULT TRUE
    )"
];

foreach ($tables as $sql) {
    try {
        $pdo->exec($sql);
        echo "✅ Table created/verified\n";
    } catch (PDOException $e) {
        echo "⚠️  Table creation warning: " . $e->getMessage() . "\n";
    }
}

// Insert default pricing if not exists
$pdo->exec("INSERT IGNORE INTO pricing_config VALUES (1, 9.99, 24.99, TRUE)");

// Step 2: Create api_premium.php
echo "\n📝 Creating api_premium.php...\n";

$api_premium_content = '<?php
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
?>';

file_put_contents('api_premium.php', $api_premium_content);
echo "✅ api_premium.php created\n";

// Step 3: Test the API
echo "\n🧪 Testing api_premium.php...\n";

// Test via curl
$test_url = "http://localhost/api_premium.php?drug=metformin&zip=19033&preview=true";
$ch = curl_init($test_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, false);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode == 200) {
    $data = json_decode($response, true);
    if (isset($data['results_count'])) {
        echo "✅ API test successful! Found {$data['results_count']} results\n";
    } else {
        echo "⚠️  API returned unexpected response\n";
        echo "Response: " . substr($response, 0, 200) . "...\n";
    }
} else {
    echo "❌ API test failed with HTTP code: $httpCode\n";
}

// Step 4: Create a test file to verify everything works
echo "\n📝 Creating test_premium.html for testing...\n";

$test_html = '<!DOCTYPE html>
<html>
<head>
    <title>API Test</title>
</head>
<body>
    <h1>Testing Premium API</h1>
    <button onclick="testAPI()">Test API</button>
    <pre id="result"></pre>
    
    <script>
        async function testAPI() {
            try {
                const response = await fetch("api_premium.php?drug=metformin&zip=19033&preview=true");
                const data = await response.json();
                document.getElementById("result").textContent = JSON.stringify(data, null, 2);
                
                if (data.error) {
                    alert("Error: " + data.error);
                } else {
                    alert("Success! Found " + data.results_count + " prescribers");
                }
            } catch (error) {
                alert("Error: " + error.message);
                document.getElementById("result").textContent = error.message;
            }
        }
    </script>
</body>
</html>';

file_put_contents('test_premium.html', $test_html);
echo "✅ test_premium.html created\n";

echo "\n🎉 Setup Complete!\n";
echo "Files created:\n";
echo "  - api_premium.php (Premium API endpoint)\n";
echo "  - test_premium.html (Test interface)\n";
echo "\nDatabase tables created:\n";
echo "  - report_purchases\n";
echo "  - search_sessions\n";
echo "  - pricing_config\n";
echo "\n📌 Test your setup:\n";
echo "  1. Visit: https://rxprescribers.com/test_premium.html\n";
echo "  2. Click 'Test API' button\n";
echo "  3. You should see search results\n";
?>
