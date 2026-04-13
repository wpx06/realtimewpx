<?php
header('Content-Type: application/json');
$conn = new mysqli('localhost', 'sobf5627_gilang', '@Gilang123', 'sobf5627_realtimegilang');
if ($conn->connect_error) {
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}
$data = [];
$result = $conn->query("SELECT * FROM visits ORDER BY timestamp DESC LIMIT 100");
while($row = $result->fetch_assoc()) {
    $data[] = $row;
}
echo json_encode($data);
?> 