// session_service.bal
import ballerina/time;
import ballerina/uuid;
import ballerina/cache;


configurable int SESSION_TIMEOUT_MINUTES = 30;

// In-memory cache for demo (use Redis in production)
cache:Cache sessionCache = new(capacity = 1000, evictionFactor = 0.2);

public function createExpenseSession() returns ExpenseSession|error {
    string sessionId = uuid:createType1AsString();
    time:Utc now = time:utcNow();
    time:Utc expiresAt = time:utcAddSeconds(now, SESSION_TIMEOUT_MINUTES * 60); 
    
    ExpenseSession session = {
        sessionId: sessionId,
        status: "active",
        createdAt: now,
        expiresAt: expiresAt,
        guestUsers: []
    };

    // Store in cache/Redis
    check sessionCache.put(sessionId, session);
    return session;
}

public function getExpenseSession(string sessionId) returns ExpenseSession|error {
    any|error cachedValue = sessionCache.get(sessionId);
    if cachedValue is error {
        return cachedValue;
    }
    ExpenseSession session;
    if cachedValue is ExpenseSession {
        session = cachedValue;
    } else {
        return error("Session not found");
    }
    
    // Check if expired
    if time:utcNow() > session.expiresAt {
        session.status = "expired";
        check sessionCache.put(sessionId, session);
        return error("Session expired");
    }
    
    return session;
}

public function closeExpenseSession(string sessionId) returns error? {
    any|error cachedValue = sessionCache.get(sessionId);
    if cachedValue is error {
        return cachedValue;
    }
    ExpenseSession session;
    if cachedValue is ExpenseSession {
        session = cachedValue;
    } else {
        return error("Session not found");
    }
    session.status = "closed";
    check sessionCache.put(sessionId, session);
}


public function addGuestToSession(string sessionId, string firstName, string lastName) returns GuestUser|error {
    // Get existing session
    any|error cachedValue = sessionCache.get(sessionId);
    if cachedValue is error {
        return error("Session not found or expired");
    }
    ExpenseSession session;
    if cachedValue is ExpenseSession {
        session = cachedValue;
    } else {
        return error("Session not found");
    }
    
    // Check if session is still active
    if session.status != "active" {
        return error("Session is not active");
    }
    
    // Create new guest user record
    GuestUser newGuest = {
        firstName: firstName,
        lastName: lastName
    };
    
    // Add guest to session array
    session.guestUsers.push(newGuest);
    
    // Update session in cache
    check sessionCache.put(sessionId, session);
    
    return newGuest;
}


