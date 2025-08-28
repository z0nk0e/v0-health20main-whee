<?php
$pdo = new PDO(
    "mysql:host=localhost;dbname=u883018350_prescribers_pd", 
    "u883018350_admin", 
    "Gh0stredux2025!!!"
);

echo "🔧 Completing your normalization setup...\n\n";

// Step 1: Add foreign key columns
echo "📊 Adding foreign key columns...\n";

$pdo->exec("ALTER TABLE npi_prescriptions ADD COLUMN drug_id INT");
$pdo->exec("ALTER TABLE npi_prescriptions ADD INDEX idx_drug_id (drug_id)");
echo "✅ Added npi_prescriptions.drug_id\n";

$pdo->exec("ALTER TABLE npi_details ADD COLUMN specialty_id INT");  
$pdo->exec("ALTER TABLE npi_details ADD INDEX idx_specialty_id (specialty_id)");
echo "✅ Added npi_details.specialty_id\n";

// Step 2: Update drug relationships
echo "\n🔄 Linking prescriptions to drugs...\n";

$updated_drugs = $pdo->exec("
UPDATE npi_prescriptions np
JOIN drugs d ON np.drug_name = d.brand_name 
SET np.drug_id = d.id
");

echo "✅ Linked $updated_drugs prescription records to drugs\n";

// Step 3: Update specialty relationships  
echo "🔄 Linking providers to specialties...\n";

$updated_specialties = $pdo->exec("
UPDATE npi_details nd
JOIN specialties s ON nd.healthcare_provider_taxonomy_1_classification = s.specialty_name
SET nd.specialty_id = s.id
");

echo "✅ Linked $updated_specialties provider records to specialties\n";

// Step 4: Show linkage success rates
echo "\n📊 Linkage Analysis:\n";

$total_prescriptions = $pdo->query("SELECT COUNT(*) FROM npi_prescriptions")->fetchColumn();
$linked_prescriptions = $pdo->query("SELECT COUNT(*) FROM npi_prescriptions WHERE drug_id IS NOT NULL")->fetchColumn();
$drug_link_rate = round($linked_prescriptions / $total_prescriptions * 100, 1);

echo "  Drug Linkage: " . number_format($linked_prescriptions) . " / " . number_format($total_prescriptions) . " ($drug_link_rate%)\n";

$total_providers = $pdo->query("SELECT COUNT(*) FROM npi_details")->fetchColumn();
$linked_providers = $pdo->query("SELECT COUNT(*) FROM npi_details WHERE specialty_id IS NOT NULL")->fetchColumn();
$specialty_link_rate = round($linked_providers / $total_providers * 100, 1);

echo "  Specialty Linkage: " . number_format($linked_providers) . " / " . number_format($total_providers) . " ($specialty_link_rate%)\n";

// Step 5: Performance test - Before vs After
echo "\n⚡ Performance Test:\n";

// Test old way (string search)
$start = microtime(true);
$old_result = $pdo->query("
    SELECT COUNT(*) FROM npi_prescriptions 
    WHERE UPPER(drug_name) LIKE '%METFORMIN%'
")->fetchColumn();
$old_time = microtime(true) - $start;

// Test new way (normalized lookup)
$start = microtime(true);
$new_result = $pdo->query("
    SELECT COUNT(*) FROM npi_prescriptions np
    JOIN drugs d ON np.drug_id = d.id 
    WHERE UPPER(d.generic_name) LIKE '%METFORMIN%' 
       OR UPPER(d.brand_name) LIKE '%METFORMIN%'
")->fetchColumn();
$new_time = microtime(true) - $start;

echo "  Old method (string search): " . number_format($old_result) . " results in " . round($old_time * 1000, 1) . "ms\n";
echo "  New method (normalized): " . number_format($new_result) . " results in " . round($new_time * 1000, 1) . "ms\n";
echo "  Performance improvement: " . round($old_time / $new_time, 1) . "x faster\n";

// Step 6: Show some sample normalized data
echo "\n📋 Sample Normalized Data:\n";

$samples = $pdo->query("
    SELECT 
        d.brand_name,
        d.generic_name,
        d.drug_class,
        COUNT(*) as prescription_count
    FROM npi_prescriptions np
    JOIN drugs d ON np.drug_id = d.id
    WHERE d.drug_class IN ('Statin', 'Diabetes', 'Blood Pressure')
    GROUP BY d.id
    ORDER BY prescription_count DESC
    LIMIT 5
")->fetchAll();

foreach ($samples as $sample) {
    echo "  {$sample['brand_name']} ({$sample['generic_name']}) - {$sample['drug_class']} - " . number_format($sample['prescription_count']) . " prescriptions\n";
}

echo "\n🎉 Normalization Complete!\n";
echo "Your database is now optimized and ready for production!\n";
?>
