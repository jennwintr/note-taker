document.addEventListener("DOMContentLoaded", () => {
  let noteTitle;
  let noteText;
  let saveNoteBtn;
  let newNoteBtn;
  let noteList;

  if (window.location.pathname === "/notes") {
    noteTitle = document.querySelector(".note-title");
    noteText = document.querySelector(".note-textarea");
    saveNoteBtn = document.querySelector(".save-note");
    newNoteBtn = document.querySelector(".new-note");
    noteList = document.querySelectorAll(".list-container .list-group");
  }

  // Define a function to display an HTML element.
  const show = (elem) => {
    elem.style.display = "inline";
  };

  // Define a function to hide an HTML element.
  const hide = (elem) => {
    elem.style.display = "none";
  };

  // Initialize an empty object to store the active note.
  let activeNote = {};

  // Define a function to fetch notes from the API using a GET request.
  const getNotes = () =>
    fetch("/api/notes", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

  // Define a function to save a note to the API using a POST request.
  const saveNote = (note) =>
    fetch("/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(note),
    });

  // Define a function to delete a note from the API using a DELETE request.
  const deleteNote = (id) =>
    fetch(`/api/notes/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

  // Define a function to render the active note on the UI.
  const renderActiveNote = () => {
    hide(saveNoteBtn);

    // Check if there is an active note, if yes, make title and text readonly.
    if (activeNote.id) {
      noteTitle.setAttribute("readonly", true);
      noteText.setAttribute("readonly", true);
      noteTitle.value = activeNote.title;
      noteText.value = activeNote.text;
    } else {
      // If no active note, reset title and text values.
      noteTitle.value = "";
      noteText.value = "";
    }
  };

  // Define a function to handle saving a note.
  const handleNoteSave = () => {
    const newNote = {
      title: noteTitle.value,
      text: noteText.value,
    };
    // Save the new note, then update and render the notes on the UI.
    saveNote(newNote).then(() => {
      getAndRenderNotes();
      renderActiveNote();
    });
  };

  // Define a function to handle deleting a note.
  const handleNoteDelete = (e) => {
    e.stopPropagation();

    // Extract the note ID from the HTML element and delete the corresponding note.
    const note = e.target;
    const noteId = JSON.parse(note.parentElement.getAttribute("data-note")).id;

    if (activeNote.id === noteId) {
      activeNote = {};
    }

    deleteNote(noteId).then(() => {
      getAndRenderNotes();
      renderActiveNote();
    });
  };

  // Define a function to handle viewing a note.
  const handleNoteView = (e) => {
    e.preventDefault();
    // Extract the note data from the HTML element and render it as the active note.
    activeNote = JSON.parse(e.target.parentElement.getAttribute("data-note"));
    renderActiveNote();
  };

  // Define a function to handle creating a new note.
  const handleNewNoteView = (e) => {
    location.reload(true);
    activeNote = {};
    renderActiveNote();
    // Show the "Clear Form" button when creating a new note
    show(clearFormBtn);
  };

  // Define a function to handle rendering the save button based on note content.
  const handleRenderSaveBtn = () => {
    if (!noteTitle.value.trim() || !noteText.value.trim()) {
      hide(saveNoteBtn);
    } else {
      show(saveNoteBtn);
    }
  };

  // Define a function to render the list of notes on the UI.
  const renderNoteList = async (notes) => {
    let jsonNotes = await notes.json();
    if (window.location.pathname === "/notes") {
      // Clear the noteList if the current page is '/notes'.
      noteList.forEach((el) => (el.innerHTML = ""));
    }

    let noteListItems = [];

    // Define a function to create a list item for a note.
    const createLi = (text, delBtn = true) => {
      const liEl = document.createElement("li");
      liEl.classList.add("list-group-item");

      const spanEl = document.createElement("span");
      spanEl.innerText = text;
      spanEl.addEventListener("click", handleNoteView);

      liEl.append(spanEl);

      if (delBtn) {
        // Add a delete button to the list item.
        const delBtnEl = document.createElement("i");
        delBtnEl.classList.add(
          "fas",
          "fa-trash-alt",
          "float-right",
          "text-danger",
          "delete-note"
        );
        delBtnEl.addEventListener("click", handleNoteDelete);

        liEl.append(delBtnEl);
      }

      return liEl;
    };

    if (jsonNotes.length === 0) {
      // If no notes are available, create a list item indicating so.
      noteListItems.push(createLi("No saved Notes", false));
    }

    // Iterate through each note, create a list item, and add it to the list.
    jsonNotes.forEach((note) => {
      const li = createLi(note.title);
      li.dataset.note = JSON.stringify(note);

      noteListItems.push(li);
    });

    if (window.location.pathname === "/notes") {
      // If the current page is '/notes', append the list items to the noteList.
      noteListItems.forEach((note) => noteList[0].append(note));
    }
  };

  // Define a function to fetch and render the notes.
  const getAndRenderNotes = () => getNotes().then(renderNoteList);

  // Event listeners for UI elements on the '/notes' page.
  if (window.location.pathname === "/notes") {
    saveNoteBtn.addEventListener("click", handleNoteSave);
    newNoteBtn.addEventListener("click", handleNewNoteView);
    noteTitle.addEventListener("keyup", handleRenderSaveBtn);
    noteText.addEventListener("keyup", handleRenderSaveBtn);
  }

  getAndRenderNotes();
});