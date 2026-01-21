
const todoForm = document.getElementById('todo-form');
const todoList = document.getElementById('todo-list');

// Prevenir el comportamiento por defecto del formulario y agregar nuevo item
if (todoForm) {
  todoForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const thingsInput = document.getElementById('todo-input');
    const dueDateInput = document.getElementById('todo-date');

    const things = thingsInput.value.trim();
    const dueDate = dueDateInput.value;

    if (!things) {
      alert('Por favor ingresa una tarea');
      return;
    }

    // Deshabilitar el formulario mientras se procesa
    const submitButton = todoForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Agregando...';

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
        if (response.ok) return response.json();
        throw new Error('Error al crear la tarea');
      })
      .then(data => {
        console.log('Tarea creada:', data);
        // Limpiar el formulario
        thingsInput.value = '';
        dueDateInput.value = '';
        // Recargar la página para mostrar el nuevo item
        window.location.reload();
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error al crear la tarea');
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      });
  });
}

// Usar event delegation para los botones checked (funciona con elementos dinámicos)
if (todoList) {
  todoList.addEventListener('click', function (event) {
    if (event.target.classList.contains('checked')) {
      const li = event.target.closest('li');
      const button = event.target;
      const itemId = li.dataset.id;

      // Si ya está completada, no hacer nada
      if (li.classList.contains('completed')) {
        return;
      }

      // Agregar clase completed inmediatamente en el cliente
      li.classList.add('completed');
      button.disabled = true;

      // Send a PUT request to mark item as completed
      fetch('/items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          '_id': itemId
        })
      })
        .then(response => {
          if (!response.ok) {
            // Revertir el cambio si falla
            li.classList.remove('completed');
            button.disabled = false;
            throw new Error('Error al actualizar la tarea');
          }
          return response.json();
        })
        .catch(error => {
          console.error('Error:', error);
          alert('Error al actualizar la tarea');
        });
    }
  });
}

// Modal de confirmación
const modal = document.getElementById('confirm-modal');
const confirmYes = document.getElementById('confirm-yes');
const confirmNo = document.getElementById('confirm-no');

// Función para mostrar el modal
function showModal() {
  modal.classList.add('show');
}

// Función para ocultar el modal
function hideModal() {
  modal.classList.remove('show');
}

// Cerrar modal al hacer clic en cancelar
if (confirmNo) {
  confirmNo.addEventListener('click', hideModal);
}

// Cerrar modal al hacer clic fuera del modal
if (modal) {
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      hideModal();
    }
  });
}

// Botón para eliminar todos los items
const clearButton = document.getElementById('borra');

if (clearButton) {
  clearButton.addEventListener('click', function () {
    showModal();
  });
}

// Función para eliminar todas las tareas
function deleteAllTasks() {
  hideModal();
  
  // Deshabilitar el botón mientras se procesa
  clearButton.disabled = true;
  const originalText = clearButton.textContent;
  clearButton.textContent = 'Eliminando...';

  // Send a DELETE request to the server to delete all to-do items
  fetch('/items', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Error al eliminar');
    })
    .then(data => {
      // Recargar la página para actualizar la vista
      window.location.reload();
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error al eliminar las tareas');
      clearButton.disabled = false;
      clearButton.textContent = originalText;
    });
}

// Confirmar eliminación
if (confirmYes) {
  confirmYes.addEventListener('click', deleteAllTasks);
}
