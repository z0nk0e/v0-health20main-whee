<?php
echo "⚡ Testing Normalized API Performance...\n\n";

$test_searches = [
    ['drug' => 'metformin', 'zip' => '19033'],
    ['drug' => 'atorvastatin', 'zip' => '19033'], 
    ['drug' => 'lisinopril', 'zip' => '19033'],
    ['drug' => 'alprazolam', 'zip' => '19033']
];

foreach ($test_searches as $search) {
    echo "🔍 Testing: {$search['drug']} near {$search['zip']}\n";
    
    $start = microtime(true);
    $url = "http://localhost/api_normalized.php?drug={$search['drug']}&zip={$search['zip']}&radius=20";
    $response = file_get_contents($url);
    $time = microtime(true) - $start;
    
    $data = json_decode($response, true);
    
    if (isset($data['error'])) {
        echo "  ❌ Error: {$data['error']}\n\n";
    } else {
        echo "  ✅ Found {$data['results_count']} prescribers in " . round($time * 1000, 1) . "ms\n";
        if ($data['results_count'] > 0) {
            $first = $data['prescribers'][0];
            echo "  📍 Closest: Dr. {$first['name']} ({$first['distance_miles']} miles)\n";
            echo "  💊 Drug: {$first['drug']['brand_name']} ({$first['drug']['drug_class']})\n";
        }
    }
    echo "\n";
}
?>
