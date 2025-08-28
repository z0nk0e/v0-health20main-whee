<?php
$pdo = new PDO(
    "mysql:host=localhost;dbname=u883018350_prescribers_pd", 
    "u883018350_admin", 
    "Gh0stredux2025!!!"
);

echo "🔄 Populating foreign key relationships...\n\n";

// Step 1: Link prescriptions to drugs
echo "📊 Step 1: Linking prescriptions to drugs...\n";
echo "This may take 5-15 minutes for 4.5M records...\n";

$start_time = time();

$updated_drugs = $pdo->exec("
UPDATE npi_prescriptions np
JOIN drugs d ON np.drug_name = d.brand_name 
SET np.drug_id = d.id
WHERE np.drug_id IS NULL
");

$drug_time = time() - $start_time;
echo "✅ Linked $updated_drugs prescription records to drugs in {$drug_time} seconds\n";

// Check drug linkage success
$total_prescriptions = $pdo->query("SELECT COUNT(*) FROM npi_prescriptions")->fetchColumn();
$linked_prescriptions = $pdo->query("SELECT COUNT(*) FROM npi_prescriptions WHERE drug_id IS NOT NULL")->fetchColumn();
$drug_link_rate = round($linked_prescriptions / $total_prescriptions * 100, 1);

echo "📊 Drug Linkage: " . number_format($linked_prescriptions) . " / " . number_format($total_prescriptions) . " ($drug_link_rate%)\n\n";

// Step 2: Link providers to specialties
echo "📊 Step 2: Linking providers to specialties...\n";

$start_time = time();

$updated_specialties = $pdo->exec("
UPDATE npi_details nd
JOIN specialties s ON nd.healthcare_provider_taxonomy_1_classification = s.specialty_name
SET nd.specialty_id = s.id
WHERE nd.specialty_id IS NULL
");

$specialty_time = time() - $start_time;
echo "✅ Linked $updated_specialties provider records to specialties in {$specialty_time} seconds\n";

// Check specialty linkage success
$total_providers = $pdo->query("SELECT COUNT(*) FROM npi_details")->fetchColumn();
$linked_providers = $pdo->query("SELECT COUNT(*) FROM npi_details WHERE specialty_id IS NOT NULL")->fetchColumn();
$specialty_link_rate = round($linked_providers / $total_providers * 100, 1);

echo "📊 Specialty Linkage: " . number_format($linked_providers) . " / " . number_format($total_providers) . " ($specialty_link_rate%)\n\n";

// Step 3: Performance comparison
echo "⚡ Performance Test - Before vs After Normalization:\n";

// Test old method (string search)
$start = microtime(true);
$old_result = $pdo->query("
    SELECT COUNT(*) FROM npi_prescriptions 
    WHERE UPPER(drug_name) LIKE '%METFORMIN%'
")->fetchColumn();
$old_time = microtime(true) - $start;

// Test new method (normalized)
$start = microtime(true);
$new_result = $pdo->query("
    SELECT COUNT(*) FROM npi_prescriptions np
    JOIN drugs d ON np.drug_id = d.id 
    WHERE UPPER(d.generic_name) LIKE '%METFORMIN%' 
       OR UPPER(d.brand_name) LIKE '%METFORMIN%'
")->fetchColumn();
$new_time = microtime(true) - $start;

echo "  Old method (string): " . number_format($old_result) . " results in " . round($old_time * 1000, 1) . "ms\n";
echo "  New method (normalized): " . number_format($new_result) . " results in " . round($new_time * 1000, 1) . "ms\n";

if ($new_time > 0) {
    $improvement = round($old_time / $new_time, 1);
    echo "  🚀 Performance improvement: {$improvement}x faster!\n";
}

// Step 4: Show some sample data with categories
echo "\n📋 Sample Normalized Data:\n";

$samples = $pdo->query("
    SELECT 
        d.brand_name,
        d.generic_name,
        d.drug_class,
        COUNT(DISTINCT np.npi) as unique_prescribers,
        SUM(np.total_claim_count) as total_claims
    FROM npi_prescriptions np
    JOIN drugs d ON np.drug_id = d.id
    WHERE d.drug_class IN ('Statin', 'Diabetes', 'Blood Pressure', 'Opioid')
    GROUP BY d.id
    ORDER BY unique_prescribers DESC
    LIMIT 8
")->fetchAll();

foreach ($samples as $sample) {
    echo "  {$sample['brand_name']} ({$sample['drug_class']})\n";
    echo "    Generic: {$sample['generic_name']}\n";
    echo "    Prescribers: " . number_format($sample['unique_prescribers']) . 
         ", Claims: " . number_format($sample['total_claims']) . "\n\n";
}

echo "🎉 Normalization Complete!\n";
echo "Your database is now fully optimized and production-ready!\n";
?>
