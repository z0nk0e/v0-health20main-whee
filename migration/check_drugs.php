<?php
$pdo = new PDO(
    "mysql:host=localhost;dbname=u883018350_prescribers_pd", 
    "u883018350_admin", 
    "Gh0stredux2025!!!"
);

echo "🔍 Checking drug names in database:\n\n";

// Check most prescribed drugs
$top_drugs = $pdo->query("
    SELECT drug_name, COUNT(DISTINCT npi) as prescriber_count, SUM(total_claim_count) as total_claims
    FROM npi_prescriptions 
    GROUP BY drug_name 
    ORDER BY prescriber_count DESC 
    LIMIT 20
")->fetchAll();

echo "📊 Top 20 drugs by number of prescribers:\n";
foreach ($top_drugs as $drug) {
    echo sprintf("  %-20s %s prescribers, %s total claims\n", 
        $drug['drug_name'], 
        number_format($drug['prescriber_count']), 
        number_format($drug['total_claims'])
    );
}

// Check specific drugs
echo "\n🔍 Checking specific drug variations:\n";
$search_drugs = ['metformin', 'METFORMIN', 'atorvastatin', 'ATORVASTATIN', 'lisinopril', 'LISINOPRIL'];

foreach ($search_drugs as $drug) {
    $count = $pdo->prepare("SELECT COUNT(DISTINCT npi) FROM npi_prescriptions WHERE drug_name LIKE ?");
    $count->execute(["%$drug%"]);
    $result = $count->fetchColumn();
    echo "  $drug: $result prescribers\n";
}
?>
