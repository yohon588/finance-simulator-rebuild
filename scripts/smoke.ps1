$ErrorActionPreference = "Stop"

$baseUrl = if ($env:BASE_URL) { $env:BASE_URL.TrimEnd("/") } else { "http://localhost:3100" }

function Wait-ForServer {
  param(
    [int]$Attempts = 20,
    [int]$DelayMs = 500
  )

  for ($index = 0; $index -lt $Attempts; $index++) {
    try {
      $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method "GET" -UseBasicParsing
      if ($health.ok) {
        return
      }
    } catch {
      Start-Sleep -Milliseconds $DelayMs
    }
  }

  throw "Server did not become ready at $baseUrl within $Attempts attempts."
}

function Invoke-JsonRequest {
  param(
    [Parameter(Mandatory = $true)][string]$Path,
    [string]$Method = "GET",
    [hashtable]$Headers = @{},
    $Body = $null
  )

  $params = @{
    Uri = "$baseUrl$Path"
    Method = $Method
    Headers = $Headers
    ContentType = "application/json"
    UseBasicParsing = $true
  }

  if ($null -ne $Body) {
    $params.Body = ($Body | ConvertTo-Json -Depth 10)
  }

  $response = Invoke-RestMethod @params
  return $response
}

Wait-ForServer

$teacher = Invoke-JsonRequest -Path "/api/rooms" -Method "POST" -Body @{
  teacherName = "Smoke Teacher"
  roomName = "Smoke Classroom"
}

$teacherHeaders = @{
  Authorization = "Bearer $($teacher.token)"
}

Invoke-JsonRequest -Path "/api/teacher/open-round" -Method "POST" -Headers $teacherHeaders -Body @{
  eventId = 24
} | Out-Null

$student = Invoke-JsonRequest -Path "/api/join" -Method "POST" -Body @{
  roomCode = $teacher.classroom.code
  displayName = "Smoke Student"
  roleId = "R4"
}

$studentHeaders = @{
  Authorization = "Bearer $($student.token)"
}

Invoke-JsonRequest -Path "/api/student/dice" -Method "POST" -Headers $studentHeaders | Out-Null

Invoke-JsonRequest -Path "/api/student/decision" -Method "POST" -Headers $studentHeaders -Body @{
  idempotencyKey = "smoke-decision-1"
  consume = @(
    @{ id = "C3"; amount = 3000 },
    @{ id = "R1"; amount = 800 },
    @{ id = "Q1"; amount = 700 }
  )
  loan = @{
    borrow = 1000
    repay = 0
    allocateTo = "D-consumer"
  }
  invest = @(
    @{ asset = "A5"; action = "buy"; amount = 1200 },
    @{ asset = "A8"; action = "buy"; amount = 300 }
  )
  gamble = @{
    type = "SPORTS"
    amount = 100
  }
  riskAck = @("A8", "A9")
} | Out-Null

Invoke-JsonRequest -Path "/api/teacher/lock-round" -Method "POST" -Headers $teacherHeaders | Out-Null
$settled = Invoke-JsonRequest -Path "/api/teacher/settle-round" -Method "POST" -Headers $teacherHeaders
$history = Invoke-JsonRequest -Path "/api/teacher/history" -Headers $teacherHeaders
$detail = Invoke-JsonRequest -Path "/api/teacher/history/round?roundNo=1" -Headers $teacherHeaders
$review = Invoke-JsonRequest -Path "/api/student/history/round?roundNo=1" -Headers $studentHeaders
$screen = Invoke-JsonRequest -Path "/api/screen?roomCode=$([System.Uri]::EscapeDataString($teacher.classroom.code))"

$result = [ordered]@{
  roomCode = $teacher.classroom.code
  nextRound = $settled.round.no
  nextStatus = $settled.round.status
  historyCount = $history.roundHistory.Count
  teacherDetailStudents = $detail.roundDetail.students.Count
  studentReviewRound = $review.studentRoundDetail.roundNo
  screenLeader = if ($screen.ranking.Count -gt 0) { $screen.ranking[0].displayName } else { $null }
}

$result | ConvertTo-Json -Depth 10
