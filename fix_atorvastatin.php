<?php
$pdo = new PDO(
    "mysql:host=localhost;dbname=u883018350_prescribers_pd", 
    "u883018350_admin", 
    "Gh0stredux2025!!!"
);

echo "🔧 Fixing atorvastatin classification...\n";

$updated = $pdo->exec("
UPDATE drugs 
SET drug_class = 'Cardiovascular', 
    therapeutic_class = 'Statin', 
    drug_family = 'HMG-CoA Reductase Inhibitors'
WHERE UPPER(brand_name) LIKE '%ATORVASTATIN%' 
   OR UPPER(generic_name) LIKE '%ATORVASTATIN%'
");

echo "✅ Fixed $updated atorvastatin records\n";

// Check result
$check = $pdo->query("
SELECT brand_name, drug_class, therapeutic_class 
FROM drugs 
WHERE UPPER(brand_name) LIKE '%ATORVASTATIN%' 
LIMIT 3
")->fetchAll();

foreach ($check as $drug) {
    echo "  {$drug['brand_name']}: {$drug['drug_class']} > {$drug['therapeutic_class']}\n";
}
?>
