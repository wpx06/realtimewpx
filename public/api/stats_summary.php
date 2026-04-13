<?php
header('Content-Type: application/json');
$conn = new mysqli('localhost', 'sobf5627_gilang', '@Gilang123', 'sobf5627_realtimegilang');
if ($conn->connect_error) {
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}
$res1 = $conn->query("SELECT COUNT(*) as totalClicks FROM visits");
$row1 = $res1->fetch_assoc();
$res2 = $conn->query("SELECT COUNT(DISTINCT ip) as totalUnique FROM visits");
$row2 = $res2->fetch_assoc();
$res3 = $conn->query("SELECT COUNT(*) as totalConversions FROM conversions");
$row3 = $res3->fetch_assoc();
$res4 = $conn->query("SELECT SUM(payout) as totalEarning FROM conversions");
$row4 = $res4->fetch_assoc();
echo json_encode([
  "totalClicks" => intval($row1['totalClicks']),
  "totalUnique" => intval($row2['totalUnique']),
  "totalConversions" => intval($row3['totalConversions']),
  "totalEarning" => floatval($row4['totalEarning'])
]);
?> 