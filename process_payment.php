<?php
// process_payment.php
require_once 'vendor/autoload.php';
\Stripe\Stripe::setApiKey('sk_test_YOUR_SECRET_KEY');

$input = json_decode(file_get_contents('php://input'), true);
$session_id = $input['session_id'];

// Get search session
$pdo = new PDO(
    "mysql:host=localhost;dbname=u883018350_prescribers_pd", 
    "u883018350_admin", 
    "Gh0stredux2025!!!"
);

$stmt = $pdo->prepare("SELECT * FROM search_sessions WHERE session_id = ?");
$stmt->execute([$session_id]);
$session = $stmt->fetch();

// Create Stripe Checkout Session
$checkout_session = \Stripe\Checkout\Session::create([
    'payment_method_types' => ['card'],
    'line_items' => [[
        'price_data' => [
            'currency' => 'usd',
            'product_data' => [
                'name' => 'Prescriber Report',
                'description' => "Complete prescriber report for {$session['search_params']['drug']} near {$session['search_params']['zip']}",
            ],
            'unit_amount' => 999,
        ],
        'quantity' => 1,
    ]],
    'mode' => 'payment',
    'success_url' => 'https://rxprescribers.com/success.php?session_id=' . $session_id,
    'cancel_url' => 'https://rxprescribers.com/search.html',
    'metadata' => [
        'session_id' => $session_id
    ]
]);

echo json_encode(['id' => $checkout_session->id]);
?>