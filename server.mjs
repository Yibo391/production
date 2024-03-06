import express from 'express';
import axios from 'axios';
import ejs from 'ejs';
import path from 'path';
import { createServer } from 'http';
import WebSocket from 'ws';
import crypto, { sign } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';
import { config } from 'dotenv';
config();

const gitlabToken = process.env.GITLAB_PRIVATE_TOKEN;

const app = express();
const port = 5003;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

const wss = new WebSocket.Server({ noServer: true });
const clients = new Set();

function sendToClients(data) {
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

wss.on('connection', (ws) => {
    clients.add(ws);
    console.log("connected");

    ws.on('close', () => {
        clients.delete(ws);
        console.log("lose");
    });
});

app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(new URL('.', import.meta.url).pathname, 'views'));

let issuesResults = [];

app.get('/b3/issues', async (req, res) => {
    try {
        issuesResults = await fetchIssues(); // 更新 issuesResults 变量
        sendToClients({ type: 'issue', issuesResults });
        res.render('issues', { issuesResults });
    } catch (error) {
        res.status(500).send('Error fetching issues');
    }
});

app.post('/b3/webhook', async (req, res) => {
    const secret = '123';
    const signature = req.headers['x-gitlab-token'];

    if (signature !== secret) {
        console.log('Invalid signature');
        return res.sendStatus(401);
    }

    const eventData = req.body;

    // 检查是否为 issue 状态改变的事件
    if (eventData.object_kind === 'issue') {
        console.log('Issue event:', eventData);

        try {
            // 如果是 issue 事件，那么重新获取所有 issues 的数据
            issuesResults = await fetchIssues(); // 更新 issuesResults 变量
            sendToClients({ type: 'issue', issuesResults });
            console.log('Sending issues update:', issuesResults);
            res.sendStatus(200);
        } catch (error) {
            console.error('Error fetching issues:', error);
            res.sendStatus(500);
        }
    }


    else if (eventData.object_kind === 'project') {
        console.log('Project event:', eventData);

        try {
            // 如果是 project 状态改变，那么重新获取所有 issues 的数据
            issuesResults = await fetchIssues(); // 更新 issuesResults 变量
            sendToClients({ type: 'issue', issuesResults });
            console.log('Sending issues update:', issuesResults);
            res.sendStatus(200);
        } catch (error) {
            console.error('Error fetching issues:', error);
            res.sendStatus(500);
        }
    }

    // 检查是否为 note 状态改变的事件
    else if (eventData.object_kind === 'note') {
        console.log('Note event:', eventData);

        try {
            // 如果是 note 状态改变，那么重新获取所有 issues 的数据
            issuesResults = await fetchIssues(); // 更新 issuesResults 变量
            sendToClients({ type: 'issue', issuesResults });
            console.log('Sending issues update:', issuesResults);
            res.sendStatus(200);
        } catch (error) {
            console.error('Error fetching issues:', error);
            res.sendStatus(500);
        }
    }
});



app.get('/b3', (req, res) => {
    axios
        .get('https://gitlab.lnu.se/api/v4/groups/43447', {
            headers: {
                'Private-Token': gitlabToken,
            },
        })
        .then((response) => {
            const organizationName = response.data.name;
            res.render('home', { organizationName });
        })
        .catch((error) => {
            console.error('Error fetching organization data:', error);
            const organizationName = 'Your Organization';
            res.render('home', { organizationName });
        });
});


app.get('/b3/reload-issues', (req, res) => {
    res.render('issues', { issuesResults });
});

// Create a function to format time
function formatTime(time) {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    };

    return new Date(time).toLocaleString('en-US', options);
}

const server = createServer(app);

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

async function fetchIssues() {
    const response = await axios.get('https://gitlab.lnu.se/api/v4/groups/43447/projects', {
        headers: {
            'Private-Token': gitlabToken,
        },
    });


    const projects = response.data;

    const issuesPromises = projects.map(async (project) => {
        const issuesResponse = await axios.get(`https://gitlab.lnu.se/api/v4/projects/${project.id}/issues?state=opened`, {
            headers: {
                'Private-Token': gitlabToken,
            },
        });

        const issues = issuesResponse.data.map(async (issue) => {
            const userWhoStartedIssue = issue.author.username;

            const commentsResponse = await axios.get(`https://gitlab.lnu.se/api/v4/projects/${project.id}/issues/${issue.iid}/notes`, {
                headers: {
                    'Private-Token': gitlabToken,
                },
            });

            const comments = commentsResponse.data.map((comment) => ({
                user: comment.author.username,
                body: comment.body,
                time: formatTime(comment.created_at),
            }));

            return {
                id: issue.id,
                title: issue.title,
                description: issue.description,
                time: formatTime(issue.created_at),
                startedBy: userWhoStartedIssue,
                comments: comments,
            };
        });

        return {
            project: project.name,
            issues: await Promise.all(issues),
        };
    });

    return Promise.all(issuesPromises);
}