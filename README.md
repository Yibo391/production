# B3 Production

### Warning
The B3 Production server, hosted on the university's infrastructure, has been archived following the conclusion of the assignment for which it was developed. This means the application and its associated functionalities are no longer accessible, as the server was specifically used for educational purposes and the project's live demonstration. The archival indicates the project's active development and deployment phase has ended, and it now serves primarily as a reference or portfolio piece for the technologies and methodologies applied during its creation.

-----------------------------

### Introduction 
B3 Production is a sophisticated real-time web application designed for project management and issue tracking, integrating seamlessly with GitLab via its API. Utilizing Node.js, Express.js, WebSocket technology for real-time bi-directional communication, and Embedded JavaScript Templates (EJS) for dynamic content rendering, it stands out for its efficient handling of real-time data updates. The application also employs Axios for seamless HTTP requests and dotenv for secure environment configuration. Styled with CSS and modern JavaScript (ES modules), it offers an enhanced user experience for real-time project management tasks.
-----------------------------


Video
-----------------------------

This is a recorded presentation, for stating how it works



### Quick Start Links


[B3 Index Page](https://cscloud7-164.lnu.se/b3)

[B3 Issue Tracking Page](https://cscloud7-164.lnu.se/b3/issues)


- [x] When a client connects to the application it will contact GitLab through their REST API and fetch all created issues on your repository. The response will be in JSON, which is good because we work with Node.js.
- [x] When your application gets the issue list from GitLab, you should use that to render the HTML-page for the client along with the JavaScript needed for the client.
- [x] One thing the client script needs to do is, for example, the ability to connect to your server´s WebSocket channel.

- [x] When a new "issue-event" happens on GitLab they will fire a (by you) registered HTTP POST which should point to your application.

- [x] The webhook will send you data and your application should use the web
- [x] socket channel(s) to update the client in real-time. your code must check that the webhook POST comes from GitLab.
- [x] Along with your code, and installation scripts you should also commit an assignment report that answers some questions (see below).
- [x] You are free to choose and use third-party packages to solve the problem but they should be mention and motivated in your assignment report.


### Technology Stack
- Node.js & Express.js for the backend.
- WebSocket for real-time communication.
- EJS for server-side rendering.
- Axios for HTTP requests.
- CSS and ES modules for frontend styling and structure.
- dotenv for environment variable management.
- Crypto for cryptographic functions, ensuring secure operations.

### Nginx Configuration

A snippet from the Nginx configuration highlights the reverse proxy setup essential for the application's deployment, facilitating access to different parts of the application hosted on various ports.

 ```

ubuntu@yw222cb-server:~$ cat /etc/nginx/conf.d/cscloud7-164.lnu.se.conf
server {
        server_name cscloud7-164.lnu.se;
        index index.html;
        root /var/www/html;
        location / {
                try_files $uri $uri/ =404;
                }
        location /crud {
        proxy_pass <http://localhost:5050>;
                }
 location /a3 {
 proxy_pass <http://localhost:5000>;
  }
     location /spa {
        proxy_pass <http://localhost:5002>;
    }
 location /b3 {
    proxy_pass <http://localhost:5003>;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
location /js/ {
    alias /var/www/b3/public/js/;
}
    listen [::]:443 ssl ipv6only=on http2; # managed by Certbot
    listen 443 ssl http2; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/cscloud7-164.lnu.se/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/cscloud7-164.lnu.se/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}
server {
    if ($host = cscloud7-164.lnu.se) {
        return 301 <https://$host$request_uri>;
    } # managed by Certbot
        listen 80;
        listen [::]:80;
        server_name cscloud7-164.lnu.se;
    return 404; # managed by Certbot
}
 ```
