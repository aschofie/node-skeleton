## Dummy Ingestion Service
- Has an /ingest POST endpoint.
- A capital "Z" in the lastName will cause a 500 internal server error.
- A lowercase "z" in the lastName will cause the response to take 3 seconds. 
  This is 2 seconds longer than the timeout specified.
- All other data returns status 200 between after between 150 ms and 500 ms.

## testData.jsonl
Contains 50 rows.
- 2 Rows have z in the lastName
- 'z' in lastName: See rows for Zimmerman (Row 4) and Martinez (Row 5).
- 1 row has an invalid email
  - Row 47 (pmurphy_at_invalid_email).
- 1 row has a lastName Length > 25: 
  - Row 14: firstName "Bartholomew-Alexander-Maximilian" (32 chars)
- 2 rows have lastName of > length 25
  - Row 24: lastName "Vandenberg-St-John-Smythe-Villiers" (34 chars)
  - Row 46: firstName "Jonathan-Quincy-Harrison-Fitzgerald" (35 chars)
 