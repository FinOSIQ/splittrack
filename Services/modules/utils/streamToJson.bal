


// Define a type for JSON-compatible records
public type JsonRecord record {|
    int|string|float|boolean|json[]|map<json>|null...;
|};

// General-purpose stream-to-JSON conversion using the named type
public function streamToJson(stream<JsonRecord, error?> scanRecords) returns json[]|error {
    return from JsonRecord rec in scanRecords select rec;
}