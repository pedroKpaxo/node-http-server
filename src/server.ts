import http from 'http';
import fs from 'fs';
import EventEmitter from 'events';

export class Server {
    protected readonly port = 3000;
    protected readonly eventEmitter: EventEmitter;
    protected readonly server: http.Server;

    constructor() {
        this.eventEmitter = new EventEmitter();
        this.server = http.createServer((req, res) => this.requestHandler(req, res));
        this.initializeEventListeners();
    }

    /**
     * Method to initialize event listeners
     */
    protected initializeEventListeners(): void {
        this.eventEmitter.on('log', (message: string) => {
            console.log(`Log: ${message}`);
        });

        this.eventEmitter.on('error', (message: string) => {
            console.error(`Error: ${message}`);
        });
    }

    /**
     * Method to handle requests and send responses based on the request URL
     * @param req A request object
     * @param res The response object
     */
    protected requestHandler(req: http.IncomingMessage, res: http.ServerResponse): void {
        this.eventEmitter.emit('log', `Received request for: ${req.url}`);
        try{

            if (req.url === '/' && req.method === 'GET') {
                this.serveFile('src/pages/index.html', 'text/html', res);
            } else if (req.url === '/about' && req.method === 'GET') {
                this.serveFile('src/pages/about.html', 'text/html', res);
            } else {
                this.serveFile('src/pages/404.html', 'text/html', res, 404);
            }
        } catch  {
            this.eventEmitter.emit('error', `Failed to handle request: ${req.url}`);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        }
    }

    /**
     * This method reads a file from the file system and serves it as a response
     * If the file is not found, a 500 error is sent in the response
     * @param filePath The path to the file to serve
     * @param contentType HTTP content type of the file
     * @param res The response object
     * @param statusCode Status code to send in the response
     */
    protected serveFile(filePath: string, contentType: string, res: http.ServerResponse, statusCode: number = 200): void {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                this.eventEmitter.emit('error', `Failed to read ${filePath}: ${err.message}`);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
                return;
            }
            res.writeHead(statusCode, { 'Content-Type': contentType });
            res.end(data);
        });
    }

    /**
     * Method to start the server
     */
    public start(): void {
        this.server.listen(this.port, () => {
            console.log(`Server is running on http://localhost:${this.port}`);
        });
    }
}


