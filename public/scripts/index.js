let noteForm;
let noteTitle;
let noteText;
let saveNoteBtn;
let newNoteBtn;
let noteList;


if (window.location.pathname === '/notes') {
  // noteForm is the form element on the right hand side of the page where the user can enter a note title and text.
  noteForm = document.querySelector('.note-form');
  // noteTitle is the input element where the user enters the title of their note.
  noteTitle = document.querySelector('.note-title');
  // noteText is the textarea element where the user enters their actual note.
  noteText = document.querySelector('.note-textarea');
  // The below is the "Save Note" button which only appears after the user has entered a title and text for a note.
  saveNoteBtn = document.querySelector('.save-note');
  // The below is the "New Note" button which appears once the user has clicked on any note from the sidebar.
  newNoteBtn = document.querySelector('.new-note');
  // The below is the "Clear Form" button which appears in the right hand corner next to the "Save Note" button, only after the user has entered a title and text for a note. The button disappears after the user clicks the "Save Note" button or the "Clear Form" button itself.
  clearBtn = document.querySelector('.clear-btn');
  // noteList encompasses the notes in the sidebar, as well as their container.
  noteList = document.querySelectorAll('.list-container .list-group');
}


// Show an element
const show = (elem) => {
  elem.style.display = 'inline';
};


// Hide an element
const hide = (elem) => {
  elem.style.display = 'none';
};


// activeNote is used to keep track of the note in the textarea.
let activeNote = {};


// The below 'GET' fetch request is used when the notes need to be updated—when the user saves a new note and when the user deletes a note.
const getNotes = () =>
  fetch('/api/notes', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });


// The below 'POST' fetch requst is used when the user has saved a new note and the new note needs to be added to db.json.
const saveNote = (note) =>
  fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(note)
  });


// deleteNote will be called by handleNoteDelete after the user has clicked a note's delete icon. Due to this 'DELETE' request, the note will be deleted.
const deleteNote = (id) =>
  fetch(`/api/notes/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  });


// If the activeNote object is not empty (so, when the user has clicked a note on the sidebar to view as the active note), the 'New Note' button will appear, and noteTitle and noteText will display the active note. If the activeNote object is empty, the 'New Note' button will be hidden and noteTitle and noteText will be empty, ready for the user's input. This view is used after the user has saved a note, after the user has deleted a note, and after the user has clicked the 'New Note' button.  
const renderActiveNote = () => {
  hide(saveNoteBtn);
  hide(clearBtn);

  if (activeNote.id) {
    show(newNoteBtn);
    noteTitle.setAttribute('readonly', true);
    noteText.setAttribute('readonly', true);
    noteTitle.value = activeNote.title;
    noteText.value = activeNote.text;
  } else {
    hide(newNoteBtn);
    noteTitle.removeAttribute('readonly');
    noteText.removeAttribute('readonly');
    noteTitle.value = '';
    noteText.value = '';
  }
};


// handleNoteSave creates a newNote object from the user's input for their new note. It then calls the appropriate functions to POST the new note, GET and render the updated list of notes, and display an empty noteTitle and noteText ready for the user to enter a new note.
const handleNoteSave = () => {
  const newNote = {
    title: noteTitle.value,
    text: noteText.value
  };
  saveNote(newNote).then(() => {
    getAndRenderNotes();
    renderActiveNote();
  });
};


// handleNoteDelete deleted the clicked note by passing the noteId to the deleteNote function. It then calls the appropriate functions to GET and render the updated list of notes, and display an empty noteTitle and noteText ready for the user to enter a new note.
const handleNoteDelete = (e) => {
  // Prevents the click listener for the list from being called when the button inside of it is clicked.
  e.stopPropagation();

  const note = e.target;
  const noteId = JSON.parse(note.parentElement.getAttribute('data-note')).id;

  if (activeNote.id === noteId) {
    activeNote = {};
  }

  deleteNote(noteId).then(() => {
    getAndRenderNotes();
    renderActiveNote();
  });
};


// Sets the activeNote and displays it.
const handleNoteView = (e) => {
  e.preventDefault();
  // The value of the data-note attribute is a stringified object which holds the title and text of a note. So, activeNote is the parsed, actual object which describes the note's title and text.
  activeNote = JSON.parse(e.target.parentElement.getAttribute('data-note'));
  renderActiveNote();
};


// Sets the activeNote to an empty object and allows the user to enter a new note.
const handleNewNoteView = (e) => {
  activeNote = {};
  show(clearBtn);
  renderActiveNote();
};


// Renders the appropriate buttons based on the state of the form.
const handleRenderBtns = () => {
  show(clearBtn);
  if (!noteTitle.value.trim() && !noteText.value.trim()) {
    hide(clearBtn);
  } else if (!noteTitle.value.trim() || !noteText.value.trim()) {
    hide(saveNoteBtn);
  } else {
    show(saveNoteBtn);
  }
};


// renderNoteList renders the list of note titles. The async keyword transforms the renderNoteList function into an asynchronous function which returns a promise. The function will proceed only after the notes.json() promise is fulfilled or rejected. 
const renderNoteList = async (notes) => {
  let jsonNotes = await notes.json();
  // As one of the first steps in rendering the note list in the sidebar, the sidebar is first cleared out of any already existing notes.
  if (window.location.pathname === '/notes') {
    noteList.forEach((el) => (el.innerHTML = ''));
  }

  let noteListItems = [];

  // Returns an li element for the note title, with or without a delete button.
  const createLi = (text, delBtn = true) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item');

    // Creates a span element which will hold the title of the note. Adds an event listener for the note which, on click, causes the note to be rendered on the right side of the screen.
    const spanEl = document.createElement('span');
    spanEl.classList.add('list-item-title');
    spanEl.innerText = text;
    spanEl.addEventListener('click', handleNoteView);

    liEl.append(spanEl);

    // Creates/appends/sets an event listener for a delete button for the note, assuming delBtn = true.
    if (delBtn) {
      const delBtnEl = document.createElement('i');
      delBtnEl.classList.add(
        'fas',
        'fa-trash-alt',
        'float-right',
        'text-danger',
        'delete-note'
      );
      delBtnEl.addEventListener('click', handleNoteDelete);
      liEl.append(delBtnEl);
    }

    return liEl;
  };

  if (jsonNotes.length === 0) {
    noteListItems.push(createLi('No saved Notes', false));
  }

  // Creates and appends li elements for the saved notes in the sidebar.
  jsonNotes.forEach((note) => {
    const li = createLi(note.title);
    li.dataset.note = JSON.stringify(note);
    noteListItems.push(li);
  });
  if (window.location.pathname === '/notes') {
    noteListItems.forEach((note) => noteList[0].append(note));
  }
};


// GETs notes from db.json and renders them to the sidebar.
const getAndRenderNotes = () => getNotes().then(renderNoteList);


if (window.location.pathname === '/notes') {
  // When the user clicks the "Save Note" button which appears after they enter the title and text for a new note, handleNoteSave is called, which creates an object called newNote with the title and text of the new note. Also within handleNoteSave, function saveNote is called, which creates a POST fetch request to save the newNote. Functions getAndRenderNotes and renderActiveNote are then called. Function getAndRenderNotes calls function getNotes (which creates a fetch GET request for all of the notes) and then calls function renderNoteList (which renders the updated list of note titles in the sidebar). The renderActiveNote function, in this case, will set noteTitle and noteText to empty strings ready for the next note to be entered.
  saveNoteBtn.addEventListener('click', handleNoteSave);
  // When the user clicks the "New Note" button, any previously active note stored in the activeNote object is cleared, and function renderActiveNote is called. In this case, since the activeNote object was cleared, renderActiveNote will set noteTitle and noteText to empty strings ready for the next note to be entered.
  newNoteBtn.addEventListener('click', handleNewNoteView);
  // When the "Clear Form" button (which appears after the user has entered a new note title and text) is clicked, function renderActiveNote is called. In this case, since the activeNote object would have recently been cleared out in handleNewNoteView, renderActiveNote will set the values of the noteTitle and noteText to be empty strings, clearing the form.
  clearBtn.addEventListener('click', renderActiveNote);
  // After the input event (i.e., whenever the user has entered a note title and text), function handleRenderBtns will be called. The effect of function handleRenderBtns, largely, is that the "Clear Form" button appears as soon as any text is entered for the note title or note text, and the "Save Note" button won't appear unless there is text entered for the note title and note text.
  noteForm.addEventListener('input', handleRenderBtns);
}


// getAndRenderNotes must be called here so that the notes are automatically retrieved and rendered when the user first arrives to the notes page.
getAndRenderNotes();
