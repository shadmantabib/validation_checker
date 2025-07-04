# Security Documentation

## 🔐 Security Measures

This application implements several security layers to protect the validation system:

### 1. Hash-based Verification Numbers
- Uses HMAC-SHA256 cryptographic hashing
- Verification numbers are generated using a secret salt
- Cannot be reverse-engineered or guessed

### 2. Environment Variables
- Secret salt is stored as an environment variable (`SECRET_SALT`)
- Never hardcoded in the source code
- Different secrets can be used for different environments

### 3. Input Sanitization
- All user inputs are sanitized before database queries
- Protection against SQL injection attacks
- Parameterized queries used throughout

### 4. Rate Limiting
- 100 requests per 15 minutes per IP address
- Prevents brute force attacks
- Configurable limits

### 5. Security Headers
- Helmet.js provides security headers
- Content Security Policy (CSP) implemented
- XSS protection enabled

### 6. CORS Protection
- Cross-Origin Resource Sharing configured
- Prevents unauthorized cross-domain requests

## 🛡️ Production Security Setup

### Required Environment Variables

```bash
# CRITICAL: Set this to a long, random string in production
SECRET_SALT=your-very-long-random-secret-key-minimum-32-characters

# Production environment
NODE_ENV=production

# Optional: Custom port
PORT=3000
```

### Generating a Secure Salt

Use one of these methods to generate a secure salt:

```bash
# Method 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Method 2: Using OpenSSL
openssl rand -hex 32

# Method 3: Online generator (use a reputable source)
# Generate at least 32 characters of random data
```

## 🔍 Security Considerations

### Database Exposure
- The SQLite database contains sample data only
- Even if database is exposed, verification numbers cannot be generated without the secret salt
- Real production data should use different verification numbers

### Code Visibility
- The hashing algorithm is visible in the code (this is acceptable)
- Security relies on the secret salt, not algorithm secrecy
- This follows "security through obscurity is not security" principle

### Deployment Security
- Always use HTTPS in production (handled by hosting platforms)
- Set strong environment variables
- Monitor for unusual access patterns
- Consider adding authentication for admin endpoints

## 🚨 Security Warnings

### Development vs Production
- Development uses a default salt for convenience
- Production MUST use a unique, secure salt
- Never use the same salt across different environments

### Admin Endpoints
- The `/api/registrations` endpoint shows all data
- Consider removing or protecting this endpoint in production
- Add authentication if administrative access is needed

## 📊 Security Audit Checklist

- [ ] `SECRET_SALT` environment variable set
- [ ] Default salt warnings appear in development
- [ ] Rate limiting is active
- [ ] HTTPS is enabled (handled by hosting platform)
- [ ] Admin endpoints are secured or removed
- [ ] Database contains only intended data
- [ ] Input validation is working
- [ ] Security headers are present

## 🔄 Security Updates

Regularly update dependencies:
```bash
npm audit
npm audit fix
```

Monitor for security advisories and update packages as needed.

## 📞 Security Contact

If you discover a security vulnerability, please report it responsibly:
1. Do not create public issues for security vulnerabilities
2. Contact the maintainer directly
3. Provide detailed information about the vulnerability
4. Allow time for the issue to be addressed before public disclosure 