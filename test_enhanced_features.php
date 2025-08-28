<?php
echo "🧪 Testing Enhanced API Features...\n\n";

// Test 1: Search by specific drug
echo "=== Test 1: Drug Search (metformin near 19033) ===\n";
$response1 = file_get_contents("http://localhost/api_enhanced.php?drug=metformin&zip=19033&radius=20&limit=5");
$data1 = json_decode($response1, true);
echo "Found: {$data1['results_count']} prescribers\n";
if ($data1['results_count'] > 0) {
    $first = $data1['prescribers'][0];
    echo "Drug details: {$first['drug']['brand_name']} ({$first['drug']['therapeutic_class']})\n";
}

echo "\n=== Test 2: Search by Drug Class (Cardiovascular near 19033) ===\n";
$response2 = file_get_contents("http://localhost/api_enhanced.php?drug_class=Cardiovascular&zip=19033&radius=20&limit=5");
$data2 = json_decode($response2, true);
echo "Found: {$data2['results_count']} cardiovascular prescribers\n";

echo "\n=== Test 3: Search by Therapeutic Class (Beta Blocker near 19033) ===\n";
$response3 = file_get_contents("http://localhost/api_enhanced.php?therapeutic_class=Beta Blocker&zip=19033&radius=20&limit=5");
$data3 = json_decode($response3, true);
echo "Found: {$data3['results_count']} beta blocker prescribers\n";

echo "\n=== Test 4: Controlled Substances (Anti-anxiety near 19033) ===\n";
$response4 = file_get_contents("http://localhost/api_enhanced.php?therapeutic_class=Anti-anxiety&zip=19033&radius=20&limit=5");
$data4 = json_decode($response4, true);
echo "Found: {$data4['results_count']} anti-anxiety prescribers\n";
if ($data4['results_count'] > 0) {
    $first = $data4['prescribers'][0];
    $controlled = $first['drug']['controlled_substance'] ? "Controlled ({$first['drug']['controlled_schedule']})" : "Not controlled";
    echo "Example: {$first['drug']['brand_name']} - $controlled\n";
}

echo "\n=== Test 5: Drug Categories API ===\n";
$categories = file_get_contents("http://localhost/drug_categories.php");
$cat_data = json_decode($categories, true);
echo "Available drug classes: " . count($cat_data['categories']) . "\n";
foreach ($cat_data['summary'] as $summary) {
    if ($summary['total_prescribers'] > 1000) {
        echo "  {$summary['drug_class']}: {$summary['total_prescribers']} prescribers";
        if ($summary['controlled_drugs'] > 0) {
            echo " ({$summary['controlled_drugs']} controlled drugs)";
        }
        echo "\n";
    }
}

echo "\n🎉 Enhanced API testing complete!\n";
?>
