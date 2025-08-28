<?php
header('Content-Type: application/json');

$pdo = new PDO(
    "mysql:host=localhost;dbname=u883018350_prescribers_pd", 
    "u883018350_admin", 
    "Gh0stredux2025!!!"
);

// Get all drug categories with counts
$categories = $pdo->query("
    SELECT 
        drug_class,
        therapeutic_class,
        COUNT(DISTINCT d.id) as drug_count,
        COUNT(DISTINCT np.npi) as prescriber_count,
        SUM(CASE WHEN d.controlled_substance = 1 THEN 1 ELSE 0 END) as controlled_count
    FROM drugs d
    LEFT JOIN npi_prescriptions np ON d.id = np.drug_id
    WHERE d.drug_class IS NOT NULL AND d.drug_class != 'Other'
    GROUP BY drug_class, therapeutic_class
    ORDER BY drug_class, prescriber_count DESC
")->fetchAll(PDO::FETCH_ASSOC);

$response = [
    'categories' => [],
    'summary' => []
];

$class_summary = [];

foreach ($categories as $cat) {
    $class = $cat['drug_class'];
    
    if (!isset($response['categories'][$class])) {
        $response['categories'][$class] = [];
        $class_summary[$class] = ['drug_count' => 0, 'prescriber_count' => 0, 'controlled_count' => 0];
    }
    
    $response['categories'][$class][] = [
        'therapeutic_class' => $cat['therapeutic_class'],
        'drug_count' => (int)$cat['drug_count'],
        'prescriber_count' => (int)$cat['prescriber_count'],
        'controlled_count' => (int)$cat['controlled_count']
    ];
    
    $class_summary[$class]['drug_count'] += $cat['drug_count'];
    $class_summary[$class]['prescriber_count'] += $cat['prescriber_count'];
    $class_summary[$class]['controlled_count'] += $cat['controlled_count'];
}

foreach ($class_summary as $class => $summary) {
    $response['summary'][] = [
        'drug_class' => $class,
        'total_drugs' => $summary['drug_count'],
        'total_prescribers' => $summary['prescriber_count'],
        'controlled_drugs' => $summary['controlled_count']
    ];
}

echo json_encode($response, JSON_PRETTY_PRINT);
?>
