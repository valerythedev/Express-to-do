
const todoForm = document.getElementById('todo-form');

todoForm.addEventListener('submit', function () {
  // event.preventDefault();

  const thingsInput = document.getElementById('todo-input');
  const dueDateInput = document.getElementById('todo-date');

  const things = thingsInput.value;
  const dueDate = dueDateInput.value;

  // Send a POST request to the server to create a new to-do item
  fetch('/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      'things': things,
      'dueDate': dueDate
    })
  })
    .then(response => {
      if (response.ok) return response.json()
    })
    .then(data => {
      console.log(data)
  
    })
    .catch(error => {
      console.error(error)
    })

  thingsInput.value = '';
  dueDateInput.value = '';
});

const checkedButtons = document.querySelectorAll('.checked');

checkedButtons.forEach(function (button) {
  button.addEventListener('click', function (event) {
    const li = event.target.parentNode;
    const things = li.childNodes[1];
    const dueDate = li.childNodes[3];

    // Send a PUT request to the server to update the count of the corresponding to-do item
    fetch('/items', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        'things': things.innerText,
        'dueDate': dueDate.innerText,
      
      })
    })
      .then(response => {
        if (response.ok) {
          // Add strikethrough style to the to-do item's text
          things.style.textDecoration = 'line-through';
        }
      })
      .catch(error => {
        console.error(error)
      })
  });
});

const clearButton = document.getElementById('borra');

clearButton.addEventListener('click', function () {
  // Send a DELETE request to the server to delete all to-do items
  fetch('/items', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      if (response.ok) {
        // Update the dom to show that all items have been deleted
        const todoList = document.getElementById('todo-list');
        while (todoList.firstChild) {
          todoList.removeChild(todoList.lastChild);
        }
        const count = document.getElementById('count');
        // count.innerText = 0;
      }
    })
    .catch(error => {
      console.error(error)
    })
});

