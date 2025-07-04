# Registration Validation System

A secure web application for validating registration numbers against verification codes stored in a database. Built with Node.js, Express, SQLite, and modern web technologies.

## Features

- 🔐 **Secure Validation**: Hash-based verification numbers using HMAC-SHA256
- 🚀 **Fast & Lightweight**: SQLite database for quick deployment
- 🎨 **Modern UI**: Responsive design with smooth animations
- 🛡️ **Security First**: Rate limiting, input sanitization, and CORS protection
- 📱 **Mobile Friendly**: Fully responsive design
- 🔄 **Real-time Validation**: Instant feedback and error handling

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd validation-check-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npm run setup-db
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Database Setup

The application uses SQLite for easy deployment. The database setup script creates:

- A `registrations` table with fields: `reg_no`, `name`, `father_name`, `mother_name`, `venue`, `verification_no`
- Sample data for testing
- Hash-based verification numbers using HMAC-SHA256

### Sample Data

The system comes with 5 sample registrations for testing:

| Registration No | Name | Verification Code |
|----------------|------|------------------|
| 12345678 | Sohel Rahman | Generated Hash |
| 87654321 | John Doe | Generated Hash |
| 11223344 | Alice Smith | Generated Hash |
| 55667788 | Mohammad Rahman | Generated Hash |
| 99887766 | Sarah Johnson | Generated Hash |

## API Endpoints

### POST /api/validate
Validates a registration number and verification code.

**Request Body:**
```json
{
  "regNo": "12345678",
  "verificationNo": "ABC12345"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Registration validated successfully",
  "data": {
    "regNo": "12345678",
    "name": "Sohel Rahman",
    "fatherName": "Siddiqur Rahman",
    "motherName": "Hosne Ara Begu",
    "venue": "BUET, ECE Building, Room 233",
    "verificationNo": "ABC12345"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid registration number or verification number"
}
```

### GET /api/registrations
Returns all registrations (for admin/testing purposes).

### GET /api/health
Health check endpoint.

## Security Features

1. **Rate Limiting**: 100 requests per 15 minutes per IP
2. **Input Sanitization**: All inputs are sanitized before database queries
3. **CORS Protection**: Configurable CORS settings
4. **SQL Injection Prevention**: Parameterized queries
5. **Security Headers**: Helmet.js for security headers
6. **Hash-based Verification**: HMAC-SHA256 for verification numbers

## Deployment

### Local Development

```bash
npm run dev  # Uses nodemon for auto-restart
```

### Production Deployment

1. **Environment Variables**
   Set these environment variables in production:
   ```
   PORT=3000
   NODE_ENV=production
   SECRET_SALT=your-very-secure-secret-salt
   ```

2. **Database Setup**
   ```bash
   npm run setup-db
   ```

3. **Start Production Server**
   ```bash
   npm start
   ```

### Deployment Platforms

#### Heroku
1. Create a new Heroku app
2. Set environment variables in Heroku dashboard
3. Deploy using Git or GitHub integration

#### Railway
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

#### DigitalOcean App Platform
1. Create a new app
2. Connect your repository
3. Configure environment variables
4. Deploy

#### VPS/Server
1. Install Node.js and npm
2. Clone the repository
3. Install dependencies
4. Set up PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start server.js --name validation-app
   pm2 startup
   pm2 save
   ```

## Customization

### Adding New Registrations

1. **Via Database**: Add records directly to the SQLite database
2. **Via Code**: Modify `setup-database.js` to include your data
3. **Via API**: Create an admin endpoint (not included for security)

### Changing Verification Algorithm

Modify the `generateVerificationNumber` function in `setup-database.js`:

```javascript
function generateVerificationNumber(regNo) {
  // Your custom logic here
  const secret = process.env.SECRET_SALT || 'your-secret-salt-key';
  const hash = crypto.createHmac('sha256', secret)
                    .update(regNo.toString())
                    .digest('hex');
  return hash.substring(0, 8).toUpperCase();
}
```

### Styling Customization

Edit `public/styles.css` to customize the appearance:
- Colors: Modify CSS variables
- Layout: Adjust grid and flexbox properties
- Animations: Customize transitions and keyframes

## File Structure

```
validation-check-app/
├── server.js              # Main server file
├── setup-database.js      # Database setup script
├── package.json          # Dependencies and scripts
├── README.md            # This file
├── validation.db        # SQLite database (created after setup)
└── public/
    ├── index.html       # Main HTML file
    ├── styles.css       # CSS styles
    └── script.js        # Client-side JavaScript
```

## Troubleshooting

### Common Issues

1. **Database not found**
   - Run `npm run setup-db` to create the database

2. **Port already in use**
   - Change the PORT in your environment variables
   - Kill the process using the port: `lsof -ti:3000 | xargs kill`

3. **CORS errors**
   - Check your CORS configuration in `server.js`
   - Ensure your frontend and backend URLs match

4. **Verification numbers not matching**
   - Ensure the secret salt is consistent
   - Check that the hash algorithm matches

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the code comments
3. Create an issue in the repository

---

**Note**: This is a demonstration application. For production use, consider additional security measures, user authentication, and data validation based on your specific requirements. 