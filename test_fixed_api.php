<?php
echo "🧪 Testing Fixed Enhanced API...\n\n";

// Test metformin search
echo "=== Metformin Search ===\n";
$_GET = ['drug' => 'metformin', 'zip' => '19033', 'radius' => '20', 'limit' => '5'];
ob_start();
include 'api_enhanced_fixed.php';
$output = ob_get_clean();
$data = json_decode($output, true);

if (isset($data['error'])) {
    echo "❌ Error: {$data['error']}\n";
} else {
    echo "✅ Found {$data['results_count']} metformin prescribers\n";
    if ($data['results_count'] > 0) {
        $first = $data['prescribers'][0];
        echo "Example: Dr. {$first['name']} - {$first['drug']['therapeutic_class']}\n";
    }
}

// Test cardiovascular search
echo "\n=== Cardiovascular Search ===\n";
$_GET = ['drug_class' => 'Cardiovascular', 'zip' => '19033', 'radius' => '20', 'limit' => '5'];
ob_start();
include 'api_enhanced_fixed.php';
$output = ob_get_clean();
$data = json_decode($output, true);

if (isset($data['error'])) {
    echo "❌ Error: {$data['error']}\n";
} else {
    echo "✅ Found {$data['results_count']} cardiovascular prescribers\n";
    if ($data['results_count'] > 0) {
        $first = $data['prescribers'][0];
        echo "Example: Dr. {$first['name']} - {$first['drug']['brand_name']} ({$first['drug']['therapeutic_class']})\n";
    }
}

echo "\n🎉 API testing complete!\n";
?>
