// Create a new WebSocket connection
const socket = new WebSocket('wss://cscloud7-164.lnu.se/b3');

socket.addEventListener('open', (event) => {
  console.log('Connected to WebSocket server');
});

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  console.log('Received message:', message);

  if (message.type === 'issue') {
    console.log('Updating issues...');
    updateIssues(message.issuesResults);
  } else {
    console.log('Ignored message:', message);
  }
});


function updateIssues(issuesResults) {
  // Find the container on the page where the issues view is displayed
  const issuesContainer = document.querySelector('.container');
  // Move the event listener outside the updateIssues function

  // Clear the container
  issuesContainer.innerHTML = '';

  // Create new HTML for each issue and append it to the container
  issuesResults.forEach(({ project, issues }) => {
    const repoBoxDiv = document.createElement('div');
    repoBoxDiv.classList.add('card');

    const repoNameDiv = document.createElement('div');
    repoNameDiv.classList.add('card-header');
    repoNameDiv.innerHTML = `<i class="fa fa-code-branch"></i> ${project}`;

    repoBoxDiv.appendChild(repoNameDiv);

    const listGroup = document.createElement('ul');
    listGroup.classList.add('list-group', 'list-group-flush');

    issues.forEach(({ id, title, description, time, startedBy, comments }) => {
      const issueListItem = document.createElement('li');
      issueListItem.classList.add('list-group-item');
      issueListItem.addEventListener('click', (e) => {
        const item = e.currentTarget;  // get the element to which the event handler was attached
        if (!item.classList.contains('active')) {
          // Remove active class from any other active items
          document.querySelectorAll('.list-group-item').forEach(i => i.classList.remove('active'));

          // Add active class to clicked item
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });

      const issueHeaderDiv = document.createElement('div');
      issueHeaderDiv.classList.add('issue-header');
      issueHeaderDiv.innerHTML = `
        <h5>${title}</h5>
        <p><small class="text-muted">Created Time: ${time}</small></p>
      `;

      const issueBodyDiv = document.createElement('div');
      issueBodyDiv.classList.add('issue-body');
      issueBodyDiv.innerHTML = `
        <p>${description}</p>
        <p><small class="text-muted">Started By: ${startedBy}</small></p>
        <p><small class="text-muted">Issue ID: ${id}</small></p>
      `;

      issueListItem.appendChild(issueHeaderDiv);
      issueListItem.appendChild(issueBodyDiv);

      if (comments.length > 0) {
        const commentsDiv = document.createElement('div');
        commentsDiv.classList.add('issue-comments');
        comments.forEach(comment => {
          const commentDiv = document.createElement('div');
          commentDiv.classList.add('comment');
          commentDiv.innerHTML = `<p>User: ${comment.user}, Comment: ${comment.body} <small class="text-muted">Time: ${comment.time}</small></p>`;
          commentsDiv.appendChild(commentDiv);
        });

        issueListItem.appendChild(commentsDiv);
      }

      listGroup.appendChild(issueListItem);
    });

    repoBoxDiv.appendChild(listGroup);
    issuesContainer.appendChild(repoBoxDiv);
  });


}
