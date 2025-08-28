<?php
echo "🔧 Simple API test...\n";

// Test if we can include the API file without errors
echo "Testing API file inclusion...\n";

try {
    // Set test parameters
    $_GET = ['drug' => 'metformin', 'zip' => '19033', 'radius' => '20'];
    
    // Capture any output/errors
    ob_start();
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
    
    include 'api_normalized.php';
    
    $output = ob_get_clean();
    
    echo "✅ API file included successfully\n";
    echo "📄 Output length: " . strlen($output) . " characters\n";
    echo "📄 First 500 characters:\n";
    echo substr($output, 0, 500) . "\n";
    
    // Try to parse as JSON
    $data = json_decode($output, true);
    if ($data) {
        echo "✅ Valid JSON response\n";
        echo "📊 Results count: " . ($data['results_count'] ?? 'missing') . "\n";
    } else {
        echo "❌ Invalid JSON - JSON error: " . json_last_error_msg() . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error including API file: " . $e->getMessage() . "\n";
}
?>
