<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
$conn = new mysqli('localhost', 'sobf5627_gilang', '@Gilang123', 'sobf5627_realtimegilang');
if ($conn->connect_error) {
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}
$start = isset($_GET['start']) && $_GET['start'] !== '' ? $_GET['start'] : date('Y-m-d', strtotime('monday this week'));
$end = isset($_GET['end']) && $_GET['end'] !== '' ? $_GET['end'] : date('Y-m-d', strtotime('sunday this week'));

$team = [];
// 1. Ambil clicks & unique dari visits
$res1 = $conn->query("
    SELECT subsource AS subid, COUNT(*) AS clicks, COUNT(DISTINCT ip) AS unique_visitors
    FROM visits
    WHERE DATE(timestamp) BETWEEN '$start' AND '$end'
    GROUP BY subsource
");
if (!$res1) {
    error_log("Error in visits query: " . $conn->error);
    echo json_encode([]);
    exit;
}
// Simpan hasil query untuk logging
$visits_data = $res1->fetch_all(MYSQLI_ASSOC);
error_log("Visits query result: " . json_encode($visits_data));
// Reset pointer hasil query
$res1->data_seek(0);
while($row = $res1->fetch_assoc()) {
    $team[$row['subid']] = [
        "subid" => $row['subid'],
        "clicks" => (int)$row['clicks'],
        "unique" => (int)$row['unique_visitors'],
        "conversions" => 0,
        "earnings" => 0.0
    ];
}
// 2. Ambil conversions & earnings dari conversions
$res2 = $conn->query("
    SELECT subid, COUNT(*) AS conversions, SUM(payout) AS earnings
    FROM conversions
    WHERE DATE(time) BETWEEN '$start' AND '$end'
    GROUP BY subid
");
if (!$res2) {
    error_log("Error in conversions query: " . $conn->error);
    echo json_encode([]);
    exit;
}
// Simpan hasil query untuk logging
$conversions_data = $res2->fetch_all(MYSQLI_ASSOC);
error_log("Conversions query result: " . json_encode($conversions_data));
// Reset pointer hasil query
$res2->data_seek(0);
while($row = $res2->fetch_assoc()) {
    $subid = $row['subid'];
    if (!isset($team[$subid])) {
        $team[$subid] = [
            "subid" => $subid,
            "clicks" => 0,
            "unique" => 0,
            "conversions" => (int)$row['conversions'],
            "earnings" => (float)$row['earnings']
        ];
    } else {
        $team[$subid]['conversions'] = (int)$row['conversions'];
        $team[$subid]['earnings'] = (float)$row['earnings'];
    }
}
// 3. Ranking: conversions DESC, earnings DESC
$team = array_values($team);
usort($team, function($a, $b) {
    if ($b['conversions'] === $a['conversions']) {
        return $b['earnings'] <=> $a['earnings'];
    }
    return $b['conversions'] <=> $a['conversions'];
});
foreach ($team as $i => &$row) {
    $row['rank'] = $i + 1;
}

// Debug logging
error_log("Team data before sending: " . json_encode($team));
error_log("Total conversions: " . array_reduce($team, function($sum, $item) { return $sum + $item['conversions']; }, 0));
error_log("Total earnings: " . array_reduce($team, function($sum, $item) { return $sum + $item['earnings']; }, 0));

// 4. Breakdown clicks/unique per negara dari visits
$res3 = $conn->query("
    SELECT subsource AS subid, country, COUNT(*) AS clicks, COUNT(DISTINCT ip) AS unique_visitors
    FROM visits
    WHERE DATE(timestamp) BETWEEN '$start' AND '$end'
    GROUP BY subsource, country
");
$countryBreakdown = [];
while($row = $res3->fetch_assoc()) {
    $countryBreakdown[$row['subid']][$row['country']] = [
        "country" => $row['country'],
        "clicks" => (int)$row['clicks'],
        "unique" => (int)$row['unique_visitors'],
        "conversions" => 0,
        "earnings" => 0.0
    ];
}
// 5. Breakdown conversions/earnings per negara dari conversions
$res4 = $conn->query("
    SELECT subid, country, COUNT(*) AS conversions, SUM(payout) AS earnings
    FROM conversions
    WHERE DATE(time) BETWEEN '$start' AND '$end'
    GROUP BY subid, country
");
while($row = $res4->fetch_assoc()) {
    $subid = $row['subid'];
    $country = $row['country'];
    if (!isset($countryBreakdown[$subid][$country])) {
        $countryBreakdown[$subid][$country] = [
            "country" => $country,
            "clicks" => 0,
            "unique" => 0,
            "conversions" => (int)$row['conversions'],
            "earnings" => (float)$row['earnings']
        ];
    } else {
        $countryBreakdown[$subid][$country]['conversions'] = (int)$row['conversions'];
        $countryBreakdown[$subid][$country]['earnings'] = (float)$row['earnings'];
    }
}
// Gabungkan ke $team
foreach ($team as &$row) {
    $row['countries'] = array_values($countryBreakdown[$row['subid']] ?? []);
}
if (!is_array($team)) {
    echo json_encode([]);
    exit;
}
echo json_encode($team);
?> 