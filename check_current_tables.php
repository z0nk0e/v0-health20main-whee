<?php
$pdo = new PDO(
    "mysql:host=localhost;dbname=u883018350_prescribers_pd", 
    "u883018350_admin", 
    "Gh0stredux2025!!!"
);

echo "🔍 Checking current table structure...\n\n";

// Check what tables exist
$tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
echo "📊 Current tables: " . implode(', ', $tables) . "\n\n";

// Check if normalization tables exist
$normalization_tables = ['drugs', 'specialties', 'states'];

foreach ($normalization_tables as $table) {
    if (in_array($table, $tables)) {
        echo "✅ Table '$table' exists\n";
        
        // Show structure
        $columns = $pdo->query("DESCRIBE $table")->fetchAll();
        echo "   Columns: ";
        foreach ($columns as $col) {
            echo $col['Field'] . " (" . $col['Type'] . "), ";
        }
        echo "\n";
        
        // Show row count
        $count = $pdo->query("SELECT COUNT(*) FROM $table")->fetchColumn();
        echo "   Rows: " . number_format($count) . "\n\n";
        
    } else {
        echo "❌ Table '$table' missing\n\n";
    }
}

// Check if foreign key columns exist
echo "🔗 Checking foreign key columns:\n";

$fk_checks = [
    'npi_prescriptions' => 'drug_id',
    'npi_details' => 'specialty_id'
];

foreach ($fk_checks as $table => $column) {
    $columns = $pdo->query("DESCRIBE $table")->fetchAll(PDO::FETCH_COLUMN);
    $column_names = array_column($columns, 'Field');
    
    if (in_array($column, $column_names)) {
        echo "✅ $table.$column exists\n";
        
        // Check if it's populated
        $populated = $pdo->query("SELECT COUNT(*) FROM $table WHERE $column IS NOT NULL")->fetchColumn();
        $total = $pdo->query("SELECT COUNT(*) FROM $table")->fetchColumn();
        echo "   Populated: " . number_format($populated) . " / " . number_format($total) . " (" . round($populated/$total*100, 1) . "%)\n";
    } else {
        echo "❌ $table.$column missing\n";
    }
}

echo "\n🎯 Recommendations:\n";
?>
