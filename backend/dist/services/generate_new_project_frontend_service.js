"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GenerateNewProjectFrontendService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateNewProjectFrontendService = void 0;
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
const fs = require("fs/promises");
const path = require("path");
let GenerateNewProjectFrontendService = class GenerateNewProjectFrontendService {
    static { GenerateNewProjectFrontendService_1 = this; }
    BASE_PORT = 8080;
    static usedPorts = new Set();
    static runningServers = new Map();
    constructor() { }
    async findAvailablePort() {
        const net = require('net');
        for (let port = this.BASE_PORT; port < this.BASE_PORT + 100; port++) {
            if (!GenerateNewProjectFrontendService_1.usedPorts.has(port)) {
                const isAvailable = await this.isPortAvailable(port);
                if (isAvailable) {
                    GenerateNewProjectFrontendService_1.usedPorts.add(port);
                    return port;
                }
            }
        }
        throw new Error('No available ports found in range 8080-8179');
    }
    isPortAvailable(port) {
        const net = require('net');
        return new Promise((resolve) => {
            const server = net.createServer();
            server.listen(port, () => {
                server.once('close', () => {
                    resolve(true);
                });
                server.close();
            });
            server.on('error', () => {
                resolve(false);
            });
        });
    }
    registerRunningServer(port, projectName, processId) {
        GenerateNewProjectFrontendService_1.runningServers.set(port, {
            projectName,
            processId,
        });
        console.log(`📝 Registered server for '${projectName}' on port ${port}`);
    }
    cleanupZombieProcesses() {
        console.log('🧹 Cleaning up zombie processes...');
        GenerateNewProjectFrontendService_1.usedPorts.clear();
        GenerateNewProjectFrontendService_1.runningServers.clear();
        console.log('✅ Cleanup completed');
    }
    getRunningServers() {
        return Array.from(GenerateNewProjectFrontendService_1.runningServers.entries()).map(([port, info]) => ({ port, ...info }));
    }
    analyzeProjectType(projectName) {
        const lowerName = projectName.toLowerCase();
        const companyKeywords = [
            'company',
            'corp',
            'business',
            'profile',
            'about',
            'corporate',
            'firm',
            'agency',
            'studio',
            'inc',
            'ltd',
        ];
        const landingKeywords = [
            'landing',
            'promo',
            'marketing',
            'campaign',
            'launch',
            'intro',
            'welcome',
        ];
        const ecommerceKeywords = [
            'shop',
            'store',
            'market',
            'ecommerce',
            'e-commerce',
            'buy',
            'sell',
            'cart',
            'product',
        ];
        if (companyKeywords.some((keyword) => lowerName.includes(keyword))) {
            return {
                type: 'company-profile',
                features: [
                    'About Us',
                    'Services',
                    'Team',
                    'Contact Form',
                    'Testimonials',
                    'Portfolio',
                ],
                additionalDependencies: {
                    'react-router-dom': '^6.28.0',
                    'emailjs-com': '^3.2.0',
                },
            };
        }
        if (landingKeywords.some((keyword) => lowerName.includes(keyword))) {
            return {
                type: 'landing-page',
                features: [
                    'Hero Section',
                    'Features',
                    'CTA Buttons',
                    'Newsletter Signup',
                    'Social Media Links',
                ],
                additionalDependencies: {
                    'react-router-dom': '^6.28.0',
                    'framer-motion': '^10.0.0',
                },
            };
        }
        if (ecommerceKeywords.some((keyword) => lowerName.includes(keyword))) {
            return {
                type: 'ecommerce',
                features: [
                    'Product Catalog',
                    'Shopping Cart',
                    'Product Search',
                    'Categories',
                    'User Authentication',
                ],
                additionalDependencies: {
                    'react-router-dom': '^6.28.0',
                    axios: '^1.3.0',
                    '@tanstack/react-query': '^4.36.1',
                },
            };
        }
        return {
            type: 'basic',
            features: ['Basic Layout', 'Navigation', 'Footer'],
            additionalDependencies: {},
        };
    }
    async runShellCommand(command, args = [], options = {}) {
        return new Promise((resolve, reject) => {
            console.log(`\nExecuting command: ${command} ${args.join(' ')}`);
            const child = (0, child_process_1.spawn)(command, args, {
                stdio: 'inherit',
                ...options,
            });
            child.on('error', (err) => {
                console.error(`Failed to start process '${command}': ${err.message}`);
                reject(err);
            });
            child.on('close', (code) => {
                if (code === 0) {
                    console.log(`Command '${command}' completed successfully.`);
                    resolve();
                }
                else {
                    const errorMessage = `Command '${command}' exited with code ${code}`;
                    console.error(errorMessage);
                    reject(new Error(errorMessage));
                }
            });
        });
    }
    async setupReactProject(projectName) {
        try {
            console.log('--- Starting Enhanced React Project Setup ---', projectName);
            const projectConfig = this.analyzeProjectType(projectName);
            console.log(`\nDetected project type: ${projectConfig.type}`);
            console.log(`Features to include: ${projectConfig.features.join(', ')}`);
            const rootDir = path.resolve(__dirname, '../../../');
            const outputDir = path.join(rootDir, 'output');
            console.log('\nSTEP 1: Creating output directory...');
            await fs.mkdir(outputDir, { recursive: true });
            console.log('Output directory ready.');
            console.log(`\nSTEP 2: Creating React TypeScript project: ${projectName}...`);
            await this.runShellCommand('npx', ['create-react-app', projectName, '--template', 'typescript'], {
                cwd: outputDir,
                stdio: 'inherit',
            });
            console.log('\nSTEP 3: Adding specialized features...');
            await this.enhanceReactProject(path.join(outputDir, projectName), projectName, projectConfig);
            console.log(`✅ Enhanced React ${projectConfig.type} project '${projectName}' created successfully with features: ${projectConfig.features.join(', ')}`);
            return true;
        }
        catch (error) {
            console.error('!!! An error occurred during React project setup !!!');
            if (error instanceof Error) {
                console.error(`Error details: ${error.message}`);
            }
            throw new common_1.HttpException(error, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async enhanceReactProject(projectPath, projectName, projectConfig) {
        try {
            if (Object.keys(projectConfig.additionalDependencies).length > 0) {
                console.log('Installing additional dependencies...');
                const deps = Object.entries(projectConfig.additionalDependencies)
                    .map(([pkg, version]) => `${pkg}@${version}`)
                    .join(' ');
                try {
                    await this.runShellCommand('npm', ['install', ...deps.split(' ')], {
                        cwd: projectPath,
                    });
                }
                catch (installError) {
                    console.warn('⚠️ Standard install failed, trying with --legacy-peer-deps...');
                    console.warn(`Install error: ${installError.message}`);
                    try {
                        await this.runShellCommand('npm', ['install', ...deps.split(' '), '--legacy-peer-deps'], {
                            cwd: projectPath,
                        });
                        console.log('✅ Dependencies installed with --legacy-peer-deps');
                    }
                    catch (legacyError) {
                        console.warn('⚠️ Legacy install also failed, trying --force...');
                        console.warn(`Legacy error: ${legacyError.message}`);
                        try {
                            await this.runShellCommand('npm', ['install', ...deps.split(' '), '--force'], {
                                cwd: projectPath,
                            });
                            console.log('✅ Dependencies installed with --force');
                        }
                        catch (forceError) {
                            console.error('❌ All dependency installation methods failed');
                            console.error(`Force error: ${forceError.message}`);
                            console.log('📝 Continuing without additional dependencies...');
                        }
                    }
                }
            }
            const appTsxPath = path.join(projectPath, 'src', 'App.tsx');
            const enhancedAppContent = this.generateReactAppContent(projectName, projectConfig);
            await fs.writeFile(appTsxPath, enhancedAppContent);
            const appCssPath = path.join(projectPath, 'src', 'App.css');
            const enhancedCssContent = this.generateCssContent(projectConfig);
            await fs.writeFile(appCssPath, enhancedCssContent);
            await this.generateReactComponents(projectPath, projectConfig);
            console.log('✅ React project enhanced successfully!');
        }
        catch (error) {
            console.error('Error enhancing React project:', error);
            throw error;
        }
    }
    generateReactAppContent(projectName, projectConfig) {
        const imports = `import React from 'react';
import './App.css';`;
        let componentContent = '';
        switch (projectConfig.type) {
            case 'company-profile':
                componentContent = this.generateReactCompanyProfile(projectName);
                break;
            case 'landing-page':
                componentContent = this.generateReactLandingPage(projectName);
                break;
            case 'ecommerce':
                componentContent = this.generateReactEcommerce(projectName);
                break;
            default:
                componentContent = this.generateReactBasic(projectName);
        }
        return `${imports}

${componentContent}

export default App;`;
    }
    generateReactCompanyProfile(projectName) {
        return `function App() {
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="nav-container">
          <h1 className="logo">${projectName}</h1>
          <ul className="nav-menu">
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#team">Team</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
      </nav>

      <section id="home" className="hero">
        <div className="hero-content">
          <h2>Welcome to ${projectName}</h2>
          <p>Your trusted partner in business excellence</p>
          <button className="cta-button">Learn More</button>
        </div>
      </section>

      <section id="about" className="about">
        <div className="container">
          <h2>About Us</h2>
          <p>We are a leading company dedicated to providing exceptional services and solutions to our clients.</p>
        </div>
      </section>

      <section id="services" className="services">
        <div className="container">
          <h2>Our Services</h2>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">🛠️</div>
              <h3>Consulting</h3>
              <p>Expert consulting services to help your business grow.</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📈</div>
              <h3>Strategy</h3>
              <p>Strategic planning and implementation for success.</p>
            </div>
            <div className="service-card">
              <div className="service-icon">👥</div>
              <h3>Support</h3>
              <p>24/7 customer support for all your needs.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="contact">
        <div className="container">
          <h2>Contact Us</h2>
          <form className="contact-form" onSubmit={handleContactSubmit}>
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Your Email" required />
            <textarea placeholder="Your Message" required></textarea>
            <button type="submit">Send Message</button>
          </form>
        </div>
      </section>

      <footer>
        <div className="container">
          <p>&copy; 2025 ${projectName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}`;
    }
    generateReactLandingPage(projectName) {
        return `function App() {
  const [email, setEmail] = React.useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(\`Thank you for subscribing with email: \${email}\`);
    setEmail('');
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="nav-container">
          <h1 className="logo">${projectName}</h1>
          <ul className="nav-menu">
            <li><a href="#home">Home</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
      </nav>

      <section id="home" className="hero">
        <div className="hero-content">
          <h1>Transform Your Business Today</h1>
          <p>Join thousands of satisfied customers who have revolutionized their workflow with ${projectName}</p>
          <div className="cta-buttons">
            <button className="cta-primary" onClick={() => alert('Welcome! Sign up process would start here.')}>
              Get Started Free
            </button>
            <button className="cta-secondary" onClick={() => alert('Demo video would play here.')}>
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      <section id="features" className="features">
        <div className="container">
          <h2>Why Choose ${projectName}?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>Fast & Reliable</h3>
              <p>Lightning-fast performance with 99.9% uptime guarantee.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Secure</h3>
              <p>Enterprise-grade security to protect your data.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Mobile Ready</h3>
              <p>Works perfectly on all devices and platforms.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="newsletter">
        <div className="container">
          <h2>Stay Updated</h2>
          <p>Subscribe to our newsletter for the latest updates and offers</p>
          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </section>

      <footer>
        <div className="container">
          <p>&copy; 2025 ${projectName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}`;
    }
    generateReactEcommerce(projectName) {
        return `function App() {
  const [cartCount, setCartCount] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState('');

  const addToCart = () => {
    setCartCount(prev => prev + 1);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      alert(\`Searching for: \${searchQuery}\`);
    }
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="nav-container">
          <h1 className="logo">${projectName}</h1>
          <div className="nav-center">
            <input 
              type="text" 
              className="search-bar" 
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="search-btn" onClick={handleSearch}>🔍</button>
          </div>
          <div className="nav-right">
            <button className="cart-btn">
              🛒
              <span className="cart-count">{cartCount}</span>
            </button>
            <button className="user-btn">👤</button>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to ${projectName}</h1>
          <p>Discover amazing products at unbeatable prices</p>
          <button className="cta-button">Shop Now</button>
        </div>
      </section>

      <section className="categories">
        <div className="container">
          <h2>Shop by Category</h2>
          <div className="categories-grid">
            {['📱 Electronics', '👕 Fashion', '🏠 Home & Garden', '📚 Books'].map((category, index) => (
              <div key={index} className="category-card" onClick={() => alert(\`Browsing \${category} category\`)}>
                <h3>{category}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="products">
        <div className="container">
          <h2>Featured Products</h2>
          <div className="products-grid">
            {['Sample Product 1 - $99.99', 'Sample Product 2 - $149.99', 'Sample Product 3 - $79.99'].map((product, index) => (
              <div key={index} className="product-card">
                <div className="product-image"></div>
                <h3>{product.split(' - ')[0]}</h3>
                <p className="price">{product.split(' - ')[1]}</p>
                <button className="add-to-cart" onClick={addToCart}>Add to Cart</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer>
        <div className="container">
          <p>&copy; 2025 ${projectName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}`;
    }
    generateReactBasic(projectName) {
        return `function App() {
  return (
    <div className="App">
      <div className="container">
        <h1>Welcome to ${projectName}!</h1>
        <p>Your React development server is running successfully.</p>
        <div className="features">
          <h2>Basic Features Included:</h2>
          <ul>
            <li>✅ React with TypeScript</li>
            <li>✅ Basic Layout</li>
            <li>✅ Responsive Design</li>
          </ul>
        </div>
      </div>
    </div>
  );
}`;
    }
    async generateReactComponents(projectPath, projectConfig) {
        const componentsDir = path.join(projectPath, 'src', 'components');
        await fs.mkdir(componentsDir, { recursive: true });
        const projectTypeTitle = projectConfig.type.charAt(0).toUpperCase() + projectConfig.type.slice(1);
        const featuresText = projectConfig.features
            .map((feature) => `- ${feature}`)
            .join('\n');
        const readmeContent = `# ${projectTypeTitle} Project

This project was generated with enhanced features for a ${projectConfig.type} website.

## Features Included
${featuresText}

## Available Scripts

In the project directory, you can run:

### \`npm start\`
Runs the app in development mode.

### \`npm test\`
Launches the test runner.

### \`npm run build\`
Builds the app for production.

## Project Structure
- \`src/App.tsx\` - Main application component with ${projectConfig.type} layout
- \`src/App.css\` - Specialized styles for ${projectConfig.type}
- \`src/components/\` - Additional components (if any)
`;
        await fs.writeFile(path.join(projectPath, 'README.md'), readmeContent);
        console.log('✅ Additional React project files generated!');
    }
    async setupVanillaProject(projectName) {
        try {
            console.log('--- Starting Enhanced Frontend Project Setup ---', projectName);
            const projectConfig = this.analyzeProjectType(projectName);
            console.log(`\nDetected project type: ${projectConfig.type}`);
            console.log(`Features to include: ${projectConfig.features.join(', ')}`);
            const port = await this.findAvailablePort();
            console.log(`📡 Assigned port: ${port}`);
            const rootDir = path.resolve(__dirname, '../../../');
            const outputDir = path.join(rootDir, 'output');
            const projectPath = path.join(outputDir, projectName);
            console.log(`Root directory: ${rootDir}`);
            console.log(`Output directory: ${outputDir}`);
            console.log(`Project path: ${projectPath}`);
            console.log('\nSTEP 1: Creating output directory...');
            await fs.mkdir(outputDir, { recursive: true });
            console.log('Output directory ready.');
            try {
                await fs.access(projectPath);
                const errorMsg = `Directory '${projectName}' already exists.`;
                console.error(errorMsg);
                throw new Error(errorMsg);
            }
            catch (error) {
                if (error.code !== 'ENOENT') {
                    console.error('Access check error:', error);
                    throw error;
                }
                console.log('Project directory does not exist, proceeding...');
            }
            console.log(`\nSTEP 3: Creating project directory: ${projectName}...`);
            await fs.mkdir(projectPath, { recursive: true });
            console.log('Project directory created successfully.');
            console.log('\nSTEP 4: Generating specialized project files...');
            await this.generateProjectFiles(projectPath, projectName, projectConfig, port);
            console.log('\nSTEP 5: Installing dependencies...');
            await this.installDependencies(projectPath);
            console.log('\nSTEP 6: Starting the development server...');
            try {
                await this.startDevelopmentServer(projectPath, port);
            }
            catch (serverError) {
                console.error(`❌ Server startup failed: ${serverError.message}`);
                if (serverError.message.includes('Port') &&
                    serverError.message.includes('already in use')) {
                    console.log(`💡 Port ${port} conflict detected. You can try generating the project again.`);
                }
                GenerateNewProjectFrontendService_1.usedPorts.delete(port);
                console.log(`⚠️ Project files created successfully, but server startup failed.`);
                console.log(`📁 You can manually start the server by running 'npm start' in: ${projectPath}`);
                console.log(`🌐 The server should run on: http://localhost:${port}`);
                console.log(`✅ ${projectConfig.type} project '${projectName}' created successfully with features: ${projectConfig.features.join(', ')}`);
                console.log(`📝 Note: Manual server start required due to startup issue.`);
                return true;
            }
            console.log(`✅ ${projectConfig.type} project '${projectName}' created successfully with features: ${projectConfig.features.join(', ')}`);
            console.log(`🌐 Server running at: http://localhost:${port}`);
            return true;
        }
        catch (error) {
            console.error('!!! An error occurred during project setup !!!');
            console.error('Error details:', error);
            if (error instanceof Error) {
                console.error(`Error message: ${error.message}`);
                console.error(`Error stack: ${error.stack}`);
            }
            throw new common_1.HttpException(error.message || error, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async generateProjectFiles(projectPath, projectName, projectConfig, port) {
        const htmlContent = this.generateHtmlContent(projectName, projectConfig);
        const cssContent = this.generateCssContent(projectConfig);
        const jsContent = this.generateJsContent(projectName, projectConfig);
        const serverContent = `const http = require('http');
const fs = require('fs');
const path = require('path');
const open = require('open');

const PORT = ${port};

console.log('🚀 Starting server on port ' + PORT + '...');

const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    const extname = path.extname(filePath);
    let contentType = 'text/html';

    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
        case '.ico':
            contentType = 'image/x-icon';
            break;
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code == 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                console.error('Server error:', err);
                res.writeHead(500);
                res.end('Server Error: ' + err.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.on('error', (err) => {
    console.error('❌ Server error:', err.message);
    if (err.code === 'EADDRINUSE') {
        console.error(\`❌ Port \${PORT} is already in use. Please try a different port.\`);
        process.exit(1);
    }
});

server.listen(PORT, () => {
    const url = \`http://localhost:\${PORT}\`;
    console.log(\`✅ Server is running successfully at \${url}\`);
    
    // Try to open browser, but don't fail if it doesn't work
    try {
        open(url);
        console.log('🌐 Browser opened automatically');
    } catch (browserError) {
        console.log('📝 Could not open browser automatically. Please visit: ' + url);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🔄 Server shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🔄 Server shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
`;
        const packageJsonContent = {
            name: projectName.toLowerCase().replace(/\s+/g, '-'),
            version: '1.0.0',
            description: `A ${projectConfig.type} frontend project named ${projectName}`,
            main: 'server.js',
            scripts: {
                start: 'node server.js',
            },
            author: '',
            license: 'ISC',
            dependencies: {
                open: '^8.4.0',
                ...projectConfig.additionalDependencies,
            },
        };
        await fs.writeFile(path.join(projectPath, 'index.html'), htmlContent);
        await fs.writeFile(path.join(projectPath, 'styles.css'), cssContent);
        await fs.writeFile(path.join(projectPath, 'app.js'), jsContent);
        await fs.writeFile(path.join(projectPath, 'server.js'), serverContent);
        await fs.writeFile(path.join(projectPath, 'package.json'), JSON.stringify(packageJsonContent, null, 2));
        console.log('✅ Specialized project files generated successfully!');
        console.log(`📋 Project type: ${projectConfig.type}`);
        console.log(`🎯 Features included: ${projectConfig.features.join(', ')}`);
    }
    async installDependencies(projectPath) {
        return new Promise((resolve, reject) => {
            console.log('📦 Installing dependencies... This may take a moment.');
            (0, child_process_1.exec)('npm install', { cwd: projectPath }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error during dependency installation: ${error.message}`);
                    console.log('⚠️ Retrying with --legacy-peer-deps...');
                    (0, child_process_1.exec)('npm install --legacy-peer-deps', { cwd: projectPath }, (legacyError, legacyStdout, legacyStderr) => {
                        if (legacyError) {
                            console.error(`Legacy install also failed: ${legacyError.message}`);
                            console.log('⚠️ Last attempt with --force...');
                            (0, child_process_1.exec)('npm install --force', { cwd: projectPath }, (forceError, forceStdout, forceStderr) => {
                                if (forceError) {
                                    console.error(`All installation methods failed: ${forceError.message}`);
                                    reject(forceError);
                                    return;
                                }
                                if (forceStderr) {
                                    console.log(`npm install --force details: ${forceStderr}`);
                                }
                                if (forceStdout) {
                                    console.log(`npm install --force output: ${forceStdout}`);
                                }
                                console.log('✅ Dependencies installed with --force');
                                resolve();
                            });
                        }
                        else {
                            if (legacyStderr) {
                                console.log(`npm install --legacy-peer-deps details: ${legacyStderr}`);
                            }
                            if (legacyStdout) {
                                console.log(`npm install --legacy-peer-deps output: ${legacyStdout}`);
                            }
                            console.log('✅ Dependencies installed with --legacy-peer-deps');
                            resolve();
                        }
                    });
                }
                else {
                    if (stderr) {
                        console.log(`npm install details: ${stderr}`);
                    }
                    if (stdout) {
                        console.log(`npm install output: ${stdout}`);
                    }
                    console.log('✅ Dependencies installed successfully');
                    resolve();
                }
            });
        });
    }
    async startDevelopmentServer(projectPath, port) {
        return new Promise(async (resolve, reject) => {
            console.log(`🚀 Starting the development server on port ${port}...`);
            console.log(`📂 Project path: ${projectPath}`);
            try {
                const packageJsonPath = path.join(projectPath, 'package.json');
                const serverJsPath = path.join(projectPath, 'server.js');
                await fs.access(packageJsonPath);
                await fs.access(serverJsPath);
                console.log(`✅ Required files verified: package.json and server.js exist`);
            }
            catch (error) {
                console.error(`❌ Required files missing in ${projectPath}`);
                GenerateNewProjectFrontendService_1.usedPorts.delete(port);
                reject(new Error(`Required files (package.json or server.js) missing in project directory`));
                return;
            }
            const serverProcess = (0, child_process_1.spawn)('npm', ['start'], {
                cwd: projectPath,
                shell: true,
                stdio: 'pipe',
                detached: true,
            });
            const projectName = path.basename(projectPath);
            let serverStarted = false;
            let startupOutput = '';
            let startupErrors = '';
            const timeout = setTimeout(() => {
                if (!serverStarted) {
                    console.log('⏰ Server startup timeout reached, assuming server started successfully.');
                    console.log(`📋 Startup output: ${startupOutput}`);
                    if (startupErrors) {
                        console.log(`⚠️ Startup errors: ${startupErrors}`);
                    }
                    serverStarted = true;
                    this.registerRunningServer(port, projectName, serverProcess.pid);
                    resolve();
                }
            }, 8000);
            serverProcess.stdout?.on('data', (data) => {
                const output = data.toString();
                startupOutput += output;
                console.log(`📤 Server output: ${output.trim()}`);
                if ((output.includes('Server is running successfully') ||
                    output.includes('server started') ||
                    output.includes('listening on')) &&
                    !serverStarted) {
                    serverStarted = true;
                    clearTimeout(timeout);
                    console.log(`✅ Development server started successfully on port ${port}!`);
                    this.registerRunningServer(port, projectName, serverProcess.pid);
                    resolve();
                }
            });
            serverProcess.stderr?.on('data', (data) => {
                const error = data.toString();
                startupErrors += error;
                console.error(`📥 Server stderr: ${error.trim()}`);
                if (error.includes('EADDRINUSE') ||
                    error.includes('address already in use') ||
                    error.includes(`listen EADDRINUSE`) ||
                    error.includes(`port ${port}`)) {
                    console.error(`❌ Port ${port} is already in use!`);
                    console.error(`💡 Trying to find an alternative port...`);
                    clearTimeout(timeout);
                    if (!serverStarted) {
                        GenerateNewProjectFrontendService_1.usedPorts.delete(port);
                        reject(new Error(`Port ${port} is already in use. Please try generating the project again for an alternative port.`));
                    }
                }
                if (error.includes('ENOENT') && error.includes('npm')) {
                    console.error(`❌ npm command not found or package.json missing`);
                    clearTimeout(timeout);
                    if (!serverStarted) {
                        GenerateNewProjectFrontendService_1.usedPorts.delete(port);
                        reject(new Error(`npm command failed: ${error.trim()}`));
                    }
                }
            });
            serverProcess.on('error', (err) => {
                console.error(`❌ Failed to start server process: ${err.message}`);
                console.error(`🔍 Error details:`, err);
                clearTimeout(timeout);
                if (!serverStarted) {
                    GenerateNewProjectFrontendService_1.usedPorts.delete(port);
                    reject(new Error(`Server process failed to start: ${err.message}`));
                }
            });
            serverProcess.on('close', (code) => {
                console.log(`🔄 Server process closed with code: ${code}`);
                if (startupOutput) {
                    console.log(`📋 Final startup output: ${startupOutput}`);
                }
                if (startupErrors) {
                    console.log(`⚠️ Final startup errors: ${startupErrors}`);
                }
                clearTimeout(timeout);
                if (code !== 0 && !serverStarted) {
                    const errorMessage = `Server process exited with code ${code}`;
                    console.error(`❌ ${errorMessage}`);
                    console.error(`📂 Project path: ${projectPath}`);
                    console.error(`🚀 Command: npm start`);
                    console.error(`📤 Output: ${startupOutput || 'No output'}`);
                    console.error(`📥 Errors: ${startupErrors || 'No errors'}`);
                    GenerateNewProjectFrontendService_1.usedPorts.delete(port);
                    let specificError = errorMessage;
                    if (startupErrors.includes('ENOENT')) {
                        specificError += '. npm command not found or package.json missing.';
                    }
                    else if (startupErrors.includes('EADDRINUSE')) {
                        specificError += '. Port already in use.';
                    }
                    else if (startupOutput.includes('error') ||
                        startupErrors.includes('error')) {
                        specificError += '. Check the project setup and dependencies.';
                    }
                    reject(new Error(specificError));
                }
                else if (code !== 0) {
                    console.log(`🔄 Server on port ${port} has stopped.`);
                    GenerateNewProjectFrontendService_1.usedPorts.delete(port);
                    GenerateNewProjectFrontendService_1.runningServers.delete(port);
                }
            });
            serverProcess.unref();
        });
    }
    generateHtmlContent(projectName, projectConfig) {
        const baseHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <link rel="stylesheet" href="styles.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>`;
        let bodyContent = '';
        switch (projectConfig.type) {
            case 'company-profile':
                bodyContent = this.generateCompanyProfileHtml(projectName);
                break;
            case 'landing-page':
                bodyContent = this.generateLandingPageHtml(projectName);
                break;
            case 'ecommerce':
                bodyContent = this.generateEcommerceHtml(projectName);
                break;
            default:
                bodyContent = this.generateBasicHtml(projectName);
        }
        return (baseHtml +
            bodyContent +
            `
    <script src="app.js"></script>
</body>
</html>`);
    }
    generateCompanyProfileHtml(projectName) {
        return `
    <nav class="navbar">
        <div class="nav-container">
            <h1 class="logo">${projectName}</h1>
            <ul class="nav-menu">
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#team">Team</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </div>
    </nav>

    <section id="home" class="hero">
        <div class="hero-content">
            <h2>Welcome to ${projectName}</h2>
            <p>Your trusted partner in business excellence</p>
            <button class="cta-button">Learn More</button>
        </div>
    </section>

    <section id="about" class="about">
        <div class="container">
            <h2>About Us</h2>
            <p>We are a leading company dedicated to providing exceptional services and solutions to our clients.</p>
        </div>
    </section>

    <section id="services" class="services">
        <div class="container">
            <h2>Our Services</h2>
            <div class="services-grid">
                <div class="service-card">
                    <i class="fas fa-cogs"></i>
                    <h3>Consulting</h3>
                    <p>Expert consulting services to help your business grow.</p>
                </div>
                <div class="service-card">
                    <i class="fas fa-chart-line"></i>
                    <h3>Strategy</h3>
                    <p>Strategic planning and implementation for success.</p>
                </div>
                <div class="service-card">
                    <i class="fas fa-users"></i>
                    <h3>Support</h3>
                    <p>24/7 customer support for all your needs.</p>
                </div>
            </div>
        </div>
    </section>

    <section id="team" class="team">
        <div class="container">
            <h2>Our Team</h2>
            <div class="team-grid">
                <div class="team-member">
                    <div class="member-photo"></div>
                    <h3>John Doe</h3>
                    <p>CEO & Founder</p>
                </div>
                <div class="team-member">
                    <div class="member-photo"></div>
                    <h3>Jane Smith</h3>
                    <p>CTO</p>
                </div>
            </div>
        </div>
    </section>

    <section id="contact" class="contact">
        <div class="container">
            <h2>Contact Us</h2>
            <form class="contact-form">
                <input type="text" placeholder="Your Name" required>
                <input type="email" placeholder="Your Email" required>
                <textarea placeholder="Your Message" required></textarea>
                <button type="submit">Send Message</button>
            </form>
        </div>
    </section>

    <footer>
        <div class="container">
            <p>&copy; 2025 ${projectName}. All rights reserved.</p>
        </div>
    </footer>`;
    }
    generateLandingPageHtml(projectName) {
        return `
    <nav class="navbar">
        <div class="nav-container">
            <h1 class="logo">${projectName}</h1>
            <ul class="nav-menu">
                <li><a href="#home">Home</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </div>
    </nav>

    <section id="home" class="hero">
        <div class="hero-content">
            <h1>Transform Your Business Today</h1>
            <p>Join thousands of satisfied customers who have revolutionized their workflow with ${projectName}</p>
            <div class="cta-buttons">
                <button class="cta-primary">Get Started Free</button>
                <button class="cta-secondary">Watch Demo</button>
            </div>
        </div>
    </section>

    <section id="features" class="features">
        <div class="container">
            <h2>Why Choose ${projectName}?</h2>
            <div class="features-grid">
                <div class="feature-card">
                    <i class="fas fa-rocket"></i>
                    <h3>Fast & Reliable</h3>
                    <p>Lightning-fast performance with 99.9% uptime guarantee.</p>
                </div>
                <div class="feature-card">
                    <i class="fas fa-shield-alt"></i>
                    <h3>Secure</h3>
                    <p>Enterprise-grade security to protect your data.</p>
                </div>
                <div class="feature-card">
                    <i class="fas fa-mobile-alt"></i>
                    <h3>Mobile Ready</h3>
                    <p>Works perfectly on all devices and platforms.</p>
                </div>
            </div>
        </div>
    </section>

    <section class="newsletter">
        <div class="container">
            <h2>Stay Updated</h2>
            <p>Subscribe to our newsletter for the latest updates and offers</p>
            <form class="newsletter-form">
                <input type="email" placeholder="Enter your email" required>
                <button type="submit">Subscribe</button>
            </form>
        </div>
    </section>

    <footer>
        <div class="container">
            <div class="social-links">
                <a href="#"><i class="fab fa-facebook"></i></a>
                <a href="#"><i class="fab fa-twitter"></i></a>
                <a href="#"><i class="fab fa-linkedin"></i></a>
            </div>
            <p>&copy; 2025 ${projectName}. All rights reserved.</p>
        </div>
    </footer>`;
    }
    generateEcommerceHtml(projectName) {
        return `
    <nav class="navbar">
        <div class="nav-container">
            <h1 class="logo">${projectName}</h1>
            <div class="nav-center">
                <input type="text" class="search-bar" placeholder="Search products...">
                <button class="search-btn"><i class="fas fa-search"></i></button>
            </div>
            <div class="nav-right">
                <button class="cart-btn">
                    <i class="fas fa-shopping-cart"></i>
                    <span class="cart-count">0</span>
                </button>
                <button class="user-btn"><i class="fas fa-user"></i></button>
            </div>
        </div>
    </nav>

    <section class="hero">
        <div class="hero-content">
            <h1>Welcome to ${projectName}</h1>
            <p>Discover amazing products at unbeatable prices</p>
            <button class="cta-button">Shop Now</button>
        </div>
    </section>

    <section class="categories">
        <div class="container">
            <h2>Shop by Category</h2>
            <div class="categories-grid">
                <div class="category-card">
                    <div class="category-icon">📱</div>
                    <h3>Electronics</h3>
                </div>
                <div class="category-card">
                    <div class="category-icon">👕</div>
                    <h3>Fashion</h3>
                </div>
                <div class="category-card">
                    <div class="category-icon">🏠</div>
                    <h3>Home & Garden</h3>
                </div>
                <div class="category-card">
                    <div class="category-icon">📚</div>
                    <h3>Books</h3>
                </div>
            </div>
        </div>
    </section>

    <section class="products">
        <div class="container">
            <h2>Featured Products</h2>
            <div class="products-grid">
                <div class="product-card">
                    <div class="product-image"></div>
                    <h3>Sample Product 1</h3>
                    <p class="price">$99.99</p>
                    <button class="add-to-cart">Add to Cart</button>
                </div>
                <div class="product-card">
                    <div class="product-image"></div>
                    <h3>Sample Product 2</h3>
                    <p class="price">$149.99</p>
                    <button class="add-to-cart">Add to Cart</button>
                </div>
                <div class="product-card">
                    <div class="product-image"></div>
                    <h3>Sample Product 3</h3>
                    <p class="price">$79.99</p>
                    <button class="add-to-cart">Add to Cart</button>
                </div>
            </div>
        </div>
    </section>

    <footer>
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>Customer Service</h3>
                    <ul>
                        <li><a href="#">Contact Us</a></li>
                        <li><a href="#">Shipping Info</a></li>
                        <li><a href="#">Returns</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h3>About</h3>
                    <ul>
                        <li><a href="#">Our Story</a></li>
                        <li><a href="#">Careers</a></li>
                        <li><a href="#">Privacy Policy</a></li>
                    </ul>
                </div>
            </div>
            <p>&copy; 2025 ${projectName}. All rights reserved.</p>
        </div>
    </footer>`;
    }
    generateBasicHtml(projectName) {
        return `
    <div class="container">
        <h1>Welcome to ${projectName}!</h1>
        <p>Your development server is running successfully.</p>
        <p>You can start editing the files in the '${projectName}' directory.</p>
        <div class="features">
            <h2>Basic Features Included:</h2>
            <ul>
                <li>✅ Basic Layout</li>
                <li>✅ Navigation</li>
                <li>✅ Footer</li>
            </ul>
        </div>
    </div>`;
    }
    generateCssContent(projectConfig) {
        const baseStyles = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.6;
  color: #333;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.navbar {
  background: #fff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.logo {
  font-size: 1.8rem;
  font-weight: bold;
  color: #2563eb;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.nav-menu a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-menu a:hover {
  color: #2563eb;
}

.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 120px 0 80px;
  margin-top: 70px;
}

.hero-content h1, .hero-content h2 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hero-content p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.cta-button, .cta-primary, .cta-secondary {
  background: #2563eb;
  color: white;
  border: none;
  padding: 12px 30px;
  font-size: 1.1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
  margin: 0 10px;
}

.cta-button:hover, .cta-primary:hover {
  background: #1e40af;
}

.cta-secondary {
  background: transparent;
  border: 2px solid white;
}

.cta-secondary:hover {
  background: white;
  color: #2563eb;
}

section {
  padding: 80px 0;
}

h2 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: #1f2937;
}

footer {
  background: #1f2937;
  color: white;
  text-align: center;
  padding: 2rem 0;
}

@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .hero-content h1, .hero-content h2 {
    font-size: 2rem;
  }
}`;
        let specificStyles = '';
        switch (projectConfig.type) {
            case 'company-profile':
                specificStyles = this.getCompanyProfileStyles();
                break;
            case 'landing-page':
                specificStyles = this.getLandingPageStyles();
                break;
            case 'ecommerce':
                specificStyles = this.getEcommerceStyles();
                break;
            default:
                specificStyles = this.getBasicStyles();
        }
        return baseStyles + specificStyles;
    }
    getCompanyProfileStyles() {
        return `
.about, .services, .team, .contact {
  background: #f8fafc;
}

.about:nth-child(even), .services:nth-child(even), .team:nth-child(even), .contact:nth-child(even) {
  background: white;
}

.services-grid, .team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.service-card, .team-member {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  text-align: center;
  transition: transform 0.3s;
}

.service-card:hover, .team-member:hover {
  transform: translateY(-5px);
}

.service-card i {
  font-size: 3rem;
  color: #2563eb;
  margin-bottom: 1rem;
}

.member-photo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #e5e7eb;
  margin: 0 auto 1rem;
}

.contact-form {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-form input, .contact-form textarea {
  padding: 15px;
  border: 1px solid #d1d5db;
  border-radius: 5px;
  font-size: 1rem;
}

.contact-form button {
  background: #2563eb;
  color: white;
  border: none;
  padding: 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.1rem;
}`;
    }
    getLandingPageStyles() {
        return `
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  text-align: center;
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card i {
  font-size: 3rem;
  color: #2563eb;
  margin-bottom: 1rem;
}

.newsletter {
  background: #1f2937;
  color: white;
  text-align: center;
}

.newsletter-form {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.newsletter-form input {
  flex: 1;
  padding: 15px;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
}

.newsletter-form button {
  background: #2563eb;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.social-links a {
  color: white;
  font-size: 1.5rem;
  transition: color 0.3s;
}

.social-links a:hover {
  color: #2563eb;
}`;
    }
    getEcommerceStyles() {
        return `
.nav-center {
  display: flex;
  flex: 1;
  justify-content: center;
  gap: 0.5rem;
}

.search-bar {
  width: 400px;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 5px 0 0 5px;
  font-size: 1rem;
}

.search-btn {
  background: #2563eb;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 0 5px 5px 0;
  cursor: pointer;
}

.nav-right {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.cart-btn, .user-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  position: relative;
}

.cart-count {
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.8rem;
  position: absolute;
  top: -5px;
  right: -5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.categories-grid, .products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.category-card, .product-card {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  text-align: center;
  transition: transform 0.3s;
  cursor: pointer;
}

.category-card:hover, .product-card:hover {
  transform: translateY(-5px);
}

.category-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.product-image {
  width: 100%;
  height: 200px;
  background: #e5e7eb;
  border-radius: 5px;
  margin-bottom: 1rem;
}

.price {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2563eb;
  margin: 1rem 0;
}

.add-to-cart {
  background: #10b981;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
}

.add-to-cart:hover {
  background: #059669;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
  text-align: left;
}

.footer-section ul {
  list-style: none;
}

.footer-section a {
  color: #9ca3af;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-section a:hover {
  color: white;
}`;
    }
    getBasicStyles() {
        return `
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  text-align: center;
  background-color: #f8fafc;
}

h1 {
  color: #2563eb;
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.features {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  margin-top: 2rem;
  text-align: left;
}

.features ul {
  list-style: none;
  padding-left: 0;
}

.features li {
  padding: 0.5rem 0;
  font-size: 1.1rem;
}`;
    }
    generateJsContent(projectName, projectConfig) {
        const baseJs = `console.log('✅ ${projectName} (${projectConfig.type}) is running successfully!');
console.log('🎯 Features: ${projectConfig.features.join(', ')}');

// Basic functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing ${projectConfig.type} features...');
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });`;
        let specificJs = '';
        switch (projectConfig.type) {
            case 'company-profile':
                specificJs = this.getCompanyProfileJs();
                break;
            case 'landing-page':
                specificJs = this.getLandingPageJs();
                break;
            case 'ecommerce':
                specificJs = this.getEcommerceJs();
                break;
            default:
                specificJs = this.getBasicJs();
        }
        return baseJs + specificJs + '\n});';
    }
    getCompanyProfileJs() {
        return `
    
    // Contact form handling
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your message! We will get back to you soon.');
            this.reset();
        });
    }
    
    // Team member hover effects
    const teamMembers = document.querySelectorAll('.team-member');
    teamMembers.forEach(member => {
        member.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        member.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });`;
    }
    getLandingPageJs() {
        return `
    
    // Newsletter signup
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            alert('Thank you for subscribing with email: ' + email);
            this.reset();
        });
    }
    
    // CTA button interactions
    const ctaButtons = document.querySelectorAll('.cta-primary, .cta-secondary');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.textContent.includes('Get Started')) {
                alert('Welcome! Sign up process would start here.');
            } else if (this.textContent.includes('Demo')) {
                alert('Demo video would play here.');
            }
        });
    });`;
    }
    getEcommerceJs() {
        return `
    
    // Shopping cart functionality
    let cartCount = 0;
    const cartCountElement = document.querySelector('.cart-count');
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            cartCount++;
            cartCountElement.textContent = cartCount;
            
            // Animation feedback
            this.style.background = '#059669';
            this.textContent = 'Added!';
            setTimeout(() => {
                this.style.background = '#10b981';
                this.textContent = 'Add to Cart';
            }, 1000);
            
            console.log('Product added to cart. Total items:', cartCount);
        });
    });
    
    // Search functionality
    const searchBtn = document.querySelector('.search-btn');
    const searchBar = document.querySelector('.search-bar');
    
    if (searchBtn && searchBar) {
        searchBtn.addEventListener('click', function() {
            const query = searchBar.value.trim();
            if (query) {
                alert('Searching for: ' + query);
            }
        });
        
        searchBar.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }
    
    // Category navigation
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const category = this.querySelector('h3').textContent;
            alert('Browsing ' + category + ' category');
        });
    });`;
    }
    getBasicJs() {
        return `
    
    // Basic project interactions
    console.log('Basic project features initialized');
    
    // Add some basic interactivity
    const features = document.querySelectorAll('.features li');
    features.forEach(feature => {
        feature.addEventListener('click', function() {
            this.style.color = this.style.color === 'rgb(37, 99, 235)' ? '#333' : '#2563eb';
        });
    });`;
    }
};
exports.GenerateNewProjectFrontendService = GenerateNewProjectFrontendService;
exports.GenerateNewProjectFrontendService = GenerateNewProjectFrontendService = GenerateNewProjectFrontendService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], GenerateNewProjectFrontendService);
//# sourceMappingURL=generate_new_project_frontend_service.js.map