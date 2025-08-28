<?php
$pdo = new PDO(
    "mysql:host=localhost;dbname=u883018350_prescribers_pd", 
    "u883018350_admin", 
    "Gh0stredux2025!!!"
);

echo "🔧 Building comprehensive drug classification system...\n\n";

// First, let's see what we're working with
echo "📊 Current drug inventory:\n";
$total_drugs = $pdo->query("SELECT COUNT(*) FROM drugs")->fetchColumn();
echo "Total drugs: " . number_format($total_drugs) . "\n";

// Show current classification distribution
$current_classes = $pdo->query("
    SELECT drug_class, COUNT(*) as count 
    FROM drugs 
    GROUP BY drug_class 
    ORDER BY count DESC
")->fetchAll();

echo "\nCurrent classifications:\n";
foreach ($current_classes as $class) {
    echo "  {$class['drug_class']}: " . number_format($class['count']) . "\n";
}

echo "\n🧬 Applying comprehensive classification system...\n";

// Add new columns for detailed classification
$pdo->exec("ALTER TABLE drugs ADD COLUMN IF NOT EXISTS therapeutic_class VARCHAR(100)");
$pdo->exec("ALTER TABLE drugs ADD COLUMN IF NOT EXISTS drug_family VARCHAR(100)");
$pdo->exec("ALTER TABLE drugs ADD COLUMN IF NOT EXISTS controlled_schedule VARCHAR(10)");
$pdo->exec("ALTER TABLE drugs ADD COLUMN IF NOT EXISTS route_of_administration VARCHAR(50) DEFAULT 'Oral'");

echo "✅ Added detailed classification columns\n";

// Comprehensive classification rules
$classifications = [
    // CARDIOVASCULAR
    ['pattern' => 'LISINOPRIL|ENALAPRIL|CAPTOPRIL|BENAZEPRIL|FOSINOPRIL|QUINAPRIL|RAMIPRIL|TRANDOLAPRIL', 
     'drug_class' => 'Cardiovascular', 'therapeutic_class' => 'ACE Inhibitor', 'drug_family' => 'Angiotensin-Converting Enzyme Inhibitors'],
    
    ['pattern' => 'LOSARTAN|VALSARTAN|IRBESARTAN|OLMESARTAN|TELMISARTAN|CANDESARTAN', 
     'drug_class' => 'Cardiovascular', 'therapeutic_class' => 'ARB', 'drug_family' => 'Angiotensin Receptor Blockers'],
    
    ['pattern' => 'AMLODIPINE|NIFEDIPINE|DILTIAZEM|VERAPAMIL|FELODIPINE|NICARDIPINE', 
     'drug_class' => 'Cardiovascular', 'therapeutic_class' => 'Calcium Channel Blocker', 'drug_family' => 'Calcium Channel Blockers'],
    
    ['pattern' => 'METOPROLOL|ATENOLOL|PROPRANOLOL|CARVEDILOL|BISOPROLOL|NEBIVOLOL|TIMOLOL', 
     'drug_class' => 'Cardiovascular', 'therapeutic_class' => 'Beta Blocker', 'drug_family' => 'Beta-Adrenergic Blockers'],
    
    ['pattern' => 'HYDROCHLOROTHIAZIDE|FUROSEMIDE|CHLORTHALIDONE|SPIRONOLACTONE|TRIAMTERENE|INDAPAMIDE', 
     'drug_class' => 'Cardiovascular', 'therapeutic_class' => 'Diuretic', 'drug_family' => 'Diuretics'],
    
    // STATINS & CHOLESTEROL
    ['pattern' => 'ATORVASTATIN|SIMVASTATIN|ROSUVASTATIN|PRAVASTATIN|LOVASTATIN|FLUVASTATIN|PITAVASTATIN', 
     'drug_class' => 'Cardiovascular', 'therapeutic_class' => 'Statin', 'drug_family' => 'HMG-CoA Reductase Inhibitors'],
    
    ['pattern' => 'EZETIMIBE|CHOLESTYRAMINE|COLESEVELAM|GEMFIBROZIL|FENOFIBRATE', 
     'drug_class' => 'Cardiovascular', 'therapeutic_class' => 'Cholesterol Medication', 'drug_family' => 'Lipid-Lowering Agents'],
    
    // DIABETES
    ['pattern' => 'METFORMIN', 
     'drug_class' => 'Endocrine', 'therapeutic_class' => 'Diabetes Medication', 'drug_family' => 'Biguanides'],
    
    ['pattern' => 'GLIPIZIDE|GLYBURIDE|GLIMEPIRIDE|GLICLAZIDE', 
     'drug_class' => 'Endocrine', 'therapeutic_class' => 'Diabetes Medication', 'drug_family' => 'Sulfonylureas'],
    
    ['pattern' => 'INSULIN|LANTUS|HUMALOG|NOVOLOG|LEVEMIR', 
     'drug_class' => 'Endocrine', 'therapeutic_class' => 'Diabetes Medication', 'drug_family' => 'Insulin', 'route_of_administration' => 'Injection'],
    
    ['pattern' => 'SITAGLIPTIN|LINAGLIPTIN|SAXAGLIPTIN|ALOGLIPTIN', 
     'drug_class' => 'Endocrine', 'therapeutic_class' => 'Diabetes Medication', 'drug_family' => 'DPP-4 Inhibitors'],
    
    // PAIN & INFLAMMATION
    ['pattern' => 'HYDROCODONE|OXYCODONE|MORPHINE|FENTANYL|CODEINE|TRAMADOL', 
     'drug_class' => 'Pain Management', 'therapeutic_class' => 'Opioid Analgesic', 'drug_family' => 'Opioid Analgesics', 'controlled_schedule' => 'C-II'],
    
    ['pattern' => 'IBUPROFEN|NAPROXEN|DICLOFENAC|CELECOXIB|MELOXICAM|INDOMETHACIN', 
     'drug_class' => 'Pain Management', 'therapeutic_class' => 'NSAID', 'drug_family' => 'Nonsteroidal Anti-inflammatory Drugs'],
    
    ['pattern' => 'ACETAMINOPHEN|TYLENOL', 
     'drug_class' => 'Pain Management', 'therapeutic_class' => 'Analgesic', 'drug_family' => 'Non-opioid Analgesics'],
    
    // PSYCHIATRIC
    ['pattern' => 'SERTRALINE|FLUOXETINE|PAROXETINE|CITALOPRAM|ESCITALOPRAM|FLUVOXAMINE', 
     'drug_class' => 'Psychiatric', 'therapeutic_class' => 'Antidepressant', 'drug_family' => 'SSRI'],
    
    ['pattern' => 'VENLAFAXINE|DULOXETINE|DESVENLAFAXINE|LEVOMILNACIPRAN', 
     'drug_class' => 'Psychiatric', 'therapeutic_class' => 'Antidepressant', 'drug_family' => 'SNRI'],
    
    ['pattern' => 'ALPRAZOLAM|LORAZEPAM|CLONAZEPAM|DIAZEPAM|TEMAZEPAM|TRIAZOLAM', 
     'drug_class' => 'Psychiatric', 'therapeutic_class' => 'Anti-anxiety', 'drug_family' => 'Benzodiazepines', 'controlled_schedule' => 'C-IV'],
    
    ['pattern' => 'ZOLPIDEM|ESZOPICLONE|ZALEPLON|SUVOREXANT', 
     'drug_class' => 'Psychiatric', 'therapeutic_class' => 'Sleep Aid', 'drug_family' => 'Hypnotics', 'controlled_schedule' => 'C-IV'],
    
    ['pattern' => 'ARIPIPRAZOLE|QUETIAPINE|RISPERIDONE|OLANZAPINE|ZIPRASIDONE|HALOPERIDOL', 
     'drug_class' => 'Psychiatric', 'therapeutic_class' => 'Antipsychotic', 'drug_family' => 'Antipsychotics'],
    
    // ANTIBIOTICS
    ['pattern' => 'AMOXICILLIN|AMPICILLIN|PENICILLIN', 
     'drug_class' => 'Anti-infective', 'therapeutic_class' => 'Antibiotic', 'drug_family' => 'Penicillins'],
    
    ['pattern' => 'AZITHROMYCIN|CLARITHROMYCIN|ERYTHROMYCIN', 
     'drug_class' => 'Anti-infective', 'therapeutic_class' => 'Antibiotic', 'drug_family' => 'Macrolides'],
    
    ['pattern' => 'CIPROFLOXACIN|LEVOFLOXACIN|MOXIFLOXACIN|OFLOXACIN', 
     'drug_class' => 'Anti-infective', 'therapeutic_class' => 'Antibiotic', 'drug_family' => 'Fluoroquinolones'],
    
    ['pattern' => 'CEPHALEXIN|CEFUROXIME|CEFTRIAXONE|CEFDINIR', 
     'drug_class' => 'Anti-infective', 'therapeutic_class' => 'Antibiotic', 'drug_family' => 'Cephalosporins'],
    
    ['pattern' => 'DOXYCYCLINE|TETRACYCLINE|MINOCYCLINE', 
     'drug_class' => 'Anti-infective', 'therapeutic_class' => 'Antibiotic', 'drug_family' => 'Tetracyclines'],
    
    // GI MEDICATIONS
    ['pattern' => 'OMEPRAZOLE|PANTOPRAZOLE|LANSOPRAZOLE|ESOMEPRAZOLE|RABEPRAZOLE', 
     'drug_class' => 'Gastrointestinal', 'therapeutic_class' => 'Proton Pump Inhibitor', 'drug_family' => 'Proton Pump Inhibitors'],
    
    ['pattern' => 'RANITIDINE|FAMOTIDINE|CIMETIDINE|NIZATIDINE', 
     'drug_class' => 'Gastrointestinal', 'therapeutic_class' => 'H2 Blocker', 'drug_family' => 'H2 Receptor Antagonists'],
    
    // RESPIRATORY
    ['pattern' => 'ALBUTEROL|SALBUTAMOL|LEVALBUTEROL', 
     'drug_class' => 'Respiratory', 'therapeutic_class' => 'Bronchodilator', 'drug_family' => 'Beta-2 Agonists', 'route_of_administration' => 'Inhalation'],
    
    ['pattern' => 'FLUTICASONE|BUDESONIDE|BECLOMETHASONE|MOMETASONE', 
     'drug_class' => 'Respiratory', 'therapeutic_class' => 'Inhaled Corticosteroid', 'drug_family' => 'Corticosteroids', 'route_of_administration' => 'Inhalation'],
    
    ['pattern' => 'MONTELUKAST|ZAFIRLUKAST', 
     'drug_class' => 'Respiratory', 'therapeutic_class' => 'Leukotriene Modifier', 'drug_family' => 'Leukotriene Receptor Antagonists'],
    
    // HORMONES
    ['pattern' => 'LEVOTHYROXINE|LIOTHYRONINE|THYROID', 
     'drug_class' => 'Endocrine', 'therapeutic_class' => 'Thyroid Hormone', 'drug_family' => 'Thyroid Medications'],
    
    ['pattern' => 'PREDNISONE|PREDNISOLONE|METHYLPREDNISOLONE|HYDROCORTISONE|DEXAMETHASONE', 
     'drug_class' => 'Endocrine', 'therapeutic_class' => 'Corticosteroid', 'drug_family' => 'Systemic Corticosteroids'],
    
    // ANTICOAGULANTS
    ['pattern' => 'WARFARIN|COUMADIN', 
     'drug_class' => 'Cardiovascular', 'therapeutic_class' => 'Anticoagulant', 'drug_family' => 'Vitamin K Antagonists'],
    
    ['pattern' => 'RIVAROXABAN|APIXABAN|DABIGATRAN|EDOXABAN', 
     'drug_class' => 'Cardiovascular', 'therapeutic_class' => 'Anticoagulant', 'drug_family' => 'Direct Oral Anticoagulants'],
    
    ['pattern' => 'CLOPIDOGREL|PRASUGREL|TICAGRELOR', 
     'drug_class' => 'Cardiovascular', 'therapeutic_class' => 'Antiplatelet', 'drug_family' => 'P2Y12 Inhibitors'],
    
    // SEIZURE/NEUROLOGICAL
    ['pattern' => 'PHENYTOIN|CARBAMAZEPINE|VALPROIC|LAMOTRIGINE|LEVETIRACETAM|TOPIRAMATE', 
     'drug_class' => 'Neurological', 'therapeutic_class' => 'Anticonvulsant', 'drug_family' => 'Antiepileptic Drugs'],
    
    ['pattern' => 'GABAPENTIN|PREGABALIN', 
     'drug_class' => 'Neurological', 'therapeutic_class' => 'Neuropathic Pain', 'drug_family' => 'Gabapentinoids'],
    
    // SUPPLEMENTS/VITAMINS
    ['pattern' => 'VITAMIN|FOLIC|CALCIUM|IRON|POTASSIUM|MAGNESIUM', 
     'drug_class' => 'Nutritional', 'therapeutic_class' => 'Vitamin/Supplement', 'drug_family' => 'Nutritional Supplements']
];

$updated_count = 0;

foreach ($classifications as $class) {
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
    
    $sql .= " WHERE UPPER(brand_name) REGEXP ? OR UPPER(generic_name) REGEXP ?";
    $params[] = $class['pattern'];
    $params[] = $class['pattern'];
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute($params);
    
    if ($stmt->rowCount() > 0) {
        $updated_count += $stmt->rowCount();
        echo "✅ Updated {$stmt->rowCount()} drugs: {$class['therapeutic_class']}\n";
    }
}

echo "\n📊 Classification Summary:\n";
echo "Total drugs updated: " . number_format($updated_count) . "\n\n";

// Show new classification breakdown
$new_classes = $pdo->query("
    SELECT 
        drug_class,
        therapeutic_class,
        COUNT(*) as count,
        SUM(CASE WHEN controlled_substance = 1 THEN 1 ELSE 0 END) as controlled_count
    FROM drugs 
    GROUP BY drug_class, therapeutic_class
    HAVING count > 0
    ORDER BY drug_class, count DESC
")->fetchAll();

foreach ($new_classes as $class) {
    $controlled_text = $class['controlled_count'] > 0 ? " ({$class['controlled_count']} controlled)" : "";
    echo "  {$class['drug_class']} > {$class['therapeutic_class']}: " . 
         number_format($class['count']) . " drugs{$controlled_text}\n";
}

// Show controlled substances summary
echo "\n🔒 Controlled Substances Summary:\n";
$controlled = $pdo->query("
    SELECT controlled_schedule, COUNT(*) as count
    FROM drugs 
    WHERE controlled_substance = 1
    GROUP BY controlled_schedule
    ORDER BY controlled_schedule
")->fetchAll();

foreach ($controlled as $cs) {
    echo "  Schedule {$cs['controlled_schedule']}: " . number_format($cs['count']) . " drugs\n";
}

echo "\n🎉 Comprehensive drug classification complete!\n";
?>
