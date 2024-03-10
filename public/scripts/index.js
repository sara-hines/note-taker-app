let noteForm;
let noteTitle;
let noteText;
let saveNoteBtn;
let newNoteBtn;
let noteList;

if (window.location.pathname === '/notes') {
  // The below is the form element on the right hand side of the page where the user can enter a note title and text 
  noteForm = document.querySelector('.note-form');
  // The below is the input element where the user enters the title of their note.
  noteTitle = document.querySelector('.note-title');
  // The below is the input element where the user enters their actual note.
  noteText = document.querySelector('.note-textarea');
  // The below is the "Save Note" button which only appears after the user has entered a title and text for a note.
  saveNoteBtn = document.querySelector('.save-note');
  // This is the "New Note" button which should appear once the user has clicked on any note from the left column.
  newNoteBtn = document.querySelector('.new-note');
  // This is the "Clear Form" button which appears in the right hand corner next to the "Save Note" button, only after the user has entered a title and text for a note. The button should go away after the user clicks the "Save Note" button.
  clearBtn = document.querySelector('.clear-btn');
  // This encompasses the notes in the left hand column, and their container.
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

// activeNote is used to keep track of the note in the textarea
let activeNote = {};

const getNotes = () =>
  fetch('/api/notes', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

const saveNote = (note) =>
  fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(note)
  });

const deleteNote = (id) =>
  fetch(`/api/notes/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  });

const renderActiveNote = () => {
  // console.log(activeNote);
  console.log(activeNote.id);
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

// Delete the clicked note
const handleNoteDelete = (e) => {
  // Prevents the click listener for the list from being called when the button inside of it is clicked
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

// Sets the activeNote and displays it
const handleNoteView = (e) => {
  e.preventDefault();
  // The value of the data-note attribute is a stringified object which holds the title and text of a note. So, activeNote is set to the parsed, actual object which describes the note's title and text.
  activeNote = JSON.parse(e.target.parentElement.getAttribute('data-note'));
  renderActiveNote();
};

// Sets the activeNote to and empty object and allows the user to enter a new note
const handleNewNoteView = (e) => {
  activeNote = {};
  show(clearBtn);
  renderActiveNote();
};

// Renders the appropriate buttons based on the state of the form
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

// Render the list of note titles
// The async keyword transforms the renderNoteList function into an asynchronous function which returns a promise. notes.json() is a promise. The function will proceed only after the notes.json() promise is fulfilled or rejected. Once the notes have been parsed, the promise is fulfilled (MAKE SURE THIS IS CORRECT).
const renderNoteList = async (notes) => {
  let jsonNotes = await notes.json();
  // As one of the first steps in rendering the note list in the left hand column, the left hand column is first cleared out of any already existing notes.
  if (window.location.pathname === '/notes') {
    noteList.forEach((el) => (el.innerHTML = ''));
  }

  let noteListItems = [];

  // Returns HTML element with or without a delete button
  const createLi = (text, delBtn = true) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item');

    // Creats a span element which will hold the title of the note. Adds an event listener for the note which, on click, causes the note to be rendered on the right side of the screen.
    const spanEl = document.createElement('span');
    spanEl.classList.add('list-item-title');
    spanEl.innerText = text;
    spanEl.addEventListener('click', handleNoteView);

    liEl.append(spanEl);

    // Creates a delete button for the note, if delBtn = true
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

  jsonNotes.forEach((note) => {
    const li = createLi(note.title);
    li.dataset.note = JSON.stringify(note);

    noteListItems.push(li);
  });

  if (window.location.pathname === '/notes') {
    noteListItems.forEach((note) => noteList[0].append(note));
  }
};

// Gets notes from the db and renders them to the sidebar
const getAndRenderNotes = () => getNotes().then(renderNoteList);

if (window.location.pathname === '/notes') {
  // When the user clicks the "Save Button" which appears after they enter the title and text for a new note, handleNoteSave is called, which creates a variable called newNote object with the title and text of the new note. Also within this function, function saveNote is called, with the newNote passed in. In function saveNote, a POST fetch request is sent, with the newNote as the body. Within function handleNoteSave, after function saveNote is called, functions getAndRenderNotes and renderActiveNote are called. Function getAndRenderNotes calls function getNotes (which creates a fetch GET request for all of the notes) and then function renderNoteList (which renders the list of note titles in the left hand column).
  saveNoteBtn.addEventListener('click', handleNoteSave);
  // When the user clicks the "New Note" button, any previously active note stored in the activeNote object is cleared, and function renderActiveNote is called to display the active note on the right hand side.
  newNoteBtn.addEventListener('click', handleNewNoteView);
  // When the "Clear Form" button (which appears after the user has entered a new note title and text) is clicked, function renderActiveNote is called. 
  clearBtn.addEventListener('click', renderActiveNote);
  // An input event is whenever the value of an editable element changes due to a user's action such as typing in an input element. So, whenever the user has entered a note title and text, function handleRenderBtns will be called. The effect of function handleRenderBtns, largely, is that the "Clear Form" button appears as soon as any text is entered for the note title or note text, and the "Save Note" button won't appear unless there is text entered for the note title and note text.
  noteForm.addEventListener('input', handleRenderBtns);
}

getAndRenderNotes();
