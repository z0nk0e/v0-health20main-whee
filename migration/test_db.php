<?php
try {
    $pdo = new PDO(
        "mysql:host=localhost;dbname=u883018350_prescribers_pd", 
        "u883018350_admin", 
        "Gh0stredux2025!!!"
    );
    echo "✅ Database connection successful\n";
    
    $result = $pdo->query("SELECT COUNT(*) FROM us_zipcodes")->fetchColumn();
    echo "Current ZIP codes: $result\n";
    
} catch(PDOException $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
}
?>
