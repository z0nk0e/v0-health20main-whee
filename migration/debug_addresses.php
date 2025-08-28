<?php
echo "🔍 Debugging address loading...\n\n";

$sql_file = 'rx_backup_processed.sql';
$handle = fopen($sql_file, 'r');
$in_copy_mode = false;
$line_count = 0;
$valid_rows = 0;
$sample_lines = [];

while (($line = fgets($handle)) !== false) {
    $line = trim($line);
    
    if (strpos($line, 'COPY public.npi_addresses (') === 0) {
        $in_copy_mode = true;
        echo "📥 Found npi_addresses section\n";
        continue;
    }
    
    if ($line === '\.' && $in_copy_mode) {
        echo "🔚 End of npi_addresses section\n";
        break;
    }
    
    if ($in_copy_mode && !empty($line)) {
        $line_count++;
        $parts = explode("\t", $line);
        
        // Save first few lines as samples
        if ($line_count <= 5) {
            $sample_lines[] = $line;
        }
        
        echo "Line $line_count: " . count($parts) . " columns\n";
        
        if (count($parts) >= 15) {
            $valid_rows++;
        }
        
        if ($line_count > 20) break; // Just check first 20 lines
    }
}

fclose($handle);

echo "\n📊 Summary:\n";
echo "Total lines processed: $line_count\n";
echo "Valid rows (>=15 columns): $valid_rows\n\n";

echo "📄 Sample lines:\n";
foreach ($sample_lines as $i => $line) {
    echo "Line " . ($i + 1) . ": " . substr($line, 0, 200) . "...\n";
    $parts = explode("\t", $line);
    echo "  Columns: " . count($parts) . "\n";
    echo "  NPI: " . $parts[0] . "\n";
    echo "  Practice ZIP: " . (isset($parts[9]) ? $parts[9] : 'MISSING') . "\n\n";
}
?>
