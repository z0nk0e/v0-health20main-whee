<?php
$pdo = new PDO(
    "mysql:host=localhost;dbname=u883018350_prescribers_pd", 
    "u883018350_admin", 
    "Gh0stredux2025!!!"
);

echo "🔧 Cleaning up and expanding classifications...\n\n";

// Fix duplicate classifications (Statin, Opioid appearing as separate classes)
echo "🧹 Cleaning up duplicate classifications...\n";

$pdo->exec("UPDATE drugs SET drug_class = 'Cardiovascular' WHERE drug_class = 'Statin'");
$pdo->exec("UPDATE drugs SET drug_class = 'Pain Management' WHERE drug_class = 'Opioid'");

echo "✅ Fixed duplicate classes\n";

// Add more comprehensive classifications for "Other" drugs
echo "📊 Adding classifications for remaining drugs...\n";

$additional_classifications = [
    // SKIN/DERMATOLOGY
    ['pattern' => 'HYDROCORTISONE|TRIAMCINOLONE|CLOBETASOL|BETAMETHASONE|CALCIPOTRIENE|TRETINOIN|ADAPALENE', 
     'drug_class' => 'Dermatological', 'therapeutic_class' => 'Topical Medication', 'drug_family' => 'Topical Agents', 'route_of_administration' => 'Topical'],
    
    ['pattern' => 'CLOTRIMAZOLE|KETOCONAZOLE|TERBINAFINE|MICONAZOLE|NYSTATIN', 
     'drug_class' => 'Anti-infective', 'therapeutic_class' => 'Antifungal', 'drug_family' => 'Antifungal Agents'],
    
    // OPHTHALMOLOGY
    ['pattern' => 'TIMOLOL.*OPHTH|LATANOPROST|BIMATOPROST|TRAVOPROST|BRIMONIDINE.*OPHTH', 
     'drug_class' => 'Ophthalmological', 'therapeutic_class' => 'Glaucoma Medication', 'drug_family' => 'Antiglaucoma Agents', 'route_of_administration' => 'Ophthalmic'],
    
    ['pattern' => 'PREDNISOLONE.*OPHTH|DEXAMETHASONE.*OPHTH|TOBRAMYCIN.*OPHTH', 
     'drug_class' => 'Ophthalmological', 'therapeutic_class' => 'Ophthalmic Anti-inflammatory', 'drug_family' => 'Ophthalmic Agents', 'route_of_administration' => 'Ophthalmic'],
    
    // MUSCLE RELAXANTS
    ['pattern' => 'CYCLOBENZAPRINE|BACLOFEN|TIZANIDINE|CARISOPRODOL|METHOCARBAMOL', 
     'drug_class' => 'Musculoskeletal', 'therapeutic_class' => 'Muscle Relaxant', 'drug_family' => 'Skeletal Muscle Relaxants'],
    
    // ANTIVIRALS
    ['pattern' => 'ACYCLOVIR|VALACYCLOVIR|FAMCICLOVIR|OSELTAMIVIR|ZANAMIVIR', 
     'drug_class' => 'Anti-infective', 'therapeutic_class' => 'Antiviral', 'drug_family' => 'Antiviral Agents'],
    
    // BIRTH CONTROL
    ['pattern' => 'ETHINYL.*ESTRADIOL|LEVONORGESTREL|NORETHINDRONE|DROSPIRENONE', 
     'drug_class' => 'Reproductive Health', 'therapeutic_class' => 'Contraceptive', 'drug_family' => 'Oral Contraceptives'],
    
    // HORMONE REPLACEMENT
    ['pattern' => 'ESTRADIOL|CONJUGATED.*ESTROGEN|PROGESTERONE|TESTOSTERONE', 
     'drug_class' => 'Endocrine', 'therapeutic_class' => 'Hormone Replacement', 'drug_family' => 'Sex Hormones'],
    
    // GOUT
    ['pattern' => 'ALLOPURINOL|COLCHICINE|FEBUXOSTAT|PROBENECID', 
     'drug_class' => 'Musculoskeletal', 'therapeutic_class' => 'Gout Medication', 'drug_family' => 'Antigout Agents'],
    
    // MIGRAINE
    ['pattern' => 'SUMATRIPTAN|RIZATRIPTAN|ZOLMITRIPTAN|ELETRIPTAN|TOPIRAMATE.*MIGRAINE', 
     'drug_class' => 'Neurological', 'therapeutic_class' => 'Migraine Medication', 'drug_family' => 'Antimigraine Agents'],
    
    // BLADDER/URINARY
    ['pattern' => 'TAMSULOSIN|FINASTERIDE|DUTASTERIDE|OXYBUTYNIN|TOLTERODINE', 
     'drug_class' => 'Genitourinary', 'therapeutic_class' => 'Urological Medication', 'drug_family' => 'Urological Agents'],
    
    // OSTEOPOROSIS
    ['pattern' => 'ALENDRONATE|RISEDRONATE|IBANDRONATE|ZOLEDRONIC|DENOSUMAB', 
     'drug_class' => 'Musculoskeletal', 'therapeutic_class' => 'Bone Medication', 'drug_family' => 'Bone Density Regulators'],
    
    // WEIGHT MANAGEMENT
    ['pattern' => 'ORLISTAT|PHENTERMINE|LIRAGLUTIDE.*WEIGHT|SEMAGLUTIDE.*WEIGHT', 
     'drug_class' => 'Endocrine', 'therapeutic_class' => 'Weight Management', 'drug_family' => 'Anti-obesity Agents'],
    
    // ADHD
    ['pattern' => 'METHYLPHENIDATE|AMPHETAMINE|DEXTROAMPHETAMINE|LISDEXAMFETAMINE|ATOMOXETINE', 
     'drug_class' => 'Psychiatric', 'therapeutic_class' => 'ADHD Medication', 'drug_family' => 'CNS Stimulants', 'controlled_schedule' => 'C-II'],
    
    // SMOKING CESSATION
    ['pattern' => 'VARENICLINE|BUPROPION.*SMOKING|NICOTINE.*PATCH|NICOTINE.*GUM', 
     'drug_class' => 'Behavioral Health', 'therapeutic_class' => 'Smoking Cessation', 'drug_family' => 'Smoking Cessation Aids'],
    
    // ALLERGY
    ['pattern' => 'CETIRIZINE|LORATADINE|FEXOFENADINE|DIPHENHYDRAMINE|HYDROXYZINE', 
     'drug_class' => 'Immunological', 'therapeutic_class' => 'Antihistamine', 'drug_family' => 'H1 Antihistamines'],
    
    ['pattern' => 'FLUTICASONE.*NASAL|MOMETASONE.*NASAL|BUDESONIDE.*NASAL', 
     'drug_class' => 'Respiratory', 'therapeutic_class' => 'Nasal Corticosteroid', 'drug_family' => 'Nasal Steroids', 'route_of_administration' => 'Nasal'],
    
    // COMBINATIONS (common ones)
    ['pattern' => 'HYDROCODONE.*ACETAMINOPHEN|OXYCODONE.*ACETAMINOPHEN|CODEINE.*ACETAMINOPHEN', 
     'drug_class' => 'Pain Management', 'therapeutic_class' => 'Opioid Combination', 'drug_family' => 'Opioid/Analgesic Combinations', 'controlled_schedule' => 'C-II'],
    
    ['pattern' => 'LISINOPRIL.*HYDROCHLOROTHIAZIDE|LOSARTAN.*HYDROCHLOROTHIAZIDE|VALSARTAN.*HYDROCHLOROTHIAZIDE', 
     'drug_class' => 'Cardiovascular', 'therapeutic_class' => 'ACE Inhibitor/ARB Combination', 'drug_family' => 'Antihypertensive Combinations'],
];

$total_updated = 0;

foreach ($additional_classifications as $class) {
    $sql = "
        UPDATE drugs 
        SET drug_class = ?, 
            therapeutic_class = ?, 
            drug_family = ?";
    
    $params = [$class['drug_class'], $class['therapeutic_class'], $class['drug_family']];
    
    if (isset($class['controlled_schedule'])) {
        $sql .= ", controlled_substance = 1, controlled_schedule = ?";
        $params[] = $class['controlled_schedule'];
    }
    
    if (isset($class['route_of_administration'])) {
        $sql .= ", route_of_administration = ?";
        $params[] = $class['route_of_administration'];
    }
    
    $sql .= " WHERE (UPPER(brand_name) REGEXP ? OR UPPER(generic_name) REGEXP ?) AND drug_class = 'Other'";
    $params[] = $class['pattern'];
    $params[] = $class['pattern'];
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    if ($stmt->rowCount() > 0) {
        $total_updated += $stmt->rowCount();
        echo "✅ Updated {$stmt->rowCount()} drugs: {$class['therapeutic_class']}\n";
    }
}

echo "\n📊 Additional Classification Summary:\n";
echo "Additional drugs classified: " . number_format($total_updated) . "\n";

// Final summary
$final_summary = $pdo->query("
    SELECT 
        drug_class,
        COUNT(*) as count,
        SUM(CASE WHEN controlled_substance = 1 THEN 1 ELSE 0 END) as controlled_count
    FROM drugs 
    GROUP BY drug_class
    ORDER BY count DESC
")->fetchAll();

echo "\n🏆 Final Classification Summary:\n";
foreach ($final_summary as $class) {
    $controlled_text = $class['controlled_count'] > 0 ? " ({$class['controlled_count']} controlled)" : "";
    echo "  {$class['drug_class']}: " . number_format($class['count']) . " drugs{$controlled_text}\n";
}

// Show remaining "Other" count
$other_count = $pdo->query("SELECT COUNT(*) FROM drugs WHERE drug_class = 'Other'")->fetchColumn();
echo "\nRemaining unclassified: " . number_format($other_count) . " drugs\n";

echo "\n🎉 Enhanced classification system complete!\n";
?>
